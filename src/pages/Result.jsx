import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
    fromCity
  } = location.state || {};

  const [selectedTransport, setSelectedTransport] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);

  // Standardize Data for display
  const totalBudgetLabel = rawTotalBudget || rawTotalBudgetAlt || (rawBudget ? `₹${rawBudget}` : "N/A");
  const itineraryData = rawItinerary.length > 0 ? rawItinerary : (rawPlan || []);

  const calculateTotal = () => {
    let total = 0;
    if (selectedTransport) total += (Number(selectedTransport.price) || 0);
    if (selectedHotel) total += (Number(selectedHotel.price_per_night) || 0) * days;
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

  // Redirect if no state or if already booked
  useEffect(() => {
    if (!destination) {
      navigate("/plan");
    } else if (location.state?.isBooked && tripId) {
      navigate(`/ticket/${tripId}`);
    }
  }, [destination, navigate, location.state, tripId]);

  const handleDownloadPDF = async () => {
    if (!itineraryRef.current) {
      console.error("No itinerary element found to download.");
      return;
    }

    const btn = document.getElementById("download-btn");
    try {
      if (btn) btn.innerText = "Processing...";
      window.scrollTo(0, 0);

      const element = itineraryRef.current;
      await new Promise(r => setTimeout(r, 500));

      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.8);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text("TripWise", pdfWidth - 25, pdfHeight > 280 ? 290 : pdfHeight + 10);

      pdf.save(`TripWise_${destination.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF Generation Failed:", err);
      alert("Something went wrong while saving the PDF.");
    } finally {
      if (btn) btn.innerText = "Download PDF";
    }
  };

  if (!destination) return null;

  return (
    <div className="min-h-screen bg-white text-black w-full font-sans pb-32">
      {/* CAPTURE WRAPPER */}
      <div ref={itineraryRef} className="bg-white pdf-capture">
        {/* HERO SECTION */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <img
            src={`https://loremflickr.com/1920/1080/${destination},landscape/all`}
            alt={destination}
            crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-black/60" />

          <div className="absolute inset-0 flex items-center justify-center text-center p-6">
            <div className="max-w-5xl">
              <span className="inline-block px-3 py-1 border border-white/30 rounded-full text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-4 md:mb-6">
                TripWise Itinerary
              </span>
              <h1 className="text-4xl md:text-9xl font-black text-white mb-6 md:mb-8 uppercase tracking-tighter">
                {destination}
              </h1>

              <div className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-8 text-white font-bold tracking-widest uppercase text-[10px] md:text-xs">
                <span className="border-b border-white/20 pb-1">{days} Days</span>
                <span className="border-b border-white/20 pb-1">Budget: {totalBudgetLabel}</span>
                <span className="border-b border-white/20 pb-1">Via {source}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ITINERARY CONTENT */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-24 w-full">
          {/* TRANSPORT & HOTELS SUMMARY */}
          <div className="grid md:grid-cols-2 gap-12 mb-24 border-b border-black/5 pb-24">
            {/* Transport Section */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-2">
                <span className="w-8 h-px bg-gray-200"></span>
                1. Select Transport
              </h2>
              <div className="space-y-6">
                {transport.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer ${selectedTransport?.type === t.type
                      ? "border-black bg-gray-50 ring-2 ring-black ring-offset-2"
                      : "border-gray-100 bg-gray-50 hover:border-black"
                      }`}
                    onClick={() => setSelectedTransport(t)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-black uppercase text-lg">{t.type}</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {t.duration} • ₹{t.price}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedTransport?.type === t.type ? "border-black bg-black" : "border-gray-300"
                        }`}>
                        {selectedTransport?.type === t.type && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotels Section */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-2">
                <span className="w-8 h-px bg-gray-200"></span>
                2. Select Your Stay
              </h2>
              <div className="space-y-6">
                {hotels.map((h, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer ${selectedHotel?.name === h.name
                      ? "border-black bg-gray-50 ring-2 ring-black ring-offset-2"
                      : "border-gray-100 bg-gray-50 hover:border-black"
                      }`}
                    onClick={() => setSelectedHotel(h)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black uppercase text-lg leading-tight">{h.name}</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          ₹{h.price_per_night} / night • ⭐ {h.rating}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedHotel?.name === h.name ? "border-black bg-black" : "border-gray-300"
                        }`}>
                        {selectedHotel?.name === h.name && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 font-serif italic line-clamp-2">"{h.description}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-16 flex items-center gap-2">
            <span className="w-8 h-px bg-gray-200"></span>
            Daily Itinerary
          </h2>

          {itineraryData.length > 0 ? (
            <div className="space-y-12 border-l border-black ml-4 md:ml-0 pl-8 md:pl-12">
              {itineraryData.map((day, index) => (
                <DayCard key={day.day || index} day={day} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <div className="text-center pb-24 pt-8 space-x-6">
        <button
          id="download-btn"
          onClick={handleDownloadPDF}
          className="px-8 py-4 bg-black text-white border-2 border-black font-bold rounded-full hover:bg-gray-800 transition-all text-xs tracking-widest uppercase"
        >
          Download PDF
        </button>
        <button
          onClick={() => navigate("/plan")}
          className="px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all text-xs tracking-widest uppercase"
        >
          Plan New Trip
        </button>
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
                  <span className="text-sm font-black">{selectedTransport.type} (₹{selectedTransport.price})</span>
                </div>
              )}
              {selectedHotel && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Hotel</span>
                  <span className="text-sm font-black">{selectedHotel.name} (₹{selectedHotel.price_per_night * days})</span>
                </div>
              )}
              <div className="flex flex-col border-l border-black/10 pl-8">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Subtotal</span>
                <span className="text-xl font-black">₹{calculateTotal()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!selectedTransport || !selectedHotel}
              className={`px-10 py-4 font-bold rounded-full text-xs tracking-[0.2em] uppercase transition-all shadow-xl ${selectedTransport && selectedHotel
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              {selectedTransport && selectedHotel ? "Proceed to Checkout" : "Complete Choices to Book"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= COMPONENT: DAY CARD ================= */

function DayCard({ day, index }) {
  const [isOpen, setIsOpen] = useState(true);

  const plan = day.plan || "Explore the city.";
  const mustVisit = day.must_visit || [];
  const localEats = day.local_eats || [];
  const activities = day.activities || [];
  const breakdown = day.budget_breakdown || {};

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="relative"
    >
      {/* Timeline Dot */}
      <div className="absolute -left-[43px] md:-left-[59px] top-2 w-5 h-5 bg-black border-4 border-white rounded-full" />

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer group mb-6"
      >
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Day {day.day}</span>
          {day.daily_budget && (
            <span className="text-xs font-black text-black uppercase tracking-widest border border-black px-2 py-0.5 rounded">
              Est. {day.daily_budget}
            </span>
          )}
        </div>

        <h3 className="text-4xl font-black text-black group-hover:text-gray-600 transition-colors uppercase tracking-tight">
          {day.title || `Day ${day.day}`}
        </h3>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {/* Budget Breakdown Pill */}
            {Object.keys(breakdown).length > 0 && (
              <div className="flex flex-wrap gap-4 mb-8">
                {Object.entries(breakdown).map(([key, val]) => (
                  <div key={key} className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{key}</span>
                    <span className="text-sm font-black text-black uppercase">{val}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-lg text-gray-600 font-serif leading-relaxed mb-10 max-w-3xl border-l-2 border-gray-100 pl-6 italic">
              "{plan}"
            </p>

            <div className="grid md:grid-cols-3 gap-12 mb-16">
              <InfoSection title="Must Visit" items={mustVisit} />
              <InfoSection title="Local Eats" items={localEats} />
              <InfoSection title="Experience" items={activities} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InfoSection({ title, items }) {
  if (!items?.length) return null;

  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-6 border-b border-black pb-2 inline-block">
        {title}
      </h4>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="text-sm font-medium text-gray-800 uppercase tracking-wide">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 border border-dashed border-gray-300 rounded-xl">
      <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">No Itinerary Generated</h3>
    </div>
  );
}
