import { SERVER_URL } from "@/lib/constants";
import { useAuthStore } from "@/lib/store";
import { useSearchParams } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Button, Card, ProgressBar } from "react-native-paper";

interface RideRequest {
  display_name: string;
  description: string;
  user_id: string;
  status: number;
  request_id: number;
}

function ManageRequests() {
  const params = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [requests, setRequests] = useState<RideRequest[] | null>(null);

  const confirmRide = async (accept: boolean, request_id: number) => {
    const ride_id = params.get("ride_id");
    if (ride_id && user) {
      let uri = `${SERVER_URL}/ride/request/${ride_id}/accept/${request_id}`;
      if (!accept) {
        uri = `${SERVER_URL}/ride/request/${ride_id}/decline/${request_id}`;
      }
      const token = await user.getIdToken();
      const res = await fetch(uri, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchRideRequests();
      }
    }
  };
  const fetchRideRequests = async () => {
    const ride_id = params.get("ride_id");
    if (ride_id && user) {
      const token = await user.getIdToken(true);
      const res = await fetch(`${SERVER_URL}/ride/request/${ride_id}/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setRequests(data as RideRequest[]);
    }
  };

  useEffect(() => {
    fetchRideRequests();
  }, []);

  if (!requests) {
    return <ProgressBar />;
  }
  return (
    <ScrollView>
      {requests
        .filter((e) => e.status === 0)
        .map((request) => {
          return (
            <Card
              style={{
                paddingBlock: 12,
                paddingInline: 20,
                margin: 10,
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                {request.display_name}
              </Text>
              <Text style={{}}>{request.description}</Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-around",
                  alignItems: "stretch",
                  marginTop: 15,
                }}
              >
                <Button
                  onPress={() => {
                    confirmRide(true, request.request_id);
                  }}
                  mode="contained"
                >
                  Accept
                </Button>
                <Button
                  onPress={() => {
                    confirmRide(false, request.request_id);
                  }}
                >
                  Decline
                </Button>
              </View>
            </Card>
          );
        })}
    </ScrollView>
  );
}

export default ManageRequests;
