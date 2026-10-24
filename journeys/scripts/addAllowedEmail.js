// Põe o `EMAIL` na lista de e-mails permitidos com o app aberto, como quem administra faria: com o
// `NAME` e sem a marca de admin. O endereço dos documentos vem de `output.firestoreDocumentsUrl`,
// que o `resetData.js` grava.
const response = http.request(`${output.firestoreDocumentsUrl}/allowedEmails/${encodeURIComponent(EMAIL)}`, {
  method: 'PATCH',
  headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fields: {
      name: { stringValue: NAME },
      isAdmin: { booleanValue: false },
      hasEntries: { booleanValue: false },
    },
  }),
});
if (response.status < 200 || response.status >= 300) {
  throw new Error(`Liberar ${EMAIL} falhou: ${response.status} ${response.body}`);
}
