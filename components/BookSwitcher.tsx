import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import type { Book } from "@/lib/db";
import { bodyDirection, bookTitle, langFont, langFontBold, useLang } from "@/lib/lang";

type Props = {
  books: Book[];
  activeBook: Book;
  onSelect: (book: Book) => void;
};

export default function BookSwitcher({ books, activeBook, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const { lang } = useLang();

  const select = (book: Book) => {
    setOpen(false);
    onSelect(book);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        className="flex-row items-center gap-1.5 rounded-full border border-primary px-4 py-2 active:bg-primary-muted"
      >
        <Text
          className="text-sm font-semibold text-primary"
          style={{ writingDirection: bodyDirection(lang), ...langFontBold(lang, 32) }}
        >
          {bookTitle(activeBook, lang)}
        </Text>
        <Text className="text-xs text-primary">▾</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable className="flex-1 justify-end bg-ink/60" onPress={() => setOpen(false)}>
          <View className="rounded-t-3xl border-t border-border bg-surface px-5 pb-8 pt-4">
            <Text className="text-lg font-semibold text-ink">Books</Text>
            <View className="mt-3 gap-1">
              {books.map((book) => {
                const active = book.id === activeBook.id;
                return (
                  <Pressable
                    key={book.id}
                    onPress={() => select(book)}
                    className={`rounded-xl px-4 py-3 ${active ? "bg-primary-muted" : "active:bg-surface-muted"}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`text-base ${active ? "font-semibold text-primary" : "text-ink"}`}
                        style={{ writingDirection: bodyDirection(lang), ...langFont(lang, 32) }}
                      >
                        {bookTitle(book, lang)}
                      </Text>
                      <Text className={`text-base ${active ? "text-primary" : "text-ink-soft"}`}>
                        {active ? "•" : "›"}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
