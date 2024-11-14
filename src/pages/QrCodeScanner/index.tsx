import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { api } from "../../services/api";

interface QrCodeScannerProps {
  navigation: any;
}

export default function QrCodeScanner({ navigation }: QrCodeScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  // Solicita a permissão para a câmera
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Método chamado ao escanear o QR Code
    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);

    try {
      // Faz parsing dos dados do QR code (assumindo que é um JSON)
      const parsedData = JSON.parse(data);
      const { number, organizationId } = parsedData;

      // Checa se os dados necessários estão presentes
      if (number && organizationId) {
        // Chama a função openOrder passando os dados escaneados
        openOrderFromQRCode(number, organizationId);
      } else {
        Alert.alert('Erro', 'Dados inválidos no QR Code.');
        
        //openOrderFromQRCode('80', 'cb1f539c-3b09-4d22-9644-53e8846eaabd');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao processar QR Code.');
      console.error('QR Code parsing error:', error);
    }
  };

  // Função para abrir o pedido com base no QR Code escaneado
  const openOrderFromQRCode = async (number: string, organizationId: string): Promise<void> => {
    if (number === '') {
      return;
    }

    try {
      const response = await api.post('/order', {
        table: Number(number),  // Converte o número da mesa para Number
        organizationId: organizationId
      });

      // Navega para a tela de pedidos
      navigation.navigate('Order', {
        number: number,
        order_id: response.data.id,
        organizationId: response.data.organizationId
      });
    } catch (error) {
      console.error('Error opening order:', error);
      Alert.alert('Erro', 'Falha ao abrir o pedido.');
    }
  };

  // Renderiza mensagens de status de permissão da câmera
  if (hasPermission === null) {
    return <Text>Solicitando permissão para a câmera</Text>;
  }
  if (hasPermission === false) {
    return <Text>Sem acesso à câmera</Text>;
  }

  // Renderiza o scanner de código de barras
  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Escanear novamente'} onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
