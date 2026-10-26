/** Um arquivo no celular, antes de ir para o Firestore. Os campos têm os nomes do registro em `files`. */
export interface ILocalFile {
  uri: string;
  name: string;
  contentType: string;
  sizeBytes: number;
}
