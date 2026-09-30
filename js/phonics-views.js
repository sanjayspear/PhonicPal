/* Page builders for the phonics topics (VIEWS[topic.view]) and the sound steps that pages and the game both play.
   Loaded after topics.js and phonics-guide.js, before phonics.js. Uses at call time: phStatus, phOwn, phCard, sentenceList,
   stopPhonics (phonics.js) and customFor, wrapDel, withDel, customItem (custom-phonics.js). */

/* A step is one thing to hear: {clip, fb} a recording (fb: what the voice says if the file is missing), {say} spoken
   text, {gap} a pause, {sfx} a clap, {fn} a change on screen. el lights up (class cls, default "on") while it plays. */
const W = w => ({ clip: 'w_' + w.toLowerCase(), fb: w });
const S = (id, fb) => ({ clip: 's_' + id, fb: fb || FB[id] || id });
const R = r => ({ clip: 'r_' + r, fb: r });
const N = l => ({ clip: 'n_' + l, fb: NAME[l] });
const SAY = (say, rate) => ({ say, rate });
const GAP = gap => ({ gap });
const FN = fn => ({ fn });
const lit = (s, el, cls) => ({ ...s, el, cls });
/* the sounds of 'c-a-t', each lighting its tile (a silent e is a short pause) */
const tileSteps = (w, tiles) => { const toks = w.split('-'), ids = soundsOf(toks); return toks.map((t, k) => lit(ids[k] ? S(ids[k]) : GAP(350), tiles && tiles[k])) };

let actx = null;
function clapSfx() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const n = actx.sampleRate * .09 | 0, buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 4;
    const src = actx.createBufferSource(), g = actx.createGain(); g.gain.value = .8; src.buffer = buf; src.connect(g).connect(actx.destination); src.start()
  } catch (e) { }
}
/* keep = queue after what is already playing; otherwise this step interrupts it */
function runStep(s, keep) {
  if (!keep && !s.say && !s.clip) { document.dispatchEvent(new Event('speechinterrupt')); Speech.stop() }
  if (s.el) s.el.classList.add(s.cls || 'on');
  const p = s.fn ? (s.fn(), Promise.resolve()) : s.gap ? wait(s.gap) : s.sfx ? (clapSfx(), wait(480)) : s.say ? Speech.say(s.say, s.rate || .8, keep) : Speech.clip(s.clip, s.fb, keep);
  return p.finally(() => { if (s.el) s.el.classList.remove(s.cls || 'on') })
}
/* Play steps from a tap on the Phonics page. Anything else speaking ends it. -> true when it played to the end */
async function phPlay(steps, done = 'Finished. Choose another when ready.', busy = 'Playing…') {
  phStatus(busy); let ep = null;
  try {
    for (let k = 0; k < steps.length; k++) {
      if (k && Speech.epoch() !== ep) return false;
      const p = runStep(steps[k], k > 0); if (!k) { ep = Speech.epoch(); phOwn() } await p
    }
    if (Speech.epoch() !== ep) return false; phStatus(done); return true
  } catch (e) { phStatus('Sound could not play. Check your voice settings and try again.'); return false }
}

