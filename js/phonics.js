/* ---------- Phonics ---------- */
const V=[['a','ah','apple'],['e','eh','egg'],['i','ih','igloo'],['o','aw','octopus'],['u','uh','umbrella']];
const C=[['b','buh','ball'],['c','kuh','cat'],['d','duh','dog'],['f','fff','fish'],['g','guh','goat'],['h','huh','hat'],['j','juh','jam'],['k','kuh','kite'],['l','lll','lion'],['m','mmm','moon'],['n','nnn','nest'],['p','puh','pig'],['q','kwuh','queen'],['r','rrr','rabbit'],['s','sss','sun'],['t','tuh','tent'],['v','vvv','van'],['w','wuh','web'],['x','ks','box'],['y','yuh','yak'],['z','zzz','zebra']];
const VB=[['ai','ay','rain'],['ee','ee','bee'],['oa','oh','boat'],['oo','oo','moon'],['ou','ow','cloud'],['ie','eye','pie'],['ea','ee','leaf'],['ow','oh','snow']];
const CB=[['bl','bluh','blue'],['br','bruh','brush'],['cl','cluh','clap'],['fr','fruh','frog'],['gr','gruh','grape'],['st','sst','star'],['sh','shh','ship'],['ch','chuh','chip'],['th','thh','thumb'],['tr','truh','tree']];
const WB=['c-a-t','s-u-n','p-i-g','d-o-g','b-u-s','h-e-n','sh-i-p','fr-o-g','ch-i-p','cl-a-p','st-o-p','th-i-n'];
const SAY={};[...V,...C,...VB,...CB].forEach(x=>SAY[x[0]]=x[1]);
const PT=[['Vowel Sounds',V,'Tap a card to hear the sound and an example word.'],['Consonant Sounds',C,'Tap a card to hear the sound and an example word.'],['Vowel Blending',VB,'Two vowels together make one new sound.'],['Consonant Blending',CB,'Two consonants blend together at the start of a word.'],['Word Blending Practice',null,'Listen to each sound, then hear them blend into a word.']];
function renderPh(i){$$('#ptabs button').forEach((b,j)=>b.classList.toggle('a',i===j));$('#pintro').textContent=PT[i][2];const B=$('#pbody');B.replaceChildren();
 const g=h('div','grid');
 if(PT[i][1])PT[i][1].forEach(([s,say,ex])=>{const b=h('button','card');b.append(h('span','big',s),h('span','mut','as in '+ex));b.onclick=()=>{sp(say,.6);sp(ex,.7,true)};g.append(b)});
 else{g.className='grid g2';WB.forEach(w=>{const toks=w.split('-'),c=h('div','card wb');toks.forEach(t=>c.append(h('span','tile',t)));
  const b=h('button','btn g','▶ Blend');b.onclick=async()=>{speechSynthesis.cancel();await wait(80);const t=$$('.tile',c);
   for(let k=0;k<toks.length;k++){t[k].classList.add('on');await sp(SAY[toks[k]]||toks[k],.6,true);t[k].classList.remove('on')}
   c.classList.add('done');await sp(toks.join(''),.7,true);c.classList.remove('done')};c.append(b);g.append(c)})}
 B.append(g)}
PT.forEach((p,i)=>{const b=h('button',0,p[0]);b.onclick=()=>renderPh(i);$('#ptabs').append(b)});renderPh(0);
