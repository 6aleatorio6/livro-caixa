/**
 * O resultado da leitura, ou `null` quando ela não termina no prazo; o temporizador sai quando ela termina antes. Uma
 * rejeição da leitura segue como rejeição: quem chama decide o que fazer com ela. `onDeadline` roda quando o prazo
 * vence, para quem precisa avisar (a leitura pode devolver `null` por conta própria, então só o helper sabe que foi o
 * prazo).
 */
export async function resultWithinDeadline<TResult>(
  reading: Promise<TResult>,
  deadlineMs: number,
  onDeadline?: () => void,
): Promise<TResult | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      onDeadline?.();
      resolve(null);
    }, deadlineMs);
  });
  try {
    return await Promise.race([reading, deadline]);
  } finally {
    clearTimeout(timer);
  }
}
