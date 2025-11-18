import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api';
import '../styles/Auth.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600';
      case 'Processing': return 'text-blue-600';
      case 'Shipped': return 'text-purple-600';
      case 'Delivered': return 'text-green-600';
      case 'Cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <h2>My Orders</h2>
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-container">
        <h2>My Orders</h2>
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center">
          <p className="mb-4">You haven't placed any orders yet.</p>
          <button
            onClick={() => navigate('/')}
            className="auth-button"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">Order #{order._id.slice(-8)}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </p>
                  <p className="text-lg font-bold">₹{order.totalAmount}</p>
                </div>
              </div>

              <div className="mb-2">
                <h4 className="font-medium mb-1">Items:</h4>
                <div className="space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} (x{item.quantity})</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {order.deliveryAddress && (
                <div className="text-sm text-gray-600">
                  <p><strong>Delivery Address:</strong></p>
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</p>
                  <p>Phone: {order.deliveryAddress.phone}</p>
                </div>
              )}

              <div className="mt-2 text-sm">
                <p><strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/')}
          className="auth-button"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
