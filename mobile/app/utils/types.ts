export interface Place {
    title: string
    id: string
  }
  
  export interface RideInput {
    passengers: string
    pickup?: Place
    dropoff?: Place
    carModel?: string
    environment?: string
    notes?: string
    date?: string
    time?: string
    hasCar?: boolean
    splitUber?: boolean
    splitGas?: boolean
  }
  