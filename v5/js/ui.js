/* Tope v5 — utilidades de interfaz */
(function(){
const A=window.A={act:{},f:{q:"",m:null,c:"",tag:""}};

/* el sistema (Android) puede agrandar toda la letra: lo medimos y lo compensamos para que se vea igual en cualquier celu */
A.fitK=function(){try{const q=new URLSearchParams(location.search).get("k");let k=1;
 if(q)k=+q||1;else{const d=document.createElement("div");d.style.cssText="position:absolute;visibility:hidden;font-size:100px;line-height:1;font-family:Arial,sans-serif;white-space:nowrap";d.textContent="Hg";document.body.appendChild(d);const h=d.getBoundingClientRect().height;d.remove();if(h>101)k=Math.max(.65,Math.min(1,100/h))}
 document.documentElement.style.setProperty("--k",String(k));A.K=k}catch(e){}};
A.fitK();
A.S=T.load(localStorage);
let _sf=0;T.saveFail(()=>{if(Date.now()-_sf>20000){_sf=Date.now();setTimeout(()=>A.toast&&A.toast("No se pudo guardar: sin espacio en el teléfono. Hacé un respaldo"),50)}});
A.persist=()=>T.save(localStorage,A.S);
A.today=()=>{const q=new URLSearchParams(location.search).get("hoy");return q||T.iso(new Date())};T.nowF.f=A.today;
A.$=s=>document.querySelector(s);
A.esc=s=>String(s==null?"":s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
A.fmt=n=>{n=Math.round(n);const s=String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g,".");return (n<0?"-":"")+s};
A.fmt2=n=>{const v=Math.round(n*100)/100;const [i,d]=String(Math.abs(v)).split(".");return (v<0?"-":"")+i.replace(/\B(?=(\d{3})+(?!\d))/g,".")+(d?","+d:"")};
A.money=n=>"$ "+A.fmt(n);
A.usd=n=>"USD "+A.fmt2(n);
A.k=n=>{const a=Math.abs(n);return (n<0?"-":"")+(a>=1e6?(a/1e6).toFixed(1).replace(".",",")+" M":Math.round(a/1e3)+"k")};
A.parseAmt=s=>{s=String(s||"").trim();if(/^\d+\.\d{1,2}$/.test(s))s=s.replace(".",",");s=s.replace(/\./g,"").replace(",",".");const v=parseFloat(s);return isFinite(v)?v:0};
const MES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
A.MES=MES;
A.dateLong=iso=>{const d=T.fromIso(iso);return d.getDate()+" de "+MES[d.getMonth()]+" "+d.getFullYear()};
A.dateShort=iso=>{const d=T.fromIso(iso);const dn=["dom","lun","mar","mié","jue","vie","sáb"][d.getDay()];return dn+" "+d.getDate()+" "+MES[d.getMonth()].slice(0,3)};
A.monthName=k=>{const [y,m]=k.split("-").map(Number);return MES[m-1]+" "+y};

const P={
 cart:"M3 4h2l2 11h11l2-8H6M9 20h.01M17 20h.01",fuel:"M6 20V5h8v15M6 20h8M14 9h3l2 2v7a1.5 1.5 0 0 1-3 0v-4",
 glass:"M8 3h8l-1 7a3 3 0 0 1-6 0zM12 13v8M8 21h8",car:"M5 16V9l2-4h10l2 4v7M5 16h14M8 19v-3M16 19v-3",
 bag:"M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2",heart:"M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z",
 home:"M4 11l8-6 8 6v8H4zM10 19v-5h4v5",plus:"M5 5h14v14H5zM12 8.5v7M8.5 12h7",bolt:"M13 3L5 14h6l-1 7 8-11h-6z",
 paw:"M7 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 12c-3 0-5 3-5 5s2 3 5 3 5-1 5-3-2-5-5-5z",
 dots:"M6 12h.01M12 12h.01M18 12h.01",income:"M12 19V5M6 11l6-6 6 6",
 coin:"M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 7.5v9M9.5 10h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4",
 owe:"M4 12h14M13 6l6 6-6 6",plane:"M3 13l18-7-5 14-4-6z",shield:"M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z",
 list:"M4 6h16M4 12h16M4 18h10",clock:"M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",chart:"M4 17l5-6 4 3 7-9",
 x:"M6 6l12 12M18 6L6 18",check:"M5 12l5 5 9-10",book:"M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11",
 gym:"M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12",tv:"M4 6h16v11H4zM9 21h6",wifi:"M3 9a14 14 0 0 1 18 0M6 12.5a9 9 0 0 1 12 0M9 16a4 4 0 0 1 6 0M12 19.5h.01",
 cut:"M6 7a2 2 0 1 0 0 .01M6 17a2 2 0 1 0 0 .01M8 8l12 9M8 16l12-9",gift:"M4 11h16v9H4zM3 8h18v3H3zM12 8v12M12 8c-3 0-4-3-2-4s3 2 2 4zM12 8c3 0 4-3 2-4s-3 2-2 4z"
};
A.P=P;
A.svg=n=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n]||P.dots}"/></svg>`;
A.cat=id=>A.S.cats.find(c=>c.id===id)||{id,n:"Otros",ic:"dots",c:"#7C8AA5"};
A.subc=(hex,i,n)=>{const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
 const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,sat=0;const l=(mx+mn)/2;
 if(mx!==mn){const d=mx-mn;sat=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}
 const t=n<=1?.5:i/(n-1);return `hsl(${Math.round(h)} ${Math.round(Math.max(60,sat*100))}% ${Math.round(36+t*40)}%)`};
