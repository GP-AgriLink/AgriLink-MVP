import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/cartApi";
import CartBanner from "../components/Cart/CartBanner";
import CartSummary from "../components/Cart/CartSummary";
import EmptyCart from "../components/Cart/EmptyCart";
import { FiCheckCircle } from "react-icons/fi";
import LogoSpinner from "../components/common/LogoSpinner.jsx";

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    totalDue,
    groupedByFarm,
    isLoading: isCartLoading,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmitOrder = async () => {
    if (!user || user.role !== "customer") {
      toast.error("You must be logged in as a customer to place an order.");
      navigate("/login-customer", { state: { from: "/cart" } });
      return;
    }

    if (cartCount === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    // Validation: Check if user has real name
    // Option 1: If you have firstName & lastName
    const hasFirstName = user.firstName && user.firstName.trim().length > 0;
    const hasLastName = user.lastName && user.lastName.trim().length > 0;

    // Option 2: If you have fullName only (uncomment if needed)
    // const hasFullName = user.fullName && user.fullName.trim().length > 0;

    if (!hasFirstName || !hasLastName) {
      toast.error(
        "Please complete your profile with your real first and last name before placing an order.",
        {
          autoClose: 5000,
        }
      );
      navigate("/edit-profile", { state: { from: "/cart", requireName: true } });
      return;
    }

    setIsSubmitting(true);

    try {
      // NEW: Send empty body - backend reads cart from token
      const orders = await createOrder();

      // Backend returns array of orders (one per farm)
      const orderCount = orders.length;

      const farmNames = Object.values(groupedByFarm)
        .map((group) => group.farm.farmName)
        .join(", ");

      toast.success(
        `🎉 ${orderCount} order${orderCount > 1 ? "s" : ""} placed successfully! Orders from: ${farmNames}`,
        { autoClose: 5000 }
      );

      navigate("/dashboard/orders");

      // Clear cart after navigation
      setTimeout(() => {
        clearCart();
      }, 100);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to place order. Please try again.";
      toast.error(errorMessage, { autoClose: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCartLoading) {
    return (
      <div className="relative min-h-screen">
        <LogoSpinner message="Loading cart..." />
      </div>
    );
  }

  if (cartCount === 0) {
    return <EmptyCart />;
  }

  const farmCount = Object.keys(groupedByFarm).length;

  return (
    <div className="min-h-screen bg-emerald-50/50 px-4 py-6 md:py-12">
      <div className="mx-auto max-w-6xl">
        <CartBanner totalDue={totalDue} groupedByFarm={groupedByFarm} />

        <div className="mt-8 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CartSummary
              groupedByFarm={groupedByFarm}
              total={totalDue}
              itemCount={cartCount}
              onQuantityChange={updateQuantity}
              onRemoveItem={removeFromCart}
              onClearAll={clearCart}
            />
          </div>

          <div className="lg:col-span-1">
            {/* Name Validation Warning */}
            {user &&
              (!user.firstName ||
                !user.lastName ||
                user.firstName.trim().length === 0 ||
                user.lastName.trim().length === 0) && (
                <div className="mb-6 rounded-2xl border-2 border-red-300 bg-red-50 p-6 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-red-900">Profile Incomplete</h3>
                      <p className="mb-4 text-sm text-red-700">
                        You need to add your real first and last name before placing orders. This
                        helps farms identify and contact you properly.
                      </p>
                      <button
                        onClick={() =>
                          navigate("/edit-profile", { state: { from: "/cart", requireName: true } })
                        }
                        className="w-full rounded-lg bg-red-600 py-2.5 font-semibold text-white transition-all hover:bg-red-700"
                      >
                        Complete Your Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}

            <div className="sticky top-4 h-fit rounded-2xl bg-white p-6 shadow-lg md:p-8">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">Ready to Order?</h2>

              {farmCount > 1 && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="mb-2 text-sm font-semibold text-blue-800">
                    ℹ️ You're ordering from {farmCount} farms:
                  </p>
                  <ul className="ml-4 space-y-1 text-sm text-blue-700">
                    {Object.values(groupedByFarm).map((group, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                        <strong>{group.farm.farmName}</strong>
                        <span className="text-blue-600">- ${group.total.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-blue-600">
                    Each farm will receive a separate order.
                  </p>
                </div>
              )}

              <p className="mb-6 text-sm text-emerald-800">
                Your account details will be used for {farmCount > 1 ? "all orders" : "the order"}.
                {farmCount > 1 ? " Each farm" : " The farm"} will contact you at{" "}
                <strong>{user?.phone || "your phone number"}</strong> to confirm delivery.
              </p>

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={
                  isSubmitting ||
                  isCartLoading ||
                  !user?.firstName ||
                  !user?.lastName ||
                  user.firstName.trim().length === 0 ||
                  user.lastName.trim().length === 0
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiCheckCircle className="h-5 w-5" />
                {isSubmitting
                  ? "Placing Orders..."
                  : `Confirm ${farmCount > 1 ? `${farmCount} Orders` : "Order"} (Pay on Delivery)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
