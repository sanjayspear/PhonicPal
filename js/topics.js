/* The phonics topic map. A topic listed in more than one group (short vowels,
   blends, digraphs…) is one page with one set of stars wherever it appears.
   Audio: assets/audio/s_<id>.mp3 (sounds), w_<word>.mp3 (words), r_<rime>.mp3 (word endings), n_<letter>.mp3 (letter
   names), rendered offline with Kokoro (see tools/). A missing file falls back to the voice engine. */

/* ---------- sounds ---------- */
/* Item: s = symbol shown, k = sound audio id, fb = browser-voice fallback, ex = example words, tag = short/long label */
const it = (s, k, fb, ex, tag, hint) => ({ s, k, fb, ex, tag, hint });
const SV = [it('a', 'a1', 'add', ['apple', 'cat', 'map', 'bag'], 'short', 'Short a says /ă/.'), it('e', 'e1', 'end', ['egg', 'bed', 'hen', 'red'], 'short', 'Short e says /ĕ/.'), it('i', 'i1', 'in', ['igloo', 'sit', 'pin', 'fish'], 'short', 'Short i says /ĭ/.'), it('o', 'o1', 'odd', ['octopus', 'hot', 'dog', 'fox'], 'short', 'Short o says /ŏ/.'), it('u', 'u1', 'up', ['umbrella', 'sun', 'cup', 'bus'], 'short', 'Short u says /ŭ/.')];
const LV = [it('ā', 'a2', 'ay', ['cake', 'rain', 'baby', 'game'], 'long'), it('ē', 'e2', 'ee', ['tree', 'me', 'feet', 'equal'], 'long'), it('ī', 'i2', 'eye', ['kite', 'night', 'ice', 'light'], 'long'), it('ō', 'o2', 'oh', ['boat', 'rope', 'note', 'go'], 'long'), it('ū', 'u2', 'you', ['unicorn', 'cute', 'music', 'cube'], 'long')];
const cs = (s, fb, w, hint) => it(s, s, fb, [w], undefined, hint);
const C = [cs('b', 'buh', 'ball'), cs('c', 'kuh', 'cat', 'Hard c says k. Before e, i or y it usually says s, as in city.'), cs('d', 'duh', 'dog'), cs('f', 'fuh', 'fish'), cs('g', 'guh', 'goat', 'Hard g as in goat. Before e, i or y it can say j, as in gem.'), cs('h', 'huh', 'hat'), cs('j', 'juh', 'jam'), cs('k', 'kuh', 'kite'), cs('l', 'luh', 'lion'), cs('m', 'muh', 'moon'), cs('n', 'nuh', 'nest'), cs('p', 'puh', 'pig'), cs('q', 'kwuh', 'queen'), cs('r', 'ruh', 'rabbit'), cs('s', 'suh', 'sun'), cs('t', 'tuh', 'tent'), cs('v', 'vuh', 'van'), cs('w', 'wuh', 'web'), cs('x', 'kuhs', 'box', 'x says ks, as at the end of box.'), cs('y', 'yuh', 'yak'), cs('z', 'zuh', 'zebra')];
const VB = [it('ai', 'a2', 'ay', ['rain']), it('ee', 'e2', 'ee', ['bee']), it('oa', 'o2', 'oh', ['boat']), it('oo', 'oo', 'ooh', ['moon'], undefined, 'Also in flute and rule.'), it('ou', 'ou', 'ow', ['cloud'], undefined, 'A glide sound: see Diphthongs too.'), it('ie', 'i2', 'eye', ['pie']), it('ea', 'e2', 'ee', ['leaf']), it('ow', 'o2', 'oh', ['snow'], undefined, 'ow can also say ow, as in cow.')];
const CB = [cs('bl', 'bluh', 'blue'), cs('br', 'bruh', 'brush'), cs('cl', 'cluh', 'clap'), cs('cr', 'cruh', 'crab'), cs('dr', 'druh', 'drum'), cs('fl', 'fluh', 'flag'), cs('fr', 'fruh', 'frog'), cs('gl', 'gluh', 'globe'), cs('gr', 'gruh', 'grape'), cs('pl', 'pluh', 'plant'), cs('pr', 'pruh', 'prince'), cs('sk', 'skuh', 'skate'), cs('sl', 'sluh', 'sled'), cs('sm', 'smuh', 'smile'), cs('sn', 'snuh', 'snake'), cs('sp', 'spuh', 'spider'), cs('st', 'stuh', 'star'), cs('sw', 'swuh', 'swan'), cs('tr', 'truh', 'tree')];
const TRIG = [it('tch', 'ch', 'ch', ['witch', 'watch', 'catch'], undefined, 'tch says ch. It comes right after a short vowel.'), it('dge', 'j', 'j', ['bridge', 'badge', 'hedge'], undefined, 'dge says j, right after a short vowel.'), it('igh', 'i2', 'eye', ['night', 'light', 'high'], undefined, 'Three letters make the long i sound.'), it('air', 'air', 'air', ['chair', 'hair', 'fair'], undefined, 'Three letters, one sound: air.'), it('ear', 'ear', 'ear', ['ear', 'hear', 'beard'], undefined, 'ear says ear: I hear with my ear.')];
/* letter -> [name the voice says, sound id, example word] */
const ABC = { a: ['ay', 'a1', 'apple'], b: ['bee', 'b', 'ball'], c: ['see', 'c', 'cat'], d: ['dee', 'd', 'dog'], e: ['ee', 'e1', 'egg'], f: ['ef', 'f', 'fish'], g: ['gee', 'g', 'goat'], h: ['aitch', 'h', 'hat'], i: ['eye', 'i1', 'igloo'], j: ['jay', 'j', 'jam'], k: ['kay', 'k', 'kite'], l: ['el', 'l', 'lion'], m: ['em', 'm', 'moon'], n: ['en', 'n', 'nest'], o: ['oh', 'o1', 'octopus'], p: ['pee', 'p', 'pig'], q: ['cue', 'q', 'queen'], r: ['ar', 'r', 'rabbit'], s: ['ess', 's', 'sun'], t: ['tee', 't', 'tent'], u: ['you', 'u1', 'umbrella'], v: ['vee', 'v', 'van'], w: ['double you', 'w', 'web'], x: ['ex', 'x', 'box'], y: ['why', 'y', 'yak'], z: ['zee', 'z', 'zebra'] };
const NAME = Object.fromEntries(Object.entries(ABC).map(([l, a]) => [l, a[0]]));
/* what the browser voice says for a sound id when its recording is missing */
const FB = { ch: 'ch', sh: 'sh', th: 'th', wh: 'w', oo: 'ooh', ou: 'ow', oi: 'oy', ar: 'ar', er: 'er', ir: 'er', or: 'or', ur: 'er', ng: 'ng', nk: 'nk', air: 'air', ear: 'ear', schwa: 'uh' };
[...SV, ...LV, ...C, ...CB].forEach(x => { FB[x.k] = x.fb });

/* ---------- words split into sounds ---------- */
const WB = ['c-a-t', 's-u-n', 'p-i-g', 'd-o-g', 'b-u-s', 'h-e-n', 'sh-i-p', 'fr-o-g', 'ch-i-p', 'cl-a-p', 'st-o-p', 'th-i-n'];
const SND = { a: 'a1', e: 'e1', i: 'i1', o: 'o1', u: 'u1' }, LONG = { a: 'a2', e: 'e2', i: 'i2', o: 'o2', u: 'u2' };
/* letter teams that make one sound -> audio id (shares splitWord's list in custom-phonics.js) */
const TEAM = { ai: 'a2', ay: 'a2', ee: 'e2', ea: 'e2', ie: 'i2', igh: 'i2', oa: 'o2', ow: 'o2', oo: 'oo', ou: 'ou', oi: 'oi', oy: 'oi', ar: 'ar', er: 'er', ir: 'er', or: 'or', ur: 'er', ck: 'k', ph: 'f', qu: 'q', tch: 'ch', dge: 'j', kn: 'n', wr: 'r', mb: 'm', ll: 'l', ss: 's', ff: 'f', zz: 'z' };
/* tiles -> sound id per tile; silent e (c-a-k-e) makes the vowel long and plays nothing (null);
   c before e, i or y says s (i-c-e), and g before a final silent e says j (a-g-e) */
