(function(){
  'use strict';
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  const $=id=>document.getElementById(id);
  const loadUiStandard=()=>{if(document.querySelector('script[data-stackup-ui-standard]'))return;const s=document.createElement('script');s.src='ui-standard.js?v=publication0914';s.defer=true;s.dataset.stackupUiStandard='1';(document.head||document.documentElement).appendChild(s)};
  const loadInlineLists=()=>{if(document.querySelector('script[data-stackup-inline-lists]'))return;const s=document.createElement('script');s.src='in-app-lists.js?v=publication0914';s.defer=true;s.dataset.stackupInlineLists='1';(document.head||document.documentElement).appendChild(s)};
  function normalizeLabels(){if(page==='finance-settings.html'){const main=$('save'),player=$('savePlayerRule');if(main)main.textContent='CONFIRMAR';if(player)player.textContent='CONFIRMAR'}if(page==='structure-import.html'){const b=$('saveBtn');if(b)b.textContent='CONFIRMAR'}}
  const boot=()=>{loadUiStandard();loadInlineLists();normalizeLabels()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
})();