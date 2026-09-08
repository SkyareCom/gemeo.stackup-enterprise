(()=>{
'use strict';
const api=window.StackupScreenMessages;if(!api)return;

const updates={
  lastRegistration:{
    title:'ÚLTIMO NÍVEL PARA REGISTRO NO TORNEIO',
    pt:'ATENÇÃO JOGADORES, ESTE É O ÚLTIMO NÍVEL PARA REGISTRO NO TORNEIO.',
    en:'ATTENTION PLAYERS, THIS IS THE LAST LEVEL FOR TOURNAMENT REGISTRATION.',
    es:'ATENCIÓN JUGADORES, ESTE ES EL ÚLTIMO NIVEL PARA REGISTRARSE EN EL TORNEO.'
  },
  lastRebuy:{
    title:'ÚLTIMO NÍVEL PARA REBUYS',
    pt:'AVISO IMPORTANTE: ESTE É O ÚLTIMO NÍVEL PARA REBUYS.',
    en:'IMPORTANT NOTICE: THIS IS THE LAST LEVEL FOR REBUYS.',
    es:'AVISO IMPORTANTE: ESTE ES EL ÚLTIMO NIVEL PARA REBUYS.'
  },
  lastEntry:{
    title:'ÚLTIMO NÍVEL PARA ENTRADAS E REENTRADAS',
    pt:'AVISO IMPORTANTE: ESTE É O ÚLTIMO NÍVEL PARA ENTRADAS E REENTRADAS.',
    en:'IMPORTANT NOTICE: THIS IS THE LAST LEVEL FOR ENTRIES AND RE-ENTRIES.',
    es:'AVISO IMPORTANTE: ESTE ES EL ÚLTIMO NIVEL PARA ENTRADAS Y REENTRADAS.'
  },
  lastRebuyEntry:{
    title:'ÚLTIMO NÍVEL PARA ENTRADAS, REENTRADAS E REBUYS',
    pt:'AVISO IMPORTANTE: ESTE É O ÚLTIMO NÍVEL PARA ENTRADAS, REENTRADAS E REBUYS.',
    en:'IMPORTANT NOTICE: THIS IS THE LAST LEVEL FOR ENTRIES, RE-ENTRIES AND REBUYS.',
    es:'AVISO IMPORTANTE: ESTE ES EL ÚLTIMO NIVEL PARA ENTRADAS, REENTRADAS Y REBUYS.'
  }
};

Object.entries(updates).forEach(([id,u])=>{
  let row=api.PT?.find(r=>r[0]===id);
  if(!row&&api.PT){row=[id,u.title,u.pt,'auto'];api.PT.push(row)}
  if(row){row[1]=u.title;row[2]=u.pt}
  if(api.TEXT?.pt)api.TEXT.pt[id]=u.pt;
  if(api.TEXT?.en)api.TEXT.en[id]=u.en;
  if(api.TEXT?.es)api.TEXT.es[id]=u.es;
});

window.dispatchEvent(new CustomEvent('stackup-screen-message-config'));
})();