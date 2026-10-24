// Tira a marca de admin do `EMAIL` com o app aberto, como quem administra faria. Só o campo `isAdmin`
// muda (`updateMask`): o nome e o resto do documento ficam. O endereço dos documentos vem de
// `output.firestoreDocumentsUrl`, que o `resetData.js` grava.
const response = http.request(
  `${output.firestoreDocumentsUrl}/allowedEmails/${encodeURIComponent(EMAIL)}?updateMask.fieldPaths=isAdmin`,
  {
    method: 'PATCH',
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { isAdmin: { booleanValue: false } } }),
  },
);
if (response.status < 200 || response.status >= 300) {
  throw new Error(`Tirar a marca de admin de ${EMAIL} falhou: ${response.status} ${response.body}`);
}
