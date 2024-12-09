import React, { useState, useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, FlatList, TextInput, Modal, TouchableWithoutFeedback, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackPramsList } from "../../routes/app.routes";
import { api } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

//const socket = io("https://raqui.vercel.app"); 
/*const socket = io('wss://raqui.vercel.app', {
  transports: ['websocket'],
});*/
type Pedido = {
  id: string;
  descricao: string;
  status: string;
  Interacao: Interacao[];
  tipo: string;
  usuario: {
    proces_number: string;
    tipo_pagamento: string;
  };
};

type Interacao = {
  id: string;
  conteudo: string;
  autorId: string;
  servicoId: string;
  criado_em: string;
  tipo: string;
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<NativeStackNavigationProp<StackPramsList>>();
  const [newInteractionContent, setNewInteractionContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  if (user && user.role) {
    async function fetchOrders() {
      setIsLoading(true); // Ativa o carregamento
      try {
        const url = user.role === "ADMIN" ? "/pedidos" : `/pedido_user/${user.id}`;
        const response = await api.get(url, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const filteredOrders = response.data.filter((order: Pedido) => order.status === "PENDENTE");
        setOrders(filteredOrders);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      } finally {
        setIsLoading(false); // Desativa o carregamento
      }
    }

    // Chama a função de busca ao carregar o componente
    fetchOrders();
  }
}, [user, orders]); // Apenas depende de 'user' porque o 'user' não muda



  function toggleExpand(orderId: string) {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  }

   async function handleAddInteraction(orderId: string) {
    if (!newInteractionContent) {
      alert('Por favor, insira o conteúdo da interação.');
      return;
    }

    try {
      const response = await api.post('/interacoes', {
        conteudo: newInteractionContent,
        autorId: user.id,
        servicoId: orderId,
        tipo: user.role,
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      

      if (response.status === 201) {
        //alert('Interação adicionada com sucesso!');
        
        setNewInteractionContent("");
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, Interacao: [...order.Interacao, response.data] } : order
        ));
      } else {
       
         Toast.show({
                  type: 'error',  // Pode ser 'success', 'error', 'info'
                  text1: 'Erro',  // Título
                  text2: 'Erro ao adicionar Tenta novamente. se persistir contacte o suporte',  // Mensagem
                });
      }
    } catch (error) {
      //console.error("Erro na requisição:", error);
      alert('Ocorreu um erro inesperado. Tente novamente.');
    }
  }

  const renderOrderItem = ({ item }: { item: Pedido }) => (
  <View style={styles.orderContainer}>
    {/* Exibe o tipo de serviço em destaque com o mesmo estilo da descrição */}
      {item.tipo && <Text style={styles.serviceType}><FontAwesome name="motorcycle" size={20} color="#3fffa3" style={styles.serviceIcon} /> {item.tipo}</Text>}
    <Text style={styles.orderDescription}>Nº: {item.usuario.proces_number}  {item.usuario.tipo_pagamento}</Text>
    <Text style={styles.orderDescription}>{item.descricao}</Text>
    <TouchableOpacity onPress={() => toggleExpand(item.id)}>
      <FontAwesome
        name={expandedOrderId === item.id ? "eye-slash" : "eye"} // Altera o ícone conforme o estado expandido
        size={28}
        color="#3fffa3"
        style={styles.expandIcon}
      />
    </TouchableOpacity>
    {expandedOrderId === item.id && (
      <View>
        {item.Interacao.map((interacao) => (
          <View
            key={interacao.id}
            style={[
              styles.interactionContainer,
              interacao.tipo === "ADMIN" ? styles.adminInteraction : styles.clientInteraction,
            ]}
          >
            <Text style={styles.interactionText}>{interacao.conteudo}</Text>
            <Text style={styles.interactionDate}>{new Date(interacao.criado_em).toLocaleString()}</Text>
          </View>
        ))}
        {item.status === "PENDENTE" &&
                ((user.role === "ADMIN") || // Admin sempre pode interagir
                  (user.role !== "ADMIN" && item.Interacao.length > 0)) && ( // Outros usuários precisam de pelo menos uma interação
                  <View style={styles.newInteractionContainer}>
                    <TextInput
                      style={styles.newInteractionInput}
                      multiline={true} 
                      placeholder="Escreva uma nova interação"
                      placeholderTextColor="#888"
                      value={newInteractionContent}
                      onChangeText={setNewInteractionContent}
                    />
                    <TouchableOpacity
                      style={styles.sendButton}
                      onPress={() => handleAddInteraction(item.id)}
                    >
                      <Text style={styles.sendButtonText}>Enviar</Text>
                    </TouchableOpacity>
                  </View>
                )}

        {/* Botão para fechar o pedido visível apenas para administradores */}
        {user.role === "ADMIN" && (
          <TouchableOpacity
            style={styles.closeOrderButton}
            onPress={() => confirmAndCloseOrder(item.id)}
          >
            <Text style={styles.closeOrderButtonText}>Fechar a Interção</Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
);

  async function confirmAndCloseOrder(orderId: string) {
  Alert.alert(
    "Confirmar Ação",
    "Tem certeza de que deseja fechar este pedido?",
    [
      {
        text: "Cancelar",
        style: "cancel", // Estiliza como botão de cancelamento
      },
      {
        text: "Fechar Pedido",
        onPress: () => closeOrder(orderId), // Chama a função closeOrder ao confirmar
      },
    ],
    { cancelable: true } // Permite que o alerta seja fechado ao clicar fora dele
  );
}

async function closeOrder(orderId: string) {
  try {
    const response = await api.put('/pedido', 
      {
        id: orderId,
        status: 'CONCLUIDO',
      },
      {
        headers: { Authorization: `Bearer ${user.token}` }, // Inclui o token do usuário
      }
    );

    if (response.status === 200 || response.status === 201) {
      Toast.show({
        type: 'Sucess',  // Pode ser 'success', 'error', 'info'
        text1: 'Sucesso',  // Título
        text2: 'Pedido fechado com sucesso!',  // Mensagem
      });
      //alert('Pedido fechado com sucesso!');
      // Aqui você pode atualizar a lista de pedidos localmente, se necessário
      // Exemplo: setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'CONCLUIDO' } : order));
    } else {
      Toast.show({
        type: 'error',  // Pode ser 'success', 'error', 'info'
        text1: 'Erro',  // Título
        text2: 'Erro ao fechar pedido. Tente novamente., tenta novamente ou contacte a área técnica',  // Mensagem
      });
      //alert('Erro ao fechar pedido. Tente novamente.');
    }
  } catch (error) {
   // console.error("Erro ao fechar o pedido:", error);
    alert('Ocorreu um erro inesperado. Tente novamente.');
  }
}


  function handleAddOrder() {
    setShowForm(true);
  }

  

  async function sendRequest() {
    if (!selectedService || !description) {
      
      Toast.show({
        type: 'error',  // Pode ser 'success', 'error', 'info'
        text1: 'Erro',  // Título
        text2: 'Por favor, selecione um serviço e insira uma descrição.',  // Mensagem
      });
      return;
    }

    try {
      const response = await api.post('/pedido', {
        tipo: selectedService,
        descricao: description,
        usuarioId: user.id,
        status: 'PENDENTE',
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (response.status === 201) {
        
        Toast.show({
        type: 'success',  // Pode ser 'success', 'error', 'info'
        text1: 'Sucesso',  // Título
        text2: 'Pedido enviado com sucesso!',  // Mensagem
      });
        setSelectedService('');
        setDescription('');
        setShowForm(false);
        //setOrders([...orders, response.data]); // Adiciona o novo pedido à lista
        
      } else {
        Toast.show({
        type: 'error',  // Pode ser 'success', 'error', 'info'
        text1: 'Erro',  // Título
        text2: 'Erro ao fazer Pedido, tente de novo!',  // Mensagem
      });
      }
    } catch (error) {
      //console.error("Erro na requisição:", error);
      Toast.show({
        type: 'error',  // Pode ser 'success', 'error', 'info'
        text1: 'Erro',  // Título
        text2: 'Erro ao fazer Pedido, tente de novo!',  // Mensagem
      });
    }
  }

  return (
 <SafeAreaView style={styles.container}>
    {/* Se não houver pedidos, exibe a mensagem */}
    
    {orders.length === 0 ? (
        <View style={styles.noOrdersContainer}>
          {user.role === 'ADMIN' ? (
            <Text style={styles.noOrdersText}>
              Não Há Pedidos Pendentes, Verifique se todos Peidos foram concluidos com sucesso!
           
            </Text>
          ) : (

              <View>
                <Text style={styles.noOrdersText}>
              Não Há Pedidos Pendentes. Em que podemos ajudar hoje?.
              </Text>
               <Text style={styles.noOrdersText}>
              Em que podemos ajudar hoje?.
              </Text>
              </View>
              
            )}
      </View>
    ) : (
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
      />
    )}

   {user.role !== 'ADMIN' && (
    <TouchableOpacity style={styles.addButton} onPress={handleAddOrder}>
      <Text style={styles.addButtonText}>Adicionar mais pedido</Text>
    </TouchableOpacity>
  )}
    {/* Modal */}
    <Modal
      visible={showForm}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowForm(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
              <View style={styles.formContainer}>
                <TouchableOpacity onPress={() => setSelectedService('SERVICO_24h')}>
                <Text style={selectedService === 'SERVICO_24h' ? styles.selectedOption : styles.option}>Serviço 24H</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setSelectedService('SERVICO_30_DIAS')}>
                <Text style={selectedService === 'SERVICO_30_DIAS' ? styles.selectedOption : styles.option}>Serviço 30+</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setSelectedService('SERVICO_ENTREGA')}>
                <Text style={selectedService === 'SERVICO_ENTREGA' ? styles.selectedOption : styles.option}>Serviço de Entregas</Text>
                </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedService('SERVICO_PESSOAL')}>
                <Text style={selectedService === 'SERVICO_PESSOAL' ? styles.selectedOption : styles.option}>Serviço de Motorista Pessoal</Text>
                </TouchableOpacity>
                
                
                
              <TextInput
                style={styles.input}
                multiline={true} 
                placeholder="Descrição do serviço"
                placeholderTextColor="#888"
                value={description}
                onChangeText={setDescription}
              />
              <TouchableOpacity style={styles.button} onPress={sendRequest}>
                <Text style={styles.buttonText}>Enviar Pedido</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  </SafeAreaView>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d1d2e',
    padding: 20,
  },
  orderContainer: {
    backgroundColor: '#2e2e3e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    margin:12,
  },
  
  noOrdersContainer: {
    flex: 1, // Isso garante que ocupe todo o espaço restante
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center', // Centraliza horizontalmente
    marginVertical: 20,
    padding: 10,
    borderRadius: 8,
  },
  noOrdersText: {
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center',
  },
  /*expandButton: {
    color: '#3fffa3',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'none',
    alignSelf: 'flex-end',
  },*/
  serviceIcon: {
    marginLeft:20,
    color:'#fff'
  },
  expandIcon: {
  alignSelf: 'flex-end',
  marginTop: 12,
  
},
  serviceType: {
  color: '#3fffa3', // Define uma cor em destaque
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 4, // Espaço entre o tipo de serviço e a descrição
},

  interactionContainer: {
    padding: 10,
    borderRadius: 6,
    marginVertical: 5,
  },
  adminInteraction: {
    backgroundColor: '#ffcccb',
  },
  clientInteraction: {
    backgroundColor: '#cce5ff',
  },
  interactionText: {
    color: '#1d1d2e',
    fontSize: 16,
    paddingLeft:16,
  },
  interactionDate: {
    color: '#888888',
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 4,
    
  },
  orderDescription: {
    color: '#fff',
    paddingLeft:18,
  },
  addButton: {
    backgroundColor: '#3fffa3',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    margin:12
  },
  addButtonText: {
    color: '#1d1d2e',
    fontSize: 16,
    fontWeight: 'bold',
    
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: '#2e2e3e',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  option: {
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 8,
  },
  selectedOption: {
    color: '#3fffa3',
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 8,
  },
  input: {
    backgroundColor: '#101026',
    color: '#ffffff',
    fontSize: 18,
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3fffa3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#1d1d2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newInteractionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  newInteractionInput: {
    flex: 1,
    backgroundColor: '#101026',
    color: '#ffffff',
    fontSize: 16,
    borderRadius: 8,
    padding: 10,
  },
  sendButton: {
    backgroundColor: '#3fffa3',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#1d1d2e',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeOrderButton: {
  backgroundColor: '#ff5c5c',
  padding: 10,
  borderRadius: 5,
  alignItems: 'center',
  marginTop: 10,
},
closeOrderButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  },
loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
  },

});
