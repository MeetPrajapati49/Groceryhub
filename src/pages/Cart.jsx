import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext";
import "../styles/Auth.css";

export default function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const { user, setCartItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/cart", { withCredentials: true });
        setCart(res.data || { items: [] });
        setCartItems(res.data?.items || []);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        // Fallback to localStorage if API fails
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart({ items: localCart });
        setCartItems(localCart);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [setCartItems]);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.put("/cart/update", { productId, quantity: newQuantity }, { withCredentials: true });
      // Refetch cart
      const res = await api.get("/cart", { withCredentials: true });
      setCart(res.data || { items: [] });
      setCartItems(res.data?.items || []);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      // Update local state optimistically
      setCart(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.product?._id === productId ? { ...item, quantity: newQuantity } : item
        )
      }));
      // Sync to localStorage
      localStorage.setItem("cart", JSON.stringify(cart.items.map(item =>
        item.product?._id === productId ? { ...item, quantity: newQuantity } : item
      )));
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.post("/cart/remove", { productId }, { withCredentials: true });
      const res = await api.get("/cart", { withCredentials: true });
      setCart(res.data || { items: [] });
      setCartItems(res.data?.items || []);
    } catch (error) {
      console.error("Failed to remove item:", error);
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item.product?._id !== productId)
      }));
      localStorage.setItem("cart", JSON.stringify(cart.items.filter(item => item.product?._id !== productId)));
    }
  };

  const subtotal = cart.items.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
  const delivery = subtotal > 500 ? 0 : 50;
  const total = subtotal + delivery;

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Navigate to checkout page
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
            <button
              onClick={() => navigate("/")}
              className="auth-button"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.product?._id || item._id} className="bg-white shadow-md rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 transition-all duration-200 hover:shadow-lg">
                  <img
                    src={item.product?.images?.[0] || item.product?.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4="}
                    alt={item.product?.name || 'Unknown Product'}
                    className="w-24 h-24 object-cover rounded-xl"
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=";
                    }}
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-semibold text-gray-900">{item.product?.name || 'Unknown Product'}</h3>
                    <p className="text-gray-600">₹{item.product?.price || 0} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.product?._id, item.quantity - 1)}
                      className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}
                      className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xl font-bold text-green-600">₹{(item.product?.price || 0) * item.quantity}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product?._id)}
                    className="text-red-500 hover:text-red-700 transition-all duration-200 hover:scale-110"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white shadow-md rounded-2xl p-6 sticky top-4">
                <h2 className="text-2xl font-bold mb-6">Cart Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className={delivery === 0 ? "text-green-600" : ""}>
                      {delivery === 0 ? "FREE" : `₹${delivery}`}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-green-600">₹{total}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full auth-button"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
