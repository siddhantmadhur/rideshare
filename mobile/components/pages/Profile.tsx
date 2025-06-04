import { useRouter } from 'expo-router'
import { Image, Text, View } from 'react-native'
import { Button } from 'react-native-paper'

function ProfileRoute() {
    const router = useRouter()
    const name = ''
    const desc = ''
    const dob = ''
    const tags = ''
    const gender = ''
    const pronouns = ''
    return (
        <View>
            <Button onPress={() => router.push('/offer/edit')}>Edit</Button>

            <Image
                source={{
                    uri: 'https://i.pinimg.com/474x/93/ba/87/93ba871d62b0e2b83acadb45803a4d46.jpg',
                }}
            />

            <Text>Name: {name}</Text>
            <Text>Description: {desc}</Text>
            <Text>Tags: {tags}</Text>
            <Text>Date of Birth: {dob}</Text>
            <Text>Gender: {gender}</Text>
            <Text>Pronouns: {pronouns}</Text>
        </View>
    )
}

export { ProfileRoute }
