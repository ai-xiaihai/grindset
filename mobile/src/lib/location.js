import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabase'

export const LOCATION_TASK = 'BACKGROUND_LOCATION_TASK'

const STORAGE_KEY = 'night_out_points'
const MIN_DISTANCE_M = 100
const SYNC_INTERVAL_MS = 5 * 60 * 1000

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function getStoredPoints() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

async function appendPoint(point) {
  const points = await getStoredPoints()
  points.push(point)
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(points))
}

async function syncToSupabase(sessionId, userId) {
  const points = await getStoredPoints()
  if (!points.length) return
  const unsent = points.filter(p => !p.synced)
  if (!unsent.length) return

  const rows = unsent.map(p => ({
    user_id: userId,
    session_id: sessionId,
    latitude: p.latitude,
    longitude: p.longitude,
    recorded_at: p.recorded_at,
  }))

  const { error } = await supabase.from('night_out_locations').insert(rows)
  if (!error) {
    const synced = points.map(p => ({ ...p, synced: true }))
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(synced))
  }
}

// Called by the background task
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error || !data) return
  const { locations } = data

  const meta = await AsyncStorage.getItem('night_out_meta')
  if (!meta) return
  const { sessionId, userId } = JSON.parse(meta)

  const stored = await getStoredPoints()
  const last = stored[stored.length - 1]

  for (const loc of locations) {
    const { latitude, longitude } = loc.coords
    if (last && haversineMeters(last.latitude, last.longitude, latitude, longitude) < MIN_DISTANCE_M) continue
    await appendPoint({ latitude, longitude, recorded_at: new Date().toISOString(), synced: false })
  }

  const lastSync = await AsyncStorage.getItem('night_out_last_sync')
  if (!lastSync || Date.now() - parseInt(lastSync) > SYNC_INTERVAL_MS) {
    await syncToSupabase(sessionId, userId)
    await AsyncStorage.setItem('night_out_last_sync', String(Date.now()))
  }
})

export async function requestLocationPermissions() {
  const { status: fg } = await Location.requestForegroundPermissionsAsync()
  if (fg !== 'granted') return { granted: false, reason: 'foreground_denied' }

  const { status: bg } = await Location.requestBackgroundPermissionsAsync()
  if (bg === 'granted') return { granted: true }
  return { granted: false, reason: 'background_denied' }
}

export async function startLocationTracking(sessionId, userId) {
  await AsyncStorage.setItem('night_out_meta', JSON.stringify({ sessionId, userId }))
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  await AsyncStorage.setItem('night_out_last_sync', String(Date.now()))

  await Location.startLocationUpdatesAsync(LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: MIN_DISTANCE_M,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Grindset',
      notificationBody: 'Recording your night out...',
    },
  })
}

export async function stopLocationTracking(sessionId, userId) {
  const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)
  if (isRunning) await Location.stopLocationUpdatesAsync(LOCATION_TASK)
  await syncToSupabase(sessionId, userId)
  await AsyncStorage.removeItem('night_out_meta')
  await AsyncStorage.removeItem('night_out_last_sync')
}

export { getStoredPoints }
