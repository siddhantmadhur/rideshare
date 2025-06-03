import React from 'react'
import { View, Text, Image, StyleSheet, Button } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'

export default function ProfileView() {
  const { name, desc, tags, dob, gender, pronouns } = useLocalSearchParams()

  return (
    <View style={styles.container}>
      <Button title="Edit" onPress={() => router.push('/offer/edit')} />

      <Image
        source={{
          uri: 'https://i.pinimg.com/474x/93/ba/87/93ba871d62b0e2b83acadb45803a4d46.jpg',
        }}
        style={styles.profileImage}
      />

      <Text style={styles.label}>Name: {name}
      </Text>
      <Text style={styles.label}>Description: {desc}

      </Text>
      <Text style={styles.label}>Tags: {tags}

      </Text>
      <Text style={styles.label}>Date of Birth: {dob}

      </Text>
      <Text style={styles.label}>Gender: {gender}
        
      </Text>
      <Text style={styles.label}>Pronouns: {pronouns} 
        
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
})
