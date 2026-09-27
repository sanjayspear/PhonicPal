const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const TTS='speechSynthesis' in window;if(!TTS)$('#warn').hidden=false;
const h=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const shuf=a=>[...a].sort(()=>Math.random()-.5);
const sp=(t,r=.8,keep)=>new Promise(res=>{if(!TTS)return res();if(!keep)speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=r;u.onend=u.onerror=res;speechSynthesis.speak(u)});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function go(id){$$('main>section').forEach(s=>s.hidden=s.id!==id);$$('#nav button').forEach(b=>b.classList.toggle('a',b.dataset.go===id));scrollTo(0,0)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)});
