import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { Landmark } from 'lucide-react';

export default function Sidebar({ items, open, onClose }) {
  return (
    <>
      {/* Backdrop mobile */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={clsx(
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0',
          'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
          'transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-200 dark:border-slate-800">
          <div className="size-9 rounded-lg bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center shadow-sm">
            <Landmark className="size-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">BankApp</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Banque digitale</p>
          </div>
        </div>

        <nav className="p-3 space-y-0.5">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                )
              }
            >
              <item.icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
