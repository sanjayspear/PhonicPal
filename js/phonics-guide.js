/* Grown-up guides and stars for the Phonics screen. Loaded after topics.js, BEFORE phonics.js (which calls topicBar()).
   Uses at call time: TOPIC, GROUPS, topicName, refreshStars (phonics.js) and openGame (phonics-game.js). */

/* One guide per topic id. Plain words for parents who are new to phonics. */
const GD = (what, why, how, home, watch) => ({ what, why, how, home, watch });
const GUIDE = {
  /* short vowels */
  short: GD('a, e, i, o and u are vowels. Their short sounds are a in cat, e in bed, i in sit, o in hot and u in sun. Every word needs at least one vowel.',
    'Short vowels are in the very first words children read: cat, dog, sun. They are the glue that holds CVC words together.',
    ['Teach one or two at a time. Tap a card and say it together: "a… apple".', 'Add an action to each one: pretend to bite an apple for a, crack an egg for e.', 'Say a short word like "cat" and ask: "Which vowel do you hear in the middle?"'],
    'Vowel hunt: name toys around the house and listen for the vowel. "Bus" has u!',
    'Short e and short i sound alike to young ears (pen / pin). Say them slowly and let your child watch your mouth.'),
  cvc: GD('CVC words have three sounds: consonant, vowel, consonant, like c-a-t, d-o-g and s-u-n.',
    'They are the first words most children can read all by themselves, which is a huge confidence boost.',
    ['Point to each tile and say its sound, then sweep your finger under the word and say it fast.', 'Stay with one vowel (all short a) before mixing vowels.', 'Let your child tap Blend and repeat the word after the voice.'],
    'Fridge words: make cat, hat and map with magnetic letters, then change one letter.',
    'If your child says each sound but can’t blend, join the first two sounds first: "ca… t… cat".'),
  families: GD('A word family is a group of words that share the same ending (rime): cat, hat, bat, mat are the -at family.',
    'Once a child can read "at", they can read dozens of words by changing just the first letter. It also builds rhyming.',
    ['Pick a family, then tap each first letter to make a new word.', 'Ask: "What would we get with an s?" before tapping.', 'Tap "Say the whole family" and chant along like a song.'],
    'Family sort: write words on cards and sort them into -at, -an and -ig piles.',
    'Some changes make silly (made-up) words. That is fine and fun: reading silly words shows real decoding.'),
  pairs: GD('Minimal pairs are two words that differ by one sound: pin / pen, cap / cup, hat / hot.',
    'Hearing the tiny difference between vowels is what lets children spell and read short-vowel words correctly.',
    ['Tap each picture and listen together. Which sound is different?', 'Say one word and let your child point to the right picture.', 'Exaggerate the vowel: "p-iiii-n, p-eeee-n".'],
    'Point game: put a pin and a pen on the table. Say one; your child grabs it.',
    'e / i and o / u pairs are the hardest. Go slowly and watch your mouth in a mirror together.'),
  svblend: GD('Blending short-vowel words: say each sound, then push the sounds together into a word.',
    'Blending is the key reading skill. With short vowels mastered, children can read hundreds of words.',
    ['Tap Blend and follow the lit tile with a finger.', 'Ask your child to say the word before the voice does; the picture checks the answer.', 'Hold stretchy sounds (mmm, sss) so they flow into the vowel.'],
    'Robot talk: say "Get your h-a-t!" in a robot voice. Your child works out the word and fetches it.',
    'Adding "uh" after each sound (cuh-a-tuh) makes blending harder. Keep sounds short and crisp.'),
  svseg: GD('Segmenting means breaking a word into its sounds: cat → c-a-t. One box holds one sound.',
    'Segmenting is how children spell. If they can hear every sound, they can write every letter.',
    ['Say the word slowly together, touching a box for each sound.', 'Tap "Say it slowly" to see the letters drop into the boxes.', 'Tap a filled box to hear that sound again.'],
    'Draw three boxes on paper. Push a coin into a box for each sound you hear.',
    'The middle vowel is the one most often missed. Stretch it: "c-aaa-t".'),
  dictation: GD('Dictation: you say a word, your child spells it by listening for the sounds.',
    'It joins listening and writing. It shows you which sounds your child hears securely and which need more practice.',
    ['Tap a card to say the word. Your child repeats it and says each sound.', 'They write it on paper, or spell it out loud, or build it with letter tiles.', 'Tap Check to compare, then praise every correct sound, not just whole words.'],
    'Whiteboard dictation: three words a day on a small whiteboard. Wipe and go!',
    'Reversed letters (b / d) are normal at this age. Model the correct shape without fuss.'),
  svsent: GD('Decodable sentences use only sounds a child has learned, plus a few common tricky words like the, a and is.',
    'Reading a whole sentence gives a real feeling of reading and practises blending at speed.',
    ['Let your child read first. Tap 🔊 only to check.', 'Tap any word they are stuck on to hear just that word.', 'After reading, ask "What is happening?" and point to the picture.'],
    'Make silly sentences with the same words: "The pig sat on a cat!"',
    'Guessing from the picture instead of reading is common. Cover the picture, read, then reveal.'),
  svmix: GD('Mixed practice puts all five short vowels together, so children must look carefully at every word.',
    'Practising one vowel at a time is easier; mixing them proves the skill is secure.',
    ['Tap Shuffle for six new words and blend them all.', 'Play the mixed game: it has listening, reading, spelling and sentence rounds.', 'Keep sessions short and cheerful.'],
    'Word fishing: write CVC words on paper fish. Catch one, read it, keep it!',
    'If one vowel keeps causing mistakes, go back to that vowel’s cards for a few days.'),
  svspell: GD('Short-vowel spelling rules: ck at the end (duck), double f, l, s and z (bell, kiss), and the glued sounds ng and nk (ring, pink).',
    'These patterns turn up in hundreds of everyday words and are an early step from sounding out to real spelling.',
    ['Tap a rule to hear its sound and every example word.', 'Look for the short vowel just before the pattern.', 'Play the game: pick the spelling that looks right.'],
    'Spot the rule in picture books: "Look, duck has ck!"',
    'Children often write "duk" or "bel". Praise the correct sounds, then show the rule.'),
  /* phonemic awareness */
  listen: GD('Listening for sounds: telling sounds apart, such as which animal made a noise, or whether two words are the same.',
    'Good listening is the ground floor of phonics. Children must hear sounds clearly before they can match them to letters.',
    ['Tap an animal and copy its sound together.', 'In "Same or different?", close your eyes and listen to both words.', 'Talk about quiet and loud, long and short sounds.'],
    'Sound walk: go outside for two minutes and name every sound you hear.',
    'If a child struggles to tell sounds apart consistently, mention it to their teacher or doctor; a hearing check is quick and easy.'),
  rhyme: GD('Words rhyme when they sound the same at the end: cat, hat, bat.',
    'Rhyming helps children notice the sounds inside words, and leads straight into word families.',
    ['Tap a rhyme group to hear all its words.', 'Say two words and ask "Do they rhyme?"', 'Finish the rhyme: "I see a cat, sitting on a… hat!"'],
    'Read rhyming picture books and pause before the rhyming word so your child can fill it in.',
    'Children often choose words that start the same (cat / cup). Stress the ending: "c-AT, h-AT".'),
  syll: GD('A syllable is a beat in a word. Rab-bit has two, but-ter-fly has three.',
    'Hearing syllables is an early listening skill, and later helps children read and spell long words in chunks.',
    ['Tap a card to hear the word, then clap along with each beat.', 'Put your hand under your chin: your jaw drops once per syllable.', 'Clap names of family and friends.'],
    'Syllable stomp: stomp the beats of foods at dinner: spa-ghet-ti!',
    'Children sometimes clap every sound instead of every beat. Model slowly with big claps.'),
  onset: GD('The onset is the first sound(s) of a syllable (c, fr); the rime is the rest (at, og). c + at = cat.',
    'Joining onset and rime is an easier first step than blending every single sound.',
    ['Tap a card: hear the onset, the rime, then the whole word.', 'Say an onset and rime yourself and let your child say the word.', 'Then swap it: "What is the first sound of dog? d. And the rest? og."'],
    'Secret code: "Can you find the b… ed?" Your child jumps on the bed.',
    'Pause only briefly between the parts; a long gap makes it hard to hold both in mind.'),
  first: GD('The initial sound is the very first sound in a word: sun starts with s.',
    'It is usually the first sound children can pick out of a word, and it starts them matching sounds to letters.',
    ['Tap a sound to hear it and all its pictures.', 'Stretch or bounce the first sound: "sss-un", "b-b-ball".', 'Play the game and say each picture out loud before choosing.'],
    'I spy with sounds: "I spy something that starts with mmm… moon!"',
    'c and k both say k. Both are right for the sound; the letter comes later.'),
  last: GD('The final sound is the very last sound in a word: cat ends with t.',
    'Hearing the end of words is needed for spelling, and it is harder than the first sound, so it needs its own practice.',
    ['Say the word and exaggerate the end: "ca-T".', 'Tap a sound group to hear words that end the same.', 'Ask: "Does dog end with g or t?"'],
    'Toy sort: put toys into piles by their last sound.',
    'Children often repeat the first sound. Say the word twice, the second time slowly.'),
  middle: GD('The medial sound is the middle sound of a short word, usually a vowel: c-a-t has a.',
    'The middle vowel is the hardest sound to hear, and the one most often misspelled.',
    ['Stretch the vowel: "c-aaaa-t".', 'Tap a vowel group to hear all its words.', 'Show the vowel with your mouth: wide smile for e, round o for o.'],
    'Vowel actions: pick an action for each vowel. Say a word; your child does the action for its middle sound.',
    'Short e and short i are easy to mix up. Practise them as a pair (bed / bid, pen / pin).'),
  oblend: GD('Blending phonemes by ear: hearing separate sounds (d-o-g) and joining them into a word, without any letters.',
    'Blending by ear comes before blending with letters. Children who can do this find reading much easier.',
    ['Tap Listen, let your child say the word, then check with the picture.', 'Start with two-sound words (b-ee), then three (c-a-t), then four (f-r-o-g).', 'If stuck, say the sounds a bit faster each time.'],
    'Robot I-spy: "I spy a c-u-p." Your child finds the cup.',
    'Some children say each sound but not the word. Say the sounds again, faster and closer together.'),
  oseg: GD('Segmenting phonemes by ear: splitting a spoken word into all its sounds and counting them, like fish → f-i-sh = 3.',
    'This is the listening half of spelling. Children must hear every sound before they can write it.',
    ['Say the word slowly and put up a finger for each sound.', 'Tap "Say it slowly" and watch the dots fill the boxes.', 'Remember: sh, ee and oo are one sound each.'],
    'Sound steps: take one step for each sound in a word: f-r-o-g is four steps.',
    'Children often count letters, not sounds. Keep letters out of it for now; just listen.'),
  swap: GD('Manipulating phonemes: changing, adding or removing a sound to make a new word: cat → hat.',
    'It is the most advanced listening skill and strongly linked to good reading and spelling.',
    ['Tap a card to hear "cat, change c to h… hat!"', 'Start with the first sound, then try the last sound, then the middle.', 'Make it silly: "Say mouse. Change m to h. House!"'],
    'Name swap: change the first sound of family names: Dad → Bad → Sad!',
    'This is hard for 4-year-olds. If it is a struggle, go back to rhyming and first sounds.'),
  /* letter-sound correspondence */
  names: GD('Every letter has a name (B is called "bee") and a sound (b as in ball). This page teaches both, and the difference.',
    'Letter names help with the alphabet song and talking about letters; sounds are what we use to read.',
    ['Tap a letter: hear its name, then its sound, then a picture word.', 'Ask "What is its name? What sound does it make?"', 'Point out letters in their own name first.'],
    'Alphabet treasure hunt: find things around the house for a letter, saying its name and its sound.',
    'Vowel names (A, E, I, O, U) are also their long sounds, which is why children sometimes spell "cake" as "kak".'),
  cons: GD('All the letters that are not vowels: b, c, d, f and so on. Each one makes its own sound, like b in ball.',
    'Most words start with a consonant. Hearing the first sound of a word is the first step to reading it.',
    ['Teach a few at a time. s, a, t, p, i, n is a popular first set because they make lots of words.', 'Keep the sound short and crisp: "b", not "buh". The recordings add a tiny "uh" only so you can hear it.', 'Point to the letter while you say the sound, then say the picture word.'],
    'I-spy with sounds: "I spy something that starts with sss… sock!"',
    'c and k make the same sound. x usually says "ks" at the end of words, like box.'),
  long: GD('Long vowels say their own name: a in cake, e in tree, i in kite, o in boat, u in cube.',
    'Long vowels appear in many early words, spelled with silent e (cake) or vowel teams (rain).',
    ['Tap a card and hear the long sound, then its words.', 'Say "the vowel says its name" whenever you meet one.', 'Compare with the short sound: cap / cape, kit / kite.'],
    'Name game: "a says its name in cake. What else? game, rain, play!"',
    'Long u has two sounds: "you" (cube) and "oo" (flute). Both are right.'),
  dg: GD('Two letters that make ONE new sound: sh, ch, th, wh and ck.',
    'They are in lots of early words (ship, chip, this, duck), so children need to see the two letters as one sound.',
    ['Show that s says "sss" and h says "h", but together sh says "shh".', 'Use actions: finger on lips for sh, a chugging train for ch.', 'Draw a box around the two letters when you see them in a book.'],
    'Silly sentences: "Shh! The ship is in the shop!"',
    'th has two sounds: soft in thumb, buzzy in this. Both are correct.'),
  vb: GD('Vowel teams (vowel digraphs) are two letters that work together to make ONE vowel sound: ai in rain, ee in bee, oa in boat.',
    'Long vowel sounds are often written with a team. Spotting the team helps children read longer words.',
    ['Put a finger under both letters to show they belong together.', 'Say the team, then the word: "ee… bee".', 'Collect word families: rain, train, paint.'],
    'Make a word-family list on the fridge: bee, see, tree. Add one new word each day.',
    'Some teams make two different sounds: ow in snow and in cow. Say both and let your child hear the difference.'),
  cb: GD('Two consonants side by side where you can still hear BOTH sounds: bl in blue, fr in frog, sn in snake.',
    'Blends help children read words like frog, star and clap instead of guessing.',
    ['Say each sound slowly, then faster and faster: "b… l… bl".', 'Slide your hand along your arm as the sounds join together.', 'Compare with digraphs: in sh you can no longer hear s and h.'],
    'Blend race: you say "f… r… o… g" slowly, your child shouts the word.',
    'Children often drop the second sound ("fog" for frog). Stretch it: "f-rrr-og".'),
  trig: GD('Trigraphs are three letters that make one sound: tch (witch), dge (bridge), igh (night), air (chair), ear (ear).',
    'Seeing three letters as one sound stops children sounding out every letter (n-i-g-h-t) and helps them read smoothly.',
    ['Box the three letters with your finger.', 'Tap a card to hear the sound and its words.', 'Link to what they know: tch says ch, dge says j.'],
    'Trigraph torch: in a book, "shine a torch" (finger) on every igh or tch you find.',
    'These usually come after digraphs. If digraphs are not secure yet, practise those first.'),
  dp: GD('A sound that slides from one vowel into another in one go: oi in coin, ou in house.',
    'They are in words like boy, cow and house. Knowing the letter pairs makes these words easy to read.',
    ['Say "oi" slowly and feel your mouth move from one shape to another.', 'oi and oy say the same thing; oy usually comes at the end of a word (boy).', 'ou and ow say the same "ow"; ow often comes at the end (cow).'],
    'The "ow!" game: pretend to bump your toe, say "ow!", then find words with ow.',
    'Most 4-year-olds are ready to listen to these but not yet to read them. That is normal.'),
  rc: GD('When r comes after a vowel, it changes the vowel sound. ar says "ar" (car), or says "or" (fork), and er, ir and ur all say "er".',
    'Bossy R is in everyday words like car, bird and turn. Without it, children would read car with a short a.',
    ['Call it "Bossy R": it bosses the vowel around.', 'Use a pirate voice for "arrr!"', 'Show er, ir and ur side by side: they sound the same; only the spelling is different.'],
    'Pirate talk: "Park the car on the farm. Arrr!"',
    'Usually taught after short vowels and digraphs, around age 5 to 6. It is fine to come back to this later.'),
  schwa: GD('Schwa (ə) is a lazy "uh" sound. In a quiet (unstressed) part of a word, any vowel can relax into "uh": the last a in banana, the o in lemon.',
    'It is the most common vowel sound in English, and it explains why many words are not spelled the way they sound.',
    ['Say the word the "talking way" (sofuh), then the "spelling way" (so-fa) to help spelling.', 'Tap the card to hear the schwa and the words; listen for the "uh".', 'Clap the word and notice which beat is quiet.'],
    'Spelling voice: say tricky words in a funny spelling voice: "lem-ON", "pen-CIL".',
    'This is an advanced idea; 4- to 5-year-olds just need to hear it. Spelling it comes years later.'),
  /* word patterns */
  vc: GD('VC words are two sounds: a vowel then a consonant, like at, in, up and on.',
    'They are the shortest words to blend, and they grow into CVC words: at → cat.',
    ['Blend the two sounds together, then add a letter in front: in → pin.', 'Many VC words (in, on, up, at) are in every book.', 'Use the Spell game to build them with tiles.'],
    'Word growing: write "at", then add c, h and b in front to grow new words.',
    'Keep the vowel short: "i-n", not "eye-n".'),
  cvcc: GD('CVCC words have a consonant, a short vowel and two consonants at the end: hand, tent, milk.',
    'Ending blends are easy to miss when spelling ("had" for hand). Practising them makes reading and spelling more accurate.',
    ['Blend the ending sounds together: "n-d… nd".', 'Count the sounds on fingers: h-a-n-d is four.', 'Compare had / hand, bet / belt.'],
    'Hand game: tap each finger as you say h-a-n-d.',
    'The n or m before another consonant is the sound children most often leave out.'),
  ccvc: GD('CCVC words start with a blend: frog, crab, drum, flag.',
    'They stretch blending to four sounds and prepare children for longer words.',
    ['Blend the first two sounds first: "fr", then add "og".', 'Spell them with tiles, sound by sound.', 'Compare with CVC: fog / frog, sip / slip.'],
    'Silly change: take away the second sound: frog → fog, crab → cab.',
    'Children often drop the second consonant. Stretch it and hold it: "f-rrr-og".'),
  ccvcc: GD('CCVCC words have blends at both ends: plant, stamp, frost. Five sounds, one short vowel.',
    'They show that even long-looking words can be read by blending, sound by sound.',
    ['Split the word: blend at the start + vowel + blend at the end.', 'Point to each letter as you say its sound.', 'Build them with tiles in the Spell game.'],
    'Word detective: find the two blends in each word (pl + nt).',
    'These are for children who are already confident with CVC and CCVC words.'),
  cvce: GD('CVCe words end in a silent e that makes the vowel say its name: cake, bike, rope, cube.',
    'Silent e is one of the most common ways to spell a long vowel.',
    ['Say the short word first (kit), then add the e (kite).', 'Draw a curved "jump" from the e back to the vowel.', 'Play the game: read the word, then pick its picture.'],
    'Magic wand: cover the e and read the word, then uncover it and read again.',
    'Children often read the e as a sound ("cak-eh"). Remind them: the e is quiet.'),
  vce: GD('VCe words are short silent-e words that start with the vowel: ape, ice, ate, use.',
    'They follow the same silent e rule and are common in everyday reading.',
    ['Sound the vowel as its name, then the consonant.', 'Remember the e is quiet but changes the vowel.', 'Look for the c in ice: before e, it says s.'],
    'Find VCe words in cooking: "ice", "ate", "use".',
    'Only a few VCe words exist, so short practice is enough.'),
  open: GD('An open syllable ends with a vowel, so the vowel says its long name: go, me, hi, ba-by, ti-ger.',
    'Knowing open syllables helps children read longer words like robot and paper correctly.',
    ['Say "open door: the vowel can shout its name!"', 'Compare go / got, me / met.', 'Split two-syllable words and look at the first part.'],
    'Door game: stand in an open doorway and shout a long vowel; shut the door for a short one.',
    'Taught around ages 6 to 7. Younger children just enjoy the door game.'),
  closed: GD('A closed syllable ends with a consonant, so the vowel is short: cat, up, rab-bit.',
    'Closed syllables are the most common syllable type in English. They explain why rabbit has a short a.',
    ['Say "closed door: the consonant shuts the vowel in, so it stays short".', 'Compare hi / hit, no / not.', 'Look at each syllable of a long word and ask "open or closed?"'],
    'Sort cards into an open-door pile and a closed-door pile.',
    'Taught after children are confident with short vowels.'),
  /* consonants */
  initial: GD('Initial consonants: matching the first sound of a word to the letter that spells it: ball starts with b.',
    'This links listening (first sounds) to letters, the core of reading.',
    ['Say the word, stress the first sound, then point to the letter.', 'Tap a letter group to hear its sound and words.', 'Play the game and say the word aloud before choosing.'],
    'Letter hunt: pick a letter and find three things that start with it.',
    'b / d and p / q look alike. Say the sound as you trace the letter shape.'),
  final: GD('Final consonants: matching the last sound of a word to its letter: cat ends with t.',
    'Children who notice last letters spell more completely and read more accurately.',
    ['Say the word slowly and stress the end.', 'Write the word and underline the last letter.', 'Compare words that differ only at the end: cat / cap.'],
    'End-of-word bingo: call a word; your child covers its last letter.',
    'x at the end makes two sounds (ks), which can be surprising.'),
  silent: GD('Silent consonants are written but not said: k in knife, w in write, b in lamb, h in ghost, g in sign.',
    'They are common in everyday words. Knowing the patterns (kn, wr, mb) means fewer surprises when reading.',
    ['Tap a group to hear the sound the letters really make.', 'Cross out the silent letter with a finger and read the word.', 'Many silent letters were once spoken, long ago!'],
    'Silent-letter spy: find kn, wr and mb in books and whisper the silent letter.',
    'These are for confident readers (usually 6+). Younger children can just enjoy the ghost!'),
  softc: GD('c has two sounds. Hard c says k (cat, cup). Soft c says s when e, i or y comes next (city, ice).',
    'This rule lets children read words like city, pencil and rice correctly.',
    ['Look at the letter after the c: e, i or y means s.', 'Sort words into the k team and the s team.', 'Tap each group to hear the difference.'],
    'Traffic light: e, i, y are "soft" colours. Hold up a card and decide together.',
    'Usually taught around age 6. Before that, c = k is enough.'),
  softg: GD('g has two sounds. Hard g says g (goat, frog). Soft g often says j before e, i or y (giraffe, page, orange).',
    'It explains words like giraffe, magic and cage.',
    ['Look at the letter after the g.', 'Sort words into the g team and the j team.', 'Note the exceptions: girl, get and give use hard g.'],
    'Giraffe game: stretch your neck tall for soft g words, crouch for hard g.',
    'The g rule has more exceptions than c, so treat it as a strong hint, not a law.'),
  /* vowels */
  magice: GD('Silent e (magic e) sits at the end of a word and makes the vowel say its name: kit → kite, pin → pine.',
    'It is one of the biggest steps after short vowels and doubles the number of words a child can read.',
    ['Tap the wand to add the e and hear the vowel change.', 'Tap "Hear both" and compare the short and long word.', 'Say: "The e is quiet, but it helps the vowel say its name."'],
    'Paper e: write words like cap, pin and hop, and slide a paper "e" on the end.',
    'Children sometimes say the e aloud. Keep reminding: silent e is quiet.'),
  combos: GD('Vowel combinations: the same long sound can be spelled many ways. Long a can be ai (rain), ay (play), a_e (cake) or eigh (eight).',
    'Reading many spellings for one sound is key for fluent reading; choosing the right one is key for spelling.',
    ['Tap a sound house to hear the sound and every spelling.', 'Talk about where spellings go: ay at the end, ai in the middle.', 'Play the game: pick the spelling that looks right.'],
    'Sound houses: draw a house for each long vowel and add words to its rooms as you find them.',
    'Mixing spellings (rane for rain) is a normal stage. Praise that the sound is right.'),
  /* advanced */
  stypes: GD('Six syllable types: closed (cat), open (go), magic e (cake), vowel team (rain), bossy R (car) and consonant-le (ap-ple).',
    'The type of a syllable tells you what its vowel will say, which makes long words predictable.',
    ['Look at one syllable at a time and ask "Which type?"', 'Use the icons: 🔒 closed, 🚪 open, ✨ magic e, 👯 team, 🏴‍☠️ bossy R, 🕯️ -le.', 'Play the sorting game.'],
    'Syllable sorter: write syllables on cards and sort them into six boxes.',
    'This is for children of 6 and up who read simple words confidently.'),
  sdiv: GD('Syllable division: rules for splitting long words: between two consonants (rab-bit), after a long vowel (ti-ger), or before consonant-le (ta-ble).',
    'Splitting long words into chunks lets children read words they have never seen.',
    ['Find the vowels first; each syllable needs one.', 'Look at the consonants between the vowels to choose the rule.', 'Read each chunk, then blend the chunks.'],
    'Scissors game: write long words on strips and cut them into syllables.',
    'If a split gives a strange word, try the other rule. Flexibility matters more than rules.'),
  multi: GD('Multisyllabic words have two or more syllables: pump-kin, but-ter-fly, wa-ter-mel-on.',
    'Most words in books are longer than one syllable. Reading chunk by chunk builds confidence.',
    ['Tap a card to hear the word and clap each chunk.', 'Cover all but the first chunk with a finger, then slide along.', 'Blend the chunks: pump… kin… pumpkin.'],
    'Long-word hunt: find the longest word on a cereal box and clap it.',
    'Guessing from the first chunk is common. Make sure every chunk is read.'),
  prefix: GD('A prefix is a word part at the start that changes meaning: un (not), re (again), dis (not), pre (before).',
    'Prefixes unlock hundreds of words and help with meaning, not just sounds.',
    ['Tap a card to hear the parts join, then the meaning.', 'Cover the prefix and read the base word first.', 'Ask: "If un means not, what does unhappy mean?"'],
    'Prefix builder: say a word and add re: "play… replay, read… reread".',
    'Some words only look like they have a prefix (uncle, read). Keep it light.'),
  suffix: GD('A suffix is a word part at the end: -er (a person who), -ful (full of), -less (without), -ly (in a way), -est (the most).',
    'Suffixes change what a word means or does, and help with reading and spelling longer words.',
    ['Tap a card to hear the base word, the ending and the meaning.', 'Find the base word inside the long word.', 'Notice spelling changes: big → biggest doubles the g.'],
    'Job game: farm → farmer, teach → teacher, bake → baker. Who else?',
    'Spelling changes (doubling, dropping e) come later; reading comes first.'),
  inflect: GD('Inflectional endings change number or time: -s / -es (cats, boxes), -ing (jumping) and -ed (jumped).',
    'They appear in almost every sentence. -ed alone has three sounds: t (jumped), d (played) and id (planted).',
    ['Tap a card to hear the base word, the ending and what changes.', 'Point out -es after s, x, sh and ch (boxes, dishes).', 'Listen for the three -ed sounds.'],
    'Yesterday game: "Today I jump. Yesterday I… jumped!"',
    'Writing "jumpt" is a great sign they hear the sound; then show the -ed spelling.'),
  morph: GD('Morphology is the study of word parts (morphemes). Compound words join two words (sun + flower), and affixes like un-, re-, -ful and -ing build new words.',
    'Knowing word parts helps children read and understand long words, and spell them.',
    ['Tap a card to hear the parts join into one word.', 'Ask what each part means: a sunflower is a flower that looks like the sun.', 'Try word sums: un + help + ful = unhelpful.'],
    'Compound mix-up: invent silly compounds: "a cupfish? a rainball?"',
    'Young children love compound words; save word sums for confident readers.'),
  sight: GD('High-frequency words are the words we read most often (the, said, was, you). Some have a tricky part that does not follow the usual sounds.',
    'Knowing them by sight makes reading faster and smoother. Most of each word still follows phonics; only the ❤️ part is learned by heart.',
    ['Sound out the regular part, then point to the tricky part and say it together.', 'Tap a word to hear it in a sentence.', 'Practise a few words at a time.'],
    'Word wall: stick five tricky words on the fridge and read them each breakfast.',
    'Avoid long memorising sessions. Frequent short looks work best.'),
  advspell: GD('Advanced spelling patterns: tch or ch, dge or ge, ai or ay, oi or oy, ph, y as a vowel and tion.',
    'Many of these choices depend on where the sound is in the word or the vowel before it. Knowing the pattern makes spelling a logical choice, not a guess.',
    ['Tap a pattern to hear its sound and examples.', 'Ask "Is it at the end? Is the vowel short?"', 'Play the game: which spelling looks right?'],
    'Pattern detectives: collect words for each pattern in a notebook.',
    'These are usually taught from age 6 or 7.'),
  /* reading application */
  blend: GD('Blending means joining sounds together to read a word: c-a-t makes cat.',
    'This is the key reading skill. Once a child can blend, they can read new words on their own.',
    ['Point to each tile and say its sound, then sweep your finger underneath and say the whole word.', 'Start with three-letter words that have short vowels.', 'If your child gets stuck, join the first two sounds first: "ca… t… cat".'],
    'Robot talk: "Get your h-a-t!" Your child works out the word and fetches it.',
    'Children often add "uh" to each sound (cuh-a-tuh). Keep sounds short, or stretch the ones that can stretch: mmm, sss.'),
  segment: GD('Segmenting for reading and spelling: counting sounds, not letters. Ship has 4 letters but 3 sounds (sh-i-p).',
    'Understanding that letters and sounds are not one-to-one is a big step towards accurate spelling.',
    ['Tap "Say it slowly" and see how many boxes fill.', 'Notice when two letters share one box (sh, ee, ar).', 'Compare the letter count and the sound count.'],
    'Sound buttons: draw a dot under single-letter sounds and a line under teams.',
    'If your child counts letters, say the word slowly and count what you hear.'),
  decode: GD('Decoding is working out an unknown word from its letters: look, say each sound, blend, check it makes sense.',
    'Good decoders don’t guess from pictures or first letters; they look at every letter.',
    ['Follow the four steps on the page every time.', 'Tap Blend to check, then find the picture.', 'Praise the process: "You looked at every letter!"'],
    'Mystery label: write a word on a sticky note, your child decodes it and sticks it on the object.',
    'If your child guesses, cover the picture and point at each letter in turn.'),
  encode: GD('Encoding is spelling by sound: say a word, hear each sound and write the letters for it.',
    'Spelling and reading grow together; spelling practice makes reading stronger.',
    ['Say the word, then say it slowly, sound by sound.', 'Write one letter or team for each sound.', 'Tap Check and compare sound by sound.'],
    'Shopping list: let your child write the list by sound. "Brd" for bread is a great start!',
    'Accept sound-based spellings at first. Correct gently and only one thing at a time.'),
  wordread: GD('Word reading practice: reading single words quickly and accurately, then checking.',
    'When words are read automatically, a child’s attention is free for meaning.',
    ['Your child reads the word before tapping Check.', 'Use "Sound it out" only if they are stuck.', 'Shuffle and go again; aim for smooth, not fast.'],
    'Flashlight words: in a dark room, shine a torch on word cards to read.',
    'Speed should come from accuracy, not pressure. Stop while it is still fun.'),
  sentread: GD('Sentence reading with every pattern mixed: blends, digraphs, long vowels and bossy R.',
    'Reading sentences puts phonics to work and builds understanding.',
    ['Your child reads the sentence first, then taps 🔊 to check.', 'Tap single words for help.', 'Ask a question about each sentence.'],
    'Sentence strips: cut sentences into words, mix them up and rebuild them.',
    'Word-by-word reading is normal at first. Model reading the sentence smoothly.'),
  texts: GD('Decodable texts are short stories written using only the sounds and tricky words a child has learned.',
    'Children practise real reading with success, instead of guessing words they cannot yet decode.',
    ['Let your child read the story. Tap single words for help.', 'Tap "Read me the story" afterwards to hear it smoothly.', 'Play the game to answer questions about each story.'],
    'Read it again tomorrow: re-reading the same story builds fluency and confidence.',
    'Talk about the story, not just the words: "Why did the hat fall off?"'),
  fluency: GD('Fluency is reading accurately, at a comfortable pace, with expression, like talking.',
    'Fluent readers understand more, because their energy goes to meaning instead of decoding.',
    ['Listen first ("Read it to me"), then echo read sentence by sentence.', 'Then time a reading and try to beat it another day.', 'Praise expression and smoothness as much as speed.'],
    'Repeated reading: read the same short passage three times over a week and notice how much smoother it gets.',
    'Rushing hurts understanding. The goal is smooth, not super fast.')
};

