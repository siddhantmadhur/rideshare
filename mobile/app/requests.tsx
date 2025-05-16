// rideshare/mobile/app/requests.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  FlatList,
} from 'react-native';

// Dummy data
const REQUESTS = [
  { id: '1', name: 'Alice Johnson', avatar: 'https://via.placeholder.com/80' },
  { id: '2', name: 'Bob Smith',     avatar: 'https://via.placeholder.com/80' },
  { id: '3', name: 'Carol Lee',     avatar: 'https://via.placeholder.com/80' },
  
];

export default function RequestsPage() {
  const renderItem = ({ item }: { item: typeof REQUESTS[0] }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, styles.accept]}
          onPress={() => console.log('Accepted', item.id)}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.decline]}
          onPress={() => console.log('Declined', item.id)}
        >
          <Text style={styles.buttonText}>Decline</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <FlatList
      data={REQUESTS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    // soft shadow on Android/iOS
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  accept: {
    backgroundColor: '#4CAF50',
  },
  decline: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
});
