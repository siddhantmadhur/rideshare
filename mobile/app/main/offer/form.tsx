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
import { FlatList } from 'react-native'
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
    const GOOGLE_API_KEY = "AIzaSyDDo5-qCptGQBi5S5wGpxkm8obGoPZLmLk" // Your API key
    
    console.log('Making API call for:', location)
    
    // Using the correct Google Places Autocomplete API endpoint
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(location)}&key=${GOOGLE_API_KEY}`
    
    const res = await fetch(url, {
        method: "GET",
    })
    
    console.log('API response status:', res.status)
    if (res.ok) {
        const data = await res.json()
        console.log('API response data:', data)
        
        // Convert to our expected format
        if (data.predictions) {
            return {
                suggestions: data.predictions.map((prediction: any) => ({
                    placePrediction: {
                        placeId: prediction.place_id,
                        text: {
                            text: prediction.description
                        }
                    }
                }))
            } as PlacesListType
        }
    } else {
        const errorText = await res.text()
        console.error('API error:', errorText)
    }
    return null
}


const PlacesAutocompleteInputBox = (props: {
    placeholder: string,
    onChangeText: (name: string, id: string)=>void,
}) => {
    const [loading, setLoading] = useState(false)
    const [suggestionsList, setSuggestionsList] = useState<PlaceObj[]>([])
    const [inputValue, setInputValue] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const theme = useTheme()
  
    const getSuggestions = useCallback(async (q: string) => {
      console.log('getSuggestions called with:', q)
      if (typeof q !== 'string' || q.length < 3) {
        setSuggestionsList([])
        setShowSuggestions(false)
        return
      }
      setLoading(true)
      try {
        const response = await fetchPlace(q) 
        console.log("Fetch response:", response)
        if (response && response.suggestions) {
          const suggestions = response.suggestions.map((place) => {
            return {id: place.placePrediction.placeId, title: place.placePrediction.text.text} as PlaceObj
          })
          console.log('Setting suggestions:', suggestions)
          setSuggestionsList(suggestions)
          setShowSuggestions(true)
        } else {
          console.log('No suggestions found')
          setSuggestionsList([])
          setShowSuggestions(false)
        }
      } catch (error) {
        console.error('Error fetching places:', error)
        setSuggestionsList([])
        setShowSuggestions(false)
      }
      setLoading(false)
    }, [])

    const handleInputChange = (text: string) => {
      setInputValue(text)
      getSuggestions(text)
    }

    const handleSelectPlace = (item: PlaceObj) => {
      setInputValue(item.title)
      setShowSuggestions(false)
      props.onChangeText(item.title, item.id)
    }

    const handleManualEntry = () => {
      // Allow manual entry if API fails - generate a temporary ID
      if (inputValue.length > 0 && suggestionsList.length === 0) {
        const tempId = `manual_${Date.now()}`
        props.onChangeText(inputValue, tempId)
        console.log('Manual entry:', inputValue, tempId)
      }
    }

    return (
      <View style={{ flex: 1, zIndex: 1000 }}>
        <TextInput
          placeholder={props.placeholder}
          value={inputValue}
          onChangeText={handleInputChange}
          onBlur={handleManualEntry}
          autoCorrect={false}
          autoCapitalize='none'
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.primaryContainer,
              borderColor: theme.colors.primary,
              color: theme.colors.onPrimaryContainer,
            }
          ]}
        />
        {showSuggestions && suggestionsList.length > 0 && (
          <View style={{
            position: 'absolute',
            top: 50, // Position below the input
            left: 0,
            right: 0,
            maxHeight: 200,
            backgroundColor: theme.colors.secondaryContainer,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            borderRadius: 8,
            elevation: 5, // Android shadow
            shadowColor: '#000', // iOS shadow
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            zIndex: 1000,
          }}>
            <FlatList
              data={suggestionsList}
              keyExtractor={(item) => item.id}
              nestedScrollEnabled={true}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelectPlace(item)}
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outline,
                  }}
                >
                  <Text style={{ color: theme.colors.onSecondaryContainer }}>
                    {item.title}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}
        {loading && (
          <Text style={{ marginTop: 5, color: theme.colors.onSurfaceVariant }}>
            Loading suggestions...
          </Text>
        )}
      </View>
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
