import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeftRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Loader from '@/components/ui/Loader';
import OtpModal from '@/components/common/OtpModal';
import { useGetAccountsQuery } from '@/features/accounts/accountsApi';
import {
  useInitiateTransferMutation,
  useConfirmTransferMutation,
} from '@/features/transactions/transactionsApi';
import { formatCurrency, formatIban } from '@/utils/formatters';
import { extractErrorMessage } from '@/utils/errors';

// Seuil au-delà duquel l'OTP est obligatoire — doit matcher config/bankapp.transfer.otp_threshold
const OTP_THRESHOLD = 1000;

const schema = z.object({
  source_account_id: z.string().min(1, 'Compte source requis'),
  target_account_number: z.preprocess(
    (v) => (typeof v === 'string' ? v.replace(/\s+/g, '').toUpperCase() : v),
    z
      .string()
      .min(20, 'RIB trop court')
      .regex(/^BK\d{18,}$/, 'Format RIB invalide (BK + 18 chiffres)'),
  ),
  amount: z.preprocess(
    (v) => Number(v),
    z.number({ invalid_type_error: 'Montant requis' }).positive('Montant > 0'),
  ),
  description: z.string().max(255).optional(),
});

export default function TransferPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const presetFrom = params.get('from');

  const { data: accounts = [], isLoading } = useGetAccountsQuery();
  const [initiate, { isLoading: initiating }] = useInitiateTransferMutation();
  const [confirm, { isLoading: confirming }] = useConfirmTransferMutation();

  const [otpOpen, setOtpOpen] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [pendingPayload, setPendingPayload] = useState(null); // { source_account_id, target_account_number, amount, description }
  const [success, setSuccess] = useState(null); // transaction object

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { source_account_id: presetFrom ?? '', target_account_number: '', amount: '' },
  });

  // Pré-sélection du compte si arrivée via ?from=X
  useEffect(() => {
    if (presetFrom && accounts.find((a) => String(a.id) === presetFrom)) {
      setValue('source_account_id', presetFrom);
    }
  }, [presetFrom, accounts, setValue]);

  const sourceId = watch('source_account_id');
  const amount = parseFloat(watch('amount')) || 0;
  const sourceAccount = accounts.find((a) => String(a.id) === sourceId);
  const insufficient = sourceAccount && amount > parseFloat(sourceAccount.balance);
  const needsOtp = amount >= OTP_THRESHOLD;

  const onSubmit = async (data) => {
    if (insufficient) {
      toast.error('Solde insuffisant sur le compte source.');
      return;
    }

    const payload = {
      source_account_id: Number(data.source_account_id),
      target_account_number: data.target_account_number.toUpperCase(),
      amount: data.amount,
      description: data.description,
    };

    setPendingPayload(payload);

    try {
      const res = await initiate(payload).unwrap();
      if (res.requires_otp) {
        setOtpExpiresAt(res.expires_at);
        setOtpError(null);
        setOtpOpen(true);
      } else {
        // Sous le seuil : exécution directe sans OTP
        await executeTransfer(payload, null);
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const executeTransfer = async (payload, otpCode) => {
    try {
      const res = await confirm({ ...payload, otp_code: otpCode || '000000' }).unwrap();
      const tx = res.data ?? res;
      setSuccess(tx);
      setOtpOpen(false);
      setPendingPayload(null);
    } catch (err) {
      const msg = extractErrorMessage(err);
      if (otpCode) setOtpError(msg);
      else toast.error(msg);
    }
  };

  if (isLoading) return <Loader full />;

  // Vue de succès
  if (success) {
    return (
      <div className="max-w-xl mx-auto">
        <Card>
          <div className="flex flex-col items-center text-center py-6">
            <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="text-xl font-bold mb-1">Virement effectué</h2>
            <p className="text-sm text-slate-500 mb-6">
              {formatCurrency(success.amount, success.currency)} envoyés avec succès.
            </p>

            <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-left text-sm space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Référence</span><span className="font-mono">{success.reference}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Montant</span><span className="font-semibold">{formatCurrency(success.amount, success.currency)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Nouveau solde</span><span>{formatCurrency(success.balance_after, success.currency)}</span></div>
            </div>

            <div className="flex gap-3 mt-6 w-full">
              <Button variant="secondary" onClick={() => navigate('/app')} className="flex-1">Tableau de bord</Button>
              <Button onClick={() => { setSuccess(null); }} className="flex-1">Nouveau virement</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Effectuer un virement</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Transférez des fonds vers un autre compte BankApp en toute sécurité.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Select
            label="Compte source"
            placeholder="Sélectionnez un compte"
            options={accounts
              .filter((a) => a.status === 'active')
              .map((a) => ({
                value: String(a.id),
                label: `${a.type_label} · ${formatIban(a.account_number)} — ${formatCurrency(a.balance, a.currency)}`,
              }))}
            error={errors.source_account_id?.message}
            {...register('source_account_id')}
          />

          <Input
            label="RIB destinataire"
            placeholder="BK64XXXXXXXXXXXXXXXXXX"
            className="font-mono uppercase"
            error={errors.target_account_number?.message}
            {...register('target_account_number')}
          />

          <Input
            label="Montant (MAD)"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            hint={needsOtp ? '⚠️ Un code OTP sera demandé (montant ≥ 1000 MAD).' : null}
            {...register('amount')}
          />

          {insufficient && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-sm">
              <ShieldAlert className="size-4 mt-0.5 shrink-0" />
              <p>Solde insuffisant. Disponible : {formatCurrency(sourceAccount.balance, sourceAccount.currency)}.</p>
            </div>
          )}

          <Input
            label="Motif (optionnel)"
            placeholder="Ex: Loyer mars, Remboursement..."
            error={errors.description?.message}
            {...register('description')}
          />

          <Button
            type="submit"
            loading={initiating}
            icon={ArrowLeftRight}
            className="w-full"
            disabled={insufficient}
          >
            {needsOtp ? 'Continuer avec OTP' : 'Effectuer le virement'}
          </Button>
        </form>
      </Card>

      <OtpModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onConfirm={(code) => executeTransfer(pendingPayload, code)}
        loading={confirming}
        error={otpError}
        expiresAt={otpExpiresAt}
        onResend={async () => {
          setOtpError(null);
          try {
            const res = await initiate(pendingPayload).unwrap();
            if (res.expires_at) setOtpExpiresAt(res.expires_at);
            toast.success('Nouveau code envoyé');
          } catch (err) {
            toast.error(extractErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
