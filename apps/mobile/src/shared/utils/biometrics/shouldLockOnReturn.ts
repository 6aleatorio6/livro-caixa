/**
 * Quem sai por pouco tempo (uma ligação, outro app) volta sem pedir a biometria de novo; com 10 minutos fora ou mais,
 * o app pede.
 */
const LOCK_AFTER_AWAY_MS = 10 * 60 * 1000;

/**
 * Diz se o app deve bloquear ao voltar do segundo plano. Com a opção desligada, ou sem hora de saída, nunca: sem a
 * hora não há como saber quanto tempo a pessoa ficou fora. As horas são as do `Date.now()`.
 */
export function shouldLockOnReturn(isEnabled: boolean, backgroundedAtMs: number | null, returnedAtMs: number): boolean {
  if (!isEnabled || backgroundedAtMs === null) return false;
  return returnedAtMs - backgroundedAtMs >= LOCK_AFTER_AWAY_MS;
}
