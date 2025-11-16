const farmImageUrl = '../../../mision.jpeg';

const LocalFarmSection = () => {
    return (
        <section className="py-16 px-5 overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-10">

                <div className="flex-1 max-w-lg text-center lg:text-left">

                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-2">
                        Our Mission
                    </p>

                    <div className="relative inline-block text-center lg:text-left">
                        <h2 className="text-4xl font-bold text-gray-900 pb-4">
                            Discover Local Farms
                        </h2>
                        <div className="absolute mx-auto w-20 h-1 bg-green-700"></div>
                    </div>

                    <p className="text-lg text-gray-700 leading-relaxed mt-8">
                        Our platform connects you directly with the freshest produce in your area.
                        Forget long supply chains—find vibrant, healthy food right from the source.
                        Explore local farms, see what's in season, and support your community.
                    </p>
                </div>

                <div className="flex-1 max-w-md w-[200px] h-[200px] lg:w-auto lg:h-[400px]">
                    <div
                        className="w-full h-full overflow-hidden animate-blob"
                    >
                        <img
                            src={farmImageUrl}
                            alt="A basket of fresh vegetables"
                            className="w-full h-full object-cover scale-110 border-green-300"
                        />
                    </div>
                </div>

            </div>
        </section>
    );
};

export default LocalFarmSection;