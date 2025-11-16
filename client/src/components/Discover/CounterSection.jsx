import React, { useState, useEffect } from 'react';

function StatItem({ value, label }) {
    const formattedValue = new Intl.NumberFormat('en-US').format(value);

    return (
        <div className="text-center p-4">
            <span className="block text-5xl font-extrabold text-emerald-600">
                {formattedValue}+
            </span>
            <span className="block mt-5 text-lg font-medium text-green-900">
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


function CounterSection() {

    // const [stats] = useState({
    //     farmsRegistered: 120,
    //     customersJoined: 27,
    //     productsListed: 85,
    //     ordersCompleted: 430,
    // });

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem("token");

            try {
                const response = await fetch('http://localhost:5000/api/farms/stats', {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

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
        <section className="py-16">
            <div className="max-w-7xl mx-auto rounded-xl border border-green-200 py-20 px-8 shadow-md">

                <div className="container mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                        <StatItem
                            value={stats.farmsRegistered}
                            label="Farms Registered"
                        />

                        <StatItem
                            value={stats.customersJoined}
                            label="Customers Joined"
                        />

                        <StatItem
                            value={stats.productsListed}
                            label="Products Listed"
                        />

                        <StatItem
                            value={stats.ordersCompleted}
                            label="Orders Completed"
                        />

                    </div>
                </div>
            </div>
        </section>
    );
}

export default CounterSection;