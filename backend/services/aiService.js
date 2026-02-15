import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY,
});

export const generateItineraryAI = async (destination, days, flightData, hotelData, travelStyle) => {
    try {
        console.log("Generating regeneration with Llama 3 (Groq) for:", destination);

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
                "budget_breakdown": { "food": "500", "transport": "200", "activities": "1000" }
            }
        ]
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 3000,
        });

        const text = chatCompletion.choices[0]?.message?.content || "";

        // Clean up markdown if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(cleanText);
        } catch (e) {
            console.error("JSON Parse Error in Backend AI:", text);
            return null;
        }

    } catch (error) {
        console.error("Groq AI Backend Error:", error);
        return null; // Fallback handled by controller
    }
};
