/** Um arquivo no celular, antes de subir ao Cloud Storage. Os campos têm os nomes do registro em `files`. */
export interface ILocalFile {
  uri: string;
  contentType: string;
  sizeBytes: number;
}
