import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Client-side usage
});

export const generateTrip = async (fromCity, destination, days, budget, tripType, travelStyle) => {
  if (import.meta.env.VITE_GROQ_API_KEY) {
    try {
      console.log("Generating trip with Llama 3 (Groq) for:", destination, "from", fromCity);

      const prompt = `
        Generate a highly personalized ${days}-day trip itinerary for ${destination}, India, starting from ${fromCity}.
        
        CRITICAL BUDGET CONSTRAINT:
        The total budget is ₹${budget}. 
        Suggest transport and hotels that are STRICTLY affordable within this ₹${budget} limit.
        Daily Itinerary costs (food + local transport + activities) should be balanced with transport/hotel costs.

        Trip Type: ${tripType}
        Travel Style: ${travelStyle}

        JSON Format Requirements:
        1. Transport: Suggest 3 ways to get there. Include "price" as a NUMERIC value (integer).
        2. Hotels: Suggest 3 stays. Include "price_per_night" as a NUMERIC value (integer).
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
      let trip;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        trip = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      } catch (e) {
        console.error("JSON Parse Error, text was:", text);
        throw e;
      }

      // Post-process with affiliate links and ensure NUMERIC prices
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

      trip.source = "Llama 3 (via Groq) ⚡";
      return trip;

    } catch (error) {
      console.error("Groq API Failed:", error);
      console.warn("Falling back to Mock AI...");
    }
  }

  // 2. Fallback to Mock Data
  const mockTrip = generateMockTrip(fromCity, destination, days, budget, tripType, travelStyle);
  mockTrip.source = "Mock AI (Backup) 🤖";
  return mockTrip;
};

/* ================= AFFILIATE LINK GENERATOR ================= */
function generateAffiliateLink(category, name, from, to) {
  const encName = encodeURIComponent(name);
  const encTo = encodeURIComponent(to);
  const encFrom = encodeURIComponent(from || '');

  if (category === 'transport') {
    if (name.toLowerCase().includes('flight')) {
      return `https://www.google.com/travel/flights?q=flights+from+${encFrom}+to+${encTo}`;
    }
    if (name.toLowerCase().includes('train')) {
      return `https://www.confirmtkt.com/rly-booking?from=${encFrom}&to=${encTo}&utm_source=tripwise`;
    }
    return `https://www.redbus.in/search?fromCityName=${encFrom}&toCityName=${encTo}&utm_source=tripwise`;
  }

  if (category === 'hotel') {
    return `https://www.agoda.com/search?city=${encTo}&header=hotel+${encName}+booking`;
  }

  return "#";
}

/* ================= MOCK AI GENERATOR ================= */
function generateMockTrip(fromCity, destination, days, budget, tripType, travelStyle) {
  const dailyBudget = Math.floor((budget * 0.4) / days);

  return {
    destination,
    fromCity,
    duration: `${days} Days`,
    totalBudget: budget,
    transport: [
      { type: "Flight", price: Math.floor(budget * 0.3), duration: "2h", booking_url: generateAffiliateLink('transport', 'Flight', fromCity, destination) },
      { type: "Train", price: Math.floor(budget * 0.1), duration: "12h", booking_url: generateAffiliateLink('transport', 'Train', fromCity, destination) }
    ],
    hotels: [
      { name: `${destination} Heritage Stay`, price_per_night: Math.floor(budget * 0.1), rating: "4.8/5", description: "Beautiful local experience.", booking_url: generateAffiliateLink('hotel', 'Heritage Stay', null, destination) }
    ],
    itinerary: Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      title: `Exploring ${destination}`,
      daily_budget: dailyBudget,
      budget_breakdown: { transport: Math.floor(dailyBudget * 0.2), food: Math.floor(dailyBudget * 0.4), activities: Math.floor(dailyBudget * 0.4) },
      plan: `Visit the heart of ${destination}.`,
      must_visit: ["Main Square"],
      local_eats: ["Famous Cafe"],
      activities: ["City Tour"]
    })),
    source: "Mock AI (Backup) 🤖"
  };
}
