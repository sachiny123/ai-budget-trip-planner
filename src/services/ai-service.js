import Groq from "groq-sdk";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
});

const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
    dangerouslyAllowBrowser: true,
});

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const TRIP_PROMPT = (fromCity, destination, days, budget, tripType, travelStyle) => `
Generate a highly personalized ${days}-day trip itinerary for ${destination}, India, starting from ${fromCity}.

CRITICAL BUDGET CONSTRAINT:
The total budget of ₹${budget} is ALL-INCLUSIVE for the entire trip.
Formula: (Transport Cost + (Hotel Cost * ${days} nights) + Daily Expenses) MUST be <= ₹${budget}.

Suggest transport and hotels that are STRICTLY affordable within this limit.

Trip Type: ${tripType}
Travel Style: ${travelStyle}

JSON Format Requirements:
1. Transport: Suggest 3-5 distinct ways to get there (Flight, Train, Bus). Include "price" as a NUMERIC value (integer).
2. Hotels: Suggest 5 distinct stays (mix of Budget, Comfort, Premium within limit). Include "price_per_night" as a NUMERIC value (integer).
3. Itinerary: Daily activities.

JSON Format:
{
  "destination": "${destination}",
  "fromCity": "${fromCity}",
  "duration": "${days} Days",
  "totalBudget": ${budget},
  "transport": [
    { "type": "Flight", "price": 4500, "duration": "2h", "booking_url": "Deep link" },
    { "type": "Train", "price": 1200, "duration": "12h", "booking_url": "Deep link" }
  ],
  "hotels": [
    { "name": "Hotel Name", "price_per_night": 2000, "rating": "4.5/5", "description": "Short description", "booking_url": "Deep link" }
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "Day Title",
      "daily_budget": 1500,
      "budget_breakdown": {
         "transport": 300,
         "food": 500,
         "activities": 700
      },
      "plan": "Detailed description.",
      "must_visit": ["Place 1"],
      "local_eats": ["Eat 1"],
      "activities": ["Activity 1"]
    }
  ]
}
`;

export const generateTrip = async (fromCity, destination, days, budget, tripType, travelStyle) => {
    const prompt = TRIP_PROMPT(fromCity, destination, days, budget, tripType, travelStyle);
    let errorLog = [];

    // 1. TRY CLAUDE (User Selection)
    if (import.meta.env.VITE_CLAUDE_API_KEY) {
        try {
            console.log("Attempting Claude (Anthropic)...");
            const response = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 4000,
                messages: [{ role: "user", content: prompt }],
            });

            const text = response.content[0].text;
            const trip = parseAIResponse(text);
            if (validateTrip(trip, budget, days).isValid) {
                trip.source = "Claude 3.5 Sonnet 🎭";
                return processTripData(trip, fromCity, destination);
            }
        } catch (e) {
            console.warn("Claude failed:", e.message);
            errorLog.push(`Claude: ${e.message}`);
        }
    }

    // 2. TRY GEMINI (Robust Fallback)
    if (import.meta.env.VITE_GEMINI_API_KEY) {
        try {
            console.log("Attempting Gemini (Google AI)...");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const trip = parseAIResponse(text);
            if (validateTrip(trip, budget, days).isValid) {
                trip.source = "Gemini 1.5 Flash ✨";
                return processTripData(trip, fromCity, destination);
            }
        } catch (e) {
            console.warn("Gemini failed:", e.message);
            errorLog.push(`Gemini: ${e.message}`);
        }
    }

    // 3. TRY GROQ (Final AI Backup)
    if (import.meta.env.VITE_GROQ_API_KEY) {
        try {
            console.log("Attempting Llama 3 (Groq)...");
            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
            });

            const text = chatCompletion.choices[0]?.message?.content || "";
            const trip = parseAIResponse(text);
            if (validateTrip(trip, budget, days).isValid) {
                trip.source = "Llama 3.3 (Groq) ⚡";
                return processTripData(trip, fromCity, destination);
            }
        } catch (e) {
            console.warn("Groq failed:", e.message);
            errorLog.push(`Groq: ${e.message}`);
        }
    }

    // 4. FALLBACK TO MOCK
    console.warn("All AI providers failed or over-budget. Using Mock Data.", errorLog);
    const mockTrip = generateMockTrip(fromCity, destination, days, budget, tripType, travelStyle);
    mockTrip.source = "Curated Itinerary (Backup) 🤖";
    mockTrip.warning = errorLog.length > 0 ? "AI services were busy or exhausted. Showing a high-quality curated plan instead." : null;
    return mockTrip;
};

