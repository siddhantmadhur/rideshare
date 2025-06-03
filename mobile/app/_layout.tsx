import { Stack } from 'expo-router'
import { PaperProvider } from 'react-native-paper'
import { ThemeProp } from 'react-native-paper/lib/typescript/types'

const theme: ThemeProp = {}

export default function RootLayout() {
    return (
        <PaperProvider theme={theme}>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            />
        </PaperProvider>
    )
}
