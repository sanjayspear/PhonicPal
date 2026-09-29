/* Custom phonics cards: storage + "Add Custom Blend" form. Loaded BEFORE phonics.js (which calls initCustomForm()).
   Uses from phonics.js at call time: PT, phTab, phCard, renderPh. */
const CUSTOM_KEY = 'pp_custom_ph';
/* Phonics tab index -> storage key (tabs 0 and 1, vowels and consonants, stay fixed) */
const CK = { 2: 'vb', 3: 'cb', 4: 'dg', 5: 'rc', 6: 'dp', 7: 'wb' };
const customAll = () => LS.get(CUSTOM_KEY, {});
const customFor = i => customAll()[CK[i]] || [];
function customAdd(i, s, ex) {
   const all = customAll(), k = CK[i], l = all[k] || [];
   if (l.some(x => x.s === s)) return false; l.push({ id: Date.now(), s, ex }); all[k] = l; LS.set(CUSTOM_KEY, all); return true
}
function customDel(i, id) { const all = customAll(), k = CK[i]; all[k] = (all[k] || []).filter(x => x.id !== id); LS.set(CUSTOM_KEY, all) }
/* stored entry -> the item shape phCard() expects (spoken by the voice engine; no recorded mp3 for custom cards) */
const customItem = (i, c) => ({ s: c.s, k: 'custom', fb: i === 3 ? c.s + 'uh' : c.s, ex: c.ex ? [c.ex] : [], custom: true, id: c.id });
/* "ship" -> sh-i-p, "queen" -> qu-ee-n, "bird" -> b-ir-d ; a word typed with dashes (c-a-t) is kept as typed */
const splitWord = w => w.includes('-') ? w.split('-').filter(Boolean) : (w.match(/igh|sh|ch|th|wh|ck|ng|ph|qu|ai|ay|ee|ea|ie|oa|oo|ou|ow|oi|oy|ar|er|ir|or|ur|./g) || []);
/* card + small remove button (a button cannot sit inside the card button) */
function wrapDel(i, id, node) {
   const w = h('div', 'ph-wrap'), x = h('button', 'ph-x', '✕'); x.type = 'button'; x.title = 'Remove this card'; x.setAttribute('aria-label', 'Remove custom card');
   x.onclick = () => { customDel(i, id); renderPh(i) }; w.append(node, x); return w
}
const withDel = (i, x) => wrapDel(i, x.id, phCard(x));

function initCustomForm() {
   const box = $('#cform'), cat = $('#cf-cat'), bl = $('#cf-blend'), ex = $('#cf-ex'), msg = $('#cf-msg'), add = $('#addCustom');
   Object.keys(CK).forEach(i => cat.append(new Option(PT[i][0], i)));
   const sync = () => {
      const wb = +cat.value === 7; $('#cf-exrow').hidden = wb;
      $('#cf-lbl').textContent = wb ? 'Word (dashes set the sounds, e.g. c-a-t)' : 'Blend or letters (e.g. bl)'
   };
   cat.onchange = () => { msg.textContent = ''; sync() };
   add.onclick = () => { stopPhonics(); box.hidden = !box.hidden; add.setAttribute('aria-expanded', String(!box.hidden)); if (!box.hidden) { if (phTab in CK) cat.value = phTab; sync(); bl.focus() } };
   $('#cf-cancel').onclick = () => { box.hidden = true; add.setAttribute('aria-expanded', 'false'); msg.textContent = '' };
   $('#cf-save').onclick = () => {
      const i = +cat.value, wb = i === 7; let s = bl.value.trim().toLowerCase(); const e = ex.value.trim().toLowerCase();
      if (!(wb ? /^[a-z]+(-[a-z]+)*$/ : /^[a-z]{1,4}$/).test(s)) { msg.textContent = wb ? 'Type a word using letters (dashes optional).' : 'Type 1 to 4 letters, like "bl" or "oa".'; return }
      if (wb) { const t = splitWord(s); if (t.length < 2) { msg.textContent = 'Use a word with at least 2 sounds.'; return } s = t.join('-') }
      else if (!/^[a-z']{2,20}$/.test(e)) { msg.textContent = 'Add an example word (letters only).'; return }
      if (!customAdd(i, s, wb ? '' : e)) { msg.textContent = 'That card already exists.'; return }
      bl.value = ex.value = ''; msg.textContent = 'Added ✓'; renderPh(i); bl.focus()
   };
}
