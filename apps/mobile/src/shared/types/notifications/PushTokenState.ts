export interface IPushTokenState {
  /** O token do Expo que este celular gravou no Firestore nesta sessão; `null` enquanto não gravou ou depois de apagar. */
  token: string | null;
}
