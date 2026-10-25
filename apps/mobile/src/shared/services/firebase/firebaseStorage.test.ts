import { getStorage, setMaxUploadRetryTime } from '@react-native-firebase/storage';

jest.mock('@react-native-firebase/storage', () => ({
  getStorage: jest.fn(() => ({ name: 'storage' })),
  connectStorageEmulator: jest.fn(),
  setMaxUploadRetryTime: jest.fn(),
}));
jest.mock('./emulatorHost', () => ({ EMULATOR_HOST: undefined }));

describe('firebaseStorage', () => {
  it('Should give up on an upload after 30 seconds, so the loader leaves when the network is down', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { firebaseStorage } = require('./firebaseStorage');

    expect(setMaxUploadRetryTime).toHaveBeenCalledWith(firebaseStorage, 30_000);
    expect(getStorage).toHaveBeenCalledTimes(1);
  });
});
