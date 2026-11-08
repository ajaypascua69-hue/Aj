# AJ / LEO AI

AJ hosts **LEO AI**, a multilingual assistant interface configured to use only AI chat models whose IDs are explicitly marked with the `:free` suffix.

**Website:** https://ajaypascua69-hue.github.io/Aj/

## Features

- Responsive chat interface for desktop and Android browsers
- Multilingual conversations, subject to the selected model's capabilities
- Dynamic model list filtered to explicitly free model variants only
- Task modes for general assistance, coding, app development, writing, learning, and translation
- Coding and app-development guidance for project planning, architecture, accessible UI, file-by-file code, build steps, and testing
- No paid model fallback: if no free model is listed or available, LEO disables chat rather than selecting a paid model
- Browser speech input where supported
- Optional spoken replies using browser speech synthesis
- Refresh button to re-check the currently available free model list
- Export completed chat history as a plain-text file directly on the device
- Installable progressive web app shell and offline caching for the app interface
- No private API keys stored in this public repository

## Free-use commitment and limitations

The repository source and GitHub Pages static hosting can be used without a hosting fee under their applicable free-tier terms. LEO's AI chat is routed through Puter.js. The app filters the model catalogue to model IDs ending in `:free` and never automatically chooses a paid model.

Free models can have rate limits, quotas, temporary outages, sign-in requirements, or availability changes. A model marked free today may later disappear or change terms. The app will stop offering chat if it cannot find a free model. This project does not promise unlimited AI usage or guarantee that a third-party provider will always keep a free model available.

LEO intentionally does not include paid image generation or paid model choices. It also includes a local conversation export feature; exported text is created in the browser and is not uploaded by that feature. Browser speech features use the browser/device and may not be supported everywhere.

Check the provider's current terms and model availability before use:
- https://docs.puter.com/AI/
- https://developer.puter.com/ai/models/

## Run locally

Serve this folder with a local web server, for example:

    python -m http.server 8000

Then open http://localhost:8000.

## Project files

- `index.html` — LEO AI interface
- `style.css` — responsive styling
- `app.js` — free-only model discovery, chat, and browser voice tools
- `manifest.webmanifest` — installable app metadata
- `service-worker.js` — offline app-shell cache
- `icon.svg` — app icon

## Security

Never add API keys, passwords, access tokens, or private credentials to this public repository. LEO uses the Puter.js browser SDK and does not embed a private model API key.

## Licensing

The repository's existing LICENSE governs AJ project files. Third-party services and models retain their own licenses and terms.

## Install on Android

### Install the PWA (no APK required)

1. Open https://ajaypascua69-hue.github.io/Aj/ in Chrome on Android.
2. Open Chrome's menu and choose **Install app** or **Add to Home screen** (the wording can vary).
3. Confirm the installation. The app shell can open offline, but AI chat still needs an internet connection and an available free provider model.

### Build an Android APK for free

A GitHub Actions workflow builds a **debug APK** using Capacitor and the Android SDK:

1. Open the repository's **Actions** tab: https://github.com/ajaypascua69-hue/Aj/actions
2. Select **Build LEO AI Android APK**.
3. If the workflow has not started automatically, choose **Run workflow** and run it on `main`.
4. Wait for the build to finish successfully.
5. Open the completed workflow run, find **Artifacts**, and download `leo-ai-android-debug-apk`.
6. Extract the ZIP and install `app-debug.apk` on your Android device. Android may ask you to allow installation from that source.

The APK is a debug build for personal testing, not a Play Store release. It packages the current web app files into a native Android WebView container. The AI chat still relies on the internet and the same third-party free-model availability. GitHub Actions provides free usage within the account's applicable quota; this project does not guarantee unlimited build minutes. No paid signing service or paid API is required for this debug build.
