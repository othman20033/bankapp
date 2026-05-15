import clsx from 'clsx';

export default function StatCard({ label, value, icon: Icon, hint, accent = 'primary' }) {
  const accents = {
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold mt-2 truncate">{value}</p>
          {hint && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{hint}</p>}
        </div>
        {Icon && (
          <div className={clsx('size-10 rounded-lg flex items-center justify-center shrink-0', accents[accent])}>
            <Icon className="size-5" />
          </div>
        )}
      </div>
    </div>
  );
}
