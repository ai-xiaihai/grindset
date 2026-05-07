import { View, Text, StyleSheet } from 'react-native'

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Feed — coming soon</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' },
  text: { color: '#94a3b8', fontSize: 16 },
})
