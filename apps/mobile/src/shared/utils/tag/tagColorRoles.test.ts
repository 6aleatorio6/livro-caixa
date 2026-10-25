import { lightTheme } from '@/core/theme/lightTheme';

import { TAG_COLORS } from '@/shared/constants/tag/tagColors';

import { tagColorRoles } from './tagColorRoles';

describe('tagColorRoles', () => {
  it('Should name the three roles of a color', () => {
    expect(tagColorRoles('wood')).toEqual({
      mainRole: 'tagWood',
      containerRole: 'tagWoodContainer',
      onContainerRole: 'onTagWoodContainer',
    });
  });

  it.each(TAG_COLORS)('Should point the $color color to roles that exist in the theme', ({ color }) => {
    for (const role of Object.values(tagColorRoles(color))) expect(lightTheme.colors).toHaveProperty(role);
  });
});
