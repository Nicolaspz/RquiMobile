import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {

  const handleLogin = () => {
    // Aqui você pode adicionar a lógica de navegação para a tela de login
     navigation.navigate('SignIn');
  };

  const handleOpenMenu = () => {
    // Aqui você pode adicionar a lógica para abrir o menu, por exemplo, escanear um QR code
   navigation.navigate('QrCodeScanner')
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Restaurante</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Logar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleOpenMenu}>
        <Text style={styles.buttonText}>Abrir Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    width: '80%',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
