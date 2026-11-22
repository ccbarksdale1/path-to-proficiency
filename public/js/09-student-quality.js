/* Path to Proficiency · Student side extras and question quality checks.
   Loaded in order by index.html as plain scripts that share one global scope. */
/* ---------- student side ---------- */
function xtOpen(s){return xtOf(s).filter(x=>!xtRes(s,x.id)&&new Date(x.d+"T23:59:00").getTime()>=Date.now()-(x.qs?7:2)*864e5&&SKILLS.some(k=>k.id===x.k&&genOf(k)))}
function xtHomeCard(s){const L=xtOpen(s);if(!L.length)return "";const x=L[L.length-1],k=SKILLS.find(k=>k.id===x.k);
  if(x.qs)return `<div class="card xt-card"><div class="top"><h2>📝 ${t("Test")}: ${esc(x.name||"")}</h2><span class="pill gold">${x.qs.length} ${t("questions")}</span></div>
   <p class="muted">${t("Your teacher wants to see what you know. Do it on your own: no Scout, no hints. You’ll see your score at the end.")}</p>
   <div class="row"><button id="xt-go" data-xt="${x.id}">${t("Start my test")}</button></div></div>`;
return `<div class="card xt-card"><div class="top"><h2>🎟️ ${t(x.mis?"Quick check":"Exit ticket")}</h2><span class="pill gold">${x.n} ${t("questions")}</span></div>
   <p><b>${esc(k.name)}</b> <span class="muted">· ${esc(k.std)}</span></p>
   <p class="muted">${t("Your teacher wants to see what you know. Do it on your own: no Scout, no hints. You’ll see your score at the end.")}</p>
   <div class="row"><button id="xt-go" data-xt="${x.id}">${t("Start my exit ticket")}</button></div></div>`}
function wireXtHome(){const b=document.getElementById("xt-go");if(!b)return;b.onclick=()=>{const s=S.student,x=xtOf(s).find(y=>y.id===b.dataset.xt),k=SKILLS.find(k=>k.id===x.k),g=genOf(k);
  if(x.qs){const qs=x.qs.map(id=>{let q=null;try{q=getQ(id)}catch(e){}return q&&["mc","multi","input"].includes(q.type)?{id,q:viewQ(q),k:(SKILLS.find(s=>s.id===q.skill)||k).id}:null}).filter(Boolean);
    if(!qs.length){alert("This test could not load. Tell your teacher.");return}
    S.xt={x,k:{id:k.id,std:x.name||k.std,name:x.name||""},custom:true,qs,i:0,sel:{},t0:Date.now(),done:false};S.screen="xt";stopPlay&&stopPlay();render();window.scrollTo(0,0);return}
  const qs=[];let tries=0;
  if(dokMixOn()&&!x.mis&&x.n>=5){const ea=eaIdFor(k);if(ea)qs.push({id:ea,q:viewQ(getQ(ea))})} // one Think deeper question when the class matches the state test mix
  while(qs.length<x.n&&tries++<40){const id=genId(g),q=getQ(id);if(q&&["mc","multi","input"].includes(q.type)&&!qs.some(y=>JSON.stringify(y.q.parts)===JSON.stringify(q.parts)))qs.push({id,q:viewQ(q)})}
  if(!qs.length){alert("This exit ticket could not load. Tell your teacher.");return}
  S.xt={x,k,qs,i:0,sel:{},t0:Date.now(),done:false};S.screen="xt";stopPlay&&stopPlay();render();window.scrollTo(0,0)}}
function xtScreen(){const X=S.xt;if(!X){S.screen="home";render();return}if(X.done)return xtResults();
  const it=X.qs[X.i],q=it.q,n=X.qs.length,cur=X.sel[X.i]||[];
  app.innerHTML=header(`${langToggle()}<button class="ghost" id="xt-back">${t("Leave")}</button>`)+`
   <div class="card xt-q"><div class="row" style="justify-content:space-between"><span class="label"><span class="pill ${X.chal?"purple":"gold"}">${t(X.chal?"Challenge":X.custom?"Test":"Exit ticket")}</span>${q._ea?` <span class="pill purple">${t("Think deeper")}</span>`:""} ${esc(X.k.std)} · ${t("Question")} ${X.i+1} ${t("of")} ${n}</span>${sayBtn("xt-say",t("🔊 Read to me"))}</div>
    <div class="notebook">${bodyHTML(q,null,"")}</div>
    ${q.type==="input"?`<label class="f">${t("Your answer")}<input id="xt-num" inputmode="decimal" autocomplete="off" value="${esc(cur[0]||"")}" style="max-width:220px"></label>`
     :`<div class="choices${q.choices.some(c=>typeof c==="string"&&c.length>40)||q.choices.some(c=>c.table)?" one":""}">${q.choices.map((c,j)=>{const l=L[j],on=cur.includes(l);return `<button class="choice${on?" sel":""}" data-l="${l}" aria-pressed="${on}"><b class="l">${l}</b><div>${choiceInner(c)}</div></button>`}).join("")}</div>${q.type==="multi"?`<p class="muted small">${t("Pick two answers.")}</p>`:""}`}
    <div class="row"><button class="ghost" id="xt-prev" ${X.i===0?"disabled":""}>← ${t("Back")}</button>
     <button id="xt-next">${X.i<n-1?t("Next")+" →":t("Finish and see my score")}</button></div>
    <p class="muted small">${t(X.chal?"Challenges are on your own. Scout is off.":"Exit tickets are on your own. Scout is off.")}</p></div>`;
  wireLang();const ok=()=>{const v=X.sel[X.i]||[];return q.type==="multi"?v.length===2:v.length&&String(v[0]).trim()!==""};
  document.getElementById("xt-back").onclick=()=>{if(confirm(t(X.chal?"Leave the challenge? Your answers will not be saved.":"Leave the exit ticket? Your answers will not be saved.")))(S.xt=null,S.screen="home",render())};
  app.querySelectorAll(".xt-q .choice").forEach(b=>b.onclick=()=>{const l=b.dataset.l;let v=X.sel[X.i]||[];if(q.type==="mc")v=[l];else v=v.includes(l)?v.filter(x=>x!==l):[...v,l].slice(-2);X.sel[X.i]=v;render()});
  const num=document.getElementById("xt-num");if(num){num.oninput=()=>{X.sel[X.i]=[num.value.trim()]};num.focus()}
  const pv=document.getElementById("xt-prev");if(pv)pv.onclick=()=>{X.i--;render()};
  document.getElementById("xt-next").onclick=()=>{if(!ok()){alert(t(q.type==="multi"?"Pick two answers first.":"Answer this one first."));return}if(X.i<n-1){X.i++;render()}else(X.chal?chalFinish():xtFinish())};
  const sy=document.getElementById("xt-say");if(sy)sy.onclick=()=>{stopPlay();speak(qSpeech(q))}}
function xtRight(q,v){v=v||[];if(q.type==="mc")return v[0]===q.ans;if(q.type==="multi")return v.length===2&&q.ans.every(a=>v.includes(a));return Number(String(v[0]).replace(/,/g,""))===Number(q.ans)}
function xtFinish(){const X=S.xt,p=S.student.prog,ms=(Date.now()-X.t0)/X.qs.length;let ok=0,same=0;const miss=[];
  const by={},qr=[];
  X.qs.forEach((it,j)=>{const r=xtRight(it.q,X.sel[j]),kid=it.k||X.k.id;if(r)ok++;track(p,kid,r,ms);dokRecord(p,it.q,r);qr.push(r?1:0);const y=by[kid]||(by[kid]=[0,0]);y[1]++;if(r)y[0]++;
    const lg=p.log[it.id]||(p.log[it.id]={tries:0,right:0,first:null});lg.tries++;if(r)lg.right++;if(lg.first===null)lg.first=r;
    if(!r){const q=it.q,v=X.sel[j]||[],from=q._from||{},pick=q.type==="mc"?from[v[0]]||v[0]:q.type==="multi"?v.filter(l=>!q.ans.includes(l)).map(l=>from[l]||l).sort().join(""):String(Number(String(v[0]).replace(/,/g,"")));
      (p.miss=p.miss||[]).push({q:it.id,k:kid,p:pick,t:Date.now()});miss.push(it.id);if(misSame(it.id,kid,pick,X.x.mis))same++}});
  if(p.miss&&p.miss.length>80)p.miss.splice(0,p.miss.length-80);
  (p.xtr=p.xtr||{})[X.x.id]={t:Date.now(),ok,n:X.qs.length,k:X.k.id,...(X.x.mis?{same}:{}),...(X.custom?{by,q:qr}:{})};
  const ks=Object.keys(p.xtr);if(ks.length>XT_MAX)ks.sort((a,b)=>p.xtr[a].t-p.xtr[b].t).slice(0,ks.length-XT_MAX).forEach(id=>delete p.xtr[id]);
  p.stars=(p.stars||0)+ok;p.last=Date.now();X.done=true;X.ok=ok;save();render();window.scrollTo(0,0)}
function xtResults(){const X=S.xt,n=X.qs.length;
  app.innerHTML=header(`${langToggle()}`)+`<div class="card pop" style="text-align:center;align-items:center"><span class="label">${t(X.chal?"Challenge done!":X.custom?"Test":"Exit ticket")} · ${esc(X.k.std)}</span>
    <p class="ps-big"><b>${X.ok}</b> ${t("of")} ${n} ${t("correct")}</p><p>${X.chal?(X.ok===n?t("Every one right! You’re ready for more."):t("Good stretch. This is next year’s math, so missing some is normal.")):X.ok===n?t("Every one right! Great work."):X.ok/n>=XT_PASS?t("Nice work. Look at the one you missed below."):t("Thanks for showing what you know. Your teacher will help with this tomorrow.")} +${X.chal?X.ok*2:X.ok} ★</p>
    <button id="xt-home">${t("Back to my trail")}</button></div>
   <div class="card"><h2>${t("Review")}</h2>${X.qs.map((it,j)=>{const r=xtRight(it.q,X.sel[j]);return `<div class="xt-rev ${r?"ok":"no"}"><p><span class="lb-mk ${r?"ok":"no"}">${r?"✓":"✗"}</span> <b>${t("Question")} ${j+1}</b> · ${t("Your answer")}: ${esc((X.sel[j]||[]).join(", ")||"—")}${r?"":` · ${t("Right answer")}: <b>${esc(ansText(it.q))}</b>`}</p>${r?"":reviewHTML(it.q,t("Question")+" "+(j+1))+(X.chal?"":countBox("x"+j))}</div>`}).join("")}</div>`;
  wireLang();wireCount(key=>{const j=+key.slice(1),it=X.qs[j];return it&&{qid:it.id,q:it.q,sel:X.sel[j],k:X.k.id,kind:"xt",xid:X.x.id}});document.getElementById("xt-home").onclick=()=>{S.xt=null;S.screen="home";render()}}
SCREENS.xt=xtScreen;

