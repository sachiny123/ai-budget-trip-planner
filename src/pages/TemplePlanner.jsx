import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateTempleGuide } from "../services/ai-service";

const GOD_IMAGES = [
    "https://images.unsplash.com/photo-1549234850-8b010874c9e8?q=80&w=2070&auto=format&fit=crop", // Shiva/Generic Deity
    "https://images.unsplash.com/photo-1623945238202-beb955512727?q=80&w=2070&auto=format&fit=crop", // Krishna
    "https://images.unsplash.com/photo-1583096114844-06ce5a5f2371?q=80&w=2070&auto=format&fit=crop", // Ganesha
    "https://images.unsplash.com/photo-1582234509156-3c0e5a87265f?q=80&w=2070&auto=format&fit=crop", // Hanuman-like/Temple
    "https://images.unsplash.com/photo-1596756854128-4444558e8055?q=80&w=2070&auto=format&fit=crop", // Temple/Festive
    "https://images.unsplash.com/photo-1605634560731-016147dc6a1e?q=80&w=2070&auto=format&fit=crop"  // Aarti/Ganga
];

export default function TemplePlanner() {
    const navigate = useNavigate();
    const [templeName, setTempleName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Initialize with a random image immediately
    const [bgImage] = useState(() => GOD_IMAGES[Math.floor(Math.random() * GOD_IMAGES.length)]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!templeName.trim()) return setError("Please enter a temple name.");

        try {
            setLoading(true);
            setError("");

            const guide = await generateTempleGuide(templeName);

            if (guide.error) {
                setError(guide.error);
                return;
            }

            navigate("/temple-result", { state: { guide } });

        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 md:p-12">
            <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-xl overflow-hidden grid md:grid-cols-2">

                {/* LEFT VISUAL */}
                <div className="hidden md:flex flex-col justify-between bg-orange-900 text-white p-12 relative overflow-hidden">
                    <img
                        src={bgImage || "https://images.unsplash.com/photo-1623945238202-beb955512727?q=80&w=2070&auto=format&fit=crop"} // Default Fallback (Krishna)
                        alt="Divine"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay transition-opacity duration-1000"
                    />
                    <div className="relative z-10">
                        <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase border border-white/30 px-4 py-2 rounded-full mb-8">
                            Spiritual Guide
                        </span>
                        <h1 className="text-5xl font-black leading-none tracking-tighter mb-6 uppercase">
                            Sacred <br /> Journeys.
                        </h1>
                        <p className="text-orange-100/80 text-lg font-light max-w-sm">
                            Discover the divine. Get detailed darshan timings, etiquette, and travel tips for any temple.
                        </p>
                    </div>
                </div>

                {/* RIGHT FORM */}
                <div className="p-8 md:p-16 flex flex-col justify-center">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-black uppercase tracking-tight mb-2">
                            Find a Temple
                        </h2>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">
                            Enter the name of the holy place
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 text-red-600 text-sm font-medium border-l-2 border-red-500">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-black uppercase tracking-widest">
                                Temple Name / Location
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Kedarnath, Tirupati Balaji, Siddhivinayak"
                                value={templeName}
                                onChange={(e) => setTempleName(e.target.value)}
                                className="w-full bg-white border-b-2 border-gray-200 px-4 py-3 text-black font-medium placeholder-gray-400 focus:border-orange-600 focus:outline-none transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-full font-bold text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 ${loading
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-orange-600 text-white hover:bg-orange-700"
                                }`}
                        >
                            {loading ? "Consulting AI..." : "Get Guide"}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
