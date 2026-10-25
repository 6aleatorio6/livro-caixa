/**
 * Um caso do contrato de um serviço: o teste de contrato o confere contra os emuladores do Firebase,
 * e o teste de página o usa como mock. Assim, o mock só diz o que o serviço real já foi visto dizer.
 */
export interface IServiceScenario<TInput, TResult> {
  /** Quem chama: o e-mail da conta de teste; `null` sem sessão. */
  signedInAs: string | null;
  /** Os documentos gravados antes, por caminho (`allowedEmails/bruno.souza@exemplo.com`). */
  given: Record<string, object>;
  /**
   * Só quem lê ou apaga o arquivo: os objetos gravados antes no Storage, por caminho (`files/f1`), com o tipo e o
   * autor (`customMetadata.uploadedBy`). O conteúdo é sempre o comprovante PNG dos contratos.
   */
  storageGiven?: Record<string, { contentType: string; uploadedBy: string }>;
  /** Os parâmetros da leitura em tempo real, ou os argumentos do serviço, em tupla. */
  input: TInput;
  /** O que o serviço entrega. Num objeto, só os campos que alguma tela usa. */
  result: TResult;
  /** Só leitura em tempo real: o que muda no banco com ela aberta (`null` apaga) e o que ela entrega depois. */
  afterChange?: { write: Record<string, object | null>; result: TResult };
}
