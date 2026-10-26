// A biblioteca é ESM e chama um módulo nativo, que não existem no Jest; os testes dão o resultado de `open` e
// `generate` com `jest.mocked(PdfPageImage.open)`.
export default { open: jest.fn(), generate: jest.fn() };
