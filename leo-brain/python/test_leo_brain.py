import unittest
from leo_brain import NeuralNetwork, sigmoid, train_or_demo


class NeuralNetworkTests(unittest.TestCase):
    def test_sigmoid_is_stable(self):
        self.assertAlmostEqual(sigmoid(0), 0.5)
        self.assertEqual(sigmoid(-1000), 0.0)
        self.assertEqual(sigmoid(1000), 1.0)

    def test_learns_or_truth_table(self):
        for inputs, probability, prediction in train_or_demo():
            expected = int(any(inputs))
            self.assertEqual(prediction, expected, msg=f"{inputs}: {probability}")

    def test_rejects_wrong_input_size(self):
        with self.assertRaises(ValueError):
            NeuralNetwork().forward([1])

    def test_seed_is_reproducible(self):
        a, b = NeuralNetwork(), NeuralNetwork()
        self.assertEqual(a.weights_input_hidden, b.weights_input_hidden)


if __name__ == "__main__":
    unittest.main()
