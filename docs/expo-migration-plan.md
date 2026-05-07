# Expo Migration Plan

## Overview

Migrate the Grindset web app (React + Vite + Supabase) to Expo (React Native) for mobile-first experience, with web as secondary target. Adds location tracking during "night out" sessions.

---

## What survives vs. what's rewritten

### Reusable as-is
- All Supabase queries (auth, follows, profiles, RPC calls)
- Business logic (XP calc, streak, timer state machine)
- Static data: `friends.json`, `me.json`
- Pure utils: `utils.js`

### Reusable with minor adaptation
- `supabase.js` — swap `import.meta.env.VITE_*` for expo-constants, add AsyncStorage auth persistence
- `NudgeModal` — `window.open` → `Linking.openURL`
- All hooks/state logic in every component

### Full rewrite (UI layer only)
- Every component's JSX: `<div>` → `<View>`, `<span>` → `<Text>`, `<input>` → `<TextInput>`
- All CSS → StyleSheet.create() or NativeWind
- Recharts → victory-native
- Navigation: manual tab state → React Navigation bottom tabs
- Camera: getUserMedia → expo-camera
- Maps: static image + SVG → react-native-maps

---

## Library swap map

| Web                      | Expo replacement                          |
|--------------------------|-------------------------------------------|
| Recharts                 | victory-native                            |
| Plain CSS                | NativeWind (or StyleSheet.create)         |
| Manual tab state         | @react-navigation/bottom-tabs             |
| `window.open()`         | expo-linking                              |
| getUserMedia             | expo-camera                               |
| tesseract.js             | Deferred (currently mocked)               |
| Static map image         | react-native-maps                         |
| localStorage             | @react-native-async-storage/async-storage |
| `import.meta.env`       | expo-constants + .env                     |
| N/A                      | expo-location + expo-task-manager (new)   |

---

## Phases

### Phase 0: Project scaffolding (1 day)

- `npx create-expo-app grindset-mobile --template blank`
- Install: @react-navigation/native, @react-navigation/bottom-tabs, @react-native-async-storage/async-storage, @supabase/supabase-js, react-native-safe-area-context, react-native-screens
- Configure Supabase client with AsyncStorage auth persistence
- Set up bottom tab navigator with 5 placeholder screens (Feed, Leaderboard, Record, Shop, Profile)
- Auth gate: Stack Navigator wrapping tabs, Auth/Onboarding as initial routes
- Copy friends.json, me.json, utils.js
- Run on iOS Simulator to confirm navigation works

**Decision**: React Navigation (explicit) over Expo Router (file-based). App has modals/overlays that need explicit control.

### Phase 1: Auth + Onboarding (0.5 days)

- AuthScreen in RN (TextInput, Pressable, same Supabase calls)
- OnboardingScreen in RN (same insert to profiles)
- Wire up supabase.auth.onAuthStateChange in root
- Replace window.location.origin email redirect with Expo deep link URL
- Test signup flow end-to-end on simulator

### Phase 2: Feed + Leaderboard (2 days)

- LeaderboardTab: FlatList with styled rows, same sort logic and mock data
- FeedTab: NightOutCard as View components, static map image for now
- Dap/comment interactions with Pressable + local state
- NudgeModal: RN Modal component, Linking.openURL for Venmo
- Feed scroll via FlatList

**Decision**: Use NativeWind (Tailwind for RN) for styling. Fastest velocity for solo dev, keeps web compat.

### Phase 3: Record tab + Camera (2 days)

- Port state machine (idle/addbac/running/paused/done) — pure logic, copies directly
- Convert each sub-screen to RN components
- Replace import.meta.glob hero images with require() imports
- Camera: expo-camera with Camera.requestCameraPermissionsAsync() + takePictureAsync()
- Photo picker: expo-image-picker for gallery access
- OCR: defer (current implementation is mocked with setTimeout)

### Phase 4: Profile + Charts (1.5 days)

- BAC chart: victory-native (VictoryLine, VictoryArea for zones, reference lines)
- Weekly sparkline: same library or react-native-gifted-charts if simpler
- Badges grid: FlatList with numColumns={4} or flex-wrap View
- Follow counts + FindFriends/FollowList as stack modals
- Sign out: supabase.auth.signOut() (same)

**Decision**: victory-native for charts. Only library supporting BAC zone overlays and reference lines.

### Phase 5: Shop + Polish overlays (1 day)

- ShopTab: horizontal ScrollView for category pills, FlatList for store cards
- Polish modal screens: use @react-navigation/native-stack modal presentation
- Add KeyboardAvoidingView where inputs exist
- Handle safe area insets across all screens

### Phase 6: Location tracking — Night Out (2.5 days)

New feature. Record GPS breadcrumbs during a "night out" session.

**Database migration:**
```sql
create table night_out_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  session_id uuid not null,
  latitude double precision not null,
  longitude double precision not null,
  recorded_at timestamptz default now()
);
-- RLS: users can insert/read their own rows
```

**Implementation:**
- Request foreground + background location permissions (expo-location)
- Register background task with expo-task-manager (task: BACKGROUND_LOCATION_TASK)
- Filter: only store if distance from last stored point > 100m (Haversine formula)
- Integration with RecordTab: "start night out" begins tracking, "it's over" stops
- session_id (UUID) generated at start to group points
- Write to AsyncStorage during session, sync to Supabase periodically (every 5 min) and at session end

**iOS config (app.json):**
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Grindset records your route during a night out to share with friends.",
        "UIBackgroundModes": ["location"]
      }
    }
  }
}
```

**Settings:**
- Accuracy: Location.Accuracy.Balanced (not High — battery)
- timeInterval: 60000 (1 min)
- distanceInterval: 50m (coarse pre-filter)
- Significant change threshold: 100m (Haversine check before storing)

### Phase 7: Maps in Feed (1 day)

- Install react-native-maps
- For posts with real GPS data: render MapView with scrollEnabled={false} + Polyline
- For mock posts (no GPS data): keep static east-village.png fallback
- Style map card to match current visual (190px height, rounded corners)

### Phase 8: Polish, Web, Testing (2 days)

- Expo Web: run `npx expo start --web`, fix breaks with Platform.select() guards
- Haptics: expo-haptics on dap button and log actions
- App icon + splash screen in app.json
- Test on physical device with development build (not Expo Go — needed for background location)
- Test background location with a real walk
- Performance: keyExtractor on FlatLists, memoize expensive computations
- Web fallbacks: static images where maps/camera don't work on web

---

## Total estimate

~13.5 days (2.5–3 weeks for solo developer)

---

## Key architectural decisions

1. **React Navigation** over Expo Router — modals/overlays need explicit control
2. **NativeWind** for styling — fastest solo velocity, web compat
3. **victory-native** for charts — only option supporting BAC zones/reference lines
4. **useState + props** — app too small for Redux/Zustand
5. **Managed Expo workflow** — no ejecting, all native modules supported
6. **State management**: keep current approach, add Zustand only if complexity grows

---

## Risk areas

- **Background location (iOS)**: Apple is strict about "always" location justification. App Store review may push back. Need clear privacy explanation.
- **BAC chart with zones**: Most complex visual to port. Budget extra time.
- **Dev loop for Phase 6**: Background location requires development build (not Expo Go). Slower iteration.
- **Web fallback**: react-native-maps and expo-location have no web support. Need Platform.OS === 'web' guards with static fallbacks.
- **OCR**: tesseract.js won't work in RN. Currently mocked so not blocking, but real OCR would need react-native-mlkit-ocr or cloud API.
