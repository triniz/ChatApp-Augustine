import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert, Keyboard } from 'react-native';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { v4 as uuidv4 } from 'uuid';
import { storage, db, auth } from '../App';  // Import storage from App.js

const CustomActions = ({ wrapperStyle, iconTextStyle, onSend, userID, name }) => {
  const actionSheet = useActionSheet();

  const generateReference = (uri) => {
    const name = uri.split('/').pop(); // Extract the file name from the URI
    return `${userID}-${Date.now()}-${name}`;
  };

  const onActionPress = () => {
    Keyboard.dismiss();
    const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
    const cancelButtonIndex = options.length - 1;

    actionSheet.showActionSheetWithOptions({ options, cancelButtonIndex }, (buttonIndex) => {
      switch (buttonIndex) {
        case 0:
          pickImage();
          return;
        case 1:
          takePhoto();
          return;
        case 2:
          getLocation();
          return;
        default:
          return;
      }
    });
  };

  const uploadAndSendImage = async (imageURI) => {
    try {
      // Generate a unique reference string and fetch the image
      const uniqueRefString = generateReference(imageURI);
      const newUploadRef = ref(storage, uniqueRefString); // Use imported storage directly
      const response = await fetch(imageURI);
      
      if (!response.ok) {
        throw new Error('Failed to fetch the image.');
      }

      // Convert the image to a blob
      const blob = await response.blob();

      // Upload the blob to Firebase storage
      const snapshot = await uploadBytes(newUploadRef, blob);

      // Get the download URL of the uploaded image
      const imageURL = await getDownloadURL(snapshot.ref);

      // Create the image message
      const imageMessage = {
        _id: uuidv4(),
        text: "",
        createdAt: new Date(),
        user: { _id: userID, name: name },
        image: imageURL,
      };

      // Send the image message using onSend callback
      onSend([imageMessage]);
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Error', 'Failed to upload and send the image.');
    }
  };

  const pickImage = async () => {
    try {
      let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access media library is required.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Selected Image URI:', result.assets[0].uri);
        await uploadAndSendImage(result.assets[0].uri);
      } else {
        console.log('Image selection canceled or no assets found.');
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const takePhoto = async () => {
    try {
      let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access camera is required.');
        return;
      }

      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Captured Image URI:', result.assets[0].uri);
        await uploadAndSendImage(result.assets[0].uri);
      } else {
        console.log('Camera operation canceled.');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const getLocation = async () => {
    try {
      // Request permission to access the location
      let permissions = await Location.requestForegroundPermissionsAsync();
  
      // Check if permission is granted
      if (permissions?.granted) {
        // Get the current location with higher accuracy
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,  // Use Balanced if this causes delay
        });
  
        // Log the location to help debug
        console.log("Retrieved location:", location);
  
        // Check if location data is available
        if (location && location.coords) {
          // Format the message with the correct data (no undefined values)
          const locationMessage = {
            _id: uuidv4(),
            text: "",
            createdAt: new Date(),
            user: { _id: userID, name: name },
            location: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
          };
          onSend([locationMessage]);
        } else {
          Alert.alert("Location data is not available.");
        }
      } else {
        Alert.alert("Location access denied. Please enable location access.");
      }
    } catch (error) {
      // Log any errors that occur during the process
      console.error("Error in getLocation function:", error);
      Alert.alert("An error occurred while fetching location.");
    }
  };
  

  return (
    <TouchableOpacity style={styles.container} onPress={onActionPress}>
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={[styles.iconText, iconTextStyle]}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#B1B2FF',
    borderWidth: 4,
    flex: 1,
  },
  iconText: {
    color: '#B1B2FF',
    fontWeight: '900',
    fontSize: 20,
    backgroundColor: 'transparent',
    textAlign: 'center',
    marginTop: -5,
  },
});

export default CustomActions;
