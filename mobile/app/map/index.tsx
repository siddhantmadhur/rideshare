import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Modal, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { useOffer, LocationData as ContextLocationData } from '../../context/OfferContext';

// Assuming LOCATION type is { latitude: number, longitude: number }
interface LocationData {
  latitude: number;
  longitude: number;
}

interface RideOffer {
  id: string;
  ownerId: string;
  startLocation: LocationData;
  endLocation: LocationData;
  time: string; // ISO string or other date format
  passengers?: string;
  splitGas?: string;
  carModel?: string;
  pickupRadius?: number;
  dropOffRadius?: number;
  combinedCost?: number;
}

interface RideRequest {
  id: string;
  userId: string;
  offerId?: string;
  pickupLocation: LocationData;
  dropoffLocation: LocationData;
  notes?: string;
}

interface MapViewDisplayProps {
  rideOffers?: RideOffer[];
  rideRequests?: RideRequest[];
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | undefined;
}

// Add new interface for ride detail modal
interface RideDetailModalProps {
  visible: boolean;
  onClose: () => void;
  rideOffer: RideOffer | null;
}

// Mock user data - in real app this would come from user profile API
const getMockUserData = (ownerId: string) => ({
  name: ownerId === 'temp-owner' ? 'Bob' : 'John Doe',
  profileImage: 'https://via.placeholder.com/80/4A90E2/FFFFFF?text=B',
  rating: 4.8,
  reviewCount: 23,
  carInfo: {
    make: 'Toyota',
    model: 'Camry',
    color: 'Red',
    year: 2020
  }
});

