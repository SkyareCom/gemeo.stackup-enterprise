(()=>{
'use strict';
if((location.pathname.split('/').pop()||'').toLowerCase()!=='control.html')return;
const $=id=>document.getElementById(id);
function cleanHub(){
 const hub=$('controlOperationalHub');if(!hub)return;
 const r=$('hubRegistrationsCount');if(r)r.style.display='none';
 const c=$('hubCheckinCount');if(c)c.style.display='none';
 for(const id of ['hubEarlyBonus','hubAddonBonusToggle']){const b=$(id);if(b){b.style.display='flex';b.style.flexDirection='column';b.style.alignItems='center';b.style.justifyContent='center';b.style.gap='4px';b.style.lineHeight='1.15'}}
 for(const id of ['hubEarlyBonusState','hubAddonBonusState']){const x=$(id);if(x){x.style.display='block';x.style.margin='0';x.style.lineHeight='1.15'}}
}
function cleanLegacy(){
 const main=document.querySelector('main.app');if(!main)return;
 const op=[...main.querySelectorAll('.section')].find(x=>x.textContent.trim()==='OPERAÇÃO DO TORNEIO');
 if(op){
   const links=op.nextElementSibling;
   if(links?.classList.contains('links')){
     const anchors=[...links.querySelectorAll('a')];
     const keepers=anchors.filter(a=>['dealer.html','staff.html'].includes((a.getAttribute('href')||'').toLowerCase()));
     if(keepers.length){
       const keep=document.createElement('div');keep.className='links';keep.id='staffDealerOnly';keepers.forEach(a=>keep.appendChild(a));links.replaceWith(keep);
     }else links.remove();
   }
   op.textContent='EQUIPE E DEALER';
 }
 const quick=[...main.querySelectorAll('.section')].find(x=>x.textContent.trim()==='AJUSTES RÁPIDOS');if(quick){const links=quick.nextElementSibling;if(links?.classList.contains('links'))links.remove();quick.remove()}
 const bottom=main.querySelector('.bottomActions');if(bottom)bottom.remove();
}
function normalizeCards(){
 document.querySelectorAll('#controlOperationalHub .hubInfo').forEach(card=>{card.style.minHeight='64px';card.style.display='flex';card.style.flexDirection='column';card.style.justifyContent='center';card.style.alignItems='flex-start';card.style.gap='6px'});
}
function apply(){cleanHub();cleanLegacy();normalizeCards()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply();setTimeout(apply,100)},{once:true});else{apply();setTimeout(apply,100)}
const mo=new MutationObserver(()=>apply());document.addEventListener('DOMContentLoaded',()=>{if(document.body)mo.observe(document.body,{childList:true,subtree:true})},{once:true});
})();