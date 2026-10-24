// Tira o `EMAIL` da lista de e-mails permitidos com o app aberto, como quem administra faria. O
// endereço dos documentos vem de `output.firestoreDocumentsUrl`, que o `resetData.js` grava.
const response = http.request(`${output.firestoreDocumentsUrl}/allowedEmails/${encodeURIComponent(EMAIL)}`, {
  method: 'DELETE',
  headers: { Authorization: 'Bearer owner' },
});
if (response.status < 200 || response.status >= 300) {
  throw new Error(`Tirar ${EMAIL} da lista falhou: ${response.status} ${response.body}`);
}