function soundsOf(toks) {
  const n = toks.length, magic = n >= 3 && toks[n - 1] === 'e' && LONG[toks[n - 3]] && !/[aeiouy]/.test(toks[n - 2]);
  return toks.map((t, k) => magic && k === n - 1 ? null : magic && k === n - 3 ? LONG[t] : t === 'c' && /^[eiy]/.test(toks[k + 1] || '') ? 's' : t === 'g' && magic && k === n - 2 ? 'j' : SND[t] || TEAM[t] || t)
}
const plain = s => s.replace(/[-|«»·]/g, '');
const sounds = w => soundsOf(w.split('-')).filter(Boolean);

/* Picture for a word (cards, chips and games). Words without a clear picture are left out. */
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
  hen: '🐔', stop: '🛑',
  map: '🗺️', bat: '🦇', cap: '🧢', fan: '🪭', pan: '🍳', can: '🥫', rat: '🐀', ram: '🐏', man: '👨', jet: '🛩️', leg: '🦵', ten: '🔟',
  red: '🔴', net: '🥅', six: '6️⃣', lip: '👄', zip: '🤐', bin: '🗑️', dig: '⛏️', kid: '🧒', fox: '🦊', pot: '🍲', log: '🪵', mop: '🧹',
  bug: '🐞', mug: '☕', tub: '🛁', nut: '🥜', hut: '🛖', hug: '🤗', wet: '💦', dot: '⚫', win: '🏆', fun: '🎉', run: '🏃', pop: '🎈',
  sled: '🛷', snake: '🐍', three: '3️⃣', key: '🔑', spoon: '🥄', jar: '🫙', coat: '🧥', bear: '🐻', pear: '🍐', chair: '🪑',
  king: '👑', ring: '💍', rock: '🪨', lock: '🔒', nose: '👃', rose: '🌹', train: '🚂', chain: '⛓️', dish: '🍽️', mice: '🐁',
  dice: '🎲', rice: '🍚', bell: '🔔', shell: '🐚', snail: '🐌', nail: '💅', sheep: '🐑', owl: '🦉',
  pencil: '✏️', monkey: '🐒', rocket: '🚀', tiger: '🐯', pizza: '🍕', carrot: '🥕', lemon: '🍋', candle: '🕯️', turtle: '🐢',
  basket: '🧺', cupcake: '🧁', rainbow: '🌈', pumpkin: '🎃', robot: '🤖', banana: '🍌', butterfly: '🦋', elephant: '🐘',
  dinosaur: '🦕', tomato: '🍅', kangaroo: '🦘', computer: '💻', watermelon: '🍉', caterpillar: '🐛', helicopter: '🚁',
  alligator: '🐊', drum: '🥁', tie: '👔', hand: '🖐️', milk: '🥛', gift: '🎁', lamp: '🪔', wind: '🌬️', mask: '🎭', crab: '🦀',
  flag: '🚩', swim: '🏊', plug: '🔌', plant: '🪴', skunk: '🦨', bike: '🚲', bone: '🦴', five: '5️⃣', cone: '🍦', ape: '🦍',
  ox: '🐂', ax: '🪓', up: '⬆️', spider: '🕷️', swan: '🦢', globe: '🌍', prince: '🤴', skate: '⛸️', smile: '😊',
  witch: '🧙', watch: '⌚', bridge: '🌉', badge: '📛', hair: '💇', fair: '🎡', ear: '👂', beard: '🧔',
  sofa: '🛋️', panda: '🐼', circus: '🎪', knife: '🔪', knot: '🪢', knee: '🦵', write: '✍️', wrench: '🔧', wrap: '🎁', lamb: '🐑',
  comb: '🪮', climb: '🧗', ghost: '👻', sign: '🪧', gnome: '🧌', city: '🏙️', circle: '⭕', giraffe: '🦒', gem: '💎', page: '📄',
  orange: '🍊', magic: '🪄', gate: '🚧', pine: '🌲', cane: '🦯', tube: '🧪', tape: '📼', eight: '8️⃣', play: '🛝', fly: '🪰',
  toe: '🦶', screw: '🔩', flute: '🪈', happy: '😄', magnet: '🧲', sunset: '🌅', popcorn: '🍿', hamburger: '🍔', unlock: '🔓',
  replay: '🔁', unhappy: '😞', dislike: '👎', farmer: '🧑‍🌾', baker: '🧑‍🍳', painter: '🧑‍🎨', sunflower: '🌻', football: '🏈',
  pancake: '🥞', snowman: '⛄', jellyfish: '🪼', toothbrush: '🪥', phone: '☎️', dolphin: '🐬', photo: '📷', candy: '🍬',
  station: '🚉', lotion: '🧴', hill: '⛰️', doll: '🪆', kiss: '💋', buzz: '🐝', pink: '🩷', sink: '🚰', sing: '🎤', dress: '👗',
  cry: '😢', catch: '⚾', stamp: '📮', lake: '🏞️', cats: '🐱🐱', boxes: '📦📦', jumping: '🤸', planted: '🌱'
};
const picOf = w => PIC[w] || '';

/* ---------- the topics ---------- */
/* Topic: id, name, icon, intro (under the tabs), tip (the owl's line for kids), view (how the page is drawn: VIEWS in
   phonics-views.js) plus that view's data, game (question maker in phonics-game.js; none = no game) */
const CVC = [['Short a', ['c-a-t', 'm-a-p', 'b-a-g', 'h-a-t', 'f-a-n', 'c-a-p']], ['Short e', ['b-e-d', 'h-e-n', 'n-e-t', 'j-e-t', 'l-e-g', 'p-e-n']],
['Short i', ['p-i-g', 'p-i-n', 's-i-x', 'l-i-p', 'z-i-p', 'b-i-n']], ['Short o', ['d-o-g', 'f-o-x', 'b-o-x', 'p-o-t', 'm-o-p', 'l-o-g']],
['Short u', ['s-u-n', 'c-u-p', 'b-u-s', 'b-u-g', 'm-u-g', 'n-u-t']]];
const CVC_ALL = CVC.flatMap(s => s[1]);
const SV_SENT = [['The cat sat on a mat.', 'cat'], ['A pig is in the mud.', 'pig'], ['The dog can run.', 'dog'], ['A bug is on a rug.', 'bug'], ['The sun is hot.', 'sun'],
['Ten hens sit in a pen.', 'hen'], ['The fox is in a box.', 'fox'], ['Dad has a red cap.', 'cap'], ['Get on the big bus.', 'bus'], ['A jet can zip up.', 'jet']];
const FIRST = { s: ['sun', 'sock', 'six', 'snake'], b: ['ball', 'bus', 'bed', 'bee'], m: ['moon', 'mug', 'map', 'mop'], c: ['cat', 'cup', 'cake', 'car'], d: ['dog', 'duck', 'drum', 'dig'],
  t: ['tent', 'ten', 'tiger', 'tub'], p: ['pig', 'pen', 'pizza', 'pan'], f: ['fish', 'fox', 'fan', 'frog'], h: ['hat', 'hen', 'horse', 'hut'], l: ['lion', 'leg', 'lemon', 'log'] };
