import React from "react";
import { Heart, Package, Sparkles } from "lucide-react";

const FavoriteProducts = ({ products }) => {
  const renderEmptyState = () => (
    <div
      className="flex min-h-[200px] flex-col items-center justify-center p-4"
      style={{ animation: "fadeInScale 0.5s ease-out" }}
    >
      <div className="group relative max-w-sm">
        <div className="absolute -inset-0.5 animate-pulse rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-40" />
        <div className="relative rounded-2xl bg-white p-6 text-center shadow-lg">
          <div className="relative mb-4">
            <Heart
              className="mx-auto h-16 w-16 text-gray-300 transition-transform duration-500 group-hover:scale-110"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />
            <Sparkles className="absolute left-1/4 top-2 h-4 w-4 animate-pulse text-emerald-400 opacity-60" />
            <Sparkles
              className="absolute right-1/4 top-4 h-3 w-3 animate-pulse text-teal-400 opacity-50"
              style={{ animationDelay: "200ms" }}
            />
          </div>
          <p className="bg-gradient-to-r from-gray-700 to-emerald-600 bg-clip-text text-lg font-semibold text-transparent">
            No favorite products yet
          </p>
        </div>
      </div>
    </div>
  );

  const getRankBadge = (index) => {
    const badges = [
      { bg: "bg-yellow-100", text: "text-yellow-700", icon: "🥇" },
      { bg: "bg-gray-100", text: "text-gray-700", icon: "🥈" },
      { bg: "bg-orange-100", text: "text-orange-700", icon: "🥉" },
    ];
    return badges[index] || { bg: "bg-gray-100", text: "text-gray-700", icon: `#${index + 1}` };
  };

  return (
    <div className="animate-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-rose-100 p-2">
          <Heart className="h-5 w-5 text-rose-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Favorite Products</h2>
      </div>

      {!products || products.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => {
            const badge = getRankBadge(index);
            return (
              <div
                key={product._id || index}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:scale-[1.02] hover:border-rose-200 hover:bg-rose-50/50"
                style={{ animation: `fadeInScale ${0.3 + index * 0.1}s ease-out` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${badge.bg} text-lg`}
                  >
                    {badge.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.farmName || "Unknown Farm"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-rose-700">
                    {product.totalQuantityOrdered ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">units ordered</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        .animate-fade-in {
          animation: fadeInScale 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FavoriteProducts;