/* ================= Teacher next-action list and weekly plan (F06) ================= */
function nextActions(){const real=realStudents(),now=Date.now(),wk=now-7*864e5,A=[];if(!real.length)return A;
  const lastT=s=>s.prog.last||0,idle=real.filter(s=>curSkill(s)&&lastT(s)<wk);
  /* 1. exit ticket results that point at tomorrow's groups */
  const low={};real.forEach(s=>{const L=xtLatest(s);if(L&&!L.pass)(low[L.k.id]=low[L.k.id]||{k:L.k,who:[]}).who.push(s.name)});
  Object.values(low).sort((a,b)=>b.who.length-a.who.length).forEach(x=>A.push({p:1,t:`Reteach ${x.k.std} (${x.k.name.toLowerCase()})`,d:`${x.who.join(", ")} got under two thirds on the exit ticket. Make groups puts them together.`,tab:"plan",b:"Make groups"}));
  /* 2. a standard many students are stuck on */
  const stuck={};real.forEach(s=>{const k=curSkill(s);if(!k)return;const rec=(s.prog.recent||[]).filter(r=>r.k===k.id).slice(-10);if(rec.length>=8&&rec.filter(r=>r.ok).length/rec.length<.6)(stuck[k.id]=stuck[k.id]||{k,who:[]}).who.push(s.name)});
  Object.values(stuck).filter(x=>x.who.length>=2&&!low[x.k.id]).sort((a,b)=>b.who.length-a.who.length).slice(0,2).forEach(x=>A.push({p:2,t:`Pull a small group on ${x.k.std}`,d:`${x.who.length} students are under 60% on their last 10 tries: ${x.who.join(", ")}.`,tab:"why",b:"See their mistakes"}));
  /* 3. standards that slipped after mastery */
  const ref={};real.forEach(s=>SKILLS.forEach(k=>{if(evLevel(s,k)==="refresh")(ref[k.id]=ref[k.id]||{k,who:[]}).who.push(s.name)}));
  Object.values(ref).sort((a,b)=>b.who.length-a.who.length).slice(0,2).forEach(x=>A.push({p:3,t:`Revisit ${x.k.std}: it slipped`,d:`${x.who.join(", ")} mastered it, then missed two check-ups. A quick review brings it back.`,tab:"plan",b:"Plan a group"}));
  /* 4. plan students with no teacher session this week */
  const ipNo=real.filter(s=>ipActive(s)&&!sesSum(s.raw||s,wk).n);
  if(ipNo.length)A.push({p:2,t:`Meet with ${ipNo.length} plan student${ipNo.length===1?"":"s"} this week`,d:`No teacher session logged in 7 days: ${ipNo.map(s=>s.name).join(", ")}.`,tab:"ip",b:"Open plans"});
  /* 5. nobody has practiced in a week */
  if(idle.length)A.push({p:3,t:`Check in with ${idle.length} student${idle.length===1?"":"s"} who stopped practicing`,d:`No practice in 7+ days: ${idle.slice(0,8).map(s=>s.name).join(", ")}${idle.length>8?"…":""}.`,tab:"setup",b:"See students"});
  /* 6. no exit ticket lately */
  const lastXt=classTickets()[0];if(!lastXt||now-new Date(lastXt.d+"T12:00:00").getTime()>3*864e5){const c={};real.forEach(s=>{const k=curSkill(s);if(k)c[k.id]=(c[k.id]||0)+1});const id=Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0],k=SKILLS.find(k=>k.id===id);
    if(k)A.push({p:4,t:`Give an exit ticket on ${k.std}`,d:`${c[id]} students are working on it now. Tomorrow’s groups get sharper with fresh results.`,tab:"plan",b:"Give one"})}
  /* 6a. a mistake check confirmed the same mistake */
  {const m={};real.forEach(s=>xtOf(s.raw||s).filter(x=>x.mis).forEach(x=>{const r=xtRes(s,x.id);if(r&&(r.same||0)>=1&&r.t>wk)(m[x.id]=m[x.id]||{x,who:[]}).who.push(s.name)}));
   Object.values(m).slice(0,2).forEach(o=>A.push({p:1,t:`Same mistake still there on ${o.x.std}`,d:`${o.who.join(", ")} made “${o.x.mx||"the same mistake"}” again on the check. Reteach that idea directly.`,tab:"plan",b:"Plan a group"}))}
  /* 6b. sure but wrong: a misconception, not a slip */
  confAlerts().slice(0,2).forEach(x=>A.push({p:2,t:`Misconception check on ${x.k.std}`,d:`${x.who.join(", ")} said they were sure and got it wrong more than once. Ask them to explain their thinking.`,tab:"why",b:"See their mistakes"}));
  /* 6c. the class is weaker on Think deeper (DOK 3) */
  {const D=dokClass(),a=D[2].n?D[2].ok/D[2].n:null,b=D[3].n>=15?D[3].ok/D[3].n:null;if(b!=null&&a!=null&&a-b>=.15)A.push({p:3,t:`Practice “Think deeper” (DOK 3) as a class`,d:`The class gets ${Math.round(b*100)}% of DOK 3 questions right vs ${Math.round(a*100)}% of DOK 2. Model one “find the mistake” question out loud.`,tab:"plan",b:"Plan a group"})}
  /* 7. ready to celebrate */
  const ver=real.filter(s=>SKILLS.some(k=>{const sk=s.prog.skills[k.id],e=evOf(sk);return e.v&&now-e.v<7*864e5}));
  if(ver.length)A.push({p:5,t:`Celebrate: ${ver.length} student${ver.length===1?"":"s"} verified a standard this week`,d:ver.slice(0,10).map(s=>s.name).join(", ")+(ver.length>10?"…":"")+".",tab:"badges",b:"Give a badge"});
  return A.sort((a,b)=>a.p-b.p)}
function nextCard(){const A=nextActions();if(!A.length)return "";
  return `<div class="card next-card"><div class="top"><h2>Next steps</h2><span class="muted small">Built from today’s data</span></div>
   <ol class="next-list">${A.slice(0,6).map(a=>`<li><div><b>${esc(a.t)}</b><br><span class="muted">${esc(a.d)}</span></div><button class="ghost small" data-tab="${a.tab}">${esc(a.b)}</button></li>`).join("")}</ol></div>`}
/* weekly plan: the teacher-table focus for each day, neediest standard first, Friday for exit tickets and check-ups */
function weekPlan(){const real=realStudents(),need={};
  real.forEach(s=>{const L=xtLatest(s,7),k=L&&!L.pass?L.k:curSkill(s);if(!k)return;const rec=(s.prog.recent||[]).filter(r=>r.k===k.id).slice(-10),acc=rec.length?rec.filter(r=>r.ok).length/rec.length:.5;
    const o=need[k.id]||(need[k.id]={k,who:[],w:0});o.who.push(s);o.w+=1+(1-acc)+(L&&!L.pass?1:0)+(ipActive(s)?.5:0)});
  const list=Object.values(need).sort((a,b)=>b.w-a.w);return list}
function weekCard(){const list=weekPlan();if(!list.length)return "";const days=["Monday","Tuesday","Wednesday","Thursday"],mon=(()=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d})();
  const taught=new Set(classSessions().filter(x=>new Date(x.d+"T12:00:00")>=mon).map(x=>x.std));
  const plan=days.map((d,i)=>list[i%Math.max(1,Math.min(list.length,4))]);
  const dt=i=>{const d=new Date(mon);d.setDate(mon.getDate()+i);return d.toLocaleDateString(undefined,{month:"short",day:"numeric"})};
  return `<div class="card" id="wk-plan"><div class="top"><h2>This week’s plan</h2><button class="ghost small" id="wk-print">Print</button></div>
   <p class="muted">Teacher-table focus for each day, starting with the standard the most students need (exit-ticket misses and plan students count extra). Friday is for an exit ticket and check-ups. It changes as students practice.</p>
   <div class="tablewrap"><table class="roster"><thead><tr><th>Day</th><th>Teacher table</th><th>Who (start with)</th><th>Everyone else</th></tr></thead><tbody>
   ${plan.map((x,i)=>`<tr><td><b>${days[i]}</b><br><span class="muted small">${dt(i)}</span></td><td><b>${esc(x.k.std)}</b> ${esc(x.k.name)}${taught.has(x.k.std)?' <span class="pill go">taught ✓</span>':""}${LIBC[x.k.std]&&LIBC[x.k.std].do?`<br><span class="muted small">${esc(LIBC[x.k.std].do[0]||"")}</span>`:""}</td><td>${x.who.slice().sort((a,b)=>(a.prog.last||0)-(b.prog.last||0)).slice(0,6).map(s=>esc(s.name)).join(", ")}${x.who.length>6?` +${x.who.length-6}`:""}</td><td class="muted">Path to Proficiency trail, fluency</td></tr>`).join("")}
   <tr><td><b>Friday</b><br><span class="muted small">${dt(4)}</span></td><td><b>Exit ticket</b> on ${esc(list[0].k.std)}, then check-ups</td><td>Everyone</td><td class="muted">Next week’s groups use the results</td></tr></tbody></table></div></div>`}
function wireWeek(){const p=document.getElementById("wk-print");if(p)p.onclick=()=>printEl("wk-plan",`This week · ${CUR.cls.name}`)}
/* ================= "My answer should count" (S15) and question quality checks (S17) =================
   After a wrong answer a student can ask the teacher to look again. It goes to the teacher's Problem
   reports with the student's answer and the answer key. "Give credit" turns that try into a right answer
   in the student's record (server: applyCredit), +1 star, and the student sees a note on their home page. */
const pickText=(q,sel)=>{sel=sel||[];if(q.type==="input")return String(sel[0]??"");if(!q.choices)return sel.join(", ");
  return sel.map(l=>{const c=q.choices[L.indexOf(l)];return l+". "+(typeof c==="string"?c:"(picture)")}).join("; ")};
function countBox(key){const C=S.cnt;if(C&&C.key===key&&C.sent)return `<p class="fb go" role="status"><b>${t("Sent! Your teacher will look at your answer.")}</b></p>`;
  if(!C||C.key!==key||!C.open)return `<button class="ghost small cnt-btn" data-cnt="${esc(key)}">🙋 ${t("I think my answer should count")}</button>`;
  return `<div class="card rep-box"><h3>${t("Ask your teacher to look again")}</h3><p class="muted small">${t("Tell your teacher why your answer works. They will check it.")}</p>
   <label class="f">${t("Why it should count (optional)")}<textarea id="cnt-note" rows="2" maxlength="300"></textarea></label>
   <div class="row"><button id="cnt-send">${t("Send to my teacher")}</button><button class="ghost" id="cnt-x">${t("Cancel")}</button></div><p class="err" id="cnt-err" role="alert"></p></div>`}
/* ctx(key) → {qid,q,sel,k,kind,xid} */
function wireCount(ctx){app.querySelectorAll("[data-cnt]").forEach(b=>b.onclick=()=>{S.cnt={key:b.dataset.cnt,open:true};render()});
  const x=document.getElementById("cnt-x");if(x)x.onclick=()=>{S.cnt=null;render()};
  const s=document.getElementById("cnt-send");if(s)s.onclick=async()=>{const c=ctx(S.cnt.key);if(!c)return;busy(s,"…");const k=SKILLS.find(y=>y.id===c.k);
    try{if(!S.demo)await api("reportAdd",{qid:c.qid,std:k&&k.std,testId:TESTID,reason:"count",note:document.getElementById("cnt-note").value,q:c.q,pick:pickText(c.q,c.sel),kind:c.kind,xid:c.xid||"",k:c.k,classId:CUR?.cls?.id});
      S.cnt={...S.cnt,open:false,sent:true};render()}catch(er){document.getElementById("cnt-err").textContent=er.message;s.disabled=false;s.textContent=t("Send to my teacher")}}}
/* home: credit the teacher gave since the student last looked */
function creditNotice(p){const L=Array.isArray(p.credit)?p.credit:[],n=L.length-(p.creditSeen||0);if(n<=0)return "";p.creditSeen=L.length;setTimeout(()=>{try{save()}catch(e){}},0);
  return `<div class="fb go" role="status"><p>🙋 <b>${t("Your teacher checked your answer and gave you credit!")}</b> +${n} ★</p></div>`}
/* same rule as the server, for the sample school */
function applyCreditLocal(tp,c){const lg=tp.log&&tp.log[c.q];if(lg&&lg.right<lg.tries){lg.right++;if(lg.first===false&&lg.tries===1)lg.first=true}
  const rc=(tp.recent||[]).slice().reverse().find(r=>r.q===c.q&&!r.ok);if(rc)rc.ok=true;
  if(Array.isArray(tp.miss)){const i=tp.miss.map(m=>m.q).lastIndexOf(c.q);if(i>=0)tp.miss.splice(i,1)}
  if(c.kind==="xt"&&tp.xtr&&tp.xtr[c.xid]){const x=tp.xtr[c.xid];x.ok=Math.min(x.n||0,(x.ok||0)+1)}
  tp.stars=(+tp.stars||0)+1;tp.credit=[...(tp.credit||[]),{...c,t:Date.now()}].slice(-50)}
