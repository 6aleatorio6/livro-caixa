# Leitura do Valor pelo Comprovante

**Está fora do escopo, por enquanto:** o app ler o valor no
[comprovante](../03-funcionalidades/01-principal/05-comprovantes.md) e preencher sozinho o valor do
[pagamento](../03-funcionalidades/01-principal/03-pagamento-de-conta-recorrente.md) ou da
[conta avulsa](../03-funcionalidades/01-principal/04-conta-avulsa.md).

Quando entrar, a leitura é feita no próprio celular, sem enviar o comprovante a um serviço de fora.
Fica um ponto para resolver: o app precisa achar o valor pago entre os outros números do
comprovante, como a tarifa e o código da transação. O PDF já chega como imagem, porque o app o
converte antes de salvar ([Plataforma e Stack](../05-arquitetura/01-plataforma-e-stack.md)).
