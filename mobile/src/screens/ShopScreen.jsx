import { useState } from 'react'
import {
  View, Text, TextInput, Pressable, FlatList,
  ScrollView, ImageBackground, StyleSheet,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const spiritsBar = require('../assets/shops/spirits-bar.jpg')
const whiskeyShelf = require('../assets/shops/whiskey-shelf.webp')

const TOP_CATS = [
  { id: 'deals',   label: 'deals',   emoji: '🔥', bg: '#fff1f2', fg: '#be123c' },
  { id: 'beer',    label: 'beer',    emoji: '🍺', bg: '#fefce8', fg: '#854d0e' },
  { id: 'wine',    label: 'wine',    emoji: '🍷', bg: '#fdf4ff', fg: '#7e22ce' },
  { id: 'spirits', label: 'spirits', emoji: '🥃', bg: '#fff7ed', fg: '#c2410c' },
  { id: 'tobacco', label: 'tobacco', emoji: '🚬', bg: '#f0fdf4', fg: '#15803d' },
  { id: 'vapes',   label: 'vapes',   emoji: '💨', bg: '#ecfeff', fg: '#0e7490' },
  { id: 'cigars',  label: 'cigars',  emoji: '🎩', bg: '#fafaf9', fg: '#57534e' },
  { id: 'bundles', label: 'bundles', emoji: '🎁', bg: '#fef9c3', fg: '#a16207' },
]

const SUB_CATS = [
  { id: 'all',        label: 'all' },
  { id: 'craft',      label: 'craft beer' },
  { id: 'champagne',  label: 'champagne' },
  { id: 'whiskey',    label: 'whiskey' },
  { id: 'tequila',    label: 'tequila' },
  { id: 'seltzers',   label: 'hard seltzer' },
  { id: 'disposable', label: 'disposables' },
  { id: 'premium',    label: 'premium' },
]

const STORES = [
  { id: 1, name: 'total wine & more',       tag: 'alcohol · wine · spirits',      rating: 4.8, reviews: '2.1k', time: '25–35', fee: '$1.99', deal: '20% off select wines',    photo: spiritsBar,    gradient: null,                                          emoji: null,  category: ['wine','spirits','beer'] },
  { id: 2, name: 'bevmo!',                  tag: 'beer · wine · spirits',          rating: 4.6, reviews: '1.4k', time: '20–30', fee: 'Free',  deal: null,                       photo: null,          gradient: ['#1e3a5f','#2563eb'],                          emoji: '🛒',  category: ['beer','wine','spirits'] },
  { id: 3, name: "spec's wines & spirits",  tag: 'spirits · whiskey · tequila',    rating: 4.9, reviews: '987',  time: '30–40', fee: '$2.49', deal: 'free delivery on $50+',   photo: whiskeyShelf,  gradient: null,                                          emoji: null,  category: ['spirits'] },
  { id: 4, name: 'craft beer cellar',       tag: 'craft beer · ipas · stouts',     rating: 4.7, reviews: '634',  time: '20–30', fee: '$0.99', deal: 'buy 6 get 1 free',        photo: null,          gradient: ['#713f12','#d97706'],                          emoji: '🍻',  category: ['beer','craft'] },
  { id: 5, name: "Casey's Tobacco & Cigars",tag: 'Cigars · Pipe Tobacco',          rating: 4.5, reviews: '412',  time: '25–35', fee: '$1.49', deal: null,                       photo: null,          gradient: ['#1c1917','#57534e'],                          emoji: '🎩',  category: ['tobacco','cigars'] },
  { id: 6, name: 'Cloud Nine Vape Shop',    tag: 'Disposables · E-Liquid',         rating: 4.4, reviews: '889',  time: '15–25', fee: 'Free',  deal: '2 for $25 disposables',   photo: null,          gradient: ['#164e63','#0891b2'],                          emoji: '💨',  category: ['vapes','disposable'] },
  { id: 7, name: 'Moët & Chandon Boutique', tag: 'Champagne · Sparkling Wine',     rating: 4.9, reviews: '301',  time: '35–45', fee: '$3.99', deal: null,                       photo: null,          gradient: ['#4a1d96','#a78bfa'],                          emoji: '🥂',  category: ['wine','champagne'] },
  { id: 8, name: 'Smoker Friendly',         tag: 'Cigarettes · Tobacco · Vapes',   rating: 4.2, reviews: '1.2k', time: '20–30', fee: '$0.99', deal: 'Carton deals available',  photo: null,          gradient: ['#14532d','#16a34a'],                          emoji: '🚬',  category: ['tobacco','vapes'] },
]

const FILTERS = ['Deals', 'Pickup', 'Under 30 min', 'Ratings']

function StoreCard({ store }) {
  return (
    <View style={styles.storeCard}>
      {/* Hero */}
      {store.photo ? (
        <ImageBackground source={store.photo} style={styles.storeHero} imageStyle={{ resizeMode: 'cover' }}>
          {store.deal && (
            <View style={styles.dealBadge}>
              <Text style={styles.dealText}>🔥 {store.deal}</Text>
            </View>
          )}
        </ImageBackground>
      ) : (
        <LinearGradient colors={store.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.storeHero}>
          <Text style={styles.heroEmoji}>{store.emoji}</Text>
          {store.deal && (
            <View style={styles.dealBadge}>
              <Text style={styles.dealText}>🔥 {store.deal}</Text>
            </View>
          )}
        </LinearGradient>
      )}

      {/* Info */}
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.storeTag}>{store.tag}</Text>
        <View style={styles.storeMeta}>
          <Text style={styles.metaText}>⭐ {store.rating} ({store.reviews})</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>🕐 {store.time} min</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{store.fee} delivery</Text>
        </View>
      </View>
    </View>
  )
}

