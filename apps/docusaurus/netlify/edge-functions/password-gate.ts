import type { Config, Context } from '@netlify/edge-functions';

/**
 * Portão de senha para todo o portal.
 *
 * Roda na borda do CDN, antes de qualquer arquivo estático ser servido — por isso
 * protege também bundles JS, imagens e sitemap.xml, e não só as páginas HTML.
 *
 * A senha vem da variável de ambiente DOCS_PASSWORD (escopo `Functions`),
 * configurada no painel da Netlify. Nunca vai para o Git.
 */

/** Extrai a senha de um header `Authorization: Basic base64(usuario:senha)`. */
function extractPassword(header: string | null): string | null {
  if (!header) return null;

  const [scheme, encoded] = header.split(' ');
  if (scheme?.toLowerCase() !== 'basic' || !encoded) return null;

  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return null;
  }

  // O usuário é ignorado: só a senha importa. O prompt do navegador pede os dois
  // porque é assim que o HTTP Basic Auth funciona.
  const separator = decoded.indexOf(':');
  return separator === -1 ? '' : decoded.slice(separator + 1);
}

/** Comparação em tempo constante, para não vazar a senha por medição de tempo. */
function safeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bytesA = encoder.encode(a);
  const bytesB = encoder.encode(b);

  // Compara sempre o mesmo número de bytes; a diferença de tamanho vira só mais um bit.
  let diff = bytesA.length ^ bytesB.length;
  const length = Math.max(bytesA.length, bytesB.length);
  for (let i = 0; i < length; i += 1) {
    diff |= (bytesA[i] ?? 0) ^ (bytesB[i] ?? 0);
  }

  return diff === 0;
}

function unauthorized(): Response {
  return new Response('Acesso restrito.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Documentacao restrita", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
      // Impede que o CDN guarde a negativa.
      'Cache-Control': 'no-store',
    },
  });
}

export default async (request: Request, context: Context): Promise<Response | void> => {
  const expected = Netlify.env.get('DOCS_PASSWORD');

  // Falha fechada: sem a variável configurada o portal responde 503 em vez de
  // ficar público. Esquecer a variável nunca expõe a documentação.
  if (!expected) {
    return new Response(
      'Portal indisponível: a variável DOCS_PASSWORD não está configurada.',
      {
        status: 503,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      },
    );
  }

  const provided = extractPassword(request.headers.get('authorization'));
  if (provided === null || !safeEqual(provided, expected)) {
    return unauthorized();
  }

  return context.next();
};

export const config: Config = {
  path: '/*',
};
