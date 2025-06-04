// --- app/offer/thank-you.tsx ---
import { View, Text, Button, StyleSheet } from 'react-native';
import { useOffer } from '../../context/OfferContext';
import { useRouter } from 'expo-router';

export default function ThankYou() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✅</Text>
      <Text style={styles.title}>Thank you!</Text>
      <Text style={styles.text}>Your ride offer has been posted.</Text>

      <Button
        title="Return to Home"
        onPress={() => {
          router.push('/offer');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  icon: { fontSize: 48, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 10 },
  text: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
});
