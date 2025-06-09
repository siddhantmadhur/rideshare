import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Pressable,
    Platform,
} from 'react-native'
import { TextInput, Button, useTheme, HelperText, Switch } from 'react-native-paper'
import { useOffer } from '@/context/OfferContext'
import { router } from 'expo-router'
import { useCallback, useRef, useState, useEffect } from 'react'
import { toISOIfValid, convertTo24Hour } from '@/app/utils/dateUtils'
import { AutocompleteDropdown, IAutocompleteDropdownRef } from 'react-native-autocomplete-dropdown'
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates'
import { en, registerTranslation } from 'react-native-paper-dates'
import { validateRideInput } from '@/app//utils/rideValidation'

registerTranslation('en', en)

export interface PlaceObj {
    title: string,
    id: string
}

interface PlacesListType {
    suggestions:     {
        placePrediction: {
            place: string,
            placeId: string,
            text: {
                text: string,
                matches: {
                    endOffset: number
                }[]
            }
        }
    }[]
}

const fetchPlace = async (location: string) => {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.EXPO_PUBLIC_GOOGLE_API_KEY ?? "",
        },
        body: JSON.stringify({ "input": location })
    })
    if (res.ok) {
        const data = await res.json()
        return data as PlacesListType
    } 
    return null
}

const PlacesAutocompleteInputBox = ({ placeholder, onChangeText, error }: {
    placeholder: string,
    onChangeText: (name: string, id: string) => void,
    error?: boolean,
}) => {
    const [loading, setLoading] = useState(false)
    const [suggestionsList, setSuggestionsList] = useState<PlaceObj[]>([])
    const dropdownController = useRef<IAutocompleteDropdownRef | null>(null)
    const searchRef = useRef(null)
    const theme = useTheme()

    const getSuggestions = useCallback(async (q: string) => {
        if (typeof q !== 'string' || q.length < 3) {
            setSuggestionsList([])
            return
        }
        setLoading(true)
        const response = await fetchPlace(q)
        if (response) {
            const suggestions = response.suggestions.map((place) => ({
                id: place.placePrediction.placeId,
                title: place.placePrediction.text.text
            }))
            setSuggestionsList(suggestions)
        }
        setLoading(false)
    }, [])

    return (
        <View style={[{ flex: 1, marginBottom: 12 }, Platform.select({ ios: { zIndex: 1 } })]}>
            <AutocompleteDropdown
                ref={searchRef}
                controller={controller => { dropdownController.current = controller }}
                direction={Platform.select({ ios: 'down' })}
                dataSet={suggestionsList}
                onChangeText={getSuggestions}
                onSelectItem={item => { item && onChangeText(item.title ?? '', item.id) }}
                debounce={600}
                inputContainerStyle={{
                    backgroundColor: theme.colors.background,
                    borderColor: error ? 'red' : theme.colors.primary,
                    borderWidth: 1,
                    borderRadius: 8,
                }}
                textInputProps={{
                    placeholder,
                    style: { paddingLeft: 12, color: theme.colors.onSurface },
                    autoCorrect: false,
                    autoCapitalize: 'none'
                }}
                suggestionsListContainerStyle={{ backgroundColor: theme.colors.surfaceVariant }}
                containerStyle={{ flexGrow: 1, flexShrink: 1 }}
                inputHeight={50}
                loading={loading}
            />
        </View>
    )
}

