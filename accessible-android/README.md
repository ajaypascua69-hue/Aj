# Guided Vision 2 - Be My Eyes for Android

Guided Vision 2 - Be My Eyes is an experimental Android accessibility-service project. The existing AJ website remains at the repository root; this native Android project is isolated in `accessible-android/`.

## Build and install a test APK
GitHub Actions builds a debug APK when changes are pushed to this folder. Download the artifact named **Guided-Vision-2-Be-My-Eyes-debug-apk** from the Actions run. Install the APK on your Android device, then open Accessible and enable **Guided Vision 2 Screen Reader** in Android Accessibility Settings.

## Current prototype scope
- Speaks text and accessibility labels exposed by Android apps.
- Reads image descriptions when the app supplies an accessibility content description.
- Attempts vertical and horizontal scroll actions on scrollable UI elements.
- Includes an online Guided Vision launcher that opens Google Gemini; start Gemini Live and share your camera there. Gemini account, internet access, and regional availability are controlled by Google.
- Keeps ordinary screen reading, navigation, Android Text-to-Speech, and local image labels on-device/offline where the Android engine and model are available.
- Maps diagonal swipe gestures to simple previous/next spoken feedback where Android delivers those gestures.

This remains an experimental prototype, not a complete TalkBack replacement. It cannot reliably describe unlabeled photos or icons without an image-understanding model, and gesture behavior depends on Android/device accessibility gesture routing. The Guided Vision launcher does not embed or reproduce Google's Gemini model. It hands off to the official Gemini app/site. It has not been validated for Play Store release. Use caution when enabling an experimental accessibility service.

## License
See the repository's root LICENSE.
