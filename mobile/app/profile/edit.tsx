import { View, Text, TextInput, Button, StyleSheet } from 'react-native'
import { useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import { router } from 'expo-router'

export default function EditProfile() {
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [tags, setTags] = useState('')
    const [dob, setDob] = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [gender, setGender] = useState('')
    const [selectedPronoun, setSelectedPronoun] = useState('')
    const [customPronoun, setCustomPronoun] = useState('')

    const handleSave = () => {
        const finalPronouns =
            selectedPronoun === 'Other' ? customPronoun : selectedPronoun
        router.push({
            pathname: '/offer/view',
            params: { name, desc, tags, dob, gender, pronouns: finalPronouns },
        })
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

            <Text>Tags</Text>
            <TextInput
                placeholder="Tags"
                onChangeText={setTags}
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
