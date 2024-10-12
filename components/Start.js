// components/Start.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { getAuth, signInAnonymously } from 'firebase/auth';

const Start = ({ navigation }) => {
  const [name, setName] = useState('');
  const [bgColor, setBgColor] = useState('#fff'); // Default color

  const colors = ['#ff5c5c', '#5c6bc0', '#66bb6a', '#ffa726'];

  const handleStartChatting = () => {
    const auth = getAuth();
    signInAnonymously(auth)
      .then((userCredential) => {
        const user = userCredential.user;
        navigation.navigate('Chat', {
          _id: user.uid, // User's Firebase UID
          name: name || 'User', // Default name if not entered
          bgColor: bgColor // Selected background color
        });
      })
      .catch((error) => {
        console.error('Error signing in anonymously:', error);
      });
  };

  return (
    <ImageBackground 
      source={require('../assets/adaptive-icon.png')} 
      style={styles.background}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          onChangeText={(text) => setName(text)}
        />
        <View style={styles.colorContainer}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorCircle, { backgroundColor: color }]}
              onPress={() => setBgColor(color)}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleStartChatting}
        >
          <Text style={styles.buttonText}>Enter Chat</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, width: '80%', alignItems: 'center' },
  input: { borderColor: '#ccc', borderWidth: 1, borderRadius: 5, padding: 10, width: '100%' },
  colorContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  colorCircle: { width: 50, height: 50, borderRadius: 25, margin: 10 },
  button: { backgroundColor: '#333', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff' },
});

export default Start;