const RideDetailModal: React.FC<RideDetailModalProps> = ({ visible, onClose, rideOffer }) => {
  if (!rideOffer) return null;

  const userData = getMockUserData(rideOffer.ownerId);
  
  // Format destination address - prioritize readable address
  const getDestinationAddress = () => {
    // In a real app, you'd reverse geocode the coordinates to get the address
    // For now, using mock address
    return '410 Porter Kresge Rd, Santa Cruz, CA';
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleContactUser = () => {
    Alert.alert('Contact Bob', 'This would open a chat with the driver');
  };

  const handleContactGroup = () => {
    Alert.alert('Contact Carpool Group', 'This would open the group chat');
  };

  const handleAcceptRide = () => {
    Alert.alert('Ride Request', 'Your ride request has been sent to the driver!');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Ride Details</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.modalContentWrapper}>
          <View style={styles.driverSection}>
            <Image 
              source={{ uri: userData.profileImage }} 
              style={styles.profileImage} 
            />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{userData.name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>★ {userData.rating}</Text>
                <Text style={styles.reviewCount}>({userData.reviewCount} reviews)</Text>
              </View>
              <Text style={styles.carInfo}>
                {userData.carInfo.color} {userData.carInfo.year} {userData.carInfo.make} {userData.carInfo.model}
              </Text>
            </View>
          </View>

          <View style={styles.destinationSection}>
            <Text style={styles.sectionTitle}>Destination</Text>
            <Text style={styles.destinationAddress}>{getDestinationAddress()}</Text>
            <Text style={styles.timeInfo}>Departure: {formatTime(rideOffer.time)}</Text>
          </View>

          <View style={styles.rideDetailsSection}>
            <Text style={styles.sectionTitle}>Ride Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Available Seats:</Text>
              <Text style={styles.detailValue}>{rideOffer.passengers || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cost Split:</Text>
              <Text style={styles.detailValue}>${rideOffer.combinedCost || '25.00'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactUser}>
            <Text style={styles.contactButtonText}>Message {userData.name}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactButton} onPress={handleContactGroup}>
            <Text style={styles.contactButtonText}>Message Carpool Group</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptRide}>
            <Text style={styles.acceptButtonText}>Accept Ride</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const MapViewDisplay = ({ rideOffers = [], rideRequests = [], initialRegion, onMarkerPress }: MapViewDisplayProps & { onMarkerPress: (offer: RideOffer) => void }) => {
  if (!initialRegion) {
    return null; 
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
      >
        {/* Render Ride Offer Markers (Only Destination) */}
        {rideOffers.map(offer => (
          <Marker
            key={offer.id}
            coordinate={offer.endLocation}
            title={`Destination for Offer: ${offer.id}`}
            description={`Tap for details`}
            pinColor="red"
            onPress={() => onMarkerPress(offer)}
          />
        ))}

        {/* Render Ride Request Markers */}
        {rideRequests.map(request => (
          <React.Fragment key={request.id}>
            <Marker
              coordinate={request.pickupLocation}
              title={`Request: ${request.id} (Pickup)`}
              description={`To: ${request.dropoffLocation.latitude.toFixed(4)}, ${request.dropoffLocation.longitude.toFixed(4)}`}
              pinColor="blue"
            />
            <Marker
              coordinate={request.dropoffLocation}
              title={`Request: ${request.id} (Dropoff)`}
              pinColor="purple"
            />
            {!request.offerId && (
                 <Polyline
                    coordinates={[
                        request.pickupLocation,
                        request.dropoffLocation,
                    ]}
                    strokeColor="#FF9500"
                    strokeWidth={2}
                    lineDashPattern={[1, 5]}
                />
            )}
          </React.Fragment>
        ))}
      </MapView>
    </View>
  );
};

const MapScreen = () => {
  console.log('MapScreen component is mounting!');
  
  const { submittedRides } = useOffer();
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [initialRegion, setInitialRegion] = useState<MapViewDisplayProps['initialRegion']>(undefined);
  const [selectedRide, setSelectedRide] = useState<RideOffer | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  console.log('MapScreen: submittedRides on mount:', submittedRides);

  useEffect(() => {
    console.log('MapScreen useEffect triggered');
  }, []);

  const handleMarkerPress = (offer: RideOffer) => {
    setSelectedRide(offer);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRide(null);
  };

  // Prepare rideOffers for the map, converting from context's RideDetails
  const mapFriendlyRideOffers: RideOffer[] = useMemo(() => {
    console.log('MapScreen: submittedRides from context:', submittedRides);
    
    const processedOffers = submittedRides
    .map(rideDetail => {
      console.log('Processing ride detail:', rideDetail);
      
      const id = rideDetail.id || `offer-${Math.random().toString(36).substr(2, 9)}`;
      const ownerId = rideDetail.ownerId || 'temp-owner';

      if (typeof rideDetail.startLocation === 'string' || typeof rideDetail.endLocation === 'string') {
        console.warn("Ride offer has string locations, needs geocoding:", rideDetail);
        return null;
      }
      
      if (!rideDetail.startLocation || !rideDetail.endLocation) {
          console.warn("Ride offer has undefined start or end location:", rideDetail);
          return null;
      }

      console.log('Ride offer processed successfully:', { id, ownerId, startLocation: rideDetail.startLocation, endLocation: rideDetail.endLocation });

      return {
        ...rideDetail,
        id,
        ownerId,
        startLocation: rideDetail.startLocation as ContextLocationData, 
        endLocation: rideDetail.endLocation as ContextLocationData,    
        time: rideDetail.time || new Date().toISOString(), 
      };
    })
    .filter((offer): offer is RideOffer => offer !== null);
    
    console.log('MapScreen: final mapFriendlyRideOffers:', processedOffers);
    return processedOffers;
  }, [submittedRides]);

  useEffect(() => {
    // Calculate initial region when data is available
    if (mapFriendlyRideOffers.length > 0 || rideRequests.length > 0) {
      const allLocations = [
        ...mapFriendlyRideOffers.map(o => o.startLocation),
        ...mapFriendlyRideOffers.map(o => o.endLocation),
        ...rideRequests.map(r => r.pickupLocation),
        ...rideRequests.map(r => r.dropoffLocation),
      ].filter(loc => loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number');

      if (allLocations.length > 0) {
        const latitudes = allLocations.map(loc => loc.latitude);
        const longitudes = allLocations.map(loc => loc.longitude);

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        const midLat = (minLat + maxLat) / 2;
        const midLng = (minLng + maxLng) / 2;

        const latDelta = (maxLat - minLat) * 1.5 || 0.0922;
        const lngDelta = (maxLng - minLng) * 1.5 || 0.0421;
        
        setInitialRegion({
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        });
      } else {
        setInitialRegion({
          latitude: 36.9916,
          longitude: -122.0583,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } else {
        setInitialRegion({
          latitude: 36.9916,
          longitude: -122.0583,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
    }
  }, [mapFriendlyRideOffers, rideRequests]);

  return (
    <>
      <MapViewDisplay 
        rideOffers={mapFriendlyRideOffers} 
        rideRequests={rideRequests} 
        initialRegion={initialRegion}
        onMarkerPress={handleMarkerPress}
      />
      <RideDetailModal 
        visible={modalVisible}
        onClose={handleCloseModal}
        rideOffer={selectedRide}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  closeButton: {
    padding: 8,
    width: 40,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  modalContentWrapper: {
    padding: 16,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    color: '#ffa500',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  carInfo: {
    fontSize: 14,
    color: '#666',
  },
  destinationSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  destinationAddress: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  timeInfo: {
    fontSize: 14,
    color: '#666',
  },
  rideDetailsSection: {
    marginBottom: 0,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
  },
  actionButtonsContainer: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  contactButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  acceptButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default MapScreen; 