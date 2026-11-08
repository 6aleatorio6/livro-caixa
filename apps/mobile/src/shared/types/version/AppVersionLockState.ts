export interface IAppVersionLockState {
  /** A versão que o app precisa ter, quando a instalada está abaixo dela; `null` enquanto nada barra. */
  requiredVersion: string | null;
}
