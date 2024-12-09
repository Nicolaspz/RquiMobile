import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator
} from "react-native";
import { AuthContext } from "../../contexts/AuthContext";
import { api } from "../../services/api";
import Toast from 'react-native-toast-message';
import Checkbox from 'expo-checkbox';

export default function SignIn() {
  const { signIn, signUp, sigOut } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado para controle do carregamento

  const [name, setName] = useState('');
  const [credential, setCredential] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipoPagamento, setTipoPagamento] = useState('CONTA_3DIAS');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const tipoPagamentoOptions = ["CONTA_3DIAS", "CONTA_7DIAS", "CONTA_15DIAS","CONTA_30DIAS"];

  // Opções para redes de comunicação
  const [redesSelecionadas, setRedesSelecionadas] = useState({
    whatsapp: false,
    chamada: false,
    telegram: false,
  });
  interface ApiError {
  error?: string; // A propriedade error é opcional
}

  interface User {
    name: string;
    redes: string;
    email?: string;
    role: string;
    telefone: string;
    tipo_pagamento: string;
    nif: string;
    morada: string;
    user_name: string;
  }

   async function handleLogin() {
     if (credential === '' || password === '') {
    Toast.show({
    type: 'error',  // Pode ser 'success', 'error', 'info'
    text1: 'Erro',  // Título
    text2: 'Por favor, preencha todos os campos.',  // Mensagem
  });
    return;
  }

  setIsLoading(true); // Ativa o carregamento
  try {
    await signIn({ credential, password });
  } catch (err) {
    
    const error = err as ApiError; // Faz um cast para o tipo esperado
    const errorMessage = error.error || 'Falha ao fazer login. Tente novamente.';
    //Alert.alert('Erro', errorMessage); // Exibe o erro no alerta
    Toast.show({
    type: 'error',  // Pode ser 'success', 'error', 'info'
    text1: 'Erro',  // Título
    text2: errorMessage,  // Mensagem
  });
  } finally {
    setIsLoading(false); // Desativa o carregamento
  }
}



  const toggleRedesSelection = (key: keyof typeof redesSelecionadas) => {
    setRedesSelecionadas(prev => ({ ...prev, [key]: !prev[key] }));
  };

  async function handleRegister() {
    if (!name || !telefone || !tipoPagamento || !redesSelecionadas) {
      Toast.show({
    type: 'error',  // Pode ser 'success', 'error', 'info'
    text1: 'Erro',  // Título
    text2: 'Preencha todos os campos obrigatórios.',  // Mensagem
  });
      
      return;
    }

    const redesSelecionadasArray = Object.keys(redesSelecionadas).filter(
      (key) => redesSelecionadas[key as keyof typeof redesSelecionadas]
    );
    const redes = redesSelecionadasArray.join(', ');

    const userData: User = {
      name,
      email,
      role: 'CLIENT',
      telefone,
      tipo_pagamento: tipoPagamento,
      nif,
      morada: endereco,
      user_name: username,
      redes
    };

    setIsLoading(true); // Ativa o carregamento

    try {
      const response = await api.post<User>('/users', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
       Toast.show({
    type: 'success',  // Pode ser 'success', 'error', 'info'
    text1: 'Sucesso',  // Título
    text2: 'Usuário registrado com sucesso!',  // Mensagem
  });
      //Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
      setIsRegister(false);
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao registrar usuário. Tente novamente.');
      
    } finally {
      setIsLoading(false); // Desativa o carregamento
    }
  }

  return (
    <View style={styles.container}>
      <Image
        style={isRegister ? styles.registerLogo : styles.loginLogo}
        source={require('../../assets/raqi.png')}
      />

      <View style={styles.inputContainer}>
        {isRegister ? (
          <>
            <TextInput
              placeholder="Digite seu nome ou empresa*"
              style={styles.input}
              placeholderTextColor="black"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              placeholder="Digite seu email"
              style={styles.input}
              placeholderTextColor="#000"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              placeholder="Digite nome de usuário*"
              style={styles.input}
              placeholderTextColor="#000"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              placeholder="Digite seu telefone*"
              style={styles.input}
              placeholderTextColor="#000"
              value={telefone}
              onChangeText={setTelefone}
            />
            <TextInput
              placeholder="Digite o Nif"
              style={styles.input}
              placeholderTextColor="#000"
              value={nif}
              onChangeText={setNif}
            />
            <TextInput
              placeholder="Digite o seu Endereço"
              style={styles.input}
              placeholderTextColor="#000"
              value={endereco}
              onChangeText={setEndereco}
            />
            <TouchableOpacity
              style={styles.select}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.selectText}>{tipoPagamento}</Text>
            </TouchableOpacity>

            <View style={styles.checkboxContainer}>
              <Text style={styles.checkboxLabel}>Selecione o meio de comunicação:</Text>
              <View style={styles.checkboxRow}>
                <Checkbox
                  value={redesSelecionadas.whatsapp}
                  onValueChange={() => toggleRedesSelection('whatsapp')}
                />
                <Text style={styles.checkboxText}>WhatsApp</Text>
              </View>
              <View style={styles.checkboxRow}>
                <Checkbox
                  value={redesSelecionadas.chamada}
                  onValueChange={() => toggleRedesSelection('chamada')}
                />
                <Text style={styles.checkboxText}>Chamada</Text>
              </View>
              <View style={styles.checkboxRow}>
                <Checkbox
                  value={redesSelecionadas.telegram}
                  onValueChange={() => toggleRedesSelection('telegram')}
                />
                <Text style={styles.checkboxText}>Telegram</Text>
              </View>
            </View>
            
            <Modal
              transparent={true}
              visible={modalVisible}
              animationType="slide"
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                
                <View style={styles.modalContent}>
                   <Text style={styles.modalTitle}>Selecione o tipo de conta:</Text>
                  <FlatList
                    data={tipoPagamentoOptions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.option}
                        onPress={() => {
                          setTipoPagamento(item);
                          setModalVisible(false);
                        }}
                      >
                        
                        <Text style={styles.optionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </Modal>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Registrar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsRegister(false)}>
              <Text style={styles.toggleText}>Já tem uma conta? Acessar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              placeholder="Usuário"
              style={styles.input}
              placeholderTextColor="#000"
              value={credential}
              onChangeText={setCredential}
            />
            <TextInput
              placeholder="Sua senha"
              style={styles.input}
              placeholderTextColor="#000"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsRegister(true)}>
              <Text style={styles.toggleText}>Não tem uma conta? Registrar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  logo: {
    marginBottom: 12,
    width: 140,
    height: 140,
  },
  inputContainer: {
    width: '95%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 14,
  },
  loginLogo: {
    marginBottom: 12,
    width: 350,
    height: 190,
  },
  registerLogo: {
    marginBottom: 12,
    width: 160,
    height: 90,
  },
  input: {
    width: '95%',
    height: 40,
    backgroundColor: '#1af344',
    marginBottom: 12,
    borderRadius: 4,
    paddingHorizontal: 8,
    color: '#000',
    fontSize:16,
  },
  select: {
    width: '95%',
    height: 40,
    backgroundColor: '#1af344',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 4,
  },
  selectText: {
    color: '#000',
  },
  button: {
    width: '95%',
    height: 40,
    backgroundColor: '#0000ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  toggleText: {
    color: '#3b9aff',
    marginTop: 12,
    fontSize: 16,
    textDecorationLine: 'underline'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#101026',
  },
  checkboxContainer: { marginBottom: 20 },
  checkboxLabel: { fontSize: 16, marginBottom: 8 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkboxText: { marginLeft: 8, fontSize: 16 },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10, // Espaço entre o título e a lista
    textAlign: 'center',
  },
  
});
