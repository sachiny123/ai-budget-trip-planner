import express from "express";
import cors from "cors";
import { destinations } from "./data/destinations.js";
import { buildItinerary } from "./engines/itineraryEngine.js";
import { calculateBudget } from "./engines/budgetEngine.js";


import dotenv from 'dotenv';
import Razorpay from 'razorpay';

dotenv.config();

// import { connectDB } from "./config/db.js";
// import userRoutes from "./routes/userRoutes.js";
// import tripRoutes from "./routes/tripRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Database
// Connect to Database
// connectDB(); // Removed for Firebase Reversion

// Routes
// Routes (Handled by Frontend Firefox SDK now)
// app.use("/api/users", userRoutes);
// app.use("/api/trips", tripRoutes);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

import { searchFlights, searchHotels } from './services/amadeusService.js';

app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;
    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency,
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- Amadeus Endpoints ---

app.get("/api/flights/search", async (req, res) => {
  const { origin, destination, date, adults } = req.query;
  if (!origin || !destination || !date) {
    return res.status(400).json({ error: "Missing required parameters: origin, destination, date" });
  }
  try {
    const results = await searchFlights(origin, destination, date, adults);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch flights" });
  }
});

app.get("/api/hotels/search", async (req, res) => {
  const { cityCode } = req.query;
  if (!cityCode) {
    return res.status(400).json({ error: "Missing required parameter: cityCode" });
  }
  try {
    const results = await searchHotels(cityCode);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
});


app.post("/api/generate-trip", (req, res) => {
  const { destination, days, tripType, travelStyle } = req.body;

  const place = destinations[destination.toLowerCase()];
  if (!place) {
    return res.status(404).json({ error: "Destination not supported" });
  }

  const itinerary = buildItinerary(
    place,
    Number(days),
    tripType,
    travelStyle
  );

  const budget = calculateBudget(
    place.meta.baseDailyCost,
    Number(days),
    travelStyle
  );

  res.json({
    destination: place.meta.name,
    bestSeason: place.meta.bestSeason,
    itinerary,
    budget,
  });
});

// --- AI Endpoint ---
import { generateItineraryAI } from './services/aiService.js';

app.post("/api/generate-trip-ai", async (req, res) => {
  const { destination, days, flightData, hotelData, travelStyle } = req.body;
  try {
    const aiItinerary = await generateItineraryAI(destination, days, flightData, hotelData, travelStyle);
    if (aiItinerary) {
      res.json({ itinerary: aiItinerary });
    } else {
      res.status(500).json({ error: "AI Generation Failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.listen(5000, () =>
  console.log("🚀 TripWise Backend running on port 5000")
);
