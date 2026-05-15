<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\Response;

class PdfExportService
{
    /**
     * Génère un PDF de relevé de transactions pour un utilisateur.
     *
     * @param  Collection  $transactions
     */
    public function buildTransactionsStatement(
        string $userFullName,
        Collection $transactions,
        ?string $from = null,
        ?string $to = null,
    ): Response {
        $pdf = Pdf::loadView('pdf.transactions', [
            'userFullName' => $userFullName,
            'transactions' => $transactions,
            'from' => $from,
            'to' => $to,
            'generatedAt' => now(),
            'currency' => config('bankapp.currency'),
        ])->setPaper('a4');

        $filename = 'bankapp-transactions-' . now()->format('Y-m-d') . '.pdf';

        return $pdf->download($filename);
    }
}
