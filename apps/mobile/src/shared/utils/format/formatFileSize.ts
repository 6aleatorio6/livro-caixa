/** O tamanho de um arquivo, à mão (sem Intl): KB inteiro abaixo de 1 MB, MB com uma casa e vírgula. */
export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}
