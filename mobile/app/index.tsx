import React from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native'
import { signInWithGoogle } from '@/lib/auth'
import { useEffect, useState } from 'react'
import auth, { FirebaseAuthTypes, getAuth } from '@react-native-firebase/auth'
import { Redirect, router } from 'expo-router'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { TextInput, Button, ProgressBar } from 'react-native-paper'

const AndroidSignInOptions = () => {
    const [alreadyMadeAccount, setAlreadyMadeAccount] = useState(false)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [loading, setLoading] = useState(false)

    const signInToAccount = async () => {
        setLoading(true)
        const authInstance = getAuth() // Changed from getAuth() to authInstance for clarity

        try {
            // Ensure authInstance is used if it refers to the initialized app
            const res = await authInstance.signInWithEmailAndPassword(email, password)
        } catch (e) {
            Alert.alert('Error', `Couldn't sign in: ${e}`)
        }
        setLoading(false)
    }

    const createNewAccount = async () => {
        setLoading(true)

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match')
            console.log('passwords do not match')
            setLoading(false)
            return
        } 
        const authInstance = getAuth() // Changed from getAuth() to authInstance for clarity
        try {
            // Ensure authInstance is used
            const res = await authInstance.createUserWithEmailAndPassword(
                email,
                password
            )
            console.log(res.user)
        } catch (e) {
            Alert.alert(
                'ERROR',
                `There was an error in creating the user: ${e}`
            )
            console.log(e)
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
                        onPress={signInToAccount} // Simplified onPress
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
                        onPress={createNewAccount} // Simplified onPress
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
                console.log('Attempting Google Sign-In...')
                try {
                    // Assuming signInWithGoogle is an async function that handles the Google sign-in process
                    const res = await signInWithGoogle() 
                    console.log('Google Sign-In success:', res)
                } catch (e) {
                    console.log('Google Sign-In error:', e)
                    Alert.alert('Sign-In Error', 'Could not sign in with Google.')
                }
            }}
            // title="Sign in with Google" // Button from react-native-paper uses children for text
        >
            Sign in with Google
        </Button>
    )
}

export default function Index() {
    const [user, setUser] = useState<null | FirebaseAuthTypes.User>(null)
    const [initializing, setInitializing] = useState(true)

    useEffect(() => {
        // It's good practice to ensure GoogleSignin is configured before onAuthStateChanged.
        // However, webClientId is often specific to your Firebase project setup for Google Sign-In.
        // Ensure this webClientId is correct for your rideshare-ucsc project.
        GoogleSignin.configure({
            webClientId:
                '679084923122-eetjotll4n8csr58cremro3j863spdr9.apps.googleusercontent.com',
        });

        const subscriber = auth().onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
            if (initializing) {
                setInitializing(false);
            }
            console.log('Auth state changed, user:', firebaseUser ? firebaseUser.uid : null);
        });

        return subscriber; // unsubscribe on unmount
    }, []); // Added initializing to dependency array, though often not strictly needed for onAuthStateChanged

    if (initializing) {
        // Render a loading indicator or splash screen while checking auth state
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ProgressBar indeterminate />
                <Text>Loading...</Text>
            </View>
        );
    }

    if (user) {
        console.log('User is signed in, redirecting to /offer');
        return <Redirect href="/offer" />;
    }

    // If not initializing and no user, show sign-in options
    console.log('No user signed in, showing sign-in options.');
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'space-around', // Adjusted for better layout
                alignItems: 'center',
                paddingVertical: 50, // Added padding
            }}
        >
            <Text
                style={{
                    fontSize: 28, // Increased size
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: 30, // Added margin
                }}
            >
                Welcome to RideShare UCSC
            </Text>
            {Platform.OS === 'ios' ? (
                <AppleSignInOptions />
            ) : (
                <AndroidSignInOptions />
            )}
        </View>
    );
}

// Note: StyleSheet.create might be needed if more complex styles are added.
// For simple inline styles like above, it's optional but good practice for organization.
