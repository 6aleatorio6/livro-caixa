import { HEALTH_TAG, THREE_TAGS_DOCUMENT } from '@/shared/testing/tagFixtures';
import type { ITag } from '@/shared/types/tag/Tag';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A pessoa é a conta de teste das jornadas: o Bruno é membro, e as tags são da família.
const BRUNO = 'bruno.souza@exemplo.com';
const BRUNO_IN_THE_LIST = {
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true },
};
const WITH_THREE_TAGS = { ...BRUNO_IN_THE_LIST, 'settings/tags': THREE_TAGS_DOCUMENT };

export const createTagScenarios = {
  // Exatamente o que a tela envia: a tag Mercado, petróleo. O id é gerado, então o resultado não o traz.
  memberCreatesTag: {
    signedInAs: BRUNO,
    given: WITH_THREE_TAGS,
    input: [{ name: 'Mercado', color: 'petrol' }],
    result: { name: 'Mercado', nameKey: 'mercado', color: 'petrol' },
  },
  // A primeira tag da família: o documento `settings/tags` ainda não existe e a transação o cria.
  memberCreatesFirstTag: {
    signedInAs: BRUNO,
    given: BRUNO_IN_THE_LIST,
    input: [{ name: 'Casa', color: 'wood' }],
    result: { name: 'Casa', nameKey: 'casa', color: 'wood' },
  },
} satisfies Record<string, IServiceScenario<[Pick<ITag, 'name' | 'color'>], Omit<ITag, 'id'>>>;

/** Os casos recusados: o serviço lança `AppError`, e a `result` é o que o erro carrega. */
export const createTagRejectedScenarios = {
  // "saude" e "Saúde" são a mesma tag, e a mensagem cita o nome que já está gravado.
  nameOfAnotherTagWithoutAccent: {
    signedInAs: BRUNO,
    given: WITH_THREE_TAGS,
    input: [{ name: 'saude', color: 'moss' }],
    result: { code: 'TAG_NAME_IN_USE', userMessage: 'Já existe a tag Saúde. Escolha outro nome.' },
  },
  nameOfAnotherTagInUpperCase: {
    signedInAs: BRUNO,
    given: WITH_THREE_TAGS,
    input: [{ name: ` ${HEALTH_TAG.name.toUpperCase()} `, color: 'moss' }],
    result: { code: 'TAG_NAME_IN_USE', userMessage: 'Já existe a tag Saúde. Escolha outro nome.' },
  },
} satisfies Record<string, IServiceScenario<[Pick<ITag, 'name' | 'color'>], { code: string; userMessage: string }>>;
