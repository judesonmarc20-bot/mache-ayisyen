// =========================================================================
// CouponManager.jsx — Jesyon koupon (itilize pa vandè ak admin toude)
// =========================================================================
import { useEffect, useState } from 'react';
import api from '../api/client';
import { money } from './ProductCard';
import { useToast } from '../context/ToastContext';

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: '', type: 'PERCENT', value: '', minOrder: '', maxUses: '' });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  function load() {
    api.get('/coupons').then((res) => setCoupons(res.data.coupons));
  }
  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/coupons', {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
      });
      setForm({ code: '', type: 'PERCENT', value: '', minOrder: '', maxUses: '' });
      showToast('Koupon kreye!', { type: 'success' });
      load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erè.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function toggle(c) {
    await api.put(`/coupons/${c.id}/toggle`);
    load();
  }
  async function remove(c) {
    if (!confirm(`Efase koupon ${c.code}?`)) return;
    await api.delete(`/coupons/${c.id}`);
    load();
  }

  const inputClass =
    'border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400';

  return (
    <div>
      <form
        onSubmit={create}
        className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-soft mb-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-2 items-end"
      >
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">Kòd</label>
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="SOLDE10"
            className={inputClass}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">Tip</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className={inputClass}
          >
            <option value="PERCENT">Pousantaj (%)</option>
            <option value="FIXED">Montan fiks (G)</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">Valè</label>
          <input
            type="number"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder={form.type === 'PERCENT' ? '10' : '200'}
            className={inputClass}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">Min kòmand</label>
          <input
            type="number"
            value={form.minOrder}
            onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-800 disabled:opacity-50"
        >
          + Kreye
        </button>
      </form>

      <div className="space-y-2">
        {coupons.length === 0 && <p className="text-slate-500 text-sm">Pa gen koupon ankò.</p>}
        {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center justify-between shadow-soft"
          >
            <div>
              <span className="font-mono font-semibold text-brand-700">{c.code}</span>
              <span className="text-sm text-slate-500 ml-3">
                {c.type === 'PERCENT' ? `${c.value}% rabè` : `${money(c.value)} rabè`}
                {c.minOrder > 0 && ` · min ${money(c.minOrder)}`}
                {c.maxUses != null && ` · ${c.usedCount}/${c.maxUses} itilize`}
              </span>
              <span
                className={`ml-3 text-xs font-medium px-1.5 py-0.5 rounded ${
                  c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {c.active ? 'Aktif' : 'Dezaktive'}
              </span>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => toggle(c)} className="text-slate-500 hover:text-slate-700">
                {c.active ? 'Dezaktive' : 'Aktive'}
              </button>
              <button onClick={() => remove(c)} className="text-red-400 hover:text-red-600">
                Efase
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
