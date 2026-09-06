(function(){
'use strict';
const KEY='stackupScreenAlertAudio';
const PRESETS=[
 ['airport','AEROPORTO • 2 TONS',[[660,.18],[880,.42]]],
 ['singleTone','1 TOM • REPETIÇÃO',[[740,.22],[0,.14],[740,.22],[0,.14],[740,.32]]],
 ['analog','DESPERTADOR • ANALÓGICO',[[1700,.09],[1250,.09],[1700,.09],[1250,.22]]],
 ['digital','DESPERTADOR • DIGITAL',[[980,.12],[0,.06],[980,.12],[0,.06],[980,.22]]],
 ['double','ALARME • DUPLO',[[740,.18],[0,.08],[740,.28]]],
 ['triple','ALARME • TRIPLO',[[820,.1],[0,.07],[820,.1],[0,.07],[820,.24]]],
 ['low','ALARME • GRAVE',[[220,.22],[330,.22],[220,.35]]],
 ['high','ALARME • AGUDO',[[1320,.12],[1760,.12],[1320,.25]]],
 ['pulse','ALARME • PULSO',[[440,.1],[660,.1],[880,.1],[660,.1],[440,.3]]],
 ['attention','ATENÇÃO • ASCENDENTE',[[392,.12],[523,.12],[659,.12],[784,.32]]]
];
const defaults={preset:'airport',pitch:0,repeats:1,bass:0,treble:0,volume:70};
let ctx=null,active=[];
function load(){try{const saved=Object.assign({},defaults,JSON.parse(localStorage.getItem(KEY)||'{}'));if(saved.preset==='airportSoft')saved.preset='singleTone';return saved}catch(_){return {...defaults}}}
function save(v){localStorage.setItem(KEY,JSON.stringify(v));window.dispatchEvent(new CustomEvent('stackup-alert-audio-change',{detail:v}))}
function stop(){active.forEach(n=>{try{n.stop?.()}catch(_){}});active=[]}
function context(){ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();return ctx}
function play(settings){const s=Object.assign(load(),settings||{}),p=PRESETS.find(x=>x[0]===s.preset)||PRESETS[0],c=context();stop();if(c.state==='suspended')c.resume();let t=c.currentTime+.03;const semitone=Math.pow(2,(+s.pitch||0)/12),reps=Math.max(1,Math.min(8,+s.repeats||1));for(let r=0;r<reps;r++){for(const [hz,dur] of p[2]){if(!hz){t+=dur;continue}const osc=c.createOscillator(),gain=c.createGain(),low=c.createBiquadFilter(),high=c.createBiquadFilter();osc.type=p[0].includes('analog')?'square':p[0].includes('low')?'triangle':'sine';osc.frequency.value=hz*semitone;low.type='lowshelf';low.frequency.value=250;low.gain.value=+s.bass||0;high.type='highshelf';high.frequency.value=2200;high.gain.value=+s.treble||0;const vol=Math.max(0,Math.min(100,+s.volume||0))/100;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,vol*.32),t+.012);gain.gain.setValueAtTime(Math.max(.0001,vol*.32),Math.max(t+.013,t+dur-.035));gain.gain.exponentialRampToValueAtTime(.0001,t+dur);osc.connect(low).connect(high).connect(gain).connect(c.destination);osc.start(t);osc.stop(t+dur+.02);active.push(osc);t+=dur}t+=.18}}
window.StackupAlertAudio={PRESETS,defaults,load,save,play,stop};
})();