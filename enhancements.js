/* LEO enhancement pack: deterministic, local-only tools. No remote AI calls. */
(() => {
  'use strict';
  const clean = value => String(value || '').trim();
  const round = n => Number.isFinite(n) ? Number(n.toPrecision(12)) : n;

  function calculate(expression) {
    const source = expression.replace(/,/g, '').replace(/\b(sqrt|abs|round)\s*\(/gi, (_, fn) => fn.toLowerCase() + '(');
    const tokens = source.match(/\d+(?:\.\d+)?|(?:sqrt|abs|round)|[()+\-*/%^]/gi);
    if (!tokens || tokens.join('') !== source.replace(/\s+/g, '')) throw new Error('Invalid expression');
    let i = 0;
    const peek = () => tokens[i];
    const take = () => tokens[i++];
    function primary() {
      const t = take();
      if (t === '+') return primary();
      if (t === '-') return -primary();
      if (t === '(') { const v = addSub(); if (take() !== ')') throw new Error('Missing )'); return v; }
      if (/^(sqrt|abs|round)$/i.test(t || '')) {
        if (take() !== '(') throw new Error('Expected (');
        const v = addSub(); if (take() !== ')') throw new Error('Missing )');
        if (t === 'sqrt') return Math.sqrt(v);
        if (t === 'abs') return Math.abs(v);
        return Math.round(v);
      }
      const n = Number(t); if (!Number.isFinite(n)) throw new Error('Expected a number'); return n;
    }
    function power() { let v = primary(); if (peek() === '^') { take(); v = Math.pow(v, power()); } return v; }
    function mulDiv() { let v = power(); while (['*','/','%'].includes(peek())) { const op=take(), r=power(); if ((op==='/' || op==='%') && r===0) throw new Error('Cannot divide by zero'); v=op==='*'?v*r:op==='/'?v/r:v%r; } return v; }
    function addSub() { let v=mulDiv(); while (peek()==='+' || peek()==='-') { const op=take(),r=mulDiv(); v=op==='+'?v+r:v-r; } return v; }
    const result=addSub(); if (i!==tokens.length || !Number.isFinite(result)) throw new Error('Invalid calculation'); return round(result);
  }

  const units = {
    mm:['length',0.001], cm:['length',0.01], m:['length',1], km:['length',1000], in:['length',0.0254], ft:['length',0.3048], mi:['length',1609.344],
    mg:['mass',0.001], g:['mass',1], kg:['mass',1000], lb:['mass',453.59237], oz:['mass',28.349523125],
    ml:['volume',1], l:['volume',1000], tsp:['volume',4.92892159375], tbsp:['volume',14.78676478125], cup:['volume',236.5882365],
    sec:['time',1], s:['time',1], min:['time',60], hr:['time',3600], h:['time',3600], day:['time',86400]
  };
  function conversion(q) {
    const m=q.match(/(?:convert\s+)?(-?\d+(?:\.\d+)?)\s*([a-z]+)\s+(?:to|in)\s+([a-z]+)/i);
    if (!m) return null;
    const value=Number(m[1]), from=m[2].toLowerCase(), to=m[3].toLowerCase();
    if (from==='c' && to==='f') return round(value*9/5+32)+' °F';
    if (from==='f' && to==='c') return round((value-32)*5/9)+' °C';
    if (from==='c' && to==='k') return round(value+273.15)+' K';
    if (from==='k' && to==='c') return round(value-273.15)+' °C';
    if (!units[from] || !units[to] || units[from][0]!==units[to][0]) return 'I do not recognize that compatible unit pair yet.';
    return round(value*units[from][1]/units[to][1])+' '+to;
  }
  function route(q, mode) {
    const s=q.toLowerCase();
    if (/\b(code|coding|debug|program|javascript|python|android|apk|website|app development)\b/.test(s) || ['coding','appdev','apk'].includes(mode)) return 'coding and development';
    if (/\b(research|source|evidence|latest|verify|fact check)\b/.test(s)) return 'research and source review';
    if (/\b(write|draft|rewrite|email|essay|story|proofread)\b/.test(s) || mode==='writing') return 'writing';
    if (/\b(learn|teach|study|explain|quiz|practice)\b/.test(s) || mode==='learning') return 'learning';
    if (/\b(plan|schedule|organize|prioritize|steps|checklist)\b/.test(s)) return 'planning';
    if (/\b(calculate|calculator|what is [\d(]|solve|\d+\s*[+*/^%-]\s*\d+)\b/.test(s)) return 'mathematics';
    if (/\b(translate|translation)\b/.test(s) || mode==='translation') return 'translation';
    return 'general assistant';
  }
  function answer(query, context) {
    const q=clean(query), mode=context.taskMode || 'auto', lower=q.toLowerCase();
    const routeName=route(q,mode);
    const math=q.match(/^(?:calculate|what is|solve)\s+(.+?)\??$/i) || q.match(/^(-?\d[\d\s().,+*/%^()-]*)\s*\??$/);
    if (math) {
      try { return 'LEO Auto selected: mathematics.\nResult: '+calculate(math[1])+'\n\nCalculation performed locally using a restricted arithmetic parser; no code execution or external AI was used.'; }
      catch (e) { if (/^calculate|^what is|^solve/i.test(q)) return 'LEO Auto selected: mathematics. I could not safely parse that expression. Use numbers, +, -, *, /, %, ^, parentheses, sqrt(), abs(), or round().'; }
    }
    const converted=conversion(q);
    if (converted) return 'LEO Auto selected: mathematics and unit conversion.\nResult: '+converted+'\n\nThis conversion was calculated locally.';
    const batch=q.match(/^(?:add tasks|create tasks)\s*:\s*(.+)$/i);
    if (batch && context.saveTasks) {
      const items=batch[1].split(/[;\n]+/).map(clean).filter(Boolean).slice(0,20);
      if (!items.length) return 'Please include at least one task after “add tasks:”.';
      const next=context.tasks.slice();
      for (const item of items) next.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),text:item,done:false});
      context.saveTasks(next.slice(0,100));
      return 'LEO Auto selected: personal assistant. Added '+items.length+' task(s) to this device:\n'+items.map((x,i)=>(i+1)+'. '+x).join('\n');
    }
    const complete=q.match(/^(?:complete|finish|mark done)\s+(?:task\s*)?(\d+)$/i);
    if (complete && context.saveTasks) {
      const index=Number(complete[1])-1;
      if (!context.tasks[index]) return 'I could not find task '+complete[1]+'. Type “show my tasks” to see the numbered list.';
      const next=context.tasks.slice(); next[index]={...next[index],done:true}; context.saveTasks(next);
      return 'LEO Auto selected: personal assistant. Marked task as complete: '+next[index].text;
    }
    const planner = /^(?:plan|make a plan|create a plan|checklist)\s*[:\-]?\s*(.*)$/i.exec(q);
    if (planner || mode==='agent') {
      const goal=planner && planner[1] ? planner[1] : q;
      return 'LEO Auto selected: planning and task decomposition.\nGoal: '+goal+'\n\n1. Define the desired result and how success will be measured.\n2. Break the work into small, ordered tasks.\n3. Identify tools, information, and permissions needed.\n4. Complete the first task and record blockers.\n5. Review the result against the goal.\n6. Save the next action in My tasks.\n\nThis is a structured planning workflow, not autonomous background execution.';
    }
    if (/\b(capabilities|what can you do|help)\b/.test(lower)) {
      return 'LEO Auto mode routes requests to local workflows: mathematics and unit conversion, task management, planning, writing outlines, learning plans, coding/app-development checklists, and saved-knowledge retrieval.\n\nIt remains a deterministic assistant, not a trained large language model. Advanced original writing, arbitrary code generation, live browsing, and neural-model reasoning are not available yet.';
    }
    if (routeName==='coding and development' && mode==='auto') return 'LEO Auto selected: coding and development.\n\nI can help structure the work: define the platform and requirements, map screens and data, choose a free/open-source toolchain, implement one feature at a time, add input validation and accessibility, then run tests.\n\nFor complete code or debugging, share the exact feature, source code, and error. This local engine cannot generate arbitrary production code like a trained coding model.';
    if (routeName==='research and source review') return 'LEO Auto selected: research and source review.\n\nI can search LEO’s locally stored notes and official-feed index for matching leads. A feed headline is not proof; open the original sources, check publication dates, and compare primary evidence before treating a claim as verified.';
    if (routeName==='writing') return 'LEO Auto selected: writing.\n\nUse this structure:\n• Purpose and intended reader\n• Key message in one sentence\n• Three supporting points\n• Clear opening and specific next step\n\nThis version can outline and organize writing, but it does not yet have a language model for reliably generating long original drafts.';
    if (routeName==='learning') return 'LEO Auto selected: learning.\n\n1. State one learning objective.\n2. Explain the idea in your own words.\n3. Work through one example.\n4. Try a practice question.\n5. Check the answer and review mistakes.\n\nTell LEO the subject and level to create a focused study checklist.';
    if (routeName==='translation') return 'LEO Auto selected: translation. The standalone engine does not contain a translation model, so it will not invent a translation. You can save verified vocabulary and reference material in the Knowledge library.';
    return null;
  }

  const languageData = {
    English:{code:'en-US',phrases:[['Hello.','Hello.'],['How are you?','How are you?'],['Thank you.','Thank you.'],['Please.','Please.'],['I am learning English.','I am learning English.']]},
    Filipino:{code:'fil-PH',phrases:[['Kumusta?','Hello / How are you?'],['Mabuti, salamat.','I am well, thank you.'],['Pakiusap.','Please.'],['Maraming salamat.','Thank you very much.'],['Natututo akong mag-Filipino.','I am learning Filipino.']]},
    Cebuano:{code:'ceb-PH',phrases:[['Kumusta?','Hello / How are you?'],['Maayo ra ko, salamat.','I am fine, thank you.'],['Palihog.','Please.'],['Daghang salamat.','Thank you very much.'],['Nagtuon ko og Cebuano.','I am learning Cebuano.']]},
    Spanish:{code:'es-ES',phrases:[['Hola, ¿qué tal?','Hello, how are you?'],['Estoy bien, gracias.','I am well, thank you.'],['Por favor.','Please.'],['Muchas gracias.','Thank you very much.'],['Estoy aprendiendo español.','I am learning Spanish.']]},
    French:{code:'fr-FR',phrases:[['Bonjour, comment ça va ?','Hello, how are you?'],['Je vais bien, merci.','I am well, thank you.'],['S’il vous plaît.','Please.'],['Merci beaucoup.','Thank you very much.'],['J’apprends le français.','I am learning French.']]},
    German:{code:'de-DE',phrases:[['Hallo, wie geht’s?','Hello, how are you?'],['Mir geht es gut, danke.','I am well, thank you.'],['Bitte.','Please / You are welcome.'],['Vielen Dank.','Thank you very much.'],['Ich lerne Deutsch.','I am learning German.']]},
    Japanese:{code:'ja-JP',phrases:[['こんにちは。','Hello.'],['お元気ですか。','How are you?'],['ありがとうございます。','Thank you very much.'],['お願いします。','Please.'],['日本語を勉強しています。','I am studying Japanese.']]},
    Mandarin:{code:'zh-CN',phrases:[['你好。','Hello.'],['你好吗？','How are you?'],['谢谢。','Thank you.'],['请。','Please.'],['我在学习中文。','I am learning Chinese.']]}
  };
  function languageLesson(q, selected) {
    const lower=String(q||'').toLowerCase();
    const names=Object.keys(languageData);
    const match=names.find(n=>lower.includes(n.toLowerCase()) || (n==='Mandarin' && lower.includes('chinese')));
    const key=match||selected||'English', data=languageData[key]||languageData.English;
    const rows=data.phrases.map((p,i)=>(i+1)+'. '+p[0]+'\n   Meaning: '+p[1]).join('\n');
    return 'LEO Language Coach · '+key+' ('+data.code+')\n\nUseful everyday phrases:\n'+rows+'\n\nPractice: read each phrase aloud, then try to recall it without looking. For natural pronunciation, LEO will use a matching voice installed on your device when available. Phrase lists are starter material, not a substitute for native-speaker review.\n\nType “teach me Spanish” or select another language in Settings to switch.';
  }

  window.LEOEnhanced = { answer, calculate, conversion, route, languageLesson, languageData };
})();
