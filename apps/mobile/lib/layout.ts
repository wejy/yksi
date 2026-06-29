import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const TAB_BAR_HEIGHT = 64
export const TAB_CONTENT_GAP = 32
export const FAB_SIZE = 56
export const FAB_SCROLL_EXTRA = FAB_SIZE + 16

/** Bottom padding for scroll content inside tab screens. */
export function useTabScrollBottomPadding() {
  return TAB_CONTENT_GAP
}

/** Bottom padding for stack screens without a tab bar. */
export function useStackScrollBottomPadding() {
  const insets = useSafeAreaInsets()
  return TAB_CONTENT_GAP + insets.bottom
}
