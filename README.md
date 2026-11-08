# AJ / LEO AI

AJ hosts **LEO AI**, a free-first, multilingual AI assistant.

**Live website:** https://ajaypascua69-hue.github.io/Aj/

## Features

- Responsive AI chat interface for desktop and Android browsers
- Multilingual conversations using a choice of supported AI models
- Live model catalogue from Puter.js, with free variants listed first and paid/standard models labelled separately
- Image understanding: attach an image in chat and ask LEO to describe it, read visible text, explain objects/icons, or analyze a diagram
- AI Image Studio: generate an image from a text prompt or use a reference image for image-to-image generation
- Image model choices include FLUX.1 Schnell, GPT Image and Gemini image options, subject to provider availability
- Browser speech input where supported
- Optional spoken replies using browser speech synthesis
- Installable progressive web app shell and offline caching for the app interface
- No private API keys stored in this public repository

## Free use and AI costs

The website source and GitHub Pages hosting can be free. LEO connects to hosted models through https://docs.puter.com/AI/, so the repository owner does not need to operate an AI server or publish a secret API key.

Chat model variants labelled :free are listed first. Providers can impose rate limits and daily quotas and can remove free variants. Other chat models are shown separately and may cost money.

**Image generation is not guaranteed free.** The selected FLUX.1 Schnell route is listed by Puter at about US$0.0027 per image at the time this feature was implemented. Other image models may cost more. The image generator displays a confirmation before sending a request. Provider prices and availability can change.

Puter's user-pays model may require visitors to sign in and may charge the visitor for usage. This means the app can be hosted without a paid server, but unlimited free AI for every visitor cannot be promised.

Check current Puter AI documentation at https://docs.puter.com/AI/, the model catalogue at https://developer.puter.com/ai/models/, image generation documentation at https://docs.puter.com/AI/txt2img/, and FLUX.1 Schnell pricing at https://developer.puter.com/ai/black-forest-labs/flux-schnell/ before relying on a specific model or price.

## Run locally

Serve this folder from a local web server rather than opening the HTML file directly:

    python -m http.server 8000

Then open http://localhost:8000.

## Project files

- index.html — LEO AI interface and image studio
- style.css — responsive styling
- app.js — chat, model discovery, image understanding, image generation and voice tools
- manifest.webmanifest — installable app metadata
- service-worker.js — offline app-shell cache
- icon.svg — app icon

## Security

Never add API keys, passwords, access tokens, or private credentials to this public repository. LEO uses the Puter.js browser SDK and does not embed a private model API key.

## Project permissions

The repository's existing LICENSE governs use of AJ project files. Third-party services, models, and model weights retain their own licenses and terms. Public visibility alone does not grant permission to modify or redistribute AJ.