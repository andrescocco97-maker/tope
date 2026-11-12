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
function ruler(per,today){
 const d=T.fromIso(today);let n,idx,txt;
 if(per==="semana"){n=7;idx=(d.getDay()+6)%7;txt="día "+(idx+1)+" de 7"}
 else if(per==="mes"){n=T.dim(T.ym(d));idx=d.getDate()-1;txt="día "+d.getDate()+" de "+n}
 else if(per==="anio"){n=12;idx=d.getMonth();txt="mes "+(idx+1)+" de 12"}
 else{n=per==="3a"?36:60;idx=n-1;txt=per==="3a"?"últimos 3 años":"últimos 5 años"}
 let t="";for(let i=0;i<n;i++)t+=`<i class="${i<idx?"p":i===idx?"t":""}"></i>`;
 return {html:`<div class="ruler" aria-hidden="true">${t}</div>`,txt};
}
function donut(S,r){
 const by=T.byCat(S,r.from,r.to);const ent=Object.entries(by).filter(e=>e[1]>0).sort((a,b)=>b[1]-a[1]);
 const tot=ent.reduce((s,e)=>s+e[1],0);
 let segs=ent.slice(0,3).map(([id,v])=>({n:A.cat(id).n,c:A.cat(id).c,v}));
 const rest=ent.slice(3).reduce((s,e)=>s+e[1],0);if(rest>0)segs.push({n:"Otros",c:"#7C8AA5",v:rest});
 const c=2*Math.PI*50;let out="",off=0;
 if(!tot)out=`<circle cx="66" cy="66" r="50" stroke="rgba(255,255,255,.07)"/>`;
 else{out=`<circle cx="66" cy="66" r="50" stroke="rgba(255,255,255,.07)"/>`;const gap=segs.length>1?20:0;
  segs.forEach(s=>{const len=Math.max(1,c*s.v/tot-gap);out+=`<circle cx="66" cy="66" r="50" stroke="${s.c}" stroke-dasharray="${len.toFixed(1)} ${(c-len).toFixed(1)}" stroke-dashoffset="${(-(off+(segs.length>1?4:0))).toFixed(1)}"/>`;off+=c*s.v/tot})}
 const svg=`<svg width="132" height="132" viewBox="0 0 132 132" role="img" aria-label="Gastos por categoría"><g transform="rotate(-90 66 66)" fill="none" stroke-width="14" stroke-linecap="round">${out}</g><circle cx="66" cy="66" r="40" fill="#150F08" stroke="rgba(240,194,90,.12)"/><text x="66" y="53" dominant-baseline="central" text-anchor="middle" fill="#9C9280" font-size="11" font-family="Barlow,sans-serif">Gastado</text><text x="66" y="73" dominant-baseline="central" text-anchor="middle" fill="#F7EFDD" font-size="22" font-family="Oswald,sans-serif" font-weight="500">$ ${A.k(tot)}</text></svg>`;
 const leg=segs.length?segs.map(s=>`<div><i style="background:${s.c}"></i><span>${A.esc(s.n)}</span><b>$ ${A.k(s.v)}</b></div>`).join(""):`<div><span class="mute">Todavía no hay gastos en este período.</span></div>`;
 return {svg,leg,tot};
}
function dayLabel(date,today){const n=T.daysTo(date,today);return n===0?"vence hoy":n===1?"mañana":n>1?"en "+n+" días":n===-1?"venció ayer":"venció hace "+(-n)+" días"}

