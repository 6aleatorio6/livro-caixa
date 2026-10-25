const SHARING_ADDRESS = /^(?:[a-z][a-z0-9+.-]*:\/\/)?\/*expo-sharing\/?(?:[?#].*)?$/i;

/** O Android abre o app com `livrocaixa://expo-sharing` ao compartilhar um arquivo: leva à tela de escolher a conta. */
export function redirectSystemPath({ path }: { path: string }) {
  return SHARING_ADDRESS.test(path) ? '/share-receipt' : path;
}
