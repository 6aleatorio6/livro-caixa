import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

// Os limites da paleta aprovada, o contrato do G4: não saem das cores, são o que a paleta promete.
const MIN_GRAPHIC_CONTRAST = 3; // WCAG 1.4.11, o ícone e o ponto da tag
const MIN_OKLAB_DISTANCE = 0.085;

const themes: Record<string, Record<string, string>> = { light: lightTheme.colors, dark: darkTheme.colors };

// Os fundos em que o ponto da tag é desenhado: a tela (`ListItem`, `SplitRow`, `EntryTagGroup`, o chip da tag),
// a folha de detalhes e a prévia do formulário (`surfaceContainerLow`: `DetailRow`, `TagForm`), o chip escolhido
// (`secondaryContainer`: `TagChoice`) e o trilho da barra da divisão (`surfaceContainerHigh`: `SplitBar`).
const DOT_BACKGROUNDS = ['surface', 'surfaceContainerLow', 'secondaryContainer', 'surfaceContainerHigh'];

function toLinear(channel: number) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function linearChannels(hex: string) {
  const [red, green, blue] = [1, 3, 5].map((start) => toLinear(parseInt(hex.slice(start, start + 2), 16)));
  return { red, green, blue };
}

function relativeLuminance(hex: string) {
  const { red, green, blue } = linearChannels(hex);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** A razão de contraste da WCAG entre duas cores, de 1 a 21. */
function contrastRatio(firstHex: string, secondHex: string) {
  const [lighter, darker] = [relativeLuminance(firstHex), relativeLuminance(secondHex)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function toOklab(hex: string) {
  const { red, green, blue } = linearChannels(hex);
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** A distância euclidiana entre duas cores no OKLab. */
function oklabDistance(firstHex: string, secondHex: string) {
  const first = toOklab(firstHex);
  const second = toOklab(secondHex);
  return Math.hypot(...first.map((value, index) => value - second[index]));
}

describe.each(Object.entries(themes))('Tag colors in the %s theme', (_themeName, colors) => {
  const names = Object.keys(colors)
    .filter((role) => role.startsWith('tag'))
    .map((role) => role.slice('tag'.length));

  it('Should find the eight tag colors', () => {
    expect(names).toHaveLength(8);
  });

  it.each(names)('Should read the icon over %s at 3:1 or more', (name) => {
    const ratio = contrastRatio(colors.onTag, colors[`tag${name}`]);

    expect(ratio).toBeGreaterThanOrEqual(MIN_GRAPHIC_CONTRAST);
  });

  const dotOnBackground = names.flatMap((name) => DOT_BACKGROUNDS.map((background) => [name, background]));

  it.each(dotOnBackground)('Should read the %s dot at 3:1 or more on %s', (name, background) => {
    const ratio = contrastRatio(colors[`tag${name}`], colors[background]);

    expect(ratio).toBeGreaterThanOrEqual(MIN_GRAPHIC_CONTRAST);
  });

  // O ponto de "Sem tag" é o `outline`, desenhado ao lado dos das tags (a divisão do Início, Pagamentos).
  it('Should keep every pair of dot colors, the tags and "Sem tag", at 0.085 or more in OKLab', () => {
    const dotRoles = [...names.map((name) => `tag${name}`), 'outline'];
    const closePairs = dotRoles.flatMap((first, index) =>
      dotRoles.slice(index + 1).flatMap((second) => {
        const distance = oklabDistance(colors[first], colors[second]);
        return distance < MIN_OKLAB_DISTANCE ? [`${first} e ${second}: ${distance.toFixed(3)}`] : [];
      }),
    );

    expect(closePairs).toEqual([]);
  });
});
