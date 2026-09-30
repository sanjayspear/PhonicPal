# PhonicsPal

Interactive English phonics and reading practice website (MVP). Plain HTML/CSS/JS, no build step.

## Run locally
- VS Code: install the **Live Server** extension, right-click `index.html` > *Open with Live Server*, or
- Terminal: `npm start` (serves the folder on http://localhost:3000).

Use Chrome or Edge for the best text-to-speech and word highlighting. Internet is needed to load PDF.js and JSZip from the cdnjs CDN.

## Structure
| File | Purpose |
|---|---|
| `index.html` | Page markup and script loading order |
| `css/styles.css` | Theme (light/dark), layout, components |
| `js/core.js` | Helpers, localStorage wrapper, `sp()` speech helper, navigation |
| `js/env.js` | Environment detection (file/localhost/public, secure context, memory tier) that decides which voice engines are offered |
| `js/curriculum.js` | Datasets: consonant digraphs, r-controlled vowels, diphthongs (ids, graphemes, IPA, examples, «marked» sentences) |
| `js/speech.js` | SpeechService: natural voice (Kokoro, open source) + browser-voice fallback, phoneme playback |
| `js/dictionary.js` | Starter dictionary (37 words), online lookup (Free Dictionary API with Wiktionary/Datamuse fallbacks), word lookup panel, save word |
| `js/reader.js` | Reader: text-to-speech, word highlight, pause/resume/stop, paging |
| `js/custom-phonics.js` | User-added phonics cards (localStorage `pp_custom_ph`) and the "Add Custom Blend" form |
| `js/topics.js` | The phonics topic map: 62 topics in 8 groups, their words, sounds, pictures and stories |
| `js/phonics-views.js` | Page builders for each kind of topic page (cards, blending, sound boxes, word families, magic e, stories, fluency timer…) and the sound "steps" they play |
| `js/phonics-guide.js` | "For grown-ups" guide for every topic, the "Start here" guide, stars and stickers |
| `js/phonics.js` | Phonics screen: group bar, topic tabs, the open topic |
| `js/phonics-game.js` | "Play the game": a 5-round game per topic, built from question makers (rhyme, clap, swap, spell, sort, read…) |
| `assets/audio/` | Recorded phonics sounds and example words (mp3) |
| `tools/` | Scripts used to generate the audio (`gen_audio_topics.py`: sounds, letter names, word endings and words for the topic map) |
| `js/books.js` | Upload (PDF/TXT/EPUB, 35 MB), text extraction, IndexedDB library |
| `js/vocabulary.js` | My Vocabulary list and practice quiz |
| `js/home.js` | Home page word of the day, initial route |

Scripts are classic (non-module) and share globals, so **load order in `index.html` matters**.

## Phonics sounds (recorded audio)
All phonics sounds and example words are **pre-rendered audio files** in `assets/audio/` (`s_<id>.mp3` sounds, `w_<word>.mp3` words, `n_<letter>.mp3` letter names, `r_<ending>.mp3` word endings), made with the open-source Kokoro voice, so they play instantly and identically in every browser with no model download. Vowels cover short and long sounds (a e i o u / ā ē ī ō ū) with the example words from the requirements. If a file is missing the app falls back to the browser voice.
To regenerate or tweak them, see `tools/gen_audio.py` (needs Python, `kokoro-onnx`, `praat-parselmouth`, ffmpeg and the Kokoro model files). Or just replace any mp3 with a better recording using the same file name.

## Natural voice
The app uses **Kokoro-82M** (Apache-2.0, open source) through `kokoro-js`, running fully in the browser (WASM). The first visit downloads ~90 MB once; the browser caches it after that. Use the voice selectors in the header to switch between Natural and Browser voice or change the speaker. Until the model finishes loading (or if it fails), the browser voice is used.

If you choose **Browser voice** (or the natural voice can't load), the app auto-picks the most natural voice installed (Edge "Natural/Online" voices, macOS Premium/Enhanced voices, Google, Siri) and marks the best ones with ★ in the voice list.
The natural voice is used for the Reader, word lookup and vocabulary.
Serve the folder over http(s) (Live Server / GitHub Pages) so model caching works; opening `index.html` via `file://` may re-download the model each visit.

### Troubleshooting voice
- The header shows the voice status. If it says "using browser voice", press F12 > Console and read the `Natural voice` warning.
- The first tap of each sound/word takes a moment while the natural voice generates it (then it is cached for that visit).
- If natural voice errors 3 times it switches itself off; re-select "Natural voice" in the header to retry.
- Always open through Live Server or GitHub Pages, not `file://`.

## Voice engines by environment
`js/env.js` sets `ENV`. On `file://` or non-secure pages only the browser voice is offered. On localhost and public hosts (GitHub Pages works fine) the app offers **Kokoro** (best quality) and **Piper** (lighter, default on phones / low-memory devices), plus the browser voice. Add an engine by adding an entry to `ENGINES` in `js/speech.js` (`load()` and `text()`). Piper is new and untested in a real browser; if it fails the app falls back to the browser voice.
GitHub Pages cannot send COOP/COEP headers, so WebAssembly runs single-threaded (`ENV.isolated` is false). Sherpa-ONNX (browser WASM TTS) needs you to build the WASM bundle with a model packed in and host it yourself, so it is not included.

## Ideas for next steps
- Larger dictionary (bundled JSON word list, or a dictionary API called from a backend)
- Move to ES modules or Vite/React, and wrap speech in a `SpeechService` so a cloud voice can be swapped in
- Recorded phoneme audio clips, OCR for scanned PDFs, user accounts and sync
