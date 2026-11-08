# Acesso

O app só tem login pelo Google, e só entra quem tem o e-mail na lista de e-mails permitidos. O
admin mantém essa lista, só com os e-mails: o nome de cada pessoa vem da conta Google, e depois ela
mesma cuida dele.

## Quem usa e quando

- Todo membro, ao entrar no app.
- O admin, ao cadastrar uma pessoa da família: só o e-mail do Google.
- Todo membro, para mudar o próprio nome, em [Configurações](03-configuracoes.md).
- Quem está com o app abaixo da versão mínima, ao abrir o app e ao voltar ao
  [Início](../01-principal/01-inicio.md) ([Versão mínima](#versão-mínima)).
- Quem ligou a entrada com biometria em [Configurações](03-configuracoes.md#entrar-com-biometria),
  ao abrir o app e ao voltar a ele depois de 10 minutos ou mais fora
  ([Entrar com biometria](#entrar-com-biometria)).

## Login

- O login é só pelo Google. Não há login com e-mail e senha nem com outro provedor
  ([Outras formas de login](../../04-escopo-excluido/03-outras-formas-de-login.md)).
- A tela de entrada mostra a marca, o nome do app, uma frase sobre o app, o botão Entrar com
  Google, uma nota de que só entra quem a família liberou e a versão do app.
- Quem entra com um e-mail do Google fora da lista fica na tela de aguardando permissão: ela mostra
  o e-mail com que a pessoa entrou e pede que quem administra o app o libere. Nenhuma outra tela do
  app fica disponível para ela.
- Liberado o e-mail, o app abre sozinho, sem a pessoa sair e entrar de novo.
- Só a resposta de que o e-mail não está na lista leva à tela de aguardando permissão. Um erro
  momentâneo na leitura da lista não leva: quem já estava no app continua nele, quem acabou de
  entrar espera na abertura, e o app tenta ler de novo sozinho até decidir. Se, sem nada decidido
  ainda, a leitura só errar por 30 segundos seguidos, a pessoa cai na tela de aguardando permissão,
  que tem o Sair. Vale também para quem sai e entra de novo: a nova entrada espera a nova leitura,
  sem se prender ao erro de antes.

## Sair

- Todo membro sai da conta pelo ícone de sair, ao lado do nome, na aba
  [Configurações](03-configuracoes.md).
- Na tela de aguardando permissão, o botão Sair volta para a entrada, para a pessoa entrar com outra
  conta do Google.

## O admin

- É marcado à mão, direto no banco de dados. O app não tem tela para dar ou tirar esse papel.
- O esperado é um admin só, mas o app não confere isso: se mais de uma conta for marcada no banco,
  todas funcionam como admin.
- Tem uma tela para adicionar e remover pessoas da lista de e-mails permitidos, na aba
  [Configurações](03-configuracoes.md). Só ele vê essa tela.
- Cada pessoa entra na lista só com o e-mail do Google, obrigatório. O nome vem da conta Google
  ([O próprio nome](#o-próprio-nome)): até a primeira entrada, a lista mostra a pessoa pelo e-mail,
  como quem ainda não entrou.
- O e-mail não se repete na lista: um e-mail que já está nela é recusado.
- Um e-mail só pode ser removido enquanto a pessoa não tem nenhum lançamento. A partir do primeiro
  pagamento, conta avulsa ou contribuição, ela não sai mais da lista.

## O próprio nome

- Na primeira entrada, o nome da pessoa é o da conta Google. Se a conta não tiver nome, o app usa o
  começo do e-mail, até o @. Um nome com mais de 60 caracteres é cortado nesse limite.
- Cada membro muda o próprio nome em [Configurações](03-configuracoes.md), pelo lápis ao lado do
  nome, e responde por ele. Ninguém muda o nome de outra pessoa, nem o admin.
- O nome não fica vazio e tem até 60 caracteres.
- O app mostra sempre o nome atual: nos lançamentos da pessoa, inclusive nos registrados antes da
  troca, e na separação por membro do [Início](../01-principal/01-inicio.md).

## Versão mínima

O app tem uma versão mínima, guardada no documento `settings/app`, no campo `minVersion` (por exemplo,
`"0.5.0"`). Quem está com uma versão abaixo dela não usa o app até instalar a nova.

- O documento muda pelo console do Firebase: o app não tem tela para isso, e as regras não deixam o
  app gravá-lo. Qualquer um o lê, até sem entrar com a conta Google, porque a tela de atualização
  aparece antes do login.
- O app compara a própria versão com o `minVersion` número a número (maior, menor e correção): a
  0.10.0 passa por um mínimo de 0.9.0, o que a comparação como texto erraria. A versão igual à mínima
  passa.
- O app confere quando abre do zero e sempre que o [Início](../01-principal/01-inicio.md) volta a
  aparecer, por exemplo ao voltar de Configurações. Se o mínimo subir com o app aberto, a pessoa segue
  usando até voltar ao Início. Voltar do segundo plano direto para outra tela que não o Início não
  confere: a conferência roda no Início.
- Abaixo do mínimo, o app mostra só a tela "Atualize o app", com a versão instalada e a exigida. Ela
  não tem botão: a saída é instalar a versão nova. Nenhuma outra tela fica disponível, nem a de
  entrada, nem para quem já está logado e liberado.
- Sem o documento ou com um `minVersion` que não é uma versão de três números separados por ponto, o
  app abre como antes.
- Sem internet, a conferência usa o que o celular guardou da última leitura do documento: depois de o
  mínimo ser lido uma vez, a trava vale também sem rede, porque um app desatualizado não deve ser
  usado. Só quem está sem internet e nunca leu o mínimo (nenhum documento guardado no celular) abre o
  app como antes. A conferência espera a leitura por até 3 segundos; se ela não responder nesse prazo,
  o app abre.
- A trava vale da versão que a traz em diante. A 0.3.0 não a tem e continua funcionando até a família
  instalar uma versão que a tenha.
- Quem cuida do app sobe o mínimo no console do Firebase só depois de o APK da versão nova chegar à
  família. Quem ficar para trás vê a tela de atualização até instalar.

## Entrar com biometria

Cada pessoa pode fazer o app pedir a digital ou o rosto antes de mostrar o que está nele. A opção se
liga em [Configurações](03-configuracoes.md#entrar-com-biometria), vale só para aquele celular e vem
desligada.

- Com a opção ligada, o app pede a biometria quando abre do zero e quando volta do segundo plano
  depois de 10 minutos ou mais fora. Voltar antes de 10 minutos não pede: quem atende uma ligação ou
  olha outro app volta direto.
- O pedido é o do sistema, com o título "Abrir o Livro-Caixa". O PIN, a senha ou o padrão do celular
  são a alternativa que o próprio pedido oferece.
- Enquanto está bloqueado, o app mostra a tela "App bloqueado": a marca, "Livro-Caixa", a frase "Use
  a digital ou o rosto para abrir o app." e o botão Desbloquear. O pedido abre sozinho com a tela,
  assim que o app está na frente: se a pessoa o manda para o segundo plano durante a abertura, o
  pedido espera ela voltar e abre uma vez. Se a pessoa o cancela, ela continua nessa tela, e o
  Desbloquear pede de novo. O botão Voltar do Android não sai dela.
- O bloqueio vem depois da [versão mínima](#versão-mínima) e do [login](#login): a tela de
  atualização, a de entrada e a de aguardando permissão aparecem na frente dele, e a tela "App
  bloqueado" só cobre quem está logado e liberado. Quem abre o app sem estar logado e depois entra
  vê o bloqueio assim que a entrada é liberada.
- Desbloqueado, o app volta à mesma tela em que a pessoa estava, com o que ela estava preenchendo:
  as telas abertas continuam por baixo do bloqueio.
- Um comprovante compartilhado com o app bloqueado abre a escolha da conta por baixo do bloqueio e
  aparece, com o arquivo, quando a pessoa desbloqueia
  ([Compartilhar pelo Android](../01-principal/05-comprovantes.md#compartilhar-pelo-android)).
- Se, quando o app pede, o celular não tem mais biometria nem bloqueio de tela cadastrados (a pessoa
  os apagou com a opção ligada), o app desliga a opção e abre, para ninguém ficar trancado fora.
  Enquanto o PIN, a senha ou o padrão continuar cadastrado, o pedido do sistema segue por ele.

## Critérios de aceite

- [ ] Um e-mail do Google fora da lista vê a tela de aguardando permissão, com o e-mail usado, e não
      chega a nenhuma outra tela.
- [ ] Liberado o e-mail, a tela de aguardando permissão dá lugar ao app sem a pessoa sair.
- [ ] O e-mail removido da lista leva à tela de aguardando permissão, mesmo com o app aberto.
- [ ] Um erro momentâneo na leitura do e-mail não leva à tela de aguardando permissão.
- [ ] Quem sai e entra de novo com a mesma conta, com a leitura da lista ainda errando, espera a
      nova leitura e, se ela só errar por 30 segundos seguidos, cai na tela de aguardando permissão.
- [ ] Na tela de aguardando permissão, Sair volta para a entrada.
- [ ] Em Configurações, o ícone de sair tira o membro da conta e volta para a entrada.
- [ ] Um e-mail adicionado pelo admin consegue entrar.
- [ ] Sem o e-mail, a pessoa não é adicionada.
- [ ] Na primeira entrada, o nome da pessoa é o da conta Google.
- [ ] Quem ainda não entrou aparece na lista de e-mails permitidos pelo e-mail.
- [ ] O nome atual da pessoa aparece nos lançamentos dela, inclusive nos registrados antes de uma
      troca de nome, e na separação por membro do Início.
- [ ] O membro muda o próprio nome em Configurações.
- [ ] Sem nome, a troca não é salva.
- [ ] Nenhum membro, nem o admin, muda o nome de outra pessoa.
- [ ] O app recusa um e-mail que já está na lista.
- [ ] Só o admin vê a tela de e-mails permitidos.
- [ ] O admin remove o e-mail de uma pessoa que ainda não tem lançamentos, e ela deixa de entrar.
- [ ] O app não deixa remover o e-mail de quem já tem um pagamento ou uma conta avulsa.
- [ ] O app não deixa remover o e-mail de quem só tem contribuições.
- [ ] Abaixo da versão mínima, o app mostra só a tela de atualização, com a versão instalada e a
      pedida, e nenhuma outra tela fica disponível, nem para quem está logado e liberado.
- [ ] A tela de atualização aparece também para quem ainda não entrou com a conta Google.
- [ ] A versão mínima sobe com o app aberto: ao voltar ao Início, a tela de atualização aparece.
- [ ] Sem o documento, o app abre como antes.
- [ ] Sem internet e sem nunca ter lido o mínimo (nenhum documento guardado no celular), o app abre
      como antes.
- [ ] Depois de ler o mínimo uma vez, o app abaixo dele continua na tela de atualização também sem
      internet.
- [ ] Um `minVersion` malformado não barra o app.
- [ ] A 0.10.0 passa por um mínimo de 0.9.0, e a versão igual à mínima também passa.
- [ ] Qualquer um lê o documento `settings/app`, até sem entrar, e ninguém o grava pelo app.
- [ ] Com a opção ligada, abrir o app do zero pede a biometria.
- [ ] Voltar do segundo plano antes de 10 minutos não pede a biometria.
- [ ] Voltar do segundo plano depois de 10 minutos ou mais pede a biometria.
- [ ] Mandar o app para o segundo plano durante a abertura não deixa o pedido preso: ao voltar, ele
      abre uma vez.
- [ ] Cancelar o pedido deixa o app na tela "App bloqueado", com o botão Desbloquear.
- [ ] O Desbloquear pede a biometria de novo.
- [ ] O botão Voltar do Android não sai da tela "App bloqueado".
- [ ] Desbloqueado, o app volta à mesma tela em que a pessoa estava.
- [ ] Um comprovante compartilhado com o app bloqueado abre a escolha da conta depois do desbloqueio.
- [ ] A tela de atualização e a de entrada ficam na frente do bloqueio, e o bloqueio não cobre quem
      não está logado e liberado.
- [ ] Sem biometria nem bloqueio de tela cadastrados no celular, o app desliga a opção e abre.
