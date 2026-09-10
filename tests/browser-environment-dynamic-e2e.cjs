const {chromium}=require('playwright');
const BASE=process.env.STACKUP_E2E_BASE||'http://127.0.0.1:4173';
const failures=[];let checks=0;
function assert(name,ok,detail=''){checks++;if(ok)console.log('PASS:',name);else{const msg=name+(detail?` • ${detail}`:'');failures.push(msg);console.error('FAIL:',msg)}}
(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:412,height:915}});
  const now=Date.now();
  const state={
    eventId:'event-env',tournamentName:'EVENTO QA',clubId:'club-a',clubName:'CLUBE A',activeEnvironmentId:'club-a',activeEnvironmentName:'CLUBE A',activeEnvironmentType:'CLUB',prepared:false,
    authClubs:[{id:'club-a',name:'CLUBE A',type:'CLUB',active:true},{id:'league-b',name:'LIGA B',type:'LEAGUE',active:true}],
    authPeople:[{id:'person-owner',cpf:'11111111111',name:'OWNER QA',pin:'1234',active:true},{id:'person-b',cpf:'22222222222',name:'STAFF B',pin:'1234',active:true}],
    staffUsers:[{id:'owner',personId:'person-owner',clubId:'club-a',name:'OWNER QA',role:'OWNER',active:true},{id:'staff-b',personId:'person-b',clubId:'league-b',name:'STAFF B',role:'FLOOR',active:true}],
    authMemberships:[{id:'m-owner',personId:'person-owner',clubId:'club-a',staffId:'owner',role:'OWNER',permissions:['*'],active:true},{id:'m-b',personId:'person-b',clubId:'league-b',staffId:'staff-b',role:'FLOOR',permissions:[],active:true}],
    players:[],transactions:[],savedTournaments:[],auditLog:[],messageQueue:[],messageLog:[]
  };
  const session={id:'session-owner',personId:'person-owner',personName:'OWNER QA',clubId:'club-a',clubName:'CLUBE A',membershipId:'m-owner',staffId:'owner',role:'OWNER',permissions:['*'],deviceId:'qa-device',startedAt:now};
  await context.addInitScript(({state,session})=>{
    localStorage.setItem('stackup-production-reset-version','2026-09-04-professional-v1');
    localStorage.setItem('poker-club-state-v4',JSON.stringify(state));
    localStorage.setItem('stackup-auth-session-v1',JSON.stringify(session));
    localStorage.setItem('stackup-auth-login-v1',JSON.stringify({personId:session.personId,authenticatedAt:Date.now()}));
    localStorage.setItem('stackup-active-environment-v1','club-a');
  },{state,session});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  try{
    await page.goto(`${BASE}/environment-registered.html`,{waitUntil:'domcontentloaded',timeout:15000});
    await page.locator('#selectMode').waitFor({state:'visible',timeout:5000});
    assert('Ambiente ativo inicial é exibido',(await page.locator('#activeEnvironmentName').innerText()).includes('CLUBE A'));
    await page.locator('#selectMode').click();
    const pick=page.locator('[data-pick-environment="league-b"]');
    await pick.waitFor({state:'visible',timeout:3000});
    await pick.check();
    assert('Selecionar ambiente revela ações',await page.locator('[data-fix-environment="league-b"]').isVisible());
    await page.locator('[data-fix-environment="league-b"]').click();
    let snap=await page.evaluate(()=>({id:state.activeEnvironmentId,name:state.activeEnvironmentName,type:state.activeEnvironmentType}));
    assert('FIXAR troca o ambiente ativo',snap.id==='league-b'&&snap.name==='LIGA B'&&snap.type==='LEAGUE',JSON.stringify(snap));
    assert('Cabeçalho acompanha ambiente fixado',(await page.locator('#activeEnvironmentName').innerText()).includes('LIGA B'));
    await page.locator('[data-edit-environment="league-b"]').click();
    const name=page.locator('[data-edit-name="league-b"]');await name.fill('LIGA B EDITADA');
    await page.locator('[data-save-environment="league-b"]').click();
    snap=await page.evaluate(()=>({club:state.authClubs.find(x=>x.id==='league-b'),activeName:state.activeEnvironmentName}));
    assert('EDITAR persiste o novo nome',snap.club?.name==='LIGA B EDITADA'&&snap.activeName==='LIGA B EDITADA',JSON.stringify(snap));
    page.once('dialog',d=>d.accept());
    await page.locator('[data-delete-environment="league-b"]').click();
    snap=await page.evaluate(()=>({club:state.authClubs.find(x=>x.id==='league-b'),active:state.activeEnvironmentId,membership:state.authMemberships.find(x=>x.id==='m-b')}));
    assert('APAGAR desativa o ambiente',snap.club?.active===false,JSON.stringify(snap));
    assert('APAGAR limpa ambiente ativo quando necessário',snap.active==='',JSON.stringify(snap));
    assert('APAGAR desativa vínculos do ambiente',snap.membership?.active===false,JSON.stringify(snap));
    assert('Fluxo de ambientes sem exceções JavaScript',errors.length===0,errors.join(' | '));
  }catch(e){assert('Fluxo Chromium AMBIENTES conclui',false,e.stack||e.message)}
  finally{await context.close();await browser.close()}
  if(failures.length){console.error(`BROWSER ENVIRONMENT DYNAMIC E2E FAILED: ${failures.length} falha(s).`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
  console.log(`BROWSER ENVIRONMENT DYNAMIC E2E PASS: ${checks} verificações reais de seleção, edição e exclusão.`);
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
