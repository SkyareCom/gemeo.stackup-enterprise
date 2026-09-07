(()=>{
'use strict';
const host=document.getElementById('alertStructure');
const A=window.StackupAlertAudio;
if(!host||!A)return;
function render(){
 const cfg=A.load();
 host.innerHTML=`<div class="soundPresetList">${A.PRESETS.map(p=>`<button type="button" class="soundPresetName ${cfg.preset===p[0]?'selected':''}" data-preset="${p[0]}">${p[1]}</button>`).join('')}</div>`;
 host.querySelectorAll('[data-preset]').forEach(btn=>btn.onclick=()=>{
   const next=A.load();
   next.preset=btn.dataset.preset;
   A.save(next);
   A.play(next);
   render();
 });
}
const style=document.createElement('style');
style.textContent=`#alertStructure{display:block}.soundPresetList{display:grid;gap:7px}.soundPresetName{width:100%!important;box-sizing:border-box;text-align:left!important;padding:10px 12px!important}.soundPresetName.selected{background:#8DFC3B!important;color:#020302!important;border-color:#8DFC3B!important}`;
document.head.appendChild(style);
render();
})();