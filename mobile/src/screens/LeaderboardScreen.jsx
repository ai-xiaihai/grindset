import { View, Text, FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FRIENDS from '../data/friends.json'
import ME from '../data/me.json'
import { truncateName } from '../lib/utils'

const MOCK_USERS = FRIENDS
const RANK_MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardScreen({ stats, profile }) {
  const insets = useSafeAreaInsets()

  const me = {
    name: profile?.name ?? ME.name,
    emoji: ME.emoji,
    vapes: (stats?.totalVapes ?? 0) + ME.totalVapes,
    peakBac: ME.peakBac,
    xp: (stats?.xp ?? 0) + ME.xp,
    isMe: true,
  }

  const all = [...MOCK_USERS, me].sort((a, b) => b.xp - a.xp)
  const myRank = all.findIndex(u => u.isMe) + 1

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>

      <FlatList
        data={all}
        keyExtractor={item => item.name}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* Rank banner */}
            <View style={styles.rankBanner}>
              <View>
                <Text style={styles.rankNum}>#{myRank}</Text>
                <Text style={styles.rankLabel}>Your Friend Rank</Text>
              </View>
              <View style={styles.xpBlock}>
                <Text style={styles.xpVal}>{me.xp.toLocaleString()}</Text>
                <Text style={styles.xpLabel}>XP</Text>
              </View>
            </View>

            {/* Table header row */}
            <View style={[styles.row, styles.rowHeader]}>
              <Text style={[styles.colRank, styles.headerCell]}>#</Text>
              <Text style={[styles.colUserText, styles.headerCell]}>User</Text>
              <Text style={[styles.colStat, styles.headerCell]}>💨</Text>
              <Text style={[styles.colStat, styles.headerCell]}>🩸</Text>
              <Text style={[styles.colXp, styles.headerCell]}>XP</Text>
            </View>
          </View>
        }
        renderItem={({ item: user, index: i }) => (
          <View style={[styles.row, user.isMe && styles.rowMe]}>
            <Text style={styles.colRank}>
              {i < 3 ? RANK_MEDALS[i] : String(i + 1)}
            </Text>
            <View style={styles.colUser}>
              <Text style={styles.userEmoji}>{user.emoji}</Text>
              <Text style={styles.userName}>
                {truncateName(user.name)}{user.isMe ? ' (you)' : ''}
              </Text>
            </View>
            <Text style={styles.colStat}>{user.vapes.toLocaleString()}</Text>
            <Text style={styles.colStat}>
              {user.peakBac != null ? user.peakBac.toFixed(2) : '—'}
            </Text>
            <Text style={styles.colXp}>{user.xp.toLocaleString()}</Text>
          </View>
        )}
        ListFooterComponent={
          <Text style={styles.disclaimer}>
            Rankings update in real time. These are your friends and they are definitely real.
          </Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#f1f5f9' },
  list: { paddingHorizontal: 16, paddingBottom: 32 },

  rankBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  rankNum: { fontSize: 28, fontWeight: '900', color: '#58CC02' },
  rankLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  xpBlock: { alignItems: 'flex-end' },
  xpVal: { fontSize: 22, fontWeight: '800', color: '#f1f5f9' },
  xpLabel: { fontSize: 12, color: '#64748b' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1e293b',
  },
  rowHeader: { borderBottomWidth: 1, borderBottomColor: '#334155', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  rowMe: { backgroundColor: '#58CC0215' },
  headerCell: { color: '#64748b', fontSize: 12, fontWeight: '600' },

  colRank: { width: 36, color: '#f1f5f9', fontSize: 15, textAlign: 'center' },
  colUser: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  colUserText: { flex: 1 },
  colStat: { width: 40, color: '#94a3b8', fontSize: 13, textAlign: 'center' },
  colXp: { width: 56, color: '#58CC02', fontSize: 13, fontWeight: '700', textAlign: 'right' },

  userEmoji: { fontSize: 18 },
  userName: { fontSize: 13, color: '#f1f5f9', flexShrink: 1 },

  disclaimer: { fontSize: 11, color: '#475569', textAlign: 'center', paddingHorizontal: 16, paddingTop: 16 },
})
