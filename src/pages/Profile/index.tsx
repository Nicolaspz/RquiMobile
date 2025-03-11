import React, { useState, useContext } from "react";
import { 
  View, Text, TouchableOpacity, Modal, TextInput, Alert, StyleSheet, KeyboardAvoidingView, Platform 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../contexts/AuthContext";
import { api } from "../../services/api";

export default function Profile() {
  const { user, sigOut } = useContext(AuthContext);
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogout = async () => {
    try {
      await sigOut();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
    }
  };

    const handleChangePassword = async () => {
      if (!currentPassword || !newPassword) {
        Alert.alert("Erro", "Preencha todos os campos!");
        return;
      }

      try {
        const user_id = user.id; // Pegue o ID do usuário dinamicamente

        // Chamada à API com user_id na URL
       await api.put(`/change-password?user_id=${user_id}`, 
        { oldPassword: currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

        Alert.alert("Sucesso", "Senha alterada com sucesso!");
        await sigOut();
        //setModalVisible(false); // Fecha o modal
      } catch (error: any) {
        Alert.alert("Erro", error.response?.data?.message || "Não foi possível alterar a senha.");
      }
    };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      {/* Botão para abrir o modal de alterar senha */}
      <TouchableOpacity 
        onPress={() => setModalVisible(true)} 
        style={styles.button}
      >
        <Text style={styles.buttonText}>Alterar Senha</Text>
      </TouchableOpacity>

      {/* Botão de Logout */}
      <TouchableOpacity 
        onPress={handleLogout} 
        style={[styles.button, { backgroundColor: "red" }]}
      >
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

      {/* Modal de Alteração de Senha */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alterar Senha</Text>

            <TextInput
              placeholder="Senha Atual"
              secureTextEntry
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <TextInput
              placeholder="Nova Senha"
              secureTextEntry
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.buttonModal, { backgroundColor: "#3fffa3" }]} 
                onPress={handleChangePassword}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.buttonModal, { backgroundColor: "gray" }]} 
                onPress={() => setModalVisible(false)}
              >
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
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#3fffa3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    width: 150,
    alignItems: "center",
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  buttonModal: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5, // Espaço entre os botões
  },
});
