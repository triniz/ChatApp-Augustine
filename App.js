import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNetInfo } from '@react-native-community/netinfo';
import { initializeApp } from 'firebase/app';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import Start from './components/Start';
import Chat from './components/Chat';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0LNZNB7AR734oGNM7-uF-c_N8JTBx6S8",
  authDomain: "chatapp-7d513.firebaseapp.com",
  projectId: "chatapp-7d513",
  storageBucket: "chatapp-7d513.appspot.com",
  messagingSenderId: "537286917398",
  appId: "1:537286917398:web:8622e31f6b0408abe1a437"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore, Firebase Auth with persistence, and Storage
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const storage = getStorage(app);

const Stack = createStackNavigator();

const App = () => {
  const netInfo = useNetInfo();

  useEffect(() => {
    if (netInfo.isConnected === false) {
      disableNetwork(db)
        .catch((error) => console.error("Failed to disable Firestore network", error));
    } else if (netInfo.isConnected === true) {
      enableNetwork(db)
        .catch((error) => console.error("Failed to enable Firestore network", error));
    }
  }, [netInfo.isConnected]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen 
          name="Start" 
          component={Start} 
          options={{ title: 'Welcome' }}
        />
        <Stack.Screen
          name="Chat"
          component={Chat}
          options={({ route }) => ({ title: route.params.name })}
          initialParams={{ isConnected: netInfo.isConnected }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export { db, auth, storage };
export default App;
