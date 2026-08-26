// Montre yon nòt an zetwal (lekti sèlman), oswa yon seleksyon entèaktif
// si ou pase onChange.
export default function Stars({ value = 0, onChange, size = 'text-base' }) {
  const rounded = Math.round(value);
  return (
    <span className={`inline-flex ${size}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = onChange ? n <= value : n <= rounded;
        return onChange ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`leading-none ${filled ? 'text-amber-400' : 'text-slate-300'} hover:text-amber-400 transition-colors`}
            aria-label={`${n} zetwal`}
          >
            ★
          </button>
        ) : (
          <span key={n} className={`leading-none ${filled ? 'text-amber-400' : 'text-slate-300'}`}>
            ★
          </span>
        );
      })}
    </span>
  );
}
