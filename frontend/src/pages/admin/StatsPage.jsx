import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import { useGetStatsOverviewQuery } from '@/features/admin/adminApi';
import { formatCurrency } from '@/utils/formatters';

export default function StatsPage() {
  const { data, isLoading } = useGetStatsOverviewQuery();

  if (isLoading) return <Loader full />;
  if (!data) return null;

  // Top : count + volume side by side par jour
  const chart = (data.daily_evolution || []).map((d) => ({
    label: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    count: d.count,
    volume: parseFloat(d.volume) || 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistiques avancées</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Analyse détaillée des transactions sur 30 jours.
        </p>
      </div>

      <Card title="Nombre de transactions par jour">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,23,42,0.95)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#f1f5f9',
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Transactions" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Volume financier par jour">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
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
              <Legend />
              <Bar dataKey="volume" fill="#10b981" name="Volume" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Tableau récap par type */}
      <Card title="Répartition par type (30 jours)" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs uppercase text-slate-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-right px-4 py-3 font-medium">Nombre</th>
                <th className="text-right px-4 py-3 font-medium">Volume total</th>
                <th className="text-right px-4 py-3 font-medium">Moyenne</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.entries(data.by_type || {}).map(([type, vals]) => {
                const volume = parseFloat(vals.volume) || 0;
                const avg = vals.count > 0 ? volume / vals.count : 0;
                return (
                  <tr key={type}>
                    <td className="px-4 py-3 font-medium capitalize">{type}</td>
                    <td className="px-4 py-3 text-right">{vals.count}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(volume)}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(avg)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
