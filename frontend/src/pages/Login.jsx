import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erè pandan koneksyon an.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-brand-50/40">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-3xl">🛍️</span>
          <h1 className="font-display text-2xl font-bold text-slate-900 mt-2">
            Byenveni tounen
          </h1>
          <p className="text-slate-500 text-sm mt-1">Konekte pou kontinye achte ou</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
              <input
                type="email"
                placeholder="ou@egzanp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-brand-400 transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Modpas</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-brand-400 transition-colors"
                required
              />
            </div>
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
              {loading ? 'Ap konekte...' : 'Konekte'}
            </button>
          </form>
          <p className="text-sm text-slate-500 mt-5 text-center">
            Pa gen kont?{' '}
            <Link to="/register" className="text-brand-700 font-medium hover:underline">
              Enskri
            </Link>
          </p>
        </div>

        <div className="mt-5 text-xs text-slate-400 bg-white/60 border border-slate-100 rounded-xl p-4">
          <p className="font-semibold text-slate-500 mb-1.5">Kont demo pou eseye:</p>
          <p>Admin — admin@marketplace.ht / admin123</p>
          <p>Vandè — vandeur1@marketplace.ht / vandeur123</p>
          <p>Kliyan — kliyan@marketplace.ht / kliyan123</p>
        </div>
      </div>
    </div>
  );
}
