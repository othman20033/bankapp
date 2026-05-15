import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import clsx from 'clsx';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

const config = {
  deposit: {
    icon: ArrowDownLeft,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30',
    sign: '+',
    signColor: 'text-emerald-600',
  },
  withdrawal: {
    icon: ArrowUpRight,
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30',
    sign: '−',
    signColor: 'text-rose-600',
  },
  transfer: {
    icon: ArrowLeftRight,
    color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/30',
    sign: '−',
    signColor: 'text-sky-600',
  },
};

const statusVariants = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
  reversed: 'neutral',
};

/**
 * Affiche une transaction sous forme de ligne (responsive).
 *
 * @param transaction  objet TransactionResource depuis l'API
 * @param accountId    si fourni, détermine le signe (− si compte source, + si compte cible)
 */
export default function TransactionRow({ transaction, accountId = null }) {
  const cfg = config[transaction.type] ?? config.deposit;
  const Icon = cfg.icon;

  // Détermine si le compte courant est le bénéficiaire d'un transfert/dépôt
  let sign = cfg.sign;
  let signColor = cfg.signColor;
  if (accountId && transaction.target_account?.id === accountId
      && transaction.source_account?.id !== accountId) {
    sign = '+';
    signColor = 'text-emerald-600';
  }

  return (
    <div className="flex items-center gap-3 py-3 px-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className={clsx('size-10 rounded-lg flex items-center justify-center shrink-0', cfg.color)}>
        <Icon className="size-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {transaction.description || transaction.type_label}
          </p>
          {transaction.status !== 'completed' && (
            <Badge variant={statusVariants[transaction.status]}>{transaction.status}</Badge>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
          <span>{formatDateTime(transaction.created_at)}</span>
          <span className="text-slate-300">·</span>
          <span className="font-mono">{transaction.reference}</span>
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className={clsx('text-sm font-semibold whitespace-nowrap', signColor)}>
          {sign} {formatCurrency(transaction.amount, transaction.currency)}
        </p>
      </div>
    </div>
  );
}