A.renderHoy=function(){
 const S=A.S,today=A.today(),per=S.ui.per||"mes";
 const w=T.week(S,today),m=w.month,r=range(per,today),ru=ruler(per,today);
 const spent=T.spentRange(S,r.from,r.to);
 let big,lab,wkL,wkV,bar="",sub="",negBig=false;
 if(per==="mes"){big=m.rest;lab="Podés gastar este mes";wkL=w.left<0?"Esta semana te pasaste":"Esta semana te quedan";wkV=A.money(w.left);
  const pct=w.allow>0?Math.max(0,Math.min(100,w.spent/w.allow*100)):(w.spent>0?100:0);
  bar=`<div class="bar ${w.left<0?"red":""}"><div style="width:${pct}%"></div></div>`;
  sub=`<div class="sub"><span>Gastaste ${A.money(w.spent)} de ${A.money(Math.max(0,w.allow))}</span><span>Hoy ${A.money(w.hoy)}</span></div>`}
 else if(per==="semana"){big=w.left;lab=w.left<0?"Esta semana te pasaste":"Podés gastar esta semana";wkL="Este mes te quedan";wkV=A.money(m.rest);sub=`<div class="sub"><span>Gastaste ${A.money(w.spent)} de ${A.money(Math.max(0,w.allow))}</span><span>Hoy ${A.money(w.hoy)}</span></div>`}
 else{big=spent;lab=per==="anio"?"Gastaste este año":per==="3a"?"Gastaste en 3 años":"Gastaste en 5 años";
  const sv=S.mov.filter(x=>x.t==="a"&&x.d>=r.from&&x.d<=r.to).reduce((s,x)=>s+x.a,0);wkL="Ahorraste";wkV=A.money(sv)}
 negBig=big<0;
 const dn=donut(S,r);
 const bx=T.boxes(S);
 // avisos y próximos pagos
 let av="";
 m.pend.filter(p=>p.kind==="ingreso"&&p.date<=today).forEach(p=>{av+=`<button class="tile aviso" data-a="cobre" data-rid="${p.r.id}" data-occ="${p.occ}"><span class="d">${+p.date.slice(8)}</span><span class="m">${A.esc(p.r.name)} por confirmar<small>estimado ${A.money(p.a)} · tocá cuando cobres</small></span><span class="a">${A.money(p.a)}</span></button>`});
 const up=T.upcoming(S,today,3);
 const soon=up.filter(p=>T.daysTo(p.date,today)<=7).reduce((s,p)=>s+p.a,0);
 const short=soon>0&&bx.ars<soon;
 const upH=up.length?up.map((p,i)=>`<button class="tile ${short&&i===0?"warn":""}" data-a="pagar" data-rid="${p.r.id}" data-occ="${p.occ}"><span class="d">${+p.date.slice(8)}</span><span class="m">${A.esc(p.r.name)}<small>${short&&i===0?"Ojo: la plata en pesos no alcanza · ":""}${dayLabel(p.date,today)}</small></span><span class="a">${A.money(p.a)}</span></button>`).join(""):`<div class="tile"><span class="m mute">No hay pagos cerca.<small>Los fijos y anuales que cargues en Ajustes aparecen acá.</small></span></div>`;
 const rowL=per==="mes"?"Gastado este mes":per==="semana"?"Gastado esta semana":"Gastado en el período";
 $h.innerHTML=`<div class="field">
 <div class="fdate"><button data-a="ajustes" aria-label="Fecha y ajustes">${A.dateLong(today)}</button><small>${ru.txt}</small></div>
 ${ru.html}
 <div class="seg" role="tablist">${PER.map(p=>`<button class="${p[0]===per?"on":""}" data-a="per" data-p="${p[0]}" role="tab">${p[1]}</button>`).join("")}</div>
 <div class="lab">${lab}</div>
 <div class="big ${negBig?"neg":""}"><span class="cur">$</span><span id="bigv">${A.fmt(big)}</span></div>
 <div class="wk"><span>${wkL}</span><b>${wkV}</b></div>${bar}${sub}
 </div>
 <div class="below">
 <div class="row2"><span>${rowL}</span><b>${A.money(spent)}</b></div>
 <div class="donut">${dn.svg}<div class="leg">${dn.leg}</div></div>
 ${av?`<div class="h3">Para confirmar</div>${av}`:""}
 <div class="h3">Próximos pagos</div>${upH}
 </div>`;
 const from=A._big;A._big=big;A.countTo(document.getElementById("bigv"),big,(from!=null&&A._bigPer===per)?from:null);A._bigPer=per;document.getElementById('bigv').dataset.final=A.fmt(big);A.fitBig();
};
const $h=A.$("#s-hoy");
A.act.per=b=>{A.S.ui.per=b.dataset.p;A.persist();A.renderHoy()};

