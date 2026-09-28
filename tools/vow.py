import numpy as np, subprocess, soundfile as sf, os
from lab2 import *
def nucleus(a,sr):
    """vowel-initial word: keep from first voiced frame until energy collapses (stop closure / next consonant)"""
    if not np.isfinite(a).all() or np.abs(a).max()>5: return None
    w=int(sr*.005);n=len(a)//w;rms=np.array([np.sqrt(np.mean(a[i*w:(i+1)*w]**2)) for i in range(n)]);m=rms.max()
    s=int(np.argmax(rms>0.25*m));pk=s+int(np.argmax(rms[s:s+int(.25/.005)]))
    e=pk
    while e<n-1 and rms[e]>0.22*m: e+=1
    seg=a[s*w:e*w]
    return seg
def stretch(seg,sr,factor=0.6):
    sf.write('/tmp/_in.wav',seg,sr);subprocess.run(['ffmpeg','-y','-loglevel','error','-i','/tmp/_in.wav','-filter:a',f'atempo={factor}','/tmp/_out.wav'],check=True)
    o,sr2=sf.read('/tmp/_out.wav');return o.astype(np.float32),sr2
def dist(f,t): return float(np.hypot(np.log(f[0]/REF[t][0]),np.log(f[1]/REF[t][1])))
if __name__=='__main__':
    for t,cars in [('æ',['ˈæt','ˈæp','ˈæd','ˈæk']),('ɛ',['ˈɛt','ˈɛd','ˈɛk','ˈɛp']),('ɪ',['ˈɪt','ˈɪp','ˈɪd','ˈɪk']),('ɑ',['ˈɑt','ˈɑp','ˈɑd','ˈɑk']),('ʌ',['ˈʌt','ˈʌp','ˈʌd','ˈʌk'])]:
        for c in cars:
            a,sr=gen(c);seg=nucleus(a,sr)
            if seg is None or len(seg)<sr*.08: print(t,c,'BAD');continue
            f=fmts(seg,sr)
            if not f: print(t,c,'noformant',len(seg)/sr);continue
            print(t,c,'%.2fs'%(len(seg)/sr),(round(f[0]),round(f[1])),'->',classify(f[0],f[1]),'dist %.2f'%dist(f,t))
