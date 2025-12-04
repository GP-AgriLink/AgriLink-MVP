import React from "react";
import { Link } from "react-router-dom";

const EmptyCart = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <svg
        className="mb-4 h-24 w-24 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <h2 className="mb-2 text-2xl font-semibold text-gray-800">Your Cart is Empty</h2>
      <p className="mb-6 text-gray-500">Looks like you haven't added any products yet.</p>
      <Link
        to="/"
        className="rounded-full bg-[#10b981] px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-emerald-600"
      >
        Start Shopping
      </Link>
    </div>
  );
};

export default EmptyCart;
