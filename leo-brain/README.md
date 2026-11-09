# Leo AI Brain — Foundation 1

This folder adds a small, transparent foundation to the existing Leo AI app.

## Included now

- `leo-brain.js`: device-local, user-controlled memory; keyword retrieval; a browser-side copy of the tiny 2-2-1 neural-network experiment; and a safe adapter interface for a future local language model.
- `python/leo_brain.py`: the user's sigmoid/backpropagation network, with stable sigmoid math, input validation, deterministic initialization, and a runnable OR-learning demonstration.
- `python/test_leo_brain.py`: standard-library unit tests.

## Use in the app

The browser app loads `leo-brain.js` before `app.js`. Try:

- `remember that my project is called Leo AI`
- `show my memories`
- `what do you remember about my project`

Memories are saved only in this browser/app's local storage. They are not uploaded or synced. This is explicit memory, not automatic learning from every conversation.

## Run the Python experiment

From the repository root:

```sh
python -m unittest discover -s leo-brain/python -v
python leo-brain/python/leo_brain.py
```

No third-party Python package is required.

## Honest capability boundary

The 2-2-1 network learns a four-row Boolean truth table. It does not understand language or generate conversation. The memory retrieval is local keyword matching, not semantic vector search. The adapter interface is intentionally empty until a properly licensed open-weight model and compatible Android runtime are selected and tested on the target phone.

No model weights, paid API, remote inference endpoint, or external provider are included in this milestone. An open-weight model is a separate, optional next stage: verify its exact license, device RAM/storage requirements, runtime compatibility, and download size before bundling it. A phone can be used to manage the repository and test the app, but model training at foundation-model scale is not practical on a typical phone.
