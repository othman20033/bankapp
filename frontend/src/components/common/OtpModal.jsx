import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

/**
 * Modal de saisie OTP — 6 cases auto-focus.
 *
 * Props:
 *   open, onClose, onConfirm(code)
 *   loading, error, expiresAt (ISO), onResend (optionnel)
 */
export default function OtpModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  error = null,
  expiresAt = null,
  onResend = null,
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef([]);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (open) {
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    }
  }, [open]);

  // Décompte expiration
  useEffect(() => {
    if (!open || !expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [open, expiresAt]);

  const handleChange = (idx, value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 1);
    const next = [...digits];
    next[idx] = cleaned;
    setDigits(next);
    if (cleaned && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === 'Enter') tryConfirm();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.padEnd(6, '').split('').slice(0, 6);
    setDigits(next.map((c) => c || ''));
    const lastFilled = Math.min(pasted.length, 5);
    inputsRef.current[lastFilled]?.focus();
  };

  const code = digits.join('');
  const complete = code.length === 6;

  const tryConfirm = () => {
    if (complete && !loading) onConfirm(code);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Code de sécurité"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button onClick={tryConfirm} disabled={!complete} loading={loading}>
            Confirmer
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="size-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center mb-4">
          <ShieldCheck className="size-6" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-5">
          Un code à 6 chiffres a été envoyé par <strong>email</strong> et <strong>SMS</strong>.
          Saisissez-le ci-dessous pour confirmer l'opération.
        </p>

        <div className="flex gap-2 mb-3" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="size-12 text-center text-xl font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              aria-label={`Chiffre ${i + 1}`}
            />
          ))}
        </div>

        {expiresAt && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            {remaining > 0 ? (
              <>Expire dans <span className="font-mono font-semibold">{mm}:{ss}</span></>
            ) : (
              <span className="text-danger-600">Code expiré, demandez-en un nouveau.</span>
            )}
          </p>
        )}

        {error && <p className="text-sm text-danger-600 mt-1">{error}</p>}

        {onResend && (
          <button
            type="button"
            onClick={onResend}
            disabled={loading || remaining > 240}
            className="mt-3 text-xs text-primary-600 hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
          >
            <RotateCcw className="size-3" /> Renvoyer un code
          </button>
        )}
      </div>
    </Modal>
  );
}
