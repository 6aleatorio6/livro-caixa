// A `react-native-pdf` quebra no Jest sem o módulo nativo do `react-native-blob-util`; os testes leem as props que o
// componente recebe com `jest.mocked(Pdf).mock.calls`.
export default jest.fn(() => null);
