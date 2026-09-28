/* ---------- Vocabulary ---------- */
let vt='all';
const VT=[['all','All Words'],['saved','Saved by Me'],['def','Starter List'],['prac','Practice']];
const allWords=()=>{const s=saved();return[...s,...Object.values(DICT).filter(x=>!s.some(y=>y.w===x.w))]};
function renderVocab(){$$('#vtabs button').forEach((b,i)=>b.classList.toggle('a',VT[i][0]===vt));const l=$('#vlist');l.replaceChildren();
 if(vt==='prac')return quiz();
 const s=saved(),a=vt==='saved'?s:vt==='def'?Object.values(DICT):allWords();
 if(!a.length){l.append(h('p','mut','No saved words yet. Tap a word while reading, then press Save Word.'));return}
 a.forEach(x=>{const c=h('div','card wc'),r=h('div','row');r.append(h('h3',0,x.w));const ic=h('button','ic','🔊');ic.setAttribute('aria-label','Hear '+x.w);ic.onclick=()=>sp(x.w,.7);r.append(ic);
  c.append(r,h('i',0,x.p||''),h('p',0,x.m));(x.ex&&x.ex.length?x.ex:x.e?[x.e]:[]).forEach(t=>c.append(h('p','mut','“'+t+'”')));
  if(s.some(y=>y.w===x.w)){const d=h('button','lnk','Remove');d.onclick=()=>{LS.set('pp_words',saved().filter(y=>y.w!==x.w));renderVocab()};c.append(d)}l.append(c)})}
function quiz(){const l=$('#vlist'),a=allWords();l.replaceChildren();const q=a[Math.floor(Math.random()*a.length)],
 opts=shuf([q,...shuf(a.filter(x=>x!==q)).slice(0,2)]),c=h('div','card wc');c.style.gridColumn='1/-1';
 c.append(h('h3',0,'Which word means:'),h('p',0,'“'+q.m+'”'));const fb=h('p',0,'');
 opts.forEach(o=>{const b=h('button','btn p',o.w);b.onclick=()=>{if(o===q){b.className='btn ok';fb.textContent='🎉 Great job!';sp(q.w,.7);const n=h('button','btn','Next word ▶');n.onclick=quiz;c.append(n)}else{b.className='btn no';fb.textContent='Try again!'}};c.append(b)});
 c.append(fb);l.append(c)}
VT.forEach(([k,n])=>{const b=h('button',0,n);b.onclick=()=>{vt=k;renderVocab()};$('#vtabs').append(b)});renderVocab();
