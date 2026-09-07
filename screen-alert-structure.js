(()=>{
'use strict';
const host=document.getElementById('alertStructure');
const A=window.StackupAlertAudio;
if(!host||!A)return;
function render(){
 host.innerHTML=`<div class="soundPresetList">${A.PRESETS.map(p=>`<div class="soundPresetName">${p[1]}</div>`).join('')}</div>`;
}
const style=document.createElement('style');
style.textContent=`#alertStructure{display:block}.soundPresetList{display:grid;gap:7px}.soundPresetName{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #27342D;border-radius:7px;background:#020302;color:#fff}`;
document.head.appendChild(style);
render();
})();