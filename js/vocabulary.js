/* ---------- Vocabulary ---------- */
let vt = 'all';
const VT = [['all', 'All Words'], ['saved', 'Saved by Me'], ['def', 'Starter List'], ['prac', 'Practice']];
const allWords = () => { const s = saved(); return [...s, ...Object.values(DICT).filter(x => !s.some(y => y.w === x.w))] };
function renderVocab() {
  $$('#vtabs button').forEach((b, i) => { const active = VT[i][0] === vt; b.classList.toggle('a', active); b.setAttribute('aria-pressed', String(active)) }); const l = $('#vlist'); l.replaceChildren();
  if (vt === 'prac') return quiz();
  const s = saved(), a = vt === 'saved' ? s : vt === 'def' ? Object.values(DICT) : allWords();
  if (!a.length) { l.append(h('p', 'mut', 'No saved words yet. Tap a word while reading, then press Save Word.')); return }
  a.forEach(x => {
    const c = h('div', 'card wc'), r = h('div', 'row'); r.append(h('h3', 0, x.w)); const ic = h('button', 'ic', '🔊'); ic.title = 'Hear ' + x.w + ' aloud'; ic.setAttribute('aria-label', 'Hear ' + x.w); ic.onclick = () => sp(x.w, .7); r.append(ic);
    c.append(r, h('i', 0, x.p || ''), h('p', 0, x.m)); (x.ex && x.ex.length ? x.ex : x.e ? [x.e] : []).forEach(t => c.append(h('p', 'mut', '“' + t + '”')));
    if (s.some(y => y.w === x.w)) { const d = h('button', 'lnk', 'Remove'); d.title = 'Remove this saved word from your list'; d.onclick = () => { LS.set('pp_words', saved().filter(y => y.w !== x.w)); renderVocab() }; c.append(d) } l.append(c)
  })
}
function quiz() {
  const l = $('#vlist'), a = allWords(); l.replaceChildren(); const q = a[Math.floor(Math.random() * a.length)],
    opts = shuf([q, ...shuf(a.filter(x => x !== q)).slice(0, 2)]), c = h('div', 'card wc'); c.style.gridColumn = '1/-1';
  c.append(h('h3', 0, 'Which word means:'), h('p', 0, '“' + q.m + '”')); const fb = h('p', 0, ''); fb.setAttribute('aria-live', 'polite');
  const btns = opts.map(o => { const b = h('button', 'btn p', o.w); b.title = 'Choose ' + o.w + ' as your answer'; b.setAttribute('aria-pressed', 'false'); b.onclick = () => { btns.forEach((x, i) => x.setAttribute('aria-pressed', String(opts[i] === o))); if (o === q) { b.className = 'btn ok'; fb.textContent = '🎉 Great job!'; sp(q.w, .7); btns.forEach(x => x.disabled = true); const n = h('button', 'btn', 'Next word ▶'); n.title = 'Start another vocabulary question'; n.onclick = quiz; c.append(n); n.focus() } else { b.className = 'btn no'; fb.textContent = 'Try again!' } }; c.append(b); return b });
  c.append(fb); l.append(c)
}
VT.forEach(([k, n]) => { const b = h('button', 0, n); b.onclick = () => { vt = k; renderVocab() }; $('#vtabs').append(b) }); renderVocab();
