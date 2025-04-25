import { Button, StyleSheet, Text, View } from "react-native";
import { signInWithGoogle} from "../lib/auth"
import { useEffect } from "react";
import { getAuth } from "firebase/auth";
import { fbApp, fbAuth } from "@/lib/firebase";


export default function Index() {

    useEffect(()=>{
        fbAuth.onAuthStateChanged((user)=>{
            console.log("User:", user)
        })
    }, [])
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
