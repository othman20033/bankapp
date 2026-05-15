import { Link } from 'react-router-dom';
import { Wallet, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Plus } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import StatCard from '@/components/common/StatCard';
import TransactionRow from '@/components/common/TransactionRow';
import AccountCard from '@/components/common/AccountCard';
import { useGetAccountsQuery } from '@/features/accounts/accountsApi';
import { useGetTransactionsQuery } from '@/features/transactions/transactionsApi';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/formatters';
import { useMemo } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: accounts = [], isLoading: loadingAccounts } = useGetAccountsQuery();
  const { data: txPage, isLoading: loadingTx } = useGetTransactionsQuery({ per_page: 8 });

  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0),
    [accounts],
  );

  // Agrégation 30 jours pour le graphique
  const chartData = useMemo(() => {
    if (!txPage?.data) return [];
    const today = new Date();
    const map = new Map();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { date: key, in: 0, out: 0 });
    }
    txPage.data.forEach((tx) => {
      const key = tx.created_at?.slice(0, 10);
      const row = map.get(key);
      if (!row) return;
      const amount = parseFloat(tx.amount);
      if (tx.type === 'deposit') row.in += amount;
      else row.out += amount;
    });
    return Array.from(map.values()).map((r) => ({
      ...r,
      label: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    }));
  }, [txPage]);

  const transactionsCount = txPage?.meta?.total ?? 0;
  const monthIn = chartData.reduce((s, r) => s + r.in, 0);
  const monthOut = chartData.reduce((s, r) => s + r.out, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Bonjour {user?.first_name} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Voici un aperçu de votre activité bancaire.
          </p>
        </div>
        <Link to="/app/transfer" className="btn-primary">
          <ArrowLeftRight className="size-4" /> Nouveau virement
        </Link>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Solde total"
          value={formatCurrency(totalBalance)}
          icon={Wallet}
          accent="primary"
          hint={`${accounts.length} compte(s)`}
        />
        <StatCard
          label="Crédits (30 j)"
          value={formatCurrency(monthIn)}
          icon={ArrowDownLeft}
          accent="success"
        />
        <StatCard
          label="Débits (30 j)"
          value={formatCurrency(monthOut)}
          icon={ArrowUpRight}
          accent="warning"
        />
        <StatCard
          label="Transactions"
          value={transactionsCount}
          icon={ArrowLeftRight}
          accent="primary"
          hint="depuis le début"
        />
      </div>

      {/* Graphique */}
      <Card title="Évolution sur 30 jours" subtitle="Crédits et débits journaliers">
        <div className="h-72">
          {loadingTx ? (
            <Loader />
          ) : chartData.length === 0 ? (
            <EmptyState title="Aucune donnée" description="Aucune transaction sur la période." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{
                    background: 'rgba(15,23,42,0.95)',
                    border: 'none',
                    borderRadius: 8,
                    color: '#f1f5f9',
                  }}
                />
                <Area type="monotone" dataKey="in" stroke="#10b981" fill="url(#gIn)" name="Crédits" />
                <Area type="monotone" dataKey="out" stroke="#f59e0b" fill="url(#gOut)" name="Débits" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comptes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mes comptes</h2>
            <Link to="/app/accounts" className="text-sm text-primary-600 hover:underline">
              Voir tout
            </Link>
          </div>
          {loadingAccounts ? (
            <Loader />
          ) : accounts.length === 0 ? (
            <Card>
              <EmptyState
                icon={Wallet}
                title="Aucun compte pour le moment"
                description="Créez votre premier compte bancaire."
                action={
                  <Link to="/app/accounts" className="btn-primary">
                    <Plus className="size-4" /> Créer un compte
                  </Link>
                }
              />
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {accounts.slice(0, 4).map((a) => (
                <AccountCard key={a.id} account={a} />
              ))}
            </div>
          )}
        </div>

        {/* Dernières transactions */}
        <Card
          title="Dernières transactions"
          action={
            <Link to="/app/transactions" className="text-xs text-primary-600 hover:underline">
              Tout voir
            </Link>
          }
          padding="none"
        >
          <div className="px-4 pb-2">
            {loadingTx ? (
              <Loader />
            ) : !txPage?.data?.length ? (
              <EmptyState title="Aucune transaction" />
            ) : (
              txPage.data.slice(0, 6).map((tx) => <TransactionRow key={tx.id} transaction={tx} />)
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
