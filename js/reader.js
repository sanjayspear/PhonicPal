/* ---------- Reader (text-to-speech + highlight + lookup) ---------- */
function Reader(root, input) {
    root.innerHTML = (input ? '<textarea placeholder="Paste or type your text here…" aria-label="Text to read"></textarea>' : '') +
        '<div class="view" hidden></div><div class="row rctrl" style="margin:10px 0"><button class="btn go" title="' + (input ? 'Start reading from the cursor position' : 'Start reading this book page') + '">▶ ' + (input ? 'Read From Here' : 'Read It to Me') + '</button><button class="btn t toggle-read" title="Pause reading" aria-pressed="false" disabled>❚❚ Pause</button><button class="btn s st" title="Stop reading and reset this session" disabled>■ Stop</button><button class="btn s cl" title="Clear the current text or book view">✕ Clear Text</button>' + (input ? '<button class="btn p ed" title="Return to the text box and choose a new starting point">✎ Edit text</button>' : '') +
        '<select class="rate" aria-label="Speed" title="Choose reading speed"><option value=".6">Slow</option><option value=".85" selected>Normal</option><option value="1.1">Fast</option></select><span class="mut cnt"></span><span class="mut rstate" aria-live="polite"></span></div>' +
        '<div class="row pg" hidden><button class="btn p pv" title="Go to the previous page">◀ Back</button><span class="pn"></span><button class="btn p nx" title="Go to the next page">Next ▶</button></div><div class="look" hidden></div>';
    const q = s => $(s, root), view = q('.view'), ta = q('textarea'), cnt = q('.cnt'), look = q('.look'), rate = q('.rate'), pgb = q('.pg');
    const goLabel = input ? 'Read From Here' : 'Read It to Me';
    /* lastOff: start of the word being read (where Resume restarts after an interruption)
       broken: paused, but another sound took over the speech engine, so Resume replays from lastOff
       quiet: this reader is stopping speech itself, so ignore its own 'speechinterrupt' */
    let pages = [], pi = 0, spans = [], chunks = [], gen = 0, si = 0, state = 'IDLE', lastOff = 0, readFrom = 0, lastTappedSpan = null, lastTapAt = 0, broken = false, quiet = false;
    function setState(next, message) {
        state = next;
        const toggle = q('.toggle-read');
        q('.go').disabled = state !== 'IDLE';
        toggle.disabled = state !== 'READING' && state !== 'PAUSED';
        toggle.textContent = state === 'PAUSED' ? '▶ Resume' : '❚❚ Pause';
        toggle.title = state === 'PAUSED' ? 'Continue reading from the paused position' : 'Temporarily pause reading';
        toggle.setAttribute('aria-pressed', String(state === 'PAUSED'));
        q('.st').disabled = state !== 'READING' && state !== 'PAUSED';
        const labels = { IDLE: 'Ready to read.', READING: 'Reading…', PAUSED: 'Reading paused.', STOPPED: 'Reading stopped.' };
        q('.rstate').textContent = message || labels[state];
    }
    function render() {
        view.hidden = false; if (ta) ta.hidden = true; const t = pages[pi] || ''; view.replaceChildren(); spans = [];
        const re = /\S+/g, f = document.createDocumentFragment(); let m, last = 0;
        while (m = re.exec(t)) { if (m.index > last) f.append(t.slice(last, m.index)); const s = h('span', 0, m[0]); spans.push([m.index, s]); f.append(s); last = m.index + m[0].length }
        f.append(t.slice(last)); view.append(f); si = 0; lastOff = 0; readFrom = 0; lastTappedSpan = null; lastTapAt = 0; view.scrollTop = 0; pgb.hidden = pages.length < 2; q('.pn').textContent = 'Page ' + (pi + 1) + ' of ' + pages.length
    }
    function hl(o) {
        if (!spans.length) return; let k = si; while (k + 1 < spans.length && spans[k + 1][0] <= o) k++; while (k > 0 && spans[k][0] > o) k--;
        spans[si][1].classList.remove('on'); si = k; lastOff = spans[k][0]; const s = spans[k][1]; s.classList.add('on'); s.scrollIntoView({ block: 'nearest' })
    }
    const clear = () => spans[si] && spans[si][1].classList.remove('on');
    function selectReadStart(offset) {
        if (state !== 'IDLE') { gen++; broken = false; clear() }
        readFrom = offset;
        spans.forEach(([wordOffset, word]) => word.classList.toggle('read-start', wordOffset <= offset && offset < wordOffset + word.textContent.length));
        look.hidden = true;
        setState('IDLE', 'Start point selected. Choose ' + goLabel + ' to begin at this word.');
    }
    /* another reader may be paused on the shared speech engine: tell it before this one takes over */
    const stopSpeech = () => { quiet = true; document.dispatchEvent(new Event('speechinterrupt')); quiet = false; Speech.stop() };
    function chunk(t) {
        const a = [], re = /[^.!?\n]+[.!?]*\s*/g; let m;
        while (m = re.exec(t)) { let x = m[0], o = m.index; while (x.length > 240) { let k = x.lastIndexOf(' ', 240); if (k < 80) k = 240; a.push({ o, t: x.slice(0, k) }); x = x.slice(k); o += k } if (x.trim()) a.push({ o, t: x }) } return a
    }
    let pre = [];
    /* play(from): start at character offset `from` of the current page (0 = top) */
    function play(from = 0) {
        const g = ++gen; stopSpeech(); pre = []; broken = false; lastOff = from; setState('READING');
        chunks = chunk(pages[pi] || '').filter(c => c.o + c.t.length > from).map(c => c.o < from ? { o: from, t: c.t.slice(from - c.o) } : c); setTimeout(() => run(0, g), 0)
    }
    function run(i, g) {
        if (g !== gen) return;
        if (state !== 'READING') return;
        if (i >= chunks.length) { if (pi < pages.length - 1) { pi++; render(); return play() } setState('IDLE', 'Finished reading.'); return clear() }
        const c = chunks[i], r = +rate.value; pre[i] = pre[i] || Speech.prepare(c.t, r);
        if (chunks[i + 1] && !pre[i + 1]) pre[i + 1] = Speech.prepare(chunks[i + 1].t, r);
        Speech.play(pre[i], { start: () => g === gen && hl(c.o), prog: k => g === gen && hl(c.o + k) }).then(() => run(i + 1, g)).catch(e => { if (g === gen) { cnt.textContent = 'Speech stopped: ' + String(e.message || e); setState('IDLE', 'Reading could not continue.') } })
    }
    /* Stop: end speech and go back to the start of the current page (a book keeps its page) */
    const resetSession = () => { const active = state === 'READING' || state === 'PAUSED'; gen++; broken = false; setState('STOPPED'); if (active) stopSpeech(); lastOff = 0; chunks = []; pre = []; clear(); if (pages.length && view.hidden === false) render(); setState('IDLE', 'Reading stopped. Ready when you are.') };
    const pause = () => { if (state !== 'READING') return; Speech.pause(); setState('PAUSED') };
    const resume = () => { if (state !== 'PAUSED') return; if (broken) return play(lastOff); Speech.resume(); setState('READING') };
    /* another sound (word lookup, phonics, voice preview, the other reader) took the speech engine: hold the place */
    const interrupt = () => { if (quiet || (state !== 'READING' && state !== 'PAUSED')) return; gen++; broken = true; setState('PAUSED', 'Paused so another sound could play. Choose Resume to continue.') };
    /* wipe: full reset to an empty state (Clear Text button, or the open book was deleted) */
    const wipe = () => {
        resetSession(); pages = []; pi = 0; spans = []; si = 0; lastOff = 0; view.replaceChildren(); view.hidden = true; look.hidden = true; pgb.hidden = true;
        if (ta) ta.hidden = false, ta.value = ''; cnt.textContent = ''; setState('IDLE', 'Text cleared.'); api.onClear && api.onClear()
    };
    q('.go').onclick = () => {
        if (state !== 'IDLE') return; let from = readFrom;
        if (ta && !ta.hidden) {
            const t = ta.value; if (!t.trim()) { cnt.textContent = 'Please add some text first.'; return }
            /* after a paste the cursor sits at the end: read the whole text instead of nothing */
            from = ta.selectionStart || 0; if (!t.slice(from).trim()) from = 0;
            pages = [t]; pi = 0; render(); look.hidden = true
        }
        else if (!pages.length) return; play(from)
    };
    q('.toggle-read').onclick = () => state === 'PAUSED' ? resume() : pause();
    q('.st').onclick = resetSession; q('.cl').onclick = wipe;
    const turn = d => { const to = pi + d; if (to < 0 || to >= pages.length) return; resetSession(); pi = to; render() };
    q('.pv').onclick = () => turn(-1); q('.nx').onclick = () => turn(1);
    if (ta) {
        const words = () => (ta.value.match(/\S+/g) || []);
        ta.oninput = () => { let w = words(); if (w.length > 10000) { const m = [...ta.value.matchAll(/\S+/g)][9999]; ta.value = ta.value.slice(0, m.index + m[0].length); w = words(); cnt.textContent = '10,000 word limit reached' } else cnt.textContent = w.length.toLocaleString() + ' / 10,000 words' };
        q('.ed').onclick = () => { resetSession(); view.hidden = true; ta.hidden = false; ta.focus(); setState('IDLE', 'Choose a new starting point, then read from here.') }
    }
    view.onclick = e => {
        const word = e.target.closest('span');
        if (!word) return;
        if (state === 'READING') pause();
        const now = Date.now();
        if (word === lastTappedSpan && now - lastTapAt <= 650) {
            const entry = spans.find(([, element]) => element === word);
            if (entry) selectReadStart(entry[0]);
            lastTappedSpan = null;
            lastTapAt = 0;
            return;
        }
        lastTappedSpan = word;
        lastTapAt = now;
        showLook(look, word.textContent);
    };
    document.addEventListener('speechinterrupt', interrupt);
    document.addEventListener('tabchange', e => { if (root.closest('section').id !== e.detail.to) pause() });
    const api = { load(p) { resetSession(); pages = p; pi = 0; look.hidden = true; render(); setState('IDLE', 'Book ready. Choose Read It to Me.') }, stop: resetSession, wipe, onClear: null }; setState('IDLE'); return api
}
const RW = Reader($('#rw'), true), BK = Reader($('#bk'), false);
