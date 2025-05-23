import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useOffer, LocationData, RideDetails } from '../../context/OfferContext';
import { router } from 'expo-router';

// Helper to display location (can be moved to a shared utils file)
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

// Helper to format ISO date string (can be moved to a shared utils file)
const formatDisplayDateTime = (isoString: string | undefined): string => {
  if (!isoString) return 'Not specified';
  try {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (e) {
    return 'Invalid date/time';
  }
};

export default function OfferList() {
  const { submittedRides } = useOffer();

  const renderRideItem = ({ item }: { item: RideDetails }) => (
    <View style={styles.card}>
      <Text>Pickup: {formatLocationForDisplay(item.startLocation, item.startLocationAddress)}</Text>
      <Text>Dropoff: {formatLocationForDisplay(item.endLocation, item.endLocationAddress)}</Text>
      <Text>Date & Time: {formatDisplayDateTime(item.time)}</Text>
      <Text>Seats Available: {item.passengers || 'N/A'}</Text>
      {/* Add other details you want to show in the list */}
      {/* e.g., <Text>Car: {item.carModel || 'N/A'}</Text> */}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Ride Offers</Text>

      <FlatList
        data={submittedRides}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderRideItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No offers yet. Tap 'New Offer' to create one.</Text>}
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
  emptyText: { textAlign: 'center', marginTop: 20 },
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
