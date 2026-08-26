// =========================================================================
// Account.jsx — Paj "Kont mwen": itilizatè a ka chanje modpas li isit la.
// =========================================================================
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

export default function Account() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Nouvo modpas yo pa menm — verifye ankò.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Nouvo modpas la dwe gen omwen 6 karaktè.');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/me/password', { currentPassword, newPassword });
      showToast('Modpas ou chanje avèk siksè! ✅');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Erè pandan chanjman modpas la.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">Kont mwen</h1>
        <p className="text-slate-500 text-sm mt-1">
          Konekte kòm <span className="font-medium text-slate-700">{user?.name}</span> (
          {user?.email})
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
        <h2 className="font-display font-semibold text-slate-900 mb-4">Chanje modpas</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Modpas aktyèl
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-brand-400 transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Nouvo modpas
            </label>
            <input
              type="password"
              placeholder="Omwen 6 karaktè"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-brand-400 transition-colors"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">
              Konfime nouvo modpas
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-brand-400 transition-colors"
              required
              minLength={6}
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
            {loading ? 'Ap anrejistre...' : 'Chanje modpas'}
          </button>
        </form>
      </div>
    </div>
  );
}
