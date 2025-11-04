import React from 'react';
import { Link } from 'react-router-dom';

const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Cart is Empty</h2>
      <p className="text-gray-500 mb-6">
        Looks like you haven't added any products yet.
      </p>
      <Link
        to="/discover"
        className="px-6 py-3 bg-[#10b981] text-white font-semibold rounded-full transition-all hover:bg-emerald-600 shadow-lg"
      >
        Start Shopping
      </Link>
    </div>
  );
};

export default EmptyCart;