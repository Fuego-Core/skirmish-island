// Retour haptique léger sur les actions clés — no-op silencieux si l'API
// Vibration n'est pas supportée (desktop, iOS Safari).
export function haptic(pattern = 8) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
}
