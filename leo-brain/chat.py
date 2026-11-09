"""Interactive terminal demo for Leo AI's independent starter brain."""
import json, random
from leo_brain import TinyMLP, tokenize, ROOT, MODEL_PATH, recall, remember

def main():
    if not MODEL_PATH.exists():
        print("No trained brain found. Run: python train.py")
        return
    model = json.loads(MODEL_PATH.read_text(encoding="utf-8"))
    vocab, tags = model["vocab"], model["tags"]
    net = TinyMLP.from_dict(model["network"])
    index = {word:i for i,word in enumerate(vocab)}
    print("Leo AI Brain v0.1 — type /quit to exit, /teach <fact> to save a fact.")
    while True:
        try: message = input("You: ").strip()
        except (EOFError, KeyboardInterrupt): print("\nLeo: Bye!"); break
        if message.lower() in {"/quit","quit","exit"}: print("Leo: Bye!"); break
        if message.startswith("/teach "):
            print("Leo:", remember(message[7:])); continue
        if message.startswith("/recall"):
            found = recall(message[7:])
            print("Leo:", "\n".join(found) if found else "I don't have a matching saved fact."); continue
        words = set(tokenize(message))
        vector = [1.0 if word in words else 0.0 for word in vocab]
        probs = net.predict(vector)
        best = max(range(len(probs)), key=probs.__getitem__)
        confidence = probs[best]
        if confidence < 0.52:
            facts = recall(message)
            answer = "I don't understand that yet. You can teach me with /teach <fact>."
            if facts: answer += " I found in memory: " + " | ".join(facts)
        else:
            answer = random.choice(model["responses"][tags[best]])
        print(f"Leo: {answer}  [intent confidence: {confidence:.0%}]")

if __name__ == "__main__": main()
