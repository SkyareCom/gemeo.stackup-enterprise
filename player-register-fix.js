(function(){
  const $=id=>document.getElementById(id);
  const saveBtn=$('save');
  if(!saveBtn||typeof persist!=='function'||typeof render!=='function')return;
  const fields={
    name:$('name'),cpf:$('cpf'),birth:$('birth'),phone:$('phone'),whatsapp:$('whatsapp'),email:$('email'),instagram:$('instagram'),type:$('type'),team:$('team'),
    infoWhats:$('infoWhats'),infoSms:$('infoSms'),infoEmail:$('infoEmail')
  };
  const notice=document.createElement('div');
  notice.id='playerRegisterNotice';
  notice.className='meta';
  notice.style.marginTop='8px';
  notice.setAttribute('role','status');
  saveBtn.insertAdjacentElement('afterend',notice);
  const show=msg=>{notice.textContent=msg};
  saveBtn.onclick=()=>{
    const playerName=String(fields.name?.value||'').trim();
    const birthValue=String(fields.birth?.value||'').trim();
    if(!playerName){show('INFORME O NOME.');fields.name?.focus();return}
    if(birthValue&&typeof validBirth==='function'&&!validBirth(birthValue)){show('INFORME A DATA DE NASCIMENTO NO FORMATO DD / MM / AAAA.');fields.birth?.focus();return}
    players.push({
      id:'player-'+Date.now(),
      name:playerName,
      cpf:String(fields.cpf?.value||'').trim(),
      birth:birthValue,
      phone:String(fields.phone?.value||'').trim(),
      whatsapp:String(fields.whatsapp?.value||'').trim(),
      email:String(fields.email?.value||'').trim(),
      instagram:String(fields.instagram?.value||'').trim(),
      type:fields.type?.value||'PRO',
      team:String(fields.team?.value||'').trim(),
      info:[fields.infoWhats?.checked?'WHATSAPP':'',fields.infoSms?.checked?'SMS':'',fields.infoEmail?.checked?'EMAIL':''].filter(Boolean),
      createdAt:Date.now()
    });
    persist();
    if(typeof clearForm==='function')clearForm();
    render();
    show('JOGADOR CADASTRADO. O REGISTRO JÁ ESTÁ DISPONÍVEL EM JOGADORES CADASTRADOS.');
  };
})();