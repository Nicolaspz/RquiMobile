import { api } from '../services/api';

interface NotificationProps {
  userId: string;
  title: string;
  message: string;
 
}

export async function sendPushNotification({ userId, title, message }: NotificationProps) {
  try {
    const response = await api.post('/send-notification', { userId, title, message });

    console.log('✅ Resposta do servidor:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    if (error.response) {
      // O servidor retornou uma resposta com erro (ex: 500)
      console.error('🚨 Erro do servidor:', error.response.data);
      return { success: false, error: error.response.data };
    } else if (error.request) {
      // O request foi feito, mas não houve resposta (ex: servidor offline)
      console.error('⚠️ Sem resposta do servidor:', error.request);
      return { success: false, error: { message: 'Sem resposta do servidor' } };
    } else {
      // Outro erro (ex: erro de configuração)
      console.error('❌ Erro ao configurar requisição:', error.message);
      return { success: false, error: { message: error.message } };
    }
  }
}

