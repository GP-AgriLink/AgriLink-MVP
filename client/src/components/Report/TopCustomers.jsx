import React from "react";
import { Users, Sparkles } from "lucide-react";

const TopCustomers = ({ customers, formatCurrency }) => {
  const getRankBadge = (index) => {
    const badges = [
      { bg: "bg-yellow-100", text: "text-yellow-700", icon: "🥇" },
      { bg: "bg-gray-100", text: "text-gray-700", icon: "🥈" },
      { bg: "bg-orange-100", text: "text-orange-700", icon: "🥉" },
    ];
    return badges[index] || { bg: "bg-gray-100", text: "text-gray-700", icon: `#${index + 1}` };
  };

  const renderEmptyState = () => (
    <div
      className="flex min-h-[200px] flex-col items-center justify-center p-4"
      style={{ animation: "fadeInScale 0.5s ease-out" }}
    >
      <div className="group relative max-w-sm">
        <div className="absolute -inset-0.5 animate-pulse rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-40" />
        <div className="relative rounded-2xl bg-white p-6 text-center shadow-lg">
          <div className="relative mb-4">
            <Users
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
            No customer data for this period
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-teal-100 p-2">
          <Users className="h-5 w-5 text-teal-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Top Customers</h2>
      </div>

      {!customers || customers.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-3">
          {customers.map((customer, index) => {
            const badge = getRankBadge(index);
            const initials =
              customer.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "?";
            return (
              <div
                key={customer.userId || index}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:scale-[1.02] hover:border-teal-200 hover:bg-teal-50/50"
                style={{ animation: `fadeInScale ${0.3 + index * 0.1}s ease-out` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-md">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{customer.name}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}
                        >
                          {badge.icon}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-teal-700">
                      ${formatCurrency(customer.totalSpent)}
                    </p>
                    <p className="text-xs text-gray-500">{customer.totalOrdersPlaced} orders</p>
                  </div>
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

export default TopCustomers;
