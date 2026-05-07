import { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { supabase } from './src/lib/supabase'
import AuthScreen from './src/screens/AuthScreen'
import OnboardingScreen from './src/screens/OnboardingScreen'
import FeedScreen from './src/screens/FeedScreen'
import LeaderboardScreen from './src/screens/LeaderboardScreen'
import RecordScreen from './src/screens/RecordScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import ShopScreen from './src/screens/ShopScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const TAB_ICONS = {
  Feed: '🏠',
  Leaderboard: '🏆',
  Record: '💨',
  Shop: '🛍️',
  Profile: '👤',
}

function MainTabs({ session, profile }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{TAB_ICONS[route.name]}</Text>,
        tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#58CC02',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 11 },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Record" component={RecordScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Profile">
        {() => <ProfileScreen session={session} profile={profile} />}
      </Tab.Screen>
    </Tab.Navigator>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)  // undefined = loading
  const [profile, setProfile] = useState(undefined)  // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setProfile(undefined); return }
    supabase
      .from('profiles')
      .select('id, name')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data ?? null))
  }, [session])

  // Still loading
  if (session === undefined || (session && profile === undefined)) return null

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session === null ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : profile === null ? (
            <Stack.Screen name="Onboarding">
              {() => <OnboardingScreen userId={session.user.id} onComplete={setProfile} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Main">
              {() => <MainTabs session={session} profile={profile} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
