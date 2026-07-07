import { useCallback, useState } from 'react'
import {
  View, Text, FlatList, Image, Pressable,
  TextInput, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps'
import FRIENDS from '../data/friends.json'
import { truncateName, fmtDuration, fmtFeedDate } from '../lib/utils'
import { supabase } from '../lib/supabase'

const eastVillageMap = require('../assets/maps/east-village.png')
const frankNight = require('../assets/feed/frank-night.jpg')
const FEED_PHOTOS = { frank: frankNight }

const MOCK_POSTS = FRIENDS
  .filter(f => f.post)
  .map(f => ({ id: f.id, name: f.name.toLowerCase(), color: f.color, photo: FEED_PHOTOS[f.id] ?? null, ...f.post }))

function centerOf(coords) {
  const lat = coords.reduce((s, c) => s + c.latitude, 0) / coords.length
  const lng = coords.reduce((s, c) => s + c.longitude, 0) / coords.length
  const latDelta = Math.max(...coords.map(c => c.latitude)) - Math.min(...coords.map(c => c.latitude)) + 0.01
  const lngDelta = Math.max(...coords.map(c => c.longitude)) - Math.min(...coords.map(c => c.longitude)) + 0.01
  return { latitude: lat, longitude: lng, latitudeDelta: latDelta, longitudeDelta: lngDelta }
}

function RouteMap({ route, color }) {
  if (Platform.OS !== 'web' && Array.isArray(route) && route.length > 0) {
    return (
      <MapView
        style={styles.mapContainer}
        provider={PROVIDER_DEFAULT}
        region={centerOf(route)}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        customMapStyle={DARK_MAP_STYLE}
      >
        {route.length > 1
          ? <Polyline coordinates={route} strokeColor={color} strokeWidth={3} />
          : <Marker coordinate={route[0]}><Text style={styles.starMarker}>⭐</Text></Marker>}
      </MapView>
    )
  }
  return (
    <View style={styles.mapContainer}>
      <Image source={eastVillageMap} style={styles.mapImage} resizeMode="cover" />
    </View>
  )
}

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
]

function NightOutCard({ post }) {
  const [daps, setDaps] = useState(post.daps)
  const [daped, setDaped] = useState(false)
  const [commenting, setCommenting] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])

  const handleDap = () => {
    if (daped) return
    setDaps(d => d + 1)
    setDaped(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  const handleSend = () => {
    if (!comment.trim()) return
    setComments(c => [...c, comment.trim()])
    setComment('')
    setCommenting(false)
  }

  return (
    <View style={styles.card}>
      <View style={[styles.cardAccent, { backgroundColor: post.color }]} />

      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: post.color }]}>
          <Text style={styles.avatarText}>{post.name[0].toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.cardName}>{truncateName(post.name)}</Text>
          <Text style={styles.cardDate}>{post.date}</Text>
        </View>
      </View>

      {/* Photo */}
      {post.photo && (
        <Image source={post.photo} style={styles.cardPhoto} resizeMode="cover" />
      )}

      {/* Map */}
      {post.route && <RouteMap route={post.route} color={post.color} />}

      {/* Stats */}
      <View style={styles.statsRow}>
        {post.duration && (
          <View style={styles.stat}>
            <Text style={styles.statLabel}>duration</Text>
            <Text style={styles.statVal}>{post.duration}</Text>
          </View>
        )}
        {post.maxBac && (
          <View style={styles.stat}>
            <Text style={styles.statLabel}>{post.bacLabel ?? 'max bac'}</Text>
            <Text style={styles.statVal}>{post.maxBac}</Text>
          </View>
        )}
        {post.cigs != null && (
          <View style={styles.stat}>
            <Text style={styles.statLabel}># of cigs</Text>
            <Text style={styles.statVal}>{post.cigs}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.dapBtn, daped && { backgroundColor: post.color }]}
          onPress={handleDap}
        >
          <Text style={styles.dapBtnText}>
            {daped ? `👊 ${daps}` : `👊 dap up${daps > 0 ? ` · ${daps}` : ''}`}
          </Text>
        </Pressable>
        <Pressable style={styles.commentBtn} onPress={() => setCommenting(v => !v)}>
          <Text style={styles.commentBtnText}>💬 comment</Text>
        </Pressable>
      </View>

      {/* Comments list */}
      {comments.map((c, i) => (
        <View key={i} style={styles.commentItem}>
          <Text style={styles.commentYou}>you </Text>
          <Text style={styles.commentText}>{c}</Text>
        </View>
      ))}

      {/* Comment input */}
      {commenting && (
        <View style={styles.commentBox}>
          <Pressable onPress={() => { setComment(''); setCommenting(false) }}>
            <Text style={styles.commentDismiss}>✕</Text>
          </Pressable>
          <TextInput
            style={styles.commentInput}
            placeholder="say something..."
            placeholderTextColor="#475569"
            value={comment}
            onChangeText={setComment}
            onSubmitEditing={handleSend}
            autoFocus
            returnKeyType="send"
          />
          <Pressable style={[styles.commentSend, { backgroundColor: post.color }]} onPress={handleSend}>
            <Text style={styles.commentSendText}>send</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

async function fetchMyNightOuts(userId, userName) {
  const { data: locations, error } = await supabase
    .from('night_out_locations')
    .select('session_id, latitude, longitude, recorded_at, ended_at')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: true })
  if (error) console.error('[feed] failed to load locations:', error)

  const pointsBySession = new Map()
  for (const loc of locations ?? []) {
    if (!pointsBySession.has(loc.session_id)) pointsBySession.set(loc.session_id, [])
    pointsBySession.get(loc.session_id).push(loc)
  }

  return [...pointsBySession.entries()]
    .map(([sessionId, points]) => {
      const first = points[0]
      const last = points[points.length - 1]
      const startedAt = new Date(first.recorded_at)
      const endedAt = points.find(p => p.ended_at)?.ended_at
      // Without an explicit end time, a single point isn't enough to know the duration.
      const durationSeconds = endedAt
        ? Math.round((new Date(endedAt) - startedAt) / 1000)
        : points.length > 1
          ? Math.round((new Date(last.recorded_at) - startedAt) / 1000)
          : null

      return {
        id: sessionId,
        name: (userName ?? 'you').toLowerCase(),
        photo: null,
        startedAt,
        date: fmtFeedDate(startedAt),
        duration: durationSeconds != null ? fmtDuration(durationSeconds) : null,
        route: points.map(p => ({ latitude: p.latitude, longitude: p.longitude })),
        color: '#58CC02',
        daps: 0,
      }
    })
    .sort((a, b) => b.startedAt - a.startedAt)
}

