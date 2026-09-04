(function(){
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='setup.html')return;

  const STYLE_ID='stackup-structure-select-style';
  const addStyle=()=>{
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #historyList .historyItem{grid-template-columns:28px minmax(0,1fr) minmax(260px,auto)!important}
      .structureSelectCheck{appearance:none!important;-webkit-appearance:none!important;width:20px!important;height:20px!important;min-width:20px!important;margin:0!important;align-self:center!important;border:1px solid #8DFC3B!important;border-radius:4px!important;background:#060907!important;box-sizing:border-box!important}
      .structureSelectCheck:checked{background:#8DFC3B!important;box-shadow:inset 0 0 0 4px #060907!important}
      #selectedStructureName{margin:10px 0 2px!important;padding:10px 12px!important;border:1px solid #27342D!important;border-radius:9px!important;background:linear-gradient(#0B100D,#060907)!important;color:#fff!important;font-weight:600!important}
      #selectedStructureName b{color:#8DFC3B!important;font-weight:600!important}
      #finalTableModeSettings{margin:12px 0 4px!important}
      #finalTableModeSettings .ftModeTitle{color:#8DFC3B!important;letter-spacing:.14em!important;margin:0 2px 7px!important}
      #finalTableModeSettings .ftModeGrid{display:grid!important;grid-template-columns:1fr!important;gap:8px!important}
      #finalTableModeSettings .ftModeOption{display:grid!important;grid-template-columns:24px minmax(0,1fr)!important;align-items:center!important;gap:10px!important;width:100%!important;min-height:48px!important;padding:10px 12px!important;border:1px solid #27342D!important;border-radius:9px!important;background:linear-gradient(#0B100D,#060907)!important;color:#fff!important;text-align:left!important}
      #finalTableModeSettings .ftModeSquare{width:20px!important;height:20px!important;min-width:20px!important;border:2px solid #8DFC3B!important;border-radius:4px!important;background:#060907!important;box-sizing:border-box!important}
      #finalTableModeSettings .ftModeOption.active .ftModeSquare{background:#8DFC3B!important;box-shadow:inset 0 0 0 4px #060907!important}
      #finalTableModeSettings .ftModeOption.active{border-color:#8DFC3B!important}
      #finalTableModeSettings .ftModeText{display:block!important;color:#fff!important;line-height:1.35!important}
      @media(max-width:700px){#historyList .historyItem{grid-template-columns:28px minmax(0,1fr)!important}#historyList .historyActions{grid-column:2!important}}
    `;
    document.head.appendChild(style);
  };

  const selectedRow=()=>{
    let row=document.getElementById('selectedStructureName');
    if(row)return row;
    const history=document.getElementById('structureHistory');
    if(!history)return null;
    row=document.createElement('div');
    row.id='selectedStructureName';
    row.className='hidden';
    history.insertAdjacentElement('afterend',row);
    return row;
  };

  const ensureFinalTableMode=()=>{
    if(!['TIMER','MANUAL'].includes(state.finalTableStructureMode))state.finalTableStructureMode='TIMER';
    state.finalTableMode=state.finalTableStructureMode==='MANUAL'?'HANDS':'TIMER';
  };

  const finalTableModeSettings=()=>{
    let box=document.getElementById('finalTableModeSettings');
    if(box)return box;
    const menu=document.querySelector('.structureMenu');
    if(!menu)return null;
    box=document.createElement('div');
    box.id='finalTableModeSettings';
    box.innerHTML=`<div class="ftModeTitle">MESA FINAL</div><div class="ftModeGrid"><button type="button" class="ftModeOption" data-ft-mode="TIMER"><span class="ftModeSquare" aria-hidden="true"></span><span class="ftModeText">MESA FINAL COM TEMPORIZADOR (SEGUE A ESTRUTURA NA SEQUÊNCIA)</span></button><button type="button" class="ftModeOption" data-ft-mode="MANUAL"><span class="ftModeSquare" aria-hidden="true"></span><span class="ftModeText">MESA FINAL COM SISTEMA MANUAL (ALTERA PARA ESTRUTURA MANUAL)</span></button></div>`;
    menu.insertAdjacentElement('afterend',box);
    box.querySelectorAll('[data-ft-mode]').forEach(btn=>btn.addEventListener('click',()=>{
      state.finalTableStructureMode=btn.dataset.ftMode;
      state.finalTableMode=state.finalTableStructureMode==='MANUAL'?'HANDS':'TIMER';
      if(state.finalTableStructureMode==='TIMER'&&state.finalTableHands){state.finalTableHands.completed=0;state.finalTableHands.levelIndex=+state.levelIndex||0}
      saveState();
      renderFinalTableMode();
    }));
    return box;
  };

  const renderFinalTableMode=()=>{
    ensureFinalTableMode();
    const box=finalTableModeSettings();
    if(!box)return;
    box.querySelectorAll('[data-ft-mode]').forEach(btn=>btn.classList.toggle('active',btn.dataset.ftMode===state.finalTableStructureMode));
  };

  const savedStructures=()=>Array.isArray(state.savedStructures)?state.savedStructures:[];
  const selectedStructure=()=>savedStructures().find(x=>x.id===state.selectedStructureId)||null;

  const clearSelectedStructure=()=>{
    state.selectedStructureId=null;
    state.selectedStructureName='';
    saveState();
    const row=selectedRow();
    if(row){row.classList.add('hidden');row.textContent=''}
  };

  const reconcileSelection=()=>{
    const list=savedStructures();
    if(!list.length){
      if(state.selectedStructureId||state.selectedStructureName)clearSelectedStructure();
      else{
        const row=selectedRow();
        if(row){row.classList.add('hidden');row.textContent=''}
      }
      return null;
    }
    if(state.selectedStructureId&&!list.some(x=>x.id===state.selectedStructureId)){
      clearSelectedStructure();
      return null;
    }
    return selectedStructure();
  };

  const showSelectedStructure=()=>{
    const row=selectedRow();
    if(!row)return;
    const s=reconcileSelection();
    if(!s){row.classList.add('hidden');row.textContent='';return}
    row.innerHTML=`<b>ESTRUTURA EM USO:</b> ${String(s.name||'ESTRUTURA').replace(/[<>]/g,'')}`;
    row.classList.remove('hidden');
  };

  const applySavedStructure=s=>{
    if(!s||!Array.isArray(s.rows))return false;
    state.selectedStructureId=s.id;
    state.selectedStructureName=s.name||'';
    state.structure=s.rows.map((r,i)=>({type:'level',label:`NÍVEL ${i+1}`,duration:(+r.time||0)*60,sb:+r.sb||0,bb:+r.bb||0,ante:s.bbAnte?(+r.bb||0):(+r.ante||0)}));
    saveState();
    showSelectedStructure();
    if(typeof renderSummary==='function')renderSummary();
    return true;
  };

  const refreshChecks=()=>{
    reconcileSelection();
    const list=document.getElementById('historyList');
    if(!list)return;
    [...list.querySelectorAll('.historyItem')].forEach((item,index)=>{
      const s=savedStructures()[index];
      if(!s)return;
      let check=item.querySelector('.structureSelectCheck');
      if(!check){check=document.createElement('input');check.type='checkbox';check.className='structureSelectCheck';check.setAttribute('aria-label',`SELECIONAR ${s.name||'ESTRUTURA'}`);item.insertBefore(check,item.firstChild)}
      check.checked=state.selectedStructureId===s.id;
      check.onchange=()=>{
        if(check.checked)applySavedStructure(s);
        else if(state.selectedStructureId===s.id)clearSelectedStructure();
        refreshChecks();
      };
    });
    showSelectedStructure();
  };

  const useWithoutOpeningEditor=e=>{
    const button=e.target.closest('#historyList .historyActions button');
    if(!button||button.textContent.trim()!=='USAR')return;
    const item=button.closest('.historyItem');
    const items=[...document.querySelectorAll('#historyList .historyItem')];
    const s=savedStructures()[items.indexOf(item)];
    if(!s)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    if(!applySavedStructure(s))return;
    refreshChecks();
    document.getElementById('structureHistory')?.classList.add('hidden');
    document.getElementById('structureEditor')?.classList.add('hidden');
    document.getElementById('saveNameRow')?.classList.add('hidden');
    showSelectedStructure();
    document.getElementById('summary')?.closest('.card')?.scrollIntoView({behavior:'smooth',block:'start'});
  };

  const bindSectionToggles=()=>{
    const newBtn=document.getElementById('newStructure');
    const historyBtn=document.getElementById('historyStructure');
    const editor=document.getElementById('structureEditor');
    const history=document.getElementById('structureHistory');
    if(newBtn){
      newBtn.addEventListener('click',e=>{
        e.preventDefault();e.stopImmediatePropagation();
        const wasOpen=editor&&!editor.classList.contains('hidden');
        history?.classList.add('hidden');
        document.getElementById('saveNameRow')?.classList.add('hidden');
        if(wasOpen)editor.classList.add('hidden');
        else if(typeof openNewStructure==='function')openNewStructure();
      },true);
    }
    if(historyBtn){
      historyBtn.addEventListener('click',e=>{
        e.preventDefault();e.stopImmediatePropagation();
        const wasOpen=history&&!history.classList.contains('hidden');
        editor?.classList.add('hidden');
        document.getElementById('saveNameRow')?.classList.add('hidden');
        if(wasOpen)history.classList.add('hidden');
        else if(typeof openHistory==='function')openHistory();
      },true);
    }
  };

  const boot=()=>{
    addStyle();
    ensureFinalTableMode();
    finalTableModeSettings();
    renderFinalTableMode();
    reconcileSelection();
    showSelectedStructure();
    const list=document.getElementById('historyList');
    if(!list)return;
    new MutationObserver(()=>{reconcileSelection();refreshChecks()}).observe(list,{childList:true,subtree:false});
    list.addEventListener('click',useWithoutOpeningEditor,true);
    bindSectionToggles();
    refreshChecks();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();