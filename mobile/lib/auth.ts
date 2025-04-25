import { getAuth, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { fbApp } from "./firebase";
import {
    GoogleSignin
} from "@react-native-google-signin/google-signin"

async function signInWithGoogle() {

    GoogleSignin.configure({
        webClientId: "679084923122-eetjotll4n8csr58cremro3j863spdr9.apps.googleusercontent.com",
    })
    
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    const signInResult = await GoogleSignin.signIn();

    let idToken = signInResult.data?.idToken;
    if (!idToken) {
        throw new Error("No ID token found")
    }
    const googleCredential = GoogleAuthProvider.credential(idToken);
    return signInWithCredential(fbAuth, googleCredential)

}

export { signInWithGoogle };
