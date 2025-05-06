// --- app/offer/form.tsx ---
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Switch, Pressable, Platform } from 'react-native';
import { useOffer } from '../../context/OfferContext';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';

export default function OfferForm() {
  const { setRide, ride } = useOffer();
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const isGasSplit = ride.splitGas !== 'No';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Enter Details on your Ride Offer</Text>

      <TextInput
        placeholder="Number of Passengers"
        style={styles.input}
        value={ride.passengers}
        onChangeText={(text) => setRide({ passengers: text })}
      />

      <View style={styles.switchRow}>
        <Text>Split Gas?</Text>
        <Switch
          value={isGasSplit}
          onValueChange={(value) => setRide({ splitGas: value ? 'Yes' : 'No' })}
        />
      </View>

      <TextInput
        placeholder="Pickup Location"
        style={styles.input}
        value={ride.pickup}
        onChangeText={(text) => setRide({ pickup: text })}
      />

      <TextInput
        placeholder="Dropoff Location"
        style={styles.input}
        value={ride.dropoff}
        onChangeText={(text) => setRide({ dropoff: text })}
      />

      <TextInput
        placeholder="Car Model"
        style={styles.input}
        value={ride.carModel}
        onChangeText={(text) => setRide({ carModel: text })}
      />

      <Pressable onPress={() => setShowDate(true)} style={styles.input}>
        <Text>{ride.date || 'Select Date'}</Text>
      </Pressable>

      <Pressable onPress={() => setShowTime(true)} style={styles.input}>
        <Text>{ride.time || 'Select Time'}</Text>
      </Pressable>

      {showDate && (
        <DateTimePicker
          mode="date"
          value={new Date()}
          minimumDate={new Date()}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDate(false);
            if (selectedDate) {
              const dateStr = selectedDate.toLocaleDateString();
              setRide({ date: dateStr });
            }
          }}
        />
      )}

      {showTime && (
        <DateTimePicker
          mode="time"
          value={new Date()}
          minimumDate={new Date()}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowTime(false);
            if (selectedDate) {
              const timeStr = selectedDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              setRide({ time: timeStr });
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
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
});
