import React from "react";

const StatsCard = ({ icon: Icon, title, value, gradient, iconGradient, delay = 0 }) => {
  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-2xl border border-emerald-100 ${gradient} p-6 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl`}
        style={{ animation: `fadeInScale ${delay}s ease-out` }}
      >
        <div className={`absolute right-4 top-4 rounded-full ${iconGradient} p-3 transition-transform group-hover:scale-110`}>
          <Icon className="h-6 w-6 text-emerald-600" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            {title}
          </p>
          <p className="text-3xl font-bold text-emerald-700">
            {value}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default StatsCard;
