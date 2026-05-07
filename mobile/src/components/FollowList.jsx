import { useState, useEffect } from 'react'
import {
  View, Text, Pressable, FlatList,
  Modal, StyleSheet, ActivityIndicator,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { truncateName } from '../lib/utils'

export default function FollowList({ userId, currentUserId, mode, onClose }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [followedIds, setFollowedIds] = useState(new Set())

  useEffect(() => {
    const load = async () => {
      const col = mode === 'followers' ? 'following_id' : 'follower_id'
      const targetCol = mode === 'followers' ? 'follower_id' : 'following_id'

      const { data: followRows } = await supabase.from('follows').select(targetCol).eq(col, userId)
      const ids = (followRows || []).map(r => r[targetCol])

      if (ids.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, name').in('id', ids)
        setUsers(profiles || [])
      } else {
        setUsers([])
      }

      const { data: myFollows } = await supabase.from('follows').select('following_id').eq('follower_id', currentUserId)
      if (myFollows) setFollowedIds(new Set(myFollows.map(r => r.following_id)))

      setLoading(false)
    }
    load()
  }, [userId, currentUserId, mode])

  const toggleFollow = async (targetId) => {
    const isFollowing = followedIds.has(targetId)
    const next = new Set(followedIds)
    if (isFollowing) {
      next.delete(targetId)
      setFollowedIds(next)
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', targetId)
    } else {
      next.add(targetId)
      setFollowedIds(next)
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: targetId })
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onClose}><Text style={styles.back}>←</Text></Pressable>
          <Text style={styles.title}>{mode}</Text>
        </View>

        {loading
          ? <ActivityIndicator color="#58CC02" style={{ marginTop: 40 }} />
          : (
            <FlatList
              data={users}
              keyExtractor={u => u.id}
              contentContainerStyle={styles.results}
              ListEmptyComponent={<Text style={styles.status}>no {mode} yet</Text>}
              renderItem={({ item: user }) => {
                const isMe = user.id === currentUserId
                const isFollowing = followedIds.has(user.id)
                return (
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user.name[0].toUpperCase()}</Text>
                      </View>
                      <Text style={styles.userName}>{truncateName(user.name)}</Text>
                    </View>
                    {!isMe && (
                      <Pressable
                        style={[styles.followBtn, isFollowing && styles.followBtnActive]}
                        onPress={() => toggleFollow(user.id)}
                      >
                        <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextActive]}>
                          {isFollowing ? 'following' : 'follow'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )
              }}
            />
          )
        }
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, paddingTop: 56 },
  back: { color: '#58CC02', fontSize: 22 },
  title: { fontSize: 18, fontWeight: '700', color: '#f1f5f9', textTransform: 'lowercase' },
  results: { paddingHorizontal: 16 },
  status: { color: '#64748b', textAlign: 'center', marginTop: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#f1f5f9', fontWeight: '700' },
  userName: { color: '#f1f5f9', fontWeight: '600', fontSize: 14 },
  followBtn: { borderWidth: 1.5, borderColor: '#334155', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  followBtnActive: { borderColor: '#58CC02', backgroundColor: '#58CC0220' },
  followBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  followBtnTextActive: { color: '#58CC02' },
})
