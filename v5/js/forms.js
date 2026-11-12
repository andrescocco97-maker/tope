/* Tope v5 — hojas: carga rápida, edición, ajustes, asistente */
(function(){
const S=()=>A.S;
const setSheet=h=>{A.$("#sheet").innerHTML=h};
const sc=()=>A.$("#sheet .cmid")||A.$("#sheet .sh-body");
const keepScroll=fn=>{const b=sc(),y=b?b.scrollTop:0;fn();const n=sc();if(n)n.scrollTop=y};

/* ===== Carga rápida ===== */
let D=null;
const TYPES=[["e","Egreso"],["i","Ingreso"]];
function amtView(){const s=D.amt;if(!s)return `<span class="ph">0</span>`;const [i,d]=s.split(",");return A.fmt(+i||0)+(s.includes(",")?","+(d||""):"")}
const catBtn=c=>`<button class="cat ${D.c===c.id?"on":""}" data-a="ccat" data-id="${c.id}" style="--c:${c.c}">${A.catSvg(c)}<span>${A.esc(c.n)}</span></button>`;
const spBtn=(s,n,ic,col)=>`<button class="cat ${D.sp===s?"on":""}" data-a="csp" data-s="${s}" style="--c:${col}"><svg viewBox="0 0 24 24"><path d="${A.P[ic]}"/></svg><span>${n}</span></button>`;
const AHC="#F3EBDD";
function catGrid(){
 const cs=T.catOrder(A.S);
 if(!D.more)return `<div class="grid4">${cs.slice(0,6).map(catBtn).join("")}${spBtn("a","Ahorro","coin",AHC)}<button class="cat more" data-a="cmore"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg><span>Más</span></button></div>`;
 return `<div class="grid4">${cs.map(catBtn).join("")}${spBtn("a","Ahorro","coin",AHC)}${spBtn("d","Me deben","owe","#9CA3AF")}<button class="cat more" data-a="newcat"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg><span>Nueva</span></button></div>`}
function pickView(v){const c=A.cat(D.c),subs=c.subs||[];
 return `<div class="lbl" style="display:flex;align-items:center;gap:8px"><span class="pk" style="--c:${c.c}">${A.catSvg(c)}</span><span style="flex:1;color:var(--cream);font-size:calc(16px*var(--k,1))">${A.esc(c.n)}</span><button class="addl" data-a="cback">Cambiar</button></div>
 ${subs.length?`<div class="lbl" style="margin-top:4px">¿Qué fue?</div><div class="grid3">${subs.map((x,i)=>`<button class="sub ${D.s===x.id?"on":""}" data-a="csub" data-id="${x.id}" style="--c:${A.subc(c.c,i,subs.length)}"><i></i><span>${A.esc(x.n)}</span></button>`).join("")}<button class="sub ${D.s==="_"?"on":""}" data-a="csub" data-id="_" style="--c:#9CA3AF"><i></i><span>Sin detalle</span></button><button class="sub add" data-a="subnew"><span>+ Nueva</span></button></div>`:`<button class="sub add" data-a="subnew" style="margin-top:4px"><span>+ Agregar detalle (ej. perfumería)</span></button>`}
 <button class="go" data-a="csave" ${v>0?"":"disabled"}>Guardar</button>`}
const BKS='<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7 6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg>';
const keypad=`<div class="pad4">${["1","2","3","4","5","6","7","8","9",",","0","bk"].map(k=>k==="bk"?`<button data-a="key" data-k="⌫" class="bk" aria-label="Borrar">${BKS}</button>`:`<button data-a="key" data-k="${k}" aria-label="${k}">${k}</button>`).join("")}</div>`;
function drawCarga(){
 const st=A.S,t=D.t,v=A.parseAmt(D.amt);
 const dl=D.d===A.today()?"Hoy":A.dateShort(D.d);
 let body="";
 if(t==="e"&&!D.sp){
  if(D.usd)body+=`<button class="sw ${D.pu?"on":""}" data-a="cpu"><span>Pagué con mis dólares</span><i></i></button>`;
  if(D.cu){const n=D.n,cu=n?v/n:0;
   body+=`<div class="stepper"><button data-a="cn" data-d="-1" aria-label="Menos cuotas">−</button><b>${n}</b><button data-a="cn" data-d="1" aria-label="Más cuotas">+</button><span class="note" style="margin:0;flex:1">${v>0?"cuotas de $ "+A.fmt(cu)+", desde "+A.monthName(T.addM(A.today().slice(0,7),1)):"Cargá el total arriba"}</span></div>
   <label class="fld"><span>¿Qué es?</span><input id="dn" placeholder="Heladera, ropa…" value="${A.esc(D.note)}" autocomplete="off"></label>
   <div class="lbl">Elegí la categoría para guardar</div>`}
  else if(D.pick&&D.c)body+=pickView(v);
  if(!(D.pick&&D.c&&!D.cu))body+=catGrid();
 }else if(t==="e"&&D.sp==="a"){
  body+=`<div class="lbl">Ahorro <button class="addl" data-a="csp" data-s="">Cambiar</button></div>
  <label class="fld" style="margin-top:0"><span>Dólares que recibiste (opcional)</span><input id="du" inputmode="decimal" placeholder="0" value="${A.esc(D.u)}" autocomplete="off"></label>
  ${v>0&&A.parseAmt(D.u)>0?`<div class="note">Cotización: $ ${A.fmt2(v/A.parseAmt(D.u))} por dólar</div>`:""}
  ${st.goals.length>1?`<div class="lbl">¿A qué meta suma? (si no elegís, se reparte)</div><div class="chips" style="margin-top:0">${st.goals.map(g=>`<button class="chip ${D.goal===g.id?"on":""}" data-a="cgoal" data-id="${g.id}">${A.esc(g.name)}</button>`).join("")}</div>`:""}
  <button class="go" data-a="csave" ${v>0?"":"disabled"}>Guardar ahorro</button>`;
 }else if(t==="e"&&D.sp==="d"){
  body+=`<div class="lbl">Me deben <button class="addl" data-a="csp" data-s="">Cambiar</button></div><label class="fld" style="margin-top:0"><span>¿A quién se lo prestaste?</span><input id="dn" placeholder="Nombre o nota" value="${A.esc(D.note)}" autocomplete="off"></label><button class="go" data-a="csave" ${v>0?"":"disabled"}>Guardar</button>`;
 }else{
  const pend=T.calc(A.S,A.today().slice(0,7),A.today()).pend.filter(p=>p.kind==="ingreso"&&p.date<=A.today());
  if(pend.length)body+=`<div class="lbl">¿Es uno de estos? Así no se suma dos veces</div><div class="chips" style="margin-top:0">${pend.map(p=>`<button class="chip ${D.rid===p.r.id?"on":""}" data-a="crid" data-rid="${p.r.id}" data-occ="${p.occ}">${A.esc(p.r.name)}</button>`).join("")}</div>`;
  body+=`<label class="fld"><span>¿De qué es?</span><input id="dn" placeholder="Sueldo, guardia, venta…" value="${A.esc(D.note)}" autocomplete="off"></label>
  <button class="sw ${D.next?"on":""}" data-a="cnext"><span>Es para el mes que viene</span><i></i></button><button class="go" data-a="csave" ${v>0?"":"disabled"}>Guardar ingreso</button>`;
 }
 const noteRow="";
 const noteIn=(t==="e"&&!D.sp&&!D.cu)?`<input class="nin" id="dnote" placeholder="Nota (opcional)" value="${A.esc(D.note)}" autocomplete="off" aria-label="Nota">`:"";
 const chips=`<label class="chip" style="position:relative">${dl}<input type="date" id="cd" value="${D.d}" style="position:absolute;inset:0;opacity:0;width:100%" aria-label="Fecha"></label>`+(t==="e"&&!D.sp?`<button class="chip ${D.usd?"on":""}" data-a="cusd">USD</button><button class="chip ${D.cu?"on":""}" data-a="ccu">Cuotas</button>`:"");
 setSheet(`<div class="ctop"><div class="sh-head" style="padding:calc(var(--safe-t) + 4px) 0 0"><div class="chips" style="margin:0;align-items:center">${chips}</div><button class="xbtn" data-a="close" aria-label="Cerrar"><svg viewBox="0 0 24 24"><path d="${A.P.x}"/></svg></button></div>
 <div class="tcs">${TYPES.map(x=>`<button class="${t===x[0]?"on":""}" data-a="ctype" data-t="${x[0]}">${x[1]}</button>`).join("")}</div>
 <div class="amt"><div><span class="cur">${D.usd&&t==="e"?"USD":"$"}</span>${amtView()}</div></div>${noteIn}</div><div class="cmid">${noteRow}${body}</div><div class="ckeys">${keypad}</div>`);
}
A.openCarga=function(){D={s:null,pick:false,t:"e",sp:null,amt:"",usd:false,pu:false,c:null,d:A.today(),note:"",n:3,cu:false,u:"",goal:null,next:false,more:false,det:false,rid:null,occ:null};A.sheet("",{cls:"carga"});drawCarga()};
A.act.fabopen=A.openCarga;
A.act.key=b=>{const k=b.dataset.k;let s=D.amt;
 if(k==="⌫")s=s.slice(0,-1);else if(k===","){if(!s.includes(","))s=(s||"0")+","}else{const [i,d]=s.split(",");if(s.includes(",")){if((d||"").length<2)s+=k}else if(i.length<8&&!(i===""&&k==="0"))s+=k}
 D.amt=s;keepScroll(drawCarga)};
const redraw=()=>keepScroll(drawCarga);
A.act.ctype=b=>{D.t=b.dataset.t;D.c=null;D.sp=null;D.pick=false;D.s=null;redraw()};
A.act.csp=b=>{D.sp=b.dataset.s||null;redraw()};
A.act.cusd=()=>{D.usd=!D.usd;if(!D.usd)D.pu=false;redraw()};
A.act.cpu=()=>{D.pu=!D.pu;redraw()};
A.act.cdet=()=>{D.det=!D.det;redraw()};
A.act.ccu=()=>{D.cu=!D.cu;redraw()};
A.act.crid=b=>{if(D.rid===b.dataset.rid){D.rid=null;D.occ=null}else{D.rid=b.dataset.rid;D.occ=b.dataset.occ}redraw()};
A.act.cmore=()=>{D.more=true;redraw()};
A.act.cnext=()=>{D.next=!D.next;redraw()};
A.act.cgoal=b=>{D.goal=D.goal===b.dataset.id?null:b.dataset.id;redraw()};
A.act.cn=b=>{D.n=Math.max(2,Math.min(60,D.n+(+b.dataset.d)));redraw()};
A.act.ccat=b=>{const c=A.cat(b.dataset.id);D.c=c.id;D.s=null;const v=A.parseAmt(D.amt);
 if(D.cu){if(v>0)A.act.csave();else redraw();return}
 if(c.subs&&c.subs.length){D.pick=true;if(!(v>0)){const a=T.typical(A.S,c.id);if(a)D.amt=String(a)}redraw();return}
 if(v>0){A.act.csave();return}
 const a=T.typical(A.S,c.id);if(a){D.amt=String(a);D.pick=true}redraw()};
A.act.cback=()=>{D.pick=false;D.c=null;D.s=null;redraw()};
A.act.csub=b=>{D.s=b.dataset.id;if(A.parseAmt(D.amt)>0){A.act.csave();return}redraw()};
A.act.subnew=()=>{const keep={...D},c=A.cat(D.c);
 A.form("Nuevo detalle en "+c.n,[{k:"n",label:"Nombre",type:"text",v:"",ph:"Perfumería, flores…"}],{save:v=>{const n=v.n.trim();if(!n)return false;c.subs=c.subs||[];const id=c.id+"."+T.uid();c.subs.push({id,n});keep.s=id;keep.pick=true;setTimeout(()=>{A.openCarga();Object.assign(D,keep);drawCarga()},320)}})};
A.act.ahorrar=()=>{const k=A.today().slice(0,7),m=T.calc(A.S,k,A.today()).ahorro,reg=T.ahorroRange(A.S,k+"-01",k+"-31");A.openCarga();D.sp="a";D.amt=String(Math.max(0,Math.round(m-reg)));drawCarga()};
document.addEventListener("change",e=>{if(e.target.id==="cd"&&D){D.d=e.target.value||A.today();redraw()}});
document.addEventListener("input",e=>{if(!D)return;if(e.target.id==="dn"||e.target.id==="dnote")D.note=e.target.value;if(e.target.id==="du"){D.u=e.target.value}});
function limMsg(m,st){const c=m.t==="g"&&st.cats.find(x=>x.id===m.c);if(!c||!(c.lim>0))return null;const k=m.d.slice(0,7),g=T.byCat(st,k+"-01",k+"-31")[c.id]||0,b=g-m.a;
 if(b<c.lim&&g>=c.lim)return c.n+": te pasaste del límite";if(b<c.lim*.8&&g>=c.lim*.8)return c.n+": ya usaste el "+Math.round(g/c.lim*100)+"% del límite";return null}
function commit(m,msg){const st=A.S;st.mov.push(m);msg=limMsg(m,st)||msg;A.persist();A.close();A.render();A.buzz(18);A.toast(msg||"Anotado",()=>{st.mov=st.mov.filter(x=>x.id!==m.id);A.persist();A.render()})}
A.act.csave=()=>{const st=A.S,v=A.parseAmt(D.amt);if(!(v>0))return;const t=D.t,fx=st.cfg.fx||1;
 if(t==="i"){const r=D.rid&&st.rec.find(x=>x.id===D.rid);commit(r?{id:T.uid(),t:"i",a:Math.round(v),d:D.d,note:r.name,rid:r.id,occ:D.occ,feeds:r.feeds||"cur"}:{id:T.uid(),t:"i",a:Math.round(v),d:D.d,note:D.note.trim()||undefined,feeds:D.next?"next":"cur"});return}
 if(D.sp==="a"){const u=A.parseAmt(D.u);commit({id:T.uid(),t:"a",a:Math.round(v),u:u||undefined,fx:u?v/u:undefined,goal:D.goal||undefined,d:D.d},"Ahorro anotado");return}
 if(D.sp==="d"){commit({id:T.uid(),t:"d",a:Math.round(v),d:D.d,note:D.note.trim()||undefined});return}
 if(!D.c)return;
 if(D.cu){const k=A.today().slice(0,7);const tot=Math.round(D.usd?v*fx:v);const sp={id:T.uid(),name:D.note.trim()||A.cat(D.c).n,total:tot,n:D.n,start:T.addM(k,1),c:D.c};st.spr.push(sp);A.persist();A.close();A.render();A.buzz(18);A.toast("Repartido en "+D.n+" cuotas",()=>{st.spr=st.spr.filter(x=>x!==sp);A.persist();A.render()});return}
 const m={id:T.uid(),t:"g",a:Math.round(D.usd?v*fx:v),c:D.c,d:D.d,note:D.note.trim()||undefined};if(D.s&&D.s!=="_")m.s=D.s;if(D.usd){m.u=v;m.fx=fx;if(D.pu)m.pu=true}commit(m)};
A.act.newcat=()=>catForm(null,true);

/* ===== formulario genérico ===== */
let F=null;
function fieldHtml(f){
 const v=f.v==null?"":f.v;
 if(f.type==="select")return `<label class="fld"><span>${f.label}</span><select data-k="${f.k}">${f.opts.map(o=>`<option value="${o[0]}" ${String(o[0])===String(v)?"selected":""}>${A.esc(o[1])}</option>`).join("")}</select></label>`;
 if(f.type==="switch")return `<button class="sw ${v?"on":""}" data-a="fsw" data-k="${f.k}" data-v="${v?1:0}"><span>${f.label}</span><i></i></button>`;
 if(f.type==="note")return `<div class="note">${f.label}</div>`;
 return `<label class="fld"><span>${f.label}</span><input data-k="${f.k}" type="${f.type==="date"?"date":"text"}" ${f.type==="num"?'inputmode="decimal"':""} value="${A.esc(v)}" placeholder="${f.ph||""}" autocomplete="off"></label>`;
}
A.form=function(title,fields,o){
 F={fields,o};
 A.sheet(`${A.head(title)}<div class="sh-body">${fields.map(fieldHtml).join("")}<button class="go" data-a="fsave">${o.ok||"Guardar"}</button>${(o.extra||[]).map(x=>`<button class="go ${x.cls||"ghost"}" data-a="fx" data-i="${x.i}">${x.t}</button>`).join("")}</div>`,{part:!o.full});
};
A.act.fsw=b=>{const on=b.dataset.v!=="1";b.dataset.v=on?1:0;b.classList.toggle("on",on)};
function fvals(){const o={};A.$("#sheet").querySelectorAll("[data-k]").forEach(el=>{o[el.dataset.k]=el.tagName==="BUTTON"?el.dataset.v==="1":el.value});return o}
A.act.fsave=()=>{const v=fvals();const r=F.o.save(v);if(r===false)return;A.persist();A.close();A.render();if(A._back){A._back=false;setTimeout(A.act.ajustes,340)}};
A.act.fx=b=>{const x=F.o.extra[+b.dataset.i];x.f(fvals())};

/* ===== editar movimiento ===== */
A.act.edit=b=>{const st=S(),m=st.mov.find(x=>x.id===b.dataset.id);if(!m)return;
 const f=[{k:"a",label:"Monto en pesos",type:"num",v:A.fmt2(m.a).replace(/\./g,"")},];
 if(m.t==="g"||m.t==="r")f.push({k:"c",label:"Categoría",type:"select",v:m.c,opts:st.cats.map(c=>[c.id,c.n])});
 const cc=m.c&&st.cats.find(x=>x.id===m.c);
 if(m.t==="g"&&cc&&cc.subs&&cc.subs.length)f.push({k:"s",label:"Detalle",type:"select",v:m.s||"",opts:[["","Sin detalle"]].concat(cc.subs.map(x=>[x.id,x.n]))});
 f.push({k:"d",label:"Fecha",type:"date",v:m.d},{k:"note",label:"Nota",type:"text",v:m.note||""});
 if(m.t==="g")f.push({k:"tag",label:"Etiqueta (viaje, mudanza…)",type:"text",v:m.tag||""});
 const extra=[];
 if(m.t==="d"&&!m.closed)extra.push({i:0,t:"Marcar como cobrado",cls:"",f:()=>{m.closed=true;st.mov.push({id:T.uid(),t:"dc",a:m.a,d:A.today(),note:m.note,ref:m.id});A.persist();A.close();A.render();A.toast("Cobrado")}});
 extra.push({i:extra.length,t:"Borrar",cls:"red",f:()=>{const i=st.mov.indexOf(m);st.mov.splice(i,1);A.persist();A.close();A.render();A.toast("Borrado",()=>{st.mov.splice(Math.min(i,st.mov.length),0,m);A.persist();A.render()})}});
 A.form("Movimiento",f,{extra,save:v=>{const a=A.parseAmt(v.a);if(!(a>0)&&m.t!=="aj")return false;m.a=Math.round(m.t==="aj"?A.parseAmt(v.a):a);if(v.c&&v.c!==m.c){m.c=v.c;m.s=undefined}else if(v.s!==undefined)m.s=v.s||undefined;m.d=v.d||m.d;m.note=v.note||undefined;if(m.t==="g")m.tag=v.tag||undefined;m.u=m.u&&m.fx?m.a/m.fx:m.u}})};

/* ===== confirmar pagos y cobros ===== */
A.act.pago=b=>{const st=S(),r=st.rec.find(x=>x.id===b.dataset.rid);if(!r)return;const occ=b.dataset.occ;
 const p=T.upcoming(st,A.today()).find(x=>x.r.id===r.id&&x.occ===occ);const a0=p?p.a:r.a,d0=p?p.date:A.today();
 const annual=r.kind==="anual";
 const extra=[{i:0,t:"Guardar fecha y monto",cls:"ghost",f:v=>{const a=A.parseAmt(v.a);if(!(a>0))return;
   if(r.once){r.date=v.d||r.date;r.a=Math.round(a)}else if(annual){r.due=v.d||r.due;r.a=Math.round(a)}
   else{r.mv=r.mv||{};r.am=r.am||{};if(v.d)r.mv[occ]=v.d;r.am[occ]=Math.round(a)}
   A.persist();A.close();A.render();A.toast("Pago actualizado")}},
  {i:1,t:r.once?"Borrar este pago":"Cancelar este pago",cls:"red",f:()=>{
   if(r.once&&!st.mov.some(m=>m.rid===r.id)){const i=st.rec.indexOf(r);st.rec.splice(i,1);A.persist();A.close();A.render();A.toast("Pago borrado",()=>{st.rec.splice(Math.min(i,st.rec.length),0,r);A.persist();A.render()});return}
   r.skip=r.skip||{};r.skip[occ]=true;A.persist();A.close();A.render();
   A.toast("Pago cancelado",()=>{delete r.skip[occ];A.persist();A.render()})}}];
 A.form(r.name,[{k:"a",label:"Monto",type:"num",v:String(Math.round(a0))},{k:"d",label:"Vence el",type:"date",v:d0},
  ...(annual?[{type:"note",label:"Sale del fondo de anuales: no cuenta como gasto nuevo."}]:r.every>1||r.unit==="w"||r.once?[]:[{type:"note",label:"Si cambiás la fecha o el monto, vale solo para este mes."}])],
  {ok:"Ya lo pagué",extra,save:v=>{const a=A.parseAmt(v.a);if(!(a>0))return false;st.mov.push({id:T.uid(),t:"g",a:Math.round(a),c:r.c||"otros",d:A.today(),note:r.name,rid:r.id,occ});A.buzz(18)}})};
A.act.pagonuevo=()=>{const st=S();
 A.form("Nuevo pago",[{k:"name",label:"¿Qué es?",type:"text",ph:"Alquiler, seguro, cuota…"},{k:"a",label:"Monto",type:"num",v:""},{k:"d",label:"Vence el",type:"date",v:A.today()},
  {k:"rep",label:"Se repite todos los meses",type:"switch",v:false},{k:"c",label:"Categoría",type:"select",v:"casa",opts:st.cats.map(c=>[c.id,c.n])}],
  {ok:"Agregar pago",full:true,save:v=>{const a=A.parseAmt(v.a);if(!v.name.trim()||!(a>0)||!v.d)return false;
   const base={id:T.uid(),kind:"gasto",name:v.name.trim(),a:Math.round(a),cur:"ARS",c:v.c};
   if(v.rep)st.rec.push({...base,day:String(+v.d.slice(8)),every:1,unit:"m",start:v.d.slice(0,7)+"-01"});
   else st.rec.push({...base,once:true,date:v.d})}})};
A.act.cobre=b=>{const st=S(),r=st.rec.find(x=>x.id===b.dataset.rid);if(!r)return;
 A.form("Cobré: "+r.name,[{k:"a",label:"¿Cuánto cobraste?",type:"num",v:String(Math.round(r.a))},{k:"d",label:"Fecha",type:"date",v:A.today()},{type:"note",label:"La diferencia con lo estimado se reparte en lo que queda del mes."}],
  {ok:"Confirmar cobro",save:v=>{const a=A.parseAmt(v.a);if(!(a>0))return false;st.mov.push({id:T.uid(),t:"i",a:Math.round(a),d:v.d,note:r.name,rid:r.id,occ:b.dataset.occ,feeds:r.feeds||"cur"});A.buzz(18)}})};

/* ===== metas, inversiones, deudas, control ===== */
function goalForm(g){const isNew=!g;g=g||{id:T.uid(),name:"",cur:"USD",a:0,pct:0,saved0:0,ic:"home"};const st=S();
 const extra=isNew?[]:[{i:0,t:"Borrar meta",cls:"red",f:()=>{st.goals=st.goals.filter(x=>x.id!==g.id);A.persist();A.close();A.render()}}];
 A.form(isNew?"Nueva meta":"Meta",[{k:"name",label:"Nombre",type:"text",v:g.name,ph:"Casa propia"},{k:"cur",label:"Moneda",type:"select",v:g.cur,opts:[["USD","Dólares"],["ARS","Pesos"]]},
  {k:"a",label:"Monto a juntar"+(g.auto?" (se calcula solo)":""),type:"num",v:g.auto?"":String(g.a||""),ph:g.auto?"automático":"0"},{k:"saved0",label:"Lo que ya tenés ahorrado",type:"num",v:String(g.saved0||"")},
  {k:"date",label:"Fecha deseada (opcional)",type:"date",v:g.date||""},{k:"pct",label:"% de tu ahorro que va a esta meta",type:"num",v:String(g.pct||"")},
  {k:"ic",label:"Dibujo",type:"select",v:g.ic||"home",opts:[["home","Casa"],["plane","Viaje"],["shield","Colchón"],["gift","Regalo"],["car","Auto"]]}],
  {extra,full:true,save:v=>{if(!v.name.trim())return false;Object.assign(g,{name:v.name.trim(),cur:v.cur,a:g.auto?0:A.parseAmt(v.a),saved0:A.parseAmt(v.saved0),date:v.date||undefined,pct:Math.round(A.parseAmt(v.pct)),ic:v.ic});if(isNew)st.goals.push(g)}})}
A.act.goal=b=>goalForm(S().goals.find(g=>g.id===b.dataset.id));A.act.goalnew=()=>goalForm(null);
function listForm(arr,id,title,fields,make,extraDel){const st=S();const it=id?arr.find(x=>x.id===id):null;
 A.form(title,fields(it),{extra:it?[{i:0,t:"Borrar",cls:"red",f:()=>{const i=arr.indexOf(it);arr.splice(i,1);A.persist();A.close();A.render()}}]:[],save:v=>{const o=make(v);if(!o)return false;if(it)Object.assign(it,o);else arr.push(Object.assign({id:T.uid()},o))}})}
A.act.inv=b=>invForm(b.dataset.id);A.act.invnew=()=>invForm(null);
function invForm(id){listForm(S().inv,id,id?"Inversión":"Nueva inversión",it=>[{k:"name",label:"Nombre",type:"text",v:it?it.name:"",ph:"Bitcoin, S&P 500, Nexo…"},{k:"cur",label:"Moneda",type:"select",v:it?it.cur:"USD",opts:[["USD","Dólares"],["ARS","Pesos"]]},{k:"v",label:"Cuánto vale hoy",type:"num",v:it?String(it.v):""}],v=>v.name.trim()&&A.parseAmt(v.v)>=0?{name:v.name.trim(),cur:v.cur,v:A.parseAmt(v.v)}:null)}
A.act.debt=b=>debtForm(b.dataset.id);A.act.debtnew=()=>debtForm(null);
function debtForm(id){listForm(S().debts,id,id?"Deuda":"Nueva deuda",it=>[{k:"name",label:"¿A quién o qué?",type:"text",v:it?it.name:"",ph:"Tarjeta, préstamo…"},{k:"cur",label:"Moneda",type:"select",v:it?it.cur:"ARS",opts:[["ARS","Pesos"],["USD","Dólares"]]},{k:"a",label:"Cuánto debés",type:"num",v:it?String(it.a):""}],v=>v.name.trim()&&A.parseAmt(v.a)>0?{name:v.name.trim(),cur:v.cur,a:A.parseAmt(v.a)}:null)}
A.act.controlusd=()=>{const st=S(),bx=T.boxes(st);
 A.form("Control de dólares",[{type:"note",label:"En la app figuran USD "+A.fmt2(bx.usd)+". Contá cuántos dólares hay de verdad."},{k:"r",label:"Cuántos dólares tenés hoy",type:"num",v:""}],
  {ok:"Registrar",save:v=>{if(v.r==="")return false;const r=A.parseAmt(v.r);const diff=Math.round((r-bx.usd)*100)/100;if(diff===0){A.toast("Está todo al día");return}st.init.usd=Math.round(((st.init.usd||0)+diff)*100)/100;A.toast("Dólares corregidos")}})};
A.act.control=()=>{const st=S(),bx=T.boxes(st);
 A.form("Control de pesos",[{type:"note",label:"En la app figuran "+A.money(bx.ars)+" en pesos. Contá cuánto hay de verdad (cuenta, billetera, efectivo)."},{k:"r",label:"Cuánto tenés hoy",type:"num",v:""}],
  {ok:"Registrar",save:v=>{const r=A.parseAmt(v.r);if(!(v.r!==""))return false;const diff=Math.round(r-bx.ars);if(diff===0){A.toast("Está todo al día");return}
   if(diff<0)st.mov.push({id:T.uid(),t:"g",a:-diff,c:"otros",d:A.today(),note:"Gasto sin detalle"});else st.mov.push({id:T.uid(),t:"aj",a:diff,d:A.today(),note:"Ajuste de control"});A.toast(diff<0?"Quedó como gasto sin detalle":"Ajuste registrado, no cuenta como ingreso")}})};

/* ===== recurrentes ===== */
const DAYS=[...Array.from({length:31},(_,i)=>[String(i+1),"Día "+(i+1)]),["b1","1.er día hábil"],["b2","2.º día hábil"],["b3","3.er día hábil"],["last","Último día hábil"]];
const EVERY=[["m1","Todos los meses"],["m2","Cada 2 meses"],["m3","Cada 3 meses"],["m6","Cada 6 meses"],["m12","Una vez por año"],["w1","Todas las semanas"],["w2","Cada 2 semanas"],["w4","Cada 4 semanas"]];
function recForm(id,kind){const st=S();const r=id?st.rec.find(x=>x.id===id):null;kind=r?r.kind:kind;
 const nm=kind==="ingreso"?"ingreso":kind==="anual"?"gasto anual":"gasto fijo";
 const f=[{k:"name",label:"Nombre",type:"text",v:r?r.name:"",ph:kind==="ingreso"?"Sueldo":kind==="anual"?"Seguro del auto":"Alquiler"},
  {k:"a",label:kind==="ingreso"?"Monto estimado (tu mínimo)":"Monto",type:"num",v:r?String(r.a):""},{k:"cur",label:"Moneda",type:"select",v:r?r.cur||"ARS":"ARS",opts:[["ARS","Pesos"],["USD","Dólares"]]}];
 if(kind!=="ingreso")f.push({k:"c",label:"Categoría",type:"select",v:r?r.c:"casa",opts:st.cats.map(c=>[c.id,c.n])});
 if(kind==="anual")f.push({k:"due",label:"Vence el",type:"date",v:r?r.due:""},{k:"start",label:"Empezar a apartar desde",type:"date",v:r?r.start+"-01":A.today().slice(0,7)+"-01"});
 else{f.push({k:"day",label:"Día del mes",type:"select",v:r?r.day:(kind==="ingreso"?"b2":"10"),opts:DAYS},{k:"every",label:"Cada cuánto",type:"select",v:r?(r.unit==="w"?"w":"m")+r.every:"m1",opts:EVERY},{k:"start",label:"Desde",type:"date",v:r?r.start:A.today().slice(0,8)+"01"});
  if(kind==="ingreso")f.push({k:"next",label:"Alimenta el mes que viene (no el actual)",type:"switch",v:r?r.feeds==="next":false})}
 const extra=[];
 if(r){const k0=T.addM(A.today().slice(0,7),1)+"-01";
  extra.push({i:0,t:r.paused?"Reanudar":"Pausar desde el mes que viene",cls:"",f:()=>{if(r.paused)delete r.paused;else r.paused=k0;A.persist();A.close();A.render()}});
  extra.push({i:1,t:"Terminar este mes",cls:"",f:()=>{r.end=A.today().slice(0,7)+"-"+T.pad(T.dim(A.today().slice(0,7)));A.persist();A.close();A.render()}});
  extra.push({i:2,t:"Borrar",cls:"red",f:()=>{if(st.mov.some(m=>m.rid===r.id)){A.toast("Tiene movimientos: usá Terminar este mes");return}st.rec=st.rec.filter(x=>x!==r);A.persist();A.close();A.render()}})}
 A.form((r?"":"Nuevo ")+nm,f,{extra,full:true,save:v=>{const a=A.parseAmt(v.a);if(!v.name.trim()||!(a>0))return false;
  const o={kind,name:v.name.trim(),a,cur:v.cur,c:v.c};
  if(kind==="anual"){if(!v.due)return false;o.due=v.due;o.start=(v.start||A.today()).slice(0,7)}
  else{o.day=v.day;o.unit=v.every[0];o.every=+v.every.slice(1);o.start=v.start||A.today();if(kind==="ingreso")o.feeds=v.next?"next":"cur"}
  if(r)Object.assign(r,o);else st.rec.push(Object.assign({id:T.uid()},o))}})}
A.act.rec=b=>{A._back=true;recForm(b.dataset.id)};A.act.recnew=b=>{A._back=true;recForm(null,b.dataset.k)};

A.act.cuota=b=>{const st=S(),x=st.spr.find(y=>y.id===b.dataset.id);if(!x)return;A._back=true;
 A.form("Cuotas",[{k:"name",label:"¿Qué es?",type:"text",v:x.name},{k:"total",label:"Total",type:"num",v:String(x.total)},{k:"n",label:"Cantidad de cuotas",type:"num",v:String(x.n)}],
  {ok:"Guardar",extra:[{i:0,t:"Ya terminé de pagarlas",cls:"ghost",f:()=>{x.ended=true;A.persist();A.close();A.render();A._back=false;setTimeout(A.act.ajustes,340)}},{i:1,t:"Borrar",cls:"red",f:()=>{st.spr=st.spr.filter(y=>y!==x);A.persist();A.close();A.render();A._back=false;setTimeout(A.act.ajustes,340)}}],
  save:v=>{const t=A.parseAmt(v.total),n=Math.round(A.parseAmt(v.n));if(!v.name.trim()||!(t>0)||!(n>=1))return false;Object.assign(x,{name:v.name.trim(),total:Math.round(t),n})}})};
/* ===== categorías ===== */
const PAL=["#FFC21A","#19D3C5","#FF4D8D","#FF3B30","#35D07F","#FF8A00","#3AA0FF","#A78BFA","#A3E635","#B5651D"];
function catForm(id,fromCarga){const st=S();const c=id?st.cats.find(x=>x.id===id):null;
 const prev=D&&fromCarga;
 const extra=c?[{i:0,t:"Borrar categoría",cls:"red",f:()=>{if(st.mov.some(m=>m.c===c.id)){A.toast("Tiene movimientos: no se puede borrar");return}st.cats=st.cats.filter(x=>x!==c);A.persist();A.close();A.render()}}]:[];
 A.form(c?"Categoría":"Nueva categoría",[{k:"n",label:"Nombre",type:"text",v:c?c.n:""},{k:"c",label:"Color",type:"select",v:c?c.c:PAL[0],opts:PAL.map((p,i)=>[p,["Amarillo","Verde agua","Rosa","Rojo","Verde","Naranja","Azul","Violeta","Lima","Marrón"][i]])},
  {k:"ic",label:"Ícono",type:"select",v:c?c.ic:"dots",opts:["cart","fuel","glass","car","bag","heart","home","plus","bolt","paw","book","gym","tv","wifi","cut","gift","dots"].map(x=>[x,{cart:"Carrito",fuel:"Surtidor",glass:"Copa",car:"Auto",bag:"Bolsa",heart:"Corazón",home:"Casa",plus:"Cruz",bolt:"Rayo",paw:"Huella",book:"Libro",gym:"Pesas",tv:"Pantalla",wifi:"Wifi",cut:"Tijera",gift:"Regalo",dots:"Puntos"}[x]])},
  {k:"subs",label:"Detalles (separados por coma)",type:"text",v:c?(c.subs||[]).map(x=>x.n).join(", "):"",ph:"Ropa, perfumería, tecnología…"},{k:"lim",label:"Límite mensual (opcional)",type:"num",v:c&&c.lim?String(c.lim):""},{k:"v",label:"Es un gasto vital",type:"switch",v:c?!!c.v:false}],
  {extra,full:true,save:v=>{if(!v.n.trim())return false;const nm=(v.subs||"").split(",").map(x=>x.trim()).filter(Boolean),old=(c&&c.subs)||[],cid=c?c.id:"c"+T.uid();const subs=nm.map(n=>{const e=old.find(x=>x.n.toLowerCase()===n.toLowerCase());return e||{id:cid+"."+T.uid(),n}});const o={n:v.n.trim(),c:v.c,ic:v.ic,subs,lim:A.parseAmt(v.lim)||undefined,v:v.v?1:undefined};if(c)Object.assign(c,o);else{const nc=Object.assign({id:cid},o);st.cats.push(nc);if(prev)setTimeout(()=>{A.openCarga();D.c=nc.id;D.more=true;drawCarga()},320)}}})}
A.act.cat=b=>{A._back=true;catForm(b.dataset.id)};A.act.catnew=()=>{A._back=true;catForm(null)};

/* ===== ajustes ===== */
A.act.ajustes=()=>{const st=S();
 const recRow=r=>`<button class="tile" data-a="rec" data-id="${r.id}"><span class="m">${A.esc(r.name)}<small>${r.kind==="ingreso"?"ingreso":r.kind==="anual"?"anual, vence "+A.dateLong(r.due):"fijo"}${r.paused?" · en pausa":""}${r.end?" · termina "+A.dateShort(r.end):""}</small></span><span class="a" style="color:var(--cream)">${r.cur==="USD"?"USD ":"$ "}${A.fmt(r.a)}</span></button>`;
 A.sheet(`${A.head("Ajustes")}<div class="sh-body">
 <div class="two"><label class="fld"><span>Ahorro del mes (%)</span><input id="as" inputmode="numeric" value="${st.cfg.savePct}"></label><label class="fld"><span>Dólar MEP ($)</span><input id="afx" inputmode="decimal" value="${A.fmt2(st.cfg.fx).replace(/\./g,"")}"></label></div>
 <button class="go ghost" data-a="fxget" style="height:46px;margin-top:10px">Traer el dólar de hoy</button><div class="note" id="fxn">${st.cfg.fxAuto===false?"Está fijo a mano. Tocá el botón para volver al automático.":st.cfg.fxAt?"Automático · actualizado "+new Date(st.cfg.fxAt).toLocaleString("es-AR",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"Se actualiza solo al abrir la app."}</div>
 <div class="h3">Ingresos</div>${st.rec.filter(r=>r.kind==="ingreso").map(recRow).join("")}<button class="go ghost" data-a="recnew" data-k="ingreso" style="height:46px;margin-top:0">+ Ingreso que se repite</button>
 <div class="h3">Gastos fijos</div>${st.rec.filter(r=>r.kind==="gasto").map(recRow).join("")}<button class="go ghost" data-a="recnew" data-k="gasto" style="height:46px;margin-top:0">+ Gasto fijo</button>
 <div class="h3">Gastos anuales</div>${st.rec.filter(r=>r.kind==="anual").map(recRow).join("")}<button class="go ghost" data-a="recnew" data-k="anual" style="height:46px;margin-top:0">+ Gasto anual</button>
 <div class="h3">Cuotas</div>${st.spr.filter(x=>!x.ended).map(x=>`<button class="tile" data-a="cuota" data-id="${x.id}"><span class="m">${A.esc(x.name)}<small>${x.n} cuotas · desde ${A.monthName(x.start)}</small></span><span class="a" style="color:var(--cream)">$ ${A.fmt(Math.round(x.total/x.n))}</span></button>`).join("")||`<div class="note" style="margin:0 0 6px">Se cargan desde el + con el botón Cuotas.</div>`}
 <div class="h3">Categorías</div><div class="chips" style="margin-top:0">${st.cats.map(c=>`<button class="chip" data-a="cat" data-id="${c.id}"><i style="width:8px;height:8px;border-radius:4px;background:${c.c}"></i>${A.esc(c.n)}</button>`).join("")}<button class="chip" data-a="catnew">+ Nueva</button></div>
 <div class="h3">Respaldo</div><div class="two"><button class="go ghost" data-a="export" style="margin:0;height:46px">Exportar todo</button><label class="go ghost" style="margin:0;height:46px;line-height:46px;display:block;cursor:pointer">Importar<input type="file" id="imp" accept=".json,application/json" hidden></label></div>
 <div class="note" style="text-align:center;margin-top:16px">Tope v5 · versión 8</div><button class="go red" data-a="reset" style="margin-top:22px;height:46px">Borrar todo y empezar de nuevo</button></div>`,{part:true,onClose:saveAjustes});};
document.addEventListener("input",e=>{if(e.target.id==="as"||e.target.id==="afx")saveAjustes(true)});
function saveAjustes(quiet){const st=S(),a=A.$("#as"),f=A.$("#afx");if(a){const v=Math.round(A.parseAmt(a.value));if(v>=0&&v<=90)st.cfg.savePct=v}if(f){const v=A.parseAmt(f.value);if(v>0&&v!==st.cfg.fx){st.cfg.fx=v;st.cfg.fxAuto=false}}A.persist();if(!quiet)A.render()}
A.act.fxget=async b=>{const n=A.$("#fxn");n.textContent="Buscando…";const v=await A.fetchFx(true);if(v){A.$("#afx").value=String(v);n.textContent="Dólar MEP de hoy: $ "+A.fmt(v)+". Se actualiza solo al abrir la app."}else n.textContent="No pude traerlo (¿sin señal?). Cargalo a mano."};
A.act.export=()=>{const b=new Blob([JSON.stringify(S(),null,1)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="tope-respaldo-"+A.today()+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)};
document.addEventListener("change",async e=>{if(e.target.id==="imp"){const f=e.target.files[0];if(!f)return;try{const j=JSON.parse(await f.text());if(j.v!==5||!Array.isArray(j.mov))throw 0;A.S=j;A.persist();A.close();A.render();A.toast("Respaldo importado")}catch(x){A.toast("Ese archivo no es un respaldo de Tope")}}});
A.act.reset=b=>{if(b.dataset.s!=="1"){b.dataset.s="1";b.textContent="Tocá de nuevo para borrar todo";return}A.S=T.fresh();A.persist();A.close(true);A.render();A.wizard()};

/* ===== asistente inicial de 5 pasos ===== */
let W=null;
const FIJOS=[["Alquiler","casa"],["Expensas","casa"],["Servicios","servicios"],["Internet y teléfono","servicios"],["Prepaga","salud"]];
A.wizard=function(keep){if(!keep||!W)W={i:0,d:{ars:"",usd:"",sue:"",sueYa:false,sueReal:"",can:"",canYa:false,canReal:"",pct:"25",fj:FIJOS.map(()=>({a:"",d:"10"})),g:[{name:"Casa propia",a:"48000",pct:"60",ic:"home"},{name:"Viaje a Europa",a:"4500",pct:"20",ic:"plane"},{name:"Colchón de emergencia",a:"",pct:"20",ic:"shield",auto:1}]}};A.sheet("",{cls:"wiz",onClose:()=>{if(!A.S.setup)setTimeout(()=>A.wizard(true),40)}});wz()};
const inp=(k,l,ph,ex)=>`<label class="fld"><span>${l}</span><input data-w="${k}" inputmode="decimal" placeholder="${ph||""}" value="${A.esc(W.d[k])}" autocomplete="off" ${ex||""}></label>`;
function wz(){const d=W.d,i=W.i;let b="",t="",s="";
 if(i===0){t="¿Cuánto tenés hoy?";s="La plata que ya tenés. Después se mueve sola con lo que anotes.";b=inp("ars","En pesos (cuenta, billetera, efectivo)","0")+inp("usd","En dólares (efectivo o cuenta)","0")}
 if(i===1){t="Tus ingresos";s="Tu sueldo cambia: poné tu mínimo. Cuando cobres de verdad, lo confirmás con un toque.";
  b=inp("sue","Tu sueldo mínimo estimado ($, 2.º día hábil)","0")+`<button class="sw ${d.sueYa?"on":""}" data-a="wsw" data-k="sueYa"><span>Ya cobraste este mes</span><i></i></button>${d.sueYa?inp("sueReal","¿Cuánto cobraste?","0"):""}`+
  inp("can","Sueldo de Cande ($, último día hábil)","0")+`<button class="sw ${d.canYa?"on":""}" data-a="wsw" data-k="canYa"><span>Cande ya cobró el que alimenta este mes</span><i></i></button>${d.canYa?inp("canReal","¿Cuánto cobró?","0"):""}<div class="note">El de Cande alimenta el mes que arranca; el tuyo, el mes en curso.</div>`}
 if(i===2){t="Gastos fijos";s="Los que ya sabés cada mes. Dejá vacío lo que no tengas. Los que ya vencieron este mes quedan como pagados.";
  b=FIJOS.map((f,j)=>`<div class="two" style="grid-template-columns:1fr 92px"><label class="fld"><span>${f[0]}</span><input data-w="fa${j}" inputmode="decimal" placeholder="0" value="${A.esc(d.fj[j].a)}"></label><label class="fld"><span>Día</span><input data-w="fd${j}" inputmode="numeric" value="${A.esc(d.fj[j].d)}"></label></div>`).join("")}
 if(i===3){t="Cuánto ahorrar";s="Se aparta de cada ingreso apenas entra. Después lo cambiás en Ajustes.";b=inp("pct","Porcentaje del ingreso","25")}
 if(i===4){t="Tus metas";s="Repartí el ahorro entre ellas. El colchón se calcula solo con 6 meses de gastos vitales.";
  b=d.g.map((g,j)=>`<div class="card"><h4>${A.ic(g.ic)}${A.esc(g.name)}</h4><div class="two"><label class="fld" style="margin:0"><span>${g.auto?"Monto":"Monto (USD)"}</span><input data-w="ga${j}" inputmode="decimal" placeholder="${g.auto?"automático":"0"}" value="${A.esc(g.a)}" ${g.auto?"disabled":""}></label><label class="fld" style="margin:0"><span>% del ahorro</span><input data-w="gp${j}" inputmode="numeric" value="${A.esc(g.pct)}"></label></div></div>`).join("")}
 setSheet(`<div class="sh-body" style="padding-top:calc(var(--safe-t) + 20px)"><div class="dots">${[0,1,2,3,4].map(x=>`<i class="${x<=i?"on":""}"></i>`).join("")}</div>
 <div class="lab" style="margin-top:22px">Paso ${i+1} de 5</div><h2 class="title" style="font-size:calc(44px*var(--k,1));margin-top:4px">${t}</h2><div class="note" style="font-size:calc(15px*var(--k,1));margin-bottom:10px">${s}</div>${b}
 <button class="go" data-a="wnext">${i===4?"Listo, empezar":"Siguiente"}</button>${i>0?`<button class="go ghost" data-a="wback">Atrás</button>`:""}</div>`);
}
A.act.wsw=b=>{const k=b.dataset.k;W.d[k]=!W.d[k];wzKeep()};
const wzKeep=()=>{const y=sc().scrollTop;wz();sc().scrollTop=y};
document.addEventListener("input",e=>{const k=e.target.dataset&&e.target.dataset.w;if(!k||!W)return;const d=W.d,v=e.target.value;
 if(k[0]==="f"&&/\d$/.test(k)){const j=+k.slice(2);d.fj[j][k[1]==="a"?"a":"d"]=v}else if(k[0]==="g"&&/\d$/.test(k)){const j=+k.slice(2);W.d.g[j][k[1]==="a"?"a":"pct"]=v}else d[k]=v});
A.act.wback=()=>{W.i--;wz()};
A.act.wnext=()=>{if(W.i<4){W.i++;wz();return}
 const st=S(),d=W.d,P=A.parseAmt,k=A.today().slice(0,7),pk=T.addM(k,-1);
 st.init={ars:Math.round(P(d.ars)),usd:P(d.usd)};st.cfg.savePct=Math.min(90,Math.max(0,Math.round(P(d.pct))));
 if(P(d.sue)>0){st.rec.push({id:"sueldo",kind:"ingreso",name:"Mi sueldo",a:Math.round(P(d.sue)),day:"b2",every:1,unit:"m",start:k+"-01",feeds:"cur"});
  if(d.sueYa&&P(d.sueReal)>0)st.mov.push({id:T.uid(),t:"i",a:Math.round(P(d.sueReal)),d:T.iso(T.nthBizDay(k,2)),note:"Mi sueldo",rid:"sueldo",occ:k,feeds:"cur",ini:true})}
 if(P(d.can)>0){st.rec.push({id:"cande",kind:"ingreso",name:"Sueldo de Cande",a:Math.round(P(d.can)),day:"last",every:1,unit:"m",start:pk+"-01",feeds:"next"});
  if(d.canYa&&P(d.canReal)>0)st.mov.push({id:T.uid(),t:"i",a:Math.round(P(d.canReal)),d:T.iso(T.lastBizDay(pk)),note:"Sueldo de Cande",rid:"cande",occ:pk,feeds:"next",ini:true})}
 FIJOS.forEach((f,j)=>{const a=P(d.fj[j].a);if(!(a>0))return;const dia=Math.min(28,Math.max(1,+d.fj[j].d||10)),id=T.uid();
  st.rec.push({id,kind:"gasto",name:f[0],a:Math.round(a),cur:"ARS",c:f[1],day:String(dia),every:1,unit:"m",start:k+"-01"});
  if(dia<+A.today().slice(8))st.mov.push({id:T.uid(),t:"g",a:Math.round(a),c:f[1],d:k+"-"+T.pad(dia),note:f[0],rid:id,occ:k,ini:true})});
 st.goals=d.g.map(g=>({id:T.uid(),name:g.name,cur:"USD",a:P(g.a),pct:Math.round(P(g.pct)),ic:g.ic,auto:g.auto?"colchon":undefined,saved0:0}));
 st.setup=true;A.persist();A.close();A.render();A.fetchFx(true)};
})();

(function(){const st=()=>A.S;
 const f=(c)=>A.form(c&&c.lim?"Límite de "+c.n:"Nuevo límite mensual",[...(c&&c.lim?[]:[{k:"c",label:"Categoría",type:"select",v:st().cats.find(x=>!x.lim)?.id,opts:st().cats.filter(x=>!x.lim).map(x=>[x.id,x.n])}]),{k:"lim",label:"Tope por mes",type:"num",v:c&&c.lim?String(c.lim):""}],
  {ok:"Guardar",extra:c&&c.lim?[{i:0,t:"Quitar límite",cls:"red",f:()=>{c.lim=undefined;A.persist();A.close();A.render()}}]:[],save:v=>{const a=A.parseAmt(v.lim);if(!(a>0))return false;const t=c||st().cats.find(x=>x.id===v.c);if(!t)return false;t.lim=Math.round(a)}});
 A.act.limnuevo=()=>{if(!st().cats.some(x=>!x.lim)){A.toast("Todas tienen límite");return}f(null)};
 A.act.limedit=b=>f(st().cats.find(x=>x.id===b.dataset.id));
})();
