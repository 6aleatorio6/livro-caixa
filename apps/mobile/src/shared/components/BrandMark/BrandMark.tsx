import { Image } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import markDark from '@/assets/images/sign-in-mark-dark.png';
import markLight from '@/assets/images/sign-in-mark.png';
import { AppText } from '@/shared/components/AppText/AppText';
import { Decorative } from '@/shared/components/Decorative/Decorative';

/**
 * A marca do app: o desenho, na versão do tema, e o nome "Livro-Caixa". É um fragmento: os dois ficam irmãos na coluna
 * da tela, que decide o espaço entre eles e em volta.
 */
export function BrandMark() {
  const { rt } = useUnistyles();

  return (
    <>
      <Decorative>
        <Image source={rt.themeName === 'dark' ? markDark : markLight} style={styles.mark} />
      </Decorative>
      <AppText variant="displaySmallEmphasized">Livro-Caixa</AppText>
    </>
  );
}

const styles = StyleSheet.create({
  mark: { width: 96, height: 96 },
});
