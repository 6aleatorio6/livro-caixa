import { findBrlAmounts } from './findBrlAmounts';

describe('findBrlAmounts', () => {
  it('Should read R$ 1.234,56 as 123456', () => {
    expect(findBrlAmounts('Valor pago\nR$ 1.234,56')).toEqual([123456]);
  });

  it('Should read an amount with no space after R$', () => {
    expect(findBrlAmounts('Valor R$246,48')).toEqual([24648]);
  });

  it('Should read every amount in the text, in order', () => {
    expect(findBrlAmounts('Valor do documento R$ 100,00\nJuros R$ 2,00\nValor pago R$ 102,00')).toEqual([
      10000, 200, 10200,
    ]);
  });

  it('Should not read a number without R$', () => {
    const text = [
      'Agência 0001',
      'Conta 00000000-0',
      'CNPJ 18.236.120/0001-58',
      'Data do pagamento 09/11/2024',
      'Ouvidoria: 0800 887 0463',
      'Tarifa 0,00',
    ].join('\n');

    expect(findBrlAmounts(text)).toEqual([]);
  });
});
