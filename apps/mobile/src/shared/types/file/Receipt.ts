import type { ILocalFile } from './LocalFile';

/** Um comprovante escolhido e conferido, pronto para subir: `wasReduced` diz se a imagem passou pela redução. */
export type IReceipt = ILocalFile & { type: 'image' | 'pdf'; wasReduced: boolean };
