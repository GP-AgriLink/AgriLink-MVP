const farmImageUrl = '../../../mision.jpeg';

const LocalFarmSection = () => {
    return (
        <section className="py-16 px-5 overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-20">

                {/* Text Content */}
                <div className="flex-1 w-full max-w-lg text-center lg:text-left">

                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-2">
                        Our Mission
                    </p>

                    <div className="relative inline-block">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 pb-4">
                            Discover Local Farms
                        </h2>
                        <div className="absolute bottom-0 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-green-700 lg:left-0 lg:translate-x-0"></div>
                    </div>

                    <p className="mt-8 text-base sm:text-lg text-gray-700 leading-relaxed">
                        Our platform connects you directly with the freshest produce in your area.
                        Forget long supply chains—find vibrant, healthy food right from the source.
                        Explore local farms, see what's in season, and support your community.
                    </p>
                </div>

                {/* Image Section */}
                <div className="flex-1 flex justify-center lg:justify-end">
                    <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[450px] lg:h-[450px]">
                        <div
                            className="w-full h-full overflow-hidden animate-blob rounded-3xl shadow-xl"
                        >
                            <img
                                src={farmImageUrl}
                                alt="A basket of fresh vegetables"
                                className="w-full h-full object-cover scale-110"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default LocalFarmSection;