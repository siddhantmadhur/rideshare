import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text, Chip, Button } from "react-native-paper";
import { useAuthStore } from "@/lib/store";
import { SERVER_URL } from "@/lib/constants";
import { useRouter } from "expo-router";

export const ProfileView = (profile: {
  display_name: string;
  description: string;
  gender: string;
  pronouns: string;
  interests: string[];
  date_of_birth: string;
}) => {
  const dob = new Date(profile.date_of_birth);
  const formattedDOB = `${dob.getDate()} ${dob.toLocaleString("default", { month: "long" })} ${dob.getFullYear()}`;
  return (
    <View>
      <Text style={styles.label}>Name</Text>
      <Text style={styles.text}>{profile.display_name || "N/A"}</Text>

      <Text style={styles.label}>Description</Text>
      <Text style={styles.text}>{profile.description || "N/A"}</Text>

      <Text style={styles.label}>Date of Birth</Text>
      <Text style={styles.text}>{formattedDOB}</Text>

      <Text style={styles.label}>Gender</Text>
      <Text style={styles.text}>{profile.gender || "N/A"}</Text>

      <Text style={styles.label}>Pronouns</Text>
      <Text style={styles.text}>{profile.pronouns || "N/A"}</Text>

      <Text style={styles.label}>Interests</Text>
      <View style={styles.chipContainer}>
        {(profile.interests || []).map((interest: string, i: number) => (
          <Chip key={i} style={styles.chip}>
            {interest}
          </Chip>
        ))}
      </View>
    </View>
  );
};

export default function ProfileViewScreen() {
  // j for viewing profile on profile page
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(`${SERVER_URL}/user/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        Alert.alert("Error", "Failed to load profile");
        return;
      }
      const data = await res.json();
      setProfile(data);
    };
    fetchProfile();
  }, [user]);

  if (!profile) return <ActivityIndicator style={{ marginTop: 40 }} />;


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>
        My Profile
      </Text>

      <ProfileView {...profile}  />

      <Button
        mode="outlined"
        onPress={() => router.push("/main/profile/edit")}
        style={styles.button}
      >
        {" "}
        {/* which is home tab */}
        Edit Profile
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 14,
    backgroundColor: "#f9f9f9",
  },
  header: {
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    color: "#555",
  },
  text: {
    marginBottom: 12,
    fontSize: 16,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 20,
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
  },
  button: {
    marginTop: 20,
  },
});
