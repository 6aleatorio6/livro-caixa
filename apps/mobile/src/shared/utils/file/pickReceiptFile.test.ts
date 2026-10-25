import { getDocumentAsync } from 'expo-document-picker';
import { File } from 'expo-file-system';

import { pickReceiptFile } from './pickReceiptFile';

jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({ File: jest.fn() }));

const getDocument = getDocumentAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('pickReceiptFile', () => {
  it('Should open only the phone files, for images and PDFs', async () => {
    getDocument.mockResolvedValue({ canceled: true, assets: null });

    await pickReceiptFile();

    expect(getDocument).toHaveBeenCalledWith({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
      multiple: false,
    });
  });

  it('Should return null when the person cancels', async () => {
    getDocument.mockResolvedValue({ canceled: true, assets: null });

    expect(await pickReceiptFile()).toBeNull();
  });

  it('Should return the chosen file with the size the picker reported', async () => {
    getDocument.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///cache/luz.pdf', name: 'luz.pdf', size: 1024, mimeType: 'application/pdf' }],
    });

    expect(await pickReceiptFile()).toEqual({
      uri: 'file:///cache/luz.pdf',
      name: 'luz.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1024,
    });
    expect(File).not.toHaveBeenCalled();
  });

  it('Should read the size from the file when the picker does not report it', async () => {
    (File as unknown as jest.Mock).mockImplementation(() => ({ size: 4096 }));
    getDocument.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///cache/luz.jpg', name: 'luz.jpg', mimeType: 'image/jpeg' }],
    });

    expect(await pickReceiptFile()).toMatchObject({ sizeBytes: 4096 });
    expect(File).toHaveBeenCalledWith('file:///cache/luz.jpg');
  });

  it('Should return an empty content type when the picker does not know it', async () => {
    getDocument.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///cache/x', name: 'x', size: 10 }] });

    expect(await pickReceiptFile()).toMatchObject({ contentType: '' });
  });
});
