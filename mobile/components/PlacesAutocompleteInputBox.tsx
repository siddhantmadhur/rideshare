// PlacesAutocompleteInputBox.tsx
import React, { useState, forwardRef } from 'react'
import { View, StyleSheet } from 'react-native'
import {
  AutocompleteDropdown,
  IAutocompleteDropdownRef,
} from 'react-native-autocomplete-dropdown'
import { Text } from 'react-native-paper'

interface Props {
  placeholder: string
  error?: boolean
  onChangeText: (title: string, id: string) => void
}

const PlacesAutocompleteInputBoxBase = (
  { placeholder, error, onChangeText }: Props,
  ref: React.ForwardedRef<IAutocompleteDropdownRef>
) => {
  const [suggestions, setSuggestions] = useState<{
    id: string
    title: string
  }[]>([])

  const handleChange = async (query: string) => {
    if (query.length < 3) return
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=YOUR_API_KEY`
      )
      const json = await response.json()
      const results = json.predictions.map((p: any) => ({
        id: p.place_id,
        title: p.description,
      }))
      setSuggestions(results)
    } catch {
      setSuggestions([])
    }
  }

  return (
    <View style={styles.wrapper}>
      <AutocompleteDropdown
        controller={(ctrl) => {
          if (ref && typeof ref !== 'function') {
            ref.current = ctrl
          }
        }}
        clearOnFocus={false}
        closeOnBlur={true}
        closeOnSubmit={false}
        inputContainerStyle={[
          styles.inputContainer,
          error && { borderColor: 'red', borderWidth: 1 },
        ]}
        suggestionsListContainerStyle={styles.dropdown}
        onChangeText={handleChange}
        onSelectItem={(item) => {
          if (item?.title && item.id) {
            onChangeText(item.title, item.id)
          }
        }}
        dataSet={suggestions}
        textInputProps={{
          placeholder,
          autoCorrect: false,
          autoCapitalize: 'none',
          style: styles.textInput,
        }}
      />
      {error && <Text style={styles.errorText}>Required</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  textInput: {
    fontSize: 16,
    paddingVertical: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
})

const PlacesAutocompleteInputBox = forwardRef(PlacesAutocompleteInputBoxBase)

export default PlacesAutocompleteInputBox
