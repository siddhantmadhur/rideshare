import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import { useOffer } from '../../context/OfferContext';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';

type Ride = {
  id: number;
  pickup: string;
  dropoff: string;
  passengers?: string;
  date?: string;
  time?: string;
};

export default function OfferList() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/rides') // use IP adress instead of localhost since we are running backend
      .then((res) => res.json())
      .then((data) => setRides(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Ride Offers</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>Pickup: {item.pickup}</Text>
              <Text>Dropoff: {item.dropoff}</Text>
              <Text>Seats Available: {item.passengers || 'N/A'}</Text>  {/* to do: logic for ppl accepting/ leaving rides --> seats decr/incr */}
              <Text>Date: {item.date}</Text>
              <Text>Time: {item.time}</Text>
            </View>
          )}
          ListEmptyComponent={<Text>No offers yet.</Text>}
        />
      )}

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