function countReportHTML(r){const q=r.q&&r.q.parts?{keys:[],steps:[],why:{},...r.q}:null;
  return `<p><b>Their answer:</b> ${esc(r.pick||"—")} · <b>Answer key:</b> ${q?esc(q.choices?pickText(q,Array.isArray(q.ans)?q.ans:[q.ans]):ansText(q)):"—"}${r.kind==="xt"?` · <span class="pill gold">Exit ticket</span>`:r.kind==="check"?` · <span class="pill purple">Check-up</span>`:""}</p>`}

/* ---------- question quality: questions or question makers far harder than they should be ---------- */
function qualityFlags(){const real=realStudents(),byQ={},byG={};
  real.forEach(s=>Object.entries(s.prog.log||{}).forEach(([qid,l])=>{if(!l||!l.tries)return;
    if(qid.startsWith("~")){const g=qid.split("~")[1],o=byG[g]||(byG[g]={g,t:0,r:0,f:0,fr:0,who:new Set()});o.t+=l.tries;o.r+=l.right;if(l.first!==null){o.f++;if(l.first)o.fr++}o.who.add(s.id)}
    else{const o=byQ[qid]||(byQ[qid]={qid,t:0,r:0,f:0,fr:0,who:new Set()});o.t+=l.tries;o.r+=l.right;if(l.first!==null){o.f++;if(l.first)o.fr++}o.who.add(s.id)}}));
  const kOfG=g=>SKILLS.find(k=>genOf(k)===g),kOfQ=id=>SKILLS.find(k=>k.twins.includes(id)||k.qs.map(n=>"q"+n).includes(id));
  const out=[];
  Object.values(byQ).forEach(o=>{if(o.who.size>=3&&o.f>=3&&o.fr/o.f<.25)out.push({type:"q",id:o.qid,k:kOfQ(o.qid),rate:o.fr/o.f,n:o.f,who:o.who.size})});
  Object.values(byG).forEach(o=>{if(o.who.size>=4&&o.f>=20&&o.fr/o.f<.35)out.push({type:"g",id:o.g,k:kOfG(o.g),rate:o.fr/o.f,n:o.f,who:o.who.size})});
  return out.sort((a,b)=>a.rate-b.rate).slice(0,12)}
function qualityCard(){const F=qualityFlags();
  return `<div class="card"><div class="top"><h2>Questions to double-check</h2><span class="pill ${F.length?"gold":"go"}">${F.length} flagged</span></div>
   <p class="muted">Flagged when far fewer students get it right on the first try than expected (under 25% for one question with 3+ students, under 35% for an app question maker with 20+ tries). It may be a hard standard, not a bad question, so take a look before you hide anything.</p>
   ${F.length?`<div class="tablewrap"><table class="roster"><thead><tr><th>Question</th><th>Standard</th><th>Right on first try</th><th>Students</th><th></th></tr></thead><tbody>
   ${F.map((f,i)=>`<tr><td>${f.type==="g"?"App-made questions (all versions)":esc(qLabel(f.id))}</td><td>${f.k?`<b>${esc(f.k.std)}</b> ${esc(f.k.name)}`:"—"}</td><td>${Math.round(f.rate*100)}% <span class="muted small">of ${f.n}</span></td><td>${f.who}</td>
     <td><div class="row" style="gap:6px;flex-wrap:nowrap"><button class="ghost small" style="white-space:nowrap" data-qfv="${i}">${S.qfv===i?"Hide":"See it"}</button><button class="ghost small" style="white-space:nowrap" data-qfr="${i}">🚩 Report</button></div></td></tr>
     ${S.qfv===i?`<tr><td colspan="5">${(()=>{try{const q=viewQ(getQ(f.type==="g"?genId(f.id):f.id));return q?reviewHTML(q,"Flagged question"):""}catch(e){return ""}})()}</td></tr>`:""}`).join("")}</tbody></table></div>`:`<p class="muted">Nothing looks off right now.</p>`}
   <p class="muted" id="qf-msg" role="status"></p></div>`}
function wireQuality(){const F=qualityFlags();
  app.querySelectorAll("[data-qfv]").forEach(b=>b.onclick=()=>{const i=+b.dataset.qfv;S.qfv=S.qfv===i?null:i;render()});
  app.querySelectorAll("[data-qfr]").forEach(b=>b.onclick=async()=>{const f=F[+b.dataset.qfr];if(!f)return;busy(b,"…");
    try{const qid=f.type==="g"?genId(f.id):f.id,q=viewQ(getQ(qid));await api("reportAdd",{qid,std:f.k&&f.k.std,testId:TESTID,reason:"quality",note:`Only ${Math.round(f.rate*100)}% right on the first try (${f.n} tries, ${f.who} students).`,q,classId:CUR.cls.id});b.textContent="Reported ✓"}
    catch(e){document.getElementById("qf-msg").textContent=e.message;b.disabled=false;b.textContent="🚩 Report"}})}

/* ================= Test-skill steps and passage sets in teacher reports =================
   The app already saves: prog.pf (Find the proof), prog.ro (Rule it out), prog.plan (Plan it), each {n, ok},
   and prog.psets (passage sets: title, score, standards). */
const pctOf=x=>x&&x.n?Math.round(x.ok/x.n*100):null;
function stepStats(s){const p=s.prog||{},ps=(p.psets||[]),pn=ps.reduce((a,x)=>a+x.n,0),pok=ps.reduce((a,x)=>a+x.ok,0);
  return {pf:p.pf||null,ro:p.ro||null,plan:p.plan||null,ps:ps.length?{sets:ps.length,n:pn,ok:pok,last:ps[ps.length-1]}:null}}
