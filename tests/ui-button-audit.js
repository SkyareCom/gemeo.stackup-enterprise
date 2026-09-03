const fs=require('fs');
const path=require('path');

const root=process.cwd();
const htmlFiles=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
const allFiles=new Set(fs.readdirSync(root));
const failures=[];
const warnings=[];
let buttonCount=0, linkCount=0;

const stripQuery=s=>String(s||'').split('#')[0].split('?')[0];
const isExternal=s=>/^(?:https?:|mailto:|tel:|javascript:|data:|#)/i.test(String(s||''));
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

function localScripts(html){
  const out=[];
  for(const m of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/gi)){
    const src=stripQuery(m[1]);
    if(!src||isExternal(src))continue;
    const file=path.basename(src);
    if(allFiles.has(file))out.push(fs.readFileSync(path.join(root,file),'utf8'));
    else failures.push(`SCRIPT AUSENTE: ${file}`);
  }
  for(const m of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi))out.push(m[1]);
  return out.join('\n');
}

function likelyBound(attrs, code){
  if(/\bonclick\s*=|\bonchange\s*=|\bonpointer|\bontouch|\bonmousedown|\bonmouseup/i.test(attrs))return true;
  const id=(attrs.match(/\bid=["']([^"']+)["']/i)||[])[1];
  const cls=(attrs.match(/\bclass=["']([^"']+)["']/i)||[])[1]||'';
  const dataAttrs=[...attrs.matchAll(/\bdata-([\w-]+)=/gi)].map(m=>m[1]);
  if(id){
    const e=esc(id);
    const patterns=[
      new RegExp(`\\b${e}\\s*\\.\\s*onclick\\s*=`),
      new RegExp(`getElementById\\(\\s*['\"]${e}['\"]\\s*\\)[\\s\\S]{0,120}?addEventListener\\(`),
      new RegExp(`querySelector\\(\\s*['\"]#${e}['\"]\\s*\\)[\\s\\S]{0,120}?addEventListener\\(`),
      new RegExp(`['\"]#${e}['\"]`),
      new RegExp(`['\"]${e}['\"]`)
    ];
    if(patterns.some(r=>r.test(code)))return true;
  }
  for(const c of cls.split(/\s+/).filter(Boolean)){
    const e=esc(c);
    if(new RegExp(`querySelectorAll\\(\\s*['\"][^'\"]*\\.${e}`).test(code)||new RegExp(`closest\\(\\s*['\"][^'\"]*\\.${e}`).test(code))return true;
  }
  for(const d of dataAttrs){
    const e=esc(d);
    if(new RegExp(`data-${e}`).test(code))return true;
  }
  return false;
}

function insideAnchor(html,index){
  const before=html.slice(0,index);
  return before.lastIndexOf('<a')>before.lastIndexOf('</a>');
}

for(const file of htmlFiles){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const code=localScripts(html);

  for(const m of html.matchAll(/<a\b([^>]*?)\bhref=["']([^"']+)["'][^>]*>/gi)){
    linkCount++;
    const href=m[2];
    if(!href||isExternal(href))continue;
    const target=stripQuery(href);
    if(target&&!allFiles.has(path.basename(target)))failures.push(`${file}: LINK LOCAL AUSENTE -> ${href}`);
  }

  for(const m of html.matchAll(/<button\b([^>]*)>/gi)){
    buttonCount++;
    const attrs=m[1]||'';
    if(/\bdisabled\b/i.test(attrs))continue;
    if(insideAnchor(html,m.index||0))continue;
    const type=(attrs.match(/\btype=["']([^"']+)["']/i)||[])[1]||'submit';
    if(type.toLowerCase()==='submit'&&/<form\b/i.test(html))continue;
    if(!likelyBound(attrs,code)){
      const id=(attrs.match(/\bid=["']([^"']+)["']/i)||[])[1]||'(sem id)';
      warnings.push(`${file}: BOTÃO SEM VÍNCULO ESTÁTICO EVIDENTE -> ${id}`);
    }
  }
}

console.log(`UI AUDIT: ${htmlFiles.length} páginas, ${buttonCount} botões, ${linkCount} links.`);
for(const w of warnings)console.log('WARN:',w);
if(failures.length){
  for(const f of failures)console.error('FAIL:',f);
  process.exit(1);
}
if(warnings.length){
  for(const w of warnings)console.error('FAIL:',w);
  process.exit(1);
}
console.log('UI AUDIT PASS: todos os botões têm ação/navegação identificável e todos os alvos locais existem.');
