// --- app/offer/review.tsx ---
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native'
import { useOffer } from '@/context/OfferContext'
import { router } from 'expo-router'
import auth from '@react-native-firebase/auth'
import { toISOIfValid } from '@/app/utils/dateUtils'
import { SERVER_URL } from '@/lib/constants'

export default function ReviewOffer() {
    const { ride, resetRide } = useOffer()

    const submitRide = async () => {
        try {
            const currentUser = auth().currentUser
            if (!currentUser) {
                throw new Error('User not logged in')
            }

            if (!ride.date || !ride.time) {
                throw new Error('Missing date or time')
            }
            const token = await currentUser.getIdToken(false)

            const response = await fetch(`${SERVER_URL}/rides/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Firebase Auth
                },
                body: JSON.stringify({
                    pickup: ride.pickup,
                    dropoff: ride.dropoff,
                    notes: ride.notes || '',
                    timestamp: toISOIfValid(ride.date, ride.time),
                    hasCar: ride.hasCar === true,
                    split_gas: ride.hasCar === true && ride.splitGas === true,
                    split_uber:
                        ride.hasCar === false && ride.splitUber === true,
                    passengers: ride.passengers,
                    date: ride.date,
                    time: ride.time,
                    car_model: ride.carModel,
                    environment: ride.environment,
                }),
            })

            console.log('Status Code:', response.status)
            const responseText = await response.text() // read once

            if (!response.ok) {
                throw new Error(responseText || 'Submission failed')
            }

            console.log('Server response:', responseText)

            Alert.alert('Ride offer created!')
            resetRide() // clear form
            router.replace('/main/offer/thank-you')
        } catch (err: any) {
            console.error(err)
            Alert.alert('Error', err.message || 'Failed to submit ride')
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Confirm your offer details</Text>

            <View style={styles.card}>
                <Text>Pickup: {ride.pickup}</Text>
                <Text>Dropoff: {ride.dropoff}</Text>
                <Text>Passengers: {ride.passengers}</Text>
                <Text>Has Car: {ride.hasCar}</Text>
                {ride.hasCar === true && (
                    <Text>Willing to Split Gas: {ride.splitGas}</Text>
                )}
                {ride.hasCar === false && (
                    <Text>Willing to Split Uber: {ride.splitUber}</Text>
                )}
                <Text>Car: {ride.carModel}</Text>
                <Text>Date: {ride.date}</Text>
                <Text>Time: {ride.time}</Text>
                <Text>Environment: {ride.environment}</Text>
                <Text>Notes: {ride.notes}</Text>
            </View>

            <Button title="Submit" onPress={submitRide} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
})
