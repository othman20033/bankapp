/**
 * Formate un montant en devise (par défaut MAD).
 * Accepte string ou number — l'API renvoie des strings pour préserver la précision.
 */
export function formatCurrency(amount, currency = 'MAD', locale = 'fr-MA') {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(value)) return '—';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formate un IBAN simplifié BK64XXXXXXXXXXXXXXXX par groupes de 4.
 */
export function formatIban(accountNumber) {
  if (!accountNumber) return '';
  return accountNumber.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Masque un IBAN pour affichage public : BK64 **** **** **** 1234
 */
export function maskIban(accountNumber) {
  if (!accountNumber || accountNumber.length < 8) return accountNumber;
  const start = accountNumber.slice(0, 4);
  const end = accountNumber.slice(-4);
  return `${start} **** **** **** ${end}`;
}

export function formatDate(iso, opts = {}) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...opts,
  }).format(new Date(iso));
}

export function formatDateTime(iso) {
  return formatDate(iso, { hour: '2-digit', minute: '2-digit' });
}

export function relativeTime(iso) {
  if (!iso) return '';
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const units = [
    ['year', 31536000],
    ['month', 2628000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs || unit === 'second') {
      return rtf.format(Math.round(diff / secs), unit);
    }
  }
  return '';
}
