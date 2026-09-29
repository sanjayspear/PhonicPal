/* SpeechService: pluggable neural voice engines (Kokoro, Piper) + recorded clips + browser-voice fallback.
   Which engines are offered depends on ENV (js/env.js). Add an engine by adding an entry to ENGINES. */
const Speech = (() => {
  const KOKORO_LIB = 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js', KOKORO_MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
  const PIPER_LIB = 'https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.5/+esm';
  const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  const api = {};
  /* An engine: {name, voices, load(progress), text(text,speed,voice) -> {audio,sampling_rate} | Blob} */
  const ENGINES = {
    kokoro: {
      name: 'Natural: Kokoro (best quality, ~90 MB)', dv: 'af_heart',
      voices: [['af_heart', 'Heart (US woman)'], ['af_bella', 'Bella (US woman)'], ['am_michael', 'Michael (US man)'], ['am_adam', 'Adam (US man)'], ['bf_emma', 'Emma (UK woman)'], ['bm_george', 'George (UK man)']],
      async load(p) {
        const { KokoroTTS } = await (api.loader ? api.loader() : import(KOKORO_LIB)); this.tts = await KokoroTTS.from_pretrained(KOKORO_MODEL, {
          dtype: 'q8', device: 'wasm',
          progress_callback: e => { if (e.status === 'progress' && e.total) p(e.file, e.loaded, e.total) }
        })
      },
      text(t, speed, voice) { return this.tts.generate(t, { voice, speed }) }
    },
    piper: {
      name: 'Natural: Piper (lighter, ~60 MB)', dv: 'en_US-hfc_female-medium',
      voices: [['en_US-hfc_female-medium', 'Female (US)'], ['en_US-amy-medium', 'Amy (US woman)'], ['en_US-kristin-medium', 'Kristin (US woman)'], ['en_US-joe-medium', 'Joe (US man)'], ['en_US-john-medium', 'John (US man)']],
      async load(p) { this.lib = await import(PIPER_LIB); await this.lib.download(LS.get('pp_voice_piper', this.dv), e => e.total && p(e.url, e.loaded, e.total)) },
      text(t, speed, voice) { return this.lib.predict({ text: t, voiceId: voice }) }
    }
  };   /* returns a WAV Blob */
  const canNeural = ENV.FEATURES.neuralTTS;
  const savedEngine = LS.get('pp_engine', 'browser');
  let selectedEngine = ENGINES[savedEngine] ? savedEngine : 'browser', mode = 'browser';
  if (!canNeural) selectedEngine = 'browser';
  const st = { kokoro: 'idle', piper: 'idle' }, voiceOf = id => LS.get('pp_voice_' + id, ENGINES[id] && ENGINES[id].dv);
  const voiceName = id => ENGINES[id] && (ENGINES[id].voices.find(([key]) => key === voiceOf(id)) || [null, id])[1];
  const installed = () => LS.get('pp_installed_engines', []), isInstalled = id => installed().includes(id);
  const markInstalled = id => LS.set('pp_installed_engines', [...new Set([...installed(), id])]);
  let gen = 0, chain = Promise.resolve(), cur = null, q = Promise.resolve(), fails = 0, usingA = false;
  let paused = false, loadPromises = {}, pauseCurrent = null, resumeCurrent = null; const pauseWaiters = [];
  const A = new Audio(), cache = new Map(), HOLD_TTS = !/Android/i.test(navigator.userAgent);
  const status = t => { const e = $('#vstat'); if (e) e.textContent = t }, ready = () => status(mode !== 'browser' && st[mode] === 'ready' ? 'Natural voice ready ✓' : 'Browser voice active');
  const natural = () => mode !== 'browser' && st[mode] === 'ready' && fails < 3;
  const waitPlaying = async g => { while (paused && g === gen) await new Promise(r => pauseWaiters.push(r)); return g === gen };
  const releasePaused = () => { while (pauseWaiters.length) pauseWaiters.shift()() };
  /* browsers only allow audio after a tap: unlock the shared audio element on the first one */
  const unlock = () => { try { A.src = SILENT; const p = A.play(); p && p.catch(() => { }) } catch (e) { } };
  document.addEventListener('pointerdown', unlock, { once: true, capture: true }); document.addEventListener('keydown', unlock, { once: true, capture: true });
  async function load(id = selectedEngine) {
    if (id === 'browser' || !ENGINES[id]) return false; if (st[id] === 'ready') return true; if (loadPromises[id]) return loadPromises[id];
    st[id] = 'loading'; status('Downloading voice…'); syncVoiceControls(); const files = {};
    loadPromises[id] = (async () => {
      try {
        await ENGINES[id].load((f, l, t) => { files[f] = [l, t]; let a = 0, b = 0; for (const k in files) { a += files[k][0]; b += files[k][1] } if (b) status('Downloading voice… ' + Math.round(a / b * 100) + '%') });
        status('Installing voice…');
        st[id] = 'ready'; return true
      }
      catch (e) { st[id] = 'idle'; console.warn('Natural voice failed', id, e); mode = 'browser'; fails = 0; status('Voice unavailable. Browser voice is active; check your connection and try again.'); if (!TTS) $('#warn').hidden = false; return false }
      finally { delete loadPromises[id]; syncVoiceControls() }
    })(); return loadPromises[id]
  }
  function wav(f, sr) {
    const n = f.length, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const s = Math.max(-1, Math.min(1, f[i])); v.setInt16(44 + i * 2, s < 0 ? s * 32768 : s * 32767, true) } return new Blob([b], { type: 'audio/wav' })
  }
  /* one synthesis at a time; jobs from before the last Stop are skipped so taps never wait behind old work */
  function synth(key, fn) {
    if (cache.has(key)) return cache.get(key); const ep = gen;
    const p = new Promise((res, rej) => {
      q = q.then(async () => {
        if (ep !== gen) { rej(new Error('stale')); return }
        try { const a = await fn(); if (a instanceof Blob) { res(a); return } const d = a.audio || a.data; res(wav(d, a.sampling_rate || 24000)) } catch (e) { rej(e) }
      })
    });
    cache.set(key, p); p.catch(() => cache.delete(key)); if (cache.size > 80) cache.delete(cache.keys().next().value); return p
  }
  const speedOf = r => Math.min(1.4, Math.max(.6, r / .85));
  const textClip = (t, r) => { const id = mode, v = voiceOf(id), s = speedOf(r); return synth(id + '|' + v + '|' + s + '|' + t, () => ENGINES[id].text(t, s, v)) };
  const prepare = (text, rate = .85) => ({ text, rate, blob: natural() ? textClip(text, rate) : null });
  function stop() { gen++; paused = false; releasePaused(); if (TTS) speechSynthesis.cancel(); if (cur) { const c = cur; cur = null; c() } pauseCurrent = resumeCurrent = null }
  /* browser voices: auto-pick the most natural one installed (Edge "Natural"/Online, macOS Premium/Enhanced, Siri, Google) */
  const bvoices = () => TTS ? speechSynthesis.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang)) : [];
  const score = v => {
    const n = v.name; let s = 0; if (/natural|neural|online/i.test(n)) s += 60; if (/premium|enhanced/i.test(n)) s += 45; if (/siri/i.test(n)) s += 35; if (/google/i.test(n)) s += 25;
    if (/samantha|ava|allison|serena|karen|moira|daniel|aria|jenny|guy|libby|sonia|zira/i.test(n)) s += 20;
    if (/compact|novelty|fred|zarvox|albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|junior|kathy|organ|princess|ralph|superstar|trinoids|whisper|wobble|espeak/i.test(n)) s -= 100;
    if (/en[-_]US/i.test(v.lang)) s += 6; else if (/en[-_]GB/i.test(v.lang)) s += 3; return s + (v.localService ? 1 : 0)
  };
  const pickB = () => { const l = bvoices(), sel = LS.get('pp_bvoice', ''); return l.find(v => v.name === sel) || [...l].sort((a, b) => score(b) - score(a))[0] || null };
  function fillVoices(id = selectedEngine) {
    const v = $('#vvoice'); if (!v) return; v.replaceChildren();
    if (id !== 'browser') { ENGINES[id].voices.forEach(([k, n]) => v.append(new Option(n, k))); v.value = voiceOf(id) }
    else { [...bvoices()].sort((a, b) => score(b) - score(a)).forEach(x => v.append(new Option(x.name + (score(x) >= 45 ? ' ★' : ''), x.name))); const b = pickB(); if (b) v.value = b.name }
  }
  function syncVoiceControls() {
    const e = $('#veng'), v = $('#vvoice'), install = $('#vinstall'), preview = $('#vpreview');
    const loading = selectedEngine !== 'browser' && st[selectedEngine] === 'loading';
    if (e) e.value = selectedEngine;
    if (v) { fillVoices(selectedEngine); v.disabled = loading }
    if (e) e.disabled = loading;
    if (install) {
      install.hidden = selectedEngine === 'browser';
      install.disabled = loading || (selectedEngine !== 'browser' && mode === selectedEngine && st[selectedEngine] === 'ready');
      if (selectedEngine !== 'browser') {
        install.textContent = mode === selectedEngine && st[selectedEngine] === 'ready' ? 'Natural Voice Active ✓' : isInstalled(selectedEngine) ? 'Activate Saved Voice' : 'Download & Activate Voice';
      }
    }
    if (preview) {
      preview.disabled = loading;
      preview.title = loading ? 'The selected voice is loading.' : selectedEngine !== 'browser' && mode !== selectedEngine && st[selectedEngine] !== 'ready' ? 'Choose Preview to request the one-time voice download and hear a sample.' : 'Play a sample using the selected voice.';
    }
  }
  const clearInstalled = id => LS.set('pp_installed_engines', installed().filter(x => x !== id));
  async function preview() {
    const id = selectedEngine;
    if (id !== 'browser' && mode !== id) {
      if (st[id] !== 'ready') {
        const okToDownload = window.confirm('To hear ' + voiceName(id) + ', PhonicsPal needs to download its Natural Voice model (about ' + (id === 'kokoro' ? '90' : '60') + ' MB). Download it now to play the sample?');
        if (!okToDownload) { status('Preview cancelled. Browser voice remains active.'); return false }
        status('Preparing voice sample…');
        if (!await load(id)) return false;
        markInstalled(id);
      }
      const previousMode = mode;
      mode = id;
      try {
        status('Playing voice sample…');
        return await queue(false, g => play(prepare('The bright red bird flew over the green tree.', .85), {}, g));
      } finally {
        mode = previousMode;
        status(previousMode === 'browser' ? 'Sample finished. Browser voice remains active; choose Activate Saved Voice to switch.' : 'Using ' + voiceName(previousMode) + ' ✓');
        syncVoiceControls();
      }
    }
    status('Playing voice sample…');
    try { return await queue(false, g => play(prepare('The bright red bird flew over the green tree.', .85), {}, g)) }
    finally { status(mode === 'browser' ? 'Using ' + (LS.get('pp_bvoice', '') || 'browser voice') : 'Using ' + voiceName(mode) + ' ✓') }
  }
  function playBrowser(clip, hk, g) {
    return new Promise(res => {
      const t = clip.fb || clip.text; if (!TTS || !t || g !== gen) return res();
      usingA = false; let done = false, to, remaining = Math.max(3000, t.length * 120 + 2500), armedAt = 0;
      const disarm = () => { if (to) { clearTimeout(to); to = null; remaining = Math.max(0, remaining - (Date.now() - armedAt)) } };
      /* screen off / page hidden: the browser may hold speech, so the safety net must not skip unread text */
      const vis = () => { if (document.hidden) disarm(); else if (!paused) arm() };
      const fin = () => { if (done) return; done = true; clearTimeout(to); document.removeEventListener('visibilitychange', vis); if (cur === fin) { cur = null; pauseCurrent = resumeCurrent = null } res() };
      const arm = () => { if (done || to || document.hidden) return; armedAt = Date.now(); to = setTimeout(fin, remaining) };
      cur = fin; pauseCurrent = () => { disarm(); speechSynthesis.pause() }; resumeCurrent = () => { arm(); speechSynthesis.resume() };
      const u = new SpeechSynthesisUtterance(t), bv = pickB(); u.lang = 'en-US'; if (bv) { u.voice = bv; u.lang = bv.lang } u.rate = clip.rate;
      u.onstart = () => hk.start && hk.start(); u.onboundary = e => { if (hk.prog && clip.text && (!e.name || e.name === 'word')) hk.prog(e.charIndex) }; u.onend = u.onerror = fin;
      document.addEventListener('visibilitychange', vis);
      if (!paused) arm();  /* safety net if the browser never reports the end */
      setTimeout(async () => { if (!await waitPlaying(g)) return fin(); speechSynthesis.resume(); speechSynthesis.speak(u) }, 40)
    })
  }
  function playUrl(url, revoke, clip, hk, g) {
    return new Promise(res => {
      let raf = 0, done = false; usingA = true;
      /* usingA = false so a later resume() never restarts this finished clip */
      const cleanup = () => { cancelAnimationFrame(raf); A.onended = A.onerror = null; usingA = false; if (revoke) URL.revokeObjectURL(url) };
      const fin = () => { if (done) return; done = true; cleanup(); A.pause(); if (cur === fin) cur = null; res() };
      const bail = err => { if (done) return; done = true; cleanup(); console.warn('Audio failed', err); if (cur === fin) cur = null; res(playBrowser(clip, hk, g)) };
      cur = fin; A.onended = fin; A.onerror = bail; A.src = url;
      const tick = () => { if (done) return; if (A.duration && hk.prog && clip.text) hk.prog(Math.floor(A.currentTime / A.duration * clip.text.length)); raf = requestAnimationFrame(tick) };
      const p = A.play();
      if (p && p.then) p.then(() => { hk.start && hk.start(); tick() }).catch(bail); else { hk.start && hk.start(); tick() }
    })
  }
  async function play(clip, hk = {}, g = gen) {
    if (clip.url) { if (!await waitPlaying(g)) return; return playUrl(clip.url, false, clip, hk, g) }
    if (!clip.blob) return playBrowser(clip, hk, g);
    let blob, wt = setTimeout(() => status('Preparing voice…'), 400);
    /* a hidden page (screen off) runs synthesis slower: wait longer before giving up on the natural voice */
    try { blob = await Promise.race([clip.blob, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), document.hidden ? 120000 : 25000))]); clearTimeout(wt); ready() }
    catch (e) { clearTimeout(wt); if (g !== gen) return; if (e.message !== 'stale') {
        fails++; console.warn('Natural voice error', e);
        if (fails >= 3) { mode = 'browser'; syncVoiceControls(); status('Natural voice kept failing, so the browser voice is now active. Choose Activate Saved Voice to try again.') }
        else status('Voice problem (' + String(e.message).slice(0, 40) + '), using browser voice')
      } return playBrowser(clip, hk, g) }
    if (g !== gen || !await waitPlaying(g)) return;
    return playUrl(URL.createObjectURL(blob), true, clip, hk, g)
  }
  const queue = (keep, fn) => { if (!keep) { document.dispatchEvent(new Event('speechinterrupt')); stop(); chain = Promise.resolve() } const g = gen; chain = chain.then(() => g === gen ? fn(g) : 0); return chain };
  const say = (t, r = .8, keep) => queue(keep, g => play(prepare(t, r), {}, g));
  /* pre-recorded phonics audio (assets/audio/<id>.mp3, or window.AUDIO_MAP in the single-file preview); falls back to the browser voice */
  const urlOf = id => (window.AUDIO_MAP && window.AUDIO_MAP[id]) || 'assets/audio/' + id + '.mp3';
  const clip = (id, fb, keep) => queue(keep, g => {
    if (natural()) return play(prepare(fb || id.replace(/^(s_|w_)/, ''), .7), {}, g);
    return play({ text: '', fb, rate: .7, url: urlOf(id) }, {}, g);
  });
  Object.assign(api, {
    load, natural, prepare, play, stop, say, clip, preview, ENGINES,
    /* changes on every stop/interrupt: a multi-step sequence (card, blend) checks it to know it was cut off */
    epoch: () => gen,
    /* true = held in place; false = this browser can't hold speech (Chrome on Android ignores speechSynthesis.pause),
       so the caller should stop and later restart from its own position */
    pause() { paused = true; if (usingA) { A.pause(); return true } if (!HOLD_TTS) return false; if (pauseCurrent) pauseCurrent(); else if (TTS) speechSynthesis.pause(); return true },
    resume() { paused = false; releasePaused(); if (usingA) A.play(); else if (resumeCurrent) resumeCurrent(); else if (TTS) speechSynthesis.resume() },
    init() {
      const e = $('#veng'), v = $('#vvoice'); e.replaceChildren();
      if (canNeural) Object.keys(ENGINES).forEach(k => e.append(new Option(ENGINES[k].name, k)));
      e.append(new Option('Browser voice', 'browser'));
      if (!ENGINES[selectedEngine]) selectedEngine = 'browser';
      e.value = selectedEngine; fillVoices(selectedEngine); syncVoiceControls();
      if (TTS) speechSynthesis.onvoiceschanged = () => fillVoices(selectedEngine);
      e.onchange = () => {
        document.dispatchEvent(new Event('speechinterrupt')); stop(); selectedEngine = e.value; LS.set('pp_engine', selectedEngine); mode = 'browser'; fails = 0;
        fillVoices(selectedEngine); syncVoiceControls();
        status(selectedEngine === 'browser' ? 'Using browser voice' : isInstalled(selectedEngine) ? 'Browser voice active. Activate the saved natural voice when ready.' : 'Browser voice active. Download a natural voice to use it.');
      };
      v.onchange = () => {
        if (selectedEngine !== 'browser') {
          LS.set('pp_voice_' + selectedEngine, v.value);
          if (selectedEngine === 'piper') {
            st.piper = 'idle'; delete ENGINES.piper.lib; clearInstalled('piper'); mode = 'browser';
            document.dispatchEvent(new Event('speechinterrupt')); stop();
          } else if (st[selectedEngine] === 'ready' && mode === selectedEngine) {
            document.dispatchEvent(new Event('speechinterrupt')); stop(); mode = selectedEngine;
          } else mode = 'browser';
        } else LS.set('pp_bvoice', v.value);
        syncVoiceControls();
        status(selectedEngine === 'browser' ? 'Using ' + v.value : mode === selectedEngine ? 'Using ' + voiceName(selectedEngine) + ' ✓' : 'Browser voice active. Choose ' + (isInstalled(selectedEngine) ? 'Activate Saved Voice' : 'Download & Activate Voice') + ' to use ' + voiceName(selectedEngine) + '.');
      };
      const install = $('#vinstall');
      if (install) install.onclick = async () => {
        const id = selectedEngine; if (id === 'browser' || st[id] === 'loading') return;
        document.dispatchEvent(new Event('speechinterrupt')); stop(); mode = 'browser'; install.disabled = true;
        status('Preparing selected voice…');
        const ok = await load(id);
        if (ok) { markInstalled(id); mode = id; fails = 0; LS.set('pp_engine', id); status('Using ' + voiceName(id) + ' ✓') }
        else { mode = 'browser'; clearInstalled(id) }
        syncVoiceControls();
      };
      const sample = $('#vpreview'); if (sample) sample.onclick = () => preview();
      if (!canNeural) status(ENV.reason);
      else if (selectedEngine !== 'browser') status(isInstalled(selectedEngine) ? 'Browser voice active. Activate the saved natural voice when ready.' : 'Browser voice active. Download a natural voice to use it.');
      else status('Using browser voice');
    }
  });
  return api
})();
