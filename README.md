# AJ / LEO AI

AJ now hosts **LEO AI**, a free-first, multilingual AI assistant.

**Live website:** https://ajaypascua69-hue.github.io/Aj/

## LEO AI features

- Responsive chat interface for desktop and Android browsers
- Multilingual conversations through supported AI models
- Dynamic model selector that prioritizes provider models marked `:free`
- Image and document attachments when supported by the chosen model
- Browser speech input where supported
- Optional spoken replies using browser speech synthesis
- Installable progressive web app interface and offline app-shell caching
- No private API keys stored in this public repository

## Free access and AI usage

The website source and GitHub Pages hosting can be free. LEO AI connects to hosted models through [Puter.js](https://docs.puter.com/), so the repository owner does not need to run a paid AI server or publish a secret API key.

LEO prioritizes model variants marked `:free` in the provider catalogue. Free models may have quotas, rate limits, temporary availability, and provider-specific conditions. The Puter user-pays model may ask each user to sign in; usage beyond any free allowance or use of paid models may cost that user money. Unlimited free AI usage for all visitors is not guaranteed.

Read the current [Puter AI documentation](https://docs.puter.com/AI/) and [model catalogue](https://developer.puter.com/ai/) before relying on a specific model.

## Run locally

Serve this folder from a local web server rather than opening the HTML file directly:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Project files

- `index.html` — LEO AI interface
- `style.css` — responsive styling
- `app.js` — chat, free model discovery, file attachments and voice tools
- `manifest.webmanifest` — installable app metadata
- `service-worker.js` — offline app-shell cache
- `icon.svg` — app icon

## Use AJ and publish your own work

You may download, install, and use an unmodified copy of AJ. You may also use AJ to learn about tools and create your own independent projects.

**You are allowed to publish, share, distribute, display, and sell your own work created using AJ.** You retain ownership of the original work you create, subject to third-party licenses and terms that apply to any tools, code, models, or materials you use.

This permission does not allow you to modify, rebrand, resell, or redistribute AJ itself or claim AJ as your own. See [LICENSE](LICENSE) for the complete terms.

This repository is public so that the project can be viewed and downloaded. Public visibility does not make AJ open source or grant permission to modify or redistribute AJ.

## Security

Never add API keys, passwords, access tokens, or private credentials to this public repository. LEO AI uses the Puter.js browser SDK and does not embed a private model API key.