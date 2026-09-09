(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='control.html')return;
function tx(){return (state.transactions||[]).filter(t=>t.eventId===state.eventId&&t.status!=='cancelled'&&t.status!=='void')}
function hasItem(t,code){return t.itemCode===code||t.payment?.reference===code}
function countAddonBonus(){return tx().filter(t=>hasItem(t,'ADDON_BONUS')||t.type==='ADDON_BONUS').length}
function install(){
  const status=document.getElementById('status');
  const bonus=document.getElementById('miniBonus');
  if(bonus){const label=bonus.closest('.infoCard')?.querySelector('.infoLabel');if(label)label.textContent='EARLY BONUS';}
  if(!document.getElementById('miniAddonBonus')){
    const a2=document.getElementById('miniAddon2')?.closest('.infoCard');
    if(a2){const card=document.createElement('div');card.className='infoCard';card.innerHTML='<span class="infoLabel">ADD ON BONUS</span><span id="miniAddonBonus" class="infoValue">0</span>';a2.insertAdjacentElement('afterend',card)}
  }
  if(status)status.textContent='ATIVO';
}
function render(){
  install();
  const status=document.getElementById('status');if(status)status.textContent='ATIVO';
  const addon=document.getElementById('miniAddonBonus');if(addon)addon.textContent=countAddonBonus();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{render();setInterval(render,250)},{once:true});else{render();setInterval(render,250)}
const prev=window.onPokerStateChange;window.onPokerStateChange=s=>{if(typeof prev==='function')prev(s);render()};
})();