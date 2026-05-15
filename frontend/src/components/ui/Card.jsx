import clsx from 'clsx';

export default function Card({ title, subtitle, action, children, className = '', padding = 'default' }) {
  return (
    <div className={clsx('card', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            {title && <h3 className="text-base font-semibold">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={clsx(padding === 'default' && 'p-5', padding === 'none' && '')}>{children}</div>
    </div>
  );
}
