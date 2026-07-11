# grindset

[![Mobile Tests](https://github.com/ai-xiaihai/grindset/actions/workflows/mobile-tests.yml/badge.svg)](https://github.com/ai-xiaihai/grindset/actions/workflows/mobile-tests.yml)

A mobile-first lifestyle tracking app for logging vapes, drinks, and BAC — with a social feed, leaderboard, and friend nudges.

## Features

- **Feed** — social cards showing friends' night-out activity, BAC readings, and photos
- **Log** — track vapes, drinks, and BAC entries with timestamps
- **BAC Graph** — visualize blood alcohol over time
- **Leaderboard** — ranked friend standings with peak BAC
- **Record** — personal stats, streaks, achievements, and insights
- **Shop** — in-app shop tab
- **Auth** — email/password login and signup via Supabase

## Tech stack

- React Native + Expo (managed workflow)
- React Navigation (bottom tabs + native stack)
- Supabase (auth, database, RLS)
- expo-camera + expo-image-picker (photo capture)
- expo-location + expo-task-manager (background GPS tracking)
- react-native-maps (route Polyline in feed)
- react-native-gifted-charts (BAC graph)
- expo-haptics (tactile feedback)
- AsyncStorage (local state persistence)

## Local development

```bash
cd mobile
yarn install
npx expo start
```

Scan the QR code with Expo Go (Android/iOS) to run on a physical device.

Create a `mobile/.env` file with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

## Deployment

No automated deployment configured yet. To build for distribution:

```bash
npm install -g eas-cli
eas login
eas build --platform android   # or ios
```

---

## Known gaps / needs retesting

### Background location tracking (Phase 6)

**Status: implemented but untested on device.**

The code in `mobile/src/lib/location.js` and `mobile/src/screens/RecordScreen.jsx` is wired up — permissions request, background task registration via `expo-task-manager`, Haversine distance filtering, AsyncStorage buffering, and periodic sync to `night_out_locations` in Supabase.

**Why it hasn't been tested:** Background location requires a [development build](https://docs.expo.dev/develop/development-builds/introduction/) — a custom native binary compiled with the app's actual native dependencies. The current dev workflow uses Expo Go, which is a pre-built sandbox that cannot load `expo-task-manager` or the `UIBackgroundModes: location` entitlement at runtime.

**To test this properly:**
1. Set up EAS (`npm install -g eas-cli && eas login && eas build:configure`)
2. Build a development client: `eas build --profile development --platform android`
3. Install the resulting `.apk` on the test device
4. Verify: permission prompt appears on "start a night out", background task survives app backgrounding, points appear in `night_out_locations` after session ends
