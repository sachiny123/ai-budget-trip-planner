import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    destination: "",
    days: "",
    budget: "",
    travelStyle: "budget",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 px-4">

      {/* Glass background */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* Card */}
      <div className="relative w-full max-w-lg bg-white/95 rounded-3xl shadow-2xl p-10 border border-gray-200">

        {/* Floating badge */}
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs px-4 py-1 rounded-full shadow-lg tracking-wide">
          ✨ AI Trip Planner
        </span>

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-2">
          Trip<span className="text-indigo-600">Wise</span>
        </h1>

        <p className="text-center text-gray-600 mb-10">
          Smart itineraries that respect your budget
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Destination */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Destination
            </label>
            <input
              type="text"
              name="destination"
              placeholder="Goa, Manali, Jaipur"
              value={formData.destination}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Days */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Number of Days
            </label>
            <input
              type="number"
              name="days"
              placeholder="3"
              value={formData.days}
              onChange={handleChange}
              min="1"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Budget (₹)
            </label>
            <input
              type="number"
              name="budget"
              placeholder="7000"
              value={formData.budget}
              onChange={handleChange}
              min="1000"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Travel Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Travel Style
            </label>
            <select
              name="travelStyle"
              value={formData.travelStyle}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="budget">💸 Budget</option>
              <option value="normal">🙂 Normal</option>
              <option value="luxury">💎 Luxury</option>
            </select>
          </div>

          {/* CTA */}
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg hover:scale-[1.02] transition-all shadow-xl"
          >
            Generate My Trip →
          </button>

        </form>

        {/* Footer hint */}
        <p className="text-center text-xs text-gray-400 mt-6">
          No login required • Instant AI plan
        </p>

      </div>
    </div>
  );
}