const LAST = { t: ['cat', 'hat', 'net', 'pot', 'nut'], g: ['dog', 'bag', 'pig', 'bug', 'log'], n: ['sun', 'pen', 'fan', 'hen', 'bin'], p: ['cup', 'map', 'mop', 'lip', 'cap'], d: ['bed', 'red', 'kid'], m: ['jam', 'drum', 'ram'], x: ['box', 'fox', 'six'] };
const MIDDLE = { a1: ['cat', 'bag', 'map', 'fan', 'hat'], e1: ['bed', 'hen', 'net', 'leg', 'jet'], i1: ['pig', 'pin', 'six', 'lip', 'zip'], o1: ['dog', 'fox', 'pot', 'mop', 'log'], u1: ['sun', 'cup', 'bug', 'mug', 'nut'] };
const FAM = { at: ['c', 'h', 'b', 'r', 'm', 's'], an: ['c', 'f', 'm', 'p', 'v', 'r'], ig: ['p', 'd', 'b', 'w'], op: ['m', 't', 'h', 'p'], ug: ['b', 'm', 'h', 'r', 'j'],
  en: ['h', 'p', 't', 'm'], et: ['n', 'j', 'w', 'p', 'v'], in: ['p', 'b', 'f', 'w', 't'], ot: ['p', 'h', 'd', 'c'], un: ['s', 'b', 'r', 'f'] };
const RHYME = [['at', ['cat', 'hat', 'bat', 'rat']], ['og', ['dog', 'log', 'frog']], ['ed', ['bed', 'red', 'sled']], ['en', ['hen', 'pen', 'ten']], ['ox', ['fox', 'box']],
['ake', ['cake', 'snake']], ['ee', ['bee', 'tree', 'three', 'key']], ['oon', ['moon', 'spoon']], ['ar', ['star', 'car', 'jar']], ['oat', ['boat', 'goat', 'coat']],
['ouse', ['mouse', 'house']], ['ug', ['bug', 'mug']], ['an', ['pan', 'van', 'fan', 'can']], ['air', ['bear', 'pear', 'chair']], ['ing', ['king', 'ring']],
['ock', ['clock', 'sock', 'rock', 'lock']], ['ose', ['nose', 'rose']], ['ain', ['train', 'rain', 'chain']], ['ish', ['fish', 'dish']], ['ight', ['kite', 'light', 'night']],
['ice', ['mice', 'dice', 'rice']], ['ell', ['bell', 'shell']], ['ail', ['snail', 'nail', 'whale']]];
const ANIMALS = [['cow', 'moo'], ['dog', 'woof'], ['cat', 'meow'], ['duck', 'quack'], ['sheep', 'baa'], ['pig', 'oink'], ['lion', 'roar'], ['snake', 'hiss'], ['bee', 'buzz'], ['owl', 'hoot'], ['frog', 'ribbit'], ['horse', 'neigh']];
const SAME_DIFF = [['cat', 'cat'], ['cat', 'cap'], ['pin', 'pen'], ['dog', 'dog'], ['sun', 'sun'], ['bed', 'bad'], ['hat', 'hot'], ['map', 'map'], ['fish', 'dish'], ['moon', 'moon']];
const SYLL = [['One clap', ['cat', 'dog', 'sun', 'fish', 'frog', 'ball']], ['Two claps', ['rab-bit', 'ap-ple', 'pen-cil', 'mon-key', 'rock-et', 'ti-ger', 'piz-za', 'car-rot', 'lem-on', 'tur-tle', 'cup-cake', 'rain-bow', 'pump-kin', 'ro-bot']],
['Three claps', ['ba-nan-a', 'but-ter-fly', 'el-e-phant', 'di-no-saur', 'to-ma-to', 'oc-to-pus', 'um-brel-la', 'kan-ga-roo', 'com-pu-ter']], ['Four claps', ['wa-ter-mel-on', 'cat-er-pil-lar', 'hel-i-cop-ter', 'al-li-ga-tor']]];
const ONSET = [['c', 'at'], ['h', 'at'], ['d', 'og'], ['l', 'og'], ['p', 'ig'], ['s', 'un'], ['b', 'ug'], ['h', 'en'], ['p', 'en'], ['m', 'op'], ['b', 'ed'], ['f', 'ox'], ['fr', 'og'], ['st', 'ar'], ['sn', 'ake'], ['tr', 'ee'], ['sh', 'ip'], ['ch', 'ip']];
const SWAP = [['cat', 'hat', 0], ['cat', 'bat', 0], ['hen', 'pen', 0], ['pan', 'fan', 0], ['pan', 'van', 0], ['dog', 'log', 0], ['bug', 'mug', 0], ['pin', 'bin', 0], ['net', 'jet', 0],
['map', 'cap', 0], ['bed', 'red', 0], ['pin', 'pen', 1], ['hat', 'hot', 1], ['cap', 'cup', 1], ['bag', 'bug', 1], ['cat', 'cap', 2], ['pig', 'pin', 2], ['bat', 'bag', 2]];
const PAIRS = [['pin', 'pen'], ['cap', 'cup'], ['hat', 'hot'], ['bag', 'bug'], ['mop', 'map'], ['net', 'nut'], ['dog', 'dig'], ['pan', 'pen']];
const MAGIC = [['kit', 'kite'], ['pin', 'pine'], ['can', 'cane'], ['cub', 'cube'], ['tub', 'tube'], ['not', 'note'], ['hop', 'hope'], ['cap', 'cape'], ['tap', 'tape'], ['man', 'mane'], ['fin', 'fine'], ['rid', 'ride']];
const MIXED = ['sh-i-p', 'ch-i-p', 'r-ai-n', 'b-oa-t', 'k-i-t-e', 's-t-ar', 'b-ir-d', 'c-oi-n', 'f-r-o-g', 'n-igh-t', 'c-a-k-e', 'm-oo-n', 't-r-ee', 'sh-ee-p', 'c-l-ou-d', 'sh-ar-k', 't-r-ai-n', 'd-u-ck', 'f-i-sh', 'c-r-a-b'];
const SOUNDS_WORDS = ['sh-i-p', 'f-i-sh', 'ch-i-p', 'm-oo-n', 'r-ai-n', 'b-ee', 'f-r-o-g', 'd-u-ck', 'b-oa-t', 'n-igh-t', 's-t-ar', 't-r-ee', 'sh-ee-p', 'c-r-a-b', 'd-r-u-m', 'th-u-mb'];
const STORIES = [
  { title: 'Sam the Cat', pic: '🐱', lines: ['Sam is a cat.', 'Sam has a red hat.', 'Sam sits on a mat.', 'The hat fell off!', 'Sam naps in the hat.'],
    qs: [['Where does Sam nap?', 'hat', ['bed', 'box']], ['What is Sam?', 'cat', ['dog', 'pig']]] },
  { title: 'The Big Pig', pic: '🐷', lines: ['A pig digs in the mud.', 'The pig is big and pink.', 'A bug hops on the pig.', 'The pig says oink!', 'The bug runs off.'],
    qs: [['What hops on the pig?', 'bug', ['frog', 'cat']], ['Who says oink?', 'pig', ['cow', 'duck']]] },
  { title: 'The Ship Trip', pic: '🚢', lines: ['Dad and Beth get on a ship.', 'The ship rocks up and down.', 'Beth can see a fish.', 'Then a whale jumps!', '"Wow!" said Beth.'],
    qs: [['What jumps?', 'whale', ['fish', 'frog']], ['What do Dad and Beth get on?', 'ship', ['bus', 'train']]] },
  { title: 'Jake and the Kite', pic: '🪁', lines: ['Jake has a kite.', 'It is white and blue.', 'Jake runs up the hill.', 'The wind takes the kite up high.', 'Jake smiles. What a fine day!'],
    qs: [['What does Jake have?', 'kite', ['ball', 'boat']], ['Where does Jake run?', 'hill', ['house', 'ship']]] },
  { title: 'Rain in the Park', pic: '🌧️', lines: ['It is a gray day.', 'Rain falls on the park.', 'Kay and Lee play in the rain.', 'They jump in the wet mud.', 'Then the sun comes out. Hooray!'],
    qs: [['What falls on the park?', 'rain', ['snow', 'leaf']], ['What comes out at the end?', 'sun', ['moon', 'star']]] }];
