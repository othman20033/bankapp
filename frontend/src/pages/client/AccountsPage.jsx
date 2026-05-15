import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import AccountCard from '@/components/common/AccountCard';
import {
  useGetAccountsQuery,
  useCreateAccountMutation,
} from '@/features/accounts/accountsApi';
import { extractErrorMessage } from '@/utils/errors';

const schema = z.object({
  type: z.enum(['checking', 'savings'], { required_error: 'Type requis' }),
  initial_deposit: z
    .preprocess((v) => (v === '' ? 0 : Number(v)), z.number().min(0, 'Doit être positif')),
});

export default function AccountsPage() {
  const { data: accounts = [], isLoading } = useGetAccountsQuery();
  const [createAccount, { isLoading: creating }] = useCreateAccountMutation();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { type: 'checking', initial_deposit: 0 } });

  const onSubmit = async (data) => {
    try {
      await createAccount(data).unwrap();
      toast.success('Compte créé avec succès 🎉');
      setOpen(false);
      reset();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mes comptes</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Gérez vos comptes courants et épargne.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} icon={Plus}>
          Ouvrir un compte
        </Button>
      </div>

      {isLoading ? (
        <Loader />
      ) : accounts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wallet}
            title="Aucun compte"
            description="Créez votre premier compte bancaire pour commencer à utiliser BankApp."
            action={
              <Button onClick={() => setOpen(true)} icon={Plus}>
                Créer un compte
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((a) => (
            <AccountCard key={a.id} account={a} />
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Ouvrir un nouveau compte"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={creating}>
              Créer le compte
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Type de compte"
            options={[
              { value: 'checking', label: 'Compte courant' },
              { value: 'savings', label: 'Compte épargne' },
            ]}
            error={errors.type?.message}
            {...register('type')}
          />
          <Input
            label="Dépôt initial (MAD)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            hint="Optionnel — vous pourrez créditer plus tard."
            error={errors.initial_deposit?.message}
            {...register('initial_deposit')}
          />
        </form>
      </Modal>
    </div>
  );
}
