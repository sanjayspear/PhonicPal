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
function showLook(el,raw){const e=find(raw);if(!e)return;el.hidden=false;el.replaceChildren();
 const top=h('div','row');top.append(h('b','lw',e.w));const ic=h('button','ic','🔊');ic.setAttribute('aria-label','Hear the word');ic.onclick=()=>sp(e.w,.7);top.append(ic);el.append(top);
 let my=null;
 if(e.none){el.append(h('p','mut','I don\'t know this word yet. You can type your own meaning:'));my=h('input');my.placeholder='What does it mean?';el.append(my)}
 else{el.append(h('i',0,e.p||''),h('p',0,e.m));if(e.e)el.append(h('p','mut','“'+e.e+'”'))}
 const sv=h('button','btn g',saved().some(x=>x.w===e.w)?'✓ Saved':'+ Save Word');
 sv.onclick=()=>{const m=my?my.value.trim():e.m;if(!m){my.focus();return}
  const l=saved().filter(x=>x.w!==e.w);l.push({w:e.w,p:e.p||'',m,e:e.e||''});LS.set('pp_words',l);sv.textContent='✓ Saved';renderVocab()};
 el.append(sv);sp(e.w,.7)}
