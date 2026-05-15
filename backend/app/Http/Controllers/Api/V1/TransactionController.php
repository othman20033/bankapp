<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OtpPurpose;
use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\DepositRequest;
use App\Http\Requests\Transaction\TransferConfirmRequest;
use App\Http\Requests\Transaction\TransferInitiateRequest;
use App\Http\Requests\Transaction\WithdrawRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Account;
use App\Models\Transaction;
use App\Services\OtpService;
use App\Services\PdfExportService;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class TransactionController extends Controller
{
    public function __construct(
        private readonly TransactionService $transactions,
        private readonly OtpService $otp,
        private readonly PdfExportService $pdf,
    ) {}

    /**
     * Liste paginée des transactions de l'utilisateur,
     * filtrable par compte, type, plage de dates.
     */
    public function index(Request $request): ResourceCollection
    {
        $user = $request->user();

        $query = Transaction::query()
            ->with(['sourceAccount', 'targetAccount'])
            ->where(function ($q) use ($user, $request) {
                if ($request->filled('account_id')) {
                    $accountId = (int) $request->input('account_id');
                    // Vérifier que le compte appartient à l'utilisateur (sauf admin)
                    Account::findOrFail($accountId)->user_id === $user->id || $user->isAdmin()
                        ?: abort(403);
                    $q->forAccount($accountId);
                } else {
                    $accountIds = $user->accounts()->pluck('id');
                    $q->whereIn('source_account_id', $accountIds)
                        ->orWhereIn('target_account_id', $accountIds);
                }
            })
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->input('type')))
            ->between($request->input('from'), $request->input('to'))
            ->when($request->filled('search'), fn ($q) => $q->where('reference', 'like', '%' . $request->input('search') . '%'))
            ->latest('created_at');

        return TransactionResource::collection(
            $query->paginate((int) $request->input('per_page', 15))
        );
    }

    public function show(Request $request, Transaction $transaction): TransactionResource
    {
        $user = $request->user();
        $owns = $user->isAdmin()
            || $transaction->sourceAccount?->user_id === $user->id
            || $transaction->targetAccount?->user_id === $user->id;

        abort_unless($owns, 403);

        return new TransactionResource($transaction->load(['sourceAccount', 'targetAccount']));
    }

    public function deposit(DepositRequest $request): JsonResponse
    {
        $account = Account::findOrFail($request->integer('account_id'));
        $this->authorize('transact', $account);

        $tx = $this->transactions->deposit(
            $account,
            $request->input('amount'),
            $request->input('description'),
        );

        return (new TransactionResource($tx))->response()->setStatusCode(201);
    }

    public function withdraw(WithdrawRequest $request): JsonResponse
    {
        $account = Account::findOrFail($request->integer('account_id'));
        $this->authorize('transact', $account);

        $tx = $this->transactions->withdraw(
            $account,
            $request->input('amount'),
            $request->input('description'),
        );

        return (new TransactionResource($tx))->response()->setStatusCode(201);
    }

    /**
     * Étape 1 du virement : valide les données, envoie un OTP, ne débite RIEN.
     * Le client doit ensuite appeler confirmTransfer avec le code.
     */
    public function initiateTransfer(TransferInitiateRequest $request): JsonResponse
    {
        $source = Account::findOrFail($request->integer('source_account_id'));
        $this->authorize('transact', $source);

        $threshold = config('bankapp.transfer.otp_threshold');
        $amount = (float) $request->input('amount');

        // OTP obligatoire au-dessus du seuil
        if ($amount >= $threshold) {
            $otp = $this->otp->send(
                $request->user(),
                OtpPurpose::TRANSFER,
                ['email', 'sms'],
                [
                    'source_account_id' => $source->id,
                    'target_account_number' => $request->input('target_account_number'),
                    'amount' => $amount,
                ],
            );

            return response()->json([
                'requires_otp' => true,
                'otp_id' => $otp->id,
                'expires_at' => $otp->expires_at->toIso8601String(),
                'message' => 'Code OTP envoyé par email et SMS.',
            ]);
        }

        // Sous le seuil : confirmation directe possible côté front
        return response()->json(['requires_otp' => false]);
    }

    public function confirmTransfer(TransferConfirmRequest $request): JsonResponse
    {
        $source = Account::findOrFail($request->integer('source_account_id'));
        $this->authorize('transact', $source);

        $target = Account::where('account_number', $request->input('target_account_number'))->firstOrFail();

        // OTP requis selon seuil
        $threshold = config('bankapp.transfer.otp_threshold');
        if ((float) $request->input('amount') >= $threshold) {
            $this->otp->verify($request->user(), OtpPurpose::TRANSFER, $request->input('otp_code'));
        }

        $tx = $this->transactions->transfer(
            $source,
            $target,
            $request->input('amount'),
            $request->input('description'),
        );

        return (new TransactionResource($tx->load(['sourceAccount', 'targetAccount'])))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Export PDF du relevé filtré (mêmes filtres que index).
     */
    public function exportPdf(Request $request)
    {
        $user = $request->user();
        $accountIds = $user->accounts()->pluck('id');

        $query = Transaction::query()
            ->with(['sourceAccount', 'targetAccount'])
            ->where(function ($q) use ($accountIds, $request) {
                if ($request->filled('account_id')) {
                    $id = (int) $request->input('account_id');
                    if (! $accountIds->contains($id)) {
                        abort(403);
                    }
                    $q->forAccount($id);
                } else {
                    $q->whereIn('source_account_id', $accountIds)
                        ->orWhereIn('target_account_id', $accountIds);
                }
            })
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->input('type')))
            ->between($request->input('from'), $request->input('to'))
            ->latest('created_at')
            ->limit(500); // protection : pas plus de 500 lignes par PDF

        return $this->pdf->buildTransactionsStatement(
            userFullName: $user->fullName(),
            transactions: $query->get(),
            from: $request->input('from'),
            to: $request->input('to'),
        );
    }
}
