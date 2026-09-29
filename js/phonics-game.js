/* "Play the game": a listening quiz for 4 to 5 year olds. Everything is spoken, choices are big letters or pictures,
   wrong taps just wiggle and say "try again", and every round ends with stars and a celebration.
   Loaded AFTER phonics.js (uses PT, WB, soundsOf, PIC, bestStars, topicBar, stopPhonics). */
const GAME_ROUNDS = 5;
const PRAISE = ['Yay!', 'Super!', 'Well done!', 'You got it!', 'Brilliant!', 'Great listening!'];
const STICKER = ['🍎', '🐝', '👯', '🤝', '🚂', '🏴‍☠️', '🎢', '🧩'];
/* items that sound the same must never be offered together (c/k, ee/ea, er/ir/ur, oi/oy, ou/ow) */
const SAME = { c: 'k' };
const soundKey = x => x.ipa || SAME[x.k] || x.k;
const pick = a => a[Math.floor(Math.random() * a.length)];

/* One question: {kind:'sound'|'picture'|'blend', say, target, choices:[{label, pic, ok}], word} */
function makeQuestions(i) {
  const qs = [];
  if (!PT[i][1]) {                                  /* Word Blending: hear the sounds, find the picture */
    const words = WB.filter(w => picOf(w.replace(/-/g, '')));
    for (const w of shuf(words).slice(0, GAME_ROUNDS)) {
      const word = w.replace(/-/g, ''), others = shuf(words.filter(x => x !== w)).slice(0, 2).map(x => x.replace(/-/g, ''));
      qs.push({ kind: 'blend', tiles: w.split('-'), word, say: 'Listen to the sounds. Which picture is it?',
        choices: shuf([{ label: word, pic: picOf(word), ok: true }, ...others.map(o => ({ label: o, pic: picOf(o), ok: false }))]) })
    }
    return qs
  }
  const items = PT[i][1], order = shuf(items);      /* no sound repeats until every sound has had a turn */
  for (let r = 0; r < GAME_ROUNDS; r++) {
    const x = order[r % order.length], keys = new Set([soundKey(x)]), wrong = [];
    for (const y of shuf(items)) if (!keys.has(soundKey(y)) && wrong.length < 2) { keys.add(soundKey(y)); wrong.push(y) }
    const choices = shuf([{ label: x.s, ok: true }, ...wrong.map(y => ({ label: y.s, ok: false }))]);
    /* picture question when the example word has a picture (and, for consonants, really starts with that letter) */
    const word = x.ex.find(w => picOf(w) && (i !== 1 || w.startsWith(x.s)));
    /* the word is only spoken (show hides it) so the letters on screen don't give the answer away */
    if (word && r % 2) qs.push({ kind: 'picture', item: x, word, choices, say: i === 1 ? 'What sound does ' + word + ' start with?' : 'What sound can you hear in ' + word + '?', show: i === 1 ? 'What sound does it start with? 👂' : 'What sound can you hear? 👂' });
    else qs.push({ kind: 'sound', item: x, choices, say: 'Listen! Which one makes this sound?' })
  }
  return qs
}

