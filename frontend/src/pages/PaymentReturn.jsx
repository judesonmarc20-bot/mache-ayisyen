// =========================================================================
// PaymentReturn.jsx — Paj kote kliyan an ateri lè l tounen soti sou peman
// =========================================================================
// Mache pou toude metòd: MonCash ak Stripe (kat). Nou verifye DIRÈKTEMAN
// bò backend nou an (ki li menm verifye bò MonCash/Stripe) si peman an
// reyèlman reyisi anvan nou make kòmand lan PAID.
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { getPendingOrderId, getPendingMethod, clearPending } from '../api/payment';
import { useCart } from '../context/CartContext';

export default function PaymentReturn() {
  const [status, setStatus] = useState('checking'); // checking | paid | pending | error
  const [message, setMessage] = useState('');
  const [params] = useSearchParams();
  const { refresh } = useCart();

  async function checkPayment() {
    const orderId = getPendingOrderId();
    const method = getPendingMethod();
    if (!orderId) {
      setStatus('error');
      setMessage("Nou pa jwenn okenn kòmand an atant. Tounen nan panye ou pou eseye ankò.");
      return;
    }
    setStatus('checking');
    try {
      let res;
      if (method === 'CARD') {
        const sessionId = params.get('session_id');
        res = await api.post('/payments/stripe/verify', { orderId, sessionId });
      } else {
        res = await api.post('/payments/moncash/verify', { orderId });
      }

      if (res.data.status === 'PAID') {
        clearPending();
        await refresh();
        setStatus('paid');
      } else {
        setStatus('pending');
        setMessage(res.data.message || 'Peman an poko konfime.');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Erè pandan verifikasyon peman an.');
    }
  }

  useEffect(() => {
    checkPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white border border-slate-200/80 rounded-2xl shadow-card p-10 animate-scale-in">
        {status === 'checking' && (
          <>
            <div className="text-4xl mb-4 animate-pulse">⏳</div>
            <h1 className="font-display text-xl font-bold mb-2 text-slate-900">
              Ap verifye peman ou...
            </h1>
            <p className="text-slate-500">Tanpri tann yon ti moman.</p>
          </>
        )}

        {status === 'paid' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="font-display text-xl font-bold mb-2 text-emerald-700">
              Peman konfime!
            </h1>
            <p className="text-slate-500 mb-6">Mèsi pou kòmand ou a.</p>
            <Link
              to="/orders"
              className="inline-block bg-brand-700 text-white px-5 py-2.5 rounded-lg hover:bg-brand-800 font-medium shadow-soft"
            >
              Gade kòmand mwen
            </Link>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="font-display text-xl font-bold mb-2 text-slate-900">
              Peman an poko konfime
            </h1>
            <p className="text-slate-500 mb-6">{message}</p>
            <button
              onClick={checkPayment}
              className="bg-brand-700 text-white px-5 py-2.5 rounded-lg hover:bg-brand-800 font-medium shadow-soft"
            >
              Verifye ankò
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="font-display text-xl font-bold mb-2 text-red-600">Yon pwoblèm rive</h1>
            <p className="text-slate-500 mb-6">{message}</p>
            <Link to="/orders" className="text-brand-700 font-medium hover:underline">
              Gade kòmand mwen
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
