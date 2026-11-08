# CloudBox

CloudBox is a responsive web app/PWA with a small Android WebView wrapper. The website and Android app share the same Supabase Auth, database and private Storage bucket.

## Configure cloud storage (free tier)
1. Create a project at https://supabase.com/.
2. In Storage, create a **private** bucket named `cloudbox-files`.
3. Open SQL Editor and run `supabase-setup.sql`.
4. Copy the Project URL and anon/public key from Project Settings → API.
5. Put them in `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `app.js`.
6. Commit the configuration to the cloudbox branch. Never use a service-role key in frontend code.

## Website
The workflow deploys `cloudbox/` to GitHub Pages after it is merged/pushed to main and Pages is enabled for GitHub Actions. The website can also be installed from a supported browser as a PWA. Set the Supabase Auth site URL and redirect URLs to your GitHub Pages URL.

## Android APK
The GitHub Actions workflow copies the web app into the Android assets and builds a debug APK. The APK can be downloaded from the workflow's Artifacts section. It needs the same Supabase configuration to sign in and sync files.

## Current MVP features
Email/password sign-up and sign-in, private uploads, file listing/search/type filters, signed-link downloads and deletion. Folder management, sharing links, quotas and Play Store signing are not yet implemented. Demo mode without Supabase is intentionally not presented as real cloud storage.