A.subName=(cid,sid)=>{const c=A.cat(cid),x=sid&&(c.subs||[]).find(y=>y.id===sid);return x?x.n:""};
A.ic=(n,c)=>`<span class="ic" style="--c:${c||"var(--acc)"}">${A.svg(n)}</span>`;
A.catIc=id=>{const c=A.cat(id);return A.ic(c.ic,c.c)};
A.catSvg=c=>`<svg viewBox="0 0 24 24" style="--c:${c.c}" aria-hidden="true"><path d="${P[c.ic]||P.dots}"/></svg>`;

/* hoja inferior */
let sheetOpen=false,onClose=null;
A.sheet=(html,o)=>{o=o||{};const sh=A.$("#sheet");sh.className="sheet"+(o.part?" part":"")+(o.cls?" "+o.cls:"");sh.innerHTML=html;
 requestAnimationFrame(()=>{sh.classList.add("on");A.$("#scrim").classList.add("on")});
 if(!sheetOpen){sheetOpen=true;try{history.pushState({s:1},"")}catch(e){}}onClose=o.onClose||null;};
A.close=(fromPop)=>{if(!sheetOpen)return;sheetOpen=false;const sh=A.$("#sheet");sh.classList.remove("on");A.$("#scrim").classList.remove("on");
 if(!fromPop){try{history.back()}catch(e){}}const f=onClose;onClose=null;f&&f();setTimeout(()=>{if(!sheetOpen)sh.innerHTML=""},300)};
window.addEventListener("popstate",()=>{if(sheetOpen)A.close(true)});
A.isOpen=()=>sheetOpen;
A.head=(t)=>`<div class="sh-head"><h2>${t}</h2><button class="xbtn" data-a="close" aria-label="Cerrar"><svg viewBox="0 0 24 24"><path d="${P.x}"/></svg></button></div>`;
A.act.close=()=>A.close();
A.$("#scrim").addEventListener("click",()=>A.close());

/* aviso con deshacer */
let tt=null;
A.toast=(msg,undo)=>{const t=A.$("#toast");t.innerHTML=`<span>${A.esc(msg)}</span>${undo?`<button data-a="undo">Deshacer</button>`:""}`;t.classList.add("on");A._undo=undo||null;clearTimeout(tt);tt=setTimeout(()=>{t.classList.remove("on");A._undo=null},5000)};
A.act.undo=()=>{const f=A._undo;A._undo=null;A.$("#toast").classList.remove("on");f&&f()};
A.buzz=(ms)=>{try{navigator.vibrate&&navigator.vibrate(ms||15)}catch(e){}};

/* número que cuenta hasta el nuevo valor */
A.countTo=(el,to,from,fmt)=>{fmt=fmt||A.fmt;if(!el)return;if(from==null||from===to||matchMedia("(prefers-reduced-motion: reduce)").matches){el.textContent=fmt(to);return}
 const t0=performance.now(),dur=650;const step=t=>{const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=fmt(from+(to-from)*e);if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)};

/* clic delegado */
document.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const f=A.act[b.dataset.a];if(f){e.preventDefault();f(b,e)}});
})();
