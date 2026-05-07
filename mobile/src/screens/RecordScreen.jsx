import { useState, useRef, useEffect } from 'react'
import {
  View, Text, Pressable, TextInput, Image, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const HEROES = [
  require('../assets/record/vape.png'),
  require('../assets/record/beerncig.png'),
  require('../assets/record/vapenbeer.png'),
  require('../assets/record/vomit.png'),
  require('../assets/record/weed.png'),
  require('../assets/record/beerncig_howitstarted.png'),
]
const randomHero = HEROES[Math.floor(Math.random() * HEROES.length)]

const C = {
  green: '#58CC02', greenShadow: '#46A302',
  blue: '#1CB0F6', blueShadow: '#0A91CC',
  purple: '#CE82FF', purpleShadow: '#A855F7',
  red: '#FF4B4B', redShadow: '#CC3333',
  orange: '#FF9600', orangeShadow: '#CC7800',
  yellow: '#FFD900', yellowShadow: '#CCA800',
}

function fmt(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function DuoBtn({ label, color, shadow, onPress, size = 'md', outline = false }) {
  const [pressed, setPressed] = useState(false)
  const pad = size === 'lg' ? 18 : size === 'sm' ? 11 : 14
  const fontSize = size === 'lg' ? 20 : size === 'sm' ? 15 : 17
  const radius = size === 'lg' ? 20 : 16

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      style={[
        styles.duoBtn,
        {
          borderRadius: radius,
          paddingVertical: pad,
          backgroundColor: outline ? 'transparent' : color,
          borderWidth: outline ? 3 : 0,
          borderColor: outline ? color : 'transparent',
          marginBottom: pressed ? 0 : 0,
          transform: [{ translateY: pressed ? 3 : 0 }],
          shadowColor: outline ? 'transparent' : shadow,
          shadowOffset: { width: 0, height: pressed ? 2 : 5 },
          shadowOpacity: outline ? 0 : 1,
          shadowRadius: 0,
          elevation: pressed ? 2 : 5,
        },
      ]}
    >
      <Text style={[styles.duoBtnText, { fontSize, color: outline ? color : '#fff' }]}>
        {label}
      </Text>
    </Pressable>
  )
}

// ── Idle ──────────────────────────────────────────
function IdleScreen({ onStartNight, onAddBac, onAddCig, insets }) {
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Image source={randomHero} style={styles.heroImg} resizeMode="contain" />
        <Text style={styles.title}>record</Text>
        <Text style={styles.subtitle}>what are we tracking tonight?</Text>
      </View>
      <View style={styles.actions}>
        <DuoBtn label="🩸  add bac"           color={C.blue}   shadow={C.blueShadow}   onPress={onAddBac}      size="md" />
        <DuoBtn label="🚬  add cig"           color={C.purple} shadow={C.purpleShadow} onPress={onAddCig}      size="md" />
        <DuoBtn label="🌙  start a night out" color={C.orange} shadow={C.orangeShadow} onPress={onStartNight}  size="lg" />
      </View>
    </View>
  )
}

// ── Running ───────────────────────────────────────
function RunningScreen({ elapsed, bacCount, cigCount, onAddBac, onAddCig, onPause, insets }) {
  const isEarly = elapsed < 120
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Text style={styles.timerLabel}>night out</Text>
        <Text style={styles.timer}>{fmt(elapsed)}</Text>
        <View style={styles.counters}>
          {bacCount > 0 && <View style={[styles.counter, { backgroundColor: C.blue + '33' }]}><Text style={[styles.counterText, { color: C.blue }]}>🩸 {bacCount} bac</Text></View>}
          {cigCount > 0 && <View style={[styles.counter, { backgroundColor: C.purple + '33' }]}><Text style={[styles.counterText, { color: C.purple }]}>🚬 {cigCount} cig{cigCount !== 1 ? 's' : ''}</Text></View>}
        </View>
      </View>
      <View style={styles.actions}>
        <DuoBtn label="🩸  add bac" color={C.blue}   shadow={C.blueShadow}   onPress={onAddBac} size="md" />
        <DuoBtn label="🚬  add cig" color={C.purple} shadow={C.purpleShadow} onPress={onAddCig} size="md" />
        {!isEarly && <DuoBtn label="📸  add photo" color={C.green} shadow={C.greenShadow} onPress={() => {}} size="md" />}
        <DuoBtn label="pause" color={C.yellow} shadow={C.yellowShadow} onPress={onPause} size="sm" />
      </View>
    </View>
  )
}

