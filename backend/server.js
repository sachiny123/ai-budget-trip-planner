import express from "express";
import cors from "cors";
import { destinations } from "./data/destinations.js";
import { buildItinerary } from "./engines/itineraryEngine.js";
import { calculateBudget } from "./engines/budgetEngine.js";

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(5000, () =>
  console.log("🚀 TripWise Backend running on port 5000")
);
