import { FaShopify, FaCaravan, FaMapMarkedAlt } from "react-icons/fa";

const FeaturesSection = () => {
    const features = [
        {
            icon: <FaMapMarkedAlt className="h-10 w-10 text-emerald-600" />,
            title: "Discover Farms",
            description: "Find local farms by location or specialty using our interactive map.",
        },
        {
            icon: <FaShopify className="h-10 w-10 text-emerald-600" />,
            title: "Shop Fresh Products",
            description: "Add fresh, seasonal produce directly from farmers to your cart.",
        },
        {
            icon: <FaCaravan className="h-10 w-10 text-emerald-600" />,
            title: "Get It Delivered",
            description: "Receive your order straight from the farm with fast, reliable delivery.",
        }
    ];

    return (
        <div className="bg-green-50 py-20 sm:py-24 mb-10">
            <div className="container mx-auto max-w-7xl px-4 lg:px-8">

                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wider mt-4 mb-2">
                        How It Works
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Three Simple Steps to Fresh Produce
                    </h2>
                    <div className="mx-auto mt-5 w-20 h-1 bg-green-700"></div>
                </div>

                <div className="mx-auto mt-24 grid max-w-none grid-cols-1 gap-8 sm:mt-28 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="relative flex flex-col items-center text-center rounded-2xl bg-white px-8 pb-8 pt-16 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                        >
                            <div className="absolute top-0 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-emerald-100 ring-8 ring-slate-50">
                                {feature.icon}
                            </div>

                            <h3 className="mb-2 text-2xl font-semibold text-gray-900">
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