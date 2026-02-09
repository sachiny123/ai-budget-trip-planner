import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Client-side usage
});

export const generateTrip = async (destination, days, budget, tripType, travelStyle) => {
  // 1. Try Groq (Llama 3)
  if (import.meta.env.VITE_GROQ_API_KEY) {
    try {
      console.log("Generating trip with Llama 3 (Groq) for:", destination);

      const prompt = `
        Generate a detailed ${days}-day trip itinerary for ${destination}, India.
        Trip Type: ${tripType}
        Travel Style: ${travelStyle}
        Total Budget: ₹${budget}

        CONSTRAINT 1: The destination MUST be in India. If the destination "${destination}" is not in India, return ONLY this JSON: { "error": "Destination must be in India." }
        CONSTRAINT 2: Return the response in strict JSON format. Do not add any markdown formatting (like implementation checks) or text outside the JSON.

        JSON Format:
        {
          "destination": "${destination}",
          "duration": "${days} Days",
          "total_budget": "₹${budget}",
          "itinerary": [
            {
              "day": 1,
              "title": "Day Title",
              "daily_budget": "₹1500",
              "budget_breakdown": {
                 "transport": "₹300",
                 "food": "₹500",
                 "activities": "₹700"
              },
              "plan": "Detailed plan for the day optimized for ${tripType} travelers.",
              "must_visit": ["Place 1", "Place 2"],
              "local_eats": ["Restaurant 1", "Dish 1"],
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
        model: "llama-3.3-70b-versatile", // High performance, free tier model
        temperature: 0.7,
        max_tokens: 3000,
      });

      const text = chatCompletion.choices[0]?.message?.content || "";
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

      const trip = JSON.parse(cleanText);
      trip.source = "Llama 3 (via Groq) ⚡"; // Add source tag
      return trip;

    } catch (error) {
      console.error("Groq API Failed:", error);
      console.warn("Falling back to Mock AI...");
    }
  } else {
    console.warn("No Groq API Key found. Using Mock AI.");
  }

  // 2. Fallback to Mock Data (if Groq fails or no key)
  const mockTrip = generateMockTrip(destination, days, budget, tripType, travelStyle);
  mockTrip.source = "Mock AI (Backup) 🤖";
  return mockTrip;
};

/* ================= MOCK AI GENERATOR ================= */
function generateMockTrip(destination, days, budget, tripType, travelStyle) {
  // Simple check for India
  const nonIndianCities = ["paris", "london", "dubai", "new york", "tokyo", "singapore", "rome", "barcelona"];
  if (nonIndianCities.includes(destination.toLowerCase())) {
    return { error: "Destination must be in India (Mock AI Restriction)." };
  }

  const dailyBudget = Math.floor(budget / days);
  const mockItinerary = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    title: `Exploring ${destination} - Day ${i + 1}`,
    daily_budget: `₹${dailyBudget}`,
    budget_breakdown: {
      transport: `₹${Math.floor(dailyBudget * 0.2)}`,
      food: `₹${Math.floor(dailyBudget * 0.4)}`,
      activities: `₹${Math.floor(dailyBudget * 0.4)}`
    },
    plan: `Enjoy a wonderful day in ${destination} focusing on ${travelStyle} experiences suitable for ${tripType} travelers. Visit local landmarks and soak in the culture.`,
    must_visit: [`${destination} City Center`, `${destination} Museum`, `${destination} Park`],
    local_eats: [`Local ${destination} Delicacy`, "Popular Cafe", "Street Food Stall"],
    activities: ["City Walk", "Photography Tour"]
  }));

  return {
    destination: destination,
    duration: `${days} Days`,
    budget: `₹${budget}`,
    itinerary: mockItinerary
  };
}