function stepCell(x){const v=pctOf(x);return v==null?'<span class="muted">—</span>':`${v}% <span class="muted small">of ${x.n}</span>`}
function stepsCard(){const real=realStudents();if(!real.length)return "";const R=real.map(s=>({s,x:stepStats(s)}));
  R.forEach(r=>{r.c=confStats(r.s);r.ch=r.s.prog.chal||[];r.dk=r.s.prog.dok||null});
  const has={pf:R.some(r=>r.x.pf&&r.x.pf.n),ro:R.some(r=>r.x.ro&&r.x.ro.n),plan:R.some(r=>r.x.plan&&r.x.plan.n),ps:R.some(r=>r.x.ps),cf:R.some(r=>r.c.n),ch:R.some(r=>r.ch.length),dk:R.some(r=>r.dk)};
  if(!Object.values(has).some(Boolean))return "";
  const cols=[has.ps&&["Passage sets",r=>r.x.ps?`${r.x.ps.sets} set${r.x.ps.sets===1?"":"s"} · ${Math.round(r.x.ps.ok/r.x.ps.n*100)}%<br><span class="muted small">last: ${esc(r.x.ps.last.title)} ${r.x.ps.last.ok}/${r.x.ps.last.n}</span>`:'<span class="muted">—</span>'],
    has.pf&&["Find the proof",r=>stepCell(r.x.pf)],has.ro&&["Rule it out",r=>stepCell(r.x.ro)],has.plan&&["Plan it",r=>stepCell(r.x.plan)],
    has.dk&&["DOK 1 · 2 · 3 right (estimated)",r=>r.dk?dokCell(r.s):'<span class="muted">—</span>'],
    has.cf&&["Confidence (sure but wrong · guessed right)",r=>r.c.n?`${r.c.sw?`<b>${r.c.sw}</b>`:0} · ${r.c.gr} <span class="muted small">of ${r.c.n}</span>`:'<span class="muted">—</span>'],
    has.ch&&["Challenges (next grade)",r=>r.ch.length?`${r.ch.length} · ${Math.round(r.ch.reduce((a,c)=>a+c.ok,0)/r.ch.reduce((a,c)=>a+c.n,0)*100)}%<br><span class="muted small">last: ${esc(r.ch[r.ch.length-1].std)}</span>`:'<span class="muted">—</span>']].filter(Boolean);
  const avg=k=>{const L=R.map(r=>r.x[k]).filter(x=>x&&x.n),n=L.reduce((a,x)=>a+x.n,0);return n?Math.round(L.reduce((a,x)=>a+x.ok,0)/n*100):null};
  return `<div class="card"><div class="top"><h2>DOK, test-taking steps, confidence, and challenges</h2><span class="muted small">${[has.pf&&`Find the proof ${avg("pf")}%`,has.ro&&`Rule it out ${avg("ro")}%`,has.plan&&`Plan it ${avg("plan")}%`].filter(Boolean).join(" · ")}</span></div>
   <p class="muted">${has.pf||has.ro||has.plan?"How often each student gets the strategy step right before answering. A low step score with good answers can mean guessing; a high step score with low answers means the strategy is there and the content needs work. ":""}${has.ps?"Passage sets are state-test style. ":""}${has.cf?"Confidence: about 1 in 15 practice questions asks how sure they are; <b>sure but wrong</b> points at a misconception, <b>guessed right</b> at luck. ":""}${has.ch?"Challenges are next-grade questions unlocked by verified standards. ":""}${has.dk?"DOK: Think deeper (DOK 3) questions ask students to find someone’s mistake; DOK 1 and 2 are estimated from each question (bare computation vs. words, pictures, or two steps).":""}</p>
   <div class="tablewrap"><table class="roster"><thead><tr><th>Student</th>${cols.map(c=>`<th>${c[0]}</th>`).join("")}</tr></thead><tbody>
   ${R.sort((a,b)=>a.s.name.localeCompare(b.s.name)).map(r=>`<tr><td><b>${esc(r.s.name)}</b></td>${cols.map(c=>`<td>${c[1](r)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`}
function stepsMstats(s){const x=stepStats(s),out=[];if(x.ps)out.push(["Passage sets",`${x.ps.sets} · ${Math.round(x.ps.ok/x.ps.n*100)}%`]);
  [1,2,3].forEach(d=>{const v=dokPct(s.prog,d);if(v!=null)out.push([`DOK ${d}${d===3?" (Think deeper)":""}`,v+"%"])});
  if(x.pf&&x.pf.n)out.push(["Find the proof",pctOf(x.pf)+"%"]);if(x.ro&&x.ro.n)out.push(["Rule it out",pctOf(x.ro)+"%"]);if(x.plan&&x.plan.n)out.push(["Plan it",pctOf(x.plan)+"%"]);return out}

/* Spanish for the new student screens */
Object.assign(ES,{
 "Check-ups":"Repasos de control","waiting":"esperando","Start my check-ups":"Empezar mis repasos","Check-up":"Control","Check-up: on your own":"Control: tú solo",
 "Show you can still do standards you mastered, all on your own. No Scout on check-ups.":"Muestra que todavía puedes hacer lo que dominaste, tú solo. Scout no ayuda en los controles.",
 "Check-up: show you can do this one on your own. Scout is off for check-ups.":"Control: muestra que puedes hacerlo tú solo. Scout está apagado en los controles.",
 "Verified! You showed you can do this on your own.":"¡Verificado! Mostraste que puedes hacerlo tú solo.","You still know it weeks later. That’s locked in!":"Todavía lo sabes semanas después. ¡Lo tienes asegurado!",
 "Right, on your own! One more check-up on this one to verify it.":"¡Correcto, tú solo! Un control más para verificarlo.","Locked in":"Asegurado","Verified":"Verificado",
 "Exit ticket":"Boleto de salida","questions":"preguntas","Start my exit ticket":"Empezar mi boleto de salida","Question":"Pregunta","of":"de","Your answer":"Tu respuesta","Back":"Atrás","Next":"Siguiente","Leave":"Salir",
 "Your teacher wants to see what you know. Do it on your own: no Scout, no hints. You’ll see your score at the end.":"Tu maestro quiere ver lo que sabes. Hazlo tú solo: sin Scout y sin pistas. Verás tu puntaje al final.",
 "Exit tickets are on your own. Scout is off.":"Los boletos de salida son sin ayuda. Scout está apagado.","Finish and see my score":"Terminar y ver mi puntaje","Pick two answers.":"Elige dos respuestas.",
 "Pick two answers first.":"Primero elige dos respuestas.","Answer this one first.":"Primero contesta esta.","Leave the exit ticket? Your answers will not be saved.":"¿Salir del boleto de salida? Tus respuestas no se guardarán.",
 "correct":"correctas","Every one right! Great work.":"¡Todas correctas! Excelente trabajo.","Nice work. Look at the one you missed below.":"Buen trabajo. Mira abajo la que fallaste.",
 "Thanks for showing what you know. Your teacher will help with this tomorrow.":"Gracias por mostrar lo que sabes. Tu maestro te ayudará con esto mañana.","Review":"Repaso","Right answer":"Respuesta correcta","Back to my trail":"Volver a mi camino",
 "I think my answer should count":"Creo que mi respuesta debe contar","Ask your teacher to look again":"Pide a tu maestro que lo revise otra vez","Tell your teacher why your answer works. They will check it.":"Dile a tu maestro por qué tu respuesta funciona. Lo va a revisar.",
 "Why it should count (optional)":"Por qué debe contar (opcional)","Send to my teacher":"Enviar a mi maestro","Cancel":"Cancelar","Sent! Your teacher will look at your answer.":"¡Enviado! Tu maestro revisará tu respuesta.",
 "Your teacher checked your answer and gave you credit!":"¡Tu maestro revisó tu respuesta y te dio el punto!"});
/* ================= S08: Enrichment after verified understanding =================
   Once a standard is Verified (or Retained), the student can try a short Challenge on a next-grade
   standard that builds on it (from the prerequisite map). It runs on the exit-ticket screen: 4 questions,
   on their own, double stars. Results: prog.chal = [{t, std, from, ok, n}] (last 30). It never touches
   the trail, readiness, or the mistake lists, because it is above grade level. */
const CHAL_N=4;
const chalOn=()=>S.demo||!(SB&&SB.cls&&SB.cls.chal===false);
function chalTargets(s){const p=s.prog,G=gradeOf();if(!chalOn()||!p||!p.skills||!(G>=3&&G<=8))return [];const seen=new Set(),out=[];
  SKILLS.forEach(k=>{const lv=evLevel(s,k);if(lv!=="verified"&&lv!=="retained")return;
    Object.entries(PREQ).forEach(([code,pre])=>{if(!Array.isArray(pre)||!pre.includes(k.std)||seen.has(code))return;const L0=LIB.find(x=>x.code===code);
      if(!L0||L0.grade!==G+1||!L0.gen)return;seen.add(code);out.push({from:k,to:{id:L0.gen,std:L0.code,name:L0.name}})})});
  const tried=new Set((p.chal||[]).filter(c=>c.ok/c.n>=.75).map(c=>c.std));return out.filter(x=>!tried.has(x.to.std))}
function chalCard(s){if(S.demo&&!S.student)return "";const T=chalTargets(s);if(!T.length)return "";const pick=T[(s.prog.chal||[]).length%T.length],L=s.prog.chal||[],last=L[L.length-1];
  return `<div class="card chal-card"><div class="top"><h2>⭐ ${t("Challenge zone")}</h2><span class="pill purple">${t("Next grade")}</span></div>
   <p>${t("You verified")} <b>${esc(pick.from.std)}</b>. ${t("Try a challenge that builds on it:")} <b>${esc(pick.to.name)}</b> <span class="muted">(${esc(pick.to.std)})</span>.</p>
   <p class="muted small">${CHAL_N} ${t("questions, on your own. Every right answer is worth 2 stars.")}${last?` ${t("Last challenge")}: ${esc(last.std)} ${last.ok}/${last.n}.`:""}</p>
   <div class="row"><button id="chal-go" data-to="${esc(pick.to.std)}">${t("Take the challenge")}</button></div></div>`}
function wireChal(){const b=document.getElementById("chal-go");if(!b)return;b.onclick=()=>{const s=S.student,T=chalTargets(s).find(x=>x.to.std===b.dataset.to);if(!T)return;
  const qs=[];let tries=0;while(qs.length<CHAL_N&&tries++<40){const id=`~${T.to.id}~${Math.floor(Math.random()*1e9)}`;let q=null;try{q=getQ(id)}catch(e){}
    if(q&&["mc","multi","input"].includes(q.type)&&!qs.some(y=>JSON.stringify(y.q.parts)===JSON.stringify(q.parts)))qs.push({id,q:viewQ(q)})}
  if(!qs.length){alert(t("This challenge could not load. Try another one later."));return}
  S.xt={x:{id:"c"+Date.now().toString(36),n:qs.length},k:T.to,from:T.from,chal:true,qs,i:0,sel:{},t0:Date.now(),done:false};S.screen="xt";stopPlay&&stopPlay();render();window.scrollTo(0,0)}}
function chalFinish(){const X=S.xt,p=S.student.prog;let ok=0;X.qs.forEach((it,j)=>{if(xtRight(it.q,X.sel[j]))ok++});
  (p.chal=p.chal||[]).push({t:Date.now(),std:X.k.std,from:X.from.std,ok,n:X.qs.length});if(p.chal.length>30)p.chal.splice(0,p.chal.length-30);
  p.stars=(p.stars||0)+ok*2;p.last=Date.now();X.done=true;X.ok=ok;save();render();window.scrollTo(0,0)}

/* ================= S16: Occasional confidence checks =================
   About one practice question in fifteen (never check-ups or reviews), the student says how sure they are
   before checking. Sure-but-wrong points at a misconception; guessed-but-right points at luck.
   prog.conf = {sure|kind|guess: {n, ok}}, prog.confR = [{k, c, ok, t}] (last 40). */
const CONF_EVERY=15,CONF_OPTS=[["sure","😀","I’m sure"],["kind","🤔","Kind of sure"],["guess","🤷","I’m guessing"]];
function confPick(){S.conf=null;S.confPending=false;S.confN=(S.confN||0)+1;S.confAsk=!S.rev&&S.confN%CONF_EVERY===0}
function confHTML(){return `<div class="conf card" role="group" aria-label="${t("How sure are you?")}"><b>${t("Before you check: how sure are you?")}</b>
  <div class="row">${CONF_OPTS.map(([v,e,l])=>`<button class="ghost" data-conf="${v}">${e} ${t(l)}</button>`).join("")}</div></div>`}
function confRecord(p,k,ok){if(!S.conf)return;const c=p.conf=p.conf||{},y=c[S.conf]||(c[S.conf]={n:0,ok:0});y.n++;if(ok)y.ok++;
  (p.confR=p.confR||[]).push({k:k.id,c:S.conf,ok:ok?1:0,t:Date.now()});if(p.confR.length>40)p.confR.splice(0,p.confR.length-40)}
function confNote(ok){if(!S.conf)return "";
  if(S.conf==="sure"&&!ok)return `<p class="note">${t("You were sure, but this one tricked you. Read what happened closely: that is how we find a sneaky mistake.")}</p>`;
  if(S.conf==="guess"&&ok)return `<p class="note">${t("You guessed and got it! Watch the breakdown so next time you know it for sure.")}</p>`;
  if(S.conf==="sure"&&ok)return `<p class="note">${t("You were sure, and you were right. Nice!")}</p>`;return ""}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-conf]");if(!b||!S.confPending||!S.q)return;S.conf=b.dataset.conf;S.confPending=false;grade(S.q)});
/* teacher side */
function confStats(s){const c=(s.prog&&s.prog.conf)||{},R=(s.prog&&s.prog.confR)||[];
  return {sw:R.filter(r=>r.c==="sure"&&!r.ok).length,gr:R.filter(r=>r.c==="guess"&&r.ok).length,n:R.length,sure:c.sure||null}}
function confAlerts(){const by={};realStudents().forEach(s=>{const R=(s.prog.confR||[]).filter(r=>r.c==="sure"&&!r.ok),c={};R.forEach(r=>c[r.k]=(c[r.k]||0)+1);
  Object.entries(c).forEach(([kid,n])=>{if(n<2)return;const k=SKILLS.find(x=>x.id===kid);if(k)(by[kid]=by[kid]||{k,who:[]}).who.push(s.name)})});return Object.values(by).sort((a,b)=>b.who.length-a.who.length)}

Object.assign(ES,{"Challenge zone":"Zona de reto","Next grade":"Siguiente grado","You verified":"Verificaste","Try a challenge that builds on it:":"Prueba un reto que se basa en eso:",
 "questions, on your own. Every right answer is worth 2 stars.":"preguntas, tú solo. Cada respuesta correcta vale 2 estrellas.","Last challenge":"Último reto","Take the challenge":"Aceptar el reto",
 "This challenge could not load. Try another one later.":"Este reto no se pudo cargar. Prueba otro más tarde.","Challenge":"Reto",
 "How sure are you?":"¿Qué tan seguro estás?","Before you check: how sure are you?":"Antes de revisar: ¿qué tan seguro estás?","I’m sure":"Estoy seguro","Kind of sure":"Más o menos","I’m guessing":"Estoy adivinando",
 "You were sure, but this one tricked you. Read what happened closely: that is how we find a sneaky mistake.":"Estabas seguro, pero esta te engañó. Lee con cuidado lo que pasó: así encontramos un error escondido.",
 "You guessed and got it! Watch the breakdown so next time you know it for sure.":"¡Adivinaste y acertaste! Mira la explicación para que la próxima vez lo sepas seguro.",
 "You were sure, and you were right. Nice!":"Estabas seguro y tenías razón. ¡Bien!",
 "Challenge done!":"¡Reto terminado!","Challenges are on your own. Scout is off.":"Los retos son sin ayuda. Scout está apagado.","Leave the challenge? Your answers will not be saved.":"¿Salir del reto? Tus respuestas no se guardarán.","Every one right! You’re ready for more.":"¡Todas correctas! Estás listo para más.","Good stretch. This is next year’s math, so missing some is normal.":"Buen esfuerzo. Esto es del próximo año, así que es normal fallar algunas."});
/* ================= S02: Upcoming lesson readiness =================
   The teacher picks the standard they teach next. For each student, the standard's prerequisites on
   this course (PREQ) are checked: Ready = every one practiced or better (or right on the test),
   Shaky = some still learning, Missing = at least one not started or slipped. */
const RDY_OK=new Set(["practiced","verified","retained"]);
function preqOf(k){return (PREQ[k.std]||[]).map(c=>SKILLS.find(x=>x.std===c)).filter(Boolean)}
function lessonReady(k){const pre=preqOf(k);return realStudents().map(s=>{const lv=pre.map(p=>({p,lv:evLevel(s,p)}));
  const miss=lv.filter(x=>!x.lv||x.lv==="none"||x.lv==="refresh"),shaky=lv.filter(x=>x.lv==="learning");
  return {s,lv,st:!pre.length?"ready":miss.length?"missing":shaky.length?"shaky":"ready",gaps:[...miss,...shaky].map(x=>x.p)}})}
function readyCard(){const withPre=SKILLS.filter(k=>preqOf(k).length);if(!withPre.length||!realStudents().length)return "";
  const k=SKILLS.find(x=>x.id===S.rdyK)||withPre.find(x=>realStudents().some(s=>evLevel(s,x)==="none"))||withPre[0],R=lessonReady(k),pre=preqOf(k);
  const by=st=>R.filter(r=>r.st===st),need=[...by("missing"),...by("shaky")];
  return `<div class="card" id="rdy"><div class="top"><h2>Get ready for a lesson</h2><span class="muted small">Upcoming lesson readiness</span></div>
   <p class="muted">Pick the standard you teach next. Each student is checked on the standards it builds on, so you can pre-teach before the lesson instead of reteaching after.</p>
   <label class="f">Next lesson<select id="rdy-k">${withPre.map(x=>`<option value="${esc(x.id)}" ${x===k?"selected":""}>${esc(x.std)} · ${esc(x.name)}</option>`).join("")}</select></label>
   <p class="small"><b>Builds on:</b> ${pre.map(p=>`${esc(p.std)} ${esc(p.name)}`).join("; ")}</p>
   <div class="row" style="gap:14px"><span><span class="pill go">Ready</span> <b>${by("ready").length}</b></span><span><span class="pill gold">Shaky</span> <b>${by("shaky").length}</b></span><span><span class="pill oops">Missing a skill</span> <b>${by("missing").length}</b></span></div>
   ${need.length?`<div class="tablewrap"><table class="roster"><thead><tr><th>Student</th><th>Status</th><th>Pre-teach</th></tr></thead><tbody>
    ${need.map(r=>`<tr><td><b>${esc(r.s.name)}</b></td><td><span class="pill ${r.st==="missing"?"oops":"gold"}">${r.st==="missing"?"Missing a skill":"Shaky"}</span></td><td>${r.gaps.map(p=>`${esc(p.std)} <span class="muted small">(${EV_LBL[evLevel(r.s,p)||"none"]})</span>`).join(", ")}</td></tr>`).join("")}</tbody></table></div>
    <div class="row"><button class="ghost small" id="rdy-as">Assign the missing skills to these ${need.length} student${need.length===1?"":"s"}</button><span class="muted small" id="rdy-msg" role="status"></span></div>`:`<p class="fb go">Everyone is ready for ${esc(k.std)}.</p>`}</div>`}
function wireReady(){const sel=document.getElementById("rdy-k");if(sel)sel.onchange=()=>{const y=window.scrollY;S.rdyK=sel.value;render();window.scrollTo(0,y)};
  const as=document.getElementById("rdy-as");if(as)as.onclick=async()=>{const k=SKILLS.find(x=>x.id===(S.rdyK||document.getElementById("rdy-k").value)),R=lessonReady(k).filter(r=>r.st!=="ready"),m=new Map(R.map(r=>[r.s.id,r.gaps.map(p=>p.std)]));busy(as,"Assigning…");
    try{await saveRoster(CUR.raw.map(s=>m.has(s.id)?{...s,assigned:[...new Set([...(s.assigned||[]),...m.get(s.id)])]}:s));as.textContent="Assigned ✓";document.getElementById("rdy-msg").textContent="They show up first on each student’s trail."}catch(e){document.getElementById("rdy-msg").textContent=e.message;as.disabled=false}}}

/* ================= S09: Intervention review with implementation context =================
   Before anyone decides a plan "didn't work", check that it happened: teacher minutes logged vs planned,
   attendance at sessions, and app practice. Under 80% of planned minutes = judge the plan later. */
function fidelity(raw,s){const ip=s.ip||raw.ip,m=raw.mtss||{},startD=(ip&&ip.status==="active"&&ip.start)||m.start;if(!startD)return null;
  const since=new Date(startD+"T00:00:00").getTime(),wks=Math.max(1,(Date.now()-since)/(7*864e5)),per=ip&&ip.status==="active"?(ip.sessions||3)*(ip.minutes||20):null;
  const T=sesSum(raw,since),att=T.n+T.absent?Math.round(T.n/(T.n+T.absent)*100):null,planned=per?Math.round(per*wks):null,pct=planned?Math.round(T.mins/planned*100):null;
  const lvl=pct==null?null:pct>=80?"full":pct>=50?"part":"low";
  return {since,wks,planned,taught:T.mins,pct,att,sessions:T.n,absent:T.absent,app:minsOf(s.prog,null,since),lvl}}
const FID_TXT={full:["go","Plan carried out"],part:["gold","Partly carried out"],low:["oops","Not carried out yet"]};
function fidelityHTML(raw,s){const F=fidelity(raw,s);if(!F)return "";
  const v=F.lvl?FID_TXT[F.lvl]:null;
  return `<div class="fb ${v?v[0]==="go"?"ok":v[0]==="gold"?"info":"oops":"info"} fid"><p><b>Was the plan carried out?</b> ${v?`<span class="pill ${v[0]}">${v[1]}</span>`:""}</p>
   <p class="small">${F.planned!=null?`Teacher minutes: <b>${F.taught} of ${F.planned}</b> planned (${F.pct}%) · `:`Teacher minutes logged: <b>${F.taught}</b> · `}sessions attended: <b>${F.sessions}</b>${F.att!=null?` (${F.att}% attendance)`:""} · app practice: <b>${F.app} min</b> · ${Math.round(F.wks)} week${Math.round(F.wks)===1?"":"s"} since the start.</p>
   <p class="small">${F.lvl==="full"?"Enough of the plan happened to judge it. If progress is still flat, it is fair to change the plan.":F.lvl==="part"?"Only part of the plan happened. Close the gap before deciding the plan does not work.":F.lvl==="low"?"Most of the planned teaching has not happened yet, so the results don’t say much about the plan. Carry it out first, then review.":"Set sessions per week on the student’s plan to compare planned and taught minutes."}</p></div>`}

/* ================= S10: Rotations that handle absences and staffing ================= */
function planStations(o){let st=String(o.stations||PLAN_DEF.stations).split(",").map(x=>x.trim()).filter(Boolean);
  if(o.helper&&!st.some(x=>/helper/i.test(x)))st.splice(1,0,"Helper table");if(!o.helper)st=st.filter(x=>!/^helper table$/i.test(x));return st}
function absentFS(o){const studs=realStudents();if(!studs.length)return "";const A=new Set(o.absent||[]);
  return `<fieldset class="ses-who" style="grid-column:1/-1"><legend>Absent today (left out of groups)</legend>${studs.map(s=>`<label><input type="checkbox" name="abs" value="${s.id}" ${A.has(s.id)?"checked":""}> ${esc(s.name)}</label>`).join("")}</fieldset>
   <label class="f">Adults today<select id="pl-help"><option value="">Just me</option><option value="1" ${o.helper?"selected":""}>Me + a helper (adds a Helper table)</option></select></label>`}

/* ================= S01: Live teacher table mode ================= */
let TBL_TIMER=null;
function tableMode(gi){const P=S.plan,g=P&&P.groups[gi];if(!g){S.tbl=null;return ""}const I=groupInfo(g.ids),o=S.planO,M=S.tblM||(S.tblM={}),k=I.focus;
  const left=Math.max(0,(S.tblEnd||0)-Date.now()),mm=t=>`${Math.floor(t/60000)}:${String(Math.floor(t/1000)%60).padStart(2,"0")}`;
  return `<div class="row"><button class="ghost small" id="tbl-back">← Back to the planner</button></div>
  <div class="card tbl"><div class="top"><div><span class="label">Teacher table</span><h2 style="margin:0"><span class="gchip g${gi%8}">${esc(g.name)}</span> ${k?`${esc(k.std)} · ${esc(k.name)}`:"Challenge work"}</h2></div>
    <div class="tbl-timer"><b id="tbl-clock" aria-live="off">${S.tblEnd?mm(left):mm(o.mins*60000)}</b><button class="small" id="tbl-go">${S.tblEnd?"Restart":"Start"} ${o.mins}-min timer</button></div></div>
   ${I.mis?`<div class="fb oops"><p><b>Shared mistake:</b> ${fmt(I.mis.ex)}</p></div>`:""}
   ${k&&LIBC[k.std]&&LIBC[k.std].do?`<p><b>Try:</b> ${esc(LIBC[k.std].do[0]||"")}</p>`:""}
   <div class="row">${k&&genOf(k)?`<button class="ghost small" id="tbl-model">${S.tblModel?"New model problem":"Show a model problem"}</button>`:""}</div>
   ${S.tblModel&&k?(()=>{try{return reviewHTML(GG.make(genOf(k),S.tblModel),"Model problem")}catch(e){return ""}})():""}
   <div class="tbl-grid">${I.studs.map(s=>{const rec=(s.prog.recent||[]).filter(r=>!k||r.k===k.id).slice(-5),X=xtLatest(s,7),cf=confStats(s),mk=missGroups([s],k&&k.id)[0],m=M[s.id];
     return `<div class="card tbl-s ${m?"m-"+m:""}"><div class="top"><b>${esc(s.name)}</b><span class="dots" aria-label="Last answers">${rec.map(r=>`<i class="${r.ok?"ok":"no"}">${r.ok?"✓":"✗"}</i>`).join("")||'<span class="muted small">no answers yet</span>'}</span></div>
      ${mk&&(!k||mk.k===k.id)?`<p class="small">“${fmt(mk.ex)}”</p>`:""}
      <p class="small muted">${X?`Exit ticket ${X.r.ok}/${X.r.n} on ${esc(X.k.std)}`:""}${cf.sw?`${X?" · ":""}sure but wrong ×${cf.sw}`:""}${dokPct(s.prog,3)!=null?`${X||cf.sw?" · ":""}DOK 3 ${dokPct(s.prog,3)}%`:""}</p>
      <div class="row" role="group" aria-label="Mark ${esc(s.name)}">${[["got","✓ Got it"],["not","Not yet"],["abs","Absent"]].map(([v,l])=>`<button class="small ${m===v?"":"ghost"}" data-tm="${s.id}|${v}" aria-pressed="${m===v}">${l}</button>`).join("")}</div></div>`}).join("")}</div>
   <label class="f">Notes for the log (optional)<textarea id="tbl-n" rows="2" maxlength="120" placeholder="Strategy, materials, how it went">${esc(S.tblN||"")}</textarea></label>
   <div class="row"><button id="tbl-save">Finish and log this session</button><span class="muted small" id="tbl-msg" role="status">Unmarked students are logged as there.</span></div></div>`}
function wireTable(){clearInterval(TBL_TIMER);if(S.tbl==null)return;const gi=S.tbl,g=S.plan.groups[gi],o=S.planO,I=groupInfo(g.ids);
  const bk=document.getElementById("tbl-back");if(bk)bk.onclick=()=>{S.tbl=null;clearInterval(TBL_TIMER);render()};
  const clock=document.getElementById("tbl-clock");if(S.tblEnd&&clock)TBL_TIMER=setInterval(()=>{const c=document.getElementById("tbl-clock");if(!c){clearInterval(TBL_TIMER);return}const l=Math.max(0,S.tblEnd-Date.now());c.textContent=`${Math.floor(l/60000)}:${String(Math.floor(l/1000)%60).padStart(2,"0")}`;if(!l){c.textContent="Time!";clearInterval(TBL_TIMER)}},1000);
  document.getElementById("tbl-go").onclick=()=>{S.tblStart=Date.now();S.tblEnd=Date.now()+o.mins*60000;render()};
  const md=document.getElementById("tbl-model");if(md)md.onclick=()=>{S.tblModel=Math.floor(Math.random()*1e9);render()};
  const n=document.getElementById("tbl-n");if(n)n.oninput=()=>{S.tblN=n.value};
  app.querySelectorAll("[data-tm]").forEach(b=>b.onclick=()=>{const [id,v]=b.dataset.tm.split("|");S.tblM[id]=S.tblM[id]===v?undefined:v;const y=window.scrollY;render();window.scrollTo(0,y)});
  document.getElementById("tbl-save").onclick=async e=>{const M=S.tblM||{},k=I.focus,msg=document.getElementById("tbl-msg");if(!k){msg.textContent="This group has no focus standard to log.";return}
    const got=I.studs.filter(s=>M[s.id]==="got").map(s=>s.name),not=I.studs.filter(s=>M[s.id]==="not").map(s=>s.name);
    const mins=S.tblStart?Math.max(1,Math.min(180,Math.round((Date.now()-S.tblStart)/60000))):o.mins;
    const note=[S.tblN&&S.tblN.trim(),got.length&&`Got it: ${got.join(", ")}`,not.length&&`Not yet: ${not.join(", ")}`].filter(Boolean).join(" · ").slice(0,200);
    const rec={id:"x"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),d:isoDay(Date.now()),std:k.std,m:mins,n:note,nx:"",by:TB.me?.name||""},ids=new Set(g.ids);busy(e.target,"Saving…");
    try{await saveRoster(CUR.raw.map(s=>ids.has(s.id)?{...s,ses:[...sesOf(s),{...rec,a:M[s.id]==="abs"?0:1,...(M[s.id]==="got"?{g:1}:M[s.id]==="not"?{g:0}:{})}].slice(-SES_MAX)}:s));
      S.tbl=null;S.tblM={};S.tblN="";S.tblEnd=null;S.tblStart=null;S.tblModel=null;S.sesSaved=gi;clearInterval(TBL_TIMER);render()}catch(er){msg.textContent=er.message;e.target.disabled=false;e.target.textContent="Finish and log this session"}}}
