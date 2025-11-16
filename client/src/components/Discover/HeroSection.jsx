const HeroSection = () => {
    const stats = [
        { id: 1, name: 'Farms', value: '120+' },
        { id: 2, name: 'Customers', value: '27+' },
        { id: 3, name: 'Products', value: '85+' },
    ];

    return (
        <section className="relative h-[75vh] w-full">
            <img
                src="../../../public/hero.jpg"
                alt="A vibrant farm field"
                className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-white/80" aria-hidden="true"></div>

            <div className="relative z-10 flex h-full flex-col p-8 text-white">
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <h1 className="mb-4 text-4xl font-bold md:text-6xl text-emerald-900">
                        Freshness from the farm.
                    </h1>
                    <h1 className="mb-4 text-4xl font-bold md:text-6xl text-emerald-900">
                        Delivered to your door.
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
                        {stats.map((stat) => (
                            <div key={stat.id} className="flex flex-col items-center">
                                <span className="text-3xl font-bold text-emerald-600">{stat.value}</span>
                                <span className="text-sm uppercase tracking-wider mt-3 text-emerald-900">{stat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;