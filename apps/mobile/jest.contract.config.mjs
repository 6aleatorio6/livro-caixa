/*
 * Os testes de contrato: os serviços de verdade contra os emuladores do Firebase (skill
 * firestore-services). O React Native Firebase só roda no celular, então o SDK JavaScript do Firebase
 * faz o papel dele, com as mesmas funções, e as instâncias do app dão lugar às do projeto de teste.
 */
/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.contract.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/shared/testing/contract/contractSetup.ts'],
  // Todos os arquivos usam o mesmo projeto do emulador e apagam os dados entre os testes.
  maxWorkers: 1,
  testTimeout: 15000,
  moduleNameMapper: {
    '^@/shared/services/firebase/(firestoreDb|firebaseAuth|firebaseStorage)$':
      '<rootDir>/src/shared/testing/contract/firebase/$1.ts',
    '^@react-native-firebase/(firestore|auth)$': 'firebase/$1',
    // O `putFile` do RNFB não existe no SDK JavaScript: o módulo de teste o implementa.
    '^@react-native-firebase/storage$': '<rootDir>/src/shared/testing/contract/firebase/storage.ts',
    // O `File` do Expo lê o arquivo pelo módulo nativo: o módulo de teste o lê do disco.
    '^expo-file-system$': '<rootDir>/src/shared/testing/contract/expoFileSystem.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
