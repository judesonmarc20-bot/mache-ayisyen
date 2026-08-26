import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/client';
import { money } from '../components/ProductCard';
import { startPayment } from '../api/payment';

const statusLabel = {
  PENDING: 'An atant peman',
  PAID: 'Peye',
  SHIPPED: 'Voye',
  DELIVERED: 'Livre',
  CANCELLED: 'Anile',
};

const statusStyle = {
  PENDING: 'bg-amber-50 text-amber-700',
  PAID: 'bg-emerald-50 text-emerald-700',
  SHIPPED: 'bg-brand-50 text-brand-700',
  DELIVERED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [payingId, setPayingId] = useState(null);
  const location = useLocation();

  function loadOrders() {
    api.get('/orders/mine').then((res) => setOrders(res.data.orders));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handlePayNow(order) {
    setPayingId(order.id);
    try {
      await startPayment(order.id, order.paymentMethod || 'MONCASH');
    } catch {
      setPayingId(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-slate-900 mb-6">Kòmand mwen</h1>

      {location.state?.justPlaced && (
        <p className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl p-3 mb-4 text-sm font-medium">
          Mèsi! Kòmand ou a konfime. ✅
        </p>
      )}

      {orders.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-slate-500 mb-4">Ou poko fè okenn kòmand.</p>
          <Link to="/" className="text-brand-700 font-medium hover:underline">
            Ale gade pwodwi yo
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-soft"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-slate-400">
                {new Date(order.createdAt).toLocaleString('fr-HT')}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[order.status] || 'bg-slate-50 text-slate-700'}`}
              >
                {statusLabel[order.status] || order.status}
              </span>
            </div>
            <ul className="text-sm divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.id} className="py-1.5 flex justify-between text-slate-600">
                  <span>
                    {item.quantity} × {item.productName}
                  </span>
                  <span className="text-slate-800 font-medium">
                    {money(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-sm">
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Rabè {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>−{money(order.discount)}</span>
                </div>
              )}
              {order.shippingFee > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Livrezon {order.shippingZone ? `(${order.shippingZone})` : ''}</span>
                  <span>{money(order.shippingFee)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <p className="font-display font-bold text-slate-900">Total: {money(order.total)}</p>
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => handlePayNow(order)}
                    disabled={payingId === order.id}
                    className="text-sm bg-coral-500 text-white px-4 py-1.5 rounded-lg hover:bg-coral-600 disabled:opacity-50 font-medium shadow-soft"
                  >
                    {payingId === order.id ? 'Ap redirije...' : 'Peye kounye a'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
