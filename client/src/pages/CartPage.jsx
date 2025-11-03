import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CartBanner from "../components/cart/CartBanner";
import CartSummary from "../components/cart/CartSummary";
import ContactForm from "../components/cart/ContactForm";

// (Mock data and farm data are the same)
const MOCK_CART_DATA = [
  {
    id: "690304eb228ed2b84509a187", // Strawberry _id
    name: "frawla",
    qty: 1, // Default quantity
    unit: "kg",
    price: 5.5,
    stock: 50, // Added the stock limit
  },
  {
    id: "690304eb228ed2b84509a188", // Tomato _id
    name: "Tomatem",
    qty: 1,
    unit: "kg",
    price: 3.25,
    stock: 150, // Added the stock limit
  },
  {
    id: "690304eb228ed2b84509a189", // Batates _id
    name: "Batates",
    qty: 1, // Default quantity
    unit: "kg",
    price: 2.5,
    stock: 200, // Added the stock limit
  },
];

const MOCK_FARM_DATA = {
  _id: "690301ce0ad804170c5f2571", // Farm ID
  name: "AgriLink Corp",
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [farmData, setFarmData] = useState({});
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    const items = storedCart ? JSON.parse(storedCart) : MOCK_CART_DATA;
    setCartItems(items);
    setFarmData(MOCK_FARM_DATA);
    if (!storedCart) {
      localStorage.setItem("cart", JSON.stringify(MOCK_CART_DATA));
    }
  }, []);

  const updateCart = (newCartItems) => {
    setCartItems(newCartItems);
    localStorage.setItem("cart", JSON.stringify(newCartItems));
  };

  const totalDue = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + item.price * (item.qty || 0),
      0
    );
  }, [cartItems]);

  const handleQuantityChange = (itemId, newQtyString) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    if (newQtyString === "") {
      const newCartItems = cartItems.map((i) =>
        i.id === itemId ? { ...i, qty: "" } : i
      );
      updateCart(newCartItems);
      return;
    }

    let newQty = parseInt(newQtyString, 10);
    if (isNaN(newQty)) return;
    if (newQty < 1) newQty = 1;

    if (newQty > item.stock) {
      alert(`Cannot add more. Stock limit for ${item.name} is ${item.stock}.`);
      newQty = item.stock;
    }

    const newCartItems = cartItems.map((i) =>
      i.id === itemId ? { ...i, qty: newQty } : i
    );
    updateCart(newCartItems);
  };

  const handleRemoveItem = (itemId) => {
    const newCartItems = cartItems.filter((item) => item.id !== itemId);
    updateCart(newCartItems);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleClearCart = () => {
    updateCart([]);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderItems = cartItems.map((item) => ({
      productId: item.id,
      name: item.name,
      quantity: item.qty || 1,
      unitPrice: item.price,
    }));

    const orderData = {
      farmerId: farmData._id,
      customerName: fullName,
      customerPhone: phoneNumber,
      orderItems: orderItems,
    };

    try {
      await axios.post("/api/orders", orderData);
      alert("Order Confirmed!");
      updateCart([]);

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert("Failed to place order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/50 py-6 md:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <CartBanner totalDue={totalDue} farmName={farmData.name} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <CartSummary
              items={cartItems}
              total={totalDue}
              itemCount={cartItems.length}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
              onClearAll={handleClearCart}
            />
          </div>

          <div className="lg:col-span-1 h-fit bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <ContactForm
              fullName={fullName}
              setFullName={setFullName}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              onSubmit={handleSubmitOrder}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