/* ================= HELPERS ================= */

function parseAIResponse(text) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        throw new Error("Invalid AI Response Format");
    }
}

function processTripData(trip, fromCity, destination) {
    trip.transport = trip.transport?.map(t => ({
        ...t,
        price: Number(t.price) || 0,
        booking_url: generateAffiliateLink('transport', t.type, fromCity, destination)
    }));
    trip.hotels = trip.hotels?.map(h => ({
        ...h,
        price_per_night: Number(h.price_per_night) || 0,
        booking_url: generateAffiliateLink('hotel', h.name, null, destination)
    }));
    return trip;
}

/* ================= TEMPLE GUIDE GENERATOR ================= */
export const generateTempleGuide = async (templeName) => {
    const prompt = `
        Create a comprehensive visitor's guide for ${templeName}, India.
        
        Information Required:
        1. Overview: Brief history and religious significance.
        2. Timings: Opening/Closing times, Aarti timings, Darshan timings.
        3. Etiquette: Dress code, photography rules, items allowed/banned.
        4. Plan: Best time to visit, how to reach (nearest airport/train), expected queue time.
        5. Nearby: 3 distinct nearby spiritual or tourist attractions.

        JSON Format Requirements:
        Strictly valid JSON. NO markdown. Return ONLY the JSON object.

        JSON Format:
        {
          "name": "${templeName}",
          "location": "City, State",
          "overview": "Description...",
          "significance": "Why it is important...",
          "timings": {
            "opening": "6:00 AM - 9:00 PM",
            "aarti": ["Morning 5:00 AM", "Evening 7:00 PM"],
            "best_time_for_darshan": "Early morning"
          },
          "etiquette": {
            "dress_code": "Traditional wear recommended...",
            "photography": "Allowed in outer complex...",
            "prohibited_items": ["Leather", "Mobile Phones inside sanctum"]
          },
          "travel_info": {
            "nearest_airport": "Airport Name (Distance)",
            "nearest_train": "Station Name (Distance)",
            "best_season": "Oct - Mar",
            "queue_time_avg": "2-3 hours"
          },
          "nearby_places": [
            { "name": "Place 1", "desc": "Short desc", "distance": "5 km" },
            { "name": "Place 2", "desc": "Short desc", "distance": "12 km" }
          ]
        }
      `;

    // 1. TRY CLAUDE
    if (import.meta.env.VITE_CLAUDE_API_KEY) {
        try {
            console.log("Temple Guide: Attempting Claude...");
            const response = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 2000,
                messages: [{ role: "user", content: prompt }],
            });
            const guide = parseAIResponse(response.content[0].text);
            guide.source = "Claude 3.5 Sonnet 🕉️";
            return guide;
        } catch (e) {
            console.warn("Claude Temple failure:", e.message);
        }
    }

    // 2. TRY GEMINI
    if (import.meta.env.VITE_GEMINI_API_KEY) {
        try {
            console.log("Temple Guide: Attempting Gemini...");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const guide = parseAIResponse(response.text());
            guide.source = "Gemini 1.5 Flash ✨";
            return guide;
        } catch (e) {
            console.warn("Gemini Temple failure:", e.message);
        }
    }

    // 3. TRY GROQ
    if (import.meta.env.VITE_GROQ_API_KEY) {
        try {
            console.log("Temple Guide: Attempting Groq/Llama...");
            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.1-8b-instant",
            });
            const guide = parseAIResponse(chatCompletion.choices[0]?.message?.content || "");
            guide.source = "Llama 3.1 (Groq) ⚡";
            return guide;
        } catch (e) {
            console.warn("Groq Temple failure:", e.message);
        }
    }

    return { error: "AI Service Unavailable for Temple Guide" };
};

