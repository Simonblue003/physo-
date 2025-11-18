// App.js
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Home from './src/screens/Home'
import SessionPlayer from './src/screens/SessionPlayer'

const Stack = createNativeStackNavigator()

export default function App(){
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="SessionPlayer" component={SessionPlayer} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
