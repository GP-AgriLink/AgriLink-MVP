import React, { useState, useEffect } from 'react';

const FarmIcon = () => (
    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3M5 10l7 7 7-7" />
    </svg>
);

const ProductIcon = () => (
    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
);

const CustomerIcon = () => (
    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-2.87l-1.391 1.39A7.002 7.002 0 0113 15M3 20h5v-2a3 3 0 015.356-2.87l1.391 1.39A7.002 7.002 0 0011 15m0 0c-1.873 0-3.61-.76-4.95-2.05S3 9.873 3 8m0 0c0-1.873.76-3.61 2.05-4.95S8.127 1 10 1m6.95 2.05C18.24 4.39 19 6.127 19 8m0 0c0 1.873-.76 3.61-2.05 4.95S13.873 15 12 15m0 0a5.002 5.002 0 00-4.95 7.05l-1.391-1.39A3 3 0 015 20m0 0h5" />
    </svg>
);

const SalesIcon = () => (
    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0c-1.657 0-3-.895-3-2s1.343-2 3-2 3-.895 3-2-1.343-2-3-2m0 0V7m0 0C6.477 7 3 9.239 3 12s3.477 5 9 5 9-2.239 9-5-3.477-5-9-5z" />
    </svg>
);


function StatItem({ value, label, icon, format = 'number' }) {

    let formattedValue;

    if (format === 'currency') {
        formattedValue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    } else {
        formattedValue = new Intl.NumberFormat('en-US').format(value);
    }

    return (
        <div className="relative flex items-center rounded-lg bg-white p-6 shadow-md">
            <div className="mr-4 flex flex-shrink-0 items-center justify-center rounded-full bg-gray-100 p-3">
                {icon}
            </div>
            <div>
                <dt className="text-4xl font-bold text-gray-900">{formattedValue}</dt>
                <dd className="mt-1 text-lg font-medium text-gray-500">{label}</dd>
            </div>
        </div>
    );
}

function SecondaryStatItem({ value, label }) {
    const formattedValue = new Intl.NumberFormat('en-US').format(value);

    return (
        <div className="rounded-lg bg-green-50/50 p-6 shadow-sm ring-1 ring-green-200">
            <dt className="text-3xl font-bold text-green-800">{formattedValue}</dt>
            <dd className="mt-1 text-md font-medium text-green-900">{label}</dd>
        </div>
    );
}

function StatSkeleton() {
    return (
        <div className="flex items-center rounded-lg bg-white p-6 shadow-md animate-pulse">
            <div className="mr-4 h-14 w-14 rounded-full bg-gray-200"></div>
            <div className="flex-1">
                <div className="h-10 w-3/4 rounded-md bg-gray-300"></div>
                <div className="mt-2 h-6 w-1/2 rounded-md bg-gray-200"></div>
            </div>
        </div>
    );
}

function SecondaryStatSkeleton() {
    return (
        <div className="rounded-lg bg-gray-50 p-6 animate-pulse">
            <div className="h-8 w-1/3 rounded-md bg-gray-300"></div>
            <div className="mt-2 h-5 w-2/3 rounded-md bg-gray-200"></div>
        </div>
    );
}


function CounterSection() {

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/farms/stats');

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
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <div className="h-12 w-1/3 mx-auto rounded-md bg-gray-300 animate-pulse"></div>
                        <div className="mt-4 h-6 w-1/2 mx-auto rounded-md bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                    </div>
                    <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <SecondaryStatSkeleton />
                        <SecondaryStatSkeleton />
                        <SecondaryStatSkeleton />
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bg-red-50 py-16">
                <div className="container mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <p className="font-medium text-red-700">
                        Error loading statistics: {error}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-gray-50/70 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wider mt-4 mb-2">
                        Our Platform by the Numbers
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        A real-time look at our growing farm community and marketplace.
                    </h2>
                    <div className="mx-auto mt-5 w-20 h-1 bg-green-700"></div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatItem
                        value={stats.farmsRegistered}
                        label="Farms Registered"
                        icon={<FarmIcon />}
                    />
                    <StatItem
                        value={stats.customersJoined}
                        label="Customers Joined"
                        icon={<CustomerIcon />}
                    />
                    <StatItem
                        value={stats.productsListed}
                        label="Products Listed"
                        icon={<ProductIcon />}
                    />
                    <StatItem
                        value={stats.totalSalesValue}
                        label="Total Sales"
                        icon={<SalesIcon />}
                        format="currency"
                    />
                </div>

                <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <SecondaryStatItem
                        value={stats.ordersCompleted}
                        label="Orders Completed"
                    />
                    <SecondaryStatItem
                        value={stats.ordersInLast24Hours}
                        label="Orders in last 24h"
                    />
                    <SecondaryStatItem
                        value={stats.newProductsThisWeek}
                        label="New Products This Week"
                    />
                </div>

            </div>
        </section>
    );
}

export default CounterSection;