import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

type Props = {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  hideBack?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function ScreenHeader({ title, subtitle, right, hideBack, style }: Props) {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <View className="flex-row items-center gap-2 border-b border-border bg-background px-3 pt-2 pb-3" style={style}>
      {hideBack ? null : (
        <Pressable
          onPress={goBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-9 w-9 items-center justify-center rounded-full active:bg-surface-muted"
        >
          <Text className="text-ink text-2xl leading-none">‹</Text>
        </Pressable>
      )}
      <View className="flex-1">
        {title ? (
          <Text className="text-lg font-semibold text-ink" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text className="text-xs text-ink-muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? null}
    </View>
  );
}