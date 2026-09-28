import numpy as np, soundfile as sf, subprocess, os, json, sys
from lab2 import *
from vow import stretch
OUT='/tmp/audio';os.makedirs(OUT,exist_ok=True)
VOICE='af_heart'
def peaknorm(a,db=-3):
    a=a/np.max(np.abs(a));return a*10**(db/20)
def fade(a,sr,ms=12,tail=25):
    a=a.copy();n=int(sr*ms/1000);t=int(sr*tail/1000);a[:n]*=np.linspace(0,1,n);a[-t:]*=np.linspace(1,0,t);return a
def nuc(a,sr,thr):
    w=int(sr*.005);n=len(a)//w;rms=np.array([np.sqrt(np.mean(a[i*w:(i+1)*w]**2)) for i in range(n)]);m=rms.max();pk=int(np.argmax(rms));s=pk;e=pk
    while s>0 and rms[s]>thr*m: s-=1
    while e<n-1 and rms[e]>thr*m: e+=1
    return a[s*w:e*w]
def save(name,a,sr):
    a=fade(peaknorm(a),sr);sf.write(f'{OUT}/{name}.wav',a,sr)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{OUT}/{name}.wav','-ar','24000','-b:a','48k',f'{OUT}/{name}.mp3'],check=True);os.remove(f'{OUT}/{name}.wav')
    return len(a)/sr
def ok(a): return np.isfinite(a).all() and np.abs(a).max()<5 and len(a)>2000
def render(ph,speed=1.0):
    for sp in (speed,speed*0.95,speed*1.05):
        a,sr=gen(ph,VOICE,sp)
        if ok(a): return a,sr
    raise RuntimeError('unstable '+ph)
report={}
# short vowels: nucleus of hVd, slowed to be clear
for key,ph in [('a1','æ'),('e1','ɛ'),('i1','ɪ'),('o1','ɑ'),('u1','ʌ'),('oo','u')]:
    a,sr=render(f'hˈ{ph}d');seg=nuc(a,sr,0.5);seg,sr2=stretch(seg,sr,0.5);d=save('s_'+key,seg,sr2);f=fmts(seg,sr2);report['s_'+key]=(round(d,2),[round(x) for x in f[:2]] if f else None)
# long vowels / teams (diphthongs keep more of the glide)
for key,ph in [('a2','A'),('e2','i'),('i2','I'),('o2','O'),('ou','W')]:
    a,sr=render(f'hˈ{ph}d');seg=nuc(a,sr,0.3);seg,sr2=stretch(seg,sr,0.6);d=save('s_'+key,seg,sr2);report['s_'+key]=(round(d,2),None)
a,sr=render('jˈu');seg=nuc(a,sr,0.25);seg,sr2=stretch(seg,sr,0.7);report['s_u2']=(round(save('s_u2',seg,sr2),2),None)
# consonants and blends: consonant + short "uh"
CONS={'b':'bˈʌ','c':'kˈʌ','d':'dˈʌ','f':'fˈʌ','g':'ɡˈʌ','h':'hˈʌ','j':'ʤˈʌ','k':'kˈʌ','l':'lˈʌ','m':'mˈʌ','n':'nˈʌ','p':'pˈʌ','q':'kwˈʌ','r':'ɹˈʌ','s':'sˈʌ','t':'tˈʌ','v':'vˈʌ','w':'wˈʌ','x':'kˈʌs','y':'jˈʌ','z':'zˈʌ',
 'bl':'blˈʌ','br':'bɹˈʌ','cl':'klˈʌ','fr':'fɹˈʌ','gr':'ɡɹˈʌ','st':'stˈʌ','sh':'ʃˈʌ','ch':'ʧˈʌ','th':'θˈʌ','tr':'tɹˈʌ'}
for k,ph in CONS.items():
    a,sr=render(ph);e=np.abs(a);i=np.where(e>0.03*e.max())[0];seg=a[i[0]:i[-1]+1]
    if k=='x': pass
    report['s_'+k]=(round(save('s_'+k,seg,sr),2),None)
# words
WORDS='apple cat mat bag egg nest bed pen igloo fish pin sit octopus dog hot top umbrella cup bus sun cake rain baby game tree me feet equal kite night ice light boat rope note go unicorn cute flute rule ball goat hat jam lion moon pig queen rabbit tent van web box yak zebra bee cloud pie leaf snow blue brush clap frog grape star ship chip thumb hen stop thin'.split()
for w in dict.fromkeys(WORDS):
    a,sr=K.create(w,voice=VOICE,speed=0.9,lang='en-us',trim=True);a=np.asarray(a,dtype=np.float32)
    if not ok(a): print('WORD BAD',w);continue
    report['w_'+w]=(round(save('w_'+w,a,sr),2),None)
json.dump(report,open('/tmp/audio_report.json','w'))
print(len(report),'clips')
for k in ['s_a1','s_e1','s_i1','s_o1','s_u1','s_a2','s_e2','s_i2','s_o2','s_u2','s_oo','s_ou']: print(k,report[k])
