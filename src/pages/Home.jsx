import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
  const word = "India";
const [typedText, setTypedText] = useState("");
const [isDeleting, setIsDeleting] = useState(false);
const [index, setIndex] = useState(0);

useEffect(() => {
  let timeout;

  if (!isDeleting && index < word.length) {
    // Typing
    timeout = setTimeout(() => {
      setTypedText(word.slice(0, index + 1));
      setIndex(index + 1);
    }, 150);
  } 
  else if (!isDeleting && index === word.length) {
    // Pause after full word
    timeout = setTimeout(() => {
      setIsDeleting(true);
    }, 5000); // ⏸️ 5 seconds pause
  } 
  else if (isDeleting && index > 0) {
    // Deleting
    timeout = setTimeout(() => {
      setTypedText(word.slice(0, index - 1));
      setIndex(index - 1);
    }, 80);
  } 
  else if (isDeleting && index === 0) {
    // Restart typing
    setIsDeleting(false);
  }

  return () => clearTimeout(timeout);
}, [index, isDeleting]);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen overflow-x-hidden bg-black">
      {/* ================= HERO ================= */}
      <section className="relative w-screen h-screen overflow-hidden">
        {/* Background */}
        <img
          src={images[current].src}
          alt={images[current].title}
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

        {/* Nav */}
        <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-10 py-6 z-20">
          <h1 className="text-2xl font-bold text-white">
            Trip<span className="text-indigo-400">Wise</span>
          </h1>

          {/* CTA text BLACK */}
          <Link
            to="/plan"
            className="px-6 py-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition"
          >
            Plan Trip
          </Link>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 h-full flex items-center px-10 md:px-24">
          <div className="max-w-2xl text-white animate-fade-slide">
            <p className="uppercase tracking-widest text-sm text-indigo-300 mb-4">
              AI Trip Planner for India
            </p>

            <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Discover{" "}
              <span className="text-indigo-400">
                {typedText}
                <span className="animate-blink">|</span>
              </span>
              <br />
              <span className="text-white/90">
                without breaking your budget
              </span>
            </h2>

            <p className="mt-6 text-lg text-gray-200">
              Personalized itineraries, real cost breakdowns, and instant
              planning powered by AI.
            </p>

            <div className="mt-10 flex gap-4">
              <Link
                to="/plan"
                className="px-8 py-4 rounded-xl bg-white text-black text-lg font-semibold shadow-xl hover:scale-105 transition"
              >
                Plan My Trip →
              </Link>
            </div>
          </div>
        </div>

        {/* Location selector */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`px-4 py-1 rounded-full text-sm ${
                current === index
                  ? "bg-indigo-600 text-white"
                  : "bg-white/20 text-white"
              }`}
            >
              {img.title}
            </button>
          ))}
        </div>
      </section>

      {/* ================= MIDDLE BLOCK ================= */}
      <section className="bg-white py-24 px-8">
        <h3 className="text-4xl font-extrabold text-center text-gray-900 mb-16">
          How TripWise Helps You
        </h3>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <Feature
            emoji="🧠"
            title="AI Powered Planning"
            desc="Our AI designs a complete day-wise itinerary tailored to your destination and budget."
          />
          <Feature
            emoji="💰"
            title="Budget Control"
            desc="Know exactly where your money goes — travel, stay, food & activities."
          />
          <Feature
            emoji="⚡"
            title="Instant Results"
            desc="No research. No confusion. Get your trip plan in seconds."
          />
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xl font-bold text-white mb-2">TripWise</h4>
            <p className="text-sm text-gray-400">
              Smart AI-powered trip planning for budget travelers in India.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-3">Product</h5>
            <ul className="space-y-2 text-sm">
              <li>How it works</li>
              <li>Destinations</li>
              <li>Pricing</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-3">Company</h5>
            <ul className="space-y-2 text-sm">
              <li>About</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-10">
          © {new Date().getFullYear()} TripWise. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function Feature({ emoji, title, desc }) {
  return (
    <div className="text-center p-8 rounded-2xl shadow-lg hover:shadow-2xl transition bg-white">
      <div className="text-4xl mb-4">{emoji}</div>
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