/* ---------- Movimientos ---------- */
function mvInfo(m){
 const c=A.cat(m.c);
 if(m.t==="g")return {ic:A.ic(c.ic,c.c),t:m.note||c.n,s:c.n+(m.tag?" · "+m.tag:"")+(m.u?" · USD "+A.fmt2(m.u):""),a:A.money(m.a)};
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
 A.$("#s-mov").innerHTML=`<div class="pad"><h1 class="title">Movimientos</h1>
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
 const S=A.S,t=A.today().slice(0,7);const ks=[T.addM(t,-1),T.addM(t,-2),T.addM(t,-3)];const vit=new Set(S.cats.filter(c=>c.v).map(c=>c.id));
 const tot=S.mov.filter(m=>m.t==="g"&&vit.has(m.c)&&ks.includes(m.d.slice(0,7))).reduce((s,m)=>s+m.a,0);
 const months=ks.filter(k=>S.mov.some(m=>m.d.slice(0,7)===k)).length;
 if(months)return tot/months;
 const c=T.calc(S,t,A.today());return c.fijos;
};
A.goalTarget=g=>{if(g.auto==="colchon"){const v=A.vitalMonthly()*6;return g.cur==="USD"?v/(A.S.cfg.fx||1):v}return g.a};
A.renderMetas=function(){
 const S=A.S,gc=S.ui.gcur||"ARS",fx=S.cfg.fx||1;
 const conv=(v,cur)=>gc===cur?v:(gc==="USD"?v/fx:v*fx);
 const f=v=>gc==="USD"?"USD "+A.fmt(v):"$ "+A.fmt(v);
 const gl=S.goals;
 let h=`<div class="pad"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:15px;font-weight:600;color:var(--cream2)">${gl.length?"Meta principal":"Metas"}</span>
 <span class="chips" style="margin:0"><button class="chip ${gc==="ARS"?"on":""}" data-a="gcur" data-c="ARS">Pesos</button><button class="chip ${gc==="USD"?"on":""}" data-a="gcur" data-c="USD">Dólares</button></span></div>`;
 if(!gl.length)h+=`<h1 class="title" style="margin-top:6px">Tus metas</h1><div class="empty">Todavía no cargaste ninguna.<br>La casa, un viaje o el colchón: elegí cuánto y para cuándo.</div>`;
 gl.forEach((g,i)=>{
  const tgt=A.goalTarget(g),sv=T.goalSaved(S,g),p=tgt>0?Math.min(100,sv/tgt*100):0,mo=T.goalMonthly(S,g);
  const left=Math.max(0,tgt-sv);const meses=mo>0?Math.ceil(left/mo):null;
  let line="";if(g.auto==="colchon"&&tgt<=0)line="Se calcula con 6 meses de tus gastos vitales.";
  else if(left<=0)line="Meta cumplida.";
  else if(meses)line=`Con ${f(conv(mo,g.cur))} por mes llegás en ${meses} ${meses===1?"mes":"meses"}.`;
  else line="Todavía no hay aportes: anotá un ahorro y elegí esta meta.";
  if(g.date&&left>0){const mm=Math.max(1,T.diffM(A.today().slice(0,7),g.date.slice(0,7)));line+=` Para llegar en ${A.monthName(g.date.slice(0,7))} necesitás ${f(conv(left/mm,g.cur))} por mes.`}
  if(i===0)h+=`<button data-a="goal" data-id="${g.id}" style="display:block;width:100%"><h1 class="title" style="margin-top:6px">${A.esc(g.name)}</h1>
   <div class="row2" style="margin-top:22px"><b style="font-size:34px">${f(conv(sv,g.cur))} <small style="font-size:15px;font-family:var(--body);font-weight:400;color:var(--mute)">de ${f(conv(tgt,g.cur))}</small></b><b style="font-size:30px;color:#F0C25A">${Math.round(p)}%</b></div>
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
 if(ser.length>=2){const W=342,H=110,vs=ser.map(s=>dv(s.v)),mn=Math.min(...vs),mx=Math.max(...vs),rg=(mx-mn)||1;
  const pts=vs.map((v,i)=>[i*W/(vs.length-1),H-10-(v-mn)/rg*(H-30)]);const l=pts[pts.length-1];
  chart=`<svg width="100%" viewBox="0 0 ${W} ${H}" style="margin-top:16px;overflow:visible" aria-label="Evolución del patrimonio"><defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8AA2A" stop-opacity=".22"/><stop offset="1" stop-color="#E8AA2A" stop-opacity="0"/></linearGradient></defs><path d="${smooth(pts)} L${W} ${H} L0 ${H} Z" fill="url(#pg)"/><path d="${smooth(pts)}" fill="none" stroke="#E8AA2A" stroke-width="2.5" stroke-linecap="round"/><circle cx="${l[0]}" cy="${l[1]}" r="6" fill="#0B0805" stroke="#E8AA2A" stroke-width="3"/></svg>
  <div class="row2" style="margin-top:6px"><span>${A.monthName(ser[0].k)}</span><span>${A.monthName(ser[ser.length-1].k)}</span></div>`}
 else chart=`<div class="note">La línea se arma sola con tus movimientos, mes a mes.</div>`;
 const owed=S.mov.filter(m=>m.t==="d"&&!m.closed);
 let h=`<div class="pad"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:15px;font-weight:600;color:var(--cream2)">Patrimonio</span>
 <span class="chips" style="margin:0"><button class="chip ${cur==="ARS"?"on":""}" data-a="pcur" data-c="ARS">Pesos</button><button class="chip ${cur==="USD"?"on":""}" data-a="pcur" data-c="USD">Dólares</button></span></div>
 <div class="lab" style="margin-top:20px">Lo que tenés, menos lo que debés</div><div class="net"><span class="disp" style="font-size:30px;font-weight:500;letter-spacing:0;vertical-align:top;margin-right:2px">${cur==="USD"?"USD":"$"}</span>${A.fmt(dv(nw))}</div>${chart}
 <div class="h3">Cajas</div>
 <div class="tile" style="cursor:default"><span class="m">En pesos</span><span class="a" style="color:var(--cream)">${A.money(bx.ars)}</span></div>
 <div class="tile"><span class="m">En dólares<small>${A.usd(bx.usd)} al MEP de $ ${A.fmt(fx)}</small></span><span class="a" style="color:var(--cream)">${fm(dv(bx.usd*fx))}</span></div>
 <div class="h3">Inversiones</div>`;
 h+=S.inv.length?S.inv.map(i=>`<button class="tile" data-a="inv" data-id="${i.id}"><span class="m">${A.esc(i.name)}<small>${i.cur==="USD"?"USD":"$"} ${A.fmt(i.v)}</small></span><span class="a" style="color:var(--cream)">${fm(dv(i.cur==="USD"?i.v*fx:i.v))}</span></button>`).join(""):`<div class="note" style="margin:0 0 8px">Bitcoin, ETFs, acciones o CEDEARs: cargá cuánto valen hoy y actualizalo cuando quieras.</div>`;
 h+=`<button class="go ghost" data-a="invnew" style="margin-top:4px;height:46px">+ Agregar inversión</button>`;
 if(owed.length)h+=`<div class="h3">Me deben</div>`+owed.map(m=>`<button class="tile" data-a="edit" data-id="${m.id}"><span class="m">${A.esc(m.note||"Préstamo")}<small>tocá para marcarlo cobrado</small></span><span class="a" style="color:var(--cream)">${A.money(m.a)}</span></button>`).join("");
 h+=`<div class="h3">Deudas</div>`+(S.debts.length?S.debts.map(d=>`<button class="tile" data-a="debt" data-id="${d.id}"><span class="m">${A.esc(d.name)}</span><span class="a" style="color:var(--warn)">− ${d.cur==="USD"?"USD":"$"} ${A.fmt(d.a)}</span></button>`).join(""):"")+`<button class="go ghost" data-a="debtnew" style="margin-top:4px;height:46px">+ Agregar deuda</button>
 <div class="h3">Control</div><button class="go" data-a="control" style="margin-top:0">Contar cuánto tengo de verdad</button><div class="note">Si lo que tenés no coincide con lo anotado, la diferencia queda registrada.</div></div>`;
 A.$("#s-pat").innerHTML=h;
};
A.act.pcur=b=>{A.S.ui.cur=b.dataset.c;A.persist();A.renderPat()};

