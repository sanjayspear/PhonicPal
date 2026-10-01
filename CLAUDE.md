# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PhonicsPal: an interactive English phonics and reading-practice website (MVP), built kid-first (target age 4–5). Plain HTML/CSS/JS, no build step, no framework, no bundler.

## Commands

- Run locally: `npm start` (runs `npx serve .` on http://localhost:3000), or VS Code Live Server on `index.html`.
- There is no build, lint, or test command — this is static HTML/CSS/JS served as-is. There is no test suite.
- Use Chrome or Edge for best text-to-speech / word-highlighting behavior.
- Serve over http(s) (Live Server / GitHub Pages), not `file://` — the natural-voice model cache needs a non-`file:` origin, and PDF.js/JSZip are loaded from the cdnjs CDN so internet access is required.

## Architecture

### Script loading is load-order-dependent, non-module, global-scope

All `js/*.js` files are classic scripts (no ES modules) that share globals directly (`$`, `LS`, `sp`, `ENV`, `Speech`, etc. from `js/core.js` / `js/env.js`). **The `<script>` order in `index.html` is the dependency order** — a file may rely on globals defined by every file above it. When adding a new script, add it in the right position in `index.html`, not just anywhere. Current order: `core.js → env.js → speech.js → dictionary.js → reader.js → curriculum.js → topics.js → custom-phonics.js → phonics-guide.js → phonics-views.js → phonics.js → phonics-game.js → books.js → vocabulary.js → home.js → guide.js`.

### Navigation / page model

`index.html` is a single page with one `<section>` per top-level route (`home`, `phonics`, `read`, `books`, `vocab`, `help`), toggled by `go(id)` in `core.js` via `hidden`. Nav buttons use `data-go="<section id>"`; clicking anywhere with `[data-go]` calls `go()`. `go()` fires a `tabchange` CustomEvent (`{from, to}`) only on real section changes — `reader.js` listens for this to pause/stop any in-progress speech when the user navigates away.

### Voice/speech architecture (the core complexity of this app)

- `js/env.js` computes `ENV` once at load (file/localhost/public host, secure context, device memory/cores, mobile, WASM support) and derives `ENV.tier` (`browser | light | standard`) and `ENV.defaultEngine` (`browser | piper | kokoro`). This gates which voice engines are even offered — e.g. on `file://` or an insecure context only the browser voice is available.
- `js/speech.js` defines `Speech`/`ENGINES`, implementing multiple TTS backends behind one interface: **Kokoro-82M** (best quality, WASM, ~90MB model download cached by the browser), **Piper** (lighter, default on phones/low-memory), and native **browser `speechSynthesis`** (fallback, auto-picks the most natural installed voice and marks good ones with ★). `sp(text, rate, keep)` in `core.js` is the shorthand entry point into `Speech.say`.
- Phonics sound/word audio is **pre-rendered**, not synthesized live: `assets/audio/*.mp3` (`s_<id>` sounds, `w_<word>` words, `n_<letter>` letter names, `r_<ending>` endings), generated offline via `tools/gen_audio.py` / `tools/gen_audio_topics.py` using Kokoro + `praat-parselmouth` + ffmpeg. If a file is missing, the app falls back to the live browser voice. To add an engine, add an entry to `ENGINES` in `js/speech.js` (`load()` and `text()`).
- To change or regenerate phonics audio: either rerun the Python tools in `tools/` (needs `kokoro-onnx`, `praat-parselmouth`, ffmpeg, Kokoro model files) or just drop in a replacement mp3 with the same filename.

### Phonics content/feature pipeline

Content and rendering are deliberately separated:
- `js/curriculum.js` — datasets for consonant digraphs, r-controlled vowels, diphthongs (ids, graphemes, IPA, example/"marked" sentences).
- `js/topics.js` — the full topic map: 62 topics across 8 groups, each with words/sounds/pictures/stories.
- `js/phonics-views.js` — page builders per topic kind (cards, blending, sound boxes, word families, magic e, stories, fluency timer) and the audio "steps" each plays.
- `js/phonics-guide.js` — the "for grown-ups" explainer guide per topic, the "Start here" intro guide, and the stars/stickers reward system.
- `js/phonics.js` — assembles the Phonics screen itself (group bar, topic tabs, open topic) from the above.
- `js/phonics-game.js` — a 5-round game per topic built from pluggable question makers (rhyme, clap, swap, spell, sort, read, ...).
- `js/custom-phonics.js` — user-created phonics cards persisted to `localStorage` (`pp_custom_ph`) via the "Add Custom Blend" form.

When adding a new phonics topic, it generally touches `topics.js` (data) and may need new audio in `assets/audio/` plus a regeneration pass in `tools/`; when adding a new *kind* of topic page/interaction, it's `phonics-views.js`.

### Reading/library features

- `js/reader.js` — text-to-speech reader with word highlighting and pause/resume/stop/paging; listens for `tabchange` to stop speech on navigation.
- `js/books.js` — PDF/TXT/EPUB upload (35MB limit), text extraction (via the CDN-loaded PDF.js/JSZip), stored in IndexedDB as a library.
- `js/dictionary.js` — a small starter dictionary (37 words) plus online lookup (Free Dictionary API, with Wiktionary/Datamuse fallbacks), the word-lookup panel, and "save word."
- `js/vocabulary.js` — the user's saved-word list and a practice quiz over it.
- `js/home.js` — home screen word-of-the-day and initial route.

### Persistence

Everything is client-side: `localStorage` via the `LS` helper in `core.js` (custom phonics cards, saved vocabulary, preferences) and IndexedDB for the book library (`books.js`). There is no backend/server component beyond serving static files.
