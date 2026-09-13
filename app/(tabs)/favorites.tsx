import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LanguageToggle from "@/components/LanguageToggle";
import ScreenHeader from "@/components/ScreenHeader";
import { getFavorites, type Favorite } from "@/lib/db";
import {
  bodyDirection,
  bookTitle,
  kalamTitle,
  langFont,
  langFontBold,
  useLang,
} from "@/lib/lang";

export default function FavoritesScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { lang } = useLang();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getFavorites(db).then((rows) => {
        if (!cancelled) setFavorites(rows);
      });
      return () => {
        cancelled = true;
      };
    }, [db]),
  );

  const openKalam = (id: number) =>
    router.push({ pathname: "/kalam/[id]", params: { id: String(id) } });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader
        title="Favorites"
        right={
            <View className="w-36">
            <LanguageToggle />
          </View>
        }
        hideBack
      />
      {favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-3xl text-ink-soft">♥</Text>
          <Text className="mt-3 text-center text-base text-ink">No favorites yet</Text>
          <Text className="mt-1 text-center text-sm text-ink-muted">
            Tap the heart on any kalam to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="gap-3 px-5 pb-8 pt-4"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openKalam(item.id)}
              accessibilityRole="button"
              className="rounded-2xl border border-border bg-surface p-4 active:bg-surface-muted"
            >
              <Text
                className="text-base font-medium text-ink"
                style={{ writingDirection: bodyDirection(lang), ...langFontBold(lang, 32) }}
                numberOfLines={2}
              >
                {kalamTitle(item, lang)}
              </Text>
              <View className="mt-2 flex-row items-center justify-between">
                <Text
                  className="text-xs text-ink-muted"
                  style={{ writingDirection: bodyDirection(lang), ...langFont(lang, 28) }}
                  numberOfLines={1}
                >
                  {bookTitle({ title: item.book_title, slug: item.book_slug }, lang)}
                </Text>
                <Text className="ml-1 text-base text-ink-soft">›</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
