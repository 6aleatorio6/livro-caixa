/**
 * Se o erro do Firebase é a recusa das regras. O React Native Firebase prefixa o produto
 * (`firestore/permission-denied`) e o SDK JavaScript dos contratos não (`permission-denied`).
 */
export function isPermissionDenied(error: unknown) {
  const code = (error as { code?: string } | null)?.code;
  return code === 'firestore/permission-denied' || code === 'permission-denied';
}
