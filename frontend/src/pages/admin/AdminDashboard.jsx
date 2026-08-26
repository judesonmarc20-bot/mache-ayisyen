import { useEffect, useState } from 'react';
import api from '../../api/client';
import { money } from '../../components/ProductCard';
import CouponManager from '../../components/CouponManager';
import ShippingManager from '../../components/ShippingManager';

const roleStyle = {
  ADMIN: 'bg-coral-50 text-coral-700',
  VENDOR: 'bg-brand-50 text-brand-700',
  CUSTOMER: 'bg-slate-100 text-slate-600',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data));
    api.get('/admin/stores').then((res) => setStores(res.data.stores));
    api.get('/admin/users').then((res) => setUsers(res.data.users));
    api.get('/orders/all').then((res) => setOrders(res.data.orders));
  }, []);

  async function toggleStore(store) {
    await api.put(`/admin/stores/${store.id}/active`, { active: !store.active });
    const res = await api.get('/admin/stores');
    setStores(res.data.stores);
  }

  const tabs = [
    { key: 'overview', label: 'Rezime' },
    { key: 'stores', label: 'Magazen' },
    { key: 'users', label: 'Itilizatè' },
    { key: 'orders', label: 'Kòmand' },
    { key: 'coupons', label: 'Koupon' },
    { key: 'shipping', label: 'Livrezon' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-slate-900 mb-6">🛠️ Dashboard Admin</h1>

      <div className="flex gap-1 border-b border-slate-200 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatCard icon="👥" label="Itilizatè" value={stats.totalUsers} />
          <StatCard icon="🏪" label="Magazen" value={stats.totalStores} />
          <StatCard icon="📦" label="Pwodwi" value={stats.totalProducts} />
          <StatCard icon="🧾" label="Kòmand" value={stats.totalOrders} />
          <StatCard icon="💰" label="Revni total" value={money(stats.revenue)} highlight />
        </div>
      )}

      {tab === 'stores' && (
        <div className="space-y-3">
          {stores.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-soft"
            >
              <div>
                <p className="font-medium text-slate-800">{s.name}</p>
                <p className="text-sm text-slate-400">{s.description}</p>
              </div>
              <button
                onClick={() => toggleStore(s)}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg ${
                  s.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                {s.active ? 'Dezaktive' : 'Aktive'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="p-3 font-medium">Non</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Wòl</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="p-3 text-slate-800">{u.name}</td>
                  <td className="p-3 text-slate-500">{u.email}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleStyle[u.role] || 'bg-slate-100 text-slate-600'}`}
                    >
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-soft">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">
                  {new Date(order.createdAt).toLocaleString('fr-HT')}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {order.status}
                </span>
              </div>
              <p className="font-display font-bold text-slate-900">{money(order.total)}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'coupons' && <CouponManager />}
      {tab === 'shipping' && <ShippingManager />}
    </div>
  );
}

function StatCard({ icon, label, value, highlight }) {
  return (
    <div
      className={`rounded-xl p-4 text-center border shadow-soft ${
        highlight ? 'bg-brand-700 border-brand-700' : 'bg-white border-slate-200/80'
      }`}
    >
      <div className="text-xl mb-1">{icon}</div>
      <p className={`font-display text-xl font-bold ${highlight ? 'text-white' : 'text-brand-700'}`}>
        {value}
      </p>
      <p className={`text-xs mt-0.5 ${highlight ? 'text-brand-100' : 'text-slate-500'}`}>{label}</p>
    </div>
  );
}
