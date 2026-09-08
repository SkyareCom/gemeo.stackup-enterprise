(function(){
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='setup.html')return;

  function normalizeConfirm(){
    const legacy=document.getElementById('setupDataActions');
    const primary=document.getElementById('confirmTournamentData');

    if(legacy&&primary){
      legacy.remove();
      return;
    }

    if(legacy&&!primary){
      const legacyConfirm=document.getElementById('setupConfirmData');
      if(legacyConfirm){
        legacyConfirm.style.width='100%';
        legacyConfirm.style.display='flex';
      }
    }
  }

  function fixStructureButtons(){
    if(window.__stackupStructureButtonsFixed)return;
    window.__stackupStructureButtonsFixed=true;
    window.addEventListener('click',e=>{
      const btn=e.target.closest?.('#newStructure,#historyStructure');
      if(!btn)return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      try{
        if(typeof btn.onclick==='function')btn.onclick.call(btn,e);
      }catch(err){
        console.error('STACKUP_STRUCTURE_BUTTON',err);
      }
    },true);
  }

  const boot=()=>{
    normalizeConfirm();
    fixStructureButtons();
    const root=document.body||document.documentElement;
    if(!root)return;
    new MutationObserver(normalizeConfirm).observe(root,{childList:true,subtree:true});
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();