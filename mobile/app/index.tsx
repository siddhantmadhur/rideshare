import { Button, StyleSheet, Text, View } from "react-native";
import { signInWithGoogle} from "../lib/auth"
import { useEffect, useState } from "react";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth"

export default function Index() {

    const [user, setUser] = useState<null | FirebaseAuthTypes.User>(null)
    const [initializing, setInitializing] = useState(true)

    useEffect(()=>{
        const subscriber = auth().onAuthStateChanged((user)=>{
            if (user) {
                setUser(user)
            }
            if (initializing) setInitializing(false)
        })
        return subscriber;
    },[])


    if (initializing) {
        return null;
    }
    if (user) {
        return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        gap: 5,
        alignSelf: 'stretch',
        paddingBlock: 30,
      }}
    >
      <Text 
        style={{
            fontSize: 24,
            fontWeight: 'bold',
        }}
      >
      Welcome to RideShare: {user.displayName}
      </Text>
    </View>

        )
    }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        gap: 5,
        alignSelf: 'stretch',
        paddingBlock: 30,
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
      <Button
        onPress={async () => {
          console.log("hi");
          try {
          const res = await signInWithGoogle();
          } catch (e) {
              console.log("there was an err", e)
          }
          console.log("bye")
        }}
        title="Sign in with Google"
      ></Button>
    </View>
  );
}

const styles = StyleSheet.create({
    button: {

    }
})
