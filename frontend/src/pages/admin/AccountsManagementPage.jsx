import { useState, useEffect } from 'react';
import { Search, Lock, Unlock, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/common/Pagination';
import {
  useGetAdminAccountsQuery,
  useBlockAccountMutation,
  useActivateAccountMutation,
} from '@/features/admin/adminApi';
import { extractErrorMessage } from '@/utils/errors';
import { formatCurrency, formatIban } from '@/utils/formatters';

function useDebounced(v, d = 400) {
  const [val, setVal] = useState(v);
  useEffect(() => {
    const id = setTimeout(() => setVal(v), d);
    return () => clearTimeout(id);
  }, [v, d]);
  return val;
}

export default function AccountsManagementPage() {
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 });
  const debouncedSearch = useDebounced(filters.search);

  const { data, isLoading, isFetching } = useGetAdminAccountsQuery({
    search: debouncedSearch || undefined,
    status: filters.status || undefined,
    page: filters.page,
  });
  const [blockAccount, { isLoading: blocking }] = useBlockAccountMutation();
  const [activateAccount, { isLoading: activating }] = useActivateAccountMutation();

  const [blockingAcc, setBlockingAcc] = useState(null);
  const [reason, setReason] = useState('');

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  const handleBlock = async () => {
    try {
      await blockAccount({ id: blockingAcc.id, reason }).unwrap();
      toast.success('Compte bloqué.');
      setBlockingAcc(null);
      setReason('');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleActivate = async (acc) => {
    if (!window.confirm(`Réactiver le compte ${formatIban(acc.account_number)} ?`)) return;
    try {
      await activateAccount(acc.id).unwrap();
      toast.success('Compte réactivé.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const statusVariants = { active: 'success', blocked: 'danger', closed: 'neutral' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comptes bancaires</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Supervision et gestion de tous les comptes de la plateforme.
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            leftIcon={Search}
            placeholder="Numéro de compte..."
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
          />
          <Select
            placeholder="Tous les statuts"
            options={[
              { value: 'active', label: 'Actifs' },
              { value: 'blocked', label: 'Bloqués' },
              { value: 'closed', label: 'Clôturés' },
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
          <EmptyState icon={Wallet} title="Aucun compte" />
        ) : (
          <div className={`overflow-x-auto ${isFetching ? 'opacity-60' : ''}`}>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">RIB</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Titulaire</th>
                  <th className="text-right px-4 py-3 font-medium">Solde</th>
                  <th className="text-left px-4 py-3 font-medium">Statut</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.data.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono text-xs">{formatIban(acc.account_number)}</td>
                    <td className="px-4 py-3">{acc.type_label}</td>
                    <td className="px-4 py-3">{acc.owner?.full_name}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(acc.balance, acc.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariants[acc.status]}>{acc.status_label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {acc.status === 'active' ? (
                        <Button
                          variant="danger"
                          icon={Lock}
                          onClick={() => setBlockingAcc(acc)}
                          className="!py-1.5 !px-3 !text-xs"
                        >
                          Bloquer
                        </Button>
                      ) : acc.status === 'blocked' ? (
                        <Button
                          variant="secondary"
                          icon={Unlock}
                          onClick={() => handleActivate(acc)}
                          disabled={activating}
                          className="!py-1.5 !px-3 !text-xs"
                        >
                          Réactiver
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination meta={data?.meta} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />

      <Modal
        open={blockingAcc !== null}
        onClose={() => { setBlockingAcc(null); setReason(''); }}
        title="Bloquer le compte"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setBlockingAcc(null); setReason(''); }}>Annuler</Button>
            <Button variant="danger" onClick={handleBlock} loading={blocking}>Bloquer</Button>
          </>
        }
      >
        {blockingAcc && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
              <p className="font-mono">{formatIban(blockingAcc.account_number)}</p>
              <p className="text-slate-500 mt-1">Titulaire : {blockingAcc.owner?.full_name}</p>
              <p className="text-slate-500">Solde : {formatCurrency(blockingAcc.balance, blockingAcc.currency)}</p>
            </div>
            <Input
              label="Motif du blocage"
              placeholder="Ex: Suspicion de fraude, demande client..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              hint="Ce motif sera enregistré dans le journal d'audit."
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
