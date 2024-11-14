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
  Alert
} from "react-native";
import { AuthContext } from "../../contexts/AuthContext";
import { api } from "../../services/api";
import Checkbox from 'expo-checkbox';

export default function SignIn() {
  const { signIn, signUp, sigOut } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);

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

  interface User {
    name: string;
    redes: string; // Incluindo `redes` no tipo User
    email: string;
    role: string;
    telefone: string;
    tipo_pagamento: string;
    nif: string;
    morada: string;
    user_name: string;
  }

  async function handleLogin() {
    if (credential === '' || password === '') {
      return;
    }
    await signIn({ credential, password });
  }

  // Manipula a seleção de redes de comunicação
  const toggleRedesSelection = (key: keyof typeof redesSelecionadas) => {
    setRedesSelecionadas(prev => ({ ...prev, [key]: !prev[key] }));
  };

  async function handleRegister() {
    if (!name || !email || !telefone || !tipoPagamento) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    // Converte as opções selecionadas em uma lista de redes
    const redesSelecionadasArray = Object.keys(redesSelecionadas).filter(
      (key) => redesSelecionadas[key as keyof typeof redesSelecionadas]
    );
    const redes = redesSelecionadasArray.join(', '); // Transforma o array em uma string separada por vírgula

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

    try {
      const response = await api.post<User>('/users', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Usuário criado com sucesso:', response.data);
      Alert.alert('Sucesso', 'Usuário registrado com sucesso! Aguarde pela sua senha, entraremos em contacto');
      setIsRegister(false);
    } catch (error: any) {
      console.error('Erro ao registrar', error.response?.data || error.message);
      Alert.alert('Erro', 'Erro ao registrar usuário. Tente novamente.');
    }
  }

  return (
    <View style={styles.container}>
      <Image
        style={isRegister ? styles.registerLogo : styles.loginLogo}
        source={isRegister ? require('../../assets/raqui.png') : require('../../assets/test.jpg')}
      />

      <View style={styles.inputContainer}>
        {isRegister ? (
          <>
            <TextInput
              placeholder="Digite seu nome ou empresa"
              style={styles.input}
              placeholderTextColor="#000"
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
              placeholder="Digite nome de usuário"
              style={styles.input}
              placeholderTextColor="#000"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              placeholder="Digite seu telefone"
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
              <Text style={styles.buttonText}>Registrar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsRegister(false)}>
              <Text style={styles.toggleText}>Já tem uma conta? Acessar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              placeholder="Digite o email ou telefone"
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
              <Text style={styles.buttonText}>Entrar</Text>
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
    width: 150,
    height: 150,
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
  
});
