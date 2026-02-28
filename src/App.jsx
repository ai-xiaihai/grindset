import { useState, useEffect } from 'react'
import BottomNav from './components/BottomNav'
import FeedTab from './components/FeedTab'
import LeaderboardTab from './components/LeaderboardTab'
import RecordTab from './components/RecordTab'
import ProfileTab from './components/ProfileTab'
import './App.css'

export function calcXP(entries, bacEntries, streakCount) {
  const vaped = entries.filter(e => e.type === 'vape').length * 10
  const drank = entries.filter(e => e.type === 'drink').length * 15
  const bac = bacEntries.length * 25
  const streakBonus = streakCount * 50
  return vaped + drank + bac + streakBonus
}

export default function App() {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('grindset-entries') || '[]') }
    catch { return [] }
  })
  const [bacEntries, setBacEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('grindset-bac') || '[]') }
    catch { return [] }
  })
  const [streak, setStreak] = useState(() => {
    try { return JSON.parse(localStorage.getItem('grindset-streak') || '{"count":0,"lastDate":null}') }
    catch { return { count: 0, lastDate: null } }
  })
  const [tab, setTab] = useState('feed')

  useEffect(() => { localStorage.setItem('grindset-entries', JSON.stringify(entries)) }, [entries])
  useEffect(() => { localStorage.setItem('grindset-bac', JSON.stringify(bacEntries)) }, [bacEntries])
  useEffect(() => { localStorage.setItem('grindset-streak', JSON.stringify(streak)) }, [streak])

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

  const addBac = (bac, photo = null) => {
    setBacEntries(prev => [{ id: Date.now(), bac, photo, timestamp: new Date().toISOString() }, ...prev])
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
      {tab === 'leaderboard' && <LeaderboardTab stats={stats} />}
      {tab === 'record'      && <RecordTab onAddEntry={addEntry} onAddBac={addBac} />}
      {tab === 'profile'     && <ProfileTab stats={stats} entries={entries} bacEntries={bacEntries} />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
