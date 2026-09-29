/* Kid pictures + grown-up guides for the Phonics screen. Loaded BEFORE phonics.js (which calls topicBar()).
   Uses from phonics.js at call time: PT, phTab. openGame() comes from phonics-game.js. */

/* Picture for an example word (shown on cards and in the game). Words without a clear picture are left out. */
const PIC = {
  apple: '🍎', cat: '🐱', bag: '👜', egg: '🥚', nest: '🪺', bed: '🛏️', pen: '🖊️', fish: '🐟', pin: '📌', sit: '🪑', octopus: '🐙',
  dog: '🐶', hot: '🔥', umbrella: '☂️', cup: '🥤', bus: '🚌', sun: '☀️', cake: '🎂', rain: '🌧️', baby: '👶', game: '🎮', tree: '🌳',
  feet: '🦶', kite: '🪁', night: '🌃', ice: '🧊', light: '💡', boat: '⛵', rope: '🪢', note: '🎵', unicorn: '🦄', music: '🎶',
  cube: '🎲', rule: '📏', ball: '⚽', goat: '🐐', hat: '🎩', jam: '🍓', lion: '🦁', moon: '🌕', pig: '🐷', queen: '👸', rabbit: '🐰',
  tent: '⛺', van: '🚐', web: '🕸️', box: '📦', yak: '🐃', zebra: '🦓', bee: '🐝', cloud: '☁️', pie: '🥧', leaf: '🍃', snow: '❄️',
  blue: '🔵', brush: '🪥', clap: '👏', frog: '🐸', grape: '🍇', star: '⭐', chip: '🍟', chop: '🪓', lunch: '🍱', ship: '🚢',
  shop: '🏪', wish: '🌠', thumb: '👍', bath: '🛁', whale: '🐋', wheel: '🛞', duck: '🦆', clock: '🕐', sock: '🧦', car: '🚗',
  farm: '🚜', park: '🏞️', teacher: '🧑‍🏫', bird: '🐦', girl: '👧', shirt: '👕', corn: '🌽', fork: '🍴', horse: '🐴', storm: '⛈️',
  nurse: '🧑‍⚕️', purple: '🟣', coin: '🪙', soil: '🌱', boy: '👦', toy: '🧸', house: '🏠', mouse: '🐭', cow: '🐄', brown: '🟤',
  hen: '🐔', stop: '🛑'
};
const picOf = w => PIC[w] || '';

/* One guide per phonics tab (same order as PT). Plain words for parents who are new to phonics. */
const GUIDE = [
  { what: 'a, e, i, o and u are vowels. Each has a short sound (a in apple) and a long sound that says its own name (a in cake). Every word needs at least one vowel.',
    why: 'Vowels are the glue in every word. Short vowels are in the very first words children read: cat, dog, sun.',
    how: ['Start with the short sounds only (the top row). Tap a card and say it together: "a… apple".', 'Add an action to each one: pretend to bite an apple for a, crack an egg for e.', 'Later, add the long sounds and explain that they "say their name".', 'Say a short word like "cat" and ask: "Which vowel do you hear in the middle?"'],
    home: 'Vowel hunt: name toys around the house and listen for the vowel. "Bus" has u!',
    watch: 'Short e and short i sound alike to young ears (pen / pin). Say them slowly and let your child watch your mouth.' },
  { what: 'All the letters that are not vowels: b, c, d, f and so on. Each one makes its own sound, like b in ball.',
    why: 'Most words start with a consonant. Hearing the first sound of a word is the first step to reading it.',
    how: ['Teach a few at a time. s, a, t, p, i, n is a popular first set because they make lots of words.', 'Keep the sound short and crisp: "b", not "buh". The recordings add a tiny "uh" only so you can hear it.', 'Point to the letter while you say the sound, then say the picture word.', 'Ask: "What sound does ball start with?"'],
    home: 'I-spy with sounds: "I spy something that starts with sss… sock!"',
    watch: 'c and k make the same sound. x usually says "ks" at the end of words, like box.' },
  { what: 'Two letters that work together to make ONE vowel sound: ai in rain, ee in bee, oa in boat.',
    why: 'Long vowel sounds are often written with a team. Spotting the team helps children read longer words.',
    how: ['Put a finger under both letters to show they belong together.', 'Say the team, then the word: "ee… bee".', 'Collect word families: rain, train, paint.'],
    home: 'Make a word-family list on the fridge: bee, see, tree. Add one new word each day.',
    watch: 'Some teams make two different sounds: ow in snow and in cow. Say both and let your child hear the difference.' },
  { what: 'Two consonants side by side where you can still hear BOTH sounds: bl in blue, fr in frog.',
    why: 'Blends help children read words like frog, star and clap instead of guessing.',
    how: ['Say each sound slowly, then faster and faster: "b… l… bl".', 'Slide your hand along your arm as the sounds join together.', 'Compare with digraphs: in sh you can no longer hear s and h.'],
    home: 'Blend race: you say "f… r… o… g" slowly, your child shouts the word.',
    watch: 'Children often drop the second sound ("fog" for frog). Stretch it: "f-rrr-og".' },
  { what: 'Two letters that make ONE new sound: sh, ch, th, wh and ck.',
    why: 'They are in lots of early words (ship, chip, this, duck), so children need to see the two letters as one sound.',
    how: ['Show that s says "sss" and h says "h", but together sh says "shh".', 'Use actions: finger on lips for sh, a chugging train for ch.', 'Draw a box around the two letters when you see them in a book.'],
    home: 'Silly sentences: "Shh! The ship is in the shop!"',
    watch: 'th has two sounds: soft in thumb, buzzy in this. Both are correct.' },
  { what: 'When r comes after a vowel, it changes the vowel sound. ar says "ar" (car), or says "or" (fork), and er, ir and ur all say "er".',
    why: 'Bossy R is in everyday words like car, bird and turn. Without it, children would read car with a short a.',
    how: ['Call it "Bossy R": it bosses the vowel around.', 'Use a pirate voice for "arrr!"', 'Show er, ir and ur side by side: they sound the same; only the spelling is different.'],
    home: 'Pirate talk: "Park the car on the farm. Arrr!"',
    watch: 'Usually taught after short vowels and digraphs, around age 5 to 6. It is fine to come back to this later.' },
  { what: 'A sound that slides from one vowel into another in one go: oi in coin, ou in house.',
    why: 'They are in words like boy, cow and house. Knowing the letter pairs makes these words easy to read.',
    how: ['Say "oi" slowly and feel your mouth move from one shape to another.', 'oi and oy say the same thing; oy usually comes at the end of a word (boy).', 'ou and ow say the same "ow"; ow often comes at the end (cow).'],
    home: 'The "ow!" game: pretend to bump your toe, say "ow!", then find words with ow.',
    watch: 'Most 4-year-olds are ready to listen to these but not yet to read them. That is normal.' },
  { what: 'Blending means joining sounds together to read a word: c-a-t makes cat.',
    why: 'This is the key reading skill. Once a child can blend, they can read new words on their own.',
    how: ['Point to each tile and say its sound, then sweep your finger underneath and say the whole word.', 'Start with three-letter words that have short vowels.', 'If your child gets stuck, join the first two sounds first: "ca… t… cat".'],
    home: 'Robot talk: "Get your h-a-t!" Your child works out the word and fetches it.',
    watch: 'Children often add "uh" to each sound (cuh-a-tuh). Keep sounds short, or stretch the ones that can stretch: mmm, sss.' }
];

