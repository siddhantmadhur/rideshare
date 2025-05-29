// --- app/offer/form.tsx ---
import { Checkbox } from 'expo-checkbox';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Switch, Pressable, Platform } from 'react-native';
import { useOffer } from '../../context/OfferContext';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';

export default function OfferForm() {
  const { setRide, ride } = useOffer();
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [hasCar, setHasCar] = useState<string | null>(null);
  const [splitGasChecked, setSplitGasChecked] = useState(false);
  const [splitUberChecked, setSplitUberChecked] = useState(false);

  const updateHasCar = (value: string) => {
    setHasCar(value);
    setRide({ hasCar: value });
    if (value === 'Yes') {
      setRide({ splitUber: '' }); // Clear unrelated field
    } else {
      setRide({ splitGas: '' });
    }
  };  
  
  // for required inputs
  const validateForm = () => {
    const newErrors: { [key: string]: boolean } = {
      passengers: !ride.passengers || isNaN(Number(ride.passengers)),
      hasCar: !ride.hasCar,
      splitGas: ride.hasCar === 'Yes' && !ride.splitGas,
      splitUber: ride.hasCar === 'No' && !ride.splitUber,
      pickup: !ride.pickup,
      dropoff: !ride.dropoff,
      carModel: hasCar === 'Yes' && !ride.carModel,
      date: !ride.date,
      time: !ride.time,
      environment: !ride.environment,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Enter Details on your Ride Offer</Text>

      <TextInput
        placeholder="Number of Passengers"
        keyboardType="numeric"
        style={[styles.input,errors.passengers && styles.error]}
        value={ride.passengers}
        onChangeText={(text) => {
          setRide({ passengers: text })
          setErrors((e) => ({ ...e, passengers: false }));
        }}
      />

      <View style={styles.section}>
        <Text>Do you have a car for this ride? </Text>
        <View style={styles.subsection}>
          <Pressable onPress={() => updateHasCar('Yes')} style={styles.radioOption}>
            <Checkbox value={hasCar === 'Yes'} onValueChange={() => updateHasCar('Yes')} />
            <Text style={styles.radioLabel}>Yes</Text>
          </Pressable>
          <Pressable onPress={() => updateHasCar('No')} style={styles.radioOption}>
            <Checkbox value={hasCar === 'No'} onValueChange={() => updateHasCar('No')} />
            <Text style={styles.radioLabel}>No</Text>
          </Pressable>
        </View>
      </View>
      
      {hasCar === 'Yes' && (
        <View style={styles.section}>
          <Text>Are you willing to split gas costs?</Text>
          <Checkbox
            value={ride.splitGas === 'Yes'}
            onValueChange={(value) => setRide({ splitGas: value ? 'Yes' : 'No' })}
          />
        </View>
      )}

      {hasCar === 'No' && (
        <View style={styles.section}>
          <Text>Are you willing to split an Uber?</Text>
          <Checkbox
            value={ride.splitUber === 'Yes'}
            onValueChange={(value) => setRide({ splitUber: value ? 'Yes' : 'No' })}
          />
        </View>
      )}



      <TextInput
        placeholder="Pickup Location"
        style={[styles.input, errors.pickup && styles.error]}
        value={ride.pickup}
        onChangeText={(text) => {
          setRide({ pickup: text })
          setErrors((e) => ({ ...e, pickup: false }));
        }}
      />

      <TextInput
        placeholder="Dropoff Location"
        style={[styles.input, errors.dropoff && styles.error]}
        value={ride.dropoff}
        onChangeText={(text) => {
          setRide({ dropoff: text })
          setErrors((e) => ({ ...e, dropoff: false }));
        }}
      />

      <TextInput
        placeholder="Car Model"
        style={[styles.input, errors.carModel && styles.error]}
        value={ride.carModel}
        onChangeText={(text) => {
          setRide({ carModel: text })
          setErrors((e) => ({ ...e, carModel: false }));
        }}
      />

      <Pressable onPress={() => setShowDate(true)} 
      style={[styles.input, errors.date && styles.error]}>
        <Text>{ride.date || 'Select Date'}</Text>
      </Pressable>

      <Pressable onPress={() => setShowTime(true)} 
      style={[styles.input, errors.time && styles.error]}>
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
              const dateStr = selectedDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
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
              const timeStr = selectedDate.toTimeString().slice(0, 5); // "HH:mm"
              setRide({ time: timeStr });
            }
          }}
        />
      )}

      <TextInput
        placeholder="Car Environment"
        style={[styles.input, errors.environment && styles.error]}
        value={ride.environment}
        onChangeText={(text) => {
          setRide({ environment: text })
          setErrors((e) => ({ ...e, environment: false }));
        }}
      />

      <TextInput
        placeholder="Other notes"
        style={styles.input}
        multiline
        value={ride.notes}
        onChangeText={(text) => setRide({ notes: text })}
      />

      <Button 
        title="Next" 
        onPress={() => {
          if(validateForm()){
            router.push('/offer/review');
          } 
          else {
            alert('Please fix the highlighted fields.');
          }
        }}
        />
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
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  radioLabel: {
    marginLeft: 8,
  },
  section: {
    marginBottom: 16,
  },
  subsection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },  
  error: {
    borderColor: 'red',
  },
});
