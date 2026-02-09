import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Admin() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTrips: 0,
        recentTrips: [],
        users: []
    });
    const [loading, setLoading] = useState(true);

    // SECURE CHECK: Only allow certain emails
    const ADMIN_EMAILS = [import.meta.env.VITE_ADMIN_EMAIL, "admin@tripwise.com"];
    const isAdmin = currentUser && (ADMIN_EMAILS.includes(currentUser.email));

    useEffect(() => {
        if (isAdmin) {
            fetchAdminStats();
        }
    }, [isAdmin]);

    const fetchAdminStats = async () => {
        try {
            setLoading(true);

            // Fetch Users
            const userSnap = await getDocs(collection(db, "users"));
            const userData = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Fetch Trips
            const tripSnap = await getDocs(collection(db, "trips"));
            const tripData = tripSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Fetch Recent Trips
            const recentQuery = query(collection(db, "trips"), orderBy("createdAt", "desc"), limit(5));
            const recentSnap = await getDocs(recentQuery);
            const recentTrips = recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setStats({
                totalUsers: userData.length,
                totalTrips: tripData.length,
                recentTrips: recentTrips,
                users: userData
            });
        } catch (err) {
            console.error("Admin Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) return <Navigate to="/" />;

    return (
        <div className="min-h-screen bg-white text-black p-6 md:p-16">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 md:mb-16">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 md:mb-4 block">
                        System Administration
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Platform Overview</h1>
                </header>

                {loading ? (
                    <div className="py-20 text-center uppercase font-bold tracking-widest text-gray-400 animate-pulse">
                        Loading System Data...
                    </div>
                ) : (
                    <div className="space-y-12 md:space-y-16">
                        {/* STATS CARDS */}
                        <div className="grid md:grid-cols-2 gap-6 md:gap-8 text-white">
                            <div className="bg-black p-10 md:p-12 rounded-[2rem] md:rounded-[3rem] flex flex-col justify-between h-56 md:h-64">
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/50">Total Creators</span>
                                <span className="text-6xl md:text-8xl font-black tracking-tighter">{stats.totalUsers}</span>
                            </div>
                            <div className="bg-black p-10 md:p-12 rounded-[2rem] md:rounded-[3rem] flex flex-col justify-between h-56 md:h-64 border border-black">
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/50">Itineraries Generated</span>
                                <span className="text-6xl md:text-8xl font-black tracking-tighter">{stats.totalTrips}</span>
                            </div>
                        </div>

                        {/* RECENT ACTIVITY TABLE */}
                        <section>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Recent Trip Activity</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-black text-[10px] font-bold uppercase tracking-widest">
                                            <th className="py-4 px-2">Destination</th>
                                            <th className="py-4 px-2">Type</th>
                                            <th className="py-4 px-2">Budget</th>
                                            <th className="py-4 px-2">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentTrips.map(trip => (
                                            <tr key={trip.id} className="border-b border-gray-100 text-sm">
                                                <td className="py-4 px-2 font-bold uppercase">{trip.destination}</td>
                                                <td className="py-4 px-2 text-gray-500 uppercase">{trip.tripType}</td>
                                                <td className="py-4 px-2 text-black font-black">₹{trip.budget}</td>
                                                <td className="py-4 px-2 text-gray-400 text-xs">
                                                    {new Date(trip.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* USER MANAGEMENT */}
                        <section>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-8">User Directory</h2>
                            <div className="grid gap-4">
                                {stats.users.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Account</span>
                                            <span className="text-sm font-black text-black">{user.email}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Credits Left</span>
                                            <span className={`text-lg font-black ${user.credits < 1 ? 'text-red-500' : 'text-black'}`}>
                                                {user.credits}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
