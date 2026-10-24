import { setLocale } from 'yup';

// As mensagens do Yup em pt-BR, para todo schema do app. Um campo que precisa de outra mensagem a
// passa no próprio schema.
setLocale({
  mixed: { required: 'Preencha este campo.' },
  string: {
    email: 'Digite um e-mail válido.',
    min: ({ min }) => `Use pelo menos ${min} caracteres.`,
    max: ({ max }) => `Use no máximo ${max} caracteres.`,
  },
  number: {
    min: ({ min }) => `O valor mínimo é ${min}.`,
    max: ({ max }) => `O valor máximo é ${max}.`,
  },
});
