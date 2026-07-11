import { DeviceEventEmitter } from 'react-native'
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabase'

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  requestBackgroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  startLocationUpdatesAsync: jest.fn(),
  stopLocationUpdatesAsync: jest.fn(),
  hasStartedLocationUpdatesAsync: jest.fn(),
}))

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
}))

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {}
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async key => (key in store ? store[key] : null)),
      setItem: jest.fn(async (key, value) => {
        store[key] = value
      }),
      removeItem: jest.fn(async key => {
        delete store[key]
      }),
      __reset: () => {
        store = {}
      },
    },
  }
})

jest.mock('./supabase', () => ({
  supabase: { from: jest.fn() },
}))

// Builds a chainable + awaitable stand-in for a supabase-js query. Every
// chain method returns the same builder; awaiting the builder (or calling
// its one "terminal" method) resolves to `result`.
function makeQueryResult(result) {
  const builder = {}
  ;['select', 'eq', 'order', 'limit', 'is', 'update'].forEach(method => {
    builder[method] = jest.fn(() => builder)
  })
  builder.insert = jest.fn(() => Promise.resolve(result))
  builder.maybeSingle = jest.fn(() => Promise.resolve(result))
  builder.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject)
  return builder
}

const {
  haversineMeters,
  requestLocationPermissions,
  startLocationTracking,
  stopLocationTracking,
  reconcileDanglingSession,
  getStoredPoints,
  LOCATION_TASK,
  SESSION_ENDED_REMOTELY_EVENT,
} = require('./location')

const taskHandler = TaskManager.defineTask.mock.calls[0][1]

async function setStoredPoints(points) {
  await AsyncStorage.setItem('night_out_points', JSON.stringify(points))
}

beforeEach(() => {
  AsyncStorage.__reset()
  jest.clearAllMocks()
})

describe('haversineMeters', () => {
  it('returns 0 for identical points', () => {
    expect(haversineMeters(40.69, -73.94, 40.69, -73.94)).toBe(0)
  })

  it('returns an accurate distance for a known offset', () => {
    // one degree of latitude is ~111.3km
    const d = haversineMeters(0, 0, 1, 0)
    expect(d).toBeGreaterThan(110000)
    expect(d).toBeLessThan(112000)
  })
})

describe('background location task', () => {
  it('compares each point in a batch against the previously appended point, not a stale reference', async () => {
    const oldPoint = { latitude: 40.0, longitude: -73.0, recorded_at: 't0', synced: true }
    await setStoredPoints([oldPoint])
    await AsyncStorage.setItem('night_out_meta', JSON.stringify({ sessionId: 's1', userId: 'u1' }))
    await AsyncStorage.setItem('night_out_last_sync', String(Date.now()))

    // pointA is ~111m from oldPoint (real movement). pointB is ~11m from
    // pointA but still ~122m from oldPoint - if pointB were (incorrectly)
    // compared against oldPoint instead of pointA, it would also pass the
    // 20m filter and get appended, which is the bug this test guards against.
    const pointA = { coords: { latitude: 40.001, longitude: -73.0 } }
    const pointB = { coords: { latitude: 40.0011, longitude: -73.0 } }

    await taskHandler({ data: { locations: [pointA, pointB] }, error: null })

    const stored = await getStoredPoints()
    expect(stored).toHaveLength(2)
    expect(stored[1].latitude).toBe(40.001)
  })

  it('does nothing when there is no active session', async () => {
    await taskHandler({ data: { locations: [{ coords: { latitude: 1, longitude: 1 } }] }, error: null })
    expect(await getStoredPoints()).toHaveLength(0)
  })
})

describe('requestLocationPermissions', () => {
  it('reports both granted', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' })
    Location.requestBackgroundPermissionsAsync.mockResolvedValue({ status: 'granted' })

    expect(await requestLocationPermissions()).toEqual({ foreground: true, background: true })
  })

  it('reports foreground granted but background denied without blocking', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' })
    Location.requestBackgroundPermissionsAsync.mockResolvedValue({ status: 'denied' })

    expect(await requestLocationPermissions()).toEqual({ foreground: true, background: false })
  })

  it('short-circuits when foreground is denied', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' })

    expect(await requestLocationPermissions()).toEqual({ foreground: false, background: false })
    expect(Location.requestBackgroundPermissionsAsync).not.toHaveBeenCalled()
  })
})