/* ================= S05: Short checks that separate misconceptions =================
   From "Why they missed it", the teacher sends a 3-question check on one mistake to the students who made it.
   It runs as an exit ticket with x.mis = the mistake's normalized text. Each wrong answer is matched to the
   mistake behind it: the same mistake again = still there; all right = fixed; other mistakes = still learning. */
function misVerdict(r){if(!r)return null;if(r.ok===r.n)return ["go","Fixed"];if((r.same||0)>=1)return ["oops",`Same mistake ×${r.same}`];return ["gold","Other mistakes"]}
function misSend(k,ex,names){const mis=mnorm(ex),ids=new Set(realStudents().filter(s=>names.includes(s.name)).map(s=>s.id)),
  rec={id:"t"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),d:isoDay(Date.now()),k:k.id,std:k.std,n:3,mis:mis.slice(0,160),mx:String(ex).slice(0,160)};
  return saveRoster(CUR.raw.map(s=>ids.has(s.id)?{...s,xt:[...xtOf(s),rec].slice(-XT_MAX)}:s))}
function wireMis(){app.querySelectorAll("[data-misc]").forEach(b=>b.onclick=async()=>{const [kid,i]=b.dataset.misc.split("|"),x=missGroups(realStudents()).filter(g=>g.k===kid)[+i],k=SKILLS.find(y=>y.id===kid);
  if(!x||!k)return;busy(b,"Sending…");try{await misSend(k,x.ex,[...x.who]);b.textContent=`Sent to ${x.who.size} ✓`}catch(e){b.textContent=e.message;b.disabled=false}})}
