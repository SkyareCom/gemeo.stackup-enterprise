(()=>{
'use strict';
const host=document.getElementById('alertStructure');
const A=window.StackupAlertAudio;
const M=window.StackupScreenMessages;
if(!host||!A)return;
let alertsOpen=false;
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function alertEnabled(){return M?M.load().soundBeforeVoice!==false:true}
function setAlertEnabled(on){if(!M)return;const c=M.load();c.soundBeforeVoice=!!on;M.save(c)}
function render(){
 const cfg=A.load();
 const enabled=alertEnabled();
 host.innerHTML=`
   <button type="button" id="toggleAlertList" class="selectAlertsButton">SELECIONAR ALERTAS</button>
   <div class="alertConfigPanel ${alertsOpen?'open':''}">
     <div class="soundPresetList">${A.PRESETS.map(p=>`<button type="button" class="soundPresetName ${cfg.preset===p[0]?'selected':''}" data-preset="${p[0]}">${p[1]}</button>`).join('')}</div>
     <label class="soundControl"><span>PITCH</span><input id="soundPitch" type="range" min="-24" max="24" step="1" value="${clamp(+cfg.pitch||0,-24,24)}"><strong id="soundPitchValue">${clamp(+cfg.pitch||0,-24,24)}</strong></label>
     <label class="soundControl"><span>REPETIÇÕES</span><select id="soundRepeats">${[1,2,3,4,5,6,7,8].map(n=>`<option value="${n}" ${(+cfg.repeats||1)===n?'selected':''}>${n}</option>`).join('')}</select></label>
   </div>
   <button type="button" id="toggleAlertActive" class="alertActiveButton ${enabled?'active':''}">${enabled?'DESATIVAR ALERTA':'ATIVAR ALERTA'}</button>
   <div class="alertVoiceNote ${enabled?'active':''}">${enabled?'ALERTA ATIVADO ANTES DE MENSAGENS POR VOZ':'ALERTA DESATIVADO'}</div>`;
 host.querySelector('#toggleAlertList').onclick=()=>{alertsOpen=!alertsOpen;render()};
 host.querySelector('#toggleAlertActive').onclick=()=>{setAlertEnabled(!alertEnabled());render()};
 host.querySelectorAll('[data-preset]').forEach(btn=>btn.onclick=()=>{
   const next=A.load();next.preset=btn.dataset.preset;A.save(next);A.play(next);render();
 });
 const pitch=host.querySelector('#soundPitch');
 const pitchValue=host.querySelector('#soundPitchValue');
 const repeats=host.querySelector('#soundRepeats');
 if(pitch){
   pitch.oninput=()=>{pitchValue.textContent=pitch.value};
   pitch.onchange=()=>{const next=A.load();next.pitch=clamp(+pitch.value||0,-24,24);A.save(next)};
 }
 if(repeats)repeats.onchange=()=>{const next=A.load();next.repeats=clamp(+repeats.value||1,1,8);A.save(next)};
}
const style=document.createElement('style');
style.textContent=`#alertStructure{display:grid;gap:14px}.selectAlertsButton,.alertActiveButton{width:100%!important;text-align:left!important;padding:10px 12px!important}.alertConfigPanel{display:none;gap:14px}.alertConfigPanel.open{display:grid}.soundPresetList{display:grid;gap:7px}.soundPresetName{width:100%!important;box-sizing:border-box;text-align:left!important;padding:10px 12px!important}.soundPresetName.selected,.alertActiveButton.active{background:#8DFC3B!important;color:#020302!important;border-color:#8DFC3B!important}.alertVoiceNote{font-size:14px!important;color:#AEB8B1!important;padding:0 2px!important}.alertVoiceNote.active{color:#8DFC3B!important}.soundControl{display:grid;grid-template-columns:140px minmax(0,1fr) auto;gap:10px;align-items:center}.soundControl input,.soundControl select{width:100%!important}#soundPitch{-webkit-appearance:none!important;appearance:none!important;height:6px!important;border-radius:999px!important;background:#27342D!important;accent-color:#8DFC3B!important;outline:none!important}#soundPitch::-webkit-slider-runnable-track{height:6px!important;border-radius:999px!important;background:#27342D!important}#soundPitch::-webkit-slider-thumb{-webkit-appearance:none!important;appearance:none!important;width:18px!important;height:18px!important;border-radius:50%!important;background:#8DFC3B!important;border:2px solid #020302!important;margin-top:-6px!important;box-shadow:0 0 0 1px #8DFC3B!important}#soundPitch::-moz-range-track{height:6px!important;border-radius:999px!important;background:#27342D!important}#soundPitch::-moz-range-progress{height:6px!important;border-radius:999px!important;background:#8DFC3B!important}#soundPitch::-moz-range-thumb{width:18px!important;height:18px!important;border-radius:50%!important;background:#8DFC3B!important;border:2px solid #020302!important;box-shadow:0 0 0 1px #8DFC3B!important}.soundControl strong{min-width:28px;text-align:right}@media(max-width:600px){.soundControl{grid-template-columns:1fr}.soundControl strong{text-align:left}}`;
document.head.appendChild(style);
render();
})();