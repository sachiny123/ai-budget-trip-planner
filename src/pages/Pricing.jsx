import { db } from "../firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Pricing() {
    const { currentUser, userData } = useAuth();
    const [loading, setLoading] = useState(null);

    const handlePurchase = async (amount, priceId) => {
        if (!currentUser) return alert("Please login first");

        try {
            setLoading(priceId);
            // Simulate Payment Delay
            await new Promise(r => setTimeout(r, 1500));

            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                credits: increment(amount)
            });

            alert(`Success! ${amount} Credits added to your account.`);
        } catch (err) {
            console.error("Purchase failed:", err);
        } finally {
            setLoading(null);
        }
    };

    const tiers = [
        {
            id: "lite",
            name: "Lite",
            credits: 5,
            price: "₹99",
            description: "Perfect for a single weekend getaway.",
            popular: false
        },
        {
            id: "pro",
            name: "Explorer",
            credits: 15,
            price: "₹249",
            description: "Best for frequent travelers and families.",
            popular: true
        },
        {
            id: "unlimited",
            name: "Infinite",
            credits: 50,
            price: "₹699",
            description: "Unlimited planning for professional nomads.",
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-white text-black p-6 md:p-16">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-16 md:mb-24">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 block">
                        Monetization
                    </span>
                    <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-6">Refill Credits</h1>
                    <p className="text-gray-500 font-medium uppercase tracking-widest text-xs">
                        Current Balance: <span className="text-black">{userData?.credits ?? 0} Coins</span>
                    </p>
                </header>

                <div className="grid md:grid-cols-3 gap-8">
                    {tiers.map((tier) => (
                        <motion.div
                            key={tier.id}
                            whileHover={{ y: -10 }}
                            className={`relative p-12 border-2 ${tier.popular ? 'border-black' : 'border-black/5'} rounded-[3rem] flex flex-col justify-between`}
                        >
                            {tier.popular && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                                    Most Popular
                                </span>
                            )}

                            <div>
                                <h3 className="text-xl font-bold uppercase tracking-widest mb-2">{tier.name}</h3>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-5xl font-black tracking-tighter">{tier.price}</span>
                                    <span className="text-gray-400 font-bold uppercase text-[10px]">/ {tier.credits} Trips</span>
                                </div>
                                <p className="text-gray-500 text-sm font-medium mb-12">{tier.description}</p>
                            </div>

                            <button
                                onClick={() => handlePurchase(tier.credits, tier.id)}
                                disabled={loading !== null}
                                className={`w-full py-5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${tier.popular ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black border-2 border-black hover:bg-black hover:text-white'
                                    } disabled:opacity-50`}
                            >
                                {loading === tier.id ? "Processing..." : `Get ${tier.credits} Credits`}
                            </button>
                        </motion.div>
                    ))}
                </div>

                <p className="mt-24 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    Simulated Payment System • No real charges apply in this demo
                </p>
            </div>
        </div>
    );
}
