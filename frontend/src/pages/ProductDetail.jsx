import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { money } from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import Stars from '../components/Stars';
import ReviewSection from '../components/ReviewSection';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [asking, setAsking] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isWished, toggle } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    setProduct(null);
    api.get(`/products/${id}`).then((res) => setProduct(res.data.product));
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 grid sm:grid-cols-2 gap-8 animate-pulse">
        <div className="aspect-square bg-slate-200 rounded-2xl" />
        <div className="space-y-3">
          <div className="h-3 bg-slate-200 rounded w-1/4" />
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-24 bg-slate-200 rounded w-full mt-4" />
        </div>
      </div>
    );
  }

  const wished = isWished(product.id);

  async function handleAdd() {
    if (!user) return navigate('/login');
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      showToast(`${product.name} ajoute nan panye a`, { type: 'success' });
    } finally {
      setAdding(false);
    }
  }

  async function handleHeart() {
    if (!user) return navigate('/login');
    await toggle(product.id);
  }

  // Kòmanse (oswa reprann) yon konvèsasyon ak magazen an, epi ale sou paj chat la.
  async function handleAsk() {
    if (!user) return navigate('/login');
    setAsking(true);
    try {
      const res = await api.post('/conversations', { storeId: product.storeId });
      navigate(`/messages/${res.data.conversation.id}`);
    } catch (err) {
      showToast(err.response?.data?.error || 'Erè pandan louvri chat la.', { type: 'error' });
      setAsking(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-xs text-slate-400 mb-5 flex items-center gap-1.5">
        <Link to="/" className="hover:text-brand-600">
          Magazen
        </Link>
        <span>/</span>
        <span className="text-slate-500">{product.name}</span>
      </nav>

      <div className="grid sm:grid-cols-2 gap-10">
        <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-soft">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-slate-300">
              🖼️
            </div>
          )}
          <button
            onClick={handleHeart}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm shadow-soft transition-colors ${
              wished ? 'bg-white text-coral-500' : 'bg-white/85 text-slate-400 hover:text-coral-500'
            }`}
            title={wished ? 'Retire nan favori' : 'Ajoute nan favori'}
          >
            <span className="text-lg">{wished ? '❤️' : '🤍'}</span>
          </button>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide font-semibold text-brand-600 mb-2">
            {product.storeName}
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900">{product.name}</h1>

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <Stars value={product.avgRating} size="text-sm" />
              <span className="text-sm text-slate-500">
                {Math.round(product.avgRating * 10) / 10} ({product.reviewCount})
              </span>
            </div>
          )}

          <p className="text-2xl font-display font-bold text-brand-700 mt-3">
            {money(product.price)}
          </p>
          <p className="text-slate-600 mt-4 leading-relaxed">{product.description}</p>

          <p className="text-sm mt-3">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {product.stock} disponib
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-full font-medium">
                Pa gen stòk kounye a
              </span>
            )}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-10 text-slate-500 hover:bg-slate-50"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                className="w-12 text-center outline-none"
              />
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="w-9 h-10 text-slate-500 hover:bg-slate-50"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={product.stock === 0 || adding}
              className="flex-1 bg-brand-700 text-white px-5 py-2.5 rounded-lg hover:bg-brand-800 disabled:opacity-50 font-medium shadow-soft transition-colors"
            >
              {adding ? 'Ap ajoute...' : 'Ajoute nan panye'}
            </button>
          </div>

          <button
            onClick={handleAsk}
            disabled={asking}
            className="mt-3 w-full border border-brand-200 text-brand-700 px-5 py-2.5 rounded-lg hover:bg-brand-50 font-medium transition-colors disabled:opacity-50"
          >
            💬 Poze vandè a yon kesyon
          </button>
        </div>
      </div>

      <ReviewSection productId={product.id} />
    </div>
  );
}
