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
  }
});