/* "c«a»t" -> c<mark>a</mark>t ; "rab|bit" -> rab|bit with a divider */
function markedEl(t, cls) {
  const e = h('span', cls); t.split(/(«[^»]*»|\|)/).filter(Boolean).forEach(p => e.append(p === '|' ? h('span', 'split', '·') : p[0] === '«' ? h('mark', 0, p.slice(1, -1)) : document.createTextNode(p))); return e
}
/* a sentence whose words can each be tapped to hear them */
function wordsOf(text) {
  return text.split(/(\s+)/).map(tok => {
    const w = tok.toLowerCase().replace(/[^a-z']/g, ''); if (!w) return document.createTextNode(tok);
    const b = h('button', 'wd', tok); b.type = 'button'; b.title = 'Hear ' + w; b.onclick = () => phPlay([W(w)]); return b
  })
}
/* word chip: 'cat', a marked word 'c«a»t', a split word 'rab|bit', or {t, pic, sub, label, play:[steps]} */
function chip(x) {
  const o = typeof x === 'string' ? { t: x } : x, w = plain(o.t), b = h('button', 'chip'), pic = 'pic' in o ? o.pic : picOf(w), steps = o.play || [W(w)];
  b.type = 'button'; if (pic) b.append(h('span', 'chip-pic', pic)); b.append(markedEl(o.t, 'chip-t')); if (o.sub) b.append(h('small', 'chip-sub', o.sub));
  b.setAttribute('aria-label', o.label || w); b.title = 'Hear ' + (o.label || w); b.onclick = () => phPlay(steps); b.steps = steps; return b
}
const grid = cls => h('div', 'grid ' + (cls || ''));
const subhead = t => h('h2', 'ph-sub', t);
const symOf = id => ({ a1: 'a', e1: 'e', i1: 'i', o1: 'o', u1: 'u', c: 'c / k' }[id] || id);

/* word card with sound tiles: Blend plays each sound, then the word, then shows its picture.
   oral: the letters stay hidden (dots) and the picture is a mystery until the word is heard */
function blendCard(w, oral) {
  const toks = w.split('-'), word = toks.join(''), pic = picOf(word), c = h('div', 'card wb' + (oral ? ' oral' : '')), row = h('span', 'tiles');
  toks.forEach(t => row.append(h('span', 'tile', oral ? '●' : t))); c.append(row);
  const b = h('button', 'btn g', oral ? '🎧 Listen' : '▶ Blend'), reveal = h('span', 'wb-reveal', oral ? '🎁' : '');
  b.type = 'button'; b.title = oral ? 'Hear the sounds, then find out the word' : 'Hear each sound, then hear the whole word';
  b.onclick = async () => {
    const ok = await phPlay([...tileSteps(w, $$('.tile', c)), FN(() => c.classList.add('done')), W(word)], oral ? 'It was ' + word + '! Try another mystery.' : 'Word blended. Choose another word when ready.', 'Blending sounds…');
    c.classList.remove('done'); if (!ok) return;
    reveal.replaceChildren(); if (pic) reveal.append(h('span', 'wb-pic', pic)); if (oral) reveal.append(h('b', 'wb-word', word)); c.classList.add('seen')
  }; c.append(b, reveal); return c
}
/* sound boxes: one box per sound (letters or dots); "Say it slowly" fills them in order */
function boxCard(w, letters) {
  const toks = w.split('-'), ids = soundsOf(toks), word = toks.join(''), c = h('div', 'card sbox-card'), units = toks.map((t, k) => [t, ids[k]]).filter(u => u[1]);
  const top = h('div', 'sb-top'); top.append(h('span', 'sb-pic', picOf(word) || '🔊')); if (letters) top.append(h('b', 'sb-word', word)); c.append(top);
  const row = h('div', 'sboxes'), count = h('p', 'sb-count'), boxes = units.map(([, id]) => {
    const b = h('button', 'sbox'); b.type = 'button'; b.setAttribute('aria-label', 'Sound box'); b.onclick = () => { if (b.classList.contains('full')) phPlay([lit(S(id), b)]) }; return b
  });
  row.append(...boxes);
  const go = h('button', 'btn g', '🐢 Say it slowly'); go.type = 'button'; go.title = 'Hear the word, then each sound going into its box';
  go.onclick = () => {
    boxes.forEach(b => { b.textContent = ''; b.classList.remove('full') }); count.textContent = '';
    phPlay([W(word), GAP(300), ...units.flatMap(([t, id], k) => [FN(() => { boxes[k].textContent = letters ? t : '●'; boxes[k].classList.add('full') }), lit(S(id), boxes[k]), GAP(150)]),
      FN(() => { count.textContent = (letters && word.length !== units.length ? word.length + ' letters, ' : '') + units.length + ' sounds' })], word + ' has ' + units.length + ' sounds.')
  };
  c.append(row, go, count); return c
}
/* syllable card: the word, then one clap per beat (dots, or the written chunks) */
function clapCard(w, beats) {
  const parts = w.split('-'), word = parts.join(''), c = h('button', 'card clap'), row = h('span', 'beats'), els = parts.map(p => h('span', beats ? 'beat' : 'part', beats ? '●' : p));
  c.type = 'button'; c.title = 'Hear the word and clap its beats'; row.append(...els);
  c.append(h('span', 'ph-pic', picOf(word)), h('span', 'clap-w', word), row);
  c.onclick = () => phPlay([W(word), GAP(300), ...els.map(e => lit({ sfx: 1 }, e)), GAP(150), W(word)], word + ': ' + parts.length + (parts.length > 1 ? ' claps!' : ' clap!')); return c
}
function buildCard([parts, w, mean]) {
  const c = h('button', 'card build'), row = h('span', 'build-parts'), els = parts.map(p => h('span', 'tile' + (typeof p === 'string' ? '' : ' affix'), typeof p === 'string' ? p : p[0]));
  c.type = 'button'; c.title = 'Hear the parts join into ' + w; els.forEach((e, k) => { if (k) row.append(h('span', 'plus', '+')); row.append(e) });
  c.append(row, h('span', 'eq', '='), h('span', 'ph-pic', picOf(w)), h('b', 'clap-w', w)); if (mean) c.append(h('small', 'ph-hint', mean));
  c.onclick = () => phPlay([...parts.map((p, k) => lit(typeof p === 'string' ? W(p) : SAY(p[1]), els[k])), GAP(200), lit(W(w), c, 'done'), ...(mean ? [SAY(mean)] : [])], w + (mean ? ': ' + mean : '') + '.'); return c
}

/* groups of chips under a header you can tap: {big, title, sub, sound, words} */
function groupsView(t, B) {
  const wrap = h('div', 'groups' + (t.cols ? ' cols' : ''));
  t.groups.forEach(g => {
    const sec = h('section', 'grp'), head = h('button', 'grp-h'), chips = h('div', 'chips'), els = g.words.map(chip); head.type = 'button';
    if (g.big) head.append(h('span', 'grp-big', g.big)); const tx = h('span', 'grp-tx'); tx.append(h('b', 'grp-t', g.title)); if (g.sub) tx.append(h('small', 'grp-sub', g.sub)); head.append(tx, h('span', 'grp-play', '🔊'));
    head.title = 'Hear ' + (g.sound ? 'the sound and ' : '') + 'every word';
    head.onclick = () => phPlay([...(g.sound ? [lit(S(g.sound), head), GAP(200)] : []), ...els.flatMap(e => e.steps.map(s => lit(s, e)))]);
    chips.append(...els); sec.append(head, chips); wrap.append(sec)
  });
  B.append(wrap)
}

const VIEWS = {
  cards(t, B) {
    const g = grid(); t.items.forEach(x => g.append(phCard(x))); customFor(t.id).forEach(c => g.append(withDel(t.id, customItem(t.id, c)))); B.append(g);
    if (t.items.some(x => x.sentences)) B.append(sentenceList(t.items))
  },
  names(t, B) {
    const g = grid('abc'); Object.entries(ABC).forEach(([l, [name, id, w]]) => g.append(phCard({ s: l.toUpperCase() + l, k: id, fb: name, ex: [w], label: 'Name “' + name + '”, sound', steps: [N(l), GAP(300), S(id), W(w)] }))); B.append(g)
  },
  words(t, B) {
    if (t.steps) { const s = h('ol', 'decode-steps'); ['👀 Look at each letter', '🗣️ Say each sound', '🧩 Blend them together', '✅ Does it make sense?'].forEach(x => s.append(h('li', 0, x))); B.append(s) }
    (t.sets || [[null, t.words]]).forEach(([title, words]) => {
      if (title) B.append(subhead(title)); const g = grid('g2'); words.forEach(w => g.append(blendCard(w, t.oral)));
      if (t.custom) customFor(t.id).forEach(cw => g.append(wrapDel(t.id, cw.id, blendCard(cw.s)))); B.append(g)
    })
  },
  mix(t, B) {
    const g = grid('g2'), deal = () => g.replaceChildren(...shuf(t.words).slice(0, 6).map(w => blendCard(w))), b = h('button', 'btn kid-btn', '🎲 Shuffle the words');
    b.type = 'button'; b.onclick = () => { stopPhonics(); deal() }; B.append(b, g); deal()
  },
  boxes(t, B) { const g = grid('g2'); t.words.forEach(w => g.append(boxCard(w, t.letters))); B.append(g) },
  clap(t, B) { t.sets.forEach(([title, words]) => { B.append(subhead(title)); const g = grid('g3'); words.forEach(w => g.append(clapCard(w, t.beats))); B.append(g) }) },
  groups: groupsView,
  listen(t, B) {
    groupsView({ groups: [
      { big: '🐾', title: 'Who says that?', sub: 'Tap an animal to hear its sound.', words: ANIMALS.map(([a, s]) => ({ t: a, sub: '“' + s + '”', label: a + ' says ' + s, play: [W(s)] })) },
      { big: '👂', title: 'Same or different?', sub: 'Listen to two words. Are they the same?', words: SAME_DIFF.map(([a, b]) => ({ t: a + ' · ' + b, pic: '👂', label: a + ' and ' + b, play: [W(a), GAP(500), W(b)] })) }] }, B)
  },
  sounds(t, B) {
    const say = { first: 'Starts with ', last: 'Ends with ', middle: 'In the middle: ' }[t.where];
    groupsView({ groups: Object.entries(t.groups).map(([id, words]) => ({ big: symOf(id), title: say + symOf(id), sound: id, words })) }, B)
  },
  letters(t, B) {
    const mark = w => t.where === 'first' ? '«' + w[0] + '»' + w.slice(1) : w.slice(0, -1) + '«' + w.slice(-1) + '»';
    groupsView({ groups: Object.entries(t.groups).map(([id, words]) => ({ big: id, title: (t.where === 'first' ? 'Starts with the letter ' : 'Ends with the letter ') + id, sound: id, words: words.map(mark) })) }, B)
  },
  onset(t, B) {
    const g = grid('g3'); t.items.forEach(([o, r]) => {
      const w = o + r, c = h('button', 'card onset'), a = h('span', 'tile', o), b = h('span', 'tile rime', r), row = h('span', 'tiles');
      c.type = 'button'; c.title = 'Hear ' + o + '… ' + r + '… ' + w; row.append(a, b); c.append(h('span', 'ph-pic', picOf(w)), row, h('span', 'clap-w', w));
      c.onclick = () => phPlay([lit(S(o), a), GAP(300), lit(R(r), b), GAP(250), lit(W(w), c, 'done')], o + ' + ' + r + ' = ' + w + '!'); g.append(c)
    }); B.append(g)
  },
  swap(t, B) {
    const g = grid('g2'); t.items.forEach(([a, b, pos]) => {
      const c = h('button', 'card swap'), tiles = [...a].map(x => h('span', 'tile', x)), row = h('span', 'tiles'), pics = h('span', 'swap-pics'), tl = tiles[pos];
      c.type = 'button'; c.title = 'Change ' + a[pos] + ' to ' + b[pos]; row.append(...tiles); pics.append(h('span', 'ph-pic', picOf(a)), h('span', 'swap-arrow', '➜'), h('span', 'ph-pic', picOf(b)));
      c.append(pics, row, h('span', 'clap-w', a + ' → ' + b));
      c.onclick = () => phPlay([FN(() => { tl.textContent = a[pos]; tl.classList.remove('new') }), W(a), SAY('Change'), lit(S(SND[a[pos]] || a[pos]), tl), SAY('to'),
        FN(() => { tl.textContent = b[pos]; tl.classList.add('new') }), lit(S(SND[b[pos]] || b[pos]), tl), GAP(300), lit(W(b), c, 'done')], 'New word: ' + b + '!'); g.append(c)
    }); B.append(g)
  },
  pairs(t, B) {
    const g = grid('g2'); t.pairs.forEach(([a, b]) => {
      const k = [...a].findIndex((x, i) => x !== b[i]), c = h('div', 'card pair'), half = w => {
        const x = h('button', 'pair-w'); x.type = 'button'; x.title = 'Hear ' + w; x.append(h('span', 'ph-pic', picOf(w)), markedEl(w.slice(0, k) + '«' + w[k] + '»' + w.slice(k + 1), 'pair-t')); x.onclick = () => phPlay([W(w)]); return x
      }, A = half(a), Z = half(b), both = h('button', 'btn t', '🔁 Hear both');
      both.type = 'button'; both.onclick = () => phPlay([lit(W(a), A), GAP(500), lit(W(b), Z)], a + ' or ' + b + '? Listen to the middle sound.');
      c.append(A, h('span', 'vs', 'or'), Z, both); g.append(c)
    }); B.append(g)
  },
  family(t, B) {
    const bar = h('div', 'tabs fam-bar'), stage = h('div', 'card fam'), onsets = h('div', 'fam-onsets'), tOn = h('span', 'tile'), tRime = h('span', 'tile rime'), row = h('div', 'tiles'),
      pic = h('div', 'fam-pic'), word = h('div', 'fam-w'), sing = h('button', 'btn kid-btn', '🎶 Say the whole family');
    let fam = 'at'; row.append(tOn, tRime); sing.type = 'button';
    const set = (f, o, play) => {
      fam = f; const w = o + f; tOn.textContent = o; tRime.textContent = f; pic.textContent = picOf(w) || '✨'; word.textContent = w;
      $$('button', bar).forEach(b => { const on = b.dataset.f === f; b.classList.toggle('a', on); b.setAttribute('aria-pressed', String(on)) });
      onsets.replaceChildren(...t.fam[f].map(x => { const b = h('button', 'fam-on' + (x === o ? ' a' : ''), x); b.type = 'button'; b.title = 'Make ' + x + f; b.onclick = () => set(f, x, true); return b }));
      if (play) phPlay([lit(S(o), tOn), GAP(200), lit(R(f), tRime), GAP(150), lit(W(w), row, 'done')], w + ' is in the ' + f + ' family.')
    };
    Object.keys(t.fam).forEach(f => { const b = h('button', 0, '-' + f); b.type = 'button'; b.dataset.f = f; b.title = 'The ' + f + ' family'; b.onclick = () => set(f, t.fam[f][0], true); bar.append(b) });
    sing.onclick = () => phPlay(t.fam[fam].flatMap(o => [FN(() => set(fam, o)), lit(W(o + fam), row, 'done'), GAP(200)]), 'That is the ' + fam + ' family!');
    stage.append(pic, row, word, h('p', 'mut fam-help', 'Change the first letter:'), onsets, sing); B.append(bar, stage); set('at', 'c')
  },
  magic(t, B) {
    const g = grid('g2'); t.pairs.forEach(([a, b]) => {
      const c = h('div', 'card magic'), tiles = [...a].map(x => h('span', 'tile', x)), e = h('span', 'tile e-tile', 'e'), row = h('span', 'tiles'), pic = h('span', 'ph-pic'), word = h('b', 'clap-w'),
        wand = h('button', 'btn kid-btn play'), both = h('button', 'btn t', '🔁 Hear both'), v = a[1];
      row.append(...tiles, e); wand.type = both.type = 'button';
      const show = on => { c.classList.toggle('long', on); pic.textContent = picOf(on ? b : a) || (on ? '✨' : '🔤'); word.textContent = on ? b : a; wand.textContent = on ? '↩️ Take e away' : '✨ Add magic e' };
      wand.onclick = () => { const on = !c.classList.contains('long'); show(on); phPlay([lit(S(on ? LONG[v] : SND[v]), tiles[1]), GAP(200), W(on ? b : a)], on ? 'Magic e! ' + a + ' became ' + b + '.' : 'Back to ' + a + '.') };
      both.onclick = () => phPlay([FN(() => show(false)), W(a), GAP(500), FN(() => show(true)), W(b)], a + ', ' + b + '.');
      show(false); c.append(pic, row, word, wand, both); g.append(c)
    }); B.append(g)
  },
  builder(t, B) {
    const g = grid('g2'); t.rows.forEach(r => g.append(buildCard(r))); B.append(g);
    if (t.sums) { B.append(subhead('Word sums: bigger words from parts')); const s = grid('g2'); t.sums.forEach(r => s.append(buildCard(r))); B.append(s) }
  },
  sight(t, B) {
    B.append(h('p', 'mut', '❤️ = a tricky part to learn by heart. Tap a word to hear it in a sentence.'));
    const g = grid('g4'); t.words.forEach(([m, s]) => {
      const w = plain(m), b = h('button', 'card sight'); b.type = 'button'; b.title = 'Hear ' + w + ' in a sentence';
      b.append(markedEl(m, 'sight-w')); if (m.includes('«')) b.append(h('span', 'heart', '❤️')); b.append(h('small', 'mut', s));
      b.onclick = () => phPlay([lit(W(w), b, 'done'), GAP(250), SAY(s)], s); g.append(b)
    }); B.append(g)
  },
  dictation(t, B) {
    B.append(h('p', 'mut', 'Grown-ups: tap a card to say the word. Your child says the sounds and writes the word (or spells it out loud), then tap Check.'));
    const g = grid('g3'); t.words.forEach((w, k) => {
      const word = plain(w), c = h('div', 'card dict'), hear = h('button', 'btn t kid-btn', '🔊 Word ' + (k + 1)), ans = h('div', 'dict-ans'), chk = h('button', 'btn s', '👀 Check');
      hear.type = chk.type = 'button'; hear.onclick = () => phPlay([W(word)], 'Say the sounds, then spell it.');
      chk.onclick = () => { const row = h('span', 'tiles'); w.split('-').forEach(x => row.append(h('span', 'tile', x))); ans.replaceChildren(h('span', 'ph-pic', picOf(word)), row); chk.hidden = true; phPlay([...tileSteps(w, $$('.tile', row)), W(word)], 'Did you spell ' + word + '?') };
      c.append(hear, ans, chk); g.append(c)
    }); B.append(g)
  },
  sentences(t, B) {
    const wrap = h('div', 'ph-sent'); t.sentences.forEach(([s, w]) => {
      const r = h('div', 'row ph-row'), ic = h('button', 'ic', '🔊'), p = h('span', 'ph-line'); ic.type = 'button'; ic.title = 'Read this sentence aloud'; ic.setAttribute('aria-label', 'Read sentence aloud');
      ic.onclick = () => phPlay([lit(SAY(s), p)], 'Sentence finished. Choose another when ready.', 'Reading sentence…'); p.append(...wordsOf(s));
      r.append(ic, h('span', 'ph-pic sm', picOf(w)), p); wrap.append(r)
    }); B.append(h('p', 'mut', 'Read it first, then tap 🔊 to check. Tap any word to hear just that word.'), wrap)
  },
  stories(t, B) {
    t.stories.forEach(st => {
      const c = h('div', 'card story'), head = h('div', 'story-h'), lines = st.lines.map(l => { const p = h('p', 'story-l'); p.append(...wordsOf(l)); return p }), read = h('button', 'btn kid-btn', '🔊 Read me the story');
      read.type = 'button'; head.append(h('span', 'story-pic', st.pic), h('h2', 0, st.title));
      read.onclick = () => phPlay(lines.flatMap((p, k) => [lit(SAY(st.lines[k]), p), GAP(300)]), 'The end! Now you read it.', 'Reading the story…');
      c.append(head, ...lines, read); B.append(c)
    })
  },
  flash(t, B) {
    let deck = shuf(t.words), k = 0;
    const c = h('div', 'card flash'), word = h('div', 'flash-w'), pic = h('div', 'flash-pic'), n = h('p', 'mut'), row = h('div', 'row flash-btns'),
      mk = (txt, title, fn) => { const b = h('button', 'btn kid-btn', txt); b.type = 'button'; b.title = title; b.onclick = fn; row.append(b); return b };
    const show = () => { word.textContent = plain(deck[k]); pic.textContent = ''; n.textContent = 'Word ' + (k + 1) + ' of ' + deck.length };
    mk('🐢 Sound it out', 'Hear each sound', () => phPlay([...tileSteps(deck[k]), W(plain(deck[k]))]));
    mk('✅ Check', 'Hear the word and see its picture', () => { pic.textContent = picOf(plain(deck[k])); phPlay([lit(W(plain(deck[k])), word, 'done')], 'Did you read it right?') });
    mk('➡️ Next', 'Next word', () => { stopPhonics(); k = (k + 1) % deck.length; show() });
    mk('🔀 Shuffle', 'Mix up the words', () => { stopPhonics(); deck = shuf(t.words); k = 0; show() });
    c.append(n, word, pic, row); B.append(c); show()
  },
  fluency(t, B) {
    let cur = 0, timer = null, t0 = 0, spans = [];
    const bar = h('div', 'tabs'), c = h('div', 'card flu'), text = h('div', 'flu-text'), row = h('div', 'row flu-btns'), clock = h('div', 'flu-clock'), res = h('p', 'flu-res'),
      mk = (txt, title, fn) => { const b = h('button', 'btn kid-btn', txt); b.type = 'button'; b.title = title; b.onclick = fn; row.append(b); return b },
      best = () => LS.get('pp_fluency', {}), fmt = s => s.toFixed(1) + ' s', sents = () => t.passages[cur].text.split(/(?<=[.!?])\s+/);
    const halt = () => { clearInterval(timer); timer = null; go.textContent = '⏱️ Time my reading'; clock.textContent = '' };
    const show = k => {
      halt(); stopPhonics(); cur = k; spans = sents().map(s => { const e = h('span', 'flu-s'); e.append(...wordsOf(s), ' '); return e }); text.replaceChildren(...spans);
      $$('button', bar).forEach((b, j) => { b.classList.toggle('a', j === k); b.setAttribute('aria-pressed', String(j === k)) });
      const b = best()[k]; res.textContent = b ? 'Your best time: ' + fmt(b) : 'No time yet. Listen first, then have a go!'
    };
    t.passages.forEach((p, k) => { const b = h('button', 0, p.level + ': ' + p.title); b.type = 'button'; b.onclick = () => show(k); bar.append(b) });
    mk('🔊 Read it to me', 'Listen to the passage read smoothly', () => { halt(); phPlay(sents().flatMap((s, k) => [lit(SAY(s, .85), spans[k]), GAP(200)]), 'Now you try!', 'Reading…') });
    mk('🦜 Echo read', 'I read a sentence, then you read it back', () => { halt(); phPlay(sents().flatMap((s, k) => [lit(SAY(s, .85), spans[k]), FN(() => phStatus('Your turn! Read it out loud.')), lit(GAP(1200 + s.split(' ').length * 450), spans[k], 'turn')]), 'Great echo reading!', 'Echo reading…') });
    const go = mk('⏱️ Time my reading', 'Start the timer, read aloud, then tap again when you finish', () => {
      if (!timer) { stopPhonics(); t0 = performance.now(); go.textContent = '✅ I’m done!'; res.textContent = 'Read the whole passage out loud…'; timer = setInterval(() => { clock.textContent = fmt((performance.now() - t0) / 1000) }, 100); return }
      const secs = (performance.now() - t0) / 1000, words = t.passages[cur].text.split(/\s+/).length, all = best(), beat = !all[cur] || secs < all[cur]; halt();
      res.textContent = 'You read ' + words + ' words in ' + fmt(secs) + ' (about ' + Math.round(words / secs * 60) + ' words a minute).' + (beat ? ' ⭐ New best time!' : ' Best: ' + fmt(all[cur]) + '.');
      if (beat) { all[cur] = secs; LS.set('pp_fluency', all); clapSfx() } phStatus(beat ? 'New best time! Well done.' : 'Well read! Try again to beat your best.')
    });
    phCleanup = halt; c.append(text, row, clock, res); B.append(bar, c); show(0)
  }
};
/* a view that runs a timer sets this so leaving the topic stops it */
let phCleanup = null;
