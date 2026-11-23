/* Path to Proficiency · Fluency practice and the built-in games.
   Loaded in order by index.html as plain scripts that share one global scope. */
/* ---------- fluency by grade: each grade practices the fluency its standards ask for ---------- */
const R6=x=>Math.round(x*1e6)/1e6,SUP=n=>String(n).split("").map(c=>"⁰¹²³⁴⁵⁶⁷⁸⁹"["0123456789".indexOf(c)]||(c==="-"?"⁻":c)).join("");
const fN=x=>{const v=R6(x);return v<0?"−"+Math.abs(v).toLocaleString("en-US",{maximumFractionDigits:6}):v.toLocaleString("en-US",{maximumFractionDigits:6})};
const fP=x=>x<0?`(${fN(x)})`:fN(x);
const FG={
 facts:(ri,pk)=>{const a=ri(2,10),b=ri(2,10);return pk([0,1])?{t:`${a} × ${b}`,ans:a*b,key:`${Math.min(a,b)}×${Math.max(a,b)}`,hard:a+b}:{t:`${a*b} ÷ ${a}`,ans:b,key:`${a*b}÷${a}`,hard:a+b+2}},
 addsub3:(ri,pk)=>{if(pk([0,1])){const a=ri(120,780),b=ri(110,999-a);return {t:`${fN(a)} + ${fN(b)}`,ans:a+b,key:"add",hard:3}}const a=ri(300,999),b=ri(101,a-20);return {t:`${fN(a)} − ${fN(b)}`,ans:a-b,key:"sub",hard:4}},
 addsub4:(ri,pk)=>{if(pk([0,1])){const a=ri(1200,6800),b=ri(1100,9999-a);return {t:`${fN(a)} + ${fN(b)}`,ans:a+b,key:"add",hard:5}}const a=ri(3000,9999),b=ri(1001,a-100);return {t:`${fN(a)} − ${fN(b)}`,ans:a-b,key:"sub",hard:6}},
 pow10:(ri,pk)=>{const a=ri(2,99),p=pk([10,100,1000]);return {t:`${a} × ${fN(p)}`,ans:a*p,key:"x10",hard:2}},
 m1x2:(ri)=>{const a=ri(3,9),b=ri(12,49);return {t:`${a} × ${b}`,ans:a*b,key:"m12",hard:a*b/40}},
 div1:(ri)=>{const d=ri(2,9),q=ri(11,40);return {t:`${d*q} ÷ ${d}`,ans:q,key:"d1",hard:q/8+d/3}},
 div1b:(ri)=>{const d=ri(3,9),q=ri(21,120);return {t:`${d*q} ÷ ${d}`,ans:q,key:"d1",hard:q/20+d/3}},
 dpow10:(ri,pk)=>{const k=pk([0,1,2,3]);if(k===0){const a=ri(11,99)/10,p=pk([10,100]);return {t:`${fN(a)} × ${fN(p)}`,ans:R6(a*p),key:"p10",hard:3}}if(k===1){const a=ri(11,999),p=pk([10,100]);return {t:`${fN(a)} ÷ ${fN(p)}`,ans:R6(a/p),key:"p10",hard:4}}if(k===2){const a=ri(2,9),b=ri(2,9);return {t:`${a*10} × ${b*10}`,ans:a*b*100,key:"m10",hard:3}}const a=ri(2,9),n=ri(1,3);return {t:`${a} × 10${SUP(n)}`,ans:a*10**n,key:"exp10",hard:4}},
 dec_as:(ri,pk)=>{const a=ri(11,99)/10,b=ri(11,999)/100;return pk([0,1])||a<b?{t:`${fN(a)} + ${fN(b)}`,ans:R6(a+b),key:"dadd",hard:4}:{t:`${fN(a)} − ${fN(b)}`,ans:R6(a-b),key:"dsub",hard:5}},
 m2x2:(ri)=>{const a=ri(11,29),b=ri(11,19);return {t:`${a} × ${b}`,ans:a*b,key:"m22",hard:a*b/60}},
 m2x1:(ri,pk)=>pk([0,1])?FG.m1x2(ri):(()=>{const a=ri(2,9)*10,b=ri(2,9)*10;return {t:`${a} × ${b}`,ans:a*b,key:"m10",hard:3}})(),
 dec_m:(ri,pk)=>{if(pk([0,1])){const a=ri(1,9)/10,b=ri(1,9)/10;return {t:`${fN(a)} × ${fN(b)}`,ans:R6(a*b),key:"dm",hard:4}}const a=ri(11,49)/10,b=ri(2,9);return {t:`${fN(a)} × ${b}`,ans:R6(a*b),key:"dm",hard:5}},
 divmulti:(ri)=>{const d=ri(12,48),q=ri(12,64);return {t:`${fN(d*q)} ÷ ${d}`,ans:q,key:"dmulti",hard:q/10+d/10}},
 dec_d:(ri,pk)=>{const d=pk([0.2,0.3,0.4,0.5,0.6,0.8,1.2,2.5]),q=ri(2,12);return {t:`${fN(R6(d*q))} ÷ ${fN(d)}`,ans:q,key:"dd",hard:5}},
 expo:(ri,pk)=>{const b=pk([2,3,4,5,10]),e=b===2?ri(2,6):b===10?ri(2,5):ri(2,3);return {t:`${b}${SUP(e)}`,ans:b**e,key:"exp",hard:e}},
 iadd:(ri,pk)=>{const a=ri(-15,15)||-4,b=ri(-15,15)||7;return {t:`${fN(a)} + ${fP(b)}`,ans:a+b,key:"iadd",hard:3}},
 isub:(ri)=>{const a=ri(-15,15)||-6,b=ri(-15,15)||-3;return {t:`${fN(a)} − ${fP(b)}`,ans:a-b,key:"isub",hard:4}},
 imd:(ri,pk)=>{const a=ri(2,12)*pk([-1,1]),b=ri(2,10)*pk([-1,1]);return pk([0,1])?{t:`${fN(a)} × ${fP(b)}`,ans:a*b,key:"imul",hard:4}:{t:`${fN(a*b)} ÷ ${fP(b)}`,ans:a,key:"idiv",hard:5}},
 iall:(ri,pk)=>pk([FG.iadd,FG.isub,FG.imd,FG.imd])(ri,pk),
 rdec:(ri,pk)=>{const a=R6(ri(-90,90)/10)||-2.5,b=R6(ri(-90,90)/10)||1.5;return pk([0,1])?{t:`${fN(a)} + ${fP(b)}`,ans:R6(a+b),key:"radd",hard:5}:{t:`${fN(a)} − ${fP(b)}`,ans:R6(a-b),key:"rsub",hard:6}},
 pct:(ri,pk)=>{const p=pk([10,20,25,50,75,5,30,40]),base=p===25||p===75?ri(1,12)*4*(pk([1,10])):p===5?ri(1,20)*20:ri(1,12)*10;return {t:`${p}% of ${fN(base)}`,ans:R6(p*base/100),key:"pct",hard:p%10?5:3}},
 sq:(ri,pk)=>{const n=ri(2,15);return pk([0,1])?{t:`${n}${SUP(2)}`,ans:n*n,key:"sq",hard:n/3}:{t:`√${n*n}`,ans:n,key:"sqrt",hard:n/3+1}},
 cube:(ri,pk)=>{const n=ri(1,6);return pk([0,1])?{t:`${n}${SUP(3)}`,ans:n**3,key:"cube",hard:n}:{t:`∛${n**3}`,ans:n,key:"cbrt",hard:n+1}},
 erule:(ri,pk)=>{const b=pk([2,3,5,7,10,"x"]),m=ri(2,9),n=ri(2,9),k=pk([0,1,2]);if(k===0)return {t:`${b}${SUP(m)} · ${b}${SUP(n)} = ${b}^∎`,ans:m+n,key:"eprod",hard:3};if(k===1){const hi=m+n;return {t:`${b}${SUP(hi)} ÷ ${b}${SUP(n)} = ${b}^∎`,ans:m,key:"equot",hard:4}}const a=ri(2,4);return {t:`(${b}${SUP(a)})${SUP(m>5?3:2)} = ${b}^∎`,ans:a*(m>5?3:2),key:"epow",hard:5}},
 enegz:(ri,pk)=>{const k=pk([0,1,2]);if(k===0){const b=ri(2,12);return {t:`${b}${SUP(0)}`,ans:1,key:"e0",hard:2}}if(k===1){const n=ri(1,3);return {t:`10${SUP(-n)}`,ans:R6(10**-n),key:"eneg",hard:5}}const b=pk([2,4,5]);return {t:`${b}${SUP(-1)}`,ans:R6(1/b),key:"eneg",hard:5}},
 sci:(ri,pk)=>{const m=ri(11,99)/10,e=ri(3,7),big=pk([0,1]);if(big){return {t:`${fN(R6(m*10**e))} = ${fN(m)} × 10^∎`,ans:e,key:"sci",hard:5}}const e2=ri(2,5);return {t:`${String(R6(m/10**e2))} = ${fN(m)} × 10^∎`,ans:-e2,key:"sci",hard:6}},
};
const mixOf=(...gs)=>(ri,pk,r)=>pk(gs)(ri,pk,r);
const FLU_SETS={3:FLU_G3,
 4:[{name:"× and ÷ facts review",gen:FG.facts},{name:"Add and subtract within 1,000",gen:FG.addsub3},{name:"Multiply by 10, 100, and 1,000",gen:FG.pow10},{name:"Add and subtract 4-digit numbers",gen:FG.addsub4},{name:"1-digit × 2-digit",gen:FG.m1x2},{name:"Divide by a 1-digit number",gen:FG.div1},{name:"Mixed review",gen:mixOf(FG.facts,FG.addsub4,FG.m1x2,FG.div1,FG.pow10)}],
 5:[{name:"× and ÷ facts review",gen:FG.facts},{name:"Powers of 10 (with decimals)",gen:FG.dpow10,dec:1},{name:"2-digit × 1-digit and tens × tens",gen:FG.m2x1},{name:"Add and subtract decimals",gen:FG.dec_as,dec:1},{name:"Divide by a 1-digit number",gen:FG.div1b},{name:"2-digit × 2-digit",gen:FG.m2x2},{name:"Mixed review",gen:mixOf(FG.facts,FG.dpow10,FG.dec_as,FG.div1b,FG.m2x2),dec:1}],
 6:[{name:"Powers of 10 with decimals",gen:FG.dpow10,dec:1},{name:"Add and subtract decimals",gen:FG.dec_as,dec:1},{name:"Multiply decimals",gen:FG.dec_m,dec:1},{name:"Divide multi-digit numbers",gen:FG.divmulti},{name:"Divide decimals",gen:FG.dec_d,dec:1},{name:"Whole-number exponents",gen:FG.expo},{name:"Mixed review",gen:mixOf(FG.dec_as,FG.dec_m,FG.divmulti,FG.dec_d,FG.expo),dec:1}],
 7:[{name:"Add integers",gen:FG.iadd,neg:1},{name:"Subtract integers",gen:FG.isub,neg:1},{name:"Multiply and divide integers",gen:FG.imd,neg:1},{name:"All four integer operations",gen:FG.iall,neg:1},{name:"Decimals with negatives",gen:FG.rdec,neg:1,dec:1},{name:"Percent of a number",gen:FG.pct,dec:1},{name:"Mixed review",gen:mixOf(FG.iall,FG.rdec,FG.pct),neg:1,dec:1}],
 8:[{name:"Squares and square roots",gen:FG.sq},{name:"Cubes and cube roots",gen:FG.cube},{name:"Exponent rules: find the exponent",gen:FG.erule},{name:"Zero and negative exponents",gen:FG.enegz,dec:1},{name:"Scientific notation: find the exponent",gen:FG.sci,neg:1},{name:"Integer operations review",gen:FG.iall,neg:1},{name:"Mixed review",gen:mixOf(FG.sq,FG.cube,FG.erule,FG.enegz,FG.sci,FG.iall),neg:1,dec:1}]};
const fluGrade=()=>{const g=+gradeOf();return g>=3&&g<=8?g:3};
const FLU=()=>FLU_SETS[fluGrade()]||FLU_G3;
const fluCfg=()=>(SB&&SB.cls&&SB.cls.flu)||(fluGrade()<=4?{on:true,secs:180,pass:28,n:30}:{on:true,secs:240,pass:26,n:30});
const fluProg=()=>{const s=S.student;if(!s.raw)s.raw={prog:{}};const all=s.raw.prog||(s.raw.prog={});const fp=all._flu||(all._flu={level:0,att:[],facts:{}});const g=fluGrade();if(fp.g!==g){if(fp.g===undefined&&g===3)fp.g=3;else{fp.g=g;fp.level=0}}if(fp.level>=FLU().length)fp.level=FLU().length-1;return fp};
function fluQuestion(L,rand){
  const ri=(a,b)=>a+Math.floor(rand()*(b-a+1)),pk=a=>a[Math.floor(rand()*a.length)];
  if(L.gen)return L.gen(ri,pk,rand);
  const op=pk(L.ops),fa=L.focus&&rand()<.6?pk(L.focus):pk(L.f),fb=ri(0,10);
  if(op==="x"){const [a,b]=rand()<.5?[fa,fb]:[fb,fa];return {t:`${a} × ${b}`,ans:a*b,key:`${Math.min(a,b)}×${Math.max(a,b)}`,hard:Math.max(a,b)+Math.min(a,b)/10}}
  if(op==="d"){const d=Math.max(1,fa),q=ri(1,10);return {t:`${d*q} ÷ ${d}`,ans:q,key:`${d*q}÷${d}`,hard:Math.max(d,q)+2}}
  const k=ri(0,4);
  if(k===0){const a=ri(12,89),b=ri(11,99-a+10);return {t:`${a} + ${b}`,ans:a+b,key:"add",hard:3}}
  if(k===1){const a=ri(40,99),b=ri(11,a-5);return {t:`${a} − ${b}`,ans:a-b,key:"sub",hard:4}}
  if(k===2){const a=ri(2,9),t=ri(2,9)*10;return {t:`${a} × ${t}`,ans:a*t,key:"x10",hard:5}}
  if(k===3){const a=ri(2,9),b=ri(2,9);return {t:`${a} × ∎ = ${a*b}`,ans:b,key:`${Math.min(a,b)}×${Math.max(a,b)}`,hard:7}}
  const n=ri(11,98);return {t:`Round ${n} to the nearest 10`,ans:Math.round(n/10)*10,key:"round",hard:2};
}
function fluSheet(level,n){
  const L=FLU()[level]||FLU()[0],seed=Math.floor(Math.random()*1e9);let a=seed>>>0;const rand=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const out=[],seen=new Set();let g=0;while(out.length<n&&g++<n*20){const q=fluQuestion(L,rand);if(seen.has(q.t)&&g<n*10)continue;seen.add(q.t);out.push(q)}
  return out.sort((x,y)=>x.hard-y.hard); /* rows get harder, like the paper sheet */
}
function fluCard(){
  if(!S.demo&&(!SB||fluCfg().on===false))return"";
  const fp=S.demo?{level:0,att:[]}:fluProg(),c=fluCfg(),L=FLU()[fp.level]||FLU()[0],best=Math.max(0,...fp.att.filter(x=>x.lvl===fp.level).map(x=>x.r));
  return `<div class="card flu-card"><div class="top"><h2>⚡ Fluency</h2><span class="pill gold">Level ${fp.level+1} of ${FLU().length}</span></div>
   <p><b>${esc(L.name)}</b></p><p class="muted">Get ${c.pass} of ${c.n} right in ${Math.round(c.secs/60*10)/10} minute${c.secs===60?"":"s"} to level up.${best?` Your best: <b>${best}</b>.`:""}</p>
   <div class="row"><button id="flu-go">${t("Start fluency")}</button></div></div>`;
}
let fluTimer=null;
function fluStart(){const fp=S.demo?{level:0}:fluProg(),c=fluCfg();S.F={lvl:fp.level||0,qs:fluSheet(fp.level||0,c.n),i:0,res:[],start:Date.now(),secs:c.secs,pass:c.pass,done:false,ready:true};S.screen="fluency";render()}
function fluEnd(){clearInterval(fluTimer);fluTimer=null;const F=S.F;if(F.done)return;F.done=true;F.used=Math.min(F.secs,Math.round((Date.now()-F.start)/1000));
  const right=F.res.filter(x=>x.ok).length;F.right=right;F.passed=right>=F.pass;
  if(!S.demo){const fp=fluProg();fp.att=[...(fp.att||[]),{d:Date.now(),lvl:F.lvl,r:right,n:F.qs.length,s:F.used,p:F.passed}].slice(-60);fp.facts=fp.facts||{};
    F.res.forEach(x=>{if(/[×÷]/.test(x.q.key)){const f=fp.facts[x.q.key]||(fp.facts[x.q.key]={t:0,r:0});f.t++;if(x.ok)f.r++}});
    if(F.passed&&fp.level<FLU().length-1){fp.level++;F.levelUp=true}
    api("progSave",{testId:"_flu",prog:fp}).catch(()=>{S.saveErr=true;markSaved()})}
  render();setTimeout(()=>chirp(F.passed?"fluPass":"fluTry"),700)}
