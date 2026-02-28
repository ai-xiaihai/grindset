import { useState, useEffect } from 'react'
import Header from './components/Header'
import StatGrid from './components/StatGrid'
import LogForm from './components/LogForm'
import Timeline from './components/Timeline'
import Insights from './components/Insights'
import Achievements from './components/Achievements'
import BACLogger from './components/BACLogger'
import BACGraph from './components/BACGraph'
import './App.css'

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

  useEffect(() => {
    localStorage.setItem('grindset-entries', JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    localStorage.setItem('grindset-bac', JSON.stringify(bacEntries))
  }, [bacEntries])

  const addBac = (bac, photo = null) => {
    setBacEntries(prev => [{
      id: Date.now(),
      bac,
      photo,
      timestamp: new Date().toISOString(),
    }, ...prev])
  }

  useEffect(() => {
    localStorage.setItem('grindset-streak', JSON.stringify(streak))
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

  const today = new Date().toDateString()
  const todayEntries = entries.filter(e => new Date(e.timestamp).toDateString() === today)
  const todayVapes = todayEntries.filter(e => e.type === 'vape').length
  const todayDrinks = todayEntries.filter(e => e.type === 'drink').length
  const totalVapes = entries.filter(e => e.type === 'vape').length
  const totalDrinks = entries.filter(e => e.type === 'drink').length
  const wellnessScore = Math.max(0, 100 - todayVapes * 4 - todayDrinks * 3)

  return (
    <div className="app">
      <Header />
      <main className="main">
        <div className="container">
          <StatGrid
            todayVapes={todayVapes}
            todayDrinks={todayDrinks}
            wellnessScore={wellnessScore}
            streak={streak.count}
            totalVapes={totalVapes}
            totalDrinks={totalDrinks}
          />
          <div className="content-grid">
            <div className="left-col">
              <LogForm onAdd={addEntry} />
              <BACLogger onAdd={addBac} />
              <Insights />
            </div>
            <div className="right-col">
              <BACGraph entries={bacEntries} />
              <Achievements
                todayVapes={todayVapes}
                todayDrinks={todayDrinks}
                streak={streak.count}
                totalVapes={totalVapes}
                totalDrinks={totalDrinks}
              />
              <Timeline entries={entries.slice(0, 30)} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
