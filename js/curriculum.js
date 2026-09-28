/* Curriculum datasets: digraphs, r-controlled vowels, diphthongs.
   id: unique key | grapheme: letters shown | type: sound category | ipa: reference pronunciation
   audio: file id in assets/audio/s_<audio>.mp3 | examples: words (assets/audio/w_<word>.mp3)
   sentences: practice lines; «…» marks the target grapheme (see parseMarked) */
const CURRICULUM={
 digraphs:[
  {id:'dg-ch',grapheme:'ch',type:'consonant-digraph',ipa:'ʧ',audio:'ch',hint:'Two letters, one sound: like a train, ch-ch-ch.',examples:['chip','chin','chop','lunch'],sentences:['The «ch»ip is on the «ch»in.','I «ch»op the lun«ch».']},
  {id:'dg-sh',grapheme:'sh',type:'consonant-digraph',ipa:'ʃ',audio:'sh',hint:'Quiet sound: shhh.',examples:['ship','shop','fish','wish'],sentences:['The «sh»ip is at the «sh»op.','I wi«sh» for a fi«sh».']},
  {id:'dg-th',grapheme:'th',type:'consonant-digraph',ipa:'θ',audio:'th',hint:'Put your tongue between your teeth. Voiced in "this".',examples:['thin','thumb','bath','this'],sentences:['The «th»umb is «th»in.','I take a ba«th» in «th»is tub.']},
  {id:'dg-wh',grapheme:'wh',type:'consonant-digraph',ipa:'w',audio:'wh',hint:'Sounds like w. Used in question words.',examples:['whale','wheel','white','when'],sentences:['«Wh»en will the «wh»ale swim?','The «wh»eel is «wh»ite.']},
  {id:'dg-ck',grapheme:'ck',type:'consonant-digraph',ipa:'k',audio:'k',hint:'Comes at the end of a short-vowel word: k.',examples:['duck','clock','sock','back'],sentences:['The du«ck» is on the clo«ck».','My so«ck» is ba«ck».']}],
 rControlled:[
  {id:'rc-ar',grapheme:'ar',type:'r-controlled',ipa:'ɑɹ',audio:'ar',hint:'Bossy R: "ar" says ar, like a pirate.',examples:['car','star','farm','park'],sentences:['The c«ar» is at the f«ar»m.','A st«ar» is over the p«ar»k.']},
  {id:'rc-er',grapheme:'er',type:'r-controlled',ipa:'ɜɹ',audio:'er',hint:'Bossy R: "er" says er.',examples:['her','fern','teacher','sister'],sentences:['H«er» sist«er» has a f«er»n.','The teach«er» is kind.']},
  {id:'rc-ir',grapheme:'ir',type:'r-controlled',ipa:'ɜɹ',audio:'ir',hint:'Bossy R: "ir" says er too.',examples:['bird','girl','shirt','stir'],sentences:['The b«ir»d and the g«ir»l are here.','I st«ir» in my sh«ir»t.']},
  {id:'rc-or',grapheme:'or',type:'r-controlled',ipa:'ɔɹ',audio:'or',hint:'Bossy R: "or" says or.',examples:['corn','fork','horse','storm'],sentences:['The h«or»se ran in the st«or»m.','A c«or»n is on the f«or»k.']},
  {id:'rc-ur',grapheme:'ur',type:'r-controlled',ipa:'ɜɹ',audio:'ur',hint:'Bossy R: "ur" says er as well.',examples:['turn','burn','nurse','purple'],sentences:['The n«ur»se will t«ur»n.','The p«ur»ple hat can b«ur»n.']}],
 diphthongs:[
  {id:'dp-oi',grapheme:'oi',type:'diphthong',ipa:'ɔɪ',audio:'oi',hint:'Two vowel sounds glide together: oi.',examples:['coin','oil','soil','boil'],sentences:['The c«oi»n is in the s«oi»l.','The «oi»l will b«oi»l.']},
  {id:'dp-oy',grapheme:'oy',type:'diphthong',ipa:'ɔɪ',audio:'oi',hint:'Same sound as oi, used at the end of words.',examples:['boy','toy','joy','enjoy'],sentences:['The b«oy» has a t«oy».','I enj«oy» the j«oy».']},
  {id:'dp-ou',grapheme:'ou',type:'diphthong',ipa:'aʊ',audio:'ou',hint:'Say ow, like when something hurts.',examples:['cloud','house','mouse','out'],sentences:['The m«ou»se is in the h«ou»se.','A cl«ou»d is «ou»t.']},
  {id:'dp-ow',grapheme:'ow',type:'diphthong',ipa:'aʊ',audio:'ou',hint:'Same sound as ou, used at the end of words.',examples:['cow','now','down','brown'],sentences:['The c«ow» is br«ow»n.','The c«ow» went d«ow»n n«ow».']}]
};
/* "The «sh»ip" -> [{t:'The ',hit:false},{t:'sh',hit:true},{t:'ip',hit:false}] */
const parseMarked=s=>s.split(/(«[^»]*»)/).filter(Boolean).map(p=>p[0]==='«'?{t:p.slice(1,-1),hit:true}:{t:p,hit:false});
const plainText=s=>s.replace(/[«»]/g,'');
