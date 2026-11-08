# AJ / LEO AI

AJ hosts **LEO AI**, a multilingual assistant interface configured to use only AI chat models whose IDs are explicitly marked with the `:free` suffix.

**Website:** https://ajaypascua69-hue.github.io/Aj/

## Features

- Responsive chat interface for desktop and Android browsers
- Multilingual conversations, subject to the selected model's capabilities
- Dynamic model list filtered to explicitly free model variants only, with provider, context-window, and output-limit metadata when exposed by the provider
- Task modes for general assistance, personal assistance, coding, app development, writing, learning, and translation
- Personal assistant workspace with a device-local task list (add, complete, and delete tasks)
- Coding and app-development guidance for project planning, architecture, accessible UI, file-by-file code, build steps, and testing
- No paid model fallback: if no free model is listed or available, LEO disables chat rather than selecting a paid model
- Browser speech input where supported
- Optional spoken replies using browser speech synthesis
- Refresh button to re-check the currently available free model list
- User-controlled knowledge library: save reviewed assistant answers or notes, retrieve matching saved items in later prompts, and delete saved entries\n- Knowledge library is stored locally in the browser on that device; it does not train model weights or sync across devices\n- Export completed chat history as a plain-text file directly on the device
- Online-only web app; an internet connection is required and app pages are not cached for offline use
- No private API keys stored in this public repository

## Free-use commitment and limitations

The repository source and GitHub Pages static hosting can be used without a hosting fee under their applicable free-tier terms. LEO's AI chat is routed through Puter.js. The app filters the model catalogue to model IDs ending in `:free` and never automatically chooses a paid model.

The model picker displays provider metadata such as context-window and maximum output-token limits when available. These are provider-reported catalogue details, not independent performance benchmarks. Free models can have rate limits, quotas, temporary outages, sign-in requirements, or availability changes. A model marked free today may later disappear or change terms. The app will stop offering chat if it cannot find a free model. This project does not promise unlimited AI usage or guarantee that a third-party provider will always keep a free model available.

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
- No active service worker or offline app cache; older registrations are removed at launch
- `icon.svg` — app icon

## Online-only behavior and settings

LEO requires an internet connection. It does not register a service worker or provide offline app-shell caching. On launch it attempts to unregister older service workers and clear old Cache Storage entries created by previous versions. The Personal assistant mode helps plan days, prioritize tasks, create checklists, and draft messages. The My tasks panel stores up to 100 simple tasks in this browser's local storage; it is not a cloud-synced task service and cannot notify users while the app is closed. Settings let users choose response style, reply language, and Enter-to-send behavior. The Knowledge button opens a local library: users must explicitly save answers or add notes with HTTPS source links and confirm that they checked the sources. The default evidence standard requires two independent sources; an alternative allows one authoritative primary source. Entries are labelled source-reviewed by the user, not independently certified, because this static browser app cannot fetch and verify source contents itself. Matching saved notes and source links are added as context to later prompts. LEO does not automatically scrape websites or copy proprietary model outputs, and saving notes does not retrain the underlying model.

## Security

Never add API keys, passwords, access tokens, or private credentials to this public repository. LEO uses the Puter.js browser SDK and does not embed a private model API key.

## Licensing

The repository's existing LICENSE governs AJ project files. Third-party services and models retain their own licenses and terms.

## Install on Android

### Install the PWA (no APK required)

1. Open https://ajaypascua69-hue.github.io/Aj/ in Chrome on Android.
2. Open Chrome's menu and choose **Install app** or **Add to Home screen** (the wording can vary).
3. Confirm the installation. LEO is online-only and requires an internet connection plus an available free provider model.

### Build Android APK and Play Store App Bundle

A GitHub Actions workflow builds an installable **debug APK** and a **release Android App Bundle (`.aab`)** using Capacitor and the Android SDK. It targets Android 16 (API 36), the current Google Play target requirement for new apps and updates as of August 31, 2026. The workflow also runs Android release lint checks. This is a technical build pipeline, not a guarantee of Play approval.



1. Open the repository's **Actions** tab: https://github.com/ajaypascua69-hue/Aj/actions
2. Select **Build LEO AI Android APK**.
3. If the workflow has not started automatically, choose **Run workflow** and run it on `main`.
4. Wait for the build to finish successfully.
5. Open the completed workflow run, find **Artifacts**, and download `leo-ai-android-debug-apk`.
6. Extract the ZIP and install `app-debug.apk` on your Android device. Android may ask you to allow installation from that source.
7. The same run also creates `leo-ai-play-store-aab`, containing `app-release.aab`.

**Signing is required before uploading to Google Play.** Without signing secrets, the AAB artifact is unsigned and is only a build output for inspection. To make a signed upload bundle, create an upload keystore on a trusted computer and add these four repository Actions secrets under **Settings → Secrets and variables → Actions**: `ANDROID_KEYSTORE_BASE64` (the keystore file encoded as Base64), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`. Never commit the keystore or passwords to this public repository. Keep a secure offline backup of the keystore; losing it can complicate app updates. After adding the secrets, rerun the workflow to produce a signed AAB.

This pipeline uses free tools and GitHub Actions within the account's free quota. It does not require paid APIs or a paid build service. Google Play developer registration itself is not free: Google currently charges a one-time US$25 registration fee. You must pay that separately if you decide to publish.

### Let LEO generate an app and build its APK

LEO now has an **APK Builder** task mode. It can design an app, generate the source code, and explain how to package it. The model itself does not compile Android binaries inside the chat. The repository's free GitHub Actions workflow performs the actual Android build:

1. Ask LEO in **APK Builder** mode to create a web-based app suitable for Android packaging. Ask it to provide every file and its path.
2. Add those files to a folder named `generated-app/` in this repository. At minimum, include `generated-app/index.html`; add supporting CSS, JavaScript, images, and other assets as needed.
3. Commit the files to the `main` branch.
4. Open **Actions → Build LEO AI Android APK → Run workflow**.
5. Choose **generated-app** for **Which app should be packaged?**. Enter the app display name and a unique Android package ID, then run the workflow.
6. After a successful run, download the `leo-ai-android-debug-apk` artifact, extract it, and install the APK.

The build creates a debug APK for testing, not a signed Play Store release. GitHub Actions is free only within the account's available quota. This workflow does not use a paid build service. Never put secrets or API keys in generated app files or this public repository.


## Google Play publishing checklist

- [ ] Build and test the release AAB on real devices; the workflow's debug APK is for testing only.
- [ ] Configure the four private upload-signing Actions secrets described above and verify the AAB is signed.
- [ ] Publish and review the privacy policy at https://ajaypascua69-hue.github.io/Aj/privacy-policy.html. The repository includes a starter policy; replace the contact placeholder and verify it matches the actual app and provider practices before submission.
- [ ] Complete the Play Console Data safety form accurately. LEO sends prompts and conversation context to Puter.js AI services and the selected model/provider to generate replies. Review those providers' current privacy terms; do not guess about their retention or sharing practices.
- [ ] Provide accurate app description, category, age/content rating, app icon, phone screenshots, support contact, and any other Play Console listing details.
- [ ] Declare only permissions and data access actually used. Do not add unnecessary permissions.
- [ ] Test the app's behavior, accessibility, privacy disclosures, crashes, and performance. Review all Play policy declarations and warnings.
- [ ] Submit the signed AAB through Play Console and wait for Google's review. Play Protect and Play review outcomes cannot be guaranteed by this build workflow.

Google's current target API requirement: https://support.google.com/googleplay/android-developer/answer/11926878
Google Play developer account registration: https://support.google.com/googleplay/android-developer/answer/6112435
