import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  lang: "iqbal.lang",
  lastBook: "iqbal.lastBook",
} as const;

export type LastBook = {
  slug: string;
  bookId: number;
};

export async function getStoredLang(): Promise<"urdu" | "roman" | null> {
  const raw = await AsyncStorage.getItem(KEYS.lang);
  return raw === "urdu" || raw === "roman" ? raw : null;
}

export async function setStoredLang(lang: "urdu" | "roman"): Promise<void> {
  await AsyncStorage.setItem(KEYS.lang, lang);
}

export async function getStoredLastBook(): Promise<LastBook | null> {
  const raw = await AsyncStorage.getItem(KEYS.lastBook);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LastBook;
  } catch {
    return null;
  }
}

export async function setStoredLastBook(book: LastBook): Promise<void> {
  await AsyncStorage.setItem(KEYS.lastBook, JSON.stringify(book));
}