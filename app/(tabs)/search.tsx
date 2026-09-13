import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "@/components/ScreenHeader";
import { searchKalams, type SearchResult } from "@/lib/db";
import { bodyDirection, bookTitle, kalamTitle, langFont, langFontBold, useLang } from "@/lib/lang";

export default function SearchScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }, []),
  );

  useEffect(() => {
    const q = query.trim();
    let cancelled = false;
    const handle = setTimeout(() => {
      if (!q) {
        setResults([]);
        setSearched(false);
        return;
      }
      searchKalams(db, q).then((rows) => {
        if (!cancelled) {
          setResults(rows);
          setSearched(true);
        }
      });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [db, query]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader title="Search" hideBack />
      <View className="px-5 pt-3">
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          autoFocus
          autoCorrect={false}
          placeholder="Search in Urdu or Roman"
          className="rounded-2xl border border-border bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-soft"
        />
      </View>

      {searched && results.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-ink-muted">
            No results for “{query.trim()}” in Urdu or Roman.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-2 px-5 pb-8 pt-3"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: "/kalam/[id]", params: { id: String(item.id) } })}
              accessibilityRole="button"
              className="rounded-xl border border-border bg-surface px-4 py-3 active:bg-surface-muted"
            >
              <Text
                className="text-base font-medium text-ink"
                style={{ writingDirection: bodyDirection(lang), ...langFontBold(lang, 32) }}
                numberOfLines={1}
              >
                {kalamTitle(item, lang)}
              </Text>
              <Text
                className="mt-0.5 text-xs text-ink-muted"
                style={{ writingDirection: bodyDirection(lang), ...langFont(lang, 28) }}
                numberOfLines={1}
              >
                {bookTitle({ title: item.book_title, slug: item.book_slug }, lang)}
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
