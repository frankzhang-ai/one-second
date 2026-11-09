# ONE SECOND native builds

This directory is the shared Capacitor 8 project for the existing plain HTML/CSS/JS game. It loads the locally bundled web app; the root website remains the source for game files.

## Update and build

After changing the root web app, run from this directory:

```sh
npm run sync
```

Local Android build (requires Android SDK and Java 21):

```sh
npm run sync
cd android
./gradlew assembleDebug bundleRelease
```

iOS builds require macOS and Xcode. The iOS simulator workflow is in GitHub Actions.

## Signing secrets

Set repository secrets at **Settings → Secrets and variables → Actions**.

Android: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Generate an upload keystore locally with:

```sh
keytool -genkeypair -v -keystore upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
base64 -w0 upload.jks
```

Put the base64 output in `ANDROID_KEYSTORE_BASE64`. Never commit `upload.jks` or its passwords. Google Play App Signing should be enabled; keep the upload key separate from the Play app signing key.

### iOS (TestFlight) – only 3 secrets

The `testflight` job in `.github/workflows/ios.yml` is commented out until the Apple Developer account is active. It signs with an App Store Connect API key only (Xcode automatic signing + Apple cloud-managed distribution certificate), so no `.p12` certificate or provisioning profile is stored anywhere and no Mac is needed.

| Secret | Value |
|---|---|
| `ASC_KEY_ID` | Key ID of the API key (10 characters) |
| `ASC_ISSUER_ID` | Issuer ID shown above the keys list (UUID) |
| `ASC_KEY_P8` | Full text of the downloaded `AuthKey_XXXXXXXXXX.p8` file, including the BEGIN/END lines |

Optional repository **variable** (not a secret): `APPLE_TEAM_ID`. If not set, the job looks up the team ID from the API key.

Create the API key (needs the Account Holder or an Admin):

1. Sign in to [App Store Connect](https://appstoreconnect.apple.com) → **Users and Access** → **Integrations** → **App Store Connect API** → **Team Keys**. The Account Holder may first need to click **Request Access**.
2. Click **Generate API Key** (or **+**), name it e.g. `GitHub Actions`, choose role **Admin**. App Manager can upload builds, but Apple cloud-managed distribution signing generally requires Admin, so use Admin unless you know App Manager works for your team.
3. Download the `.p8` file (it can be downloaded only once) and copy the **Key ID** and **Issuer ID**.
4. In GitHub: repo **Settings → Secrets and variables → Actions → New repository secret**, add the three secrets above. Delete the local `.p8` copy afterwards or keep it in a password manager.

Before the first upload, create the app record in App Store Connect (**Apps → + → New App**, bundle ID `com.frankzhang.onesecond`; the job registers the bundle ID if it does not exist yet). Then uncomment the `testflight` job and run it via **Actions → iOS simulator build → Run workflow**.

Limits: Xcode may create an Apple Development certificate on each fresh runner during archive; revoke old "Created via API" development certificates occasionally. The job has not been run yet (no Apple account), so the first run may need small fixes.
