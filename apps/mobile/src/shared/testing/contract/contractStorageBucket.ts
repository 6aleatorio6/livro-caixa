import { CONTRACT_EMULATORS } from './contractEmulators';

/** O bucket do Storage do app dos contratos (`contractApp`) e de quem lê o emulador por fora dele. */
export const CONTRACT_STORAGE_BUCKET = `${CONTRACT_EMULATORS.projectId}.appspot.com`;
