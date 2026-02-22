import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { searchFlights, searchHotels } from "../services/transport-service";
import { imageService } from "../services/image-service";

// City to IATA Code Mapping (Major Indian Cities + International favorites)
const CITY_TO_IATA = {
  "mumbai": "BOM",
  "delhi": "DEL",
  "new delhi": "DEL",
  "bangalore": "BLR",
  "bengaluru": "BLR",
  "chennai": "MAA",
  "kolkata": "CCU",
  "hyderabad": "HYD",
  "goa": "GOI",
  "pune": "PNQ",
  "ahmedabad": "AMD",
  "jaipur": "JAI",
  "dubai": "DXB",
  "singapore": "SIN",
  "london": "LHR",
  "new york": "JFK",
  "paris": "CDG",
  "tokyo": "NRT",
  "bangkok": "BKK"
};

const getIataCode = (city) => {
  if (!city) return null;
  const normalized = city.toLowerCase().trim();
  return CITY_TO_IATA[normalized] || city.substring(0, 3).toUpperCase();
};

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const itineraryRef = useRef();

  const {
    destination,
    days,
    totalBudget: rawTotalBudget,
    total_budget: rawTotalBudgetAlt,
    budget: rawBudget,
    tripType = "solo",
    travelStyle = "budget",
    itinerary: rawItinerary = [],
    plan: rawPlan,
    source = "Unknown",
    tripId,
    fromCity,
    warning // Retrieve warning
  } = location.state || {};

  // AI State
  const [itineraryData, setItineraryData] = useState(rawItinerary.length > 0 ? rawItinerary : (rawPlan || []));
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Standardize Data for display
  const totalBudgetLabel = rawTotalBudget || rawTotalBudgetAlt || (rawBudget ? `₹${rawBudget}` : "N/A");

  // Redirect if no state
  useEffect(() => {
    if (!destination) {
      navigate("/plan");
    }
  }, [destination, navigate]);

  // Image State
  const [heroImage, setHeroImage] = useState(null);

  useEffect(() => {
    const loadHeroImage = async () => {
      if (destination) {
        const url = await imageService.fetchImage(destination + " tourism") || await imageService.fetchImage(destination);
        setHeroImage(url);
      }
    };
    loadHeroImage();
  }, [destination]);

  // AI Regeneration Logic
  const handleRegenerateItinerary = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-trip-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          days,
          travelStyle,
          flightData: null,
          hotelData: null
        })
      });

      const data = await response.json();
      if (data.itinerary) {
        setItineraryData(data.itinerary);
      } else {
        alert("Failed to regenerate itinerary. Please try again.");
      }
    } catch (error) {
      console.error("Regeneration Error:", error);
      alert("Server error during AI generation.");
    } finally {
      setIsRegenerating(false);
    }
  };


  const handleDownloadPDF = async () => {
    if (!itineraryRef.current) return;
    const btn = document.getElementById("download-btn");
    try {
      if (btn) btn.innerText = "Processing...";
      window.scrollTo(0, 0);
      const element = itineraryRef.current;
      await new Promise(r => setTimeout(r, 500));
      const canvas = await html2canvas(element, { scale: 1, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/jpeg", 0.8);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`TripWise_${destination}.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF Error");
    } finally {
      if (btn) btn.innerText = "Download PDF";
    }
  };

  if (!destination) return null;

  return (
    <div className="min-h-screen bg-white text-black w-full font-sans pb-32">
      <div ref={itineraryRef} className="bg-white pdf-capture">
        {/* HERO */}
        <div className="relative h-[40vh] w-full overflow-hidden">
          <img
            src={heroImage || `https://loremflickr.com/1920/1080/${destination},landscape/all`}
            alt={destination}
            className="absolute inset-0 w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-center justify-center text-center p-6">
            <div>
              <h1 className="text-6xl font-black text-white uppercase tracking-tighter mb-2">{destination}</h1>
              <p className="text-white font-bold tracking-widest uppercase text-xs">{days} Days • {totalBudgetLabel}</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">

          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                <span className="w-8 h-px bg-gray-200"></span>
                Your Itinerary
              </h2>
              <p className="text-[10px] font-bold text-stone-300 uppercase italic">Click on any location to get directions on Google Maps</p>
            </div>

            {/* AI CONTROLS */}
            <div className="flex items-center gap-4 mt-4 md:mt-0 bg-gray-50 p-2 rounded-full border border-gray-200">
              <button
                onClick={handleRegenerateItinerary}
                disabled={isRegenerating}
                className="bg-black text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isRegenerating ? (
                  <>In Progress...</>
                ) : (
                  <>Regenerate <span className="text-yellow-400">✨</span></>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-12 border-l border-black ml-4 pl-8">
            {itineraryData.map((day, index) => (
              <DayCard key={index} day={day} index={index} />
            ))}
          </div>
        </div>
      </div>

      <div className="text-center pb-24 pt-8 space-x-6">
        <button id="download-btn" onClick={handleDownloadPDF} className="btn-secondary">Download PDF</button>
      </div>
    </div>
  );
}

function DayCard({ day }) {
  const getMapLink = (place) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place)}`;

  return (
    <div className="relative">
      <div className="absolute -left-[41px] top-2 w-4 h-4 bg-black rounded-full border-2 border-white" />
      <h3 className="text-2xl font-black uppercase mb-4">Day {day.day}: {day.title}</h3>
      <p className="text-gray-600 italic mb-6">"{day.plan}"</p>
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-bold uppercase text-xs mb-2 text-gray-400">Must Visit</h4>
          <ul className="text-sm font-bold space-y-2">
            {day.must_visit?.map(i => (
              <li key={i}>
                <a href={getMapLink(i)} target="_blank" rel="noopener noreferrer" className="hover:text-stone-400 transition-colors flex items-center gap-2">
                  <span>📍</span> {i}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold uppercase text-xs mb-2 text-gray-400">Eat</h4>
          <ul className="text-sm font-bold space-y-2">
            {day.local_eats?.map(i => (
              <li key={i}>
                <a href={getMapLink(i)} target="_blank" rel="noopener noreferrer" className="hover:text-stone-400 transition-colors flex items-center gap-2">
                  <span>🍽️</span> {i}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold uppercase text-xs mb-2 text-gray-400">Do</h4>
          <ul className="text-sm font-bold space-y-2">
            {day.activities?.map(i => (
              <li key={i}>
                <a href={getMapLink(i)} target="_blank" rel="noopener noreferrer" className="hover:text-stone-400 transition-colors flex items-center gap-2">
                  <span>✨</span> {i}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
