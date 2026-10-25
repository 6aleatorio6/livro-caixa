import {
  HEALTH_TAG,
  HEALTH_TAG_ID,
  HOME_TAG,
  THREE_TAGS_DOCUMENT,
  UTILITIES_TAG,
} from '@/shared/testing/tagFixtures';
import { HOME_TAG_ID, UTILITIES_TAG_ID } from '@/shared/testing/tagFixtures';
import type { ITag } from '@/shared/types/tag/Tag';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A pessoa é a conta de teste das jornadas: o Bruno é membro, e as tags são da família.
const BRUNO = 'bruno.souza@exemplo.com';
const BRUNO_IN_THE_LIST = {
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true },
};

const THREE_TAGS_IN_ORDER: [ITag, ITag, ITag] = [
  { id: HOME_TAG_ID, ...HOME_TAG },
  { id: HEALTH_TAG_ID, ...HEALTH_TAG },
  { id: UTILITIES_TAG_ID, ...UTILITIES_TAG },
];

export const tagListQueryScenarios = {
  // Antes da primeira tag o documento nem existe.
  noTagsDocument: { signedInAs: BRUNO, given: BRUNO_IN_THE_LIST, input: {}, result: [] },
  // Depois de excluir a última, o documento fica, com o mapa vazio.
  emptyTagsDocument: { signedInAs: BRUNO, given: { ...BRUNO_IN_THE_LIST, 'settings/tags': { items: {} } }, input: {}, result: [] },
  // Casa madeira, Serviços azul e Saúde ameixa, gravadas fora de ordem: a lista vem por nome (pt-BR,
  // o "Saúde" antes do "Serviços").
  threeTags: {
    signedInAs: BRUNO,
    given: { ...BRUNO_IN_THE_LIST, 'settings/tags': THREE_TAGS_DOCUMENT },
    input: {},
    result: THREE_TAGS_IN_ORDER,
  },
  // Um membro grava pelo SDK itens fora da forma (a regra não olha dentro deles): a lista os descarta
  // e a tela segue com os itens bons.
  malformedItemsInTheDocument: {
    signedInAs: BRUNO,
    given: {
      ...BRUNO_IN_THE_LIST,
      'settings/tags': {
        items: {
          [HOME_TAG_ID]: HOME_TAG,
          nullItem: null,
          emptyItem: {},
          withoutColor: { name: 'Sem cor', nameKey: 'sem cor' },
          unknownColor: { name: 'Cor errada', nameKey: 'cor errada', color: 'pink' },
          emptyName: { name: '', nameKey: '', color: 'wood' },
          nameAsNumber: { name: 42, nameKey: '42', color: 'wood' },
          withoutNameKey: { name: 'Sem chave', color: 'wood' },
        },
      },
    },
    input: {},
    result: [{ id: HOME_TAG_ID, ...HOME_TAG }],
  },
  tagAddedWhileOpen: {
    signedInAs: BRUNO,
    given: { ...BRUNO_IN_THE_LIST, 'settings/tags': THREE_TAGS_DOCUMENT },
    input: {},
    result: THREE_TAGS_IN_ORDER,
    afterChange: {
      write: {
        'settings/tags': {
          items: { ...THREE_TAGS_DOCUMENT.items, mercado: { name: 'Mercado', nameKey: 'mercado', color: 'petrol' } },
        },
      },
      // O Mercado entra entre a Casa e a Saúde.
      result: [
        THREE_TAGS_IN_ORDER[0],
        { id: 'mercado', name: 'Mercado', nameKey: 'mercado', color: 'petrol' },
        ...THREE_TAGS_IN_ORDER.slice(1),
      ],
    },
  },
} satisfies Record<string, IServiceScenario<object, ITag[]>>;
