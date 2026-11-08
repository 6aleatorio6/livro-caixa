import { lightTheme } from '@/core/theme/lightTheme';

import { TAG_COLORS } from '@/shared/constants/tag/tagColors';

import { tagColorRole } from './tagColorRole';

describe('tagColorRole', () => {
  it('Should name the role of a color', () => {
    expect(tagColorRole('wood')).toBe('tagWood');
  });

  it.each(TAG_COLORS)('Should point the $color color to a role that exists in the theme', ({ color }) => {
    expect(lightTheme.colors).toHaveProperty(tagColorRole(color));
  });
});
