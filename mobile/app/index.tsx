import { Button, StyleSheet, Text, View } from "react-native";
import { startSignInFlow} from "../lib/auth"


export default function Index() {
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
        onPress={() => {
          console.log("hi");
          startSignInFlow();
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
