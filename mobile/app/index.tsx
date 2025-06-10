/* eslint-disable import/no-unresolved */
import { Alert, Platform, StyleSheet, Text, View } from 'react-native'
import { signInWithGoogle } from '@/lib/auth'
import { useEffect, useState } from 'react'
import auth, {
    FirebaseAuthTypes,
    getAuth,
    signOut,
} from '@react-native-firebase/auth'
import { Redirect, useRouter } from 'expo-router'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { TextInput, Button, ProgressBar } from 'react-native-paper'
import { SERVER_URL } from '@/lib/constants'
import { useAuthStore } from '@/lib/store'
import { Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from 'react-native-paper'



import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    Easing,
  } from 'react-native-reanimated'
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
    const theme = useTheme()

    return (
        <Button
            buttonColor={theme.colors.surface}
            textColor={theme.colors.primary}
            style={{ borderRadius: 30 }}
            onPress={async () => {
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
    const theme = useTheme()
    const Logo = require('../assets/images/rideshare-logo.png')
    const user = useAuthStore((state) => state.user)
    const setUser = useAuthStore((state) => state.setUser)
    const [initializing, setInitializing] = useState(true)
    const router = useRouter()
  
    const rotation = useSharedValue(0)
    useEffect(() => {
      rotation.value = withRepeat(
        withTiming(10, {
          duration: 4000,
          easing: Easing.linear,
        }),
        -1,
        true
      )
    }, [])
  
    const logoStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }))
  
    useEffect(() => {
      GoogleSignin.configure({
        webClientId: '679084923122-ao9urrt2mjta2rrhfc74i1k8dir628pa.apps.googleusercontent.com',
      })
  
      const subscriber = auth().onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          if (!user || user.uid !== firebaseUser.uid) {
            setUser(firebaseUser)
          }
          try {
            const token = await firebaseUser.getIdToken(false)
            const res = await fetch(`${SERVER_URL}/user/current`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (res.status === 404) router.replace('/main/profile/create')
            else if (res.status === 401) {
              auth().signOut()
              router.reload()
            } else if (res.ok) {
              router.replace('/main/offer')
            }
          } catch (error: any) {
            console.error('Fetch error:', error)
            router.replace('/main/offer')
          }
        }
        if (initializing) setInitializing(false)
      })
  
      return subscriber
    }, [])
  
    if (initializing) return null
    if (user) return <Redirect href="/main/offer" />
  
    return (
        
      <LinearGradient
        colors={['#4A90E2', '#74C0FC']} // smooth blue transition
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.Image
          source={Logo}
          style={[styles.logo, logoStyle]}
          resizeMode="contain"
        />
    
        <Text style={[styles.title, { color: theme.colors.onPrimary }]}>
            Welcome to RideShare
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.onPrimary }]}>
            Hop in. Let’s get you moving.
        </Text>

    
        <View style={{ width: '80%' }}>
          <AppleSignInOptions />
        </View>
      </LinearGradient>
    )
    
  }
  const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 60,
      },      
    logo: {
      width: 160,
      height: 160,
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: '#3C3C3C',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#3C3C3C',
      marginBottom: 40,
    },
  })
    