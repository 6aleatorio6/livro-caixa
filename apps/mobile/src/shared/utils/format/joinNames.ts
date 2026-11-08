/** Os nomes como numa frase: "Bruno", "Bruno e Carla", "Ana, Bruno e Carla"; sem nomes, um texto vazio. */
export function joinNames(names: string[]) {
  const last = names.at(-1) ?? '';

  return names.length > 1 ? `${names.slice(0, -1).join(', ')} e ${last}` : last;
}
