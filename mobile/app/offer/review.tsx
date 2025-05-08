// --- app/offer/review.tsx ---
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useOffer } from '../../context/OfferContext';
import { router } from 'expo-router';
import auth from '@react-native-firebase/auth'; 

export default function ReviewOffer() {
  const { ride, resetRide } = useOffer();

  const submitRide = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('User not logged in');
      }
      const token = await currentUser.getIdToken(); 
  
      const response = await fetch('http://localhost:8080/rides/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Firebase Auth
        },
        body: JSON.stringify({
          pickup: ride.pickup,
          dropoff: ride.dropoff,
          notes: ride.notes || '',
          timestamp: new Date(`${ride.date}T${ride.time}:00`).toISOString(),
                  // Do not send user_id — backend can extract it from token

        }),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Submission failed');
      }

      Alert.alert('Ride offer created!');
      resetRide(); // clear form
      router.replace('/offer/thank-you');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to submit ride');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Confirm your offer details</Text>

      <View style={styles.card}>
        <Text>Pickup: {ride.pickup}</Text>
        <Text>Dropoff: {ride.dropoff}</Text>
        <Text>Passengers: {ride.passengers}</Text>
        <Text>Split Gas: {ride.splitGas}</Text>
        <Text>Car: {ride.carModel}</Text>
        <Text>Date: {ride.date}</Text>
        <Text>Time: {ride.time}</Text>
        <Text>Environment: {ride.environment}</Text>
        <Text>Notes: {ride.notes}</Text>
      </View>

      <Button title="Submit" onPress={submitRide} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
});

