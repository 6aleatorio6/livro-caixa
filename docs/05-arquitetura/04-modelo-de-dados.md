---
mdx:
  format: mdx
---

import DbmlDiagram from '@wjmpantig/docusaurus-plugin-dbml/DbmlDiagram';
import dataModel from '!!raw-loader!./modelo-de-dados.dbml';

# Modelo de Dados

O modelo é o arquivo [`modelo-de-dados.dbml`](modelo-de-dados.dbml), desta pasta, e o diagrama
abaixo é desenhado a partir dele: o modelo se edita no arquivo, e a página acompanha. Cada tabela é
uma coleção do Firestore, com o id do documento como chave. As exceções, as leituras de cada tela e
o que as regras de segurança garantem estão no comentário que abre o arquivo, na aba *Code*.

As tabelas são posicionadas automaticamente: arraste para mover, role para aproximar.

<DbmlDiagram dbml={dataModel} height={700} />
