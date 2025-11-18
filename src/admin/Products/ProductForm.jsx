import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Upload, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import api from '../../api';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    cost: '',
    category: '',
    images: [],
    stock: 0,
    lowStockThreshold: 10,
    active: true,
    attributes: {
      weight: '',
      unit: 'kg',
      brand: '',
      origin: '',
      shelfLife: '',
      isOrganic: false,
      isVegan: false
    },
    variants: [],
    tags: [],
    seo: {
      metaTitle: '',
      metaDescription: '',
      slug: ''
    }
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
    if (id) fetchProduct();
    // eslint-disable-next-line
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/admin/categories', { withCredentials: true });
      setCategories(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`, { withCredentials: true });
      const p = res.data;
      setForm({
        name: p.name || '',
        sku: p.sku || '',
        description: p.description || '',
        price: p.price ?? '',
        cost: p.cost ?? '',
        category: (p.category && (p.category._id || p.category)) || '',
        images: p.images || [],
        stock: p.stock ?? 0,
        lowStockThreshold: p.lowStockThreshold ?? 10,
        active: p.active ?? true,
        attributes: p.attributes || {
          weight: '', unit: 'kg', brand: '', origin: '', shelfLife: '', isOrganic: false, isVegan: false
        },
        variants: p.variants || [],
        tags: p.tags || [],
        seo: p.seo || { metaTitle: '', metaDescription: '', slug: '' }
      });
    } catch (e) {
      console.error('Fetch product error', e);
      alert('Could not load product');
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const formData = new FormData();
    acceptedFiles.forEach((f) => formData.append('images', f));
    try {
      const res = await api.post('/admin/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      const urls = res.data?.images?.map(img => img.url) || res.data?.urls || (res.data?.url ? [res.data.url] : []);
      if (urls.length) {
        setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      } else if (Array.isArray(res.data)) {
        setForm((prev) => ({ ...prev, images: [...prev.images, ...res.data] }));
      }
    } catch (e) {
      console.error('Image upload error', e);
      alert('Image upload failed');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const handleChange = (field) => (e) => {
    const value = e.target?.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field) => (e) => {
    const value = e.target?.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));
  };

  const handleSeoChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, [field]: value } }));
  };

  const updateAttribute = (field) => (e) => {
    const value = e.target?.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, attributes: { ...prev.attributes, [field]: value } }));
  };

  const updateVariantField = (index, field) => (e) => {
    const value = e.target?.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, variants };
    });
  };

  const updateVariantAttr = (index, attrField) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const variants = [...prev.variants];
      const v = { ...variants[index] };
      v.attributes = { ...(v.attributes || {}), [attrField]: value };
      variants[index] = v;
      return { ...prev, variants };
    });
  };

  const addVariant = () => {
    setForm((prev) => ({ ...prev, variants: [...prev.variants, { sku: '', name: '', price: '', stock: 0, attributes: {} }] }));
  };

  const removeVariant = (index) => {
    setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
  };

  const removeImage = (idx) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const addTag = () => {
    const tag = (document.getElementById('tag-input')?.value || '').trim();
    if (!tag) return;
    setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    if (document.getElementById('tag-input')) document.getElementById('tag-input').value = '';
  };

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name required';
    if ((form.price === '' || form.price === null) && form.price !== 0) errs.price = 'Price required';
    if (!form.category) errs.category = 'Category required';
    if (Number(form.price) < 0) errs.price = 'Price must be positive';
    if (form.cost !== '' && Number(form.cost) < 0) errs.cost = 'Cost must be positive';
    if (Number(form.stock) < 0) errs.stock = 'Stock cannot be negative';
    if (Number(form.lowStockThreshold) < 0) errs.lowStockThreshold = 'Low stock threshold cannot be negative';
    form.variants.forEach((v, idx) => {
      if ((v.price === '' || v.price === null) && v.price !== 0) errs[`variant_price_${idx}`] = 'Variant price required';
      if (Number(v.price) < 0) errs[`variant_price_${idx}`] = 'Must be positive';
      if (Number(v.stock) < 0) errs[`variant_stock_${idx}`] = 'Must be >= 0';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      payload.price = Number(payload.price);
      payload.cost = form.cost !== '' ? Number(form.cost) : undefined;
      payload.stock = Number(payload.stock || 0);
      payload.lowStockThreshold = Number(payload.lowStockThreshold || 0);
      // normalize variants numbers
      payload.variants = (payload.variants || []).map((v) => ({
        ...v,
        price: v.price !== '' ? Number(v.price) : 0,
        stock: Number(v.stock || 0),
        attributes: v.attributes || {}
      }));

      if (id) {
        await api.put(`/products/${id}`, payload, { withCredentials: true });
      } else {
        await api.post('/products', payload, { withCredentials: true });
      }
      navigate('/admin/products');
    } catch (err) {
      console.error('Save product error', err);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{id ? 'Edit Product' : 'New Product'}</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="px-3 py-1 rounded border">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded">
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input value={form.name} onChange={handleChange('name')} className="mt-1 block w-full border rounded px-3 py-2" />
              {errors.name && <div className="text-red-600 text-sm">{errors.name}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">SKU</label>
              <input value={form.sku} onChange={handleChange('sku')} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
              <input value={form.price} onChange={handleChange('price')} type="number" step="0.01" className="mt-1 block w-full border rounded px-3 py-2" />
              {errors.price && <div className="text-red-600 text-sm">{errors.price}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cost (₹)</label>
              <input value={form.cost} onChange={handleChange('cost')} type="number" step="0.01" className="mt-1 block w-full border rounded px-3 py-2" />
              {errors.cost && <div className="text-red-600 text-sm">{errors.cost}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input value={form.stock} onChange={handleChange('stock')} type="number" className="mt-1 block w-full border rounded px-3 py-2" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={form.description} onChange={handleChange('description')} rows={4} className="mt-1 block w-full border rounded px-3 py-2" />

            <div>
              <label className="block text-sm font-medium text-gray-700">Low stock threshold</label>
              <input value={form.lowStockThreshold} onChange={handleChange('lowStockThreshold')} type="number" className="mt-1 block w-full border rounded px-3 py-2" />
              {errors.lowStockThreshold && <div className="text-red-600 text-sm">{errors.lowStockThreshold}</div>}
            </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select value={form.category} onChange={handleChange('category')} className="mt-1 block w-full border rounded px-3 py-2">
                <option value="">Select category</option>
                {categories.map((c) => {
                  const val = (typeof c === 'string') ? c : (c._id || c.id || c.name);
                  const label = (typeof c === 'string') ? c : (c.name || val);
                  return <option key={val} value={val}>{label}</option>;
                })}
              </select>
              {errors.category && <div className="text-red-600 text-sm">{errors.category}</div>}
            </div>

            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700">Active</label>
              <input type="checkbox" checked={form.active} onChange={handleChange('active')} />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold mb-2">Images</h4>
            <div {...getRootProps()} className="border-dashed border-2 border-gray-200 rounded p-4 text-center cursor-pointer">
              <input {...getInputProps()} />
              <div className="flex items-center justify-center gap-2">
                <Upload size={16} />
                <span>{isDragActive ? 'Drop images here...' : 'Drag & drop images, or click to select'}</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-3">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} alt="" className="w-full h-24 object-cover rounded" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold mb-2">Tags</h4>
            <div className="flex gap-2">
              <input id="tag-input" placeholder="Add tag" className="border rounded px-3 py-2 flex-1" />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 rounded">Add</button>
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {form.tags.map((t, i) => (
                <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center gap-2">
                  {t} <button type="button" onClick={() => setForm((prev) => ({ ...prev, tags: prev.tags.filter((_, idx) => idx !== i) }))}><Trash2 size={12} /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold mb-2">Attributes</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight</label>
                <input value={form.attributes.weight} onChange={updateAttribute('weight')} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select value={form.attributes.unit} onChange={updateAttribute('unit')} className="mt-1 block w-full border rounded px-3 py-2">
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="l">l</option>
                  <option value="ml">ml</option>
                  <option value="pieces">pieces</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand</label>
                <input value={form.attributes.brand} onChange={updateAttribute('brand')} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Origin</label>
                <input value={form.attributes.origin} onChange={updateAttribute('origin')} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Shelf life (days)</label>
                <input value={form.attributes.shelfLife} onChange={updateAttribute('shelfLife')} type="number" className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div className="flex items-center gap-4">
                <label className="block text-sm font-medium text-gray-700">Organic</label>
                <input type="checkbox" checked={form.attributes.isOrganic} onChange={updateAttribute('isOrganic')} />
                <label className="block text-sm font-medium text-gray-700">Vegan</label>
                <input type="checkbox" checked={form.attributes.isVegan} onChange={updateAttribute('isVegan')} />
              </div>

            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold mb-2">Variants</h4>
              <div className="space-y-3">
                {form.variants.map((v, idx) => (
                  <div key={idx} className="p-3 border rounded">
                    <div className="flex gap-2 mb-2">
                      <input placeholder="Variant SKU" value={v.sku} onChange={updateVariantField(idx, 'sku')} className="flex-1 border rounded px-3 py-2" />
                      <input placeholder="Name" value={v.name} onChange={updateVariantField(idx, 'name')} className="flex-1 border rounded px-3 py-2" />
                    </div>
                    <div className="flex gap-2 mb-2">
                      <input placeholder="Price" type="number" value={v.price} onChange={updateVariantField(idx, 'price')} className="border rounded px-3 py-2" />
                      <input placeholder="Stock" type="number" value={v.stock} onChange={updateVariantField(idx, 'stock')} className="border rounded px-3 py-2" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input placeholder="Size" value={(v.attributes||{}).size||''} onChange={updateVariantAttr(idx, 'size')} className="border rounded px-3 py-2" />
                      <input placeholder="Color" value={(v.attributes||{}).color||''} onChange={updateVariantAttr(idx, 'color')} className="border rounded px-3 py-2" />
                      <input placeholder="Weight" value={(v.attributes||{}).weight||''} onChange={updateVariantAttr(idx, 'weight')} className="border rounded px-3 py-2" />
                    </div>
                    <div className="mt-2 text-right">
                      <button type="button" onClick={() => removeVariant(idx)} className="text-red-600">Remove</button>
                    </div>
                  </div>
                ))}
                <div>
                  <button type="button" onClick={addVariant} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded">
                    <Plus size={12} /> Add Variant
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold mb-2">SEO</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                  <input value={form.seo.metaTitle} onChange={handleSeoChange('metaTitle')} maxLength={60} className="mt-1 block w-full border rounded px-3 py-2" />
                  <div className="text-xs text-gray-500">{form.seo.metaTitle.length}/60</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Slug</label>
                  <input value={form.seo.slug} onChange={handleSeoChange('slug')} className="mt-1 block w-full border rounded px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                  <textarea value={form.seo.metaDescription} onChange={handleSeoChange('metaDescription')} rows={3} maxLength={160} className="mt-1 block w-full border rounded px-3 py-2" />
                  <div className="text-xs text-gray-500">{form.seo.metaDescription.length}/160</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
