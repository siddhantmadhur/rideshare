/* eslint-disable import/no-unresolved */
import { SERVER_URL } from '@/lib/constants'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { PlaceObj } from '../offer/form'

export interface RideInfo {
    id: number
    display_name?: string
    pickup: string
    dropoff: string
    passengers: string | number
    timestamp: string
    notes: string
    user_id: string
    has_car: boolean
    split_gas: boolean
    split_uber: boolean
    date: string
    time: string
    car_model: string
    environment: string
}

type ItemProps = {
    item: RideInfo
}
const Item = ({ item }: ItemProps) => {
    const theme = useTheme()
    const date = new Date(item.timestamp)
    const router = useRouter()
    return (
        <Pressable
        onPress={()=>{
            router.push(`/main/rides/detailed?ride_id=${item.id}`)
        }}
            style={{
                padding: 15,
                backgroundColor: theme.colors.primaryContainer,
                margin: 8,
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: theme.colors.primary,
                borderRadius: 15,
            }}
        >
            <Text
                style={{
                    textAlign: 'center',
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 5,
                }}
            >
                {(JSON.parse(item.pickup) as PlaceObj).title.split(",")[0]} to {(JSON.parse(item.dropoff) as PlaceObj).title.split(",")[0]}
            </Text>
            <Text>Driven by {item.display_name}</Text>
            <Text>{date.toUTCString()}</Text>
            <Text
                style={{
                    fontSize: 12,
                    color: theme.colors.primary,
                    marginTop: 5,
                    fontStyle: 'italic',
                }}
            >
                Tap to view route →
            </Text>
        </Pressable>
    )
}
const RidesPage = () => {
    const [rides, setRides] = useState<RideInfo[]>([])
    const renderItem = ({ item }: { item: RideInfo }) => {
        return <Item item={item} />
    }

    const fetchItems = async () => {
        const res = await fetch(`${SERVER_URL}/rides`)
        if (res.ok) {
            const data = await res.json()
            setRides(data as RideInfo[])
        }
    }
    useEffect(() => {
        fetchItems()
    }, [])
    return (
        <View>
            <FlatList
                renderItem={renderItem}
                data={rides}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    )
}

export default RidesPage
