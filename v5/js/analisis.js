/* Tope v5 — Análisis: comparación con meses anteriores, categorías, pronóstico y metas */
(function(){
const MS=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const kp=n=>{const a=Math.abs(n);return a>=1e6?"$ "+(n/1e6).toFixed(2).replace(".",",")+" M":A.money(n)};
const ab=n=>{n=Math.round(n);return Math.abs(n)>=1e6?(n/1e6).toFixed(1).replace(".",",")+" M":Math.abs(n)>=1e3?Math.round(n/1e3)+" mil":String(n)};
const rng=k=>[k+"-01",k+"-31"];
function ingMes(S,k){return S.mov.filter(m=>m.t==="i"&&T.incomeMonthOf(m.d,m.feeds)===k).reduce((s,m)=>s+m.a,0)}
function mes(S,k){const [a,b]=rng(k);return {k,gasto:T.spentRange(S,a,b),ahorro:T.ahorroRange(S,a,b),ing:ingMes(S,k),by:T.byCat(S,a,b)}}
function delta(c,p,goodDown){ // flecha y color; en gastos subir es malo
 if(!(p>0))return c>0?`<em class="dl0">nuevo</em>`:"";
 const d=(c-p)/p*100;if(Math.abs(d)<1)return `<em class="dl0">igual</em>`;
 const up=d>0,bad=goodDown?up:!up;return `<em class="${bad?"dbad":"dok"}">${up?"▲":"▼"} ${Math.abs(Math.round(d))}%</em>`}
A.renderAn=function(box){
 const S=A.S,f=A.f,today=A.today(),cur=today.slice(0,7);let k=f.m==="all"||!f.m?cur:f.m;
 const M=mes(S,k),P=mes(S,T.addM(k,-1));
 const ks=[];for(let i=5;i>=0;i--)ks.push(T.addM(k,-i));const sr=ks.map(x=>x===k?M:mes(S,x));
 const prev3=[1,2,3].map(i=>mes(S,T.addM(k,-i))).filter(x=>x.gasto>0);const avg=prev3.length?prev3.reduce((s,x)=>s+x.gasto,0)/prev3.length:0;
 const mx=Math.max(1,...sr.map(x=>Math.max(x.gasto,x.ahorro)));
 const W=336,H=130,bw=18,gap=(W-6*2*bw)/6;let bars="";
 sr.forEach((x,i)=>{const x0=gap/2+i*(2*bw+gap),on=x.k===k,h1=x.gasto/mx*90,h2=x.ahorro/mx*90;
  bars+=`<rect x="${x0}" y="${100-h1}" width="${bw}" height="${Math.max(h1,1)}" rx="3" fill="#FFC21A" opacity="${on?1:.45}"/><rect x="${x0+bw+2}" y="${100-h2}" width="${bw-2}" height="${Math.max(h2,1)}" rx="3" fill="#F3EBDD" opacity="${on?1:.35}"/>
  <text x="${x0+bw}" y="116" text-anchor="middle" fill="${on?"#F3EBDD":"#8B8579"}" font-size="10.5">${MS[+x.k.slice(5)-1]}</text>${on&&x.gasto>0?`<text x="${x0+bw/2}" y="${96-h1}" text-anchor="middle" fill="#FFC21A" font-size="10">${ab(x.gasto)}</text>`:""}`});
 const ay=avg>0?100-avg/mx*90:null;
 const chart=`<svg viewBox="0 0 ${W} ${H}" class="anc" role="img" aria-label="Gasto y ahorro de los últimos 6 meses">${ay!=null?`<line x1="0" x2="${W}" y1="${ay}" y2="${ay}" stroke="#8B8579" stroke-dasharray="3 4" stroke-width="1"/>`:""}${bars}</svg>`;
 // vitales vs resto
 const [a,b]=rng(k);let vit=0,rest=0;S.mov.forEach(m=>{if((m.t==="g"||m.t==="r")&&m.d>=a&&m.d<=b){const v=(m.t==="r"?-m.a:m.a);if(T.isVital(S,m))vit+=v;else rest+=v}});
 const Ly={f:0,v:0,d:0};S.mov.forEach(m=>{if((m.t==="g"||m.t==="r")&&m.d>=a&&m.d<=b){const q=(m.t==="r"?-m.a:m.a);if(m.rid)Ly.f+=q;else if(T.isVital(S,m))Ly.v+=q;else Ly.d+=q}});Ly.t=(Ly.f+Ly.v+Ly.d)||1;
 // categorías
 const ent=Object.entries(M.by).filter(e=>e[1]>0).sort((x,y)=>y[1]-x[1]);const tot=ent.reduce((s,e)=>s+e[1],0)||1;
 const cats=ent.map(([id,v])=>{const c=A.cat(id),open=f.open===id,p=P.by[id]||0;
  let subs="";if(open){const sb=T.bySub(S,a,b,id),sp=T.bySub(S,...rng(T.addM(k,-1)),id);subs=Object.entries(sb).sort((x,y)=>y[1]-x[1]).map(([sid,sv],i,arr)=>`<div class="ansub"><i style="background:${A.subc(c.c,i,arr.length)}"></i><span>${A.esc(sid==="_"?"Sin detalle":A.subName(id,sid)||"Otro")}</span>${delta(sv,sp[sid]||0,true)}<b>${A.money(sv)}</b></div>`).join("")}
  return `<button class="ancat" data-a="anopen" data-id="${id}"><span class="anh"><i style="background:${c.c}"></i><b>${A.esc(c.n)}</b>${delta(v,p,true)}<span class="anv">${A.money(v)}</span></span><span class="anb"><i style="width:${v/tot*100}%;background:${c.c}"></i></span></button>${subs}`}).join("");
 // pronóstico
 let fc="";if(k===cur){const dd=+today.slice(8),dm=T.dim(k);if(dd>=3&&M.gasto>0){const fx=S.mov.filter(m=>(m.t==="g"||m.t==="r")&&m.rid&&m.d>=a&&m.d<=b).reduce((q,m)=>q+(m.t==="r"?-m.a:m.a),0),est=fx+(M.gasto-fx)/dd*dm;fc=`<div class="anrow"><span>Al ritmo de hoy cerrás el mes en</span><b>${A.money(est)}</b></div>${avg>0?`<div class="anrow sm"><span>Tu promedio de los meses anteriores</span><b>${A.money(avg)}</b></div>`:""}`}}
 // metas
 const goals=S.goals.map(g=>{const t=A.goalTarget(g),sv=T.goalSaved(S,g),p=t>0?Math.min(100,sv/t*100):0,mo=T.goalMonthly(S,g),rem=Math.max(0,t-sv),meses=mo>0?Math.ceil(rem/mo):null;
  return `<div class="angoal"><span class="anh"><b>${A.esc(g.name)}</b><span class="anv">${Math.round(p)}%</span></span><span class="anb"><i style="width:${p}%;background:#F3EBDD"></i></span><small>${p>=100?"Meta cumplida":meses?"Al ritmo actual faltan "+(meses>=12?Math.floor(meses/12)+" a "+(meses%12?meses%12+" m":""):meses+" meses"):"Todavía no hay aportes para estimar"}</small></div>`}).join("");
 const ins=[];const YA=mes(S,T.addM(k,-12));if(YA.gasto>0&&M.gasto>0){const d=Math.round((M.gasto-YA.gasto)/YA.gasto*100);ins.push(`Contra ${A.monthName(T.addM(k,-12))}: gastaste ${Math.abs(d)}% ${d>=0?"más":"menos"}.`)}
 if(P.gasto>0&&M.gasto>0){const top=ent.map(([id,v])=>({id,v,p:P.by[id]||0})).filter(x=>x.p>0&&x.v>x.p).sort((x,y)=>(y.v-y.p)-(x.v-x.p))[0];if(top)ins.push(`${A.cat(top.id).n} fue lo que más subió: ${A.money(top.v-top.p)} más que el mes pasado.`)}
 if(M.ing>0&&M.ahorro>0)ins.push(`Ahorraste el ${Math.round(M.ahorro/M.ing*100)}% de lo que entró.`);
 box.innerHTML=`<div class="anhd"><button class="chip" data-a="mprev" aria-label="Mes anterior">‹</button><span class="chip on" style="min-width:140px;justify-content:center">${A.monthName(k)}</span><button class="chip" data-a="mnext" aria-label="Mes siguiente">›</button></div>
 <div class="ankp"><div><small>Entró</small><b>${kp(M.ing)}</b>${delta(M.ing,P.ing,false)}</div><div><small>Gastaste</small><b>${kp(M.gasto)}</b>${delta(M.gasto,P.gasto,true)}</div><div><small>Ahorraste</small><b>${kp(M.ahorro)}</b>${delta(M.ahorro,P.ahorro,false)}</div></div>
 ${ins.length?`<div class="anins">${ins.map(x=>`<p>${x}</p>`).join("")}</div>`:""}
 <div class="h3">Últimos 6 meses <span class="lg"><i style="background:#FFC21A"></i>gasto <i style="background:#F3EBDD"></i>ahorro</span></div>${chart}${avg>0?`<div class="note" style="margin:0 0 4px">Línea punteada: tu gasto promedio de los 3 meses anteriores.</div>`:""}
 ${fc}
 ${M.gasto>0?`<div class="h3">En qué capa se va</div><div class="anvr" style="display:flex;gap:2px;background:none"><i style="width:${Ly.f/Ly.t*100}%;background:#8B8579"></i><i style="width:${Ly.v/Ly.t*100}%;background:#FF8A00"></i><i style="width:${Ly.d/Ly.t*100}%;background:#FFC21A"></i></div><div class="anrow sm"><span><i class="ldot" style="background:#8B8579"></i>Fijos (los que se repiten)</span><b>${A.money(Ly.f)}</b></div><div class="anrow sm"><span><i class="ldot" style="background:#FF8A00"></i>Vitales variables</span><b>${A.money(Ly.v)}</b></div><div class="anrow sm"><span><i class="ldot" style="background:#FFC21A"></i>Discrecional</span><b>${A.money(Ly.d)}</b></div><div class="note" style="margin-top:4px">Lo vital se marca por detalle en Ajustes › Categorías, con un asterisco.</div>`:""}
 <div class="h3">Por categoría <span class="lg">vs el mes anterior</span></div>${cats||`<div class="empty" style="padding:20px 0">Todavía no hay gastos este mes.</div>`}
 ${goals?`<div class="h3">Metas</div>${goals}`:""}
 ${(k<=cur&&(M.gasto>0||M.ing>0))?`<button class="go ghost" data-a="cierre" data-k="${k}" style="height:46px;margin-top:14px">${(S.cierres||{})[k]?"Mes cerrado · ver cierre":"Cerrar "+A.monthName(k)}</button>`:""}`;
};
A.act.anopen=b=>{A.f.open=A.f.open===b.dataset.id?null:b.dataset.id;A.renderMov()};
A.act.mview=b=>{A.f.view=b.dataset.v;A.renderMov()};
})();
