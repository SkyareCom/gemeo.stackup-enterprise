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
 ['returnActivities','RETORNO DAS ATIVIDADES'],
 ['itmBubble','BOLHA DA PREMIAÇÃO'],
 ['itm','TODOS NO DINHEIRO'],
 ['ftBubble','BOLHA DA MESA FINAL']
];
let opened='';
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return{}}}
function save(v){localStorage.setItem(KEY,JSON.stringify(v));window.dispatchEvent(new CustomEvent('stackup-alert-moment-change',{detail:v}))}
function choose(moment,preset){const v=load();v[moment]=preset;save(v);opened='';render()}
function alertName(id){return (A.PRESETS.find(p=>p[0]===id)||[])[1]||''}
function render(){const cfg=load();host.innerHTML=MOMENTS.map(([id,label])=>{const chosen=cfg[id]||'';return `<section class="momentSection"><div class="momentTitle">${label}</div><button type="button" class="selectMomentAlert ${chosen?'active':''}" data-open="${id}">${chosen?alertName(chosen):'SELECIONAR ALERTA'}</button>${opened===id?`<div class="momentAlertList">${A.PRESETS.map(p=>`<button type="button" class="momentAlert ${chosen===p[0]?'selected':''}" data-moment="${id}" data-preset="${p[0]}">${p[1]}</button>`).join('')}</div>`:''}</section>`}).join('');host.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{opened=opened===b.dataset.open?'':b.dataset.open;render()});host.querySelectorAll('[data-moment][data-preset]').forEach(b=>b.onclick=()=>choose(b.dataset.moment,b.dataset.preset))}
const style=document.createElement('style');style.textContent=`#alertStructure{display:grid;gap:20px}.momentSection{display:block!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}.momentTitle{font-size:16px!important;color:#fff;margin:0 0 8px!important;padding:0!important;border:0!important;background:none!important}.selectMomentAlert{width:100%!important;display:block!important}.selectMomentAlert.active{border-color:#8DFC3B!important;color:#8DFC3B!important}.momentAlertList{display:grid;gap:7px;margin-top:8px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}.momentAlert{width:100%!important;text-align:left!important}.momentAlert.selected{background:#8DFC3B!important;color:#020302!important;border-color:#8DFC3B!important}`;document.head.appendChild(style);render();
})();