
---

## `src/App.js`
```jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import SessionPlayerScreen from './screens/SessionPlayerScreen';
import SessionsListScreen from './screens/SessionsListScreen';
import WaterScreen from './screens/WaterScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SessionsList" component={SessionsListScreen} />
        <Stack.Screen name="SessionPlayer" component={SessionPlayerScreen} />
        <Stack.Screen name="Water" component={WaterScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
