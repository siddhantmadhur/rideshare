// --- app/offer/review.tsx ---
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useOffer } from '../../context/OfferContext';
import { router } from 'expo-router';

export default function ReviewOffer() {
  const { ride } = useOffer();

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

      <Button title="Submit" onPress={() => router.push('/offer/thank-you')} />
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

