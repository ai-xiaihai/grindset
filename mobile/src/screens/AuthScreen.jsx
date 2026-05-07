import { useState } from 'react'
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { supabase } from '../lib/supabase'

export default function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handle = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else if (mode === 'signup') {
      setSuccess('check your email to confirm your account.')
    }
    setLoading(false)
  }

  const toggleMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setError(null)
    setSuccess(null)
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.logo}>grindset</Text>
          <Text style={styles.tagline}>optimize your lifestyle</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

          <Pressable
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handle}
            disabled={loading}
          >
            <Text style={styles.btnText}>
              {loading ? 'loading...' : mode === 'login' ? 'log in' : 'sign up'}
            </Text>
          </Pressable>

          <Pressable onPress={toggleMode}>
            <Text style={styles.toggle}>
              {mode === 'login'
                ? "don't have an account? sign up"
                : 'already have an account? log in'}
            </Text>
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
  success: { color: '#58CC02', fontSize: 13, marginBottom: 12 },
  btn: {
    backgroundColor: '#58CC02',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  toggle: { color: '#64748b', fontSize: 13, textAlign: 'center' },
})
