import numpy as np, parselmouth
from kokoro_onnx import Kokoro
K=Kokoro('kokoro-v1.0.onnx','voices-v1.0.bin')
REF={'i':(310,2790),'ɪ':(430,2480),'ɛ':(610,2330),'æ':(860,2050),'ɑ':(850,1220),'ʌ':(760,1400),'u':(370,950)}
def gen(ph,voice='af_heart',speed=1.0):
    a,sr=K.create(ph,voice=voice,speed=speed,lang='en-us',is_phonemes=True,trim=False);return np.asarray(a,dtype=np.float32),sr
def voiced(a,sr,fr=0.01):
    if not np.isfinite(a).all() or np.abs(a).max()>5: return None
    w=int(sr*fr);n=len(a)//w
    if n<3: return None
    rms=np.array([np.sqrt(np.mean(a[i*w:(i+1)*w]**2)) for i in range(n)])
    idx=np.where(rms>0.15*rms.max())[0]
    if len(idx)==0: return None
    return a[idx[0]*w:(idx[-1]+1)*w]
def fmts(a,sr):
    v=voiced(a,sr)
    if v is None or len(v)<sr*0.08: return None
    s=parselmouth.Sound(v,sr);f=s.to_formant_burg(time_step=0.01,max_number_of_formants=5,maximum_formant=5500)
    T=np.linspace(len(v)/sr*.3,len(v)/sr*.7,8)
    F1=[f.get_value_at_time(1,t) for t in T];F2=[f.get_value_at_time(2,t) for t in T]
    F1=[x for x in F1 if x==x];F2=[x for x in F2 if x==x]
    return (float(np.median(F1)),float(np.median(F2)),len(v)/sr) if F1 and F2 else None
def classify(f1,f2):
    return min(REF,key=lambda k:np.hypot(np.log(f1/REF[k][0]),np.log(f2/REF[k][1])))
if __name__=='__main__':
    for target,cands in [('æ',['ˈæ.','æ','ˈæ']),('ɛ',['ˈɛ.','ɛ']),('ɪ',['ˈɪ.','ɪ']),('ɑ',['ˈɑ.','ɑ']),('ʌ',['ˈʌ.','ʌ']),('i',['ˈi.','i']),('u',['ˈu.','u'])]:
        for c in cands:
            a,sr=gen(c);r=fmts(a,sr)
            print(target,repr(c),'->', 'BAD' if r is None else (round(r[0]),round(r[1]),'%.2fs'%r[2],'heard as',classify(r[0],r[1])))
