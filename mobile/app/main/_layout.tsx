import { Redirect, Stack, useRouter } from 'expo-router'
import { useState } from 'react'
import { Text, View } from 'react-native'
import { BottomNavigation, Icon } from 'react-native-paper'

const Profile = () => {
    return <Text>Profile</Text>
}

function Main() {
    const [index, setIndex] = useState(0)

    const [routes] = useState([
        {
            key: 'offer',
            title: 'Home',
            focusedIcon: 'home-variant',
            unfocusedIcon: 'home-variant-outline',
        },
        {
            key: 'rides',
            title: 'Rides',
            focusedIcon: 'car-back',
            unfocusedIcon: 'car-back',
        },
        {
            key: 'search',
            title: 'Search',
            focusedIcon: 'magnify',
            unfocusedIcon: 'magnify',
        },
        {
            key: 'profile',
            title: 'Profile',
            focusedIcon: 'account-circle',
            unfocusedIcon: 'account-circle-outline',
        },
    ])

    const renderScene = BottomNavigation.SceneMap({
        profile: Profile,
        rides: Profile,
        search: Profile,
        home: Profile,
    })

    const router = useRouter()

    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: true,
                }}
            >
                <Stack.Screen
                    name="profile"
                    options={{ headerTitle: 'Profile' }}
                />
                <Stack.Screen name="offer" options={{ headerShown: false }} />
            </Stack>
            <BottomNavigation.Bar
                navigationState={{ index, routes }}
                onTabPress={({ route }) => {
                    const newIndex = routes.findIndex(
                        (r) => r.key === route.key
                    )
                    if (newIndex !== -1) {
                        setIndex(newIndex)
                    }
                    router.replace(`/main/${route.key}`)
                }}
                renderIcon={({ route, color }) => (
                    <Icon source={route.focusedIcon} size={24} color={color} />
                )}
                getLabelText={({ route }) => route.title}
            />
        </>
    )
}

export default Main
