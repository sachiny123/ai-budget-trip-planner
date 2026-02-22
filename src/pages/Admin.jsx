import { useState, useEffect } from "react";
import { api } from "../services/api-service";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Admin() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalTrips: 0,
        totalRevenue: 0,
        popularDestinations: [],
        recentTrips: [],
        users: [],
        tripTypeBreakdown: {},
        bookings: [],
        revenueHistory: [] // Last 7 days
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [tripSearchTerm, setTripSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [userTrips, setUserTrips] = useState([]);
    const [loadingUserTrips, setLoadingUserTrips] = useState(false);

    // SECURE CHECK
    const ADMIN_EMAILS = [import.meta.env.VITE_ADMIN_EMAIL, "admin@tripwise.com", "sachinyadav.py23@gmail.com"];
    const isAdmin = currentUser && (ADMIN_EMAILS.includes(currentUser.email));

    useEffect(() => {
        if (isAdmin) {
            fetchAdminStats();
        }
    }, [isAdmin]);

    const formatDate = (dateValue) => {
        if (!dateValue) return "N/A";
        const d = dateValue.seconds ? new Date(dateValue.seconds * 1000) : new Date(dateValue);
        return d.toLocaleDateString();
    };

    const fetchAdminStats = async () => {
        try {
            setLoading(true);
            const [userData, tripData, bookingData] = await Promise.all([
                api.getAllUsers(),
                api.getAllTrips(),
                api.getAllBookings()
            ]);

            // Revenue History (Last 7 Days)
            const revenueMap = {};
            const now = new Date();
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                revenueMap[date.toLocaleDateString()] = 0;
            }

            let totalRevenue = 0;
            bookingData.forEach(b => {
                const amount = Number(b.totalPaid || 0);
                totalRevenue += amount;

                if (b.bookedAt) {
                    const dateStr = formatDate(b.bookedAt);
                    if (revenueMap[dateStr] !== undefined) {
                        revenueMap[dateStr] += amount;
                    }
                }
            });

            const revenueHistory = Object.entries(revenueMap).map(([date, amount]) => ({ date, amount }));

            // Stats from Trip Data
            const destCounts = {};
            const typeCounts = {};
            const uniqueUserIds = new Set();

            tripData.forEach(trip => {
                const dest = trip.destination ? trip.destination.trim() : "Unknown";
                destCounts[dest] = (destCounts[dest] || 0) + 1;

                const type = trip.tripType || "Other";
                typeCounts[type] = (typeCounts[type] || 0) + 1;

                if (trip.userId) uniqueUserIds.add(trip.userId);
            });

            const sortedDestinations = Object.entries(destCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([name, count]) => ({ name, count }));

            setStats({
                totalUsers: userData.length,
                activeUsers: uniqueUserIds.size,
                totalTrips: tripData.length,
                totalRevenue: totalRevenue,
                popularDestinations: sortedDestinations,
                recentTrips: tripData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)),
                users: userData,
                tripTypeBreakdown: typeCounts,
                bookings: bookingData,
                revenueHistory
            });
        } catch (err) {
            console.error("Admin Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = async (user) => {
        setSelectedUser(user);
        try {
            setLoadingUserTrips(true);
            const trips = await api.getUserTrips(user.uid || user.id);
            setUserTrips(trips);
        } catch (err) {
            console.error("Error fetching user trips:", err);
        } finally {
            setLoadingUserTrips(false);
        }
    };

    const adjustCredits = async (uid, amount, e) => {
        e.stopPropagation();
        try {
            await api.updateCredits(uid, amount);
            setStats(prev => ({
                ...prev,
                users: prev.users.map(u => u.uid === uid ? { ...u, credits: (u.credits || 0) + amount } : u)
            }));
        } catch (err) {
            console.error("Error adjusting credits:", err);
        }
    };

    const filteredUsers = stats.users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredTrips = stats.recentTrips.filter(trip =>
        trip.destination?.toLowerCase().includes(tripSearchTerm.toLowerCase())
    );

    const groupedTrips = filteredTrips.reduce((acc, trip) => {
        const dest = trip.destination || "Unknown";
        if (!acc[dest]) {
            acc[dest] = {
                destination: dest,
                trips: [],
                totalBudget: 0,
                travellers: []
            };
        }
        acc[dest].trips.push(trip);
        acc[dest].totalBudget += Number(trip.budget || 0);

        const user = stats.users.find(u => u.uid === trip.userId);
        if (user && !acc[dest].travellers.some(t => t.uid === user.uid)) {
            acc[dest].travellers.push(user);
        }
        return acc;
    }, {});

    const groupedTripsArray = Object.values(groupedTrips).sort((a, b) => b.trips.length - a.trips.length);

    // GRAPH HELPER
    const maxRevenue = Math.max(...stats.revenueHistory.map(h => h.amount), 1);

    if (!isAdmin) return <Navigate to="/" />;

    return (
        <div className="min-h-screen bg-stone-50 text-black p-6 md:p-16 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-12 h-[2px] bg-orange-600"></span>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] block">Admin Intelligence</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Business Health</h1>
                    </div>
                </header>

                {loading ? (
                    <div className="py-20 text-center uppercase font-bold tracking-widest text-stone-400 animate-pulse">
                        Calculating Metrics...
                    </div>
                ) : (
                    <div className="space-y-12 md:space-y-16">

                        {/* REVENUE GRAPH & KEY STATS */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-black text-white p-10 rounded-[3rem] relative overflow-hidden group border border-black transition-all hover:shadow-2xl">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
                                    <div>
                                        <span className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-2 block">Revenue Flux</span>
                                        <h3 className="text-3xl font-black tracking-tighter italic uppercase text-orange-500">7-Day Transaction Flow</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-5xl font-black tracking-tighter">₹{stats.totalRevenue.toLocaleString()}</span>
                                        <span className="text-[10px] uppercase font-black block text-white/30">Total Gross Volume</span>
                                    </div>
                                </div>

                                <div className="h-48 flex items-end justify-between gap-4 relative z-10">
                                    {stats.revenueHistory.map((h, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                                            <div className="w-full relative">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${(h.amount / maxRevenue) * 100}%` }}
                                                    className="w-full bg-white/20 group-hover/bar:bg-orange-500 rounded-lg transition-all min-h-[4px]"
                                                />
                                                {h.amount > 0 && (
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-white text-black px-2 py-1 rounded text-[9px] font-black whitespace-nowrap">
                                                        ₹{h.amount}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[8px] font-bold opacity-30 rotate-45 md:rotate-0">{h.date.split('/')[0]}/{h.date.split('/')[1]}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px]" />
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col justify-between h-full hover:border-black transition-all">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">Total Reach</span>
                                    <div className="flex flex-col mb-8">
                                        <span className="text-7xl font-black tracking-tighter leading-none">{stats.totalTrips}</span>
                                        <span className="text-[10px] font-bold uppercase text-orange-600 tracking-[0.2em] mt-2">Planned Journeys</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-stone-50">
                                        <div>
                                            <span className="text-2xl font-black tracking-tighter">{stats.totalUsers}</span>
                                            <span className="text-[9px] font-bold uppercase block text-stone-300">Total Users</span>
                                        </div>
                                        <div>
                                            <span className="text-2xl font-black tracking-tighter">{stats.activeUsers}</span>
                                            <span className="text-[9px] font-bold uppercase block text-stone-300">Active Analysts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TRIP TYPE BREAKDOWN */}
                        <div className="grid md:grid-cols-4 gap-4">
                            {Object.entries(stats.tripTypeBreakdown).map(([type, count]) => (
                                <div key={type} className="bg-white p-6 rounded-[2rem] border border-stone-100 flex flex-col items-center justify-center text-center hover:border-black transition-all group">
                                    <span className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform">{count}</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">{type} Explorations</span>
                                </div>
                            ))}
                        </div>

                        {/* MASTER TRIP FEED */}
                        <section>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <h2 className="text-2xl font-black uppercase tracking-tight">Global Journey Clusters</h2>
                                <div className="relative w-full md:w-80">
                                    <input
                                        type="text"
                                        placeholder="Search by location..."
                                        value={tripSearchTerm}
                                        onChange={(e) => setTripSearchTerm(e.target.value)}
                                        className="w-full bg-white border border-stone-200 rounded-full px-10 py-3 text-xs font-bold focus:border-black outline-none transition-all shadow-sm"
                                    />
                                    <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-stone-50/50 border-b border-stone-100 text-[9px] font-black uppercase tracking-widest text-stone-400">
                                                <th className="py-6 px-10">Destination</th>
                                                <th className="py-6 px-4">Interested Travellers</th>
                                                <th className="py-6 px-4">Intelligence</th>
                                                <th className="py-6 px-4 text-right pr-10">Economic Impact</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-50">
                                            {groupedTripsArray.length > 0 ? groupedTripsArray.slice(0, 50).map(group => (
                                                <tr key={group.destination} className="hover:bg-stone-50/50 transition-colors group">
                                                    <td className="py-5 px-10 font-black uppercase text-xs tracking-tight">{group.destination}</td>
                                                    <td className="py-5 px-4">
                                                        <div className="flex -space-x-3 overflow-hidden">
                                                            {group.travellers.slice(0, 5).map((traveller, idx) => (
                                                                <div
                                                                    key={traveller.uid}
                                                                    title={traveller.displayName || traveller.email}
                                                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-stone-100 flex items-center justify-center text-[8px] font-black uppercase overflow-hidden"
                                                                >
                                                                    {traveller.photoURL ? <img src={traveller.photoURL} alt="" className="h-full w-full object-cover" /> : (traveller.displayName?.[0] || 'U')}
                                                                </div>
                                                            ))}
                                                            {group.travellers.length > 5 && (
                                                                <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-black text-white text-[8px] font-black">
                                                                    +{group.travellers.length - 5}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-black uppercase bg-stone-100 px-2 py-1 rounded">
                                                                {group.trips.length} {group.trips.length === 1 ? 'Trip' : 'Trips'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-10 text-right pr-10 text-xs font-black">₹{group.totalBudget?.toLocaleString()}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="py-20 text-center text-stone-300 font-bold uppercase text-[10px] tracking-widest">No matching journey clusters found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* COMMUNITY DIRECTORY */}
                        <section>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <h2 className="text-2xl font-black uppercase tracking-tight">Active User Registry</h2>
                                <div className="relative w-full md:w-80">
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white border border-stone-200 rounded-full px-10 py-3 text-xs font-bold focus:border-black outline-none transition-all shadow-sm"
                                    />
                                    <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredUsers.map(user => (
                                    <div
                                        key={user.uid || user.id}
                                        onClick={() => handleUserClick(user)}
                                        className="bg-white p-6 rounded-[2rem] border border-stone-100 hover:border-black transition-all cursor-pointer group shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-xl font-black text-stone-300 uppercase overflow-hidden">
                                                {user.photoURL ? <img src={user.photoURL} alt="" /> : (user.displayName?.[0] || 'U')}
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Credits</span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={(e) => adjustCredits(user.uid, -1, e)} className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50">-</button>
                                                    <span className="text-lg font-black">{user.credits || 0}</span>
                                                    <button onClick={(e) => adjustCredits(user.uid, 1, e)} className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50">+</button>
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="font-black uppercase tracking-tight truncate mb-1">{user.displayName || 'Anonymous Explorer'}</h3>
                                        <p className="text-stone-400 text-xs font-bold truncate mb-4">{user.email}</p>
                                        <div className="flex justify-between items-center pt-4 border-t border-stone-50">
                                            <span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">Joined {formatDate(user.createdAt)}</span>
                                            <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Analyze Activity →</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* USER DETAIL MODAL */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden relative z-10 flex flex-col font-sans"
                        >
                            <div className="p-8 md:p-12 border-b border-stone-100 flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 block">Explorer Intelligence</span>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">{selectedUser.displayName || selectedUser.email}</h2>
                                    <p className="text-stone-400 text-sm font-medium">{selectedUser.email}</p>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center hover:bg-stone-100 transition-all">
                                    <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 md:p-12">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-stone-300 flex items-center gap-4">
                                    <span className="w-8 h-px bg-stone-200"></span>
                                    Travel Portfolio ({userTrips.length})
                                </h3>

                                {loadingUserTrips ? (
                                    <div className="py-12 text-center text-stone-300 font-bold uppercase text-xs tracking-widest animate-pulse">Synchronizing Data...</div>
                                ) : userTrips.length > 0 ? (
                                    <div className="grid gap-4">
                                        {userTrips.map(trip => (
                                            <div key={trip.id} className="bg-stone-50 p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4 border border-stone-100 hover:border-black/5 transition-colors">
                                                <div>
                                                    <h4 className="text-xl font-black uppercase tracking-tight">{trip.destination}</h4>
                                                    <div className="flex items-center gap-3 text-[9px] font-black text-stone-300 uppercase tracking-widest mt-2">
                                                        <span className="bg-white px-2 py-1 rounded">{trip.tripType}</span>
                                                        <span className="bg-white px-2 py-1 rounded">{trip.travelStyle}</span>
                                                        <span>•</span>
                                                        <span>{formatDate(trip.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest mb-1">Estimated Budget</span>
                                                        <span className="font-black text-lg">₹{trip.budget?.toLocaleString()}</span>
                                                    </div>
                                                    {trip.isBooked && (
                                                        <span className="bg-orange-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Transaction Confirmed</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 border-2 border-dashed border-stone-100 rounded-[3rem] text-center text-stone-400 font-bold uppercase text-[10px] tracking-widest">This explorer has no journeys in our data sync</div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
