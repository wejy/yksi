import { Tabs } from 'expo-router'
import { Text, type ColorValue } from 'react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3525cd',
        tabBarInactiveTintColor: '#464555',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#c7c4d8',
          height: 64,
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
