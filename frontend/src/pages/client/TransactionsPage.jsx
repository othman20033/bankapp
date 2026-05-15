import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, FileDown, History } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import TransactionRow from '@/components/common/TransactionRow';
import Pagination from '@/components/common/Pagination';
import { useGetTransactionsQuery } from '@/features/transactions/transactionsApi';
import { useGetAccountsQuery } from '@/features/accounts/accountsApi';
import api from '@/app/axios';
import { extractErrorMessage } from '@/utils/errors';

function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function TransactionsPage() {
  const [params, setParams] = useSearchParams();

  const [filters, setFilters] = useState({
    type: params.get('type') ?? '',
    account_id: params.get('account_id') ?? '',
    search: '',
    from: '',
    to: '',
    page: 1,
  });

  const debouncedSearch = useDebounced(filters.search);

  const { data: accounts = [] } = useGetAccountsQuery();
  const { data: txPage, isLoading, isFetching } = useGetTransactionsQuery({
    type: filters.type || undefined,
    account_id: filters.account_id || undefined,
    search: debouncedSearch || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page: filters.page,
    per_page: 20,
  });

  // Sync URL avec compte sélectionné
  useEffect(() => {
    const next = new URLSearchParams();
    if (filters.account_id) next.set('account_id', filters.account_id);
    if (filters.type) next.set('type', filters.type);
    setParams(next, { replace: true });
  }, [filters.account_id, filters.type, setParams]);

  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  const exportPdf = async () => {
    const params = new URLSearchParams({
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.account_id ? { account_id: filters.account_id } : {}),
      ...(filters.from ? { from: filters.from } : {}),
      ...(filters.to ? { to: filters.to } : {}),
    });
    const toastId = toast.loading('Génération du PDF...');
    try {
      const res = await api.get(`/transactions/export/pdf?${params.toString()}`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bankapp-transactions-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('PDF téléchargé', { id: toastId });
    } catch (err) {
      toast.error(extractErrorMessage(err.response ?? err), { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Historique des transactions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Toutes vos opérations bancaires, filtrables et exportables.
          </p>
        </div>
        <Button onClick={exportPdf} icon={FileDown} variant="secondary">
          Exporter en PDF
        </Button>
      </div>

      {/* Filtres */}
      <Card padding="default">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            leftIcon={Search}
            placeholder="Référence..."
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
          />
          <Select
            placeholder="Tous les types"
            options={[
              { value: 'deposit', label: 'Dépôts' },
              { value: 'withdrawal', label: 'Retraits' },
              { value: 'transfer', label: 'Virements' },
            ]}
            value={filters.type}
            onChange={(e) => set('type', e.target.value)}
          />
          <Select
            placeholder="Tous les comptes"
            options={accounts.map((a) => ({
              value: String(a.id),
              label: a.account_number.slice(0, 8) + '…' + a.account_number.slice(-4),
            }))}
            value={filters.account_id}
            onChange={(e) => set('account_id', e.target.value)}
          />
          <Input type="date" value={filters.from} onChange={(e) => set('from', e.target.value)} />
          <Input type="date" value={filters.to} onChange={(e) => set('to', e.target.value)} />
        </div>
      </Card>

      {/* Résultats */}
      <Card padding="none">
        <div className="px-4 pb-2">
          {isLoading ? (
            <Loader />
          ) : !txPage?.data?.length ? (
            <EmptyState
              icon={History}
              title="Aucune transaction"
              description="Aucun résultat ne correspond à vos filtres."
            />
          ) : (
            <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
              {txPage.data.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  accountId={filters.account_id ? Number(filters.account_id) : null}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      <Pagination meta={txPage?.meta} onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
    </div>
  );
}
