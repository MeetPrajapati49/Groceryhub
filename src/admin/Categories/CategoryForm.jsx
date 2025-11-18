import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import api from '../../api';

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^a-z0-9\-]/g, '')    // Remove all non-alphanumeric chars except -
    .replace(/\-+/g, '-')           // Replace multiple - with single -
    .replace(/^-+|-+$/g, '');        // Trim - from start/end
}

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    icon: '',
    image: '',
    sortOrder: 0,
    active: true,
    seo: { metaTitle: '', metaDescription: '' }
  });

  useEffect(() => {
    fetchCategories();
    if (id) fetchCategory();
    // eslint-disable-next-line
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories', { withCredentials: true });
      const data = res.data || [];
      setCategories(Array.isArray(data) ? data : (data.categories || []));
    } catch (e) {
      console.error('Fetch categories error', e);
    }
  };

  const fetchCategory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/categories/${id}`, { withCredentials: true });
      const c = res.data || {};
      setForm({
        name: c.name || '',
        slug: c.slug || '',
        description: c.description || '',
        parentId: c.parentId || '',
        icon: c.icon || '',
        image: c.image || '',
        sortOrder: c.sortOrder ?? 0,
        active: c.active ?? true,
        seo: c.seo || { metaTitle: '', metaDescription: '' }
      });
    } catch (e) {
      console.error('Fetch category error', e);
      setFormError('Could not load category');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const f = acceptedFiles[0];
    // validate
    if (!f.type.startsWith('image/')) {
      alert('Only image files allowed');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert('Max image size is 5MB');
      return;
    }
    const formData = new FormData();
    formData.append('images', f);
    try {
      const res = await api.post('/admin/images/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
      const url = res.data?.images?.[0]?.url || res.data?.url || (Array.isArray(res.data) ? res.data[0] : undefined);
      if (url) setForm((prev) => ({ ...prev, image: url }));
    } catch (e) {
      console.error('Image upload error', e);
      alert('Image upload failed');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const handleChange = (field) => (e) => {
    const value = e?.target?.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'name' && !form.slug) {
      setForm((prev) => ({ ...prev, slug: slugify(value) }));
    }
  };

  const handleSeoChange = (field) => (e) => setForm((prev) => ({ ...prev, seo: { ...prev.seo, [field]: e.target.value } }));

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Name required (min 2 chars)';
    if (!form.slug || !/^[a-z0-9-]+$/.test(form.slug)) errs.slug = 'Slug required and must be url-friendly';
    if (form.seo.metaTitle && form.seo.metaTitle.length > 60) errs.metaTitle = 'Meta title max 60 chars';
    if (form.seo.metaDescription && form.seo.metaDescription.length > 160) errs.metaDescription = 'Meta description max 160 chars';
    // parent circular check
    if (form.parentId) {
      const invalid = checkCircularParent(form.parentId, form, categories);
      if (invalid) errs.parentId = 'Cannot select self or descendant as parent';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const checkCircularParent = (parentId, currentForm, allCategories) => {
    if (!parentId || !id) return false;
    // build map
    const map = {};
    allCategories.forEach((c) => { map[c._id || c.id] = c; });
    let cur = parentId;
    while (cur) {
      if (cur === id) return true;
      const node = map[cur];
      if (!node) break;
      cur = node.parentId;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (id) {
        await api.put(`/categories/${id}`, payload, { withCredentials: true });
      } else {
        await api.post('/categories', payload, { withCredentials: true });
      }
      navigate('/admin/categories');
    } catch (err) {
      console.error('Save category error', err);
      const msg = err?.response?.data?.message || 'Save failed';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{id ? 'Edit Category' : 'New Category'}</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="px-3 py-1 rounded border">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded">
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {formError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded flex items-center gap-2"><AlertCircle size={16} />{formError}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input value={form.name} onChange={handleChange('name')} placeholder="e.g., Fresh Vegetables" className="mt-1 block w-full border rounded px-3 py-2" />
              {errors.name && <div className="text-red-600 text-sm">{errors.name}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))} className="mt-1 block w-full border rounded px-3 py-2" />
              {errors.slug && <div className="text-red-600 text-sm">{errors.slug}</div>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={4} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Category</label>
              <select value={form.parentId} onChange={(e) => setForm((p) => ({ ...p, parentId: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2">
                <option value="">None (Top level)</option>
                {categories.filter((c) => (c._id || c.id) !== id).map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                ))}
              </select>
              {errors.parentId && <div className="text-red-600 text-sm">{errors.parentId}</div>}
            </div>

            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700">Active</label>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Icon (emoji or URL)</label>
              <div className="flex items-center gap-2">
                <input value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} placeholder="e.g., 🥬 or https://..." className="mt-1 block w-full border rounded px-3 py-2" />
                {form.icon && (form.icon.startsWith('http') ? <img src={form.icon} alt="icon" className="w-8 h-8 object-cover rounded" /> : <div className="text-xl">{form.icon}</div>)}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Category Image</label>
              <div {...getRootProps()} className="border-dashed border-2 border-gray-200 rounded p-4 text-center cursor-pointer">
                <input {...getInputProps()} />
                <div className="flex items-center justify-center gap-2">
                  <Upload size={16} />
                  <span>{isDragActive ? 'Drop image here...' : 'Drag & drop an image, or click to select'}</span>
                </div>
              </div>
              {form.image && (
                <div className="mt-3">
                  <img src={form.image} alt="category" className="w-full max-w-md rounded" />
                  <div className="mt-2">
                    <button type="button" onClick={() => setForm((p) => ({ ...p, image: '' }))} className="px-3 py-1 bg-gray-100 rounded">Remove image</button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>

            <div className="md:col-span-2 border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold mb-2">SEO</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                  <input value={form.seo.metaTitle} onChange={handleSeoChange('metaTitle')} maxLength={60} className="mt-1 block w-full border rounded px-3 py-2" />
                  <div className="text-xs text-gray-500">{form.seo.metaTitle.length}/60</div>
                  {errors.metaTitle && <div className="text-red-600 text-sm">{errors.metaTitle}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                  <textarea value={form.seo.metaDescription} onChange={handleSeoChange('metaDescription')} maxLength={160} rows={3} className="mt-1 block w-full border rounded px-3 py-2" />
                  <div className="text-xs text-gray-500">{form.seo.metaDescription.length}/160</div>
                  {errors.metaDescription && <div className="text-red-600 text-sm">{errors.metaDescription}</div>}
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
