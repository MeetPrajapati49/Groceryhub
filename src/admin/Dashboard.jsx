
import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  BarChart3,
  TrendingUp,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
    monthlySales: [],
    topProducts: [],
    liveUsers: 0,
    liveProducts: 0
  });
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/analytics/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString()}`;
  const formatDate = (date) => new Date(date).toLocaleDateString();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-500 text-white';
      case 'Shipped': return 'bg-blue-500 text-white';
      case 'Processing': return 'bg-amber-500 text-white';
      case 'Pending': return 'bg-slate-500 text-white';
      case 'Cancelled': return 'bg-red-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  // eslint-disable-next-line no-unused-vars
  const getTrendIcon = (trend) => {
    return trend === 'up' ?
      <ArrowUpRight className="w-4 h-4 text-green-400" /> :
      <ArrowDownRight className="w-4 h-4 text-red-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-900 text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-['Poppins']">
      {/* Main Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="flex flex-wrap gap-6 mb-8">
          {[
            { icon: Package, label: 'Live Products', value: stats.liveProducts || stats.totalProducts, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50' },
            { icon: ShoppingCart, label: 'Total Orders', value: stats.totalOrders, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50' },
            { icon: Users, label: 'Live Users', value: stats.liveUsers || stats.totalUsers, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50' },
            { icon: DollarSign, label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-50' }
          ].map((stat, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                    <stat.icon className="text-white" size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="text-green-500">
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Monthly Sales Chart */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Monthly Sales</h2>
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Chart visualization coming soon</p>
                <p className="text-gray-500 text-sm">Interactive charts will be implemented</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            {/* Today's Performance */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Orders Today</span>
                  <span className="text-gray-900 font-semibold">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenue Today</span>
                  <span className="text-green-600 font-semibold">₹12,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">New Customers</span>
                  <span className="text-blue-600 font-semibold">8</span>
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-red-50 border border-red-200 rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Package className="text-red-600" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">{stats.lowStockProducts?.length || 0} products are running low on inventory</p>
              <button className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium">
                View Inventory
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Selling Products Table */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Top Selling Products</h2>
                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                  <Eye size={20} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sold</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Revenue</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((product, index) => (
                    <tr key={product._id || index} className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">Product</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.totalSold}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(product.revenue)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            +{Math.floor(Math.random() * 20) + 5}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Recent Orders</h2>
                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                  <Eye size={20} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order, index) => (
                    <tr key={order._id || index} className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">#{order._id?.slice(-6) || `ORD${index + 1}`}</p>
                          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.userId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
