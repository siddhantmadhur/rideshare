import { ProfileRoute } from '@/components/pages/Profile'
import { useState } from 'react'
import { Text, View } from 'react-native'
import { BottomNavigation } from 'react-native-paper'

const Profile = () => {
    return <Text>Profile</Text>
}

function Main() {
    const [index, setIndex] = useState(0)

    const [routes] = useState([
        {
            key: 'home',
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
        profile: ProfileRoute,
        rides: Profile,
        search: Profile,
        home: Profile,
    })

    return (
        <BottomNavigation
            safeAreaInsets={{ top: 0, bottom: 0 }}
            navigationState={{ index, routes }}
            onIndexChange={setIndex}
            renderScene={renderScene}
        />
    )
}

export default Main
