import { render, screen, userEvent } from '@testing-library/react-native';
import { useState } from 'react';

import { useLoaderStore } from '@/core/store/loader.store';
import { AppError } from '@/shared/exceptions/AppError';
import type { IReceipt } from '@/shared/types/file/Receipt';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';
import { pickReceiptFile } from '@/shared/utils/file/pickReceiptFile';
import { prepareReceipt } from '@/shared/utils/file/prepareReceipt';

import { ReceiptField } from './ReceiptField';

jest.mock('@/shared/utils/file/pickReceiptFile', () => ({ pickReceiptFile: jest.fn() }));
jest.mock('@/shared/utils/file/prepareReceipt', () => ({ prepareReceipt: jest.fn() }));

const jpg: IReceipt = {
  uri: 'file:///recibo.jpg',
  name: 'recibo-conserto.jpg',
  contentType: 'image/jpeg',
  sizeBytes: Math.round(1.2 * 1024 * 1024),
  type: 'image',
  wasReduced: false,
};
const pdf: IReceipt = {
  uri: 'file:///luz.pdf',
  name: 'comprovante-luz.pdf',
  contentType: 'application/pdf',
  sizeBytes: 182 * 1024,
  type: 'pdf',
  wasReduced: false,
};
const savedReceipt: IReceiptFile = {
  id: 'file-1',
  name: 'comprovante-luz.pdf',
  type: 'pdf',
  sizeBytes: 182 * 1024,
  contentType: 'application/pdf',
};
const pickedFile = { uri: 'file:///x', name: 'x.pdf', contentType: 'application/pdf', sizeBytes: 10 };

async function renderField(overrides: { initial?: IReceipt | null; errorMessage?: string; currentReceipt?: IReceiptFile } = {}) {
  const onBlur = jest.fn();
  const onValueChange = jest.fn();
  function Harness() {
    const [value, setValue] = useState<IReceipt | null>(overrides.initial ?? null);
    return (
      <ReceiptField
        value={value}
        onValueChange={(next) => {
          onValueChange(next);
          setValue(next);
        }}
        onBlur={onBlur}
        errorMessage={overrides.errorMessage}
        currentReceipt={overrides.currentReceipt}
      />
    );
  }
  await render(<Harness />);
  return { onBlur, onValueChange, user: userEvent.setup() };
}

