import { Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';

const AdminRoute = ({ children }) => {
  const { user } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure user state is loaded
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, [user]);

  if (isLoading) {
    return <div className="auth-container"><div>Loading...</div></div>;
  }

  // Check if user exists AND is admin
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
