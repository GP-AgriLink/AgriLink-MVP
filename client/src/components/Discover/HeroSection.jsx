import React, { useState, useEffect } from 'react';

const animationStyles = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translate3d(0, 40px, 0);
        }
        to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
        }
    }

    .animate-fade-in-up {
        animation: fadeInUp 0.8s ease-out forwards;
        opacity: 0;
    }

    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; }
    .delay-500 { animation-delay: 0.5s; }
    .delay-700 { animation-delay: 0.8s; }
`;

function StatItem({ value, label, delay }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const end = parseInt(String(value).replace(/,/g, ''), 10) || 0;
        let start = 0;
        const duration = 2000;
        const incrementTime = 20;
        const step = Math.ceil(end / (duration / incrementTime));

        const timer = setInterval(() => {
            start += step;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value]);

    const formattedValue = new Intl.NumberFormat('en-US').format(count);

    return (
        <div className={`text-center p-2 animate-fade-in-up ${delay}`}>
            <span className="block text-4xl md:text-5xl font-extrabold text-emerald-700 transition-all">
                {formattedValue}+
            </span>
            <span className="block mt-2 text-lg font-medium text-emerald-900 uppercase tracking-wide">
                {label}
            </span>
        </div>
    );
}

function StatSkeleton() {
    return (
        <div className="text-center p-4 animate-pulse">
            <div className="h-12 bg-gray-300 rounded-md w-2/3 mx-auto"></div>
            <div className="h-6 bg-gray-300 rounded-md w-1/2 mx-auto mt-3"></div>
        </div>
    );
}

const HeroSection = () => {

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/farms/stats');

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setStats(data);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 bg-red-50">
                <div className="container mx-auto max-w-7xl px-6 lg:px-8 text-center rounded-lg animate-fade-in-up delay-300">
                    <p className="text-red-700 font-medium">
                        Error loading statistics: {error}
                    </p>
                </div>
            </section>
        );
    }

    const sectionClasses = "relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden";

    return (
        <section className={sectionClasses}>
            <style>{animationStyles}</style>

            <img
                src="../../../hero.jpg"
                alt="A vibrant farm field"
                className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" aria-hidden="true"></div>

            <div className="relative z-10 container mx-auto px-6 py-12 flex flex-col text-white items-center text-center">
                <div className="max-w-4xl mx-auto mt-10">
                    <h1 className="mb-4 text-4xl font-bold md:text-6xl text-emerald-900 animate-fade-in-up leading-tight">
                        Freshness from the farm.
                    </h1>
                    <p className="max-w-2xl text-lg md:text-xl text-emerald-700 mt-5 animate-fade-in-up delay-100 mx-auto leading-relaxed">
                        Discover and shop from the best local farms across Egypt. Connect directly with farmers who care about quality and sustainability.
                    </p>

                    <div className="mt-10 animate-fade-in-up delay-200">
                        <a
                            href="#DiscoverSection"
                            onClick={(e) => {
                                e.preventDefault();
                                const section = document.getElementById("DiscoverSection");
                                if (section) {
                                    section.scrollIntoView({ behavior: "smooth", block: "start" });
                                }
                            }}
                            className="inline-flex items-center gap-2 py-3 px-8 rounded-full bg-emerald-700 text-white text-lg font-semibold shadow-lg shadow-emerald-700/30 transition-all duration-300 hover:scale-105 hover:bg-emerald-800 hover:shadow-xl group cursor-pointer"
                        >
                            Find Farms Near Me
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className="h-5 w-5 animate-bounce group-hover:animate-none"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </a>
                    </div>

                    <div className="w-full max-w-5xl flex flex-wrap justify-center gap-8 md:gap-16 mt-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 uppercase tracking-wider w-full">
                            <StatItem
                                value={stats.farmsRegistered}
                                label="Farms"
                            // delay="delay-300"
                            />

                            <StatItem
                                value={stats.customersJoined}
                                label="Customers"
                            // delay="delay-500"
                            />

                            <StatItem
                                value={stats.productsListed}
                                label="Products"
                            // delay="delay-700"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;