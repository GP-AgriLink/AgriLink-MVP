import { useState } from "react";
import AddToCart from "./AddToCart.jsx";
import { useCart } from "../../context/CartContext";

const fallbackImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
      <rect width='100%' height='100%' fill='#cbd5d1'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6b7280' font-size='28'>No image</text>
    </svg>`
  );

const ProductCard = ({ product }) => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");
  const role = userData ? JSON.parse(userData).role : null;
  const { addToCart } = useCart();

  const {
    _id,
    name = "Unnamed Product",
    price = 0,
    description = "No description available.",
    imageUrl = fallbackImage,
    unit = "",
    tag,
    stock = 0,
  } = product;

  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!token) return;
    setAdding(true);
    try {
      await addToCart(product);
    } finally {
      setAdding(false);
    }
  };

  const isDisabled = !token || stock === 0 || adding;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 ease-in-out hover:shadow-xl">
      <div className="relative h-48 w-full overflow-hidden sm:h-56">
        <img
          className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
          src={imageUrl}
          alt={name}
        />
        {tag && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-[#2a9d8f] px-3 py-1.5 text-xs font-semibold text-white">
            {tag}
          </span>
        )}
        {stock === 0 ? (
          <span className="absolute right-4 top-4 z-10 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">
            Out of Stock
          </span>
        ) : stock < 10 ? (
          <span className="absolute right-4 top-4 z-10 rounded-full bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white">
            Low Stock
          </span>
        ) : null}
      </div>

      <div className="flex flex-grow flex-col p-6">
        <h3 className="mb-1 text-xl font-bold text-[#0a3832]">{name}</h3>
        <div className="mb-3 flex flex-row gap-1">
          <p className="text-base font-medium text-[#008c7a]">${price}</p>
          <p className="text-base font-medium text-[#5cb39f]">/ {unit}</p>
        </div>
        <p className="mb-6 flex-grow text-sm text-gray-500">{description}</p>

        {role !== "farmer" && (
          <div title={!token ? "Login to add to cart" : ""}>
            <AddToCart onClick={handleAddToCart} disabled={isDisabled} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
