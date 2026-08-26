export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🛍️</span>
            <span className="font-display font-bold text-brand-800">Mache Ayisyen</span>
          </div>
          <p className="text-slate-500">
            Platfòm ki konekte machann ak atizan lokal ak kliyan toupatou —
            achte lokal, sipòte lokal.
          </p>
        </div>
        <div>
          <p className="font-display font-semibold text-slate-700 mb-2">Peman</p>
          <p className="text-slate-500 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-coral-50 text-coral-700 px-2 py-1 rounded-md font-medium">
              📱 MonCash
            </span>
          </p>
        </div>
        <div>
          <p className="font-display font-semibold text-slate-700 mb-2">Kontak</p>
          <p className="text-slate-500">kontak@macheayisyen.ht</p>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Mache Ayisyen. Tout dwa rezève.
      </div>
    </footer>
  );
}
