import { useState } from 'react';
import { motion } from 'framer-motion';
import { searchFlights, searchHotels } from '../services/transport-service';
import Navbar from '../components/Navbar';

export default function Bookings() {
    const [activeTab, setActiveTab] = useState('flights');
    const [loading, setLoading] = useState(false);
    const [flightResults, setFlightResults] = useState([]);
    const [searchParams, setSearchParams] = useState({
        origin: 'DEL',
        destination: 'BOM',
        date: '2025-12-25', // Default date for testing
        adults: 1
    });

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFlightResults([]);

        if (activeTab === 'flights') {
            const results = await searchFlights(searchParams.origin, searchParams.destination, searchParams.date, searchParams.adults);
            setFlightResults(results);
        }
        // Implement other tabs later
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-24 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">
                        Book Your Journey
                    </h1>
                    <p className="text-gray-500 uppercase tracking-widest font-bold text-sm">
                        Flights • Hotels • Trains • Buses
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-12 gap-4">
                    {['flights', 'hotels', 'trains', 'buses'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all ${activeTab === tab
                                ? 'bg-black text-white scale-105 shadow-xl'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search Form */}
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-sm mb-12">
                    {activeTab === 'flights' && (
                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-2">From (IATA)</label>
                                <input
                                    type="text"
                                    value={searchParams.origin}
                                    onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value.toUpperCase() })}
                                    className="w-full p-4 bg-white rounded-xl font-bold border border-gray-200 focus:border-black outline-none transition-all placeholder:text-gray-300"
                                    placeholder="DEL"
                                    maxLength={3}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-2">To (IATA)</label>
                                <input
                                    type="text"
                                    value={searchParams.destination}
                                    onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value.toUpperCase() })}
                                    className="w-full p-4 bg-white rounded-xl font-bold border border-gray-200 focus:border-black outline-none transition-all placeholder:text-gray-300"
                                    placeholder="BOM"
                                    maxLength={3}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-2">Date</label>
                                <input
                                    type="date"
                                    value={searchParams.date}
                                    onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                                    className="w-full p-4 bg-white rounded-xl font-bold border border-gray-200 focus:border-black outline-none transition-all"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full p-4 bg-black text-white rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Searching...' : 'Search Flights'}
                                </button>
                            </div>
                        </form>
                    )}
                    {/* Placeholders for other tabs */}
                    {activeTab === 'hotels' && <div className="text-center text-gray-400 py-10 font-bold">Hotel Search Coming Soon</div>}
                    {activeTab === 'trains' && <div className="text-center text-gray-400 py-10 font-bold">Train Search Coming Soon</div>}
                    {activeTab === 'buses' && <div className="text-center text-gray-400 py-10 font-bold">Bus Search Coming Soon</div>}
                </div>

                {/* Results */}
                <div className="space-y-4">
                    {flightResults && flightResults.length > 0 ? (
                        flightResults.map((offer, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={offer.id}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center group"
                            >
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <span className="text-xs font-black bg-black text-white px-2 py-1 rounded">
                                            {offer.itineraries[0].segments[0].carrierCode}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            {offer.itineraries[0].duration.replace('PT', '').toLowerCase()}
                                        </span>
                                    </div>
                                    <div className="flex gap-8 items-center">
                                        <div>
                                            <p className="text-2xl font-black">
                                                {offer.itineraries[0].segments[0].departure.at.split('T')[1].substr(0, 5)}
                                            </p>
                                            <p className="text-xs font-bold text-gray-400">{searchParams.origin}</p>
                                        </div>
                                        <div className="flex-1 h-px bg-gray-200 w-24 relative">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black">
                                                {offer.itineraries[0].segments[0].arrival.at.split('T')[1].substr(0, 5)}
                                            </p>
                                            <p className="text-xs font-bold text-gray-400">{searchParams.destination}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-3xl font-black mb-2">
                                        {offer.price.currency} {offer.price.total}
                                    </p>
                                    <button className="bg-black text-white px-6 py-2 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
                                        Select
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        !loading && activeTab === 'flights' && searchParams.origin && (
                            <div className="text-center py-20 opacity-50">
                                <p className="font-bold text-gray-400 uppercase tracking-widest">No flights found or search not initiated</p>
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
}