/* ---------- navegación ---------- */
const TABS=[["mov","Movimientos","list"],["hoy","Hoy","clock"],["gap"],["metas","Metas","home"],["pat","Patrimonio","chart"]];
A.drawTabs=function(){A.$("#tabs").innerHTML=TABS.map(t=>t[0]==="gap"?`<span class="gap"></span>`:`<button class="${A.S.ui.tab===t[0]?"on":""}" data-a="tab" data-t="${t[0]}"><svg viewBox="0 0 24 24"><path d="${A.P[t[2]]}"/></svg>${t[1]}</button>`).join("")};
A.render=function(){
 const tab=A.S.ui.tab;
 ({hoy:A.renderHoy,mov:A.renderMov,metas:A.renderMetas,pat:A.renderPat})[tab]();
 document.querySelectorAll(".screen").forEach(s=>{const on=s.id==="s-"+tab;s.classList.toggle("on",on);requestAnimationFrame(()=>s.classList.toggle("vis",on))});
 A.drawTabs();A.fitBig&&A.fitBig();
};
A.act.tab=b=>{if(A.S.ui.tab===b.dataset.t)return;A.S.ui.tab=b.dataset.t;A.persist();A.render()};
})();

A.fitBig=function(){document.querySelectorAll('.big,.net').forEach(e=>{e.style.fontSize='';const num=e.querySelector('#bigv')||e;const par=e.parentElement,w=par.clientWidth-8;if(w<=0)return;const txt=(num.dataset.final||num.textContent)+(num===e?'':'').replace(/\d/g,'0');let f=parseFloat(getComputedStyle(e).fontSize);const m=document.createElement('span');m.style.cssText='position:absolute;visibility:hidden;white-space:nowrap';m.style.font=getComputedStyle(e).font;m.style.letterSpacing=getComputedStyle(e).letterSpacing;m.textContent=txt;par.appendChild(m);let t=0;while(m.getBoundingClientRect().width+46>w&&f>40&&t++<40){f-=3;e.style.fontSize=f+'px';m.style.fontSize=f+'px'}m.remove()})};
window.addEventListener('resize',()=>A.fitBig&&A.fitBig());
