import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import LanguageToggle from "@/components/LanguageToggle";
import ScreenHeader from "@/components/ScreenHeader";
import { getAdjacent, getKalam, isFavorite, toggleFavorite, type Adjacent, type Kalam } from "@/lib/db";
import {
  bodyDirection,
  kalamBody,
  kalamTitle,
  langFont,
  langFontBold,
  useLang,
} from "@/lib/lang";

export default function KalamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const { lang, isUrdu } = useLang();
  const insets = useSafeAreaInsets();
  const [kalam, setKalam] = useState<Kalam | null>(null);
  const [adjacent, setAdjacent] = useState<Adjacent>({ prevId: null, nextId: null });
  const [favorite, setFavorite] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function load() {
        const kalamId = Number(id);
        const found = await getKalam(db, kalamId);
        if (cancelled) return;
        setKalam(found);
        if (found) {
          const [around, fav] = await Promise.all([
            getAdjacent(db, found.book_id, found.position),
            isFavorite(db, kalamId),
          ]);
          if (!cancelled) {
            setAdjacent(around);
            setFavorite(fav);
          }
        }
      }
      load();
      return () => {
        cancelled = true;
      };
    }, [db, id]),
  );

  const lines = useMemo(() => {
    if (!kalam) return [];
    return kalamBody(kalam, lang).split("\n");
  }, [kalam, lang]);

  const direction = bodyDirection(lang);

  const goTo = (targetId: number) => {
    router.replace({ pathname: "/kalam/[id]", params: { id: String(targetId) } });
  };

  const onToggleFavorite = async () => {
    if (!kalam) return;
    const next = await toggleFavorite(db, kalam.id);
    setFavorite(next);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <ScreenHeader
        style={{ paddingTop: insets.top + 8 }}
        right={
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={onToggleFavorite}
              disabled={!kalam}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={favorite ? "Remove from favorites" : "Add to favorites"}
              className="h-9 w-9 items-center justify-center rounded-full active:bg-surface-muted"
            >
              <Text className={`text-xl leading-none ${favorite ? "text-accent" : "text-ink-soft"}`}>
                ♥
              </Text>
            </Pressable>
            <View className="w-36">
              <LanguageToggle />
            </View>
          </View>
        }
      />
      {kalam ? (
        <>
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
            <Text
              className={`text-xl font-bold leading-8 text-ink ${isUrdu ? "text-right" : "text-left"}`}
               style={{ writingDirection: direction, ...langFontBold(lang, 44) }}
            >
              {kalamTitle(kalam, lang)}
            </Text>

            <View className="mt-6">
              {lines.map((line, index) =>
                line.trim() === "" ? (
                  <View key={index} className="h-5" />
                ) : (
                  <Text
                    key={index}
                    className={`text-lg leading-9 text-ink ${
                      isUrdu ? "text-right" : "text-left"
                    }`}
                     style={{ writingDirection: direction, ...langFont(lang, 44) }}
                  >
                    {line}
                  </Text>
                ),
              )}
            </View>
          </ScrollView>

          <View className="flex-row items-center justify-between border-t border-border bg-surface px-4 py-3">
            <Pressable
              onPress={() => adjacent.prevId && goTo(adjacent.prevId)}
              disabled={!adjacent.prevId}
              accessibilityRole="button"
              className={`rounded-full border border-border px-4 py-2 ${
                adjacent.prevId ? "active:bg-surface-muted" : "opacity-40"
              }`}
            >
              <Text className="text-base text-ink">‹ Previous</Text>
            </Pressable>
            <Text className="text-xs text-ink-soft">
              {kalam.position}
            </Text>
            <Pressable
              onPress={() => adjacent.nextId && goTo(adjacent.nextId)}
              disabled={!adjacent.nextId}
              accessibilityRole="button"
              className={`rounded-full border border-border px-4 py-2 ${
                adjacent.nextId ? "active:bg-surface-muted" : "opacity-40"
              }`}
            >
              <Text className="text-base text-ink">Next ›</Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </SafeAreaView>
  );
}
