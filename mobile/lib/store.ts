import {create} from 'zustand'
import {User} from "@firebase/auth"
import { FirebaseAuthTypes } from '@react-native-firebase/auth'

interface AuthStore {
    user: null | FirebaseAuthTypes.User,
    setUser: (update: null | FirebaseAuthTypes.User) => void
}

const useAuthStore = create<AuthStore>((set)=>({
    user: null,
    setUser: (incomingUser) => set({user:incomingUser }) 
}))

export {useAuthStore}
