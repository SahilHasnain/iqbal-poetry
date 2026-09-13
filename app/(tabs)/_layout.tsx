import { Tabs } from "expo-router";
import { Text, type ColorValue } from "react-native";
import { colors } from "@/lib/theme";

const ICONS: Record<string, string> = {
  index: "⌂",
  search: "⌕",
  favorites: "♥",
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors["ink-muted"],
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => iconFor(color, size, "index"),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => iconFor(color, size, "search"),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => iconFor(color, size, "favorites"),
        }}
      />
    </Tabs>
  );
}

function iconFor(color: ColorValue, size: number, name: string) {
  return (
    <Text
      style={{ color, fontSize: size, lineHeight: size + 2, textAlign: "center" }}
    >
      {ICONS[name]}
    </Text>
  );
}