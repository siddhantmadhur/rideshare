import { Tabs } from 'expo-router'
import { PaperProvider } from 'react-native-paper'
import { ThemeProp } from 'react-native-paper/lib/typescript/types'
import { OfferProvider } from '../context/OfferContext'

const theme: ThemeProp = {}

export default function RootLayout() {
    return (
        <OfferProvider>
            <PaperProvider theme={theme}>
                <Tabs
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Tabs.Screen name="offer" />
                    <Tabs.Screen name="map" />
                </Tabs>
            </PaperProvider>
        </OfferProvider>
    )
}