const PASSAGES = [
  { title: 'The Red Hen', level: 'Level 1', text: 'A red hen sat on a nest. The hen had ten eggs. Pop, pop, pop! Ten chicks got up. The hen and the chicks ran to the pen.' },
  { title: 'Frog on a Log', level: 'Level 2', text: 'A green frog sat on a log by the pond. It was hot, so the frog swam in the cool water. A big fish swam past. The frog did a flip and hopped back on the log. Splash!' },
  { title: 'The Snowy Day', level: 'Level 3', text: 'One cold morning, Rose woke up and saw snow. She put on her coat, her boots and a bright red scarf. Rose and her dog raced outside. They made a tall snowman with a carrot nose. Then they went inside for a cup of hot cocoa.' }];
const READ_SENT = [['The ship is in the sea.', 'ship'], ['A green frog can jump.', 'frog'], ['I ride my bike to the park.', 'bike'], ['The queen has a gold crown.', 'queen'], ['A bird sings in the tree.', 'bird'],
['We play in the rain.', 'rain'], ['The cow is brown.', 'cow'], ['The boy has a toy boat.', 'boat'], ['Look at the moon and the stars.', 'moon'], ['The goat eats a leaf.', 'goat']];
const SIGHT = [['th«e»', 'The cat is big.'], ['«a»', 'I see a dog.'], ['I', 'I can run.'], ['is', 'It is hot.'], ['t«o»', 'We go to the park.'], ['y«ou»', 'I like you.'], ['s«ai»d', 'Mom said yes.'],
['w«a»s', 'It was fun.'], ['he', 'He is my dad.'], ['she', 'She can hop.'], ['we', 'We can sing.'], ['my', 'This is my hat.'], ['«o»f', 'A cup of milk.'], ['«are»', 'We are happy.'],
['th«ey»', 'They play.'], ['d«o»', 'I do my best.'], ['c«o»m«e»', 'Come and see.'], ['s«o»m«e»', 'I want some.'], ['«one»', 'I have one cat.'], ['t«w»o', 'I have two dogs.'],
['hav«e»', 'I have a pen.'], ['wh«ere»', 'Where is my hat?'], ['th«ere»', 'There is a bug.'], ['here', 'Here is a cake.']];
/* builder rows: parts (a string is a word; [text, what the voice says] is a word part) -> word, meaning */
const PREFIX = [[[['un', 'un'], 'happy'], 'unhappy', 'not happy'], [[['un', 'un'], 'lock'], 'unlock', 'to open a lock'], [[['un', 'un'], 'tie'], 'untie', 'to undo a knot'],
[[['re', 'ree'], 'play'], 'replay', 'to play again'], [[['re', 'ree'], 'fill'], 'refill', 'to fill again'], [[['re', 'ree'], 'do'], 'redo', 'to do again'],
[[['dis', 'dis'], 'like'], 'dislike', 'to not like'], [[['pre', 'pree'], 'heat'], 'preheat', 'to heat before']];
const SUFFIX = [[['farm', ['er', 'er']], 'farmer', 'a person who farms'], [['teach', ['er', 'er']], 'teacher', 'a person who teaches'], [['paint', ['er', 'er']], 'painter', 'a person who paints'],
[['help', ['ful', 'full']], 'helpful', 'full of help'], [['play', ['ful', 'full']], 'playful', 'full of play'], [['fear', ['less', 'less']], 'fearless', 'without fear'],
[['slow', ['ly', 'lee']], 'slowly', 'in a slow way'], [['big', ['est', 'est']], 'biggest', 'the most big']];
const INFLECT = [[['cat', ['s', 's']], 'cats', 'more than one cat'], [['box', ['es', 'iz']], 'boxes', 'more than one box'], [['bus', ['es', 'iz']], 'buses', 'more than one bus'],
[['jump', ['ing', 'ing']], 'jumping', 'doing it now'], [['run', ['ning', 'ing']], 'running', 'doing it now: run gets an extra n'], [['jump', ['ed', 't']], 'jumped', 'it already happened: -ed says t'],
[['play', ['ed', 'd']], 'played', 'it already happened: -ed says d'], [['plant', ['ed', 'id']], 'planted', 'it already happened: -ed says id']];
const COMPOUND = [['sun', 'flower', 'sunflower'], ['rain', 'bow', 'rainbow'], ['cup', 'cake', 'cupcake'], ['foot', 'ball', 'football'], ['pan', 'cake', 'pancake'], ['snow', 'man', 'snowman'],
['butter', 'fly', 'butterfly'], ['pop', 'corn', 'popcorn'], ['jelly', 'fish', 'jellyfish'], ['tooth', 'brush', 'toothbrush']];
const WORD_SUMS = [[[['un', 'un'], 'help', ['ful', 'full']], 'unhelpful', 'not helpful'], [[['re', 'ree'], 'play', ['ing', 'ing']], 'replaying', 'playing again'], [[['un', 'un'], 'lock', ['ed', 't']], 'unlocked', 'opened the lock']];

