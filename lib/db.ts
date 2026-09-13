import type { SQLiteDatabase } from "expo-sqlite";

export type Book = {
  id: number;
  slug: string;
  title: string;
  author: string;
  language: string;
  kalam_count: number;
};

export type Kalam = {
  id: number;
  book_id: number;
  position: number;
  slug: string;
  title_urdu: string;
  title_roman: string;
  url: string;
  urdu: string;
  transliteration: string;
};

export type SearchResult = Kalam & {
  book_slug: string;
  book_title: string;
};

export function getBooks(db: SQLiteDatabase): Promise<Book[]> {
  return db.getAllAsync<Book>("SELECT * FROM books ORDER BY id");
}

export function getBookBySlug(db: SQLiteDatabase, slug: string): Promise<Book | null> {
  return db.getFirstAsync<Book>("SELECT * FROM books WHERE slug = ?", [slug]);
}

export function getKalams(db: SQLiteDatabase, bookId: number): Promise<Kalam[]> {
  return db.getAllAsync<Kalam>(
    "SELECT * FROM kalams WHERE book_id = ? ORDER BY position",
    [bookId],
  );
}

export function getKalam(db: SQLiteDatabase, kalamId: number): Promise<Kalam | null> {
  return db.getFirstAsync<Kalam>("SELECT * FROM kalams WHERE id = ?", [kalamId]);
}

export type Adjacent = {
  prevId: number | null;
  nextId: number | null;
};

export async function getAdjacent(
  db: SQLiteDatabase,
  bookId: number,
  position: number,
): Promise<Adjacent> {
  const prev = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM kalams WHERE book_id = ? AND position < ? ORDER BY position DESC LIMIT 1",
    [bookId, position],
  );
  const next = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM kalams WHERE book_id = ? AND position > ? ORDER BY position ASC LIMIT 1",
    [bookId, position],
  );
  return { prevId: prev?.id ?? null, nextId: next?.id ?? null };
}

export function searchKalams(db: SQLiteDatabase, query: string, limit = 100): Promise<SearchResult[]> {
  const q = `%${query.trim()}%`;
  return db.getAllAsync<SearchResult>(
    `SELECT k.*, b.slug AS book_slug, b.title AS book_title
     FROM kalams k
     JOIN books b ON b.id = k.book_id
     WHERE k.title_urdu LIKE ? OR k.title_roman LIKE ? OR k.urdu LIKE ? OR k.transliteration LIKE ?
     ORDER BY b.id, k.position
     LIMIT ?`,
    [q, q, q, q, limit],
  );
}

export type Favorite = Kalam & {
  book_slug: string;
  book_title: string;
};

export async function ensureFavoritesTable(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS favorites (kalam_id INTEGER PRIMARY KEY NOT NULL);",
  );
}

export function getFavorites(db: SQLiteDatabase): Promise<Favorite[]> {
  return db.getAllAsync<Favorite>(
    `SELECT k.*, b.slug AS book_slug, b.title AS book_title
     FROM favorites f
     JOIN kalams k ON k.id = f.kalam_id
     JOIN books b ON b.id = k.book_id
     ORDER BY f.rowid DESC, k.id DESC`,
  );
}

export function isFavorite(db: SQLiteDatabase, kalamId: number): Promise<boolean> {
  return db
    .getFirstAsync<{ n: number }>(
      "SELECT 1 AS n FROM favorites WHERE kalam_id = ? LIMIT 1",
      [kalamId],
    )
    .then((row) => row !== null);
}

export async function toggleFavorite(
  db: SQLiteDatabase,
  kalamId: number,
): Promise<boolean> {
  const exists = await isFavorite(db, kalamId);
  if (exists) {
    await db.runAsync("DELETE FROM favorites WHERE kalam_id = ?", [kalamId]);
  } else {
    await db.runAsync("INSERT INTO favorites (kalam_id) VALUES (?)", [kalamId]);
  }
  return !exists;
}