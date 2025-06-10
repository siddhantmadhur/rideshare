import { Slot, useRouter, usePathname, Stack } from 'expo-router'
import { useState } from 'react'
import { BottomNavigation, Icon } from 'react-native-paper'
import { View } from 'react-native'

type RouteKey = 'offer' | 'rides' | 'search' | 'profile'

const routeMap: Record<RouteKey, `/main/${RouteKey}`> = {
  offer: '/main/offer',
  rides: '/main/rides',
  search: '/main/search',
  profile: '/main/profile',
}

const routes = [
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
//   {
//     key: 'search',
//     title: 'Search',
//     focusedIcon: 'magnify',
//     unfocusedIcon: 'magnify',
//   },
  {
    key: 'profile',
    title: 'Profile',
    focusedIcon: 'account-circle',
    unfocusedIcon: 'account-circle-outline',
  },
]

export default function MainLayout() {
  const [index, setIndex] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  const isTabRoute = routes.some((r) => pathname === routeMap[r.key as RouteKey])

  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      <Slot /> {/* renders the current screen inside main/ */}

      {isTabRoute && (
        <BottomNavigation.Bar
          navigationState={{ index, routes }}
          onTabPress={({ route }) => {
            const newIndex = routes.findIndex((r) => r.key === route.key)
            if (newIndex !== -1) {
              setIndex(newIndex)
              router.replace(routeMap[route.key as RouteKey])
            }
          }}
          renderIcon={({ route, color }) => (
            <Icon source={route.focusedIcon} size={24} color={color} />
          )}
          getLabelText={({ route }) => route.title}
        />
      )}
    </View>
  )
}
