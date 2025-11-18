import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Search, Edit, Trash2, GripVertical, CheckCircle, XCircle, Folder, Package, Image as ImageIcon, AlertCircle } from 'lucide-react';
import api from '../../api';
import useDebounce from '../../hooks/useDebounce';

function arrayMove(array, from, to) {
  const arr = array.slice();
  const val = arr.splice(from, 1)[0];
  arr.splice(to, 0, val);
  return arr;
}

function SortableRow({ id, index, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform && ({ x: transform.x, y: transform.y })) || undefined,
    transition,
    opacity: isDragging ? 0.6 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  };
  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners} className={`hover:bg-gray-50 ${isDragging ? 'shadow-xl' : ''}`}>
      {children}
    </tr>
  );
}

export default function CategoryList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, [debounced, activeFilter]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = {};
      if (debounced) params.search = debounced;
      if (activeFilter === 'active') params.active = true;
      if (activeFilter === 'inactive') params.active = false;
      const res = await api.get('/categories', { params, withCredentials: true });
      const data = res.data || [];
      setCategories(Array.isArray(data) ? data : (data.categories || []));
    } catch (e) {
      console.error('Fetch categories error', e);
      setError('Could not load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (c) => {
    try {
      await api.put(`/categories/${c._id || c.id}`, { active: !c.active }, { withCredentials: true });
      fetchCategories();
    } catch (e) {
      console.error('Toggle active error', e);
      alert('Update failed');
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm('Delete this category? Products in this category will not be deleted.')) return;
    try {
      await api.delete(`/categories/${c._id || c.id}`, { withCredentials: true });
      fetchCategories();
    } catch (e) {
      console.error('Delete category error', e);
      alert('Delete failed');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    const oldIndex = categories.findIndex((c) => (c._id || c.id) === active.id);
    const newIndex = categories.findIndex((c) => (c._id || c.id) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    if (oldIndex === newIndex) return;

    const newOrder = arrayMove(categories, oldIndex, newIndex);
    // optimistic update
    setCategories(newOrder);

    try {
      // Update sortOrder for affected items
      // Assign sortOrder as the index in the array
      const promises = newOrder.map((cat, idx) => {
        const id = cat._id || cat.id;
        return api.put(`/categories/${id}/sort`, { sortOrder: idx }, { withCredentials: true });
      });
      await Promise.all(promises);
    } catch (e) {
      console.error('Sort update failed', e);
      alert('Reorder failed, refreshing list');
      fetchCategories();
    }
  };

  const total = categories.length;
  const activeCount = categories.filter((c) => c.active).length;
  const inactiveCount = total - activeCount;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
              <Folder size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Category Management</h2>
              <p className="text-sm text-gray-500">Organize your product categories</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/categories/new')} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-2 rounded-lg shadow">
            <Plus size={14} /> Add New Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white"><Package size={18} /></div>
          <div>
            <div className="text-sm text-gray-500">Total Categories</div>
            <div className="text-lg font-semibold text-gray-900">{total}</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 text-white"><CheckCircle size={18} /></div>
          <div>
            <div className="text-sm text-gray-500">Active</div>
            <div className="text-lg font-semibold text-gray-900">{activeCount}</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gray-100 text-gray-700"><XCircle size={18} /></div>
          <div>
            <div className="text-sm text-gray-500">Inactive</div>
            <div className="text-lg font-semibold text-gray-900">{inactiveCount}</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex gap-3 flex-col md:flex-row md:items-center">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="w-full border rounded-lg px-4 py-2 border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              <div className="absolute right-3 top-2 text-gray-400"><Search size={16} /></div>
            </div>

            <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="border rounded-lg px-3 py-2 border-gray-300">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="text-sm text-gray-500 flex items-center gap-2"><GripVertical size={16} /> Drag to reorder</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        {error && (
          <div className="p-3 border-b border-red-100 text-red-700 flex items-center gap-2"><AlertCircle size={16} />{error}</div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map((c) => c._id || c.id)} strategy={verticalListSortingStrategy}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3"> </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Parent</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Products</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-6 text-center">Loading...</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan="6" className="p-6 text-center">No categories found.</td></tr>
                ) : categories.map((c, idx) => {
                  const id = c._id || c.id;
                  return (
                    <SortableRow key={id} id={id} index={idx}>
                      <td className="px-4 py-3 w-8 text-center"><GripVertical size={16} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {c.icon ? (
                            <div className="w-10 h-10 flex items-center justify-center rounded bg-gray-50">{c.icon.startsWith('http') ? <img src={c.icon} alt="" className="w-8 h-8 object-cover rounded" /> : <span className="text-xl">{c.icon}</span>}</div>
                          ) : c.image ? (
                            <img src={c.image} alt="" className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-10 flex items-center justify-center rounded bg-gray-50"><Folder size={16} /></div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{c.name}</div>
                            <div className="text-xs text-gray-500">{c.description || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{c.parentName || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{c.productCount ?? '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span onClick={() => handleToggleActive(c)} className={`px-3 py-1 rounded-full text-xs cursor-pointer ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {c.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button onClick={() => navigate(`/admin/categories/edit/${id}`)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(c)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </SortableRow>
                  );
                })}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>

      </div>
    </div>
  );
}
