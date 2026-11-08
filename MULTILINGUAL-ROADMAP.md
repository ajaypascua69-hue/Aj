# LEO multilingual conversation roadmap

This document describes a permission-aware route from the current phrasebook/browser-speech prototype to real multilingual conversation. It does not claim that model runtimes or neural models are already installed.

## Target experience

- Free-form conversation, not fixed textbook lessons
- Spoken input and spoken replies
- Language and code-switch detection (for example, Filipino-English)
- Understanding of informal speech, idioms, regional vocabulary, and accents
- Conversation context across multiple turns
- Pronunciation practice with reference audio and measurable feedback
- Online and offline operation, with a clear indicator of which engine is active
- No paid API dependency and no unauthorized reuse of proprietary model outputs or weights

## What the current app does

- Browser speech recognition where the browser exposes it; support and network behavior vary by browser/device.
- Browser/device speech synthesis using installed voices.
- A small language detector based on writing scripts and common words. It is a best-effort hint, not robust speech-language identification and not accent recognition.
- Existing phrasebook lessons and deterministic local workflows.

The current standalone rules engine is not a conversational language model. It cannot yet understand arbitrary natural-language questions or generate genuinely fluent, context-aware replies. The phrasebook must not be presented as proof of fluency.

## Candidate components (license must be checked per exact version and model)

| Layer | Candidate | License / scope | Important limitation |
|---|---|---|---|
| Offline speech recognition and speech tools on Android | [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) | Apache-2.0 toolkit; runs locally on Android. Each downloaded model/voice still has its own license. | Needs native Android integration and a compatible downloaded model. It is not wired into this PWA yet. |
| Offline multilingual conversation model | [Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B) | Apache-2.0 model card; model family reports support for 100+ languages. | Model is large for many phones; quantization, memory, speed, and Filipino/Cebuano quality need device testing. No model file is bundled. |
| On-device neural speech synthesis | [Kokoro-82M via Google AI Edge](https://developers.google.com/edge/mediapipe/solutions/audio/text_to_speech/index) | Google AI Edge documentation lists Apache-2.0 bundle, about 295 MB, for nine locales across eight languages. | Does not cover every language LEO targets; separate model download and runtime integration required. |
| Speech data for future evaluation/training | [Mozilla Common Voice](https://mozilladatacollective.com/datasets) | Individual listed datasets such as Scripted Speech 27.0 are CC0-1.0. | Dataset is not a ready-to-run recognizer. Check the exact dataset release and metadata before use. |

## Safe implementation sequence

1. Keep the current browser speech fallback, but label its network/offline behavior honestly.
2. Add a native Android speech adapter based on sherpa-onnx; select a model only after checking that model's license, language coverage, and device requirements.
3. Add an optional on-device conversation model. Start with a quantized small model only after measuring available RAM/storage and response speed on the target phone. The app must continue to work without downloading it.
4. Add an optional neural TTS engine for supported languages, with the system voice as fallback.
5. Build evaluation sets for everyday speech, code-switching, slang, idioms, accents, and pronunciation. Do not treat scripted phrase datasets as proof of real-world conversational quality.
6. Display the active mode: browser/online, downloaded/offline, or local deterministic fallback. Never imply that offline listening works unless an offline recognizer is actually installed and running.

## Free does not mean zero resource cost

The source code and model licenses may permit free use, but model downloads consume storage and mobile inference consumes RAM, battery, and CPU/NPU. Free public inference endpoints are not a dependable offline solution and may have quotas. LEO should not silently call paid services or upload voice recordings.

## Privacy defaults

- Process voice locally whenever a compatible on-device engine is installed.
- Ask for microphone permission only when the user activates voice input.
- Do not upload or retain recordings by default.
- Do not train on third-party provider outputs unless the exact provider terms expressly allow that intended use.
- Keep the emergency shutdown able to stop active microphone and speech sessions.
