# Leitura do Valor pelo Comprovante

**Está fora do escopo, por enquanto:** o app ler o valor no
[comprovante](../03-funcionalidades/01-principal/05-comprovantes.md) e preencher sozinho o valor do
[pagamento](../03-funcionalidades/01-principal/03-pagamento-de-conta-recorrente.md) ou da
[conta avulsa](../03-funcionalidades/01-principal/04-conta-avulsa.md).

Quando entrar, a leitura é feita no próprio celular, sem enviar o comprovante a um serviço de fora.
Ficam dois pontos para resolver. O PDF precisa virar imagem antes da leitura, e a biblioteca que o
mostra no app não faz isso ([Plataforma e Stack](../05-arquitetura/01-plataforma-e-stack.md)). E o
app precisa achar o valor pago entre os outros números do comprovante, como a tarifa e o código da
transação.
