
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext";
import "../styles/Auth.css";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, userLoading, addToCart } = useCart();
  const navigate = useNavigate();

  const loadWishlist = useCallback(async () => {
    try {
      const res = await api.get(`/wishlist/${user.id}`, { withCredentials: true });
      setWishlist(res.data.products || []);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (userLoading) return; // Wait for auth check to complete
    if (!user) {
      navigate("/login");
      return;
    }
    loadWishlist();
  }, [user, userLoading, navigate, loadWishlist]);

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${user.id}/${productId}`, { withCredentials: true });
      setWishlist(prev => prev.filter(product => product._id !== productId));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const handleAddToCart = async (product) => {
    await addToCart(product);
    // Optionally remove from wishlist after adding to cart
    // removeFromWishlist(product._id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading wishlist...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">❤️</div>
            <p className="text-xl text-gray-600 mb-6">Your wishlist is empty</p>
            <button
              onClick={() => navigate("/")}
              className="auth-button"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((product) => (
                <div key={product._id} className="bg-white shadow-md rounded-2xl p-6 transition-all duration-200 hover:shadow-lg">
                  <div className="relative">
                    <img
                      src={product.images?.[0] || product.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4="}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-xl mb-4 max-w-full"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=";
                      }}
                    />
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Remove from wishlist"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600">{product.rating?.average || 4.5}</span>
                      <span className="text-sm text-gray-500">({product.rating?.count || 100}+)</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mb-4">₹{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={async () => {
                  for (const product of wishlist) {
                    await handleAddToCart(product);
                  }
                  navigate("/cart");
                }}
                className="auth-button"
              >
                Add All to Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
