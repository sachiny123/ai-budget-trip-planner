import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateTempleGuide } from "../services/ai-service";
import { motion, AnimatePresence } from "framer-motion";

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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Rotating Background Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % GOD_IMAGES.length);
        }, 5000); // Change image every 5 seconds
        return () => clearInterval(interval);
    }, []);

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
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 md:p-12 relative overflow-hidden">
            {/* Mobile Background (Absolute) - Visible only on small screens */}
            <div className="absolute inset-0 md:hidden z-0">
                <AnimatePresence mode="popLayout">
                    <motion.img
                        key={currentImageIndex}
                        src={GOD_IMAGES[currentImageIndex]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="Divine Background"
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50/90 to-orange-100/90" />
            </div>

            <div className="w-full max-w-4xl bg-white/90 backdrop-blur-sm md:bg-white rounded-[2rem] shadow-xl overflow-hidden grid md:grid-cols-2 relative z-10">

                {/* LEFT VISUAL (Desktop) */}
                <div className="hidden md:flex flex-col justify-between bg-orange-950 text-white p-12 relative overflow-hidden">
                    <AnimatePresence mode="popLayout">
                        <motion.img
                            key={currentImageIndex}
                            src={GOD_IMAGES[currentImageIndex]}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 0.6, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5 }}
                            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
                            alt="Divine"
                        />
                    </AnimatePresence>

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
                                placeholder="e.g. Kedarnath, Tirupati Balaji"
                                value={templeName}
                                onChange={(e) => setTempleName(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-gray-300 px-4 py-3 text-black font-medium placeholder-gray-400 focus:border-orange-600 focus:outline-none transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-full font-bold text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 ${loading
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
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
