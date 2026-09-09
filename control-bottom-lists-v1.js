(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='control.html')return;
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const cpfOf=p=>String(p?.cpf||p?.document||p?.identity?.cpf||'');
const codeFor=p=>String(Math.max(0,+p?.table||0)).padStart(2,'0')+String(Math.max(0,+p?.seat||0)).padStart(2,'0');
const item=t=>String(t?.itemCode||t?.payment?.reference||'').toUpperCase();
const tx=()=>Array.isArray(state.transactions)?state.transactions.filter(t=>t.eventId===state.eventId&&t.status!=='cancelled'&&t.status!=='void'):[];
const playerById=id=>(state.players||[]).find(p=>String(p.id)===String(id));
const defs={
ACTIVE:{label:'JOGADORES ATIVOS',kind:'players',filter:p=>String(p.status||'').toLowerCase()==='active'},
ELIMINATED:{label:'JOGADORES ELIMINADOS',kind:'players',filter:p=>['eliminated','out','busted'].includes(String(p.status||'').toLowerCase())},
BUYINS:{label:'BUY INS',kind:'tx',filter:t=>t.type==='ENTRY'},
REBUY1:{label:'REBUYS I',kind:'tx',filter:t=>item(t)==='REBUY_I'||(!item(t)&&t.type==='REBUY')},
REBUY2:{label:'REBUYS II',kind:'tx',filter:t=>item(t)==='REBUY_II'||(!item(t)&&t.type==='DOUBLE_REBUY')},
REENTRY:{label:'REENTRADAS',kind:'tx',filter:t=>t.type==='REENTRY'},
ADDON1:{label:'ADD ON I',kind:'tx',filter:t=>item(t)==='ADDON_I'},
ADDON2:{label:'ADD ON II',kind:'tx',filter:t=>item(t)==='ADDON_II'},
EARLY:{label:'EARLY BONUS',kind:'tx',filter:t=>item(t)==='EARLY_BONUS'||t.type==='EARLY_BONUS'},
ADDONBONUS:{label:'ADD ON BONUS',kind:'tx',filter:t=>item(t)==='ADDON_BONUS'||t.type==='ADDON_BONUS'}
};
let current='';
function css(){if($('controlBottomListsStyle'))return;const s=document.createElement('style');s.id='controlBottomListsStyle';s.textContent=`#controlBottomLists{margin-top:26px}.bottomListButtons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.bottomListBtn{width:100%!important;min-height:44px!important;padding:10px!important;border:1px solid #8DFC3B!important;border-radius:9px!important;background:#060907!important;color:#8DFC3B!important}.bottomListBtn.active{background:#8DFC3B!important;color:#020302!important}.bottomListResult{display:grid;gap:8px;margin-top:10px}.bottomListRow{padding:10px;border:1px solid #27342D;border-radius:9px;background:#060907}.bottomListMeta{color:#AEB8B1;margin-top:4px;line-height:1.4}@media(max-width:700px){.bottomListButtons{grid-template-columns:1fr}}`;document.head.appendChild(s)}
function install(){css();if($('controlBottomLists'))return;const main=document.querySelector('main.app');if(!main)return;const sec=document.createElement('section');sec.id='controlBottomLists';sec.innerHTML=`<div class="section">LISTAS DO TORNEIO</div><div class="bottomListButtons">${Object.entries(defs).map(([k,d])=>`<button class="bottomListBtn" data-list="${k}" type="button">${d.label}</button>`).join('')}</div><div id="bottomListResult" class="bottomListResult"></div>`;main.appendChild(sec);sec.querySelectorAll('[data-list]').forEach(b=>b.onclick=()=>{current=b.dataset.list;render()});}
function playerRow(p,extra=''){return `<div class="bottomListRow"><b>${esc(p?.name||'JOGADOR')}</b><div class="bottomListMeta">CPF ${esc(cpfOf(p)||'—')} • MESA ${esc(p?.table??'—')} • POSIÇÃO ${esc(p?.seat??'—')} • CÓDIGO ${esc(codeFor(p))}${extra?` • ${extra}`:''}</div></div>`}
function txRows(d){const rows=tx().filter(d.filter);const grouped=new Map();for(const t of rows){const id=String(t.playerId||t.directoryId||t.cpf||t.playerName||'');const key=id||('SEM_ID_'+Math.random());const g=grouped.get(key)||{count:0,player:playerById(t.playerId),name:t.playerName||'',cpf:t.playerCpf||t.cpf||'',table:t.table,seat:t.seat};g.count+=Math.max(1,+t.quantity||1);if(!g.player&&t.playerId)g.player=playerById(t.playerId);grouped.set(key,g)}const arr=[...grouped.values()];if(!arr.length)return '<div class="bottomListMeta">NENHUM JOGADOR NESTA LISTA.</div>';return arr.map(g=>{const p=g.player||{name:g.name,cpf:g.cpf,table:g.table,seat:g.seat};return playerRow(p,`QUANTIDADE ${g.count}`)}).join('')}
function render(){if(!$('controlBottomLists'))install();document.querySelectorAll('.bottomListBtn').forEach(b=>b.classList.toggle('active',b.dataset.list===current));const root=$('bottomListResult');if(!current){root.innerHTML='<div class="bottomListMeta">SELECIONE UMA LISTA.</div>';return}const d=defs[current];if(d.kind==='players'){const list=(state.players||[]).filter(d.filter);root.innerHTML=list.length?list.map(p=>playerRow(p)).join(''):'<div class="bottomListMeta">NENHUM JOGADOR NESTA LISTA.</div>'}else root.innerHTML=txRows(d)}
function boot(){install();render();window.addEventListener('storage',render);const prev=window.onPokerStateChange;window.onPokerStateChange=s=>{if(typeof prev==='function')prev(s);render()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();