function fluency(){
  const F=S.F,c=fluCfg();
  if(F.ready&&!F.go){app.innerHTML=header(`<button class="ghost" id="back">My trail</button>`)+`<div class="card" style="text-align:center;align-items:center">
     <h2>⚡ Fluency · Level ${F.lvl+1}</h2><p class="lead">${esc(FLU()[F.lvl].name)}</p>
     <p>You have <b>${Math.floor(F.secs/60)}:${String(F.secs%60).padStart(2,"0")}</b> to answer ${F.qs.length} questions. Get <b>${F.pass}</b> right to level up.</p>
     <p class="muted">Type the answer and press Enter. If you’re stuck, skip it and keep going.</p>
     <button id="flu-start" style="font-size:1.2rem;padding:16px 28px">${t("Ready, set, go!")}</button></div>`;
    document.getElementById("back").onclick=()=>{S.screen="home";render()};
    document.getElementById("flu-start").onclick=()=>{F.go=true;F.start=Date.now();fluTimer=setInterval(()=>{const left=F.secs-Math.floor((Date.now()-F.start)/1000);const el=document.getElementById("flu-t"),bar=document.getElementById("flu-bar");
      if(el)el.textContent=`${Math.floor(Math.max(0,left)/60)}:${String(Math.max(0,left)%60).padStart(2,"0")}`;if(bar)bar.style.width=Math.max(0,left/F.secs*100)+"%";if(left<=0)fluEnd()},250);render()};return}
  if(F.done){const missed=F.res.filter(x=>!x.ok),skipped=F.qs.slice(F.res.length);
    app.innerHTML=header(`<button class="ghost" id="back">My trail</button>`)+`<div class="card pop" style="text-align:center;align-items:center">
      <h2>${t(F.passed?(F.levelUp?"Level up! 🎉":"You passed! 🎉"):"Nice work!")}</h2>
      <div class="flu-score"><b>${F.right}</b><span>of ${F.qs.length} right</span></div>
      <p>${F.passed?`You needed ${F.pass}. ${F.levelUp?`Next up: Level ${F.lvl+2}, ${esc(FLU()[F.lvl+1].name)}.`:"You finished the top level!"}`:`You need ${F.pass} to level up. That’s ${F.pass-F.right} more. You can do it!`}</p>
      <p class="muted">Time: ${Math.floor(F.used/60)}:${String(F.used%60).padStart(2,"0")}</p>
      ${F.levelUp&&gameOn()?`<p class="newbadge">🪙 ${t("You earned a game token! Spend it in the Game Arcade.")}</p>`:""}
      <div class="row"><button id="flu-again">${t(F.passed&&F.levelUp?"Try the next level":"Try again")}</button><button class="ghost" id="back2">${t("Back to my trail")}</button></div></div>
     ${missed.length||skipped.length?`<div class="card"><h3>${t("Practice these")}</h3><div class="flu-miss">${[...missed.map(x=>`<span><s>${esc(x.v)}</s> ${esc(x.q.t.replace("∎","?"))} = <b>${fN(x.q.ans)}</b></span>`),...skipped.slice(0,8).map(q=>`<span class="muted">${esc(q.t.replace("∎","?"))} = <b>${fN(q.ans)}</b></span>`)].join("")}</div></div>`:""}`;
    document.getElementById("back").onclick=document.getElementById("back2").onclick=()=>{S.screen="home";render()};
    document.getElementById("flu-again").onclick=fluStart;return}
  const q=F.qs[F.i],right=F.res.filter(x=>x.ok).length;
  app.innerHTML=`<div class="flu-top"><span class="label">Level ${F.lvl+1} · ${esc(FLU()[F.lvl].name)}</span><span class="flu-time" id="flu-t">${Math.floor(F.secs/60)}:00</span><button class="ghost small" id="flu-stop">${t("Stop")}</button></div>
   <div class="meter flu-meter"><span id="flu-bar" style="width:100%"></span></div>
   <div class="flu-grid" aria-label="${F.res.length} of ${F.qs.length} answered">${F.qs.map((_,i)=>`<i class="${i<F.res.length?(F.res[i].ok?"ok":"no"):i===F.i?"now":""}"></i>`).join("")}</div>
   <div class="card flu-q"><div class="flu-prob">${esc(q.t.replace("^∎","").replace("∎","☐"))}${q.t.includes("^∎")?"<sup>☐</sup>":""}${q.t.includes("∎")||q.t.startsWith("Round")||/ of /.test(q.t)&&false?"":" ="}</div>
    <form id="flu-f" class="row" style="justify-content:center"><input id="flu-in" class="num" inputmode="${(FLU()[F.lvl]||{}).neg?"text":(FLU()[F.lvl]||{}).dec?"decimal":"numeric"}" autocomplete="off" aria-label="Your answer" style="width:160px;font-size:2rem;text-align:center"><button type="submit">${t("Enter")}</button><button type="button" class="ghost" id="flu-skip">${t("Skip")}</button></form>
    <div class="pad flu-pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-k="${n}">${n}</button>`).join("")}<button type="button" data-k="back" aria-label="Delete">⌫</button><button type="button" data-k="0">0</button><button type="button" data-k="go">Go</button>${(FLU()[F.lvl]||{}).neg?`<button type="button" data-k="−" aria-label="Negative sign">−</button>`:""}${(FLU()[F.lvl]||{}).dec?`<button type="button" data-k="." aria-label="Decimal point">.</button>`:""}</div>
    <p class="muted" style="text-align:center">${right} right so far</p></div>`;
  const left=F.secs-Math.floor((Date.now()-F.start)/1000);document.getElementById("flu-t").textContent=`${Math.floor(Math.max(0,left)/60)}:${String(Math.max(0,left)%60).padStart(2,"0")}`;document.getElementById("flu-bar").style.width=Math.max(0,left/F.secs*100)+"%";
  const inp=document.getElementById("flu-in");inp.focus();
  const submit=v=>{if(F.done)return;v=String(v).trim();const nv=v.replace(/[−–]/g,"-").replace(/,/g,"");F.res.push({q,v:v||"—",ok:v!==""&&nv!=="-"&&!isNaN(Number(nv))&&Math.abs(Number(nv)-q.ans)<1e-9});F.i++;if(F.i>=F.qs.length)fluEnd();else render()};
  document.getElementById("flu-f").onsubmit=e=>{e.preventDefault();if(inp.value.trim())submit(inp.value)};
  document.getElementById("flu-skip").onclick=()=>submit("");
  document.getElementById("flu-stop").onclick=()=>fluEnd();
  app.querySelectorAll(".flu-pad button").forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(k==="back")inp.value=inp.value.slice(0,-1);else if(k==="go"){if(inp.value.trim())submit(inp.value);return}else if(inp.value.length<9){if(k==="−"){if(!inp.value.startsWith("−"))inp.value="−"+inp.value}else inp.value+=k}inp.focus()});
}
SCREENS.fluency=fluency;

/* teacher: fluency tab */
function tFluency(){
  const real=CUR.raw.filter(s=>!isSample(s)),c=CUR.cls.flu||{secs:180,pass:28,n:30},wk=Date.now()-7*864e5,facts={};
  const rows=real.map(s=>{const f=s.prog?._flu||{level:0,att:[]},at=f.att||[],last=at[at.length-1],best=Math.max(0,...at.filter(x=>x.lvl===(f.level||0)).map(x=>x.r));
    Object.entries(f.facts||{}).forEach(([k,v])=>{const x=facts[k]||(facts[k]={t:0,r:0,who:new Set()});x.t+=v.t;x.r+=v.r;if(v.r<v.t)x.who.add(s.name)});
    return `<tr><td><b>${esc(s.name)}</b></td><td><select data-flv="${s.id}" aria-label="Level for ${esc(s.name)}">${FLU().map((L,i)=>`<option value="${i}" ${i===(f.level||0)?"selected":""}>${i+1}. ${esc(L.name)}</option>`).join("")}</select></td>
     <td>${last?`${last.r}/${last.n}${last.p?' <span class="pill go">pass</span>':""}<br><span class="muted" style="font-size:.8rem">${new Date(last.d).toLocaleDateString()}</span>`:'<span class="muted">—</span>'}</td><td>${at.length?best:"—"}</td><td>${at.filter(x=>x.d>wk).length}</td><td>${at.filter(x=>x.p).length}</td></tr>`}).join("");
  const hard=Object.entries(facts).filter(([,v])=>v.t>=2).map(([k,v])=>({k,p:Math.round(v.r/v.t*100),t:v.t,who:v.who})).sort((a,b)=>a.p-b.p||b.t-a.t).slice(0,12);
  return `<div class="card"><div class="top"><h2>⚡ Fluency</h2><span class="pill">${c.pass} of ${c.n} in ${Math.round(c.secs/60*10)/10} min to pass</span></div>
   <p class="muted">Students do timed fact sheets from their trail page, like a Multiplication Madness sheet. Passing moves them up a level. Change the timer and pass score in Class settings, and change a student’s level here.</p>
   <div class="tablewrap"><table class="roster"><thead><tr><th>Student</th><th>Level</th><th>Last try</th><th>Best at level</th><th>Tries this week</th><th>Passes</th></tr></thead><tbody>${rows||`<tr><td colspan="6" class="muted">No students yet.</td></tr>`}</tbody></table></div>
   <p class="muted" id="flv-msg" role="status"></p></div>
  <div class="card"><h2>Class trouble facts</h2><p class="muted">The facts your class gets wrong most often in fluency (tried at least twice).</p>
   ${hard.length?`<div class="facts">${hard.map(x=>`<div class="fact"><b>${esc(x.k)}</b><span class="hc" style="--c:${heat(x.p)}">${x.p}%</span><span class="muted">${esc([...x.who].slice(0,4).join(", "))}${x.who.size>4?"…":""}</span></div>`).join("")}</div>`:`<p class="fb info">This fills in as students do fluency.</p>`}</div>`;
}
function wireFluency(){
  app.querySelectorAll("[data-flv]").forEach(sel=>sel.onchange=async()=>{const s=CUR.raw.find(x=>x.id===sel.dataset.flv),f={...(s.prog?._flu||{att:[],facts:{}}),level:+sel.value},msg=document.getElementById("flv-msg");
    try{await api("progSet",{classId:CUR.cls.id,studentId:s.id,testId:"_flu",prog:f});s.prog={...(s.prog||{}),_flu:f};msg.textContent=`${s.name} is now on level ${+sel.value+1}.`}catch(e){msg.textContent=e.message}});
}

/* ================= Chirp: a little bird that flies in every few questions to cheer students on ================= */
const CHIRP_SVG=`<svg viewBox="0 0 140 130" aria-hidden="true"><g class="cb"><g transform="translate(140 0) scale(-1 1)">
 <ellipse cx="70" cy="122" rx="34" ry="5" fill="#000" opacity=".08"/>
 <path d="M96 78 L128 64 L124 76 L131 82 L100 92 Z" fill="#5E6B78"/>
 <ellipse cx="68" cy="72" rx="42" ry="40" fill="#8E9AA6"/>
 <ellipse cx="66" cy="86" rx="28" ry="24" fill="#F4F1EA"/>
 <g class="cw"><path d="M86 62 C112 66 112 96 92 104 C96 90 92 76 80 70 Z" fill="#5E6B78"/>
 <path d="M92 78 C100 80 104 86 103 92 C98 88 94 86 90 86 Z" fill="#fff"/></g>
 <circle cx="52" cy="58" r="11" fill="#fff"/><circle cx="54" cy="59" r="6.5" fill="#1C2838"/><circle cx="56" cy="56.5" r="2.2" fill="#fff"/>
 <path d="M44 44 Q53 39 62 44" fill="none" stroke="#3F4A56" stroke-width="2.6" stroke-linecap="round"/>
 <path d="M26 66 L10 70 L26 75 Z" fill="#2B333D"/>
 <circle cx="40" cy="74" r="5" fill="#F7A6A0" opacity=".7"/>
 <path d="M60 32 Q62 18 72 22 Q66 26 68 34" fill="#8E9AA6"/>
 <path d="M58 110 L54 120 M70 111 L70 121" stroke="#3F4A56" stroke-width="4" stroke-linecap="round"/></g></g></svg>`;
const chirpOn=()=>S.demo||!SB||SB.cls.chirp!==false;
let chirpTimer=null;
function chirpMsg(kind){
  const s=S.student,first=(s&&s.name||"").replace(" (sample)",""),p=s&&s.prog,k=S.k&&p&&p.skills[S.k],M=MAST(),today=new Date().toDateString();
  const todayN=p?(p.today&&p.today.d===today?p.today.n:0):0,rec=(p&&p.recent||[]).slice(-6),wrongs=rec.filter(r=>!r.ok).length,pick=a=>a[Math.floor(Math.random()*a.length)];
  if(S.lang==="es"){const E=CHIRP_ES;if(kind==="fluPass")return E.fluPass;if(kind==="fluTry")return E.fluTry;if(kind==="mastered")return E.mastered;
    if(k&&k.streak>=3)return E.streak(k.streak);if(k&&k.streak>0&&M-k.streak<=3)return E.near(M-k.streak);if(wrongs>=3)return E.tough;if(todayN>=10&&Math.random()<.5)return E.today(todayN);return pick(E.gen)}
  if(kind==="fluPass")return pick([`Wow, ${first}! Your brain is getting faster!`,`Fact champion! Look at you go, ${first}!`,"Tweet tweet! That was super speedy!"]);
  if(kind==="fluTry")return pick([`Every try makes you faster, ${first}. Let’s go again!`,"Practice those facts and you’ll fly past it next time!","Speed comes with practice. I believe in you!"]);
  if(kind==="mastered")return pick([`Checkpoint! I’m so proud of you, ${first}!`,"You did it! Up, up, and away to the next one!"]);
  const opts=[];
  if(k&&k.streak>=3)opts.push(`${k.streak} stars, ${first}! You’re on fire!`,`Look at you go! ${k.streak} stars on this one!`);
  if(k&&k.streak>0&&M-k.streak<=3)opts.push(`Only ${M-k.streak} more ★ to the checkpoint!`);
  if(wrongs>=3)opts.push(`Tricky ones today? Mistakes help your brain grow. Read slow and highlight your key words.`,`Don’t give up, ${first}! Try asking Scout for a hint.`,"Take a deep breath. You’ve got this!");
  if(todayN>=10)opts.push(`You’ve answered ${todayN} questions today! Amazing effort!`);
  if(p&&p.stars>=20)opts.push(`${p.stars} stars! You’re a star collector!`);
  opts.push(`Keep climbing, ${first}! Every question makes you stronger.`,"Hard work beats talent when talent doesn’t work hard!","I love how you keep trying!",`You’re doing great, ${first}!`);
  return pick(opts);
}
function chirp(kind){
  if(!chirpOn())return;
  const old=document.getElementById("chirp");if(old)old.remove();clearTimeout(chirpTimer);
  const el=document.createElement("div");el.id="chirp";el.className="chirp";el.setAttribute("role","status");
  const msg=chirpMsg(kind);
  el.innerHTML=`<div class="chirp-bird">${CHIRP_SVG}</div><div class="chirp-b"><b>${t("Chirp says:")}</b> ${esc(msg)}${TTS?` <button class="link small" id="chirp-say" aria-label="Read this to me">🔊</button>`:""}</div><button class="chirp-x" aria-label="Close">×</button>`;
  document.body.appendChild(el);
  const close=()=>{el.classList.add("out");setTimeout(()=>el.remove(),500)};
  el.querySelector(".chirp-x").onclick=close;const sb=el.querySelector("#chirp-say");if(sb)sb.onclick=()=>speak(msg);
  chirpTimer=setTimeout(close,7000);
}
/* called after every answer: Chirp visits every 4 to 6 questions, or right after a big moment */
function chirpTick(ok){
  const p=S.student&&S.student.prog;if(!p)return;const today=new Date().toDateString();
  p.today=p.today&&p.today.d===today?{d:today,n:p.today.n+1}:{d:today,n:1};
  S.chirpN=(S.chirpN||0)+1;if(!S.chirpAt)S.chirpAt=4+Math.floor(Math.random()*3);
  if(S.mastered){setTimeout(()=>chirp("mastered"),600);S.chirpN=0;S.chirpAt=0;return}
  if(S.chirpN>=S.chirpAt){S.chirpN=0;S.chirpAt=4+Math.floor(Math.random()*3);setTimeout(()=>chirp(ok?"right":"wrong"),900)}
}

/* ================= Station planner: groups students by what they need, then builds the rotation ================= */
const PLAN_DEF={mode:"groups",groups:4,size:5,method:"need",stations:"Teacher table, Independent practice, Path to Proficiency, Fluency",mins:30,start:"",names:"Group"};
function planFeatures(s){const cur=curSkill(s),idx=cur?SKILLS.indexOf(cur):SKILLS.length;
  const rec=(s.prog.recent||[]).filter(r=>!cur||r.k===cur.id).slice(-10),all=(s.prog.recent||[]).slice(-10),src=rec.length>=3?rec:all;
  let acc=src.length?src.filter(r=>r.ok).length/src.length:.5,fk=cur,fi=idx;
  /* a fresh exit ticket outweighs older practice; a miss groups the student by the ticket's standard */
  const X=xtLatest(s);if(X){const xa=X.r.ok/X.r.n;acc=src.length?xa*.6+acc*.4:xa;if(!X.pass){fk=X.k;fi=SKILLS.indexOf(X.k)}}
  const tm=fk?missGroups([s],fk.id)[0]:null;
  return {s,cur,fk,idx:fi,acc,mk:tm?tm.k+"|"+mnorm(tm.ex):"",n:src.length+(X?X.r.n:0),xt:X}}
function makeGroups(o){
  const away=new Set(o.absent||[]),F=CUR.students.filter(s=>!isSample(s)&&!away.has(s.id)).map(planFeatures),N=F.length;if(!N)return [];
  let G=o.mode==="size"?Math.ceil(N/Math.max(1,o.size)):Math.max(1,Math.min(o.groups,N));
  if(o.method==="mixed"){const sorted=[...F].sort((a,b)=>b.acc-a.acc),gs=Array.from({length:G},()=>[]);sorted.forEach((f,i)=>{const r=Math.floor(i/G),c=i%G;gs[r%2?G-1-c:c].push(f)});return gs}
  const sorted=[...F].sort((a,b)=>a.idx-b.idx||a.mk.localeCompare(b.mk)||a.acc-b.acc),base=N/G;
  const lo=Math.max(1,Math.floor(base)-1),hi=o.mode==="size"?Math.max(1,o.size):Math.ceil(base)+1;
  const cost=(i,j)=>{const g=sorted.slice(i,j),sk=new Set(g.map(x=>x.idx)).size,mk=new Set(g.map(x=>x.mk).filter(Boolean)).size,ac=g.map(x=>x.acc);
    return (sk-1)*10+Math.max(0,mk-1)*3+(Math.max(...ac)-Math.min(...ac))*5+Math.abs(g.length-base)*2};
  const INF=1e9,dp=Array.from({length:G+1},()=>new Array(N+1).fill(INF)),bk=Array.from({length:G+1},()=>new Array(N+1).fill(-1));dp[0][0]=0;
  for(let g=1;g<=G;g++)for(let j=1;j<=N;j++)for(let k=lo;k<=hi&&k<=j;k++){const v=dp[g-1][j-k]+cost(j-k,j);if(v<dp[g][j]){dp[g][j]=v;bk[g][j]=j-k}}
  if(dp[G][N]>=INF){const gs=Array.from({length:G},()=>[]);sorted.forEach((f,i)=>gs[Math.floor(i*G/N)].push(f));return gs}
  const gs=[];let j=N;for(let g=G;g>0;g--){const i=bk[g][j];gs.unshift(sorted.slice(i,j));j=i}return gs;
}
function groupInfo(ids){
  const studs=ids.map(id=>CUR.students.find(s=>s.id===id)).filter(Boolean),F=studs.map(planFeatures),cnt={};
  F.forEach(f=>{const k=f.fk||f.cur;if(k)cnt[k.id]=(cnt[k.id]||0)+1});
  const fid=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0]?.[0],focus=SKILLS.find(k=>k.id===fid)||null;
  const acc=F.length?F.reduce((a,f)=>a+f.acc,0)/F.length:0,mis=focus?missGroups(studs,focus.id).find(x=>x.who.size>=2)||missGroups(studs,focus.id)[0]:null;
  const xt=focus?F.filter(f=>f.xt&&!f.xt.pass&&f.xt.k===focus):[];
  return {studs,focus,acc,mis,data:F.some(f=>f.n),xt}}
function tPlanner(){
  if(S.planLoaded!==CUR.cls.id){S.planLoaded=CUR.cls.id;S.plan=null;S.planO=null;S.planSaved=null;S.reteach={};api("planGet",{classId:CUR.cls.id}).then(d=>{if(d.plan&&S.planLoaded===CUR.cls.id){S.planSaved=d.plan;S.planO={...PLAN_DEF,...d.plan.o};const ok=new Set(CUR.students.map(s=>s.id));S.plan={groups:d.plan.groups.map(g=>({...g,ids:g.ids.filter(id=>ok.has(id))}))};if(S.tab==="plan")render()}}).catch(()=>{})}
  const o=S.planO||(S.planO={...PLAN_DEF,...(S.planSaved?.o||{})}),P=S.plan;
  if(S.tbl!=null&&P&&P.groups[S.tbl])return tableMode(S.tbl);
  const N=CUR.students.filter(s=>!isSample(s)).length;
  const stations=planStations(o);
  let body="";
  if(P&&P.groups.length){
    const infos=P.groups.map(g=>groupInfo(g.ids)),order=infos.map((x,i)=>i).sort((a,b)=>infos[a].acc-infos[b].acc),G=P.groups.length,R=Math.max(1,stations.length);
    const at=(g,r)=>(order.indexOf(g)+r)%R; /* neediest group starts at the first station */
    const time=r=>{if(!o.start)return `Round ${r+1}`;const [h,m]=o.start.split(":").map(Number),t=h*60+m+r*o.mins,H=Math.floor(t/60),M=t%60;return `${((H+11)%12)+1}:${String(M).padStart(2,"0")}`};
    body=`<div class="card"><div class="top"><h2>Rotation</h2><div class="row"><button class="ghost small" id="pl-print">Print</button><button class="small" id="pl-save">Save plan</button></div></div>
      <div class="tablewrap"><table class="roster rot"><thead><tr><th></th>${stations.map(s=>`<th>${esc(s)}</th>`).join("")}</tr></thead><tbody>
      ${Array.from({length:R},(_,r)=>`<tr><td><b>${time(r)}</b>${o.start?"":""}</td>${stations.map((_,st)=>`<td>${P.groups.map((g,gi)=>at(gi,r)===st?`<span class="gchip g${gi%8}">${esc(g.name)}</span>`:"").join(" ")||'<span class="muted">—</span>'}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      ${(o.absent||[]).length?`<p class="small"><b>Absent today:</b> ${(o.absent||[]).map(id=>CUR.students.find(s=>s.id===id)).filter(Boolean).map(s=>esc(s.name)).join(", ")}. Not in a group; catch them up when they’re back.</p>`:""}<p class="muted" style="font-size:.85rem">${o.mins}-minute rotations. The group that needs you most starts at ${esc(stations[0]||"the first station")}.${G>R?" Some stations have more than one group.":""}</p><p class="muted" id="pl-msg" role="status"></p></div>
     <div class="pgrid">${P.groups.map((g,gi)=>{const I=infos[gi],L0=I.focus&&LIBC[I.focus.std],rank=order.indexOf(gi);
       return `<div class="card pgroup g${gi%8}"><div class="top"><h3><span class="gchip g${gi%8}">${esc(g.name)}</span></h3>${rank===0?'<span class="pill oops">Needs you most</span>':""}</div>
        <p>${I.focus?`<b>Focus: ${esc(I.focus.std)}</b> ${esc(I.focus.name)}`:`<b>Finished their trails</b>: challenge work or a new standard`}${I.data?` · <span class="muted">${Math.round(I.acc*100)}% recent accuracy</span>`:""}</p>
        <ul class="pmem">${I.studs.map(s=>`<li><span>${esc(s.name)}</span><select data-mv="${s.id}" aria-label="Move ${esc(s.name)}">${P.groups.map((h,hi)=>`<option value="${hi}" ${hi===gi?"selected":""}>${esc(h.name)}</option>`).join("")}</select></li>`).join("")}</ul>
        ${I.xt&&I.xt.length?`<p class="small"><span class="pill gold">Exit ticket</span> ${I.xt.map(f=>`${esc(f.s.name)} ${f.xt.r.ok}/${f.xt.r.n}`).join(", ")} on ${esc(I.focus.std)}</p>`:""}${I.mis?`<div class="fb oops" style="padding:10px 12px"><p style="font-size:.9rem"><b>Shared mistake (${I.mis.who.size} student${I.mis.who.size===1?"":"s"}):</b> ${fmt(I.mis.ex)}</p></div>`:""}
        ${L0?`<p style="font-size:.9rem"><b>At the teacher table:</b> ${esc(L0.do[0]||L0.desc)}</p>`:""}
        <div class="row">${I.focus&&genOf(I.focus)?`<button class="ghost small" data-model="${gi}">${S.model===gi?"Hide":"Model problem"}</button>`:""}${I.focus&&TB.ai?`<button class="ghost small" data-ai="${gi}">✨ 5-minute reteach plan</button>`:""}${I.focus?`<button class="ghost small" data-gas="${gi}">Assign ${esc(I.focus.std)} to group</button>`:""}<button class="small" data-tbl="${gi}">▶ Teacher table mode</button><button class="small ghost" data-seslog="${gi}" aria-expanded="${S.sesG===gi}">📝 Log this session</button></div>
        ${S.sesSaved===gi?`<p class="fb ok" role="status" style="padding:8px 12px">Session saved to each student’s record.</p>`:""}${S.sesG===gi?sesForm(gi,g.ids,I.focus):""}
        ${S.model===gi&&I.focus?(()=>{const q=(()=>{try{return GG.make(genOf(I.focus),S.modelSeed||1)}catch(e){return null}})();return q?reviewHTML(q,"Model problem"):""})():""}
        ${S.reteach&&S.reteach[gi]?`<div class="fb info reteach"><p>${esc(S.reteach[gi]).replace(/\n/g,"<br>")}</p></div>`:""}
       </div>`}).join("")}</div>`;
  }
  return `<div class="card"><h2>Station planner</h2>
   <p class="muted">Groups your students by the standard they’re on and the mistakes they share, then builds a rotation. Students who need you most go to the teacher table first. You can move anyone, then save or print the plan.</p>
   ${N<2?`<p class="fb info">Add at least 2 students to make groups.</p>`:`<form class="grid" id="pl-f">
    <label class="f">Make groups by<select id="pl-mode"><option value="groups" ${o.mode==="groups"?"selected":""}>Number of groups</option><option value="size" ${o.mode==="size"?"selected":""}>Students per group</option></select></label>
    ${o.mode==="groups"?`<label class="f">Number of groups<input id="pl-n" type="number" min="1" max="10" value="${o.groups}"></label>`:`<label class="f">Students per group (most)<input id="pl-s" type="number" min="1" max="15" value="${o.size}"></label>`}
    <label class="f">Group students<select id="pl-m"><option value="need" ${o.method==="need"?"selected":""}>By shared need (recommended)</option><option value="mixed" ${o.method==="mixed"?"selected":""}>Mixed levels (peer helpers)</option></select></label>
    <label class="f">Minutes per rotation<input id="pl-min" type="number" min="5" max="90" value="${o.mins}"></label>
    <label class="f">Start time (optional)<input id="pl-st" type="time" value="${esc(o.start)}"></label>
    <label class="f" style="grid-column:1/-1">Stations, in order (comma between)<input id="pl-sta" value="${esc(o.stations)}"></label>
    ${absentFS(o)}
    <button type="submit">${P?"Make new groups":"Make groups"}</button></form>`}
   ${S.planSaved?`<p class="muted" style="font-size:.85rem">Last saved ${new Date(S.planSaved.saved).toLocaleString()}.</p>`:""}</div>${body}${tbCard()}${xtCard()}${paperCard()}${readyCard()}${weekCard()}${sesLogCard()}`;
}
function planOpts(){const v=id=>document.getElementById(id);const o=S.planO;
  o.mode=v("pl-mode").value;if(v("pl-n"))o.groups=Math.max(1,Math.min(10,+v("pl-n").value||4));if(v("pl-s"))o.size=Math.max(1,Math.min(15,+v("pl-s").value||5));
  o.method=v("pl-m").value;o.mins=Math.max(5,Math.min(90,+v("pl-min").value||30));o.start=v("pl-st").value;o.stations=v("pl-sta").value||PLAN_DEF.stations;
  o.absent=[...document.querySelectorAll('#pl-f input[name=abs]:checked')].map(x=>x.value);o.helper=!!(v("pl-help")&&v("pl-help").value)}
function wirePlanner(){
  if(S.tbl!=null&&S.plan&&S.plan.groups[S.tbl]){wireTable();return}
  const keep=fn=>(...a)=>{const y=window.scrollY;fn(...a);render();window.scrollTo(0,y)};
  app.querySelectorAll("[data-tbl]").forEach(b=>b.onclick=()=>{S.tbl=+b.dataset.tbl;S.tblM={};S.tblN="";S.tblEnd=null;S.tblStart=null;S.tblModel=null;render();window.scrollTo(0,0)});
  const f=document.getElementById("pl-f");
  if(f){document.getElementById("pl-mode").onchange=keep(()=>planOpts());
    f.onsubmit=e=>{e.preventDefault();planOpts();const gs=makeGroups(S.planO);S.plan={groups:gs.map((g,i)=>({name:`${S.planO.names} ${i+1}`,ids:g.map(x=>x.s.id)}))};S.reteach={};S.model=null;render()}}
  app.querySelectorAll("[data-mv]").forEach(sel=>sel.onchange=keep(()=>{const id=sel.dataset.mv,to=+sel.value;S.plan.groups.forEach(g=>g.ids=g.ids.filter(x=>x!==id));S.plan.groups[to].ids.push(id)}));
  app.querySelectorAll("[data-model]").forEach(b=>b.onclick=keep(()=>{const g=+b.dataset.model;S.model=S.model===g?null:g;S.modelSeed=Math.floor(Math.random()*1e9)}));
  app.querySelectorAll("[data-ai]").forEach(b=>b.onclick=async()=>{const gi=+b.dataset.ai,I=groupInfo(S.plan.groups[gi].ids),L0=LIBC[I.focus.std]||{};busy(b,"Writing…");
    try{const d=await api("aiReteach",{std:I.focus.std,name:I.focus.name,mistake:I.mis?I.mis.ex:"",goal:(L0.do||[]).slice(0,2).join(" ")});(S.reteach=S.reteach||{})[gi]=d.plan;keep(()=>{})()}catch(e){b.textContent=e.message}});
  app.querySelectorAll("[data-gas]").forEach(b=>b.onclick=async()=>{const gi=+b.dataset.gas,I=groupInfo(S.plan.groups[gi].ids),ids=new Set(S.plan.groups[gi].ids);busy(b,"Assigning…");
    try{await saveRoster(CUR.raw.map(s=>ids.has(s.id)?{...s,assigned:[...new Set([...(s.assigned||[]),I.focus.std])]}:s));b.textContent=`Assigned ${I.focus.std}`}catch(e){b.textContent=e.message}});
  const sv=document.getElementById("pl-save");if(sv)sv.onclick=async()=>{busy(sv,"Saving…");try{await api("planSave",{classId:CUR.cls.id,plan:{o:S.planO,groups:S.plan.groups}});S.planSaved={o:S.planO,groups:S.plan.groups,saved:Date.now()};sv.textContent="Saved ✓";sv.disabled=false}catch(e){document.getElementById("pl-msg").textContent=e.message;sv.disabled=false;sv.textContent="Save plan"}};
  const pr=document.getElementById("pl-print");if(pr)pr.onclick=printPlan;
  wireSessions();wireXt();wireWeek();wireReady();wirePaper();wireTb();
}
function printPlan(){
  const o=S.planO,stations=planStations(o),w=window.open("","_blank");if(!w){alert("Allow pop-ups to print.");return}
  const infos=S.plan.groups.map(g=>groupInfo(g.ids)),order=infos.map((x,i)=>i).sort((a,b)=>infos[a].acc-infos[b].acc),R=Math.max(1,stations.length),at=(g,r)=>(order.indexOf(g)+r)%R;
  w.document.write(`<!doctype html><meta charset="utf-8"><title>Stations · ${esc(CUR.cls.name)}</title><style>body{font-family:system-ui,sans-serif;margin:24px}table{border-collapse:collapse;width:100%;margin-bottom:20px}td,th{border:1px solid #999;padding:8px;text-align:left}.g{display:grid;grid-template-columns:1fr 1fr;gap:12px}.c{border:2px solid #333;border-radius:10px;padding:12px;break-inside:avoid}h3{margin:0 0 6px}</style>
   <h2>${esc(CUR.cls.name)} · Stations · ${new Date().toLocaleDateString()}</h2>
   <table><tr><th></th>${stations.map(s=>`<th>${esc(s)}</th>`).join("")}</tr>${Array.from({length:R},(_,r)=>`<tr><td><b>Round ${r+1}</b></td>${stations.map((_,st)=>`<td>${S.plan.groups.filter((g,gi)=>at(gi,r)===st).map(g=>esc(g.name)).join(", ")}</td>`).join("")}</tr>`).join("")}</table>
   <div class="g">${S.plan.groups.map((g,gi)=>{const I=infos[gi];return `<div class="c"><h3>${esc(g.name)}</h3><p><b>${I.focus?esc(I.focus.std+" "+I.focus.name):"Challenge work"}</b></p><p>${I.studs.map(s=>esc(s.name)).join(", ")}</p>${I.mis?`<p><i>Shared mistake:</i> ${esc(I.mis.ex)}</p>`:""}${S.reteach&&S.reteach[gi]?`<p style="white-space:pre-wrap">${esc(S.reteach[gi])}</p>`:""}</div>`}).join("")}</div><script>print()<\/script>`);
  w.document.close();
}

/* ================= time and growth tracking ================= */
const dayKey=(t=Date.now())=>{const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
function track(p,kid,ok,ms){const d=dayKey(),D=p.days||(p.days={}),x=(D[d]=D[d]||{}),y=x[kid]||(x[kid]={n:0,ok:0,ms:0});y.n++;if(ok)y.ok++;y.ms+=Math.max(0,Math.min(ms||0,180000));
  const ks=Object.keys(D).sort();if(ks.length>150)ks.slice(0,ks.length-150).forEach(k=>delete D[k]);if(!p.first)p.first=Date.now()}
const weekOf=k=>{const d=new Date(k+"T12:00:00");d.setDate(d.getDate()-((d.getDay()+6)%7));return dayKey(d)};
function weekly(progs,kid){const W={};progs.forEach(p=>Object.entries(p.days||{}).forEach(([d,x])=>{const w=weekOf(d),o=W[w]||(W[w]={n:0,ok:0,ms:0,days:new Set()});
  Object.entries(x).forEach(([k,v])=>{if(kid&&k!==kid)return;o.n+=v.n;o.ok+=v.ok;o.ms+=v.ms;if(v.n)o.days.add(d)})}));
  return Object.keys(W).sort().map(w=>({w,...W[w],acc:W[w].n?Math.round(W[w].ok/W[w].n*100):null})).filter(x=>x.n)}
const minsOf=(p,kid,since=0)=>Math.round(Object.entries(p.days||{}).reduce((a,[d,x])=>a+(new Date(d+"T12:00:00").getTime()>=since?Object.entries(x).reduce((b,[k,v])=>b+(!kid||k===kid?v.ms:0),0):0),0)/60000);
const shortDate=k=>{const d=new Date(k+"T12:00:00");return `${d.getMonth()+1}/${d.getDate()}`};

/* simple charts: one measure each, thin marks, hover titles */
function lineChart(pts,o={}){if(!pts.length)return `<p class="muted">Not enough practice yet.</p>`;
  const W=560,H=200,L=40,R=12,T=14,B=30,max=o.max||Math.max(1,...pts.map(p=>p.y)),x=i=>L+(pts.length===1?(W-L-R)/2:i*(W-L-R)/(pts.length-1)),y=v=>T+(H-T-B)*(1-v/max);
  let s="";[0,.25,.5,.75,1].forEach(f=>{const v=Math.round(max*f);s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)" stroke-width="1"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end" font-size="11" fill="var(--soft)">${v}${o.unit||""}</text>`});
  if(o.goal!=null)s+=`<line x1="${L}" x2="${W-R}" y1="${y(o.goal)}" y2="${y(o.goal)}" stroke="var(--purple-ink)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${L+6}" y="${y(o.goal)-5}" text-anchor="start" font-size="11" fill="var(--purple-ink)">${esc(o.goalLabel||"goal")}</text>`;
  s+=`<polyline points="${pts.map((p,i)=>`${x(i)},${y(p.y)}`).join(" ")}" fill="none" stroke="var(--go)" stroke-width="2" stroke-linejoin="round"/>`;
  pts.forEach((p,i)=>{s+=`<g class="pt"><circle cx="${x(i)}" cy="${y(p.y)}" r="12" fill="transparent"/><circle cx="${x(i)}" cy="${y(p.y)}" r="4.5" fill="var(--go)" stroke="var(--card)" stroke-width="2"/><title>${esc(p.tip||p.label+": "+p.y+(o.unit||""))}</title></g>`;
    if(pts.length<=12||i%Math.ceil(pts.length/12)===0)s+=`<text x="${x(i)}" y="${H-10}" text-anchor="middle" font-size="11" fill="var(--soft)">${esc(p.label)}</text>`});
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title||"chart")}">${s}</svg></div>`}
function barChart(pts,o={}){if(!pts.length)return "";
  const W=560,H=150,L=40,R=12,T=10,B=30,max=Math.max(1,...pts.map(p=>p.y)),bw=Math.min(36,(W-L-R)/pts.length-6),x=i=>L+(i+.5)*(W-L-R)/pts.length,y=v=>T+(H-T-B)*(1-v/max);
  let s=`<line x1="${L}" x2="${W-R}" y1="${y(0)}" y2="${y(0)}" stroke="var(--rule)"/>`+`<text x="${L-6}" y="${y(max)+4}" text-anchor="end" font-size="11" fill="var(--soft)">${max}</text>`;
  pts.forEach((p,i)=>{const h=y(0)-y(p.y);s+=`<g><rect x="${x(i)-bw/2}" y="${y(p.y)}" width="${bw}" height="${Math.max(0,h)}" rx="4" fill="var(--blue)" opacity=".85"/><title>${esc(p.tip||p.label+": "+p.y)}</title></g>`;
    if(pts.length<=12||i%Math.ceil(pts.length/12)===0)s+=`<text x="${x(i)}" y="${H-10}" text-anchor="middle" font-size="11" fill="var(--soft)">${esc(p.label)}</text>`});
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title||"chart")}">${s}</svg></div>`}

