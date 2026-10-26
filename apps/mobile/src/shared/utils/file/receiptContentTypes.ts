/**
 * Os tipos de imagem que o comprovante aceita, os mesmos das regras do Firestore (`files`) e do Storage:
 * o SVG fica de fora, que pode carregar script.
 */
export const RECEIPT_IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];

export const RECEIPT_PDF_CONTENT_TYPE = 'application/pdf';
