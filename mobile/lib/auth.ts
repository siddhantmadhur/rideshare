import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { fbApp } from "./firebase";

import {
  GoogleOneTapSignIn,
  statusCodes,
  type OneTapUser,
} from '@react-native-google-signin/google-signin';

const startSignInFlow = async () => {
  try {
    await GoogleOneTapSignIn.checkPlayServices();
    const signInResponse = await GoogleOneTapSignIn.signIn();
    if (signInResponse.type === 'success') {
      // use signInResponse.data
    } else if (signInResponse.type === 'noSavedCredentialFound') {
      // the user wasn't previously signed into this app
      const createResponse = await GoogleOneTapSignIn.createAccount();
      if (createResponse.type === 'success') {
        // use createResponse.data
      } else if (createResponse.type === 'noSavedCredentialFound') {
        // no Google user account was present on the device yet (unlikely but possible)
        const explicitResponse =
          await GoogleOneTapSignIn.presentExplicitSignIn();

        if (explicitResponse.type === 'success') {
          // use explicitResponse.data
        }
      }
    }
    // the else branches correspond to the user canceling the sign in
  } catch (error) {
    // handle error
    console.log("There wsas an error: ", error)
  }
};

function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth(fbApp);
}

export { startSignInFlow };
