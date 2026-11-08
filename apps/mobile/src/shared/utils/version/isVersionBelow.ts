/**
 * Diz se a versão instalada está abaixo da mínima, comparando maior, menor e correção um a um, como números:
 * "0.10.0" vem depois de "0.9.0", o que a comparação de texto erra. Um mínimo que não é exatamente três números
 * separados por ponto não barra ninguém: a função devolve `false`.
 */
export function isVersionBelow(installed: string, minimum: string): boolean {
  const installedParts = parseVersion(installed);
  const minimumParts = parseVersion(minimum);
  if (!installedParts || !minimumParts) return false;

  for (let index = 0; index < 3; index++) {
    if (installedParts[index] !== minimumParts[index]) return installedParts[index] < minimumParts[index];
  }
  return false;
}

function parseVersion(version: string): number[] | null {
  if (!/^\d+\.\d+\.\d+$/.test(version)) return null;
  return version.split('.').map(Number);
}
