/* Tope v5 — núcleo: datos y cálculo (sin DOM, probado en node) */
(function(root){
"use strict";
const KEY="tope.v5";
const pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const fromIso=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const ym=d=>d.getFullYear()+"-"+pad(d.getMonth()+1);
const ymOf=s=>s.slice(0,7);
const addM=(k,n)=>{const [y,m]=k.split("-").map(Number);const d=new Date(y,m-1+n,1);return ym(d)};
const diffM=(a,b)=>{const [y1,m1]=a.split("-").map(Number),[y2,m2]=b.split("-").map(Number);return (y2-y1)*12+(m2-m1)};
const dim=k=>{const [y,m]=k.split("-").map(Number);return new Date(y,m,0).getDate()};
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const R=n=>Math.round(n);

const CATS=[
 {id:"super",n:"Supermercado",ic:"cart",c:"#E8AA2A",v:1},
 {id:"comb",n:"Combustible",ic:"fuel",c:"#3FA89B"},
 {id:"salidas",n:"Salidas",ic:"glass",c:"#C2455E"},
 {id:"transp",n:"Transporte",ic:"car",c:"#3FA89B",v:1},
 {id:"compras",n:"Compras",ic:"bag",c:"#7C8AA5"},
 {id:"salud",n:"Salud",ic:"heart",c:"#5FAE72",v:1},
 {id:"casa",n:"Casa",ic:"home",c:"#D98B4A",v:1},
 {id:"farmacia",n:"Farmacia",ic:"plus",c:"#5FAE72",v:1},
 {id:"servicios",n:"Servicios",ic:"bolt",c:"#5E8FD1",v:1},
 {id:"mascota",n:"Mascota",ic:"paw",c:"#D98B4A"},
 {id:"otros",n:"Otros",ic:"dots",c:"#7C8AA5"}
];
const fresh=()=>({v:5,setup:false,
 cfg:{savePct:25,savePctM:{},fx:1200,fxAuto:true,fxAt:0,floor:0},
 cats:JSON.parse(JSON.stringify(CATS)),
 mov:[],rec:[],spr:[],goals:[],inv:[],debts:[],
 init:{ars:0,usd:0},typ:{},ui:{tab:"hoy",per:"mes"}});

function load(store){try{const j=JSON.parse(store.getItem(KEY));if(j&&j.v===5)return j}catch(e){}return fresh()}
function save(store,S){try{store.setItem(KEY,JSON.stringify(S))}catch(e){}}

/* ---- fechas útiles ---- */
function lastBizDay(k){const [y,m]=k.split("-").map(Number);const d=new Date(y,m,0);while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()-1);return d}
function nthBizDay(k,n){const [y,m]=k.split("-").map(Number);const d=new Date(y,m-1,1);let c=0;for(;;){if(d.getDay()!==0&&d.getDay()!==6){c++;if(c===n)return d}d.setDate(d.getDate()+1)}}
function recDay(r,k){ // día del mes en que cae un ítem recurrente
 if(r.day==="last")return lastBizDay(k).getDate();
 if(typeof r.day==="string"&&r.day[0]==="b")return nthBizDay(k,+r.day.slice(1)).getDate();
 return Math.min(+r.day||1,dim(k));
}
/* ocurrencias de un recurrente dentro de un mes: [{date,key}] */
function occs(r,k){
 if(r.kind==="anual")return [];
 const out=[];const sm=ymOf(r.start||"1970-01-01");
 if(r.every&&r.unit==="w"){ // cada X semanas
  const [y,m]=k.split("-").map(Number);let d=fromIso(r.start);const end=new Date(y,m,0);
  while(d<=end){if(ym(d)===k&&(!r.end||iso(d)<=r.end))out.push({date:iso(d),key:iso(d)});d.setDate(d.getDate()+7*r.every)}
  return out.filter(o=>!r.paused||o.date<r.paused);
 }
 const every=r.every||1;const df=diffM(sm,k);
 if(df<0||df%every!==0)return out;
 if(r.end&&k>ymOf(r.end)&&!(k===ymOf(r.end)))return out;
 if(r.paused&&k>=ymOf(r.paused))return out;
 const date=k+"-"+pad(recDay(r,k));
 out.push({date,key:k});return out;
}
function incomeMonthOf(date,feeds){const k=ymOf(date);return feeds==="next"?addM(k,1):k}

/* ---- cálculo del mes ---- */
function calc(S,k,today){
 const T=today||iso(new Date());
 const fx=S.cfg.fx||1;
 const conf=new Set(S.mov.filter(m=>m.rid).map(m=>m.rid+"|"+m.occ));
 const confMov={};S.mov.forEach(m=>{if(m.rid)confMov[m.rid+"|"+m.occ]=m});
 let ingresos=0,ingEst=0,fijos=0,cuotas=0,fondo=0;const fijosList=[],pend=[];
 // ingresos reales del mes (movimientos tipo i)
 S.mov.forEach(m=>{if(m.t==="i"&&!m.rid&&incomeMonthOf(m.d,m.feeds)===k)ingresos+=m.a});
 S.rec.forEach(r=>{
  if(r.kind==="ingreso"){
   // cada ocurrencia que alimenta el mes k
   const kk=r.feeds==="next"?addM(k,-1):k;
   occs(r,kk).forEach(o=>{const c=confMov[r.id+"|"+o.key];if(c)ingresos+=c.a;else{ingresos+=r.a;ingEst+=r.a;pend.push({kind:"ingreso",r,date:o.date,occ:o.key,a:r.a})}});
  }else if(r.kind==="gasto"){
   occs(r,k).forEach(o=>{const c=confMov[r.id+"|"+o.key];const a=c?c.a:R(r.cur==="USD"?r.a*fx:r.a);fijos+=a;fijosList.push({r,date:o.date,occ:o.key,a,done:!!c});if(!c)pend.push({kind:"gasto",r,date:o.date,occ:o.key,a})});
  }else if(r.kind==="anual"){
   const n=Math.max(1,diffM(ymOf(r.start),ymOf(r.due)));const df=diffM(ymOf(r.start),k);
   if(df>=0&&df<n){fondo+=R((r.cur==="USD"?r.a*fx:r.a)/n)}
   if(k===ymOf(r.due)){const key=ymOf(r.due);const c=confMov[r.id+"|"+key];if(!c)pend.push({kind:"anual",r,date:r.due,occ:key,a:R(r.cur==="USD"?r.a*fx:r.a)})}
  }
 });
 S.spr.forEach(s=>{const df=diffM(s.start,k);if(df>=0&&df<s.n&&!s.ended)cuotas+=R(s.total/s.n)});
 const pct=(S.cfg.savePctM&&S.cfg.savePctM[k]!=null?S.cfg.savePctM[k]:S.cfg.savePct)/100;
 const ahorro=R(ingresos*pct);
 const libre=ingresos-ahorro-fijos-cuotas-fondo;
 const varMov=S.mov.filter(m=>(m.t==="g"||m.t==="r")&&!m.rid&&ymOf(m.d)===k);
 const varSpent=varMov.reduce((s,m)=>s+(m.t==="r"?-m.a:m.a),0);
 return {k,ingresos,ingEst,ahorro,fijos,cuotas,fondo,libre,varSpent,rest:libre-varSpent,fijosList,pend,varMov};
}
/* semana (lun–dom, cortada al cambiar el mes) con arrastre */
function week(S,today){
 const T=fromIso(today),k=ym(T);const c=calc(S,k,today);
 const dow=(T.getDay()+6)%7;let a=new Date(T);a.setDate(a.getDate()-dow);
 let b=new Date(a);b.setDate(b.getDate()+6);
 const mStart=new Date(T.getFullYear(),T.getMonth(),1),mEnd=new Date(T.getFullYear(),T.getMonth()+1,0);
 if(a<mStart)a=mStart;if(b>mEnd)b=mEnd;
 const days=Math.round((b-a)/864e5)+1,toEnd=Math.round((mEnd-a)/864e5)+1;
 const before=S.mov.filter(m=>(m.t==="g"||m.t==="r")&&!m.rid&&ymOf(m.d)===k&&m.d<iso(a)).reduce((s,m)=>s+(m.t==="r"?-m.a:m.a),0);
 const allow=R((c.libre-before)*days/toEnd);
 const spent=S.mov.filter(m=>(m.t==="g"||m.t==="r")&&!m.rid&&m.d>=iso(a)&&m.d<=iso(b)&&m.d<=today).reduce((s,m)=>s+(m.t==="r"?-m.a:m.a),0);
 const hoy=S.mov.filter(m=>m.t==="g"&&!m.rid&&m.d===today).reduce((s,m)=>s+m.a,0);
 return {from:iso(a),to:iso(b),allow,spent,left:allow-spent,hoy,month:c,dayOfMonth:T.getDate(),dim:mEnd.getDate()};
}
/* sueldos pendientes y gasto por categoría en un rango */
function byCat(S,from,to){
 const o={};S.mov.forEach(m=>{if((m.t==="g"||m.t==="r")&&m.d>=from&&m.d<=to)o[m.c]=(o[m.c]||0)+(m.t==="r"?-m.a:m.a)});return o;
}
function spentRange(S,from,to){return Object.values(byCat(S,from,to)).reduce((s,v)=>s+v,0)}
/* cajas */
function boxes(S){
 let ars=S.init.ars||0,usd=S.init.usd||0;
 S.mov.forEach(m=>{
  if(m.ini)return;
  if(m.t==="i")ars+=m.a;
  else if(m.t==="g"){if(m.pu)usd-=m.u;else ars-=m.a}
  else if(m.t==="r")ars+=m.a;
  else if(m.t==="a"){ars-=m.a;usd+=m.u||0}
  else if(m.t==="d")ars-=m.a;
  else if(m.t==="dc")ars+=m.a;
  else if(m.t==="aj")ars+=m.a; // ajuste de control (+/-)
 });
 return {ars:R(ars),usd:Math.round(usd*100)/100};
}
function debtsTotal(S){return S.debts.reduce((s,d)=>s+(d.cur==="USD"?d.a*S.cfg.fx:d.a),0)}
function owedTotal(S){return S.mov.filter(m=>m.t==="d"&&!m.closed).reduce((s,m)=>s+m.a,0)}
function invTotal(S){return S.inv.reduce((s,i)=>s+(i.cur==="USD"?i.v*S.cfg.fx:i.v),0)}
function netWorth(S){const b=boxes(S);return R(b.ars+b.usd*S.cfg.fx+invTotal(S)+owedTotal(S)-debtsTotal(S))}
function goalSaved(S,g){return (g.saved0||0)+S.mov.filter(m=>m.t==="a"&&m.goal===g.id).reduce((s,m)=>s+(g.cur==="USD"?(m.u||0):m.a),0)}
function goalMonthly(S,g){ // aporte mensual real: ahorro a la meta de los últimos 3 meses completos
 const T=ym(new Date());const k0=addM(T,-3);
 const s=S.mov.filter(m=>m.t==="a"&&m.goal===g.id&&ymOf(m.d)>=k0&&ymOf(m.d)<T).reduce((s,m)=>s+(g.cur==="USD"?(m.u||0):m.a),0);
 return s/3;
}
/* serie de patrimonio mes a mes (aprox.: cajas con el dólar vigente) */
function netSeries(S,nowYm){
 const first=S.mov.reduce((m,x)=>x.d<m?x.d:m,iso(new Date()));const start=ymOf(first);
 const out=[];let k=start;
 while(k<=nowYm){
  const last=k+"-"+pad(dim(k));const sub={...S,mov:S.mov.filter(m=>m.d<=last)};
  out.push({k,v:netWorth(sub)});k=addM(k,1);
 }
 return out;
}
/* más usados: por frecuencia, con el monto típico (mediana) */
function usual(S,n){
 const f={};S.mov.filter(m=>m.t==="g"&&!m.rid).forEach(m=>{(f[m.c]=f[m.c]||[]).push(m.a)});
 const arr=Object.entries(f).map(([c,v])=>{v.sort((a,b)=>a-b);return {c,n:v.length,a:S.typ[c]||v[Math.floor(v.length/2)]}});
 arr.sort((a,b)=>b.n-a.n);
 const base=["super","comb","salidas"].filter(c=>!arr.find(x=>x.c===c)).map(c=>({c,n:0,a:S.typ[c]||0}));
 return arr.concat(base).slice(0,n||3);
}
/* próximos pagos (pendientes de los próximos 45 días) */
function upcoming(S,today,n){
 const k=ymOf(today);const all=[...calc(S,k,today).pend,...calc(S,addM(k,1),today).pend].filter(p=>p.kind!=="ingreso"&&p.date>=today.slice(0,8)+"01");
 all.sort((a,b)=>a.date<b.date?-1:1);
 return all.filter(p=>p.date>=today||true).slice(0,n||4);
}
function daysTo(a,b){return Math.round((fromIso(a)-fromIso(b))/864e5)}

const T={KEY,fresh,load,save,iso,fromIso,ym,ymOf,addM,diffM,dim,uid,R,pad,lastBizDay,nthBizDay,recDay,occs,incomeMonthOf,calc,week,byCat,spentRange,boxes,debtsTotal,owedTotal,invTotal,netWorth,goalSaved,goalMonthly,netSeries,usual,upcoming,daysTo,CATS};
if(typeof module!=="undefined"&&module.exports)module.exports=T;else root.T=T;
})(typeof globalThis!=="undefined"?globalThis:this);
