import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";


import { api } from "../services/api-service";
import { motion } from "framer-motion";

export default function Ticket() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrip();
    }, [bookingId]);

    const fetchTrip = async () => {
        try {
            setLoading(true);
            const tripData = await api.getTrip(bookingId);

            if (tripData) {
                setTrip({ id: tripData._id, ...tripData });
            } else {
                console.error("No such trip!");
            }
        } catch (err) {
            console.error("Error fetching trip:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!trip || !trip.isBooked) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
                <h1 className="text-4xl font-black uppercase mb-4">Ticket Not Found</h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest mb-8">This trip has not been confirmed yet.</p>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const { destination, fromCity, days, bookedDetails, createdAt } = trip;

    return (
        <div className="min-h-screen bg-gray-50 py-12 md:py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Your Ticket</h1>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em] mt-2">Trip ID: {trip.id}</p>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="hidden md:block px-6 py-3 border-2 border-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-black hover:text-white transition-all"
                    >
                        Print Pass
                    </button>
                </header>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border-2 border-black/5"
                >
                    {/* MAIN TICKET BODY */}
                    <div className="flex-1 p-8 md:p-16 border-b-2 md:border-b-0 md:border-r-2 border-dashed border-gray-100 relative">
                        {/* THE PUNCH HOLES */}
                        <div className="absolute top-0 right-0 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gray-50 rounded-full border-2 border-black/5" />
                        <div className="absolute bottom-0 right-0 -translate-x-1/2 translate-y-1/2 w-10 h-10 bg-gray-50 rounded-full border-2 border-black/5" />

                        <div className="flex justify-between items-start mb-16">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Travel Platform</span>
                                <h2 className="text-3xl font-black uppercase leading-none">TripWise <br /> Alpha</h2>
                            </div>
                            <div className="text-right">
                                <span className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                    Confirmed
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-12 gap-x-8">
                            <TicketField label="Passenger" value="Sachin Yadav" />
                            <TicketField label="Booking Date" value={new Date(bookedDetails?.bookedAt || createdAt).toLocaleDateString()} />

                            <div className="col-span-2 flex items-center gap-6 py-4">
                                <div className="flex-1">
                                    <TicketField label="From" value={fromCity || "Unspecified"} />
                                </div>
                                <div className="flex flex-col items-center gap-2 px-4">
                                    <div className="w-2 h-2 rounded-full bg-black" />
                                    <div className="w-12 h-px bg-black/20" />
                                    <span className="text-[8px] font-black uppercase">Direct</span>
                                    <div className="w-12 h-px bg-black/20" />
                                    <div className="w-2 h-2 border border-black rounded-full" />
                                </div>
                                <div className="flex-1 text-right">
                                    <TicketField label="Destination" value={destination} />
                                </div>
                            </div>

                            <TicketField label="Hotel Stay" value={bookedDetails?.hotel?.name} />
                            <TicketField label="Transport Type" value={bookedDetails?.transport?.type} />
                        </div>

                        <div className="mt-16 pt-8 border-t border-gray-100">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose">
                                Verification Hash: {Math.random().toString(36).substring(2, 15).toUpperCase()} <br />
                                This is a simulation ticket. No actual travel rights or hotel access is granted.
                            </p>
                        </div>
                    </div>

                    {/* STUB / QR SECTION */}
                    <div className="bg-gray-50 p-8 md:p-12 w-full md:w-64 flex flex-col items-center justify-between gap-8">
                        <div className="w-full aspect-square bg-white rounded-3xl p-4 shadow-sm border border-black/5 flex items-center justify-center">
                            {/* MOCK QR CODE GENERATOR */}
                            <div className="w-full h-full bg-black p-2 flex flex-wrap gap-1">
                                {Array.from({ length: 16 }).map((_, i) => (
                                    <div key={i} className={`w-[calc(25%-4px)] h-[calc(25%-4px)] ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`} />
                                ))}
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="text-center">
                                <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest block mb-1">Gate Pass</span>
                                <span className="text-xl font-black font-mono">#{trip.id.substring(0, 6).toUpperCase()}</span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 transition-all"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => navigate("/plan")}
                                    className="w-full py-4 bg-white border border-black text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all"
                                >
                                    New Trip
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function TicketField({ label, value }) {
    return (
        <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-black/30 block mb-1">{label}</label>
            <span className="text-lg font-black uppercase leading-none break-words">{value || "N/A"}</span>
        </div>
    );
}
