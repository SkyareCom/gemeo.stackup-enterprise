(()=>{
'use strict';
const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
if(/^cast-/.test(file)||['cast-v2.html','cast-10px.html','cast-connect.html','tv.html','tv-connect.html','dealer-access.html'].includes(file))return;
const INTERNAL=[
  '.timeGrid','.timerGrid','.timerCommands','.timer-controls','[data-timer-controls]',
  '.timeButtons','.blindModeRow','.structureMenu','.editorActions','.levelRow','.levelsWrap','.customTime','.historyActions','.saveName',
  '.grid5','.choice','.borderModes',
  '.payGrid','.hubPay','.paymentGrid','.paymentMethods',
  '.toggleRow','.modeGrid','.dealerGrid','.confirmGrid',
  '.dealerActions','.eliminationActions','.rebuyActions','.finalTableActions','.roundControls',
  '.tabs','.tabRow','.pagination','.keypad','.keyboard','[data-internal-controls]'
].join(',');
const PAGE_CONTAINERS=[
  '.actionGrid','.utilityRow','.queryGrid','.teamGrid','.topActions','.bottomActions',
  '.cta','.pageActions','.page-actions','.mainActions','.main-actions','.navActions','.navigationActions','.links'
].join(',');
function isInternal(el){return !!el?.closest?.(INTERNAL)}
function installStyle(){
  if(document.getElementById('stackupButtonLayoutStandardV1'))return;
  const s=document.createElement('style');
  s.id='stackupButtonLayoutStandardV1';
  s.textContent=`
    html body .stackup-page-actions{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:8px!important;width:100%!important;align-items:stretch!important}
    html body .stackup-page-actions>a,html body .stackup-page-actions>button,html body .stackup-page-actions>.btn,html body .stackup-page-actions>.button{width:100%!important;max-width:100%!important;display:flex!important}
    html body .stackup-page-action{width:100%!important;max-width:100%!important;height:44px!important;min-height:44px!important;max-height:44px!important}
    html body .stackup-card-list{display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important}
    html body .timeGrid{grid-template-columns:repeat(3,minmax(0,1fr))!important}
    html body .timeGrid>button{width:100%!important}
  `;
  document.head.appendChild(s);
}
function markAction(el){
  if(!el||isInternal(el))return;
  const btn=el.matches?.('button,.btn,.button,[role="button"]')?el:el.querySelector?.(':scope > button,:scope > .btn,:scope > .button,:scope > [role="button"]');
  if(btn&&!isInternal(btn))btn.classList.add('stackup-page-action');
  if(el.matches?.('a[href]'))el.style.width='100%';
}
function markContainer(c){
  if(!c||isInternal(c))return;
  c.classList.add('stackup-page-actions');
  [...c.children].forEach(markAction);
}
function normalizeCardLists(){
  document.querySelectorAll('.grid,.cards,.modules,.moduleGrid,.cardGrid').forEach(c=>{
    const direct=[...c.children].filter(x=>x.matches?.('a.card,.module-card,[data-module-card]'));
    if(direct.length)c.classList.add('stackup-card-list');
  });
}
function normalizePageButtons(){
  document.querySelectorAll(PAGE_CONTAINERS).forEach(markContainer);
  document.querySelectorAll('.actions').forEach(c=>{if(!isInternal(c))markContainer(c)});
  document.querySelectorAll('main > button,main > a[href] > button,main > a[href].btn,main > a[href].button').forEach(markAction);
  document.querySelectorAll('a[href$=".html"] > button,a[href*=".html?"] > button').forEach(btn=>{if(!isInternal(btn)){const a=btn.closest('a[href]');a?.parentElement&&markContainer(a.parentElement);markAction(btn)}});
}
function apply(){installStyle();normalizeCardLists();normalizePageButtons()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
let queued=false;const obs=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})});
if(document.documentElement)obs.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(apply,250);setTimeout(apply,1000);
})();