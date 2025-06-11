import { Stack } from 'expo-router'
import { StatusBar } from 'react-native'
import {
  PaperProvider,
  DefaultTheme,
  useTheme,
} from 'react-native-paper'

const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#4A90E2',
      onPrimary: '#FFFFFF',
      primaryContainer: '#D8EFFF',        
      onPrimaryContainer: '#003366',   
      secondaryContainer: '#D8EFFF', 
      onSecondaryContainer: '#003366',   
      background: '#F2F6FC',
      surface: '#FFFFFF',
      text: '#1C1C1C',
      placeholder: '#AAB4BE',
    },
  }
  
  

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
