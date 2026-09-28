/* ---------- Reader (text-to-speech + highlight + lookup) ---------- */
function Reader(root,input){
 root.innerHTML=(input?'<textarea placeholder="Paste or type your text here…" aria-label="Text to read"></textarea>':'')+
 '<div class="view" hidden></div><div class="row" style="margin:10px 0"><button class="btn go">▶ Read It to Me</button><button class="btn t pa">❚❚ Pause</button><button class="btn t re">▶ Resume</button><button class="btn s st">■ Stop</button><button class="btn s cl">✕ Clear Text</button>'+(input?'<button class="btn p ed">✎ Edit text</button>':'')+
 '<select class="rate" aria-label="Speed"><option value=".6">Slow</option><option value=".85" selected>Normal</option><option value="1.1">Fast</option></select><span class="mut cnt"></span></div>'+
 '<div class="row pg" hidden><button class="btn p pv">◀ Back</button><span class="pn"></span><button class="btn p nx">Next ▶</button></div><div class="look" hidden></div>';
 const q=s=>$(s,root),view=q('.view'),ta=q('textarea'),cnt=q('.cnt'),look=q('.look'),rate=q('.rate'),pgb=q('.pg');
 let pages=[],pi=0,spans=[],chunks=[],gen=0,si=0,active=false,resume=null,lastOff=0;
 function render(){view.hidden=false;if(ta)ta.hidden=true;const t=pages[pi]||'';view.replaceChildren();spans=[];
  const re=/\S+/g,f=document.createDocumentFragment();let m,last=0;
  while(m=re.exec(t)){if(m.index>last)f.append(t.slice(last,m.index));const s=h('span',0,m[0]);spans.push([m.index,s]);f.append(s);last=m.index+m[0].length}
  f.append(t.slice(last));view.append(f);si=0;lastOff=0;view.scrollTop=0;pgb.hidden=pages.length<2;q('.pn').textContent='Page '+(pi+1)+' of '+pages.length}
 function hl(o){if(!spans.length)return;let k=si;while(k+1<spans.length&&spans[k+1][0]<=o)k++;while(k>0&&spans[k][0]>o)k--;
  spans[si][1].classList.remove('on');si=k;lastOff=spans[k][0];const s=spans[k][1];s.classList.add('on');s.scrollIntoView({block:'nearest'})}
 const clear=()=>spans[si]&&spans[si][1].classList.remove('on');
 function chunk(t){const a=[],re=/[^.!?\n]+[.!?]*\s*/g;let m;
  while(m=re.exec(t)){let x=m[0],o=m.index;while(x.length>240){let k=x.lastIndexOf(' ',240);if(k<80)k=240;a.push({o,t:x.slice(0,k)});x=x.slice(k);o+=k}if(x.trim())a.push({o,t:x})}return a}
 let pre=[];
 /* play(from): start at character offset `from` of the current page (0 = top) */
 function play(from=0){const g=++gen;Speech.stop();pre=[];active=true;resume=null;
  chunks=chunk(pages[pi]||'').filter(c=>c.o+c.t.length>from).map(c=>c.o<from?{o:from,t:c.t.slice(from-c.o)}:c);setTimeout(()=>run(0,g),60)}
 function run(i,g){if(g!==gen)return;
  if(i>=chunks.length){if(pi<pages.length-1){pi++;render();return play()}active=false;return clear()}
  const c=chunks[i],r=+rate.value;pre[i]=pre[i]||Speech.prepare(c.t,r);
  if(chunks[i+1]&&!pre[i+1])pre[i+1]=Speech.prepare(chunks[i+1].t,r);
  Speech.play(pre[i],{start:()=>g===gen&&hl(c.o),prog:k=>g===gen&&hl(c.o+k)}).then(()=>run(i+1,g))}
 const halt=()=>{gen++;Speech.stop();active=false};
 /* park: stop audio but remember page + word position so Resume can continue from there */
 const park=()=>{if(active)resume={pi,off:lastOff};halt()};
 /* wipe: full reset to an empty state (Clear Text button, or the open book was deleted) */
 const wipe=()=>{halt();resume=null;pages=[];pi=0;spans=[];si=0;lastOff=0;view.replaceChildren();view.hidden=true;look.hidden=true;pgb.hidden=true;
  if(ta)ta.hidden=false,ta.value='';cnt.textContent='';api.onClear&&api.onClear()};
 q('.go').onclick=()=>{if(ta){const t=ta.value.trim();if(!t){cnt.textContent='Please add some text first.';return}pages=[t];pi=0;render()}
  else if(!pages.length)return;resume=null;play()};
 q('.pa').onclick=()=>Speech.pause();q('.re').onclick=()=>{if(resume){const r=resume;if(r.pi!==pi){pi=r.pi;render()}play(r.off)}else Speech.resume()};
 q('.st').onclick=()=>{halt();resume=null;clear()};q('.cl').onclick=wipe;
 q('.pv').onclick=()=>{if(pi>0){halt();resume=null;pi--;render()}};q('.nx').onclick=()=>{if(pi<pages.length-1){halt();resume=null;pi++;render()}};
 if(ta){const words=()=>(ta.value.match(/\S+/g)||[]);
  ta.oninput=()=>{let w=words();if(w.length>10000){const m=[...ta.value.matchAll(/\S+/g)][9999];ta.value=ta.value.slice(0,m.index+m[0].length);w=words();cnt.textContent='10,000 word limit reached'}else cnt.textContent=w.length.toLocaleString()+' / 10,000 words'};
  q('.ed').onclick=()=>{halt();resume=null;view.hidden=true;ta.hidden=false}}
 view.onclick=e=>{const s=e.target.closest('span');if(s){park();showLook(look,s.textContent)}};
 /* leaving this tab: stop speech (and keep the position) so nothing reads in the background */
 document.addEventListener('tabchange',e=>{if(root.closest('section').id!==e.detail.to)park()});
 const api={load(p){halt();resume=null;pages=p;pi=0;look.hidden=true;render()},stop:halt,wipe,onClear:null};return api}
const RW=Reader($('#rw'),true),BK=Reader($('#bk'),false);
