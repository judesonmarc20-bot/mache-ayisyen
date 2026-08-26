import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { money } from '../components/ProductCard';
import api from '../api/client';
import { startPayment } from '../api/payment';

export default function Cart() {
  const { items, refresh, updateQuantity, removeFromCart, total: subtotal } = useCart();
  const [zones, setZones] = useState([]);
  const [zoneId, setZoneId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null); // { discount, code }
  const [couponError, setCouponError] = useState('');
  const [method, setMethod] = useState('MONCASH');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refresh();
    api.get('/shipping').then((res) => setZones(res.data.zones));
  }, [refresh]);

  const shippingFee = zones.find((z) => z.id === zoneId)?.fee || 0;
  const discount = coupon?.discount || 0;
  const grandTotal = Math.max(0, subtotal - discount) + shippingFee;

  async function applyCoupon() {
    setCouponError('');
    if (!couponCode.trim()) return;
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode,
        subtotal,
      });
      setCoupon({ discount: res.data.discount, code: res.data.code });
    } catch (err) {
      setCoupon(null);
      setCouponError(err.response?.data?.error || 'Koupon envalid.');
    }
  }

  async function handleCheckout() {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/orders/checkout', {
        shippingZoneId: zoneId || undefined,
        couponCode: coupon?.code || undefined,
        paymentMethod: method,
      });
      await startPayment(res.data.order.id, method);
    } catch (err) {
      setError(err.response?.data?.error || 'Erè pandan n ap kòmanse peman an.');
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="font-display text-xl font-bold text-slate-800 mb-2">Panye ou vid</h1>
        <p className="text-slate-500 mb-6">Ale dekouvri pwodwi ki fèt alamen pa vandè lokal yo.</p>
        <Link
          to="/"
          className="inline-block bg-brand-700 text-white px-5 py-2.5 rounded-lg hover:bg-brand-800 font-medium shadow-soft"
        >
          Gade pwodwi yo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-slate-900 mb-6">Panye ou</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-white border border-slate-200/80 rounded-xl p-3 shadow-soft"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg bg-slate-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{item.name}</p>
                <p className="text-xs text-slate-400">{item.storeName}</p>
                <p className="text-brand-700 font-display font-semibold mt-0.5">
                  {money(item.price)}
                </p>
              </div>
              <input
                type="number"
                min="1"
                max={item.stock}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-center"
              />
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-slate-300 hover:text-red-500 transition-colors text-lg"
                title="Retire"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-soft sticky top-24 space-y-4">
            <h2 className="font-display font-semibold text-slate-800">Rezime kòmand</h2>

            {/* Zòn livrezon */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Zòn livrezon
              </label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
              >
                <option value="">— Chwazi yon zòn —</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({money(z.fee)})
                  </option>
                ))}
              </select>
            </div>

            {/* Koupon */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Kòd koupon
              </label>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Egz. SOLDE10"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
                <button
                  onClick={applyCoupon}
                  className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-200"
                >
                  Aplike
                </button>
              </div>
              {coupon && (
                <p className="text-emerald-600 text-xs mt-1">
                  ✅ Koupon {coupon.code} aplike (−{money(coupon.discount)})
                </p>
              )}
              {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
            </div>

            {/* Kalkil */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Sou-total</span>
                <span>{money(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Rabè</span>
                  <span>−{money(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Livrezon</span>
                <span>{shippingFee > 0 ? money(shippingFee) : '—'}</span>
              </div>
              <div className="flex justify-between font-display font-bold text-lg text-slate-900 pt-1">
                <span>Total</span>
                <span>{money(grandTotal)}</span>
              </div>
            </div>

            {/* Metòd peman */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Metòd peman
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMethod('MONCASH')}
                  className={`text-sm font-medium rounded-lg px-2 py-2 border transition-colors ${
                    method === 'MONCASH'
                      ? 'bg-coral-50 border-coral-300 text-coral-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  📱 MonCash
                </button>
                <button
                  onClick={() => setMethod('CARD')}
                  className={`text-sm font-medium rounded-lg px-2 py-2 border transition-colors ${
                    method === 'CARD'
                      ? 'bg-brand-50 border-brand-300 text-brand-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  💳 Kat
                </button>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full bg-brand-700 text-white px-6 py-3 rounded-lg hover:bg-brand-800 disabled:opacity-50 font-semibold shadow-soft transition-colors"
            >
              {submitting ? 'Ap redirije...' : `Peye ${money(grandTotal)}`}
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <p className="text-xs text-slate-400 text-center">
              Ou pral redirije sou paj sekirize {method === 'CARD' ? 'Stripe' : 'MonCash'}. Nou
              pa janm wè enfòmasyon peman ou.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
