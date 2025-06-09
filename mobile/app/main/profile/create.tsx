import ProfileForm from '@/components/ProfileForm'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/lib/store'
import { SERVER_URL } from '@/lib/constants'
import { Alert } from 'react-native'

export default function CreateProfileScreen() {
  const user = useAuthStore((state) => state.user)
  const router = useRouter()

  const handleSubmit = async (values: any) => {
    if (!user) return
    const token = await user.getIdToken()

    try {
      const res = await fetch(`${SERVER_URL}/user/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        router.replace('/main/offer')
      } else {
        Alert.alert('Error', 'Failed to create profile')
      }
    } catch (err) {
      Alert.alert('Error', 'Network error')
      console.error(err)
    }
  }

  return (
    <ProfileForm
      mode="create"
      initialValues={{
        display_name: '',
        description: '',
        dobDay: '1',
        dobMonth: 'January',
        dobYear: '2000',
        gender: '',
        pronouns: '',
        interests: [],
      }}
      onSubmit={handleSubmit}
    />
  )
}