/* ================= benchmark readiness (estimate) ================= */
/* weights follow the grade 3 major work emphasis: major clusters 3, supporting 1.5, additional 1. Not an official MAAP blueprint. */
const STD_W=c=>{const g=c[0];
  /* ACT: algebra, functions, and essential skills count most; WorkKeys: higher levels count a little more */
  if(/^ACT\./.test(c))return /^ACT\.(ALG|FUN|IES)\./.test(c)?3:1.5; if(/^WK\.L\d/.test(c))return 1+(+c[4]-3)*.25;
  if(g==="3")return /^3\.(OA|NF)\./.test(c)||/^3\.MD\.(1|2|5|6|7)/.test(c)?3:/^3\.(MD\.(3|4|8)|G\.)/.test(c)?1.5:1;
  if(g==="4")return /^4\.(NBT|NF)\./.test(c)||/^4\.OA\.[123]$/.test(c)?3:/^4\.MD\.[1-4]/.test(c)?1.5:1;
  if(g==="5")return /^5\.(NBT|NF)\./.test(c)||/^5\.MD\.[345]/.test(c)?3:/^5\.MD\.[12]/.test(c)?1.5:1;
  if(g==="6")return /^6\.(RP|NS|EE)\./.test(c)?3:1.5;
  if(g==="7")return /^7\.(RP|NS|EE)\./.test(c)?3:/^7\.G\.[456]/.test(c)?1.5:1;
  if(g==="8")return /^8\.(EE|F)\./.test(c)||/^8\.G\.[1-8]/.test(c)?3:1.5;
  if(/^[AF]-/.test(c))return 3; if(/^(N|S)-/.test(c))return 1.5; return 1};
