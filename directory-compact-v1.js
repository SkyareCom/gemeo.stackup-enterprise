(function(){
  if(typeof document==='undefined'||window.__stackupCompactDirectory)return;
  window.__stackupCompactDirectory=true;

  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!['players-directory.html','staff.html'].includes(page))return;

  const STYLE_ID='stackup-compact-directory-style';
  const installStyle=()=>{
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .historyRow.stackup-compact-row{grid-template-columns:minmax(0,1fr)!important;gap:0!important;padding:0!important}
      .historyRow.stackup-compact-row>.pick{display:none!important}
      .historyRow.stackup-compact-row .historyInfo{width:100%!important}
      .historyRow.stackup-compact-row .historyInfo>b{display:block!important;width:100%!important;box-sizing:border-box!important;padding:13px 4px!important;cursor:pointer!important;color:#fff!important;font-weight:600!important;line-height:1.25!important;outline:none!important}
      .historyRow.stackup-compact-row .historyInfo>b:focus-visible{outline:1px solid #8DFC3B!important;outline-offset:2px!important;border-radius:6px!important}
      .historyRow.stackup-compact-row .historyInfo>.badge,
      .historyRow.stackup-compact-row .historyInfo>.meta{display:none!important}
      .historyRow.stackup-compact-row.stackup-expanded{padding-bottom:11px!important}
      .historyRow.stackup-compact-row.stackup-expanded>.pick{display:block!important;position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important}
      .historyRow.stackup-compact-row.stackup-expanded .historyInfo>b{color:#8DFC3B!important;padding-bottom:8px!important}
      .historyRow.stackup-compact-row.stackup-expanded .historyInfo>.badge{display:inline-block!important}
      .historyRow.stackup-compact-row.stackup-expanded .historyInfo>.meta{display:block!important;margin-top:8px!important;padding:10px 12px!important;border:1px solid #27342D!important;border-radius:9px!important;background:linear-gradient(#0B100D,#060907)!important}
    `;
    document.head.appendChild(style);
  };

  const isEditor=row=>!!row.querySelector('.inlineEditor,[data-inline-confirm],[data-f="name"]');
  const collapseOthers=current=>document.querySelectorAll('.historyRow.stackup-compact-row.stackup-expanded').forEach(row=>{
    if(row===current)return;
    row.classList.remove('stackup-expanded');
    const name=row.querySelector('.historyInfo>b');
    if(name)name.setAttribute('aria-expanded','false');
  });
  const decorate=row=>{
    if(!(row instanceof HTMLElement)||row.dataset.stackupCompact==='1'||isEditor(row))return;
    const info=row.querySelector('.historyInfo'),name=info?.querySelector(':scope > b');
    if(!info||!name)return;
    row.dataset.stackupCompact='1';
    row.classList.add('stackup-compact-row');
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
    };
    name.addEventListener('click',toggle);
    name.addEventListener('keydown',event=>{
      if(event.key!=='Enter'&&event.key!==' ')return;
      event.preventDefault();
      toggle();
    });
  };
  const scan=root=>{
    if(root instanceof HTMLElement&&root.matches('.historyRow'))decorate(root);
    root.querySelectorAll?.('.historyRow').forEach(decorate);
  };
  const boot=()=>{
    installStyle();
    scan(document);
    new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(node=>{
      if(node.nodeType===1)scan(node);
    }))).observe(document.documentElement,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
