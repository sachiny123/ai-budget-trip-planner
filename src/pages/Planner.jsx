import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateTrip } from "../services/ai-service";
import { api } from "../services/api-service";
import { useAuth } from "../context/AuthContext";
import { UsageWarning } from "../components/CreditUI";
import UpgradeModal from "../components/UpgradeModal";

export default function Planner() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fromCity: "",
    destination: "",
    days: "",
    budget: "",
    tripType: "solo",
    travelStyle: "budget",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { currentUser, userData } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // BASIC VALIDATION
    if (!formData.destination.trim()) {
      return setError("Please enter a destination.");
    }

    if (Number(formData.days) < 1) {
      return setError("Trip must be at least 1 day.");
    }

    if (Number(formData.budget) < 1000) {
      return setError("Budget seems too low for a trip.");
    }

    // CREDIT CHECK
    if (!userData || userData.credits < 1) {
      setShowWarning(true);
      return;
    }

    // LOGIC CHECK: Impossible Budget
    const minDailyCost = 1000;
    if (Number(formData.budget) < (Number(formData.days) * minDailyCost)) {
      return setError(`Budget is too low! Minimum ₹${minDailyCost}/day needed (Total: ₹${Number(formData.days) * minDailyCost}).`);
    }

    try {
      setLoading(true);

      const trip = await generateTrip(
        formData.fromCity,
        formData.destination,
        formData.days,
        formData.budget,
        formData.tripType,
        formData.travelStyle
      );

      if (trip.error) {
        setError(trip.error);
        return;
      }

      // 1. Deduct Credit (Atomic with Logging)
      await api.deductCredit(currentUser.uid, "trip_generation", {
        destination: formData.destination
      });

      // 2. Save Trip to MongoDB
      const newTripData = {
        userId: currentUser.uid,
        ...trip,
        createdAt: new Date(),
        tripType: formData.tripType,
        travelStyle: formData.travelStyle,
        budget: formData.budget,
        days: formData.days
      };

      const result = await api.createTrip(newTripData);

      navigate("/result", {
        state: {
          ...formData,
          ...trip,
          tripId: result.tripId
        },
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 md:p-12">
      <div className="w-full max-w-6xl bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden grid md:grid-cols-2">
        {/* LEFT INFO */}
        <div className="hidden md:flex flex-col justify-between bg-black text-white p-12 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=2070&auto=format&fit=crop"
            alt="Travel World"
            className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale"
          />
          <div className="relative z-10">
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase border border-white/30 px-4 py-2 rounded-full mb-8">
              TripWise AI
            </span>
            <h1 className="text-5xl font-black leading-none tracking-tighter mb-6 uppercase">
              Design <br /> Your <br /> Journey.
            </h1>
            <p className="text-gray-300 text-lg font-light max-w-sm">
              Craft a personalized itinerary in seconds. No stress. Just travel.
            </p>
          </div>
          <div className="relative z-10 text-xs font-bold uppercase tracking-widest text-gray-500">
            © TripWise {new Date().getFullYear()}
          </div>
        </div>

        {/* FORM */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight mb-1 md:mb-2">
                Trip Details
              </h2>
              <p className="text-gray-500 text-[10px] md:text-sm font-medium uppercase tracking-widest">
                Let's get the basics down
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Available Balance</span>
              <span className="text-xl font-black text-black leading-none">{userData?.credits ?? 0}</span>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 text-sm font-medium border-l-2 border-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Starting From"
                name="fromCity"
                placeholder="e.g. Delhi, Mumbai"
                value={formData.fromCity}
                onChange={handleChange}
              />
              <Input
                label="Where to?"
                name="destination"
                placeholder="e.g. Goa, Manali, Jaipur"
                value={formData.destination}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Days"
                type="number"
                name="days"
                placeholder="3"
                value={formData.days}
                onChange={handleChange}
              />
              <Input
                label="Budget (₹)"
                type="number"
                name="budget"
                placeholder="10000"
                value={formData.budget}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Select
                label="Who's going?"
                name="tripType"
                value={formData.tripType}
                onChange={handleChange}
                options={[
                  { value: "solo", label: "Solo" },
                  { value: "couple", label: "Couple" },
                  { value: "friends", label: "Friends" },
                  { value: "family", label: "Family" },
                ]}
              />
              <Select
                label="Vibe?"
                name="travelStyle"
                value={formData.travelStyle}
                onChange={handleChange}
                options={[
                  { value: "budget", label: "Budget" },
                  { value: "normal", label: "Comfort" },
                  { value: "luxury", label: "Luxury" },
                ]}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-full font-bold text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 ${loading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-900"
                }`}
            >
              {loading ? "Generating Plan..." : "Create Itinerary"}
            </button>
          </form>
        </div>
      </div>

      <UsageWarning
        show={showWarning}
        onClose={() => setShowWarning(false)}
        onUpgrade={() => {
          setShowWarning(false);
          setShowUpgrade(true);
        }}
      />
      <UpgradeModal show={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-black uppercase tracking-widest">
        {label}
      </label>
      <input
        {...props}
        required
        className="w-full bg-white border-b-2 border-gray-200 px-4 py-3 text-black font-medium placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-black uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          className="w-full bg-white border-b-2 border-gray-200 px-4 py-3 text-black font-medium focus:border-black focus:outline-none transition-colors appearance-none"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs">
          ▼
        </div>
      </div>
    </div>
  );
}
