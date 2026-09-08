(function(){
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='setup.html')return;

  function normalizeConfirm(){
    const legacy=document.getElementById('setupDataActions');
    const primary=document.getElementById('confirmTournamentData');
    if(legacy&&primary){legacy.remove();return}
    if(legacy&&!primary){
      const legacyConfirm=document.getElementById('setupConfirmData');
      if(legacyConfirm){legacyConfirm.style.width='100%';legacyConfirm.style.display='flex'}
    }
  }

  function normalizeDefaults(){
    const name=document.getElementById('tournamentName');
    const buyin=document.getElementById('buyin');
    if(name){
      name.placeholder='NOME TESTE';
      if(!name.value.trim()||/^(MAIN EVENT - ETAPA 4|NOME TESTE)$/i.test(name.value.trim()))name.value='NOME TESTE';
    }
    if(buyin){
      buyin.placeholder='100';
      if(!buyin.value||+buyin.value===500)buyin.value='100';
    }
  }

  function ensureItemType(){
    const editor=document.getElementById('structureEditor');
    if(!editor||document.getElementById('structureItemTypeRow'))return;
    const row=document.createElement('div');
    row.id='structureItemTypeRow';
    row.style.cssText='display:grid;grid-template-columns:minmax(0,1fr);gap:8px;margin:8px 0';
    row.innerHTML='<select id="structureItemType" aria-label="TIPO DE ITEM"><option value="" selected>TIPO DE ITEM</option><option value="LEVEL">NÍVEL</option><option value="BREAK">INTERVALO</option></select>';
    editor.insertBefore(row,editor.firstChild);
  }

  function openNewStructure(){
    const editor=document.getElementById('structureEditor');
    const history=document.getElementById('structureHistory');
    if(!editor)return;
    history?.classList.add('hidden');
    editor.classList.remove('hidden');
    ensureItemType();
    const type=document.getElementById('structureItemType');
    if(type)type.value='';
    editor.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function openHistory(){
    document.getElementById('structureEditor')?.classList.add('hidden');
    document.getElementById('structureHistory')?.classList.remove('hidden');
  }

  function fixStructureButtons(){
    if(window.__stackupStructureButtonsFixedV2)return;
    window.__stackupStructureButtonsFixedV2=true;
    window.addEventListener('click',e=>{
      const btn=e.target.closest?.('#newStructure,#historyStructure');
      if(!btn)return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if(btn.id==='newStructure')openNewStructure();
      else openHistory();
    },true);
  }

  const boot=()=>{
    normalizeConfirm();
    normalizeDefaults();
    ensureItemType();
    fixStructureButtons();
    const root=document.body||document.documentElement;
    if(!root)return;
    new MutationObserver(()=>{normalizeConfirm();normalizeDefaults();ensureItemType()}).observe(root,{childList:true,subtree:true});
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();