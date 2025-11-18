import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext";
import "./CategoryPage.css";

export default function CategoryPage() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!category) return;
    const fetchProducts = async () => {
      try {
        const res = await api.get(`/products?category=${category}`);
        setProducts(res.data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  if (!category) {
    return (
      <div className="error-container">
        <div className="error-text">Category not found.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="category-container">
      {/* Top Banner */}
      <div className="category-top-banner">
        <div className="banner-left">
          <span>Deliver to: Surat, Gujarat</span>
        </div>
        <div className="banner-right">
          <span className="banner-sale">Festive Sale!</span> Up to 50% off
        </div>
      </div>

      <div className="category-header">
        <button
          onClick={() => navigate('/')}
          className="go-back-btn"
        >
          ← Go Back to Home
        </button>
        <h1 className="category-title">
          {category.replace('-', ' ')}
        </h1>
      </div>

      {/* Search Bar */}
      <div className="category-search">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="category-search-input"
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p className="no-products-text">No products found in this category.</p>
        </div>
      ) : (
        <div className="category-products-grid">
          {filteredProducts.map((product) => (
            <div key={product._id} className="category-product-card">
              <img
                src={product.images?.[0] || product.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4="}
                alt={product.name}
                className="category-product-image"
              />
              <h3 className="category-product-name">{product.name}</h3>
              <p className="category-product-price">₹{product.price}</p>
              <div className="category-buttons">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="category-btn add-to-cart-btn"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="category-btn view-product-btn"
                >
                  View Product
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
