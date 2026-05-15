<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Exception bancaire métier — toujours rendue en JSON propre.
 * Les sous-classes définissent code HTTP + clé i18n.
 */
abstract class BankException extends Exception
{
    protected int $statusCode = Response::HTTP_UNPROCESSABLE_ENTITY;
    protected string $errorKey = 'bank.error';

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'error_key' => $this->errorKey,
        ], $this->statusCode);
    }
}
