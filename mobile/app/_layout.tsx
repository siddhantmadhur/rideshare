import { Stack } from 'expo-router'
import { StatusBar, View } from 'react-native'
import { PaperProvider, useTheme } from 'react-native-paper'
import { ThemeProp } from 'react-native-paper/lib/typescript/types'

const theme: ThemeProp = {}

export default function RootLayout() {
    return (
        <PaperProvider theme={theme}>
            <StackLayout />
        </PaperProvider>
    )
}

function StackLayout() {
    const currentTheme = useTheme()
    return (
        <>
            <StatusBar
                backgroundColor={currentTheme.colors.background}
                hidden={false}
            />
            <Stack
                screenOptions={{
                    headerShown: false,
                    navigationBarHidden: false,
                    navigationBarTranslucent: false,
                    navigationBarColor: currentTheme.colors.inverseOnSurface,
                }}
            >
                <Stack.Screen name='user_profile' options={{
                    headerShown: true,
                    headerTitle: 'Profile',
                }} />
            </Stack>
        </>
    )
}
