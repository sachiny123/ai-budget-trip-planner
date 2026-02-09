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
    totalBudget,
    tripType = "solo",
    travelStyle = "budget",
    itinerary = [],
    source = "Unknown"
  } = location.state || {};

  // Redirect if no state
  useEffect(() => {
    if (!destination) navigate("/plan");
  }, [destination, navigate]);

  const handleDownloadPDF = async () => {
    if (!itineraryRef.current) return;

    // Minimal feedback
    const btn = document.getElementById("download-btn");
    if (btn) btn.innerText = "Saving...";

    const element = itineraryRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`TripWise_${destination}.pdf`);

    if (btn) btn.innerText = "Download PDF";
  };

  if (!destination) return null;

  return (
    <div className="min-h-screen bg-white text-black w-full font-sans">
      {/* CAPTURE WRAPPER */}
      <div ref={itineraryRef} className="bg-white">
        {/* HERO SECTION */}
        <div className="relative h-[60vh] w-full overflow-hidden print:h-[40vh]">
          <img
            src={`https://loremflickr.com/1920/1080/${destination},landscape/all`}
            alt={destination}
            className="absolute inset-0 w-full h-full object-cover grayscale" // Grayscale for B/W theme
          />
          <div className="absolute inset-0 bg-black/60" />

          <div className="absolute inset-0 flex items-center justify-center text-center p-4">
            <div className="max-w-5xl">
              <span className="inline-block px-3 py-1 border border-white/30 rounded-full text-white text-xs font-bold uppercase tracking-[0.2em] mb-6">
                TripWise Itinerary
              </span>
              <h1 className="text-6xl md:text-9xl font-black text-white mb-8 uppercase tracking-tighter">
                {destination}
              </h1>

              <div className="inline-flex flex-wrap items-center justify-center gap-8 text-white font-bold tracking-widest uppercase text-xs">
                <span className="border-b border-transparent pb-1">
                  {days} Days
                </span>
                <span className="border-b border-transparent pb-1">
                  ₹{totalBudget}
                </span>
                <span className="border-b border-transparent pb-1">
                  {source}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ITINERARY CONTENT */}
        <div className="max-w-5xl mx-auto px-6 py-24 w-full">

          {itinerary.length > 0 ? (
            <div className="space-y-12 border-l border-black ml-4 md:ml-0 pl-8 md:pl-12">
              {itinerary.map((day, index) => (
                <DayCard
                  key={day.day || index}
                  day={day}
                  index={index}
                />
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
          className="px-8 py-4 bg-white text-black border-2 border-black font-bold rounded-full hover:bg-black hover:text-white transition-all text-xs tracking-widest uppercase"
        >
          Download PDF
        </button>
        <button
          onClick={() => navigate("/plan")}
          className="px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all text-xs tracking-widest uppercase shadow-xl"
        >
          Plan New Trip
        </button>
      </div>

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
