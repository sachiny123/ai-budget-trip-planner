import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
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
            // Simple query to avoid composite index requirement
            const q = query(
                collection(db, "trips"),
                where("userId", "==", currentUser.uid)
            );
            const querySnapshot = await getDocs(q);
            const tripsData = querySnapshot.docs.map(doc => ({
                tripId: doc.id,
                ...doc.data()
            }));

            // Sort in-memory instead of Firestore for now
            tripsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setTrips(tripsData);
        } catch (err) {
            console.error("Error fetching trips:", err);
            // Fallback for user if index is really the issue
            if (err.message.includes("index")) {
                alert("Firestore Index needed. Check console for the link to enable sorting.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this trip?")) {
            try {
                await deleteDoc(doc(db, "trips", id));
                setTrips(trips.filter(t => t.id !== id));
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
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : trips.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {trips.map((trip, index) => (
                                <motion.div
                                    key={trip.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => {
                                        if (trip.isBooked) {
                                            navigate(`/ticket/${trip.tripId}`);
                                        } else {
                                            navigate("/result", { state: { ...trip } });
                                        }
                                    }}
                                    className="group relative bg-white border border-black/5 rounded-3xl overflow-hidden cursor-pointer hover:border-black transition-all"
                                >
                                    <div className="aspect-[16/10] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                                        <img
                                            src={`https://loremflickr.com/800/500/${trip.destination},landscape/all`}
                                            alt={trip.destination}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>

                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-4">
                                            {trip.isBooked ? (
                                                <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    Confirmed
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {trip.duration}
                                                </span>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(trip.id, e)}
                                                className="text-[10px] font-bold text-red-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Delete
                                            </button>
                                        </div>

                                        <h2 className="text-3xl font-black uppercase tracking-tight mb-2 truncate">
                                            {trip.destination}
                                        </h2>

                                        <div className="flex items-center justify-between mt-6">
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-black/60 uppercase tracking-widest">
                                                <span>{trip.tripType}</span>
                                                <span>•</span>
                                                <span>{trip.travelStyle}</span>
                                            </div>
                                            {trip.isBooked && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/ticket/${trip.tripId}`);
                                                    }}
                                                    className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800 transition-all shadow-lg"
                                                    title="View Tickets"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-32 border-2 border-dashed border-black/5 rounded-[3rem]">
                        <p className="text-gray-400 font-bold uppercase tracking-widest mb-8">No trips found</p>
                        <Link
                            to="/plan"
                            className="text-black font-black uppercase tracking-tighter text-3xl hover:text-gray-600 transition-colors"
                        >
                            Start Planning →
                        </Link>
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
