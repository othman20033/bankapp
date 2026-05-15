import { useState, useEffect } from 'react';
import { Search, ScrollText } from 'lucide-react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/common/Pagination';
import { useGetAuditLogsQuery } from '@/features/admin/adminApi';
import { formatDateTime } from '@/utils/formatters';

function useDebounced(v, d = 400) {
  const [val, setVal] = useState(v);
  useEffect(() => {
    const id = setTimeout(() => setVal(v), d);
    return () => clearTimeout(id);
  }, [v, d]);
  return val;
}

const actionColors = (action) => {
  if (action.includes('login') || action.includes('register')) return 'info';
  if (action.includes('blocked') || action.includes('suspended') || action.includes('failed')) return 'danger';
  if (action.includes('transfer') || action.includes('deposit') || action.includes('withdraw')) return 'success';
  if (action.includes('updated') || action.includes('changed')) return 'warning';
  return 'neutral';
};

export default function AuditLogsPage() {
  const [filters, setFilters] = useState({ action: '', from: '', to: '', page: 1 });
  const debouncedAction = useDebounced(filters.action);

  const { data, isLoading, isFetching } = useGetAuditLogsQuery({
    action: debouncedAction || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page: filters.page,
  });

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Journal d'audit</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Toutes les actions sensibles de la plateforme, traçables et immuables.
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            leftIcon={Search}
            placeholder="Action (ex: transaction.transfer)"
            value={filters.action}
            onChange={(e) => set('action', e.target.value)}
          />
          <Input type="date" value={filters.from} onChange={(e) => set('from', e.target.value)} />
          <Input type="date" value={filters.to} onChange={(e) => set('to', e.target.value)} />
        </div>
      </Card>

      <Card padding="none">
        {isLoading ? (
          <Loader />
        ) : !data?.data?.length ? (
          <EmptyState icon={ScrollText} title="Aucun log" />
        ) : (
          <div className={`overflow-x-auto ${isFetching ? 'opacity-60' : ''}`}>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs uppercase text-slate-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Action</th>
                  <th className="text-left px-4 py-3 font-medium">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-medium">IP</th>
                  <th className="text-left px-4 py-3 font-medium">Cible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.data.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={actionColors(log.action)}>{log.action}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {log.user
                        ? `${log.user.first_name} ${log.user.last_name}`
                        : <span className="text-slate-400">système</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.ip_address ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {log.auditable_type
                        ? `${log.auditable_type.split('\\').pop()} #${log.auditable_id}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination meta={data?.meta} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
    </div>
  );
}
