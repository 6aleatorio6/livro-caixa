// Roda no Maestro (`runScript`): pede o cenário `SCENARIO` ao servidor de dados (`data/server.ts`) e
// copia a resposta para o `output` — o `reset` devolve as contas em `output.accounts`.
// O script não enxerga a lista das variáveis que recebe: cada parâmetro que um cenário lê entra aqui
// pelo nome, e no `ScenarioParams` do `data/scenarios.ts`.
if (typeof MAESTRO_DATA_URL === 'undefined') {
  throw new Error('Falta MAESTRO_DATA_URL: os fluxos rodam pelo `pnpm journeys:test`, que liga o servidor de dados.');
}

const params = {
  EMAIL: typeof EMAIL === 'undefined' ? undefined : EMAIL,
  FILE: typeof FILE === 'undefined' ? undefined : FILE,
  COLD: typeof COLD === 'undefined' ? undefined : COLD,
};
const response = http.post(`${MAESTRO_DATA_URL}/${SCENARIO}`, {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(params),
});
if (response.status < 200 || response.status >= 300) {
  throw new Error(`O cenário ${SCENARIO} falhou: ${response.status} ${response.body}`);
}
Object.assign(output, JSON.parse(response.body));