/* during xtFinish: was this wrong answer the same mistake? */
function misSame(qid,kid,pick,mis){if(!mis)return false;try{return mnorm(missWhy({q:qid,k:kid,p:pick}))===mis}catch(e){return false}}

/* ================= S11: Paper practice that reconnects to the trail =================
   Print one page per student (each with their own version), plus answer keys. Enter how many each got
   right; scores are saved on the roster (raw.pp) and count like an exit ticket in groups and next steps. */
const PP_N=6,ppOf=raw=>Array.isArray(raw&&raw.pp)?raw.pp:[];
function paperQHTML(q,i){return `<div class="pq"><p class="pqn"><b>${i+1}.</b></p><div>${bodyHTML(q,null,"")}
  ${q.choices?`<div class="choices${q.choices.some(c=>typeof c==="string"&&c.length>40)?" one":""}">${q.choices.map((c,j)=>`<div class="choice"><b class="l">${L[j]}</b><div>${choiceInner(c)}</div></div>`).join("")}</div>${q.type==="multi"?"<p class=\"small\">Pick two.</p>":""}`:`<p class="pline">Answer: ____________</p>`}</div></div>`}
function paperSheets(k,n){const studs=realStudents().filter(s=>!(S.planO&&(S.planO.absent||[]).includes(s.id))),g=genOf(k),pages=[];
  studs.forEach((s,si)=>{const qs=[];let t=0;while(qs.length<n&&t++<40){const id=`~${g}~${(Date.now()%1e6)*31+si*1009+t}`;let q=null;try{q=getQ(id)}catch(e){}if(q&&["mc","multi","input"].includes(q.type))qs.push(viewQ(q))}
    pages.push({s,qs})});return pages}
function printPaper(k,n){const pages=paperSheets(k,n),w=window.open("","_blank");if(!w){alert("Allow pop-ups to print.");return}
  const css=pageCSS();
  w.document.write(`<!doctype html><meta charset="utf-8"><title>Paper practice · ${esc(k.std)}</title>${css}<style>body{background:#fff;padding:12px}.sheet{break-after:page;page-break-after:always}.pq{display:grid;grid-template-columns:28px 1fr;gap:6px;border-bottom:1px solid #ddd;padding:8px 0;break-inside:avoid}.pline{margin-top:10px}.key td,.key th{border:1px solid #999;padding:4px 8px}button{display:none}</style><div class="wrap">
   ${pages.map(p=>`<div class="sheet"><h2>${esc(k.std)} · ${esc(k.name)}</h2><p>Name: <b>${esc(p.s.name)}</b> &nbsp; Date: ________ &nbsp; Score: ____ / ${p.qs.length}</p>${p.qs.map(paperQHTML).join("")}</div>`).join("")}
   <div class="sheet"><h2>Answer keys · ${esc(k.std)}</h2><table class="key"><tr><th>Student</th>${Array.from({length:n},(_,i)=>`<th>${i+1}</th>`).join("")}</tr>${pages.map(p=>`<tr><td>${esc(p.s.name)}</td>${p.qs.map(q=>`<td>${esc(ansText(q))}</td>`).join("")}</tr>`).join("")}</table>
   <p>After grading, enter each score on the Station planner (Paper practice). Scores count like an exit ticket in tomorrow’s groups.</p></div></div><script>setTimeout(()=>print(),400)<\/script>`);w.document.close()}
function paperCard(){const ks=SKILLS.filter(k=>genOf(k));if(!ks.length||!realStudents().length)return "";const k=SKILLS.find(x=>x.id===S.ppK)||ks[0],today=isoDay(Date.now());
  const recent=realStudents().map(s=>({s,x:ppOf(s.raw||s).slice(-1)[0]})).filter(r=>r.x);
  return `<div class="card" id="pp"><div class="top"><h2>Paper practice</h2><span class="muted small">Reconnects to the trail</span></div>
   <p class="muted">Print a ${PP_N}-question page for each student (everyone gets a different version) and a page of answer keys. After grading, enter the scores here. They count like an exit ticket: under two thirds regroups the student on that standard.</p>
   <div class="grid"><label class="f">Standard<select id="pp-k">${ks.map(x=>`<option value="${esc(x.id)}" ${x===k?"selected":""}>${esc(x.std)} · ${esc(x.name)}</option>`).join("")}</select></label>
    <div class="row" style="align-items:flex-end"><button class="ghost" id="pp-print">🖨 Print sheets and answer keys</button><button class="ghost" id="pp-enter">${S.ppEnter?"Hide score entry":"Enter scores"}</button></div></div>
   ${S.ppEnter?`<form id="pp-f"><div class="tablewrap"><table class="roster"><thead><tr><th>Student</th><th>Right out of ${PP_N}</th></tr></thead><tbody>${realStudents().map(s=>`<tr><td>${esc(s.name)}</td><td><input type="number" name="${s.id}" min="0" max="${PP_N}" style="width:5em" aria-label="${esc(s.name)} score"></td></tr>`).join("")}</tbody></table></div>
    <div class="row"><label class="f">Date<input type="date" id="pp-d" value="${today}" max="${today}"></label><button type="submit">Save scores for ${esc(k.std)}</button><span class="muted small" id="pp-msg" role="status">Leave a box blank for anyone who didn’t do it.</span></div></form>`:""}
   ${recent.length?`<p class="small muted">Latest paper scores: ${recent.slice(0,12).map(r=>`${esc(r.s.name)} ${r.x.ok}/${r.x.n} (${esc(r.x.std)})`).join(" · ")}</p>`:""}</div>`}
function wirePaper(){const sel=document.getElementById("pp-k");if(!sel)return;sel.onchange=()=>{const y=window.scrollY;S.ppK=sel.value;render();window.scrollTo(0,y)};
  const k=()=>SKILLS.find(x=>x.id===(S.ppK||sel.value));
  document.getElementById("pp-print").onclick=()=>printPaper(k(),PP_N);
  document.getElementById("pp-enter").onclick=()=>{const y=window.scrollY;S.ppEnter=!S.ppEnter;render();window.scrollTo(0,y)};
  const f=document.getElementById("pp-f");if(f)f.onsubmit=async e=>{e.preventDefault();const K=k(),d=document.getElementById("pp-d").value||isoDay(Date.now()),sc={};
    f.querySelectorAll("input[type=number]").forEach(i=>{if(i.value!=="")sc[i.name]=Math.max(0,Math.min(PP_N,Math.round(+i.value)))});
    if(!Object.keys(sc).length){document.getElementById("pp-msg").textContent="Type at least one score.";return}busy(e.submitter,"Saving…");
    const id="p"+Date.now().toString(36);
    try{await saveRoster(CUR.raw.map(s=>s.id in sc?{...s,pp:[...ppOf(s),{id,d,k:K.id,std:K.std,n:PP_N,ok:sc[s.id]}].slice(-20)}:s));S.ppEnter=false;render()}catch(er){document.getElementById("pp-msg").textContent=er.message;e.submitter.disabled=false}}}

/* ================= S13: Student learning portfolio ================= */
function portfolio(){const s=S.student,p=s.prog,first=s.name.replace(" (sample)",""),wk=weekly([p]),lv={};SKILLS.forEach(k=>{const l=evLevel(s,k);if(l)(lv[l]=lv[l]||[]).push(k)});
  const ch=(p.chal||[]).slice().reverse(),ps=(p.psets||[]).slice().reverse(),xr=Object.values(p.xtr||{}).sort((a,b)=>b.t-a.t),f=(s.raw&&s.raw.prog&&s.raw.prog._flu)||null;
  app.innerHTML=header(`${langToggle()}<button class="ghost" id="pf-print">🖨 ${t("Print for my family")}</button><button class="ghost" id="pf-home">${t("Back to my trail")}</button>`)+`<div id="pfol">
   <div class="card"><span class="label">${t("My portfolio")}</span><h2 style="margin:2px 0">${esc(first)}</h2><p class="muted">${esc(TEST_NAME)} · ${new Date().toLocaleDateString()}</p>
    <div class="mstats">${[[t("Stars"),p.stars||0],[t("Locked in"),(lv.retained||[]).length],[t("Verified"),(lv.verified||[]).length],[t("Mastered"),(lv.practiced||[]).length],[t("Challenges"),ch.length],[t("Days practiced"),Object.keys(p.days||{}).length]].map(([l,v])=>`<div><b>${v}</b><span>${l}</span></div>`).join("")}</div></div>
   ${(lv.retained||lv.verified)?`<div class="card"><h2>${t("What I can do on my own")}</h2><ul class="pf-list">${[...(lv.retained||[]),...(lv.verified||[])].map(k=>`<li><span class="pill ${evLevel(s,k)==="retained"?"purple":"go"}">${t(evLevel(s,k)==="retained"?"Locked in":"Verified")}</span> <b>${esc(k.std)}</b> ${esc(k.name)}</li>`).join("")}</ul></div>`:""}
   ${wk.length>1?`<div class="card"><h2>${t("My growth")}</h2>${lineChart(wk.map(x=>({label:shortDate(x.w),y:x.acc,tip:`${shortDate(x.w)}: ${x.acc}%`})),{max:100,unit:"%",title:t("My accuracy each week")})}</div>`:""}
   ${ch.length||ps.length||xr.length||f?`<div class="card"><h2>${t("My best work")}</h2><ul class="pf-list">
     ${ch.slice(0,5).map(c=>`<li>⭐ ${t("Challenge")} <b>${esc(c.std)}</b> · ${c.ok}/${c.n}</li>`).join("")}
     ${ps.slice(0,5).map(x=>`<li>📖 ${esc(x.title)} · ${x.ok}/${x.n}</li>`).join("")}
     ${xr.filter(x=>x.ok===x.n).slice(0,5).map(x=>`<li>🎟️ ${t("Exit ticket")} ${esc((SKILLS.find(k=>k.id===x.k)||{}).std||"")} · ${x.ok}/${x.n}</li>`).join("")}
     ${f?`<li>⚡ ${t("Fluency level")} ${(f.level||0)+1}</li>`:""}</ul></div>`:""}
   <div class="card"><h2>${t("My badges")}</h2>${badgesHTML(p)}</div></div>`;
  wireLang();document.getElementById("pf-home").onclick=()=>{S.screen="home";render()};document.getElementById("pf-print").onclick=()=>printEl("pfol",`${first} · portfolio`)}
SCREENS.portfolio=portfolio;
const pfButton=()=>`<div class="row"><button class="ghost" id="pf-go">📁 ${t("My portfolio")}</button></div>`;
function wirePfButton(){const b=document.getElementById("pf-go");if(b)b.onclick=()=>{S.screen="portfolio";render();window.scrollTo(0,0)}}
Object.assign(ES,{"My portfolio":"Mi portafolio","Print for my family":"Imprimir para mi familia","Stars":"Estrellas","Challenges":"Retos","Days practiced":"Días de práctica","What I can do on my own":"Lo que puedo hacer yo solo",
 "My growth":"Mi progreso","My accuracy each week":"Mi precisión cada semana","My best work":"Mi mejor trabajo","Fluency level":"Nivel de fluidez","Quick check":"Control rápido"});
