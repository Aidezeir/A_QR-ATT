# SETUP COMMANDS — QR Attendance App

> **Target:** First-year students | **Expo SDK:** 54 | **Expo Go:** 54.0.8

---

## PREREQUISITES

| Tool | Download | Verify |
|---|---|---|
| Node.js (LTS) | https://nodejs.org/en | `node --version` |
| VS Code | https://code.visualstudio.com | (open it) |
| Expo Go 54.0.8 | Play Store → "Expo Go" | (version in app settings) |

---

## STEP 1 — Create the App

```powershell
cd D:\QR-ATT
npx create-expo-app@latest qr-att

# When prompted, select "SDK 54"
# Wait for npm install (~2 min)
```

---

## STEP 2 — Install Matching Versions

The default install may need these fixed versions that match Expo Go 54.0.8:

```powershell
npm install expo@~54.0.35 react@19.1.0 react-native@0.81.5 expo-router@~6.0.24 @expo/vector-icons@^15.0.3 expo-linking@~8.0.12 expo-constants@~18.0.13 expo-font@~14.0.12 expo-status-bar@~3.0.9 expo-splash-screen@~31.0.13 react-native-screens@~4.16.0 react-native-safe-area-context@~5.6.0 react-native-gesture-handler@~2.28.0 react-native-reanimated@~4.1.1 react-dom@19.1.0 react-native-web@~0.21.0 @types/react@~19.1.0 typescript@~5.9.2 --legacy-peer-deps
```

---

## STEP 3 — Start

```powershell
npx expo start
```

Scan QR code with Expo Go. Or press `W` for web.

---

## TROUBLESHOOTING

| Problem | Solution |
|---|---|
| npm install fails | Use `npm install --legacy-peer-deps` |
| App crashes in Expo Go | Make sure all versions match STEP 2 exactly |
| QR won't scan | Phone + computer on same WiFi |
| White screen | Wait 10s, or shake → Reload |
| TypeScript errors | Run `npx tsc --noEmit` |


## Admin dashboard setup

The admin feature adds an Admin tab for accounts whose `profiles.role` is `admin`.
It displays registered profiles and the latest 500 attendance rows.

1. Back up your project and Supabase database first.
2. In Supabase Dashboard -> SQL Editor, run `supabase/admin_migration.sql`.
3. Register a normal account using the app's existing registration form, then sign out.
4. In SQL Editor, replace the example email with that account's email and run:
   ```sql
   update public.profiles
   set role = 'admin', updated_at = now()
   where lower(email) = lower('your-admin-email@example.com');
   ```
   Run the matching `select` query from the migration to verify the role is `admin`.
5. Sign in with that account again. The Admin tab should appear.
6. Test with student and teacher accounts to verify they do not see the Admin tab.

Important:
- Do not add `admin` to the public registration role picker.
- Do not put a Supabase service-role key in the app or `.env` used by the app.
- The admin screen currently displays up to 500 most recent attendance rows. For larger datasets, add pagination.
- The migration grants read access to admin profiles, events, and attendance through RLS. It does not add user deletion or role-editing controls.
