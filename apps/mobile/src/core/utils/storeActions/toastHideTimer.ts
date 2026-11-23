/**
 * O timer que esconde o aviso sozinho. `showToast` o arma e `hideToast` o desarma, nos dois arquivos: um objeto os
 * une, porque uma variável que dois módulos mudam não se importa e reatribui.
 */
export const toastHideTimer: { id: ReturnType<typeof setTimeout> | undefined } = { id: undefined };
