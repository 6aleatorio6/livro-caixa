import { requireOptionalNativeModule } from 'expo';

import { recognizeReceiptText } from './recognizeReceiptText';

jest.mock('expo', () => ({ requireOptionalNativeModule: jest.fn() }));

const LINE = { text: 'R$ 30,00', left: 48, top: 220, width: 260, height: 40 };

function nativeModule(recognizeText: jest.Mock) {
  jest.mocked(requireOptionalNativeModule).mockReturnValue({ recognizeText });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('recognizeReceiptText', () => {
  it('Should read nothing when the app has no OCR module', async () => {
    jest.mocked(requireOptionalNativeModule).mockReturnValue(null);

    expect(await recognizeReceiptText('file:///cache/comprovante.png', false, 0)).toBeNull();
  });

  it('Should read nothing when the OCR fails', async () => {
    nativeModule(jest.fn().mockRejectedValue(new Error('O ML Kit não leu a imagem')));

    expect(await recognizeReceiptText('file:///cache/comprovante.png', false, 0)).toBeNull();
  });

  it('Should read nothing when the PDF has no such page', async () => {
    nativeModule(jest.fn().mockResolvedValue(null));

    expect(await recognizeReceiptText('file:///cache/comprovante.pdf', true, 5)).toBeNull();
  });

  it('Should ask the module for the page and hand on the lines it read', async () => {
    const recognizeText = jest.fn().mockResolvedValue([LINE]);
    nativeModule(recognizeText);

    expect(await recognizeReceiptText('file:///cache/comprovante.pdf', true, 1)).toEqual([LINE]);
    expect(recognizeText).toHaveBeenCalledWith('file:///cache/comprovante.pdf', true, 1);
  });
});
