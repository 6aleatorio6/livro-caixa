// O plugin do Unistyles reescreve os StyleSheets de src/ para que o tema troque sem renderizar de
// novo. O preset do Expo precisa vir declarado no app: com o pnpm isolado, ele não sobe da
// dependência do expo.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [['react-native-unistyles/plugin', { root: 'src' }]],
  };
};
