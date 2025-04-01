import { api } from "./api"; // Certifique-se de que o caminho está correto

interface NotificationProps {
  userId: string;
  title: string;
  message: string;
  token: string; // Token do usuário autenticado para autenticação
}

const sendNotification = async ({ userId, title, message, token }: NotificationProps) => {
  try {
    await api.post(
      "/send-notification",
      { userId, title, message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
  }
};

export default sendNotification;