// ── Paused ────────────────────────────────────────
function PausedScreen({ elapsed, bacCount, cigCount, onResume, onEnd, insets }) {
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Text style={styles.pauseIcon}>⏸</Text>
        <Text style={styles.pauseTitle}>night out paused</Text>
        <Text style={styles.pauseSub}>are you sure you want to stop?</Text>
        <View style={styles.summary}>
          <View style={styles.summaryRow}><Text style={styles.summaryEmoji}>⏱</Text><Text style={styles.summaryVal}>{fmt(elapsed)}</Text></View>
          {bacCount > 0 && <View style={styles.summaryRow}><Text style={styles.summaryEmoji}>🩸</Text><Text style={styles.summaryVal}>{bacCount} bac check-in{bacCount !== 1 ? 's' : ''}</Text></View>}
          {cigCount > 0 && <View style={styles.summaryRow}><Text style={styles.summaryEmoji}>🚬</Text><Text style={styles.summaryVal}>{cigCount} cig{cigCount !== 1 ? 's' : ''}</Text></View>}
        </View>
      </View>
      <View style={styles.actions}>
        <DuoBtn label="it's over" color={C.red}   shadow={C.redShadow}   onPress={onEnd}    size="lg" />
        <DuoBtn label="jk"        color={C.green} shadow={C.greenShadow} onPress={onResume} size="md" />
      </View>
    </View>
  )
}