function stdScore(s,k){const sk=s.prog.skills[k.id];if(!sk||sk.status==="off"||sk.go)return null;
  if(sk.status==="done"||sk.status==="skip")return sk.reopen?.5:(sk.status==="done"&&!evOf(sk).v)?.75:1; // practiced but not yet verified on their own counts 3/4
  const rec=(s.prog.recent||[]).filter(r=>r.k===k.id).slice(-10);return rec.length>=5&&rec.filter(r=>r.ok).length/rec.length>=.7?.5:0}
/* readiness needs evidence: a standard with no test result and fewer than 5 practice answers is unknown, not failing.
   If under a quarter of the (weighted) standards have evidence, readiness is "Evidence needed". */
function readiness(s){let w=0,v=0,W=0;const tested=Array.isArray(s.missed)||(s.scores&&s.scores[TESTID]!=null&&s.scores[TESTID]!=="");
  SKILLS.forEach(k=>{const sk=s.prog.skills[k.id];if(!sk||sk.status==="off"||sk.go)return;const ww=STD_W(k.std);W+=ww;let sc=stdScore(s,k);
    if(sc===0&&!tested&&(s.prog.recent||[]).filter(r=>r.k===k.id).length<5)sc=null;if(sc==null)return;w+=ww;v+=ww*sc});
  return w&&w>=W*.25?Math.round(v/w*100):null}
const band=r=>r==null?{t:"Evidence needed",c:""}:r>=80?{t:"On track",c:"go"}:r>=60?{t:"Close",c:"gold"}:{t:"Needs support",c:"oops"};
function readinessCard(){
  const real=realStudents(),rs=real.map(s=>({s,r:readiness(s)})),n={go:0,gold:0,oops:0};rs.forEach(x=>{const b=band(x.r);if(b.c)n[b.c]++});const N=real.length||1;
  return `<div class="card"><div class="top"><h2>Benchmark readiness <span class="muted" style="font-weight:500;font-size:.9rem">(estimate)</span></h2></div>
   <div class="rbar" role="img" aria-label="${n.go} on track, ${n.gold} close, ${n.oops} need support">${[["go","On track"],["gold","Close"],["oops","Needs support"]].map(([c,l])=>n[c]?`<span class="rb ${c}" style="flex:${n[c]}" title="${l}: ${n[c]}">${n[c]}</span>`:"").join("")}</div>
   <div class="row" style="gap:16px">${[["go","On track"],["gold","Close"],["oops","Needs support"]].map(([c,l])=>`<span><span class="dot ${c}"></span> ${l}: <b>${n[c]}</b></span>`).join("")}</div>
   <p class="small"><b>Based on ${n.go+n.gold+n.oops} of ${real.length} students</b> with enough practice or test data.${real.length-(n.go+n.gold+n.oops)?` ${real.length-(n.go+n.gold+n.oops)} ${real.length-(n.go+n.gold+n.oops)===1?"student doesn’t":"students don’t"} have enough data yet, so they aren’t counted.`:""}</p>
   <p class="muted" style="font-size:.85rem">Each student’s estimate combines every standard on their trail: verified on their own or right on the test counts fully, a checkpoint not yet verified counts three quarters, 70% or better on recent practice counts half. ${isELA(gradeOf())?"All standards count equally.":isSci(gradeOf())?"All objectives count equally.":isHS(gradeOf())?(gradeOf()===10?"Algebra, functions, and essential skills count 3 times as much; other ACT categories count 1.5 times.":"Higher WorkKeys levels count a little more than lower ones."):"Standards in the major work of the grade count 3 times as much, supporting standards 1.5 times, and additional standards once."} ${hsOn()?"This is a guide, not an ACT or WorkKeys score.":"This is a guide, not a MAAP score."}</p></div>`;
}

/* ================= growth card (class) ================= */
function growthCard(){
  const real=realStudents(),wk=weekly(real.map(s=>s.prog));
  return `<div class="card"><h2>Growth over time</h2><p class="muted">Class accuracy each week in practice (all standards). Hover a point to see the numbers.</p>
   ${lineChart(wk.map(x=>({label:shortDate(x.w),y:x.acc,tip:`Week of ${shortDate(x.w)}: ${x.acc}% right (${x.ok} of ${x.n})`})),{max:100,unit:"%",goal:70,goalLabel:"70%",title:"Weekly class accuracy"})}
   ${wk.length?`<h3>Questions answered each week</h3>${barChart(wk.map(x=>({label:shortDate(x.w),y:x.n,tip:`Week of ${shortDate(x.w)}: ${x.n} questions, ${Math.round(x.ms/60000)} minutes`})),{title:"Questions answered per week"})}`:""}</div>`;
}

/* ================= spaced review ================= */
const REVIEW_DAYS=7,REVIEW_EVERY=5;
function pickReview(s){const p=s.prog,now=Date.now();S.rvKind=null;
  if(S.chkMode){const d=evDue(s);if(d){S.rvKind=d.kind;return d.k}S.chkMode=false;return null} // check-ups the student started from home
  S.sinceRev=(S.sinceRev||0)+1;if(S.sinceRev<REVIEW_EVERY)return null;
  {const d=evDue(s);if(d){S.sinceRev=0;S.rvKind=d.kind;return d.k}} // verify and retention check-ups come before ordinary review
  const due=SKILLS.filter(k=>{const sk=p.skills[k.id];if(!sk||!(sk.status==="done"||sk.status==="skip"))return false;if(!genOf(k)&&!k.qs.length&&!k.twins.length)return false;
    const t=sk.rv?.t||sk.doneAt||p.first||now;return now-t>=REVIEW_DAYS*864e5});
  if(!due.length)return null;S.sinceRev=0;return due.sort((a,b)=>(p.skills[a.id].rv?.t||0)-(p.skills[b.id].rv?.t||0))[0]}
function reviewQid(k){const g=genOf(k),pool=[...k.twins,...k.qs.map(n=>"q"+n)].filter(getQ),sk=S.student&&S.student.prog.skills[k.id];if(g&&deckN(g)&&sk&&(!pool.length||Math.random()<.6)){const id=deckId(sk,g);markSeen(sk,id);return id}return g&&(!pool.length||Math.random()<.6)?genId(g):pool[Math.floor(Math.random()*pool.length)]}
function gradeReview(q,ok){const p=S.student.prog,sk=p.skills[S.k];sk.rv={t:Date.now(),n:(sk.rv?.n||0)+1,ok:(sk.rv?.ok||0)+(ok?1:0)};
  S.evRes=S.rvKind?evGrade(sk,S.rvKind,ok,!!S.chat):null;
  if(ok){sk.rvMiss=0;if(sk.reopen&&sk.status!=="todo")delete sk.reopen}else{sk.rvMiss=(sk.rvMiss||0)+1;if(sk.rvMiss>=2){sk.was=sk.status;sk.status="todo";sk.streak=0;sk.rvMiss=0;sk.reopen=true;evReset(sk);S.reopened=true}}}

/* ================= MTSS ================= */
function stdRows(s){return SKILLS.map(k=>{const sk=s.prog.skills[k.id];if(!sk||sk.status==="off")return null;
  const days=Object.entries(s.prog.days||{}).filter(([,x])=>x[k.id]).sort(),n=days.reduce((a,[,x])=>a+x[k.id].n,0),ok=days.reduce((a,[,x])=>a+x[k.id].ok,0),ms=days.reduce((a,[,x])=>a+x[k.id].ms,0);
  const rec=(s.prog.recent||[]).filter(r=>r.k===k.id);
  return {k,sk,n,ok,mins:Math.round(ms/60000),sessions:days.length,first:days[0]?.[0],last:days[days.length-1]?.[0],acc:n?Math.round(ok/n*100):null,
    fa:days.length?Math.round(days[0][1][k.id].ok/days[0][1][k.id].n*100):null,la:days.length>1?Math.round(days[days.length-1][1][k.id].ok/days[days.length-1][1][k.id].n*100):null,
    lv:evLevel(s,k),st:sk.status==="done"?EV_LBL[evLevel(s,k)]:sk.status==="skip"?(evOf(sk).r?"Retained (right on the test)":"Verified (right on the test)"):sk.reopen?"Needs a refresh":rec.length?(n<5?"In progress · too few answers to judge":"In progress"):"No activity yet"}}).filter(Boolean)}
