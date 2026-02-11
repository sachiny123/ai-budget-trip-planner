import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentModal({ isOpen, onClose, onSuccess, amount, mode = "BOOKING" }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("card"); // "card" or "upi"

    const handlePay = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate payment processing delay
        await new Promise(r => setTimeout(r, 2000));

        setIsProcessing(false);
        setIsSuccess(true);

        // Show success for 1.5s then trigger callback
        setTimeout(() => {
            onSuccess();
            onClose();
            setIsSuccess(false);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                >
                    {isSuccess ? (
                        <div className="p-12 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Simulation Success</h2>
                            <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">
                                {mode === "REFILL" ? "Credits added (Simulated)" : "Action Confirmed (Test Mode)"}
                            </p>
                        </div>
                    ) : (
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black uppercase tracking-widest">
                                    Demo Payment
                                </h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6">
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-tight">
                                    ⚠️ Testing Mode Only <br />
                                    No real money will be charged. <br />
                                    No real flight or hotel will be booked.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total (Test)</span>
                                <span className="text-3xl font-black">₹{amount}</span>
                            </div>

                            {/* Payment Tabs */}
                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={() => setPaymentMethod("card")}
                                    className={`flex-1 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${paymentMethod === 'card' ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    Card
                                </button>
                                <button
                                    onClick={() => setPaymentMethod("upi")}
                                    className={`flex-1 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${paymentMethod === 'upi' ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    UPI
                                </button>
                            </div>

                            <form onSubmit={handlePay} className="space-y-4">
                                {paymentMethod === "card" ? (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Card Number (Mock)</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="4444 4444 4444 4444"
                                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:border-black outline-none transition-all font-mono"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                required
                                                type="text"
                                                placeholder="MM/YY"
                                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:border-black outline-none transition-all font-mono"
                                            />
                                            <input
                                                required
                                                type="text"
                                                placeholder="CVC"
                                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:border-black outline-none transition-all font-mono"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">UPI ID (Mock)</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="traveler@upi"
                                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:border-black outline-none transition-all font-mono"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full py-5 bg-black text-white font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all disabled:bg-gray-200 disabled:text-gray-400 mt-4 overflow-hidden relative shadow-2xl"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Simulating...
                                        </div>
                                    ) : (
                                        `Simulate Pay ₹${amount}`
                                    )}
                                </button>
                            </form>

                            <p className="text-[9px] text-gray-400 text-center mt-6 uppercase tracking-widest leading-relaxed">
                                This is a test gateway. <br />
                                No actual transactions will occur.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
