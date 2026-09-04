const fs=require('fs');

const failures=[];
const htmlFiles=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
const hasUiRuntime=html=>html.includes('shared.js')||html.includes('data-entry-standard.js')||html.includes('ui-standard.js')||html.includes('app-theme.js');
const hasDrawerRuntime=html=>html.includes('shared.js')||html.includes('data-entry-standard.js')||html.includes('in-app-lists.js');

for(const file of htmlFiles){
  const html=fs.readFileSync(file,'utf8');
  const hasSelect=/<select\b/i.test(html);
  const hasDialog=/<dialog\b|\.showModal\s*\(/i.test(html);
  const opensWindow=/\bwindow\.open\s*\(/i.test(html);
  const interactive=/<button\b|<select\b|type=["'](?:button|submit|reset)["']|role=["']button["']/i.test(html);
  if(interactive&&!hasUiRuntime(html))failures.push(`${file}: tela interativa sem runtime global de botões/fonte`);
  if(hasSelect&&!hasDrawerRuntime(html))failures.push(`${file}: possui SELECT sem runtime de lista inline`);
  if(hasDialog)failures.push(`${file}: usa DIALOG/modal nativo; deve ser gaveta inline`);
  if(opensWindow)failures.push(`${file}: abre janela externa com window.open`);
}

const listSource=fs.readFileSync('in-app-lists.js','utf8');
for(const required of ['stackup-select-trigger','stackup-select-list','MutationObserver','data-stackup-drawer',"font-family:'Caacupe One'",'border:0!important','background:transparent!important','border-bottom:1px solid #27342D!important']){
  if(!listSource.includes(required))failures.push(`in-app-lists.js: falta padrão obrigatório ${required}`);
}
const fontDecls=[...listSource.matchAll(/font-family\s*:\s*([^;`}]*)/gi)].map(m=>m[1]);
if(fontDecls.some(v=>!/Caacupe One/i.test(v)))failures.push('in-app-lists.js: contém font-family fora do padrão CAACUPE ONE');
if(/\.stackup-select-option[^}]*border:1px solid/si.test(listSource))failures.push('in-app-lists.js: opções ainda parecem novos cards em vez de lista no card atual');

const uiSource=fs.readFileSync('ui-standard.js','utf8');
for(const required of ["font-family:'Caacupe One'",'min-height:44px!important','border:1px solid #8DFC3B!important','border-radius:9px!important','justify-content:center!important']){
  if(!uiSource.includes(required))failures.push(`ui-standard.js: falta padrão global ${required}`);
}
const uiFontDecls=[...uiSource.matchAll(/font-family\s*:\s*([^;`}]*)/gi)].map(m=>m[1]);
if(uiFontDecls.some(v=>!/Caacupe One/i.test(v)))failures.push('ui-standard.js: contém font-family fora do padrão CAACUPE ONE');

const entrySource=fs.readFileSync('data-entry-standard.js','utf8');
if(!entrySource.includes('in-app-lists.js'))failures.push('data-entry-standard.js: não carrega componente global de listas/gavetas');
if(!entrySource.includes('ui-standard.js'))failures.push('data-entry-standard.js: não carrega padrão global de botões/fontes');

if(failures.length){failures.forEach(f=>console.error('FAIL:',f));process.exit(1)}
console.log(`UI STANDARD + IN-APP DRAWER AUDIT PASS: ${htmlFiles.length} páginas verificadas.`);
