 import React from "react";
 import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
 import Dashboard from "../pages/Dashboard";
import Order from "../pages/Order";
import { Ionicons } from '@expo/vector-icons';





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
}
 const Tab = createBottomTabNavigator();
 
 
 function AppRoutes(){
  return (
    
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Pendentes') {
            iconName = 'home';
          } else if (route.name === 'Concluidos') {
            iconName = 'list';
          }

          // Retorna o ícone correspondente usando Ionicons
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato', // Cor ativa (selecionada)
        tabBarInactiveTintColor: 'gray',  // Cor inativa (não selecionada)
        tabBarStyle: { backgroundColor: 'lightblue' }, // Cor de fundo da aba
      })}
    >
        <Tab.Screen name="Pendentes" component={Dashboard} />
        <Tab.Screen name="Concluidos" component={Order} />
    </Tab.Navigator>
    
  );
 }
 export default AppRoutes;