/** As leituras em tempo real que o `listenTo` abriu e o fim de cada teste fecha, mesmo quando ele falha. */
export const OPEN_READINGS = new Set<() => void>();
