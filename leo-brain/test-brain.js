const assert = require("node:assert/strict");
const store = new Map();
global.localStorage = {
  getItem: key => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value))
};
global.window = {};
require("./leo-brain/leo-brain.js");
const brain = global.window.LEOBrain;
assert.ok(brain, "brain module should register");
assert.match(brain.handleMemoryCommand("remember that the project is Leo AI"), /Saved/);
assert.match(brain.handleMemoryCommand("what do you remember about project"), /Leo AI/);
assert.match(brain.handleMemoryCommand("show my memories"), /Leo AI/);
const nn = new brain.TinyNeuralNetwork(42);
nn.train([[0,0],[0,1],[1,0],[1,1]],[0,1,1,1],10000,0.5);
for (const [x,y] of [[[0,0],0],[[0,1],1],[[1,0],1],[[1,1],1]]) {
  assert.equal(Math.round(nn.predict(x)), y, "network should learn OR truth table");
}
assert.equal(brain.status().memoryCount, 1);
assert.equal(brain.status().modelConnected, false);
console.log("Leo AI browser brain tests passed.");
