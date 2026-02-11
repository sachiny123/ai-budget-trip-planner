import { useRef, useState, forwardRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Signup() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const { signup, loginWithGoogle } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError("Passwords do not match");
        }

        try {
            setError("");
            setLoading(true);
            await signup(emailRef.current.value, passwordRef.current.value);
            navigate("/plan");
        } catch {
            setError("Failed to create an account");
        }

        setLoading(false);
    }

    async function handleGoogleLogin() {
        try {
            setError("");
            setLoading(true);
            await loginWithGoogle();
            navigate("/plan");
        } catch (err) {
            console.error("Google Login Error:", err);
            setError(err.message || "Failed to log in with Google");
        }
        setLoading(false);
    }

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join TripWise Today"
            alternativeLink="/login"
            alternativeText="Already a member?"
        >
            {error && (
                <div className="bg-gray-50 border-l-4 border-black p-4 text-black text-xs font-bold uppercase tracking-wide">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Email"
                    type="email"
                    ref={emailRef}
                    placeholder="name@example.com"
                />
                <Input
                    label="Password"
                    type="password"
                    ref={passwordRef}
                    placeholder="••••••••"
                />
                <Input
                    label="Confirm Password"
                    type="password"
                    ref={passwordConfirmRef}
                    placeholder="••••••••"
                />

                <button
                    disabled={loading}
                    className="w-full py-4 bg-black text-white font-bold text-xs uppercase tracking-[0.15em] hover:bg-gray-900 transition-all mt-4 disabled:opacity-50"
                >
                    {loading ? "Processing..." : "Sign Up"}
                </button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                    <span className="px-4 bg-white text-gray-400">Or</span>
                </div>
            </div>

            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-black text-black font-bold text-xs uppercase tracking-[0.15em] hover:bg-gray-50 transition-all"
            >
                Join with Google
            </button>
        </AuthLayout>
    );
}

const Input = forwardRef(({ label, ...props }, ref) => {
    return (
        <div className="space-y-2">
            <label className="block text-xs font-bold text-black uppercase tracking-widest">{label}</label>
            <input
                {...props}
                ref={ref}
                required
                className="w-full border-b-2 border-gray-200 py-3 text-black font-medium focus:border-black focus:outline-none transition-colors placeholder-gray-300 bg-white"
            />
        </div>
    )
});

