import { formatFileSize } from './formatFileSize';

describe('formatFileSize', () => {
  it.each([
    { bytes: 186368, expected: '182 KB' },
    { bytes: 1048575, expected: '1024 KB' },
    { bytes: 1048576, expected: '1,0 MB' },
    { bytes: 1258291, expected: '1,2 MB' },
    { bytes: 5033165, expected: '4,8 MB' },
    { bytes: 5242880, expected: '5,0 MB' },
  ])('Should write $bytes bytes as $expected', ({ bytes, expected }) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});
