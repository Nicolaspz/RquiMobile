import React, { useState, useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, FlatList, TextInput, Modal, TouchableWithoutFeedback } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackPramsList } from "../../routes/app.routes";
import { api } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import Icon from 'react-native-vector-icons/FontAwesome';
import io from 'socket.io-client';  

const socket = io("http://10.20.23.66:3000"); 
type Pedido = {
  id: string;
  descricao: string;
  status: string;
  Interacao: Interacao[];
  tipo: string;
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

  useEffect(() => {
    // Verifica se o user.role está definido antes de buscar pedidos
    if (user && user.role) {
      async function fetchOrders() {
        try {
          const url = user.role === "ADMIN" ? "/pedidos" : `/pedido_user/${user.id}`;
          const response = await api.get(url, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          console.log("data", response.data);
          const filteredOrders = response.data.filter((order: Pedido) => order.status === "PENDENTE");
          setOrders(filteredOrders);
        } catch (error) {
          console.error("Erro ao buscar pedidos:", error);
        }
      }

      fetchOrders();
      // Escuta eventos de novos pedidos e atualizações via socket
      socket.on("newOrder", (newOrder) => {
        setOrders((prevOrders) => [...prevOrders, newOrder]);
      });

      socket.on("updateOrder", (updatedOrder) => {
        setOrders((prevOrders) =>
          prevOrders.map(order => order.id === updatedOrder.id ? updatedOrder : order)
        );
      });

      socket.on("newInteraction", (newInteraction) => {
        setOrders((prevOrders) =>
          prevOrders.map(order => 
            order.id === newInteraction.servicoId 
              ? { ...order, Interacao: [...order.Interacao, newInteraction] }
              : order
          )
        );
      });
    }

    return () => {
      // Limpeza: remove listeners quando o componente é desmontado
      socket.off("newOrder");
      socket.off("updateOrder");
      socket.off("newInteraction");
    };
    
  }, [user.role]); 

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

      if (response.status === 200) {
        alert('Interação adicionada com sucesso!');
        setNewInteractionContent('');
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, Interacao: [...order.Interacao, response.data] } : order
        ));
      } else {
        alert('Erro ao adicionar interação. Tente novamente.');
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert('Ocorreu um erro inesperado. Tente novamente.');
    }
  }

  const renderOrderItem = ({ item }: { item: Pedido }) => (
  <View style={styles.orderContainer}>
    {/* Exibe o tipo de serviço em destaque com o mesmo estilo da descrição */}
    {item.tipo && <Text style={styles.serviceType}><Icon name="motorcycle" size={20} color="#3fffa3" style={styles.serviceIcon} /> {item.tipo}</Text>}
    <Text style={styles.orderDescription}>{item.descricao}</Text>
    <TouchableOpacity onPress={() => toggleExpand(item.id)}>
      <Icon
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
          {item.status === "PENDENTE" && (
            <View style={styles.newInteractionContainer}>
              <TextInput
                style={styles.newInteractionInput}
                placeholder="Escreva uma nova interação"
                placeholderTextColor="#888"
                value={newInteractionContent}
                onChangeText={setNewInteractionContent}
              />
              <TouchableOpacity style={styles.sendButton} onPress={() => handleAddInteraction(item.id)}>
                <Text style={styles.sendButtonText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          )}
      </View>
    )}
  </View>
);


  function handleAddOrder() {
    setShowForm(true);
  }

  async function sendRequest() {
    if (!selectedService || !description) {
      alert('Por favor, selecione um serviço e insira uma descrição.');
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
        alert('Pedido enviado com sucesso!');
        setSelectedService('');
        setDescription('');
        setShowForm(false);
        setOrders([...orders, response.data]); // Adiciona o novo pedido à lista
      } else {
        alert('Erro ao criar pedido. Tente novamente.');
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert('Ocorreu um erro inesperado. Tente novamente.');
    }
  }

  return (
 <SafeAreaView style={styles.container}>
    {/* Se não houver pedidos, exibe a mensagem */}
    {orders.length === 0 ? (
        <View style={styles.noOrdersContainer}>
          {user.role === 'ADMIN' ? (
            <Text style={styles.noOrdersText}>
              Não Há Pedidos Pendentes, Verifique se todos Peidos foram realizados com sucesso!
           
            </Text>
          ) : (

              <Text style={styles.noOrdersText}>
              Não Há Pedidos Pendentes, Faça um Pedido Clicando no Botão abaixo!!
           
            </Text>
              
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
              <TouchableOpacity onPress={() => setSelectedService('ENTREGA')}>
                <Text style={selectedService === 'ENTREGA' ? styles.selectedOption : styles.option}>Serviço de Entregas</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedService('MOTORISTA_PESSOAL')}>
                <Text style={selectedService === 'MOTORISTA_PESSOAL' ? styles.selectedOption : styles.option}>Motorista Particular</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
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
});
