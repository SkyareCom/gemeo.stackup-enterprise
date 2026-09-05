const fs=require('fs');
const failures=[];
const assert=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};
const registered=fs.readFileSync('environment-registered.html','utf8');
const context=fs.readFileSync('environment-context.js','utf8');
const ui=fs.readFileSync('ui-standard.js','utf8');
assert('Ambientes cadastrados possui SELECIONAR',registered.includes('SELECIONAR')&&registered.includes('data-select-environment'));
assert('Ambientes cadastrados possui EDITAR',registered.includes('EDITAR')&&registered.includes('data-edit-environment'));
assert('Ambientes cadastrados possui APAGAR',registered.includes('APAGAR')&&registered.includes('data-delete-environment'));
assert('Ambiente selecionado é persistido',registered.includes('state.activeEnvironmentId=club.id')&&registered.includes('saveState()'));
assert('Edição atualiza ambiente ativo',registered.includes('state.activeEnvironmentName=name')&&registered.includes('state.clubName=name'));
assert('Exclusão limpa ambiente ativo',registered.includes("state.activeEnvironmentId=''"));
assert('Contexto aplica ambiente no STAFF',context.includes("page!=='staff.html'")&&context.includes("club.value=active.id"));
assert('Contexto aplica ambiente nos JOGADORES',context.includes("page!=='players-directory.html'")&&context.includes('recent.environmentId=active.id'));
assert('Contexto aplica ambiente em TORNEIOS',context.includes("page!=='setup.html'")&&context.includes('field.value=active.name'));
assert('UI global carrega contexto de ambiente',ui.includes('environment-context.js?v='));
if(failures.length){failures.forEach(f=>console.error('FAIL:',f));process.exit(1)}
console.log('ENVIRONMENT CONTEXT AUDIT PASS');