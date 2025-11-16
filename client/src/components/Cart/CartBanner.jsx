export default function CartBanner({ totalDue, groupedByFarm }) {
  const farmIds = Object.keys(groupedByFarm);
  const farmCount = farmIds.length;
  const farmNames = farmIds.map(id => groupedByFarm[id].farm.farmName);

  return (
    <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-emerald-200/50 bg-gradient-to-br from-emerald-200 via-emerald-50 to-emerald-200 p-8 shadow-md md:grid-cols-3 md:p-10">
      {/* Left Side: Title */}
      <div className="md:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">
          CONFIRM YOUR ORDER
        </span>
        <h1 className="mb-5 mt-3 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
          Pay on delivery with confidence.
        </h1>
        <p className="mb-5 text-base leading-relaxed text-emerald-700">
          {farmCount > 1 ? (
            <>
              You're ordering from <span className="font-semibold text-gray-900">{farmCount} farms</span>.
              Your total due is <span className="font-semibold text-gray-900">${totalDue.toFixed(2)}</span>.
            </>
          ) : (
            <>
              Pay on delivery to {farmNames[0]}. Your total due is{' '}
              <span className="font-semibold text-gray-900">${totalDue.toFixed(2)}</span>.
            </>
          )}
        </p>
        
        {/* Farm Badges */}
        <div className="flex flex-wrap gap-3">
          {farmNames.map((name, index) => (
            <span 
              key={index}
              className="rounded-full border border-emerald-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur-sm"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Right Side: Total Box */}
      <div className="rounded-2xl border border-emerald-200/60 bg-white/70 p-6 text-center shadow-sm backdrop-blur-sm">
        <span className="text-lg font-medium uppercase tracking-[0.12em] text-emerald-600">
          TOTAL DUE
        </span>

        <div className="my-3 text-4xl font-bold text-gray-900 md:text-5xl">
          ${totalDue.toFixed(2)}
        </div>

        <p className="text-xs leading-relaxed text-emerald-700">
          {farmCount > 1 
            ? 'Pay each farmer directly when your orders are delivered.'
            : 'Pay the farmer directly when your order is delivered.'}
        </p>
      </div>
    </div>
  );
}