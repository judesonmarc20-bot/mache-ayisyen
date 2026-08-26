import { useEffect, useState } from 'react';
import api from '../../api/client';
import { money } from '../../components/ProductCard';
import ProductFormModal from './ProductFormModal';
import CouponManager from '../../components/CouponManager';

const statusStyle = {
  PENDING: 'bg-amber-50 text-amber-700',
  PAID: 'bg-emerald-50 text-emerald-700',
  SHIPPED: 'bg-brand-50 text-brand-700',
  DELIVERED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

export default function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('products');
  const [editing, setEditing] = useState(null); // null = pa gen modal, 'new' = kreye, obj = modifye
  const [categories, setCategories] = useState([]);

  function loadProducts() {
    api.get('/products/mine').then((res) => setProducts(res.data.products));
  }
  function loadOrders() {
    api.get('/orders/store').then((res) => setOrders(res.data.orders));
  }

  useEffect(() => {
    loadProducts();
    loadOrders();
    api.get('/categories').then((res) => setCategories(res.data.categories));
  }, []);

  async function handleDelete(id) {
    if (!confirm('Ou sèten ou vle efase pwodwi sa a?')) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  }

  async function handleToggleActive(product) {
    await api.put(`/products/${product.id}`, { active: !product.active });
    loadProducts();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">🏪 Magazen mwen</h1>
      <p className="text-slate-500 mb-6">Jere pwodwi ak kòmand pou magazen ou.</p>

      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {[
          { key: 'products', label: `Pwodwi (${products.length})` },
          { key: 'orders', label: `Kòmand (${orders.length})` },
          { key: 'coupons', label: 'Koupon' },
        ].map((t) => (
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

      {tab === 'products' && (
        <div>
          <button
            onClick={() => setEditing('new')}
            className="mb-4 bg-brand-700 text-white px-4 py-2.5 rounded-lg hover:bg-brand-800 font-medium shadow-soft"
          >
            + Ajoute yon pwodwi
          </button>
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-center gap-4 shadow-soft"
              >
                <img
                  src={p.imageUrl}
                  className="w-14 h-14 object-cover rounded-lg bg-slate-100 shrink-0"
                  alt={p.name}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-sm text-slate-400 flex items-center gap-2 flex-wrap">
                    <span className="text-brand-700 font-medium">{money(p.price)}</span>
                    <span>·</span>
                    <span>Stòk: {p.stock}</span>
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {p.active ? 'Aktif' : 'Dezaktive'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setEditing(p)}
                  className="text-sm text-brand-700 hover:underline shrink-0"
                >
                  Modifye
                </button>
                <button
                  onClick={() => handleToggleActive(p)}
                  className="text-sm text-slate-400 hover:text-slate-600 shrink-0"
                >
                  {p.active ? 'Dezaktive' : 'Aktive'}
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-sm text-red-400 hover:text-red-600 shrink-0"
                >
                  Efase
                </button>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <div className="text-4xl mb-3">📦</div>
                Ou poko gen pwodwi. Ajoute premye a!
              </div>
            )}
          </div>
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
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle[order.status] || 'bg-slate-50 text-slate-700'}`}
                >
                  {order.status}
                </span>
              </div>
              <ul className="text-sm divide-y divide-slate-100">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between py-1 text-slate-600">
                    <span>{item.quantity} × {item.productName}</span>
                    <span className="font-medium text-slate-800">
                      {money(item.unitPrice * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <div className="text-4xl mb-3">🧾</div>
              Pa gen kòmand ankò.
            </div>
          )}
        </div>
      )}

      {tab === 'coupons' && <CouponManager />}

      {editing && (
        <ProductFormModal
          product={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}
