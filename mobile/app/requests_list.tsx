// rideshare/mobile/app/requests.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { acceptRequest, declineRequest } from '../services/requestsApi';

const MOCK_DATA = [
  {
    id: '1',
    name: 'Alice Johnson',
    startPoint: 'College Nine',
    destination: 'SFO',
  },
  {
    id: '2',
    name: 'Bob Smith',
    startPoint: 'Quarry Plaza',
    destination: 'SJC Airport',
  },
  {
    id: '3',
    name: 'Carol Lee',
    startPoint: 'Easter field',
    destination: 'Wharf',
  },
];

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchRequests = useCallback(() => {
    setError(false);
    setLoading(true);

    const load = async () => {
      try {
        if (__DEV__) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setRequests(MOCK_DATA);
        } else {
          const response = await fetch('https://your-backend.com/api/requests');
          if (!response.ok) throw new Error('Failed to fetch');
          const data = await response.json();
          setRequests(data);
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError(true);
        setRequests([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = (id: string, action: 'accept' | 'decline') => {
    if (__DEV__) {
      setTimeout(() => {
        console.log(`${action} request with id ${id}`);
        setRequests((prev) => prev.filter((item) => item.id !== id));
      }, 500);
    } else {
      const actionFn = action === 'accept' ? acceptRequest : declineRequest;
      actionFn(id)
        .then(() => {
          setRequests((prev) => prev.filter((item) => item.id !== id));
        })
        .catch(() => {
          Alert.alert('Error', `Failed to ${action} request.`);
        });
    }
  };

  const addRandomRequest = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    const randomName = `User ${Math.floor(Math.random() * 1000)}`;
    const randomRequest = {
      id: randomId,
      name: randomName,
      startPoint: 'Random Point A',
      destination: 'Random Point B',
    };
    setRequests((prev) => [randomRequest, ...prev]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <View style={styles.infoRight}>
          <Text style={styles.routeLabel}>From:</Text>
          <Text style={styles.routeText}>{item.startPoint}</Text>
          <Text style={styles.routeLabel}>To:</Text>
          <Text style={styles.routeText}>{item.destination}</Text>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, styles.accept]}
          onPress={() => handleAction(item.id, 'accept')}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.decline]}
          onPress={() => handleAction(item.id, 'decline')}
        >
          <Text style={styles.buttonText}>Decline</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {__DEV__ && (
        <Pressable style={styles.devButton} onPress={addRandomRequest}>
          <Text style={styles.devButtonText}>➕ Add Random Request</Text>
        </Pressable>
      )}
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={requests.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No requests available.</Text>
        }
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchRequests();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLeft: {
    flex: 1,
  },
  infoRight: {
    flex: 2,
    paddingLeft: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  routeText: {
    fontSize: 14,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  accept: {
    backgroundColor: '#4CAF50',
  },
  decline: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  devButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    alignItems: 'center',
  },
  devButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
