/**
 * Quem sai por pouco tempo (uma ligação, outro app) volta sem pedir a biometria de novo; com 10 minutos fora ou mais,
 * o app pede.
 */
const LOCK_AFTER_AWAY_MS = 10 * 60 * 1000;

/**
 * Diz se o app deve bloquear ao voltar do segundo plano. Com a opção desligada, ou sem hora de saída, nunca: sem a
 * hora não há como saber quanto tempo a pessoa ficou fora. As horas são `Date.now()`.
 */
export function shouldLockOnReturn(isEnabled: boolean, backgroundedAt: number | null, returnedAt: number): boolean {
  if (!isEnabled || backgroundedAt === null) return false;
  return returnedAt - backgroundedAt >= LOCK_AFTER_AWAY_MS;
}
