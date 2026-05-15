<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Relevé BankApp</title>
    <style>
        @page { margin: 30px 40px; }
        * { box-sizing: border-box; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #1f2937;
            margin: 0;
        }
        .header {
            border-bottom: 3px solid #1e3a8a;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .header .brand {
            color: #1e3a8a;
            font-size: 22px;
            font-weight: bold;
        }
        .header .subtitle {
            color: #6b7280;
            font-size: 11px;
            margin-top: 4px;
        }
        .meta {
            background: #f3f4f6;
            padding: 10px 14px;
            border-radius: 6px;
            margin-bottom: 18px;
        }
        .meta-row { margin: 3px 0; }
        .meta-label { color: #6b7280; display: inline-block; width: 130px; }
        h2 {
            color: #1e3a8a;
            font-size: 14px;
            margin: 0 0 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }
        thead { background: #1e3a8a; color: white; }
        th, td {
            padding: 8px 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th { font-weight: 600; font-size: 10px; }
        tbody tr:nth-child(even) { background: #f9fafb; }
        .amount-credit { color: #059669; font-weight: 600; }
        .amount-debit { color: #dc2626; font-weight: 600; }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 600;
            background: #e5e7eb;
        }
        .footer {
            position: fixed;
            bottom: -10px;
            left: 0;
            right: 0;
            text-align: center;
            color: #9ca3af;
            font-size: 9px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">🏦 BankApp</div>
        <div class="subtitle">Relevé de transactions</div>
    </div>

    <div class="meta">
        <div class="meta-row"><span class="meta-label">Titulaire :</span><strong>{{ $userFullName }}</strong></div>
        @if ($from || $to)
            <div class="meta-row">
                <span class="meta-label">Période :</span>
                {{ $from ? \Carbon\Carbon::parse($from)->format('d/m/Y') : 'depuis le début' }}
                →
                {{ $to ? \Carbon\Carbon::parse($to)->format('d/m/Y') : 'aujourd\'hui' }}
            </div>
        @endif
        <div class="meta-row">
            <span class="meta-label">Édité le :</span>
            {{ $generatedAt->format('d/m/Y à H:i') }}
        </div>
        <div class="meta-row">
            <span class="meta-label">Nombre d'opérations :</span>
            {{ $transactions->count() }}
        </div>
    </div>

    <h2>Détail des opérations</h2>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Référence</th>
                <th>Type</th>
                <th>Description</th>
                <th style="text-align:right">Montant</th>
                <th style="text-align:right">Solde</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($transactions as $tx)
                <tr>
                    <td>{{ $tx->created_at->format('d/m/Y H:i') }}</td>
                    <td style="font-family: monospace; font-size: 9px;">{{ $tx->reference }}</td>
                    <td><span class="badge">{{ $tx->type->label() }}</span></td>
                    <td>{{ \Illuminate\Support\Str::limit($tx->description, 40) ?: '—' }}</td>
                    <td style="text-align:right" class="{{ $tx->type->value === 'deposit' ? 'amount-credit' : 'amount-debit' }}">
                        {{ $tx->type->value === 'deposit' ? '+' : '−' }}
                        {{ number_format($tx->amount, 2, ',', ' ') }} {{ $tx->currency }}
                    </td>
                    <td style="text-align:right">
                        {{ number_format($tx->balance_after, 2, ',', ' ') }} {{ $tx->currency }}
                    </td>
                </tr>
            @empty
                <tr><td colspan="6" style="text-align:center; padding:20px; color:#9ca3af;">Aucune transaction sur cette période.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        © {{ date('Y') }} BankApp — Document généré automatiquement. Conservez-le pour vos archives.
    </div>
</body>
</html>
