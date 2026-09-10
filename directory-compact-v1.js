(function(){
  if(typeof document==='undefined'||window.__stackupCompactDirectory)return;
  window.__stackupCompactDirectory=true;

  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  const params=new URLSearchParams(location.search);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const digits=v=>String(v||'').replace(/\D/g,'');
  const validBirth=v=>{if(!v)return true;const m=String(v).match(/^(\d{2}) \/ (\d{2}) \/ (\d{4})$/);if(!m)return false;const d=+m[1],mo=+m[2],y=+m[3],dt=new Date(y,mo-1,d);return dt.getFullYear()===y&&dt.getMonth()===mo-1&&dt.getDate()===d};
  const topGo=url=>{try{window.top.location.href=url}catch(_){location.href=url}};
  const refreshTop=()=>{try{window.top.location.reload()}catch(_){location.reload()}};

  const installStyle=()=>{
    if(document.getElementById('stackup-compact-directory-style'))return;
    const style=document.createElement('style');
    style.id='stackup-compact-directory-style';
    style.textContent=`
      .stackup-compact-row{position:relative!important}
      .historyActions{display:none!important}
      .historyRow.stackup-compact-row{grid-template-columns:minmax(0,1fr)!important;gap:0!important;padding:0!important}
      .historyRow.stackup-compact-row>.pick{display:none!important}
      .stackup-compact-row .historyInfo,.stackup-compact-row .rowContent{width:100%!important;min-width:0!important}
      .stackup-compact-name{display:block!important;width:100%!important;box-sizing:border-box!important;padding:13px 4px!important;cursor:pointer!important;color:#fff!important;font-weight:600!important;line-height:1.25!important;outline:none!important}
      .stackup-compact-name:focus-visible{outline:1px solid #8DFC3B!important;outline-offset:2px!important;border-radius:6px!important}
      .historyRow.stackup-compact-row:not(.stackup-expanded) .historyInfo>.badge,
      .historyRow.stackup-compact-row:not(.stackup-expanded) .historyInfo>.meta,
      .historyRow.stackup-compact-row:not(.stackup-expanded) .stackup-row-actions,
      .listRow.stackup-compact-row:not(.stackup-expanded) .rowContent>.meta,
      .listRow.stackup-compact-row:not(.stackup-expanded)>.actions,
      .listRow.stackup-compact-row:not(.stackup-expanded)>.editor,
      .listRow.stackup-compact-row:not(.stackup-expanded)>.editorActions,
      .listRow.stackup-compact-row:not(.stackup-expanded)>.notice,
      .listRow.stackup-compact-row:not(.stackup-expanded)>.stackup-row-actions{display:none!important}
      .historyRow.stackup-compact-row.stackup-expanded{padding-bottom:11px!important}
      .stackup-compact-row.stackup-expanded .stackup-compact-name{color:#8DFC3B!important;padding-bottom:8px!important}
      .historyRow.stackup-compact-row.stackup-expanded .historyInfo>.badge{display:inline-block!important}
      .historyRow.stackup-compact-row.stackup-expanded .historyInfo>.meta{display:block!important;margin-top:8px!important;padding:10px 12px!important;border:1px solid #27342D!important;border-radius:9px!important;background:linear-gradient(#0B100D,#060907)!important}
      .stackup-row-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;margin-top:10px!important}
      .stackup-row-actions button{width:100%!important;min-height:44px!important;margin:0!important}
      .stackup-row-actions .stackup-delete{color:#ff858d!important;border-color:#ff858d!important}
      .listRow.stackup-compact-row{padding:0 12px!important}
      .listRow.stackup-compact-row .rowTop{grid-template-columns:minmax(0,1fr)!important;gap:0!important}
      .listRow.stackup-compact-row .pickWrap{display:none!important}
      .listRow.stackup-compact-row.stackup-expanded{padding-bottom:12px!important}
      .listRow.stackup-compact-row.stackup-expanded .rowContent>.meta{display:block!important;margin:5px 0 0!important}
    `;
    document.head.appendChild(style);
  };

  const nameFor=row=>{
    const history=row.querySelector('.historyInfo');
    if(history)return history.querySelector(':scope > b');
    const content=row.querySelector('.rowContent');
    if(content)return content.querySelector(':scope > b');
    return null;
  };
  const entityId=row=>row.getAttribute('data-row')||row.getAttribute('data-environment-row')||'';
  const entityType=row=>{
    if(page==='players-directory.html'&&row.matches('.historyRow'))return 'player';
    if(page==='staff.html'&&row.matches('.historyRow'))return 'staff';
    if(page==='environment-registered.html'&&row.matches('.listRow[data-environment-row]'))return 'environment';
    return '';
  };
  const deleteEntity=(type,id,name)=>{
    if(!confirm(`APAGAR ${name}?`))return;
    if(type==='player'){
      const key='stackup-player-directory-v1';
      let rows=[];try{rows=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(rows))rows=[]}catch(_){rows=[]}
      rows=rows.filter(x=>String(x.id)!==String(id));
      localStorage.setItem(key,JSON.stringify(rows));
      refreshTop();
      return;
    }
    if(type==='staff'&&typeof state!=='undefined'){
      state.staffUsers=(state.staffUsers||[]).filter(x=>String(x.id)!==String(id));
      (state.authMemberships||[]).forEach(m=>{if(String(m.staffId)===String(id)){m.active=false;m.updatedAt=Date.now()}});
      if(typeof saveState==='function')saveState();
      window.StackupAuth?.ensure?.();
      refreshTop();
      return;
    }
    if(type==='environment'&&typeof state!=='undefined'){
      const club=(state.authClubs||[]).find(x=>String(x.id)===String(id));
      if(!club)return;
      club.active=false;club.deletedAt=Date.now();
      (state.authMemberships||[]).forEach(m=>{if(String(m.clubId)===String(id))m.active=false});
      if(String(state.activeEnvironmentId||'')===String(id)){state.activeEnvironmentId='';state.activeEnvironmentName='';state.activeEnvironmentType='';state.clubName=''}
      if(typeof saveState==='function')saveState();
      refreshTop();
    }
  };
  const editEntity=(type,id)=>{
    if(type==='player')topGo(`players-directory.html?view=register&edit=${encodeURIComponent(id)}`);
    if(type==='staff')topGo(`staff.html?view=register&edit=${encodeURIComponent(id)}`);
    if(type==='environment')topGo(`environment-register.html?edit=${encodeURIComponent(id)}`);
  };
  const installActions=row=>{
    const type=entityType(row),id=entityId(row),name=nameFor(row)?.textContent.trim()||'REGISTRO';
    if(!type||!id||row.querySelector(':scope > .stackup-row-actions,.historyInfo > .stackup-row-actions'))return;
    const actions=document.createElement('div');
    actions.className='stackup-row-actions';
    actions.innerHTML=`<button type="button" data-stackup-edit="${esc(id)}">EDITAR</button><button type="button" class="stackup-delete" data-stackup-delete="${esc(id)}">APAGAR</button>`;
    const host=row.querySelector('.historyInfo')||row;
    host.appendChild(actions);
    actions.querySelector('[data-stackup-edit]').onclick=e=>{e.stopPropagation();editEntity(type,id)};
    actions.querySelector('[data-stackup-delete]').onclick=e=>{e.stopPropagation();deleteEntity(type,id,name)};
  };
  const collapseOthers=current=>document.querySelectorAll('.stackup-compact-row.stackup-expanded').forEach(row=>{
    if(row===current)return;
    row.classList.remove('stackup-expanded');
    const name=nameFor(row);
    if(name){name.setAttribute('aria-expanded','false');name.setAttribute('aria-label',`${name.textContent.trim()} • MOSTRAR INFORMAÇÕES`)}
  });
  const eligible=row=>{
    if(!(row instanceof HTMLElement)||row.dataset.stackupCompact==='1')return false;
    if(row.querySelector('.inlineEditor,[data-inline-confirm],[data-f="name"],.editor:not([hidden])'))return false;
    if(row.matches('.historyRow'))return !!nameFor(row);
    if(row.matches('.listRow[data-environment-row]'))return !!nameFor(row);
    return false;
  };
  const decorate=row=>{
    if(!eligible(row))return;
    const name=nameFor(row);if(!name)return;
    row.dataset.stackupCompact='1';row.classList.add('stackup-compact-row');
    name.classList.add('stackup-compact-name');
    name.setAttribute('role','button');name.setAttribute('tabindex','0');name.setAttribute('aria-expanded','false');name.setAttribute('aria-label',`${name.textContent.trim()} • MOSTRAR INFORMAÇÕES`);
    installActions(row);
    const toggle=()=>{
      const opening=!row.classList.contains('stackup-expanded');
      collapseOthers(row);row.classList.toggle('stackup-expanded',opening);
      name.setAttribute('aria-expanded',opening?'true':'false');
      name.setAttribute('aria-label',`${name.textContent.trim()} • ${opening?'OCULTAR':'MOSTRAR'} INFORMAÇÕES`);
    };
    name.addEventListener('click',toggle);
    name.addEventListener('keydown',event=>{if(event.key!=='Enter'&&event.key!==' ')return;event.preventDefault();toggle()});
  };
  const scan=root=>{
    if(root instanceof HTMLElement&&(root.matches('.historyRow')||root.matches('.listRow[data-environment-row]')))decorate(root);
    root.querySelectorAll?.('.historyRow,.listRow[data-environment-row]').forEach(decorate);
  };

  const playerEdit=()=>{
    if(page!=='players-directory.html'||params.get('view')!=='register'||!params.get('edit'))return;
    const id=params.get('edit'),key='stackup-player-directory-v1';
    let rows=[];try{rows=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(rows))rows=[]}catch(_){rows=[]}
    const p=rows.find(x=>String(x.id)===String(id));if(!p)return;
    const by=id=>document.getElementById(id),set=(id,v)=>{const el=by(id);if(el)el.value=v||''};
    set('playerNameInput',p.name);set('cpf',p.cpf);set('birth',p.birth);set('phone',p.phone);set('whatsapp',p.whatsapp);set('email',p.email);set('instagram',p.instagram);set('team',p.team);
    if(by('type'))by('type').value=p.type||'PRO';
    const info=p.info||[];if(by('infoWhats'))by('infoWhats').checked=info.includes('WHATSAPP');if(by('infoSms'))by('infoSms').checked=info.includes('SMS');if(by('infoEmail'))by('infoEmail').checked=info.includes('EMAIL')||info.includes('E-MAIL');
    const title=document.querySelector('h1');if(title)title.textContent='EDITAR JOGADOR';
    const save=by('save');if(!save)return;save.textContent='CONFIRMAR';
    save.onclick=()=>{
      const name=by('playerNameInput').value.trim(),birth=by('birth').value.trim();
      if(!name)return alert('INFORME O NOME.');if(birth&&!validBirth(birth))return alert('INFORME A DATA DE NASCIMENTO NO FORMATO DD / MM / AAAA.');
      Object.assign(p,{name,cpf:by('cpf').value.trim(),birth,phone:by('phone').value.trim(),whatsapp:by('whatsapp').value.trim(),email:by('email').value.trim(),instagram:by('instagram').value.trim(),type:by('type').value,team:by('team').value.trim(),info:[by('infoWhats').checked?'WHATSAPP':'',by('infoSms').checked?'SMS':'',by('infoEmail').checked?'EMAIL':''].filter(Boolean),updatedAt:Date.now()});
      localStorage.setItem(key,JSON.stringify(rows));
      topGo('players-registered.html');
    };
  };

  const staffEdit=()=>{
    if(page!=='staff.html'||params.get('view')!=='register'||!params.get('edit')||typeof state==='undefined')return;
    const id=params.get('edit'),s=(state.staffUsers||[]).find(x=>String(x.id)===String(id));if(!s)return;
    const by=id=>document.getElementById(id),set=(id,v)=>{const el=by(id);if(el)el.value=v||''};
    set('staffNameInput',s.name);set('cpf',s.cpf);set('birth',s.birth);set('phone',s.phone);set('whatsapp',s.whatsapp);set('email',s.email);set('instagram',s.instagram);set('pin','');
    if(by('club'))by('club').value=s.clubId||'';if(by('role')){by('role').value=s.role||'DEALER';by('role').dispatchEvent(new Event('change',{bubbles:true}))}
    const title=document.getElementById('pageTitle')||document.querySelector('h1');if(title)title.textContent='EDITAR STAFF';
    const save=by('save');if(!save)return;save.textContent='CONFIRMAR';
    save.onclick=()=>{
      const name=by('staffNameInput').value.trim(),cpf=by('cpf').value.trim(),birth=by('birth').value.trim(),clubId=by('club').value,role=by('role').value,pin=by('pin')?.value.trim()||'';
      if(!name)return alert('INFORME O NOME.');if(!cpf)return alert('INFORME O CPF.');if(!clubId)return alert('SELECIONE O AMBIENTE.');if(birth&&!validBirth(birth))return alert('INFORME A DATA DE NASCIMENTO NO FORMATO DD / MM / AAAA.');
      const duplicate=(state.staffUsers||[]).find(x=>String(x.id)!==String(id)&&digits(x.cpf)===digits(cpf)&&String(x.clubId||'')===String(clubId));if(duplicate)return alert('ESTA PESSOA JÁ POSSUI UM VÍNCULO NESTE AMBIENTE.');
      Object.assign(s,{name,cpf,birth,phone:by('phone').value.trim(),whatsapp:by('whatsapp').value.trim(),email:by('email').value.trim(),instagram:by('instagram').value.trim(),clubId,role,permissions:[...(window.StackupAuth?.ROLE_ACCESS?.[role]||[])],active:true,updatedAt:Date.now()});if(pin)s.pin=pin;
      if(typeof saveState==='function')saveState();window.StackupAuth?.ensure?.();topGo('staff-registered.html');
    };
  };

  const environmentEdit=()=>{
    if(page!=='environment-register.html'||!params.get('edit')||typeof state==='undefined')return;
    const id=params.get('edit'),club=(state.authClubs||[]).find(x=>String(x.id)===String(id));if(!club)return;
    const name=document.getElementById('newClubName'),type=document.getElementById('newClubType'),button=document.getElementById('createClub');
    if(name)name.value=club.name||'';if(type)type.value=club.type||'CLUB';
    const title=document.querySelector('.title');if(title)title.textContent='EDITAR AMBIENTE';
    if(!button)return;button.textContent='CONFIRMAR';
    button.onclick=()=>{
      const next=name.value.trim(),nextType=type.value;if(!next)return alert('INFORME O NOME DO AMBIENTE.');
      const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleUpperCase('pt-BR');
      const duplicate=(state.authClubs||[]).find(x=>x.active!==false&&String(x.id)!==String(id)&&norm(x.name)===norm(next));if(duplicate)return alert('JÁ EXISTE UM AMBIENTE ATIVO COM ESTE NOME.');
      club.name=next;club.type=nextType;club.updatedAt=Date.now();if(String(state.activeEnvironmentId||'')===String(id)){state.activeEnvironmentName=next;state.activeEnvironmentType=nextType;state.clubName=next}
      if(typeof saveState==='function')saveState();topGo('environment-registered.html');
    };
  };

  const boot=()=>{
    installStyle();
    if(page==='environment-registered.html'){const select=document.getElementById('selectMode');if(select)select.style.display='none'}
    playerEdit();staffEdit();environmentEdit();scan(document);
    new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(node=>{if(node.nodeType===1)scan(node)}))).observe(document.documentElement,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
