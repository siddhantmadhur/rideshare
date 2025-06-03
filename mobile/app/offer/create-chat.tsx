// mobile/app/offer/create-chat-room.tsx
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

export default function CreateChatRoom() {
  const [rideId, setRideId] = useState('');

  const handleCreate = () => {
    const mockRoom = {
      group_id: Date.now(),
      ride_id: parseInt(rideId),
      members: [
        { user_id: 'user1', username: 'Harshada' },
        { user_id: 'user2', username: '' },
      ],
      created_at: new Date().toISOString(),
    };

    router.push(`/offer/chat-room?room_id=${mockRoom.group_id}`);
  };

  //room_id is an int? not a str?
  return (
    <View style={styles.container}>
      <Text>Enter Room ID
      </Text>
      <TextInput
        style={styles.input}
        placeholder="123"
        keyboardType="numeric"
        value={rideId}
        onChangeText={setRideId}
      />
      <Button title="Create a Chat Room" onPress={handleCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: {
    borderWidth: 1,  borderColor: '#aab',
    marginBottom: 20, 
  },
});
