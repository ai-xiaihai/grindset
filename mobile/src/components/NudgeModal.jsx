import { useState } from 'react'
import { View, Text, Pressable, Modal, StyleSheet, Linking } from 'react-native'

const FRIENDS = [
  { name: 'Frank', emoji: '☁️', venmo: '@cxn-frank' },
  { name: 'Katie', emoji: '⭐', venmo: '@katiechaan' },
]

const AMOUNTS = [5, 10, 20]

export function shouldShowNudge() {
  return Math.random() < 0.15
}

export function randomFriend() {
  return FRIENDS[Math.floor(Math.random() * FRIENDS.length)]
}

export default function NudgeModal({ friend, onDismiss }) {
  const [selected, setSelected] = useState(10)

  const handleVenmo = () => {
    const handle = (friend.venmo || friend.name).replace(/^@/, '')
    Linking.openURL(
      `https://venmo.com/${handle}?txn=pay&amount=${selected}&note=get+drinking+again`
    )
    onDismiss()
  }

  return (
    <Modal transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Pressable style={styles.closeBtn} onPress={onDismiss}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <Text style={styles.avatar}>{friend.emoji}</Text>
          <Text style={styles.title}>nudge {friend.name}</Text>
          <Text style={styles.subtitle}>to get drinking again 🍻</Text>

          <View style={styles.amounts}>
            {AMOUNTS.map(amt => (
              <Pressable
                key={amt}
                style={[styles.amtBtn, selected === amt && styles.amtBtnActive]}
                onPress={() => setSelected(amt)}
              >
                <Text style={[styles.amtText, selected === amt && styles.amtTextActive]}>
                  ${amt}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.venmoBtn} onPress={handleVenmo}>
            <Text style={styles.venmoBtnText}>Venmo {friend.name} ${selected}</Text>
          </Pressable>

          <Pressable style={styles.dismissBtn} onPress={onDismiss}>
            <Text style={styles.dismissText}>dismiss</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  closeBtn: { position: 'absolute', top: 16, right: 16, padding: 8 },
  closeText: { color: '#64748b', fontSize: 16 },
  avatar: { fontSize: 48, marginTop: 8, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  amounts: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  amtBtn: {
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  amtBtnActive: { borderColor: '#58CC02', backgroundColor: '#58CC0220' },
  amtText: { color: '#94a3b8', fontSize: 16, fontWeight: '600' },
  amtTextActive: { color: '#58CC02' },
  venmoBtn: {
    backgroundColor: '#3D95CE',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  venmoBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  dismissBtn: { paddingVertical: 8 },
  dismissText: { color: '#64748b', fontSize: 14 },
})