const TOPICS = [
  /* ----- Short vowels ----- */
  { id: 'short', name: 'Short Vowels', icon: '🍎', view: 'cards', items: SV, game: 'sound', intro: 'The five short vowel sounds: a in cat, e in bed, i in sit, o in hot, u in sun. Tap a card to hear the sound and its words.', tip: 'Tap a card and say the sound with me!' },
  { id: 'cvc', name: 'CVC Words', icon: '🐱', view: 'words', sets: CVC, game: 'word', intro: 'Consonant, vowel, consonant: three sounds, like c-a-t. Tap Blend to hear each sound join into the word.', tip: 'Three sounds make a word: c… a… t… cat!' },
  { id: 'families', name: 'Word Families', icon: '🏠', view: 'family', fam: FAM, game: 'family', intro: 'Words in a family share an ending: cat, hat, bat. Change the first letter to make a new word.', tip: 'Pick a family, then change the first letter!' },
  { id: 'pairs', name: 'Minimal Pairs', icon: '👂', view: 'pairs', pairs: PAIRS, game: 'pairs', intro: 'Two words that are the same except for one sound, like pin and pen. Listening for the difference sharpens the ear.', tip: 'Pin or pen? Listen closely!' },
  { id: 'svblend', name: 'Short-Vowel Blending', icon: '🔗', view: 'words', words: ['h-a-t', 'r-a-t', 'v-a-n', 'p-a-n', 'j-a-m', 't-e-n', 'w-e-b', 'd-i-g', 'k-i-d', 'h-o-t', 't-u-b', 'h-u-t'], game: 'blend', intro: 'Say each sound, then push them together to read the word. The picture pops up when the word is blended.', tip: 'Listen to the sounds, then shout the word!' },
  { id: 'svseg', name: 'Short-Vowel Segmenting', icon: '✂️', view: 'boxes', words: ['c-a-t', 's-u-n', 'p-i-g', 'b-e-d', 'd-o-g', 'm-a-p', 'c-u-p', 'h-e-n', 'l-o-g', 'b-u-g', 'p-i-n', 'n-e-t'], letters: true, game: 'boxes', intro: 'Segmenting is the opposite of blending: break a word into its sounds, one sound per box.', tip: 'One sound in each box!' },
  { id: 'dictation', name: 'Short-Vowel Dictation', icon: '✏️', view: 'dictation', words: ['c-a-t', 'd-o-g', 's-u-n', 'p-i-g', 'b-e-d', 'h-a-t', 'c-u-p', 'f-a-n', 'j-e-t', 'm-o-p', 'b-u-s', 'l-i-p'], game: 'spell', intro: 'Listen to a word, say its sounds, then write or build it. Tap a card to hear the word, then check the spelling.', tip: 'Listen, then spell it with letters!' },
  { id: 'svsent', name: 'Decodable Sentences', icon: '📝', view: 'sentences', sentences: SV_SENT, game: 'sentence', intro: 'Sentences made only from short-vowel words and a few tricky words (the, a, is), so a beginner can read every word.', tip: 'Read the sentence. Which picture is it?' },
  { id: 'svmix', name: 'Mixed Practice', icon: '🎲', view: 'mix', words: CVC_ALL, game: 'mixed', intro: 'All five short vowels mixed together. Shuffle for new words, or play the mixed game.', tip: 'Shuffle the words and blend them all!' },
  { id: 'svspell', name: 'Spelling Patterns', icon: '🔍', view: 'groups', groups: [
    { big: 'ck', title: 'ck at the end', sub: 'After a short vowel, the k sound at the end is spelled ck.', sound: 'k', words: ['du«ck»', 'so«ck»', 'ki«ck»', 'clo«ck»'] },
    { big: 'll', title: 'ff · ll · ss · zz', sub: 'Short vowel then f, l, s or z at the end? Double it!', words: ['be«ll»', 'do«ll»', 'hi«ll»', 'ki«ss»', 'dre«ss»', 'bu«zz»'] },
    { big: 'ng', title: 'ng', sub: 'n and g glue together to make one sound.', sound: 'ng', words: ['ri«ng»', 'ki«ng»', 'si«ng»'] },
    { big: 'nk', title: 'nk', sub: 'n and k glue together: nk.', sound: 'nk', words: ['pi«nk»', 'si«nk»', 'sku«nk»'] }],
    game: 'choose', choose: [['duck', ['duk', 'duc']], ['sock', ['sok', 'soc']], ['clock', ['clok', 'cloc']], ['bell', ['bel']], ['kiss', ['kis']], ['doll', ['dol']], ['hill', ['hil']], ['buzz', ['buz']], ['dress', ['dres']], ['pink', ['pinc', 'pingk']]],
    intro: 'Short vowels come with spelling rules: ck at the end (duck), double f, l, s and z (bell), and the glued sounds ng and nk.', tip: 'Short vowel words have spelling tricks!' },

  /* ----- Phonemic awareness: ears only ----- */
  { id: 'listen', name: 'Listening for Sounds', icon: '🎧', view: 'listen', game: 'listen', intro: 'Before letters, children learn to listen: which animal made that sound, and are two words the same or different?', tip: 'Close your eyes and listen!' },
  { id: 'rhyme', name: 'Rhyming', icon: '🎵', view: 'groups', groups: RHYME.map(([r, w]) => ({ big: '-' + r, title: w.join(', '), words: w })), game: 'rhyme', intro: 'Rhyming words sound the same at the end: cat, hat, bat. Tap a family to hear them all.', tip: 'Cat, hat, bat… they rhyme!' },
  { id: 'syll', name: 'Syllables', icon: '👏', view: 'clap', sets: SYLL, beats: true, game: 'syll', intro: 'A syllable is a beat in a word. Clap once for each beat: rab-bit has two.', tip: 'Clap the beats: but-ter-fly!' },
  { id: 'onset', name: 'Onset and Rime', icon: '🧲', view: 'onset', items: ONSET, game: 'onset', intro: 'The onset is the first sound (c), the rime is the rest (at). Put them together: c… at, cat!', tip: 'c… at… cat! Stick them together!' },
  { id: 'first', name: 'Initial Sounds', icon: '🥇', view: 'sounds', groups: FIRST, where: 'first', game: 'first', intro: 'Listen for the very first sound in a word: sun starts with sss.', tip: 'What sound does it start with?' },
  { id: 'last', name: 'Final Sounds', icon: '🏁', view: 'sounds', groups: LAST, where: 'last', game: 'last', intro: 'Listen for the very last sound in a word: cat ends with t.', tip: 'Listen to the end of the word!' },
  { id: 'middle', name: 'Medial Sounds', icon: '🎯', view: 'sounds', groups: MIDDLE, where: 'middle', game: 'middle', intro: 'The middle sound of a three-sound word is usually a vowel: c-a-t has a in the middle.', tip: 'What is in the middle? c… a… t!' },
  { id: 'oblend', name: 'Blending Phonemes', icon: '🎁', view: 'words', words: ['c-a-t', 'd-o-g', 's-u-n', 'p-i-g', 'b-e-d', 'f-i-sh', 'sh-i-p', 'm-oo-n', 'b-ee', 'g-oa-t', 'r-ai-n', 'd-u-ck', 'f-r-o-g', 'k-i-t-e', 'c-a-k-e', 'c-u-p'], oral: true, game: 'blend', intro: 'Mystery pictures! Hear the sounds without seeing letters, work out the word, then reveal the picture.', tip: 'What is in the mystery box? Listen!' },
  { id: 'oseg', name: 'Segmenting Phonemes', icon: '🔢', view: 'boxes', words: ['b-ee', 't-ie', 'c-a-t', 's-u-n', 'f-i-sh', 'sh-i-p', 'm-oo-n', 'r-ai-n', 'd-u-ck', 'f-r-o-g', 'f-l-a-g', 'd-r-u-m', 'c-r-a-b', 't-e-n-t', 'h-a-n-d', 'p-l-a-n-t'], game: 'count', intro: 'Break a spoken word into its sounds and count them: fish has three sounds, f-i-sh.', tip: 'How many sounds can you hear?' },
  { id: 'swap', name: 'Manipulating Phonemes', icon: '🔄', view: 'swap', items: SWAP, game: 'swap', intro: 'Change one sound to make a new word: cat, change c to h… hat!', tip: 'Swap a sound, make a new word!' },

  /* ----- Letter-sound correspondence ----- */
  { id: 'names', name: 'Letter Names', icon: '🔠', view: 'names', game: 'names', intro: 'Every letter has a name (bee) and a sound (b). Tap a letter to hear both, then the picture word.', tip: 'B is called bee, but it says b!' },
  { id: 'cons', name: 'Consonant Sounds', icon: '🐝', view: 'cards', items: C, starts: true, game: 'sound', intro: 'Tap a card to hear the sound and an example word.', tip: 'Every letter has its own sound. Let’s listen!' },
  { id: 'long', name: 'Long Vowels', icon: '🦄', view: 'cards', items: LV, game: 'sound', intro: 'Long vowels say their own name: a in cake, e in tree, i in kite, o in boat, u in cube.', tip: 'Long vowels say their name!' },
  { id: 'dg', name: 'Consonant Digraphs', icon: '🚂', view: 'cards', list: 'digraphs', game: 'sound', intro: 'Two letters team up to make one new sound (not a blend).', tip: 'Two letters, one new sound. Shhh!' },
  { id: 'vb', name: 'Vowel Teams', icon: '👯', view: 'cards', items: VB, game: 'sound', intro: 'Two letters that work together to make one vowel sound (also called vowel digraphs).', tip: 'These letters hold hands and make one sound.' },
  { id: 'cb', name: 'Consonant Blends', icon: '🤝', view: 'cards', items: CB, game: 'sound', intro: 'Two consonants blend together; you can still hear both sounds.', tip: 'Squish two sounds together: b… l… bl!' },
  { id: 'trig', name: 'Trigraphs', icon: '🔺', view: 'cards', items: TRIG, game: 'sound', intro: 'Three letters that make one sound: tch in witch, igh in night, air in chair.', tip: 'Three letters, one sound!' },
  { id: 'dp', name: 'Diphthongs', icon: '🎢', view: 'cards', list: 'diphthongs', game: 'sound', intro: 'Two vowel sounds glide together in one syllable.', tip: 'Your mouth slides like a slide: oi!' },
  { id: 'rc', name: 'R-Controlled Vowels', icon: '🏴‍☠️', view: 'cards', list: 'rControlled', game: 'sound', intro: 'Bossy R changes the vowel sound before it.', tip: 'Bossy R talks like a pirate. Arrr!' },
  { id: 'schwa', name: 'Schwa', icon: '😴', view: 'groups', groups: [{ big: 'ə', title: 'The lazy “uh” sound', sub: 'In a quiet part of a word, a vowel can relax and just say “uh”.', sound: 'schwa', words: ['banan«a»', 'sof«a»', 'pand«a»', 'zebr«a»', 'lem«o»n', 'penc«i»l', 'circ«u»s'] }],
    game: 'schwa', schwa: [['sofa', 'sof«a»', 's«o»fa'], ['panda', 'pand«a»', 'p«a»nda'], ['lemon', 'lem«o»n', 'l«e»mon'], ['zebra', 'zebr«a»', 'z«e»bra'], ['pencil', 'penc«i»l', 'p«e»ncil'], ['banana', 'banan«a»', 'ban«a»na'], ['circus', 'circ«u»s', 'c«i»rcus']],
    intro: 'Schwa is the most common vowel sound in English: the lazy “uh” in banana, sofa and lemon.', tip: 'Sleepy vowels just say “uh”!' },

  /* ----- Basic word patterns ----- */
  { id: 'vc', name: 'VC Words', icon: '🔡', view: 'words', words: ['a-t', 'a-n', 'a-m', 'i-n', 'i-t', 'i-f', 'u-p', 'u-s', 'o-n', 'o-x', 'a-x'], game: 'spell', intro: 'Vowel, consonant: tiny two-sound words like at, in, up. Great first words to blend.', tip: 'Just two sounds: u… p… up!' },
  { id: 'cvcc', name: 'CVCC Words', icon: '✋', view: 'words', words: ['h-a-n-d', 't-e-n-t', 'n-e-s-t', 'm-i-l-k', 'g-i-f-t', 'l-a-m-p', 'j-u-m-p', 'd-e-s-k', 'b-e-l-t', 'w-i-n-d', 'm-a-s-k', 'p-o-n-d'], game: 'spell', intro: 'Consonant, vowel, two consonants: words that end with a blend, like hand and nest.', tip: 'Listen for two sounds at the end: ha-n-d!' },
  { id: 'ccvc', name: 'CCVC Words', icon: '🐸', view: 'words', words: ['f-r-o-g', 'c-r-a-b', 'd-r-u-m', 'f-l-a-g', 's-l-e-d', 'c-l-a-p', 's-w-i-m', 's-t-o-p', 'p-l-u-g', 's-n-a-p', 't-r-i-p', 's-p-o-t'], game: 'spell', intro: 'Two consonants, vowel, consonant: words that start with a blend, like frog and drum.', tip: 'Two sounds at the start: f-r-og!' },
  { id: 'ccvcc', name: 'CCVCC Words', icon: '🪴', view: 'words', words: ['p-l-a-n-t', 's-t-a-m-p', 'c-r-u-s-t', 'f-r-o-s-t', 'b-l-e-n-d', 't-w-i-s-t', 's-p-e-n-t', 'g-r-a-n-d', 'c-l-a-m-p', 's-t-u-m-p', 't-r-u-n-k', 's-k-u-n-k'], game: 'spell', intro: 'Blends at both ends, like plant and stamp. Five sounds, still one short vowel.', tip: 'Big words with blends at both ends!' },
  { id: 'cvce', name: 'CVCe Words', icon: '🚲', view: 'words', words: ['c-a-k-e', 'b-i-k-e', 'r-o-p-e', 'c-u-b-e', 'k-i-t-e', 'b-o-n-e', 'n-o-s-e', 'r-o-s-e', 'g-a-t-e', 'f-i-v-e', 'c-o-n-e', 'l-a-k-e'], game: 'word', intro: 'Consonant, vowel, consonant, silent e: the e makes the vowel say its name, like cake and bike.', tip: 'The e is quiet, but it makes the vowel say its name!' },
  { id: 'vce', name: 'VCe Words', icon: '🦍', view: 'words', words: ['a-p-e', 'i-c-e', 'a-t-e', 'a-g-e', 'u-s-e', 'a-c-e'], game: 'spell', intro: 'Vowel, consonant, silent e: short words like ape and ice where the vowel says its name.', tip: 'a… p… e is quiet… ape!' },
  { id: 'open', name: 'Open Syllables', icon: '🚪', view: 'groups', cols: true, groups: [
    { big: '🚪', title: 'Open syllables', sub: 'The syllable ends with a vowel, so the vowel says its name.', words: ['go', 'me', 'hi', 'no', 'she', 'we', 'ba|by', 'ti|ger', 'ro|bot', 'ze|bra'] },
    { big: '🔒', title: 'Compare: closed', sub: 'A consonant closes the door, so the vowel is short.', words: ['cat', 'up', 'sun', 'rab|bit'] }], game: 'sort', sort: 'openclosed',
    intro: 'An open syllable ends with a vowel (go, me, ba-by). The door is open, so the vowel says its long name.', tip: 'Open door: the vowel shouts its name!' },
  { id: 'closed', name: 'Closed Syllables', icon: '🔒', view: 'groups', cols: true, groups: [
    { big: '🔒', title: 'Closed syllables', sub: 'A consonant closes the syllable, so the vowel is short.', words: ['cat', 'up', 'sun', 'bed', 'it', 'rab|bit', 'nap|kin', 'mag|net', 'bas|ket', 'sun|set'] },
    { big: '🚪', title: 'Compare: open', sub: 'No consonant at the end: the vowel says its name.', words: ['go', 'me', 'ti|ger'] }], game: 'sort', sort: 'openclosed',
    intro: 'A closed syllable ends with a consonant (cat, up, rab-bit). The consonant shuts the door, so the vowel stays short.', tip: 'Closed door: the vowel stays short!' },

  /* ----- Consonants ----- */
  { id: 'initial', name: 'Initial Consonants', icon: '🔤', view: 'letters', groups: FIRST, where: 'first', game: 'initial', intro: 'Match the first sound of a word to its letter: ball starts with b.', tip: 'Which letter does it start with?' },
  { id: 'final', name: 'Final Consonants', icon: '🔚', view: 'letters', groups: LAST, where: 'last', game: 'final', intro: 'Match the last sound of a word to its letter: cat ends with t.', tip: 'Which letter is at the end?' },
  { id: 'silent', name: 'Silent Consonants', icon: '🤫', view: 'groups', groups: [
    { big: 'kn', title: 'kn says n', sub: 'The k is silent.', sound: 'n', words: ['«k»nife', '«k»not', '«k»nee'] },
    { big: 'wr', title: 'wr says r', sub: 'The w is silent.', sound: 'r', words: ['«w»rite', '«w»rench', '«w»rap'] },
    { big: 'mb', title: 'mb says m', sub: 'The b is silent.', sound: 'm', words: ['lam«b»', 'thum«b»', 'com«b»', 'clim«b»'] },
    { big: 'gh · gn', title: 'gh says g, gn says n', sub: 'The h or g is silent.', words: ['g«h»ost', '«g»nome', 'si«g»n'] }],
    game: 'silent', silent: [['knife', 'k', 'n'], ['knot', 'k', 'n'], ['knee', 'k', 'n'], ['write', 'w', 'r'], ['wrench', 'w', 'r'], ['wrap', 'w', 'r'], ['lamb', 'b', 'm'], ['thumb', 'b', 'm'], ['comb', 'b', 'm'], ['climb', 'b', 'm'], ['ghost', 'h', 'g'], ['sign', 'g', 'n']],
    intro: 'Some letters are written but not heard: the k in knife, the w in write, the b in lamb.', tip: 'Shh! Some letters are silent!' },
  { id: 'softc', name: 'Hard and Soft C', icon: '🏙️', view: 'groups', cols: true, groups: [
    { big: 'c = k', title: 'Hard c', sub: 'Before a, o or u, c says k.', sound: 'k', words: ['«c»at', '«c»up', '«c»ake', '«c»ar', '«c»orn', '«c»ow'] },
    { big: 'c = s', title: 'Soft c', sub: 'Before e, i or y, c says s.', sound: 's', words: ['«c»ity', 'i«c»e', 'ri«c»e', 'mi«c»e', '«c»ircle', 'pen«c»il'] }],
    game: 'sort', sort: 'softc', intro: 'c has two sounds. Hard c says k (cat). Soft c says s when e, i or y comes next (city, ice).', tip: 'c says k in cat, but s in city!' },
  { id: 'softg', name: 'Hard and Soft G', icon: '🦒', view: 'groups', cols: true, groups: [
    { big: 'g = g', title: 'Hard g', sub: 'Usually g says g.', sound: 'g', words: ['«g»oat', '«g»ate', 'fro«g»', 'ba«g»', '«g»irl', '«g»ift'] },
    { big: 'g = j', title: 'Soft g', sub: 'Before e, i or y, g often says j.', sound: 'j', words: ['«g»iraffe', '«g»em', 'pa«g»e', 'oran«g»e', 'ma«g»ic', 'ca«g»e'] }],
    game: 'sort', sort: 'softg', intro: 'g has two sounds. Hard g says g (goat). Soft g often says j before e, i or y (giraffe, page).', tip: 'g says g in goat, but j in giraffe!' },

  /* ----- Vowels ----- */
  { id: 'magice', name: 'Silent E', icon: '✨', view: 'magic', pairs: MAGIC, game: 'magic', intro: 'Add a silent e to the end and the vowel says its name: kit becomes kite, pin becomes pine.', tip: 'Wave the magic wand: kit… kite!' },
  { id: 'combos', name: 'Vowel Combinations', icon: '🏘️', view: 'groups', groups: [
    { big: 'ā', title: 'Long a', sub: 'ai · ay · a_e · eigh', sound: 'a2', words: ['r«ai»n', 'pl«ay»', 'c«a»k«e»', '«eigh»t'] },
    { big: 'ē', title: 'Long e', sub: 'ee · ea · ey · y', sound: 'e2', words: ['b«ee»', 'l«ea»f', 'k«ey»', 'bab«y»'] },
    { big: 'ī', title: 'Long i', sub: 'igh · ie · i_e · y', sound: 'i2', words: ['n«igh»t', 'p«ie»', 'k«i»t«e»', 'fl«y»'] },
    { big: 'ō', title: 'Long o', sub: 'oa · ow · o_e · oe', sound: 'o2', words: ['b«oa»t', 'sn«ow»', 'r«o»p«e»', 't«oe»'] },
    { big: 'oo', title: 'Long oo', sub: 'oo · ue · ew · u_e', sound: 'oo', words: ['m«oo»n', 'bl«ue»', 'scr«ew»', 'fl«u»t«e»'] }],
    game: 'choose', choose: [['rain', ['rane', 'rayn']], ['play', ['plai', 'plae']], ['cake', ['caik', 'cayk']], ['leaf', ['leef', 'lefe']], ['key', ['kee', 'kea']], ['night', ['nite', 'niet']],
    ['pie', ['pigh', 'py']], ['kite', ['kight', 'kyte']], ['boat', ['bote', 'bowt']], ['snow', ['snoa', 'snoe']], ['rope', ['roap', 'rowp']], ['moon', ['mune', 'moun']], ['blue', ['bloo', 'blou']], ['flute', ['floot', 'flewt']]],
    intro: 'One sound, many spellings: long a can be ai (rain), ay (play), a_e (cake) or eigh (eight). Each long sound has its own house of spellings.', tip: 'One sound can wear lots of letter costumes!' },

  /* ----- Advanced phonics ----- */
  { id: 'stypes', name: 'Syllable Types', icon: '🧰', view: 'groups', groups: [
    { big: '🔒', title: 'Closed', sub: 'Ends with a consonant: short vowel.', words: ['cat', 'bas|ket', 'rab|bit'] },
    { big: '🚪', title: 'Open', sub: 'Ends with a vowel: long vowel.', words: ['go', 'ti|ger', 'ro|bot'] },
    { big: '✨', title: 'Magic e', sub: 'Silent e makes the vowel long.', words: ['cake', 'kite', 'cube'] },
    { big: '👯', title: 'Vowel team', sub: 'Two vowels team up.', words: ['rain', 'boat', 'tree'] },
    { big: '🏴‍☠️', title: 'Bossy R', sub: 'r changes the vowel.', words: ['car', 'bird', 'corn'] },
    { big: '🕯️', title: 'Consonant-le', sub: 'A consonant + le at the end.', words: ['ap|ple', 'can|dle', 'tur|tle'] }],
    game: 'sort', sort: 'stypes', intro: 'Every syllable is one of six types. Knowing the type tells you what the vowel will say.', tip: 'Six kinds of syllables. Can you sort them?' },
  { id: 'sdiv', name: 'Syllable Division', icon: '🔪', view: 'groups', groups: [
    { big: 'VC|CV', title: 'Between two consonants', sub: 'Split between the two consonants. The first vowel is short.', words: ['rab|bit', 'nap|kin', 'bas|ket', 'muf|fin', 'pic|nic', 'mag|net'] },
    { big: 'V|CV', title: 'After a long vowel', sub: 'Try splitting after the vowel first. It says its name.', words: ['ti|ger', 'ro|bot', 'pa|per', 'mu|sic', 'ba|by'] },
    { big: 'VC|V', title: 'After a consonant', sub: 'If the long vowel sounds wrong, split after the consonant.', words: ['cab|in', 'lem|on', 'sev|en', 'wag|on'] },
    { big: 'C+le', title: 'Consonant + le', sub: 'Keep the consonant with le.', words: ['ta|ble', 'can|dle', 'tur|tle', 'ap|ple'] }],
    game: 'split', split: ['rab|bit', 'nap|kin', 'bas|ket', 'muf|fin', 'mag|net', 'ti|ger', 'ro|bot', 'pa|per', 'cab|in', 'lem|on', 'ta|ble', 'can|dle', 'tur|tle', 'sun|set', 'pic|nic'],
    intro: 'Long words are easier in chunks. These rules show where to split a word into syllables.', tip: 'Chop big words into small pieces!' },
  { id: 'multi', name: 'Multisyllabic Words', icon: '🦋', view: 'clap', sets: [['Two parts', ['pump-kin', 'sun-set', 'cup-cake', 'rain-bow', 'pop-corn', 'bas-ket']], ['Three or more', ['but-ter-fly', 'di-no-saur', 'ham-bur-ger', 'el-e-phant', 'kan-ga-roo', 'wa-ter-mel-on', 'hel-i-cop-ter']]], game: 'multi', intro: 'Read long words one chunk at a time, then put the chunks together: pump… kin… pumpkin!', tip: 'Read one chunk at a time!' },
  { id: 'prefix', name: 'Prefixes', icon: '⬅️', view: 'builder', rows: PREFIX, game: 'meaning', meaning: [['unhappy', 'not happy', ['happy again', 'very happy']], ['unlock', 'open the lock', ['lock it again', 'lock it before']], ['replay', 'play again', ['not play', 'play before']],
    ['refill', 'fill again', ['not full', 'fill before']], ['dislike', 'not like', ['like again', 'like a lot']], ['preheat', 'heat before', ['not hot', 'heat again']], ['untie', 'undo the knot', ['tie again', 'tie before']], ['redo', 'do again', ['not do', 'do before']]],
    intro: 'A prefix goes at the start of a word and changes its meaning: un means not, re means again.', tip: 'Add a piece to the front: un + happy!' },
  { id: 'suffix', name: 'Suffixes', icon: '➡️', view: 'builder', rows: SUFFIX, game: 'meaning', meaning: [['farmer', 'a person who farms', ['a big farm', 'farming now']], ['helpful', 'full of help', ['without help', 'help again']], ['fearless', 'without fear', ['full of fear', 'fear again']],
    ['slowly', 'in a slow way', ['the most slow', 'not slow']], ['biggest', 'the most big', ['a bit big', 'not big']], ['teacher', 'a person who teaches', ['a school', 'teaching again']], ['playful', 'full of play', ['without play', 'play again']], ['painter', 'a person who paints', ['paint again', 'a pot of paint']]],
    intro: 'A suffix goes at the end of a word: -er (farmer), -ful (helpful), -less (fearless), -ly (slowly), -est (biggest).', tip: 'Add a piece to the end: help + ful!' },
  { id: 'inflect', name: 'Inflectional Endings', icon: '🏷️', view: 'builder', rows: INFLECT, game: 'inflect', intro: 'Endings that change number or time: -s and -es (cats, boxes), -ing (jumping) and -ed (jumped).', tip: 'One cat, two cats!' },
  { id: 'morph', name: 'Morphology', icon: '🧱', view: 'builder', rows: COMPOUND.map(([a, b, w]) => [[a, b], w]), sums: WORD_SUMS, game: 'compound', intro: 'Morphology is the study of word parts. Small words join into compound words (sun + flower), and parts like un-, re-, -ful and -ing build new words.', tip: 'Sun + flower = sunflower!' },
  { id: 'sight', name: 'Irregular & High-Frequency Words', icon: '❤️', view: 'sight', words: SIGHT, game: 'sight', intro: 'Words we read all the time. The highlighted part does not follow the usual rules, so we learn it “by heart”.', tip: 'Learn the tricky part by heart!' },
  { id: 'advspell', name: 'Advanced Spelling Patterns', icon: '🎓', view: 'groups', groups: [
    { big: 'tch · ch', title: 'tch or ch?', sub: 'After a short vowel use tch (catch). Otherwise ch (lunch, chin).', sound: 'ch', words: ['ca«tch»', 'wi«tch»', 'lun«ch»', '«ch»in'] },
    { big: 'dge · ge', title: 'dge or ge?', sub: 'After a short vowel use dge (badge). Otherwise ge (cage).', sound: 'j', words: ['ba«dge»', 'bri«dge»', 'ca«ge»', 'pa«ge»'] },
    { big: 'ai · ay', title: 'ai or ay?', sub: 'ai in the middle (rain), ay at the end (play).', sound: 'a2', words: ['r«ai»n', 'sn«ai»l', 'pl«ay»', 'd«ay»'] },
    { big: 'oi · oy', title: 'oi or oy?', sub: 'oi in the middle (coin), oy at the end (boy).', sound: 'oi', words: ['c«oi»n', '«oi»l', 'b«oy»', 't«oy»'] },
    { big: 'ph', title: 'ph says f', sub: 'Often in longer words from Greek.', sound: 'f', words: ['«ph»one', 'dol«ph»in', 'ele«ph»ant', '«ph»oto'] },
    { big: 'y', title: 'y at the end', sub: 'Says ī in short words (fly), ē in longer words (baby).', words: ['fl«y»', 'cr«y»', 'bab«y»', 'cand«y»'] },
    { big: 'tion', title: 'tion says shun', sub: 'A very common word ending.', words: ['sta«tion»', 'lo«tion»', 'ac«tion»'] }],
    game: 'choose', choose: [['catch', ['cach', 'katch']], ['witch', ['wich', 'whitch']], ['badge', ['baj', 'bage']], ['bridge', ['brij', 'brige']], ['snail', ['snayl', 'snale']], ['play', ['plai', 'plae']], ['coin', ['coyn', 'koin']],
    ['boy', ['boi', 'boye']], ['phone', ['fone', 'phon']], ['dolphin', ['dolfin', 'dolphen']], ['fly', ['fli', 'flie']], ['baby', ['babee', 'babie']], ['station', ['stashun', 'stasion']]],
    intro: 'Spelling choices that depend on position and the vowel before: tch/ch, dge/ge, ai/ay, oi/oy, plus ph, y and tion.', tip: 'Which spelling looks right?' },

  /* ----- Reading application ----- */
  { id: 'blend', name: 'Blending', icon: '🧩', view: 'words', words: WB, custom: true, game: 'blend', intro: 'Listen to each sound, then hear them blend into a word.', tip: 'Listen to the sounds, then say the word!' },
  { id: 'segment', name: 'Segmenting', icon: '🟦', view: 'boxes', words: SOUNDS_WORDS, letters: true, game: 'count', intro: 'Count sounds, not letters: ship has 4 letters but 3 sounds (sh-i-p). Each box holds one sound.', tip: 'Sounds, not letters! sh is one sound.' },
  { id: 'decode', name: 'Decoding', icon: '🔎', view: 'words', words: MIXED, steps: true, game: 'word', intro: 'Decoding is reading a new word by its sounds: look, say each sound, blend, then check it makes sense.', tip: 'Look, say, blend, check!' },
  { id: 'encode', name: 'Encoding & Spelling', icon: '🖍️', view: 'dictation', words: MIXED.slice(0, 14), game: 'spell', intro: 'Encoding is spelling by sound: say the word slowly, hear each sound, and write the letters for it.', tip: 'Say it slowly, then spell each sound!' },
  { id: 'wordread', name: 'Word Reading', icon: '⚡', view: 'flash', words: MIXED, game: 'word', intro: 'Quick word practice: read the word, then tap to check. Words you can read instantly free up your brain for meaning.', tip: 'Read it, then check it!' },
  { id: 'sentread', name: 'Sentence Reading', icon: '💬', view: 'sentences', sentences: READ_SENT, game: 'sentence', intro: 'Sentences that mix everything: blends, digraphs, long vowels and bossy R.', tip: 'Read the whole sentence!' },
  { id: 'texts', name: 'Decodable Texts', icon: '📚', view: 'stories', stories: STORIES, game: 'story', intro: 'Short stories made from sounds children have learned. Tap any word to hear it, or listen to the whole story.', tip: 'Read a little story!' },
  { id: 'fluency', name: 'Fluency Practice', icon: '⏱️', view: 'fluency', passages: PASSAGES, intro: 'Fluency is reading smoothly, at a comfortable speed, with expression. Listen, echo, then time yourself and beat your best.', tip: 'Listen, echo, then read it yourself!' }
];
const TOPIC = Object.fromEntries(TOPICS.map(t => [t.id, t]));
/* curriculum.js datasets -> card items */
TOPICS.filter(t => t.list).forEach(t => { t.items = CURRICULUM[t.list].map(d => ({ s: d.grapheme, k: d.audio, ipa: d.ipa, fb: d.grapheme, ex: d.examples, hint: d.hint, sentences: d.sentences })) });

