/* "Play the game": a 5-round game for each topic, for 4 to 5 year olds. Everything is spoken, choices are big pictures,
   letters or words, wrong taps just wiggle and say "try again", and every round ends with stars and a celebration.
   Loaded AFTER phonics.js. GEN[topic.game](topic) makes the questions; the dialog plays them. */
const GAME_ROUNDS = 5;
const PRAISE = ['Yay!', 'Super!', 'Well done!', 'You got it!', 'Brilliant!', 'Great listening!'];
/* items that sound the same must never be offered together (c/k, ee/ea, er/ir/ur, oi/oy, ou/ow) */
const SAME = { c: 'k' };
const soundKey = x => x.ipa || SAME[x.k] || x.k;
const pick = a => a[Math.floor(Math.random() * a.length)];
const withPic = ws => ws.filter(w => picOf(plain(w)));
/* n items from list, leaving out avoid */
const others = (list, n, avoid = []) => shuf(list.filter(x => !avoid.includes(x))).slice(0, n);
/* n picture words from pool whose pictures differ from right's, from avoid's and from each other */
function picOthers(right, pool, n, avoid = []) {
  const seen = new Set([right, ...avoid].map(picOf)), out = [];
  for (const w of shuf(pool)) if (out.length < n && w !== right && picOf(w) && !seen.has(picOf(w))) { seen.add(picOf(w)); out.push(w) }
  return out
}
/* GAME_ROUNDS questions, cycling through a shuffled pool so nothing repeats until everything has had a turn */
function rounds(pool, make) {
  const order = shuf(pool), qs = [];
  for (let r = 0; qs.length < GAME_ROUNDS && r < GAME_ROUNDS * 3; r++) { const q = make(order[r % order.length], qs.length); if (q) qs.push(q) }
  return qs
}
const picCh = (right, wrong) => shuf([{ label: right, pic: picOf(right), ok: true }, ...wrong.map(w => ({ label: w, pic: picOf(w), ok: false }))]);
/* text choices; «» marks and | splits are shown, and the label read to screen readers names the marked part */
const said = t => t.replace(/«([^»]*)»/g, ' ($1) ').replace(/\|/g, '-').replace(/\s+/g, ' ').trim();
const txtCh = (right, wrong) => shuf([{ label: said(right), text: right, ok: true }, ...wrong.map(w => ({ label: said(w), text: w, ok: false }))]);
/* the sounds of 'c-a-t' as game steps, each lighting its tile in #gameTiles */
const tileTargets = w => soundsOf(w.split('-')).map((id, k) => ({ ...(id ? S(id) : GAP(350)), tile: k }));
const soundOut = w => w.includes('-') ? soundsOf(w.split('-')).filter(Boolean).map(id => S(id)) : [];
/* "cake" with the letters of ā marked: ca«k»e -> c«a»ke */
function markIn(word, s) { const l = s.normalize('NFD').replace(/[̀-ͯ]/g, ''), at = word.indexOf(l); return at < 0 ? word : word.slice(0, at) + '«' + l + '»' + word.slice(at + l.length) }

