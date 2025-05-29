import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet, Alert, Switch, ScrollView} from 'react-native';
import auth from '@react-native-firebase/auth';
import { toISOIfValid } from '../utils/dateUtils';


export default function EditRide() {
  const params = useLocalSearchParams();
  const id = params?.id;
  const rideId = Number(id);

  const [loading, setLoading] = useState(true);
  const [ride, setRide] = useState<any>({});

  useEffect(() => {
    if (!rideId || isNaN(rideId)) {
      console.warn("Invalid ride ID:", id);
      Alert.alert("Invalid ride ID");
      setLoading(false);
      return;
    }

    const fetchRide = async () => {
      try {
        const token = await auth().currentUser?.getIdToken();
        const res = await fetch(`http://localhost:8080/rides/${rideId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch ride");
        const data = await res.json();
        setRide(data);
        console.log("Loaded ride for edit:", data);

      } catch (err) {
        console.error("Fetch error:", err);
        Alert.alert("Error", "Failed to load ride");
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [rideId]);

  const handleSave = async () => {
    if (isNaN(rideId)) {
      Alert.alert("Invalid ride ID");
      return;
    }

    try {
      const timestamp = toISOIfValid(ride.date, ride.time);

      const token = await auth().currentUser?.getIdToken();
      const res = await fetch('http://localhost:8080/rides/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...ride, id: rideId, timestamp }),
      });
      if (!res.ok) throw new Error('Failed to update');
      Alert.alert('Ride updated');
      router.back();
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert('Error', 'Failed to update ride');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Ride</Text>
      <TextInput
        style={styles.input}
        value={ride.pickup}
        onChangeText={(text) => setRide({ ...ride, pickup: text })}
        placeholder="Pickup"
      />
      <TextInput
        style={styles.input}
        value={ride.dropoff}
        onChangeText={(text) => setRide({ ...ride, dropoff: text })}
        placeholder="Dropoff"
      />
      <TextInput
        style={styles.input}
        value={ride.passengers}
        keyboardType="numeric"
        onChangeText={(text) => setRide({ ...ride, passengers: text })}
        placeholder="Passengers"
      />
      <TextInput
        style={styles.input}
        value={ride.date}
        onChangeText={(text) => setRide({ ...ride, date: text })}
        placeholder="Date (YYYY-MM-DD)"
      />
      <TextInput
        style={styles.input}
        value={ride.time}
        onChangeText={(text) => setRide({ ...ride, time: text })}
        placeholder="Time (HH:mm)"
      />
      <View style={styles.switchRow}>
        <Text>Has Car:</Text>
        <Switch
          value={ride.has_car}
          onValueChange={(value) => setRide({ ...ride, has_car: value })}
        />
      </View>
      {ride.has_car ? (
        <View style={styles.switchRow}>
          <Text>Willing to Split Gas:</Text>
          <Switch
            value={ride.willing_to_split_gas}
            onValueChange={(value) => setRide({ ...ride, willing_to_split_gas: value })}
          />
        </View>
      ) : (
        <View style={styles.switchRow}>
          <Text>Willing to Split Uber:</Text>
          <Switch
            value={ride.willing_to_split_uber}
            onValueChange={(value) => setRide({ ...ride, willing_to_split_uber: value })}
          />
        </View>
      )}
      <TextInput
        style={styles.input}
        value={ride.notes}
        onChangeText={(text) => setRide({ ...ride, notes: text })}
        placeholder="Notes"
        multiline
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});