/* a section with its own 🔊; data-say is what the voice reads (steps numbered, symbols and emoji turned into words) */
const speakable = t => t.replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu, '').replace(/→/g, ' makes ').replace(/ \/ /g, ' or ').replace(/\s+/g, ' ').trim();
function guideSection(title, body) {
  const s = h('section', 'gd-sec'), head = h('h3', 0, title + ' '), play = h('button', 'gd-play', '🔊');
  play.type = 'button'; play.title = 'Listen to this part'; play.setAttribute('aria-label', 'Listen to: ' + title); play.onclick = () => readGuide([s]); head.append(play); s.append(head);
  if (Array.isArray(body)) { const ol = h('ol', 'guide-list'); body.forEach(t => ol.append(h('li', 0, t))); s.append(ol) } else s.append(h('p', 0, body));
  s.dataset.say = speakable(title + (/[.?!]$/.test(title) ? ' ' : '. ') + (Array.isArray(body) ? body.map((t, i) => (i + 1) + '. ' + t).join(' ') : body)); return s
}
/* Read aloud for grown-ups who would rather listen. The part being read is highlighted and scrolled into view.
   guideEp = speech epoch of the guide's reading, so closing the guide only silences the guide. */
let guideEp = null;
const guideVoice = $('#guideVoice'), guideAuto = $('#guideAuto');
function setGuideReading(on) { guideVoice.textContent = on ? '⏹ Stop reading' : '🔊 Read it to me'; guideVoice.setAttribute('aria-pressed', String(on)) }
function stopGuide() { if (guideEp !== null && Speech.epoch() === guideEp) Speech.stop(); guideEp = null; setGuideReading(false) }
async function readGuide(secs) {
  stopGuide(); setGuideReading(true); const all = secs.length > 1;
  try {
    for (let k = 0; k < secs.length; k++) {
      if (k && Speech.epoch() !== guideEp) return;
      const s = secs[k]; s.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      const p = runStep(lit(SAY((all && !k ? speakable($('#guideTitle').textContent).replace(':', ',') + '. ' : '') + s.dataset.say, .9), s, 'reading'), k > 0);
      if (!k) guideEp = Speech.epoch(); await p
    }
  } catch (e) { }
  if (guideEp !== null && Speech.epoch() === guideEp) { guideEp = null; setGuideReading(false) }
}
guideVoice.onclick = () => guideVoice.getAttribute('aria-pressed') === 'true' ? stopGuide() : readGuide($$('#guideBody .gd-sec'));
guideAuto.checked = LS.get('pp_guide_voice', false);
guideAuto.onchange = () => { LS.set('pp_guide_voice', guideAuto.checked); if (guideAuto.checked) readGuide($$('#guideBody .gd-sec')); else stopGuide() };
$('#guideDlg').addEventListener('close', stopGuide)
/* id = topic id, or 'intro' for the general "What is phonics?" guide */
function openGuide(id) {
  const dlg = $('#guideDlg'), body = $('#guideBody'); body.replaceChildren();
  if (id === 'intro') {
    $('#guideTitle').textContent = 'New to phonics? Start here';
    body.append(
      guideSection('What is phonics?', 'Phonics teaches children that letters stand for sounds, and that sounds join together to make words. Once a child knows the sounds, they can "sound out" new words by themselves.'),
      guideSection('Letter names and letter sounds', 'The letter B is called "bee", but in words it makes a short "b" sound. Phonics uses the sounds. Say them short and clear: "mmm" for m, not "em".'),
      guideSection('Words you will hear', ['Sound (phoneme): the smallest sound in a word. Cat has three: c, a, t.', 'Letter pattern (grapheme): the letter or letters that write one sound. sh in ship is one sound.', 'Blending: joining sounds to read a word. c-a-t → cat.', 'Segmenting: breaking a word into its sounds to spell it. dog → d-o-g.']),
      guideSection('How the topics are organised', GROUPS.map(gr => gr.icon + ' ' + gr.name + ' (ages ' + gr.age + '): ' + gr.topics.map(t => topicName(t, GROUPS.indexOf(gr))).join(', ') + '.')),
      guideSection('A good order to learn', ['Phonemic Awareness: listening, rhyming, first sounds (no letters needed).', 'Letter sounds: consonants and short vowels, then Letter Names.', 'Short Vowels: CVC words, word families, blending and segmenting.', 'Consonant blends and digraphs (bl, st, sh, ch), then Word Patterns.', 'Long vowels, silent e and vowel teams (ai, ee).', 'Bossy R, diphthongs and trigraphs: usually from age 5 to 6.', 'Advanced Phonics: usually from age 6 or 7.', 'Reading Application all along the way: sentences, stories, fluency.']),
      guideSection('How to use PhonicsPal together', ['Keep it short: 5 to 10 minutes a day is plenty.', 'Tap a card, listen, then say the sound together out loud.', 'Finish a topic with "Play the game" and collect a sticker for every game you win.', 'Praise effort, not just right answers, and stop while it is still fun.']),
      guideSection('Is my 4 to 5 year old ready?', 'Most children this age are ready for listening games, letter sounds and simple three-letter words. Each group shows a suggested age; skip anything that feels hard and come back later.'));
  } else {
    const gd = GUIDE[id]; $('#guideTitle').textContent = TOPIC[id].icon + ' ' + topicName(id) + ': for grown-ups';
    body.append(guideSection('What is it?', gd.what), guideSection('Why it matters', gd.why), guideSection('How to teach it', gd.how),
      guideSection('Try this at home', gd.home), guideSection('Watch out for', gd.watch));
  }
  stopPhonics(); stopGuide(); if (!dlg.open) dlg.showModal(); $('#guideClose').focus({ preventScroll: true }); dlg.scrollTop = 0;
  /* opened by a tap, so the browser allows sound straight away */
  if (guideAuto.checked) readGuide($$('#guideBody .gd-sec'))
}

