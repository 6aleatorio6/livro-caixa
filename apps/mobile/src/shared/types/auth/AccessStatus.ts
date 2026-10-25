/**
 * Em que tela a pessoa cai: `denied` é a de sem acesso, para um e-mail do Google fora da lista de
 * e-mails permitidos.
 */
export type IAccessStatus = 'loading' | 'signedOut' | 'denied' | 'allowed';
