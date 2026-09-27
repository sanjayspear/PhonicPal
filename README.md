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
| `js/dictionary.js` | Starter dictionary (37 words), word lookup panel, save word |
| `js/reader.js` | Reader: text-to-speech, word highlight, pause/resume/stop, paging |
| `js/phonics.js` | Vowel/consonant/blend data and phonics screens |
| `js/books.js` | Upload (PDF/TXT/EPUB, 15 MB), text extraction, IndexedDB library |
| `js/vocabulary.js` | My Vocabulary list and practice quiz |
| `js/home.js` | Home page word of the day, initial route |

Scripts are classic (non-module) and share globals, so **load order in `index.html` matters**.

## Ideas for next steps
- Larger dictionary (bundled JSON word list, or a dictionary API called from a backend)
- Move to ES modules or Vite/React, and wrap speech in a `SpeechService` so a cloud voice can be swapped in
- Recorded phoneme audio clips, OCR for scanned PDFs, user accounts and sync

## Push to GitHub
```
git init
git add .
git commit -m "Initial commit: PhonicsPal MVP"
git branch -M main
git remote add origin https://github.com/<your-user>/phonicspal.git
git push -u origin main
```
