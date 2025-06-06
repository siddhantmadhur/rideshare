import { Stack } from 'expo-router'
import { OfferProvider } from '@/context/OfferContext'
import { AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown'

export default function OfferLayout() {
    return (
        <AutocompleteDropdownContextProvider>
            <OfferProvider>
                <Stack>
                    <Stack.Screen
                        name="index"
                        options={{ headerTitle: 'Your Ride Offers' }}
                    />
                    <Stack.Screen
                        name="form"
                        options={{ headerTitle: 'Create Ride Offer' }}
                    />
                    <Stack.Screen
                        name="review"
                        options={{ headerTitle: 'Review Ride Offer' }}
                    />
                    <Stack.Screen
                        name="thank-you"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="edit"
                        options={{ headerTitle: 'Edit Offer' }}
                    />
                    <Stack.Screen
                        name="manage_requests"
                        options={{ headerTitle: '' }}
                    />
                </Stack>
            </OfferProvider>
        </AutocompleteDropdownContextProvider>
    )
}
