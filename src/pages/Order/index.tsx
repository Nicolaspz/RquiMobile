import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackPramsList } from "../../routes/app.routes";
import { api } from "../../services/api";
import { AuthContext } from "../../contexts/AuthContext";
import { Ionicons, FontAwesome } from '@expo/vector-icons';

type Fatura = {
  id: string;
  numero: string;
  data_criacao: string;
  data_vencimento: string;
  status: string;
  servicos: Pedido[];
  usuario: {
    proces_number: string;
    tipo_pagamento: string;
  };
};

type Pedido = {
  id: string;
  descricao: string;
  status: string;
  tipo: string;
  numero: BigInt;
  Interacao: Interacao[];
};

type Interacao = {
  id: string;
  conteudo: string;
  criado_em: string;
  tipo: string;
  
};

//const socket = io("http://10.20.23.66:3000");

export default function Order() {
  const [invoices, setInvoices] = useState<Fatura[]>([]);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(
    null
  );
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<NativeStackNavigationProp<StackPramsList>>();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.role) return;

    async function fetchInvoices() {
      try {
        const url = user.role === "ADMIN" ? "/fatura" : `/fatura/${user.id}`;
        const response = await api.get(url, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const filteredInvoices = response.data.filter(
        (fatura: Fatura) => fatura.status === "ABERTA"
      );
        setInvoices(filteredInvoices);
      } catch (error) {
        console.error("Erro ao buscar faturas:", error);
      }
    }

    fetchInvoices();

    
  }, [user,invoices]);

  const toggleExpand = (faturaId: string) => {
    setExpandedInvoiceId((prev) => (prev === faturaId ? null : faturaId));
  };

  function toggleExpandd(orderId: string) {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  }

  // Função para calcular os dias restantes até o vencimento da fatura
  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffInTime = due.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24)); // Converter milissegundos para dias
    return diffInDays;
  };

    const renderInvoiceItem = ({ item }: { item: Fatura }) => {
  const daysRemaining = calculateDaysRemaining(item.data_vencimento);

  let statusColor = "#3fffa3"; // Verde
  if (daysRemaining <= 0) {
    statusColor = "#ff6666"; // Vermelho (vencido)
  } else if (daysRemaining <= 2) {
    statusColor = "#ffcc00"; // Amarelo (próximo do vencimento)
  }

    const confirmCloseInvoice = async (faturaId: string) => {
      Alert.alert(
        "Fechar Folha de Obra",
        "Tem certeza de que deseja fechar folha de Obra?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sim",
            onPress: async () => {
              try {
                const response = await api.put(`/fatura/${faturaId}`, {
                  status: "FECHADA",
                });

                if (response.status === 200 || response.status === 201) {
                  Alert.alert("Sucesso", "Fatura fechada com sucesso!");
                }
              } catch (error: any) {
                // Acesso à resposta do servidor
                console.log("Erro",error);
                const status = error.response?.status;
                const message = error.response?.data?.error || "Erro desconhecido";
                console.log("status", status);
                if (status === 500) {
                  Alert.alert("Não é possível fechar a fatura", "existem pedidos não concluídos. Fechar ou Arquivar "); // mostra mensagem personalizada do backend
                } else {
                  Alert.alert(
                    "Erro",
                    "Ocorreu um erro ao tentar fechar folha de obra. Tente novamente."
                  );
                }

                console.error("Erro ao fechar fatura:", error);
              }
            },
          },
        ]
      );
    };


   const confirmArquiveService = async (faturaId: string) => {
    Alert.alert(
      "Arquivar o Pedido",
      "Tem certeza de que deseja arquivar o pedido?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim",
          onPress: async () => {
            try {
              // Requisição para fechar a fatura
              const response = await api.put(`/pedido_arqhive/${faturaId}`, {
                status: "ARQUIVADA",
              });

              if (response.status === 200 || response.status === 201) {
                Alert.alert("Sucesso", "Pedido arquivado com sucesso!");
              } else {
                Alert.alert("erro:", "não foi possivel arquivar o pedido.");
              }
            } catch (error) {
              Alert.alert(
                "Erro",
                "Ocorreu um erro ao tentar fechar folha de obra. Tente novamente."
              );
              console.error("Erro ao fechar fatura:", error);
            }
          },
        },
      ]
    );
  };   

  return (
    <View style={styles.invoiceContainer}>
      <View style={styles.invoiceContainerFlex}>
        <View style={{ 'display': "flex", 'flexDirection': "row", "alignContent": "center", 'alignItems': "center", "gap": 10 }}>
          <View>
            <Text style={styles.invoiceNumber}>{item.numero} </Text>
          </View>
          <View>
            <Text style={[styles.invoiceStatus, { color: statusColor }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <View style={{ 'display': "flex", 'flexDirection': "row", "alignContent": "center", 'alignItems': "center", "gap": 10 }}>
          <Text style={styles.invoiceUsuario}>{item.usuario.tipo_pagamento}</Text>
          <Text style={styles.invoiceUsuario}>{item.usuario.proces_number}</Text>
       </View>
        
      </View>

      <Text style={[styles.invoiceDueDate, { color: statusColor, 'paddingLeft':8 }]}>
        Vencimento: {new Date(item.data_vencimento).toLocaleDateString()}
      </Text>

      <Text style={[styles.daysRemaining, { color: statusColor ,'paddingLeft':8}]}>
        {daysRemaining > 0
          ? `${daysRemaining} ${
              daysRemaining === 1 ? "dia" : "dias"
            } restantes`
          : daysRemaining === 0
          ? "Vencimento hoje"
          : "Fatura vencida"}
      </Text>

      <View style={{'display':"flex",'flexDirection':"row", "alignContent":"center", 'alignItems':"center",'justifyContent':"space-between"}}>
            <TouchableOpacity onPress={() => toggleExpand(item.id)} style={{'marginBottom':4}}>
            <FontAwesome
              name={expandedInvoiceId === item.id ? "chevron-up" : "chevron-down"}
              size={20}
              color="#3fffa3"
              style={styles.expandIcon}
            />
          </TouchableOpacity>

          {/* Botão para fechar a fatura */}
          {user.role === 'ADMIN' && (
            <TouchableOpacity onPress={() => confirmCloseInvoice(item.id)} style={{}}>
              <FontAwesome name="check-circle" size={20} color="#ff6666" />
            </TouchableOpacity>
        )}
        
      </View>

      


      {expandedInvoiceId === item.id && (
        <View>
          {item.servicos.map((pedido) => (
            <View key={pedido.id} style={styles.orderContainer}>
              {pedido.tipo && (
                <Text style={styles.serviceType}>
                  <FontAwesome
                    name="motorcycle"
                    size={20}
                    color="#3fffa3"
                    //style={styles.serviceIcon}
                  />{" "}
                   {pedido.tipo === "SERVICO_30_DIAS" ? "SERVIÇO 30 +" : pedido.tipo} Nº { pedido.numero}
                </Text>
              )}

              <Text style={styles.orderDescription}>{pedido.descricao} {pedido.status}</Text>
            <View style={{'display':"flex",'flexDirection':"row", "alignContent":"center", 'alignItems':"center",'justifyContent':"space-between"}}>
              <TouchableOpacity onPress={() => toggleExpandd(pedido.id)}>
                <FontAwesome
                  name={expandedOrderId === pedido.id ? "eye-slash" : "eye"}
                  size={28}
                  color="#3fffa3"
                  style={styles.expandIcon}
                />
                </TouchableOpacity>
                {user.role === 'ADMIN' && pedido.status === 'PENDENTE' && (
                <TouchableOpacity onPress={() => confirmArquiveService(pedido.id)}>
                    <FontAwesome
                      name= "archive"
                      size={28}
                      color="red"
                      style={styles.expandIcon}
                    />
                </TouchableOpacity>
        )}
                

            </View>
              
              {expandedOrderId === pedido.id && (
                <View>
                  {pedido.Interacao.map((interacao) => (
                    <View
                      key={interacao.id}
                      style={[
                        styles.interactionContainer,
                        interacao.tipo === "ADMIN"
                          ? styles.adminInteraction
                          : styles.clientInteraction,
                      ]}
                    >
                      <Text style={styles.interactionText}>
                        {interacao.conteudo}
                      </Text>
                      <Text style={styles.interactionDate}>
                        {new Date(interacao.criado_em).toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

  return (
    <SafeAreaView style={styles.container}>
      {invoices.length === 0 ? (
        <View style={styles.noInvoicesContainer}>
          <Text style={styles.noInvoicesText}>
            Não há faturas disponíveis no momento.
          </Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          renderItem={renderInvoiceItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1d1d2e",
    padding: 20,
  },
  invoiceContainer: {
    backgroundColor: "#2e2e3e",
    padding: 15,
    borderRadius: 8,
    margin: 15,
    
  },
  invoiceNumber: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
    marginRight:8,
  
  },
  
  expandIcon: {
    alignSelf: "flex-end",
    marginTop: 10,
  },
  serviceList: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#383850",
    borderRadius: 8,
  },
  orderContainer: {
    backgroundColor: "#44475a",
    padding: 10,
    borderRadius: 6,
    marginVertical: 5,
  },
  orderDescription: {
    color: "#ffffff",
    fontSize: 16,
  },
  interactionContainer: {
    padding: 5,
    borderRadius: 4,
    backgroundColor: "#cce5ff",
    marginVertical: 2,
  },
  interactionText: {
    fontSize: 14,
    color: "#1d1d2e",
  },
  interactionDate: {
    fontSize: 12,
    color: "#666",
  },
  noInvoicesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noInvoicesText: {
    color: "#ffffff",
    fontSize: 18,
  },
   serviceType: {
  color: '#3fffa3', // Define uma cor em destaque
  fontSize: 18,
  fontWeight: 'bold',
     marginBottom: 4,
  
  },
   adminInteraction: {
    backgroundColor: '#ffcccb',
  },
   clientInteraction: {
    backgroundColor: '#cce5ff',
  },
   invoiceDueDate: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "bold",
    marginVertical: 5,
  },
   invoiceStatus: {
    fontSize: 16,
     color: "#3fffa3",
    marginRight:8,
  },
  invoiceUsuario: {
     fontSize: 16,
    color: "#3fffa3",
   },
  invoiceContainerFlex: {
    display: 'flex',
    flexDirection:'colum',
    alignItems:'left',
    marginLeft:8
  },
  daysRemaining: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
  },

});