/* ---------- Books (IndexedDB) ---------- */
const db = new Promise(res => { try { const r = indexedDB.open('phonicspal', 1); r.onupgradeneeded = () => r.result.createObjectStore('b', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => res(null) } catch (e) { res(null) } });
const idb = async (m, f) => { const d = await db; if (!d) return null; return new Promise(res => { const t = d.transaction('b', m), r = f(t.objectStore('b')); t.oncomplete = () => res(r && r.result); t.onerror = t.onabort = () => res(null) }) };   /* null = failed (e.g. storage full) */
let books = [], openId = null;
/* reader emptied (Clear Text or deleted book): hide the book view */
BK.onClear = () => { openId = null; $('#bview').hidden = true; $('#btitle').textContent = '' };
const paginate = t => { const w = t.match(/\S+\s*/g) || [], p = []; for (let i = 0; i < w.length; i += 1200)p.push(w.slice(i, i + 1200).join('')); return p };
function openBook(b) { openId = b.id; $('#ust').textContent = 'Opening book…'; $('#bview').hidden = false; $('#btitle').textContent = b.name; BK.load(paginate(b.text)); $('#ust').textContent = 'Book ready. Use the reader controls below.'; $('#bview').scrollIntoView() }
function renderBooks() {
  const l = $('#blist'); l.replaceChildren(); if (!books.length) l.append(h('p', 'mut', 'No books yet. Upload one above!'));
  books.forEach(b => {
    const c = h('div', 'card'); c.append(h('h3', 0, b.name), h('p', 'mut', b.ext.toUpperCase() + ' · ' + (b.size / 1048576).toFixed(1) + ' MB'));
    const o = h('button', 'btn g', 'Open & Read Aloud'); o.title = 'Open this book and show its reading controls'; o.onclick = () => openBook(b); const d = h('button', 'lnk', 'Delete'); d.title = 'Remove this book from your local library';
    d.onclick = async () => { $('#ust').textContent = 'Removing book…'; books = books.filter(x => x.id !== b.id); await idb('readwrite', s => s.delete(b.id)); if (openId === b.id) BK.wipe(); $('#ust').textContent = 'Book removed.'; renderBooks() }; c.append(o, d); l.append(c)
  })
}
async function pdfText(f, st) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf = await pdfjsLib.getDocument({ data: await f.arrayBuffer(), isEvalSupported: false }).promise; let t = '';
  for (let i = 1; i <= pdf.numPages; i++) { st.textContent = 'Reading page ' + i + ' of ' + pdf.numPages + '…'; const c = await (await pdf.getPage(i)).getTextContent(); t += c.items.map(x => x.str).join(' ') + '\n\n' } return t
}
async function epubText(f) {
  const z = await JSZip.loadAsync(await f.arrayBuffer()), dp = new DOMParser();
  const rf = dp.parseFromString(await z.file('META-INF/container.xml').async('string'), 'text/xml').querySelector('rootfile').getAttribute('full-path');
  const opf = dp.parseFromString(await z.file(rf).async('string'), 'text/xml'), base = rf.replace(/[^/]*$/, ''), man = {}; let t = '';
  opf.querySelectorAll('manifest item').forEach(i => man[i.getAttribute('id')] = i.getAttribute('href'));
  for (const r of opf.querySelectorAll('spine itemref')) {
    const p = man[r.getAttribute('idref')]; if (!p) continue;
    const full = decodeURIComponent(new URL(p, 'https://epub/' + rf).pathname.slice(1));   /* resolves "../Text/ch1.xhtml" against the .opf folder */
    const fl = z.file(full) || z.file(base + p) || z.file(decodeURIComponent(base + p)); if (!fl) continue;
    const d = dp.parseFromString(await fl.async('string'), 'text/html'); t += (d.body ? d.body.textContent : '').replace(/\s+/g, ' ') + '\n\n'
  } return t
}
const MAX_UPLOAD = 35 * 1024 * 1024;   /* 35 MB upload limit */
$('#file').onchange = async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return; const st = $('#ust'), ext = f.name.split('.').pop().toLowerCase();   /* cleared first so the same file can be picked again */
  if (f.size > MAX_UPLOAD) { st.textContent = 'That file is bigger than 35 MB. Please choose a smaller one.'; return }
  if (!['pdf', 'txt', 'epub'].includes(ext)) { st.textContent = 'Please choose a PDF, TXT or EPUB file.'; return }
  st.textContent = 'Reading your book…';
  try {
    let t = ext === 'txt' ? await f.text() : ext === 'pdf' ? await pdfText(f, st) : await epubText(f); t = t.replace(/[ \t]+/g, ' ').trim(); if (t.length < 20) throw 0;
    const b = { id: Date.now(), name: f.name.replace(/\.[^.]+$/, ''), ext, size: f.size, text: t }; books.unshift(b);
    const stored = await idb('readwrite', s => s.put(b)) != null; renderBooks(); openBook(b);
    st.textContent = stored ? 'Done! Your book is ready.' : 'Your book is open, but this browser could not save it (storage may be full), so it will be gone after you reload.'
  }
  catch (err) { st.textContent = 'Sorry, I could not find readable text in that file. Scanned or protected files may not work.' }
};
idb('readonly', s => s.getAll()).then(r => { if (r) books = r.sort((a, b) => b.id - a.id); renderBooks() });
