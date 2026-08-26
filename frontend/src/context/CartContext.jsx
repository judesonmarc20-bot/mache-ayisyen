// =========================================================================
// CartContext.jsx — Eta panye a, pataje nan tout app la
// =========================================================================
import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!user) return setItems([]);
    const res = await api.get('/cart');
    setItems(res.data.items);
  }, [user]);

  async function addToCart(productId, quantity = 1) {
    const res = await api.post('/cart', { productId, quantity });
    setItems(res.data.items);
  }

  async function updateQuantity(itemId, quantity) {
    const res = await api.put(`/cart/${itemId}`, { quantity });
    setItems(res.data.items);
  }

  async function removeFromCart(itemId) {
    const res = await api.delete(`/cart/${itemId}`);
    setItems(res.data.items);
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, refresh, addToCart, updateQuantity, removeFromCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
