/* Environment detection: decides which voice features are safe to offer. Loaded before speech.js. */
const ENV=(()=>{
 const h=location.hostname,file=location.protocol==='file:';
 const local=file||/^(localhost|127(\.\d+){3}|\[::1\]|0\.0\.0\.0)$/.test(h)||h.endsWith('.local');
 const pages=/\.github\.io$/i.test(h);
 const mem=navigator.deviceMemory||4,cores=navigator.hardwareConcurrency||2;
 const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(!!window.matchMedia&&matchMedia('(pointer:coarse)').matches&&innerWidth<820);
 const wasm=typeof WebAssembly==='object',secure=window.isSecureContext===true;
 const canNeural=wasm&&secure&&!file;              /* model download + cache need an http(s) secure context */
 const tier=!canNeural?'browser':(mobile||mem<4)?'light':'standard';
 return{isFile:file,isLocal:local,isPublic:!local,isGitHubPages:pages,secure,wasm,mobile,mem,cores,
  isolated:window.crossOriginIsolated===true,                     /* true only if the host sends COOP/COEP headers (GitHub Pages does not) */
  tier,                                                           /* browser | light | standard */
  defaultEngine:tier==='browser'?'browser':tier==='light'?'piper':'kokoro',
  FEATURES:{neuralTTS:canNeural,diagnostics:local,threadedWasm:window.crossOriginIsolated===true,modelCache:'caches' in window||'storage' in navigator},
  reason:file?'Open through Live Server or GitHub Pages (not file://) to use the natural voice.':!secure?'Natural voice needs HTTPS.':!wasm?'This browser has no WebAssembly.':''};
})();
if(ENV.FEATURES.diagnostics)console.info('[PhonicsPal] environment',ENV);
