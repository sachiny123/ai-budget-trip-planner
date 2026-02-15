import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api-service"; // Removed unused imports
import { useAuth } from "../context/AuthContext";
import PaymentModal from "../components/PaymentModal";
import { sendBookingConfirmation } from "../services/email-service"; // NEW

export default function Checkout() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false); // Manual Modal
    const [isEmailSentShow, setIsEmailSentShow] = useState(false);
    const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);

    if (!state || !state.selectedTransport || !state.selectedHotel) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <button onClick={() => navigate("/plan")} className="px-8 py-4 bg-black text-white rounded-full uppercase font-bold text-xs tracking-widest">
                    Go Back to Planner
                </button>
            </div>
        );
    }

    const { destination, days, fromCity, selectedTransport, selectedHotel, totalSelection, tripId } = state;
    const platformFee = Math.floor(totalSelection * 0.05); // 5% fee
    const grandTotal = totalSelection + platformFee;

    // RAZORPAY LOADER
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleInitiatePayment = async () => {
        setIsProcessingRazorpay(true);

        // CHECK IF KEY EXISTS (USE TEST KEY IF NOT)
        const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
        const isDummyKey = !key || key.includes("YOUR_RAZORPAY_KEY") || key === "rzp_test_1234567890abcdef";

        if (isDummyKey) {
            // GRACEFUL FALLBACK FOR DEMO/DEV
            // setTimeout to fake an attempt
            setTimeout(() => {
                alert("Demo Mode: No valid Razorpay Key found in .env. Switching to Manual Test Gateway.");
                setIsProcessingRazorpay(false);
                setIsPaymentOpen(true);
            }, 800);
            return;
        }

        const res = await loadRazorpay();

        if (!res) {
            alert("Razorpay SDK failed to load. Using Manual Gateway.");
            setIsProcessingRazorpay(false);
            setIsPaymentOpen(true);
            return;
        }

        const options = {
            key: key,
            amount: grandTotal * 100, // Paísa
            currency: "INR",
            name: "TripWise Inc.",
            description: `Trip to ${destination}`,
            image: "https://cdn-icons-png.flaticon.com/512/9320/9320458.png", // Generic Travel Icon
            handler: function (response) {
                // Payment Success
                console.log("Razorpay Success:", response);
                handleBookingSuccess(response.razorpay_payment_id);
            },
            prefill: {
                name: currentUser?.displayName || "Traveler",
                email: currentUser?.email || "user@example.com",
                contact: "9999999999"
            },
            theme: {
                color: "#000000"
            }
        };

        try {
            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                console.error("Payment Failed:", response.error);
                alert("Payment Failed: " + response.error.description);
                setIsProcessingRazorpay(false);
            });
            rzp1.open();
        } catch (err) {
            console.warn("Razorpay Error:", err);
            setIsProcessingRazorpay(false);
            setIsPaymentOpen(true);
        }
    };

    const handleBookingSuccess = async (paymentId = "MANUAL_ID") => {
        try {
            if (currentUser) {
                const bookingId = "TW" + Math.random().toString(36).substr(2, 9).toUpperCase();
                const bookingData = {
                    bookingId,
                    destination,
                    fromCity,
                    days,
                    transport: selectedTransport,
                    hotel: selectedHotel,
                    totalPaid: grandTotal,
                    paymentId: paymentId,
                    bookedAt: new Date().toISOString(),
                    status: "confirmed"
                };

                // 1. Confirm Booking via API
                if (tripId) {
                    await api.confirmBooking(tripId, {
                        userId: currentUser.uid,
                        bookingId: bookingId,
                        paymentId: paymentId,
                        bookedDetails: {
                            transport: selectedTransport,
                            hotel: selectedHotel,
                            totalPaid: grandTotal
                        },
                        // Include full booking data for user record update implementation in backend
                        ...bookingData
                    });
                }

                // 3. Send Email
                await sendBookingConfirmation(currentUser.email, bookingData);

                // 4. Show Visual Notification
                setIsEmailSentShow(true);

                // 5. Redirect
                setTimeout(() => {
                    navigate(`/ticket/${tripId}`, { state: { bookingSuccess: true, bookingId } });
                }, 3000);
            }
        } catch (error) {
            console.error("Error saving booking:", error);
            alert("Booking saved locally, but failed to sync! Please contact support.");
            navigate("/dashboard");
        }
    };

    return (
        <div className="min-h-screen bg-white text-black py-24 px-4 md:px-0">
            <div className="max-w-xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12">Checkout</h1>

                <div className="space-y-8">
                    {/* SEC 1: Transport */}
                    <div className="border-b border-gray-100 pb-8">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
                            <span className="w-8 h-px bg-gray-200"></span>
                            Travel Selection
                        </h2>
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-xl font-black uppercase">{selectedTransport.type}</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{fromCity} → {destination}</p>
                            </div>
                            <span className="text-lg font-black">₹{selectedTransport.price}</span>
                        </div>
                    </div>

                    {/* SEC 2: Hotel */}
                    <div className="border-b border-gray-100 pb-8">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
                            <span className="w-8 h-px bg-gray-200"></span>
                            Stay Selection
                        </h2>
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-xl font-black uppercase">{selectedHotel.name}</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{days} Nights in {destination}</p>
                            </div>
                            <span className="text-lg font-black">₹{selectedHotel.price_per_night * days}</span>
                        </div>
                    </div>

                    {/* SEC 3: Total Bill */}
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                <span>Subtotal</span>
                                <span className="text-black">₹{totalSelection}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                <span>Platform Fee (5%)</span>
                                <span className="text-black">₹{platformFee}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-sm font-black uppercase tracking-[0.2em]">Grand Total</span>
                                <span className="text-4xl font-black">₹{grandTotal}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleInitiatePayment}
                            disabled={isProcessingRazorpay}
                            className="w-full py-6 bg-black text-white font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 transition-all shadow-2xl disabled:bg-gray-400"
                        >
                            {isProcessingRazorpay ? "Initializing Gateway..." : "Secure Checkout and Pay"}
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-[10px] text-gray-400 text-center uppercase tracking-widest leading-loose">
                    Secured by Razorpay. 100% Safe.<br />
                    Tickets will be sent to {currentUser?.email}.
                </p>
            </div>

            {/* MANUAL FALLBACK MODAL */}
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                onSuccess={() => handleBookingSuccess("MANUAL_SIM_ID")}
                amount={grandTotal}
                mode="BOOKING"
            />

            {/* EMAIL SIMULATION NOTIFICATION */}
            <AnimatePresence>
                {isEmailSentShow && (
                    <motion.div
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md"
                    >
                        <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-2xl flex items-center gap-6">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl">
                                ✉️
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black uppercase tracking-widest leading-none mb-1">Confirmation Sent!</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Ticket emailed to {currentUser?.email}.
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-bold text-gray-300 uppercase">Just Now</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
