# AJ / LEO AI

AJ hosts **LEO AI**, a standalone browser-based assistant engine. Chat processing uses built-in deterministic rules and local retrieval; it does not call ChatGPT, Gemini, Argon, Puter, or another external AI model/API.

**Website:** https://ajaypascua69-hue.github.io/Aj/

## Independent features

- Standalone local rule engine; user prompts are processed in the browser and are not sent to an AI model provider
- Device-local task list with add, complete, delete, and task-list commands
- User-controlled local knowledge library with source URLs and review labels
- Retrieval of matching notes and downloaded official-source feed metadata
- Structured built-in workflows for coding, app planning, study planning, and writing
- Browser speech input and speech synthesis where supported
- Conversation export, response-style settings, and emergency shutdown switch
- No paid AI API and no external AI model dependency

## Important capability limits

This is an independent assistant *application*, not a newly trained foundation model. It does not yet provide Gemini-level open-ended reasoning, general-purpose code generation, fluent machine translation, live web browsing, independent fact verification, image/audio/video understanding, or autonomous background work. Its responses are deterministic templates, local task actions, and retrieval from saved material. It must not pretend to verify facts or perform actions it cannot perform.

The automatic knowledge feed is a separate GitHub Actions job that periodically downloads short metadata from allowlisted official NASA, NOAA, CISA, WHO, and NSF RSS/Atom feeds. It is not an AI model, and matching headlines are discovery signals rather than proof. Opening and checking source pages still requires the user and an internet connection. GitHub Actions usage is subject to the applicable free-tier quota and availability.

## Privacy and operation

Chat prompts are processed locally by this browser app. The app does not send chat prompts to an AI inference provider. User tasks and saved notes use browser local storage on this device and do not automatically sync across devices. The automatic feed fetch contacts the configured official RSS/Atom sources. Browser speech features may use browser/device services depending on the browser implementation.

## Run locally

Serve this folder with a local web server, for example:

    python -m http.server 8000

Then open http://localhost:8000.

## Project files

- `index.html` — LEO interface
- `style.css` — responsive styling
- `app.js` — standalone local rule engine, task tools, and knowledge retrieval
- `knowledge/sources.json` — official-feed allowlist
- `knowledge/auto-feed.json` — generated public-source feed index
- `scripts/update_knowledge.py` — dependency-free RSS/Atom metadata collector
- `.github/workflows/refresh-knowledge.yml` — scheduled and manual feed refresh
- `manifest.webmanifest` — installable app metadata
- `icon.svg` — app icon


## Permission-aware knowledge reuse

LEO's knowledge library stores material for local retrieval; it does **not** train or modify model weights. Before saving any provider documentation, model output, dataset, or other third-party material, the user must check the exact provider terms and applicable license for the intended storage and reuse. Access to a model or permission to view its output does not automatically grant permission to use that output as training data or to build a competing model. Do not import material when permission is unclear. Record the source URL and use only material whose terms allow the specific use. This UI confirmation records the user's attestation; it is not an independent legal verification by LEO.

LEO runs without external AI inference providers. This separation means provider resources, when expressly permitted, are used only as locally stored reference material—not as live model calls. No training pipeline or weight-update mechanism is included.
