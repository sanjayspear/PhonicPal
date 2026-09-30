/* Phonics screen: group bar, topic tabs and the open topic's page.
   Topics and words: topics.js. Pages: VIEWS in phonics-views.js. Guides and stars: phonics-guide.js. */
const phStatus = message => { const el = $('#phstatus'); if (el) el.textContent = message };
const title = t => t.replace(/\b\w/g, c => c.toUpperCase());
const labelOf = x => x.label || (x.tag ? title(x.tag) + ' Sound' : (x.ex.length > 1 ? 'Example Words' : 'Example Word'));
/* Phonics owns the speaker from its last tap until anything else speaks (Speech.epoch changes).
   Leaving the Phonics screen or opening another phonics feature silences only that phonics audio. */
let phEp = null;
const phOwn = () => { phEp = Speech.epoch() };
function stopPhonics() { if (phEp !== null && Speech.epoch() === phEp) Speech.stop(); phEp = null }
document.addEventListener('tabchange', e => { if (e.detail.from === 'phonics') stopPhonics() });
/* One phonics card: big symbol, bold label with colon, then words on their own line.
   x.steps replaces the usual "sound, then each word" (letter names say the name first). */
function phCard(x) {
  const b = h('button', 'card ph-card'), lbl = labelOf(x); if (x.tag) b.dataset.tag = x.tag;
  b.title = 'Play the ' + x.s + ' sound and hear ' + x.ex.join(', ') + '.';
  b.setAttribute('aria-label', x.s + '. ' + lbl + ': ' + x.ex.join(', '));
  const cap = h('span', 'ph-cap'); cap.append(h('strong', 'ph-lbl', lbl + ':'), document.createTextNode(' '), h('span', 'ph-words', x.ex.join(', ')));
  const pic = x.ex.map(picOf).find(Boolean); if (pic) { const p = h('span', 'ph-pic', pic); p.setAttribute('aria-hidden', 'true'); b.append(p) }
  b.append(h('span', 'big', x.s), cap); if (x.hint) b.append(h('small', 'ph-hint', x.hint));
  b.onclick = () => phPlay(x.steps || (x.custom ? [SAY(x.fb, .7), ...x.ex.map(w => SAY(w, .7))] : [S(x.k, x.fb), ...x.ex.map(W)]),
    'Sound practice finished. Choose another card when ready.', 'Playing sound and example words…');
  return b
}
function sentenceList(items) {
  const wrap = h('div', 'ph-sent'); wrap.append(h('h2', 0, 'Practice Sentences'));
  items.forEach(x => (x.sentences || []).forEach(t => {
    const r = h('div', 'row ph-row'), ic = h('button', 'ic', '🔊'); ic.title = 'Read this sentence aloud'; ic.setAttribute('aria-label', 'Read sentence aloud');
    ic.onclick = () => phPlay([SAY(plainText(t))], 'Sentence finished. Choose another when ready.', 'Reading practice sentence…');
    const p = h('span', 'ph-line'); parseMarked(t).forEach(seg => p.append(seg.hit ? h('mark', 0, seg.t) : document.createTextNode(seg.t))); r.append(ic, p); wrap.append(r)
  })); return wrap
}

/* the open group (index in GROUPS) and topic id; custom-phonics.js reads phTab */
let phGroup = 0, phTab = 'short';
const topicName = (id, gi = phGroup) => (GROUPS[gi].alias || {})[id] || TOPIC[id].name;
function renderGroups() {
  const bar = $('#pgroups'); bar.replaceChildren();
  GROUPS.forEach((g, i) => {
    const won = g.topics.filter(bestStars).length, b = h('button', 'pgroup' + (i === phGroup ? ' a' : '')), ic = h('span', 'pg-icon', g.icon);
    b.type = 'button'; b.setAttribute('aria-pressed', String(i === phGroup)); b.title = g.name + ': ' + g.kid; ic.setAttribute('aria-hidden', 'true');
    b.append(ic, h('span', 'pg-name', g.name), h('small', 'pg-meta', 'Ages ' + g.age + ' · ⭐ ' + won + '/' + g.topics.length));
    b.onclick = () => renderPh(g.topics[0], i); bar.append(b)
  });
  const on = $('.pgroup.a', bar); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}
function renderTabs() {
  const bar = $('#ptabs'); bar.replaceChildren();
  GROUPS[phGroup].topics.forEach(id => {
    const b = h('button'), ic = h('span', 'ticon', TOPIC[id].icon), active = id === phTab; ic.setAttribute('aria-hidden', 'true');
    b.type = 'button'; b.dataset.id = id; b.classList.toggle('a', active); b.setAttribute('aria-pressed', String(active));
    b.append(ic, document.createTextNode(topicName(id)), h('span', 'tstar')); b.onclick = () => renderPh(id, phGroup); bar.append(b)
  })
}
/* stars on tabs and groups, and the sticker shelf (one sticker per topic whose game has been won) */
function refreshStars() {
  $$('#ptabs button').forEach(b => { const s = $('.tstar', b), won = bestStars(b.dataset.id); s.textContent = won ? ' ⭐' : ''; s.title = won ? 'Game won' : '' });
  $$('#pgroups .pgroup').forEach((b, i) => { const g = GROUPS[i]; $('.pg-meta', b).textContent = 'Ages ' + g.age + ' · ⭐ ' + g.topics.filter(bestStars).length + '/' + g.topics.length });
  const got = TOPICS.filter(t => bestStars(t.id)), shelf = $('#pstickers'); if (!shelf) return;
  shelf.replaceChildren(h('b', 0, '🏅 My stickers: '), got.length ? h('span', 'stk', got.map(t => t.icon).join(' ')) : h('span', 'mut', 'win a game to earn your first sticker!'), h('small', 'mut', ' ' + got.length + ' of ' + TOPICS.length))
}
function renderPh(id, gi) {
  stopPhonics(); if (phCleanup) { phCleanup(); phCleanup = null }
  if (!TOPIC[id]) id = 'short';
  if (gi === undefined || !GROUPS[gi] || !GROUPS[gi].topics.includes(id)) gi = GROUPS[phGroup].topics.includes(id) ? phGroup : GROUPS.findIndex(g => g.topics.includes(id));
  phGroup = gi; phTab = id; LS.set('pp_ph_at', { g: gi, id });
  const t = TOPIC[id]; renderGroups(); renderTabs(); $('#pintro').textContent = t.intro; $('#pmascot').textContent = t.tip; topicBar(id);
  phStatus(topicName(id) + ' ready. Tap anything to listen.'); const B = $('#pbody'); B.replaceChildren(); VIEWS[t.view](t, B)
}
{ const at = LS.get('pp_ph_at', {}); renderPh(at.id || 'short', at.g) }
initCustomForm();
