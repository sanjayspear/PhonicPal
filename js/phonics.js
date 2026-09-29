/* Phonics data. Audio: assets/audio/s_<id>.mp3 (sounds) and w_<word>.mp3 (words), rendered offline with Kokoro (see tools/).
   Item: s = symbol shown, k = sound audio id, fb = browser-voice fallback, ex = example words, tag = short/long label */
const it = (s, k, fb, ex, tag, hint) => ({ s, k, fb, ex, tag, hint });
const V = [it('a', 'a1', 'add', ['apple', 'cat', 'mat', 'bag'], 'short'), it('e', 'e1', 'end', ['egg', 'nest', 'bed', 'pen'], 'short'), it('i', 'i1', 'in', ['igloo', 'fish', 'pin', 'sit'], 'short'), it('o', 'o1', 'odd', ['octopus', 'dog', 'hot', 'top'], 'short'), it('u', 'u1', 'up', ['umbrella', 'cup', 'bus', 'sun'], 'short'),
it('ā', 'a2', 'ay', ['cake', 'rain', 'baby', 'game'], 'long'), it('ē', 'e2', 'ee', ['tree', 'me', 'feet', 'equal'], 'long'), it('ī', 'i2', 'eye', ['kite', 'night', 'ice', 'light'], 'long'), it('ō', 'o2', 'oh', ['boat', 'rope', 'note', 'go'], 'long'), it('ū', 'u2', 'you', ['unicorn', 'cute', 'music', 'cube'], 'long')];
const cs = (s, fb, w, hint) => it(s, s, fb, [w], undefined, hint);
const C = [cs('b', 'buh', 'ball'), cs('c', 'kuh', 'cat', 'Hard c says k. Before e, i or y it usually says s, as in city.'), cs('d', 'duh', 'dog'), cs('f', 'fuh', 'fish'), cs('g', 'guh', 'goat', 'Hard g as in goat. Before e, i or y it can say j, as in gem.'), cs('h', 'huh', 'hat'), cs('j', 'juh', 'jam'), cs('k', 'kuh', 'kite'), cs('l', 'luh', 'lion'), cs('m', 'muh', 'moon'), cs('n', 'nuh', 'nest'), cs('p', 'puh', 'pig'), cs('q', 'kwuh', 'queen'), cs('r', 'ruh', 'rabbit'), cs('s', 'suh', 'sun'), cs('t', 'tuh', 'tent'), cs('v', 'vuh', 'van'), cs('w', 'wuh', 'web'), cs('x', 'kuhs', 'box', 'x says ks, as at the end of box.'), cs('y', 'yuh', 'yak'), cs('z', 'zuh', 'zebra')];
const VB = [it('ai', 'a2', 'ay', ['rain']), it('ee', 'e2', 'ee', ['bee']), it('oa', 'o2', 'oh', ['boat']), it('oo', 'oo', 'ooh', ['moon'], undefined, 'Also in flute and rule.'), it('ou', 'ou', 'ow', ['cloud'], undefined, 'A glide sound: see Diphthongs too.'), it('ie', 'i2', 'eye', ['pie']), it('ea', 'e2', 'ee', ['leaf']), it('ow', 'o2', 'oh', ['snow'], undefined, 'ow can also say ow, as in cow.')];
const CB = [cs('bl', 'bluh', 'blue'), cs('br', 'bruh', 'brush'), cs('cl', 'cluh', 'clap'), cs('fr', 'fruh', 'frog'), cs('gr', 'gruh', 'grape'), cs('st', 'stuh', 'star'), cs('tr', 'truh', 'tree')];
const WB = ['c-a-t', 's-u-n', 'p-i-g', 'd-o-g', 'b-u-s', 'h-e-n', 'sh-i-p', 'fr-o-g', 'ch-i-p', 'cl-a-p', 'st-o-p', 'th-i-n'];
const SND = { a: 'a1', e: 'e1', i: 'i1', o: 'o1', u: 'u1' }, LONG = { a: 'a2', e: 'e2', i: 'i2', o: 'o2', u: 'u2' };
/* letter teams that make one sound -> audio id (shares splitWord's list in custom-phonics.js) */
const TEAM = { ai: 'a2', ay: 'a2', ee: 'e2', ea: 'e2', ie: 'i2', igh: 'i2', oa: 'o2', ow: 'o2', oo: 'oo', ou: 'ou', oi: 'oi', oy: 'oi', ar: 'ar', er: 'er', ir: 'ir', or: 'or', ur: 'ur', ck: 'k', ph: 'f', qu: 'q' };
/* tiles -> sound id per tile; silent e (c-a-k-e) makes the vowel long and plays nothing (null) */
function soundsOf(toks) {
  const n = toks.length, magic = n >= 3 && toks[n - 1] === 'e' && LONG[toks[n - 3]] && !/[aeiouy]/.test(toks[n - 2]);
  return toks.map((t, k) => magic && k === n - 1 ? null : magic && k === n - 3 ? LONG[t] : SND[t] || TEAM[t] || t)
}
const phStatus = message => { const el = $('#phstatus'); if (el) el.textContent = message };
/* Curriculum modules (data lives in js/curriculum.js) */
const toItems = list => list.map(d => ({ s: d.grapheme, k: d.audio, fb: d.grapheme, ex: d.examples, hint: d.hint, sentences: d.sentences }));
const DG = toItems(CURRICULUM.digraphs), RC = toItems(CURRICULUM.rControlled), DP = toItems(CURRICULUM.diphthongs);
const PT = [
  ['Vowel Sounds', V, 'Short vowels on top, long vowels (that say their name) below. Tap a card to hear the sound and its words.'],
  ['Consonant Sounds', C, 'Tap a card to hear the sound and an example word.'],
  ['Vowel Teams', VB, 'Two letters team up to make one vowel sound.'],
  ['Consonant Blending', CB, 'Two consonants blend together; you can still hear both sounds.'],
  ['Consonant Digraphs', DG, 'Two letters team up to make one new sound (not a blend).'],
  ['R-Controlled Vowels', RC, 'Bossy R changes the vowel sound before it.'],
  ['Diphthongs', DP, 'Two vowel sounds glide together in one syllable.'],
  ['Word Blending Practice', null, 'Listen to each sound, then hear them blend into a word.']];
