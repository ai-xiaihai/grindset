import { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { supabase } from './src/lib/supabase'
import AuthScreen from './src/screens/AuthScreen'
import OnboardingScreen from './src/screens/OnboardingScreen'
import FeedScreen from './src/screens/FeedScreen'
import LeaderboardScreen from './src/screens/LeaderboardScreen'
import RecordScreen from './src/screens/RecordScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import ShopScreen from './src/screens/ShopScreen'
import NudgeModal, { shouldShowNudge, randomFriend } from './src/components/NudgeModal'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const TAB_ICONS = {
  Feed: '🏠',
  Leaderboard: '🏆',
  Record: '💨',
  Shop: '🛍️',
  Profile: '👤',
}

export function calcXP(entries, bacEntries, streakCount) {
  const vaped = entries.filter(e => e.type === 'vape').length * 10
  const drank = entries.filter(e => e.type === 'drink').length * 15
  const bac = bacEntries.length * 25
  const streakBonus = streakCount * 50
  return vaped + drank + bac + streakBonus
}

function MainTabs({ session, profile, stats, entries, bacEntries, onAddEntry, onAddBac, nudge, onDismissNudge }) {
  return (
    <>
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
        <Tab.Screen name="Feed">
          {() => <FeedScreen stats={stats} bacEntries={bacEntries} />}
        </Tab.Screen>
        <Tab.Screen name="Leaderboard">
          {() => <LeaderboardScreen stats={stats} profile={profile} />}
        </Tab.Screen>
        <Tab.Screen name="Record">
          {() => <RecordScreen onAddEntry={onAddEntry} onAddBac={onAddBac} />}
        </Tab.Screen>
        <Tab.Screen name="Shop" component={ShopScreen} />
        <Tab.Screen name="Profile">
          {() => <ProfileScreen session={session} profile={profile} stats={stats} entries={entries} bacEntries={bacEntries} />}
        </Tab.Screen>
      </Tab.Navigator>
      {nudge && <NudgeModal friend={nudge} onDismiss={onDismissNudge} />}
    </>
  )
}

function AppInner({ session, profile }) {
  const [entries, setEntries] = useState([])
  const [bacEntries, setBacEntries] = useState([])
  const [streak, setStreak] = useState({ count: 0, lastDate: null })
  const [nudge, setNudge] = useState(() => shouldShowNudge() ? randomFriend() : null)

  // Load persisted state from AsyncStorage
  useEffect(() => {
    AsyncStorage.multiGet(['grindset-entries', 'grindset-bac', 'grindset-streak']).then(pairs => {
      const [entriesRaw, bacRaw, streakRaw] = pairs.map(p => p[1])
      if (entriesRaw) setEntries(JSON.parse(entriesRaw))
      if (bacRaw) {
        const raw = JSON.parse(bacRaw)
        setBacEntries(raw.filter(e => e && e.bac != null && !isNaN(e.bac)))
      }
      if (streakRaw) setStreak(JSON.parse(streakRaw))
    })
  }, [])

  useEffect(() => {
    AsyncStorage.setItem('grindset-entries', JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    const slim = bacEntries.map(({ photo, socialPhoto, genericPhoto, ...rest }) => rest)
    AsyncStorage.setItem('grindset-bac', JSON.stringify(slim))
  }, [bacEntries])

  useEffect(() => {
    AsyncStorage.setItem('grindset-streak', JSON.stringify(streak))
  }, [streak])

  const addEntry = (type, note = '') => {
    const now = new Date()
    const today = now.toDateString()
    setEntries(prev => [{ id: Date.now(), type, note, timestamp: now.toISOString() }, ...prev])
    setStreak(prev => {
      if (prev.lastDate === today) return prev
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const newCount = prev.lastDate === yesterday.toDateString() ? prev.count + 1 : 1
      return { count: newCount, lastDate: today }
    })
  }

  const addBac = (bac, photo = null, comment = '', socialPhoto = null, genericPhoto = null) => {
    setBacEntries(prev => [{ id: Date.now(), bac, photo, comment, socialPhoto, genericPhoto, timestamp: new Date().toISOString() }, ...prev])
  }

  const today = new Date().toDateString()
  const todayEntries = entries.filter(e => new Date(e.timestamp).toDateString() === today)
  const stats = {
    todayVapes: todayEntries.filter(e => e.type === 'vape').length,
    todayDrinks: todayEntries.filter(e => e.type === 'drink').length,
    totalVapes: entries.filter(e => e.type === 'vape').length,
    totalDrinks: entries.filter(e => e.type === 'drink').length,
    wellnessScore: Math.max(0, 100 - todayEntries.filter(e => e.type === 'vape').length * 4 - todayEntries.filter(e => e.type === 'drink').length * 3),
    streak: streak.count,
    xp: calcXP(entries, bacEntries, streak.count),
    totalBac: bacEntries.length,
  }

  return (
    <MainTabs
      session={session}
      profile={profile}
      stats={stats}
      entries={entries}
      bacEntries={bacEntries}
      onAddEntry={addEntry}
      onAddBac={addBac}
      nudge={nudge}
      onDismissNudge={() => setNudge(null)}
    />
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(undefined)

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
              {() => <AppInner session={session} profile={profile} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
