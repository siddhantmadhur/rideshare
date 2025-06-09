import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { TextInput, Button, Text, Chip } from 'react-native-paper'
import { useState } from 'react'
import DropDownPicker from 'react-native-dropdown-picker'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Props {
  initialValues: {
    display_name: string
    description: string
    dobDay: string
    dobMonth: string
    dobYear: string
    gender: string
    pronouns: string
    interests: string[]
  }
  onSubmit: (values: any) => void
  mode: 'create' | 'edit'
}

export default function ProfileForm({ initialValues, onSubmit, mode }: Props) {
  const [formValues, setFormValues] = useState(initialValues)
  const [newInterest, setNewInterest] = useState('')
  const [dayOpen, setDayOpen] = useState(false)
  const [monthOpen, setMonthOpen] = useState(false)
  const [yearOpen, setYearOpen] = useState(false)
  const [genderOpen, setGenderOpen] = useState(false)
  const [pronounOpen, setPronounOpen] = useState(false)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const days = Array.from({ length: 31 }, (_, i) => `${i + 1}`)
  const years = Array.from({ length: 125 }, (_, i) => `${2025 - i}`)

  const genderOptions = [
    { label: 'Female', value: 'Female' },
    { label: 'Male', value: 'Male' },
    { label: 'Non-binary', value: 'Non-binary' },
    { label: 'Prefer not to say', value: 'Prefer not to say' },
    { label: 'Self-describe', value: 'Self-describe' },
  ]

  const pronounOptions = [
    { label: 'She/Her', value: 'She/Her' },
    { label: 'He/Him', value: 'He/Him' },
    { label: 'They/Them', value: 'They/Them' },
    { label: 'Prefer not to say', value: 'Prefer not to say' },
    { label: 'Self-describe', value: 'Self-describe' },
  ]

  const handleSubmitInternal = () => {
    const trimmedName = formValues.display_name.trim()
  
    if (!trimmedName) {
      Alert.alert('Validation Error', 'Name is required.')
      return
    }
  
    const sanitized = {
      display_name: trimmedName,
      description: formValues.description.trim(),
      interests: formValues.interests.map(i => i.trim()).filter(Boolean),
      date_of_birth: new Date(
        `${formValues.dobYear}-${months.indexOf(formValues.dobMonth) + 1}-${formValues.dobDay}`
      ).toISOString(),
      gender: formValues.gender,
      pronouns: formValues.pronouns,
      // not including dobDay/dobMonth/dobYear separately bc not in struct, we constructed date_of_birth instead
    }
  
    onSubmit(sanitized)
  }
  

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text variant="titleLarge">{mode === 'edit' ? 'Edit Profile' : 'Create Profile'}</Text>

          <TextInput
            label="Name"
            value={formValues.display_name}
            onChangeText={(text) => setFormValues({ ...formValues, display_name: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Description"
            value={formValues.description}
            onChangeText={(text) => setFormValues({ ...formValues, description: text })}
            mode="outlined"
            style={styles.input}
          />

          <Text>Date of Birth</Text>
          <View style={styles.row}>
            <DropDownPicker
              open={dayOpen}
              value={formValues.dobDay}
              items={days.map(d => ({ label: d, value: d }))}
              setOpen={setDayOpen}
              setValue={(valFn) =>
                setFormValues((prev) => ({ ...prev, dobDay: valFn(prev.dobDay) }))
              }
              placeholder="Day"
              style={styles.dropdown}
              containerStyle={{ flex: 1, zIndex: 3000 }}
            />
            <DropDownPicker
              open={monthOpen}
              value={formValues.dobMonth}
              items={months.map(m => ({ label: m, value: m }))}
              setOpen={setMonthOpen}
              setValue={(valFn) =>
                setFormValues((prev) => ({ ...prev, dobMonth: valFn(prev.dobMonth) }))
              }
              placeholder="Month"
              style={styles.dropdown}
              containerStyle={{ flex: 1, zIndex: 2000 }}
            />
            <DropDownPicker
              open={yearOpen}
              value={formValues.dobYear}
              items={years.map(y => ({ label: y, value: y }))}
              setOpen={setYearOpen}
              setValue={(valFn) =>
                setFormValues((prev) => ({ ...prev, dobYear: valFn(prev.dobYear) }))
              }
              placeholder="Year"
              style={styles.dropdown}
              containerStyle={{ flex: 1, zIndex: 1000 }}
            />
          </View>

          <DropDownPicker
            open={genderOpen}
            value={formValues.gender}
            items={genderOptions}
            setOpen={setGenderOpen}
            setValue={(valFn) =>
              setFormValues((prev) => ({ ...prev, gender: valFn(prev.gender) }))
            }
            placeholder="Select Gender"
            style={styles.dropdown}
            containerStyle={{ zIndex: 900 }}
          />

          <DropDownPicker
            open={pronounOpen}
            value={formValues.pronouns}
            items={pronounOptions}
            setOpen={setPronounOpen}
            setValue={(valFn) =>
              setFormValues((prev) => ({ ...prev, pronouns: valFn(prev.pronouns) }))
            }
            placeholder="Select Pronouns"
            style={styles.dropdown}
            containerStyle={{ zIndex: 800 }}
          />

          <TextInput
            label="Add Interests (hit Enter for each)"
            value={newInterest}
            onChangeText={setNewInterest}
            onSubmitEditing={() => {
              const cleaned = newInterest.trim()
              if (cleaned && !formValues.interests.includes(cleaned)) {
                setFormValues((prev) => ({
                  ...prev,
                  interests: [...prev.interests, cleaned],
                }))
              }
              setNewInterest('')
            }}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.chipContainer}>
            {formValues.interests.map((interest, index) => (
              <Chip
                key={index}
                onClose={() => setFormValues(prev => ({
                  ...prev,
                  interests: prev.interests.filter((_, i) => i !== index),
                }))}
                style={styles.chip}
              >
                {interest}
              </Chip>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleSubmitInternal}
            disabled={!formValues.display_name.trim()}
            style={styles.button}
          >
            {mode === 'edit' ? 'Update Profile' : 'Create Profile'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
    paddingBottom: 60,
    flexGrow: 1,
  },
  input: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  dropdown: {
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    marginBottom: 6,
    marginRight: 6,
  },
  button: {
    marginTop: 20,
    borderRadius: 30,
  },
})
