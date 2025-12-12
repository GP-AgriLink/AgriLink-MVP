import React from 'react';
import { useNavigate } from 'react-router-dom';

function FarmerSection({ userRole = 'guest', onLogout }) {
    const navigate = useNavigate();

    const normalizedRole = userRole ? userRole.toLowerCase() : 'guest';
    const isFarmer = normalizedRole === 'farmer';

    const farmerPromo = {
        label: "For Farmers",
        title: "Are you a farmer?",
        description: "Join AgriLink to digitize your farm, manage your inventory, and reach thousands of new customers.",
        features: ["Digital inventory management system", "Direct access to thousands of customers", "Easy order management and tracking",],
        buttonText: "Join as a Farmer",
        imageSrc: "../../../farmer.jpg",
    };

    const customerPromo = {
        label: "For Customers",
        title: "Looking for fresh food?",
        description: "Experience the difference of farm-to-table. Browse thousands of local products and buy directly from the source.",
        features: ["Fresh organic produce", "Farm-to-table delivery", "Support local agriculture"],
        buttonText: "Join as a Customer",
        imageSrc: "../../../farmer.jpg",
    };

    const content = isFarmer ? customerPromo : farmerPromo;

    const handleJoinClick = () => {
        if (onLogout) {
            onLogout();
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        navigate('/login');
    };

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto rounded-xl border border-green-200 py-20 px-8 shadow-md">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="text-left">
                            <div className="flex-1 max-w-lg text-center lg:text-left">
                                <p className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-2">
                                    {content.label}
                                </p>
                                <div className="relative inline-block text-center lg:text-left">
                                    <h2 className="text-4xl font-bold text-gray-900 pb-4">
                                        {content.title}
                                    </h2>
                                    <div className="absolute mx-auto w-20 h-1 bg-green-700"></div>
                                </div>
                                <p className="text-lg text-green-800 leading-relaxed mt-8">
                                    {content.description}
                                </p>
                            </div>

                            <ul className="space-y-4 mb-10 mt-5">
                                {content.features.map((feature, index) => (
                                    <li key={index} className="flex items-center text-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-green-700 mr-3 flex-shrink-0">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-green-800">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={handleJoinClick}
                                className="inline-flex items-center justify-center px-8 py-3
                                bg-green-100 text-green-900 text-lg font-semibold rounded-full shadow-md
                                hover:bg-green-200 focus:outline-none focus:ring-2
                                focus:ring-green-400 focus:ring-offset-2 transition-colors
                                group w-full cursor-pointer"
                            >
                                {content.buttonText}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1">
                                    <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h15.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-10 md:mt-0">
                            <img
                                src={content.imageSrc}
                                alt={content.label}
                                className="rounded-xl shadow-2xl w-full h-auto object-cover aspect-[4/3]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default FarmerSection;