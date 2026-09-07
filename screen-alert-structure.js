(()=>{
'use strict';
const host=document.getElementById('alertStructure');
const A=window.StackupAlertAudio;
if(!host||!A)return;
const KEY='stackupAlertMomentAssignmentsV1';
const MOMENTS=[
 ['levelStart','INÍCIO DOS NÍVEIS'],
 ['fiveMinutes','5 MINUTOS'],
 ['threeMinutes','3 MINUTOS'],
 ['oneMinute','1 MINUTO'],
 ['itmBubble','BOLHA DA PREMIAÇÃO'],
 ['itm','TODOS NO DINHEIRO'],
 ['ftBubble','BOLHA DA MESA FINAL']
];
let opened='';
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return{}}}
function save(v){localStorage.setItem(KEY,JSON.stringify(v));window.dispatchEvent(new CustomEvent('stackup-alert-moment-change',{detail:v}))}
function choose(moment,preset){const v=load();v[moment]=preset;save(v);opened='';render()}
function alertName(id){return (A.PRESETS.find(p=>p[0]===id)||[])[1]||''}
function render(){const cfg=load();host.innerHTML=MOMENTS.map(([id,label])=>{const chosen=cfg[id]||'';return `<div class="momentCard"><div class="momentTitle">${label}</div><button type="button" class="selectMomentAlert ${chosen?'active':''}" data-open="${id}">${chosen?alertName(chosen):'SELECIONAR ALERTA'}</button>${opened===id?`<div class="momentAlertList">${A.PRESETS.map(p=>`<button type="button" class="momentAlert ${chosen===p[0]?'selected':''}" data-moment="${id}" data-preset="${p[0]}">${p[1]}</button>`).join('')}</div>`:''}</div>`}).join('');host.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{opened=opened===b.dataset.open?'':b.dataset.open;render()});host.querySelectorAll('[data-moment][data-preset]').forEach(b=>b.onclick=()=>choose(b.dataset.moment,b.dataset.preset))}
const style=document.createElement('style');style.textContent=`#alertStructure{display:grid;gap:10px}.momentCard{border:1px solid #27342D;border-radius:12px;background:linear-gradient(#0B100D,#060907);padding:14px;display:grid;gap:9px}.momentTitle{font-size:16px!important;color:#fff}.selectMomentAlert{width:100%!important}.selectMomentAlert.active{border-color:#8DFC3B!important;color:#8DFC3B!important}.momentAlertList{display:grid;gap:7px}.momentAlert{width:100%!important;text-align:left!important}.momentAlert.selected{background:#8DFC3B!important;color:#020302!important;border-color:#8DFC3B!important}`;document.head.appendChild(style);render();
})();