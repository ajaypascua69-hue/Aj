# Leo AI Brain — Independent Core (v0.1)

This folder starts Leo AI's independently authored AI core. It does **not** load Gemma, Gemini, ChatGPT, or any pretrained model.

## What v0.1 does
- A small feed-forward neural network implemented from scratch in Python's standard library.
- Trainable intent classification using examples in `data/intents.json`.
- A local memory store for facts the user explicitly teaches Leo.
- A transparent response layer that labels unknown requests instead of pretending to understand them.

## What it does not do yet
This is not a general-purpose language model and does not yet write arbitrary code, understand images, or reason like Gemini. Those abilities require much larger datasets, model architectures, training and evaluation.

## Run
```bash
python train.py
python chat.py
```

Python 3.10+ recommended. No external packages or paid APIs are required.

## Training
Edit `data/intents.json` with examples you own or are allowed to use, then run `python train.py`. Training updates `data/model.json`. Keep a separate test set and evaluate before treating a new model as better.

## Roadmap
1. Intent classifier + teachable memory (this starter).
2. Better tokenizer, subword vocabulary, and language-model experiments.
3. Larger training pipeline using permitted datasets and free/low-cost compute.
4. Android integration after profiling memory and speed on target devices.
5. Safety, privacy, evaluation, and Play Store release checks.

The architecture and code in this folder are original project code. Any future datasets or third-party assets must have their licenses recorded separately.
