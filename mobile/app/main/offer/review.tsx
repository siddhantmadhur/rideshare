import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { useOffer } from '@/context/OfferContext'
import { router } from 'expo-router'
import auth from '@react-native-firebase/auth'
import { toISOIfValid } from '@/app/utils/dateUtils'
import { SERVER_URL } from '@/lib/constants'
import { Card, Text, Button, Divider, useTheme, Chip } from 'react-native-paper'

const cleanLocation = (fullTitle?: string) => {
  if (!fullTitle) return '-'
  const parts = fullTitle.split(',').map(part => part.trim())
  return parts.length >= 2 ? `${parts[0]}, ${parts[1]}` : parts[0]
}

const InfoRow = ({ label, value, valueColor }: { label: string; value: any; valueColor?: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, valueColor && { color: valueColor }]}>{value || '-'}</Text>
  </View>
)

export default function ReviewOffer() {
  const { ride, resetRide } = useOffer()
  const theme = useTheme()

  const submitRide = async () => {
    try {
      const currentUser = auth().currentUser
      if (!currentUser) throw new Error('User not logged in')
      if (!ride.date || !ride.time) throw new Error('Missing date or time')

      const token = await currentUser.getIdToken(false)

      const response = await fetch(`${SERVER_URL}/rides/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pickup: JSON.stringify(ride.pickup),
          dropoff: JSON.stringify(ride.dropoff),
          notes: ride.notes || '',
          timestamp: toISOIfValid(ride.date, ride.time),
          hasCar: ride.hasCar === true,
          split_gas: ride.hasCar === true && ride.splitGas === true,
          split_uber: ride.hasCar === false && ride.splitUber === true,
          passengers: ride.passengers,
          date: ride.date,
          time: ride.time,
          car_model: ride.carModel,
          environment: ride.environment,
        }),
      })

      const responseText = await response.text()
      if (!response.ok) throw new Error(responseText || 'Submission failed')

      Alert.alert('Ride offer created!')
      resetRide()
      router.replace('/main/offer/thank-you')
    } catch (err: any) {
      console.error(err)
      Alert.alert('Error', err.message || 'Failed to submit ride')
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Review Your Ride Offer</Text>

      <Card style={styles.card}>
        <Card.Content>
          <InfoRow label="Pickup" value={cleanLocation(ride.pickup?.title)} valueColor={theme.colors.primary} />
          <Divider />
          <InfoRow label="Dropoff" value={cleanLocation(ride.dropoff?.title)} valueColor={theme.colors.primary} />
          <Divider />
          <InfoRow
            label="Date"
            value={ride.date ? new Date(ride.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
            valueColor={theme.colors.primary}
            />
          <Divider />
          <InfoRow label="Time" value={ride.time} valueColor={theme.colors.primary} />
          <Divider />
          <InfoRow label="Passengers" value={ride.passengers} valueColor={theme.colors.primary} />
          <Divider />
          <InfoRow label="Has Car" value={ride.hasCar ? 'Yes' : 'No'} valueColor={theme.colors.primary} />

          {ride.hasCar === true && (
            <>
              <Divider />
              <InfoRow label="Car Model" value={ride.carModel} valueColor={theme.colors.primary} />
              <Divider />
              <InfoRow label="Split Gas" value={ride.splitGas ? 'Yes' : 'No'} valueColor={theme.colors.primary} />
            </>
          )}

          {ride.hasCar === false && (
            <>
              <Divider />
              <InfoRow label="Split Uber" value={ride.splitUber ? 'Yes' : 'No'} valueColor={theme.colors.primary} />
            </>
          )}

          <Divider />
          <InfoRow label="Environment" value={ride.environment} valueColor={theme.colors.primary} />

          {ride.notes && (
            <>
              <Divider />
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={[styles.notes, { color: theme.colors.primary }]}>{ride.notes}</Text>
            </>
          )}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={submitRide}
        style={styles.submitButton}
        buttonColor={theme.colors.primary}
        labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
      >
        Submit Ride
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2a2a2a',
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#fff7f0',
    elevation: 4,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
    color: '#555',
  },
  value: {
    color: '#111',
    maxWidth: '60%',
    textAlign: 'right',
    fontSize: 16,
  },
  notesLabel: {
    marginTop: 12,
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
  },
  notes: {
    marginTop: 4,
    fontSize: 15,
  },
  submitButton: {
    marginTop: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
})
