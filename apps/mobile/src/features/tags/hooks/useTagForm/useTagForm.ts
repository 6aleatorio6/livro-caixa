import { mixed, object, string } from 'yup';

import { TAG_COLORS } from '@/shared/constants/tag/tagColors';
import type { ITag } from '@/shared/types/tag/Tag';
import type { ITagColor } from '@/shared/types/tag/TagColor';
import { createFormHook } from '@/shared/utils/form/createFormHook';
import { tagNameKey } from '@/shared/utils/tag/tagNameKey';

/** O que o formulário sabe de fora: as tags carregadas e, ao alterar, o id da tag que está aberta. */
interface ITagFormContext {
  tags: ITag[];
  /** A tag que se altera não conta como repetida de si mesma ("Casa" para "CASA"). */
  tagId?: string;
}

const tagSchema = object({
  name: string()
    .trim()
    .required()
    .max(30)
    .test('name-in-use', function (value) {
      const { tags = [], tagId } = (this.options.context as Partial<ITagFormContext> | undefined) ?? {};
      const nameKey = tagNameKey(value);
      const sameName = tags.find((tag) => tag.id !== tagId && tag.nameKey === nameKey);
      // A mensagem cita o nome como está gravado ("Saúde" para quem digitou "saude").
      return sameName ? this.createError({ message: `Já existe a tag ${sameName.name}. Escolha outro nome.` }) : true;
    }),
  color: mixed<ITagColor>()
    .oneOf(TAG_COLORS.map(({ color }) => color))
    .required(),
});

/** O formulário da tag, o mesmo ao criar e ao alterar; o nome repetido é recusado pela lista lida. */
export const useTagForm = createFormHook<Pick<ITag, 'name' | 'color'>, ITagFormContext>(tagSchema, {
  name: '',
  color: TAG_COLORS[0].color,
});
