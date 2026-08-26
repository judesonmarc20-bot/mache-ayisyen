import { useEffect, useState } from 'react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    api
      .get('/products', { params })
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }, [search, categoryId]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 70%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-24 text-center">
          <span className="inline-block bg-white/10 text-white/90 text-xs font-medium px-3 py-1 rounded-full mb-4 backdrop-blur-sm border border-white/10">
            🇭🇹 Fèt an Ayiti, pou Ayisyen toupatou
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3 text-balance">
            Byenveni nan Mache Ayisyen an
          </h1>
          <p className="text-brand-100/90 max-w-xl mx-auto">
            Achte pwodwi ki soti dirèkteman nan men ti antrepriz ak atizan lokal —
            peye an sekirite ak MonCash.
          </p>
        </div>
      </section>

      {/* Bar rechèch la "flote" sou fwontyè hero a / kontni an */}
      <div className="max-w-3xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-lift border border-slate-100 p-2 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-2 px-3">
            <span className="text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Chèche yon pwodwi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2.5 outline-none text-sm placeholder:text-slate-400"
            />
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border-t sm:border-t-0 sm:border-l border-slate-200 px-3 py-2.5 rounded-xl text-sm text-slate-600 bg-transparent outline-none"
          >
            <option value="">Tout kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            <button
              onClick={() => setCategoryId('')}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                categoryId === ''
                  ? 'bg-brand-700 text-white border-brand-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
              }`}
            >
              Tout
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  categoryId === c.id
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid pwodwi yo */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔎</div>
            <p className="text-slate-500">Pa gen pwodwi ki koresponn ak rechèch ou a.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in-up">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
