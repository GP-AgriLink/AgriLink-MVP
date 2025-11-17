import React, { useState, useEffect } from 'react';

function StatItem({ value, label }) {
    const formattedValue = new Intl.NumberFormat('en-US').format(value);

    return (
        <div className="text-center p-1">
            <span className="block text-4xl font-extrabold text-emerald-700">
                {formattedValue}+
            </span>
            <span className="block mt-5 text-lg font-medium text-emerald-900">
                {label}
            </span>
        </div>
    );
}

function StatSkeleton() {
    return (
        <div className="text-center p-4 animate-pulse">
            <div className="h-12 bg-gray-300 rounded-md w-2/4 mx-auto"></div>
            <div className="h-6 bg-gray-300 rounded-md w-3/4 mx-auto mt-3"></div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                <div className="container mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <p className="text-red-700 font-medium">
                        Error loading statistics: {error}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="relative h-[75vh] w-full">
            <img
                src="../../../hero.jpg"
                alt="A vibrant farm field"
                className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-white/80" aria-hidden="true"></div>

            <div className="relative z-10 flex h-full flex-col p-8 text-white">
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <h1 className="mb-4 text-4xl font-bold md:text-6xl text-emerald-900">
                        Freshness from the farm.
                    </h1>
                    <p className="max-w-2xl text-lg md:text-xl text-emerald-700 mt-5">
                        Discover and shop from the best local farms across Egypt. Connect directly with farmers who care about quality and sustainability.
                    </p>

                    <a
                        href="#DiscoverSection"
                        className="mt-8 flex items-center gap-2 py-2 px-7 rounded-full bg-emerald-700 text-lg font-medium transition-transform hover:scale-105"
                    >
                        Find Farms Near Me
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-5 w-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </a>

                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16">
                        {/* {stats.map((stat) => (
                            <div key={stat.id} className="flex flex-col items-center"> */}
                        {/* <span className="text-3xl font-bold text-emerald-600">{stat.value}</span>
                                <span className="text-sm uppercase tracking-wider mt-3 text-emerald-900">{stat.name}</span> */}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 uppercase tracking-wider">

                            <StatItem
                                value={stats.farmsRegistered}
                                label="Farms"
                            />

                            <StatItem
                                value={stats.customersJoined}
                                label="Customers"
                            />

                            <StatItem
                                value={stats.productsListed}
                                label="Products"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;