/* ================= Depth of Knowledge (DOK) =================
   Students never choose a DOK. Three pieces:
   1. "Think deeper" (DOK 3) questions are made from any question that has checked explanations for its wrong
      answers: "Sam said 42. Maya said 49. Who is correct, and why?" Only one choice names the right student
      (with the mistake behind the wrong answer); the others say the wrong one is right, both, or neither.
      Id: !ea!<base question id>!<wrong letter> or !ea!<base id>!v:<wrong number>, so it rebuilds exactly.
   2. Every other question gets an estimated DOK 1 (a bare computation or fact) or DOK 2 (words, a picture,
      a table, or two steps).
   3. Verified needs one Think deeper right (the second check-up), and the class switch "Match the state test
      mix" (cls.dokmix, on by default) makes about 1 in 8 practice questions and 1 question on 5-question exit tickets DOK 3.
   Answers are counted in prog.dok = {1|2|3: {n, ok}}. */
const EA_NAMES=["Sam","Maya","Jordan","Ava","Leo","Zoe","Eli","Nia"],DOK_MIX_EVERY=8; /* MAAP blueprints (Aug/Oct 2026): 75% DOK 2, about 25% DOK 1 and 3 combined, so DOK 3 is about 1 in 8 */
const eaHash=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)};
const eaWhyOK=w=>typeof w==="string"&&w.replace(/<[^>]+>/g,"").trim().length>=12&&!/breakdown below|this one does not fit/i.test(w);
function eaMake(id,g0){const m=String(id).match(/^!ea!(.+)!(v:(.+)|([A-E]))$/);if(!m)return null;const base=g0(m[1]);if(!base)return null;
  const clean=x=>String(x).replace(/<[^>]+>/g,"").trim().replace(/\.$/,"");let said,rightTxt,mist;
  if(m[4]&&base.type==="mc"&&base.why){const l=m[4],c=base.choices[L.indexOf(l)],rc=base.choices[L.indexOf(base.ans)];if(l===base.ans||typeof c!=="string"||typeof rc!=="string")return null;said=c;rightTxt=rc;mist=base.why[l]}
  else if(m[3]!=null&&base.type==="input"&&base.whyIn){if(Number(m[3])===Number(base.ans))return null;said=m[3];rightTxt=String(base.ans);mist=base.whyIn[m[3]]}
  else return null;
  if(!eaWhyOK(mist))return null;said=clean(said);rightTxt=clean(rightTxt);mist=clean(mist);if(!said||!rightTxt||said===rightTxt)return null;
  /* two students: one wrong (with the mistake behind it), one right. Only one choice says the right student is correct. */
  const h=eaHash(id),A=EA_NAMES[h%EA_NAMES.length],B=EA_NAMES[(h+3)%EA_NAMES.length],first=h%2?[A,said,B,rightTxt]:[B,rightTxt,A,said];
  const ch=[`${B} is correct. ${A}’s mistake: ${mist}.`,`${A} is correct. ${B}’s mistake: ${mist}.`,`They are both correct.`,`Neither one is correct.`];
  const ord=[0,1,2,3].sort((a,b)=>eaHash(id+"o"+a)-eaHash(id+"o"+b)),choices=ord.map(i=>ch[i]),ans=L[ord.indexOf(0)];
  const why={};ord.forEach((i,j)=>{if(i)why[L[j]]=i===3?`${B}’s answer, ${rightTxt}, is correct.`:`${A}’s answer, ${said}, is not correct. ${B} is right: ${rightTxt}.`});
  return {type:"mc",_ea:true,dok:3,skill:base.skill,parts:[...base.parts,`${first[0]} said the answer is ${first[1]}. ${first[2]} said the answer is ${first[3]}.`,"Who is correct, and why?"],keys:["correct","why"],
    choices,ans,why,steps:[...(base.steps||[]),{say:`${B} is correct. ${A}’s mistake: ${mist}.`}]}}
/* ================= Find Buddy's Mistake =================
   Every BD_EVERY practice questions, a regular question comes with Buddy's wrong answer (a real common mistake
   from the question's own explanations). The student finds the right answer; the walkthrough starts with Buddy's mistake. */
const BD_EVERY=12,buddyOn=()=>S.demo||!(SB&&SB.cls&&SB.cls.buddy===false);
function bdMake(id,g0){const m=String(id).match(/^!bd!(.+)!([^!]+)$/);if(!m)return null;const base=g0(m[1]),l=decodeURIComponent(m[2]);if(!base)return null;
  const clean=x=>String(x).replace(/<[^>]+>/g,"").trim().replace(/\.$/,""),line=said=>`🦝 Buddy said the answer is ${said}. Buddy made a mistake! What is the right answer?`;
  if(base.type==="input"){const w=base.whyIn&&base.whyIn[l];if(!w||String(l)===String(base.ans))return null;const mist=clean(w);if(!mist)return null;
    return {...base,_bd:true,_bdSaid:l,parts:[...base.parts,line(l)],whyIn:{...base.whyIn,[l]:`That’s Buddy’s answer, and it has his mistake. ${mist}.`},steps:[{say:`🦝 Buddy’s mistake: ${mist}.`},...(base.steps||[])]}}
  if(base.type!=="mc"||!base.why||l===base.ans||!base.why[l])return null;const c=base.choices[L.indexOf(l)];if(typeof c!=="string")return null;
  const said=clean(c),mist=clean(base.why[l]);if(!said||!mist)return null;
  return {...base,_bd:true,_bdSaid:said,parts:[...base.parts,line(said)],
    why:{...base.why,[l]:`That’s Buddy’s answer, and it has his mistake. ${mist}.`},steps:[{say:`🦝 Buddy’s mistake: ${mist}.`},...(base.steps||[])]}}
{const g0=getQ;getQ=function(id){if(typeof id==="string"&&id.startsWith("!bd!")){if(QS[id])return QS[id];const q=bdMake(id,g0);if(q)QS[id]=q;return q}return g0(id)}}
function bdIdFor(qid){if(typeof qid!=="string"||qid[0]==="!")return null;let q=null;try{q=getQ(qid)}catch(e){}if(!q)return null;
  if(q.type==="input"&&q.whyIn){const ws=Object.keys(q.whyIn).filter(k=>String(k)!==String(q.ans)&&eaWhyOK(q.whyIn[k]));return ws.length?`!bd!${qid}!${encodeURIComponent(ws[Math.floor(Math.random()*ws.length)])}`:null}
  if(q.type!=="mc"||!q.why)return null;
  const ws=Object.keys(q.why).filter(l=>l!==q.ans&&typeof q.choices[L.indexOf(l)]==="string"&&eaWhyOK(q.why[l]));return ws.length?`!bd!${qid}!${ws[Math.floor(Math.random()*ws.length)]}`:null}
{const g0=getQ;getQ=function(id){if(typeof id==="string"&&id.startsWith("!ea!")){if(QS[id])return QS[id];const q=eaMake(id,g0);if(q)QS[id]=q;return q}return g0(id)}}
/* a Think deeper question for a skill, or null when its question maker has no usable explanations */
function eaIdFor(k){const g=genOf(k);if(!g)return null;for(let i=0;i<14;i++){const base=`~${g}~${Math.floor(Math.random()*1e9)}`;let q=null;try{q=getQ(base)}catch(e){}if(!q)continue;
    const opts=q.type==="mc"&&q.why?Object.keys(q.why).filter(l=>l!==q.ans).map(l=>`!ea!${base}!${l}`):q.type==="input"&&q.whyIn?Object.keys(q.whyIn).map(v=>`!ea!${base}!v:${v}`):[];
    for(const id of opts.sort(()=>Math.random()-.5)){let e=null;try{e=getQ(id)}catch(er){}if(e)return id}}return null}
/* estimated DOK for any question */
function dokOf(q){if(!q)return 2;if(q.dok)return q.dok;if(q._ea)return 3;const parts=q.parts||[];
  if(parts.some(p=>p&&typeof p==="object"&&(p.table||p.img||p.svg||p.groups||p.arr||p.passage||p.fig)))return 2;
  const words=parts.filter(p=>typeof p==="string").join(" ").split(/\s+/).filter(Boolean).length;if(q.type==="multi")return 2;return words>=14?2:1}
const dokMixOn=()=>S.demo||!(SB&&SB.cls&&SB.cls.dokmix===false);
function dokRecord(p,q,ok){const d=dokOf(q),D=p.dok=p.dok||{},y=D[d]||(D[d]={n:0,ok:0});y.n++;if(ok)y.ok++}
const dokPct=(p,d)=>{const y=p&&p.dok&&p.dok[d];return y&&y.n?Math.round(y.ok/y.n*100):null};
/* teacher side */
function dokCell(s){const p=s.prog,c=[1,2,3].map(d=>{const v=dokPct(p,d),y=p.dok&&p.dok[d];return v==null?"—":`${v}%<span class="muted small">/${y.n}</span>`});return c.join(" · ")}
function dokClass(){const D={1:{n:0,ok:0},2:{n:0,ok:0},3:{n:0,ok:0}};realStudents().forEach(s=>[1,2,3].forEach(d=>{const y=s.prog.dok&&s.prog.dok[d];if(y){D[d].n+=y.n;D[d].ok+=y.ok}}));return D}
Object.assign(ES,{"Think deeper":"Piensa más","Think deeper: find the mistake":"Piensa más: encuentra el error"});
/* ================= Test builder: the teacher's own test from standards =================
   Pick standards and how many questions each gets (plus an optional Think deeper question), preview,
   swap or remove questions, name it, and assign it to the class or a group. The chosen question ids are
   saved on the exit-ticket record (x.qs, x.name), so every student gets the same test. Results are kept
   per question and per standard (prog.xtr[id].q, .by) and feed groups and Next steps like exit tickets. */
const TB_MAX=40;
const tbSkills=()=>pickSkills();
function tbNewQ(k,ea,avoid){for(let i=0;i<30;i++){let id=ea?eaIdFor(k):`~${genOf(k)}~${Math.floor(Math.random()*1e9)}`;if(!id)return null;let q=null;try{q=getQ(id)}catch(e){}
    if(!q||!["mc","multi","input"].includes(q.type))continue;const key=JSON.stringify(q.parts);if(avoid.has(key))continue;avoid.add(key);return {id,k:k.id,ea:!!ea}}return null}
function tbMake(){const B=S.tbld,avoid=new Set(),qs=[];
  tbSkills().forEach(k=>{const n=+(B.n[k.id]||0);for(let i=0;i<n;i++){const x=tbNewQ(k,false,avoid);if(x)qs.push(x)}if(B.ea[k.id]&&n){const x=tbNewQ(k,true,avoid);if(x)qs.push(x)}});
  B.qs=qs.slice(0,TB_MAX)}
