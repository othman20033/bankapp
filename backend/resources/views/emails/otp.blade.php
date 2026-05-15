<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>BankApp — Code de sécurité</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background:#f3f4f6; margin:0; padding:32px;">
    <table style="max-width:560px; margin:auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,.06);">
        <tr>
            <td style="background:linear-gradient(135deg,#1e3a8a,#2563eb); padding:24px; text-align:center; color:#fff;">
                <h1 style="margin:0; font-size:24px; letter-spacing:1px;">🏦 BankApp</h1>
            </td>
        </tr>
        <tr>
            <td style="padding:32px;">
                <h2 style="margin:0 0 16px; color:#111827;">Bonjour {{ $user->first_name }},</h2>
                <p style="color:#374151; line-height:1.6;">
                    Voici votre code de sécurité pour <strong>{{ $purposeLabel }}</strong>.
                    Il est valable <strong>{{ $expiry }} minutes</strong>.
                </p>
                <div style="text-align:center; margin:32px 0;">
                    <div style="display:inline-block; font-size:36px; letter-spacing:12px; font-weight:700; color:#1e3a8a; background:#eff6ff; padding:16px 32px; border-radius:12px; border:2px dashed #2563eb;">
                        {{ $code }}
                    </div>
                </div>
                <p style="color:#6b7280; font-size:13px; line-height:1.6;">
                    🔒 <strong>Ne partagez jamais ce code.</strong> Aucun employé de BankApp ne vous le demandera.
                    Si vous n'êtes pas à l'origine de cette demande, ignorez cet email et changez votre mot de passe.
                </p>
            </td>
        </tr>
        <tr>
            <td style="background:#f9fafb; padding:16px; text-align:center; color:#9ca3af; font-size:12px;">
                © {{ date('Y') }} BankApp · Email automatique, ne pas répondre
            </td>
        </tr>
    </table>
</body>
</html>
