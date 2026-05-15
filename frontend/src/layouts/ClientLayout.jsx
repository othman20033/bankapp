import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  History,
  UserCircle,
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

const items = [
  { to: '/app', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/app/accounts', label: 'Mes comptes', icon: Wallet },
  { to: '/app/transfer', label: 'Effectuer un virement', icon: ArrowLeftRight },
  { to: '/app/transactions', label: 'Historique', icon: History },
  { to: '/app/profile', label: 'Mon profil', icon: UserCircle },
];

export default function ClientLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar items={items} open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
