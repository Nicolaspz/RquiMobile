 import React from "react";
 import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
 import Dashboard from "../pages/Dashboard";
import Order from "../pages/Order";
import Concluidos from "../pages/Concluido";
import { FontAwesome } from '@expo/vector-icons';
import Profile from "../pages/Profile";






export type StackPramsList={
    Dashboard:undefined;
    Order:{
      number: number | string;
      order_id:string;
      organizationId:string;
    };
    Finish:{
      number: number | string;
      order_id:string;
  };
    Fechados:{
      number: number | string;
      order_id:string;
    };
}
 const Tab = createBottomTabNavigator();
 
 
 function AppRoutes(){
  return (
    
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Pedidos') {
            iconName = 'home';
          } else if (route.name === 'Abertos') {
            iconName = 'list';
          }
          else if (route.name === 'Fechados') {
            iconName = 'list';
          }
          else if (route.name === 'Perfil') {
             iconName = 'user';
          }

          // Retorna o ícone correspondente usando Ionicons
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000', // Cor ativa (selecionada)
        tabBarInactiveTintColor: '#3fffa3',  // Cor inativa (não selecionada)
        tabBarStyle: { backgroundColor: '#fff' }, // Cor de fundo da aba
      })}
    >
      <Tab.Screen name="Pedidos" component={Dashboard} />
      <Tab.Screen name="Abertos" component={Order}/>
      <Tab.Screen name="Fechados" component={Concluidos} />
      <Tab.Screen name="Perfil" component={Profile} />

      
    </Tab.Navigator>
    
  );
 }
 export default AppRoutes;