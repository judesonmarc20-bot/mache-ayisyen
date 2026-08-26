import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50/70'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:bg-slate-50'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center gap-2 shrink-0 group" onClick={() => setOpen(false)}>
          <span className="text-2xl transition-transform group-hover:scale-110">🛍️</span>
          <span className="font-display font-bold text-lg text-brand-800 tracking-tight">
            Mache Ayisyen
          </span>
        </NavLink>

        {/* Nav konplè pou ekran mwayen/laj */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <NavLink to="/" end className={linkClass}>
            Magazen
          </NavLink>
          <NavLink to="/cart" className={linkClass}>
            <span className="relative inline-flex items-center gap-1">
              Panye
              {count > 0 && (
                <span className="absolute -top-2.5 -right-3.5 bg-coral-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {count}
                </span>
              )}
            </span>
          </NavLink>

          {!user && (
            <>
              <NavLink to="/login" className={linkClass}>
                Konekte
              </NavLink>
              <NavLink
                to="/register"
                className="ml-1 bg-brand-700 text-white px-4 py-2 rounded-lg hover:bg-brand-800 transition-colors shadow-soft"
              >
                Enskri
              </NavLink>
            </>
          )}

          {user && (
            <>
              <NavLink to="/wishlist" className={linkClass} title="Favori">
                ❤️
              </NavLink>
              <NavLink to="/messages" className={linkClass}>
                Mesaj
              </NavLink>
              <NavLink to="/orders" className={linkClass}>
                Kòmand
              </NavLink>
              {user.role === 'VENDOR' && (
                <NavLink to="/vendor" className={linkClass}>
                  Magazen mwen
                </NavLink>
              )}
              {user.role === 'ADMIN' && (
                <NavLink to="/admin" className={linkClass}>
                  Admin
                </NavLink>
              )}

              <div className="ml-2 pl-3 border-l border-slate-200 flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-display font-semibold text-sm flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-slate-600">{user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                  title="Dekonekte"
                >
                  Dekonekte
                </button>
              </div>
            </>
          )}
        </nav>

        {/* Panye + bouton "hamburger" pou mobil */}
        <div className="flex md:hidden items-center gap-1">
          <NavLink to="/cart" className="relative p-2 text-slate-600" onClick={() => setOpen(false)}>
            🛒
            {count > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-coral-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                {count}
              </span>
            )}
          </NavLink>
          <button
            onClick={() => setOpen((o) => !o)}
            className="p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Meni"
          >
            <span className="text-xl leading-none">{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Meni mobil ki deplwaye */}
      {open && (
        <nav className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 animate-fade-in-up">
          <NavLink to="/" end className={mobileLinkClass} onClick={() => setOpen(false)}>
            Magazen
          </NavLink>

          {!user && (
            <>
              <NavLink to="/login" className={mobileLinkClass} onClick={() => setOpen(false)}>
                Konekte
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setOpen(false)}
                className="block text-center mt-2 bg-brand-700 text-white px-4 py-2.5 rounded-lg font-medium"
              >
                Enskri
              </NavLink>
            </>
          )}

          {user && (
            <>
              <NavLink to="/wishlist" className={mobileLinkClass} onClick={() => setOpen(false)}>
                ❤️ Favori
              </NavLink>
              <NavLink to="/messages" className={mobileLinkClass} onClick={() => setOpen(false)}>
                💬 Mesaj
              </NavLink>
              <NavLink to="/orders" className={mobileLinkClass} onClick={() => setOpen(false)}>
                Kòmand mwen
              </NavLink>
              {user.role === 'VENDOR' && (
                <NavLink to="/vendor" className={mobileLinkClass} onClick={() => setOpen(false)}>
                  Magazen mwen
                </NavLink>
              )}
              {user.role === 'ADMIN' && (
                <NavLink to="/admin" className={mobileLinkClass} onClick={() => setOpen(false)}>
                  Admin
                </NavLink>
              )}
              <div className="flex items-center justify-between px-3 pt-2 mt-1 border-t border-slate-100">
                <span className="text-sm text-slate-500">
                  Konekte kòm <span className="font-medium text-slate-700">{user.name}</span>
                </span>
                <button onClick={handleLogout} className="text-sm text-red-600 font-medium">
                  Dekonekte
                </button>
              </div>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
