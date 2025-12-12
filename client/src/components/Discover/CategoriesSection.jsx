import React, { useState, useEffect } from 'react';

const LeafIcon = ({ className }) => (
    <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M17.01 11.23C15.54 8.24 12.3 6 8.5 6 4.36 6 1 9.36 1 13.5c0 3.19 1.93 5.9 4.6 7.02.59.25 1.25.13 1.7-.31.45-.44.57-1.1.31-1.7-.51-1.2-.77-2.52-.77-3.9 0-3.32 2.68-6 6-6 1.38 0 2.69.47 3.71 1.25.44.33.99.33 1.43 0 .44-.33.56-.95.23-1.43zM6.5 22c.31 0 .6-.18.73-.46.33-.7.15-1.53-.41-1.95-.56-.42-1.39-.24-1.72.45-.33.7.15 1.53.84 1.95.17.13.36.19.56.19z" />
    </svg>
);

const CategoryCard = ({ imageSrc, name, description }) => {
    return (
        <div className="group relative w-full max-w-[20rem] h-80 overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <img
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                src={imageSrc}
                alt={name}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

            <div className="relative flex h-full flex-col justify-end p-6">
                <h3 className="flex items-center gap-2 text-3xl font-bold text-white">
                    <LeafIcon className="h-5 w-5 flex-shrink-0 text-green-700" />
                    {name}
                    <LeafIcon className="h-5 w-5 flex-shrink-0 text-green-700" />
                </h3>

                <p className="mt-1 text-base leading-relaxed text-gray-200">
                    {description}
                </p>
            </div>
        </div>
    );
};

const categoryDetails = {
    Vegetables: {
        description: "Fresh, crisp vegetables sourced directly from local farms.",
        imageSrc: "../../../Category/Vegetables.png"
    },
    Organic: {
        description: "Certified organic produce grown without synthetic pesticides or fertilizers.",
        imageSrc: "../../../Category/Organic.jpg"
    },
    Dairy: {
        description: "Creamy milk, rich cheeses, and fresh dairy products from pasture-raised cows.",
        imageSrc: "../../../Category/Dairy.png"
    },
    Fruits: {
        description: "Sweet, juicy, and seasonal fruits picked at the peak of ripeness.",
        imageSrc: "../../../Category/Fruits.png"
    },
    Grains: {
        description: "Locally harvested grains, from hearty oats to golden wheat.",
        imageSrc: "../../../Category/Grains.png"
    },
    Herbs: {
        description: "Aromatic, fresh-cut herbs like basil, mint, and rosemary to elevate your cooking.",
        imageSrc: "../../../Category/Herbs.jpg"
    },
    default: {
        description: "Explore our collection of high-quality farm products.",
        imageSrc: "../../../Category/all.png"
    }
};

const CategoriesSection = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch('http://localhost:5000/api/products/categories');

                if (!response.ok) {
                    throw new Error('Something went wrong!');
                }

                const data = await response.json();

                if (Array.isArray(data)) {
                    setCategories(data);
                } else {
                    throw new Error("Received data is not in the expected format (array).");
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (isLoading) {
        return (
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-semibold text-gray-600">
                        Loading Best Selling Categories...
                    </h2>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-semibold text-red-600">
                        Error: {error}
                    </h2>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 sm:py-24 mb-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wider mt-4 mb-2">
                        Categories
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Shop all farm categories
                    </h2>
                    <div className="mx-auto mt-5 w-20 h-1 bg-green-700"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">

                    {categories.map((categoryName) => {
                        const details = categoryDetails[categoryName] || categoryDetails.default;

                        return (
                            <CategoryCard
                                key={categoryName}
                                name={categoryName}
                                description={details.description}
                                imageSrc={details.imageSrc}
                            />
                        );
                    })}

                </div>
            </div>
        </section>
    );
};

export default CategoriesSection;