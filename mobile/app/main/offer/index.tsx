/* eslint-disable import/no-unresolved */
import Constants from 'expo-constants'
import {
    View,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect, useCallback } from 'react'
import auth from '@react-native-firebase/auth'
import { useFocusEffect } from 'expo-router'
import { SERVER_URL } from '@/lib/constants'
import { PlaceObj } from './form'
import { Card, Text, Button, Divider } from 'react-native-paper'


type Ride = {
    id: number
    user_id: string
    pickup: PlaceObj
    dropoff: PlaceObj
    passengers?: string
    date?: string
    time?: string
    has_car?: boolean
    willing_to_split_gas?: boolean
    willing_to_split_uber?: boolean
}

export default function OfferList() {
    const [rides, setRides] = useState<Ride[]>([])
    const [loading, setLoading] = useState(true)
    useFocusEffect(
        useCallback(() => {
            const fetchRides = async () => {
                try {
                    const user = auth().currentUser
                    if (!user) throw new Error('Not signed in')

                    const token = await user.getIdToken()
                    const res = await fetch(`${SERVER_URL}/rides/user`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })

                    const data = await res.json()
                    setRides(data)
                } catch (err) {
                    console.error('Fetch error:', err)
                } finally {
                    setLoading(false)
                }
            }
            fetchRides()
        }, [])
    )
    const confirmDelete = (rideId: number) => {
        Alert.alert(
            'Delete Ride',
            'Are you sure you want to delete this ride?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteRide(rideId),
                },
            ]
        )
    }

    const deleteRide = async (rideId: number) => {
        try {
            const token = await auth().currentUser?.getIdToken()
            const res = await fetch(`${SERVER_URL}/rides/delete/${rideId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!res.ok) throw new Error('Failed to delete ride')

            // refresh list
            setRides((prev) => prev.filter((r) => r.id !== rideId))
            Alert.alert('Deleted', 'Ride was successfully deleted.')
        } catch (err) {
            console.error('Delete error:', err)
            Alert.alert('Error', 'Failed to delete ride.')
        }
    }

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={rides}
                    keyExtractor={(item, index) =>
                        item?.id?.toString?.() ?? index.toString()
                    } // for rides that have undef vals, only on test values
                    renderItem={({ item }) => {
                        const currentUserId = auth().currentUser?.uid
                        const isOwner = item.user_id === currentUserId

                        return (
                            <Card style={styles.card} onPress={() => router.push(`/main/offer/manage_requests?ride_id=${item.id}`)}>
                                <Card.Content>
                                <Text variant="titleMedium">
  {(() => {
    try {
      const pickup = typeof item.pickup === 'string' ? JSON.parse(item.pickup) : item.pickup
      const dropoff = typeof item.dropoff === 'string' ? JSON.parse(item.dropoff) : item.dropoff

      const extractPlaceAndCity = (fullTitle: string) => {
        const parts = fullTitle.split(',').map(s => s.trim())
        return parts.length >= 2 ? `${parts[0]}, ${parts[1]}` : fullTitle
      }

      return `${extractPlaceAndCity(pickup?.title)} → ${extractPlaceAndCity(dropoff?.title)}`
    } catch {
      return 'N/A → N/A'
    }
  })()}
</Text>




                                {/* we should j change backend to store objects so we dont hafta do this workaround */}


                                    <Divider style={{ marginVertical: 6 }} />

                                    <Text>
                                    Date: {item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A'}
                                    {' | '}
                                    Time: {item.time || 'N/A'}
                                    </Text>
                                    <Text>Seats: {item.passengers || 'N/A'}</Text>
                                    {/* to do: logic for ppl accepting/ leaving rides --> seats decr/incr */}

                                    <Text>Has Car: {item.has_car ? 'Yes' : 'No'}</Text>
                                    {item.has_car ? (
                                        <Text>Split Gas: {item.willing_to_split_gas ? 'Yes' : 'No'}</Text>
                                    ) : (
                                        <Text>Split Uber: {item.willing_to_split_uber ? 'Yes' : 'No'}</Text>
                                    )}

                                    {isOwner && (
                                        <View style={styles.buttonRow}>
                                            <Button
                                                mode="contained"
                                                style={styles.editButton}
                                                onPress={() => router.push({ pathname: '/main/offer/edit', params: { id: item.id.toString() } })}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                mode="contained"
                                                buttonColor="#D21F3C"
                                                style={styles.deleteButton}
                                                onPress={() => confirmDelete(item.id)}
                                            >
                                                Delete
                                            </Button>
                                        </View>
                                    )}
                                </Card.Content>
                            </Card>
                        )
                    }}
                    ListEmptyComponent={<Text>No offers yet.</Text>}
                />
            )}

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/main/offer/form')}
            >
                <Text style={styles.addText}>+ New Offer</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
    card: {
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 10,
    },
    editButton: {
        flex: 1,
        borderRadius: 6,
    },
    deleteButton: {
        flex: 1,
        borderRadius: 6,
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
    button: {
        backgroundColor: '#d21f3c',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
})