function tMtss(){
  if(S.rcpt)return receiptView();
  const real=CUR.raw.filter(s=>!isSample(s)).map((r,i)=>({r,s:CUR.students.find(x=>x.id===r.id)})),mo=Date.now()-30*864e5;
  if(S.mtssId){const x=real.find(y=>y.r.id===S.mtssId);if(x)return mtssReport(x.r,x.s)}
  return `<div class="card"><h2>MTSS and intervention records</h2><p class="muted">Mark a student’s tier, then open their report. Every report is built from their practice: standards worked on, time, accuracy growth, mistakes, and fluency. Add your goal and notes, then print it for meetings.</p>
   <div class="tablewrap"><table class="roster"><thead><tr><th>Student</th><th>Tier</th><th>Readiness</th><th>Working on</th><th>Minutes (30 days)</th><th></th></tr></thead><tbody>
   ${real.map(({r,s})=>{const cur=curSkill(s),rd=readiness(s),b=band(rd);return `<tr><td><b>${esc(r.name)}</b></td><td><select data-tier="${r.id}" aria-label="Tier for ${esc(r.name)}"><option value="">Tier 1</option><option value="2" ${r.mtss?.tier==="2"?"selected":""}>Tier 2</option><option value="3" ${r.mtss?.tier==="3"?"selected":""}>Tier 3</option></select></td>
     <td>${rd==null?`<span class="pill" title="Not enough practice or test data yet">Evidence needed</span>`:`<span class="pill ${b.c}">${b.t} · ${rd}%</span>`}</td><td>${cur?esc(cur.std):'<span style="color:var(--go);font-weight:700">Finished</span>'}</td><td>${minsOf(s.prog,null,mo)}</td><td><div class="row" style="gap:6px;flex-wrap:nowrap"><button class="ghost small" data-mrep="${r.id}">Open report</button><button class="ghost small" data-rcpt="${r.id}">Receipt</button></div></td></tr>`}).join("")||`<tr><td colspan="6" class="muted">No students yet.</td></tr>`}</tbody></table></div><div class="row"><button class="ghost small" data-rcpt="all">Print all Proficiency Receipts</button><span class="muted small">One page per student: what each standard has been practiced, verified, and retained.</span></div><p class="muted" id="tier-msg" role="status"></p></div>`;
}
function mtssReport(r,s){
  const m=r.mtss||{},rows=stdRows(s),rd=readiness(s),b=band(rd),wk=weekly([s.prog]),f=(r.prog||{})._flu,cur=curSkill(s),mis=missGroups([s]).slice(0,5),total=minsOf(s.prog),days=Object.keys(s.prog.days||{}).length;
  const since=m.start?new Date(m.start+"T00:00:00").getTime():0;
  return `<div class="row"><button class="ghost small" id="m-back">← All students</button><button class="small" id="m-print">Print report</button></div>
  <div class="card mrep" id="mrep">
   <div class="top"><div><span class="label">Intervention progress report</span><h2>${esc(r.name)}</h2><p class="muted">${esc(CUR.cls.name)} · ${esc(tName(CUR.cls.teacherId))} · ${esc(TB.school.name)} · printed ${new Date().toLocaleDateString()}</p></div>
    <div style="text-align:right"><span class="pill ${b.c}" style="font-size:.9rem">${b.t}${rd!=null?` · ${rd}%`:""}</span><br><span class="muted" style="font-size:.8rem">benchmark readiness (estimate)</span></div></div>
   <form class="grid noprint-ok" id="m-f">
    <label class="f">Tier<select id="m-tier"><option value="">Tier 1</option><option value="2" ${m.tier==="2"?"selected":""}>Tier 2</option><option value="3" ${m.tier==="3"?"selected":""}>Tier 3</option></select></label>
    <label class="f">Intervention start<input type="date" id="m-start" value="${esc(m.start||"")}"></label>
    <label class="f" style="grid-column:1/-1">Goal<input id="m-goal" maxlength="300" value="${esc(m.goal||"")}" placeholder="e.g. Master 3.OA.4 with 80% accuracy by Dec 15"></label>
    <fieldset class="f" style="grid-column:1/-1;border:1px solid var(--line,#ddd);border-radius:10px;padding:8px 12px"><legend><b>Accommodations</b> <span class="muted">(IEP, 504, or teacher choice. Set them once and they turn on every time this student signs in.)</span></legend>${ACC.map(([k,l])=>`<label class="chk" style="display:inline-flex;gap:6px;margin-right:16px"><input type="checkbox" data-acc="${k}" ${(r.acc||{})[k]?"checked":""}> ${l}</label>`).join("")}</fieldset>
    <label class="f" style="grid-column:1/-1">Notes<textarea id="m-notes" rows="3" maxlength="2000" placeholder="Small group times, strategies tried, parent contact…">${esc(m.notes||"")}</textarea></label>
    <button type="submit">Save</button></form><p class="muted" id="m-msg" role="status"></p>
   <div class="mstats">${(()=>{const T=sesSum(r,since);return [["Sessions with teacher",T.n],["Minutes with teacher",T.mins],["Sessions missed",T.absent]]})().concat([["App minutes",total],["Days with practice",days],["Minutes since start",m.start?minsOf(s.prog,null,since):"—"],["Fluency level",f?`${(f.level||0)+1} of ${FLU().length}`:"—"],["Now working on",cur?cur.std:"Finished"]]).concat(stepsMstats(s)).map(([l,v])=>`<div><b>${esc(String(v))}</b><span>${l}</span></div>`).join("")}</div>
   ${fidelityHTML(r,s)}
   <h3>Accuracy each week</h3>${lineChart(wk.map(x=>({label:shortDate(x.w),y:x.acc,tip:`Week of ${shortDate(x.w)}: ${x.acc}% (${x.ok}/${x.n}), ${Math.round(x.ms/60000)} min`})),{max:100,unit:"%",goal:80,goalLabel:"80%",title:"Weekly accuracy"})}
   <h3>Standards</h3><div class="tablewrap"><table class="roster"><thead><tr><th>Standard</th><th>Status</th><th>Questions</th><th>Accuracy</th><th>First day → latest day</th><th>Days</th><th>Minutes</th></tr></thead><tbody>
    ${rows.map(x=>`<tr><td><b>${esc(x.k.std)}</b><br><span class="muted">${esc(x.k.name)}</span></td><td>${x.st}</td><td>${x.n}</td><td>${x.acc==null?"—":x.n<5?`<span class="muted">${x.acc}% (only ${x.n})</span>`:x.acc+"%"}</td><td>${x.fa==null?"—":x.la==null?x.fa+"%":`${x.fa}% → ${x.la}%`}${x.first?`<br><span class="muted" style="font-size:.8rem">${shortDate(x.first)}–${shortDate(x.last)}</span>`:""}</td><td>${x.sessions}</td><td>${x.mins}</td></tr>`).join("")}</tbody></table></div>
   <h3>Sessions taught</h3>${(()=>{const L=sesOf(r).filter(x=>new Date(x.d+"T12:00:00").getTime()>=since).slice().reverse();return L.length?`<div class="tablewrap"><table class="roster"><thead><tr><th>Date</th><th>Standard</th><th>Attended</th><th>Minutes</th><th>What was taught</th></tr></thead><tbody>${L.slice(0,20).map(x=>`<tr><td>${niceDay(x.d)}</td><td>${esc(x.std)}</td><td>${x.a?"Yes":"<b>Absent</b>"}</td><td>${x.a?x.m:0}</td><td>${esc(x.n||"")}</td></tr>`).join("")}</tbody></table></div>`:`<p class="muted">No teacher-led sessions logged${m.start?" since the start date":""}. Log them from the Station planner.</p>`})()}
   <h3>Most common mistakes</h3>${mis.length?`<ol class="miss">${mis.map(x=>`<li><div class="mhead"><b>${esc((LIBG[x.k]||SKILLS.find(k=>k.id===x.k)||{}).code||(SKILLS.find(k=>k.id===x.k)||{}).std||"")}</b><span class="muted">${x.n} time${x.n===1?"":"s"}</span></div><p class="mex">“${fmt(x.ex)}”</p></li>`).join("")}</ol>`:`<p class="muted">No mistakes recorded yet.</p>`}
   ${f&&(f.att||[]).length?`<h3>Fluency</h3><div class="tablewrap"><table class="roster"><thead><tr><th>Date</th><th>Level</th><th>Score</th><th>Passed</th></tr></thead><tbody>${f.att.slice(-8).reverse().map(a=>`<tr><td>${new Date(a.d).toLocaleDateString()}</td><td>${a.lvl+1}</td><td>${a.r}/${a.n}</td><td>${a.p?"Yes":"No"}</td></tr>`).join("")}</tbody></table></div>`:""}
   <p class="muted" style="font-size:.8rem">Teacher minutes come from the sessions the teacher logged; absent students get no credit. App minutes are estimated from time spent on each question (up to 3 minutes per question). Readiness is an estimate from practice and test data, not a MAAP score.</p>
  </div>`;
}
function wireMtss(){wireReceipts();
  app.querySelectorAll("[data-tier]").forEach(sel=>sel.onchange=async()=>{const id=sel.dataset.tier,msg=document.getElementById("tier-msg");
    try{await saveRoster(CUR.raw.map(s=>s.id===id?{...s,mtss:{...(s.mtss||{}),tier:sel.value}}:s));msg.textContent="Saved."}catch(e){msg.textContent=e.message}});
  app.querySelectorAll("[data-mrep]").forEach(b=>b.onclick=()=>{S.mtssId=b.dataset.mrep;render()});
  const bk=document.getElementById("m-back");if(bk)bk.onclick=()=>{S.mtssId=null;render()};
  const pr=document.getElementById("m-print");if(pr)pr.onclick=()=>printEl("mrep",`Intervention report`);
  const f=document.getElementById("m-f");if(f)f.onsubmit=async e=>{e.preventDefault();const id=S.mtssId,v=x=>document.getElementById(x).value;busy(e.submitter,"Saving…");
    try{await saveRoster(CUR.raw.map(s=>s.id===id?{...s,mtss:{tier:v("m-tier"),start:v("m-start"),goal:v("m-goal"),notes:v("m-notes")},acc:Object.fromEntries([...document.querySelectorAll("[data-acc]")].map(i=>[i.dataset.acc,i.checked]))}:s));flash("m-msg","Saved.");render()}catch(er){document.getElementById("m-msg").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Save"}};
}
function printEl(id,title){const el=document.getElementById(id),w=window.open("","_blank");if(!el||!w){alert("Allow pop-ups to print.");return}
  const css=pageCSS();
  const clone=el.cloneNode(true);clone.querySelectorAll("form").forEach(f=>{const box=document.createElement("div");box.className="pfields";
    const g=x=>el.querySelector("#"+x);box.innerHTML=`<p><b>Tier:</b> ${g("m-tier")?.value?("Tier "+g("m-tier").value):"Tier 1"} &nbsp; <b>Start:</b> ${esc(g("m-start")?.value||"—")}</p><p><b>Goal:</b> ${esc(g("m-goal")?.value||"—")}</p><p><b>Notes:</b> ${esc(g("m-notes")?.value||"—")}</p>`;f.replaceWith(box)});
  w.document.write(`<!doctype html><meta charset="utf-8"><title>${esc(title)}</title>${css}<style>body{background:#fff;padding:16px}.card{box-shadow:none;border:1px solid #ccc}button{display:none}</style><div class="wrap teach" style="max-width:900px">${clone.outerHTML}</div><script>setTimeout(()=>print(),300)<\/script>`);w.document.close()}

/* ================= class data download ================= */
function csvCell(v){v=v==null?"":String(v);return /[",\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v}
function classCSV(){
  const head=["Name","Code","Missed on test","Assigned standards","Working on","Checkpoints done","Checkpoints total","Practice accuracy %","Questions answered","Minutes practiced","Readiness estimate %","Fluency level","Tier","Asked Scout"];
  const rows=CUR.raw.filter(r=>!isSample(r)).map(r=>{const s=CUR.students.find(x=>x.id===r.id),TR=trailFor(s),p=s.prog,cur=curSkill(s);
    const tries=Object.values(p.log).reduce((a,l)=>a+l.tries,0)+(p.prior?.tries||0),right=Object.values(p.log).reduce((a,l)=>a+l.right,0)+(p.prior?.right||0);
    return [r.name,r.code,s.missed==null?"not entered":s.missed.join(" "),(r.assigned||[]).join(" "),cur?cur.std:"finished",TR.filter(k=>p.skills[k.id].status!=="todo").length,TR.length,tries?Math.round(right/tries*100):"",tries,minsOf(p),readiness(s)??"",(r.prog?._flu?.level??0)+1,r.mtss?.tier?("Tier "+r.mtss.tier):"Tier 1",p.tutor?.total||0]});
  return [head,...rows].map(r=>r.map(csvCell).join(",")).join("\n")+"\n";
}
function saveFile(name,text,type="text/csv"){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800)}

/* ================= backups (admin) ================= */
function backupCard(){
  if(!isAdmin())return"";const B=S.backups;
  return `<div class="card"><h2>Backups</h2><p class="muted">The site makes an automatic backup every night and keeps the newest 21. You can also download a full copy any time and keep it somewhere safe.</p>
   <div class="row"><button class="ghost" id="bk-dl">Download a full backup</button><button class="ghost" id="bk-now">Make a backup now</button><label class="ghost filebtn">Restore from a file<input type="file" id="bk-file" accept=".json,application/json" hidden></label></div>
   ${B?B.length?`<div class="tablewrap"><table class="roster"><thead><tr><th>Backup</th><th></th></tr></thead><tbody>${B.map(k=>`<tr><td>${esc(k.replace("backup/",""))}</td><td><div class="row"><button class="ghost small" data-bkd="${esc(k)}">Download</button><button class="ghost small" data-bkr="${esc(k)}">Restore</button></div></td></tr>`).join("")}</tbody></table></div>`:`<p class="muted">No automatic backups yet. The first one runs tonight.</p>`:`<button class="link" id="bk-list">Show automatic backups</button>`}
   <p class="muted" id="bk-msg" role="status"></p></div>`;
}
function wireBackups(){
  if(!isAdmin())return;const msg=()=>document.getElementById("bk-msg"),stamp=()=>new Date().toISOString().slice(0,10);
  const restore=async payload=>{const c=prompt("This replaces ALL classes, students, and progress with the backup. A backup of right now is saved first.\n\nType RESTORE to continue.");if(c!=="RESTORE")return;
    msg().textContent="Restoring…";try{const d=await api("backupRestore",{...payload,confirm:"RESTORE"});alert(`Restored ${d.restored} records. The page will reload.`);location.reload()}catch(e){msg().textContent=e.message}};
  document.getElementById("bk-dl").onclick=async e=>{busy(e.target,"Preparing…");try{const d=await api("schoolExport");saveFile(`path-to-proficiency-backup-${stamp()}.json`,JSON.stringify(d.backup),"application/json");e.target.disabled=false;e.target.textContent="Download a full backup"}catch(er){msg().textContent=er.message}};
  document.getElementById("bk-now").onclick=async e=>{busy(e.target,"Saving…");try{await api("backupNow");S.backups=(await api("backupList")).backups;render();flash("bk-msg","Backup saved.")}catch(er){msg().textContent=er.message}};
  const ls_=document.getElementById("bk-list");if(ls_)ls_.onclick=async()=>{try{S.backups=(await api("backupList")).backups;render()}catch(e){msg().textContent=e.message}};
  app.querySelectorAll("[data-bkd]").forEach(b=>b.onclick=async()=>{try{const d=await api("backupGet",{key:b.dataset.bkd});saveFile(b.dataset.bkd.replace("backup/","p2p-backup-")+".json",JSON.stringify(d.backup),"application/json")}catch(e){msg().textContent=e.message}});
  app.querySelectorAll("[data-bkr]").forEach(b=>b.onclick=()=>restore({key:b.dataset.bkr}));
  document.getElementById("bk-file").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const j=JSON.parse(await f.text());if(!j.data||!j.data.school)throw new Error("That file is not a Path to Proficiency backup.");restore({backup:j})}catch(er){msg().textContent=er.message}};
}

/* ================= report a problem ================= */
const REASONS=[["answer","The answer is wrong"],["confusing","It’s confusing"],["picture","The picture is wrong or missing"],["typo","Spelling or words"],["other","Something else"]];
function reportBox(){const R=S.rep;if(!R||!R.open)return"";
  return `<div class="card pop rep-box"><h3>${t("Report a problem with this question")}</h3>${R.sent?`<p class="fb go"><b>${t("Thank you! Your teacher will check it.")}</b></p>`:`
   <div class="asl" style="max-height:none">${REASONS.map(([v,l])=>`<label class="chk"><input type="radio" name="rr" value="${v}" ${R.reason===v?"checked":""}> ${t(l)}</label>`).join("")}</div>
   <label class="f">${t("Tell us more (optional)")}<textarea id="rr-note" rows="2" maxlength="500"></textarea></label>
   <div class="row"><button id="rr-send" ${R.reason?"":"disabled"}>${t("Send")}</button><button class="ghost" id="rr-x">${t("Cancel")}</button></div><p class="err" id="rr-err" role="alert"></p>`}</div>`}
function wireReport(){
  const b=document.getElementById("rep-btn");if(b)b.onclick=()=>{S.rep={open:!(S.rep&&S.rep.open)};render()};
  if(!S.rep||!S.rep.open||S.rep.sent)return;
  app.querySelectorAll('input[name="rr"]').forEach(r=>r.onchange=()=>{S.rep.reason=r.value;document.getElementById("rr-send").disabled=false});
  document.getElementById("rr-x").onclick=()=>{S.rep=null;render()};
  document.getElementById("rr-send").onclick=async e=>{busy(e.target,"…");const k=SKILLS.find(x=>x.id===S.k);
    try{if(!S.demo)await api("reportAdd",{qid:S.qid,std:k&&k.std,testId:TESTID,reason:S.rep.reason,note:document.getElementById("rr-note").value,q:S.q,classId:CUR?.cls?.id});S.rep.sent=true;render()}
    catch(er){document.getElementById("rr-err").textContent=er.message;e.target.disabled=false;e.target.textContent=t("Send")}};
}
function tReports(){
  const R=S.reports;if(!R){api("reportList").then(d=>{S.reports=d.reports;if(S.tt==="reports")render()}).catch(e=>{S.err=e.message;render()});return `<div class="card"><p class="muted">Loading reports…</p></div>`}
  const open=R.filter(r=>r.status==="open"),done=R.filter(r=>r.status!=="open");
  const item=r=>{let q=null;try{q=r.q&&r.q.parts?{keys:[],steps:[],why:{},...r.q}:null}catch(e){}
    const RL={count:"Student says their answer should count",quality:"Flagged by the app: few students get it right",...Object.fromEntries(REASONS)};
    return `<div class="card"><div class="top"><div><b>${esc(RL[r.reason]||r.reason)}</b> · ${esc(r.std||"")}<br><span class="muted" style="font-size:.85rem">${esc(r.who)} · ${new Date(r.t).toLocaleString()} · ${esc(testName(r.testId))}${r.qid.startsWith("~")?" · practice question made by the app":""}</span></div><span class="pill ${r.status==="open"?"oops":"go"}">${esc(r.status)}</span></div>
     ${r.reason==="count"?countReportHTML(r):""}${r.note?`<p>“${esc(r.note)}”</p>`:""}${q?`<details><summary>See the question</summary>${reviewHTML(q,"Reported question")}</details>`:""}
     ${r.status==="open"&&r.reason==="count"&&r.sid?`<div class="row"><button class="small" data-rs="${r.id}|credited">Give credit</button><button class="ghost small" data-rs="${r.id}|dismissed">Keep it wrong</button>${r.qid.startsWith("~")?"":`<button class="ghost small" data-rs="${r.id}|hidden">Hide this question from students</button>`}</div>`:r.status==="open"?`<div class="row"><button class="ghost small" data-rs="${r.id}|fixed">Mark fixed</button><button class="ghost small" data-rs="${r.id}|dismissed">Dismiss</button>${r.qid.startsWith("~")?"":`<button class="ghost small" data-rs="${r.id}|hidden">Hide this question from students</button>`}</div>`:""}</div>`};
  return `<div class="card"><div class="top"><h2>Problem reports</h2><span class="pill ${open.length?"oops":"go"}">${open.length} open</span></div><p class="muted">Students and teachers can flag any question with the 🚩 button. After a wrong answer, a student can also ask you to look again (🙋); <b>Give credit</b> makes that try count as right in their record. Check each one, then mark it fixed, dismiss it, or hide the question so students don’t see it again. App-made practice questions change every time, so they can’t be hidden one by one; send those to the app developer to fix the question maker.</p></div>
   ${open.map(item).join("")||`<div class="card"><p class="muted">No open reports. 🎉</p></div>`}${done.length?`<details class="card"><summary><b>Closed reports (${done.length})</b></summary>${done.slice(0,40).map(item).join("")}</details>`:""}`;
}
function wireReports(){app.querySelectorAll("[data-rs]").forEach(b=>b.onclick=async()=>{const [id,st]=b.dataset.rs.split("|");busy(b,"…");
  try{await api("reportUpdate",{id,status:st});if(st==="hidden"){TB={...TB,...await api("boot")}}S.reports=null;render()}catch(e){S.err=e.message;render()}})}
const isHidden=id=>{const h=(SB&&SB.hidden)||(TB&&TB.hidden)||[];return h.includes(TESTID+"|"+id)};

/* ================= Spanish for students ================= */
const ES={
 "Today’s Math Mission":"La misión de matemáticas de hoy","Start my mission":"Empezar mi misión","Keep climbing":"Seguir subiendo","My trail":"Mi camino","My badges":"Mis insignias","Sign out":"Salir",
 "Got it on the test":"Lo sabía en el examen","Mastered":"Dominado","You are here":"Estás aquí","Coming up":"Siguiente","From your teacher":"De tu maestro","Summit of Mastery":"Cumbre del dominio","Finish every checkpoint":"Termina cada parada","You made it!":"¡Lo lograste!",
 "▶ Watch the lesson":"▶ Ver la lección","🔊 Read to me":"🔊 Léemelo",
 "Step 1: Tap your key words. Highlight the numbers and the words that tell you what to do.":"Paso 1: Toca tus palabras clave. Marca los números y las palabras que te dicen qué hacer.",
 "I found my key words":"Encontré mis palabras clave","Step 2: Solve it. Work it out with your pencil, then answer.":"Paso 2: Resuélvelo. Trabaja con tu lápiz y luego contesta.",
 "Pick your answer, then tap Check.":"Elige tu respuesta y toca Revisar.","Pick TWO answers, then tap Check.":"Elige DOS respuestas y toca Revisar.","Check my answer":"Revisar mi respuesta","Check my answers":"Revisar mis respuestas","Your answer":"Tu respuesta",
 "Yes! That’s right.":"¡Sí! Correcto.","Next question":"Siguiente pregunta","See the breakdown":"Ver los pasos","Try another one":"Probar otra","Watch the breakdown":"Mira los pasos","Back":"Atrás","Next step":"Siguiente paso","▶ Play and read":"▶ Reproducir y leer","▶ Play":"▶ Reproducir","Pause":"Pausa","🔊 Read this step":"🔊 Leer este paso","🔊 Read this to me":"🔊 Léemelo",
 "Mistakes help us climb. Let’s learn from this one.":"Los errores nos ayudan a subir. Aprendamos de este.","Whoa, that was fast! Did you work it out, or guess? Let’s slow down and learn from this one.":"¡Qué rápido! ¿Lo resolviste o adivinaste? Vamos despacio y aprendamos de este.",
 "💬 Ask Scout for help":"💬 Pedir ayuda a Scout","Ask Scout":"Pregúntale a Scout","Close":"Cerrar","Send":"Enviar","Type your question":"Escribe tu pregunta","Cancel":"Cancelar",
 "Hi! I’m Scout. I can give you hints. Ask me anything about this question!":"¡Hola! Soy Scout. Te puedo dar pistas. ¡Pregúntame lo que quieras sobre esta pregunta!",
 "What is this question asking?":"¿Qué pide esta pregunta?","Give me a hint.":"Dame una pista.","What should I do first?":"¿Qué hago primero?","Why was my answer wrong?":"¿Por qué mi respuesta estaba mal?","Can you show me another way?":"¿Me enseñas otra manera?","I still don’t get it.":"Todavía no entiendo.","Why does this work?":"¿Por qué funciona esto?","Give me a harder one to think about.":"Dame algo más difícil para pensar.",
 "Start fluency":"Empezar fluidez","Ready, set, go!":"¡En sus marcas, listos, fuera!","Enter":"Entrar","Skip":"Saltar","Stop":"Parar","Try again":"Intentar otra vez","Back to my trail":"Volver a mi camino","Practice these":"Practica estas","Nice work!":"¡Buen trabajo!","You passed! 🎉":"¡Pasaste! 🎉","Level up! 🎉":"¡Subiste de nivel! 🎉","Try the next level":"Probar el siguiente nivel",
 "Report a problem with this question":"Reportar un problema con esta pregunta","Thank you! Your teacher will check it.":"¡Gracias! Tu maestro lo revisará.","Tell us more (optional)":"Cuéntanos más (opcional)",
 "The answer is wrong":"La respuesta está mal","It’s confusing":"Es confusa","The picture is wrong or missing":"El dibujo está mal o falta","Spelling or words":"Ortografía o palabras","Something else":"Otra cosa",
 "Review":"Repaso","Review question":"Pregunta de repaso","Yes! You still remember this one.":"¡Sí! Todavía te acuerdas de esto.","Checkpoint":"Parada","Practice question":"Pregunta de práctica","Test question":"Pregunta del examen",
 "Checkpoint reached!":"¡Llegaste a la parada!","You reached the summit!":"¡Llegaste a la cumbre!","Chirp says:":"Chirp dice:","The answer is":"La respuesta es","Here’s what happened:":"Esto pasó:",
};
const t=s=>S.lang==="es"&&ES[s]||s;
const CHIRP_ES={streak:n=>`¡${n} seguidas! ¡Estás que ardes!`,near:n=>`¡Solo ${n} más seguidas para la parada!`,tough:"Los errores hacen crecer tu cerebro. Lee despacio y marca tus palabras clave.",today:n=>`¡Ya contestaste ${n} preguntas hoy! ¡Qué esfuerzo!`,
 gen:["¡Sigue subiendo! Cada pregunta te hace más fuerte.","¡Me encanta cómo sigues intentando!","¡Lo estás haciendo muy bien!","¡Tú puedes!"],fluPass:"¡Wow! ¡Tu cerebro es cada vez más rápido!",fluTry:"Cada intento te hace más rápido. ¡Otra vez!",mastered:"¡Llegaste a la parada! ¡Estoy muy orgulloso de ti!"};
function langToggle(){return S.demo||S.role==="student"?`<button class="ghost small" id="lang">${S.lang==="es"?"English":"Español"}</button>${voiceBtn()}${musicBtn()}${textBtn()}${voicePanel()}${musicPanel()}`:""}
function wireLang(){wireVoice();wireMusic();const b=document.getElementById("lang");if(b)b.onclick=()=>{S.lang=S.lang==="es"?"en":"es";if(!S.demo&&S.student){const all=S.student.raw.prog||(S.student.raw.prog={});all._pref={...(all._pref||{}),lang:S.lang};api("progSave",{testId:"_pref",prog:all._pref}).catch(()=>{})}render()}}

/* ================= Game Arcade: earn tokens by mastering checkpoints, play math games ================= */
const gameCfg=()=>(SB&&SB.cls&&SB.cls.games)||{on:true,mins:3};
const gameOn=()=>S.demo||!SB||gameCfg().on!==false;
const gameProg=()=>{if(S.demo)return S.demoGame||(S.demoGame={spent:0,bonus:2,best:{}});const s=S.student;if(!s.raw)s.raw={prog:{}};const all=s.raw.prog||(s.raw.prog={});return all._game||(all._game={spent:0,bonus:0,best:{}})};
function tokensEarned(){const p=S.student.prog,done=Object.values(p.skills||{}).filter(k=>k.status==="done").length,fl=S.demo?0:(fluProg().level||0);
  return {done,fl,stars:Math.floor((p.stars||0)/25),total:done+fl+Math.floor((p.stars||0)/25)}}
const tokensLeft=()=>{const g=gameProg();return Math.max(0,tokensEarned().total+(g.bonus||0)-(g.spent||0))};
function saveGame(){if(S.demo)return;api("progSave",{testId:"_game",prog:gameProg()}).catch(()=>{S.saveErr=true;markSaved()})}
const GAMES=[
 {id:"pop",name:"Balloon Pop",ico:"🎈",desc:"Pop the balloon with the right answer before it floats away.",kind:"Facts"},
 {id:"match",name:"Match It",ico:"🃏",desc:"Flip cards to find matching pairs.",kind:"Puzzle"},
 {id:"make",name:"Make the Number",ico:"🧮",desc:"Tap numbers that add up to the target.",kind:"Puzzle"},
 {id:"race",name:"Summit Race",ico:"🏔️",desc:"Race Chirp to the top by answering questions from your trail.",kind:"Your standards"},
];
function gameCard(){if(!gameOn())return"";const n=tokensLeft();
  return `<div class="card game-card"><div class="top"><h2>🎮 ${t("Game Arcade")}</h2><span class="pill gold">🪙 ${n} ${t(n===1?"token":"tokens")}</span></div>
   <p class="muted">${t("Earn a token for every checkpoint you master, every fluency level up, and every 25 stars.")}</p>
   <div class="row"><button id="arcade-go" class="ghost">${t("Open the arcade")}</button></div></div>`}
function arcade(){
  const n=tokensLeft(),e=tokensEarned(),mins=gameCfg().mins||3,g=gameProg();
  app.innerHTML=header(`${langToggle()}<button class="ghost" id="back">${t("My trail")}</button>`)+`
   <div class="card arc-hero"><div class="top"><h2>🎮 ${t("Game Arcade")}</h2><span class="pill gold" style="font-size:1rem">🪙 ${n} ${t(n===1?"token":"tokens")}</span></div>
    <p>${t("One token = one game")} (${mins} ${t(mins===1?"minute":"minutes")}). ${n?t("Pick a game!"):t("Master a checkpoint to earn your next token.")}</p>
    <p class="muted" style="font-size:.85rem">${t("You earned")}: ${e.done} ${t("checkpoints")} · ${e.fl} ${t("fluency levels")} · ${e.stars} × 25 ${t("stars")}${g.bonus?` · ${g.bonus} ${t("bonus from your teacher")}`:""}</p></div>
   ${lgCards()}<h2 style="margin:.6rem 0 0">🎮 ${t("Quick games")}</h2>
   <div class="arc-grid">${GAMES.map(G=>`<div class="card arc-game"><div class="arc-ico" aria-hidden="true">${G.ico}</div><h3>${t(G.name)}</h3><span class="pill">${t(G.kind)}</span><p class="muted">${t(G.desc)}</p>${g.best?.[G.id]?`<p style="font-size:.85rem">${t("Best")}: <b>${g.best[G.id]}</b></p>`:""}<button data-play="${G.id}" ${n?"":"disabled"}>${t("Play")} · 🪙 1</button></div>`).join("")}</div>`;
  document.getElementById("back").onclick=()=>{S.screen="home";render()};wireLang();
  app.querySelectorAll("[data-lg]").forEach(b=>b.onclick=()=>{S.lg=b.dataset.lg;S.screen="lg";render()});
  app.querySelectorAll("[data-play]").forEach(b=>b.onclick=()=>{if(!tokensLeft())return;const gp=gameProg();gp.spent=(gp.spent||0)+1;saveGame();startGame(b.dataset.play)});
}
SCREENS.arcade=arcade;

/* ---------- shared game shell ---------- */
let gameTimer=null;
function startGame(id){clearInterval(gameTimer);const mins=gameCfg().mins||3;S.G={id,score:0,end:Date.now()+mins*60000,over:false,st:{}};GINIT[id](S.G.st);S.screen="game";
  gameTimer=setInterval(()=>{const left=Math.max(0,S.G.end-Date.now()),el=document.getElementById("g-time");if(el)el.textContent=`${Math.floor(left/60000)}:${String(Math.floor(left%60000/1000)).padStart(2,"0")}`;if(left<=0)endGame()},250);render()}
function endGame(){clearInterval(gameTimer);gameTimer=null;const G=S.G;if(!G||G.over)return;G.over=true;const gp=gameProg();gp.best=gp.best||{};const nb=G.score>(gp.best[G.id]||0);if(nb)gp.best[G.id]=G.score;G.newBest=nb;
  (gp.plays=gp.plays||[]).push({g:G.id,s:G.score,d:Date.now()});gp.plays=gp.plays.slice(-40);saveGame();render();setTimeout(()=>chirp(nb?"fluPass":"right"),600)}
function game(){
  const G=S.G,def=GAMES.find(x=>x.id===G.id),left=Math.max(0,G.end-Date.now());
  if(G.over){app.innerHTML=header()+`<div class="card pop" style="text-align:center;align-items:center"><div class="arc-ico" style="font-size:3rem">${def.ico}</div><h2>${t("Time’s up!")}</h2>
    <div class="flu-score"><b>${G.score}</b><span>${t("points")}</span></div>${G.newBest?`<p class="newbadge">🏆 ${t("New best score!")}</p>`:""}
    <div class="row"><button id="g-arc">${t("Back to the arcade")}</button><button class="ghost" id="g-home">${t("My trail")}</button></div></div>`;
    document.getElementById("g-arc").onclick=()=>{S.screen="arcade";render()};document.getElementById("g-home").onclick=()=>{S.screen="home";render()};return}
  app.innerHTML=`<div class="flu-top"><span class="label">${def.ico} ${esc(t(def.name))}</span><span class="flu-time" id="g-time">${Math.floor(left/60000)}:${String(Math.floor(left%60000/1000)).padStart(2,"0")}</span><span class="pill gold">⭐ ${G.score}</span><button class="ghost small" id="g-stop">${t("Stop")}</button></div>
   <div class="card game-area" id="g-area">${GVIEW[G.id](G.st)}</div>`;
  document.getElementById("g-stop").onclick=endGame;GWIRE[G.id](G.st);
}
SCREENS.game=game;
const gRand=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),gPick=a=>a[Math.floor(Math.random()*a.length)],gShuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const gLevel=()=>S.demo?0:(fluProg().level||0);
const GINIT={},GVIEW={},GWIRE={};

