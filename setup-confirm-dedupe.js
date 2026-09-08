(function(){
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='setup.html')return;

  function normalizeConfirm(){
    const legacy=document.getElementById('setupDataActions');
    const primary=document.getElementById('confirmTournamentData');
    if(legacy&&primary)legacy.remove();
  }

  function correctFields(){
    const name=document.getElementById('tournamentName');
    const buyin=document.getElementById('buyin');
    if(name){
      name.placeholder='NOME DO TORNEIO';
      if(/^(NOME TESTE|MAIN EVENT - ETAPA 4)$/i.test(name.value.trim()))name.value='';
    }
    if(buyin){
      buyin.placeholder='VALOR';
      if(+buyin.value===100||+buyin.value===500)buyin.value='';
    }
  }

  function ensureItemType(){
    const editor=document.getElementById('structureEditor');
    if(!editor)return;
    let row=document.getElementById('structureItemTypeRow');
    if(!row){
      row=document.createElement('div');
      row.id='structureItemTypeRow';
      row.style.cssText='display:grid;grid-template-columns:minmax(0,1fr);gap:8px;margin:8px 0';
      row.innerHTML='<select id="structureItemType" aria-label="TIPO DE ITEM"><option value="" selected>TIPO DE ITEM</option><option value="LEVEL">NÍVEL</option><option value="BREAK">INTERVALO</option></select>';
      editor.insertBefore(row,editor.firstChild);
    }
  }

  function openEditor(){
    const editor=document.getElementById('structureEditor');
    if(!editor)return;
    document.getElementById('structureHistory')?.classList.add('hidden');
    document.getElementById('saveNameRow')?.classList.add('hidden');
    editor.classList.remove('hidden');
    ensureItemType();
  }

  function bindButtons(){
    const newBtn=document.getElementById('newStructure');
    if(newBtn&&!newBtn.dataset.setupDirectFix){
      newBtn.dataset.setupDirectFix='1';
      newBtn.addEventListener('click',openEditor,false);
    }
  }

  function boot(){
    normalizeConfirm();correctFields();ensureItemType();bindButtons();
    const root=document.body||document.documentElement;
    if(root)new MutationObserver(()=>{normalizeConfirm();correctFields();ensureItemType();bindButtons()}).observe(root,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();