import { useState } from 'react'
import spiritsBar from '../assets/shops/spirits-bar.jpg'
import whiskeyShelf from '../assets/shops/whiskey-shelf.webp'

const TOP_CATS = [
  { id: 'deals',   label: 'deals',    emoji: '🔥', bg: '#fff1f2', fg: '#be123c' },
  { id: 'beer',    label: 'beer',     emoji: '🍺', bg: '#fefce8', fg: '#854d0e' },
  { id: 'wine',    label: 'wine',     emoji: '🍷', bg: '#fdf4ff', fg: '#7e22ce' },
  { id: 'spirits', label: 'spirits',  emoji: '🥃', bg: '#fff7ed', fg: '#c2410c' },
  { id: 'tobacco', label: 'tobacco',  emoji: '🚬', bg: '#f0fdf4', fg: '#15803d' },
  { id: 'vapes',   label: 'vapes',    emoji: '💨', bg: '#ecfeff', fg: '#0e7490' },
  { id: 'cigars',  label: 'cigars',   emoji: '🎩', bg: '#fafaf9', fg: '#57534e' },
  { id: 'bundles', label: 'bundles',  emoji: '🎁', bg: '#fef9c3', fg: '#a16207' },
]

const SUB_CATS = [
  { id: 'all',       label: 'all' },
  { id: 'craft',     label: 'craft beer' },
  { id: 'champagne', label: 'champagne' },
  { id: 'whiskey',   label: 'whiskey' },
  { id: 'tequila',   label: 'tequila' },
  { id: 'seltzers',  label: 'hard seltzer' },
  { id: 'disposable',label: 'disposables' },
  { id: 'premium',   label: 'premium' },
]

const STORES = [
  {
    id: 1,
    name: "total wine & more",
    tag: "alcohol · wine · spirits",
    rating: 4.8, reviews: '2.1k',
    time: '25–35', fee: '$1.99',
    deal: '20% off select wines',
    photo: spiritsBar,
    category: ['wine', 'spirits', 'beer'],
  },
  {
    id: 2,
    name: "bevmo!",
    tag: "beer · wine · spirits",
    rating: 4.6, reviews: '1.4k',
    time: '20–30', fee: 'Free',
    deal: null,
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    emoji: '🛒',
    category: ['beer', 'wine', 'spirits'],
  },
  {
    id: 3,
    name: "spec's wines & spirits",
    tag: "spirits · whiskey · tequila",
    rating: 4.9, reviews: '987',
    time: '30–40', fee: '$2.49',
    deal: 'free delivery on $50+',
    photo: whiskeyShelf,
    category: ['spirits'],
  },
  {
    id: 4,
    name: "craft beer cellar",
    tag: "craft beer · ipas · stouts",
    rating: 4.7, reviews: '634',
    time: '20–30', fee: '$0.99',
    deal: 'buy 6 get 1 free',
    gradient: 'linear-gradient(135deg, #713f12 0%, #d97706 100%)',
    emoji: '🍻',
    category: ['beer', 'craft'],
  },
  {
    id: 5,
    name: "Casey's Tobacco & Cigars",
    tag: "Cigars · Pipe Tobacco · Accessories",
    rating: 4.5, reviews: '412',
    time: '25–35', fee: '$1.49',
    deal: null,
    gradient: 'linear-gradient(135deg, #1c1917 0%, #57534e 100%)',
    emoji: '🎩',
    category: ['tobacco', 'cigars'],
  },
  {
    id: 6,
    name: "Cloud Nine Vape Shop",
    tag: "Disposables · E-Liquid · Devices",
    rating: 4.4, reviews: '889',
    time: '15–25', fee: 'Free',
    deal: '2 for $25 disposables',
    gradient: 'linear-gradient(135deg, #164e63 0%, #0891b2 100%)',
    emoji: '💨',
    category: ['vapes', 'disposable'],
  },
  {
    id: 7,
    name: "Moët & Chandon Boutique",
    tag: "Champagne · Sparkling Wine",
    rating: 4.9, reviews: '301',
    time: '35–45', fee: '$3.99',
    deal: null,
    gradient: 'linear-gradient(135deg, #4a1d96 0%, #a78bfa 100%)',
    emoji: '🥂',
    category: ['wine', 'champagne'],
  },
  {
    id: 8,
    name: "Smoker Friendly",
    tag: "Cigarettes · Tobacco · Vapes",
    rating: 4.2, reviews: '1.2k',
    time: '20–30', fee: '$0.99',
    deal: 'Carton deals available',
    gradient: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
    emoji: '🚬',
    category: ['tobacco', 'vapes'],
  },
]

