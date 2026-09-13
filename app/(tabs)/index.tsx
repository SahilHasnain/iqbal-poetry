import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BookSwitcher from "@/components/BookSwitcher";
import LanguageToggle from "@/components/LanguageToggle";
import { getBooks, getKalams, type Book, type Kalam } from "@/lib/db";
import { bodyDirection, kalamTitle, langFontBold, useLang, URDU_FONT_FAMILY } from "@/lib/lang";
import { getStoredLastBook, setStoredLastBook } from "@/lib/storage";

const DEFAULT_BOOK_SLUG = "bal-e-jibreel";

export default function Index() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { lang } = useLang();
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [kalams, setKalams] = useState<Kalam[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function init() {
        const all = await getBooks(db);
        if (cancelled) return;
        setBooks(all);
        const stored = await getStoredLastBook();
        if (cancelled) return;
        const target =
          all.find((b) => b.id === stored?.bookId && b.slug === stored?.slug) ??
          all.find((b) => b.slug === DEFAULT_BOOK_SLUG) ??
          all[0];
        if (target) {
          setStoredLastBook({ slug: target.slug, bookId: target.id });
          setCurrentBook(target);
        }
      }
      init();
      return () => {
        cancelled = true;
      };
    }, [db]),
  );

  useEffect(() => {
    if (!currentBook) return;
    getKalams(db, currentBook.id).then(setKalams);
  }, [db, currentBook]);

  const selectBook = (book: Book) => {
    setStoredLastBook({ slug: book.slug, bookId: book.id });
    setCurrentBook(book);
  };

  const openKalam = (id: number) =>
    router.push({ pathname: "/kalam/[id]", params: { id: String(id) } });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-5 pt-5 pb-3">
        <View>
          <Text className="text-[26px] font-bold text-ink">Allama Iqbal Poetry</Text>
          <Text
            className="mt-1 text-sm text-ink-muted"
            style={{ fontFamily: URDU_FONT_FAMILY, lineHeight: 28 }}
          >
            کلامِ علامہ محمد اقبال
          </Text>
        </View>
        <View className="mt-5 flex-row items-center justify-between">
          {currentBook && books.length > 0 ? (
            <BookSwitcher books={books} activeBook={currentBook} onSelect={selectBook} />
          ) : null}
            <View className="w-36">
            <LanguageToggle />
          </View>
        </View>
      </View>

      <FlatList
        data={kalams}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="gap-3 px-5 pb-8 pt-1"
        ListEmptyComponent={
          <Text className="mt-8 text-center text-sm text-ink-muted">Loading…</Text>
        }
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
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
