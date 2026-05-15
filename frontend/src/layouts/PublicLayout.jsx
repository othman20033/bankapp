import { Outlet, Link } from 'react-router-dom';
import { Landmark, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function PublicLayout() {
  const { toggle, isDark } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 lg:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center shadow-sm">
              <Landmark className="size-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">BankApp</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Banque digitale</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Basculer le thème"
            >
              {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <Link to="/login" className="btn-ghost">Connexion</Link>
            <Link to="/register" className="btn-primary">Ouvrir un compte</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} BankApp — Projet pédagogique fintech.
      </footer>
    </div>
  );
}
