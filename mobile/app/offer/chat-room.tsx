import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';

const mockData = [
  { message_id: 1, user_id: 'user1', content: 'Hello how are you??' },
  { message_id: 2, user_id: 'user2', content: 'Doing great hbu??' },
];

const currentUser = { user_id: 'user1', username: 'Harshada' };

export default function ChatRoom() {
  const { room_id } = useLocalSearchParams(); //the room id from create chat needs to be read
  const [messages, setMessages] = useState(mockData);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      message_id: Date.now(),
      user_id: currentUser.user_id,
      content: input.trim(),
    };
    setMessages([...messages, newMsg]);
    setInput('');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/offer/all-chats')}>
      <Text style={styles.backText}>← All Chats</Text>
      </TouchableOpacity>



      <FlatList
        data={messages}
        keyExtractor={(item) => item.message_id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.user_id === currentUser.user_id && styles.myMessage,
              item.user_id !== currentUser.user_id && styles.theirMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: 'white' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  backText: { color: '#007aff', marginBottom: 10 },
  messageBubble: {
    padding: 10,
    marginBottom: 8,
    borderRadius: 6,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#cce5ff',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 14,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    height: 40,
  },
  sendButton: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#007aff',
  },
});
