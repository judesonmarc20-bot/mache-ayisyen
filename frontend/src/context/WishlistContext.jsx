// =========================================================================
// WishlistContext.jsx — Eta wishlist (favori) pataje nan tout app la
// =========================================================================
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);

  const refresh = useCallback(async () => {
    if (!user) return setIds([]);
    try {
      const res = await api.get('/wishlist/ids');
      setIds(res.data.productIds);
    } catch {
      setIds([]);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isWished = useCallback((productId) => ids.includes(productId), [ids]);

  async function toggle(productId) {
    if (!user) return false; // frontend dwe redirije sou login
    if (ids.includes(productId)) {
      const res = await api.delete(`/wishlist/${productId}`);
      setIds(res.data.productIds);
    } else {
      const res = await api.post('/wishlist', { productId });
      setIds(res.data.productIds);
    }
    return true;
  }

  return (
    <WishlistContext.Provider value={{ ids, isWished, toggle, refresh, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
