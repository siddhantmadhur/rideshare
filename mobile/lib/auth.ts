import auth from "@react-native-firebase/auth"
import {
    GoogleSignin
} from "@react-native-google-signin/google-signin"
import firebase from "@react-native-firebase/app";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
};


GoogleSignin.configure({
    webClientId: "679084923122-eetjotll4n8csr58cremro3j863spdr9.apps.googleusercontent.com",
})

    
async function signInWithGoogle() {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    const signInResult = await GoogleSignin.signIn();

    let idToken = signInResult.data?.idToken;
    if (!idToken) {
        throw new Error("No ID token found")
    }

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    return auth().signInWithCredential(googleCredential)
}

export { signInWithGoogle };
