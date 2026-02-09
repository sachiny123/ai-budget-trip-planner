import { Link } from "react-router-dom";

export default function AuthLayout({ children, title, subtitle, alternativeLink, alternativeText }) {
    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Image/Brand */}
            <div className="hidden lg:flex w-1/2 bg-black relative items-center justify-center p-12 text-white overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=2070&auto=format&fit=crop"
                    alt="Travel"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale"
                />

                <div className="relative z-10 max-w-lg text-center">
                    <h1 className="text-6xl font-black leading-tight mb-6 uppercase tracking-tighter">
                        TripWise<span className="text-gray-400">.AI</span>
                    </h1>
                    <p className="text-xl text-gray-200 font-light border-t border-white/20 pt-6 mt-6">
                        Plan your next adventure in seconds.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
                <div className="w-full max-w-md space-y-8 bg-white">
                    <div className="text-center">
                        <h2 className="text-4xl font-black tracking-tighter uppercase text-black">
                            {title}
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 font-medium uppercase tracking-widest">
                            {subtitle}
                        </p>
                    </div>

                    {children}

                    {alternativeLink && (
                        <p className="text-center text-sm text-gray-500 mt-8">
                            {alternativeText}{" "}
                            <Link
                                to={alternativeLink}
                                className="font-bold text-black border-b border-black hover:text-gray-700 transition-colors uppercase tracking-wide text-xs"
                            >
                                Click here
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
