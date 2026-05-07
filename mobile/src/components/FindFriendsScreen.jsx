import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TextInput, Pressable, FlatList,
  Modal, StyleSheet, ActivityIndicator,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { truncateName } from '../lib/utils'

export default function FindFriendsScreen({ userId, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [followedIds, setFollowedIds] = useState(new Set())
  const debounceRef = useRef(null)

  useEffect(() => {
    supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
      .then(({ data }) => {
        if (data) setFollowedIds(new Set(data.map(r => r.following_id)))
      })
  }, [userId])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    const trimmed = query.trim()
    if (!trimmed) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const { data } = await supabase.rpc('search_users_by_email', { search_query: trimmed })
      setResults((data || []).filter(u => u.id !== userId))
      setLoading(false)
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [query, userId])

  const toggleFollow = async (targetId) => {
    const isFollowing = followedIds.has(targetId)
    const next = new Set(followedIds)
    if (isFollowing) {
      next.delete(targetId)
      setFollowedIds(next)
      await supabase.from('follows').delete().eq('follower_id', userId).eq('following_id', targetId)
    } else {
      next.add(targetId)
      setFollowedIds(next)
      await supabase.from('follows').insert({ follower_id: userId, following_id: targetId })
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onClose}><Text style={styles.back}>←</Text></Pressable>
          <Text style={styles.title}>find friends</Text>
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            style={styles.input}
            placeholder="search by email..."
            placeholderTextColor="#475569"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            keyboardType="email-address"
            autoFocus
          />
        </View>

        <FlatList
          data={results}
          keyExtractor={u => u.id}
          contentContainerStyle={styles.results}
          ListEmptyComponent={
            loading
              ? <ActivityIndicator color="#58CC02" style={{ marginTop: 24 }} />
              : query.trim()
                ? <Text style={styles.status}>no users found</Text>
                : null
          }
          renderItem={({ item: user }) => {
            const isFollowing = followedIds.has(user.id)
            return (
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user.name[0].toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{truncateName(user.name)}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>
                <Pressable
                  style={[styles.followBtn, isFollowing && styles.followBtnActive]}
                  onPress={() => toggleFollow(user.id)}
                >
                  <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextActive]}>
                    {isFollowing ? 'following' : 'follow'}
                  </Text>
                </Pressable>
              </View>
            )
          }}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, paddingTop: 56 },
  back: { color: '#58CC02', fontSize: 22 },
  title: { fontSize: 18, fontWeight: '700', color: '#f1f5f9' },
  searchWrap: { paddingHorizontal: 16, marginBottom: 8 },
  input: {
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: '#f1f5f9', fontSize: 15,
  },
  results: { paddingHorizontal: 16 },
  status: { color: '#64748b', textAlign: 'center', marginTop: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#f1f5f9', fontWeight: '700' },
  userName: { color: '#f1f5f9', fontWeight: '600', fontSize: 14 },
  userEmail: { color: '#64748b', fontSize: 12 },
  followBtn: { borderWidth: 1.5, borderColor: '#334155', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  followBtnActive: { borderColor: '#58CC02', backgroundColor: '#58CC0220' },
  followBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  followBtnTextActive: { color: '#58CC02' },
})
