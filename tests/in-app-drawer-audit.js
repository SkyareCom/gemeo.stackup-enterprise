const fs=require('fs');

const failures=[];
const htmlFiles=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
const hasInlineRuntime=html=>html.includes('shared.js')||html.includes('data-entry-standard.js')||html.includes('in-app-lists.js');

for(const file of htmlFiles){
  const html=fs.readFileSync(file,'utf8');
  const hasSelect=/<select\b/i.test(html);
  const hasDialog=/<dialog\b|\.showModal\s*\(/i.test(html);
  const opensWindow=/\bwindow\.open\s*\(/i.test(html);
  if(hasSelect&&!hasInlineRuntime(html))failures.push(`${file}: possui SELECT sem runtime de lista inline`);
  if(hasDialog)failures.push(`${file}: usa DIALOG/modal nativo; deve ser gaveta inline`);
  if(opensWindow)failures.push(`${file}: abre janela externa com window.open`);
}

const listSource=fs.readFileSync('in-app-lists.js','utf8');
for(const required of ['stackup-select-trigger','stackup-select-list','MutationObserver','data-stackup-drawer']){
  if(!listSource.includes(required))failures.push(`in-app-lists.js: falta padrão obrigatório ${required}`);
}
const entrySource=fs.readFileSync('data-entry-standard.js','utf8');
if(!entrySource.includes('in-app-lists.js'))failures.push('data-entry-standard.js: não carrega componente global de listas/gavetas');

if(failures.length){
  failures.forEach(f=>console.error('FAIL:',f));
  process.exit(1);
}
console.log(`IN-APP DRAWER AUDIT PASS: ${htmlFiles.length} páginas verificadas.`);
