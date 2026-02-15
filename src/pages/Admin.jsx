import { useState, useEffect } from "react";
import { api } from "../services/api-service";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Admin() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalTrips: 0,
        totalRevenue: 0,
        popularDestinations: [],
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

    const formatDate = (dateValue) => {
        if (!dateValue) return "N/A";
        // Handle Firestore Timestamp (seconds)
        if (dateValue.seconds) {
            return new Date(dateValue.seconds * 1000).toLocaleDateString();
        }
        // Handle ISO String or Date object
        return new Date(dateValue).toLocaleDateString();
    };

    const fetchAdminStats = async () => {
        try {
            setLoading(true);

            // Fetch Users
            const userData = await api.getAllUsers();

            // Fetch Trips
            const tripData = await api.getAllTrips();

            // CALCULATE ANALYTICS
            let revenue = 0;
            const destCounts = {};
            const uniqueUserIds = new Set();

            tripData.forEach(trip => {
                // Revenue (Approx based on budget)
                const budgetVal = Number(trip.budget) || 0;
                revenue += budgetVal;

                // Popular Destinations
                const dest = trip.destination ? trip.destination.trim() : "Unknown";
                destCounts[dest] = (destCounts[dest] || 0) + 1;

                // Active Users
                if (trip.userId) uniqueUserIds.add(trip.userId);
            });

            // Sort Destinations
            const sortedDestinations = Object.entries(destCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3) // Top 3
                .map(([name, count]) => ({ name, count }));

            // Recent Trips (already sorted from backend limit 100)
            const recentTrips = tripData.slice(0, 5);

            setStats({
                totalUsers: userData.length,
                activeUsers: uniqueUserIds.size,
                totalTrips: tripData.length,
                totalRevenue: revenue,
                popularDestinations: sortedDestinations,
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
                        <div className="grid md:grid-cols-4 gap-6 md:gap-8 text-white">
                            <div className="bg-black text-white p-8 rounded-[2.5rem] flex flex-col justify-between h-56">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Total Revenue (Est)</span>
                                <span className="text-4xl font-black tracking-tighter">₹{(stats.totalRevenue / 100000).toFixed(1)}L</span>
                            </div>
                            <div className="bg-white text-black border-2 border-black p-8 rounded-[2.5rem] flex flex-col justify-between h-56">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Trips</span>
                                <span className="text-6xl font-black tracking-tighter">{stats.totalTrips}</span>
                            </div>
                            <div className="bg-black text-white p-8 rounded-[2.5rem] flex flex-col justify-between h-56">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Active / Total Users</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-black tracking-tighter">{stats.activeUsers}</span>
                                    <span className="text-xl text-gray-500">/ {stats.totalUsers}</span>
                                </div>
                            </div>
                            <div className="bg-gray-100 text-black p-8 rounded-[2.5rem] flex flex-col justify-between h-56">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Top Destinations</span>
                                <div className="space-y-2">
                                    {stats.popularDestinations.map((d, i) => (
                                        <div key={i} className="flex justify-between text-sm font-bold uppercase">
                                            <span>{i + 1}. {d.name}</span>
                                            <span className="text-gray-400">{d.count}</span>
                                        </div>
                                    ))}
                                </div>
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
                                            <th className="py-4 px-2">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentTrips.map(trip => (
                                            <tr key={trip.id} className="border-b border-gray-100 text-sm">
                                                <td className="py-4 px-2 font-bold uppercase">{trip.destination}</td>
                                                <td className="py-4 px-2 text-gray-500 uppercase">{trip.tripType}</td>
                                                <td className="py-4 px-2 text-black font-black">₹{trip.budget}</td>
                                                <td className="py-4 px-2 text-gray-400 text-xs">
                                                    {formatDate(trip.createdAt)}
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
