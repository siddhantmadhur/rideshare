import { Alert, Platform, StyleSheet, Text, View } from 'react-native'
import { signInWithGoogle } from '@/lib/auth'
import { useEffect, useState } from 'react'
import auth, { FirebaseAuthTypes, getAuth } from '@react-native-firebase/auth'
import { Redirect, useRouter } from 'expo-router'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { TextInput, Button, ProgressBar } from 'react-native-paper'
import { SERVER_URL } from '@/lib/constants'
import { useAuthStore } from '@/lib/store'

const AndroidSignInOptions = () => {
    const [alreadyMadeAccount, setAlreadyMadeAccount] = useState(false)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [loading, setLoading] = useState(false)

    const signInToAccount = async () => {
        setLoading(true)
        const auth = getAuth()

        try {
            const res = auth.signInWithEmailAndPassword(email, password)
        } catch (e) {
            Alert.alert('Error', `Couldn't create user: ${e}`)
        }
        setLoading(false)
    }

    const createNewAccount = async () => {
        setLoading(true)

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match')
            console.log('passwords do not match')
        } else {
            const auth = getAuth()
            try {
                const res = await auth.createUserWithEmailAndPassword(
                    email,
                    password
                )
                console.log(res.user)
            } catch (e) {
                Alert.alert(
                    'ERROR',
                    'There was an error in creating the user: '
                )
                console.log(e)
            }
        }

        setLoading(false)
    }

    if (loading) {
        return <ProgressBar />
    }

    return (
        <View
            style={{
                flex: 1,
                flexDirection: 'column',
                gap: 10,
                justifyContent: 'flex-end',
                marginBottom: 100,
                width: '80%',
            }}
        >
            {alreadyMadeAccount ? (
                <>
                    <TextInput
                        keyboardType="email-address"
                        placeholder="email address..."
                        textContentType="emailAddress"
                        autoCapitalize="none"
                        mode="outlined"
                        onChangeText={setEmail}
                    />
                    <TextInput
                        textContentType="password"
                        secureTextEntry
                        placeholder="password..."
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        mode="outlined"
                    />
                    <Button
                        onPress={() => {
                            signInToAccount()
                        }}
                        mode="contained"
                    >
                        Sign In
                    </Button>
                </>
            ) : (
                <>
                    <TextInput
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        autoCapitalize="none"
                        placeholder="email address..."
                        mode="outlined"
                        onChangeText={setEmail}
                    />
                    <TextInput
                        autoCapitalize="none"
                        textContentType="password"
                        placeholder="password..."
                        secureTextEntry
                        mode="outlined"
                        onChangeText={setPassword}
                    />
                    <TextInput
                        textContentType="password"
                        secureTextEntry
                        autoCapitalize="none"
                        placeholder="confirm password..."
                        mode="outlined"
                        onChangeText={setConfirmPassword}
                    />
                    <Button
                        onPress={() => {
                            createNewAccount()
                        }}
                        mode="contained"
                    >
                        Sign Up
                    </Button>
                </>
            )}
            <Button
                onPress={() => {
                    setAlreadyMadeAccount((e) => !e)
                }}
            >
                {alreadyMadeAccount
                    ? "Don't have an account?"
                    : 'Already have an account?'}
            </Button>
        </View>
    )
}
const AppleSignInOptions = () => {
    return (
        <Button
            onPress={async () => {
                console.log('hi')
                try {
                    const res = await signInWithGoogle()
                } catch (e) {
                    console.log('there was an err', e)
                }
                console.log('bye')
            }}
            mode="contained"
        >
            Sign in with Google
        </Button>
    )
}

export default function Index() {
    const user = useAuthStore((state) => state.user)
    const setUser = useAuthStore((state) => state.setUser)

    //const [user, setUser] = useState<null | FirebaseAuthTypes.User>(null)
    const [initializing, setInitializing] = useState(true)
    const router = useRouter()

    useEffect(() => {
        GoogleSignin.configure({
            webClientId:
                '679084923122-ao9urrt2mjta2rrhfc74i1k8dir628pa.apps.googleusercontent.com',
        })
        const subscriber = auth().onAuthStateChanged(async (user) => {
            if (user) {
                const res = await fetch(`${SERVER_URL}/user/current`, {
                    headers: {
                        Authorization: `Bearer ${await user.getIdToken(false)}`,
                    },
                })
                setUser(user)
                if (res.status === 404) {
                    router.replace('/profile/edit')
                }
            }
            if (initializing) setInitializing(false)
        })
        return subscriber
    }, [])

    if (initializing) {
        return null
    }
    if (user) {
        return <Redirect href="/main" />
    }

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 5,
                alignSelf: 'stretch',
                paddingBlock: 120,
            }}
        >
            <Text
                style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                }}
            >
                Welcome to RideShare
            </Text>
            {Platform.OS === 'ios' ? (
                <AppleSignInOptions />
            ) : (
                <AndroidSignInOptions />
            )}
        </View>
    )
}
