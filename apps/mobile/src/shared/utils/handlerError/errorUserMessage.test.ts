import { AppError } from '@/shared/exceptions/AppError';
import { errorUserMessage } from './errorUserMessage';

describe('errorUserMessage', () => {
  it('Should use the user message of an AppError', () => {
    expect(errorUserMessage(new AppError('Bill not found', 'Essa conta não existe mais.'))).toBe(
      'Essa conta não existe mais.',
    );
  });

  it('Should explain a known library error by its code', () => {
    expect(errorUserMessage({ code: 'auth/network-request-failed' })).toBe(
      'Sem conexão. Confira a internet e tente de novo.',
    );
  });

  it('Should fall back to the generic message for anything else', () => {
    expect(errorUserMessage(new Error('boom'))).toBe('Algo deu errado. Tente de novo.');
    expect(errorUserMessage(null)).toBe('Algo deu errado. Tente de novo.');
  });
});
