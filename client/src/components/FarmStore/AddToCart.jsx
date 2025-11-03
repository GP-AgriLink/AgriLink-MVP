const AddToCart = ({onClick, disabled}) => {
  return (
    <button
      onClick={disabled ? undefined : onClick} // prevent clicks when disabled
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        w-full
        px-4 py-3
        border border-transparent rounded-full
        shadow-lg shadow-teal-400/40
        text-sm sm:text-base font-semibold
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-opacity-75
        ${
          disabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
            : "bg-[#2a9d8f] hover:bg-[#268a7e] text-white cursor-pointer"
        }
      `}
    >
      <span className="text-2xl font-normal mr-2">+</span>
      Add to Cart
    </button>
  );
};

export default AddToCart;
