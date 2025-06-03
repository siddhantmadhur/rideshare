import { View, Text, TextInput, Button, StyleSheet } from 'react-native'
import { useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import { SERVER_URL } from '@/lib/constants'
import { User } from '@firebase/auth'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'expo-router'

export default function EditProfile() {
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [interests, setInterests] = useState('')
    const [hobbies, setHobbies] = useState('')
    const [dob, setDob] = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [gender, setGender] = useState('')
    const [selectedPronoun, setSelectedPronoun] = useState('')
    const [customPronoun, setCustomPronoun] = useState('')

    const user = useAuthStore((state) => state.user)

    const router = useRouter()
    if (!user) {
        return <div></div>
    }

    const handleSave = async () => {
        const finalPronouns =
            selectedPronoun === 'Other' ? customPronoun : selectedPronoun
        const token = await user.getIdToken(true)
        const res = await fetch(`${SERVER_URL}/user/create`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                display_name: name,
                country: 'USA',
                description: desc,
                interests: interests.split(','),
                hobbies: hobbies.split(','),
                date_of_birth: dob,
                gender: gender,
                pronouns: finalPronouns,
            }),
        })
        if (res.status === 201) {
            router.replace('/offer/view')
        } else {
            console.log('not ok!')
        }
    }

    return (
        <View style={styles.container}>
            <Text>Name</Text>
            <TextInput
                placeholder="Name"
                onChangeText={setName}
                style={styles.input}
            />

            <Text>Description</Text>
            <TextInput
                placeholder="Description"
                onChangeText={setDesc}
                style={styles.input}
            />

            <Text>Hobbies</Text>
            <TextInput
                placeholder="Comma seperated: videogames,playing soccer,watching movies"
                onChangeText={setHobbies}
                style={styles.input}
            />
            <Text>Interests</Text>
            <TextInput
                placeholder="Comma seperated: videogames,playing soccer,watching movies"
                onChangeText={setInterests}
                style={styles.input}
            />

            <Text>Date of Birth</Text>
            <Button
                title={dob || 'Select Date'}
                onPress={() => setShowDatePicker(true)}
            />
            {showDatePicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false)
                        if (selectedDate) {
                            setDob(selectedDate.toISOString().split('T')[0])
                        }
                    }}
                />
            )}

            <Text>Gender</Text>
            <TextInput
                placeholder="Enter Gender"
                onChangeText={setGender}
                style={styles.input}
            />

            <Text>Pronouns</Text>
            {['she/her', 'he/him', 'they/them', 'Other'].map((option) => (
                <Button
                    key={option}
                    title={option}
                    onPress={() => {
                        setSelectedPronoun(option)
                        if (option !== 'Other') setCustomPronoun('')
                    }}
                    color={selectedPronoun === option ? '#007aff' : '#aaa'}
                />
            ))}

            {selectedPronoun === 'Other' && (
                <TextInput
                    placeholder="Enter Pronouns"
                    onChangeText={setCustomPronoun}
                    style={styles.input}
                />
            )}

            <Button title="Save" onPress={handleSave} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, gap: 10, backgroundColor: '#fff' },
    input: {
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 4,
        padding: 10,
    },
})
