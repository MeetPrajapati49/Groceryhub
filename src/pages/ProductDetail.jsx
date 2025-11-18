import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api';
import './ProductDetail.css'; // We'll create this CSS file

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, wishlistItems, user } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load product details');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/products/${id}/reviews`);
      setReviews(response.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  const handleAddToWishlist = () => {
    if (product && user) {
      addToWishlist(product);
    } else {
      navigate('/Login');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/Login');
      return;
    }

    try {
      setSubmittingReview(true);
      await api.post(`/products/${id}/reviews`, newReview);
      setNewReview({ rating: 5, comment: '' });
      fetchReviews(); // Refresh reviews
      fetchProduct(); // Refresh product rating
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const isInWishlist = wishlistItems.some(item => item._id === id);

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="error-message">
          <p>{error || 'Product not found'}</p>
          <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail">
        <div className="product-images">
          <div className="main-image">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              loading="lazy"
            />
          </div>
          {product.images.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  onClick={() => setSelectedImage(index)}
                  className={selectedImage === index ? 'active' : ''}
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <div className="product-rating">
            <div className="stars">
              {'★'.repeat(Math.floor(product.rating.average))}
              {'☆'.repeat(5 - Math.floor(product.rating.average))}
            </div>
            <span>({product.rating.count} reviews)</span>
          </div>

          <div className="product-price">₹{product.price}</div>

          <div className="product-attributes">
            <span className="unit">Unit: {product.attributes.unit}</span>
            {product.attributes.isOrganic && <span className="badge organic">Organic</span>}
            {product.attributes.isVegan && <span className="badge vegan">Vegan</span>}
          </div>

          <div className="stock-status">
            {product.stock > 0 ? (
              <span className="in-stock">In Stock ({product.stock} available)</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>

          <p className="product-description">{product.description}</p>

          <div className="product-actions">
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
            <button
              className={`wishlist-btn ${isInWishlist ? 'in-wishlist' : ''}`}
              onClick={handleAddToWishlist}
            >
              {isInWishlist ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Customer Reviews</h2>

        {user && (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h3>Write a Review</h3>
            <div className="rating-input">
              <label>Rating:</label>
              <select
                value={newReview.rating}
                onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
              >
                {[1,2,3,4,5].map(num => (
                  <option key={num} value={num}>{num} Star{num !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Share your thoughts about this product..."
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              required
            />
            <button type="submit" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="review-item">
                <div className="review-header">
                  <div className="stars">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
                <span className="review-author">- {review.user.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
