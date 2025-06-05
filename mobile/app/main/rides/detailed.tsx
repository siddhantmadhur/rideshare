/* eslint-disable import/no-unresolved */
import { useSearchParams } from 'expo-router/build/hooks'
import { useEffect, useState } from 'react'
import { Text } from 'react-native'
import { RideInfo } from '.'
import { ProgressBar } from 'react-native-paper'
import { SERVER_URL } from '@/lib/constants'

const DetailedRideInformation = () => {
    const searchParams = useSearchParams()

    const [rideInfo, setRideInfo] = useState<RideInfo | null>(null)

    const fetchRideInfo = async (ride_id: string) => {
        const res = await fetch(`${SERVER_URL}/rides/${ride_id}`)
        if (res.ok) {
            const data = await res.json()
            setRideInfo(data["info"] as RideInfo)
        } else {
            console.log("not ok!")
        }
    }
    useEffect(() => {
        const ride_id = searchParams.get('ride_id')
        if (ride_id) {
        console.log('ID Exist: ', ride_id)
        fetchRideInfo(ride_id)
        }
    }, [])

    if (!rideInfo) {
        return <ProgressBar />
    }
    return <Text>Hi: {rideInfo.id} </Text>
}

export default DetailedRideInformation
