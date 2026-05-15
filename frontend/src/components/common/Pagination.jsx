import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

/**
 * Pagination compatible avec le format Laravel paginate().
 * Reçoit l'objet `meta` ({ current_page, last_page, total }) ou bien
 * directement les props { page, lastPage, onChange }.
 */
export default function Pagination({ meta, page, lastPage, onChange }) {
  const current = meta?.current_page ?? page;
  const last = meta?.last_page ?? lastPage;
  const total = meta?.total;

  if (!last || last <= 1) return null;

  const go = (p) => {
    if (p >= 1 && p <= last && p !== current) onChange(p);
  };

  // Affiche au max 5 numéros autour de la page courante
  const pages = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(last, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between gap-2 mt-4 px-2 text-sm">
      <p className="text-slate-500 dark:text-slate-400">
        Page <span className="font-medium text-slate-700 dark:text-slate-200">{current}</span> sur {last}
        {total !== undefined && <> · {total} résultats</>}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => go(current - 1)}
          disabled={current === 1}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Précédent"
        >
          <ChevronLeft className="size-4" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => go(p)}
            className={clsx(
              'min-w-[2rem] h-8 px-2 rounded-md text-sm font-medium',
              p === current
                ? 'bg-primary-600 text-white'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300',
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => go(current + 1)}
          disabled={current === last}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Suivant"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
