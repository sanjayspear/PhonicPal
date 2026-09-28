import numpy as np, soundfile as sf, subprocess, os
from lab2 import *
from vow import stretch
OUT='/tmp/audio2';os.makedirs(OUT,exist_ok=True);V='af_heart'
def norm(a,db=-3): return a/np.max(np.abs(a))*10**(db/20)
def fade(a,sr,ms=12,tail=25):
    a=a.copy();n=int(sr*ms/1000);t=int(sr*tail/1000);a[:n]*=np.linspace(0,1,n);a[-t:]*=np.linspace(1,0,t);return a
def nuc(a,sr,thr):
    w=int(sr*.005);n=len(a)//w;r=np.array([np.sqrt(np.mean(a[i*w:(i+1)*w]**2)) for i in range(n)]);m=r.max();pk=int(np.argmax(r));s=e=pk
    while s>0 and r[s]>thr*m:s-=1
    while e<n-1 and r[e]>thr*m:e+=1
    return a[s*w:e*w]
def ok(a): return np.isfinite(a).all() and np.abs(a).max()<5 and len(a)>2000
def render(ph,speed=1.0,text=False):
    for sp in (speed,speed*.95,speed*1.05,speed*.9):
        a,sr=K.create(ph,voice=V,speed=sp,lang='en-us',is_phonemes=not text,trim=text);a=np.asarray(a,dtype=np.float32)
        if ok(a):return a,sr
    raise RuntimeError(ph)
def save(name,a,sr):
    a=fade(norm(a),sr);sf.write(f'{OUT}/{name}.wav',a,sr)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{OUT}/{name}.wav','-ar','24000','-b:a','48k',f'{OUT}/{name}.mp3'],check=True);os.remove(f'{OUT}/{name}.wav');return round(len(a)/sr,2)
rep={}
a,sr=render('wˈʌ');e=np.abs(a);i=np.where(e>.03*e.max())[0];rep['s_wh']=save('s_wh',a[i[0]:i[-1]+1],sr)
for k,ph in [('ar','hˈɑɹ'),('er','hˈɜɹ'),('ir','hˈɜɹ'),('or','hˈɔɹ'),('ur','hˈɜɹ'),('oi','hˈɔɪ')]:
    a,sr=render(ph);seg=nuc(a,sr,.3);seg,sr2=stretch(seg,sr,.7);rep['s_'+k]=save('s_'+k,seg,sr2)
W='chin chop lunch shop wish bath this whale wheel white when duck clock sock back car farm park her fern teacher sister bird girl shirt stir corn fork horse storm turn burn nurse purple coin oil soil boil boy toy joy enjoy house mouse out cow now down brown'.split()
for w in W:
    a,sr=render(w,.9,True);rep['w_'+w]=save('w_'+w,a,sr)
print(len(rep),'clips');print({k:v for k,v in rep.items() if k.startswith('s_')})