/* ---------- Balloon Pop ---------- */
GINIT.pop=st=>{const L=FLU_G3[Math.min(gLevel(),5)],q=fluQuestion(L,Math.random);const set=new Set([q.ans]);let g=0;while(set.size<4&&g++<50){const w=q.ans+gPick([-10,-2,-1,1,2,3,10,q.ans>5?-3:4]);if(w>=0)set.add(w)}
  Object.assign(st,{q,opts:gShuf([...set]),pop:null,wrong:null,miss:st.miss||0,round:(st.round||0)+1})};
GVIEW.pop=st=>`<p class="g-prompt">${esc(st.q.t.replace("∎","?"))} = ?</p><div class="sky" id="sky">${st.opts.map((v,i)=>`<button class="balloon b${i}${st.wrong===v?" shake":""}" data-v="${v}" style="left:${8+i*23}%;animation-duration:${7+i*.6}s;animation-delay:${i*.25}s" aria-label="Balloon ${v}"><span>${v}</span></button>`).join("")}</div><p class="muted" style="text-align:center">${t("Tap the balloon with the right answer!")}</p>`;
GWIRE.pop=st=>{app.querySelectorAll(".balloon").forEach(b=>{b.onclick=()=>{const v=+b.dataset.v;if(v===st.q.ans){S.G.score+=10;b.classList.add("popped");setTimeout(()=>{GINIT.pop(st);render()},250)}else{st.wrong=v;b.classList.add("shake");setTimeout(()=>b.classList.remove("shake"),400)}};
  b.onanimationend=e=>{if(e.animationName==="rise"&&+b.dataset.v===st.q.ans&&!S.G.over){st.miss++;GINIT.pop(st);render()}}})};

