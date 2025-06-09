import { toISOIfValid } from '@/app/utils/dateUtils'
import type { RideInput } from './types'

export function validateRideInput(ride: RideInput): { isValid: boolean, errors: Record<string, boolean>, message: string } {
  const hasCar = ride.hasCar ?? false
  const errors: Record<string, boolean> = {
    passengers: !ride.passengers || isNaN(Number(ride.passengers)),
    pickup: !ride.pickup?.title || !ride.pickup?.id,
    dropoff: !ride.dropoff?.title || !ride.dropoff?.id,
    carModel: hasCar && !ride.carModel,
    environment: hasCar && !ride.environment,
    date: false,
    time: false,
  }

  try {
    toISOIfValid(ride.date ?? '', ride.time ?? '')
  } catch (err: any) {
    errors.date = true
    errors.time = true
    return { isValid: false, errors, message: err.message }
  }

  const isValid = !Object.values(errors).some(Boolean)
  return { isValid, errors, message: isValid ? '' : 'Please fill out all required fields correctly.' }
}
