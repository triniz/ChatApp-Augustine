import React, { useState, useEffect } from 'react';
import { View, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../App';
import CustomActions from './CustomActions';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import MapView from 'react-native-maps';


const Chat = ({ route }) => {
  const { _id, name, bgColor, isConnected, storage } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let unsubscribe;
    if (isConnected) {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesFirestore = snapshot.docs.map(doc => {
          const firebaseData = doc.data();
          return {
            _id: doc.id,
            text: firebaseData.text,
            createdAt: new Date(firebaseData.createdAt.seconds * 1000),
            user: firebaseData.user,
            image: firebaseData.image || null,
            location: firebaseData.location || null,
          };
        });
        setMessages(messagesFirestore);
        cacheMessages(messagesFirestore);
      });
    } else {
      loadCachedMessages();
      showConnectionLostAlert();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected]);

  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(messagesToCache));
    } catch (error) {
      console.error('Failed to cache messages', error);
    }
  };

  const loadCachedMessages = async () => {
    try {
      const cachedMessages = await AsyncStorage.getItem('messages');
      if (cachedMessages) {
        setMessages(JSON.parse(cachedMessages));
      }
    } catch (error) {
      console.error('Failed to load cached messages', error);
    }
  };

  const showConnectionLostAlert = () => {
    Alert.alert('Connection Lost', 'You are now offline. You cannot send messages.');
  };

  const renderInputToolbar = (props) => {
    if (isConnected) {
      return <InputToolbar {...props} />;
    }
    return null;
  };

  const onSend = (newMessages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  };

  const renderCustomActions = (props) => {
    return (
      <CustomActions
        {...props}
        onSend={onSend}
        userID={_id}
        name={name}
        storage={storage}
      />
    );
  };

  const renderCustomView = (props) => {
    //Using object destructuring 
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{
            width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3
          }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  return (
    <ActionSheetProvider>
      <View style={{ flex: 1, backgroundColor: bgColor }}>
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: _id,
            name: name,
          }}
          renderInputToolbar={renderInputToolbar}
          renderActions={renderCustomActions}
          renderCustomView={renderCustomView}
        />
        {Platform.OS === 'android' || Platform.OS === 'ios' ? (
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} />
        ) : null}
      </View>
    </ActionSheetProvider>
  );
};

export default Chat;
