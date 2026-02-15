import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { imageService } from "../services/image-service";

export default function TempleResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const { guide } = location.state || {};

    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (!guide) {
            navigate("/temples");
            return;
        }

        const loadImage = async () => {
            const url = await imageService.fetchImage(guide.name + " temple") || await imageService.fetchImage(guide.name);
            setImageUrl(url || imageService.fetchImagePlaceholder(guide.name + " temple"));
        };
        loadImage();
    }, [guide, navigate]);

    if (!guide) return null;

    return (
        <div className="min-h-screen bg-stone-50 text-black w-full font-sans pb-32">
            {/* HERO */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                <img
                    src={imageUrl || `https://loremflickr.com/1920/1080/temple,${guide.name}/all`}
                    alt={guide.name}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 mt-8 md:mt-0">
                    <span className="text-orange-400 font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs mb-4 border border-orange-400/50 px-4 py-1 rounded-full">{guide.location}</span>
                    <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 md:mb-6">{guide.name}</h1>
                    <p className="text-stone-300 max-w-2xl text-sm md:text-lg font-light leading-relaxed line-clamp-3 md:line-clamp-none">"{guide.overview}"</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-16 md:-mt-20 relative z-10">
                <div className="bg-white p-6 md:p-12 rounded-[2rem] shadow-2xl border border-stone-100">

                    {/* TIMINGS SECTION */}
                    <div className="mb-12">
                        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400 mb-6 flex items-center gap-4">
                            <span className="w-8 h-px bg-orange-400"></span>
                            Darshan & Timings
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                <span className="block text-orange-800/60 text-[10px] font-bold uppercase tracking-widest mb-2">Opening Hours</span>
                                <span className="text-lg md:text-xl font-black text-orange-900">{guide.timings?.opening}</span>
                            </div>
                            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                <span className="block text-orange-800/60 text-[10px] font-bold uppercase tracking-widest mb-2">Aarti / Seva</span>
                                <div className="flex flex-col gap-1">
                                    {guide.timings?.aarti?.map((t, i) => (
                                        <span key={i} className="text-sm font-bold text-orange-900">{t}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                <span className="block text-orange-800/60 text-[10px] font-bold uppercase tracking-widest mb-2">Best Time</span>
                                <span className="text-base md:text-lg font-bold text-orange-900">{guide.timings?.best_time_for_darshan}</span>
                            </div>
                        </div>
                    </div>

                    {/* INFO GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
                        {/* ETIQUETTE */}
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400 mb-6 flex items-center gap-4">
                                <span className="w-8 h-px bg-stone-300"></span>
                                Guidelines
                            </h2>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <span className="text-lg">👕</span>
                                    <div>
                                        <h4 className="font-bold text-sm uppercase mb-1">Dress Code</h4>
                                        <p className="text-sm text-stone-600 leading-relaxed">{guide.etiquette?.dress_code}</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <span className="text-lg">📸</span>
                                    <div>
                                        <h4 className="font-bold text-sm uppercase mb-1">Photography</h4>
                                        <p className="text-sm text-stone-600 leading-relaxed">{guide.etiquette?.photography}</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <span className="text-lg">🚫</span>
                                    <div>
                                        <h4 className="font-bold text-sm uppercase mb-1">Prohibited</h4>
                                        <p className="text-sm text-stone-600 leading-relaxed">{guide.etiquette?.prohibited_items?.join(", ")}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* TRAVEL */}
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400 mb-6 flex items-center gap-4">
                                <span className="w-8 h-px bg-stone-300"></span>
                                How to Reach
                            </h2>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Nearest Airport</span>
                                        <span className="font-bold text-sm md:text-base">{guide.travel_info?.nearest_airport}</span>
                                    </div>
                                    <span className="text-2xl text-stone-200">✈️</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Nearest Train</span>
                                        <span className="font-bold text-sm md:text-base">{guide.travel_info?.nearest_train}</span>
                                    </div>
                                    <span className="text-2xl text-stone-200">🚆</span>
                                </div>
                                <div className="flex gap-6">
                                    <div>
                                        <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Best Season</span>
                                        <span className="font-black text-base md:text-lg">{guide.travel_info?.best_season}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Avg Queue</span>
                                        <span className="font-black text-base md:text-lg text-orange-600">{guide.travel_info?.queue_time_avg}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NEARBY */}
                    {guide.nearby_places?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400 mb-6 flex items-center gap-4">
                                <span className="w-8 h-px bg-stone-300"></span>
                                Also Visit
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {guide.nearby_places.map((place, i) => (
                                    <div key={i} className="bg-stone-50 p-6 rounded-xl border border-stone-200 hover:border-orange-200 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-lg">{place.name}</h4>
                                            <span className="text-xs font-bold bg-white px-2 py-1 rounded shadow-sm text-stone-500">{place.distance}</span>
                                        </div>
                                        <p className="text-sm text-stone-600">{place.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                <div className="text-center mt-12">
                    <Link to="/temples" className="inline-block px-8 py-3 bg-black text-white rounded-full font-bold uppercase text-xs tracking-widest hover:bg-stone-800 transition-all">
                        Search Another Temple
                    </Link>
                </div>
            </div>
        </div>
    );
}
