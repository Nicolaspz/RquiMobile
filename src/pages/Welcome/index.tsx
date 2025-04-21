import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from "../../contexts/AuthContext";

interface WelcomeProps {
  onStart: () => void;
}

export default function Welcome({ onStart }: WelcomeProps) {
  const { user,sigOut } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await sigOut();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
    }
  };
  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo(a), {user?.name}!</Text>
      <Text style={styles.subtitle}>Seu login foi realizado com sucesso.</Text>

      <TouchableOpacity style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>Começar !!</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout} > 
              <Text style={{'color':'red', 'padding':'10','marginTop':10}}>Sair</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1d1d2e',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#f5f7fb',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3fffa3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#3c3c3c',
    fontSize: 16,
    fontWeight: 'bold',
  }
});