import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, Pressable, Image,
  Modal, StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LineChart } from 'react-native-gifted-charts'
import { supabase } from '../lib/supabase'
import FRIENDS from '../data/friends.json'
import ME from '../data/me.json'
import { truncateName } from '../lib/utils'
import FindFriendsScreen from '../components/FindFriendsScreen'
import FollowList from '../components/FollowList'

const firstInhaleImg = require('../assets/badges/first-inhale.png')
const twoFistedImg = require('../assets/badges/two-fisted.png')

const DUO = {
  green: '#58CC02', blue: '#1CB0F6', yellow: '#FFD900',
  purple: '#CE82FF', red: '#FF4B4B', orange: '#FF9600',
}

const STREAK_FRIENDS = FRIENDS.filter(f => f.streakWeeks)

const BADGES = [
  { id: 'first-vape',    icon: '💨', name: 'First Inhale',    desc: 'Log your very first vape session.',        color: DUO.blue,   img: firstInhaleImg, check: s => s.totalVapes >= 1 },
  { id: 'two-fisted',    icon: '⚔️', name: 'double parked',   desc: 'Log a vape and a drink on the same day.',  color: DUO.red,    img: twoFistedImg,   check: s => s.todayVapes > 0 && s.todayDrinks > 0 },
  { id: 'cloud-chaser',  icon: '☁️', name: 'Cloud Chaser',    desc: 'Log 10 vape sessions in a single day.',    color: DUO.blue,   check: s => s.todayVapes >= 10 },
  { id: 'open-bar',      icon: '🍸', name: 'Open Bar',         desc: 'Log 5 drinks in a single day.',            color: DUO.purple, check: s => s.todayDrinks >= 5 },
  { id: 'consistency',   icon: '👑', name: 'Consistency King', desc: 'Maintain a 3-day streak.',                 color: DUO.yellow, check: s => s.streak >= 3 },
  { id: 'devoted',       icon: '🏆', name: 'Devoted',          desc: 'Maintain a 7-day streak.',                 color: DUO.orange, check: s => s.streak >= 7 },
  { id: 'quantified',    icon: '📱', name: 'Quantified Self',  desc: 'Log 5+ vapes and 5+ drinks total.',        color: DUO.green,  check: s => s.totalVapes >= 5 && s.totalDrinks >= 5 },
  { id: 'centurion',     icon: '💯', name: 'Centurion',        desc: 'Log 100 total vape sessions.',             color: DUO.red,    check: s => s.totalVapes >= 100 },
  { id: 'sommelier',     icon: '🍷', name: 'Sommelier',        desc: 'Log 50 total drinks.',                     color: DUO.purple, check: s => s.totalDrinks >= 50 },
  { id: 'zero-wellness', icon: '🫀', name: 'Zero Wellness',    desc: 'Bring your Wellness Score™ to 0.',         color: DUO.red,    check: s => (100 - s.todayVapes * 4 - s.todayDrinks * 3) <= 0 },
]

function weekBacData(bacEntries) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  return days.map((day, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const dateStr = date.toDateString()
    const entries = bacEntries.filter(e => new Date(e.timestamp).toDateString() === dateStr)
    const avg = entries.length ? entries.reduce((s, e) => s + e.bac, 0) / entries.length : null
    return { day, bac: avg !== null ? parseFloat(avg.toFixed(3)) : 0 }
  })
}

