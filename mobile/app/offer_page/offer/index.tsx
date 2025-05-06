import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useOffer } from '../../context/OfferContext';
import { router } from 'expo-router';

export default function OfferList() {
  const { submittedRides } = useOffer();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Ride Offers</Text>

      <FlatList
        data={submittedRides}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Seats Available: {item.passengers}</Text>  {/* to do: logic for ppl accepting/ leaving rides --> seats decr/incr */}
            <Text>Pickup: {item.pickup}</Text>
            <Text>Dropoff: {item.dropoff}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Time: {item.time}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No offers yet.</Text>}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/offer/form')}>
        <Text style={styles.addText}>+ New Offer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  card: {
    backgroundColor: '#eee',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    backgroundColor: '#007aff',
    padding: 14,
    borderRadius: 50,
  },
  addText: { color: 'white', fontWeight: '600' },
});
