import { Stack } from 'expo-router'

export default function RideLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Rides Available' }} />
      <Stack.Screen name="detailed" options={{ headerShown: true, title:'' }} />
    </Stack>
  )
}
