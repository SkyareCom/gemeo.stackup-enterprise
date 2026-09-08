(function(){
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='setup.html')return;

  const STRUCTURE_TYPES=[
    ['NORMAL','NORMAL'],
    ['REBUYS_END','TÉRMINO DE REBUYS'],
    ['ENTRIES_END','TÉRMINO DE ENTRADAS'],
    ['ENTRIES_REENTRIES_END','TÉRMINO DE ENTRADAS E REENTRADAS'],
    ['REENTRIES_END','TÉRMINO DE REENTRADAS'],
    ['ADDON_BREAK','INTERVALO PARA ADD ON'],
    ['BREAK','INTERVALO'],
    ['MEAL_BREAK','INTERVALO PARA REFEIÇÃO'],
    ['BAGGING','BAGGING']
  ];

  function normalizeConfirm(){
    const legacy=document.getElementById('setupDataActions');
    const primary=document.getElementById('confirmTournamentData');
    if(legacy&&primary)legacy.remove();
  }

  function correctFields(){
    let changed=false;
    if(window.state){
      if(/^(NOME TESTE|MAIN EVENT - ETAPA 4)$/i.test(String(state.tournamentName||'').trim())){state.tournamentName='';changed=true}
      if(+state.buyin===100||+state.buyin===500){state.buyin=0;changed=true}
      if(changed&&typeof saveState==='function')saveState();
    }
    const name=document.getElementById('tournamentName');
    const buyin=document.getElementById('buyin');
    if(name){name.placeholder='NOME DO TORNEIO';if(/^(NOME TESTE|MAIN EVENT - ETAPA 4)$/i.test(name.value.trim()))name.value=''}
    if(buyin){buyin.placeholder='VALOR';if(+buyin.value===100||+buyin.value===500)buyin.value=''}
  }

  function addStructureTypeStyle(){
    if(document.getElementById('structureTypeStyle'))return;
    const style=document.createElement('style');
    style.id='structureTypeStyle';
    style.textContent=`
      #structureTypeSelector{margin:8px 0 12px!important}
      #structureTypeSelector .structureTypeTitle{color:#8DFC3B!important;letter-spacing:.14em!important;margin:0 2px 7px!important;font-weight:600!important}
      #structureTypeList{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
      #structureTypeList button{width:100%!important;min-height:44px!important;height:auto!important;padding:10px 12px!important;text-align:left!important;white-space:normal!important;line-height:1.25!important;border:1px solid #27342D!important;background:linear-gradient(#0B100D,#060907)!important;color:#AEB8B1!important}
      #structureTypeList button.active{border-color:#8DFC3B!important;color:#8DFC3B!important;background:#081108!important}
      @media(max-width:700px){#structureTypeList{grid-template-columns:minmax(0,1fr)!important}}
    `;
    document.head.appendChild(style);
  }

  function renderStructureType(){
    const box=document.getElementById('structureTypeSelector');
    if(!box)return;
    const selected=String(window.state?.structureType||'');
    box.querySelectorAll('[data-structure-type]').forEach(btn=>btn.classList.toggle('active',btn.dataset.structureType===selected));
  }

  function selectStructureType(value){
    if(window.state){state.structureType=value;state.structureTypeLabel=STRUCTURE_TYPES.find(([v])=>v===value)?.[1]||value;if(typeof saveState==='function')saveState()}
    renderStructureType();
  }

  function ensureStructureTypeSelector(){
    const editor=document.getElementById('structureEditor');
    if(!editor)return;
    document.getElementById('structureItemTypeRow')?.remove();
    addStructureTypeStyle();
    let box=document.getElementById('structureTypeSelector');
    if(!box){
      box=document.createElement('div');
      box.id='structureTypeSelector';
      box.innerHTML='<div class="structureTypeTitle">TIPO DE ESTRUTURA</div><div id="structureTypeList"></div>';
      const first=editor.querySelector('.blindModeRow')||editor.firstChild;
      editor.insertBefore(box,first);
      const list=box.querySelector('#structureTypeList');
      STRUCTURE_TYPES.forEach(([value,label])=>{
        const btn=document.createElement('button');
        btn.type='button';
        btn.dataset.structureType=value;
        btn.textContent=label;
        btn.onclick=()=>selectStructureType(value);
        list.appendChild(btn);
      });
    }
    renderStructureType();
  }

  function openEditor(resetType){
    const editor=document.getElementById('structureEditor');
    if(!editor)return;
    if(resetType&&window.state){state.structureType='';state.structureTypeLabel='';if(typeof saveState==='function')saveState()}
    document.getElementById('structureHistory')?.classList.add('hidden');
    document.getElementById('saveNameRow')?.classList.add('hidden');
    editor.classList.remove('hidden');
    ensureStructureTypeSelector();
  }

  function openHistory(){
    document.getElementById('structureEditor')?.classList.add('hidden');
    document.getElementById('structureHistory')?.classList.remove('hidden');
  }

  function bindCapture(){
    if(window.__setupStructureCaptureV4)return;
    window.__setupStructureCaptureV4=true;
    window.addEventListener('click',e=>{
      const b=e.target.closest?.('#newStructure,#historyStructure,#saveStructure');
      if(!b)return;
      if(b.id==='saveStructure'&&!String(window.state?.structureType||'')){
        e.preventDefault();e.stopImmediatePropagation();
        alert('SELECIONE O TIPO DE ESTRUTURA.');
        document.getElementById('structureTypeSelector')?.scrollIntoView({behavior:'smooth',block:'center'});
        return;
      }
      if(b.id==='newStructure'){
        e.preventDefault();e.stopImmediatePropagation();openEditor(true);
      }else if(b.id==='historyStructure'){
        e.preventDefault();e.stopImmediatePropagation();openHistory();
      }
    },true);
  }

  function boot(){
    normalizeConfirm();correctFields();ensureStructureTypeSelector();bindCapture();
    const root=document.body||document.documentElement;
    if(root)new MutationObserver(()=>{normalizeConfirm();correctFields();ensureStructureTypeSelector()}).observe(root,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();