import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import Stars from './Stars';

const money = (n) => `${Number(n).toLocaleString('fr-HT')} G`;

export default function ProductCard({ product }) {
  const lowStock = product.stock > 0 && product.stock <= 3;
  const { isWished, toggle } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const wished = isWished(product.id);

  async function handleHeart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    await toggle(product.id);
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">
            🖼️
          </div>
        )}

        {/* Bouton kè (favori) */}
        <button
          onClick={handleHeart}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
            wished ? 'bg-white text-coral-500' : 'bg-white/80 text-slate-400 hover:text-coral-500'
          }`}
          title={wished ? 'Retire nan favori' : 'Ajoute nan favori'}
        >
          {wished ? '❤️' : '🤍'}
        </button>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
            <span className="bg-white/95 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">
              Pa gen stòk
            </span>
          </div>
        )}
        {lowStock && (
          <span className="absolute top-2 left-2 bg-coral-500 text-white text-[11px] font-semibold px-2 py-1 rounded-full shadow-soft">
            Rete {product.stock} sèlman
          </span>
        )}
      </div>

      <div className="p-3.5 flex-1 flex flex-col">
        <p className="text-[11px] uppercase tracking-wide text-brand-600 font-semibold mb-0.5">
          {product.storeName}
        </p>
        <h3 className="font-medium leading-snug line-clamp-2 text-slate-800 group-hover:text-brand-700 transition-colors">
          {product.name}
        </h3>

        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Stars value={product.avgRating} size="text-xs" />
            <span className="text-[11px] text-slate-400">({product.reviewCount})</span>
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-display font-bold text-brand-800">{money(product.price)}</span>
          <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

export { money };
