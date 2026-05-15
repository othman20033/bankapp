import { useState, useEffect } from 'react';
import { Search, ShieldCheck, ShieldOff, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/common/Pagination';
import {
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
} from '@/features/admin/adminApi';
import { extractErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/formatters';

function useDebounced(v, d = 400) {
  const [val, setVal] = useState(v);
  useEffect(() => {
    const id = setTimeout(() => setVal(v), d);
    return () => clearTimeout(id);
  }, [v, d]);
  return val;
}

export default function UsersManagementPage() {
  const [filters, setFilters] = useState({ search: '', role: '', status: '', page: 1 });
  const debouncedSearch = useDebounced(filters.search);

  const { data, isLoading, isFetching } = useGetAdminUsersQuery({
    search: debouncedSearch || undefined,
    role: filters.role || undefined,
    status: filters.status || undefined,
    page: filters.page,
  });
  const [updateStatus, { isLoading: updating }] = useUpdateUserStatusMutation();

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const verb = newStatus === 'suspended' ? 'suspendre' : 'réactiver';

    if (!window.confirm(`Voulez-vous vraiment ${verb} ${user.full_name} ?`)) return;

    try {
      await updateStatus({ id: user.id, status: newStatus }).unwrap();
      toast.success(`Utilisateur ${verb === 'suspendre' ? 'suspendu' : 'réactivé'}.`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Gestion des comptes clients et administrateurs.
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            leftIcon={Search}
            placeholder="Nom, prénom ou email..."
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
          />
          <Select
            placeholder="Tous les rôles"
            options={[
              { value: 'client', label: 'Clients' },
              { value: 'admin', label: 'Administrateurs' },
            ]}
            value={filters.role}
            onChange={(e) => set('role', e.target.value)}
          />
          <Select
            placeholder="Tous les statuts"
            options={[
              { value: 'active', label: 'Actifs' },
              { value: 'suspended', label: 'Suspendus' },
            ]}
            value={filters.status}
            onChange={(e) => set('status', e.target.value)}
          />
        </div>
      </Card>

      <Card padding="none">
        {isLoading ? (
          <Loader />
        ) : !data?.data?.length ? (
          <EmptyState icon={Users} title="Aucun utilisateur" />
        ) : (
          <div className={`overflow-x-auto ${isFetching ? 'opacity-60' : ''}`}>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Rôle</th>
                  <th className="text-left px-4 py-3 font-medium">Statut</th>
                  <th className="text-left px-4 py-3 font-medium">Inscrit le</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.data.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 text-white text-xs font-semibold flex items-center justify-center">
                          {u.first_name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === 'admin' ? 'info' : 'neutral'}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.status === 'active' ? 'success' : 'danger'}>
                        {u.status === 'active' ? 'Actif' : 'Suspendu'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== 'admin' && (
                        <Button
                          variant={u.status === 'active' ? 'danger' : 'secondary'}
                          icon={u.status === 'active' ? ShieldOff : ShieldCheck}
                          onClick={() => toggleStatus(u)}
                          disabled={updating}
                          className="!py-1.5 !px-3 !text-xs"
                        >
                          {u.status === 'active' ? 'Suspendre' : 'Réactiver'}
                        </Button>
                      )}
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
