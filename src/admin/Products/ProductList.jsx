import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import api from '../../api';
import useDebounce from '../../hooks/useDebounce';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [debouncedSearch, category, activeFilter, page, limit]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/admin/categories', { withCredentials: true });
      setCategories(res.data || []);
    } catch (e) {
      console.error('Fetch categories error', e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category) params.category = category;
      if (activeFilter === 'active') params.active = true;
      if (activeFilter === 'inactive') params.active = false;

      const res = await api.get('/products', { params, withCredentials: true });
      const data = res.data || {};
      setProducts(data.products || data || []);
      setTotal(data.total || data.count || 0);
      setSelected(new Set());
    } catch (e) {
      console.error('Fetch products error', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  };

  const toggleSelectAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p._id || p.id)));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (e) {
      console.error('Delete product error', e);
      alert('Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} products?`)) return;
    try {
      await api.delete('/products/bulk/delete', { data: { productIds: Array.from(selected) } });
      fetchProducts();
    } catch (e) {
      console.error('Bulk delete error', e);
      alert('Bulk delete failed');
    }
  };

  const toggleActive = async (p) => {
    try {
      await api.put(`/products/${p._id}`, { active: !p.active });
      fetchProducts();
    } catch (e) {
      console.error('Toggle active error', e);
      alert('Update failed');
    }
  };

  const totalPages = Math.max(1, Math.ceil((total || products.length) / limit));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
              <Package size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Product Management</h2>
              <p className="text-sm text-gray-500">Manage your store products</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/products/new')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-2 rounded-lg shadow"
          >
            <Plus size={14} /> Add New Product
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex gap-3 flex-col md:flex-row md:items-center">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search products..."
                className="w-full border rounded-lg px-4 py-2 border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <div className="absolute right-3 top-2 text-gray-400"><Search size={16} /></div>
            </div>

            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="border rounded-lg px-3 py-2 border-gray-300"
            >
              <option value="">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={activeFilter}
              onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
              className="border rounded-lg px-3 py-2 border-gray-300"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">Items per page:</div>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="border rounded-lg px-3 py-2 border-gray-300"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        {selected.size > 0 && (
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <div>{selected.size} selected</div>
            <div>
              <button onClick={handleBulkDelete} className="bg-red-500 text-white px-3 py-1 rounded">Delete Selected</button>
            </div>
          </div>
        )}

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={selected.size === products.length && products.length>0} onChange={toggleSelectAll} />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="7" className="p-6 text-center">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="7" className="p-6 text-center">No products found.</td></tr>
            ) : products.map((p) => {
              const id = p._id || p.id;
              return (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(id)} onChange={() => toggleSelect(id)} />
                  </td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0">
                      <img
                        src={(p.images && p.images[0]) || '/placeholder.jpg'}
                        alt=""
                        className="w-full h-full object-cover rounded border border-gray-200"
                        style={{ maxWidth: '48px', maxHeight: '48px' }}
                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">SKU: {p.sku || '-'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.category?.name || p.category || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">₹ {p.price?.toFixed?.(2) ?? p.price ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.stock ?? '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      onClick={() => toggleActive(p)}
                      className={`px-3 py-1 rounded-full text-xs cursor-pointer ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => navigate(`/admin/products/edit/${id}`)} className="text-blue-600 hover:text-blue-800">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded border border-gray-200"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-3">{page}</div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded border border-gray-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