describe('ReceiptField', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useLoaderStore.setState({ isVisible: false });
  });

  it('Should invite the person to choose a file when empty', async () => {
    await renderField();

    expect(screen.getByText('Comprovante')).toBeOnTheScreen();
    expect(screen.getByText('Nenhum arquivo anexado')).toBeOnTheScreen();
    expect(screen.getByText('Escolher')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Comprovante: Nenhum arquivo anexado. Escolher' })).toBeOnTheScreen();
  });

  it('Should show the attached image with its size', async () => {
    await renderField({ initial: jpg });

    expect(screen.getByText('Imagem · 1,2 MB')).toBeOnTheScreen();
    expect(screen.getByText('recibo-conserto.jpg')).toBeOnTheScreen();
    expect(screen.getByText('Trocar')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Comprovante: recibo-conserto.jpg. Trocar' })).toBeOnTheScreen();
  });

  it('Should say the image was reduced', async () => {
    await renderField({ initial: { ...jpg, wasReduced: true, sizeBytes: Math.round(4.8 * 1024 * 1024) } });

    expect(screen.getByText('Imagem · comprimida para 4,8 MB')).toBeOnTheScreen();
  });

  it('Should show the attached PDF', async () => {
    await renderField({ initial: pdf });

    expect(screen.getByText('PDF · 182 KB')).toBeOnTheScreen();
    expect(screen.getByText('comprovante-luz.pdf')).toBeOnTheScreen();
  });

  it('Should show the saved receipt until a new file is picked', async () => {
    jest.mocked(pickReceiptFile).mockResolvedValue(pickedFile);
    jest.mocked(prepareReceipt).mockResolvedValue(jpg);
    const { user } = await renderField({ currentReceipt: savedReceipt });

    expect(screen.getByText('PDF · 182 KB')).toBeOnTheScreen();
    expect(screen.getByText('comprovante-luz.pdf')).toBeOnTheScreen();
    expect(screen.getByText('Trocar')).toBeOnTheScreen();

    await user.press(screen.getByRole('button'));

    expect(await screen.findByText('recibo-conserto.jpg')).toBeOnTheScreen();
    expect(screen.queryByText('comprovante-luz.pdf')).toBeNull();
  });

  it('Should attach the file the person picks and leave the field', async () => {
    jest.mocked(pickReceiptFile).mockResolvedValue(pickedFile);
    jest.mocked(prepareReceipt).mockResolvedValue(pdf);
    const { user, onBlur } = await renderField();

    await user.press(screen.getByRole('button'));

    expect(await screen.findByText('PDF · 182 KB')).toBeOnTheScreen();
    expect(prepareReceipt).toHaveBeenCalledWith(pickedFile);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('Should keep the previous value when the picker is canceled', async () => {
    jest.mocked(pickReceiptFile).mockResolvedValue(null);
    const { user, onBlur } = await renderField({ initial: jpg });

    await user.press(screen.getByRole('button'));

    expect(screen.getByText('recibo-conserto.jpg')).toBeOnTheScreen();
    expect(prepareReceipt).not.toHaveBeenCalled();
    expect(onBlur).not.toHaveBeenCalled();
  });

  it('Should show the reason and the file name when the file is rejected, then clear it on a valid pick', async () => {
    jest
      .mocked(pickReceiptFile)
      .mockResolvedValueOnce({ ...pickedFile, name: 'extrato-setembro.pdf' })
      .mockResolvedValueOnce(pickedFile);
    jest
      .mocked(prepareReceipt)
      .mockRejectedValueOnce(new AppError('Receipt PDF has more than one page', 'O PDF tem mais de uma página. Por enquanto, só dá para anexar PDF de uma página.'))
      .mockResolvedValueOnce(pdf);
    const { user } = await renderField();

    await user.press(screen.getByRole('button'));

    expect(await screen.findByText('O PDF tem mais de uma página. Por enquanto, só dá para anexar PDF de uma página.')).toBeOnTheScreen();
    expect(screen.getByText('extrato-setembro.pdf')).toBeOnTheScreen();
    expect(screen.getByText('Escolher outro')).toBeOnTheScreen();

    await user.press(screen.getByRole('button'));

    expect(await screen.findByText('PDF · 182 KB')).toBeOnTheScreen();
    expect(screen.queryByText('O PDF tem mais de uma página. Por enquanto, só dá para anexar PDF de uma página.')).toBeNull();
  });

  it('Should show the rejected file instead of the previous one', async () => {
    jest.mocked(pickReceiptFile).mockResolvedValue({ ...pickedFile, name: 'grande.pdf' });
    jest.mocked(prepareReceipt).mockRejectedValue(new AppError('Receipt PDF has more than one page', 'O PDF tem mais de uma página. Por enquanto, só dá para anexar PDF de uma página.'));
    const { user } = await renderField({ initial: jpg });

    await user.press(screen.getByRole('button'));

    expect(await screen.findByText('grande.pdf')).toBeOnTheScreen();
    expect(screen.queryByText('recibo-conserto.jpg')).toBeNull();
  });

  it('Should clear the form value when the new file is rejected, so the previous file is not sent', async () => {
    jest.mocked(pickReceiptFile).mockResolvedValue({ ...pickedFile, name: 'grande.pdf' });
    jest.mocked(prepareReceipt).mockRejectedValue(new AppError('Receipt PDF has more than one page', 'O PDF tem mais de uma página. Por enquanto, só dá para anexar PDF de uma página.'));
    const { user, onValueChange } = await renderField({ initial: jpg });

    await user.press(screen.getByRole('button'));

    await screen.findByText('O PDF tem mais de uma página. Por enquanto, só dá para anexar PDF de uma página.');
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it.each([
    { description: 'the picker rejects', pick: () => jest.mocked(pickReceiptFile).mockRejectedValue(new Error('Picker already open')) },
    {
      description: 'the file size cannot be read',
      pick: () => jest.mocked(pickReceiptFile).mockRejectedValue(new TypeError('File size is not available')),
    },
  ])('Should say the file could not be read when $description', async ({ pick }) => {
    pick();
    const { user, onValueChange } = await renderField({ initial: jpg });

    await user.press(screen.getByRole('button'));

    expect(await screen.findByText('Não deu para ler o arquivo. Escolha outro.')).toBeOnTheScreen();
    expect(screen.getByText('Escolher outro')).toBeOnTheScreen();
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(useLoaderStore.getState().isVisible).toBe(false);
  });

  it('Should show the form error in the error state, with the empty file text', async () => {
    await renderField({ errorMessage: 'Anexe o comprovante.' });

    expect(screen.getByText('Anexe o comprovante.')).toBeOnTheScreen();
    expect(screen.getByText('Nenhum arquivo anexado')).toBeOnTheScreen();
    expect(screen.getByText('Escolher')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Comprovante: Anexe o comprovante. Nenhum arquivo anexado. Escolher' }),
    ).toBeOnTheScreen();
  });

  it('Should keep the 70 dp height of the design: the padding gives up what the border takes', async () => {
    const { rerender } = await render(<ReceiptField value={null} onValueChange={jest.fn()} onBlur={jest.fn()} />);
    expect(screen.getByRole('button')).toHaveStyle({ borderWidth: 1, paddingVertical: 13, paddingHorizontal: 15 });

    await rerender(<ReceiptField value={null} onValueChange={jest.fn()} onBlur={jest.fn()} errorMessage="Anexe o comprovante." />);
    expect(screen.getByRole('button')).toHaveStyle({ borderWidth: 2, paddingVertical: 12, paddingHorizontal: 14 });
  });

  it('Should show the loader while the file is prepared and hide it afterwards', async () => {
    let resolvePrepare!: (receipt: IReceipt) => void;
    jest.mocked(pickReceiptFile).mockResolvedValue(pickedFile);
    jest.mocked(prepareReceipt).mockReturnValue(new Promise((resolve) => (resolvePrepare = resolve)));
    const { user } = await renderField();

    await user.press(screen.getByRole('button'));
    expect(useLoaderStore.getState().isVisible).toBe(true);

    resolvePrepare(pdf);
    await screen.findByText('PDF · 182 KB');
    expect(useLoaderStore.getState().isVisible).toBe(false);
  });

  it('Should hide the loader when the file is rejected', async () => {
    jest.mocked(pickReceiptFile).mockResolvedValue(pickedFile);
    jest.mocked(prepareReceipt).mockRejectedValue(new AppError('Receipt PDF has more than one page', 'O PDF tem mais de uma página. Por enquanto, só dá para anexar PDF de uma página.'));
    const { user } = await renderField();

    await user.press(screen.getByRole('button'));

    await screen.findByText('Escolher outro');
    expect(useLoaderStore.getState().isVisible).toBe(false);
  });
});