/* Sorting games: which bucket does the word belong in? */
const SORTS = {
  openclosed: { ask: 'Is it open or closed?', buckets: { open: ['🚪', 'Open'], closed: ['🔒', 'Closed'] },
    items: [['go', 'open'], ['me', 'open'], ['hi', 'open'], ['no', 'open'], ['she', 'open'], ['we', 'open'], ['be', 'open'], ['so', 'open'], ['cat', 'closed'], ['up', 'closed'], ['sun', 'closed'], ['dog', 'closed'], ['it', 'closed'], ['bed', 'closed'], ['fish', 'closed'], ['hop', 'closed']] },
  softc: { ask: 'Does the c say k, or s?', buckets: { k: ['k', 'says k', 'k'], s: ['s', 'says s', 's'] },
    items: [['«c»at', 'k'], ['«c»up', 'k'], ['«c»ake', 'k'], ['«c»ar', 'k'], ['«c»orn', 'k'], ['«c»ow', 'k'], ['«c»ity', 's'], ['i«c»e', 's'], ['ri«c»e', 's'], ['mi«c»e', 's'], ['«c»ircle', 's'], ['pen«c»il', 's']] },
  softg: { ask: 'Does the g say g, or j?', buckets: { g: ['g', 'says g', 'g'], j: ['j', 'says j', 'j'] },
    items: [['«g»oat', 'g'], ['«g»ate', 'g'], ['fro«g»', 'g'], ['ba«g»', 'g'], ['«g»irl', 'g'], ['«g»ift', 'g'], ['«g»iraffe', 'j'], ['«g»em', 'j'], ['pa«g»e', 'j'], ['oran«g»e', 'j'], ['ma«g»ic', 'j'], ['ca«g»e', 'j']] },
  stypes: { ask: 'What type of syllable is it?', buckets: { closed: ['🔒', 'Closed'], open: ['🚪', 'Open'], magic: ['✨', 'Magic e'], team: ['👯', 'Vowel team'], bossy: ['🏴‍☠️', 'Bossy R'], le: ['🕯️', 'Consonant-le'] },
    items: [['cat', 'closed'], ['dog', 'closed'], ['bed', 'closed'], ['go', 'open'], ['me', 'open'], ['hi', 'open'], ['cake', 'magic'], ['bike', 'magic'], ['bone', 'magic'], ['rain', 'team'], ['boat', 'team'], ['tree', 'team'],
      ['car', 'bossy'], ['bird', 'bossy'], ['corn', 'bossy'], ['ap|ple', 'le'], ['can|dle', 'le'], ['tur|tle', 'le']] }
};
const PLURAL = [['cat', 'cats', ['cates', 'cat']], ['dog', 'dogs', ['doges', 'dog']], ['box', 'boxes', ['boxs', 'box']], ['fox', 'foxes', ['foxs', 'fox']], ['bus', 'buses', ['buss', 'bus']], ['cup', 'cups', ['cupes', 'cup']], ['dish', 'dishes', ['dishs', 'dish']]];
const ED = [['jumped', 't'], ['played', 'd'], ['planted', 'id'], ['kicked', 't'], ['rained', 'd'], ['painted', 'id'], ['hopped', 't'], ['smiled', 'd']];

/* Question: say (spoken prompt), show (prompt on screen), pic, text (big written word or sentence), story, tiles (+hideTiles),
   boxes {n, at}, target (steps played after the prompt and by "Hear it again"), help (steps for the help button instead),
   choices [{label, pic | big | text, sub, step, ok}], readChoices, after (steps after a right answer), reveal (marked word),
   spell {word, parts, pool}: build the word from letter tiles. */
