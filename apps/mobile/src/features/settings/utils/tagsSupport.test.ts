import { tagListQueryScenarios } from '@/shared/services/tag/query/tagListQueryService.scenarios';

import { tagsSupport } from './tagsSupport';

describe('tagsSupport', () => {
  it('Should list the names of the tags in order', () => {
    expect(tagsSupport(tagListQueryScenarios.threeTags.result)).toBe('Casa, Saúde, Serviços');
  });

  it('Should say there is no tag when the family has none', () => {
    expect(tagsSupport(tagListQueryScenarios.noTagsDocument.result)).toBe('Nenhuma tag');
  });
});
