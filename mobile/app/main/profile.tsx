import { SERVER_URL } from '@/lib/constants'
import { useAuthStore } from '@/lib/store'
import auth, { FirebaseAuthTypes, getAuth } from '@react-native-firebase/auth'
import { Redirect, useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Image, Text, View } from 'react-native'
import { Appbar, Button } from 'react-native-paper'

interface ProfileInformation {
    display_name: string
    description: string
    interests: string[]
    hobbies: string[]
    date_of_birth: string
    gender: string
    pronouns: string
}

const getProfileInformation = async (user: FirebaseAuthTypes.User) => {
    const idToken = await user.getIdToken()
    const res = await fetch(`${SERVER_URL}/user/current`, {
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    })

    if (res.ok) {
        const data = await res.json()
        return data as ProfileInformation
    }
    return null
}

function ProfileRoute() {
    const user = useAuthStore((state) => state.user)
    const setUser = useAuthStore((state) => state.setUser)
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [profileInformation, setProfileInformation] =
        useState<ProfileInformation | null>(null)
    useEffect(() => {
        setLoading(true)
        if (user) {
            getProfileInformation(user).then((data) => {
                if (data) {
                    setProfileInformation(data)
                }
            })
        }
        setLoading(false)
    }, [user])

    if (!user || loading) {
        return <Text>Loading...</Text>
    }

    return (
        <>
            <View
                style={{
                    marginInline: 15,
                    flex: 1,
                    flexDirection: 'column',
                    rowGap: 5,
                    marginTop: 25,
                }}
            >
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        maxHeight: 138,
                        paddingBottom: 20,
                    }}
                >
                    <Image
                        src={
                            user.photoURL ??
                            'https://i.pinimg.com/474x/93/ba/87/93ba871d62b0e2b83acadb45803a4d46.jpg'
                        }
                        height={128}
                        width={128}
                        style={{
                            borderRadius: 100,
                        }}
                    />
                </View>

                <Text style={{ fontWeight: 'bold', fontSize: 24 }}>
                    {profileInformation?.display_name}
                </Text>
                <Text
                    style={{
                        fontWeight: 'thin',
                        fontSize: 12,
                    }}
                >
                    {profileInformation?.pronouns}
                </Text>
                <Text>{profileInformation?.description}</Text>
                <View
                    style={{
                        marginTop: 50,
                    }}
                >
                    <Button
                        onPress={() => {
                            auth()
                                .signOut()
                                .then(() => {
                                    setUser(null)
                                    router.replace('/')
                                })
                        }}
                        mode="contained"
                    >
                        Sign Out
                    </Button>
                </View>
            </View>
        </>
    )
}

export default ProfileRoute