describe('startLocationTracking', () => {
  it('captures and immediately syncs the initial fix before starting updates', async () => {
    Location.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: 5, longitude: 6 } })
    supabase.from.mockReturnValueOnce(makeQueryResult({ error: null }))

    await startLocationTracking('s1', 'u1')

    expect(supabase.from).toHaveBeenCalledWith('night_out_locations')
    const inserted = supabase.from.mock.results[0].value.insert.mock.calls[0][0]
    expect(inserted).toEqual([
      expect.objectContaining({ session_id: 's1', user_id: 'u1', latitude: 5, longitude: 6 }),
    ])
    expect(Location.startLocationUpdatesAsync).toHaveBeenCalledWith(
      LOCATION_TASK,
      expect.objectContaining({ distanceInterval: 20 })
    )
  })
})

describe('stopLocationTracking / closeSession', () => {
  it('closes the session by updating only the single last-recorded row', async () => {
    await setStoredPoints([])
    Location.hasStartedLocationUpdatesAsync.mockResolvedValue(false)

    const selectResult = makeQueryResult({ data: { id: 'row-123' }, error: null })
    const updateResult = makeQueryResult({ error: null })
    supabase.from.mockReturnValueOnce(selectResult).mockReturnValueOnce(updateResult)

    await stopLocationTracking('s1', 'u1')

    expect(selectResult.order).toHaveBeenCalledWith('recorded_at', { ascending: false })
    expect(selectResult.limit).toHaveBeenCalledWith(1)
    expect(updateResult.eq).toHaveBeenCalledWith('id', 'row-123')
    expect(updateResult.eq).not.toHaveBeenCalledWith('session_id', expect.anything())
    expect(updateResult.is).toHaveBeenCalledWith('ended_at', null)
  })

  it('does nothing if no location row exists for the session', async () => {
    await setStoredPoints([])
    Location.hasStartedLocationUpdatesAsync.mockResolvedValue(false)

    const selectResult = makeQueryResult({ data: null, error: null })
    supabase.from.mockReturnValueOnce(selectResult)

    await expect(stopLocationTracking('s1', 'u1')).resolves.not.toThrow()
    expect(supabase.from).toHaveBeenCalledTimes(1)
  })

  it('stops tracking and emits an event when the session was already ended remotely', async () => {
    await setStoredPoints([{ latitude: 1, longitude: 1, recorded_at: 't1', synced: false }])
    Location.hasStartedLocationUpdatesAsync.mockResolvedValue(false)
    Location.stopLocationUpdatesAsync.mockResolvedValue(undefined)
    const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit')

    const insertResult = makeQueryResult({ error: { code: '42501' } })
    const closeSelectResult = makeQueryResult({ data: null, error: null })
    supabase.from.mockReturnValueOnce(insertResult).mockReturnValueOnce(closeSelectResult)

    await stopLocationTracking('s1', 'u1')

    expect(Location.stopLocationUpdatesAsync).toHaveBeenCalledWith(LOCATION_TASK)
    expect(emitSpy).toHaveBeenCalledWith(SESSION_ENDED_REMOTELY_EVENT, { sessionId: 's1' })
    expect(await AsyncStorage.getItem('night_out_meta')).toBeNull()
  })
})

describe('reconcileDanglingSession', () => {
  it('does nothing when there is no dangling session', async () => {
    await reconcileDanglingSession()
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('closes a dangling session using the last local point time, not now', async () => {
    await AsyncStorage.setItem('night_out_meta', JSON.stringify({ sessionId: 's1', userId: 'u1' }))
    await setStoredPoints([
      { latitude: 1, longitude: 1, recorded_at: '2020-01-01T00:00:00.000Z', synced: true },
    ])
    Location.hasStartedLocationUpdatesAsync.mockResolvedValue(false)

    const selectResult = makeQueryResult({ data: { id: 'row-9' }, error: null })
    const updateResult = makeQueryResult({ error: null })
    supabase.from.mockReturnValueOnce(selectResult).mockReturnValueOnce(updateResult)

    await reconcileDanglingSession()

    expect(updateResult.update).toHaveBeenCalledWith({ ended_at: '2020-01-01T00:00:00.000Z' })
    expect(await AsyncStorage.getItem('night_out_meta')).toBeNull()
    expect(await getStoredPoints()).toHaveLength(0)
  })
})