const GEN = {
  sound(t) {
    return rounds(t.items, (x, r) => {
      const keys = new Set([soundKey(x)]), wrong = [];
      for (const y of shuf(t.items)) if (!keys.has(soundKey(y)) && wrong.length < 2) { keys.add(soundKey(y)); wrong.push(y) }
      const choices = shuf([{ label: x.s, ok: true }, ...wrong.map(y => ({ label: y.s, ok: false }))]), hear = S(x.k, x.fb);
      /* picture question when the example word has a picture (and, for consonants, really starts with that letter);
         the word is only spoken (show hides it) so the letters on screen don't give the answer away */
      const word = x.ex.find(w => picOf(w) && (!t.starts || w.startsWith(x.s)));
      if (word && r % 2) return { pic: picOf(word), say: t.starts ? 'What sound does ' + word + ' start with?' : 'What sound can you hear in ' + word + '?', show: t.starts ? 'What sound does it start with? 👂' : 'What sound can you hear? 👂', target: [W(word)], choices, after: [hear], reveal: markIn(word, x.s) };
      return { say: 'Listen! Which one makes this sound?', target: [hear], choices, after: [hear] }
    })
  },
  names() {
    const L = Object.keys(ABC), key = l => l === 'c' ? 'k' : l;
    return rounds(L, (l, r) => {
      const ch = shuf([l, ...others(L.filter(y => key(y) !== key(l)), 2)]).map(x => ({ label: x.toUpperCase() + x, ok: x === l })), after = [N(l), SAY('says'), S(ABC[l][1])];
      return r % 2 ? { say: 'Which letter makes this sound?', target: [S(ABC[l][1])], choices: ch, after } : { say: 'Which letter is called', show: 'Which letter is called… 🔠', target: [N(l)], choices: ch, after }
    })
  },
  blend(t) {
    const words = withPic(t.words);
    return rounds(words, w => { const word = plain(w); return { tiles: w.split('-'), hideTiles: t.oral, say: 'Listen to the sounds. Which picture is it?', target: tileTargets(w), choices: picCh(word, picOthers(word, words.map(plain), 2)), after: [W(word)] } })
  },
  rhyme() {
    return rounds(RHYME, ([r, set]) => {
      const [a, b] = shuf(set), pool = RHYME.filter(s => s[0] !== r).flatMap(s => s[1]);
      return { pic: picOf(a), say: 'Which one rhymes with ' + a + '?', show: 'Which one rhymes? 🎵', target: [W(a)], choices: picCh(b, picOthers(b, pool, 2, [a])), after: [W(a), W(b)] }
    })
  },
  syll(t) {
    return rounds(t.sets.flatMap(s => s[1]), w => {
      const n = w.split('-').length, word = plain(w), opts = n === 1 ? [1, 2, 3] : n === 4 ? [2, 3, 4] : [n - 1, n, n + 1];
      return { pic: picOf(word), say: 'How many claps in ' + word + '?', show: 'How many claps? 👏', target: [W(word)], choices: opts.map(k => ({ label: String(k), sub: '👏'.repeat(k), ok: k === n })), after: [W(word), ...w.split('-').map(() => ({ sfx: 1 }))], reveal: w.replace(/-/g, '|') }
    })
  },
  onset(t) {
    const words = t.items.map(([o, r]) => o + r);
    return rounds(t.items, ([o, r]) => ({ say: 'Put the sounds together. Which picture is it?', target: [S(o), GAP(350), R(r)], choices: picCh(o + r, picOthers(o + r, words, 2)), after: [W(o + r)], reveal: o + '|' + r }))
  },
  where(t, pos) {
    const G = t.groups, say = { first: 'Which picture starts with this sound?', last: 'Which picture ends with this sound?', middle: 'Which picture has this sound in the middle?' }[pos];
    return rounds(Object.keys(G), id => { const right = pick(withPic(G[id])), pool = Object.keys(G).filter(k => k !== id).flatMap(k => G[k]); return { say, show: say + ' 👂', target: [S(id)], choices: picCh(right, picOthers(right, pool, 2)), after: [W(right)] } })
  },
  first(t) { return GEN.where(t, 'first') }, last(t) { return GEN.where(t, 'last') }, middle(t) { return GEN.where(t, 'middle') },
  letter(t, pos) {
    const G = t.groups, keys = Object.keys(G);
    return rounds(keys, id => {
      const w = pick(withPic(G[id]));
      return { pic: picOf(w), say: 'What letter does ' + w + (pos === 'first' ? ' start' : ' end') + ' with?', show: 'Which letter does it ' + (pos === 'first' ? 'start' : 'end') + ' with? 🔤', target: [W(w)],
        choices: shuf([id, ...others(keys, 2, [id])]).map(l => ({ label: l, ok: l === id })), after: [S(id), W(w)], reveal: pos === 'first' ? '«' + w[0] + '»' + w.slice(1) : w.slice(0, -1) + '«' + w.slice(-1) + '»' }
    })
  },
  initial(t) { return GEN.letter(t, 'first') }, final(t) { return GEN.letter(t, 'last') },
  count(t) {
    return rounds(withPic(t.words), w => {
      const n = sounds(w).length, word = plain(w), opts = n <= 2 ? [2, 3, 4] : n >= 5 ? [3, 4, 5] : [n - 1, n, n + 1];
      return { pic: picOf(word), say: 'How many sounds in ' + word + '?', show: 'How many sounds? 🔢', target: [W(word)], choices: opts.map(k => ({ label: String(k), sub: '●'.repeat(k), ok: k === n })), after: soundOut(w), reveal: w.replace(/-/g, '|') }
    })
  },
  swap(t) {
    const all = [...new Set(t.items.flatMap(([a, b]) => [a, b]))], id = c => SND[c] || c;
    return rounds(t.items, ([a, b, pos]) => ({ pic: picOf(a), say: 'Sound swap!', show: 'Change the sound. What is the new word? 🔄', target: [W(a), SAY('Change'), S(id(a[pos])), SAY('to'), S(id(b[pos])), SAY('What is the new word?')],
      choices: picCh(b, [a, ...picOthers(b, all, 1, [a])]), after: [W(b)] }))
  },
  pairs(t) { return rounds(t.pairs.flatMap(([a, b]) => [[a, b], [b, a]]), ([a, b]) => ({ say: 'Listen. Which one is it?', target: [W(a)], choices: picCh(a, [b]), after: [W(a)] })) },
  family(t) {
    const fams = Object.keys(t.fam), words = f => withPic(t.fam[f].map(o => o + f));
    return rounds(fams.filter(f => words(f).length), f => {
      const right = pick(words(f)), pool = fams.filter(x => x !== f).flatMap(words);
      return { say: 'Which word is in the', show: 'Find the word in the -' + f + ' family 🏠', target: [R(f), SAY('family?')], choices: picCh(right, picOthers(right, pool, 2)), after: [W(right), SAY('is in the'), R(f), SAY('family!')] }
    })
  },
  spell(t) {
    const V5 = ['a', 'e', 'i', 'o', 'u'], CONS = ['s', 't', 'm', 'p', 'n', 'b', 'd', 'g', 'r', 'l'];
    return rounds(t.words, w => {
      const parts = w.split('-'), word = parts.join(''), extra = [pick(V5.filter(x => !parts.includes(x))), pick(CONS.filter(x => !parts.includes(x)))];
      return { spell: { word, parts, pool: shuf([...parts, ...extra]) }, pic: picOf(word) || '🔊', say: 'Spell', show: 'Spell the word ✏️', target: [W(word)], after: [W(word)] }
    })
  },
  word(t) {
    const words = withPic(t.words || t.sets.flatMap(s => s[1])), chunks = t.view === 'clap';
    return rounds(words, w => {
      const word = plain(w);
      return { text: chunks ? w.replace(/-/g, '|') : word, say: 'Read the word. Which picture is it?', show: 'Read it! Which picture? 👀', target: [], help: chunks ? w.split('-').map(p => SAY(p)) : soundOut(w),
        choices: picCh(word, picOthers(word, words.map(plain), 2)), after: [W(word)] }
    })
  },
  multi(t) { return GEN.word(t) },
  sentence(t) {
    const pics = t.sentences.map(x => x[1]);
    return rounds(t.sentences, ([s, w]) => ({ text: s, say: 'Read the sentence. Which picture goes with it?', show: 'Read it! Which picture? 📝', target: [], help: [SAY(s)], helpLabel: '🔊 Read it to me', choices: picCh(w, picOthers(w, pics, 2)), after: [SAY(s)] }))
  },
  sort(t) {
    const d = SORTS[t.sort], keys = Object.keys(d.buckets);
    return rounds(d.items, ([m, key]) => {
      const w = plain(m), opts = keys.length > 3 ? shuf([key, ...others(keys, 2, [key])]) : keys;
      return { text: m, pic: picOf(w) || undefined, say: d.ask, target: [W(w)], choices: opts.map(k => { const [show, sub] = d.buckets[k]; return { label: sub, [/^[a-z]+$/.test(show) ? 'big' : 'pic']: show, sub, ok: k === key } }),
        after: [W(w), ...(d.buckets[key][2] ? [SAY('says'), S(d.buckets[key][2])] : [])] }
    })
  },
  silent(t) {
    return rounds(t.silent, ([w, s, o]) => {
      const mk = l => { const i = w.indexOf(l); return w.slice(0, i) + '«' + l + '»' + w.slice(i + 1) };
      return { pic: picOf(w), say: 'Which letter is silent in ' + w + '?', show: 'Which letter is silent? 🤫', target: [W(w)], choices: txtCh(mk(s), [mk(o)]), after: [W(w)] }
    })
  },
  schwa(t) { return rounds(t.schwa, ([w, right, wrong]) => ({ pic: picOf(w), say: 'Where is the lazy uh sound in ' + w + '?', show: 'Where is the lazy “uh”? 😴', target: [W(w)], choices: txtCh(right, [wrong]), after: [W(w), S('schwa')] })) },
  choose(t) { return rounds(t.choose, ([w, wrong]) => ({ pic: picOf(w) || '🔊', say: 'Which spelling is right?', show: 'Which spelling is right? 🔍', target: [W(w)], choices: txtCh(w, wrong), after: [W(w)] })) },
  meaning(t) { return rounds(t.meaning, ([w, right, wrong]) => ({ text: w, pic: picOf(w) || undefined, say: 'What does ' + w + ' mean?', show: 'What does it mean? 🤔', target: [], choices: txtCh(right, wrong), readChoices: true, after: [W(w), SAY('means ' + right)] })) },
  sight(t) { const ws = t.words.map(x => plain(x[0])); return rounds(ws, w => ({ say: 'Find the word', show: 'Find the word 👀', target: [W(w)], choices: txtCh(w, others(ws, 2, [w])), after: [W(w)] })) },
  split(t) {
    return rounds(t.split, w => {
      const word = plain(w), at = w.indexOf('|'), cut = k => word.slice(0, k) + '|' + word.slice(k);
      return { pic: picOf(word) || undefined, say: 'Where do we split ' + word + '?', show: 'Where does it split? 🔪', target: [W(word)], choices: txtCh(w, shuf([at - 1, at + 1, at - 2, at + 2].filter(k => k > 0 && k < word.length)).slice(0, 2).map(cut)), after: [W(word)] }
    })
  },
  story(t) {
    return rounds(t.stories.flatMap(st => st.qs.map(q => [st, q])), ([st, [ask, right, wrong]]) => ({ story: st, say: ask, show: ask, target: [], help: st.lines.map(l => SAY(l)), helpLabel: '🔊 Read me the story', choices: picCh(right, wrong), after: [W(right)] }))
  },
  listen() {
    const an = shuf(ANIMALS), sd = shuf(SAME_DIFF);
    return Array.from({ length: GAME_ROUNDS }, (_, r) => {
      if (r % 2) { const [a, b] = sd[r], same = a === b; return { say: 'Listen. Are they the same, or different?', show: 'Same or different? 👂', target: [W(a), GAP(500), W(b)], choices: [{ label: 'Same', pic: '🟰', sub: 'Same', ok: same }, { label: 'Different', pic: '🔀', sub: 'Different', ok: !same }], after: [] } }
      const [a, s] = an[r]; return { say: 'Who says', show: 'Who says that? 🐾', target: [W(s)], choices: picCh(a, picOthers(a, ANIMALS.map(x => x[0]), 2)), after: [SAY('The ' + a + ' says'), W(s)] }
    })
  },
  magic(t) { return rounds(t.pairs.flatMap(([a, b]) => [[a, b, a], [a, b, b]]), ([a, b, w]) => ({ say: 'Listen. Which word is it?', show: 'Which word do you hear? ✨', target: [W(w)], choices: txtCh(w, [w === a ? b : a]), after: [W(w)] })) },
  inflect() {
    const pl = shuf(PLURAL), ed = shuf(ED);
    return Array.from({ length: GAME_ROUNDS }, (_, r) => {
      if (r % 2) { const [w, s] = ed[r]; return { text: w, say: 'What sound does the ending make in ' + w + '?', show: 'What does -ed say? 🔚', target: [W(w)], choices: [['t', S('t')], ['d', S('d')], ['id', SAY('id')]].map(([x, step]) => ({ label: x, step, ok: x === s })), readChoices: true, after: [W(w)] } }
      const [b, right, wrong] = pl[r]; return { pic: picOf(b) + picOf(b), say: 'One ' + b + '. Two…', show: 'One ' + b + ', two…? 🔢', target: [], choices: txtCh(right, wrong), after: [SAY('Two ' + right + '!')] }
    })
  },
  compound() {
    const all = COMPOUND.map(c => c[2]);
    return rounds(COMPOUND, ([a, b, w]) => ({ text: a + ' + ' + b, say: 'What do these words make?', show: 'Put the words together 🧱', target: [W(a), SAY('plus'), W(b)], choices: picCh(w, picOthers(w, all, 2)), after: [W(w)] }))
  },
  boxes(t) {
    return rounds(t.words, w => {
      const parts = w.split('-'), word = parts.join(''), k = Math.floor(Math.random() * parts.length), right = parts[k],
        pool = (/^[aeiou]$/.test(right) ? ['a', 'e', 'i', 'o', 'u'] : ['s', 't', 'm', 'p', 'n', 'b', 'd', 'g', 'l', 'f', 'h']).filter(x => !parts.includes(x));
      return { pic: picOf(word), boxes: { n: parts.length, at: k }, say: 'What sound goes in the yellow box?', show: 'What sound goes in the yellow box? 🟨', target: [W(word)],
        choices: shuf([right, ...others(pool, 2)]).map(x => ({ label: x, ok: x === right })), after: [S(SND[right] || right), W(word)], reveal: w.replace(/-/g, '|') }
    })
  },
  mixed() { return shuf(['short', 'pairs', 'cvc', 'dictation', 'svsent']).map(id => GEN[TOPIC[id].game](TOPIC[id])[0]) }
};

