import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { login } = useCart();

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          console.log('Current user:', userData);
        }
      } catch (error) {
        console.log('No active session');
      }
    };

    checkSession();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    try {
      const user = await login(email, password);
      console.log('Login successful:', user);

      // Check if user has admin role
      if (user && user.role === 'admin') {
        console.log('Redirecting to admin panel');
        navigate('/admin'); // Use navigate instead of window.location
      } else {
        console.log('Redirecting to home');
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
        <button type="submit" className="auth-button">Login</button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <p className="auth-switch">
        Don't have an account? <a href="/signup">Register here</a>
      </p>
    </div>
  );
}
