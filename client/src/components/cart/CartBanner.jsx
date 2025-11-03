export default function CartBanner({ totalDue, farmName }) {
  return (
    <div className="bg-emerald-100 rounded-2xl shadow-lg p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
      {/* Left Side: Title */}
      <div className="md:col-span-2">
        <span className="text-emerald-700 font-semibold text-sm uppercase tracking-wider">
          CONFIRM YOUR ORDER
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
          Pay on delivery with confidence.
        </h1>
        <p className="text-emerald-900 mb-4">
          Pay on delivery to {farmName || "Agrilink Corp"}. Your total due is{" "}
          <span className="font-medium text-emerald-900">
            ${totalDue.toFixed(2)}
          </span>
          .
        </p>
        <div className="flex gap-2">
          <span className="bg-white/70 border border-emerald-200 text-emerald-800 text-base font-semibold px-5 py-2 rounded-full">
            {farmName || "Agrilink Corp"}
          </span>
        </div>
      </div>

      {/* Right Side: Total Box */}
      <div className="bg-white/60 backdrop-blur-sm border border-emerald-200 rounded-xl p-4 md:p-6 text-center">
        <span className="font-bold text-emerald-700 text-sm uppercase tracking-wide">
          AMOUNT DUE
        </span>

        <div className="text-3xl sm:text-4xl font-bold text-gray-900 my-2">
          ${totalDue.toFixed(2)}
        </div>

        <p className="text-emerald-700 text-xs">
          Pay the farmer directly when your order is delivered.
        </p>
      </div>
    </div>
  );
}
