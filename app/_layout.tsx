import {
  NotoNastaliqUrdu_400Regular,
  NotoNastaliqUrdu_700Bold,
} from "@expo-google-fonts/noto-nastaliq-urdu";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LangProvider, URDU_FONT_FAMILY, URDU_FONT_FAMILY_BOLD } from "@/lib/lang";
import { ensureFavoritesTable } from "@/lib/db";
import "../global.css";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    [URDU_FONT_FAMILY]: NotoNastaliqUrdu_400Regular,
    [URDU_FONT_FAMILY_BOLD]: NotoNastaliqUrdu_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SQLiteProvider
      databaseName="iqbal-poetry.db"
      assetSource={{
        assetId: require("../assets/iqbal-poetry.db"),
        forceOverwrite: false,
      }}
      onInit={ensureFavoritesTable}
    >
      <LangProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </LangProvider>
    </SQLiteProvider>
  );
}