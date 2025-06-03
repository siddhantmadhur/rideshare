import { Platform } from "react-native"

let SERVER_URL = "http://localhost:8080"

if (Platform.OS === 'android') {
    SERVER_URL = 'http://10.0.2.2:8080'
}

export {SERVER_URL}
