/* ---------- Dictionary (starter list) ---------- */
const DICT={};`butterfly|noun|a colorful insect with big wings|The butterfly landed on a flower.
curious|adjective|wanting to learn or know more|The curious cat looked in the box.
village|noun|a small town in the countryside|Our village has one little school.
wander|verb|to walk around with no plan|We wander through the park.
giant|adjective|very, very big|A giant tree stood by the river.
gentle|adjective|soft and kind|Be gentle with the baby bird.
happy|adjective|feeling glad and cheerful|I am happy to see you.
friend|noun|someone you like and enjoy being with|My friend shares her toys.
story|noun|words that tell about things that happen|Dad read me a bedtime story.
animal|noun|a living thing that is not a plant|A dog is an animal.
garden|noun|a place where flowers or food grow|We planted seeds in the garden.
river|noun|a long stream of water|The river runs to the sea.
forest|noun|a big area full of trees|Deer live in the forest.
brave|adjective|not afraid to do hard things|The brave girl climbed the hill.
quiet|adjective|making very little sound|Please be quiet in the library.
bright|adjective|giving a lot of light|The sun is bright today.
smile|noun|a happy look on your face|Her smile made me happy.
family|noun|parents, children and relatives|My family eats dinner together.
school|noun|a place where children learn|I walk to school with my sister.
dream|noun|pictures your mind makes while you sleep|I had a dream about flying.
planet|noun|a big round world that moves around a star|Earth is our planet.
ocean|noun|a very large body of salt water|Whales swim in the ocean.
rabbit|noun|a small furry animal with long ears|The rabbit hopped away.
castle|noun|a big stone building where kings and queens lived|The castle had tall towers.
whisper|verb|to speak very softly|Whisper so you don't wake her.
journey|noun|a long trip from one place to another|Our journey took three days.
magic|noun|special power that seems impossible|The wizard used magic.
clever|adjective|quick to learn and smart|The clever fox solved the puzzle.
window|noun|glass in a wall that lets in light|I looked out of the window.
morning|noun|the first part of the day|I eat breakfast in the morning.
yellow|adjective|the color of a banana or the sun|She wore a yellow hat.
travel|verb|to go from one place to another|We travel by train.
mountain|noun|a very high hill|Snow sits on top of the mountain.
treasure|noun|gold, jewels and other valuable things|The pirates hid their treasure.
rainbow|noun|colored arcs in the sky after rain|We saw a rainbow after the storm.
book|noun|pages with words or pictures fastened together|I borrowed a book about space.
read|verb|to look at words and understand them|I love to read every night.`.split('\n').forEach(l=>{const[w,p,m,e]=l.split('|');DICT[w]={w,p,m,e}});
const saved=()=>LS.get('pp_words',[]);
function find(raw){const w=raw.toLowerCase().replace(/[^a-z']/g,'').replace(/'s$/,'');if(!w)return null;
 const s=saved().find(x=>x.w===w);if(s)return s;
 for(const c of[w,w.replace(/(s|es|ed|ing|ly)$/,''),w.replace(/(ed|ing)$/,'e')])if(DICT[c])return DICT[c];return{w,none:1}}
/* ---------- Online lookup: Free Dictionary API, with Wiktionary and Datamuse as fallbacks ---------- */
const online=new Map();
const clean=raw=>raw.toLowerCase().replace(/[^a-z']/g,'').replace(/'s$/,'');
const txt=s=>new DOMParser().parseFromString(String(s||''),'text/html').body.textContent.replace(/\s+/g,' ').trim();
const POS={n:'noun',v:'verb',adj:'adjective',adv:'adverb'};
/* GET + JSON. Returns undefined for 404 (word not in this dictionary); THROWS for network/CORS/timeout/HTTP/parse problems */
async function getJSON(url,signal){const r=await fetch(url,{signal});
 if(r.status===404)return undefined;
 if(!r.ok)throw new Error('HTTP '+r.status);
 return r.json()}
/* Every parser returns {w, p: part of speech, ph: phonetic, m: definition, ex: [up to 2 examples]} or null */
function parseEntry(d){if(!Array.isArray(d)||!d[0])return null;let p='',m='';const ex=[];      /* Free Dictionary API */
 for(const en of d)for(const mn of en.meanings||[])for(const x of mn.definitions||[]){
  if(!m){m=x.definition;p=mn.partOfSpeech||''}
  if(x.example&&ex.length<2&&!ex.includes(x.example))ex.push(x.example)}
 const ph=d[0].phonetic||(d[0].phonetics||[]).map(x=>x.text).find(Boolean)||'';
 return m?{w:String(d[0].word).toLowerCase(),p,ph,m,ex}:null}
function parseWikt(d,t){const en=d&&d.en;if(!Array.isArray(en))return null;let p='',m='';const ex=[];  /* Wiktionary REST API (HTML -> text) */
 for(const s of en)for(const x of s.definitions||[]){const def=txt(x.definition);if(!def)continue;
  if(!m){m=def;p=String(s.partOfSpeech||'').toLowerCase()}
  for(const e of x.examples||[]){const q=txt(e);if(q&&ex.length<2&&!ex.includes(q))ex.push(q)}}
 return m?{w:t,p,ph:'',m,ex}:null}
function parseMuse(d,t){const e=Array.isArray(d)&&d[0];if(!e||e.word!==t||!e.defs||!e.defs.length)return null;   /* Datamuse: "adj\tdefinition" */
 const[k,...r]=e.defs[0].split('\t'),m=r.join(' ').trim();return m?{w:t,p:POS[k]||'',ph:'',m,ex:[]}:null}
/* Each provider resolves to an entry or null (not found) and THROWS when it could not be reached. Order = priority. */
const PROVIDERS=[
 {name:'Free Dictionary',get:async(t,s)=>parseEntry(await getJSON('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(t),s))},
 {name:'Wiktionary',get:async(t,s)=>parseWikt(await getJSON('https://en.wiktionary.org/api/rest_v1/page/definition/'+encodeURIComponent(t),s),t)},
 {name:'Datamuse',get:async(t,s)=>parseMuse(await getJSON('https://api.datamuse.com/words?max=1&md=dp&sp='+encodeURIComponent(t),s),t)}];
/* resolves to an entry, null (word not found) or {fail:true} (no dictionary could be reached at all) */
async function fetchWord(w){if(online.has(w))return online.get(w);
 const forms=[...new Set([w,w.replace(/(s|es|ed|ing|ly)$/,''),w.replace(/(ed|ing)$/,'e')])].filter(x=>x.length>1);
 const down=new Set();let answered=false;      /* answered = at least one provider replied (even with "not found") */
 for(const t of forms)for(const P of PROVIDERS){if(down.has(P.name))continue;
  const ac=new AbortController(),to=setTimeout(()=>ac.abort(),7000);
  try{const e=await P.get(t,ac.signal);answered=true;if(e){online.set(w,e);return e}}
  catch(err){down.add(P.name);console.warn('[PhonicsPal] '+P.name+' lookup failed for "'+t+'":',err)}   /* CORS / network / timeout: try the next provider */
  finally{clearTimeout(to)}}
 return answered?null:{fail:true}}
let lookTok=0;   /* ignore late answers when the user has clicked another word */
async function showLook(el,raw){const w=clean(raw);if(!w)return;const tok=++lookTok;el.hidden=false;el.replaceChildren();
 const top=h('div','row'),body=h('div');top.append(h('b','lw',w));const ic=h('button','ic','🔊');ic.setAttribute('aria-label','Hear the word');ic.onclick=()=>sp(w,.7);top.append(ic);el.append(top,body);sp(w,.7);
 let e=find(raw);
 if(e.none){body.append(h('p','mut','Looking up “'+w+'”…'));e=await fetchWord(w);if(tok!==lookTok)return;body.replaceChildren();
  if(!e||e.fail){body.append(h('p','mut',e?(navigator.onLine===false?'You seem to be offline. Check your internet connection and try again.':'The online dictionary isn’t answering right now. Please try again in a moment.'):'No definition found for “'+w+'”. Check the spelling.'));
   const r=h('button','btn t','↻ Try again');r.onclick=()=>showLook(el,raw);body.append(r);return}}
 const ex=(e.ex||(e.e?[e.e]:[])).slice(0,2);
 body.append(h('i',0,[e.ph,e.p].filter(Boolean).join('  ·  ')),h('p',0,e.m));
 ex.forEach(t=>body.append(h('p','mut','“'+t+'”')));if(!ex.length)body.append(h('p','mut','No example sentence available for this word.'));
 const sv=h('button','btn g',saved().some(x=>x.w===e.w)?'✓ Saved':'+ Save Word');
 sv.onclick=()=>{const l=saved().filter(x=>x.w!==e.w);l.push({w:e.w,p:e.p||'',m:e.m,e:ex[0]||'',ex});LS.set('pp_words',l);sv.textContent='✓ Saved';renderVocab()};
 body.append(sv)}
