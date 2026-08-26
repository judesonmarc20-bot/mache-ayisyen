import { useEffect, useState } from 'react';
import api from '../api/client';
import Stars from './Stars';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ReviewSection({ productId }) {
  const [data, setData] = useState({ reviews: [], summary: { count: 0, average: 0 }, canReview: false, hasReviewed: false });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  function load() {
    api.get(`/products/${productId}/reviews`).then((res) => setData(res.data));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment });
      setComment('');
      showToast('Mèsi pou evalyasyon ou!', { type: 'success' });
      load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erè pandan evalyasyon an.', { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  const { reviews, summary, canReview, hasReviewed } = data;

  return (
    <div className="mt-12 border-t border-slate-100 pt-8">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-display text-xl font-bold text-slate-900">Evalyasyon</h2>
        {summary.count > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={summary.average} />
            <span className="text-sm text-slate-500">
              {summary.average} · {summary.count} evalyasyon
            </span>
          </div>
        )}
      </div>

      {/* Fòm pou bay yon review (si moun nan gen dwa) */}
      {user && canReview && (
        <form onSubmit={submit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-2">Bay evalyasyon ou:</p>
          <div className="mb-3 text-2xl">
            <Stars value={rating} onChange={setRating} size="text-2xl" />
          </div>
          <textarea
            placeholder="Pataje eksperyans ou ak pwodwi sa a (opsyonèl)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
            rows={2}
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-800 disabled:opacity-50"
          >
            {submitting ? 'Ap voye...' : 'Voye evalyasyon'}
          </button>
        </form>
      )}
      {user && hasReviewed && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-6">
          Ou deja evalye pwodwi sa a. Mèsi!
        </p>
      )}
      {user && !canReview && !hasReviewed && (
        <p className="text-sm text-slate-500 mb-6">
          Sèlman moun ki achte pwodwi sa a ka evalye l.
        </p>
      )}

      {/* Lis review yo */}
      {reviews.length === 0 ? (
        <p className="text-slate-400 text-sm">Poko gen evalyasyon. Se ou ki ka premye a!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center">
                  {r.userName.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-medium text-slate-700">{r.userName}</span>
                <Stars value={r.rating} size="text-xs" />
              </div>
              {r.comment && <p className="text-sm text-slate-600 mt-1">{r.comment}</p>}
              <p className="text-[11px] text-slate-400 mt-1">
                {new Date(r.createdAt).toLocaleDateString('fr-HT')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
