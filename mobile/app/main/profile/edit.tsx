import { useEffect, useState } from 'react'
import { Alert, ActivityIndicator } from 'react-native'
import { useAuthStore } from '@/lib/store'
import { SERVER_URL } from '@/lib/constants'
import { useRouter } from 'expo-router'
import ProfileForm from '@/components/ProfileForm'

export default function EditProfileScreen() {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  const [initialValues, setInitialValues] = useState<any | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      const token = await user.getIdToken()
      const res = await fetch(`${SERVER_URL}/user/current`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return Alert.alert('Error', 'Failed to load profile')
      const data = await res.json()
      const dob = new Date(data.date_of_birth || '2005-01-01')
      setInitialValues({
        display_name: data.display_name || '',
        description: data.description || '',
        dobDay: `${dob.getDate()}`,
        dobMonth: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ][dob.getMonth()],
        dobYear: `${dob.getFullYear()}`,
        gender: data.gender || '',
        pronouns: data.pronouns || '',
        interests: data.interests || [],
      })
    }
    fetchData()
  }, [user])

  const handleSubmit = async (values: any) => {
    const token = await user?.getIdToken()
    console.log('Sending values to update:', values)
    const res = await fetch(`${SERVER_URL}/user/update`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })
    if (res.ok) {
      router.replace('/main/profile')
    } else {
      Alert.alert('Error', 'Failed to update profile')
    }
  }

  if (!initialValues) return <ActivityIndicator />

  return (
    <ProfileForm
      mode="edit"
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  )
}
