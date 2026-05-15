import { Link } from 'react-router-dom';
import { CreditCard, PiggyBank, ChevronRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatIban } from '@/utils/formatters';

const typeIcons = {
  checking: CreditCard,
  savings: PiggyBank,
};

const statusVariants = {
  active: 'success',
  blocked: 'danger',
  closed: 'neutral',
};

export default function AccountCard({ account }) {
  const Icon = typeIcons[account.type] ?? CreditCard;

  return (
    <Link
      to={`/app/accounts/${account.id}`}
      className="card p-5 hover:shadow-card-hover transition-shadow group block"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="size-10 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-sm">
          <Icon className="size-5" />
        </div>
        <Badge variant={statusVariants[account.status]}>{account.status_label}</Badge>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{account.type_label}</p>
      <p className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
        {formatIban(account.account_number)}
      </p>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] text-slate-500 uppercase tracking-wide">Solde disponible</p>
          <p className="text-2xl font-bold mt-1">
            {formatCurrency(account.balance, account.currency)}
          </p>
        </div>
        <ChevronRight className="size-5 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}
