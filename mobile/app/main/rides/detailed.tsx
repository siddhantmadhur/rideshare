/* eslint-disable import/no-unresolved */
import { useSearchParams } from 'expo-router/build/hooks'
import { useEffect, useState } from 'react'
import { View, Text, Dimensions, ScrollView, StyleSheet, Animated, Platform } from 'react-native'
import { RideInfo } from '.'
import { ProgressBar, Card, Title, Paragraph, useTheme, Button } from 'react-native-paper'
import { SERVER_URL } from '@/lib/constants'
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps'
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler'

interface RouteCoordinate {
    latitude: number
    longitude: number
}

const DetailedRideInformation = () => {
    const searchParams = useSearchParams()
    const theme = useTheme()
    const [rideInfo, setRideInfo] = useState<RideInfo | null>(null)
    const [routeCoordinates, setRouteCoordinates] = useState<RouteCoordinate[]>([])
    const [pickupCoords, setPickupCoords] = useState<RouteCoordinate | null>(null)
    const [dropoffCoords, setDropoffCoords] = useState<RouteCoordinate | null>(null)
    const [loading, setLoading] = useState(true)
    
    // Bottom sheet animation
    const screenHeight = Dimensions.get('window').height
    const bottomSheetHeight = screenHeight * 0.7 // 70% of screen
    const collapsedPosition = bottomSheetHeight - 80 // Show handle when collapsed
    const expandedPosition = screenHeight * 0.3 // Stop at 30% from top when expanded
    const translateY = new Animated.Value(collapsedPosition)
    const gestureTranslateY = new Animated.Value(0)
    
    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: gestureTranslateY } }],
        { useNativeDriver: true }
    )
    
    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationY, velocityY } = event.nativeEvent
            
            // Calculate final position  
            const finalPosition = translationY + (translateY as any)._value
            
            // Determine if should snap to open or closed
            const midPoint = (expandedPosition + collapsedPosition) / 2
            const shouldOpen = velocityY < -500 || finalPosition < midPoint
            
            const targetPosition = shouldOpen ? expandedPosition : collapsedPosition
            
            // Reset gesture translation
            gestureTranslateY.setValue(0)
            
            // Animate to target
            Animated.spring(translateY, {
                toValue: targetPosition,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start()
        }
    }
    
    // Combine the base position with gesture translation and clamp it
    const combinedTranslateY = Animated.add(translateY, gestureTranslateY).interpolate({
        inputRange: [expandedPosition - 50, expandedPosition, collapsedPosition, collapsedPosition + 50],
        outputRange: [expandedPosition, expandedPosition, collapsedPosition, collapsedPosition],
        extrapolate: 'clamp'
    })

    const fetchRouteData = async (pickupPlaceId: string, dropoffPlaceId: string) => {
        const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY ?? ""
        
        try {
            // Get coordinates for pickup and dropoff locations
            const pickupResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${pickupPlaceId}&fields=geometry&key=${GOOGLE_API_KEY}`
            )
            const dropoffResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${dropoffPlaceId}&fields=geometry&key=${GOOGLE_API_KEY}`
            )

            if (pickupResponse.ok && dropoffResponse.ok) {
                const pickupData = await pickupResponse.json()
                const dropoffData = await dropoffResponse.json()

                const pickup = {
                    latitude: pickupData.result.geometry.location.lat,
                    longitude: pickupData.result.geometry.location.lng,
                }
                const dropoff = {
                    latitude: dropoffData.result.geometry.location.lat,
                    longitude: dropoffData.result.geometry.location.lng,
                }

                setPickupCoords(pickup)
                setDropoffCoords(dropoff)

                // Get directions using the new Routes API
                const routesResponse = await fetch(
                    `https://routes.googleapis.com/directions/v2:computeRoutes`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Goog-Api-Key': GOOGLE_API_KEY,
                            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
                        },
                        body: JSON.stringify({
                            origin: {
                                placeId: pickupPlaceId
                            },
                            destination: {
                                placeId: dropoffPlaceId
                            },
                            travelMode: 'DRIVE',
                            routingPreference: 'TRAFFIC_AWARE',
                            computeAlternativeRoutes: false,
                            routeModifiers: {
                                avoidTolls: false,
                                avoidHighways: false,
                                avoidFerries: false
                            }
                        })
                    }
                )

                console.log('Routes API response status:', routesResponse.status)
                if (routesResponse.ok) {
                    const routesData = await routesResponse.json()
                    console.log('Routes data:', routesData)
                    if (routesData.routes && routesData.routes.length > 0) {
                        const encodedPolyline = routesData.routes[0].polyline.encodedPolyline
                        console.log('Encoded polyline:', encodedPolyline)
                        const decodedPoints = decodePolyline(encodedPolyline)
                        console.log('Decoded points count:', decodedPoints.length)
                        console.log('First few decoded points:', decodedPoints.slice(0, 3))
                        setRouteCoordinates(decodedPoints)
                    } else {
                        console.log('No routes found in Routes API response')
                    }
                } else {
                    const errorText = await routesResponse.text()
                    console.error('Routes API error:', errorText)
                }
            }
        } catch (error) {
            console.error('Error fetching route data:', error)
        }
    }

    // Function to decode Google's polyline encoding
    const decodePolyline = (encoded: string): RouteCoordinate[] => {
        const poly = []
        let index = 0
        const len = encoded.length
        let lat = 0
        let lng = 0

        while (index < len) {
            let b
            let shift = 0
            let result = 0
            do {
                b = encoded.charCodeAt(index++) - 63
                result |= (b & 0x1f) << shift
                shift += 5
            } while (b >= 0x20)
            const dlat = result & 1 ? ~(result >> 1) : result >> 1
            lat += dlat

            shift = 0
            result = 0
            do {
                b = encoded.charCodeAt(index++) - 63
                result |= (b & 0x1f) << shift
                shift += 5
            } while (b >= 0x20)
            const dlng = result & 1 ? ~(result >> 1) : result >> 1
            lng += dlng

            poly.push({
                latitude: lat / 1e5,
                longitude: lng / 1e5,
            })
        }
        return poly
    }

    const fetchRideInfo = async (ride_id: string) => {
        const res = await fetch(`${SERVER_URL}/rides/${ride_id}`)
        if (res.ok) {
            const data = await res.json()
            const ride = data["info"] as RideInfo
            setRideInfo(ride)
            
            // Parse pickup and dropoff to get place IDs
            const pickup = JSON.parse(ride.pickup)
            const dropoff = JSON.parse(ride.dropoff)
            
            if (pickup.id && dropoff.id) {
                await fetchRouteData(pickup.id, dropoff.id)
            }
        } else {
            console.log("not ok!")
        }
        setLoading(false)
    }

    useEffect(() => {
        const ride_id = searchParams.get('ride_id')
        if (ride_id) {
            console.log('ID Exist: ', ride_id)
            fetchRideInfo(ride_id)
        }
    }, [])

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ProgressBar />
                <Text style={{ marginTop: 10 }}>Loading route...</Text>
            </View>
        )
    }

    if (!rideInfo) {
        return <Text>Ride not found</Text>
    }

    const pickup = JSON.parse(rideInfo.pickup)
    const dropoff = JSON.parse(rideInfo.dropoff)

    console.log('Rendering with routeCoordinates length:', routeCoordinates.length)
    console.log('Pickup coords:', pickupCoords)
    console.log('Dropoff coords:', dropoffCoords)
    if (routeCoordinates.length > 0) {
        console.log('Route coordinates sample:', routeCoordinates.slice(0, 5))
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            {pickupCoords && dropoffCoords && (
                <MapView
                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                    style={styles.fullScreenMap}
                    initialRegion={{
                        latitude: (pickupCoords.latitude + dropoffCoords.latitude) / 2,
                        longitude: (pickupCoords.longitude + dropoffCoords.longitude) / 2,
                        latitudeDelta: Math.abs(pickupCoords.latitude - dropoffCoords.latitude) * 1.5 || 0.01,
                        longitudeDelta: Math.abs(pickupCoords.longitude - dropoffCoords.longitude) * 1.5 || 0.01,
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    showsCompass={true}
                    showsScale={true}
                    showsBuildings={true}
                    showsTraffic={true}
                    rotateEnabled={true}
                    scrollEnabled={true}
                    zoomEnabled={true}
                    pitchEnabled={true}
                >
                    <Marker
                        coordinate={pickupCoords}
                        title="Pickup Location"
                        description={pickup.title}
                        pinColor="green"
                    />
                    <Marker
                        coordinate={dropoffCoords}
                        title="Dropoff Location"
                        description={dropoff.title}
                        pinColor="red"
                    />
                    {routeCoordinates.length > 0 ? (
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor="#0066FF"
                            strokeWidth={6}
                            geodesic={true}
                            zIndex={1000}
                        />
                    ) : null}
                </MapView>
            )}
            
            {/* Draggable Bottom Sheet */}
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
            >
                <Animated.View
                    style={[
                        styles.bottomSheet,
                        {
                            transform: [{ translateY: combinedTranslateY }],
                            height: bottomSheetHeight,
                        },
                    ]}
                >
                    {/* Drag Handle */}
                    <View style={styles.dragHandle} />
                    
                    <ScrollView style={styles.bottomSheetContent}>
                        <View style={styles.rideHeader}>
                            <Text style={styles.routeTitle}>
                                {pickup.title?.split(",")[0]} → {dropoff.title?.split(",")[0]}
                            </Text>
                            <Text style={styles.rideTime}>
                                Pick Up: {rideInfo.date} at {rideInfo.time}
                            </Text>
                        </View>

                        <View style={styles.rideDetails}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Pickup:</Text>
                                <Text style={styles.detailValue}>{pickup.title}</Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Dropoff:</Text>
                                <Text style={styles.detailValue}>{dropoff.title}</Text>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Passengers:</Text>
                                <Text style={styles.detailValue}>{rideInfo.passengers}</Text>
                            </View>

                            {rideInfo.has_car && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Car:</Text>
                                    <Text style={styles.detailValue}>{rideInfo.car_model}</Text>
                                </View>
                            )}

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Transportation:</Text>
                                <Text style={styles.detailValue}>
                                    {rideInfo.has_car ? 'Driver has car' : 'Rideshare/Public transit'}
                                </Text>
                            </View>

                            {(rideInfo.split_gas || rideInfo.split_uber) && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Cost sharing:</Text>
                                    <Text style={styles.detailValue}>
                                        {rideInfo.split_gas && 'Split gas costs'}
                                        {rideInfo.split_uber && 'Split rideshare costs'}
                                    </Text>
                                </View>
                            )}

                            {rideInfo.environment && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Preferences:</Text>
                                    <Text style={styles.detailValue}>{rideInfo.environment}</Text>
                                </View>
                            )}

                            {rideInfo.notes && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Notes:</Text>
                                    <Text style={styles.detailValue}>{rideInfo.notes}</Text>
                                </View>
                            )}
                        </View>

                        <Button
                            mode="contained"
                            style={styles.acceptButton}
                            onPress={() => {
                                // TODO: Implement accept ride functionality
                                console.log('Accept ride pressed')
                            }}
                        >
                            Accept Ride
                        </Button>
                    </ScrollView>
                </Animated.View>
            </PanGestureHandler>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenMap: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    bottomSheetContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    rideHeader: {
        marginBottom: 20,
    },
    routeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    rideTime: {
        fontSize: 14,
        color: '#666',
    },
    rideDetails: {
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        width: 100,
    },
    detailValue: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    acceptButton: {
        marginVertical: 20,
        marginBottom: 40,
    },
})

export default DetailedRideInformation
