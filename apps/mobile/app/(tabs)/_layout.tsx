import { Tabs } from 'expo-router'
import { Text, type ColorValue } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TAB_BAR_HEIGHT } from '@/lib/layout'
import { useI18n } from '@yksi/i18n/react'

export default function TabLayout() {
  const { t } = useI18n()
  const insets = useSafeAreaInsets()
  const tabBarPaddingBottom = Math.max(insets.bottom, 8)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3525cd',
        tabBarInactiveTintColor: '#464555',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#c7c4d8',
          height: TAB_BAR_HEIGHT + tabBarPaddingBottom,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.dashboard'),
          tabBarIcon: ({ color }) => <TabIcon name="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t('nav.tasks'),
          tabBarIcon: ({ color }) => <TabIcon name="✓" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('nav.calendar'),
          tabBarIcon: ({ color }) => <TabIcon name="📅" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
        }}
      />
    </Tabs>
  )
}

function TabIcon({ name, color }: { name: string; color: ColorValue }) {
  return <Text style={{ fontSize: 20, color }}>{name}</Text>
}
