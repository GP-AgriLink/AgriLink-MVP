export default function CartBanner({ totalDue, farmName }) {
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
          Pay on delivery to {farmName || 'Agrilink Corp'}. Your total due is{' '}
          <span className="font-semibold text-gray-900">${totalDue.toFixed(2)}</span>.
        </p>
        <div className="flex gap-3">
          <span className="rounded-full border border-emerald-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur-sm">
            {farmName || 'Agrilink Corp'}
          </span>
        </div>
      </div>

      {/* Right Side: Total Box */}
      <div className="rounded-2xl border border-emerald-200/60 bg-white/70 p-6 text-center shadow-sm backdrop-blur-sm">
        <span className="text-lg font-medium uppercase tracking-[0.12em] text-emerald-600">
          AMOUNT DUE
        </span>

        <div className="my-3 text-4xl font-bold text-gray-900 md:text-5xl">
          ${totalDue.toFixed(2)}
        </div>

        <p className="text-xs leading-relaxed text-emerald-700">
          Pay the farmer directly when your order is delivered.
        </p>
      </div>
    </div>
  );
}
