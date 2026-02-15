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

      // VALIDATION STEP
      const validation = validateTrip(trip, budget, days);
      if (!validation.isValid) {
        console.warn("AI generated over-budget trip. Falling back to Mock for safety.", validation.reason);
        throw new Error("AI Budget Violation: " + validation.reason);
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

      // CAPTURE BUDGET WARNING
      if (error.message.includes("Budget Violation")) {
        console.warn("Falling back to Mock AI due to Budget constraints.");
        // We will attach this warning to the mock trip below
        var budgetWarning = "Your budget was too strict for a custom AI plan. Showing a curated budget-friendly itinerary instead.";
      }
    }
  }

  // 2. Fallback to Mock Data
  const mockTrip = generateMockTrip(fromCity, destination, days, budget, tripType, travelStyle);
  mockTrip.source = "Mock AI (Backup) 🤖";

  // Attach warning if it exists
  if (typeof budgetWarning !== 'undefined') {
    mockTrip.warning = budgetWarning;
  }

  return mockTrip;
};

/* ================= VALIDATION LOGIC ================= */
function validateTrip(trip, maxBudget, days) {
  if (!trip.transport || !trip.hotels) return { isValid: false, reason: "Missing data" };

  // Find cheapest options
  const minTransport = Math.min(...trip.transport.map(t => Number(t.price) || 999999));
  const minHotel = Math.min(...trip.hotels.map(h => Number(h.price_per_night) || 999999));

  // Calculate strict minimum cost for the trip
  const totalMinCost = minTransport + (minHotel * days);

  if (totalMinCost > maxBudget) {
    return {
      isValid: false,
      reason: `Min Cost ₹${totalMinCost} exceeds budget ₹${maxBudget}`
    };
  }

  return { isValid: true };
}

/* ================= AFFILIATE LINK GENERATOR ================= */
function generateAffiliateLink(category, name, from, to) {
  const encName = encodeURIComponent(name);
  const encTo = encodeURIComponent(to);
  const encFrom = encodeURIComponent(from || '');

  // Real Affiliate/Deep Links

  if (category === 'transport') {
    if (name.toLowerCase().includes('flight')) {
      // Google Flights / Skyscanner
      return `https://www.skyscanner.co.in/transport/flights/${from ? from.slice(0, 3).toLowerCase() : 'in'}/${to.slice(0, 3).toLowerCase()}`;
    }
    if (name.toLowerCase().includes('train')) {
      // Ixigo / ConfirmTkt
      return `https://www.ixigo.com/trains/${encFrom}-to-${encTo}`;
    }
    // RedBus
    return `https://www.redbus.in/search?fromCityName=${encFrom}&toCityName=${encTo}`;
  }

  if (category === 'hotel') {
    // Booking.com Deep Link
    return `https://www.booking.com/searchresults.html?ss=${encTo}&nflt=price%3DINR-min-max-1`;
  }

  return "#";
}

/* ================= MOCK AI GENERATOR ================= */
function generateMockTrip(fromCity, destination, days, budget, tripType, travelStyle) {
  const dailyBudget = Math.floor((budget * 0.4) / days);

  // Dynamic Pricing Factors
  const flightPrice = Math.floor(budget * 0.25);
  const trainPrice = Math.floor(budget * 0.08);
  const busPrice = Math.floor(budget * 0.05);

  const hotelBase = Math.floor((budget * 0.3) / days);

  return {
    destination,
    fromCity,
    duration: `${days} Days`,
    totalBudget: budget,
    transport: [
      { type: "Flight", price: flightPrice, duration: "2h", booking_url: generateAffiliateLink('transport', 'Flight', fromCity, destination) },
      { type: "Express Train", price: trainPrice, duration: "12h", booking_url: generateAffiliateLink('transport', 'Train', fromCity, destination) },
      { type: "AC Volvo Bus", price: busPrice, duration: "16h", booking_url: generateAffiliateLink('transport', 'Bus', fromCity, destination) }
    ],
    hotels: [
      { name: `${destination} Heritage Stay`, price_per_night: hotelBase, rating: "4.8/5", description: "Traditional aesthetics with modern comfort.", booking_url: generateAffiliateLink('hotel', 'Heritage Stay', null, destination) },
      { name: "City Center Inn", price_per_night: Math.floor(hotelBase * 0.8), rating: "4.2/5", description: "Close to all major attractions.", booking_url: generateAffiliateLink('hotel', 'City Inn', null, destination) },
      { name: "Backpacker's HOSTEL", price_per_night: Math.floor(hotelBase * 0.4), rating: "4.5/5", description: "Meet fellow travelers. Social vibe.", booking_url: generateAffiliateLink('hotel', 'Hostel', null, destination) },
      { name: "Luxury Resort & Spa", price_per_night: Math.floor(hotelBase * 1.5), rating: "5.0/5", description: "Ultimate relaxation and premium service.", booking_url: generateAffiliateLink('hotel', 'Resort', null, destination) },
      { name: "Eco Jungle Retreat", price_per_night: Math.floor(hotelBase * 1.1), rating: "4.6/5", description: "Stay close to nature.", booking_url: generateAffiliateLink('hotel', 'Eco Stay', null, destination) }
    ],
    itinerary: Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      title: `Exploring ${destination}`,
      daily_budget: dailyBudget,
      budget_breakdown: { transport: Math.floor(dailyBudget * 0.2), food: Math.floor(dailyBudget * 0.4), activities: Math.floor(dailyBudget * 0.4) },
      plan: `Visit the heart of ${destination}. Experience local culture and cuisine.`,
      must_visit: ["City Square", "Old Fort", "Local Market"],
      local_eats: ["Street Food Corner", "Heritage Cafe"],
      activities: ["City Walk", "Museum Visit", "Sunset View"]
    })),
    source: "Mock AI (Backup) 🤖"
  };
}
