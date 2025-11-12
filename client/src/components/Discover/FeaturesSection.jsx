import { FaSeedling, FaUsers, FaMapMarkedAlt } from "react-icons/fa";

const FeaturesSection = () => {
    const features = [
        {
            icon: <FaSeedling className="h-12 w-12 text-emerald-600" />,
            title: "Eat Fresh",
            description: "Find farms offering the freshest, seasonal produce near you.",
        },
        {
            icon: <FaUsers className="h-12 w-12 text-emerald-600" />,
            title: "Support Local",
            description: "Connect directly with local farmers and support your community.",
        },
        {
            icon: <FaMapMarkedAlt className="h-12 w-12 text-emerald-600" />,
            title: "Explore",
            description: "Discover hidden gems and new farms in your area with our interactive map.",
        },
    ];

    return (
        <div className="bg-white py-24">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
                    {features.map((feature) => (
                        <div key={feature.title} className="flex flex-col items-center">
                            <div className="mb-4 rounded-full bg-emerald-100 p-4">
                                {feature.icon}
                            </div>
                            <h3 className="mb-2 text-2xl font-bold text-gray-900">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturesSection;