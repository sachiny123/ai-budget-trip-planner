import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { currentUser, userData, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            console.error("Failed to log out", err);
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link to="/" className="text-xl font-black uppercase tracking-tighter text-black">
                    TripWise
                </Link>

                <div className="flex items-center space-x-8">
                    {currentUser ? (
                        <>
                            <div className="hidden md:flex items-center space-x-6 text-xs font-bold uppercase tracking-widest text-black/60">
                                <Link to="/plan" className="hover:text-black transition-colors">Plan</Link>
                                <Link to="/dashboard" className="hover:text-black transition-colors">My Trips</Link>
                                <Link to="/pricing" className="hover:text-black transition-colors">Refill</Link>
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
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-black/60 hover:text-black">
                                Login
                            </Link>
                            <Link to="/signup" className="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all">
                                Join
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
