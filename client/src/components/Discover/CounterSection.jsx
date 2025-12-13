import React, { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { getPublicStats } from "../../services/farmApi";

const useCountUp = (end, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  const frameRate = 60;
  const totalFrames = Math.round(duration / (1000 / frameRate));
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!start) {
      setCount(0);
      return;
    }

    let currentFrame = 0;
    const animate = () => {
      currentFrame++;
      const progress = easeOutCubic(currentFrame / totalFrames);
      const currentCount = Math.round(end * progress);
      setCount(currentCount);
      if (currentFrame < totalFrames) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, start, totalFrames]);

  return count;
};

const FarmIcon = () => (
  <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3M5 10l7 7 7-7"
    />
  </svg>
);
const ProductIcon = () => (
  <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    />
  </svg>
);
const CustomerIcon = () => (
  <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const SalesIcon = () => (
  <svg
    className="h-8 w-8 text-green-800"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const OrderIcon = () => (
  <svg
    className="h-8 w-8 text-emerald-800/90"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);
const ClockIcon = () => (
  <svg
    className="h-8 w-8 text-emerald-800/90"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const NewIcon = () => (
  <svg
    className="h-8 w-8 text-emerald-800/90"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.044a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

function HorizontalStatCard({
  endValue,
  label,
  description,
  icon,
  startAnimation,
  delay,
  format = "number",
}) {
  const count = useCountUp(endValue, 2000, startAnimation);

  let formattedValue =
    format === "number"
      ? new Intl.NumberFormat("en-US").format(count)
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(count);

  return (
    <div
      className={`relative transform overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-100 p-6 shadow-md transition-all duration-700 hover:scale-105 ${startAnimation ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"} `}
      style={{ transitionDelay: `${delay}ms`, transformOrigin: "left center" }}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-200/50 text-emerald-700">
          {icon}
        </div>

        <div>
          <dt className="text-4xl font-extrabold text-emerald-900">{formattedValue}</dt>
          <dd className="text-sm font-bold uppercase tracking-wide text-emerald-600">{label}</dd>
        </div>
      </div>

      <p className="mt-3 text-lg font-medium text-emerald-800/90">{description}</p>
    </div>
  );
}

function AngledStatCard({
  endValue,
  label,
  description,
  icon,
  startAnimation,
  delay,
  format = "number",
  primaryGradient = false,
}) {
  const count = useCountUp(endValue, 2000, startAnimation);

  let formattedValue =
    format === "number"
      ? new Intl.NumberFormat("en-US").format(count) + (format === "percentage" ? "%" : "")
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(count);

  return (
    <div
      className={`duration-0.5 relative transform rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl ${startAnimation ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${primaryGradient ? "bg-gradient-to-br from-green-600 to-green-800 text-white shadow-lg" : "bg-gray-100 text-gray-900 shadow-md"} `}
      style={{
        transitionDelay: `${delay}ms`,
        transform: "skewX(-6deg)",
        transformOrigin: "top left",
      }}
    >
      <div style={{ transform: "skewX(6deg)" }}>
        <div
          className={`mb-4 inline-block rounded-full p-3 ${primaryGradient ? "bg-green-800/50" : "bg-white"}`}
        >
          {icon}
        </div>
        <dt className={`text-5xl font-bold ${primaryGradient ? "text-white" : "text-emerald-900"}`}>
          {formattedValue}
        </dt>
        <dd className="mt-1 text-lg font-semibold text-emerald-900">{label}</dd>
        <p className={`mt-2 text-sm ${primaryGradient ? "text-green-100" : "text-green-700"}`}>
          {description}
        </p>
      </div>
    </div>
  );
}

const HorizontalStatSkeleton = () => (
  <div className="h-28 w-full animate-pulse rounded-2xl bg-gray-200 p-6">
    <div className="flex items-center gap-4">
      <div className="h-8 w-8 rounded-full bg-gray-300"></div>
      <div>
        <div className="h-10 w-24 rounded-md bg-gray-300"></div>
        <div className="mt-2 h-4 w-20 rounded-md bg-gray-300"></div>
      </div>
    </div>
  </div>
);

const AngledStatSkeleton = () => (
  <div
    className="h-60 w-full animate-pulse rounded-2xl bg-gray-200 p-6"
    style={{ transform: "skewX(-6deg)" }}
  >
    <div className="h-12 w-12 rounded-full bg-gray-300"></div>
    <div className="mt-4 h-12 w-2/3 rounded-md bg-gray-300"></div>
    <div className="mt-3 h-6 w-1/2 rounded-md bg-gray-300"></div>
    <div className="mt-2 h-4 w-full rounded-md bg-gray-300"></div>
  </div>
);

function CounterSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

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
      <section className="rounded-lg bg-green-100 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start">
            <div className="flex flex-col gap-6">
              <div className="h-8 w-1/2 rounded-md bg-gray-300"></div>
              <div className="h-5 w-3/4 rounded-md bg-gray-200"></div>
              <div className="mt-4 space-y-6">
                <HorizontalStatSkeleton />
                <HorizontalStatSkeleton />
                <HorizontalStatSkeleton />
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="h-8 w-1/2 rounded-md bg-gray-300"></div>
              <div className="h-5 w-3/4 rounded-md bg-gray-200"></div>
              <div className="mt-4 grid grid-cols-2 gap-6">
                <AngledStatSkeleton />
                <AngledStatSkeleton />
                <AngledStatSkeleton />
                <AngledStatSkeleton />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-red-50 py-16">
        <div className="container mx-auto max-w-7xl px-6 text-center lg:px-8">
          <p className="font-medium text-red-700">Error loading statistics: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-40 lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col">
            <div className="mx-auto mb-12 w-full max-w-2xl">
              <p className="mb-2 mt-4 text-sm font-semibold uppercase tracking-wider text-green-700">
                Our Community in Action
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                The Pulse of Agrilink
              </h2>
              <div className="mt-5 h-1 w-20 bg-green-700"></div>
            </div>
            <div className="mt-1 space-y-6">
              <HorizontalStatCard
                endValue={stats.ordersInLast24Hours}
                label="Orders in last 24h"
                description="Our community is shopping fresh today."
                icon={<ClockIcon />}
                startAnimation={inView}
                delay={0}
              />
              <HorizontalStatCard
                endValue={stats.newProductsThisWeek}
                label="New Products This Week"
                description="Fresh harvests and new items just listed."
                icon={<NewIcon />}
                startAnimation={inView}
                delay={200}
              />
              <HorizontalStatCard
                endValue={stats.ordersCompleted}
                label="Total Orders Completed"
                description="Connecting farms to families, one order at a time."
                icon={<OrderIcon />}
                startAnimation={inView}
                delay={400}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mx-auto mb-12 w-full max-w-2xl">
              <p className="mb-2 mt-4 text-sm font-semibold uppercase tracking-wider text-green-700">
                Our Growing Foundation
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                The Strength of Our Network
              </h2>
              <div className="mt-5 h-1 w-20 bg-green-700"></div>
            </div>
            <div className="mt-1 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <AngledStatCard
                endValue={stats.farmsRegistered}
                label="Farms Registered"
                icon={<FarmIcon />}
                startAnimation={inView}
                delay={600}
              />
              <AngledStatCard
                endValue={stats.customersJoined}
                label="Customers Joined"
                icon={<CustomerIcon />}
                startAnimation={inView}
                delay={700}
              />
              <AngledStatCard
                endValue={stats.productsListed}
                label="Products Listed"
                icon={<ProductIcon />}
                startAnimation={inView}
                delay={800}
              />
              <AngledStatCard
                endValue={stats.totalSalesValue}
                label="Total Sales"
                icon={<SalesIcon />}
                startAnimation={inView}
                delay={900}
                format="currency"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CounterSection;
