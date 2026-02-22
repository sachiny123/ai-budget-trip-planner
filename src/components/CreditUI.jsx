import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CreditBadge({ credits }) {
    return (
        <div className="flex items-center gap-2 bg-stone-100 px-4 py-2 rounded-full border border-stone-200">
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Credits</span>
            <span className={`text-sm font-black ${credits > 0 ? 'text-black' : 'text-red-500'}`}>
                {credits}
            </span>
            {credits === 0 && (
                <span className="animate-ping w-2 h-2 rounded-full bg-red-500" />
            )}
        </div>
    );
}

export function UsageWarning({ show, onClose, onUpgrade }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6"
                >
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={onClose} />
                    <div className="relative bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl text-center">
                        <span className="text-5xl mb-6 block">⚡</span>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-black">Adventure Limit reached</h2>
                        <p className="text-stone-500 font-medium mb-8 leading-relaxed">
                            Your 3 free credits helped start the journey. To keep exploring more clusters, you'll need a refill.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={onUpgrade}
                                className="w-full py-5 bg-black text-white text-xs font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl"
                            >
                                Refill My Credits →
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 text-stone-400 text-[10px] font-black uppercase tracking-widest hover:text-black transition-colors"
                            >
                                Maybe Later
                            </button>
                        </div>

                        <div className="mt-10 pt-8 border-t border-stone-100">
                            <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">
                                Support a student project 🎓
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
