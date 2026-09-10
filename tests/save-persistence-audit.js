const fs=require('fs');
const failures=[];
const read=f=>fs.readFileSync(f,'utf8');
const ok=(name,cond)=>{if(cond)console.log('PASS:',name);else failures.push(name)};
const setup=read('setup.html'),history=read('tournament-history.js'),structureImport=read('structure-import.html'),screen=read('screen-settings.html'),finalTable=read('final-table-settings.html'),finance=read('finance-settings.html'),labels=read('save-action-labels-v1.js'),rankingRules=read('ranking-rules.html'),theme=read('app-theme.js'),pages=read('.github/workflows/pages.yml');
ok('Estrutura do torneio possui SALVAR',setup.includes('id="saveStructure"')&&setup.includes('SALVAR'));
ok('Estrutura salva possui confirmação real',setup.includes('id="confirmSaveStructure"')&&setup.includes('state.savedStructures'));
ok('Torneio possui SALVAR TORNEIO explícito',history.includes('id="saveTournamentBtn"')&&history.includes('SALVAR TORNEIO'));
ok('SALVAR TORNEIO persiste em savedTournaments',history.includes('state.savedTournaments.unshift(data)')&&history.includes('saveState()'));
ok('Runtime global carrega histórico/salvamento de torneios',theme.includes('tournament-history.js'));
ok('Artefato Pages injeta SALVAR TORNEIO explicitamente',pages.includes("appendIfMissing('tournament-history.js'")&&pages.includes('ranking-hierarchy-setup-v1.js'));
ok('Importação de estrutura possui SALVAR',structureImport.includes('id="saveBtn"')&&structureImport.includes('SALVAR EM CONFIGURAÇÕES'));
ok('Configurações de tela possuem SALVAR CONFIGURAÇÕES',screen.includes('id="saveBtn"')&&screen.includes('SALVAR CONFIGURAÇÕES'));
ok('Mesa final possui SALVAR',finalTable.includes('id="saveBtn"')&&finalTable.includes('>SALVAR<'));
ok('Configuração financeira possui persistência principal',finance.includes('id="save"')&&finance.includes('StackupFinance.save(cfg)'));
ok('Configuração financeira expõe SALVAR em vez de botão ambíguo',labels.includes('SALVAR CONFIGURAÇÕES FINANCEIRAS')&&labels.includes('SALVAR REGRA DO JOGADOR'));
ok('Critérios do ranking possuem SALVAR',rankingRules.includes('SALVAR CRITÉRIOS E REGRAS')&&rankingRules.includes('StackupRanking.saveRule'));
if(failures.length){console.error(`SAVE PERSISTENCE AUDIT FAILED: ${failures.length}`);failures.forEach(x=>console.error('- '+x));process.exit(1)}
console.log('SAVE PERSISTENCE AUDIT PASS');