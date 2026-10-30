import type { ILocalFile } from './LocalFile';

/**
 * Um comprovante escolhido e conferido, pronto para subir: `wasReduced` diz se a imagem passou pela redução, e
 * `readAmountCents` é o valor pago que o OCR leu nele, ou `null` quando não leu um valor sem dúvida. O valor lido não
 * vai para o Firestore: só preenche o valor do formulário.
 */
export type IReceipt = ILocalFile & { type: 'image' | 'pdf'; wasReduced: boolean; readAmountCents: number | null };
