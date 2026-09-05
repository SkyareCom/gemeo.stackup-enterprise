const fs=require('fs');
const failures=[];
const assert=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};
const standard=fs.readFileSync('confirmation-standard.js','utf8');
const ui=fs.readFileSync('ui-standard.js','utf8');
assert('padrão troca CONFIRMAR por CONFIRMADO',standard.includes("button.textContent='CONFIRMADO'"));
assert('padrão cria CADASTRAR NOVO',standard.includes("next.textContent='CADASTRAR NOVO'"));
assert('CADASTRAR NOVO restaura CONFIRMAR',standard.includes("button.textContent='CONFIRMAR'"));
assert('alert nativo substituído por aviso inline',standard.includes('window.alert=function(message)')&&standard.includes('showNotice(text')); 
assert('confirm nativo substituído por fluxo inline',standard.includes('window.confirm=function(message)')&&standard.includes("showNotice(String(message??''),'info')"));
assert('prompt nativo bloqueado sem popup',standard.includes('window.prompt=function(message)')&&standard.includes('return null'));
assert('nenhum fallback para alert nativo',!standard.includes('nativeAlert')&&!standard.includes('.alert.bind('));
assert('aviso inline possui aria-live',standard.includes("aria-live','polite"));
assert('ui-standard carrega confirmation-standard',ui.includes('confirmation-standard.js?v='));
for(const file of ['environment-register.html','staff.html','players-directory.html','setup.html','finance-settings.html']){
  const html=fs.readFileSync(file,'utf8');
  assert(`${file}: alcança padrão global`,html.includes('shared.js')||html.includes('ui-standard.js')||html.includes('finance-config.js'));
}
if(failures.length){failures.forEach(f=>console.error('FAIL:',f));process.exit(1)}
console.log('CONFIRMATION STANDARD AUDIT PASS');