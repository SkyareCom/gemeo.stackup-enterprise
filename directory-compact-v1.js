(function(){
  if(typeof document==='undefined'||window.__stackupCompactDirectory)return;
  window.__stackupCompactDirectory=true;

  const STYLE_ID='stackup-compact-directory-style';
  const installStyle=()=>{
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .stackup-compact-row{position:relative!important}
      .historyRow.stackup-compact-row{grid-template-columns:minmax(0,1fr)!important;gap:0!important;padding:0!important}
      .historyRow.stackup-compact-row>.pick{display:none!important}
      .stackup-compact-row .historyInfo,.stackup-compact-row .rowContent{width:100%!important;min-width:0!important}
      .stackup-compact-name{display:block!important;width:100%!important;box-sizing:border-box!important;padding:13px 4px!important;cursor:pointer!important;color:#fff!important;font-weight:600!important;line-height:1.25!important;outline:none!important}
      .stackup-compact-name:focus-visible{outline:1px solid #8DFC3B!important;outline-offset:2px!important;border-radius:6px!important}
      .historyRow.stackup-compact-row:not(.stackup-expanded) .historyInfo>.badge,
      .historyRow.stackup-compact-row:not(.stackup-expanded) .historyInfo>.meta,
      .listRow.stackup-compact-row:not(.stackup-expanded) .rowContent>.meta,
      .listRow.stackup-compact-row:not(.stackup-expanded)>.actions,
      .listRow.stackup-compact-row:not(.stackup-expanded)>.editor,
      .listRow.stackup-compact-row:not(.stackup-expanded)>.editorActions,
      .listRow.stackup-compact-row:not(.stackup-expanded)>.notice{display:none!important}
      .historyRow.stackup-compact-row.stackup-expanded{padding-bottom:11px!important}
      .historyRow.stackup-compact-row.stackup-expanded>.pick{display:block!important;position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important}
      .stackup-compact-row.stackup-expanded .stackup-compact-name{color:#8DFC3B!important;padding-bottom:8px!important}
      .historyRow.stackup-compact-row.stackup-expanded .historyInfo>.badge{display:inline-block!important}
      .historyRow.stackup-compact-row.stackup-expanded .historyInfo>.meta{display:block!important;margin-top:8px!important;padding:10px 12px!important;border:1px solid #27342D!important;border-radius:9px!important;background:linear-gradient(#0B100D,#060907)!important}
      .listRow.stackup-compact-row{padding:0 12px!important}
      .listRow.stackup-compact-row .rowTop{grid-template-columns:minmax(0,1fr)!important;gap:0!important}
      .listRow.stackup-compact-row .pickWrap{display:none!important}
      .listRow.stackup-compact-row.stackup-expanded{padding-bottom:12px!important}
      .listRow.stackup-compact-row.stackup-expanded .pickWrap{display:flex!important;position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important}
      .listRow.stackup-compact-row.stackup-expanded .rowContent>.meta{display:block!important;margin:5px 0 0!important}
    `;
    document.head.appendChild(style);
  };

  const isEditor=row=>!!row.querySelector('.inlineEditor,[data-inline-confirm],[data-f="name"],.editor:not([hidden])');
  const nameFor=row=>{
    const history=row.querySelector('.historyInfo');
    if(history)return history.querySelector(':scope > b');
    const content=row.querySelector('.rowContent');
    if(content)return content.querySelector(':scope > b');
    return null;
  };
  const eligible=row=>{
    if(!(row instanceof HTMLElement)||row.dataset.stackupCompact==='1'||isEditor(row))return false;
    if(row.matches('.historyRow'))return !!nameFor(row)&&!!row.querySelector('.meta,.badge');
    if(row.matches('.listRow[data-environment-row]'))return !!nameFor(row)&&!!row.querySelector('.meta');
    return false;
  };
  const collapseOthers=current=>document.querySelectorAll('.stackup-compact-row.stackup-expanded').forEach(row=>{
    if(row===current)return;
    row.classList.remove('stackup-expanded');
    const name=nameFor(row);
    if(name){name.setAttribute('aria-expanded','false');name.setAttribute('aria-label',`${name.textContent.trim()} • MOSTRAR INFORMAÇÕES`)}
  });
  const syncSelection=row=>{
    const box=row.querySelector('[data-pick], [data-pick-environment]');
    if(box&&!box.checked){box.checked=true;box.dispatchEvent(new Event('change',{bubbles:true}))}
  };
  const decorate=row=>{
    if(!eligible(row))return;
    const name=nameFor(row);
    row.dataset.stackupCompact='1';
    row.classList.add('stackup-compact-row');
    name.classList.add('stackup-compact-name');
    name.setAttribute('role','button');
    name.setAttribute('tabindex','0');
    name.setAttribute('aria-expanded','false');
    name.setAttribute('aria-label',`${name.textContent.trim()} • MOSTRAR INFORMAÇÕES`);
    const toggle=()=>{
      const opening=!row.classList.contains('stackup-expanded');
      collapseOthers(row);
      row.classList.toggle('stackup-expanded',opening);
      name.setAttribute('aria-expanded',opening?'true':'false');
      name.setAttribute('aria-label',`${name.textContent.trim()} • ${opening?'OCULTAR':'MOSTRAR'} INFORMAÇÕES`);
      if(opening&&row.matches('.historyRow'))syncSelection(row);
    };
    name.addEventListener('click',toggle);
    name.addEventListener('keydown',event=>{
      if(event.key!=='Enter'&&event.key!==' ')return;
      event.preventDefault();
      toggle();
    });
  };
  const scan=root=>{
    if(root instanceof HTMLElement&&(root.matches('.historyRow')||root.matches('.listRow[data-environment-row]')))decorate(root);
    root.querySelectorAll?.('.historyRow,.listRow[data-environment-row]').forEach(decorate);
  };
  const boot=()=>{
    installStyle();
    scan(document);
    new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(node=>{if(node.nodeType===1)scan(node)}))).observe(document.documentElement,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
