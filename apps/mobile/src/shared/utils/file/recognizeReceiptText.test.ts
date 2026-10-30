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
  it('Should read no lines when the app has no OCR module', async () => {
    jest.mocked(requireOptionalNativeModule).mockReturnValue(null);

    expect(await recognizeReceiptText('file:///cache/comprovante.png', false)).toEqual([]);
  });

  it('Should read no lines when the OCR fails', async () => {
    nativeModule(jest.fn().mockRejectedValue(new Error('O ML Kit não leu a imagem')));

    expect(await recognizeReceiptText('file:///cache/comprovante.png', false)).toEqual([]);
  });

  it('Should hand on the lines the module read', async () => {
    const recognizeText = jest.fn().mockResolvedValue([LINE]);
    nativeModule(recognizeText);

    expect(await recognizeReceiptText('file:///cache/comprovante.pdf', true)).toEqual([LINE]);
    expect(recognizeText).toHaveBeenCalledWith('file:///cache/comprovante.pdf', true);
  });
});