const Game = { i: 0, qs: [], n: 0, stars: 0, firstTry: true, busy: false, ep: null };
/* the game owns the speaker between its own lines; closing the game silences only the game */
const gameSpeak = (t, keep) => { const p = Speech.say(t, .85, keep); if (!keep) Game.ep = Speech.epoch(); return p };
const gameAlive = () => Game.ep !== null && Speech.epoch() === Game.ep && $('#gameDlg').open;
async function playTarget(q, keep = true) {
  if (!keep) { Speech.stop(); Game.ep = Speech.epoch() }
  if (q.kind === 'sound') return Speech.clip('s_' + q.item.k, q.item.fb, true);
  if (q.kind === 'picture') return Speech.clip('w_' + q.word, q.word, true);
  const ids = soundsOf(q.tiles), tiles = $$('#gameTiles .tile');
  for (let k = 0; k < q.tiles.length; k++) {
    if (!gameAlive()) break; tiles[k] && tiles[k].classList.add('on');
    await (ids[k] ? Speech.clip('s_' + ids[k], q.tiles[k], true) : wait(350)); tiles[k] && tiles[k].classList.remove('on')
  }
}
function renderStars() {
  const s = $('#gameStars'); s.replaceChildren();
  for (let k = 0; k < GAME_ROUNDS; k++) { const d = h('span', 'gstar' + (k < Game.stars ? ' on' : ''), k < Game.stars ? '⭐' : '☆'); s.append(d) }
  s.setAttribute('aria-label', Game.stars + ' of ' + GAME_ROUNDS + ' stars');
}
async function askQuestion() {
  const q = Game.qs[Game.n], stage = $('#gameStage'); Game.firstTry = true; Game.busy = false;
  $('#gameRound').textContent = 'Round ' + (Game.n + 1) + ' of ' + Game.qs.length; $('#gameFeedback').textContent = '';
  stage.replaceChildren();
  const prompt = h('p', 'gprompt', q.show || q.say), again = h('button', 'btn t kid-btn', '🔊 Hear it again'); again.type = 'button';
  again.onclick = () => playTarget(q, false);
  stage.append(prompt);
  if (q.kind === 'picture') { const p = h('div', 'gpic', picOf(q.word)); p.setAttribute('role', 'img'); p.setAttribute('aria-label', q.word); const wd = h('p', 'gword'); wd.id = 'gameWord'; wd.hidden = true; stage.append(p, wd) }
  if (q.kind === 'blend') { const t = h('div', 'tiles gtiles'); t.id = 'gameTiles'; q.tiles.forEach(x => t.append(h('span', 'tile', x))); stage.append(t) }
  stage.append(again);
  const grid = h('div', 'gchoices' + (q.kind === 'blend' ? ' pics' : ''));
  q.choices.forEach(c => {
    const b = h('button', 'gchoice', c.pic || c.label); b.type = 'button'; b.setAttribute('aria-label', c.label);
    b.onclick = () => answer(q, c, b); grid.append(b)
  });
  stage.append(grid);
  const p = gameSpeak(q.say); await p; if (gameAlive()) await playTarget(q)
}
async function answer(q, c, b) {
  if (Game.busy || b.disabled) return;
  const fb = $('#gameFeedback');
  if (!c.ok) {
    Game.firstTry = false; b.disabled = true; b.classList.remove('wiggle'); void b.offsetWidth; b.classList.add('wiggle');
    fb.textContent = 'Oops! Try again.'; await gameSpeak('Oops! Try again.'); if (gameAlive()) await playTarget(q); return
  }
  Game.busy = true; b.classList.add('right'); $$('#gameStage .gchoice').forEach(x => x.disabled = x !== b);
  if (Game.firstTry) { Game.stars++; renderStars() }
  if (q.kind === 'picture') revealWord(q);
  const praise = pick(PRAISE); fb.textContent = praise + (Game.firstTry ? ' ⭐' : '');
  await gameSpeak(praise);
  if (gameAlive()) { if (q.kind === 'blend') await Speech.clip('w_' + q.word, q.word, true); else await Speech.clip('s_' + q.item.k, q.item.fb, true) }
  if (!gameAlive()) return;
  await wait(500); if (!$('#gameDlg').open) return;
  Game.n++; Game.n < Game.qs.length ? askQuestion() : finishGame()
}
/* after a right answer: show the word with its sound highlighted, e.g. th‑umb (ā finds the a in cake) */
function revealWord(q) {
  const wd = $('#gameWord'); if (!wd) return;
  const letters = q.item.s.normalize('NFD').replace(/[̀-ͯ]/g, ''), at = q.word.indexOf(letters); wd.replaceChildren();
  if (at < 0) wd.textContent = q.word; else wd.append(q.word.slice(0, at), h('mark', 0, q.word.slice(at, at + letters.length)), q.word.slice(at + letters.length));
  wd.hidden = false
}
function confetti() {
  const box = $('#gameConfetti'); box.replaceChildren();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let k = 0; k < 28; k++) { const s = h('span', 'conf', pick(['🎉', '⭐', '🎈', '✨', '🌟'])); s.style.left = Math.random() * 100 + '%'; s.style.animationDelay = Math.random() * .6 + 's'; box.append(s) }
  setTimeout(() => box.replaceChildren(), 3200)
}
function finishGame() {
  const i = Game.i, all = LS.get('pp_game_stars', {}); if (Game.stars > (all[i] || 0)) { all[i] = Game.stars; LS.set('pp_game_stars', all) }
  const stage = $('#gameStage'); stage.replaceChildren(); $('#gameRound').textContent = 'All done!'; $('#gameFeedback').textContent = '';
  const msg = Game.stars === GAME_ROUNDS ? 'Wow, all ' + GAME_ROUNDS + ' stars! You are a phonics star!' : Game.stars ? 'Hooray! You got ' + Game.stars + (Game.stars === 1 ? ' star!' : ' stars!') : 'Good try! Let’s play again!';
  const sticker = h('div', 'gsticker', Game.stars ? STICKER[i] : '🤗'); sticker.setAttribute('aria-hidden', 'true');
  const again = h('button', 'btn kid-btn play', '🔁 Play again'), done = h('button', 'btn g kid-btn', '✅ Back to the sounds');
  again.type = done.type = 'button'; again.onclick = () => startGame(i); done.onclick = closeGame;
  const row = h('div', 'row gend'); row.append(again, done); stage.append(sticker, h('p', 'gprompt', msg), row);
  if (Game.stars) confetti(); gameSpeak(msg); topicBar(i); again.focus()
}
function startGame(i) {
  Object.assign(Game, { i, qs: makeQuestions(i), n: 0, stars: 0 });
  $('#gameTitle').textContent = PT[i][3] + ' ' + PT[i][0]; renderStars(); askQuestion()
}
function openGame(i) {
  stopPhonics(); const dlg = $('#gameDlg'); if (!dlg.open) dlg.showModal(); startGame(i)
}
function closeGame() {
  if (Game.ep !== null && Speech.epoch() === Game.ep) Speech.stop(); Game.ep = null;
  const dlg = $('#gameDlg'); if (dlg.open) dlg.close(); $('#gameConfetti').replaceChildren()
}
$('#gameClose').onclick = closeGame;
$('#gameDlg').addEventListener('cancel', e => { e.preventDefault(); closeGame() });
