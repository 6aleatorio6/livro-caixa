# Notificações por Push

**Para o app receber notificações, o serviço de push do Expo precisa de permissão para enviar pelo
Firebase Cloud Messaging (FCM) do projeto.** São três passos, feitos uma vez, no PC de quem
desenvolve: o projeto no Expo, uma conta de serviço do Google Cloud que só envia notificações e a
chave dela cadastrada no Expo. A chave nunca entra no Git.

O Expo serve só para as notificações: o APK continua saindo do `pnpm apk`, no PC, sem o EAS Build.

## 1. O projeto no Expo

1. Crie uma conta gratuita em [expo.dev](https://expo.dev), se ainda não tiver.
2. Em `apps/mobile`, entre e crie o projeto:

   ```sh
   npx eas-cli login
   npx eas-cli init
   ```

3. O `init` grava no `app.json` o id do projeto, em `extra.eas.projectId`. É com ele que o app pede
   ao Expo o endereço de push do celular. O id não é segredo e entra no Git.

## 2. A conta de serviço

A conta de serviço é um usuário do Google Cloud que o Expo usa para enviar pelo FCM. Ela recebe um
papel só, o de enviar notificações: se a chave vazar, ela não dá acesso ao banco.

1. No [Google Cloud Console](https://console.cloud.google.com/), escolha no topo o projeto do
   Firebase.
2. Menu → **IAM e administrador** → **Contas de serviço** → **Criar conta de serviço**.
3. Nome: `expo-push`. Avance.
4. Papel: **Firebase Cloud Messaging API Admin**, e só ele. Conclua.
5. Abra a conta criada → aba **Chaves** → **Adicionar chave** → **Criar nova chave** → **JSON**. O
   navegador baixa um arquivo `.json`: guarde-o fora da pasta do projeto.

O console do Firebase também gera uma chave, em Configurações do projeto → Contas de serviço, mas é a
do Admin SDK, que abre o projeto inteiro. Use a do passo 5.

## 3. A chave no Expo

O `npx eas-cli credentials` sobe a chave, mas exige um `eas.json`, o arquivo dos perfis do EAS
Build, que o projeto não usa: crie um só para isso e apague depois.

1. Em `apps/mobile`, crie o `eas.json` com um perfil vazio:

   ```json
   { "build": { "production": {} } }
   ```

2. Rode `npx eas-cli credentials` e escolha **Android** → **production** → **Google Service
   Account** → **Manage your Google Service Account Key for Push Notifications (FCM V1)** → **Set up
   a Google Service Account Key for Push Notifications (FCM V1)** → **Upload a new service account
   key**, com o caminho do `.json` do passo anterior. Recuse o que ele oferecer sobre keystore: o APK
   é assinado no PC, e a chave de assinatura não sai dele.
3. Apague o `eas.json` e o `.json` da chave. O Expo guarda a chave, e outra se gera quando precisar.

No site, em **Credentials** → **Android**, a opção do FCM pode não aparecer para um app que nunca
teve build pelo EAS; o terminal não depende disso.

## Conferir

- No console do Firebase → ⚙️ Configurações do projeto → **Cloud Messaging**, a "API Firebase Cloud
  Messaging (V1)" aparece como ativada. Num projeto novo, ela já vem assim.
- Com um APK que já tem as notificações, o celular aparece na coleção `pushTokens` do Firestore
  depois de aceitar o pedido de permissão.
