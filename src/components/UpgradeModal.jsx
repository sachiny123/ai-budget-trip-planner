import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api-service';
import { useAuth } from '../context/AuthContext';

export default function UpgradeModal({ show, onClose }) {
    const { currentUser } = useAuth();
    const [method, setMethod] = useState('upi'); // 'upi' or 'form'
    const [amount, setAmount] = useState(10);
    const [txnId, setTxnId] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.submitUpgradeRequest(currentUser.uid, {
                method,
                amountRequested: amount,
                paymentRef: txnId,
                email: currentUser.email
            });
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            alert("Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <ModalLayout show={show} onClose={onClose}>
                <div className="text-center py-10">
                    <span className="text-6xl mb-6 block">✅</span>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Request Logged</h2>
                    <p className="text-stone-500 font-medium mb-10">
                        We've received your data sync. Our analysts will verify the transaction and boost your credits within 1 hour.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-5 bg-black text-white text-xs font-black uppercase tracking-widest rounded-full"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </ModalLayout>
        );
    }

    return (
        <ModalLayout show={show} onClose={onClose}>
            <div className="flex flex-col h-full">
                <header className="mb-8">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-2 block">Premium Augmentation</span>
                    <h2 className="text-4xl font-black uppercase tracking-tighter">Fuel Your Journey</h2>
                </header>

                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setMethod('upi')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-full border-2 transition-all ${method === 'upi' ? 'bg-black text-white border-black' : 'border-stone-100 text-stone-300'}`}
                    >
                        ⚡ UPI Refill
                    </button>
                    <button
                        onClick={() => setMethod('form')}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-full border-2 transition-all ${method === 'form' ? 'bg-black text-white border-black' : 'border-stone-100 text-stone-300'}`}
                    >
                        💬 Contact Us
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4 text-center">Select Credit Volume</label>
                        <div className="grid grid-cols-3 gap-4">
                            {[10, 25, 50].map(val => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setAmount(val)}
                                    className={`py-4 rounded-2xl border-2 transition-all ${amount === val ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-stone-50 text-stone-300 hover:border-black'}`}
                                >
                                    <span className="block text-xl font-black">{val}</span>
                                    <span className="text-[8px] font-bold uppercase tracking-tighter">Credits</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-[10px] font-bold text-stone-300 mt-4 italic">
                            Approx. ₹{(amount * 5).toLocaleString()} (Standard SaaS Pricing)
                        </p>
                    </div>

                    {method === 'upi' ? (
                        <div className="bg-stone-50 p-8 rounded-[2rem] border border-stone-100">
                            <div className="text-center mb-8">
                                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">1. Scan & Pay across any UPI App</p>
                                <div className="bg-white p-4 rounded-3xl shadow-sm inline-block mb-4 border border-stone-100">
                                    <img
                                        src="/phonepe-scanner.jpeg"
                                        alt="PhonePe Scanner"
                                        className="w-48 h-48 object-contain rounded-xl mx-auto"
                                        onError={(e) => {
                                            e.target.src = "https://placeholder.pics/svg/300/E7E7E7/8B8B8B/SCAN%20QR";
                                        }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">Or transfer to VPA</p>
                                    <code className="bg-white px-4 py-2 rounded-lg border border-stone-200 font-bold block text-sm select-all">
                                        {import.meta.env.VITE_UPI_ID || "9354086722123@ybl"}
                                    </code>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 text-center">2. Enter 12-Digit Transaction ID (UTR)</p>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 4023..."
                                    value={txnId}
                                    onChange={(e) => setTxnId(e.target.value)}
                                    className="w-full bg-white border-b-2 border-stone-200 px-4 py-4 text-center font-black uppercase text-xs focus:border-black outline-none transition-all"
                                />
                                <p className="text-[9px] font-bold text-stone-300 text-center uppercase tracking-tighter italic">
                                    Credits will be added after admin verification
                                </p>
                            </div>
                        </div>
                    ) : (
                        <textarea
                            required
                            placeholder="Tell us about your requirements or request a custom plan..."
                            className="w-full bg-stone-50 border border-stone-100 rounded-[2rem] p-6 text-sm font-medium h-32 focus:border-black outline-none transition-all"
                            value={txnId}
                            onChange={(e) => setTxnId(e.target.value)}
                        />
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-xl transition-all ${loading ? 'bg-stone-100 text-stone-300' : 'bg-black text-white hover:scale-[1.02]'}`}
                    >
                        {loading ? 'Processing Connection...' : 'Confirm Submission →'}
                    </button>
                </form>
            </div>
        </ModalLayout>
    );
}

function ModalLayout({ show, onClose, children }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8"
                >
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-md" onClick={onClose} />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white w-full max-w-xl max-h-[90vh] rounded-[3rem] shadow-2xl relative z-10 p-10 md:p-12 overflow-y-auto"
                    >
                        <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center hover:bg-stone-100 transition-all">
                            <svg className="w-5 h-5 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
