const fs=require('fs');
const failures=[];
const protectedPages=[
  'environments-hub.html','environment-register.html','environment-registered.html',
  'staff-hub.html','staff.html','players-hub.html','players-directory.html',
  'tournaments.html','tournament-manager.html','tournament-settings.html','setup.html','ready-tournaments.html','tournament-readiness.html','tournament-center.html','tournament-close.html',
  'checkin.html','checkin-players.html','pre-registration.html','presence.html','players.html','tournament-players.html','balancing.html','control.html','bounty.html',
  'ranking.html','ranking-tournament.html','ranking-general.html',
  'screen.html','broadcast.html','screen-settings.html','screen-alerts.html','screen-alerts-operation.html','transmission-room.html',
  'marketing.html','crm.html','communication-hub.html','communications.html',
  'financial-hub.html','finance.html','finance-settings.html','wallet.html',
  'ai-link.html','recognition.html','smart-registration.html','chip-count-ai.html'
];
for(const page of protectedPages){
  if(!fs.existsSync(page)){failures.push(`${page}: arquivo ausente`);continue}
  const html=fs.readFileSync(page,'utf8');
  if(!html.includes('auth-engine.js'))failures.push(`${page}: não carrega auth-engine.js`);
  if(!html.includes('StackupAuth.guard()'))failures.push(`${page}: não executa StackupAuth.guard()`);
}
const auth=fs.readFileSync('auth-engine.js','utf8');
for(const page of ['financial-hub.html','finance.html','finance-settings.html','wallet.html'])if(!auth.includes(`'${page}':'FINANCE'`)&&!auth.includes(`'${page}':'WALLET'`))failures.push(`${page}: sem permissão financeira mapeada`);
for(const page of ['communication-hub.html','communications.html'])if(!auth.includes(`'${page}':'MESSAGING'`))failures.push(`${page}: sem permissão MESSAGING mapeada`);
for(const page of ['marketing.html','crm.html'])if(!auth.includes(`'${page}':'MARKETING'`))failures.push(`${page}: sem permissão MARKETING mapeada`);
for(const page of ['staff-hub.html','staff.html'])if(!auth.includes(`'${page}':'STAFF_ADMIN'`))failures.push(`${page}: sem permissão STAFF_ADMIN mapeada`);
for(const page of ['environments-hub.html','environment-register.html','environment-registered.html'])if(!auth.includes(`'${page}':'ENVIRONMENT_ADMIN'`))failures.push(`${page}: sem permissão ENVIRONMENT_ADMIN mapeada`);
if(failures.length){console.error(`AUTH SURFACE AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log(`AUTH SURFACE AUDIT PASS: ${protectedPages.length} superfícies autenticadas verificadas.`);