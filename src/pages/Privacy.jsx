export default function Privacy() {
    return (
        <div className="min-h-screen bg-white text-black p-10 md:p-24 font-sans max-w-4xl mx-auto">
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-12">Privacy Policy</h1>
            <div className="space-y-8 text-stone-600 leading-relaxed">
                <section>
                    <h2 className="text-xl font-black text-black uppercase mb-4">1. Data Collection</h2>
                    <p>We collect your email and name via Firebase Authentication to personalize your itineraries and sync your travel plans across devices.</p>
                </section>
                <section>
                    <h2 className="text-xl font-black text-black uppercase mb-4">2. AI Processing</h2>
                    <p>Travel data you provide is processed by AI models (Google Gemini) to generate itineraries. No personally identifiable information is sent to AI models.</p>
                </section>
                <section>
                    <h2 className="text-xl font-black text-black uppercase mb-4">3. Third Parties</h2>
                    <p>We use Razorpay for secure payments and Unsplash for imagery. Your payment details never touch our servers.</p>
                </section>
                <section>
                    <h2 className="text-xl font-black text-black uppercase mb-4">4. Your Rights</h2>
                    <p>You can delete your account and all associated trips at any time via the User Dashboard.</p>
                </section>
            </div>
            <div className="mt-20 pt-10 border-t border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-300">
                Last Updated: February 2026 • TripWise Platform
            </div>
        </div>
    );
}
