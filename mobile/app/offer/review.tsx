// --- app/offer/review.tsx ---
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useOffer, LocationData } from '../../context/OfferContext';
import { router } from 'expo-router';

// Helper to display location
const formatLocationForDisplay = (locationData: LocationData | string | undefined, addressString: string | undefined): string => {
  // Prioritize the human-readable address if available
  if (addressString && addressString.trim()) {
    return addressString;
  }
  // Fallback to showing coordinates if no address string is available
  if (!locationData) return 'Not specified';
  if (typeof locationData === 'string') return locationData;
  return `Lat: ${locationData.latitude.toFixed(4)}, Lng: ${locationData.longitude.toFixed(4)}`;
};

// Helper to format ISO date string
const formatDateTime = (isoString: string | undefined): string => {
  if (!isoString) return 'Not specified';
  try {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (e) {
    return 'Invalid date/time';
  }
};

export default function ReviewOffer() {
  const { ride } = useOffer();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Confirm your offer details</Text>

      <View style={styles.card}>
        <Text>Pickup: {formatLocationForDisplay(ride.startLocation, ride.startLocationAddress)}</Text>
        <Text>Dropoff: {formatLocationForDisplay(ride.endLocation, ride.endLocationAddress)}</Text>
        <Text>Date & Time: {formatDateTime(ride.time)}</Text>
        <Text>Passengers: {ride.passengers || 'Not specified'}</Text>
        <Text>Split Gas: {ride.splitGas || 'Not specified'}</Text>
        <Text>Car: {ride.carModel || 'Not specified'}</Text>
        <Text>Environment: {ride.environment || 'Not specified'}</Text>
        <Text>Notes: {ride.notes || 'Not specified'}</Text>
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

