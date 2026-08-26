import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ids } = useWishlist();

  function load() {
    setLoading(true);
    api
      .get('/wishlist')
      .then((res) => setItems(res.data.items))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // recharge lè lis ids la chanje (egzanp: ou retire yon favori)
  }, [ids.length]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-slate-900 mb-6">❤️ Favori mwen</h1>

      {loading ? (
        <p className="text-slate-500">Ap chaje...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🤍</div>
          <p className="text-slate-500 mb-4">Ou poko gen pwodwi favori.</p>
          <Link to="/" className="text-brand-700 font-medium hover:underline">
            Ale dekouvri pwodwi yo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
