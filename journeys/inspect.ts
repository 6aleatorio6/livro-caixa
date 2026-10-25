// `pnpm journeys:inspect [<seletor>…]`: os nós da tela do app no emulador, lidos pelo adb, com os
// limites em dp. Imprime só os nós pedidos, no lugar da hierarquia inteira que o `uiautomator dump`
// (30 KB numa tela) e o `maestro hierarchy` devolvem, ambos em px.
import { execFileSync } from 'node:child_process';

// O Android define o dp a 160 dpi: 1 dp é 1 px nessa densidade.
const DP_DPI = 160;
const USAGE = `Uso: pnpm journeys:inspect [<seletor>…]

O seletor é o dos fluxos do Maestro: um texto (regex que vale inteira) acha o texto ou o rótulo de
acessibilidade, e id:<regex> acha o resource-id. Sem seletor, saem todos os nós com texto, rótulo ou
id.`;
const XML_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
// Os estados que valem conferir num nó, como a linha os imprime.
const STATE_LABELS = { clickable: 'clicável', checked: 'marcado', selected: 'selecionado', focused: 'com foco', scrollable: 'rola' };

type ScreenNode = {
  className: string;
  text: string;
  description: string;
  id: string;
  states: string[];
  left: number;
  top: number;
  right: number;
  bottom: number;
};

function adb(...args: string[]) {
  return execFileSync('adb', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
}

/** A densidade que vale: o `wm density` imprime a física e, quando alguém a trocou, a que a substitui. */
function readDpi() {
  const densities = [...adb('shell', 'wm', 'density').matchAll(/density: (\d+)/g)];
  return Number(densities.at(-1)?.[1]);
}

function decodeXml(value: string) {
  return value.replace(/&(?:#(\d+)|(\w+));/g, (entity, codePoint: string | undefined, name: string | undefined) =>
    codePoint ? String.fromCodePoint(Number(codePoint)) : (XML_ENTITIES[name ?? ''] ?? entity),
  );
}

function readNodes(): ScreenNode[] {
  const hierarchy = adb('exec-out', 'uiautomator', 'dump', '/dev/tty');
  // Sem a tela parada, o dump imprime só o erro ("could not get idle state").
  if (!hierarchy.includes('<hierarchy')) throw new Error(`O uiautomator não leu a tela: ${hierarchy.trim()}`);

  return [...hierarchy.matchAll(/<node ([^>]*?)\/?>/g)].map(([, attributes]) => {
    const attributesByName: Record<string, string> = Object.fromEntries(
      [...attributes.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, name, value]) => [name, decodeXml(value)]),
    );
    const [left, top, right, bottom] = (attributesByName.bounds.match(/\d+/g) ?? []).map(Number);
    const states = Object.entries(STATE_LABELS)
      .filter(([attribute]) => attributesByName[attribute] === 'true')
      .map(([, label]) => label);
    if (attributesByName.enabled === 'false') states.push('desabilitado');
    return {
      className: attributesByName.class.replace(/.*\./, ''),
      text: attributesByName.text,
      description: attributesByName['content-desc'],
      id: attributesByName['resource-id'],
      states,
      left,
      top,
      right,
      bottom,
    };
  });
}

/**
 * Como o Maestro casa o seletor: a regex vale inteira, e o texto que não é regex válida vale
 * literal. O `id:` aceita também só o nome depois do `:id/`, sem o pacote.
 */
function toMatcher(selector: string): (node: ScreenNode) => boolean {
  const isById = selector.startsWith('id:');
  const pattern = isById ? selector.slice('id:'.length) : selector;
  let regex: RegExp | null = null;
  try {
    regex = new RegExp(`^(?:${pattern})$`, 's');
  } catch {}
  const matches = (value: string) => value === pattern || (regex?.test(value) ?? false);
  return isById
    ? (node) => matches(node.id) || matches(node.id.replace(/^.*:id\//, ''))
    : (node) => matches(node.text) || matches(node.description);
}

// À mão, com a vírgula: o Node deste container vem sem os dados de locale, e o `Intl` ignora o pt-BR.
function formatDp(px: number, pxPerDp: number) {
  return String(Math.round((px / pxPerDp) * 10) / 10).replace('.', ',');
}

function describe(node: ScreenNode, pxPerDp: number) {
  const dp = (px: number) => formatDp(px, pxPerDp);
  const labels = [
    node.text && `texto ${JSON.stringify(node.text)}`,
    node.description && `rótulo ${JSON.stringify(node.description)}`,
    node.id && `id ${JSON.stringify(node.id)}`,
  ].filter(Boolean);
  const size = `${dp(node.right - node.left)} × ${dp(node.bottom - node.top)} dp`;
  const position = `x ${dp(node.left)} y ${dp(node.top)}`;
  const center = `centro x ${dp((node.left + node.right) / 2)} y ${dp((node.top + node.bottom) / 2)}`;
  return [`${node.className} ${labels.join(' ')}`, size, position, center, ...node.states].join(' | ');
}

function printNodes(selectors: string[]) {
  const dpi = readDpi();
  const pxPerDp = dpi / DP_DPI;
  const [screen, ...nodes] = readNodes();
  console.log(`Tela de ${formatDp(screen.right, pxPerDp)} × ${formatDp(screen.bottom, pxPerDp)} dp, a ${dpi} dpi`);

  const matchers = selectors.map((selector) => ({ selector, matches: toMatcher(selector), wasFound: false }));
  for (const node of nodes) {
    const hits = matchers.filter((matcher) => matcher.matches(node));
    const isWanted = matchers.length === 0 ? Boolean(node.text || node.description || node.id) : hits.length > 0;
    if (!isWanted) continue;
    for (const hit of hits) hit.wasFound = true;
    console.log(describe(node, pxPerDp));
  }
  for (const { selector } of matchers.filter((matcher) => !matcher.wasFound)) {
    console.log(`Nada com ${JSON.stringify(selector)}`);
    process.exitCode = 1;
  }
}

const selectors = process.argv.slice(2);
if (selectors.includes('--help')) {
  console.log(USAGE);
} else {
  try {
    printNodes(selectors);
  } catch (error) {
    // O emulador fechado aparece aqui, como o erro do adb.
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
