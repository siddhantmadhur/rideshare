import { SERVER_URL } from "@/lib/constants";
import { useRouter, useSearchParams } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileView } from "./main/profile";

const UserProfile = () => {
  const params = useSearchParams();
  const user_id = params.get("user_id");

  const router = useRouter()
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<null | any>(null)
  const getProfileInfo = async (id: string) => {
    setLoading(true);
    const res = await fetch(`${SERVER_URL}/user/information?user_id=${user_id}`)
    if (res.ok) {
        const data = await res.json()
        setProfile(data)

    } else {
        console.log('could not fetch user')
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user_id) {
      getProfileInfo(user_id);
    }
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user_id || !profile) {
    return <Text>User Not Found</Text>;
  }
  return (
    <View style={{marginTop: 15, marginInline: 10}}>
        <ProfileView {...profile} />
    </View>
  );
};

export default UserProfile;
