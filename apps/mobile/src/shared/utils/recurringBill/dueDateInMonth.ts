/** O vencimento da conta no mês ('AAAA-MM'), com o dia limitado ao último dia dele: o 31 de abril vira 30. */
export function dueDateInMonth(dayOfMonth: number, month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  const day = Math.min(dayOfMonth, lastDay);

  return `${month}-${String(day).padStart(2, '0')}`;
}
