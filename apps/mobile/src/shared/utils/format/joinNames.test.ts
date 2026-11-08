import { joinNames } from './joinNames';

describe('joinNames', () => {
  it.each([
    { names: [], expected: '' },
    { names: ['Bruno'], expected: 'Bruno' },
    { names: ['Você', 'Bruno'], expected: 'Você e Bruno' },
    { names: ['Você', 'Ana', 'Bruno'], expected: 'Você, Ana e Bruno' },
    { names: ['Você', 'Ana', 'Bruno', 'Carla'], expected: 'Você, Ana, Bruno e Carla' },
  ])('Should write $names as "$expected"', ({ names, expected }) => {
    expect(joinNames(names)).toBe(expected);
  });
});