// ── Done ──────────────────────────────────────────
function DoneScreen({ elapsed, bacCount, cigCount, xp, onDone, insets }) {
  return (
    <View style={[styles.screen, styles.screenDone, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Text style={styles.doneBurst}>🎉</Text>
        <Text style={styles.doneTitle}>your night out{'\n'}has been posted!</Text>
        <Text style={styles.doneSub}>check it out tomorrow lol</Text>
        <View style={styles.xpBadge}><Text style={styles.xpVal}>+{xp} XP</Text></View>
        <View style={styles.doneStats}>
          <Text style={styles.doneStat}>⏱ {fmt(elapsed)}</Text>
          {bacCount > 0 && <Text style={styles.doneStat}>🩸 {bacCount} bac</Text>}
          {cigCount > 0 && <Text style={styles.doneStat}>🚬 {cigCount} cig{cigCount !== 1 ? 's' : ''}</Text>}
        </View>
      </View>
      <View style={styles.actions}>
        <DuoBtn label="done" color={C.green} shadow={C.greenShadow} onPress={onDone} size="lg" />
      </View>
    </View>
  )
}

// ── Add BAC ───────────────────────────────────────
function AddBacScreen({ onBack, onPost, insets }) {
  const [bac, setBac] = useState('')
  const [comment, setComment] = useState('')
  const [breathPhoto, setBreathPhoto] = useState(null)
  const [socialPhoto, setSocialPhoto] = useState(null)
  const [genericPhoto, setGenericPhoto] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const cameraRef = useRef(null)

  const parsed = parseFloat(bac)
  const canPost = bac !== '' && !isNaN(parsed) && parsed >= 0

  const handleBreathPicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 })
    if (!result.canceled) {
      setBreathPhoto(result.assets[0].uri)
      setScanning(true)
      setTimeout(() => { setScanning(false); setBac('0.020') }, 2400)
    }
  }

  const handleSocialPicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 })
    if (!result.canceled) setSocialPhoto(result.assets[0].uri)
  }

  const handleOpenCamera = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission()
      if (!granted) return
    }
    setShowCamera(true)
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 })
    setGenericPhoto(photo.uri)
    setShowCamera(false)
  }

  if (showCamera) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        <View style={styles.camControls}>
          <Pressable style={styles.captureBtn} onPress={handleCapture}>
            <View style={styles.captureBtnInner} />
          </Pressable>
          <Pressable onPress={() => setShowCamera(false)}>
            <Text style={styles.camCancel}>cancel</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={[styles.addBacScreen, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.addBacHeader}>
          <Pressable onPress={onBack}><Text style={styles.backBtn}>← back</Text></Pressable>
          <Text style={styles.addBacTitle}>🩸 add bac</Text>
        </View>

        <View style={styles.addBacBody}>
          {/* BAC input */}
          <Text style={styles.fieldLabel}>BAC Amount</Text>
          <View style={styles.bacRow}>
            <TextInput
              style={[styles.bacInput, scanning && { borderColor: C.blue }]}
              placeholder="0.000"
              placeholderTextColor="#475569"
              value={bac}
              onChangeText={setBac}
              keyboardType="decimal-pad"
            />
            <Text style={styles.bacUnit}>g/dL</Text>
          </View>

          {/* Comment */}
          <Text style={styles.fieldLabel}>Comment</Text>
          <TextInput
            style={styles.textarea}
            placeholder="how we feeling rn…"
            placeholderTextColor="#475569"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
          />

          {scanning && (
            <View style={styles.scanBar}>
              <Text style={styles.scanText}>scanning breathalyzer…</Text>
            </View>
          )}

          {/* Photo buttons */}
          <View style={styles.photoActions}>
            <Pressable style={styles.photoBtn} onPress={handleOpenCamera}>
              <Text style={styles.photoBtnText}>📷 add photo</Text>
            </Pressable>
            <Pressable style={[styles.photoBtn, { borderColor: C.blue }]} onPress={handleBreathPicker} disabled={scanning}>
              <Text style={styles.photoBtnText}>🫁 breathalyzer photo</Text>
            </Pressable>
            <Pressable style={[styles.photoBtn, { borderColor: C.purple }]} onPress={handleSocialPicker}>
              <Text style={styles.photoBtnText}>🤳 add social photo</Text>
            </Pressable>
          </View>

          {/* Previews */}
          {(genericPhoto || breathPhoto || socialPhoto) && (
            <View style={styles.previews}>
              {[
                { uri: genericPhoto, label: 'photo', clear: () => setGenericPhoto(null) },
                { uri: breathPhoto, label: 'breathalyzer', clear: () => setBreathPhoto(null) },
                { uri: socialPhoto, label: 'social', clear: () => setSocialPhoto(null) },
              ].filter(p => p.uri).map(p => (
                <View key={p.label} style={styles.preview}>
                  <Image source={{ uri: p.uri }} style={styles.previewImg} />
                  <Text style={styles.previewTag}>{p.label}</Text>
                  <Pressable style={styles.previewDel} onPress={p.clear}>
                    <Text style={styles.previewDelText}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <DuoBtn
            label={canPost ? '🩸  post to feed' : 'enter bac to post'}
            color={canPost ? C.blue : '#94a3b8'}
            shadow={canPost ? C.blueShadow : '#64748b'}
            onPress={() => { if (canPost) onPost(parsed, breathPhoto, comment.trim(), socialPhoto, genericPhoto) }}
            size="lg"
          />
          <View style={{ marginTop: 12 }}>
            <DuoBtn label="cancel" color={C.red} shadow={C.redShadow} onPress={onBack} size="sm" outline />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ── Main RecordScreen ─────────────────────────────
export default function RecordScreen({ onAddEntry, onAddBac }) {
  const insets = useSafeAreaInsets()
  const [phase, setPhase] = useState('idle')
  const [elapsed, setElapsed] = useState(0)
  const [bacCount, setBacCount] = useState(0)
  const [cigCount, setCigCount] = useState(0)
  const returnPhaseRef = useRef('idle')
  const intervalRef = useRef(null)

  useEffect(() => {
    if (phase === 'running') {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [phase])

  const xpGained = bacCount * 25 + cigCount * 10 + Math.floor(elapsed / 60) * 5

  const handleAddCig = () => {
    onAddEntry?.('vape')
    setCigCount(c => c + 1)
  }

  const goToAddBac = (from) => {
    returnPhaseRef.current = from
    setPhase('addbac')
  }

  const handlePost = (bac, breathPhoto, comment, socialPhoto, genericPhoto) => {
    onAddBac?.(bac, breathPhoto, comment, socialPhoto, genericPhoto)
    if (returnPhaseRef.current === 'running') {
      setBacCount(c => c + 1)
      setPhase('running')
    } else {
      setPhase('idle')
    }
  }

  const handleDone = () => {
    setPhase('idle')
    setElapsed(0)
    setBacCount(0)
    setCigCount(0)
  }

  const shared = { insets }

  if (phase === 'addbac') return <AddBacScreen onBack={() => setPhase(returnPhaseRef.current)} onPost={handlePost} insets={insets} />
  if (phase === 'idle')    return <IdleScreen onStartNight={() => setPhase('running')} onAddBac={() => goToAddBac('idle')} onAddCig={handleAddCig} {...shared} />
  if (phase === 'running') return <RunningScreen elapsed={elapsed} bacCount={bacCount} cigCount={cigCount} onAddBac={() => goToAddBac('running')} onAddCig={handleAddCig} onPause={() => setPhase('paused')} {...shared} />
  if (phase === 'paused')  return <PausedScreen elapsed={elapsed} bacCount={bacCount} cigCount={cigCount} onResume={() => setPhase('running')} onEnd={() => setPhase('done')} {...shared} />
  return <DoneScreen elapsed={elapsed} bacCount={bacCount} cigCount={cigCount} xp={xpGained} onDone={handleDone} {...shared} />
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'space-between', paddingBottom: 24 },
  screenDone: { backgroundColor: '#0a1628' },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 8 },
  actions: { paddingHorizontal: 24, gap: 10 },
  duoBtn: { width: '100%', alignItems: 'center' },
  duoBtnText: { fontWeight: '800' },

  heroImg: { width: 180, height: 180, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '900', color: '#f1f5f9' },
  subtitle: { fontSize: 15, color: '#64748b' },

  timerLabel: { fontSize: 14, color: '#64748b', letterSpacing: 2, textTransform: 'uppercase' },
  timer: { fontSize: 64, fontWeight: '900', color: '#f1f5f9', fontVariant: ['tabular-nums'] },
  counters: { flexDirection: 'row', gap: 8, marginTop: 4 },
  counter: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  counterText: { fontSize: 13, fontWeight: '600' },

  pauseIcon: { fontSize: 48 },
  pauseTitle: { fontSize: 24, fontWeight: '800', color: '#f1f5f9' },
  pauseSub: { fontSize: 14, color: '#64748b' },
  summary: { gap: 8, marginTop: 8 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryEmoji: { fontSize: 20 },
  summaryVal: { fontSize: 16, color: '#94a3b8' },

  doneBurst: { fontSize: 56 },
  doneTitle: { fontSize: 26, fontWeight: '900', color: '#f1f5f9', textAlign: 'center' },
  doneSub: { fontSize: 14, color: '#64748b' },
  xpBadge: { backgroundColor: '#58CC0220', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, marginTop: 4 },
  xpVal: { color: '#58CC02', fontWeight: '800', fontSize: 20 },
  doneStats: { flexDirection: 'row', gap: 16, marginTop: 8 },
  doneStat: { color: '#94a3b8', fontSize: 14 },

  // AddBAC
  addBacScreen: { flex: 1, backgroundColor: '#0f172a' },
  addBacHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { color: '#58CC02', fontSize: 15 },
  addBacTitle: { fontSize: 18, fontWeight: '700', color: '#f1f5f9' },
  addBacBody: { paddingHorizontal: 20, gap: 8 },
  fieldLabel: { fontSize: 13, color: '#94a3b8', marginBottom: 4 },
  bacRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  bacInput: {
    flex: 1, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: '#f1f5f9', fontSize: 20, fontWeight: '700',
  },
  bacUnit: { color: '#64748b', fontSize: 14 },
  textarea: {
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: '#f1f5f9', fontSize: 14, marginBottom: 8, minHeight: 80,
  },
  scanBar: {
    backgroundColor: '#1CB0F620', borderRadius: 8, padding: 10,
    alignItems: 'center', marginBottom: 8,
  },
  scanText: { color: '#1CB0F6', fontSize: 13 },
  photoActions: { gap: 8, marginBottom: 12 },
  photoBtn: {
    borderWidth: 1.5, borderColor: '#334155', borderRadius: 10,
    paddingVertical: 11, alignItems: 'center',
  },
  photoBtnText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  previews: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  preview: { position: 'relative', width: 90 },
  previewImg: { width: 90, height: 90, borderRadius: 8 },
  previewTag: { fontSize: 10, color: '#64748b', textAlign: 'center', marginTop: 3 },
  previewDel: { position: 'absolute', top: -6, right: -6, backgroundColor: '#FF4B4B', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  previewDelText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Camera
  camControls: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', gap: 16 },
  captureBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  captureBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
  camCancel: { color: '#fff', fontSize: 16, marginTop: 4 },
})
