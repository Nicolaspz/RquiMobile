import React, { useState, useContext, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, Modal, TextInput, Alert, StyleSheet, KeyboardAvoidingView, Platform, FlatList,Button, ScrollView, TouchableWithoutFeedback, Keyboard, 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../contexts/AuthContext";
import { api } from "../../services/api";

interface User {
  id: string;
  name: string;
  email?: string;
  telefone: string;
  tipo_pagamento?: string;
  role: string;
  user_name: string;
}

export default function Profile() {
  const { user, sigOut } = useContext(AuthContext);
  const navigation = useNavigation();

  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [newPasswordrepeat, setNewPasswordrepeat] = useState<string>("");

  const [newPhone, setNewPhone] = useState<string>("");
  const [newPayment, setNewPayment] = useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newRole, setNewRole] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string>("");

  useEffect(() => {
    if (user.role === "ADMIN") {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/all_users", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(response.data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os usuários.");
    }
  };

  const handleLogout = async () => {
    try {
      await sigOut();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
    }
  };

  const handleUpdateUser = async () => {
  if (!selectedUser) return;
    if (newPassword && newPassword !== newPasswordrepeat) {
    Alert.alert("As senhas não coincidem!");
    return;
  }
  // Criar objeto apenas com os campos preenchidos
  const updatedData: any = {};
  
  if (newPhone.trim()) updatedData.telefone = newPhone;
  if (newPayment.trim()) updatedData.tipo_pagamento = newPayment;
  if (newPassword.trim()) updatedData.password = newPassword;
  if (user.role === "ADMIN") {
    if (selectedUser.name.trim()) updatedData.name = selectedUser.name;
    if (selectedUser.email?.trim()) updatedData.email = selectedUser.email;
    if (selectedUser.role.trim()) updatedData.role = selectedUser.role;
  }

  try {
    await api.put(
      `/user?userId=${selectedUser.id}`,
      updatedData, // Enviar apenas os dados preenchidos
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    Alert.alert("Sucesso", "Usuário atualizado com sucesso!");
    fetchUsers();
    setModalVisible(false);
    setNewPassword("");
  } catch (error) {
    Alert.alert("Erro", "Não foi possível atualizar o usuário.");
  }
};

  return (
  
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      {user.role === "ADMIN" ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.userContainer}>
              <Text>{item.name}</Text>
              <TouchableOpacity onPress={() => { 
                setSelectedUser(item);
                setNewPhone(item.telefone);
                setNewUsername(item.user_name);
                setNewPayment(item.tipo_pagamento || "");
                setNewName(item.name);
                setNewEmail(item.email || "");
                setNewRole(item.role);
                setModalVisible(true);
              }} style={styles.button}>
                <Text style={styles.buttonText}>Alterar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <TouchableOpacity onPress={() => {
          setSelectedUser(user);
          setNewPhone(user.telefone);
          setNewUsername(user.user_name);
          setModalVisible(true);
        }} style={styles.button}>
          <Text style={styles.buttonText}>Alterar Perfil</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handleLogout} style={[styles.button, { backgroundColor: "red", marginTop: 20 }]}> 
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alterar Usuário</Text>
            <View>
              <Text>Telefone</Text>
            <TextInput placeholder="Telefone" style={styles.input} value={newPhone} onChangeText={setNewPhone} />
              
            </View>
            <View>
              <Text>Usuário</Text>
            <TextInput placeholder="Username" style={styles.input} value={newUsername} onChangeText={setNewUsername} />
            </View>
            <View>
              <Text>Nova senha</Text>
              <TextInput placeholder="Nova Senha" secureTextEntry style={styles.input} value={newPassword} onChangeText={setNewPassword} />
            </View>
            <View>
              <Text>Repetir senha</Text>
              <TextInput placeholder="Nova Senha" secureTextEntry style={styles.input} value={newPasswordrepeat} onChangeText={setNewPasswordrepeat} />
            </View>
            {user.role === "ADMIN" && (
              <>
                <View>
                  <Text>Nome</Text>
                <TextInput placeholder="Nome" style={styles.input} value={newName} onChangeText={setNewName} />

                </View>
                <View>
                  <Text>Email</Text>
                <TextInput placeholder="Email" style={styles.input} value={newEmail} onChangeText={setNewEmail} />

                </View>
                <View>
                  <Text>Perfil</Text>
                  <Picker selectedValue={newRole} onValueChange={setNewRole}>
                  <Picker.Item label="ADMIN" value="ADMIN" />
                  <Picker.Item label="CLIENTE" value="CLIENT" />
                </Picker>
                </View>
                
                <View>
                  <Text>Tipo de Pagamento</Text>
                  <Picker selectedValue={newPayment} onValueChange={setNewPayment}>
                  <Picker.Item label="Selecionar a forma de Pagamento" value="" />
                  <Picker.Item label="CONTA 3 DIAS" value="CONTA_3DIAS" />
                  <Picker.Item label="CONTA 7 DIAS" value="CONTA_7DIAS" />
                  <Picker.Item label="CONTA 15 DIAS" value="CONTA_15DIAS" />
                  <Picker.Item label="CONTA 30 DIAS" value="CONTA_30DIAS" />
                  <Picker.Item label="CONTA 24H" value="CONTA_24H" />
                </Picker>
                </View>
                
              </>
            )}
            <View style={{display:"flex", flexDirection:"row"}}>
              <TouchableOpacity style={[styles.buttonModal, { backgroundColor: "#3fffa3" }]} onPress={handleUpdateUser}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonModal, { backgroundColor: "gray" }]} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5"
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "bold"
  },
  userContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 5
  },
  button: {
    backgroundColor: "#3fffa3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center"
  },
  buttonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",

  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 5,
    marginBottom: 5
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  buttonModal: {
    width: "48%",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    margin:4
  }
});
