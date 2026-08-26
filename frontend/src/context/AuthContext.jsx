// =========================================================================
// AuthContext.jsx — Eta koneksyon itilizatè a, pataje nan tout app la
// =========================================================================
// "Context" nan React se yon fason pou pataje done (isit: itilizatè a
// konekte a, ak fonksyon login/logout) san nou pa bezwen pase yo
// kòm "props" nan chak nivo kompozan. Nenpòt kompozan ka rele
// useAuth() pou jwenn eta a.
// =========================================================================
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        setStore(res.data.store);
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    const me = await api.get('/auth/me');
    setStore(me.data.store);
    return res.data.user;
  }

  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setStore(null);
  }

  return (
    <AuthContext.Provider value={{ user, store, loading, login, register, logout, setStore }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
