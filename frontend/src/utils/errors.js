/**
 * Extrait un message d'erreur lisible depuis une réponse RTK Query.
 */
export function extractErrorMessage(error) {
  if (!error) return 'Une erreur inconnue est survenue.';
  if (typeof error === 'string') return error;
  if (error.data?.message) return error.data.message;
  if (error.data?.errors) {
    const first = Object.values(error.data.errors).flat()[0];
    return first || 'Données invalides.';
  }
  if (error.error) return error.error;
  return 'Une erreur inconnue est survenue.';
}
