import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { ScrollableImage } from './ScrollableImage';

const RECEIPT_URI = 'data:image/png;base64,iVBORw0KGgo=';

function loadImage(width: number, height: number) {
  return act(async () =>
    fireEvent(screen.getByLabelText('Comprovante'), 'load', {
      nativeEvent: { source: { width, height, uri: RECEIPT_URI } },
    }),
  );
}

describe('ScrollableImage', () => {
  it('Should show the image across the full width, with the height of its proportion once it loads', async () => {
    await render(<ScrollableImage uri={RECEIPT_URI} onError={jest.fn()} />);

    await loadImage(1080, 2400);

    expect(screen.getByLabelText('Comprovante')).toHaveStyle({ width: '100%', aspectRatio: 0.45 });
  });

  it('Should show a loader until the image loads', async () => {
    await render(<ScrollableImage uri={RECEIPT_URI} onError={jest.fn()} />);
    expect(screen.getByLabelText('Carregando')).toBeOnTheScreen();

    await loadImage(1080, 2400);

    expect(screen.queryByLabelText('Carregando')).not.toBeOnTheScreen();
  });

  it('Should call onError when the image fails', async () => {
    const onError = jest.fn();
    await render(<ScrollableImage uri={RECEIPT_URI} onError={onError} />);

    await act(async () => fireEvent(screen.getByLabelText('Comprovante'), 'error'));

    expect(onError).toHaveBeenCalledTimes(1);
  });
});
