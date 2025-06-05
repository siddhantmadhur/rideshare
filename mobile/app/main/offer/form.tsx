/* eslint-disable import/no-unresolved */
// --- app/offer/form.tsx ---
import { Checkbox } from 'expo-checkbox'
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ScrollView,
    Alert,
    Pressable,
    Platform,
    Dimensions,
} from 'react-native'
import { useOffer } from '@/context/OfferContext'
import { router } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useCallback, useRef, useState } from 'react'
import { toISOIfValid, convertTo24Hour } from '@/app/utils/dateUtils'
import { AutocompleteDropdown, IAutocompleteDropdownRef } from 'react-native-autocomplete-dropdown'
import { useTheme } from 'react-native-paper'

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
        body: JSON.stringify({
            "input": location 
        })
    })
    if (res.ok) {
        const data = await res.json()
        return data as PlacesListType
    } 
    return null
}


const PlacesAutocompleteInputBox = (props: {
    placeholder: string,
    onChangeText: (name: string, id: string)=>void,
}) => {
    const [loading, setLoading] = useState(false)
    const [suggestionsList, setSuggestionsList] = useState<PlaceObj[]>([])
    const [selectedItem, setSelectedItem] = useState<string | null>(null)
    const dropdownController = useRef<IAutocompleteDropdownRef | null>(null)
  
    const searchRef = useRef(null)
  
    const getSuggestions = useCallback(async (q: string) => {
      const filterToken = q.toLowerCase()
      if (typeof q !== 'string' || q.length < 3) {
        setSuggestionsList([])
        return
      }
      setLoading(true)
      const response = await fetchPlace(q) 
      console.log("called fetch")
      if (response) {

      const suggestions = response.suggestions.map((place, idx) => {
        return {id: place.placePrediction.placeId, title: place.placePrediction.text.text} as PlaceObj
      })
      setSuggestionsList(suggestions)
      }
      setLoading(false)
    }, [])
  
    const onClearPress = useCallback(() => {
      setSuggestionsList([])
    }, [])
  
    const onOpenSuggestionsList = useCallback((isOpened: boolean) => {}, [])
 
    const theme = useTheme()

    return (
      <>
        <View
          style={[
            { flex: 1, flexDirection: 'row', alignItems: 'center' },
            Platform.select({ ios: { zIndex: 1 } }),
          ]}>
          <AutocompleteDropdown
            ref={searchRef}
            controller={controller => {
              dropdownController.current = controller
            }}
            // initialValue={'1'}
            direction={Platform.select({ ios: 'down' })}
            dataSet={suggestionsList}
            onChangeText={getSuggestions}
            onSelectItem={item => {
                if (item) {
                    setSelectedItem(item.id)
                    props.onChangeText(item.title ?? "", item.id)
                }
            }}
            debounce={600}
            suggestionsListMaxHeight={Dimensions.get('window').height * 0.4}
            onClear={onClearPress}
            //  onSubmit={(e) => onSubmitSearch(e.nativeEvent.text)}
            onOpenSuggestionsList={onOpenSuggestionsList}
            loading={loading}
            useFilter={false} // set false to prevent rerender twice
            textInputProps={{
              placeholder: props.placeholder,
              autoCorrect: false,
              autoCapitalize: 'none',
              style: {
                color: theme.colors.onPrimaryContainer,
                paddingLeft: 18,
              },
            }}
            inputContainerStyle={{
              backgroundColor: theme.colors.primaryContainer,
              borderColor: theme.colors.primary,
              borderRadius: 12,
              borderWidth: 1,
            }}
            suggestionsListContainerStyle={{
              backgroundColor: theme.colors.secondaryContainer,
            }}
            containerStyle={{ flexGrow: 1, flexShrink: 1 }}
            renderItem={(item, text) => <Text style={{ color: theme.colors.onSecondaryContainer , padding: 15 }}>{item.title}</Text>}
          //   ChevronIconComponent={<Feather name="chevron-down" size={20} color="#fff" />}
          //   ClearIconComponent={<Feather name="x-circle" size={18} color="#fff" />}
            inputHeight={50}
            showChevron={false}
            closeOnBlur={false}
            //  showClear={false}
          />
        </View>
      </>
    )
   
}


