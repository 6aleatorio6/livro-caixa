// A 0.5.0 não muda nenhum dado: ela só sobe o `version` (e o `minVersion`, que os apps 0.4.x leem) para 0.5.0, o que
// trava os apps anteriores. As contas atrasadas da 0.5.0 gravam o mês pago depois em `overdueMonths`, que um app 0.4.x
// não lê: ele mostraria a conta paga depois como a pagar no mês da conta.
export default async function migrate() {
  return [];
}
