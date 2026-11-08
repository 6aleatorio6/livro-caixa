import { TAG_COLORS } from './tagColors';

describe('TAG_COLORS', () => {
  // O Firestore guarda a chave: mudar uma cor de nome ou de lugar reaponta as tags já criadas.
  it('Should keep the eight keys in the picker\'s order', () => {
    expect(TAG_COLORS.map(({ color }) => color)).toEqual([
      'wood',
      'moss',
      'petrol',
      'slate',
      'blue',
      'indigo',
      'lavender',
      'plum',
    ]);
  });

  // O seletor anuncia o nome da cor para o leitor de tela (`ColorSwatch`): a Uva era Lavanda e a Amora era Ameixa.
  it('Should name each color as the picker announces it', () => {
    expect(TAG_COLORS.map(({ label }) => label)).toEqual([
      'Madeira',
      'Musgo',
      'Petróleo',
      'Ardósia',
      'Azul',
      'Anil',
      'Uva',
      'Amora',
    ]);
  });
});