export default function OfferForm() {
    const { setRide, ride } = useOffer()
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({})
    const [hasCar, setHasCar] = useState(ride.hasCar ?? false)
    const [showDate, setShowDate] = useState(false)
    const [showTime, setShowTime] = useState(false)
    const theme = useTheme()

    const updateHasCar = (value: boolean) => {
        setHasCar(value)
        setRide({ hasCar: value })
        setRide({ splitUber: value ? false : ride.splitUber ?? false })
        setRide({ splitGas: value ? ride.splitGas ?? false : false })
    }

    const handleSubmit = () => {
        const passengers = ride.passengers ?? ''
        const { isValid, errors, message } = validateRideInput({ ...ride, passengers, hasCar })
        setErrors(errors)
        if (isValid) {
            router.push('/main/offer/review')
        } else {
            Alert.alert('Fix Form', message)
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Enter Details on your Ride Offer</Text>

            <PlacesAutocompleteInputBox
                placeholder="Pickup Location"
                onChangeText={(name, id) => setRide({ pickup: { title: name, id } })}
                error={errors.pickup}
            />
            <PlacesAutocompleteInputBox
                placeholder="Dropoff Location"
                onChangeText={(name, id) => setRide({ dropoff: { title: name, id } })}
                error={errors.dropoff}
            />

            <TextInput
                label="Select Date"
                mode="outlined"
                value={ride.date ? new Date(ride.date).toLocaleDateString('en-US') : ''}
                editable={false}
                error={errors.date}
                right={<TextInput.Icon icon={ride.date && !errors.date ? 'check' : 'calendar'} onPress={() => setShowDate(true)} />}
                style={{ marginBottom: 12 }}
            />
            <DatePickerModal
                locale="en"
                mode="single"
                visible={showDate}
                onDismiss={() => setShowDate(false)}
                date={ride.date ? new Date(ride.date) : undefined}
                onConfirm={(params: any) => {
                    setShowDate(false)
                    if ('date' in params && params.date instanceof Date) {
                        setRide({ date: params.date.toISOString() })
                        setErrors(e => ({ ...e, date: false }))
                    }
                }}
                validRange={{ startDate: new Date() }}
            />

            <TextInput
                label="Select Time"
                mode="outlined"
                value={ride.time || ''}
                editable={false}
                error={errors.time}
                right={<TextInput.Icon icon={ride.time && !errors.time ? 'check' : 'clock'} onPress={() => setShowTime(true)} />}
                style={{ marginBottom: 12 }}
            />
            <TimePickerModal
                visible={showTime}
                onDismiss={() => setShowTime(false)}
                onConfirm={(params: any) => {
                    setShowTime(false)
                    if ('hours' in params && 'minutes' in params) {
                        const timeStr = new Date(1970, 0, 1, params.hours, params.minutes).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                        })
                        setRide({ time: timeStr })
                        setErrors(e => ({ ...e, time: false }))
                    }
                }}
                hours={ride.time ? parseInt(convertTo24Hour(ride.time).split(':')[0]) : undefined}
                minutes={ride.time ? parseInt(convertTo24Hour(ride.time).split(':')[1]) : undefined}
                label="Pick time"
            />

            <TextInput
                label="Number of Passengers"
                mode="outlined"
                keyboardType="numeric"
                value={ride.passengers}
                onChangeText={(text) => {
                    setRide({ passengers: text })
                    setErrors(e => ({ ...e, passengers: false }))
                }}
                error={errors.passengers}
                right={!errors.passengers && ride.passengers ? <TextInput.Icon icon="check" /> : undefined}
                style={{ marginBottom: 12 }}
            />

            <View style={styles.switchRow}>
                <Text>Do you have a car for this ride?</Text>
                <Switch
                    value={hasCar}
                    onValueChange={(value) => updateHasCar(value)}
                />
            </View>

            {hasCar && (
                <View style={styles.switchRow}>
                    <Text>Willing to split gas?</Text>
                    <Switch
                        value={ride.splitGas ?? false}
                        onValueChange={(value) => setRide({ splitGas: value })}
                    />
                </View>
            )}

            {!hasCar && (
                <View style={styles.switchRow}>
                    <Text>Willing to split an Uber?</Text>
                    <Switch
                        value={ride.splitUber ?? false}
                        onValueChange={(value) => setRide({ splitUber: value })}
                    />
                </View>
            )}

            {hasCar && (
                <>
                    <TextInput
                        label="Car Model"
                        mode="outlined"
                        value={ride.carModel}
                        onChangeText={(text) => {
                            setRide({ carModel: text })
                            setErrors(e => ({ ...e, carModel: false }))
                        }}
                        error={errors.carModel}
                        right={!errors.carModel && ride.carModel ? <TextInput.Icon icon="check" /> : undefined}
                        style={{ marginBottom: 12 }}
                    />

                    <TextInput
                        label="Car Environment"
                        mode="outlined"
                        value={ride.environment}
                        onChangeText={(text) => {
                            setRide({ environment: text })
                            setErrors(e => ({ ...e, environment: false }))
                        }}
                        error={errors.environment}
                        right={!errors.environment && ride.environment ? <TextInput.Icon icon="check" /> : undefined}
                        style={{ marginBottom: 12 }}
                    />
                </>
            )}

            <TextInput
                label="Other notes"
                mode="outlined"
                multiline
                value={ride.notes}
                onChangeText={(text) => setRide({ notes: text })}
                style={{ marginBottom: 16 }}
            />

            <Button mode="contained" onPress={handleSubmit}>
                Next
            </Button>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
    radioLabel: {
        marginLeft: 8,
    },
    section: {
        marginBottom: 16,
    },
    subsection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
})