export default function ProfileScreen({ session, profile, stats, bacEntries = [] }) {
  const insets = useSafeAreaInsets()
  const userId = session?.user?.id
  const { totalVapes = 0, totalDrinks = 0, streak = 0, xp = 0, todayVapes = 0, todayDrinks = 0 } = stats ?? {}

  const [selectedBadge, setSelectedBadge] = useState(null)
  const [showFindFriends, setShowFindFriends] = useState(false)
  const [showFollowList, setShowFollowList] = useState(null)
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })

  const loadCounts = () => {
    if (!userId) return
    supabase.rpc('get_follow_counts', { user_id: userId }).then(({ data }) => {
      if (data) setFollowCounts(data)
    })
  }

  useEffect(() => { loadCounts() }, [userId])

  const badgeStats = {
    totalVapes: totalVapes + ME.totalVapes,
    totalDrinks: totalDrinks + ME.totalDrinks,
    streak: streak + ME.streakWeeks * 7,
    todayVapes,
    todayDrinks,
  }

  const realData = weekBacData(bacEntries)
  const hasRealData = realData.some(d => d.bac > 0)
  const chartData = hasRealData
    ? realData.map((d, i) => ({ ...d, bac: d.bac || ME.weekBac[i].bac }))
    : ME.weekBac

  const streakWeeks = Math.max(1, Math.round(streak / 7)) + ME.streakWeeks
  const displayName = truncateName(profile?.name ?? ME.name)

  return (
    <ScrollView style={[styles.screen, { paddingTop: insets.top }]} contentContainerStyle={styles.body}>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(profile?.name ?? ME.name)[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
        </View>
        <View style={styles.pills}>
          <View style={[styles.pill, { backgroundColor: '#58CC0220' }]}>
            <Text style={[styles.pillVal, { color: DUO.green }]}>{(xp + ME.xp).toLocaleString()}</Text>
            <Text style={styles.pillLabel}>XP</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: '#FF960020' }]}>
            <Text style={[styles.pillVal, { color: DUO.orange }]}>{streakWeeks} 🔥</Text>
            <Text style={styles.pillLabel}>{streakWeeks === 1 ? 'week' : 'weeks'}</Text>
          </View>
        </View>
      </View>

      {/* Follow bar */}
      <View style={styles.followBar}>
        <Pressable style={styles.followStat} onPress={() => setShowFollowList('followers')}>
          <Text style={styles.followCount}>{followCounts.followers}</Text>
          <Text style={styles.followLabel}>followers</Text>
        </Pressable>
        <Pressable style={styles.followStat} onPress={() => setShowFollowList('following')}>
          <Text style={styles.followCount}>{followCounts.following}</Text>
          <Text style={styles.followLabel}>following</Text>
        </Pressable>
        <Pressable style={styles.findBtn} onPress={() => setShowFindFriends(true)}>
          <Text style={styles.findBtnText}>+ find friends</Text>
        </Pressable>
      </View>

      {/* BAC chart */}
      <Text style={styles.sectionTitle}>this week's bac</Text>
      <View style={styles.chartCard}>
        <LineChart
          data={chartData.map(d => ({ value: d.bac ?? 0, label: d.day }))}
          width={300}
          height={140}
          color={DUO.blue}
          thickness={3}
          dataPointsColor={DUO.blue}
          dataPointsRadius={4}
          xAxisColor="transparent"
          yAxisColor="transparent"
          yAxisTextStyle={{ color: '#94a3b8', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: '#94a3b8', fontSize: 10 }}
          hideRules
          curved
          areaChart
          startFillColor={DUO.blue}
          startOpacity={0.2}
          endOpacity={0}
          backgroundColor="transparent"
          noOfSections={3}
        />
      </View>

      {/* Friend streaks */}
      <Text style={styles.sectionTitle}>friend streaks</Text>
      <View style={styles.card}>
        {STREAK_FRIENDS.map(f => (
          <View key={f.id} style={styles.friendRow}>
            <View style={styles.friendLeft}>
              <Text style={styles.friendEmoji}>{f.emoji}</Text>
              <Text style={styles.friendName}>{truncateName(f.name)}</Text>
            </View>
            <Text style={styles.friendStreak}>{f.streakWeeks} {f.streakWeeks === 1 ? 'week' : 'weeks'} 🔥</Text>
          </View>
        ))}
      </View>

      {/* Badges */}
      <Text style={styles.sectionTitle}>badges</Text>
      <View style={styles.badgesGrid}>
        {BADGES.map(b => {
          const earned = b.img || b.check(badgeStats)
          return (
            <Pressable key={b.id} style={styles.badge} onPress={() => setSelectedBadge({ ...b, earned })}>
              <View style={[
                styles.badgeCircle,
                earned && !b.img && { backgroundColor: b.color, shadowColor: b.color, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
                !earned && { backgroundColor: '#1e293b' },
              ]}>
                {b.img
                  ? <Image source={b.img} style={styles.badgeImg} />
                  : <Text style={styles.badgeIcon}>{earned ? b.icon : '🔒'}</Text>
                }
              </View>
              <Text style={styles.badgeName}>{b.name.toLowerCase()}</Text>
            </Pressable>
          )
        })}
      </View>

      {/* Sign out */}
      <Pressable style={styles.signOutBtn} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.signOutText}>sign out</Text>
      </Pressable>

      {/* Find friends modal */}
      {showFindFriends && (
        <FindFriendsScreen
          userId={userId}
          onClose={() => { setShowFindFriends(false); loadCounts() }}
        />
      )}

      {/* Follow list modal */}
      {showFollowList && (
        <FollowList
          userId={userId}
          currentUserId={userId}
          mode={showFollowList}
          onClose={() => { setShowFollowList(null); loadCounts() }}
        />
      )}

      {/* Badge detail modal */}
      {selectedBadge && (
        <Modal transparent animationType="fade" onRequestClose={() => setSelectedBadge(null)}>
          <Pressable style={styles.badgeOverlay} onPress={() => setSelectedBadge(null)}>
            <Pressable style={styles.badgeModal} onPress={() => {}}>
              <View style={[
                styles.badgeModalCircle,
                selectedBadge.earned && !selectedBadge.img && { backgroundColor: selectedBadge.color },
                !selectedBadge.earned && { backgroundColor: '#1e293b' },
              ]}>
                {selectedBadge.img
                  ? <Image source={selectedBadge.img} style={styles.badgeModalImg} />
                  : <Text style={styles.badgeModalIcon}>{selectedBadge.earned ? selectedBadge.icon : '🔒'}</Text>
                }
              </View>
              <Text style={[styles.badgeStatus, selectedBadge.earned && { color: DUO.green }]}>
                {selectedBadge.earned ? 'unlocked' : 'locked'}
              </Text>
              <Text style={styles.badgeModalName}>{selectedBadge.name.toLowerCase()}</Text>
              <Text style={styles.badgeModalDesc}>{selectedBadge.desc}</Text>
              <Pressable style={styles.badgeModalClose} onPress={() => setSelectedBadge(null)}>
                <Text style={styles.badgeModalCloseText}>done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f172a' },
  body: { paddingBottom: 40 },

  hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#58CC02', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: '#f1f5f9' },
  pills: { gap: 8 },
  pill: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  pillVal: { fontSize: 16, fontWeight: '800' },
  pillLabel: { fontSize: 10, color: '#64748b' },

  followBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, gap: 16 },
  followStat: { alignItems: 'center' },
  followCount: { fontSize: 18, fontWeight: '800', color: '#f1f5f9' },
  followLabel: { fontSize: 11, color: '#64748b' },
  findBtn: { marginLeft: 'auto', backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  findBtnText: { color: '#58CC02', fontSize: 13, fontWeight: '600' },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'lowercase', letterSpacing: 0.5, paddingHorizontal: 20, marginBottom: 10, marginTop: 8 },

  chartCard: { marginHorizontal: 16, backgroundColor: '#1e293b', borderRadius: 16, padding: 12, height: 180, marginBottom: 16 },

  card: { marginHorizontal: 16, backgroundColor: '#1e293b', borderRadius: 16, paddingHorizontal: 16, marginBottom: 16 },
  friendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  friendLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  friendEmoji: { fontSize: 22 },
  friendName: { color: '#f1f5f9', fontSize: 14, fontWeight: '600' },
  friendStreak: { color: '#94a3b8', fontSize: 13 },

  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 16 },
  badge: { width: '25%', alignItems: 'center', paddingVertical: 10, gap: 6 },
  badgeCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  badgeImg: { width: 52, height: 52, borderRadius: 26 },
  badgeIcon: { fontSize: 24 },
  badgeName: { fontSize: 9, color: '#64748b', textAlign: 'center' },

  signOutBtn: { marginHorizontal: 16, marginTop: 8, borderWidth: 1.5, borderColor: '#334155', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  signOutText: { color: '#64748b', fontSize: 14, fontWeight: '600' },

  badgeOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  badgeModal: { backgroundColor: '#1e293b', borderRadius: 24, padding: 28, alignItems: 'center', width: 300, gap: 8 },
  badgeModalCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  badgeModalImg: { width: 80, height: 80, borderRadius: 40 },
  badgeModalIcon: { fontSize: 36 },
  badgeStatus: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  badgeModalName: { fontSize: 18, fontWeight: '700', color: '#f1f5f9' },
  badgeModalDesc: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
  badgeModalClose: { marginTop: 8, backgroundColor: '#58CC02', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 10 },
  badgeModalCloseText: { color: '#fff', fontWeight: '700', fontSize: 14 },
})
