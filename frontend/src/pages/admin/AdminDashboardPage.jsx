import { Users, Wallet, ShieldOff, TrendingUp, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import StatCard from '@/components/common/StatCard';
import { useGetStatsOverviewQuery } from '@/features/admin/adminApi';
import { formatCurrency } from '@/utils/formatters';

const TYPE_COLORS = {
  deposit: '#10b981',
  withdrawal: '#f59e0b',
  transfer: '#3b82f6',
};

const TYPE_LABELS = {
  deposit: 'Dépôts',
  withdrawal: 'Retraits',
  transfer: 'Virements',
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetStatsOverviewQuery();

  if (isLoading) return <Loader full />;
  if (!data) return null;

  const dailyChart = (data.daily_evolution || []).map((d) => ({
    label: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    volume: parseFloat(d.volume) || 0,
    count: d.count,
  }));

  const pieData = Object.entries(data.by_type || {}).map(([type, vals]) => ({
    name: TYPE_LABELS[type] ?? type,
    value: parseFloat(vals.volume) || 0,
    count: vals.count,
    color: TYPE_COLORS[type] ?? '#94a3b8',
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vue d'ensemble</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Statistiques en temps réel de la plateforme BankApp.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Clients" value={data.totals.clients} icon={Users} accent="primary" />
        <StatCard
          label="Solde global"
          value={formatCurrency(data.totals.total_balance, data.totals.currency)}
          icon={Wallet}
          accent="success"
          hint={`${data.totals.active_accounts} comptes actifs`}
        />
        <StatCard
          label="Comptes bloqués"
          value={data.totals.blocked_accounts}
          icon={ShieldOff}
          accent="danger"
        />
        <StatCard
          label="Volume aujourd'hui"
          value={formatCurrency(data.today.volume, data.totals.currency)}
          icon={TrendingUp}
          accent="primary"
          hint={`${data.today.transactions_count} transactions`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Évolution */}
        <Card title="Volume sur 30 jours" subtitle="Tous types confondus" className="lg:col-span-2">
          <div className="h-72">
            {dailyChart.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-12">Aucune donnée.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
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
                  <Area type="monotone" dataKey="volume" stroke="#3b82f6" fill="url(#adminGrad)" name="Volume" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Répartition par type */}
        <Card title="Répartition par type" subtitle="30 derniers jours">
          <div className="h-72">
            {pieData.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-12">Aucune donnée.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={4}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatCurrency(v)}
                    contentStyle={{
                      background: 'rgba(15,23,42,0.95)',
                      border: 'none',
                      borderRadius: 8,
                      color: '#f1f5f9',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card title="Activité du jour">
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <Activity className="size-5 text-primary-600" />
          <p>
            <strong>{data.today.transactions_count}</strong> transactions effectuées aujourd'hui pour un volume de{' '}
            <strong>{formatCurrency(data.today.volume, data.totals.currency)}</strong>.
          </p>
        </div>
      </Card>
    </div>
  );
}
