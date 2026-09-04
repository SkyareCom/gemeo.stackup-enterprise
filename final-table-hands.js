(function(){
  const DEVICE_KEY='stackup-final-table-device-v1';
  function emptyAccess(s=state){return{status:'IDLE',active:false,eventId:s.eventId||'',sessionId:'',requestId:'',table:null,dealerId:'',dealerName:'',dealerRole:'',dealerCpf:'',deviceId:'',requestedAt:null,checkedInAt:null,approvedAt:null,approvedById:'',approvedByName:'',rejectedAt:null,rejectedById:'',releasedAt:null,lastActionAt:null}}
  function ensure(s=state){
    if(!s.finalTableHands||typeof s.finalTableHands!=='object')s.finalTableHands={};
    const h=s.finalTableHands;
    const idx=+s.levelIndex||0;
    const structureMode=['TIMER','MANUAL'].includes(s.finalTableStructureMode)?s.finalTableStructureMode:'TIMER';
    s.finalTableStructureMode=structureMode;
    if(!Number.isFinite(+s.finalTableHandsPerLevel)||+s.finalTableHandsPerLevel<=0)s.finalTableHandsPerLevel=10;
    s.finalTableHandsPerLevel=Math.max(1,Math.floor(+s.finalTableHandsPerLevel||10));
    if(structureMode!=='MANUAL')s.finalTableManualActive=false;
    s.finalTableMode=(structureMode==='MANUAL'&&s.finalTableManualActive)?'HANDS':'TIMER';
    if(!Number.isFinite(+h.target)||+h.target<=0)h.target=s.finalTableHandsPerLevel;
    if(!Number.isFinite(+h.completed)||+h.completed<0)h.completed=0;
    if(!Number.isFinite(+h.levelIndex))h.levelIndex=idx;
    if(+h.levelIndex!==idx){h.levelIndex=idx;h.completed=0;h.updatedAt=Date.now()}
    h.target=Math.max(1,Math.floor(+s.finalTableHandsPerLevel||+h.target||10));
    h.completed=Math.max(0,Math.min(h.target,Math.floor(+h.completed||0)));
    if(s.finalTableMode==='TIMER'&&h.completed!==0){h.completed=0;h.levelIndex=idx;h.updatedAt=Date.now()}
    if(!s.finalTableAccess||typeof s.finalTableAccess!=='object')s.finalTableAccess=emptyAccess(s);
    const a=s.finalTableAccess;
    if(!a.status)a.status=a.active?'APPROVED':'IDLE';
    if(typeof a.active!=='boolean')a.active=a.status==='APPROVED';
    if(!('requestedAt' in a))a.requestedAt=a.checkedInAt||null;
    if(!('approvedAt' in a))a.approvedAt=a.active?a.checkedInAt||null:null;
    if(!('approvedById' in a))a.approvedById='';
    if(!('approvedByName' in a))a.approvedByName='';
    if(!('dealerCpf' in a))a.dealerCpf='';
    if(!('requestId' in a))a.requestId='';
    return h;
  }
  function isManualMode(s=state){ensure(s);return s.finalTableStructureMode==='MANUAL'&&s.finalTableManualActive===true}
  function deviceId(){
    let id='';
    try{id=localStorage.getItem(DEVICE_KEY)||''}catch(e){}
    if(!id){id='ft-device-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);try{localStorage.setItem(DEVICE_KEY,id)}catch(e){}}
    return id;
  }
  function access(s=state){ensure(s);return s.finalTableAccess}
  function snapshot(s=state){
    const h=ensure(s),target=h.target,completed=h.completed,remaining=Math.max(0,target-completed);
    return{target,completed,remaining,progress:target?completed/target:0,levelIndex:+s.levelIndex||0,mode:s.finalTableMode,configuredMode:s.finalTableStructureMode,manualActive:!!s.finalTableManualActive,access:{...access(s)},deviceId:deviceId()};
  }
  function save(){if(typeof saveState==='function')saveState();if(typeof window.onPokerStateChange==='function')window.onPokerStateChange(state)}
  function isPrivileged(staff){return !!staff&&['OWNER','TD','FLOOR','GESTOR'].includes(staff.role)}
  function canControl(s=state){const a=access(s);return !!(a.status==='APPROVED'&&a.active&&a.eventId===s.eventId&&a.deviceId===deviceId())}
  function requestCheckIn({staff,table}={}){
    ensure();
    if(state.finalTableStructureMode!=='MANUAL')return{ok:false,error:'MESA FINAL CONFIGURADA COM TEMPORIZADOR. CHECK IN ESPECÍFICO DA FT NÃO É NECESSÁRIO.'};
    const current=access();
    if(!staff?.id||staff.role!=='DEALER')return{ok:false,error:'INFORME O CPF DE UM DEALER ATIVO.'};
    const t=Math.max(1,Math.floor(+table||0));
    if(!t)return{ok:false,error:'INFORME A MESA DA FINAL TABLE.'};
    if(current.eventId===state.eventId&&current.status==='APPROVED'&&current.active)return{ok:false,error:'JÁ EXISTE UM APARELHO AUTORIZADO PARA A FINAL TABLE.',active:{...current}};
    if(current.eventId===state.eventId&&current.status==='PENDING'&&current.deviceId!==deviceId())return{ok:false,error:'JÁ EXISTE UMA SOLICITAÇÃO DE ACESSO À FT AGUARDANDO LIBERAÇÃO.',active:{...current}};
    const now=Date.now();
    state.finalTableAccess={...emptyAccess(),status:'PENDING',active:false,eventId:state.eventId,sessionId:'',requestId:'ft-request-'+now+'-'+Math.random().toString(36).slice(2,7),table:t,dealerId:staff.id,dealerName:staff.name||'DEALER',dealerRole:'DEALER',dealerCpf:staff.cpf||'',deviceId:deviceId(),requestedAt:now,checkedInAt:now,lastActionAt:now};
    if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_ACCESS_REQUESTED',{source:'DEALER_STATION',table:t,dealerId:staff.id,dealerName:staff.name||'',deviceId:deviceId(),levelIndex:+state.levelIndex||0});
    save();
    return{ok:true,pending:true,access:{...state.finalTableAccess}};
  }
  function activateManualTransition(staff,a,now){
    if(state.finalTableStructureMode!=='MANUAL')return;
    const timerSnap=window.TournamentTimer?.displayed?.();
    state.finalTableManualActive=true;
    state.finalTableMode='HANDS';
    state.finalTableStartedAt=state.finalTableStartedAt||now;
    state.finalTableTransition={
      eventId:state.eventId||'',
      activatedAt:now,
      levelIndex:+state.levelIndex||0,
      timerRemaining:Math.max(0,+timerSnap?.remaining||+state.remaining||0),
      structureId:state.selectedStructureId||null,
      structureName:state.selectedStructureName||'',
      dealerId:a.dealerId,
      dealerName:a.dealerName,
      table:a.table,
      approvedById:staff?.id||'',
      approvedByName:staff?.name||staff?.role||''
    };
    const h=ensure();
    h.levelIndex=+state.levelIndex||0;
    h.target=Math.max(1,+state.finalTableHandsPerLevel||10);
    h.completed=0;
    h.updatedAt=now;
    if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_STARTED',{source:'FINAL_TABLE_DEALER_CHECKIN',mode:'HANDS',levelIndex:+state.levelIndex||0,timerRemaining:state.finalTableTransition.timerRemaining,target:h.target,table:a.table,dealerId:a.dealerId,dealerName:a.dealerName});
  }
  function approve({staff}={}){
    ensure();const a=access();
    if(!isPrivileged(staff))return{ok:false,error:'SOMENTE TD, FLOOR OU GESTOR PODE LIBERAR O ACESSO À FT.'};
    if(a.status!=='PENDING')return{ok:false,error:'NÃO HÁ SOLICITAÇÃO PENDENTE PARA LIBERAR.'};
    const now=Date.now();
    a.status='APPROVED';a.active=true;a.sessionId='ft-session-'+now+'-'+Math.random().toString(36).slice(2,7);a.approvedAt=now;a.approvedById=staff.id;a.approvedByName=staff.name||staff.role||'GESTOR';a.rejectedAt=null;a.rejectedById='';a.releasedAt=null;a.lastActionAt=now;
    activateManualTransition(staff,a,now);
    if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_ACCESS_APPROVED',{source:'FINAL_TABLE_ACCESS',table:a.table,dealerId:a.dealerId,dealerName:a.dealerName,deviceId:a.deviceId,approvedBy:staff.id,approvedByName:staff.name||'',levelIndex:+state.levelIndex||0,mode:state.finalTableMode});
    save();return{ok:true,access:{...a},transition:state.finalTableTransition||null};
  }
  function reject({staff}={}){
    ensure();const a=access();
    if(!isPrivileged(staff))return{ok:false,error:'SOMENTE TD, FLOOR OU GESTOR PODE RECUSAR O ACESSO À FT.'};
    if(a.status!=='PENDING')return{ok:false,error:'NÃO HÁ SOLICITAÇÃO PENDENTE PARA RECUSAR.'};
    const now=Date.now();a.status='REJECTED';a.active=false;a.rejectedAt=now;a.rejectedById=staff.id;a.approvedAt=null;a.approvedById='';a.approvedByName='';a.lastActionAt=now;
    if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_ACCESS_REJECTED',{source:'FINAL_TABLE_ACCESS',table:a.table,dealerId:a.dealerId,dealerName:a.dealerName,deviceId:a.deviceId,rejectedBy:staff.id,rejectedByName:staff.name||''});
    save();return{ok:true,access:{...a}};
  }
  function checkIn(opts={}){return requestCheckIn(opts)}
  function checkOut({staff}={}){
    ensure();const a=access();if(a.status==='IDLE')return{ok:true};
    const privileged=isPrivileged(staff),mine=a.deviceId===deviceId();
    if(!mine&&!privileged)return{ok:false,error:'ESTE APARELHO NÃO É O CONTROLADOR ATIVO.'};
    if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_DEALER_CHECKOUT',{source:'DEALER_STATION',table:a.table,dealerId:a.dealerId,dealerName:a.dealerName,deviceId:a.deviceId,releasedBy:staff?.id||''});
    a.status='RELEASED';a.active=false;a.releasedAt=Date.now();a.lastActionAt=Date.now();save();return{ok:true};
  }
  function setTarget(value){const h=ensure();const n=Math.max(1,Math.floor(+value||10));state.finalTableHandsPerLevel=n;h.target=n;h.completed=Math.min(h.completed,h.target);h.updatedAt=Date.now();save();return snapshot()}
  function setCompleted(value){const h=ensure();h.completed=Math.max(0,Math.min(h.target,Math.floor(+value||0)));h.updatedAt=Date.now();save();return snapshot()}
  function nextHand(){const h=ensure();if(!isManualMode())return snapshot();if(h.completed<h.target)h.completed+=1;h.updatedAt=Date.now();access().lastActionAt=Date.now();if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_HAND_COMPLETED',{levelIndex:+state.levelIndex||0,completed:h.completed,target:h.target,source:'FINAL_TABLE_HANDS',dealerId:access().dealerId,deviceId:deviceId()});save();return snapshot()}
  function prevHand(){const h=ensure();if(!isManualMode())return snapshot();h.completed=Math.max(0,h.completed-1);h.updatedAt=Date.now();access().lastActionAt=Date.now();if(typeof auditEvent==='function')auditEvent('FINAL_TABLE_HAND_REMOVED',{levelIndex:+state.levelIndex||0,completed:h.completed,target:h.target,source:'FINAL_TABLE_HANDS',dealerId:access().dealerId,deviceId:deviceId()});save();return snapshot()}
  function authorizedNextHand(){if(!isManualMode())return{ok:false,error:state.finalTableStructureMode==='MANUAL'?'AGUARDANDO CHECK IN E LIBERAÇÃO DO DEALER DA MESA FINAL.':'MESA FINAL CONFIGURADA COM TEMPORIZADOR.'};if(!canControl())return{ok:false,error:'O APARELHO AINDA NÃO FOI LIBERADO PARA A FINAL TABLE.'};return{ok:true,snapshot:nextHand()}}
  function authorizedPrevHand(){if(!isManualMode())return{ok:false,error:state.finalTableStructureMode==='MANUAL'?'AGUARDANDO CHECK IN E LIBERAÇÃO DO DEALER DA MESA FINAL.':'MESA FINAL CONFIGURADA COM TEMPORIZADOR.'};if(!canControl())return{ok:false,error:'O APARELHO AINDA NÃO FOI LIBERADO PARA A FINAL TABLE.'};return{ok:true,snapshot:prevHand()}}
  function reset(){const h=ensure();h.completed=0;h.updatedAt=Date.now();save();return snapshot()}
  window.FinalTableHands={ensure,snapshot,setTarget,setCompleted,nextHand,prevHand,authorizedNextHand,authorizedPrevHand,reset,deviceId,access,canControl,checkIn,requestCheckIn,approve,reject,checkOut,isPrivileged,isManualMode};
  ensure();
})();