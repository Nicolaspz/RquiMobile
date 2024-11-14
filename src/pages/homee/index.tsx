import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from "../Dashboard";
import Order from "../Order";



const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={Dashboard} />
        <Tab.Screen name="Settings" component={Order} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}