function guideSection(title, body) {
  const s = h('section', 'gd-sec'); s.append(h('h3', 0, title));
  if (Array.isArray(body)) { const ol = h('ol', 'guide-list'); body.forEach(t => ol.append(h('li', 0, t))); s.append(ol) } else s.append(h('p', 0, body));
  return s
}
/* i = tab index, or 'intro' for the general "What is phonics?" guide */
function openGuide(i) {
  const dlg = $('#guideDlg'), body = $('#guideBody'); body.replaceChildren();
  if (i === 'intro') {
    $('#guideTitle').textContent = 'New to phonics? Start here';
    body.append(
      guideSection('What is phonics?', 'Phonics teaches children that letters stand for sounds, and that sounds join together to make words. Once a child knows the sounds, they can "sound out" new words by themselves.'),
      guideSection('Letter names and letter sounds', 'The letter B is called "bee", but in words it makes a short "b" sound. Phonics uses the sounds. Say them short and clear: "mmm" for m, not "em".'),
      guideSection('Words you will hear', ['Sound (phoneme): the smallest sound in a word. Cat has three: c, a, t.', 'Letter pattern (grapheme): the letter or letters that write one sound. sh in ship is one sound.', 'Blending: joining sounds to read a word. c-a-t → cat.', 'Segmenting: breaking a word into its sounds to spell it. dog → d-o-g.']),
      guideSection('A good order to learn', ['Consonant sounds and short vowel sounds.', 'Word blending with three-letter words (cat, sun).', 'Consonant blends (bl, st) and digraphs (sh, ch).', 'Long vowels and vowel teams (ai, ee).', 'Bossy R and diphthongs (ar, oi): usually from age 5 to 6.']),
      guideSection('How to use PhonicsPal together', ['Keep it short: 5 to 10 minutes a day is plenty.', 'Tap a card, listen, then say the sound together out loud.', 'Finish a topic with "Play the game" and celebrate every star.', 'Praise effort, not just right answers, and stop while it is still fun.']),
      guideSection('Is my 4 to 5 year old ready?', 'Most children this age are ready for letter sounds and simple three-letter words. Bossy R and diphthongs usually come later, so skip them for now if they feel hard.'));
  } else {
    const g = GUIDE[i]; $('#guideTitle').textContent = PT[i][3] + ' ' + PT[i][0] + ': for grown-ups';
    body.append(guideSection('What is it?', g.what), guideSection('Why it matters', g.why), guideSection('How to teach it', g.how),
      guideSection('Try this at home', g.home), guideSection('Watch out for', g.watch));
  }
  stopPhonics(); if (!dlg.open) dlg.showModal(); $('#guideClose').focus({ preventScroll: true }); dlg.scrollTop = 0
}

$('#phIntro').onclick = () => openGuide('intro');
$('#guideClose').onclick = () => $('#guideDlg').close();

/* stars: best score per tab from the game (0 to 5) */
const bestStars = i => (LS.get('pp_game_stars', {})[i] || 0);
function topicBar(i) {
  const bar = $('#ptopic'); bar.replaceChildren();
  const info = h('button', 'btn t kid-btn', 'ℹ️ For grown-ups'); info.type = 'button'; info.title = 'What this topic is and how to teach it'; info.onclick = () => openGuide(i);
  const play = h('button', 'btn kid-btn play', '🎮 Play the game'); play.type = 'button'; play.title = 'A fun listening game for this topic'; play.onclick = () => openGame(i);
  const best = bestStars(i), stars = h('span', 'kid-stars', best ? 'Best: ' + '⭐'.repeat(best) : '');
  stars.setAttribute('aria-label', best ? 'Best score ' + best + ' out of 5 stars' : '');
  bar.append(info, play, stars);
  $$('#ptabs .tstar').forEach((s, j) => { s.textContent = bestStars(j) ? ' ⭐' : ''; s.title = bestStars(j) ? 'Game won' : '' })
}