const Game = { id: null, qs: [], n: 0, stars: 0, firstTry: true, busy: false, ep: null };
/* the game owns the speaker between its own lines; closing the game silences only the game */
const gameSpeak = (t, keep) => { const p = Speech.say(t, .85, keep); if (!keep) Game.ep = Speech.epoch(); return p };
const gameAlive = () => Game.ep !== null && Speech.epoch() === Game.ep && $('#gameDlg').open;
async function gameSteps(steps) {
  for (const s of steps) {
    if (!gameAlive()) return;
    const el = s.tile != null ? $$('#gameTiles .tile')[s.tile] : s.choice != null ? $$('#gameStage .gchoice')[s.choice] : s.el;
    await runStep({ ...s, el }, true)
  }
}
const readSteps = q => q.readChoices ? q.choices.flatMap((c, i) => [{ ...(c.step || SAY(c.label, .85)), choice: i, cls: 'reading' }, GAP(250)]) : [];
async function playTarget(q, fresh, steps) {
  if (fresh) { Speech.stop(); Game.ep = Speech.epoch() }
  await gameSteps(steps || [...q.target, ...readSteps(q)])
}
function renderStars() {
  const s = $('#gameStars'); s.replaceChildren();
  for (let k = 0; k < GAME_ROUNDS; k++) s.append(h('span', 'gstar' + (k < Game.stars ? ' on' : ''), k < Game.stars ? '⭐' : '☆'));
  s.setAttribute('aria-label', Game.stars + ' of ' + GAME_ROUNDS + ' stars');
}
async function askQuestion() {
  const q = Game.qs[Game.n], stage = $('#gameStage'); Game.firstTry = true; Game.busy = false;
  $('#gameRound').textContent = 'Round ' + (Game.n + 1) + ' of ' + Game.qs.length; $('#gameFeedback').textContent = '';
  stage.replaceChildren(h('p', 'gprompt', q.show || q.say));
  if (q.story) { const box = h('div', 'gstory'); box.append(h('b', 0, q.story.pic + ' ' + q.story.title), h('p', 0, q.story.lines.join(' '))); stage.append(box) }
  if (q.pic) { const p = h('div', 'gpic', q.pic); p.setAttribute('role', 'img'); p.setAttribute('aria-label', 'picture'); stage.append(p) }
  if (q.text) stage.append(markedEl(q.text, 'gtext' + (q.text.length > 18 ? ' long' : '')));
  if (q.tiles) { const t = h('div', 'tiles gtiles'); t.id = 'gameTiles'; q.tiles.forEach(x => t.append(h('span', 'tile', q.hideTiles ? '●' : x))); stage.append(t) }
  if (q.boxes) { const b = h('div', 'sboxes gboxes'); for (let k = 0; k < q.boxes.n; k++) b.append(h('span', 'sbox' + (k === q.boxes.at ? ' ask' : ''))); stage.append(b) }
  const wd = h('p', 'gword'); wd.id = 'gameWord'; wd.hidden = true; stage.append(wd);
  const helpSteps = q.help || (q.target.length || q.readChoices ? null : []);
  if (!helpSteps || helpSteps.length) {
    const again = h('button', 'btn t kid-btn', q.help ? q.helpLabel || '🐢 Sound it out' : '🔊 Hear it again'); again.type = 'button';
    again.onclick = () => playTarget(q, true, q.help); stage.append(again)
  }
  if (q.spell) {
    const row = h('div', 'sboxes spell-boxes'); q.spell.parts.forEach(() => row.append(h('span', 'sbox'))); q.spell.filled = 0;
    const pool = h('div', 'gchoices spell-pool'); q.spell.pool.forEach(p => { const b = h('button', 'gchoice', p); b.type = 'button'; b.setAttribute('aria-label', p); b.onclick = () => spellTap(q, p, b); pool.append(b) });
    stage.append(row, pool)
  } else {
    const main = c => c.pic || c.big || c.label, all = q.choices, cls = all.every(c => c.pic) ? ' pics' : all.every(c => !c.text && main(c).length <= 4) ? '' : ' words';
    const grid = h('div', 'gchoices' + cls);
    all.forEach(c => {
      const b = h('button', 'gchoice'); b.type = 'button'; b.setAttribute('aria-label', c.label);
      if (c.text) b.append(markedEl(c.text, 'gch-t')); else b.append(h('span', 'gch-main', main(c)));
      if (c.sub) b.append(h('small', 'gch-sub', c.sub)); b.onclick = () => answer(q, c, b); grid.append(b)
    });
    stage.append(grid)
  }
  await gameSpeak(q.say); if (gameAlive()) await playTarget(q)
}
async function wrongTap(q, b, hint) {
  Game.firstTry = false; b.classList.remove('wiggle'); void b.offsetWidth; b.classList.add('wiggle');
  $('#gameFeedback').textContent = 'Oops! Try again.'; await gameSpeak('Oops! Try again.'); if (gameAlive()) await playTarget(q, false, hint)
}
async function answer(q, c, b) {
  if (Game.busy || b.disabled) return;
  if (!c.ok) { b.disabled = true; return wrongTap(q, b) }
  $$('#gameStage .gchoice').forEach(x => x.disabled = x !== b); b.classList.add('right'); correct(q)
}
/* spelling: tap the letters in order; a right letter drops into its box and plays its sound */
async function spellTap(q, p, b) {
  const sp = q.spell, k = sp.filled; if (Game.busy || b.disabled || k >= sp.parts.length) return;
  const id = soundsOf(sp.parts)[k];
  if (p !== sp.parts[k]) return wrongTap(q, b, [W(sp.word), ...(id ? [SAY('Listen for'), S(id)] : [SAY('Add the silent e')])]);
  const box = $$('#gameStage .spell-boxes .sbox')[k]; box.textContent = p; box.classList.add('full'); b.disabled = true; b.classList.add('used'); sp.filled++;
  const p2 = id ? runStep(S(id), false) : null; if (id) Game.ep = Speech.epoch();
  if (sp.filled === sp.parts.length) { Game.busy = true; await p2; return correct(q) }
}
async function correct(q) {
  Game.busy = true; if (Game.firstTry) { Game.stars++; renderStars() }
  if (q.reveal) { const wd = $('#gameWord'); if (wd) { wd.replaceChildren(markedEl(q.reveal, 'gw')); wd.hidden = false } }
  const praise = pick(PRAISE); $('#gameFeedback').textContent = praise + (Game.firstTry ? ' ⭐' : '');
  await gameSpeak(praise); if (gameAlive()) await gameSteps(q.after || []);
  if (!gameAlive()) return;
  await wait(500); if (!$('#gameDlg').open) return;
  Game.n++; Game.n < Game.qs.length ? askQuestion() : finishGame()
}
function confetti() {
  const box = $('#gameConfetti'); box.replaceChildren();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let k = 0; k < 28; k++) { const s = h('span', 'conf', pick(['🎉', '⭐', '🎈', '✨', '🌟'])); s.style.left = Math.random() * 100 + '%'; s.style.animationDelay = Math.random() * .6 + 's'; box.append(s) }
  setTimeout(() => box.replaceChildren(), 3200)
}
function finishGame() {
  const id = Game.id, all = LS.get(STARS_KEY, {}); if (Game.stars > (all[id] || 0)) { all[id] = Game.stars; LS.set(STARS_KEY, all) }
  const stage = $('#gameStage'); stage.replaceChildren(); $('#gameRound').textContent = 'All done!'; $('#gameFeedback').textContent = '';
  const msg = Game.stars === GAME_ROUNDS ? 'Wow, all ' + GAME_ROUNDS + ' stars! You are a phonics star!' : Game.stars ? 'Hooray! You got ' + Game.stars + (Game.stars === 1 ? ' star!' : ' stars!') : 'Good try! Let’s play again!';
  const sticker = h('div', 'gsticker', Game.stars ? TOPIC[id].icon : '🤗'); sticker.setAttribute('aria-hidden', 'true');
  const again = h('button', 'btn kid-btn play', '🔁 Play again'), done = h('button', 'btn g kid-btn', '✅ Back to the topic');
  again.type = done.type = 'button'; again.onclick = () => startGame(id); done.onclick = closeGame;
  const row = h('div', 'row gend'); row.append(again, done); stage.append(sticker, h('p', 'gprompt', msg));
  if (Game.stars) stage.append(h('p', 'mut', 'You earned the ' + TOPIC[id].icon + ' sticker!')); stage.append(row);
  if (Game.stars) confetti(); gameSpeak(msg); topicBar(id); again.focus()
}
function startGame(id) {
  const t = TOPIC[id]; Object.assign(Game, { id, qs: GEN[t.game](t), n: 0, stars: 0 });
  $('#gameTitle').textContent = t.icon + ' ' + topicName(id); renderStars(); askQuestion()
}
function openGame(id) {
  stopPhonics(); const dlg = $('#gameDlg'); if (!dlg.open) dlg.showModal(); startGame(id)
}
function closeGame() {
  if (Game.ep !== null && Speech.epoch() === Game.ep) Speech.stop(); Game.ep = null;
  const dlg = $('#gameDlg'); if (dlg.open) dlg.close(); $('#gameConfetti').replaceChildren()
}
$('#gameClose').onclick = closeGame;
$('#gameDlg').addEventListener('cancel', e => { e.preventDefault(); closeGame() });
