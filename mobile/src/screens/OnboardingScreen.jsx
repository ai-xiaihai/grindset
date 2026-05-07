import { useState } from 'react'
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { supabase } from '../lib/supabase'

export default function OnboardingScreen({ userId, onComplete }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handle = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('profiles')
      .insert({ id: userId, name: trimmed })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onComplete({ id: userId, name: trimmed })
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.logo}>grindset</Text>
          <Text style={styles.tagline}>what do your friends call you?</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>your name</Text>
            <TextInput
              style={styles.input}
              placeholder="enter your name"
              placeholderTextColor="#475569"
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={50}
              autoCapitalize="words"
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.btn, (!name.trim() || loading) && styles.btnDisabled]}
            onPress={handle}
            disabled={!name.trim() || loading}
          >
            <Text style={styles.btnText}>{loading ? 'saving...' : "let's go"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400 },
  logo: { fontSize: 36, fontWeight: '900', color: '#58CC02', textAlign: 'center', marginBottom: 6 },
  tagline: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 32 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 13, color: '#94a3b8', marginBottom: 6, textTransform: 'lowercase' },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f1f5f9',
    fontSize: 15,
  },
  error: { color: '#f87171', fontSize: 13, marginBottom: 12 },
  btn: {
    backgroundColor: '#58CC02',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
