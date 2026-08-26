import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    storeName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erè pandan enskripsyon an.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-brand-50/40">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-3xl">🛍️</span>
          <h1 className="font-display text-2xl font-bold text-slate-900 mt-2">Kreye yon kont</h1>
          <p className="text-slate-500 text-sm mt-1">Rejwenn Mache Ayisyen an gratis</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Non</label>
              <input
                placeholder="Non ou"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-brand-400 transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
              <input
                type="email"
                placeholder="ou@egzanp.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-brand-400 transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Modpas</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-brand-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-2 block">
                M ap enskri kòm
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => update('role', 'CUSTOMER')}
                  className={`text-sm font-medium rounded-lg px-3 py-2.5 border transition-colors ${
                    form.role === 'CUSTOMER'
                      ? 'bg-brand-50 border-brand-400 text-brand-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  🛒 Achtè
                </button>
                <button
                  type="button"
                  onClick={() => update('role', 'VENDOR')}
                  className={`text-sm font-medium rounded-lg px-3 py-2.5 border transition-colors ${
                    form.role === 'VENDOR'
                      ? 'bg-brand-50 border-brand-400 text-brand-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  🏪 Vandè
                </button>
              </div>
            </div>

            {form.role === 'VENDOR' && (
              <div className="animate-fade-in-up">
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Non magazen ou
                </label>
                <input
                  placeholder="Egzanp: Boutik Jean"
                  value={form.storeName}
                  onChange={(e) => update('storeName', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-brand-400 transition-colors"
                />
              </div>
            )}

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-700 text-white py-2.5 rounded-lg hover:bg-brand-800 disabled:opacity-50 font-medium shadow-soft transition-colors"
            >
              {loading ? 'Ap kreye kont...' : 'Kreye kont lan'}
            </button>
          </form>
          <p className="text-sm text-slate-500 mt-5 text-center">
            Ou gen yon kont deja?{' '}
            <Link to="/login" className="text-brand-700 font-medium hover:underline">
              Konekte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
