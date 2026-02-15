import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const { currentUser, userData, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            setIsMenuOpen(false);
            navigate("/login");
        } catch (err) {
            console.error("Failed to log out", err);
        }
    };

    const navLinks = [
        { name: "Plan", path: "/plan" },
        { name: "Bookings", path: "/bookings" },
        { name: "My Trips", path: "/dashboard" },
        { name: "Refill", path: "/pricing" },
    ];

    // Add Admin link if user is admin
    if (currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL || currentUser?.email === "admin@tripwise.com") {
        navLinks.push({ name: "Admin", path: "/admin", special: true });
    }

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link to="/" className="text-xl font-black uppercase tracking-tighter text-black">
                    TripWise
                </Link>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center space-x-8">
                    {currentUser ? (
                        <>
                            <div className="flex items-center space-x-6 text-xs font-bold uppercase tracking-widest text-black/60">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`hover:text-black transition-colors ${link.special ? 'underline decoration-2 underline-offset-4 text-black' : ''}`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>

                            <div className="flex items-center space-x-6 pl-6 border-l border-black/10">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Credits</span>
                                    <span className="text-sm font-black text-black leading-none">{userData?.credits ?? 0}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="hidden md:flex items-center gap-8">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-200 px-3 py-1 rounded-full">
                                Simulated Platform
                            </span>
                            <Link to="/" className="text-xs font-bold hover:text-gray-500 uppercase tracking-widest">Home</Link>
                            <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-black/60 hover:text-black">
                                Login
                            </Link>
                            <Link to="/signup" className="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all">
                                Join
                            </Link>
                        </div>
                    )}
                </div>

                {/* MOBILE TOGGLE */}
                <button
                    className="md:hidden flex flex-col space-y-1.5 p-2 -mr-2 hover:bg-black/5 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle Menu"
                >
                    <div className="w-6 h-0.5 bg-black" />
                    <div className="w-6 h-0.5 bg-black" />
                    <div className="w-6 h-0.5 bg-black" />
                </button>
            </div>

            {/* MOBILE MENU DRAWER */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 h-full w-[80%] max-w-xs bg-white z-[70] p-12 flex flex-col shadow-2xl"
                        >
                            <button
                                className="self-end mb-16 text-xs font-bold uppercase tracking-widest"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Close [×]
                            </button>

                            <div className="flex flex-col space-y-8 mb-auto">
                                {currentUser ? (
                                    <>
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={`text-2xl font-black uppercase tracking-tighter ${link.special ? 'line-through decoration-white' : ''}`}
                                            >
                                                {link.name}
                                            </Link>
                                        ))}
                                        <div className="pt-8 border-t border-black/5 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Balance</span>
                                                <span className="text-xl font-black text-black">{userData?.credits ?? 0} Coins</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter">Login</Link>
                                        <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter">Join</Link>
                                    </>
                                )}
                            </div>

                            {currentUser && (
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-5 bg-black text-white font-bold uppercase text-xs tracking-[0.2em] rounded-full mt-8"
                                >
                                    Logout
                                </button>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