/* ---------- Match It ---------- */
GINIT.match=st=>{const fr=SKILLS.some(k=>/NF/.test(k.std))&&Math.random()<.5,pairs=[];const seen=new Set();let g=0;
  while(pairs.length<6&&g++<200){let a,b;if(fr){const [n,d]=gPick([[1,2],[1,3],[2,3],[1,4],[3,4],[1,5],[2,5],[1,6],[5,6]]),k=gPick([2,3,4]);a=`[${n}/${d}]`;b=`[${n*k}/${d*k}]`}else{const q=fluQuestion(FLU_G3[Math.min(gLevel(),5)],Math.random);if(q.t.includes("∎")||q.t.startsWith("Round"))continue;a=q.t;b=String(q.ans)}
    if(seen.has(a)||seen.has(b))continue;seen.add(a);seen.add(b);pairs.push([a,b])}
  Object.assign(st,{cards:gShuf(pairs.flatMap(([a,b],i)=>[{v:a,p:i},{v:b,p:i}])).map(c=>({...c,up:false,done:false})),open:[],moves:0,lock:false})};
GVIEW.match=st=>`<p class="g-prompt">${t("Find the matching pairs!")}</p><div class="cards">${st.cards.map((c,i)=>`<button class="mcard${c.up||c.done?" up":""}${c.done?" done":""}" data-i="${i}" ${c.done?"disabled":""}>${c.up||c.done?fmt(c.v):"?"}</button>`).join("")}</div><p class="muted" style="text-align:center">${t("Moves")}: ${st.moves}</p>`;
GWIRE.match=st=>{app.querySelectorAll(".mcard").forEach(b=>b.onclick=()=>{const c=st.cards[+b.dataset.i];if(st.lock||c.up||c.done)return;c.up=true;st.open.push(c);
  if(st.open.length===2){st.moves++;const [x,y]=st.open;if(x.p===y.p){x.done=y.done=true;st.open=[];S.G.score+=15;if(st.cards.every(c=>c.done)){S.G.score+=25;setTimeout(()=>{GINIT.match(st);render()},500)}}
    else{st.lock=true;setTimeout(()=>{x.up=y.up=false;st.open=[];st.lock=false;render()},800)}}render()})};

/* ---------- Make the Number ---------- */
const makeSpec=()=>{const g=gradeOf();return g>=5?{target:1,vals:[1,2,3,4,5,6,7,8,9].map(x=>x/10),fmt:v=>v.toFixed(1),eps:1e-9}:g===4?{target:1000,vals:[100,200,300,400,500,600,700,800,900,150,250,350,450,550,650,750,850],fmt:v=>v.toLocaleString(),eps:0}:{target:100,vals:[10,20,30,40,50,60,70,80,90,15,25,35,45,55,65,75,85],fmt:v=>String(v),eps:0}};
GINIT.make=st=>{const sp=makeSpec();const tiles=[];while(tiles.length<16){const a=gPick(sp.vals.filter(v=>v<sp.target)),b=+(sp.target-a).toFixed(2);if(sp.vals.includes(b)||sp.target===1){tiles.push(a,b)}else tiles.push(gPick(sp.vals))}
  Object.assign(st,{sp,tiles:gShuf(tiles.slice(0,16)).map(v=>({v,sel:false})),msg:""})};
GVIEW.make=st=>{const sum=st.tiles.filter(x=>x.sel).reduce((a,x)=>a+x.v,0);return `<p class="g-prompt">${t("Make")} <b>${st.sp.fmt(st.sp.target)}</b></p><p class="muted" style="text-align:center">${t("Your total")}: <b>${st.sp.fmt(+sum.toFixed(2))}</b> ${st.msg?`· ${esc(st.msg)}`:""}</p>
  <div class="tiles">${st.tiles.map((x,i)=>`<button class="tile${x.sel?" sel":""}" data-i="${i}">${st.sp.fmt(x.v)}</button>`).join("")}</div><div class="row" style="justify-content:center"><button class="ghost small" id="mk-clear">${t("Clear")}</button><button class="ghost small" id="mk-new">${t("New tiles")}</button></div>`};
GWIRE.make=st=>{app.querySelectorAll(".tile").forEach(b=>b.onclick=()=>{const x=st.tiles[+b.dataset.i];x.sel=!x.sel;st.msg="";const sel=st.tiles.filter(y=>y.sel),sum=+sel.reduce((a,y)=>a+y.v,0).toFixed(2);
  if(Math.abs(sum-st.sp.target)<1e-9){S.G.score+=10*sel.length;st.msg=t("Nice!");sel.forEach(y=>{y.v=gPick(st.sp.vals);y.sel=false});
    /* keep at least one pair that makes the target */const a=gPick(st.sp.vals.filter(v=>v<st.sp.target)),i=gRand(0,7),j=gRand(8,15);st.tiles[i].v=a;st.tiles[j].v=+(st.sp.target-a).toFixed(2)}
  else if(sum>st.sp.target+1e-9){st.msg=t("Too much! Try again.");st.tiles.forEach(y=>y.sel=false)}render()});
  document.getElementById("mk-clear").onclick=()=>{st.tiles.forEach(y=>y.sel=false);render()};document.getElementById("mk-new").onclick=()=>{GINIT.make(st);render()}};

/* ---------- Summit Race: questions from the student's own trail ---------- */
function raceQ(){const k=curSkill(S.student)||SKILLS[0],g=genOf(k)||"fluency";for(let i=0;i<30;i++){try{const q=viewQ(GG.make(g,Math.floor(Math.random()*1e9)));if(q.type==="mc"||q.type==="input")return {q,k}}catch(e){}}return {q:viewQ(GG.make("fluency",1)),k}}
GINIT.race=st=>{const {q,k}=raceQ();Object.assign(st,{me:st.me||0,bot:st.bot||0,q,k,fb:null,last:Date.now(),wins:st.wins||0,started:st.started||Date.now()});
  clearInterval(st.botT);st.botT=setInterval(()=>{if(S.screen!=="game"||S.G.over){clearInterval(st.botT);return}st.bot=Math.min(10,st.bot+1);if(st.bot>=10){st.fb={ok:false,t:t("Chirp reached the top! New race!")};st.me=0;st.bot=0}const el=document.getElementById("race-track");if(el)el.outerHTML=raceTrack(st)},12000)};
const raceTrack=st=>`<div class="race" id="race-track"><div class="lane"><span class="who">${t("You")}</span><div class="path">${Array.from({length:10},(_,i)=>`<i class="${i<st.me?"on":""}"></i>`).join("")}<b class="flag">🏁</b></div><span class="runner" style="left:calc(${st.me*9.5}% + 52px)">🧗</span></div>
  <div class="lane"><span class="who">Chirp</span><div class="path">${Array.from({length:10},(_,i)=>`<i class="${i<st.bot?"bot":""}"></i>`).join("")}<b class="flag">🏁</b></div><span class="runner" style="left:calc(${st.bot*9.5}% + 52px)">🐦</span></div></div>`;
GVIEW.race=st=>{const q=st.q;return `${raceTrack(st)}${st.wins?`<p class="muted" style="text-align:center">🏆 ${t("Races won")}: ${st.wins}</p>`:""}
  <div class="notebook ro"><span class="label">${esc(st.k.std)} · ${esc(st.k.name)}</span>${bodyHTML(q,null,"plain")}</div>
  ${st.fb?`<div class="fb ${st.fb.ok?"go":"oops"}"><p>${st.fb.t}</p></div>`:""}
  ${q.type==="mc"?`<div class="choices">${q.choices.map((c,i)=>`<button class="choice" data-rl="${L[i]}"><b class="l">${L[i]}</b><div>${choiceInner(c)}</div></button>`).join("")}</div>`
   :`<form id="race-f" class="row"><input id="race-in" class="num" inputmode="decimal" autocomplete="off" aria-label="Your answer"><button type="submit">${t("Go!")}</button></form>`}`};
GWIRE.race=st=>{const answer=ok=>{if(ok){st.me++;S.G.score+=10;st.fb={ok:true,t:t("Right! You climbed one step.")};if(st.me>=10){st.wins++;S.G.score+=50;st.fb={ok:true,t:t("You reached the summit first! 🏆 New race!")};st.me=0;st.bot=0}}
    else st.fb={ok:false,t:`${t("Not quite.")} ${t("The answer is")} ${esc(ansText(st.q))}.`};const {q,k}=raceQ();st.q=q;st.k=k;render()};
  app.querySelectorAll("[data-rl]").forEach(b=>b.onclick=()=>answer(st.q.type==="mc"&&b.dataset.rl===st.q.ans));
  const f=document.getElementById("race-f");if(f){const i=document.getElementById("race-in");i.focus();f.onsubmit=e=>{e.preventDefault();if(i.value.trim())answer(Number(i.value.replace(/,/g,""))===Number(st.q.ans))}}};

/* Spanish for the arcade */
Object.assign(ES,{"Game Arcade":"Sala de juegos","token":"ficha","tokens":"fichas","Earn a token for every checkpoint you master, every fluency level up, and every 25 stars.":"Gana una ficha por cada parada que domines, cada nivel de fluidez y cada 25 estrellas.","Open the arcade":"Abrir la sala de juegos",
 "One token = one game":"Una ficha = un juego","minutes":"minutos","minute":"minuto","Pick a game!":"¡Elige un juego!","Master a checkpoint to earn your next token.":"Domina una parada para ganar tu próxima ficha.","You earned":"Ganaste","checkpoints":"paradas","fluency levels":"niveles de fluidez","stars":"estrellas","bonus from your teacher":"de regalo de tu maestro",
 "Balloon Pop":"Revienta globos","Match It":"Encuentra la pareja","Make the Number":"Forma el número","Summit Race":"Carrera a la cumbre","Facts":"Operaciones","Puzzle":"Rompecabezas","Your standards":"Tus estándares",
 "Pop the balloon with the right answer before it floats away.":"Revienta el globo con la respuesta correcta antes de que se vaya volando.","Flip cards to find matching pairs.":"Voltea cartas para encontrar parejas.","Tap numbers that add up to the target.":"Toca números que sumen el objetivo.","Race Chirp to the top by answering questions from your trail.":"Compite con Chirp hasta la cima contestando preguntas de tu camino.",
 "Best":"Mejor","Play":"Jugar","Time’s up!":"¡Se acabó el tiempo!","points":"puntos","New best score!":"¡Nuevo récord!","Back to the arcade":"Volver a la sala de juegos","Tap the balloon with the right answer!":"¡Toca el globo con la respuesta correcta!","Find the matching pairs!":"¡Encuentra las parejas!","Moves":"Movidas",
 "Make":"Forma","Your total":"Tu total","Clear":"Borrar","New tiles":"Fichas nuevas","Nice!":"¡Bien!","Too much! Try again.":"¡Te pasaste! Intenta otra vez.","You":"Tú","Races won":"Carreras ganadas","Go!":"¡Ya!","Right! You climbed one step.":"¡Correcto! Subiste un paso.",
 "You reached the summit first! 🏆 New race!":"¡Llegaste primero a la cumbre! 🏆 ¡Nueva carrera!","Chirp reached the top! New race!":"¡Chirp llegó primero! ¡Nueva carrera!","Not quite.":"Casi.","You earned a game token! Spend it in the Game Arcade.":"¡Ganaste una ficha de juego! Úsala en la sala de juegos.","The answer is":"La respuesta es"});

/* teacher: give bonus tokens */
async function giveBonus(btn){const msg=document.getElementById("gm-msg");busy(btn,"Giving…");
  try{const r=await api("gameBonus",{classId:CUR.cls.id,n:1});msg.textContent=`Gave ${r.count} student${r.count===1?"":"s"} a bonus token.`}catch(e){msg.textContent=e.message}
  btn.disabled=false;btn.textContent="Give everyone 1 bonus token"}

/* ---------- Trail Runner: an obstacle-course runner. Steer through the door with the right answer; jump the logs. ---------- */
GAMES.unshift({id:"run",name:"Trail Runner",ico:"🏃",desc:"Run the trail! Steer through the door with the right answer and jump over logs.",kind:"Action"});
function runSet(){const g=+gradeOf();const m=g>=3&&g<=8?g:g>=23&&g<=28?g-20:g===14?4:g===15?5:g===17?7:g>=18&&g<=19?8:g>=9&&g<=11?8:3;
  const L=FLU_SETS[m]||FLU_G3,math=g>=3&&g<=8,top=math&&!S.demo?Math.min(L.length-1,fluProg().level||0):Math.min(L.length-2,3);return {L,top}}
function runQ(){const {L,top}=runSet(),lv=L[Math.floor(Math.random()*(top+1))],q=fluQuestion(lv,Math.random);
  const dec=Math.abs(q.ans-Math.round(q.ans))>1e-9,step=dec?(Math.abs(q.ans*10-Math.round(q.ans*10))>1e-9?.01:.1):1,neg=!!lv.neg;
  const opts=new Set([R6(q.ans)]);let n=0;while(opts.size<3&&n++<60){const d=gPick([-10,-2,-1,1,2,10,3,-3])*step,w=R6(q.ans+d);if(!neg&&w<0)continue;opts.add(w)}
  while(opts.size<3)opts.add(R6(q.ans+opts.size*7*step));return {t:q.t,ans:R6(q.ans),doors:gShuf([...opts])}}
GINIT.run=st=>Object.assign(st,{lane:1,y:1,z:0,vz:0,hearts:3,streak:0,speed:matchMedia("(prefers-reduced-motion: reduce)").matches?130:170,objs:[],dist:0,nextGate:420,q:null,flash:0,inv:0,msg:"",msgT:0,wipe:0,t:0});
GVIEW.run=st=>{const es=S.lang==="es";return `<div class="run-wrap"><canvas id="run-c" aria-label="${es?"Juego de carrera":"Trail Runner game"}" role="img"></canvas>
  <p class="sr-only" id="run-live" aria-live="polite"></p>
  <div class="run-ctl"><button id="run-up" aria-label="${es?"Subir de carril":"Move up a lane"}">▲</button><button id="run-jump">${es?"Saltar":"Jump"}</button><button id="run-down" aria-label="${es?"Bajar de carril":"Move down a lane"}">▼</button></div>
  <p class="muted small" style="text-align:center">${es?"Flechas o deslizar para cambiar de carril · Espacio o tocar para saltar":"Arrow keys or swipe to change lanes · Space or tap to jump"}</p></div>`};
