"""Train Leo's small neural classifier from data/intents.json."""
import json, random
from pathlib import Path
from leo_brain import TinyMLP, tokenize, ROOT, MODEL_PATH

DATA = ROOT / "data" / "intents.json"

def main():
    dataset = json.loads(DATA.read_text(encoding="utf-8"))
    intents = dataset["intents"]
    vocab = sorted({word for item in intents for phrase in item["patterns"] for word in tokenize(phrase)})
    tags = [item["tag"] for item in intents]
    word_index = {word:i for i,word in enumerate(vocab)}
    tag_index = {tag:i for i,tag in enumerate(tags)}
    samples = []
    for item in intents:
        for phrase in item["patterns"]:
            vector = [0.0] * len(vocab)
            for word in set(tokenize(phrase)):
                if word in word_index: vector[word_index[word]] = 1.0
            samples.append((vector, tag_index[item["tag"]]))
    random.Random(23).shuffle(samples)
    net = TinyMLP(len(vocab), max(12, min(48, len(vocab) * 2)), len(tags))
    for epoch in range(900):
        random.shuffle(samples)
        for vector, target in samples: net.train_one(vector, target, lr=0.10)
    model = {"vocab":vocab,"tags":tags,"network":net.to_dict(),"responses":{x["tag"]:x["responses"] for x in intents}}
    MODEL_PATH.write_text(json.dumps(model, indent=2), encoding="utf-8")
    print(f"Trained Leo Brain: {len(samples)} examples, {len(vocab)} words, {len(tags)} intents.")
    print(f"Saved: {MODEL_PATH}")

if __name__ == "__main__": main()
