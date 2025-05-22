// --- app/offer/form.tsx ---
// Polyfill for crypto.getRandomValues() needed by GooglePlacesAutocomplete
// @ts-ignore - Polyfill for missing crypto in React Native
if (typeof global.crypto !== 'object') {
  // @ts-ignore
  global.crypto = {};
}
// @ts-ignore
if (typeof global.crypto.getRandomValues !== 'function') {
  // @ts-ignore
  global.crypto.getRandomValues = function (array: any) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

import { View, Text, TextInput, Button, StyleSheet, ScrollView, Switch, Pressable, Platform, Alert, ActivityIndicator } from 'react-native';
import { useOffer, LocationData } from '../../context/OfferContext';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';

const GOOGLE_API_KEY = 'AIzaSyDDo5-qCptGQBi5S5wGpxkm8obGoPZLmLk'; // Your API Key

async function geocodeAddress(address: string): Promise<LocationData | null> {
  if (!address.trim()) return null;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    if (json.results && json.results.length > 0) {
      const location = json.results[0].geometry.location;
      return { latitude: location.lat, longitude: location.lng };
    } else {
      console.warn('Geocoding failed:', json.status, json.error_message);
      return null;
    }
  } catch (error) {
    console.error('Geocoding fetch error:', error);
    return null;
  }
}

export default function OfferForm() {
  const { setRide, ride } = useOffer();
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [selectedDateValue, setSelectedDateValue] = useState(new Date());
  const [selectedTimeValue, setSelectedTimeValue] = useState(new Date());

  // Local state for address strings and loading
  const [startAddress, setStartAddress] = useState(
    typeof ride.startLocation === 'string' ? ride.startLocation : (ride.startLocationAddress || '')
  );
  const [endAddress, setEndAddress] = useState(
    typeof ride.endLocation === 'string' ? ride.endLocation : (ride.endLocationAddress || '')
  );
  const [isGeocodingStart, setIsGeocodingStart] = useState(false);
  const [isGeocodingEnd, setIsGeocodingEnd] = useState(false);

  const isGasSplit = ride.splitGas !== 'No';

  const handleDateTimeChange = (newDate?: Date, newTime?: Date) => {
    const currentDate = newDate || selectedDateValue;
    const currentTime = newTime || selectedTimeValue;
    const combinedDateTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      currentTime.getHours(),
      currentTime.getMinutes(),
      currentTime.getSeconds()
    );
    setRide({ time: combinedDateTime.toISOString() });
  };

  const handleGeocode = async (address: string, type: 'start' | 'end') => {
    if (type === 'start') {
      setIsGeocodingStart(true);
    } else {
      setIsGeocodingEnd(true);
    }

    const locationData = await geocodeAddress(address);
    
    if (locationData) {
      if (type === 'start') {
        setRide({ startLocation: locationData, startLocationAddress: address });
      } else {
        setRide({ endLocation: locationData, endLocationAddress: address });
      }
    } else {
      // Show user-friendly error and keep the string
      Alert.alert(
        'Address not found', 
        `Could not find coordinates for "${address}". Please check the spelling and try again.`
      );
      if (type === 'start') {
        setRide({ startLocation: address, startLocationAddress: address });
      } else {
        setRide({ endLocation: address, endLocationAddress: address });
      }
    }

    if (type === 'start') {
      setIsGeocodingStart(false);
    } else {
      setIsGeocodingEnd(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Enter Details on your Ride Offer</Text>

      <TextInput
        placeholder="Number of Passengers"
        style={styles.input}
        value={ride.passengers}
        onChangeText={(text) => setRide({ passengers: text })}
        keyboardType="numeric"
      />

      <View style={styles.switchRow}>
        <Text>Split Gas?</Text>
        <Switch
          value={isGasSplit}
          onValueChange={(value) => setRide({ splitGas: value ? 'Yes' : 'No' })}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pickup Location:</Text>
        <View style={styles.inputWithLoader}>
          <TextInput
            placeholder="Enter pickup address (e.g., UCSC, Santa Cruz, CA)"
            style={[styles.input, styles.addressInput]}
            value={startAddress}
            onChangeText={setStartAddress}
            onBlur={() => {
              if (startAddress.trim()) {
                handleGeocode(startAddress, 'start');
              }
            }}
            editable={!isGeocodingStart}
          />
          {isGeocodingStart && (
            <ActivityIndicator 
              size="small" 
              color="#007AFF" 
              style={styles.loadingIndicator} 
            />
          )}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Dropoff Location:</Text>
        <View style={styles.inputWithLoader}>
          <TextInput
            placeholder="Enter destination address"
            style={[styles.input, styles.addressInput]}
            value={endAddress}
            onChangeText={setEndAddress}
            onBlur={() => {
              if (endAddress.trim()) {
                handleGeocode(endAddress, 'end');
              }
            }}
            editable={!isGeocodingEnd}
          />
          {isGeocodingEnd && (
            <ActivityIndicator 
              size="small" 
              color="#007AFF" 
              style={styles.loadingIndicator} 
            />
          )}
        </View>
      </View>

      <TextInput
        placeholder="Car Model"
        style={styles.input}
        value={ride.carModel}
        onChangeText={(text) => setRide({ carModel: text })}
      />

      <Pressable onPress={() => setShowDate(true)} style={styles.input}>
        <Text>{ride.time ? new Date(ride.time).toLocaleDateString() : 'Select Date'}</Text>
      </Pressable>

      <Pressable onPress={() => setShowTime(true)} style={styles.input}>
        <Text>{ride.time ? new Date(ride.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select Time'}</Text>
      </Pressable>

      {showDate && (
        <DateTimePicker
          mode="date"
          value={selectedDateValue}
          minimumDate={new Date()}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowDate(false);
            if (date) {
              setSelectedDateValue(date);
              handleDateTimeChange(date, undefined);
            }
          }}
        />
      )}

      {showTime && (
        <DateTimePicker
          mode="time"
          value={selectedTimeValue}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, time) => {
            setShowTime(false);
            if (time) {
              setSelectedTimeValue(time);
              handleDateTimeChange(undefined, time);
            }
          }}
        />
      )}

      <TextInput
        placeholder="Car Environment"
        style={styles.input}
        value={ride.environment}
        onChangeText={(text) => setRide({ environment: text })}
      />

      <TextInput
        placeholder="Other notes"
        style={styles.input}
        multiline
        value={ride.notes}
        onChangeText={(text) => setRide({ notes: text })}
      />

      <Button title="Next" onPress={() => router.push('/offer/review')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputWithLoader: {
    position: 'relative',
  },
  addressInput: {
    paddingRight: 40, // Make room for loading indicator
  },
  loadingIndicator: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
});
