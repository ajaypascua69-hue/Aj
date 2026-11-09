/* Leo AI Brain foundation.
 * Runs in the browser/Capacitor WebView. Memories are explicit and device-local.
 * This is not a generative language model. A model adapter can be registered later.
 */
(() => {
  "use strict";
  const MEMORY_KEY = "leo-brain-memories-v1";
  const MAX_MEMORIES = 500;
  const safeRead = () => {
    try {
      const value = JSON.parse(localStorage.getItem(MEMORY_KEY) || "[]");
      return Array.isArray(value) ? value.filter(x => x && typeof x.text === "string") : [];
    } catch { return []; }
  };
  const safeWrite = items => {
    try { localStorage.setItem(MEMORY_KEY, JSON.stringify(items.slice(0, MAX_MEMORIES))); return true; }
    catch { return false; }
  };
  const words = value => String(value || "").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  const unique = values => [...new Set(values)];
  function remember(text, tags = []) {
    const clean = String(text || "").trim().slice(0, 4000);
    if (!clean) return { ok: false, message: "There is nothing to remember." };
    const items = safeRead();
    const duplicate = items.find(x => x.text.toLowerCase() === clean.toLowerCase());
    if (duplicate) return { ok: true, duplicate: true, memory: duplicate };
    const memory = { id: (globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2)), text: clean,
      tags: unique((Array.isArray(tags) ? tags : []).map(x => String(x).trim().toLowerCase()).filter(Boolean)).slice(0, 12),
      createdAt: new Date().toISOString() };
    items.unshift(memory);
    if (!safeWrite(items)) return { ok: false, message: "Device storage is full or unavailable. No memory was saved." };
    return { ok: true, memory };
  }
  function search(query, limit = 8) {
    const q = String(query || "").trim();
    const terms = unique(words(q));
    const items = safeRead();
    if (!terms.length) return items.slice(0, limit);
    return items.map(item => {
      const haystack = words(item.text + " " + (item.tags || []).join(" "));
      const score = terms.reduce((n, term) => n + (haystack.includes(term) ? 1 : 0), 0);
      return { item, score };
    }).filter(x => x.score > 0).sort((a,b) => b.score-a.score || b.item.createdAt.localeCompare(a.item.createdAt)).slice(0,limit).map(x=>x.item);
  }
  function handleMemoryCommand(message) {
    const q = String(message || "").trim();
    let match = q.match(/^(?:remember(?: that)?|save to memory)\s*[:,-]?\s*(.+)$/i);
    if (match) {
      const result = remember(match[1]);
      return result.ok ? (result.duplicate ? "I already have that in my device-local memory." : "Saved to Leo AI's device-local memory. You can ask me to recall it later.") : result.message;
    }
    if (/^(?:show|list) (?:my )?memories$|^what do you remember\??$/i.test(q)) {
      const items = search("", 20);
      return items.length ? "Your saved memories (stored only on this device):\n" + items.map((x,i)=>(i+1)+". "+x.text).join("\n") : "You have no saved memories yet. Try: remember that my preferred app name is Leo AI.";
    }
    match = q.match(/^(?:what do you remember about|recall|find in memory)\s+(.+?)\??$/i);
    if (match) {
      const found = search(match[1], 8);
      return found.length ? "I found these device-local memories:\n" + found.map((x,i)=>(i+1)+". "+x.text).join("\n") : "I couldn't find a saved memory matching that topic.";
    }
    return null;
  }

  // Small trainable neural-network experiment based on the user's 2-2-1 OR example.
  const sigmoid = x => x < -40 ? 0 : x > 40 ? 1 : 1 / (1 + Math.exp(-x));
  const derivative = y => y * (1-y);
  class TinyNeuralNetwork {
    constructor(seed = 42) {
      let state = seed >>> 0;
      const random = () => { state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296 * 2 - 1; };
      this.wih = [[random(),random()],[random(),random()]];
      this.bh = [random(),random()];
      this.who = [random(),random()];
      this.bo = random();
    }
    forward(input) {
      if (!Array.isArray(input) || input.length !== 2) throw new TypeError("Expected exactly two numeric inputs.");
      const x = input.map(Number);
      if (!x.every(Number.isFinite)) throw new TypeError("Inputs must be finite numbers.");
      this.hidden = [0,1].map(i => sigmoid(x[0]*this.wih[0][i] + x[1]*this.wih[1][i] + this.bh[i]));
      this.output = sigmoid(this.hidden[0]*this.who[0] + this.hidden[1]*this.who[1] + this.bo);
      return this.output;
    }
    train(xs, ys, epochs = 10000, rate = 0.5) {
      if (!Array.isArray(xs) || !Array.isArray(ys) || xs.length !== ys.length || !xs.length) throw new TypeError("Training inputs and outputs must be non-empty arrays of equal length.");
      if (!Number.isInteger(epochs) || epochs < 1 || !Number.isFinite(rate) || rate <= 0) throw new TypeError("Invalid training settings.");
      for (let epoch=0; epoch<epochs; epoch++) for (let n=0; n<xs.length; n++) {
        const x=xs[n].map(Number), y=Number(ys[n]), predicted=this.forward(x), delta=(y-predicted)*derivative(predicted);
        const hiddenDelta=this.hidden.map((h,i)=>delta*this.who[i]*derivative(h));
        for(let i=0;i<2;i++) this.who[i]+=rate*delta*this.hidden[i];
        this.bo+=rate*delta;
        for(let i=0;i<2;i++){this.wih[0][i]+=rate*hiddenDelta[i]*x[0];this.wih[1][i]+=rate*hiddenDelta[i]*x[1];this.bh[i]+=rate*hiddenDelta[i];}
      }
      return this;
    }
    predict(input) { return this.forward(input); }
  }

  let modelAdapter = null;
  function registerModelAdapter(adapter) {
    if (!adapter || typeof adapter.generate !== "function") throw new TypeError("A model adapter must provide generate(prompt, options).");
    modelAdapter = adapter;
  }
  async function generate(prompt, options = {}) {
    if (!modelAdapter) return { available: false, text: null, reason: "No language model is installed or connected. The local brain foundation does not generate open-ended language." };
    return { available: true, text: await modelAdapter.generate(String(prompt || ""), options) };
  }
  window.LEOBrain = { remember, search, handleMemoryCommand, TinyNeuralNetwork, registerModelAdapter, generate,
    status: () => ({ memoryCount: safeRead().length, modelConnected: !!modelAdapter, runtime: "device-local" }) };
})();