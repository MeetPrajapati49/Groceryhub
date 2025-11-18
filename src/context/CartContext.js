import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [cartError, setCartError] = useState(null);
  const [wishlistError, setWishlistError] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const navigate = useNavigate();

  const loadCart = async () => {
    setCartLoading(true);
    setCartError(null);
    try {
      const res = await api.get("/cart", { withCredentials: true });
      setCartItems(res.data?.items || []);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/login");
      } else {
        console.error("Failed to load cart:", error);
        setCartError("Failed to load cart. Please try again.");
      }
    } finally {
      setCartLoading(false);
    }
  };

  const loadWishlist = async () => {
    if (!user || !user.id) return;
    setWishlistLoading(true);
    setWishlistError(null);
    try {
      const res = await api.get(`/wishlist/${user.id}`, { withCredentials: true });
      setWishlistItems(res.data.products || []);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      setWishlistError("Failed to load wishlist. Please try again.");
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me", { withCredentials: true });
        if (res.data) {
          setUser(res.data);
          // Load cart and wishlist if user is logged in
          await loadCart();
          await loadWishlist();
        }
      } catch (error) {
        // User not logged in
        console.log('User not authenticated');
      } finally {
        setUserLoading(false);
      }
    };

    checkAuth();
  }, []);

  const addToCart = async (product, quantity = 1) => {
    if (userLoading) return; // Wait for auth check to complete
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await api.post("/cart/add", { productId: product._id, quantity }, { withCredentials: true });
      await loadCart();
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await api.post("/cart/remove", { productId }, { withCredentials: true });
      await loadCart();
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  const addToWishlist = async (productId) => {
    if (userLoading) return; // Wait for auth check to complete
    if (!user || !user.id) {
      navigate("/login");
      return;
    }
    try {
      const userId = user.id;
      console.log('Adding to wishlist:', { userId, productId });
      await api.post("/wishlist/add", { userId, productId }, { withCredentials: true });
      await loadWishlist();
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user || !user.id) return;
    try {
      await api.delete(`/wishlist/${user.id}/${productId}`, { withCredentials: true });
      await loadWishlist();
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password }, { withCredentials: true });
      setUser(res.data.user);
      await loadCart();
      await loadWishlist();
      return res.data.user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password }, { withCredentials: true });
      setUser(res.data.user);
      await loadCart();
      await loadWishlist();
      return res.data.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      setUser(null);
      setCartItems([]);
      setWishlistItems([]);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const placeOrder = async (deliveryAddress, paymentMethod) => {
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.product?._id || item._id,
          name: item.product?.name || item.name,
          price: item.product?.price || item.price,
          quantity: item.quantity,
          image: item.product?.image || item.image
        })),
        totalAmount: cartItems.reduce((total, item) => total + ((item.product?.price || item.price) * item.quantity), 0),
        deliveryAddress,
        paymentMethod
      };

      const response = await api.post('/orders', orderData, { withCredentials: true });
      setCartItems([]); // Clear cart after successful order
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      setCartItems,
      wishlistItems,
      setWishlistItems,
      user,
      userLoading,
      cartError,
      wishlistError,
      cartLoading,
      wishlistLoading,
      addToCart,
      removeFromCart,
      addToWishlist,
      removeFromWishlist,
      login,
      register,
      logout,
      placeOrder
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
