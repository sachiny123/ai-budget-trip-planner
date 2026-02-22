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
    transport = [],
    hotels = [],
    itinerary: rawItinerary = [],
    plan: rawPlan,
    source = "Unknown",
    tripId,
    fromCity,
    warning // Retrieve warning
  } = location.state || {};

  const [selectedTransport, setSelectedTransport] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [liveFlights, setLiveFlights] = useState([]);
  const [liveHotels, setLiveHotels] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [apiError, setApiError] = useState(null);

  // AI State
  // const [aiModel, setAiModel] = useState("gemini"); // Removed
  const [itineraryData, setItineraryData] = useState(rawItinerary.length > 0 ? rawItinerary : (rawPlan || []));
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Standardize Data for display
  const totalBudgetLabel = rawTotalBudget || rawTotalBudgetAlt || (rawBudget ? `₹${rawBudget}` : "N/A");

  const calculateTotal = () => {
    let total = 0;
    if (selectedTransport) total += (Number(selectedTransport.price) || 0);
    if (selectedHotel) total += (Number(selectedHotel.price_per_night) || (selectedHotel.price?.total ? Number(selectedHotel.price.total) / days : 0)) * days;
    return total;
  };

  const handleCheckout = () => {
    navigate("/checkout", {
      state: {
        destination,
        days,
        fromCity,
        selectedTransport,
        selectedHotel,
        totalSelection: calculateTotal(),
        tripId
      }
    });
  };

  // Redirect if no state
  useEffect(() => {
    if (!destination) {
      navigate("/plan");
    }
  }, [destination, navigate]);

  // Fetch Live Data on Mount
  useEffect(() => {
    const fetchLiveBookings = async () => {
      if (!destination) return;
      setLoadingBookings(true);
      setApiError(null);
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        const originCode = getIataCode(fromCity) || 'DEL';
        const destCode = getIataCode(destination);

        if (!destCode) {
          setApiError(`Could not resolve airport code for ${destination}`);
          setLoadingBookings(false);
          return;
        }

        const finalOrigin = originCode === destCode ? (originCode === 'DEL' ? 'BOM' : 'DEL') : originCode;

        const flightRes = await searchFlights(finalOrigin, destCode, dateStr);
        setLiveFlights(flightRes || []);

        const hotelRes = await searchHotels(destCode);
        setLiveHotels(hotelRes || []);

      } catch (e) {
        console.error("Failed to load live booking data", e);
        setApiError("Live rates unavailable");
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchLiveBookings();
  }, [destination, fromCity]);

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
          flightData: selectedTransport ? { airline: selectedTransport.details?.itineraries?.[0]?.segments?.[0]?.carrierCode || 'Airline', arrival: 'Destination' } : null,
          hotelData: selectedHotel ? { name: selectedHotel.name } : null
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

          {/* LIVE BOOKING SECTION */}
          <div className="mb-20">
            <h2 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-4">
              <span className="w-8 h-1 bg-black"></span>
              Book Your Travel
            </h2>

            {apiError && <p className="mb-4 text-xs font-bold text-red-500 uppercase tracking-widest">{apiError}</p>}

            {loadingBookings ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Fetching live rates...</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-12">
                {/* FLIGHTS */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-6">Available Flights</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {liveFlights.length > 0 ? liveFlights.map((flight, i) => (
                      <div key={i}
                        onClick={() => setSelectedTransport({ type: 'Flight', price: flight.price.total, details: flight })}
                        className={`bg-white p-4 rounded-xl border cursor-pointer transition-all ${selectedTransport?.details?.id === flight.id ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-black text-lg">{flight.itineraries?.[0]?.segments?.[0]?.carrierCode}</span>
                          <span className="font-black text-lg">₹{flight.price.total}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 font-bold uppercase tracking-wide">
                          <span>{flight.itineraries[0].segments[0].departure.at.split('T')[1].substr(0, 5)}</span>
                          <span className="border-b border-gray-300 flex-1 mx-4"></span>
                          <span>{flight.itineraries[0].segments[0].arrival.at.split('T')[1].substr(0, 5)}</span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-400 italic">No flights found for this route.</p>
                    )}
                  </div>
                </div>

                {/* HOTELS */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-6">Recommended Stays</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {liveHotels.length > 0 ? liveHotels.map((hotel, i) => (
                      <div key={i}
                        onClick={() => setSelectedHotel({ name: hotel.name, price_per_night: 5000, ...hotel })} // Price mock if API doesn't return
                        className={`bg-white p-4 rounded-xl border cursor-pointer transition-all ${selectedHotel?.hotelId === hotel.hotelId ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm leading-tight mb-1">{hotel.name}</h4>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400">{hotel.address?.cityName}</p>
                          </div>
                          {/* Mocking price if not in basic search result */}
                          <span className="font-black text-sm">₹5,000<span className="text-[10px] font-normal text-gray-400">/n</span></span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-400 italic">No hotels found in {destination}.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
              <span className="w-8 h-px bg-gray-200"></span>
              Your Itinerary
            </h2>

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

      {/* FLOAT CHECKOUT BAR */}
      <AnimatePresence>
        {(selectedTransport || selectedHotel) && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-black p-4 z-50 flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <div className="flex items-center gap-8">
              {selectedTransport && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Transport</span>
                  <span className="text-sm font-black">Flight (₹{selectedTransport.price})</span>
                </div>
              )}
              {selectedHotel && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Hotel</span>
                  <span className="text-sm font-black">{selectedHotel.name}</span>
                </div>
              )}
              <div className="flex flex-col border-l border-black/10 pl-8">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Subtotal</span>
                <span className="text-xl font-black">₹{calculateTotal()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="px-10 py-4 font-bold rounded-full text-xs tracking-[0.2em] uppercase transition-all shadow-xl bg-black text-white hover:bg-gray-800"
            >
              Proceed to Checkout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DayCard({ day }) {
  return (
    <div className="relative">
      <div className="absolute -left-[41px] top-2 w-4 h-4 bg-black rounded-full border-2 border-white" />
      <h3 className="text-2xl font-black uppercase mb-4">Day {day.day}: {day.title}</h3>
      <p className="text-gray-600 italic mb-6">"{day.plan}"</p>
      <div className="grid md:grid-cols-3 gap-6">
        <div><h4 className="font-bold uppercase text-xs mb-2 text-gray-400">Must Visit</h4><ul className="text-sm font-bold">{day.must_visit?.map(i => <li key={i}>{i}</li>)}</ul></div>
        <div><h4 className="font-bold uppercase text-xs mb-2 text-gray-400">Eat</h4><ul className="text-sm font-bold">{day.local_eats?.map(i => <li key={i}>{i}</li>)}</ul></div>
        <div><h4 className="font-bold uppercase text-xs mb-2 text-gray-400">Do</h4><ul className="text-sm font-bold">{day.activities?.map(i => <li key={i}>{i}</li>)}</ul></div>
      </div>
    </div>
  )
}
