import { useLocalSearchParams, router } from 'expo-router'
import { useEffect, useState, useRef } from 'react'
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Text,
} from 'react-native'
import { TextInput, Button, Switch } from 'react-native-paper'
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates'
import auth from '@react-native-firebase/auth'
import { convertTo24Hour } from '@/app/utils/dateUtils'
import { SERVER_URL } from '@/lib/constants'
import { validateRideInput } from '@/app/utils/rideValidation'
import PlacesAutocompleteInputBox from '@/components/PlacesAutocompleteInputBox'
import { IAutocompleteDropdownRef } from 'react-native-autocomplete-dropdown'

export default function EditRide() {
  const { id } = useLocalSearchParams()
  const rideId = Number(id)
  const [ride, setRide] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [showDate, setShowDate] = useState(false)
  const [showTime, setShowTime] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  const controllerPickup = useRef<IAutocompleteDropdownRef>(null)
  const controllerDropoff = useRef<IAutocompleteDropdownRef>(null)

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const token = await auth().currentUser?.getIdToken()
        const res = await fetch(`${SERVER_URL}/rides/${rideId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const { info: data } = await res.json()

        const pickup = typeof data.pickup === 'string' ? JSON.parse(data.pickup) : data.pickup
        const dropoff = typeof data.dropoff === 'string' ? JSON.parse(data.dropoff) : data.dropoff

        setRide({
          ...data,
          pickup,
          dropoff,
          hasCar: data.has_car,
          splitGas: data.split_gas,
          splitUber: data.split_uber,
          carModel: data.car_model,
          environment: data.environment,
        })
      } catch {
        Alert.alert('Error', 'Failed to load ride')
      } finally {
        setLoading(false)
      }
    }

    fetchRide()
  }, [rideId])

  useEffect(() => {
    if (ride.pickup?.title) controllerPickup.current?.setInputText?.(ride.pickup.title)
    if (ride.dropoff?.title) controllerDropoff.current?.setInputText?.(ride.dropoff.title)
  }, [ride.pickup, ride.dropoff])

  const handleSave = async () => {
    const { isValid, errors: newErrors, message } = validateRideInput({ ...ride })
    setErrors(newErrors)
    if (!isValid) return Alert.alert('Fix Form', message)
  
    try {
      const token = await auth().currentUser?.getIdToken()
  
      // Combine date and time to create ISO timestamp
      const timestamp = new Date(`${ride.date.split('T')[0]}T${convertTo24Hour(ride.time)}:00`).toISOString()
  
      const payload = {
        id: rideId,
        passengers: String(ride.passengers), // backend expects string
        pickup: JSON.stringify(ride.pickup),
        dropoff: JSON.stringify(ride.dropoff),
        timestamp,
        notes: ride.notes,
        has_car: ride.hasCar ?? false,
        split_gas: ride.splitGas ?? false,
        split_uber: ride.splitUber ?? false,
        date: ride.date,
        time: ride.time,
        car_model: ride.carModel ?? '',
        environment: ride.environment ?? '',
      }
  
      const res = await fetch(`${SERVER_URL}/rides/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
  
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText)
      }
  
      Alert.alert('Success', 'Ride updated')
      router.back()
    } catch (err) {
        let message = 'Unknown error'
        if (err instanceof Error) {
          message = err.message
        } else if (typeof err === 'string') {
          message = err
        }
      
        Alert.alert('Error', `Failed to update ride: ${message}`)
      }
      
  }
  
  

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Ride</Text>

      <PlacesAutocompleteInputBox
        placeholder="Pickup Location"
        onChangeText={(title, id) => setRide((prev: any) => ({ ...prev, pickup: { title, id } }))}
        error={errors.pickup}
        ref={controllerPickup}
      />

      <PlacesAutocompleteInputBox
        placeholder="Dropoff Location"
        onChangeText={(title, id) => setRide((prev: any) => ({ ...prev, dropoff: { title, id } }))}
        error={errors.dropoff}
        ref={controllerDropoff}
      />

      <TextInput
        label="Number of Passengers"
        mode="outlined"
        keyboardType="numeric"
        value={ride.passengers || ''}
        onChangeText={(text) =>
            setRide({ ...ride, passengers: Number(text) })
          }
          
        style={styles.input}
      />

      <TextInput
        label="Select Date"
        mode="outlined"
        value={ride.date ? new Date(ride.date).toLocaleDateString('en-US') : ''}
        editable={false}
        right={<TextInput.Icon icon="calendar" onPress={() => setShowDate(true)} />}
        style={styles.input}
      />
      <DatePickerModal
        locale="en"
        mode="single"
        visible={showDate}
        date={ride.date ? new Date(ride.date) : undefined}
        onDismiss={() => setShowDate(false)}
        onConfirm={({ date }) => date && setRide({ ...ride, date: date.toISOString() })}
      />

      <TextInput
        label="Select Time"
        mode="outlined"
        value={ride.time || ''}
        editable={false}
        right={<TextInput.Icon icon="clock" onPress={() => setShowTime(true)} />}
        style={styles.input}
      />
      <TimePickerModal
        visible={showTime}
        onDismiss={() => setShowTime(false)}
        onConfirm={({ hours, minutes }) => {
          const time = new Date(1970, 0, 1, hours, minutes).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })
          setRide({ ...ride, time })
        }}
        hours={ride.time ? parseInt(convertTo24Hour(ride.time).split(':')[0]) : undefined}
        minutes={ride.time ? parseInt(convertTo24Hour(ride.time).split(':')[1]) : undefined}
        label="Pick time"
      />

      <View style={styles.switchRow}>
        <Text>Willing to Split Uber:</Text>
        <Switch
          value={ride.splitUber ?? false}
          onValueChange={(val) => setRide({ ...ride, splitUber: val })}
        />
      </View>

      <TextInput
        label="Notes"
        mode="outlined"
        multiline
        value={ride.notes || ''}
        onChangeText={(text) => setRide({ ...ride, notes: text })}
        style={[styles.input, { minHeight: 80 }]}
      />

      <Button mode="contained" onPress={handleSave} style={{ marginTop: 12 }}>
        Save
      </Button>
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
  input: {
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
})