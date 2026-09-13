import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Book, Kalam } from "@/lib/db";
import { getStoredLang, setStoredLang } from "@/lib/storage";

export type Lang = "urdu" | "roman";

export const URDU_FONT_FAMILY = "NotoNastaliqUrdu";
export const URDU_FONT_FAMILY_BOLD = "NotoNastaliqUrduBold";

type LangContextValue = {
  lang: Lang;
  isUrdu: boolean;
  setLang: (lang: Lang) => void;
  toggle: () => void;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("urdu");

  useEffect(() => {
    let cancelled = false;
    getStoredLang().then((stored) => {
      if (!cancelled && stored) {
        setLang(stored);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const changeLang = useCallback((next: Lang) => {
    setLang(next);
    setStoredLang(next);
  }, []);

  const toggle = useCallback(() => {
    setLang((current) => {
      const next = current === "urdu" ? "roman" : "urdu";
      setStoredLang(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ lang, isUrdu: lang === "urdu", setLang: changeLang, toggle }),
    [lang, changeLang, toggle],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang must be used within LangProvider");
  }
  return ctx;
}

export function kalamTitle(kalam: Pick<Kalam, "title_urdu" | "title_roman">, lang: Lang): string {
  return lang === "urdu" ? kalam.title_urdu : stripParenthetical(kalam.title_roman);
}

function stripParenthetical(value: string): string {
  let out = value;
  while (true) {
    const next = out.replace(/\s*\([^()]*\)/g, "");
    if (next === out) break;
    out = next;
  }
  return out.trim();
}

export function kalamBody(kalam: Pick<Kalam, "urdu" | "transliteration">, lang: Lang): string {
  return lang === "urdu" ? kalam.urdu : kalam.transliteration;
}

export function bookTitle(book: Pick<Book, "title" | "slug">, lang: Lang): string {
  if (lang === "urdu") {
    const match = book.title.match(/\(([^)]+)\)/);
    return match ? match[1] : book.title;
  }
  const match = book.title.match(/^([^(]+)/);
  return match ? match[1].trim() : book.slug;
}

export function bodyDirection(lang: Lang): "rtl" | "ltr" {
  return lang === "urdu" ? "rtl" : "ltr";
}

export function langFont(lang: Lang, lineHeight?: number): { fontFamily?: string; lineHeight?: number } {
  return lang === "urdu"
    ? { fontFamily: URDU_FONT_FAMILY, ...(lineHeight ? { lineHeight } : {}) }
    : {};
}

export function langFontBold(
  lang: Lang,
  lineHeight?: number,
): { fontFamily?: string; lineHeight?: number } {
  return lang === "urdu"
    ? { fontFamily: URDU_FONT_FAMILY_BOLD, ...(lineHeight ? { lineHeight } : {}) }
    : {};
}
