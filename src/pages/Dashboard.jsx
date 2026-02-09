import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
            const q = query(
                collection(db, "trips"),
                where("userId", "==", currentUser.uid),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const tripsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTrips(tripsData);
        } catch (err) {
            console.error("Error fetching trips:", err);
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
        <div className="min-h-screen bg-white text-black p-8 md:p-16">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block">
                            User Dashboard
                        </span>
                        <h1 className="text-6xl font-black uppercase tracking-tighter">My Journeys</h1>
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
                                    onClick={() => navigate("/result", { state: { ...trip } })}
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
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {trip.duration}
                                            </span>
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

                                        <div className="flex items-center gap-4 text-[10px] font-bold text-black/60 uppercase tracking-widest">
                                            <span>{trip.tripType}</span>
                                            <span>•</span>
                                            <span>{trip.travelStyle}</span>
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
            </div>
        </div>
    );
}
