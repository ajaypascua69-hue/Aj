# Accessible for Android

Accessible is an experimental Android accessibility-service project. The existing AJ website remains at the repository root; this native Android project is isolated in `accessible-android/`.

## Build and install a test APK
GitHub Actions builds a debug APK when changes are pushed to this folder. Download the artifact named **Accessible-debug-apk** from the Actions run. Install the APK on your Android device, then open Accessible and enable **Accessible Screen Reader** in Android Accessibility Settings.

## Current prototype scope
- Speaks text and accessibility labels exposed by Android apps.
- Reads image descriptions when the app supplies an accessibility content description.
- Attempts vertical and horizontal scroll actions on scrollable UI elements.
- Maps diagonal swipe gestures to simple previous/next spoken feedback where Android delivers those gestures.

This remains an experimental prototype, not a complete TalkBack replacement. It cannot reliably describe unlabeled photos or icons without an image-understanding model, and gesture behavior depends on Android/device accessibility gesture routing. It has not been validated for Play Store release. Use caution when enabling an experimental accessibility service.

## License
See the repository's root LICENSE.
