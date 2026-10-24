import { StyleSheet, Text, View } from 'react-native';

// Tela provisória: some quando o login e o Início entrarem.
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Livro-Caixa</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
