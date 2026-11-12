/* Tope v5 — pantallas: Hoy, Movimientos, Metas, Patrimonio */
(function(){
const PER=[["semana","Semana"],["mes","Mes"],["anio","Año"],["3a","3 años"],["5a","5 años"]];
function range(per,today){
 const d=T.fromIso(today);
 if(per==="semana"){const dow=(d.getDay()+6)%7;const a=new Date(d);a.setDate(d.getDate()-dow);const b=new Date(a);b.setDate(a.getDate()+6);return {from:T.iso(a),to:T.iso(b)}}
 if(per==="mes"){const k=T.ym(d);return {from:k+"-01",to:k+"-"+T.pad(T.dim(k))}}
 if(per==="anio")return {from:d.getFullYear()+"-01-01",to:d.getFullYear()+"-12-31"};
 const y=per==="3a"?3:5;return {from:T.iso(new Date(d.getFullYear()-y,d.getMonth(),d.getDate())),to:today};
}
function shiftR(per,today,off){
 if(per==="mes"){const k=T.addM(today.slice(0,7),-off);return {r:{from:k+"-01",to:k+"-"+T.pad(T.dim(k))},lab:off?A.monthName(k):"Este mes"}}
 if(per==="semana"){const d=T.fromIso(today);d.setDate(d.getDate()-7*off);const r=range("semana",T.iso(d));return {r,lab:off?A.dateShort(r.from)+" al "+A.dateShort(r.to):"Esta semana"}}
 if(per==="anio"){const y=+today.slice(0,4)-off;return {r:{from:y+"-01-01",to:y+"-12-31"},lab:off?String(y):"Este año"}}
 return {r:range(per,today),lab:""}}
function dnav(per,dr){if(!(per==="mes"||per==="semana"||per==="anio"))return "";return `<span class="dnav"><button data-a="doff" data-d="1" aria-label="Anterior"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><span>${dr.lab}</span><button data-a="doff" data-d="-1" aria-label="Siguiente" ${(A._doff||0)<=0?"disabled":""}><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></span>`}
A.act.doff=b=>{A._doff=Math.max(0,(A._doff||0)+ +b.dataset.d);A._sel=null;A._drill=null;A.renderHoy()};
function ruler(per,today){
 const d=T.fromIso(today);let n,idx,txt;
 if(per==="semana"){n=7;idx=(d.getDay()+6)%7;txt="día "+(idx+1)+" de 7"}
 else if(per==="mes"){n=T.dim(T.ym(d));idx=d.getDate()-1;txt="día "+d.getDate()+" de "+n}
 else if(per==="anio"){n=12;idx=d.getMonth();txt="mes "+(idx+1)+" de 12"}
 else{n=per==="3a"?36:60;idx=n-1;txt=per==="3a"?"últimos 3 años":"últimos 5 años"}
 let t="";for(let i=0;i<n;i++)t+=`<i class="${i<idx?"p":i===idx?"t":""}"></i>`;
 return {html:`<div class="ruler" aria-hidden="true">${t}</div>`,txt};
}
/* torta: categorías (con el ahorro como porción); al tocar una con detalle se abre otra torta con sus matices */
const AHC="#F3EBDD";
function slices(S,r,drill){
 if(drill){const c=A.cat(drill),subs=c.subs||[],by=T.bySub(S,r.from,r.to,drill),un=by._||0,n=subs.length+(un?1:0)||1;
  const segs=subs.map((x,i)=>({id:x.id,n:x.n,c:A.subc(c.c,i,n),v:by[x.id]||0})).filter(x=>x.v>0);
  if(un)segs.push({id:"_",n:"Sin detalle",c:A.subc(c.c,subs.length,n),v:un});
  segs.sort((a,b)=>b.v-a.v);return {segs,tot:segs.reduce((s,x)=>s+x.v,0),cat:c}}
 const by=T.byCat(S,r.from,r.to);const ent=Object.entries(by).filter(e=>e[1]>0).sort((a,b)=>b[1]-a[1]);
 const ah=T.ahorroRange(S,r.from,r.to);
 const tot=ent.reduce((s,e)=>s+e[1],0)+ah,spent=tot-ah;
 let main=ent.filter((e,i)=>i<6&&e[1]/tot>=.04),rest=ent.filter(e=>!main.includes(e));
 const segs=main.map(([id,v])=>({id,n:A.cat(id).n,c:A.cat(id).c,v}));
 if(rest.length)segs.push({id:"otros",n:"Otros",c:"#7A756A",v:rest.reduce((s,e)=>s+e[1],0),sub:rest});
 if(ah>0)segs.push({id:"_ah",n:"Ahorro",c:AHC,v:ah});
 /* nunca dos porciones del mismo color */
 const FB=["#FFC21A","#FF3B30","#35D07F","#8B5CF6","#FF8A00","#FF4D8D","#14B8A6","#A3E635","#E879F9","#A8683A"],used=new Set([AHC.toLowerCase(),"#7a756a"]);
 segs.forEach(sg=>{if(sg.id==="_ah"||sg.id==="otros")return;let c=sg.c.toLowerCase();if(used.has(c)){c=(FB.find(x=>!used.has(x.toLowerCase()))||c).toLowerCase();sg.c=c}used.add(c)});
 return {segs,tot,spent};
}
function donutSvg(sl,sel){
 const R0=79,W=24,C=2*Math.PI*R0,n=sl.segs.length;let base=`<circle cx="100" cy="100" r="${R0}" stroke="rgba(255,255,255,.06)" stroke-width="${W}"/>`,top="",off=0;
 const P=(r,a)=>[(100+r*Math.cos(a)).toFixed(2),(100+r*Math.sin(a)).toFixed(2)];
 sl.segs.forEach(s=>{const on=sel===s.id,dim=sel&&!on,full=C*s.v/sl.tot,ex=on?4:0,op=dim?.3:1;let el;
  if(n===1)el=`<circle data-a="slice" data-i="${s.id}" cx="100" cy="100" r="${R0}" stroke="${s.c}" stroke-width="${W+ex*2}" style="cursor:pointer"/>`;
  else{const gap=8,ins=2,sg=gap/2+ins; // esquinas apenas redondeadas: sector con borde del mismo color
   const a0=-Math.PI/2+(off+sg)/R0,a1=-Math.PI/2+(off+full-sg)/R0;const w=Math.max(a1-a0,.02),b0=a0,b1=a0+w;
   const ro=R0+W/2+ex-ins,ri=R0-W/2-ex+ins,lg=w>Math.PI?1:0;const [x1,y1]=P(ro,b0),[x2,y2]=P(ro,b1),[x3,y3]=P(ri,b1),[x4,y4]=P(ri,b0);
   el=`<path data-a="slice" data-i="${s.id}" d="M${x1} ${y1}A${ro} ${ro} 0 ${lg} 1 ${x2} ${y2}L${x3} ${y3}A${ri} ${ri} 0 ${lg} 0 ${x4} ${y4}Z" fill="${s.c}" stroke="${s.c}" stroke-width="${ins*2}" stroke-linejoin="round" style="cursor:pointer;transition:opacity .18s" opacity="${op}"/>`}
  if(on)top+=el;else base+=el;off+=full});
 return `<svg viewBox="0 0 200 200" role="img" aria-label="En qué se fue la plata"><g fill="none">${base}${top}</g></svg>`;
}
function hasSubs(S,r,id){const c=A.cat(id);return !!(c.subs&&c.subs.length&&S.mov.some(m=>(m.t==="g"||m.t==="r")&&m.c===id&&m.s&&m.d>=r.from&&m.d<=r.to))}
A.drawDonut=function(){
 const el=document.getElementById("dnw");if(!el||!A._dn)return;const {r,per}=A._dn;
 if(A._drill&&!hasSubs(A.S,r,A._drill))A._drill=null;
 const sl=slices(A.S,r,A._drill);
 const sel=sl.segs.find(x=>x.id===A._sel)?A._sel:null;if(!sel)A._sel=null;
 const cur=sel?sl.segs.find(x=>x.id===sel):null,dc=sl.cat;
 const top=dc?`<span class="dl" style="color:${dc.c}">‹ ${A.esc(dc.n)}</span>`:`<span class="dl">${sl.spent!=null?"Gastaste":"Total"}</span>`;
 const center=cur?`<span class="dl" style="color:${cur.c}">${A.esc(cur.n)}</span><b>${A.money(cur.v)}</b><span class="dl">${Math.round(cur.v/sl.tot*100)}%</span>`:`${top}<b>${A.money(sl.spent!=null?sl.spent:sl.tot)}</b>`;
 const mvRow=(m,name)=>`<button class="dr" data-a="edit" data-id="${m.id}"><span class="dd">${A.dateShort(m.d).replace(/^\S+ /,"")}</span><span>${A.esc(m.note||name)}${m.tag?` · ${A.esc(m.tag)}`:""}</span><b>${m.t==="r"?"+ ":""}${A.money(m.a)}</b></button>`;
 const inR=m=>m.d>=r.from&&m.d<=r.to;
 let det="";
 if(cur){
  let rows;
  if(cur.id==="otros")rows=cur.sub.map(([id,v])=>`<button class="dr" data-a="slice" data-i="${id}"><i style="background:${A.cat(id).c}"></i><span>${A.esc(A.cat(id).n)}</span><b>${A.money(v)}</b></button>`).join("");
  else if(cur.id==="_ah")rows=A.S.mov.filter(m=>m.t==="a"&&inR(m)).sort((a,b)=>a.d<b.d?1:-1).map(m=>{const g=m.goal&&A.S.goals.find(x=>x.id===m.goal);return `<button class="dr" data-a="edit" data-id="${m.id}"><span class="dd">${A.dateShort(m.d).replace(/^\S+ /,"")}</span><span>${g?A.esc(g.name):"Ahorro"}${m.u?" · USD "+A.fmt2(m.u):""}</span><b>${A.money(m.a)}</b></button>`}).join("");
  else if(A._drill)rows=A.S.mov.filter(m=>(m.t==="g"||m.t==="r")&&m.c===A._drill&&(m.s||"_")===cur.id&&inR(m)).sort((a,b)=>a.d<b.d?1:-1).map(m=>mvRow(m,cur.n)).join("");
  else rows=A.S.mov.filter(m=>(m.t==="g"||m.t==="r")&&m.c===cur.id&&inR(m)).sort((a,b)=>a.d<b.d?1:-1).map(m=>mvRow(m,cur.n)).join("");
  det=`<div class="dets">${rows}</div>`}
 else if(A._drill)det=`<div class="dets">${sl.segs.map(x=>`<button class="dr" data-a="slice" data-i="${x.id}"><i style="background:${x.c}"></i><span>${A.esc(x.n)}</span><em>${Math.round(x.v/sl.tot*100)}%</em><b>${A.money(x.v)}</b></button>`).join("")}</div>`;
 else det="";
 const back=A._drill?`<button class="addl" style="padding:6px 0" data-a="slice" data-i="">‹ Volver a todo</button>`:"";
 el.innerHTML=sl.tot?`<div class="dn"><div class="dsvg">${donutSvg(sl,sel)}<button class="dc" data-a="slice" data-i="">${center}</button></div></div><div class="dleg">${sl.segs.map(x=>`<button data-a="slice" data-i="${x.id}"><i style="background:${x.c}"></i>${A.esc(x.n)}</button>`).join("")}</div>${back}${det}`:`<div class="empty" style="padding:26px 0">Todavía no hay movimientos en este período.</div>`;
};
A.act.slice=b=>{const id=b.dataset.i;
 if(!id){if(A._sel)A._sel=null;else A._drill=null;A.drawDonut();return}
 if(!A._drill&&id!=="otros"&&id!=="_ah"&&A._dn&&hasSubs(A.S,A._dn.r,id)&&A._sel!==id){A._drill=id;A._sel=null;A.drawDonut();return}
 if(!A._drill&&A._dn&&A.S.cats.some(c=>c.id===id)&&b.classList.contains("dr")){A._sel=id;A.drawDonut();return}
 A._sel=(A._sel===id)?null:id;A.drawDonut()};
function dayLabel(date,today){const n=T.daysTo(date,today);return n===0?"vence hoy":n===1?"mañana":n>1?"en "+n+" días":n===-1?"venció ayer":"venció hace "+(-n)+" días"}

A.renderHoy=function(){
 const S=A.S,today=A.today(),per=S.ui.per||"mes";
 const w=T.week(S,today),m=w.month,r=range(per,today),ru=ruler(per,today);
 const spent=T.spentRange(S,r.from,r.to);
 let big,lab,wk=[],bar="",negBig=false;
 const ahMes=A.money(T.ahorroRange(S,today.slice(0,7)+"-01",today.slice(0,7)+"-31"));
 if(per==="mes"){big=m.rest;lab=m.rest<0?"Te pasaste este mes":"Podés gastar este mes";wk.push([w.left<0?"Esta semana te pasaste":"Esta semana te quedan",A.money(Math.abs(w.left))]);wk.push(["Ahorrado este mes",ahMes]);
  const pct=w.allow>0?Math.max(0,Math.min(100,w.spent/w.allow*100)):(w.spent>0?100:0);
  bar=`<div class="bar ${w.left<0?"red":""}"><div style="width:${pct}%"></div></div>`}
 else if(per==="semana"){big=w.left;lab=w.left<0?"Te pasaste esta semana":"Podés gastar esta semana";wk.push([m.rest<0?"Este mes te pasaste":"Este mes te quedan",A.money(Math.abs(m.rest))]);wk.push(["Ahorrado este mes",ahMes]);
  const pct=w.allow>0?Math.max(0,Math.min(100,w.spent/w.allow*100)):(w.spent>0?100:0);
  bar=`<div class="bar ${w.left<0?"red":""}"><div style="width:${pct}%"></div></div>`}
 else{big=spent;lab=per==="anio"?"Gastaste este año":per==="3a"?"Gastaste en 3 años":"Gastaste en 5 años";
  const sv=S.mov.filter(x=>x.t==="a"&&x.d>=r.from&&x.d<=r.to).reduce((s,x)=>s+x.a,0);wk.push(["Ahorraste",A.money(sv)])}
 negBig=big<0;if(per==="mes"||per==="semana")big=Math.abs(big);
 const dr=shiftR(per,today,A._doff||0);A._dn={r:dr.r,per};if(A._selPer!==per){A._sel=null;A._drill=null;A._selPer=per}
 const bx=T.boxes(S);
 let av="";
 m.pend.filter(p=>p.kind==="ingreso"&&p.date<=today).forEach(p=>{av+=`<button class="tile aviso" data-a="cobre" data-rid="${p.r.id}" data-occ="${p.occ}"><span class="d">${+p.date.slice(8)}</span><span class="m">${A.esc(p.r.name)}<small>por confirmar · ${dayLabel(p.date,today)}</small></span><span class="a">${A.money(p.a)}</span></button>`});
 const up=T.upcoming(S,today);
 const soon=up.filter(p=>T.daysTo(p.date,today)<=7).reduce((s,p)=>s+p.a,0);
 const short=soon>0&&bx.ars<soon;
 const upH=up.length?up.map((p,i)=>`<button class="tile ${short&&i===0?"warn":""} ${p.date<today?"late":""}" data-a="pago" data-rid="${p.r.id}" data-occ="${p.occ}"><span class="d">${+p.date.slice(8)}</span><span class="m">${A.esc(p.r.name)}<small>${short&&i===0?"Ojo: la plata en pesos no alcanza · ":""}${dayLabel(p.date,today)}</small></span><span class="a">${A.money(p.a)}</span></button>`).join(""):`<div class="note" style="margin:2px 0 8px">No quedan pagos este mes.</div>`;
 const rowL="En qué se va la plata";
 const ahReg=T.ahorroRange(S,r.from,r.to),ahRem=Math.max(0,m.ahorro-ahReg);
 const mk=today.slice(0,7),by=T.byCat(S,mk+"-01",mk+"-31"),lc=S.cats.filter(c=>c.lim>0);
 const limH=per==="mes"?`<div class="h3" style="display:flex;justify-content:space-between;align-items:baseline"><span>Límites del mes</span><button class="addl" data-a="limnuevo">+ Definir</button></div>`+(lc.length?lc.map(c=>{const g=by[c.id]||0,p=g/c.lim,col=p>=1?"var(--warn)":p>=.8?"#FFC21A":"#35D07F";return `<button class="lim" data-a="limedit" data-id="${c.id}"><span class="lt"><b>${A.esc(c.n)}</b><em style="color:${p>=1?"var(--warn)":"var(--mute)"}">${p>=1?"te pasaste "+A.money(g-c.lim):"quedan "+A.money(c.lim-g)}</em></span><span class="lb"><i style="width:${Math.min(100,p*100)}%;background:${col}"></i></span><span class="ln">${A.money(g)} de ${A.money(c.lim)}</span></button>`}).join(""):`<div class="note" style="margin:2px 0 8px">Ponele un tope mensual a Súper, Salidas o lo que quieras y te aviso cuando te acerques.</div>`):"";
 const ahT=(per==="mes"&&m.ahorro>0&&ahRem>0)?`<button class="tile ahor" data-a="ahorrar"><span class="d">$</span><span class="m">Ahorro del mes<small>Falta anotar · ${ahReg>0?"ya anotaste "+A.money(ahReg):"todavía no anotaste nada"}</small></span><span class="a">${A.money(ahRem)}</span></button>`:"";
 $h.innerHTML=`<div class="field">
 <div class="fdate"><button data-a="ajustes" aria-label="Fecha y ajustes">${A.dateLong(today)} <svg class="gear" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg></button><small>${ru.txt}</small></div>
 ${ru.html}
 <div class="seg" role="tablist">${PER.map(p=>`<button class="${p[0]===per?"on":""}" data-a="per" data-p="${p[0]}" role="tab">${p[1]}</button>`).join("")}</div>
 <div class="lab">${lab}</div>
 <div class="big ${negBig?"neg":""}"><span class="cur">$</span><span id="bigv">${A.fmt(big)}</span></div>
 ${wk.map((x,i)=>`<div class="wk"><span>${x[0]}</span><b>${x[1]}</b></div>${i===0?bar:""}`).join("")}
 </div>
 <div class="below">
 <div class="row2"><span>${rowL}</span>${dnav(per,dr)}</div>
 <div id="dnw"></div>
 ${A.avisosHoy?A.avisosHoy():""}
 ${ahT}
 ${limH}
 ${av?`<div class="h3">Para confirmar</div>${av}`:""}
 <div class="h3" style="display:flex;justify-content:space-between;align-items:baseline"><span>Próximos pagos</span><button class="addl" data-a="pagonuevo">+ Agregar</button></div>${upH}
 </div>`;
 A.drawDonut();
 const from=A._big;A._big=big;A.countTo(document.getElementById("bigv"),big,(from!=null&&A._bigPer===per)?from:null);A._bigPer=per;document.getElementById('bigv').dataset.final=A.fmt(big);A.fitBig();
};
const $h=A.$("#s-hoy");
A._doff=0;A.act.per=b=>{A._doff=0;A.S.ui.per=b.dataset.p;A.persist();A.renderHoy()};

/* ---------- Movimientos ---------- */
function mvInfo(m){
 const c=A.cat(m.c);
 const sn=A.subName(m.c,m.s),cl=sn?c.n+" · "+sn:c.n;
 if(m.t==="g")return {ic:A.ic(c.ic,c.c),t:m.note||sn||c.n,s:[m.note?cl:(sn?c.n:""),m.tag||"",m.u?"USD "+A.fmt2(m.u):""].filter(Boolean).join(" · "),a:A.money(m.a)};
 if(m.t==="r")return {ic:A.ic(c.ic,c.c),t:m.note||"Reintegro",s:c.n,a:"+ "+A.money(m.a),cls:"in"};
 if(m.t==="i")return {ic:A.ic("income","var(--ok)"),t:m.note||"Ingreso",s:m.feeds==="next"?"para el mes que viene":"ingreso",a:"+ "+A.money(m.a),cls:"in"};
 if(m.t==="a"){const g=A.S.goals.find(x=>x.id===m.goal);return {ic:A.ic("coin"),t:"Ahorro",s:(g?g.name+" · ":"")+(m.u?"USD "+A.fmt2(m.u):""),a:A.money(m.a)}}
 if(m.t==="d")return {ic:A.ic("owe","#7C8AA5"),t:"Me deben"+(m.note?" · "+m.note:""),s:m.closed?"cobrado":"a cobrar",a:A.money(m.a)};
 if(m.t==="dc")return {ic:A.ic("income","var(--ok)"),t:"Cobré "+(m.note||""),s:"no cuenta como ingreso",a:"+ "+A.money(m.a),cls:"in"};
 return {ic:A.ic("dots"),t:m.note||"Ajuste",s:"ajuste de control",a:(m.a>=0?"+ ":"")+A.money(m.a)};
}
function mvList(){
 const S=A.S,f=A.f;let l=S.mov.map((m,i)=>({m,i}));
 if(f.m!=="all")l=l.filter(x=>x.m.d.slice(0,7)===f.m);
 if(f.c)l=l.filter(x=>x.m.c===f.c);if(f.tag)l=l.filter(x=>x.m.tag===f.tag);
 if(f.q){const q=f.q.toLowerCase();l=l.filter(x=>((x.m.note||"")+" "+A.cat(x.m.c).n+" "+x.m.a+" "+(x.m.tag||"")).toLowerCase().includes(q))}
 l.sort((a,b)=>a.m.d<b.m.d?1:a.m.d>b.m.d?-1:b.i-a.i);
 const g=l.filter(x=>x.m.t==="g").reduce((s,x)=>s+x.m.a,0),inn=l.filter(x=>x.m.t==="i").reduce((s,x)=>s+x.m.a,0);
 let h=`<div class="row2" style="margin-top:14px"><span>${f.c||f.tag||f.q?"Total del filtro":"Gastado"}</span><b>${A.money(g)}</b></div>${inn?`<div class="note" style="margin-top:2px">Ingresos del período: ${A.money(inn)}</div>`:""}`;
 if(!l.length)return h+`<div class="empty">Todavía no hay movimientos acá.<br>Tocá el + para anotar el primero.</div>`;
 let cur="",items=[];const flush=()=>{if(!cur)return;const tot=items.filter(x=>x.m.t==="g").reduce((s,x)=>s+x.m.a,0);h+=`<div class="day"><span>${A.dateShort(cur)}</span><b>${tot?A.money(tot):""}</b></div>`+items.map(x=>{const i=mvInfo(x.m);return `<button class="mv" data-a="edit" data-id="${x.m.id}">${i.ic}<span class="t"><b>${A.esc(i.t)}</b><small>${A.esc(i.s)}</small></span><span class="a ${i.cls||""}">${i.a}</span></button>`}).join("")};
 l.forEach(x=>{if(x.m.d!==cur){flush();cur=x.m.d;items=[]}items.push(x)});flush();return h;
}
A.renderMov=function(){
 const S=A.S,f=A.f;if(!f.m)f.m=A.today().slice(0,7);
 const tags=[...new Set(S.mov.map(m=>m.tag).filter(Boolean))];
 const vw=f.view==="an";
 if(vw){A.$("#s-mov").innerHTML=`<div class="pad"><h1 class="title">Historial</h1><div class="seg" style="margin-top:10px"><button data-a="mview" data-v="lista">Lista</button><button class="on" data-a="mview" data-v="an">Análisis</button></div><div id="anb"></div></div>`;A.renderAn(document.getElementById("anb"));return}
 A.$("#s-mov").innerHTML=`<div class="pad"><h1 class="title">Historial</h1><div class="seg" style="margin-top:10px"><button class="on" data-a="mview" data-v="lista">Lista</button><button data-a="mview" data-v="an">Análisis</button></div>
 <input class="search" id="q" type="search" placeholder="Buscar por nota o monto" value="${A.esc(f.q)}" autocomplete="off">
 <div class="chips"><button class="chip" data-a="mprev" aria-label="Mes anterior">‹</button><span class="chip on" style="min-width:128px;justify-content:center">${f.m==="all"?"Todo":A.monthName(f.m)}</span><button class="chip" data-a="mnext" aria-label="Mes siguiente">›</button>
 <button class="chip" data-a="mall">${f.m==="all"?"Ver mes":"Ver todo"}</button></div>
 <div class="chips"><select class="chip" id="fc"><option value="">Todas las categorías</option>${S.cats.map(c=>`<option value="${c.id}" ${f.c===c.id?"selected":""}>${A.esc(c.n)}</option>`).join("")}</select>
 ${tags.length?`<select class="chip" id="ft"><option value="">Todas las etiquetas</option>${tags.map(t=>`<option ${f.tag===t?"selected":""}>${A.esc(t)}</option>`).join("")}</select>`:""}</div>
 <div id="mvl">${mvList()}</div></div>`;
};
A.act.mprev=()=>{A.f.m=T.addM(A.f.m==="all"?A.today().slice(0,7):A.f.m,-1);A.renderMov()};
A.act.mnext=()=>{A.f.m=T.addM(A.f.m==="all"?A.today().slice(0,7):A.f.m,1);A.renderMov()};
A.act.mall=()=>{A.f.m=A.f.m==="all"?A.today().slice(0,7):"all";A.renderMov()};
document.addEventListener("input",e=>{if(e.target.id==="q"){A.f.q=e.target.value;A.$("#mvl").innerHTML=mvList()}});
document.addEventListener("change",e=>{if(e.target.id==="fc"){A.f.c=e.target.value;A.renderMov()}if(e.target.id==="ft"){A.f.tag=e.target.value;A.renderMov()}});

/* ---------- Metas ---------- */
A.vitalMonthly=function(){
 const S=A.S,t=A.today().slice(0,7);const ks=[T.addM(t,-1),T.addM(t,-2),T.addM(t,-3)];const tot=S.mov.filter(m=>m.t==="g"&&T.isVital(S,m)&&ks.includes(m.d.slice(0,7))).reduce((s,m)=>s+m.a,0);
 const months=ks.filter(k=>S.mov.some(m=>m.d.slice(0,7)===k)).length;
 if(months)return tot/months;
 const c=T.calc(S,t,A.today());return c.fijos;
};
A.goalTarget=g=>{if(g.auto==="colchon"){const v=A.vitalMonthly()*6;return g.cur==="USD"?v/(A.S.cfg.fx||1):v}return g.a};
A.renderMetas=function(){
 const S=A.S,gc=S.ui.gcur||(S.goals[0]&&S.goals[0].cur)||"ARS",fx=S.cfg.fx||1;
 const conv=(v,cur)=>gc===cur?v:(gc==="USD"?v/fx:v*fx);
 const f=v=>gc==="USD"?"USD "+A.fmt(v):"$ "+A.fmt(v);
 const gl=S.goals;
 let h=`<div class="pad"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:calc(15px*var(--k,1));font-weight:600;color:var(--cream2)">${gl.length?"Meta principal":"Metas"}</span>
 <span class="chips" style="margin:0"><button class="chip ${gc==="ARS"?"on":""}" data-a="gcur" data-c="ARS">Pesos</button><button class="chip ${gc==="USD"?"on":""}" data-a="gcur" data-c="USD">Dólares</button></span></div>`;
 if(!gl.length)h+=`<h1 class="title" style="margin-top:6px">Tus metas</h1><div class="empty">Todavía no cargaste ninguna.<br>La casa, un viaje o el colchón: elegí cuánto y para cuándo.</div>`;
 gl.forEach((g,i)=>{
  const tgt=A.goalTarget(g),sv=T.goalSaved(S,g),p=tgt>0?Math.min(100,sv/tgt*100):0,mo=T.goalMonthly(S,g,A.today());
  const left=Math.max(0,tgt-sv);const meses=mo>0?Math.ceil(left/mo):null;
  let line="";if(g.auto==="colchon"&&tgt<=0)line="Se calcula con 6 meses de tus gastos vitales.";
  else if(left<=0)line="Meta cumplida.";
  else if(meses)line=`Con ${f(conv(mo,g.cur))} por mes llegás en ${meses>=24?Math.floor(meses/12)+" años"+(meses%12?" y "+(meses%12)+(meses%12===1?" mes":" meses"):""):meses+(meses===1?" mes":" meses")}.`;
  else line="Todavía no hay aportes: anotá un ahorro y elegí esta meta.";
  if(g.date&&left>0){const mm=Math.max(1,T.diffM(A.today().slice(0,7),g.date.slice(0,7)));line+=` Para llegar en ${A.monthName(g.date.slice(0,7))} necesitás ${f(conv(left/mm,g.cur))} por mes.`}
  if(i===0)h+=`<button data-a="goal" data-id="${g.id}" style="display:block;width:100%"><h1 class="title" style="margin-top:6px">${A.esc(g.name)}</h1>
   ${(g.ic||"home")==="home"?`<div style="margin:14px 0 -44px">${A.casa(p,g.name+": "+Math.round(p)+"% reunido")}</div>`:""}
   <div class="row2" style="margin-top:4px"><b style="font-size:calc(34px*var(--k,1))">${f(conv(sv,g.cur))} <small style="display:block;margin-top:2px;font-size:calc(15px*var(--k,1));font-family:var(--body);font-weight:400;color:var(--mute)">de ${f(conv(tgt,g.cur))}</small></b><b style="font-size:calc(30px*var(--k,1));color:#F0C25A">${Math.round(p)}%</b></div>
   <div class="prog" style="height:4px"><div style="width:${p}%"></div></div><div class="note">${line}</div></button><div style="height:18px"></div>`;
  else h+=`<button class="card" data-a="goal" data-id="${g.id}" style="display:block;width:100%"><h4>${A.ic(g.ic||"plane")}<span>${A.esc(g.name)}</span><span style="margin-left:auto;font-family:var(--disp);color:#F0C25A">${Math.round(p)}%</span></h4><div class="prog"><div style="width:${p}%"></div></div><div class="note">${f(conv(sv,g.cur))} de ${f(conv(tgt,g.cur))}${g.pct?" · "+g.pct+"% del ahorro":""}</div></button>`;
 });
 h+=`<button class="go ghost" data-a="goalnew">+ Nueva meta</button></div>`;
 A.$("#s-metas").innerHTML=h;
};
A.act.gcur=b=>{A.S.ui.gcur=b.dataset.c;A.persist();A.renderMetas()};

/* ---------- Patrimonio ---------- */
function smooth(p){if(p.length<2)return "";let d=`M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
 for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c;
  d+=` C${(b[0]+(c[0]-a[0])/6).toFixed(1)} ${(b[1]+(c[1]-a[1])/6).toFixed(1)} ${(c[0]-(e[0]-b[0])/6).toFixed(1)} ${(c[1]-(e[1]-b[1])/6).toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`}return d}
A.renderPat=function(){
 const S=A.S,cur=S.ui.cur||"ARS",fx=S.cfg.fx||1,nw=T.netWorth(S),bx=T.boxes(S);
 const dv=v=>cur==="USD"?v/fx:v,fm=v=>cur==="USD"?"USD "+A.fmt(v):"$ "+A.fmt(v);
 const ser=T.netSeries(S,A.today().slice(0,7));let chart="";
 if(ser.length>=3){const W=342,H=96,vs=ser.map(s=>dv(s.v)),lo=Math.min(0,...vs),hi=Math.max(0,...vs),rg=(hi-lo)||1;
  const Y=v=>H-8-(v-lo)/rg*(H-20);const pts=vs.map((v,i)=>[i*W/(vs.length-1),Y(v)]);const l=pts[pts.length-1];
  const d=vs[vs.length-1]-vs[0],zero=lo<0&&hi>0?`<line x1="0" x2="${W}" y1="${Y(0).toFixed(1)}" y2="${Y(0).toFixed(1)}" stroke="rgba(247,239,221,.18)" stroke-dasharray="3 4"/>`:"";
  chart=`<div class="note" style="margin-top:10px">${d>=0?"Subió":"Bajó"} ${fm(Math.abs(d))} desde ${A.monthName(ser[0].k)}</div><svg width="100%" viewBox="0 0 ${W} ${H}" style="margin-top:8px;overflow:visible" aria-label="Evolución del patrimonio"><defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8AA2A" stop-opacity=".22"/><stop offset="1" stop-color="#E8AA2A" stop-opacity="0"/></linearGradient></defs>${zero}<path d="${smooth(pts)} L${W} ${H} L0 ${H} Z" fill="url(#pg)"/><path d="${smooth(pts)}" fill="none" stroke="#E8AA2A" stroke-width="2.4" stroke-linecap="round"/><circle cx="${l[0].toFixed(1)}" cy="${l[1].toFixed(1)}" r="4.5" fill="#0B0805" stroke="#E8AA2A" stroke-width="2.4"/></svg>
  <div class="row2" style="margin-top:6px"><span>${A.monthName(ser[0].k)}</span><span>${A.monthName(ser[ser.length-1].k)}</span></div>`}
 else chart=`<div class="note">La línea aparece cuando tengas 3 meses de movimientos.</div>`;
 const owed=S.mov.filter(m=>m.t==="d"&&!m.closed);
 const parts=[["Pesos",Math.max(0,bx.ars),"#FFC21A"],["Dólares",Math.max(0,bx.usd*fx),"#35D07F"],["Inversiones",T.invTotal(S),"#3AA0FF"],["Me deben",T.owedTotal(S),"#A78BFA"]].filter(x=>x[1]>0),ptot=parts.reduce((q,x)=>q+x[1],0),dbt=T.debtsTotal(S);
 const compo=ptot>0?`<div class="h3">De qué está hecho</div><div class="cbar">${parts.map(x=>`<i style="width:${x[1]/ptot*100}%;background:${x[2]}"></i>`).join("")}</div>${parts.map(x=>`<div class="crow"><span><i style="background:${x[2]}"></i>${x[0]}</span><span class="cp">${Math.round(x[1]/ptot*100)}%</span><b>${fm(dv(x[1]))}</b></div>`).join("")}${dbt>0?`<div class="crow"><span><i style="background:#FF3B30"></i>Deudas</span><span class="cp">${Math.round(dbt/ptot*100)}%</span><b style="color:var(--warn)">− ${fm(dv(dbt))}</b></div>`:""}`:"";
 let h=`<div class="pad"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:calc(15px*var(--k,1));font-weight:600;color:var(--cream2)">Patrimonio</span>
 <span class="chips" style="margin:0"><button class="chip ${cur==="ARS"?"on":""}" data-a="pcur" data-c="ARS">Pesos</button><button class="chip ${cur==="USD"?"on":""}" data-a="pcur" data-c="USD">Dólares</button></span></div>
 <div class="phero"><div class="lab" style="margin-top:0">Lo que tenés, menos lo que debés</div><div class="net"><span class="cur">${cur==="USD"?"USD":"$"}</span>${A.fmt(dv(nw))}</div>${chart}</div>
 ${compo}
 <div class="h3">Cajas</div>
 <button class="tile" data-a="control"><span class="m">En pesos<small>tocá para corregir el saldo</small></span><span class="a" style="color:var(--cream)">${A.money(bx.ars)}</span></button>
 <button class="tile" data-a="controlusd"><span class="m">En dólares<small>${A.usd(bx.usd)} al MEP de $ ${A.fmt(fx)}</small></span><span class="a" style="color:var(--cream)">${fm(dv(bx.usd*fx))}</span></button>
 <div class="h3">Inversiones</div>`;
 h+=S.inv.length?S.inv.map(i=>`<button class="tile" data-a="inv" data-id="${i.id}"><span class="m">${A.esc(i.name)}<small>${i.cur==="USD"?"USD":"$"} ${A.fmt(T.invVal(S,i))}</small></span><span class="a" style="color:var(--cream)">${fm(dv(i.cur==="USD"?T.invVal(S,i)*fx:T.invVal(S,i)))}</span></button>`).join(""):`<div class="note" style="margin:0 0 8px">Bitcoin, ETFs, acciones o CEDEARs: cargá cuánto valen hoy y actualizalo cuando quieras.</div>`;
 h+=`<button class="go ghost" data-a="invnew" style="margin-top:4px;height:46px">+ Agregar inversión</button>`;
 if(owed.length)h+=`<div class="h3">Me deben</div>`+owed.map(m=>`<button class="tile" data-a="edit" data-id="${m.id}"><span class="m">${A.esc(m.note||"Préstamo")}<small>tocá para marcarlo cobrado</small></span><span class="a" style="color:var(--cream)">${A.money(m.a)}</span></button>`).join("");
 h+=`<div class="h3">Deudas</div>`+(S.debts.length?S.debts.map(d=>`<button class="tile" data-a="debt" data-id="${d.id}"><span class="m">${A.esc(d.name)}</span><span class="a" style="color:var(--warn)">− ${d.cur==="USD"?"USD":"$"} ${A.fmt(d.a)}</span></button>`).join(""):"")+`<button class="go ghost" data-a="debtnew" style="margin-top:4px;height:46px">+ Agregar deuda</button>
 <div class="h3">Control</div><button class="go" data-a="control" style="margin-top:0">Contar cuánto tengo de verdad</button><div class="note">Si lo que tenés no coincide con lo anotado, la diferencia queda registrada.</div></div>`;
 A.$("#s-pat").innerHTML=h;
};
A.act.pcur=b=>{A.S.ui.cur=b.dataset.c;A.persist();A.renderPat()};

/* ---------- navegación ---------- */
const TABS=[["mov","Historial","list"],["hoy","Hoy","clock"],["gap"],["metas","Metas","home"],["pat","Patrimonio","chart"]];
A.drawTabs=function(){A.$("#tabs").innerHTML=TABS.map(t=>t[0]==="gap"?`<span class="gap"></span>`:`<button class="${A.S.ui.tab===t[0]?"on":""}" data-a="tab" data-t="${t[0]}" ${A.S.ui.tab===t[0]?'aria-current="page"':""}><svg viewBox="0 0 24 24"><path d="${A.P[t[2]]}"/></svg>${t[1]}</button>`).join("")};
A.render=function(){
 const tab=A.S.ui.tab;
 ({hoy:A.renderHoy,mov:A.renderMov,metas:A.renderMetas,pat:A.renderPat})[tab]();
 document.querySelectorAll(".screen").forEach(s=>{const on=s.id==="s-"+tab;s.classList.toggle("on",on);requestAnimationFrame(()=>s.classList.toggle("vis",on))});
 A.drawTabs();A.fitBig&&A.fitBig();
};
A.act.tab=b=>{if(A.S.ui.tab===b.dataset.t)return;A.S.ui.tab=b.dataset.t;A.persist();A.render()};
})();

A.fitBig=function(){document.querySelectorAll('.big,.net').forEach(e=>{e.style.fontSize='';const num=e.querySelector('#bigv')||e;const par=e.parentElement,w=par.clientWidth-8;if(w<=0)return;const txt=(num.dataset.final||num.textContent).replace(/\d/g,'0');let f=parseFloat(getComputedStyle(e).fontSize);const m=document.createElement('span');m.style.cssText='position:absolute;visibility:hidden;white-space:nowrap';m.style.font=getComputedStyle(e).font;m.style.letterSpacing=getComputedStyle(e).letterSpacing;m.textContent=txt;par.appendChild(m);let t=0;while(m.getBoundingClientRect().width+46>w&&f>40&&t++<40){f-=3;e.style.fontSize=f+'px';m.style.fontSize=f+'px'}m.remove()})};
window.addEventListener('resize',()=>A.fitBig&&A.fitBig());
