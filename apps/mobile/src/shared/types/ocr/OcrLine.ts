/** Uma linha de texto que o OCR leu no comprovante, com a posição dela na imagem lida, em pixels. */
export interface IOcrLine {
  text: string;
  left: number;
  top: number;
  width: number;
  height: number;
}
