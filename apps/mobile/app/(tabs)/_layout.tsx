import { Tabs } from 'expo-router'
import { Text, type ColorValue } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TAB_BAR_HEIGHT } from '@/lib/layout'

export default function TabLayout() {
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
          title: 'Etusivu',
          tabBarIcon: ({ color }) => <TabIcon name="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tehtävät',
          tabBarIcon: ({ color }) => <TabIcon name="✓" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Kalenteri',
          tabBarIcon: ({ color }) => <TabIcon name="📅" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profiili',
          tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
        }}
      />
    </Tabs>
  )
}

function TabIcon({ name, color }: { name: string; color: ColorValue }) {
  return <Text style={{ fontSize: 20, color }}>{name}</Text>
}
