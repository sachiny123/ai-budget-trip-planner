import { useState } from "react";
import { motion } from "framer-motion";
import { motion } from "framer-motion";
import { api } from "../services/api-service";
import { useAuth } from "../context/AuthContext";
import PaymentModal from "../components/PaymentModal";

export default function Pricing() {
    const { currentUser, userData } = useAuth();
    const [selectedTier, setSelectedTier] = useState(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const handlePurchaseSuccess = async () => {
        if (!selectedTier || !currentUser) return;

        try {
            await api.updateCredits(currentUser.uid, selectedTier.credits);
        } catch (err) {
            console.error("Purchase failed:", err);
            alert("Payment recorded but sync failed!");
        }
    };

    const handleTierSelect = (tier) => {
        if (!currentUser) return alert("Please login first");
        setSelectedTier(tier);
        setIsPaymentOpen(true);
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
                    <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-full inline-block text-[10px] font-black uppercase tracking-widest border border-orange-100 mb-8">
                        ⚠️ Simulated Store: No real payments or charges apply
                    </div>
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
                                onClick={() => handleTierSelect(tier)}
                                className="w-full py-5 bg-black text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg"
                            >
                                Get {tier.credits} Credits
                            </button>
                        </motion.div>
                    ))}
                </div>

                <PaymentModal
                    isOpen={isPaymentOpen}
                    onClose={() => setIsPaymentOpen(false)}
                    onSuccess={handlePurchaseSuccess}
                    amount={selectedTier?.price.replace('₹', '') || 0}
                    mode="REFILL"
                />

                <p className="mt-24 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    Simulated Payment System • No real charges apply in this demo
                </p>
            </div>
        </div>
    );
}
