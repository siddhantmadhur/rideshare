import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { signInWithGoogle } from '@/lib/auth';
import auth, { FirebaseAuthTypes, getAuth } from '@react-native-firebase/auth';
import { Redirect } from 'expo-router';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { TextInput, Button, ProgressBar } from 'react-native-paper';

const AndroidSignInOptions = () => {
    const [alreadyMadeAccount, setAlreadyMadeAccount] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const signInToAccount = async () => {
        setLoading(true);
        const authInstance = getAuth();

        try {
            await authInstance.signInWithEmailAndPassword(email, password);
        } catch (e) {
            Alert.alert('Error', `Couldn't sign in: ${e}`);
        }
        setLoading(false);
    };

    const createNewAccount = async () => {
        setLoading(true);

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            setLoading(false);
            return;
        } 
        
        const authInstance = getAuth();
        try {
            const res = await authInstance.createUserWithEmailAndPassword(email, password);
            console.log(res.user);
        } catch (e) {
            Alert.alert('ERROR', `There was an error in creating the user: ${e}`);
            console.log(e);
        }
        
        setLoading(false);
    };

    if (loading) {
        return <ProgressBar />;
    }

    return (
        <View style={styles.formContainer}>
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
                    <Button onPress={signInToAccount} mode="contained">
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
                    <Button onPress={createNewAccount} mode="contained">
                        Sign Up
                    </Button>
                </>
            )}
            <Button onPress={() => setAlreadyMadeAccount((e) => !e)}>
                {alreadyMadeAccount ? "Don't have an account?" : 'Already have an account?'}
            </Button>
        </View>
    );
};

const AppleSignInOptions = () => {
    return (
        <Button
            onPress={async () => {
                console.log('Attempting Google Sign-In...');
                try {
                    const res = await signInWithGoogle();
                    console.log('Google Sign-In success:', res);
                } catch (e) {
                    console.log('Google Sign-In error:', e);
                    Alert.alert('Sign-In Error', 'Could not sign in with Google.');
                }
            }}
        >
            Sign in with Google
        </Button>
    );
};

export default function Index() {
    const [user, setUser] = useState<null | FirebaseAuthTypes.User>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '679084923122-eetjotll4n8csr58cremro3j863spdr9.apps.googleusercontent.com',
        });

        const subscriber = auth().onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
            if (initializing) {
                setInitializing(false);
            }
            console.log('Auth state changed, user:', firebaseUser ? firebaseUser.uid : null);
        });

        return subscriber;
    }, [initializing]);

    if (initializing) {
        return (
            <View style={styles.loadingContainer}>
                <ProgressBar indeterminate />
                <Text>Loading...</Text>
            </View>
        );
    }

    if (user) {
        console.log('User is signed in, redirecting to /offer');
        return <Redirect href="/offer" />;
    }

    console.log('No user signed in, showing sign-in options.');
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to RideShare UCSC</Text>
            {Platform.OS === 'ios' ? <AppleSignInOptions /> : <AndroidSignInOptions />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    formContainer: {
        flex: 1,
        flexDirection: 'column',
        gap: 10,
        justifyContent: 'flex-end',
        marginBottom: 100,
        width: '80%',
    },
});
