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
      fixedSpeed: true,   /* the library always speaks at the model's own speed: playback speed is applied instead (see prepare) */
      voices: [['en_US-hfc_female-medium', 'Female (US)'], ['en_US-amy-medium', 'Amy (US woman)'], ['en_US-kristin-medium', 'Kristin (US woman)'], ['en_US-joe-medium', 'Joe (US man)'], ['en_US-john-medium', 'John (US man)']],
      /* downloads the voice only if it isn't saved yet, then loads it (lib.download would re-fetch every time) */
      async load(p) { this.lib = this.lib || await import(PIPER_LIB); this.wasm = this.wasm || await this.wasmPaths(); await this.session(voiceOf('piper'), p) },
      /* The CDN bundle imports onnxruntime-web 1.27 but points it at the 1.18 runtime files, which 404
         ("no available backend found"): every sentence failed and quietly fell back to the browser voice.
         Point it at the runtime files of the version the bundle really imports. */
      async wasmPaths() {
        let v = '1.27.0'; try { v = (await (await fetch(PIPER_LIB)).text()).match(/onnxruntime-web@([^/"'\s]+)\//)[1] } catch (e) { }
        return { onnxWasm: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@' + v + '/dist/', piperData: this.lib.WASM_BASE + '.data', piperWasm: this.lib.WASM_BASE + '.wasm' }
      },
      /* The library keeps ONE shared TtsSession: a later predict({voiceId}) only relabels it and keeps speaking with the
         first voice it loaded. Start a fresh session whenever the voice changes so the chosen voice really plays. */
      session(voice, p) {
        if (this.sv !== voice) {
          this.lib.TtsSession._instance = null; this.sv = voice;
          this.sp = this.lib.TtsSession.create({ voiceId: voice, wasmPaths: this.wasm, progress: e => p && e.total && p(e.url, e.loaded, e.total) });
          this.sp.catch(() => { if (this.sv === voice) this.sv = null })
        }
        return this.sp
      },
      forget() { this.sv = this.sp = null },
      text(t, speed, voice) { return this.session(voice).then(s => s.predict(t)) }
    }
  };   /* returns a WAV Blob */
  const canNeural = ENV.FEATURES.neuralTTS;
  const savedEngine = LS.get('pp_engine', 'browser');
  let selectedEngine = ENGINES[savedEngine] ? savedEngine : 'browser', mode = 'browser';
  if (!canNeural) selectedEngine = 'browser';
  const st = { kokoro: 'idle', piper: 'idle' }, voiceOf = id => LS.get('pp_voice_' + id, ENGINES[id] && ENGINES[id].dv);
  const voiceName = id => ENGINES[id] && (ENGINES[id].voices.find(([key]) => key === voiceOf(id)) || [null, id])[1];
  /* saved downloads: 'kokoro' (one model for all its speakers) or 'piper:<voice>' (one model per Piper voice) */
  const keyOf = id => id === 'piper' ? 'piper:' + voiceOf('piper') : id;
  const installed = () => LS.get('pp_installed_engines', []), isInstalled = id => installed().includes(keyOf(id));
  const markInstalled = id => LS.set('pp_installed_engines', [...new Set([...installed(), keyOf(id)])]);
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
  /* engines that can't change speed make the same audio at any speed, so one cached clip serves Slow, Normal and Fast */
  const textClip = (t, r) => { const id = mode, v = voiceOf(id), s = speedOf(r); return synth(id + '|' + v + '|' + (ENGINES[id].fixedSpeed ? '' : s) + '|' + t, () => ENGINES[id].text(t, s, v)) };
  /* speed: audio playback rate (pitch kept) for fixed-speed engines; 1 when the engine or browser voice applies the speed itself */
  const prepare = (text, rate = .85) => { const n = natural(); return { text, rate, blob: n ? textClip(text, rate) : null, speed: n && ENGINES[mode].fixedSpeed ? speedOf(rate) : 1 } };
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
  const clearInstalled = id => LS.set('pp_installed_engines', installed().filter(x => x !== keyOf(id)));
  async function preview() {
    const id = selectedEngine;
    if (id !== 'browser' && mode !== id) {
      if (st[id] !== 'ready') {
        const okToDownload = isInstalled(id) || window.confirm('To hear ' + voiceName(id) + ', PhonicsPal needs to download its Natural Voice model (about ' + (id === 'kokoro' ? '90' : '60') + ' MB). Download it now to play the sample?');
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
      /* set after src: loading a new source resets playbackRate to defaultPlaybackRate */
      A.preservesPitch = A.webkitPreservesPitch = true; A.defaultPlaybackRate = A.playbackRate = clip.speed || 1;
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
  /* ---------- Downloaded voices: find them, show them, delete them ----------
     Piper keeps <voice>.onnx(+.json) in the origin-private folder "piper"; Kokoro (kokoro-js) keeps its model in the
     "transformers-cache" cache and speaker files in "kokoro-voices". */
  const KOKORO_CACHE = 'transformers-cache', KOKORO_VOICES = 'kokoro-voices', isKokoroUrl = u => /Kokoro-82M/i.test(u);
  async function piperDir() { try { return await (await navigator.storage.getDirectory()).getDirectoryHandle('piper') } catch (e) { return null } }
  /* -> [{key, id, voice, label, bytes}] for every saved natural voice */
  async function savedVoices() {
    const out = [], dir = await piperDir();
    if (dir) try {
      for await (const [name, fh] of dir.entries()) {
        if (!name.endsWith('.onnx')) continue; const voice = name.slice(0, -5), known = ENGINES.piper.voices.find(([k]) => k === voice);
        out.push({ key: 'piper:' + voice, id: 'piper', voice, label: 'Piper: ' + (known ? known[1] : voice), bytes: (await fh.getFile()).size })
      }
    } catch (e) { console.warn('[PhonicsPal] could not list Piper voices', e) }
    if ('caches' in window) try {
      let bytes = 0, model = false;
      const add = async (c, test) => { for (const req of await c.keys()) if (test(req.url)) { if (/\.onnx/.test(req.url)) model = true; const r = await c.match(req); bytes += +(r && r.headers.get('content-length')) || 0 } };
      if (await caches.has(KOKORO_CACHE)) await add(await caches.open(KOKORO_CACHE), isKokoroUrl);
      if (await caches.has(KOKORO_VOICES)) await add(await caches.open(KOKORO_VOICES), () => true);
      if (model) out.unshift({ key: 'kokoro', id: 'kokoro', label: 'Kokoro (all 6 speakers)', bytes })
    } catch (e) { console.warn('[PhonicsPal] could not check the Kokoro voice', e) }
    return out
  }
  /* storage is the truth: fixes "saved" labels after the browser clears site data or a voice is deleted */
  async function syncSaved() { if (!canNeural) return; LS.set('pp_installed_engines', (await savedVoices()).map(x => x.key)); syncVoiceControls() }
  async function deleteVoice(x) {
    const inUse = mode === x.id && (x.id === 'kokoro' || voiceOf('piper') === x.voice);
    if (inUse) { document.dispatchEvent(new Event('speechinterrupt')); stop(); mode = 'browser' }
    if (x.id === 'piper') { if (ENGINES.piper.sv === x.voice) ENGINES.piper.forget(); if (voiceOf('piper') === x.voice) st.piper = 'idle' }
    else { try { ENGINES.kokoro.tts.model.dispose() } catch (e) { } delete ENGINES.kokoro.tts; st.kokoro = 'idle' }
    if (x.id === 'piper') { const dir = await piperDir(); for (const f of [x.voice + '.onnx', x.voice + '.onnx.json']) try { dir && await dir.removeEntry(f) } catch (e) { } }
    else { const c = await caches.open(KOKORO_CACHE); for (const req of await c.keys()) if (isKokoroUrl(req.url)) await c.delete(req); await caches.delete(KOKORO_VOICES) }
    cache.clear(); await syncSaved(); return inUse
  }
  const mb = n => n ? (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + ' MB' : 'size unknown';
  async function openManager() {
    const dlg = $('#voiceMgr'), list = $('#vmList'), msg = $('#vmStatus');
    const render = async () => {
      list.replaceChildren(h('p', 'mut', 'Checking saved voices…'));
      const items = await savedVoices(); list.replaceChildren();
      if (!items.length) list.append(h('p', 'mut', 'No Natural Voices are saved on this device.'));
      items.forEach(x => {
        const row = h('div', 'row vm-row'), del = h('button', 'btn s', 'Delete'), loading = st[x.id] === 'loading';
        const active = mode === x.id && (x.id === 'kokoro' || voiceOf('piper') === x.voice);
        row.setAttribute('role', 'listitem'); del.type = 'button'; del.disabled = loading;
        del.title = loading ? 'This voice is loading. Try again when it has finished.' : 'Delete ' + x.label + ' from this device';
        del.setAttribute('aria-label', 'Delete ' + x.label);
        del.onclick = async () => {
          if (!confirm('Delete ' + x.label + ' (' + mb(x.bytes) + ') from this device?' + (active ? ' It is the voice in use, so the Browser voice will read instead.' : '') + ' You can download it again later.')) return;
          del.disabled = true; msg.textContent = 'Deleting ' + x.label + '…';
          const wasActive = await deleteVoice(x);
          msg.textContent = 'Deleted ' + x.label + (x.bytes ? ', freeing about ' + mb(x.bytes) : '') + '.';
          if (wasActive) status('Voice deleted. Browser voice is active.');
          render()
        };
        row.append(h('span', 'vm-name', x.label + (active ? ' (in use)' : '')), h('span', 'mut', mb(x.bytes)), del); list.append(row)
      })
    };
    msg.textContent = ''; if (!dlg.open) dlg.showModal(); await render()
  }
  Object.assign(api, {
    load, natural, prepare, play, stop, say, clip, preview, ENGINES, savedVoices, deleteVoice, openManager,
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
            /* each Piper voice is its own model: switch to it now if it is saved and Piper was in use, else ask to download */
            const wasActive = mode === 'piper'; st.piper = 'idle'; mode = 'browser';
            document.dispatchEvent(new Event('speechinterrupt')); stop();
            if (wasActive && isInstalled('piper')) { syncVoiceControls(); return $('#vinstall').onclick() }
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
      const manage = $('#vmanage'); if (manage) { manage.hidden = !canNeural; manage.onclick = () => openManager() }
      const close = $('#vmClose'); if (close) close.onclick = () => $('#voiceMgr').close();
      syncSaved();
      if (!canNeural) status(ENV.reason);
      else if (selectedEngine !== 'browser') status(isInstalled(selectedEngine) ? 'Browser voice active. Activate the saved natural voice when ready.' : 'Browser voice active. Download a natural voice to use it.');
      else status('Using browser voice');
    }
  });
  return api
})();
