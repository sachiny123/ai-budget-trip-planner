import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentModal({ isOpen, onClose, onSuccess, amount, mode = "BOOKING" }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePay = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        const res = await loadRazorpay();

        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            setIsProcessing(false);
            return;
        }

        try {
            // Create Order on Backend
            const response = await fetch("http://localhost:5000/api/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ amount }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const order = await response.json();

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "TripWise",
                description: "TripWise Booking Payment",
                image: "https://your-logo-url.com/logo.png", // Replace with your logo
                order_id: order.id,
                handler: function (response) {
                    // console.log(response.razorpay_payment_id);
                    // console.log(response.razorpay_order_id);
                    // console.log(response.razorpay_signature);

                    // Here you would typically verify the payment on the backend
                    // For now, we assume success as per instructions
                    setIsProcessing(false);
                    setIsSuccess(true);
                    setTimeout(() => {
                        onSuccess();
                        onClose();
                        setIsSuccess(false);
                    }, 1500);
                },
                prefill: {
                    name: "User Name", // You might want to pass this as a prop
                    email: "user@example.com",
                    contact: "9999999999",
                },
                notes: {
                    address: "Razorpay Corporate Office",
                },
                theme: {
                    color: "#000000",
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Payment Error:", error);
            alert("Payment failed or cancelled. Please try again.");
            setIsProcessing(false);
        }
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
                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Payment Successful</h2>
                            <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">
                                {mode === "REFILL" ? "Credits added" : "Booking Confirmed"}
                            </p>
                        </div>
                    ) : (
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black uppercase tracking-widest">
                                    Secure Payment
                                </h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl mb-6">
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-tight">
                                    ⚠️ Test Mode Enabled <br />
                                    Use Razorpay Test Card Details.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Amount</span>
                                <span className="text-3xl font-black">₹{amount}</span>
                            </div>

                            <button
                                onClick={handlePay}
                                disabled={isProcessing}
                                className="w-full py-5 bg-black text-white font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all disabled:bg-gray-200 disabled:text-gray-400 mt-4 overflow-hidden relative shadow-2xl"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    `Pay ₹${amount}`
                                )}
                            </button>

                            <div className="flex justify-center gap-4 mt-6 opacity-50 grayscale hover:grayscale-0 transition-all">
                                {/* Simple placeholders for credibility, optional */}
                                <div className="h-4 w-8 bg-gray-300 rounded"></div>
                                <div className="h-4 w-8 bg-gray-300 rounded"></div>
                                <div className="h-4 w-8 bg-gray-300 rounded"></div>
                            </div>

                            <p className="text-[9px] text-gray-400 text-center mt-6 uppercase tracking-widest leading-relaxed">
                                Secured by Razorpay <br />
                                Mock transaction for testing.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
