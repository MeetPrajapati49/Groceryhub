import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useCart } from "./context/CartContext";
import api from "./api";





const GroceryHub = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 30 });
  const [userLocation, setUserLocation] = useState({ city: 'Your Location', pincode: '' });
  const [locationLoading, setLocationLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAccount, setShowAccount] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();
  const { cartItems, addToCart, addToWishlist, removeFromWishlist, wishlistItems, user, logout } = useCart();
  // Cart item count from context
  const cartItemCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);
  const toggleCart = () => {
  navigate("/cart");


};

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      setSearchLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(query)}&limit=10`);
        setSearchResults(res.data.products || []);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Slideshow data
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&h=600&fit=crop",
      title: "Fresh Groceries Delivered",
      subtitle: "Get the best quality products at your doorstep",
      buttonText: "Shop Now"
    },
    {
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&h=600&fit=crop",
      title: "100% Organic Vegetables",
      subtitle: "Farm fresh vegetables delivered daily",
      buttonText: "Explore"
    },
    {
      image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1600&h=600&fit=crop",
      title: "Premium Fresh Fruits",
      subtitle: "Handpicked seasonal fruits",
      buttonText: "Order Now"
    }
  ];




  // Categories data
  const categories = [
    { icon: "🥬", name: "Vegetables", route: "/category/vegetables", image: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400" },
    { icon: "🍎", name: "Fruits", route: "/category/fruits", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400" },
    { icon: "🥛", name: "Dairy", route: "/category/dairy", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400" },
    { icon: "🍞", name: "Bakery", route: "/category/bakery", image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400" },
    { icon: "🥩", name: "Meat", route: "/category/meat", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400" },
    { icon: "🍿", name: "Snacks", route: "/category/snacks", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400" },
    { icon: "🥤", name: "Beverages", route: "/category/beverages", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400" },
    { icon: "🌾", name: "Offers", route: "/category/offers", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
    { icon: "🍞", name: "New Arrivals", route: "/category/new-arrivals", image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400" }
  ];

  // Trending products
  const trendingProducts = [
  { _id: "201", name: "Basmati Rice 5kg", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400", price: 599, rating: 4.4, reviews: 1250 },
  { _id: "202", name: "Premium Honey", image: "https://images.pexels.com/photos/33260/honey-sweet-syrup-organic.jpg", price: 299, rating: 4.8, reviews: 890 },
  { _id: "203", name: "Organic Tea", image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400", price: 149, rating: 4.2, reviews: 567 },
  { _id: "204", name: "Mixed Dry Fruits", image: "https://dryfruitsmandy.com/wp-content/uploads/2021/02/MIX-DRIED-FRUITS.jpg", price: 699, rating: 4.6, reviews: 423 },
  { _id: "205", name: "Fresh Bread", image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400", price: 45, rating: 4.1, reviews: 234 }
];
    // Get user's location on component mount
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              
              // Using BigDataCloud's free reverse geocoding API (no API key required)
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              
              if (response.ok) {
                const data = await response.json();
                const city = data.city || 
                           data.locality || 
                           data.principalSubdivision || 
                           'Your City';
                
                const pincode = data.postcode || '';
                
                setUserLocation({ city, pincode });
              }
            } catch (error) {
              console.log('Error getting location details:', error);
              setUserLocation({ city: 'Your Location', pincode: '' });
            } finally {
              setLocationLoading(false);
            }
          },
          (error) => {
            console.log('Geolocation error:', error);
            // Handle different error cases
            if (error.code === error.PERMISSION_DENIED) {
              setUserLocation({ city: 'Location Denied', pincode: '' });
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              setUserLocation({ city: 'Location Unavailable', pincode: '' });
            } else {
              setUserLocation({ city: 'Your Location', pincode: '' });
            }
            setLocationLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 
          }
        );
      } else {
        setUserLocation({ city: 'Location Not Supported', pincode: '' });
        setLocationLoading(false);
      }
    };

    getUserLocation();
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;

        if (totalSeconds <= 0) {
          return { hours: 23, minutes: 59, seconds: 59 };
        } else {
          return {
            hours: Math.floor(totalSeconds / 3600),
            minutes: Math.floor((totalSeconds % 3600) / 60),
            seconds: totalSeconds % 60
          };
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const res = await api.get("/products");
        setProducts(res.data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProductsError("Failed to load products. Please try again.");
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const showSlide = (index) => {
    setCurrentSlideIndex(index);
  };

  const nextSlide = () => {
    setCurrentSlideIndex(prev => (prev + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrentSlideIndex(prev => (prev - 1 + slides.length) % slides.length);
  };

  


  const toggleMobileMenu = () => {
    console.log('Mobile menu toggled');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-800 via-purple-800 to-pink-700 text-white text-sm py-2 px-6 flex justify-between items-center flex-wrap">
        <div className="flex items-center gap-4">
          <span>
            📍 Deliver to {locationLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              `${userLocation.city}${userLocation.pincode ? ` ${userLocation.pincode}` : ''}`
            )}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="animate-pulse">🎊 Festive Sale Live!</span>
          <span>Free Delivery on Orders ₹299+</span>
          <span>🔔</span>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span 
                style={{ display: 'block', width: '24px', height: '24px', fontSize: '24px', cursor: 'pointer' }}
                onClick={toggleMobileMenu}
              >
                ☰
              </span>
              <h1 className="logo">GroceryHub</h1>
            </div>

            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search for groceries, brands, and more..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <span className="search-icon">🔍</span>
              {searchQuery && (
                <div className="search-dropdown">
                  {searchLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(product => (
                      <div key={product._id} className="search-result">
                        <img
                          src={product.images?.[0] || product.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4="}
                          alt={`${product.name} - ${product.category || 'Grocery item'}`}
                          className="result-image"
                        />
                        <span>{product.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600">No products found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="header-actions">
              <div className="account-menu">
                  <button className="header-btn" onClick={() => setShowAccount(!showAccount)}>
                    <span>👤</span>
                    <span>Account</span>
                   </button>
                    {showAccount && (
            <div className="account-dropdown">
              {user ? (
                <>
                  <div className="user-info">
                    <span>Welcome, {user.name}</span>
                  </div>
                  <Link to="/orders">My Orders</Link>
                  <Link to="/wishlist">Wishlist</Link>
                  <Link to="/admin">Admin Panel</Link>
                  <button onClick={logout} className="logout-btn">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/signup">Register</Link>
                  <Link to="/admin">Admin Panel</Link>
                  <Link to="/orders">My Orders</Link>
                  <Link to="/wishlist">Wishlist</Link>
                </>
              )}
            </div>
          )}
</div>

              <Link to="/wishlist" className="header-btn">
                <span>❤️</span>
                <span>Wishlist</span>
              </Link>
              <button className="cart-btn" onClick={toggleCart}>
                <span>🛒</span>
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span className="cart-count">{cartItemCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        <div className="container">
          <div className="nav-items">
            <Link to="/" className="nav-item">All Categories</Link>
            <Link to="/category/vegetables" className="nav-item">Vegetables</Link>
            <Link to="/category/fruits" className="nav-item">Fruits</Link>
            <Link to="/category/dairy" className="nav-item">Dairy</Link>
            <Link to="/category/bakery" className="nav-item">Bakery</Link>
            <Link to="/category/meat" className="nav-item">Meat</Link>
            <Link to="/category/snacks" className="nav-item">Snacks</Link>
            <Link to="/category/beverages" className="nav-item">Beverages</Link>
            <Link to="/category/offers" className="nav-item">Offers</Link>
            <Link to="/category/new-arrivals" className="nav-item">New Arrivals</Link>
          </div>
        </div>
      </nav>

      {/* Hero Slideshow */}
      <section className="hero-section">
        <div className="container">
          <div className="slideshow-container">
            <div 
              className="slideshow"
              style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="slide">
                  <img src={slide.image} alt={`${slide.title} - ${slide.subtitle}`} />
                  <div className="slide-overlay"></div>
                  <div className="slide-content">
                    <h2 className="slide-title">{slide.title}</h2>
                    <p className="slide-subtitle">{slide.subtitle}</p>
                    <button className="slide-btn">{slide.buttonText}</button>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="nav-btn prev" onClick={previousSlide}>‹</button>
            <button className="nav-btn next" onClick={nextSlide}>›</button>
            
            <div className="indicators">
              {slides.map((_, index) => (
                <button 
                  key={index}
                  className={`indicator ${index === currentSlideIndex ? 'active' : ''}`}
                  onClick={() => showSlide(index)}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Timer */}
      <section className="flash-sale">
        <div className="container">
          <div className="flash-sale-container">
            <div className="flash-sale-content">
              <div className="flash-sale-info">
                <div className="flash-icon">⚡</div>
                <div>
                  <h2 className="flash-title">⚡ Flash Sale</h2>
                  <p className="flash-subtitle">Limited time offers - Grab them now!</p>
                </div>
              </div>
              <div className="timer">
                <span>🕐</span>
                <div className="timer-display">
                  <div className="timer-box">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <span>:</span>
                  <div className="timer-box">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <span>:</span>
                  <div className="timer-box">{String(timeLeft.seconds).padStart(2, '0')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Items */}
      <section className="products-section">
        <div className="container">
          {productsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : productsError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{productsError}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.slice(0, 4).map((product) => (
                <Link key={product._id} to={`/product/${product._id}`} className="product-card">
                  <div className="discount-badge">20% OFF</div>
                  <img
                    src={product.images?.[0] || product.image}
                    alt={`${product.name} - ${product.category || 'Grocery item'}`}
                    className="product-image"
                    loading="lazy"
                  />
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-rating">
                      <div className="rating-stars">
                        <span style={{ color: '#fbbf24' }}>★</span>
                        <span className="rating-text">{product.rating?.average || 4.5}</span>
                      </div>
                      <span className="rating-text">({product.rating?.count || 100}+ sold)</span>
                    </div>
                    <div className="product-prices">
                      <span className="sale-price">₹{product.price}</span>
                      <span className="original-price">₹{Math.round(product.price * 1.25)}</span>
                    </div>
                     <button className="add-to-cart" onClick={(e) => { e.preventDefault(); addToCart(product); }}>
                      Add to Cart
                    </button>
                  </div>
                </Link>
              ))}
            </div>

          )}
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <Link key={index} to={category.route} className="category-card">
                <div className="category-icon">{category.icon}</div>
                <img src={category.image} alt={category.name} className="category-image" />
                <p className="category-name">{category.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Deals */}
      <section className="trending-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>Trending Deals</h2>
            <a href="#" className="view-all-btn">
              <span>View All</span>
              <span>›</span>
            </a>
          </div>
          <div className="trending-grid">
            {products.slice(4, 9).map((product) => (
              <Link key={product._id} to={`/product/${product._id}`} className="trending-card">
                <div className="trending-image-container">
                  <img src={product.images?.[0] || product.image} alt={`${product.name} - ${product.category || 'Grocery item'}`} className="trending-image" loading="lazy" />
                  <button
                    className={`wishlist-btn ${wishlistItems.some(item => item._id === product._id) ? 'wishlist-active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (wishlistItems.some(item => item._id === product._id)) {
                        removeFromWishlist(product._id);
                      } else {
                        addToWishlist(product._id);
                      }
                    }}
                    title={wishlistItems.some(item => item._id === product._id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {wishlistItems.some(item => item._id === product._id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div className="trending-info">
                  <h3 className="trending-name">{product.name}</h3>
                  <div className="product-rating">
                    <div className="rating-stars">
                      <span style={{ color: '#fbbf24' }}>★</span>
                      <span className="rating-text">{product.rating?.average || 4.5}</span>
                    </div>
                    <span className="rating-text">(100+ reviews)</span>
                  </div>
                  <div className="trending-footer">
                    <span className="trending-price">₹{product.price}</span>
                    <button
  className="add-btn"
  onClick={(e) => { e.preventDefault(); addToCart(product); }}
>
  Add
</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Floating Cart Button */}
      
      <button className="floating-cart" onClick={toggleCart}>
        <span>🛒</span>
        <span>Cart</span>
        {cartItemCount > 0 && (
          <span className="cart-count">{cartItemCount}</span>
        )}
      </button>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3 className="footer-brand">GroceryHub</h3>
              <p className="footer-description">Fresh groceries delivered to your doorstep with love and care.</p>
            </div>
            <div>
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-title">Categories</h4>
              <ul className="footer-links">
                <li><a href="#">Vegetables</a></li>
                <li><a href="#">Fruits</a></li>
                <li><a href="#">Dairy</a></li>
                <li><a href="#">Bakery</a></li>
                <li><a href="#">Meat</a></li>
                <li><a href="#">Snacks</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-title">Customer Service</h4>
              <ul className="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Track Order</a></li>
                <li><a href="#">Returns</a></li>
                <li><a href="#">Shipping Info</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 GroceryHub. All rights reserved. Made with ❤️ for fresh food lovers.</p>
          </div>
        </div>
      </footer>
    </div>
    
  );
  
};

export default GroceryHub;
