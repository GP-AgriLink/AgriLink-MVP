import React, { useState, useEffect } from "react";
import { getPublicStats } from "../../services/farmApi";

function StatItem({ value, label, delay }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = parseInt(String(value).replace(/,/g, ""), 10) || 0;
    let start = 0;
    const duration = 2000;
    const incrementTime = 20;
    const step = Math.ceil(end / (duration / incrementTime));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  const formattedValue = new Intl.NumberFormat("en-US").format(count);

  return (
    <div className={`animate-slideInUp p-2 text-center ${delay}`}>
      <span className="block text-4xl font-extrabold text-emerald-700 transition-all md:text-5xl">
        {formattedValue}+
      </span>
      <span className="mt-2 block text-lg font-medium uppercase tracking-wide text-emerald-900">
        {label}
      </span>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="animate-pulse p-4 text-center">
      <div className="mx-auto h-12 w-2/3 rounded-md bg-gray-300"></div>
      <div className="mx-auto mt-3 h-6 w-1/2 rounded-md bg-gray-300"></div>
    </div>
  );
}

const HeroSection = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getPublicStats();
        setStats(stats);
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
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-red-50 py-16">
        <div className="container mx-auto max-w-7xl animate-slideInUp rounded-lg px-6 text-center animation-delay-300 lg:px-8">
          <p className="font-medium text-red-700">Error loading statistics: {error}</p>
        </div>
      </section>
    );
  }

  const sectionClasses =
    "relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden";

  return (
    <section className={sectionClasses}>
      <img
        src="../../../hero.jpg"
        alt="A vibrant farm field"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" aria-hidden="true"></div>

      <div className="container relative z-10 mx-auto flex flex-col items-center px-6 py-12 text-center text-white">
        <div className="mx-auto mt-10 max-w-4xl">
          <h1 className="mb-4 animate-slideInUp text-4xl font-bold leading-tight text-emerald-900 md:text-6xl">
            Freshness from the farm.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-slideInUp text-lg leading-relaxed text-emerald-700 animation-delay-100 md:text-xl">
            Discover and shop from the best local farms across Egypt. Connect directly with farmers
            who care about quality and sustainability.
          </p>

          <div className="mt-10 animate-slideInUp animation-delay-200">
            <a
              href="#DiscoverSection"
              onClick={(e) => {
                e.preventDefault();
                const section = document.getElementById("DiscoverSection");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-emerald-700 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-emerald-700/30 transition-all duration-300 hover:scale-105 hover:bg-emerald-800 hover:shadow-xl"
            >
              Find Farms Near Me
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-5 w-5 animate-bounce group-hover:animate-none"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          <div className="mt-16 flex w-full max-w-5xl flex-wrap justify-center gap-8 md:gap-16">
            <div className="grid w-full grid-cols-1 gap-8 uppercase tracking-wider md:grid-cols-2 lg:grid-cols-3">
              <StatItem value={stats.farmsRegistered} label="Farms" delay="animation-delay-300" />

              <StatItem
                value={stats.customersJoined}
                label="Customers"
                delay="animation-delay-500"
              />

              <StatItem value={stats.productsListed} label="Products" delay="animation-delay-700" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