export default function OfferForm() {
    const { setRide, ride } = useOffer()
    const [showDate, setShowDate] = useState(false)
    const [showTime, setShowTime] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({})
    const [hasCar, setHasCar] = useState(false)

    const updateHasCar = (value: boolean) => {
        setHasCar(value)
        setRide({ hasCar: value })
        if (value === true) {
            setRide({ splitUber: false }) // Clear unrelated field
        } else {
            setRide({ splitGas: false })
        }
    }

    // for required inputs
    const validateForm = () => {
        const newErrors: { [key: string]: boolean } = {
            passengers: !ride.passengers || isNaN(Number(ride.passengers)),
            // dont need hasCar, splitGas, splitUber as mandatory inputs
            pickup: !ride.pickup,
            dropoff: !ride.dropoff,
            carModel: hasCar && !ride.carModel,
            date: !ride.date,
            time: !ride.time,
            environment: !ride.environment,
        }

        try {
            toISOIfValid(ride.date, ride.time)
        } catch (err: any) {
            newErrors.date = true
            newErrors.time = true

            if (err.message.includes('Missing')) {
                setErrors(newErrors)
                return 'Please select both date and time.'
            } else if (err.message.includes('Invalid')) {
                setErrors(newErrors)
                return 'Please enter a valid date and time.'
            } else if (err.message.includes('future')) {
                setErrors(newErrors)
                return 'Date and time must be in the future.'
            }
        }

        const errorFields = Object.entries(newErrors)
            .filter(([_, v]) => v)
            .map(([k]) => k)
        if (errorFields.length > 0) {
            return 'Please fill out all required fields correctly.'
        }

        setErrors(newErrors)
        return !Object.values(newErrors).some(Boolean)
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Enter Details on your Ride Offer</Text>

            <TextInput
                placeholder="Number of Passengers"
                keyboardType="numeric"
                style={[styles.input, errors.passengers && styles.error]}
                value={ride.passengers}
                onChangeText={(text) => {
                    setRide({ passengers: text })
                    setErrors((e) => ({ ...e, passengers: false }))
                }}
            />

            <View style={styles.section}>
                <Text>Do you have a car for this ride? </Text>
                <View style={styles.subsection}>
                    <Pressable
                        onPress={() => updateHasCar(true)}
                        style={styles.radioOption}
                    >
                        <Checkbox
                            value={hasCar === true}
                            onValueChange={() => updateHasCar(true)}
                        />
                        <Text style={styles.radioLabel}>Yes</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => updateHasCar(false)}
                        style={styles.radioOption}
                    >
                        <Checkbox
                            value={hasCar === false}
                            onValueChange={() => updateHasCar(false)}
                        />
                        <Text style={styles.radioLabel}>No</Text>
                    </Pressable>
                </View>
            </View>

            {hasCar === true && (
                <View style={styles.section}>
                    <Text>Are you willing to split gas costs?</Text>
                    <Checkbox
                        value={ride.splitGas === true}
                        onValueChange={(value) =>
                            setRide({ splitGas: value ? true : false })
                        }
                    />
                </View>
            )}

            {hasCar === false && (
                <View style={styles.section}>
                    <Text>Are you willing to split an Uber?</Text>
                    <Checkbox
                        value={ride.splitUber === true}
                        onValueChange={(value) =>
                            setRide({ splitUber: value ? true : false })
                        }
                    />
                </View>
            )}

            <PlacesAutocompleteInputBox onChangeText={(name, id)=>{setRide({pickup: {title: name, id: id}})}} placeholder='Pickup Location' />
            <PlacesAutocompleteInputBox onChangeText={(name, id)=>{setRide({dropoff: {title: name, id: id}})}} placeholder='Dropoff Location' />

            <TextInput
                placeholder="Car Model"
                style={[styles.input, errors.carModel && styles.error]}
                value={ride.carModel}
                onChangeText={(text) => {
                    setRide({ carModel: text })
                    setErrors((e) => ({ ...e, carModel: false }))
                }}
            />

            <Pressable
                onPress={() => setShowDate(true)}
                style={[styles.input, errors.date && styles.error]}
            >
                <Text>{ride.date || 'Select Date'}</Text>
            </Pressable>

            <Pressable
                onPress={() => setShowTime(true)}
                style={[styles.input, errors.time && styles.error]}
            >
                <Text>{ride.time || 'Select Time'}</Text>
            </Pressable>

            {showDate && (
                <DateTimePicker
                    mode="date"
                    value={ride.date ? new Date(ride.date) : new Date()}
                    minimumDate={new Date()}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                        setShowDate(false)
                        if (selectedDate) {
                            const formattedDate =
                                selectedDate.toLocaleDateString('en-US') // MM/DD/YEAR
                            setRide({ date: formattedDate })
                        }
                    }}
                />
            )}

            {showTime && (
                <DateTimePicker
                    mode="time"
                    value={
                        ride.time
                            ? new Date(
                                  `1970-01-01T${convertTo24Hour(ride.time)}:00`
                              )
                            : new Date()
                    }
                    minimumDate={new Date()}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                        setShowTime(false)
                        if (selectedDate) {
                            const timeStr = selectedDate.toLocaleTimeString(
                                'en-US',
                                {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                }
                            )
                            setRide({ time: timeStr })
                        }
                    }}
                />
            )}

            <TextInput
                placeholder="Car Environment"
                style={[styles.input, errors.environment && styles.error]}
                value={ride.environment}
                onChangeText={(text) => {
                    setRide({ environment: text })
                    setErrors((e) => ({ ...e, environment: false }))
                }}
            />

            <TextInput
                placeholder="Other notes"
                style={styles.input}
                multiline
                value={ride.notes}
                onChangeText={(text) => setRide({ notes: text })}
            />

            <Button
                title="Next"
                onPress={() => {
                    setTimeout(() => {
                        const result = validateForm()
                        if (result === true) {
                            router.push('/main/offer/review')
                        } else {
                            Alert.alert('Fix Form', result as string)
                        }
                    }, 50)
                }}
            />
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
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        marginBottom: 12,
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
    error: {
        borderColor: 'red',
    },
})
