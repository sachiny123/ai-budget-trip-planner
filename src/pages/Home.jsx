import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const images = [
  {
    src: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2",
    title: "Goa",
  },
  {
    src: "https://images.unsplash.com/photo-1712388430474-ace0c16051e2",
    title: "Manali",
  },
  {
    src: "https://plus.unsplash.com/premium_photo-1661963054563-ce928e477ff3",
    title: "Jaipur",
  },
  {
    src: "https://images.unsplash.com/photo-1652460816777-a58bf8ed1f08",
    title: "Kerala",
  },
  {
    src: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2",
    title: "Ladakh",
  },
];

export default function Home() {
  const [current, setCurrent] = useState(0);

  const { currentUser } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans overflow-x-hidden">
      {/* ================= HERO ================= */}
      <header className="relative w-full min-h-screen pt-12 pb-20 px-6 md:px-12 flex flex-col justify-center">

        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 z-10"
          >
            <div className="inline-block px-3 py-1 border border-black rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">
              AI-Powered Travel Planner
            </div>

            <h2 className="text-5xl md:text-8xl font-black leading-tight tracking-tighter uppercase">
              DISCOVER <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500">
                INDIA.
              </span>
            </h2>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
              <span className="w-4 h-[1px] bg-black/20"></span>
              Simulated Experience / Prototyping Demo
            </div>

            <p className="text-lg md:text-xl text-gray-600 max-w-md leading-relaxed">
              Experience the future of travel. Smart itineraries, real-time budgeting, and hidden gems—all curated by AI in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {currentUser ? (
                <>
                  <Link
                    to="/plan"
                    className="w-full sm:w-auto px-10 py-5 rounded-full bg-black text-white text-lg font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all text-center uppercase tracking-wide"
                  >
                    Generate Trip
                  </Link>
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-black border-2 border-black text-lg font-bold hover:bg-gray-50 active:scale-95 transition-all text-center uppercase tracking-wide"
                  >
                    My Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/plan"
                    className="w-full sm:w-auto px-10 py-5 rounded-full bg-black text-white text-lg font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all text-center uppercase tracking-wide"
                  >
                    Plan My Trip
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-black border-2 border-black text-lg font-bold hover:bg-gray-50 active:scale-95 transition-all text-center uppercase tracking-wide"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          {/* Image Slider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative h-[600px] w-full rounded-[2rem] overflow-hidden shadow-2xl"
          >
            <img
              src={images[current].src}
              alt={images[current].title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[4000ms] ease-linear scale-110"
              key={current} // Key change forces re-render for animation
            />
            <div className="absolute inset-0 bg-black/10" />

            {/* Location Tag */}
            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur px-6 py-3 rounded-xl border border-white/20">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Currently Dreaming of</p>
              <p className="text-2xl font-black text-black">{images[current].title}</p>
            </div>
          </motion.div>

        </div>
      </header>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-24 px-6 md:px-12 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-black uppercase tracking-tight mb-16 text-center text-black">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard number="01" title="Tell Us Your Dream" desc="Enter your destination, budget, and travel style." />
            <StepCard number="02" title="AI Magic Happens" desc="Our advanced algorithms craft the perfect day-wise plan." />
            <StepCard number="03" title="Pack & Go" desc="Download your itinerary PDF and start exploring." />
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-black text-white py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-black uppercase tracking-tight mb-16 text-center">
            Why TripWise?
          </h3>

          <div className="grid md:grid-cols-3 gap-12">
            <Feature
              title="AI Intelligence"
              desc="Forget generic lists. Get a trip plan that actually makes sense for your travel style."
            />
            <Feature
              title="Smart Budgeting"
              desc="We calculate every rupee. Flights, food, stay, and activities—all accounted for."
            />
            <Feature
              title="Instant Speed"
              desc="Ready to go in seconds. Just enter your destination and let our AI do the rest."
            />
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-black uppercase tracking-tight mb-16 text-black">
            Loved by Travelers
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <Testimonial
              text="I planned my entire Goa trip in 2 minutes. The budget estimates were spot on!"
              author="Rohan M."
              location="Mumbai"
            />
            <Testimonial
              text="TripWise suggested hidden cafes in Manali I would have never found on my own."
              author="Priya S."
              location="Delhi"
            />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20 bg-gray-50 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-5xl font-black mb-8 uppercase tracking-tighter">
            Ready to Explore?
          </h2>
          <Link
            to="/plan"
            className="inline-block px-12 py-5 rounded-full bg-black text-white text-xl font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
          >
            Start Planning Now
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white text-black py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-bold text-lg tracking-tighter">TRIPWISE.AI</p>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Designed with Minimalist Love.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="p-8 border border-white/20 rounded-3xl hover:bg-white/10 transition-colors">
      <div className="w-12 h-1 bg-white mb-8" />
      <h4 className="text-xl font-bold mb-4 uppercase tracking-wide">{title}</h4>
      <p className="text-gray-400 leading-relaxed font-light">{desc}</p>
    </div>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <div className="p-8 bg-white rounded-3xl border border-gray-100 hover:shadow-xl transition-shadow text-center">
      <div className="text-6xl font-black text-gray-100 mb-4">{number}</div>
      <h4 className="text-xl font-bold mb-2 uppercase tracking-wide">{title}</h4>
      <p className="text-gray-500">{desc}</p>
    </div>
  );
}

function Testimonial({ text, author, location }) {
  return (
    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 text-left">
      <p className="text-lg font-medium text-gray-800 italic mb-6">"{text}"</p>
      <div>
        <p className="font-bold text-black uppercase tracking-wide">{author}</p>
        <p className="text-xs text-gray-500">{location}</p>
      </div>
    </div>
  );
}
