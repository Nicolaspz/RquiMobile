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
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform
} from "react-native";
import { AuthContext } from "../../contexts/AuthContext";
import { api } from "../../services/api";
import Toast from 'react-native-toast-message';
import Checkbox from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import {Picker} from '@react-native-picker/picker';

export default function SignIn() {
  const { signIn, signUp, sigOut } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado para controle do carregamento
  const [name, setName] = useState('');
  const [credential, setCredential] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipoPagamento, setTipoPagamento] = useState('');
  const [password, setPassword] = useState('');
   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
 const [isChecked, setChecked] = useState(false);
 



  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  // Opções para redes de comunicação
  const [redesSelecionadas, setRedesSelecionadas] = useState<{ [key: string]: boolean }>({
    chamada: false,
    sms: false,
    whatsapp: false,
    telegram: false,
    outro: false,
  });

  // Alterna o estado apenas da opção selecionada
  const toggleRedesSelection = (tipo: string) => {
    setRedesSelecionadas((prev) => ({
      ...prev,
      [tipo]: !prev[tipo], // Alterna entre true/false apenas para o item clicado
    }));
  };

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
     <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
      <Image
        style={isRegister ? styles.registerLogo : styles.loginLogo}
        source={require('../../assets/raqi.png')}
      />

      <View style={styles.inputContainer}>
        {isRegister ? (
          <>
            <TextInput
              placeholder="nome/empresa*"
              style={styles.input}
              placeholderTextColor="#ccc"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              placeholder="email*"
              style={styles.input}
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              placeholder="nome de utilizador*"
              style={styles.input}
              placeholderTextColor="#ccc"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              placeholder="telefone*"
              style={styles.input}
              placeholderTextColor="#ccc"
              value={telefone}
              onChangeText={setTelefone}
            />
            <TextInput
              placeholder="Nif"
              style={styles.input}
              placeholderTextColor="#ccc"
              value={nif}
              onChangeText={setNif}
            />
            <TextInput
              placeholder="Zona de operação"
              style={styles.input}
              placeholderTextColor="#ccc"
              value={endereco}
              onChangeText={setEndereco}
            />
            <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipoPagamento}
          onValueChange={(itemValue) => setTipoPagamento(itemValue)}
          style={styles.picker} // Apenas estilos suportados pelo Picker
        >
          <Picker.Item label="Selecionar a forma de Pagamento" value="" />
          <Picker.Item label="CONTA 3 DIAS" value="CONTA_3DIAS" />
          <Picker.Item label="CONTA 7 DIAS" value="CONTA_7DIAS" />
          <Picker.Item label="CONTA 15 DIAS" value="CONTA_15DIAS" />
          <Picker.Item label="CONTA 30 DIAS" value="CONTA_30DIAS" />
          <Picker.Item label="CONTA 24H" value="24H" />
        </Picker>
      </View>
    

    <View style={styles.container2}>
      <Text style={styles.title}>Selecione a preferência de contato:</Text>

      {Object.keys(redesSelecionadas).map((tipo) => (
        <View key={tipo} style={styles.checkboxRow}>
          <Checkbox
            color={isChecked ? '#1af344' : undefined}
            value={redesSelecionadas[tipo]}
            onValueChange={() => toggleRedesSelection(tipo)}
          />
          <Text style={styles.checkboxText}>
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </Text>
        </View>
      ))}
      </View>
           
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Registrar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsRegister(false)}>
              <Text style={styles.toggleText}>Entrar </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.inputWithIcon}>
            <TextInput
              placeholder="Utitlizador/Telefone"
              style={styles.input2}
              placeholderTextColor="#ccc"
              value={credential}
              onChangeText={setCredential}
            />
             <View style={styles.responsive}>
                <TextInput
                  style={styles.input1}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Senha"
                  placeholderTextColor="#ccc"
                  secureTextEntry={!isPasswordVisible} // Alterna entre mostrar ou ocultar
                />
                <TouchableOpacity
                  style={styles.iconContainer}
                  onPress={togglePasswordVisibility}
                >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off' : 'eye'} // Ícone muda dinamicamente
                  size={24}
                  color="#333"
                  style={styles.iconStile}
                />
                </TouchableOpacity>      
            </View>
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Entrar</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsRegister(true)}>
                  <Text style={styles.toggleText}>Criar Conta</Text>
                </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputWithIcon: {
  width: '95%',
  marginBottom: 12,
},
responsive: {
  flexDirection: "row", // Ícone ao lado do input
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1af344",
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  tamanho: {
    borderWidth: 1,
    borderColor: "#000",
    
  },
  input1: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#444",
    
  },
  input2: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#1af344",
    marginBottom: 12,
    borderRadius:10,
    paddingHorizontal: 8,
    color: "#444",
    fontSize: 16,
    padding: 10,
  },
input: {
    width: '95%',
    height: 40,
    borderWidth: 1,
    borderColor: "#1af344",
    marginBottom: 12,
    borderRadius: 4,
    paddingHorizontal: 8,
    color: "#444",
    fontSize:16,
    textAlign:"justify"
  }, 
iconContainer: {
  padding: 10,
},
iconStile:{},
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
  select: {
    width: '100%',
    height: 40,
    backgroundColor: '#1af344',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 4,
  },
  selectText: {
    color: '#0000ff',
  },
  button: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    borderColor:'#0000ff',
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
    width: '95%',
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
    color: '#1af344',
    textAlign: 'center',
    borderRadius: 20,
    borderWidth:1,
    borderColor: '#ccc',
    
    
  },
  checkboxContainer: { marginBottom: 20 },
  checkboxLabel: { fontSize: 16, marginBottom: 8 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 , color:'#1af344' },
  checkboxText: { marginLeft: 8, fontSize: 16, color:'#3c3c3c' },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10, // Espaço entre o título e a lista
    textAlign: 'center',
  },
  //
  container2: {
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color:'#3b9aff',
  },
  picker: {
    height: 50,
    width: "95%",
    borderWidth: 1,
    borderColor: "#1af344",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 4,
    textAlign: 'center',
    color:"#444",
  },
  pickerItem: {
    textAlign: 'center', // Funciona apenas no iOS
    fontSize: 16, 
  },
  pickerContainer: {
    width: '95%',
    borderWidth: 1,
    borderColor: '#1af344',
    borderRadius: 4,
    backgroundColor: '#fff',
    overflow: 'hidden', // Garante que o borderRadius funcione
  },
  /*picker: {
    width: '100%', 
    height: 50,
    color: '#444', // Cor do texto dentro do Picker
    fontSize: 16, // Tamanho da fonte dentro do Picker (pode não funcionar em alguns dispositivos)
  },*/
  
});
