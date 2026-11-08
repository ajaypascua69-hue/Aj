# Generated Android app source

Ask LEO AI to create your app in **APK Builder** mode. Put the complete web app source files in this folder.

Required:
- index.html

Optional supporting files:
- app.js
- style.css
- images, fonts, and other assets referenced by your HTML

Then commit this folder to the main branch. Open GitHub Actions, select **Build LEO AI Android APK**, run the workflow, and choose **generated-app**. The workflow packages these files with Capacitor and uploads a debug APK artifact.

Do not put passwords, API keys, or other secrets in this public repository. The build is free within your GitHub Actions quota. The model generates source code; GitHub Actions compiles the APK.
