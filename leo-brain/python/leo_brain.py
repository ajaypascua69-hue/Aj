"""Small educational neural network for Leo AI's learning foundation.

This preserves the user's 2-input -> 2-hidden -> 1-output sigmoid network.
It is a machine-learning experiment, not a conversational language model.
Only Python's standard library is required.
"""
from __future__ import annotations
import math
import random
from typing import Iterable, Sequence


def sigmoid(value: float) -> float:
    # Stable form avoids OverflowError for very negative inputs.
    if value >= 0:
        z = math.exp(-min(value, 709))
        return 1.0 / (1.0 + z)
    z = math.exp(max(value, -709))
    return z / (1.0 + z)


def sigmoid_derivative(output: float) -> float:
    return output * (1.0 - output)


class NeuralNetwork:
    """A tiny 2-2-1 feed-forward network trained by backpropagation."""

    def __init__(self, seed: int = 42) -> None:
        rng = random.Random(seed)
        self.weights_input_hidden = [
            [rng.uniform(-1, 1), rng.uniform(-1, 1)],
            [rng.uniform(-1, 1), rng.uniform(-1, 1)],
        ]
        self.bias_hidden = [rng.uniform(-1, 1), rng.uniform(-1, 1)]
        self.weights_hidden_output = [rng.uniform(-1, 1), rng.uniform(-1, 1)]
        self.bias_output = rng.uniform(-1, 1)
        self.hidden_outputs = [0.0, 0.0]
        self.output = 0.0

    def forward(self, inputs: Sequence[float]) -> float:
        if len(inputs) != 2:
            raise ValueError("Expected exactly two inputs.")
        x0, x1 = map(float, inputs)
        if not (math.isfinite(x0) and math.isfinite(x1)):
            raise ValueError("Inputs must be finite numbers.")
        self.hidden_outputs = [
            sigmoid(x0 * self.weights_input_hidden[0][i]
                    + x1 * self.weights_input_hidden[1][i]
                    + self.bias_hidden[i])
            for i in range(2)
        ]
        activation = (self.hidden_outputs[0] * self.weights_hidden_output[0]
                      + self.hidden_outputs[1] * self.weights_hidden_output[1]
                      + self.bias_output)
        self.output = sigmoid(activation)
        return self.output

    def train(self, training_inputs: Iterable[Sequence[float]],
              training_outputs: Iterable[float], epochs: int = 10000,
              learning_rate: float = 0.5) -> "NeuralNetwork":
        xs, ys = list(training_inputs), list(training_outputs)
        if not xs or len(xs) != len(ys):
            raise ValueError("Training inputs and outputs must be non-empty and have equal lengths.")
        if epochs < 1 or learning_rate <= 0:
            raise ValueError("epochs and learning_rate must be positive.")
        for _ in range(epochs):
            for x, target in zip(xs, ys):
                predicted = self.forward(x)
                delta_out = (float(target) - predicted) * sigmoid_derivative(predicted)
                delta_hidden = [
                    delta_out * self.weights_hidden_output[i]
                    * sigmoid_derivative(self.hidden_outputs[i])
                    for i in range(2)
                ]
                for i in range(2):
                    self.weights_hidden_output[i] += learning_rate * delta_out * self.hidden_outputs[i]
                self.bias_output += learning_rate * delta_out
                for i in range(2):
                    self.weights_input_hidden[0][i] += learning_rate * delta_hidden[i] * float(x[0])
                    self.weights_input_hidden[1][i] += learning_rate * delta_hidden[i] * float(x[1])
                    self.bias_hidden[i] += learning_rate * delta_hidden[i]
        return self

    def predict(self, inputs: Sequence[float]) -> int:
        return int(self.forward(inputs) >= 0.5)


def train_or_demo() -> list[tuple[list[int], float, int]]:
    xs = [[0, 0], [0, 1], [1, 0], [1, 1]]
    ys = [0, 1, 1, 1]
    network = NeuralNetwork().train(xs, ys, epochs=10000, learning_rate=0.5)
    return [(x, network.forward(x), network.predict(x)) for x in xs]


if __name__ == "__main__":
    print("Leo AI neural-network foundation — logical OR experiment")
    for inputs, probability, prediction in train_or_demo():
        print(f"Input: {inputs} -> probability: {probability:.4f} (rounded: {prediction})")
