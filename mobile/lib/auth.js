import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { fbApp } from "./firebase";

function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth(fbApp);
  signInWithPopup(auth, provider).then((res) => {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const user = res.user;
    console.log("UID: ", user.uid);
  });
}

export { signInWithGoogle };
