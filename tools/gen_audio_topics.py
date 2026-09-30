# Audio for the topic map (js/topics.js): new sounds, letter names, word endings (rimes) and words.
# Same voice and processing as gen_audio.py. Run from a folder holding kokoro-v1.0.onnx and voices-v1.0.bin:
#   python tools/gen_audio_topics.py <out dir> [words.txt]
# Existing files in <out dir> are skipped, so it only fills in what is missing.
# Words are spoken from their phonemes in misaki's US dictionary (pip install --no-deps misaki), so espeak is not needed.
import numpy as np, soundfile as sf, subprocess, os, sys, json, misaki
from kokoro_onnx import Kokoro
K = Kokoro('kokoro-v1.0.onnx', 'voices-v1.0.bin'); V = 'af_heart'
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
def norm(a, db=-3): return a / np.max(np.abs(a)) * 10 ** (db / 20)
def fade(a, sr, ms=12, tail=25):
    a = a.copy(); n = int(sr * ms / 1000); t = int(sr * tail / 1000); a[:n] *= np.linspace(0, 1, n); a[-t:] *= np.linspace(1, 0, t); return a
def ok(a): return np.isfinite(a).all() and np.abs(a).max() < 5 and len(a) > 2000
def render(x, speed=1.0, trim=False):
    for sp in (speed, speed * .95, speed * 1.05, speed * .9):
        a, sr = K.create(x, voice=V, speed=sp, lang='en-us', is_phonemes=True, trim=trim); a = np.asarray(a, dtype=np.float32)
        if ok(a): return a, sr
    raise RuntimeError(x)
def edges(a, thr=.03):
    e = np.abs(a); i = np.where(e > thr * e.max())[0]; return a[i[0]:i[-1] + 1]
def nuc(a, sr, thr):
    w = int(sr * .005); n = len(a) // w; r = np.array([np.sqrt(np.mean(a[i * w:(i + 1) * w] ** 2)) for i in range(n)]); m = r.max(); pk = int(np.argmax(r)); s = e = pk
    while s > 0 and r[s] > thr * m: s -= 1
    while e < n - 1 and r[e] > thr * m: e += 1
    return a[s * w:e * w]
def save(name, a, sr):
    if os.path.exists(f'{OUT}/{name}.mp3'): return None
    a = fade(norm(a), sr); sf.write(f'{OUT}/{name}.wav', a, sr)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{OUT}/{name}.wav', '-ar', '24000', '-b:a', '48k', f'{OUT}/{name}.mp3'], check=True); os.remove(f'{OUT}/{name}.wav')
    return round(len(a) / sr, 2)
rep = {}
# consonant blends: consonants + a short "uh", like the existing ones
for k, ph in {'cr': 'kɹˈʌ', 'dr': 'dɹˈʌ', 'fl': 'flˈʌ', 'gl': 'ɡlˈʌ', 'pl': 'plˈʌ', 'pr': 'pɹˈʌ', 'sk': 'skˈʌ', 'sl': 'slˈʌ', 'sm': 'smˈʌ', 'sn': 'snˈʌ', 'sp': 'spˈʌ', 'sw': 'swˈʌ'}.items():
    a, sr = render(ph); rep['s_' + k] = save('s_' + k, edges(a), sr)
# glued sounds and r-vowels, cut from a short syllable
for k, ph in {'ng': 'ˈʌŋ', 'nk': 'ˈʌŋk', 'air': 'hˈɛɹ', 'ear': 'hˈɪɹ'}.items():
    a, sr = render(ph); rep['s_' + k] = save('s_' + k, nuc(a, sr, .2) if ph[0] == 'h' else edges(a), sr)
a, sr = render('hˈʌd'); rep['s_schwa'] = save('s_schwa', nuc(a, sr, .5), sr)
# letter names
NAMES = {'a': 'ˈA', 'b': 'bˈi', 'c': 'sˈi', 'd': 'dˈi', 'e': 'ˈi', 'f': 'ˈɛf', 'g': 'ʤˈi', 'h': 'ˈAʧ', 'i': 'ˈI', 'j': 'ʤˈA', 'k': 'kˈA', 'l': 'ˈɛl', 'm': 'ˈɛm',
         'n': 'ˈɛn', 'o': 'ˈO', 'p': 'pˈi', 'q': 'kjˈu', 'r': 'ˈɑɹ', 's': 'ˈɛs', 't': 'tˈi', 'u': 'jˈu', 'v': 'vˈi', 'w': 'dˈʌbəljˌu', 'x': 'ˈɛks', 'y': 'wˈI', 'z': 'zˈi'}
for k, ph in NAMES.items():
    a, sr = render(ph); rep['n_' + k] = save('n_' + k, edges(a), sr)
# word endings (rimes) for onset-and-rime and word families
RIMES = {'ake': 'ˈAk', 'an': 'ˈæn', 'ar': 'ˈɑɹ', 'at': 'ˈæt', 'ed': 'ˈɛd', 'ee': 'ˈi', 'en': 'ˈɛn', 'et': 'ˈɛt', 'ig': 'ˈɪɡ', 'in': 'ˈɪn', 'ip': 'ˈɪp',
         'og': 'ˈɑɡ', 'op': 'ˈɑp', 'ot': 'ˈɑt', 'ox': 'ˈɑks', 'ug': 'ˈʌɡ', 'un': 'ˈʌn'}
for k, ph in RIMES.items():
    a, sr = render(ph); rep['r_' + k] = save('r_' + k, edges(a), sr)
# words (one per line in words.txt); a few names and words need a fixed pronunciation
LEX = {}
for f in ('us_silver.json', 'us_gold.json'): LEX.update(json.load(open(os.path.join(os.path.dirname(misaki.__file__), 'data', f))))
FIX = {'beth': 'bˈɛθ', 'bow': 'bˈO', 'wind': 'wˈɪnd'}
def phon(w):
    v = FIX.get(w) or LEX.get(w) or LEX.get(w.capitalize())
    return v.get('DEFAULT') or next(iter(v.values())) if isinstance(v, dict) else v
if len(sys.argv) > 2:
    for w in open(sys.argv[2]).read().split():
        a, sr = render(phon(w), .9, True); rep['w_' + w] = save('w_' + w, a, sr)
made = {k: v for k, v in rep.items() if v}
print(len(made), 'new clips'); print({k: v for k, v in made.items() if not k.startswith('w_')})
