/* Tope v5 — extras: reglas automáticas, cierre de mes, ingreso grande, control semanal */
(function(){
const S=()=>A.S;
/* ---- reglas: palabra del detalle -> categoría y subítem ---- */
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim();
A.ruleFor=note=>{const n=norm(note);if(!n)return null;return (S().rules||[]).find(r=>n.includes(norm(r.k)))||null};
A.learn=m=>{const st=S();if(m.t!=="g"||!m.note||m.rid)return null;const n=norm(m.note);if(!n||A.ruleFor(m.note))return null;
 const same=st.mov.filter(x=>x.t==="g"&&!x.rid&&norm(x.note)===n&&x.c===m.c&&(x.s||"")===(m.s||""));
 const other=st.mov.filter(x=>x.t==="g"&&!x.rid&&norm(x.note)===n&&!(x.c===m.c&&(x.s||"")===(m.s||"")));
 if(same.length>=2&&!other.length){(st.rules=st.rules||[]).push({k:m.note.trim(),c:m.c,s:m.s});return "Aprendí que «"+m.note.trim()+"» va a "+(A.subName(m.c,m.s)||A.cat(m.c).n)}return null};
A.rulesHtml=()=>{const r=S().rules||[];return `<div class="h3">Reglas automáticas</div>`+(r.length?r.map((x,i)=>`<button class="tile" data-a="regedit" data-i="${i}"><span class="m">${A.esc(x.k)}<small>${A.esc(A.subName(x.c,x.s)||A.cat(x.c).n)}</small></span></button>`).join(""):`<div class="note" style="margin:0 0 6px">Si escribís la misma nota tres veces en la misma categoría, la app aprende sola. O creá una vos.</div>`)+`<button class="go ghost" data-a="regnew" style="height:46px;margin-top:0">+ Regla</button>`};
function regForm(i){const st=S(),x=i!=null?st.rules[i]:null;
 A.form(x?"Regla":"Nueva regla",[{k:"k",label:"Si la nota dice",type:"text",v:x?x.k:"",ph:"YPF, Coto, Netflix…"},{k:"cs",label:"Va a",type:"select",v:x?A.csKey(x):A.csOpts()[0][0],opts:A.csOpts()}],
  {ok:"Guardar",extra:x?[{i:0,t:"Borrar regla",cls:"red",f:()=>{st.rules.splice(i,1);A.persist();A.close();A._back=false;setTimeout(A.act.ajustes,340)}}]:[],
   save:v=>{if(!v.k.trim())return false;const p=A.csParse(v.cs),o={k:v.k.trim(),c:p.c,s:p.s};if(x)Object.assign(x,o);else (st.rules=st.rules||[]).push(o)}})}
A.act.regnew=()=>{A._back=true;regForm(null)};A.act.regedit=b=>{A._back=true;regForm(+b.dataset.i)};
/* ---- ingreso grande ---- */
A.bigIncome=v=>{const st=S(),fijo=st.rec.filter(r=>r.kind==="ingreso"&&!r.paused).reduce((s,r)=>s+(r.cur==="USD"?r.a*(st.cfg.fx||1):r.a),0);
 if(!(v>=Math.max(100000,fijo*.3)))return;const p=Math.round(v*(st.cfg.savePct||25)/100);
 A.sheet(`${A.head("Entró plata extra")}<div class="sh-body"><div class="note" style="margin-top:0">Entraron ${A.money(v)} fuera de lo habitual. ¿Qué hacés con el resto?</div>
 <button class="go" data-a="bigsave" data-v="${p}">Ahorrar el ${st.cfg.savePct||25}% (${A.money(p)})</button>
 <button class="go ghost" data-a="bigsave" data-v="${Math.round(v)}">Ahorrarlo todo</button>
 <button class="go ghost" data-a="close">Es para gastar este mes</button></div>`,{part:true})};
A.act.bigsave=b=>{A.ahorrarMonto(+b.dataset.v)};
/* ---- cierre de mes ---- */
A.cierreData=k=>{const st=S(),a=k+"-01",b=k+"-31",ing=st.mov.filter(m=>m.t==="i"&&T.incomeMonthOf(m.d,m.feeds)===k).reduce((s,m)=>s+m.a,0),g=T.spentRange(st,a,b),ah=T.ahorroRange(st,a,b),pk=T.addM(k,-1),pg=T.spentRange(st,pk+"-01",pk+"-31");
 const by=T.byCat(st,a,b),top=Object.entries(by).sort((x,y)=>y[1]-x[1])[0];const vit=st.mov.filter(m=>(m.t==="g"||m.t==="r")&&m.d>=a&&m.d<=b&&T.isVital(st,m)).reduce((s,m)=>s+(m.t==="r"?-m.a:m.a),0);
 const pct=st.cfg.savePct||25,meta=Math.round(ing*pct/100);return {ing,g,ah,pg,top,vit,meta,pct}};
A.act.cierre=b=>{const k=b.dataset.k,st=S(),d=A.cierreData(k),cl=(st.cierres||{})[k];
 const dg=d.pg>0?Math.round((d.g-d.pg)/d.pg*100):null;
 A.sheet(`${A.head("Cierre de "+A.monthName(k))}<div class="sh-body">
 <div class="anrow"><span>Entró</span><b>${A.money(d.ing)}</b></div><div class="anrow"><span>Gastaste</span><b>${A.money(d.g)}</b></div>
 <div class="anrow sm"><span>De eso, vitales</span><b>${A.money(d.vit)}</b></div>
 <div class="anrow"><span>Ahorraste</span><b>${A.money(d.ah)}</b></div><div class="anrow sm"><span>Tu meta era</span><b>${A.money(d.meta)}</b></div>
 <div class="note">${d.ah>=d.meta&&d.meta>0?"Cumpliste la meta de ahorro.":d.meta>0?"Te faltaron "+A.money(d.meta-d.ah)+" para la meta de ahorro.":""}${dg!=null?" Gastaste "+(dg>0?dg+"% más":Math.abs(dg)+"% menos")+" que el mes anterior.":""}${d.top?" Lo que más pesó: "+A.cat(d.top[0]).n+".":""}</div>
 <label class="fld"><span>Una nota para este mes (opcional)</span><input id="cnota" value="${A.esc(cl&&cl.nota||"")}" placeholder="Qué aprendiste, qué cambiás"></label>
 <button class="go" data-a="cierreok" data-k="${k}">${cl?"Guardar nota":"Cerrar el mes"}</button></div>`,{part:true})};
A.act.cierreok=b=>{const st=S(),k=b.dataset.k,nota=(A.$("#cnota")||{}).value||"";(st.cierres=st.cierres||{})[k]={d:A.today(),nota:nota.trim(),...A.cierreData(k)};A.persist();A.close();A.render();A.toast("Mes cerrado")};
/* ---- avisos en Hoy: cierre pendiente y control semanal ---- */
A.avisosHoy=()=>{const st=S(),today=A.today(),cur=today.slice(0,7),pk=T.addM(cur,-1);let h="";
 const hay=st.mov.some(m=>m.d.slice(0,7)===pk);
 if(hay&&!(st.cierres||{})[pk]&&+today.slice(8)<=10)h+=`<button class="tile ahor" data-a="cierre" data-k="${pk}"><span class="d">✓</span><span class="m">Cerrá ${A.monthName(pk)}<small>Mirá cómo te fue y dejá una nota</small></span></button>`;
 const last=st.ui.ctl||st.ui.ctl0;if(!st.ui.ctl0)st.ui.ctl0=today;
 const days=last?Math.round((new Date(today)-new Date(last))/864e5):99;
 if(days>=7)h+=`<button class="tile" data-a="control"><span class="d">$</span><span class="m">Control semanal<small>${days>=99?"Contá cuánto tenés de verdad":"Hace "+days+" días que no controlás el saldo"}</small></span></button>`;
 return h};
})();
