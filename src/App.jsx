import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AuthScreen from './components/AuthScreen'
import OnboardingScreen from './components/OnboardingScreen'
import BottomNav from './components/BottomNav'
import FeedTab from './components/FeedTab'
import LeaderboardTab from './components/LeaderboardTab'
import RecordTab from './components/RecordTab'
import ProfileTab from './components/ProfileTab'
import ShopTab from './components/ShopTab'
import NudgeModal, { shouldShowNudge, randomFriend } from './components/NudgeModal'
import './App.css'

export function calcXP(entries, bacEntries, streakCount) {
  const vaped = entries.filter(e => e.type === 'vape').length * 10
  const drank = entries.filter(e => e.type === 'drink').length * 15
  const bac = bacEntries.length * 25
  const streakBonus = streakCount * 50
  return vaped + drank + bac + streakBonus
}

function AppInner({ profile }) {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('grindset-entries') || '[]') }
    catch { return [] }
  })
  const [bacEntries, setBacEntries] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('grindset-bac') || '[]')
      // Filter out any corrupt entries (bac must be a valid number)
      return raw.filter(e => e && e.bac != null && !isNaN(e.bac))
    }
    catch { return [] }
  })
  const [streak, setStreak] = useState(() => {
    try { return JSON.parse(localStorage.getItem('grindset-streak') || '{"count":0,"lastDate":null}') }
    catch { return { count: 0, lastDate: null } }
  })
  const [tab, setTab] = useState('feed')
  const [nudge, setNudge] = useState(() =>
    shouldShowNudge() ? randomFriend() : null
  )

  useEffect(() => {
    try { localStorage.setItem('grindset-entries', JSON.stringify(entries)) } catch {}
  }, [entries])
  useEffect(() => {
    try {
      // Strip large photo data before persisting — photos are session-only
      const slim = bacEntries.map(({ photo, socialPhoto, genericPhoto, ...rest }) => rest)
      localStorage.setItem('grindset-bac', JSON.stringify(slim))
    } catch {}
  }, [bacEntries])
  useEffect(() => {
    try { localStorage.setItem('grindset-streak', JSON.stringify(streak)) } catch {}
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
  const todayVapes = todayEntries.filter(e => e.type === 'vape').length
  const todayDrinks = todayEntries.filter(e => e.type === 'drink').length
  const totalVapes = entries.filter(e => e.type === 'vape').length
  const totalDrinks = entries.filter(e => e.type === 'drink').length
  const wellnessScore = Math.max(0, 100 - todayVapes * 4 - todayDrinks * 3)
  const xp = calcXP(entries, bacEntries, streak.count)

  const stats = {
    todayVapes, todayDrinks, totalVapes, totalDrinks,
    wellnessScore, streak: streak.count, xp,
    totalBac: bacEntries.length,
  }

  return (
    <div className="app">
      {tab === 'feed'        && <FeedTab entries={entries} bacEntries={bacEntries} stats={stats} />}
      {tab === 'leaderboard' && <LeaderboardTab stats={stats} profile={profile} />}
      {tab === 'record'      && <RecordTab onAddEntry={addEntry} onAddBac={addBac} onNavigate={setTab} />}
      {tab === 'profile'     && <ProfileTab stats={stats} entries={entries} bacEntries={bacEntries} profile={profile} />}
      {tab === 'shop'        && <ShopTab />}
      <BottomNav active={tab} onChange={setTab} />
      {nudge && <NudgeModal friend={nudge} onDismiss={() => setNudge(null)} />}
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading, null = logged out
  const [profile, setProfile] = useState(undefined) // undefined = loading, null = no profile yet

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
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
  if (session === null) return <AuthScreen />
  if (profile === null) return <OnboardingScreen userId={session.user.id} onComplete={setProfile} />
  return <AppInner profile={profile} />
}
