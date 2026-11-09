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

For TestFlight/App Store distribution, the commented workflow documents these secrets: `IOS_CERTIFICATE_P12_BASE64`, `IOS_CERTIFICATE_PASSWORD`, `IOS_PROVISIONING_PROFILE_BASE64`, `APPSTORE_CONNECT_API_KEY_ID`, `APPSTORE_CONNECT_API_ISSUER_ID`, `APPSTORE_CONNECT_API_KEY_P8`. Apple setup requires an Apple Developer Program membership, an App ID, an Apple Distribution certificate, an App Store provisioning profile, and an App Store Connect API key with its issuer ID and private key.
