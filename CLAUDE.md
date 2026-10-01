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

All `js/*.js` files are classic scripts (no ES modules) that share globals directly (`$`, `LS`, `sp`, `ENV`, `Speech`, etc. from `js/core.js` / `js/env.js`). **The `<script>` order in `index.html` is the dependency order** — a file may rely on globals defined by every file above it. When adding a new script, add it in the right position in `index.html`, not just anywhere. Current order: `core.js → auth.js → env.js → speech.js → dictionary.js → reader.js → curriculum.js → topics.js → custom-phonics.js → phonics-guide.js → phonics-views.js → phonics.js → phonics-game.js → books.js → vocabulary.js → home.js → guide.js`.

### Navigation / page model

`index.html` is a single page with one `<section>` per top-level route (`home`, `phonics`, `read`, `books`, `vocab`, `help`), toggled by `go(id)` in `core.js` via `hidden`. Nav buttons use `data-go="<section id>"`; clicking anywhere with `[data-go]` calls `go()`. `go()` fires a `tabchange` CustomEvent (`{from, to}`) only on real section changes — `reader.js` listens for this to pause/stop any in-progress speech when the user navigates away.

### Auth gate

`js/auth.js` wraps the whole app behind sign up / log in. The `#authGate` overlay (markup at the very top of `<body>`, before `<header>`) sits above everything with a high `z-index`; while signed out, `lockApp()` sets `header.inert` / `main.inert` (note: `$('header')`/`$('main')` each resolve to the *first* matching element in document order, so the gate's own wrapper inside `#authGate` must never itself be a `<header>`/`<main>` tag — it's a `<div class="ag-authwrap">` specifically to avoid shadowing the real ones) and keeps the gate visible; `unlockApp()` reverses that once a user is signed in with a known role. Sign-up collects one of three roles (`teacher`/`parent`/`solo`, see the `ROLES` array) via tile buttons; a first-time Google sign-in (which skips the role form) is routed through an inline "pick a role" pane (`#ag-pane-pickrole`) instead. The role is stored in `localStorage` per uid (`pp_role_<uid>`), not synced anywhere, so switching devices currently means picking a role again.

Two interchangeable **providers** sit behind one shared set of calls (`doSignUp`/`doLogIn`/`doGoogle`/`doReset`/`doLogOut`, assigned by whichever provider is active) and a shared `onUserChanged(user | null)` entry point that both call into:
- `localProvider()` — the default. Accounts live in `localStorage` (`pp_local_users`, `pp_local_session`), this device only. Passwords are salted + SHA-256 hashed via `SubtleCrypto` before storing (falls back to a weak non-cryptographic hash on a non-secure context where `SubtleCrypto` is unavailable, e.g. `file://`) — never stored in plain text, but still not real security, since the comparison happens in client-side JS that anyone with the console open can read or bypass. No external setup, but **Google sign-in can't work in this mode** (it needs a real OAuth client regardless of backend) and it's not meant to reach real users.
- `firebaseProvider()` — used once `FIREBASE_CONFIG` at the top of `auth.js` is filled in with a real Firebase project's web-app config (see README "Accounts"); loaded via CDN `firebase-app-compat.js` / `firebase-auth-compat.js` in `index.html`'s `<head>`. Falls back to `localProvider()` with a warning if `firebase.initializeApp` throws (e.g. bad config).

Because `js/guide.js`'s first-visit welcome tour opens a native `<dialog>` (`showModal()`, which renders in the browser's top layer above any z-index), it cannot simply be scheduled on load — it would show over a locked gate. It instead waits for the `authunlocked` `CustomEvent` that `unlockApp()` dispatches. Any future auto-opening dialog needs the same treatment; a dialog opened from a user click inside `<main>` doesn't, since `main.inert` already blocks reaching it while signed out.

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

Everything is client-side, including accounts by default: `localStorage` via the `LS` helper in `core.js` (custom phonics cards, saved vocabulary, preferences, the signed-in user's role, and — under `localProvider()` — the local accounts themselves) and IndexedDB for the book library (`books.js`). Firebase Authentication (see "Auth gate" above), when configured, is the one external service in the stack, and it stores only accounts (email/password or Google identity) — no app data syncs through it yet.
