// Os PNG entram no código como import: o Metro entrega o `source` que o `Image` aceita.
declare module '*.png' {
  import type { ImageSourcePropType } from 'react-native';

  const source: ImageSourcePropType;
  export default source;
}
