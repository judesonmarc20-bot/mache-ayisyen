// =========================================================================
// ShippingManager.jsx — Jesyon zòn livrezon (admin sèlman)
// =========================================================================
import { useEffect, useState } from 'react';
import api from '../api/client';
import { money } from './ProductCard';
import { useToast } from '../context/ToastContext';

export default function ShippingManager() {
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({ name: '', fee: '' });
  const { showToast } = useToast();

  function load() {
    api.get('/shipping/all').then((res) => setZones(res.data.zones));
  }
  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    try {
      await api.post('/shipping', { name: form.name, fee: Number(form.fee) });
      setForm({ name: '', fee: '' });
      load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erè.', { type: 'error' });
    }
  }
  async function toggle(z) {
    await api.put(`/shipping/${z.id}`, { active: !z.active });
    load();
  }
  async function remove(z) {
    if (!confirm(`Efase zòn ${z.name}?`)) return;
    await api.delete(`/shipping/${z.id}`);
    load();
  }

  const inputClass =
    'border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400';

  return (
    <div>
      <form
        onSubmit={create}
        className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-soft mb-5 flex flex-col sm:flex-row gap-2 items-end"
      >
        <div className="flex flex-col flex-1">
          <label className="text-xs text-slate-500 mb-1">Non zòn</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Egz. Jakmèl / Sidès"
            className={inputClass}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">Frè (G)</label>
          <input
            type="number"
            value={form.fee}
            onChange={(e) => setForm({ ...form, fee: e.target.value })}
            placeholder="300"
            className={inputClass}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-800"
        >
          + Ajoute
        </button>
      </form>

      <div className="space-y-2">
        {zones.map((z) => (
          <div
            key={z.id}
            className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center justify-between shadow-soft"
          >
            <div>
              <span className="font-medium text-slate-800">{z.name}</span>
              <span className="text-sm text-brand-700 font-medium ml-3">{money(z.fee)}</span>
              <span
                className={`ml-3 text-xs font-medium px-1.5 py-0.5 rounded ${
                  z.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {z.active ? 'Aktif' : 'Dezaktive'}
              </span>
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => toggle(z)} className="text-slate-500 hover:text-slate-700">
                {z.active ? 'Dezaktive' : 'Aktive'}
              </button>
              <button onClick={() => remove(z)} className="text-red-400 hover:text-red-600">
                Efase
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