function tbCard(){const B=S.tbld;
  if(!B)return `<div class="card"><div class="top"><h2>Build a test</h2><span class="muted small">Your own test from the standards</span></div>
    <p class="muted">Choose standards and how many questions each gets, preview every question, swap any you don’t like, then assign it. Everyone gets the same questions. Results show by standard and by question.</p>
    <div class="row"><button id="tb-new">＋ Build a test</button>${S.tbSaved?`<span class="fb ok" role="status" style="padding:6px 10px">Test assigned. Students see it on their home page.</span>`:""}</div></div>`;
  const total=tbSkills().reduce((a,k)=>a+(+(B.n[k.id]||0))+(B.ea[k.id]&&+(B.n[k.id]||0)?1:0),0);
  if(!B.qs)return `<div class="card" id="tb"><div class="top"><h2>Build a test: choose standards</h2><button class="ghost small" id="tb-x">Cancel</button></div>
   <p class="muted">Type how many questions each standard gets (0 to skip). Check “+ Think deeper” to add one DOK 3 question for that standard. Up to ${TB_MAX} questions.</p>
   <div class="tablewrap"><table class="roster"><thead><tr><th>Standard</th><th>Questions</th><th>+ Think deeper</th></tr></thead><tbody>
   ${tbSkills().map(k=>`<tr><td><b>${esc(k.std)}</b> <span class="muted small">${esc(k.name)}</span></td><td><input type="number" min="0" max="10" value="${B.n[k.id]||0}" data-tbn="${esc(k.id)}" style="width:4.5em" aria-label="Questions for ${esc(k.std)}"></td><td><input type="checkbox" data-tbe="${esc(k.id)}" ${B.ea[k.id]?"checked":""} aria-label="Add a Think deeper question for ${esc(k.std)}"></td></tr>`).join("")}</tbody></table></div>
   <div class="row"><button id="tb-make" ${total?"":"disabled"}>Preview ${total||""} question${total===1?"":"s"}</button><span class="muted small">${total>TB_MAX?`Only the first ${TB_MAX} are used.`:""}</span></div></div>`;
  const P=S.plan;
  return `<div class="card" id="tb"><div class="top"><h2>Build a test: preview</h2><button class="ghost small" id="tb-x">Cancel</button></div>
   <p class="muted">${B.qs.length} question${B.qs.length===1?"":"s"}. Tap <b>Swap</b> for a different question on the same standard, or <b>Remove</b>. The answer is marked on each one.</p>
   <ol class="tb-list">${B.qs.map((x,i)=>{let q=null;try{q=viewQ(getQ(x.id))}catch(e){}const k=tbSkills().find(s=>s.id===x.k)||{};if(!q)return "";
     return `<li class="tb-q"><div class="row" style="justify-content:space-between"><span class="label">${esc(k.std||"")}${x.ea?` · <span class="pill purple">Think deeper</span>`:""}</span><span class="row" style="gap:6px"><button class="ghost small" data-tbs="${i}">Swap</button><button class="ghost small" data-tbr="${i}">Remove</button></span></div>${(h=>{const m='<div class="card"><h3>Key words to highlight</h3>',j=h.indexOf(m);return j<0?h:h.slice(0,j)+`<details class="tb-steps"><summary class="small">See the steps and why other answers are wrong</summary>${h.slice(j)}</details>`})(reviewHTML(q,"Question "+(i+1)))}</li>`}).join("")}</ol>
   <form class="grid" id="tb-f"><label class="f">Test name<input name="name" required maxlength="60" value="${esc(B.name||"")}" placeholder="Unit 3 check"></label>
    <label class="f">Who<select name="who"><option value="all">Whole class</option>${P&&P.groups?P.groups.map((g,i)=>`<option value="${i}">${esc(g.name)} (${g.ids.length})</option>`).join(""):""}</select></label>${TB.classes.filter(c=>c.teacherId===TB.me.id&&c.id!==CUR.cls.id).map(c=>`<label class="row small" style="gap:6px"><input type="checkbox" name="also" value="${esc(c.id)}"> Also give it to ${esc(c.name)} (whole class)</label>`).join("")}
    <div class="row" style="grid-column:1/-1"><button type="button" class="ghost" id="tb-back">← Change standards</button><button type="submit" ${B.qs.length?"":"disabled"}>Assign test</button><span class="muted small" id="tb-msg" role="status"></span></div></form></div>`}
function wireTb(){const keep=fn=>()=>{const y=window.scrollY;fn();render();window.scrollTo(0,y)};
  const nw=document.getElementById("tb-new");if(nw)nw.onclick=keep(()=>{S.tbld={n:{},ea:{}};S.tbSaved=false});
  const x=document.getElementById("tb-x");if(x)x.onclick=keep(()=>{S.tbld=null});
  app.querySelectorAll("[data-tbn]").forEach(i=>i.onchange=keep(()=>{S.tbld.n[i.dataset.tbn]=Math.max(0,Math.min(10,Math.round(+i.value||0)))}));
  app.querySelectorAll("[data-tbe]").forEach(i=>i.onchange=keep(()=>{S.tbld.ea[i.dataset.tbe]=i.checked}));
  const mk=document.getElementById("tb-make");if(mk)mk.onclick=keep(()=>tbMake());
  const bk=document.getElementById("tb-back");if(bk)bk.onclick=keep(()=>{S.tbld.qs=null});
  app.querySelectorAll("[data-tbs]").forEach(b=>b.onclick=keep(()=>{const i=+b.dataset.tbs,old=S.tbld.qs[i],k=tbSkills().find(s=>s.id===old.k);
    const avoid=new Set(S.tbld.qs.map(y=>{try{return JSON.stringify(getQ(y.id).parts)}catch(e){return ""}}));const n=tbNewQ(k,old.ea,avoid);if(n)S.tbld.qs[i]=n}));
  app.querySelectorAll("[data-tbr]").forEach(b=>b.onclick=keep(()=>{S.tbld.qs.splice(+b.dataset.tbr,1)}));
  const f=document.getElementById("tb-f");if(f){f.querySelector("[name=name]").oninput=e=>{S.tbld.name=e.target.value};
    f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f),who=String(fd.get("who")),B=S.tbld,name=String(fd.get("name")||"").trim().slice(0,60);if(!name||!B.qs.length)return;
      const ids=new Set(who==="all"?realStudents().map(s=>s.id):(S.plan.groups[+who]||{ids:[]}).ids),k0=tbSkills().find(s=>s.id===B.qs[0].k);
      const rec={id:"t"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),d:isoDay(Date.now()),k:k0.id,std:k0.std,n:B.qs.length,name,qs:B.qs.map(y=>y.id)};
      busy(e.submitter,"Assigning…");
      try{await saveRoster(CUR.raw.map(s=>ids.has(s.id)?{...s,xt:[...xtOf(s),rec].slice(-XT_MAX)}:s));
        for(const cid of fd.getAll("also")){const d=(await api("classData",{ids:[String(cid)]})).classes[0];await api("rosterSave",{classId:d.cls.id,rev:d.rev,students:rosterOut(d.students.map(s=>s.sample?s:{...s,xt:[...xtOf(s),rec].slice(-XT_MAX)}))})}
        S.tbld=null;S.tbSaved=true;render()}catch(er){document.getElementById("tb-msg").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Assign test"}}}}
/* per-standard and per-question results for a custom test, across the students who took it */
function tbResults(x){const by={},q=x.qs.map(()=>[0,0]);x.who.forEach(w=>{const r=w.r;if(!r)return;(r.q||[]).forEach((v,i)=>{if(q[i]){q[i][1]++;if(v)q[i][0]++}});Object.entries(r.by||{}).forEach(([kid,[o,n]])=>{const y=by[kid]||(by[kid]=[0,0]);y[0]+=o;y[1]+=n})});
  const std=kid=>(tbSkills().find(s=>s.id===kid)||{}).std||kid;
  return `<details><summary class="small">By standard and by question</summary><div class="row" style="gap:10px;flex-wrap:wrap;margin:6px 0">${Object.entries(by).map(([kid,[o,n]])=>`<span class="pill ${n&&o/n<.6?"oops":n&&o/n<.8?"gold":"go"}">${esc(std(kid))}: ${n?Math.round(o/n*100):0}%</span>`).join("")||'<span class="muted small">No results yet.</span>'}</div>
   <div class="row" style="gap:6px;flex-wrap:wrap">${q.map(([o,n],i)=>`<span class="small">#${i+1}: ${n?Math.round(o/n*100)+"%":"—"}</span>`).join(" · ")}</div></details>`}
Object.assign(ES,{"Test":"Prueba","Start my test":"Empezar mi prueba"});
/* ================= Science: Mississippi CCRS for Science (2026), grades 4, 5, 7, 8 and Biology =================
   Course keys: 14 = Science Grade 4, 15 = Science Grade 5, 17 = Science Grade 7, 18 = Science Grade 8, 19 = Biology.
   Objective text comes from the 2026 MS CCRS for Science. Every practice question is original. */
const SCI_OBJ={},SCI_BANK={},SCI_GEN={};
const sciGrade=code=>code.startsWith("BIO")?19:10+(+code.split(".")[1]);
const sciGen=code=>"s"+code.toLowerCase().replace(/\./g,"");
/* O(code, short name, objective text, content-standard text) registers one performance objective */
function SO(code,name,text,std){SCI_OBJ[code]={code,name,text,std}}
/* I(code, stem, right answer, "wrong~why" ×3, "step|step|…", extras) adds one question to an objective's bank */
function SI(code,stem,right,w1,w2,w3,steps,x){(SCI_BANK[code]=SCI_BANK[code]||[]).push({stem,right,w:[w1,w2,w3].map(s=>{const i=s.indexOf("~");return i<0?[s,""]:[s.slice(0,i),s.slice(i+1)]}),steps,x:x||{}})}
const GENSCI=(()=>{
 function RNG(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
 const pick=(r,a)=>a[Math.floor(r()*a.length)],shuf=(r,a)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const norm=w=>w.toLowerCase().replace(/^[^\w\[∎×÷]+|[^\w\]∎×÷]+$/g,"");
 const STOP=new Set("which what would most best these those their there about after before because could should while other between during under where every through these students student shows shown table model below above following statement explains explain describes describe".split(" "));
 function keysFor(text,extra){const ws=text.split(/\s+/).map(norm).filter(Boolean),out=[];
   (extra||"").split(/\s+/).map(norm).filter(Boolean).forEach(k=>{if(ws.includes(k)&&!out.includes(k))out.push(k)});
   text.split(/\s+/).forEach(w=>{if(/^[A-Z]{3,}$/.test(w.replace(/[^A-Za-z]/g,""))){const n=norm(w);if(!out.includes(n))out.unshift(n)}});
   ws.filter(w=>w.length>=6&&!STOP.has(w)&&!/^\d+$/.test(w)).sort((a,b)=>b.length-a.length).forEach(w=>{if(out.length<4&&!out.includes(w))out.push(w)});
   ws.filter(w=>/\d/.test(w)).forEach(w=>{if(out.length<5&&!out.includes(w))out.push(w)});
   if(out.length<2)ws.filter(w=>w.length>=4&&!STOP.has(w)&&!/^(that|this|with|from|have|what|when|they|your|into|does|than|then|each|will|were|from)$/.test(w)).forEach(w=>{if(out.length<3&&!out.includes(w))out.push(w)});
   return out.slice(0,5)}
 const LET="ABCD";
 function fromItem(it,r){const order=shuf(r,[{c:it.right,ok:true},...it.w.map(([c,why])=>({c,why}))]),why={};let ans;if(order.length<4||new Set(order.map(o=>o.c)).size<order.length)throw 0;
   order.forEach((o,i)=>{if(o.ok)ans=LET[i];else why[LET[i]]=o.why||"Reread the question and look at the key words."});
   const paras=it.stem.split("\n"),parts=[paras[0]];if(it.x.t)parts.push({table:it.x.t,...(it.x.h?{cols:it.x.h}:{})});if(it.x.bar)parts.push({viz:{bar:it.x.bar,alt:it.x.alt||"a bar graph"}});parts.push(...paras.slice(1));
   return {type:"mc",parts,keys:keysFor(it.stem,it.x.k),choices:order.map(o=>o.c),ans,why,steps:String(it.steps).split("|").map(s=>({say:s.trim()})).filter(s=>s.say),fixed:false}}
 function make(gen,seed){const r=RNG(seed),code=SCI_CODE[gen],bank=SCI_BANK[code]||[],gens=SCI_GEN[code]||[];
   const n=bank.length+gens.length;if(!n)throw new Error("no items for "+code);let i=Math.floor(seed/DECK_K)%n;
   for(let t=0;t<20;t++){try{const q=i<bank.length?fromItem(bank[i],r):gens[i-bank.length](r,{pick,shuf,fromItem});q.skill=gen;if(q.keys.length<1)q.keys=keysFor(q.parts.filter(p=>typeof p==="string").join(" "));return q}catch(e){i=Math.floor(r()*n)}}
   throw new Error("science item failed "+code)}
 return {make,get skills(){return Object.keys(SCI_CODE)},count:g=>((SCI_BANK[SCI_CODE[g]]||[]).length+(SCI_GEN[SCI_CODE[g]]||[]).length),fromItem,pick,shuf};
})();
const DECK_K=1000003;
var SCI_CODE={};
