import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DeviceEventEmitter } from 'react-native'
import { supabase } from './supabase'

export const LOCATION_TASK = 'BACKGROUND_LOCATION_TASK'
export const SESSION_ENDED_REMOTELY_EVENT = 'nightOutSessionEndedRemotely'

const STORAGE_KEY = 'night_out_points'
const MIN_DISTANCE_M = 20
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
  if (error) {
    if (error.code === '42501') {
      console.warn('[location] session was already ended remotely, stopping tracking')
      await Location.stopLocationUpdatesAsync(LOCATION_TASK).catch(() => {})
      await AsyncStorage.removeItem('night_out_meta')
      await AsyncStorage.removeItem('night_out_last_sync')
      DeviceEventEmitter.emit(SESSION_ENDED_REMOTELY_EVENT, { sessionId })
      return
    }
    console.error('[location] failed to sync points to supabase:', error)
    return
  }
  console.log(`[location] synced ${rows.length} point(s) to supabase`)
  const synced = points.map(p => ({ ...p, synced: true }))
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(synced))
}

// Called by the background task
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('[location] background task error:', error)
    return
  }
  if (!data) {
    console.log('[location] task fired with no data')
    return
  }
  const { locations } = data
  console.log(`[location] task fired with ${locations.length} location(s)`)

  const meta = await AsyncStorage.getItem('night_out_meta')
  if (!meta) {
    console.log('[location] no active session meta, skipping')
    return
  }
  const { sessionId, userId } = JSON.parse(meta)

  const stored = await getStoredPoints()
  let last = stored[stored.length - 1]

  for (const loc of locations) {
    const { latitude, longitude } = loc.coords
    if (last && haversineMeters(last.latitude, last.longitude, latitude, longitude) < MIN_DISTANCE_M) {
      console.log('[location] point too close to last, skipping')
      continue
    }
    await appendPoint({ latitude, longitude, recorded_at: new Date().toISOString(), synced: false })
    last = { latitude, longitude }
    console.log(`[location] appended point ${latitude}, ${longitude}`)
  }

  const lastSync = await AsyncStorage.getItem('night_out_last_sync')
  if (!lastSync || Date.now() - parseInt(lastSync) > SYNC_INTERVAL_MS) {
    await syncToSupabase(sessionId, userId)
    await AsyncStorage.setItem('night_out_last_sync', String(Date.now()))
  }
})

export async function requestLocationPermissions() {
  const { status: fg } = await Location.requestForegroundPermissionsAsync()
  if (fg !== 'granted') return { foreground: false, background: false }

  const { status: bg } = await Location.requestBackgroundPermissionsAsync()
  return { foreground: true, background: bg === 'granted' }
}

export async function startLocationTracking(sessionId, userId) {
  await AsyncStorage.setItem('night_out_meta', JSON.stringify({ sessionId, userId }))
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  await AsyncStorage.setItem('night_out_last_sync', String(Date.now()))

  const initial = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
  await appendPoint({
    latitude: initial.coords.latitude,
    longitude: initial.coords.longitude,
    recorded_at: new Date().toISOString(),
    synced: false,
  })
  console.log(`[location] captured initial fix ${initial.coords.latitude}, ${initial.coords.longitude}`)

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
  await closeSession(sessionId, userId, new Date().toISOString())

  await AsyncStorage.removeItem('night_out_meta')
  await AsyncStorage.removeItem('night_out_last_sync')
}

async function closeSession(sessionId, userId, endedAt) {
  const { error } = await supabase
    .from('night_out_locations')
    .update({ ended_at: endedAt })
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .is('ended_at', null)
  if (error) console.error('[location] failed to set ended_at:', error)
}

// Called once on app launch. If a previous run left an active session behind
// (the app was killed/crashed instead of the user tapping "it's over"), finish
// it now using the last point we actually captured, not the current time.
export async function reconcileDanglingSession() {
  const meta = await AsyncStorage.getItem('night_out_meta')
  if (!meta) return

  const { sessionId, userId } = JSON.parse(meta)
  console.log('[location] found a dangling session from a previous run, reconciling', sessionId)

  const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)
  if (isRunning) await Location.stopLocationUpdatesAsync(LOCATION_TASK)

  await syncToSupabase(sessionId, userId)

  const points = await getStoredPoints()
  const lastPoint = points[points.length - 1]
  await closeSession(sessionId, userId, lastPoint?.recorded_at ?? new Date().toISOString())

  await AsyncStorage.removeItem('night_out_meta')
  await AsyncStorage.removeItem('night_out_last_sync')
  await AsyncStorage.removeItem(STORAGE_KEY)
}

export { getStoredPoints }
