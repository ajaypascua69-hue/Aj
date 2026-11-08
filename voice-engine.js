/* LEO multilingual voice helpers.
 * Browser speech APIs are fallbacks, not guaranteed offline engines.
 * A future native Android bridge can register an offline sherpa-onnx adapter.
 */
(() => {
  const profiles = {
    English:{code:"en-US",words:["the","and","you","what","how","hello","thanks","please","because"]},
    Filipino:{code:"fil-PH",words:["ang","ng","mga","ako","ikaw","salamat","kamusta","hindi","opo","po","kasi"]},
    Cebuano:{code:"ceb-PH",words:["unsa","ako","ikaw","salamat","maayo","kumusta","dili","amping","kani","nimo"]},
    Spanish:{code:"es-ES",words:["hola","gracias","que","como","por","para","estoy","quiero","buenos","porque"]},
    French:{code:"fr-FR",words:["bonjour","merci","vous","avec","pour","comment","suis","est","une","parce"]},
    German:{code:"de-DE",words:["hallo","danke","und","ich","nicht","bitte","wie","ist","das","weil"]},
    Japanese:{code:"ja-JP",words:["です","ます","こんにちは","ありがとう","私","今日","何","日本語"]},
    Mandarin:{code:"zh-CN",words:["你好","谢谢","我们","什么","今天","可以","中文","不是"]},
    Korean:{code:"ko-KR",words:["안녕하세요","감사합니다","저는","한국어","오늘","무엇","입니다"]},
    Portuguese:{code:"pt-BR",words:["olá","obrigado","você","para","com","estou","porque","como"]},
    Hindi:{code:"hi-IN",words:["नमस्ते","धन्यवाद","मैं","आप","है","क्या"]},
    Arabic:{code:"ar-SA",words:["مرحبا","شكرا","أنا","كيف","هذا","العربية"]},
    Indonesian:{code:"id-ID",words:["halo","terima kasih","saya","kamu","yang","tidak","bagaimana"]}
  };
  const scripts = [
    ["Japanese",/[ぁ-ゟ゠-ヿ]/],
    ["Mandarin",/[\u3400-\u4dbf\u4e00-\u9fff]/],
    ["Korean",/[\uac00-\ud7af]/],
    ["Arabic",/[\u0600-\u06ff]/],
    ["Hindi",/[\u0900-\u097f]/]
  ];
  function detect(text, fallback="English") {
    const value=String(text||"").toLowerCase();
    for(const [name,re] of scripts) if(re.test(value)) return {language:name,locale:profiles[name].code,confidence:"high",method:"script"};
    const tokens=value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").match(/[a-zñáéíóúü]+/g)||[];
    let best={language:fallback,score:0};
    for(const [name,p] of Object.entries(profiles)){
      if(["Japanese","Mandarin","Korean","Arabic","Hindi"].includes(name)) continue;
      const words=p.words.map(w=>w.normalize("NFD").replace(/[\u0300-\u036f]/g,""));
      const score=tokens.reduce((n,t)=>n+(words.includes(t)?1:0),0);
      if(score>best.score) best={language:name,score};
    }
    const language=best.score>=2?best.language:fallback;
    return {language,locale:profiles[language]?.code||"en-US",confidence:best.score>=3?"medium":best.score>=2?"low":"fallback",method:"lexical"};
  }
  function locale(language) { return profiles[language]?.code || language || navigator.language || "en-US"; }
  function speak(text,language) {
    if(!("speechSynthesis" in window)) return false;
    const utterance=new SpeechSynthesisUtterance(String(text||""));
    utterance.lang=locale(language);
    const voices=speechSynthesis.getVoices();
    const prefix=utterance.lang.toLowerCase().split("-")[0];
    const voice=voices.find(v=>v.lang.toLowerCase()===utterance.lang.toLowerCase())||voices.find(v=>v.lang.toLowerCase().startsWith(prefix+"-"));
    if(voice) utterance.voice=voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    return true;
  }
  function recognitionConstructor(){ return window.SpeechRecognition||window.webkitSpeechRecognition||null; }
  window.LEOVoice = {
    profiles, detect, locale, speak, recognitionConstructor,
    capability() {
      return {
        recognition:!!recognitionConstructor(),
        synthesis:"speechSynthesis" in window,
        offlineRecognition:"native-offline-adapter-required",
        offlineSpeech:"depends-on-installed-device-voice"
      };
    },
    // Native Android integrations may register a fully local sherpa-onnx recognizer here.
    offlineRecognizer:null,
    registerOfflineRecognizer(adapter) {
      if(!adapter || typeof adapter.start!=="function") throw new TypeError("Offline recognizer must provide start()");
      this.offlineRecognizer=adapter;
    }
  };
})();