/* ================= VALIDATION LOGIC ================= */
function validateTrip(trip, maxBudget, days) {
    if (!trip.transport || !trip.hotels) return { isValid: false, reason: "Missing data" };
    const minTransport = Math.min(...trip.transport.map(t => Number(t.price) || 999999));
    const minHotel = Math.min(...trip.hotels.map(h => Number(h.price_per_night) || 999999));
    const totalMinCost = minTransport + (minHotel * days);
    if (totalMinCost > maxBudget * 1.1) { // 10% buffer
        return { isValid: false, reason: `Cost ₹${totalMinCost} exceeds budget ₹${maxBudget}` };
    }
    return { isValid: true };
}

/* ================= AFFILIATE LINK GENERATOR ================= */
function generateAffiliateLink(category, name, from, to) {
    const encName = encodeURIComponent(name);
    const encTo = encodeURIComponent(to);
    const encFrom = encodeURIComponent(from || '');
    if (category === 'transport') {
        if (name.toLowerCase().includes('flight')) return `https://www.skyscanner.co.in/transport/flights/${from ? from.slice(0, 3).toLowerCase() : 'in'}/${to.slice(0, 3).toLowerCase()}`;
        if (name.toLowerCase().includes('train')) return `https://www.ixigo.com/trains/${encFrom}-to-${encTo}`;
        return `https://www.redbus.in/search?fromCityName=${encFrom}&toCityName=${encTo}`;
    }
    if (category === 'hotel') return `https://www.booking.com/searchresults.html?ss=${encTo}&nflt=price%3DINR-min-max-1`;
    return "#";
}

/* ================= MOCK AI GENERATOR ================= */
function generateMockTrip(fromCity, destination, days, budget, tripType, travelStyle) {
    const dailyBudget = Math.floor((budget * 0.4) / days);
    const flightPrice = Math.floor(budget * 0.25);
    const hotelBase = Math.floor((budget * 0.3) / days);

    return {
        destination,
        fromCity,
        duration: `${days} Days`,
        totalBudget: budget,
        transport: [
            { type: "Flight", price: flightPrice, duration: "2h", booking_url: generateAffiliateLink('transport', 'Flight', fromCity, destination) },
            { type: "Express Train", price: Math.floor(budget * 0.08), duration: "12h", booking_url: generateAffiliateLink('transport', 'Train', fromCity, destination) }
        ],
        hotels: [
            { name: `${destination} Heritage Stay`, price_per_night: hotelBase, rating: "4.8/5", description: "Traditional aesthetics with modern comfort.", booking_url: generateAffiliateLink('hotel', 'Heritage Stay', null, destination) },
            { name: "City Center Inn", price_per_night: Math.floor(hotelBase * 0.8), rating: "4.2/5", description: "Close to all major attractions.", booking_url: generateAffiliateLink('hotel', 'City Inn', null, destination) }
        ],
        itinerary: Array.from({ length: days }, (_, i) => ({
            day: i + 1,
            title: `Exploring ${destination}`,
            daily_budget: dailyBudget,
            budget_breakdown: { transport: Math.floor(dailyBudget * 0.2), food: Math.floor(dailyBudget * 0.4), activities: Math.floor(dailyBudget * 0.4) },
            plan: `Visit the heart of ${destination}. Experience local culture and cuisine.`,
            must_visit: ["City Square", "Old Fort"],
            local_eats: ["Street Food Corner"],
            activities: ["City Walk", "Sunset View"]
        }))
    };
}

