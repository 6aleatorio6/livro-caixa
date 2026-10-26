/**
 * O maior comprovante, em bytes: 900 KiB. Ele mora num documento do Firestore (`fileContents`), que guarda até 1 MiB; o
 * resto fica de folga para o nome do documento e do campo. As regras (`files`) aplicam o mesmo limite.
 */
export const RECEIPT_MAX_BYTES = 900 * 1024;
