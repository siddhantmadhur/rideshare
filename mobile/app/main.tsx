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
    })

    return (
        <BottomNavigation
            navigationState={{ index, routes }}
            onIndexChange={setIndex}
            renderScene={renderScene}
        />
    )
}

export default Main
