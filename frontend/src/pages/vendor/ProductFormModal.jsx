import { useState } from 'react';
import api from '../../api/client';

// Modal senp (san lib apa) pou kreye/modifye yon pwodwi.
export default function ProductFormModal({ product, categories, onClose, onSaved }) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || 0,
    imageUrl: product?.imageUrl || '',
    categoryId: product?.categoryId || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/products/${product.id}`, form);
      } else {
        await api.post('/products', form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Erè pandan sove pwodwi a.');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-brand-400 transition-colors text-sm';

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-lift animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-bold text-slate-900 mb-4">
          {isEdit ? 'Modifye pwodwi' : 'Nouvo pwodwi'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Non pwodwi"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className={inputClass}
            required
          />
          <textarea
            placeholder="Deskripsyon"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className={inputClass}
            rows={3}
            required
          />
          <div className="flex gap-3">
            <input
              type="number"
              step="0.01"
              placeholder="Pri (Goud)"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              className={inputClass}
              required
            />
            <input
              type="number"
              placeholder="Stòk"
              value={form.stock}
              onChange={(e) => update('stock', e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <input
            placeholder="Lyen imaj (URL)"
            value={form.imageUrl}
            onChange={(e) => update('imageUrl', e.target.value)}
            className={inputClass}
          />
          <select
            value={form.categoryId}
            onChange={(e) => update('categoryId', e.target.value)}
            className={inputClass}
          >
            <option value="">Pa gen kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 font-medium text-sm"
            >
              Anile
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 rounded-lg bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50 font-medium text-sm shadow-soft"
            >
              {saving ? 'Ap sove...' : 'Sove'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
