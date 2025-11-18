import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([
    { id: 1, image: 'https://via.placeholder.com/50', name: 'Organic Apple', category: 'fruits', price: 99 },
    { id: 2, image: 'https://via.placeholder.com/50', name: 'Fresh Carrot', category: 'vegetables', price: 49 },
    // Add more dummy products
  ]);
  const [orders, setOrders] = useState([
    { id: '#001', customer: 'John Doe', date: '2024-01-15', status: 'Pending', total: 299 },
    { id: '#002', customer: 'Jane Smith', date: '2024-01-16', status: 'Shipped', total: 150 },
    // Add more
  ]);
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin User', email: 'admin@groceryhub.com', role: 'Admin', joinDate: '2023-12-01' },
    { id: 2, name: 'Regular User', email: 'user@groceryhub.com', role: 'User', joinDate: '2024-01-10' },
    // Add more
  ]);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', image: '' });

  useEffect(() => {
    const path = location.pathname.split('/admin/')[1] || 'dashboard';
    setActiveSection(path || 'dashboard');
  }, [location]);

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      // Update existing
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...newProduct } : p));
      setEditingProduct(null);
    } else {
      // Add new
      setProducts([...products, { id: Date.now(), ...newProduct }]);
    }
    setShowAddModal(false);
    setNewProduct({ name: '', category: '', price: '', image: '' });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({ name: product.name, category: product.category, price: product.price, image: product.image });
    setShowAddModal(true);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleOrderStatusChange = (id, status) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleLogout = () => {
    // Dummy logout
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const renderDashboard = () => (
    <div className="stats-container">
      <div className="card">
        <h3>Total Products</h3>
        <p className="stat-number">52</p>
      </div>
      <div className="card">
        <h3>Total Orders</h3>
        <p className="stat-number">20</p>
      </div>
      <div className="card">
        <h3>Total Users</h3>
        <p className="stat-number">105</p>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div>
      <div className="section-header">
        <h2>Products</h2>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>Add Product</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td><img src={product.image} alt={product.name} width="50" /></td>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>₹{product.price}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEditProduct(product)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderOrders = () => (
    <div>
      <h2>Orders</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.date}</td>
              <td>
                <select value={order.status} onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}>
                  <option>Pending</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                </select>
              </td>
              <td>₹{order.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderUsers = () => (
    <div>
      <h2>Users</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Join Date</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.joinDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'products':
        return renderProducts();
      case 'orders':
        return renderOrders();
      case 'users':
        return renderUsers();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="admin-container">
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        ☰
      </button>

      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <h2>Admin Panel</h2>
        <ul>
          <li className={activeSection === 'dashboard' ? 'active' : ''}>
            <Link to="/admin" onClick={() => setActiveSection('dashboard')}>Dashboard</Link>
          </li>
          <li className={activeSection === 'products' ? 'active' : ''}>
            <Link to="/admin/products" onClick={() => setActiveSection('products')}>Products</Link>
          </li>
          <li className={activeSection === 'orders' ? 'active' : ''}>
            <Link to="/admin/orders" onClick={() => setActiveSection('orders')}>Orders</Link>
          </li>
          <li className={activeSection === 'users' ? 'active' : ''}>
            <Link to="/admin/users" onClick={() => setActiveSection('users')}>Users</Link>
          </li>
        </ul>
        <div className="sidebar-footer">
          <Link to="/login" onClick={handleLogout}>Logout</Link>
        </div>
      </aside>

      <main className="main-content">
        {renderContent()}
      </main>

      {/* Add/Edit Product Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleAddProduct}>
              <input
                type="text"
                placeholder="Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
              />
              <input
                type="url"
                placeholder="Image URL"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              />
              <div className="modal-buttons">
                <button type="submit">{editingProduct ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setEditingProduct(null);
                  setNewProduct({ name: '', category: '', price: '', image: '' });
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