export default function ShopScreen() {
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('all')
  const [activeSub, setActiveSub] = useState('all')
  const [activeFilters, setActiveFilters] = useState([])

  const toggleFilter = f =>
    setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])

  const filtered = STORES.filter(s => {
    const matchesCat    = activeCat === 'all' || s.category.includes(activeCat)
    const matchesSub    = activeSub === 'all' || s.category.includes(activeSub)
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.tag.toLowerCase().includes(search.toLowerCase())
    const matchesDeals  = !activeFilters.includes('Deals') || s.deal
    const matchesTime   = !activeFilters.includes('Under 30 min') || parseInt(s.time) < 30
    return matchesCat && matchesSub && matchesSearch && matchesDeals && matchesTime
  })

  const hasFilters = activeCat !== 'all' || activeSub !== 'all' || activeFilters.length > 0 || search

  return (
    <FlatList
      style={{ backgroundColor: '#0f172a' }}
      contentContainerStyle={[styles.list, { paddingTop: insets.top }]}
      data={filtered}
      keyExtractor={s => String(s.id)}
      ListEmptyComponent={<Text style={styles.empty}>No stores match your filters.</Text>}
      ListHeaderComponent={
        <View>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Shop</Text>
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder='Search "Whiskey", "IPAs"…'
                  placeholderTextColor="#475569"
                  value={search}
                  onChangeText={setSearch}
                />
                {search ? (
                  <Pressable onPress={() => setSearch('')}>
                    <Text style={styles.searchClear}>✕</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>

          {/* Top categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catsScroll}>
            {TOP_CATS.map(c => (
              <Pressable
                key={c.id}
                style={styles.catBtn}
                onPress={() => setActiveCat(prev => prev === c.id ? 'all' : c.id)}
              >
                <View style={[styles.catIcon, { backgroundColor: c.bg }, activeCat === c.id && styles.catIconActive]}>
                  <Text style={styles.catEmoji}>{c.emoji}</Text>
                </View>
                <Text style={[styles.catLabel, activeCat === c.id && { color: '#f1f5f9' }]}>{c.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Sub-categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
            {SUB_CATS.map(s => (
              <Pressable
                key={s.id}
                style={[styles.subCatBtn, activeSub === s.id && styles.subCatBtnActive]}
                onPress={() => setActiveSub(s.id)}
              >
                <Text style={[styles.subCatText, activeSub === s.id && styles.subCatTextActive]}>{s.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
            {FILTERS.map(f => {
              const active = activeFilters.includes(f)
              return (
                <Pressable
                  key={f}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => toggleFilter(f)}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>
                    {active ? '✓ ' : ''}{f}{f === 'Ratings' ? ' ▾' : ''}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>

          {/* Results count */}
          <View style={styles.resultsRow}>
            <Text style={styles.resultsCount}>{filtered.length} stores</Text>
            {hasFilters && (
              <Pressable onPress={() => { setActiveCat('all'); setActiveSub('all'); setActiveFilters([]); setSearch('') }}>
                <Text style={styles.resetBtn}>Reset</Text>
              </Pressable>
            )}
          </View>
        </View>
      }
      renderItem={({ item }) => <StoreCard store={item} />}
    />
  )
}

const styles = StyleSheet.create({
  list: { paddingBottom: 32 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 10 },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, color: '#f1f5f9', fontSize: 14 },
  searchClear: { color: '#64748b', fontSize: 14 },

  catsScroll: { paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  catBtn: { alignItems: 'center', gap: 5 },
  catIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  catIconActive: { borderWidth: 2, borderColor: '#58CC02' },
  catEmoji: { fontSize: 22 },
  catLabel: { fontSize: 11, color: '#64748b', textTransform: 'lowercase' },

  pillsScroll: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  subCatBtn: { borderWidth: 1, borderColor: '#334155', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  subCatBtnActive: { backgroundColor: '#58CC02', borderColor: '#58CC02' },
  subCatText: { color: '#94a3b8', fontSize: 13 },
  subCatTextActive: { color: '#fff', fontWeight: '600' },
  filterPill: { borderWidth: 1, borderColor: '#334155', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  filterPillActive: { backgroundColor: '#1CB0F620', borderColor: '#1CB0F6' },
  filterText: { color: '#94a3b8', fontSize: 13 },
  filterTextActive: { color: '#1CB0F6', fontWeight: '600' },

  resultsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  resultsCount: { color: '#64748b', fontSize: 13 },
  resetBtn: { color: '#58CC02', fontSize: 13, fontWeight: '600' },

  storeCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#1e293b', borderRadius: 16, overflow: 'hidden' },
  storeHero: { height: 160, alignItems: 'flex-end', justifyContent: 'space-between', padding: 10 },
  heroEmoji: { fontSize: 40, position: 'absolute', left: '50%', top: '30%' },
  dealBadge: { backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  dealText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  storeInfo: { padding: 14 },
  storeName: { color: '#f1f5f9', fontWeight: '700', fontSize: 15, marginBottom: 3 },
  storeTag: { color: '#64748b', fontSize: 12, marginBottom: 6 },
  storeMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#94a3b8', fontSize: 12 },
  metaDot: { color: '#475569', fontSize: 12 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 14 },
})
