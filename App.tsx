import { View, StatusBar, Platform, Alert, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Routes from './src/routes';
import { AuthProvider } from './src/contexts/AuthContext';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { useContext, useEffect, useState } from 'react';
import { api } from './src/services/api';
import { AuthContext } from "./src/contexts/AuthContext";
import * as Device from 'expo-device';
import firebaseApp from "./firebaseConfig";
import messaging from '@react-native-firebase/messaging';


// Configuração do comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
//console.log("Firebase carregado:", firebaseApp);

export default function App() {

   useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      //console.log('🔔 Notificação recebida pelo dispositivo:', JSON.stringify(notification, null, 2));
      //alert(`Notificação recebida: ${JSON.stringify(notification, null, 2)}`);
    });

    return () => subscription.remove(); // Remove o listener quando o componente for desmontado
  }, []);
  return (
    <NavigationContainer>
      <AuthProvider>
        <StatusBar backgroundColor="#1d1d2e" barStyle="light-content" translucent={false} />
        <Main />
        <Toast />
      </AuthProvider>
    </NavigationContainer>
  );
}

function Main() {
  const { user } = useContext(AuthContext);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    async function registerForPushNotificationsAsync() {
      
      try {
        if (!Device.isDevice) {
          //console.warn('Notificações só funcionam em dispositivos físicos!');
          //Alert.alert("Erro", "Notificações só funcionam em dispositivos físicos!");
          return;
        }

        //console.log(" Verificando permissão de notificações...");
        //Alert.alert("DEBUG", "Verificando permissão de notificações...");

        let { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          //console.log(" Permissão ainda não concedida, solicitando...");
        //Alert.alert("Permissão ainda não concedida", status);

          // Verifica se está no Android antes de pedir permissões
          if (Platform.OS === 'android') {
            //console.log("Executando no Android - Pedindo permissão manualmente...");
            //Alert.alert("Permissão ainda não concedida", status);

          }

          const { status: newStatus } = await Notifications.requestPermissionsAsync();
          status = newStatus;
        }

        //console.log("Estado final da permissão:", status);
        //Alert.alert("Estado final da permissão:", status);
        if (status !== 'granted') {
          Alert.alert(
            'Permissão necessária',
            'Para receber notificações, ative-as nas configurações do seu celular.',
            [
              { text: 'Cancelar', style: 'cancel' },
              //{ text: 'Abrir Configurações', onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }

        //console.log(" Permissão concedida! Obtendo Expo Push Token...");
        //Alert.alert(" Permissão concedida! Obtendo Expo Push Token...");
        const { data: token } = await Notifications.getExpoPushTokenAsync({
          projectId:"c107cdb7-ece9-44f1-a93d-2adc5c20631e", // Substitua pelo seu Project ID do Expo
        }); 
        //const token = await messaging().getToken();

       ///console.log(" Expo Push Token:", token);
        
        // Captura o token no Alert para debug
       // Alert.alert(" Expo Push Token:", token);

        setExpoPushToken(token);

        if (user?.id) {
          console.log(` Enviando token para o backend... (User ID: ${user.id})`);
          await saveTokenToBackend(token, user.id);
        }

       /* if (token) {
           //Alert.alert("Registar Token no expo");
        await fetch('https://exp.host/--/api/v2/push/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            token,
            type: 'fcm', // Diz ao Expo que este é um token do Firebase
          }),
        });
      }*/
    

      } catch (error:any) {
        console.error(" Erro ao registrar notificações:", error);
        //Alert.alert("Erro", error.message || "Erro desconhecido");
      }
    }

    // Garante que só solicita permissões no Android
    if (user && Platform.OS === "android") {
      registerForPushNotificationsAsync();
    }
  }, [user]);

  // Listener para quando uma notificação chega
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notificação recebida:', notification);
    });
    return () => subscription.remove();
  }, []);

  // Listener para quando o usuário clica na notificação
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Usuário clicou na notificação:', response);
    });
    return () => subscription.remove();
  }, []);

  // Função para salvar o token no backend
  async function saveTokenToBackend(token: string, userId: string) {
    try {
      await api.post('/save-token', { expoToken: token, userId }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      //console.log(" Token enviado para o backend com sucesso!");
      //Alert.alert("Token enviado para o backend com sucesso");
    } catch (error:any) {
      console.error(" Erro ao enviar o token:", error);
       //Alert.alert(" Erro ao enviar o token:", error.message || "Erro desconhecido");
    }
  }

  return <Routes />;
}