$('#phIntro').onclick = () => openGuide('intro');
$('#guideClose').onclick = () => $('#guideDlg').close();

/* stars: best game score per topic id (0 to 5). Scores saved by tab number before topics had ids are moved over once. */
const STARS_KEY = 'pp_stars';
if (!LS.get(STARS_KEY, null)) {
  const old = LS.get('pp_game_stars', {}), ids = ['short', 'cons', 'vb', 'cb', 'dg', 'rc', 'dp', 'blend'], s = {};
  Object.entries(old).forEach(([i, n]) => { if (ids[i]) s[ids[i]] = n }); LS.set(STARS_KEY, s)
}
const bestStars = id => (LS.get(STARS_KEY, {})[id] || 0);
function topicBar(id) {
  const bar = $('#ptopic'); bar.replaceChildren();
  const info = h('button', 'btn t kid-btn', 'ℹ️ For grown-ups'); info.type = 'button'; info.title = 'What this topic is and how to teach it'; info.onclick = () => openGuide(id); bar.append(info);
  if (TOPIC[id].game) {
    const play = h('button', 'btn kid-btn play', '🎮 Play the game'); play.type = 'button'; play.title = 'A fun game for this topic'; play.onclick = () => openGame(id);
    const best = bestStars(id), stars = h('span', 'kid-stars', best ? 'Best: ' + '⭐'.repeat(best) : '');
    stars.setAttribute('aria-label', best ? 'Best score ' + best + ' out of 5 stars' : ''); bar.append(play, stars)
  }
  refreshStars()
}
