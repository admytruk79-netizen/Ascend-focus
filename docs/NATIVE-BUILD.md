# ASCEND Focus: Web → Android + iOS with Capacitor

Native app identifier: `com.hiddenlaws.ascendfocus`. Confirm identifier ownership before store submission. Native projects are **not yet generated or installed** merely by this configuration.

## Requirements
- Node 24+ and npm, supported Capacitor 7 toolchain
- Android: Android Studio, Android SDK, JDK 21
- iOS: macOS, Xcode and an Apple Developer team for signing/TestFlight
- Use a real device for installation and notification/back-navigation validation

## Generate and test locally
```sh
npm install
npm run typecheck
npm test
npm run build
npm run mobile:android:init
npm run mobile:ios:init # macOS + Xcode environment
npm run mobile:sync
npm run mobile:android:open
npm run mobile:ios:open
```

`cap add android` and `cap add ios` are one-time commands; after generating native project directories, commit those directories and use `npm run mobile:sync` for subsequent web changes. Do not repeatedly `cap add` to an existing native project.

## Device-specific checks
- Safe-area insets and bottom bar not hidden behind system navigation
- Android Back closes exercise screens rather than terminating practice unexpectedly
- Foreground/background timer behavior and journal persistence
- No permission prompts unless a corresponding feature uses that permission
- Reduced motion, large font, TalkBack/VoiceOver, external keyboard
- Signing, package name, icon, splash screen and privacy policy before release

## Release gates
Android APK debug build and manual device install; Android signed AAB for Play Console; signed iOS archive and TestFlight upload from Xcode on macOS. Do not call a build installed or App Store-ready until it has been tested and signed.

