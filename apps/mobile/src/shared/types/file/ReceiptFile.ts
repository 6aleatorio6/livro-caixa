/** O comprovante já salvo de um lançamento: o registro em `files`. */
export interface IReceiptFile {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  sizeBytes: number;
  /** O tipo da imagem guardada, o da `uri` `data:` que abre o comprovante. */
  contentType: string;
}
