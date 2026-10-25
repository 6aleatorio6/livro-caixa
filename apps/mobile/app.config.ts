import type { ConfigContext } from 'expo/config';

import packageJson from './package.json';

// O resto da configuração está no app.json. Só a versão vem daqui, do package.json, a mesma que o app
// mostra (`APP_VERSION`): ela muda num lugar só.
export default ({ config }: ConfigContext) => ({ ...config, version: packageJson.version });
