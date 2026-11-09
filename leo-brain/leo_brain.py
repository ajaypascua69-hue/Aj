"""Leo AI's tiny independently implemented neural core (standard library only)."""
from __future__ import annotations
import json, math, random, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "data" / "model.json"
MEMORY_PATH = ROOT / "data" / "memory.json"

def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9']+", text.lower())

def softmax(values):
    peak = max(values)
    exps = [math.exp(v - peak) for v in values]
    total = sum(exps) or 1.0
    return [v / total for v in exps]

class TinyMLP:
    """One-hidden-layer classifier trained with backpropagation and SGD."""
    def __init__(self, input_size, hidden_size, output_size, seed=17):
        rng = random.Random(seed)
        self.w1 = [[rng.uniform(-0.15, 0.15) for _ in range(input_size)] for _ in range(hidden_size)]
        self.b1 = [0.0] * hidden_size
        self.w2 = [[rng.uniform(-0.15, 0.15) for _ in range(hidden_size)] for _ in range(output_size)]
        self.b2 = [0.0] * output_size

    @staticmethod
    def sigmoid(x):
        x = max(-30.0, min(30.0, x))
        return 1.0 / (1.0 + math.exp(-x))

    def forward(self, x):
        hidden = [self.sigmoid(sum(w * v for w, v in zip(row, x)) + b)
                  for row, b in zip(self.w1, self.b1)]
        probs = softmax([sum(w * h for w, h in zip(row, hidden)) + b
                         for row, b in zip(self.w2, self.b2)])
        return hidden, probs

    def train_one(self, x, target, lr=0.12):
        hidden, probs = self.forward(x)
        output_delta = [p - (1.0 if i == target else 0.0) for i, p in enumerate(probs)]
        old_w2 = [row[:] for row in self.w2]
        hidden_delta = []
        for j, h in enumerate(hidden):
            back = sum(old_w2[i][j] * output_delta[i] for i in range(len(output_delta)))
            hidden_delta.append(back * h * (1.0 - h))
        for i, row in enumerate(self.w2):
            for j in range(len(row)):
                row[j] -= lr * output_delta[i] * hidden[j]
            self.b2[i] -= lr * output_delta[i]
        for j, row in enumerate(self.w1):
            for k in range(len(row)):
                row[k] -= lr * hidden_delta[j] * x[k]
            self.b1[j] -= lr * hidden_delta[j]
        return probs

    def predict(self, x):
        return softmax(self.forward(x)[1])

    def to_dict(self):
        return {"w1":self.w1,"b1":self.b1,"w2":self.w2,"b2":self.b2}

    @classmethod
    def from_dict(cls, data):
        obj = cls(len(data["w1"][0]), len(data["w1"]), len(data["w2"]))
        obj.w1, obj.b1 = data["w1"], data["b1"]
        obj.w2, obj.b2 = data["w2"], data["b2"]
        return obj

def load_memory():
    if MEMORY_PATH.exists():
        try: return json.loads(MEMORY_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError): pass
    return []

def remember(fact: str):
    fact = fact.strip()
    if not fact: return "Please provide something for me to remember."
    items = load_memory()
    items.append({"fact": fact})
    MEMORY_PATH.parent.mkdir(parents=True, exist_ok=True)
    MEMORY_PATH.write_text(json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8")
    return "I'll keep that in Leo's local memory."

def recall(query: str):
    words = set(tokenize(query))
    ranked = []
    for item in load_memory():
        fact = item.get("fact", "")
        score = len(words & set(tokenize(fact)))
        if score: ranked.append((score, fact))
    ranked.sort(reverse=True)
    return [fact for _, fact in ranked[:3]]