const FILTERS = ['Deals', 'Pickup', 'Under 30 min', 'Ratings']

export default function ShopTab() {
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('all')
  const [activeSub, setActiveSub] = useState('all')
  const [activeFilters, setActiveFilters] = useState([])

  const toggleFilter = (f) =>
    setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])

  const filtered = STORES.filter(s => {
    const matchesCat = activeCat === 'all' || s.category.includes(activeCat)
    const matchesSub = activeSub === 'all' || s.category.includes(activeSub)
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.tag.toLowerCase().includes(search.toLowerCase())
    const matchesDeals = !activeFilters.includes('Deals') || s.deal
    const matchesTime = !activeFilters.includes('Under 30 min') || parseInt(s.time) < 30
    return matchesCat && matchesSub && matchesSearch && matchesDeals && matchesTime
  })

  return (
    <div className="tab-screen">
      {/* Header */}
      <div className="shop-header">
        <div className="page-header-title" style={{ marginBottom: 10 }}>Shop</div>
        <div className="shop-search-row">
          <div className="shop-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="shop-search-input"
              placeholder='Search "Whiskey", "IPAs"…'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="shop-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <button className="shop-map-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
            </svg>
          </button>
        </div>
      </div>

      <div className="shop-body">
        {/* Top categories */}
        <div className="shop-cats-scroll">
          {TOP_CATS.map(c => (
            <button
              key={c.id}
              className={`shop-cat-btn${activeCat === c.id ? ' shop-cat-btn--active' : ''}`}
              onClick={() => setActiveCat(prev => prev === c.id ? 'all' : c.id)}
            >
              <div className="shop-cat-icon" style={{ background: c.bg, color: c.fg }}>
                {c.emoji}
              </div>
              <span className="shop-cat-label">{c.label}</span>
            </button>
          ))}
        </div>

        {/* Sub-categories */}
        <div className="shop-subcats-scroll">
          {SUB_CATS.map(s => (
            <button
              key={s.id}
              className={`shop-subcat-btn${activeSub === s.id ? ' shop-subcat-btn--active' : ''}`}
              onClick={() => setActiveSub(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Filter pills */}
        <div className="shop-filters-scroll">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`shop-filter-pill${activeFilters.includes(f) ? ' shop-filter-pill--active' : ''}`}
              onClick={() => toggleFilter(f)}
            >
              {activeFilters.includes(f) && <span className="shop-filter-check">✓ </span>}
              {f}
              {f === 'Ratings' && ' ▾'}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="shop-results-row">
          <span className="shop-results-count">{filtered.length} stores</span>
          {(activeCat !== 'all' || activeSub !== 'all' || activeFilters.length > 0 || search) && (
            <button className="shop-reset-btn" onClick={() => { setActiveCat('all'); setActiveSub('all'); setActiveFilters([]); setSearch('') }}>
              Reset
            </button>
          )}
        </div>

        {/* Store cards */}
        <div className="shop-store-list">
          {filtered.length === 0 ? (
            <div className="shop-empty">No stores match your filters.</div>
          ) : filtered.map(store => (
            <div key={store.id} className="shop-store-card">
              <div
                className="shop-store-hero"
                style={store.photo
                  ? { backgroundImage: `url(${store.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: store.gradient }
                }
              >
                {!store.photo && <span className="shop-store-hero-emoji">{store.emoji}</span>}
                {store.deal && (
                  <div className="shop-store-deal-badge">🔥 {store.deal}</div>
                )}
                <button className="shop-store-heart">♡</button>
              </div>
              <div className="shop-store-info">
                <div className="shop-store-name-row">
                  <span className="shop-store-name">{store.name}</span>
                </div>
                <div className="shop-store-tag">{store.tag}</div>
                <div className="shop-store-meta">
                  <span className="shop-store-rating">⭐ {store.rating} ({store.reviews})</span>
                  <span className="shop-store-dot">·</span>
                  <span className="shop-store-time">🕐 {store.time} min</span>
                  <span className="shop-store-dot">·</span>
                  <span className="shop-store-fee">{store.fee} delivery</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
