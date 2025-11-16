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

    const [stats] = useState({
        farmsRegistered: 120,
        governoratescovered: 27,
        productsListed: 85,
        ordersCompleted: 430,
    });

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
                            value={stats.governoratescovered}
                            label="Governorates Covered"
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