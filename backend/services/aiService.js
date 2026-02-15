import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateItineraryAI = async (destination, days, flightData, hotelData, travelStyle) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Create a detailed ${days}-day travel itinerary for ${destination}.
        
        **Trip Details:**
        - **Destination:** ${destination}
        - **Duration:** ${days} Days
        - **Travel Style:** ${travelStyle}
        - **Arrival Flight:** ${flightData ? `${flightData.airline} arriving at ${flightData.arrival}` : 'Not booked yet'}
        - **Accommodation:** ${hotelData ? `Staying at ${hotelData.name}` : 'Not booked yet'}

        **Mobile App Format:**
        The output must be a VALID JSON array where each object represents a day.
        Do NOT wrap the JSON in markdown code blocks like \`\`\`json ... \`\`\`. Just return the raw JSON.
        
        Schema:
        [
            {
                "day": 1,
                "title": "Arrival & First Impressions",
                "plan": "Detailed narrative of the day...",
                "must_visit": ["Place 1", "Place 2"],
                "local_eats": ["Dish 1", "Restaurant 1"],
                "activities": ["Activity 1", "Activity 2"],
                "daily_budget": "Estimated cost",
                "budget_breakdown": { "food": "₹500", "transport": "₹200", "activities": "₹1000" }
            }
        ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if Gemini adds it despite instructions
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);

    } catch (error) {
        console.error("Gemini AI Error:", error);
        return null; // Fallback to static if AI fails
    }
};
