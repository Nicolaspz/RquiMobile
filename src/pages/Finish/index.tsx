import React from "react";
import { View
,Text, StyleSheet , TouchableOpacity} from "react-native"; 
import {Feather} from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { api } from "../../services/api";
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { StackPramsList } from "../../routes/app.routes";

type RouteDetailParams={
  FinishOrder:{
    number:string | number;
    order_id:string;
  }
}

type FinishOrderRouteProp= RouteProp<RouteDetailParams, 'FinishOrder'>

export default function FinishOrder(){

  const route = useRoute<FinishOrderRouteProp>(); 
  const navigation= useNavigation<NativeStackNavigationProp<StackPramsList>>();

  async function handleFinish() {
   try {
    await api.put('/order/send',{
      id_order:route.params?.order_id
    })
    navigation.popToTop();
   } catch (error) {
    console.log('Erro ao Finalizar, tente mais tarde')
   }
  }
  return(
<View style={styles.container}>
  <Text style={styles.alert}> Deseja Finalizar o pedido ?</Text>
  <Text style={styles.title}>Mesa  {route.params.number} </Text>
  <TouchableOpacity style={styles.buton} 
  onPress={handleFinish}>
    <Text style={styles.textbuton}>Finalizar</Text>
    <Feather size={25} color='#1d1d2e' name="shopping-cart"/>
  </TouchableOpacity>
</View>
  )
}
const styles=StyleSheet.create(
  {
    container:{
      flex:1,
      backgroundColor:'#1d1d2e',
      paddingVertical:'5%',
      paddingHorizontal:'4%',
      alignItems:'center',
      justifyContent:'center'
    },
    alert:{
      fontSize:20,
      color:'#fff',
      fontWeight:'bold',
      marginBottom:12,
    },
    title:{
      fontSize:30,
      fontWeight:'bold',
      color:'#fff',
      marginBottom:12,
    },
    buton:{
      backgroundColor:'#3fffa3',
      flexDirection:'row',
      width:'65%',
      height:40,
      alignItems:'center',
      justifyContent:'center',
      borderRadius:4,
    },
    textbuton:{
      fontSize:30,
      marginRight:8,
      fontWeight:'bold',
      color:'#1d1d2e'
    }

  }
)