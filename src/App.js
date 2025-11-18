// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import GroceryHub from './homepage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register';
import UserDashboard from './pages/Dashboard';
import Cart from "./pages/Cart.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import Orders from "./pages/Orders.jsx";
import Checkout from "./pages/Checkout.jsx";
import AdminLayout from "./admin/AdminLayout";
import AdminRoute from "./components/AdminRoute";
import Dashboard from "./admin/Dashboard";
import ProductList from "./admin/Products/ProductList";
import ProductForm from "./admin/Products/ProductForm";
import CategoryList from "./admin/Categories/CategoryList";
import CategoryForm from "./admin/Categories/CategoryForm";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<GroceryHub />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/category/:category" element={<CategoryPage />} />

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/edit/:id" element={<CategoryForm />} />
        </Route>
        <Route path="*" element={<GroceryHub />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
