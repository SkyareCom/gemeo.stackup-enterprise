(()=>{
'use strict';
const host=document.getElementById('alertStructure');
const A=window.StackupAlertAudio;
if(!host||!A)return;
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function render(){
 const cfg=A.load();
 host.innerHTML=`
   <div class="soundPresetList">
     ${A.PRESETS.map(p=>`<button type="button" class="soundPreset ${cfg.preset===p[0]?'selected':''}" data-preset="${p[0]}">${p[1]}</button>`).join('')}
   </div>
   <label class="soundControl"><span>PITCH</span><input id="soundPitch" type="range" min="-24" max="24" step="1" value="${clamp(+cfg.pitch||0,-24,24)}"><strong id="soundPitchValue">${clamp(+cfg.pitch||0,-24,24)}</strong></label>
   <label class="soundControl"><span>REPETIÇÕES</span><select id="soundRepeats">${[1,2,3,4,5,6,7,8].map(n=>`<option value="${n}" ${(+cfg.repeats||1)===n?'selected':''}>${n}</option>`).join('')}</select></label>`;
 host.querySelectorAll('[data-preset]').forEach(btn=>btn.onclick=()=>{const next=A.load();next.preset=btn.dataset.preset;A.save(next);render()});
 const pitch=host.querySelector('#soundPitch'),pitchValue=host.querySelector('#soundPitchValue'),repeats=host.querySelector('#soundRepeats');
 pitch.oninput=()=>{pitchValue.textContent=pitch.value};
 pitch.onchange=()=>{const next=A.load();next.pitch=clamp(+pitch.value||0,-24,24);A.save(next)};
 repeats.onchange=()=>{const next=A.load();next.repeats=clamp(+repeats.value||1,1,8);A.save(next)};
}
const style=document.createElement('style');
style.textContent=`#alertStructure{display:grid;gap:14px}.soundPresetList{display:grid;gap:7px}.soundPreset{width:100%!important;text-align:left!important}.soundPreset.selected{background:#8DFC3B!important;color:#020302!important;border-color:#8DFC3B!important}.soundControl{display:grid;grid-template-columns:140px minmax(0,1fr) auto;gap:10px;align-items:center}.soundControl input,.soundControl select{width:100%!important}.soundControl strong{min-width:28px;text-align:right}@media(max-width:600px){.soundControl{grid-template-columns:1fr}.soundControl strong{text-align:left}}`;
document.head.appendChild(style);
render();
})();