const title = t => t.replace(/\b\w/g, c => c.toUpperCase());
const labelOf = x => x.tag ? title(x.tag) + ' Sound' : (x.ex.length > 1 ? 'Example Words' : 'Example Word');
/* Phonics owns the speaker from its last tap until anything else speaks (Speech.epoch changes).
   Leaving the Phonics screen or opening another phonics feature silences only that phonics audio. */
let phEp = null;
const phOwn = () => { phEp = Speech.epoch() };
function stopPhonics() { if (phEp !== null && Speech.epoch() === phEp) Speech.stop(); phEp = null }
document.addEventListener('tabchange', e => { if (e.detail.from === 'phonics') stopPhonics() });
/* One phonics card: big symbol, bold label with colon, then words on their own line */
function phCard(x) {
  const b = h('button', 'card ph-card'), lbl = labelOf(x); if (x.tag) b.dataset.tag = x.tag;
  b.title = 'Play the ' + x.s + ' sound and hear ' + x.ex.join(', ') + '.';
  b.setAttribute('aria-label', x.s + '. ' + lbl + ': ' + x.ex.join(', '));
  const cap = h('span', 'ph-cap'); cap.append(h('strong', 'ph-lbl', lbl + ':'), document.createTextNode(' '), h('span', 'ph-words', x.ex.join(', ')));
  b.append(h('span', 'big', x.s), cap); if (x.hint) b.append(h('small', 'ph-hint', x.hint));
  b.onclick = async () => {
    phStatus('Playing sound and example words…');
    try {
      const first = x.custom ? Speech.say(x.fb, .7) : Speech.clip('s_' + x.k, x.fb), ep = Speech.epoch(); phOwn(); await first;
      for (const w of x.ex) { if (Speech.epoch() !== ep) return; await (x.custom ? Speech.say(w, .7, true) : Speech.clip('w_' + w, w, true)) }
      if (Speech.epoch() === ep) phStatus('Sound practice finished. Choose another card when ready.')
    } catch (e) { phStatus('Sound could not play. Check your voice settings and try again.') }
  }; return b
}
function sentenceList(items) {
  const wrap = h('div', 'ph-sent'); wrap.append(h('h2', 0, 'Practice Sentences'));
  items.forEach(x => (x.sentences || []).forEach(t => {
    const r = h('div', 'row ph-row'), ic = h('button', 'ic', '🔊'); ic.title = 'Read this sentence aloud'; ic.setAttribute('aria-label', 'Read sentence aloud'); ic.onclick = async () => {
      phStatus('Reading practice sentence…');
      try { const p = Speech.say(plainText(t), .8), ep = Speech.epoch(); phOwn(); await p; if (Speech.epoch() === ep) phStatus('Sentence finished. Choose another when ready.') }
      catch (e) { phStatus('Sentence could not play. Check your voice settings and try again.') }
    };
    const p = h('span', 'ph-line'); parseMarked(t).forEach(seg => p.append(seg.hit ? h('mark', 0, seg.t) : document.createTextNode(seg.t))); r.append(ic, p); wrap.append(r)
  })); return wrap
}
let phTab = 0;   /* index of the open tab; custom-phonics.js reads it */
function renderPh(i) {
  stopPhonics(); phTab = i; $$('#ptabs button').forEach((b, j) => { const active = i === j; b.classList.toggle('a', active); b.setAttribute('aria-pressed', String(active)) }); $('#pintro').textContent = PT[i][2]; phStatus(PT[i][0] + ' ready. Choose a card to listen.'); const B = $('#pbody'); B.replaceChildren(); const items = PT[i][1]; let g;
  if (items && i === 0) { g = h('div', 'vgrid'); for (let k = 0; k < 5; k++) { const pair = h('div', 'vpair'); pair.append(phCard(items[k]), phCard(items[k + 5])); g.append(pair) } }
  else if (items) { g = h('div', 'grid'); items.forEach(x => g.append(phCard(x))); customFor(i).forEach(c => g.append(withDel(i, customItem(i, c)))) }
  else {
    g = h('div', 'grid g2');[...WB.map(w => ({ s: w })), ...customFor(7)].forEach(cw => {
      /* tiles sit in their own no-wrap row so the word always reads left to right */
      const w = cw.s, toks = w.split('-'), ids = soundsOf(toks), c = h('div', 'card wb'), row = h('span', 'tiles'); toks.forEach(t => row.append(h('span', 'tile', t))); c.append(row);
      const b = h('button', 'btn g', '▶ Blend'); b.title = 'Hear each sound, then hear the whole word'; b.onclick = async () => {
        phStatus('Blending sounds…'); const t = $$('.tile', c), reset = () => { c.classList.remove('done'); t.forEach(x => x.classList.remove('on')) };
        try {
          let ep;
          for (let k = 0; k < toks.length; k++) {
            if (k && Speech.epoch() !== ep) return reset();
            t[k].classList.add('on'); const p = ids[k] ? Speech.clip('s_' + ids[k], toks[k], k > 0) : wait(350); if (!k) { ep = Speech.epoch(); phOwn() } await p; t[k].classList.remove('on')
          }
          if (Speech.epoch() !== ep) return reset();
          c.classList.add('done'); await Speech.clip('w_' + toks.join(''), toks.join(''), true); reset(); if (Speech.epoch() === ep) phStatus('Word blended. Choose another word when ready.')
        } catch (e) { reset(); phStatus('Blending could not play. Check your voice settings and try again.') }
      }; c.append(b); g.append(cw.id ? wrapDel(7, cw.id, c) : c)
    })
  }
  B.append(g); if (items && items.some(x => x.sentences)) B.append(sentenceList(items))
}
PT.forEach((p, i) => { const b = h('button', 0, p[0]); b.onclick = () => renderPh(i); $('#ptabs').append(b) }); renderPh(0);
initCustomForm();