GWIRE.run=st=>{const G=S.G,cv=document.getElementById("run-c"),ctx=cv.getContext("2d"),dpr=Math.min(2,window.devicePixelRatio||1);
  const W=Math.min(cv.parentElement.clientWidth||600,900),H=Math.round(Math.max(260,Math.min(340,W*.55)));cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+"px";cv.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0);
  const top=70,laneH=(H-top-20)/3,laneY=i=>top+laneH*i+laneH/2,PX=Math.max(70,W*.14),name=(S.student?.name||"Runner").replace(" (sample)","").replace(" (preview)","").split(" ")[0];
  const pal=["#E4572E","#2E86AB","#7B5EA7","#1A7D50","#D9971A","#C2185B"],col=pal[[...name].reduce((a,c)=>a+c.charCodeAt(0),0)%pal.length];
  const live=document.getElementById("run-live"),say=m=>{if(live)live.textContent=m};
  const newGate=x=>{st.q=runQ();st.objs.push({k:"gate",x,q:st.q,hit:false});say(st.q.t.replace("^∎"," to the power of what").replace("∎","what")+"?  "+st.q.doors.join(", "))};
  if(!st.objs.length)newGate(W+60);
  const mv=d=>{st.lane=Math.max(0,Math.min(2,st.lane+d))},jump=()=>{if(st.z<=0.01){st.vz=430}};
  const key=e=>{if(S.screen!=="game"||G.over)return;if(["ArrowUp","w","W"].includes(e.key)){mv(-1);e.preventDefault()}else if(["ArrowDown","s","S"].includes(e.key)){mv(1);e.preventDefault()}else if(e.key===" "||e.key==="Spacebar"){jump();e.preventDefault()}};
  document.addEventListener("keydown",key);
  document.getElementById("run-up").onclick=()=>mv(-1);document.getElementById("run-down").onclick=()=>mv(1);document.getElementById("run-jump").onclick=jump;
  let sy=null,sx=null;cv.addEventListener("touchstart",e=>{sy=e.touches[0].clientY;sx=e.touches[0].clientX},{passive:true});
  cv.addEventListener("touchend",e=>{if(sy==null)return;const dy=e.changedTouches[0].clientY-sy,dx=e.changedTouches[0].clientX-sx;if(Math.abs(dy)>30&&Math.abs(dy)>Math.abs(dx))mv(dy<0?-1:1);else jump();sy=null});
  cv.addEventListener("click",e=>{if(e.pointerType==="mouse"||e.detail)jump()});
  const rr=(x,y,w,h,r)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()};
  let last=performance.now();
  function hurt(m){if(st.inv>0)return;st.hearts--;st.streak=0;st.flash=.35;st.inv=1.1;st.msg=m;st.msgT=1.2;say(m);if(st.hearts<=0){st.wipe=1.4;st.hearts=3;st.msg=S.lang==="es"?"¡Uy! Otra vez desde el inicio":"Wipeout! Back on your feet";st.msgT=1.4}}
  function frame(now){if(S.screen!=="game"||S.G!==G||G.over||!document.body.contains(cv)){document.removeEventListener("keydown",key);return}
    const dt=Math.min(.05,(now-last)/1000);last=now;st.t+=dt;
    if(st.wipe>0)st.wipe-=dt;const v=st.wipe>0?st.speed*.3:st.speed;
    st.y+=(st.lane-st.y)*Math.min(1,dt*12);if(st.z>0||st.vz>0){st.z+=st.vz*dt;st.vz-=1300*dt;if(st.z<=0){st.z=0;st.vz=0}}
    st.flash=Math.max(0,st.flash-dt);st.inv=Math.max(0,st.inv-dt);st.msgT=Math.max(0,st.msgT-dt);st.dist+=v*dt;
    st.objs.forEach(o=>o.x-=v*dt);
    /* spawn: a gate after the last one leaves, sometimes a log in between */
    const lastGate=[...st.objs].reverse().find(o=>o.k==="gate");
    if(!lastGate||lastGate.x<W*.35){newGate(W+80);if(Math.random()<.65)st.objs.push({k:"log",x:W+80+Math.max(220,W*.42)*.5+40,lane:gRand(0,2),hit:false})}
    st.objs=st.objs.filter(o=>o.x>-120);
    for(const o of st.objs){if(o.hit)continue;
      if(o.k==="gate"&&o.x<PX+8&&o.x>PX-30){o.hit=true;const pick=o.q.doors[Math.round(st.y)];
        if(Math.abs(pick-o.q.ans)<1e-9){st.streak++;const pts=10+Math.min(st.streak,5)*2;G.score+=pts;st.speed=Math.min(360,st.speed+7);st.msg=(S.lang==="es"?"¡Correcto! +":"Correct! +")+pts;st.msgT=.9;say(st.msg)}
        else hurt((S.lang==="es"?"Era ":"It was ")+fN(o.q.ans))}
      if(o.k==="log"&&Math.abs(o.x-PX)<22&&Math.round(st.y)===o.lane){if(st.z>18){o.hit=true;G.score+=1}else{o.hit=true;hurt(S.lang==="es"?"¡Salta los troncos!":"Jump the logs!")}}}
    const sc=document.querySelector(".flu-top .pill.gold");if(sc)sc.textContent="⭐ "+G.score;
    /* ---- draw ---- */
    const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#BFE6FF");sky.addColorStop(1,"#E9F7EE");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#9ED3B3";for(let i=-1;i<4;i++){const hx=((i*W/2.6)-(st.dist*.15)%(W/2.6));ctx.beginPath();ctx.ellipse(hx,top+6,W/3.4,48,0,Math.PI,0);ctx.fill()}
    for(let i=0;i<3;i++){ctx.fillStyle=i%2?"#CDEBD6":"#DDF2E3";ctx.fillRect(0,top+laneH*i,W,laneH)}
    ctx.strokeStyle="rgba(26,125,80,.25)";ctx.setLineDash([18,14]);ctx.lineDashOffset=st.dist%32;ctx.lineWidth=2;for(let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(0,top+laneH*i);ctx.lineTo(W,top+laneH*i);ctx.stroke()}ctx.setLineDash([]);
    for(const o of st.objs){if(o.k==="log"){const y=laneY(o.lane);ctx.fillStyle="#8B5A2B";rr(o.x-20,y+laneH*.12,40,laneH*.28,8);ctx.fill();ctx.fillStyle="#C68B59";ctx.beginPath();ctx.ellipse(o.x+18,y+laneH*.26,6,laneH*.13,0,0,7);ctx.fill()}
      else{ctx.fillStyle="#16243B";ctx.fillRect(o.x-4,top-6,8,laneH*3+12);
        o.q.doors.forEach((d,i)=>{const y=top+laneH*i+4,good=o.hit&&Math.abs(d-o.q.ans)<1e-9;ctx.fillStyle=good?"#1A7D50":"#FFFDF5";rr(o.x-34,y,68,laneH-8,10);ctx.fill();ctx.strokeStyle="#16243B";ctx.lineWidth=2.5;ctx.stroke();
          ctx.fillStyle=good?"#fff":"#16243B";ctx.font=`800 ${Math.min(22,laneH*.36)}px system-ui,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";const s=fN(d);ctx.fillText(s.length>7?s.slice(0,7):s,o.x,y+(laneH-8)/2)})}}
    /* runner */
    const py=laneY(st.y)-st.z*.6,bob=Math.sin(st.t*14)*(st.z>0?0:2.5),blink=st.inv>0&&Math.floor(st.t*12)%2;
    if(!blink){ctx.fillStyle="rgba(0,0,0,.12)";ctx.beginPath();ctx.ellipse(PX,laneY(st.y)+laneH*.32,16,4,0,0,7);ctx.fill();
      ctx.strokeStyle="#16243B";ctx.lineWidth=4;ctx.lineCap="round";const sw=st.z>0?0:Math.sin(st.t*14)*8;
      ctx.beginPath();ctx.moveTo(PX-4,py+12);ctx.lineTo(PX-4+sw,py+24);ctx.moveTo(PX+4,py+12);ctx.lineTo(PX+4-sw,py+24);ctx.stroke();
      ctx.fillStyle="#2B333D";rr(PX-17,py-8+bob,10,18,4);ctx.fill();
      ctx.fillStyle=col;rr(PX-12,py-22+bob,24,36,12);ctx.fill();
      ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(PX+4,py-10+bob,4.5,0,7);ctx.fill();ctx.fillStyle="#16243B";ctx.beginPath();ctx.arc(PX+5.5,py-10+bob,2.3,0,7);ctx.fill();
      ctx.font="800 13px system-ui,sans-serif";ctx.textAlign="center";ctx.textBaseline="bottom";const nw=ctx.measureText(name).width+12;ctx.fillStyle="rgba(22,36,59,.85)";rr(PX-nw/2,py-48+bob,nw,18,9);ctx.fill();ctx.fillStyle="#fff";ctx.fillText(name,PX,py-31+bob)}
    /* top bar: question, hearts, streak */
    ctx.fillStyle="rgba(255,255,255,.92)";rr(8,8,W-16,48,12);ctx.fill();ctx.fillStyle="#16243B";ctx.textBaseline="middle";ctx.textAlign="left";ctx.font=`800 ${W<420?18:24}px system-ui,sans-serif`;
    const qt=st.q?st.q.t.replace("^∎","^?").replace("∎","?"):"";ctx.fillText(qt.includes("?")?qt:qt+" = ?",20,32);
    ctx.textAlign="right";ctx.font="800 24px system-ui,sans-serif";for(let i=0;i<3;i++){ctx.fillStyle=i<st.hearts?"#E0413B":"#C9CED6";ctx.fillText("♥",W-20-(2-i)*24,33)}ctx.fillStyle="#16243B";
    if(st.streak>1){ctx.font="700 14px system-ui,sans-serif";ctx.fillStyle="#D9971A";ctx.fillText("🔥 "+st.streak,W-20-3*24-14,32)}
    if(st.msgT>0){ctx.globalAlpha=Math.min(1,st.msgT*2);ctx.font="800 20px system-ui,sans-serif";ctx.textAlign="center";const mw=ctx.measureText(st.msg).width+24;ctx.fillStyle="rgba(22,36,59,.85)";rr(W/2-mw/2,H-46,mw,32,16);ctx.fill();ctx.fillStyle="#fff";ctx.fillText(st.msg,W/2,H-30);ctx.globalAlpha=1}
    if(st.flash>0){ctx.fillStyle=`rgba(200,70,59,${st.flash})`;ctx.fillRect(0,0,W,H)}
    requestAnimationFrame(frame)}
  requestAnimationFrame(frame)};

/* ================= Tutors & consultants: public application + admin review ================= */
const MS_COUNTIES=["Adams","Alcorn","Amite","Attala","Benton","Bolivar","Calhoun","Carroll","Chickasaw","Choctaw","Claiborne","Clarke","Clay","Coahoma","Copiah","Covington","DeSoto","Forrest","Franklin","George","Greene","Grenada","Hancock","Harrison","Hinds","Holmes","Humphreys","Issaquena","Itawamba","Jackson","Jasper","Jefferson","Jefferson Davis","Jones","Kemper","Lafayette","Lamar","Lauderdale","Lawrence","Leake","Lee","Leflore","Lincoln","Lowndes","Madison","Marion","Marshall","Monroe","Montgomery","Neshoba","Newton","Noxubee","Oktibbeha","Panola","Pearl River","Perry","Pike","Pontotoc","Prentiss","Quitman","Rankin","Scott","Sharkey","Simpson","Smith","Stone","Sunflower","Tallahatchie","Tate","Tippah","Tishomingo","Tunica","Union","Walthall","Warren","Washington","Wayne","Webster","Wilkinson","Winston","Yalobusha","Yazoo"];
const T_TRAVEL={virtual:"Virtual only","15":"Up to 15 miles","30":"Up to 30 miles","60":"Up to 60 miles",state:"Anywhere in Mississippi"};
const T_AREAS={OA:"Operations & algebraic thinking",NBT:"Place value & base ten",NF:"Fractions",MD:"Measurement & data",G:"Geometry",RP:"Ratios & proportions",NS:"Integers & the number system",EE:"Expressions & equations",F:"Functions",SP:"Statistics & probability",ALG:"Algebra I"};
const T_LIC={ms:"Mississippi educator license",other:"License from another state",working:"Working toward a license",none:"No teaching license"};
const T_ROLE={tutor:"Tutor (works with students)",consultant:"Consultant (coaches teachers / schools)",both:"Both"};
const T_STAT={new:"New",reviewing:"Reviewing",interview:"Interview",approved:"Approved",contract:"Contract sent",signed:"Contract signed",active:"Active",declined:"Declined"};
const T_DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const chk=(name,val,label,on)=>`<label class="tchk"><input type="checkbox" name="${name}" value="${esc(val)}" ${on?"checked":""}> ${esc(label)}</label>`;

function tutorApply(){
  if(S.tDone){app.innerHTML=`<div class="card pop" style="text-align:center;align-items:center;margin-top:40px">${LOGO}<h2>Thank you! 🎉</h2>
    <p>Your application was sent. We review every application and will email you about next steps, including the contractor agreement and background check.</p>
    <button id="t-home">Back to the home page</button></div>`;document.getElementById("t-home").onclick=()=>{S.tDone=false;S.screen="landing";render()};return}
  app.innerHTML=`<div class="top"><div class="brand">${LOGO}<div><h1>Path to Proficiency</h1><small>Tutors &amp; consultants</small></div></div><button class="ghost" id="t-back">← Home</button></div>
  <div class="card"><span class="eyebrow">Join the team</span><h2>Help Mississippi students reach proficiency</h2>
   <p>We match certified tutors and math consultants with schools near them. Tell us about yourself. If it’s a good fit, we’ll set up a short interview, then send a contractor agreement to sign online.</p>
   <p class="muted" style="font-size:.9rem">What happens next: <b>1</b> Apply · <b>2</b> Short interview · <b>3</b> Background check · <b>4</b> Sign the agreement · <b>5</b> Get matched with a school</p></div>
  <form class="card" id="tf" novalidate>
   <h3>About you</h3>
   <div class="grid">
    <label class="f">Full name<input name="name" required maxlength="80" autocomplete="name"></label>
    <label class="f">Email<input name="email" type="email" required maxlength="120" autocomplete="email"></label>
    <label class="f">Phone (optional)<input name="phone" type="tel" maxlength="30" autocomplete="tel"></label>
    <label class="f">I want to work as a<select name="role">${Object.entries(T_ROLE).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select></label>
   </div>
   <h3>Where you can work</h3>
   <div class="grid">
    <label class="f">County<select name="county" required><option value="">Choose your county</option>${MS_COUNTIES.map(c=>`<option>${c}</option>`).join("")}<option>Outside Mississippi</option></select></label>
    <label class="f">City or town<input name="city" maxlength="60" autocomplete="address-level2"></label>
    <label class="f">How far will you travel?<select name="travel">${Object.entries(T_TRAVEL).map(([k,v])=>`<option value="${k}" ${k==="30"?"selected":""}>${v}</option>`).join("")}</select></label>
   </div>
   <h3>What you teach</h3>
   <fieldset class="tset"><legend>Grades</legend>${["3","4","5","6","7","8","9"].map(g=>chk("grades",g,g==="9"?"Algebra I":`Grade ${g}`)).join("")}</fieldset>
   <fieldset class="tset"><legend>Math areas you’re strongest in</legend>${Object.entries(T_AREAS).map(([k,v])=>chk("areas",k,v)).join("")}</fieldset>
   <h3>License and experience</h3>
   <div class="grid">
    <label class="f">Teaching license<select name="license">${Object.entries(T_LIC).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select></label>
    <label class="f">License type or endorsement (optional)<input name="licenseNote" maxlength="120" placeholder="e.g. Elementary K–6, Math 7–12"></label>
    <label class="f">Years teaching or tutoring<input name="years" type="number" min="0" max="60" value="0"></label>
    <label class="f">Résumé (PDF or Word, under 2 MB, optional)<input name="file" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></label>
   </div>
   <label class="f">Tell us about your experience with elementary math (optional)<textarea name="about" maxlength="1200" rows="4"></textarea></label>
   <h3>Rate and availability</h3>
   <div class="grid">
    <label class="f">Your hourly rate (USD)<input name="rate" type="number" min="0" max="500" placeholder="e.g. 35"></label>
    <label class="f">Best times (optional)<input name="times" maxlength="120" placeholder="e.g. after 3:30, or during the school day"></label>
   </div>
   <fieldset class="tset"><legend>Days you’re available</legend>${T_DAYS.map(d=>chk("days",d,d)).join("")}</fieldset>
   <input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
   <label class="tchk"><input type="checkbox" name="bgConsent"> I agree to a background check before working with students. (Schools require one. We’ll send the official consent form separately.)</label>
   <label class="tchk"><input type="checkbox" name="agree"> The information above is true. I understand it is only used to review my application and match me with schools.</label>
   <p class="muted" style="font-size:.85rem">Please don’t include your Social Security number or other ID numbers here. Those are only collected on the official background check form.</p>
   <p class="err" id="t-err" role="alert"></p>
   <div class="row"><button type="submit">Send my application</button></div>
  </form>`;
  document.getElementById("t-back").onclick=()=>{S.screen="landing";render()};
  document.getElementById("tf").onsubmit=async e=>{e.preventDefault();const f=e.target,fd=new FormData(f),err=document.getElementById("t-err");err.textContent="";
    const b={};for(const k of ["name","email","phone","role","county","city","travel","license","licenseNote","years","about","rate","times","website"])b[k]=fd.get(k)||"";
    for(const k of ["grades","areas","days"])b[k]=fd.getAll(k);b.bgConsent=!!fd.get("bgConsent");b.agree=!!fd.get("agree");
    const file=f.file.files[0];
    if(file){if(file.size>2*1024*1024){err.textContent="Your résumé file is too big. Please keep it under 2 MB.";return}
      const data=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(",")[1]||"");r.onerror=no;r.readAsDataURL(file)});
      b.file={name:file.name,type:file.type||(/\.pdf$/i.test(file.name)?"application/pdf":"application/msword"),data}}
    busy(e.submitter,"Sending…");
    try{await api("tutorApply",b);S.tDone=true;render()}catch(er){err.textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Send my application"}};
}
SCREENS.tutorApply=tutorApply;

