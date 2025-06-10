/* eslint-disable import/no-unresolved */
import { SERVER_URL } from "@/lib/constants";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { PlaceObj } from "../offer/form";

export interface RideInfo {
  id: number;
  display_name?: string;
  pickup: string;
  dropoff: string;
  passengers: string | number;
  timestamp: string;
  notes: string;
  user_id: string;
  has_car: boolean;
  split_gas: boolean;
  split_uber: boolean;
  date: string;
  time: string;
  car_model: string;
  environment: string;
}

type ItemProps = {
  item: RideInfo;
};

const Item = ({ item }: ItemProps) => {
  const theme = useTheme();
  const date = new Date(item.timestamp);
  const router = useRouter();

  const pickup = (JSON.parse(item.pickup) as PlaceObj).title.split(",")[0];
  const dropoff = (JSON.parse(item.dropoff) as PlaceObj).title.split(",")[0];

  return (
    <Pressable onPress={() => router.push(`/main/rides/detailed?ride_id=${item.id}`)}>
      <Card
        mode="contained"
        style={{
          padding: 15,
          margin: 8,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 5,
            color: theme.colors.onSurface,
          }}
        >
          {pickup} to {dropoff}
        </Text>
        <Text style={{ color: theme.colors.onSurface }}>Driven by {item.display_name}</Text>
        <Text style={{ color: theme.colors.onSurface }}>{date.toLocaleString()}</Text>
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.primary,
            marginTop: 5,
            fontStyle: "italic",
          }}
        >
          Tap to view route →
        </Text>
      </Card>
    </Pressable>
  );
};

const RidesPage = () => {
  const [rides, setRides] = useState<RideInfo[]>([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch(`${SERVER_URL}/rides`);
      if (res.ok) {
        const data = await res.json();
        setRides(data as RideInfo[]);
      }
    };
    fetchItems();
  }, []);

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <FlatList
        renderItem={({ item }) => <Item item={item} />}
        data={rides}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  );
};

export default RidesPage;
