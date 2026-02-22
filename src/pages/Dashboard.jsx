import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { api } from "../services/api-service";
import { imageService } from "../services/image-service";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
    const { currentUser } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            fetchTrips();
        }
    }, [currentUser]);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const tripsData = await api.getUserTrips(currentUser.uid);

            // Fetch images in parallel
            const tripsWithImages = await Promise.all(tripsData.map(async (trip) => {
                const img = await imageService.fetchImage(trip.destination);
                return { ...trip, imageUrl: img };
            }));

            setTrips(tripsWithImages);
        } catch (err) {
            console.error("Error fetching trips:", err);
            alert("Failed to load trips.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this trip?")) {
            try {
                await api.deleteTrip(id);
                setTrips(trips.filter(t => t._id !== id));
            } catch (err) {
                console.error("Error deleting trip:", err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-white text-black p-6 md:p-16">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 md:mb-4 block">
                            User Dashboard
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">My Journeys</h1>
                    </div>
                    <Link
                        to="/plan"
                        className="px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all text-center"
                    >
                        Plan New Trip
                    </Link>
                </header>

                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-stone-50 rounded-[2.5rem] p-8 h-[400px] animate-pulse flex flex-col justify-end">
                                <div className="h-4 w-24 bg-stone-200 rounded-full mb-4"></div>
                                <div className="h-8 w-48 bg-stone-200 rounded-lg mb-6"></div>
                                <div className="h-4 w-32 bg-stone-200 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                ) : trips.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {trips.map((trip, index) => (
                                <motion.div
                                    key={trip.id || trip._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => {
                                        if (trip.isBooked) {
                                            navigate(`/ticket/${trip.id || trip._id}`);
                                        } else {
                                            navigate("/result", { state: { ...trip } });
                                        }
                                    }}
                                    className="group relative bg-white border border-stone-100 rounded-[2.5rem] overflow-hidden cursor-pointer hover:border-black transition-all shadow-sm hover:shadow-xl"
                                >
                                    <div className="aspect-[16/10] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 relative">
                                        <img
                                            src={trip.imageUrl || `https://loremflickr.com/800/500/${trip.destination},landscape/all`}
                                            alt={trip.destination}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-4">
                                            {trip.isBooked ? (
                                                <span className="px-4 py-1.5 bg-orange-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                                                    Transaction Confirmed
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                                    {trip.duration} Plan
                                                </span>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(trip.id || trip._id, e)}
                                                className="text-[9px] font-black text-red-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:text-red-600"
                                            >
                                                Archive
                                            </button>
                                        </div>

                                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 truncate">
                                            {trip.destination}
                                        </h2>

                                        <div className="flex items-center justify-between mt-6">
                                            <div className="flex items-center gap-4 text-[9px] font-black text-stone-300 uppercase tracking-[0.2em]">
                                                <span>{trip.tripType}</span>
                                                <span className="w-1 h-1 bg-stone-200 rounded-full"></span>
                                                <span>{trip.travelStyle}</span>
                                            </div>
                                            <div className="w-10 h-10 flex items-center justify-center bg-stone-50 rounded-full group-hover:bg-black group-hover:text-white transition-all">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-40 bg-stone-50 rounded-[3rem] border-2 border-dashed border-stone-200">
                        <div className="max-w-md mx-auto">
                            <span className="text-5xl mb-6 block">🗺️</span>
                            <p className="text-stone-400 font-bold uppercase tracking-[0.2em] mb-4 text-xs">First Adventure Awaits</p>
                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 text-stone-300">Your travel portfolio is currently empty</h2>
                            <Link
                                to="/plan"
                                className="inline-block px-10 py-5 bg-black text-white text-xs font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-all shadow-xl"
                            >
                                Craft New Journey →
                            </Link>
                        </div>
                    </div>
                )}


                {/* SUCCESS NOTIFICATION */}
                <AnimatePresence>
                    {location.state?.bookingSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="fixed bottom-12 right-12 bg-black text-white p-8 rounded-3xl shadow-2xl z-50 flex items-center gap-6 border border-white/10"
                        >
                            <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-tighter text-xl">Booking Confirmed!</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">A confirmation email has been sent.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
