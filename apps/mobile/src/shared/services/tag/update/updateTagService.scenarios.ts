import { HOME_TAG_ID, UTILITIES_TAG_ID } from '@/shared/testing/tagFixtures';
import { HEALTH_TAG_ID, THREE_TAGS_DOCUMENT } from '@/shared/testing/tagFixtures';
import type { ITag } from '@/shared/types/tag/Tag';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A pessoa é a conta de teste das jornadas: o Bruno é membro, e as tags são da família.
const BRUNO = 'bruno.souza@exemplo.com';
const WITH_THREE_TAGS = {
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true },
  'settings/tags': THREE_TAGS_DOCUMENT,
};

export const updateTagScenarios = {
  // Só a caixa muda: a chave do nome continua a mesma, mas é a própria tag, então passa.
  memberRenamesOwnTagToOtherCase: {
    signedInAs: BRUNO,
    given: WITH_THREE_TAGS,
    input: [{ id: HOME_TAG_ID, name: 'CASA', color: 'wood' }],
    result: { id: HOME_TAG_ID, name: 'CASA', nameKey: 'casa', color: 'wood' },
  },
  memberRenamesTag: {
    signedInAs: BRUNO,
    given: WITH_THREE_TAGS,
    input: [{ id: HEALTH_TAG_ID, name: 'Bem-estar', color: 'plum' }],
    result: { id: HEALTH_TAG_ID, name: 'Bem-estar', nameKey: 'bem-estar', color: 'plum' },
  },
  // Trocar só a cor: o nome é o mesmo da tag, e passa.
  memberChangesColor: {
    signedInAs: BRUNO,
    given: WITH_THREE_TAGS,
    input: [{ id: UTILITIES_TAG_ID, name: 'Serviços', color: 'indigo' }],
    result: { id: UTILITIES_TAG_ID, name: 'Serviços', nameKey: 'servicos', color: 'indigo' },
  },
} satisfies Record<string, IServiceScenario<[Pick<ITag, 'id' | 'name' | 'color'>], ITag>>;

/** Os casos recusados: o serviço lança `AppError`, e a `result` é o que o erro carrega. */
export const updateTagRejectedScenarios = {
  // "SAÚDE" tem a mesma chave da Saúde, que é de outra tag.
  nameOfAnotherTag: {
    signedInAs: BRUNO,
    given: WITH_THREE_TAGS,
    input: [{ id: HOME_TAG_ID, name: 'SAÚDE', color: 'wood' }],
    result: { code: 'TAG_NAME_IN_USE', userMessage: 'Já existe a tag Saúde. Escolha outro nome.' },
  },
  // Outro membro excluiu a tag com a alteração aberta: salvar não a recria.
  tagDeletedInTheMeantime: {
    signedInAs: BRUNO,
    given: WITH_THREE_TAGS,
    input: [{ id: 'excluida', name: 'Lazer', color: 'moss' }],
    result: { code: 'TAG_NOT_FOUND', userMessage: 'Esta tag foi excluída.' },
  },
} satisfies Record<string, IServiceScenario<[Pick<ITag, 'id' | 'name' | 'color'>], { code: string; userMessage: string }>>;
