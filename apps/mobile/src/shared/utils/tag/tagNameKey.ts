/** A chave que diz se dois nomes de tag são o mesmo: sem espaços nas pontas, sem acentos e em minúsculas. */
export function tagNameKey(name: string) {
  return name
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
