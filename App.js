import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text } from 'react-native';
// Navigation removed: single-screen app
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './src/screens/HomeScreen';


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#070A14', borderTopColor: 'rgba(0,240,255,0.06)' },
          tabBarActiveTintColor: '#00F0FF',
          tabBarInactiveTintColor: '#7A8FB3',
          tabBarIcon: ({ focused, color, size }) => {
            let icon = '❓';
            if (route.name === 'Home') icon = focused ? '🏠' : '🏚️';
            if (route.name === 'Stats') icon = focused ? '📈' : '📊';
            if (route.name === 'Settings') icon = focused ? '⚙️' : '🛠️';
            return <Text style={{ color, fontSize: 18 }}>{icon}</Text>;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Stats" component={require('./src/screens/StatsScreen').default} />
        <Tab.Screen name="Settings" component={require('./src/screens/SettingsScreen').default} />
      </Tab.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
