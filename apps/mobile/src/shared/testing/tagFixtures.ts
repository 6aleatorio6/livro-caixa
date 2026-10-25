// As três tags do design, como o item grava (sem o id). Os ids são fixos (no app são gerados) para os
// cenários das tags e das contas recorrentes e as telas citarem a mesma tag.
export const HOME_TAG_ID = 'casa';
export const UTILITIES_TAG_ID = 'servicos';
export const HEALTH_TAG_ID = 'saude';
export const HOME_TAG = { name: 'Casa', nameKey: 'casa', color: 'wood' } as const;
export const UTILITIES_TAG = { name: 'Serviços', nameKey: 'servicos', color: 'blue' } as const;
export const HEALTH_TAG = { name: 'Saúde', nameKey: 'saude', color: 'plum' } as const;

/** O documento `settings/tags` com as três tags, em uma ordem que não é a do nome. */
export const THREE_TAGS_DOCUMENT = {
  items: { [HOME_TAG_ID]: HOME_TAG, [UTILITIES_TAG_ID]: UTILITIES_TAG, [HEALTH_TAG_ID]: HEALTH_TAG },
};
