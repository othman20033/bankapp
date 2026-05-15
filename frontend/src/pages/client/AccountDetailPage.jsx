import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ArrowDownLeft, ArrowUpRight, Copy, Wallet, CreditCard, PiggyBank,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import TransactionRow from '@/components/common/TransactionRow';
import { useGetAccountQuery } from '@/features/accounts/accountsApi';
import {
  useGetTransactionsQuery,
  useDepositMutation,
  useWithdrawMutation,
} from '@/features/transactions/transactionsApi';
import { formatCurrency, formatIban, formatDate } from '@/utils/formatters';
import { extractErrorMessage } from '@/utils/errors';

const txSchema = z.object({
  amount: z.preprocess(
    (v) => Number(v),
    z.number({ invalid_type_error: 'Montant requis' }).positive('Montant > 0'),
  ),
  description: z.string().max(255).optional(),
});

const typeIcons = { checking: CreditCard, savings: PiggyBank };
const statusVariants = { active: 'success', blocked: 'danger', closed: 'neutral' };

export default function AccountDetailPage() {
  const { id } = useParams();
  const accountId = Number(id);
  const { data: account, isLoading } = useGetAccountQuery(accountId);
  const { data: txPage, isLoading: txLoading } = useGetTransactionsQuery({
    account_id: accountId,
    per_page: 10,
  });

  const [mode, setMode] = useState(null); // 'deposit' | 'withdraw' | null
  const [deposit, { isLoading: depositing }] = useDepositMutation();
  const [withdraw, { isLoading: withdrawing }] = useWithdrawMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(txSchema),
  });

  if (isLoading) return <Loader full />;
  if (!account) return <EmptyState title="Compte introuvable" />;

  const Icon = typeIcons[account.type] ?? CreditCard;

  const onSubmit = async (data) => {
    const action = mode === 'deposit' ? deposit : withdraw;
    const verb = mode === 'deposit' ? 'Dépôt' : 'Retrait';
    try {
      await action({ account_id: accountId, ...data }).unwrap();
      toast.success(`${verb} effectué ✅`);
      setMode(null);
      reset();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(account.account_number);
      toast.success('RIB copié');
    } catch {
      toast.error('Impossible de copier');
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/app/accounts" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
        <ArrowLeft className="size-4" /> Retour aux comptes
      </Link>

      {/* Carte solde */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white p-6 lg:p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="size-12 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Icon className="size-6" />
            </div>
            <Badge variant={statusVariants[account.status]}>{account.status_label}</Badge>
          </div>
          <p className="text-sm text-primary-100">{account.type_label}</p>
          <p className="text-4xl lg:text-5xl font-bold mt-1 mb-6">
            {formatCurrency(account.balance, account.currency)}
          </p>
          <div className="flex items-center gap-2 group cursor-pointer" onClick={copyIban}>
            <p className="font-mono text-sm text-primary-50 tracking-wider">
              {formatIban(account.account_number)}
            </p>
            <Copy className="size-3.5 text-primary-200 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs text-primary-200 mt-1">
            Ouvert le {formatDate(account.opened_at)}
          </p>
        </div>

        {/* Actions rapides */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Button
            variant="secondary"
            icon={ArrowDownLeft}
            onClick={() => setMode('deposit')}
            disabled={account.status !== 'active'}
          >
            Déposer
          </Button>
          <Button
            variant="secondary"
            icon={ArrowUpRight}
            onClick={() => setMode('withdraw')}
            disabled={account.status !== 'active'}
          >
            Retirer
          </Button>
          <Link to={`/app/transfer?from=${accountId}`} className="btn-secondary col-span-2 sm:col-span-1">
            <Wallet className="size-4" /> Virement
          </Link>
        </div>
      </div>

      {/* Historique */}
      <Card
        title="Dernières opérations"
        action={
          <Link
            to={`/app/transactions?account_id=${accountId}`}
            className="text-sm text-primary-600 hover:underline"
          >
            Tout voir
          </Link>
        }
        padding="none"
      >
        <div className="px-4 pb-2">
          {txLoading ? (
            <Loader />
          ) : !txPage?.data?.length ? (
            <EmptyState title="Aucune opération" description="Vos prochaines opérations apparaîtront ici." />
          ) : (
            txPage.data.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} accountId={accountId} />
            ))
          )}
        </div>
      </Card>

      {/* Modal dépôt/retrait */}
      <Modal
        open={mode !== null}
        onClose={() => { setMode(null); reset(); }}
        title={mode === 'deposit' ? 'Effectuer un dépôt' : 'Effectuer un retrait'}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setMode(null); reset(); }}>Annuler</Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              loading={depositing || withdrawing}
            >
              Confirmer
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
            <p className="text-slate-500">Compte concerné</p>
            <p className="font-mono mt-0.5">{formatIban(account.account_number)}</p>
            <p className="text-slate-500 mt-1">
              Solde actuel : <span className="font-semibold text-slate-700 dark:text-slate-200">
                {formatCurrency(account.balance, account.currency)}
              </span>
            </p>
          </div>

          <Input
            label="Montant (MAD)"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount')}
          />

          <Input
            label="Description (optionnel)"
            placeholder="Ex: Salaire, Loyer..."
            error={errors.description?.message}
            {...register('description')}
          />
        </form>
      </Modal>
    </div>
  );
}