export default function FeedScreen({ userId, userName }) {
  const insets = useSafeAreaInsets()
  const [myPosts, setMyPosts] = useState([])

  useFocusEffect(
    useCallback(() => {
      if (!userId) return
      let cancelled = false
      fetchMyNightOuts(userId, userName).then(posts => {
        if (!cancelled) setMyPosts(posts)
      })
      return () => { cancelled = true }
    }, [userId, userName])
  )

  const allPosts = [...myPosts, ...MOCK_POSTS]

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={allPosts}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingTop: insets.top }]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerLogo}>grindset</Text>
          </View>
        }
        renderItem={({ item }) => <NightOutCard post={item} />}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  list: { backgroundColor: '#0f172a', paddingBottom: 32 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerLogo: { fontSize: 24, fontWeight: '900', color: '#58CC02' },

  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardAccent: { height: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cardName: { color: '#f1f5f9', fontWeight: '600', fontSize: 15 },
  cardDate: { color: '#64748b', fontSize: 12, marginTop: 2 },

  cardPhoto: { width: '100%', height: 220 },
  mapContainer: { width: '100%', height: 190 },
  mapImage: { width: '100%', height: 190 },
  starMarker: { fontSize: 28 },

  statsRow: { flexDirection: 'row', padding: 14, gap: 20 },
  stat: {},
  statLabel: { fontSize: 11, color: '#64748b', textTransform: 'lowercase', marginBottom: 2 },
  statVal: { fontSize: 18, fontWeight: '700', color: '#f1f5f9' },

  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingBottom: 14 },
  dapBtn: {
    flex: 1, backgroundColor: '#0f172a', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  dapBtnText: { color: '#f1f5f9', fontWeight: '600', fontSize: 14 },
  commentBtn: {
    flex: 1, backgroundColor: '#0f172a', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  commentBtnText: { color: '#94a3b8', fontWeight: '600', fontSize: 14 },

  commentItem: { flexDirection: 'row', paddingHorizontal: 14, paddingBottom: 6 },
  commentYou: { color: '#58CC02', fontSize: 13, fontWeight: '600' },
  commentText: { color: '#94a3b8', fontSize: 13, flex: 1 },

  commentBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#334155',
  },
  commentDismiss: { color: '#64748b', fontSize: 16, paddingHorizontal: 4 },
  commentInput: {
    flex: 1, backgroundColor: '#0f172a', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    color: '#f1f5f9', fontSize: 14,
  },
  commentSend: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  commentSendText: { color: '#fff', fontWeight: '600', fontSize: 13 },
})
