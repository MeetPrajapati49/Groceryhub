import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const [user, setUser] = useState(null);
  const { user: contextUser } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Use user from context if available, otherwise fallback to localStorage
    if (contextUser) {
      setUser(contextUser);
    } else {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) setUser(storedUser);
    }
  }, [contextUser]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/"); 
  };

  return (
    <nav className="navbar">
      <h1 className="logo">GroceryHub</h1>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/category/vegetables">Vegetables</Link></li>
        <li><Link to="/category/fruits">Fruits</Link></li>
        <li><Link to="/category/dairy">Dairy</Link></li>
        <li><Link to="/category/snacks">Snacks</Link></li>
        <li><Link to="/category/beverages">Beverages</Link></li>
        <li><Link to="/category/offers">Offers</Link></li>
        <li><Link to="/category/new-arrivals">New Arrivals</Link></li>
        <li><Link to="/wishlist">Wishlist</Link></li>
        <li><Link to="/cart">Cart</Link></li>

        <li className="account-dropdown">
          {user ? (
            <>
              <span>Hello, {user.name}</span>
              <ul>
                <li><Link to="/orders">My Orders</Link></li>
                {user.role === 'admin' && <li><Link to="/admin">Admin Panel</Link></li>}
                <li><button onClick={handleLogout}>Logout</button></li>
              </ul>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
            </>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