/* alias = the name a shared topic has in that group. */
const GROUPS = [
  { id: 'sv', name: 'Short Vowels', icon: '🍎', age: '4+', kid: 'a, e, i, o, u', topics: ['short', 'cvc', 'families', 'pairs', 'svblend', 'svseg', 'dictation', 'svsent', 'svmix', 'svspell'] },
  { id: 'pa', name: 'Phonemic Awareness', icon: '👂', age: '3+', kid: 'Sound play: just listen!', topics: ['listen', 'rhyme', 'syll', 'onset', 'first', 'last', 'middle', 'oblend', 'oseg', 'swap'] },
  { id: 'ls', name: 'Letter-Sound Correspondence', icon: '🔤', age: '4+', kid: 'Letters and their sounds', topics: ['names', 'cons', 'short', 'long', 'dg', 'vb', 'cb', 'trig', 'dp', 'rc', 'schwa'], alias: { vb: 'Vowel Digraphs' } },
  { id: 'wp', name: 'Basic Word Patterns', icon: '🧱', age: '4+', kid: 'Build words', topics: ['vc', 'cvc', 'cvcc', 'ccvc', 'ccvcc', 'cvce', 'vce', 'open', 'closed'], alias: { cvc: 'CVC' } },
  { id: 'co', name: 'Consonants', icon: '🐝', age: '4+', kid: 'Consonant power', topics: ['cons', 'initial', 'final', 'cb', 'dg', 'trig', 'silent', 'softc', 'softg'], alias: { cons: 'Single Consonant Sounds' } },
  { id: 'vo', name: 'Vowels', icon: '🌈', age: '5+', kid: 'Vowel magic', topics: ['short', 'long', 'magice', 'vb', 'dp', 'rc', 'schwa', 'combos'] },
  { id: 'adv', name: 'Advanced Phonics', icon: '🚀', age: '6+', kid: 'Big words', topics: ['stypes', 'sdiv', 'multi', 'prefix', 'suffix', 'inflect', 'morph', 'sight', 'advspell'] },
  { id: 'ra', name: 'Reading Application', icon: '📖', age: '4+', kid: 'Let’s read!', topics: ['blend', 'segment', 'decode', 'encode', 'wordread', 'sentread', 'texts', 'fluency'] }
];
