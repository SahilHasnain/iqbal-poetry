import { Pressable, Text, View } from "react-native";
import { useLang, URDU_FONT_FAMILY, type Lang } from "@/lib/lang";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "urdu", label: "اردو" },
  { value: "roman", label: "Roman" },
];

export default function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <View className="flex-row rounded-full bg-surface-muted p-1">
      {OPTIONS.map((option) => {
        const active = option.value === lang;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => setLang(option.value)}
            className={`flex-1 h-9 items-center justify-center rounded-full px-3 ${active ? "bg-primary" : ""}`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                active ? "text-white" : "text-ink-muted"
              }`}
              numberOfLines={1}
              style={option.value === "urdu" ? { fontFamily: URDU_FONT_FAMILY, lineHeight: 22 } : { lineHeight: 18 }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
