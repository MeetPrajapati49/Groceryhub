import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Auth.css';

export default function Checkout() {
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { cartItems, placeOrder, user } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((total, item) => total + ((item.product?.price || item.price) * item.quantity), 0);
  const delivery = subtotal > 500 ? 0 : 50;
  const total = subtotal + delivery;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode || !deliveryAddress.phone) {
      setError('Please fill in all delivery address fields');
      return;
    }

    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      await placeOrder(deliveryAddress, paymentMethod);
      navigate('/orders');
    } catch (err) {
      console.error('Order placement error:', err);
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="auth-container">
      <h2>Checkout</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Order Summary</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {cartItems.map((item) => (
              <div key={item.product?._id || item._id} className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-medium">{item.product?.name || item.name}</span>
                  <span className="text-gray-600 ml-2">x{item.quantity}</span>
                </div>
                <span>₹{(item.product?.price || item.price) * item.quantity}</span>
              </div>
            ))}
            <hr className="my-2" />
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span className={delivery === 0 ? "text-green-600" : ""}>
                {delivery === 0 ? "FREE" : `₹${delivery}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        {/* Delivery & Payment Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-semibold">Delivery Address</h3>

            <input
              type="text"
              name="street"
              placeholder="Street Address"
              value={deliveryAddress.street}
              onChange={handleInputChange}
              className="auth-input"
              required
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={deliveryAddress.city}
              onChange={handleInputChange}
              className="auth-input"
              required
            />

            <input
              type="text"
              name="state"
              placeholder="State"
              value={deliveryAddress.state}
              onChange={handleInputChange}
              className="auth-input"
              required
            />

            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={deliveryAddress.pincode}
              onChange={handleInputChange}
              className="auth-input"
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={deliveryAddress.phone}
              onChange={handleInputChange}
              className="auth-input"
              required
            />

            <h3 className="text-xl font-semibold">Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                  required
                />
                Cash on Delivery
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Online"
                  checked={paymentMethod === 'Online'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                />
                Online Payment
              </label>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button
              type="submit"
              className="auth-button w-full"
              disabled={loading}
            >
              {loading ? 'Placing Order...' : `Place Order - ₹${total}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
