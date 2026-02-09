import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Signup() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const { signup } = useAuth();
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

