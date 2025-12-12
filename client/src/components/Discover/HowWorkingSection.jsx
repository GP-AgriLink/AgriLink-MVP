import React, { useEffect, useState, useRef } from 'react';
import { FaShopify, FaCaravan, FaMapMarkedAlt } from "react-icons/fa";

const FeaturesSection = () => {
    const [showAnimation, setShowAnimation] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRef.current) return;

            const rect = sectionRef.current.getBoundingClientRect();
            const triggerPoint = window.innerHeight * 0.85;

            if (rect.top <= triggerPoint) {
                setShowAnimation(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    const features = [
        {
            icon: <FaMapMarkedAlt className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600 transition-transform duration-300 group-hover:scale-110" />,
            title: "Discover Farms",
            description: "Find local farms by location or specialty using our interactive map.",
        },
        {
            icon: <FaShopify className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600 transition-transform duration-300 group-hover:scale-110" />,
            title: "Shop Fresh Products",
            description: "Add fresh, seasonal produce directly from farmers to your cart.",
        },
        {
            icon: <FaCaravan className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600 transition-transform duration-300 group-hover:scale-110" />,
            title: "Get It Delivered",
            description: "Receive your order straight from the farm with fast, reliable delivery.",
        }
    ];

    return (
        <section
            ref={sectionRef}
            className="bg-green-50 py-16 sm:py-24 mb-10 overflow-hidden min-h-[500px]"
        >
            <div className="container mx-auto max-w-7xl px-4 lg:px-8">
                {/* Header Animation */}
                <div
                    className={`
                        mx-auto max-w-2xl text-center transform transition-all duration-1000 ease-out
                        ${showAnimation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}
                    `}
                >
                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wider mt-4 mb-2">
                        How It Works
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Three Simple Steps to Fresh Produce
                    </h2>
                    <div className="mx-auto mt-5 w-24 h-1.5 bg-green-700 rounded-full"></div>
                </div>

                {/* Cards Container */}
                <div className="mx-auto mt-20 sm:mt-28 grid grid-cols-1 md:grid-cols-3 gap-y-16 md:gap-8 relative">
                    <div
                        className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-green-200 -z-0 transform -translate-y-1/2"
                        style={{ top: "40%" }}
                    ></div>

                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className={`
                                relative flex flex-col items-center text-center rounded-2xl bg-white 
                                px-6 py-8 sm:px-8 sm:pb-8 sm:pt-16 
                                shadow-xl border border-transparent hover:border-green-100 group z-10
                                transform transition-all duration-700 ease-out
                                hover:-translate-y-3 hover:shadow-2xl
                                ${showAnimation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-24"}
                            `}
                            style={{ transitionDelay: `${index * 250}ms` }}
                        >
                            <div className="absolute top-0 left-1/2 h-16 w-16 sm:h-20 sm:w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-50 ring-8 ring-white shadow-sm group-hover:bg-emerald-100 transition-colors duration-300 flex items-center justify-center">
                                {feature.icon}
                            </div>

                            <div className="mt-8 sm:mt-0">
                                <h3 className="mb-3 text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;