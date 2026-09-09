(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='control.html')return;
const $=id=>document.getElementById(id);
const n=v=>Math.max(0,+v||0);
const money=v=>'R$ '+n(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const item=t=>String(t?.itemCode||t?.payment?.reference||'').toUpperCase();
const tx=()=>Array.isArray(state.transactions)?state.transactions.filter(t=>t.eventId===state.eventId&&t.status!=='cancelled'&&t.status!=='void'):[];
function qtyOf(t){return Math.max(1,+t.quantity||1)}
function unitValue(t){if(Number.isFinite(+t.value)&&+t.value>0)return +t.value;const p=t.payment||{};if(Number.isFinite(+p.amount)&&+p.amount>0)return +p.amount;if(Number.isFinite(+p.totalAmount)&&+p.totalAmount>0)return +p.totalAmount;return 0}
function totalValue(t){const q=qtyOf(t);const p=t.payment||{};if(Number.isFinite(+p.totalAmount)&&+p.totalAmount>0)return +p.totalAmount;if(Number.isFinite(+t.value)&&+t.value>0)return (+t.value)*q;if(Number.isFinite(+p.amount)&&+p.amount>0)return (+p.amount)*q;return 0}
const funding=t=>['ENTRY','REENTRY','REBUY','DOUBLE_REBUY','ADDON','BONUS'].includes(String(t.type||'').toUpperCase())||['REBUY_I','REBUY_II','ADDON_I','ADDON_II','EARLY_BONUS','ADDON_BONUS'].includes(item(t));
const expense=t=>['PAYOUT','BOUNTY_PAYOUT','EXPENSE','REFUND'].includes(String(t.type||'').toUpperCase())||(+t.value||0)<0;
function eventTotals(){let gross=0,expenses=0;for(const t of tx()){const val=Math.abs(totalValue(t));if(funding(t))gross+=val;if(expense(t))expenses+=val}return{gross,expenses,final:gross-expenses}}
const defs=[
 {id:'miniBuyins',label:'BUY INS',filter:t=>t.type==='ENTRY',unit:()=>n(state.buyin)},
 {id:'miniRebuy1',label:'REBUY I',filter:t=>item(t)==='REBUY_I'||(!item(t)&&t.type==='REBUY'),unit:()=>n(state.rebuyValue)},
 {id:'miniRebuy2',label:'REBUY II',filter:t=>item(t)==='REBUY_II'||(!item(t)&&t.type==='DOUBLE_REBUY'),unit:()=>n(state.doubleRebuyValue)},
 {id:'miniReentries',label:'REENTRADAS',filter:t=>t.type==='REENTRY',unit:()=>n(state.reentryValue||state.buyin)},
 {id:'miniAddon1',label:'ADD ON I',filter:t=>item(t)==='ADDON_I',unit:()=>n(state.addonValue)},
 {id:'miniAddon2',label:'ADD ON II',filter:t=>item(t)==='ADDON_II',unit:()=>n(state.specialAddonValue)},
 {id:'miniBonus',label:'EARLY BONUS',filter:t=>item(t)==='EARLY_BONUS'||t.type==='EARLY_BONUS',unit:()=>n(state.earlyBonusValue)},
 {id:'miniAddonBonus',label:'ADD ON BONUS',filter:t=>item(t)==='ADDON_BONUS'||t.type==='ADDON_BONUS',unit:()=>n(state.addonBonusValue)}
];
function installEventCards(){const title=[...document.querySelectorAll('.section')].find(x=>x.textContent.trim()==='EVENTO');if(!title)return;const grid=title.nextElementSibling;if(!grid||grid.dataset.finEnhanced==='1')return;grid.dataset.finEnhanced='1';grid.style.gridTemplateColumns='repeat(2,minmax(0,1fr))';for(const [id,label] of [['eventGross','ARRECADADO'],['eventExpenses','DESPESAS'],['eventFinal','VALOR FINAL']]){const c=document.createElement('div');c.className='infoCard';c.innerHTML=`<span class="infoLabel">${label}</span><span id="${id}" class="infoValue"></span>`;grid.appendChild(c)}}
function removeStatusSection(){const sec=[...document.querySelectorAll('.section')].find(x=>x.textContent.trim()==='STATUS DO EVENTO');if(!sec)return;const grid=sec.nextElementSibling;if(grid?.classList.contains('grid'))grid.remove();sec.remove()}
function enhanceSummaryCards(){for(const d of defs){const val=$(d.id);if(!val)continue;const card=val.closest('.infoCard');if(!card)continue;card.dataset.txEnhanced='1';card.style.display='grid';card.style.gridTemplateColumns='1fr';card.style.alignItems='stretch';card.style.gap='6px';let body=card.querySelector('.txCardDetails');if(!body){const label=card.querySelector('.infoLabel');if(label)label.textContent=d.label;body=document.createElement('div');body.className='txCardDetails';body.style.display='grid';body.style.gridTemplateColumns='repeat(3,minmax(0,1fr))';body.style.gap='8px';body.innerHTML='<div><div class="infoLabel">VALOR</div><div class="infoValue txUnit"></div></div><div><div class="infoLabel">VALOR ARRECADADO</div><div class="infoValue txGross"></div></div><div><div class="infoLabel">QUANTIDADE</div><div class="infoValue txQty"></div></div>';card.appendChild(body);val.style.display='none'}}
function render(){installEventCards();removeStatusSection();enhanceSummaryCards();const totals=eventTotals();if($('eventGross'))$('eventGross').textContent=money(totals.gross);if($('eventExpenses'))$('eventExpenses').textContent=money(totals.expenses);if($('eventFinal'))$('eventFinal').textContent=money(totals.final);const rows=tx();for(const d of defs){const val=$(d.id);if(!val)continue;const card=val.closest('.infoCard');const matched=rows.filter(d.filter);const qty=matched.reduce((a,t)=>a+qtyOf(t),0);const gross=matched.reduce((a,t)=>a+Math.abs(totalValue(t)),0);let unit=d.unit();if(!unit&&matched.length)unit=unitValue(matched[0]);const body=card?.querySelector('.txCardDetails');if(body){body.querySelector('.txUnit').textContent=money(unit);body.querySelector('.txGross').textContent=money(gross);body.querySelector('.txQty').textContent=String(qty)}}}
function boot(){render();setInterval(render,500);const prev=window.onPokerStateChange;window.onPokerStateChange=s=>{if(typeof prev==='function')prev(s);render()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();