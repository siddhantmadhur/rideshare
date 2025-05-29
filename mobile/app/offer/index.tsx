import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import { useOffer } from '../../context/OfferContext';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from 'expo-router';

type Ride = {
  id: number;
  user_id: string;
  pickup: string;
  dropoff: string;
  passengers?: string;
  date?: string;
  time?: string;
  has_car?: boolean;
  willing_to_split_gas?: boolean;
  willing_to_split_uber?: boolean;
};

export default function OfferList() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  useFocusEffect(
    useCallback(() => {
      const fetchRides = async () => {
        try {
          const user = auth().currentUser;
          if (!user) throw new Error("Not signed in");

          const token = await user.getIdToken();

          const res = await fetch('http://localhost:8080/rides', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          setRides(data);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchRides();

    }, [])
  
  );
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Ride Offers</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item, index) => item?.id?.toString?.() ?? index.toString()} // for rides that have undef vals, only on test values
          renderItem={({ item }) => {
            const currentUserId = auth().currentUser?.uid;
            const isOwner = item.user_id === currentUserId;
            console.log("Ride ID:", item.id);
            console.log("Ride user_id:", item.user_id);
            console.log("Current user ID:", auth().currentUser?.uid);

                        
            return (
              <View style={styles.card}>
                <Text>Pickup: {(item.pickup ?? 'N/A').toString()}</Text>
                <Text>Dropoff: {(item.dropoff ?? 'N/A').toString()}</Text>
                <Text>Seats Available: {(item.passengers ?? 'N/A').toString()}</Text>  {/* to do: logic for ppl accepting/ leaving rides --> seats decr/incr */}
                <Text>Date: {(item.date ?? 'N/A').toString()}</Text>
                <Text>Time: {(item.time)}</Text>
                <Text>Has Car: {item.has_car ? 'Yes' : 'No'}</Text>
                {item.has_car && (
                  <Text>Willing to Split Gas: {item.willing_to_split_gas ? 'Yes' : 'No'}</Text>
                )}

                {item.has_car === false && (
                  <Text>Willing to Split Uber: {item.willing_to_split_uber ? 'Yes' : 'No'}</Text>
                )}
                {item.id && (
                  <TouchableOpacity
                    style={{ marginTop: 8, backgroundColor: '#007aff', padding: 8, borderRadius: 5 }}
                    onPress={() => router.push({ pathname: "/offer/edit", params: { id: item.id.toString() } })}
                  >
                    <Text style={{ color: 'white', textAlign: 'center' }}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
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
