/* Path to Proficiency · Teacher pages: classes, progress, students, settings, tests, pacing, celebrate, family updates, standards.
   Loaded in order by index.html as plain scripts that share one global scope. */
/* ---------- my classes ---------- */
function tClasses(){
  const mine=TB.classes.filter(c=>c.teacherId===TB.me.id),others=TB.classes.filter(c=>c.teacherId!==TB.me.id);
  const card=c=>`<li class="cls"><div><b>${esc(c.name)}</b><br><span class="muted" style="font-size:.85rem">${esc(tName(c.teacherId))} · ${esc(testName(c.testId))}</span><br><span class="muted" style="font-size:.85rem">Class code <b style="letter-spacing:.1em;color:var(--ink)">${esc(c.join)}</b></span></div><button class="small" data-open="${c.id}">Open</button></li>`;
  const byT={};others.forEach(c=>(byT[c.teacherId]=byT[c.teacherId]||[]).push(c));
  return `<div class="card"><div class="top"><h2>My classes</h2><span class="pill">${mine.length} class${mine.length===1?"":"es"}</span></div>
    ${mine.length?`<ul class="clist">${mine.map(card).join("")}</ul>`:`<p class="muted">You don’t have a class yet. Make one below.</p>`}</div>
   ${isAdmin()&&others.length?`<div class="card"><h2>Other teachers’ classes</h2><p class="muted">You can see these because you are the school admin.</p>
    ${Object.entries(byT).map(([tid,cs])=>`<h3>${esc(tName(tid))}</h3><ul class="clist">${cs.map(card).join("")}</ul>`).join("")}</div>`:""}
   <div class="card"><h2>Make a new class</h2>
    <form class="grid" id="nc"><label class="f">Class name<input id="nc-name" required maxlength="60" placeholder="Homeroom"></label>
     <label class="f">Test<select id="nc-test">${testOpts(TB.tests,(testsOrdered()[0]||{}).id)}</select></label>
     ${isAdmin()?`<label class="f">Teacher<select id="nc-t">${TB.teachers.map(t=>`<option value="${t.id}" ${t.id===TB.me.id?"selected":""}>${esc(t.name)}</option>`).join("")}</select></label>`:""}
     <button type="submit">Make class</button></form><p class="err" id="nc-err" role="alert"></p></div>`;
}
function wireClasses(){
  app.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{busy(b,"Opening…");openClass(b.dataset.open,"class")});
  document.getElementById("nc").onsubmit=async e=>{e.preventDefault();busy(e.submitter);
    try{const ncT=document.getElementById("nc-test").value,ncG=isStdT(ncT)?+ncT.slice(3):0;
      /* science and ELA questions come from written banks, so new classes start at 5 in a row (teachers can change it in Settings) */
      const d=await api("classSave",{name:document.getElementById("nc-name").value,testId:ncT,teacherId:document.getElementById("nc-t")?.value,...(ncG>=14?{mastery:5}:{})});
      Object.assign(TB,d);await openClass(d.cls.id,"setup")}
    catch(er){document.getElementById("nc-err").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Make class"}};
}

/* ---------- class progress ---------- */
function tClass(){
  const real=realStudents(),N=real.length,goal=db.goal||60,need=Math.ceil(N*goal/100);
  const finished=real.filter(s=>!curSkill(s)).length,pct=N?Math.round(finished/N*100):0;
  const goalCard=`<div class="card"><div class="top"><h2>Path to ${goal}%</h2><span class="pill">${N} student${N===1?"":"s"}</span></div>
   ${N?`<div class="goal"><div><span class="big">${pct}%</span><span class="muted">${finished} of ${N} finished their path</span></div>
     <div><span class="big">${goal}%</span><span class="muted">goal: ${need} of ${N}</span></div></div>
     <div class="meter" role="img" aria-label="${pct}% finished, goal ${goal}%"><span style="width:${pct}%"></span><i style="left:${goal}%"></i></div>
     <p>${finished>=need?`<b>You reached the goal!</b>`:`<b>${need-finished} more student${need-finished===1?"":"s"}</b> need to finish their path to reach ${goal}%.`}</p>
     <p class="muted" style="font-size:.85rem">“Finished” means the student showed mastery in practice on every standard they missed. That is a good sign, but it is not the same as passing the benchmark.</p>`
   :`<p class="muted">Add your students under Students to track your class goal.</p>`}</div>`;
  const stdRows=SKILLS.map(k=>{const who=real.filter(s=>s.prog.skills[k.id]&&s.prog.skills[k.id].status!=="off"),M=who.length,ok=who.filter(s=>s.prog.skills[k.id].status!=="todo").length,on=real.filter(s=>curSkill(s)===k);
    const p2=M?Math.round(ok/M*100):0,col=heat(p2);
    return `<tr><td><b>${esc(k.std)}</b>${k.extra?' <span class="pill purple">Assigned</span>':""}<br><span class="muted">${esc(k.name)}</span></td><td>${M?`<span class="bar"><span style="width:${p2}%;background:${col}"></span></span> ${ok}/${M}`:"—"}</td>
      <td>${on.length?on.map(s=>esc(s.name)).join(", "):'<span class="muted">—</span>'}</td></tr>`}).join("");
  const attn=real.map(s=>{const cur=curSkill(s);if(!cur)return null;const rec=(s.prog.recent||[]).filter(r=>r.k===cur.id).slice(-5);
      const miss=rec.filter(r=>!r.ok).length;if(rec.length<3||miss<3)return null;
      const qs={};(s.prog.recent||[]).filter(r=>r.k===cur.id&&!r.ok&&(getQ(r.q)||{}).n).forEach(r=>qs[r.q]=(qs[r.q]||0)+1);
      const top=Object.entries(qs).sort((a,b)=>b[1]-a[1])[0];return {s,cur,miss,n:rec.length,top:top&&getQ(top[0]).n,tm:topMiss(s,cur.id)}}).filter(Boolean);
  const attnCard=`<div class="card"><div class="top"><h2>Needs attention</h2><span class="pill ${attn.length?'oops':'go'}">${attn.length} student${attn.length===1?"":"s"}</span></div>
   ${attn.length?`<ul class="attn">${attn.map(a=>`<li><b>${esc(a.s.name)}</b><span class="pill purple">${esc(a.cur.std)}</span>
     <p>Missed ${a.miss} of their last ${a.n} on ${esc(a.cur.name.toLowerCase())}. Next step: pull them into a small group for ${esc(a.cur.std)}${a.top?` and go over <button class="link" data-goq="${a.top}">breakdown #${a.top}</button> together`:""}.</p>${a.tm?`<p style="font-size:.9rem"><b>Most common mistake:</b> ${fmt(a.tm.ex)}</p>`:""}</li>`).join("")}</ul>`
   :`<p class="muted">No one is stuck right now. A student shows up here after missing 3 of their last 5 questions on the same standard.</p>`}</div>`;
  const groupsCard=`<div class="card"><h2>Standards and small groups</h2><p class="muted">Students in the same row are working on the same standard right now. Pull them together for a small group.</p>
   <div class="tablewrap"><table class="roster"><thead><tr><th>Standard</th><th>Proficient</th><th>Small group (working on it now)</th></tr></thead><tbody>${stdRows}</tbody></table></div></div>`;
  const rows=CUR.students.map(s=>{const p=s.prog,cur=curSkill(s),TR=trailFor(s),done=TR.filter(k=>p.skills[k.id].status!=="todo").length;
    const tries=Object.values(p.log).reduce((a,l)=>a+l.tries,0)+(p.prior?.tries||0),right=Object.values(p.log).reduce((a,l)=>a+l.right,0)+(p.prior?.right||0);
    return `<tr><td><b>${esc(s.name)}</b>${p.go?' <span class="pill gold">🚀 Working ahead</span>':""}${cbTag(s)}<br><span class="muted">code ${esc(s.code)}</span></td>
     <td>${s.missed==null?'<span class="muted">not entered</span>':missedText(s.missed)}</td>
     <td><span class="bar"><span style="width:${TR.length?done/TR.length*100:0}%;background:var(--go)"></span></span> ${done}/${TR.length}${(()=>{const n=TR.filter(k=>p.skills[k.id]&&p.skills[k.id].carried&&p.skills[k.id].status!=="todo").length;return n?`<br><span class="muted" style="font-size:.8rem" title="Mastered on the class's earlier test. They count on this trail too.">⭐ ${n} from earlier trail</span>`:""})()}${focusOn(s)?`<br><span class="muted" style="font-size:.8rem" title="The student chose this area to work on first.">🎯 Focus: ${esc((FOCUS_NAME[focusOn(s)]||[focusOn(s)])[0])}</span>`:""}${(s.assigned||[]).length?`<br><span class="muted" style="font-size:.8rem">Assigned: ${esc(s.assigned.join(", "))}</span>`:""}</td>
     <td>${cur?`${esc(cur.std)}<br><span class="muted">${esc(cur.name)}</span>`:'<span style="color:var(--go);font-weight:700">Proficient</span>'}</td>
     <td>${tries?Math.round(right/tries*100)+"%":"—"}<br><span class="muted">${tries} answered</span></td>
     <td>${(()=>{const r=readiness(s),b=band(r);return r==null?`<span class="pill" title="Not enough practice or test data yet">Evidence needed</span>`:`<span class="pill ${b.c}">${r}%</span>`})()}</td><td>${p.tutor?.total||0}${p.tutor?.off?.n?`<br><span class="pill gold" title="${esc((p.tutor.off.last||[]).map(x=>"“"+x.t+"”").join("\n"))}">⚠️ ${p.tutor.off.n} off-topic</span>`:""}</td></tr>`}).join("");
  const offS=CUR.students.filter(s=>s.prog.tutor?.off?.n);
  const offCard=offS.length?`<div class="card"><details><summary><b>⚠️ Off-topic Scout chats (${offS.reduce((a,s)=>a+s.prog.tutor.off.n,0)})</b> <span class="muted">Scout steered these students back to math. Tap to see what they asked.</span></summary>
   <ul>${offS.map(s=>`<li><b>${esc(s.name)}</b> (${s.prog.tutor.off.n}): ${(s.prog.tutor.off.last||[]).slice(-3).map(x=>`<span class="muted">“${esc(x.t)}”</span>`).join(", ")}</li>`).join("")}</ul></details></div>`:"";
  return `${nextCard()}${tsCard(CUR.raw)}${goalCard}${hsClassCard()}${readinessCard()}${evClassCard()}${stepsCard()}${handsCard()}${attnCard}${offCard}${groupsCard}<div class="card"><div class="top"><h2>Every student</h2><span class="row" style="gap:.4rem;margin:0"><button class="small" id="sub-day">🧑‍🏫 Sub Day</button><select id="hb-std" aria-label="Standard for the Help Buddy warm-up" style="max-width:220px"><option value="">🦝 Most of the class (auto)</option>${SKILLS.filter(k=>genOf(k)).map(k=>`<option value="${esc(k.id)}">${esc(k.std)} · ${esc(k.name)}</option>`).join("")}</select><button class="ghost small" id="help-buddy">🦝 Help Buddy warm-up</button><button class="ghost small" id="csv-dl">Download class data (CSV)</button></span></div>
   <p class="muted">Each student’s path skips any standard where they got every test question right. Students marked “sample” are examples and are not counted in your goal.</p>
   <div class="tablewrap"><table class="roster"><thead><tr><th>Student</th><th>Missed on test</th><th>Path</th><th>Working on</th><th>Accuracy</th><th>Readiness</th><th>Asked Scout</th></tr></thead><tbody>${rows||`<tr><td colspan="7" class="muted">No students yet.</td></tr>`}</tbody></table></div>
   <p class="muted" style="font-size:.85rem">Progress saves online, so students can use any device. <button class="link" id="reload">Refresh</button></p></div>${growthCard()}`;
}
const heat=p=>p>=70?"var(--go)":p>=50?"var(--star)":"var(--oops)";
document.addEventListener("click",e=>{if(e.target.id==="reload"&&CUR){openClass(CUR.cls.id,"class")}});

function wrongList(q){return q.type==="matrix"?q.rows.map(r=>`<li>${r.n}: ${fmt(r.why)}</li>`):q.type==="input"?Object.entries(q.whyIn||{}).map(([v,t])=>`<li>If they wrote ${esc(v)}: ${fmt(t)}</li>`).concat(q.whyElse?[`<li>Anything else: ${fmt(q.whyElse)}</li>`]:[]):
    q.choices.map((_,i)=>L[i]).filter(l=>q.type==="mc"?l!==q.ans:!q.ans.includes(l)).map(l=>`<li><b>${l}</b>: ${fmt(q.why?.[l]||"—")}</li>`)}
function reviewHTML(q,label){const sk=SKILLS.find(k=>k.id===q.skill)||{std:(LIBG[q.skill]||{}).code||""};
  return `<div class="notebook ro"><div class="row" style="justify-content:space-between"><span class="label">${esc(label)} · ${esc(sk.std)}</span><span class="pill go">Answer: ${esc(ansText(q))}</span></div>
    ${bodyHTML(q,null,"keys")}
    ${q.choices?`<div class="choices${q.choices.some(c=>typeof c==="string"&&c.length>40)||q.choices.some(c=>c.table)?' one':''}">${q.choices.map((c,i)=>{const l=L[i],ok=q.type==="mc"?q.ans===l:q.ans.includes(l);
      return `<div class="choice${ok?' right':''}"><b class="l">${l}</b><div>${choiceInner(c)}</div></div>`}).join("")}</div>`:''}
    ${q.type==="input"?`<p class="eq">Answer: ${esc(q.ans)}</p>`:''}
    ${q.type==="matrix"?`<table class="matrix"><tr><th></th>${q.cols.map(c=>`<th>Rounds to ${c}</th>`).join("")}</tr>${q.rows.map(r=>`<tr><td>${r.n}</td>${q.cols.map(c=>`<td class="${c===r.a?'right':''}">${c===r.a?'✔':''}</td>`).join("")}</tr>`).join("")}</table>`:''}
   </div>
   <div class="card"><h3>Key words to highlight</h3><p>${q.keys.map(k=>`<span class="tok hit">${fmt(k)}</span>`).join(" ")}</p>
    <h3>Step by step</h3><ol class="bd">${q.steps.map(st=>`<li><p>${fmt(st.say)}</p>${st.show?`<div class="stage" style="margin-top:8px;min-height:0">${showHTML(st.show)}</div>`:''}</li>`).join("")}</ol>
    <h3>${q.type==="input"?"Common wrong answers":"Why the other answers are wrong"}</h3><ul class="why-list">${wrongList(q).join("")}</ul></div>`}
function tBreak(){
  const nums=qNums();if(!nums.length)return `<div class="card"><h2>Question breakdowns</h2><p class="muted">${esc(TEST_NAME)} has no test questions, so students practice with questions the app makes for each standard. See examples below.</p></div>${libPreviewCard()}`;
  const n=nums.includes(S.bdq)?S.bdq:nums[0],q=Object.values(QSA).find(x=>x.n===n),i=nums.indexOf(n);
  let practiceCard="";
  if(TESTID!=="a1"&&SKILLS.some(k=>k.twins.length)){
    if(!S.tsk||!SKILLS.some(k=>k.id===S.tsk))S.tsk=SKILLS.find(k=>k.twins.length).id;
    const k=SKILLS.find(x=>x.id===S.tsk),list=k.twins,j=Math.min(S.genI||0,Math.max(0,list.length-1));
    practiceCard=`<div class="card"><h2>This test’s practice questions</h2>
    <div class="row"><label class="f" style="flex:1;min-width:200px">Standard<select id="t-sk">${SKILLS.filter(k=>k.twins.length).map(k=>`<option value="${esc(k.id)}" ${k.id===S.tsk?'selected':''}>${esc(k.std)} ${esc(k.name)} (${k.twins.length})</option>`).join("")}</select></label>
    ${list.length>1?`<button class="ghost" id="g-next" style="align-self:flex-end">Show another</button>`:""}</div></div>${list.length?reviewHTML(getQ(list[j]),`Practice ${j+1} of ${list.length}`):""}`;
  }
  practiceCard+=libPreviewCard();
  return `<div class="card"><h2>Question breakdowns</h2><p class="muted">Every question from ${esc(TEST_NAME)}, broken down step by step. Good for reviewing on the board.</p>
   <div class="qnav">${nums.map(x=>`<button data-q="${x}" aria-pressed="${n===x}">${x}</button>`).join("")}</div></div>
   ${reviewHTML(q,`Question #${n}`)}
   <div class="row"><button class="ghost" id="bprev" ${i===0?'disabled':''}>← #${nums[i-1]||""}</button><button class="ghost" id="bnext" ${i===nums.length-1?'disabled':''}>#${nums[i+1]||""} →</button></div>
   ${practiceCard}`;
}
function wireBreak(){
  const nums=qNums();if(!nums.length){wireLibPreview();return}const cur=nums.includes(S.bdq)?S.bdq:nums[0],i=nums.indexOf(cur);
  app.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{S.bdq=+b.dataset.q;render()});
  document.getElementById("bprev").onclick=()=>{S.bdq=nums[i-1];render()};
  document.getElementById("bnext").onclick=()=>{S.bdq=nums[i+1];render()};
  wireLibPreview();
  const ts=document.getElementById("t-sk");if(ts)ts.onchange=e=>{S.tsk=e.target.value;S.genI=0;render()};
  const gx=document.getElementById("g-next");if(gx)gx.onclick=()=>{const k=SKILLS.find(x=>x.id===S.tsk);S.genI=((S.genI||0)+1)%k.twins.length;render()};
}
function itemStats(students){
  const withData=students.filter(s=>!isSample(s)&&s.missed);
  return qNums().map(n=>{const q=Object.values(QSA).find(x=>x.n===n),sk=SKILLS.find(k=>k.id===q.skill)||{std:""};
    const missed=withData.filter(s=>s.missed.includes(n)).length,pct=withData.length?Math.round((1-missed/withData.length)*100):null;
    let t=0,r=0;students.filter(s=>!isSample(s)).forEach(s=>{const l=s.prog.log["q"+n];if(l){t+=l.tries;r+=l.right}});
    return {n,sk,pct,t,r}});
}
function tItems(){
  if(!qNums().length)return `<div class="card"><h2>Item analysis</h2><p class="muted">Item analysis shows how students did on each question of a test that is saved in the app. ${esc(TEST_NAME)} has no saved questions, so there is nothing to show here. Import your own test on the Tests page to use item analysis, or see results by standard on Class progress and Why they missed it.</p></div>`;
  const rows=itemStats(CUR.students),withData=realStudents().filter(s=>s.missed);
  const sorted=[...rows].sort((a,b)=>(a.pct??101)-(b.pct??101));
  return `<div class="card"><h2>Item analysis</h2><p class="muted">Test % is how many students got each question right on ${esc(TEST_NAME)} (from the missed questions you entered). Lowest first, so you know what to reteach. Sample students are not counted.</p>
   ${withData.length?"":`<p class="fb info">Add your students and their missed questions to fill this in.</p>`}
   <div class="tablewrap"><table class="roster"><thead><tr><th>Question</th><th>Standard</th><th>Right on test</th><th>Right in practice</th><th></th></tr></thead><tbody>${sorted.map(r=>`<tr><td><b>#${r.n}</b></td><td>${esc(r.sk.std)}</td><td>${r.pct==null?"—":`<span class="bar"><span style="width:${r.pct}%;background:${heat(r.pct)}"></span></span> ${r.pct}%`}</td><td>${r.t?Math.round(r.r/r.t*100)+"% of "+r.t:"—"}</td><td><button class="ghost small" data-goq="${r.n}">Breakdown</button></td></tr>`).join("")}</tbody></table></div></div>`;
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-goq]");if(b){S.tab="bd";S.bdq=+b.dataset.goq;render()}});

/* ---------- students ---------- */
const rosterOut=list=>list.map(s=>({id:s.id,name:s.name,code:s.code,missed:s.missed||{},assigned:s.assigned||[],...(s.mtss?{mtss:s.mtss}:{}),...(s.acc&&Object.values(s.acc).some(Boolean)?{acc:s.acc}:{}),...(s.ip?{ip:s.ip}:{}),...(s.scores?{scores:s.scores}:{}),...(s.bm?{bm:s.bm}:{}),...(Array.isArray(s.ses)&&s.ses.length?{ses:s.ses}:{}),...(Array.isArray(s.xt)&&s.xt.length?{xt:s.xt}:{}),...(Array.isArray(s.pp)&&s.pp.length?{pp:s.pp}:{}),sample:!!s.sample}));
async function saveRoster(list,extra={}){
  let d;try{d=await api("rosterSave",{classId:CUR.cls.id,rev:CUR.rev,students:rosterOut(list),...extra})}
  catch(e){if(/Someone else changed/.test(e.message)){const tab=S.tab;await openClass(CUR.cls.id,tab);alert(e.message+" Please make your change again.")}throw e}
  CUR.rev=d.rev||"";
  const progById=Object.fromEntries(CUR.raw.map(s=>[s.id,s.prog]));
  list.forEach(s=>{if(s.id&&s.prog)progById[s.id]=s.prog});
  if(extra.progs)Object.assign(progById,extra.progs);
  CUR.raw=d.students.map(s=>({...s,prog:progById[s.id]||{}}));addExtras(allAssigned(CUR.raw));CUR.students=CUR.raw.map(viewStudent);
  if(!S.ipRunning)setTimeout(autoPrograms,0);
}
const newCode=(taken)=>{for(let i=0;i<500;i++){const c=String(1000+Math.floor(Math.random()*9000));if(!taken.has(c))return c}return ""};
function tSetup(){
  const list=CUR.raw,i=Math.min(S.edit||0,list.length-1),e=list[i],ev=e&&CUR.students[i];
  const old=ls.get(OLDKEY),oldReal=TESTID==="a1"&&old&&Array.isArray(old.students)?old.students.filter(s=>!isSample(s)):[];
  const editCard=e?`<div class="card"><h2>Edit or remove a student</h2>
   <form class="grid" id="upd"><label class="f" style="grid-column:1/-1">Student<select id="u-st">${list.map((s,j)=>`<option value="${j}" ${j===i?'selected':''}>${esc(s.name)} · code ${esc(s.code)}</option>`).join("")}</select></label>
    <label class="f">First name<input id="u-name" value="${esc(e.name)}" required maxlength="60"></label>
    <label class="f">Secret code<input id="u-code" value="${esc(e.code)}" inputmode="numeric" pattern="[0-9]{4}" required></label>
    <label class="f" style="grid-column:1/-1">Questions missed on ${esc(TEST_NAME)} (leave blank if not entered yet)<input id="u-missed" value="${ev.missed?ev.missed.join(", "):""}" placeholder="2, 5, 11"></label>
    <button type="submit">Save changes</button></form>
   <p class="muted" id="upd-msg" role="status"></p>
   <div class="row" id="rm-box"><button class="ghost" id="rm">Remove ${esc(e.name)}</button></div></div>`:"";
  const imp=S.imp;
  const csvCard=`<div class="card" id="csv-card"><h2>Import scores from a spreadsheet</h2>
   <p class="muted">Save your spreadsheet as CSV. It needs a <b>Name</b> column. Then either a <b>Missed</b> column (like “2, 5, 11”), or one column per question named 1, 2, 3… with 1/0, right/wrong, or the letter each student picked. A <b>Code</b> column is optional; new students without one get a random code. Students already in the class are matched by name.</p>
   <div class="row"><label class="ghost filebtn">Choose CSV file<input type="file" id="sc-file" accept=".csv,text/csv" hidden></label><button class="link" id="sc-tpl">Download a sample CSV</button></div>
   ${imp?`<div class="tablewrap"><table class="roster"><thead><tr><th>Name</th><th>Code</th><th>Missed</th><th></th></tr></thead><tbody>${imp.rows.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.code)}</td><td>${missedText(r.missed)}</td><td>${r.match?'<span class="pill">update</span>':'<span class="pill go">new</span>'}</td></tr>`).join("")}</tbody></table></div>
     ${imp.warn.length?`<div class="fb info">${imp.warn.slice(0,6).map(w=>`<p>${esc(w)}</p>`).join("")}</div>`:""}
     <div class="row"><button id="sc-go">Import ${imp.rows.length} student${imp.rows.length===1?"":"s"}</button><button class="ghost" id="sc-no">Cancel</button></div>`:""}
   <p class="err" id="sc-err" role="alert"></p></div>`;
  const codes=list.length?`<div class="card"><div class="top"><h2>Login cards</h2><button class="ghost small" id="print">Print login cards</button></div>
   <p class="muted">Students sign in with the class code <b style="letter-spacing:.1em;color:var(--ink)">${esc(CUR.cls.join)}</b> and their own 4-digit code. A device remembers the class after the first sign-in.</p></div>`:"";
  return `<div class="card"><h2>Add a student</h2><p class="muted">Type the question numbers they missed on ${esc(TEST_NAME)}, like 2, 5, 11. Type “none” if they missed nothing. Leave it blank if you don’t have their scores yet, and they will practice every standard.</p>
   <form class="grid" id="add"><label class="f">First name<input id="f-name" required maxlength="60"></label><label class="f">Secret code (4 digits)<input id="f-code" inputmode="numeric" pattern="[0-9]{4}" required value="${newCode(new Set(list.map(s=>s.code)))}"></label>
    <label class="f" style="grid-column:1/-1">Questions missed<input id="f-missed" placeholder="2, 5, 11, 19"></label><button type="submit">Add student</button></form><p class="err" id="add-err" role="alert"></p></div>
  ${assignCard()}${editCard}${csvCard}${codes}
  ${oldReal.length?`<div class="card"><h2>Students saved on this device</h2><p class="muted">This device has ${oldReal.length} student${oldReal.length===1?"":"s"} from the old version of the app (${esc(oldReal.slice(0,5).map(s=>s.name).join(", "))}${oldReal.length>5?"…":""}). Bring them into ${esc(CUR.cls.name)} with their progress?</p>
   <div class="row"><button id="old-go">Bring them in</button></div><p class="err" id="old-err" role="alert"></p></div>`:""}`;
}
function wireSetup(){
  const list=CUR.raw;wireAssign();
  document.getElementById("add").onsubmit=async e=>{e.preventDefault();const code=document.getElementById("f-code").value.trim(),err=document.getElementById("add-err");
    if(list.some(s=>s.code===code)){err.textContent="That code is already taken. Pick another 4-digit code.";return}
    const s={name:document.getElementById("f-name").value.trim(),code,missed:{[TESTID]:parseMissed(document.getElementById("f-missed").value)}};
    busy(e.submitter,"Adding…");
    try{await saveRoster([...list,s]);flash("add-err","");S.edit=CUR.raw.length-1;render();document.getElementById("f-name")?.focus()}catch(er){err.textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Add student"}};
  const upd=document.getElementById("upd");
  if(upd){
    document.getElementById("u-st").onchange=ev=>{S.edit=+ev.target.value;render()};
    upd.onsubmit=async e=>{e.preventDefault();const i=+document.getElementById("u-st").value,s=list[i],msg=document.getElementById("upd-msg");
      const code=document.getElementById("u-code").value.trim(),name=document.getElementById("u-name").value.trim();
      if(list.some((x,j)=>j!==i&&x.code===code)){msg.textContent="That code is already taken. Pick another 4-digit code.";return}
      const missed=parseMissed(document.getElementById("u-missed").value),changed=JSON.stringify(missed)!==JSON.stringify(s.missed?.[TESTID]??null);
      const next=list.map((x,j)=>j===i?{...x,name,code,missed:{...(x.missed||{}),[TESTID]:missed}}:x);
      busy(e.submitter,"Saving…");
      try{
        if(changed){const old=s.prog?.[TESTID];await api("progSet",{classId:CUR.cls.id,studentId:s.id,testId:TESTID,prog:old?{stars:old.stars||0,badges:old.badges||{},tutor:old.tutor}:null});
          s.prog={...(s.prog||{}),[TESTID]:old?{stars:old.stars||0,badges:old.badges||{},tutor:old.tutor}:undefined}}
        await saveRoster(next);S.edit=i;
        flash("upd-msg",changed?`Saved. ${name}’s path restarted from missed questions: ${missedText(missed)}.`:`Saved ${name}.`);render();
      }catch(er){msg.textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Save changes"}};
    document.getElementById("rm").onclick=()=>{const i=+document.getElementById("u-st").value,s=list[i];
      document.getElementById("rm-box").innerHTML=`<span>Remove ${esc(s.name)} and all of their progress?</span><button id="rm-yes" style="background:var(--oops)">Remove</button><button class="ghost" id="rm-no">Keep</button>`;
      document.getElementById("rm-yes").onclick=async()=>{try{await saveRoster(list.filter((_,j)=>j!==i));S.edit=0;render()}catch(er){document.getElementById("upd-msg").textContent=er.message}};
      document.getElementById("rm-no").onclick=render};
  }
  document.getElementById("sc-tpl").onclick=()=>{const nums=qNums();
    download("scores-sample.csv",`Name,Code,${nums.join(",")}\nAva,1234,${nums.map((n,i)=>i%3?1:0).join(",")}\nBen,,${nums.map(()=>1).join(",")}\n`)};
  document.getElementById("sc-file").onchange=async e=>{const f=e.target.files[0];if(!f)return;const err=document.getElementById("sc-err");
    try{S.imp=parseScores(await f.text());render()}catch(er){err.textContent=er.message}};
  const go=document.getElementById("sc-go");
  if(go){document.getElementById("sc-no").onclick=()=>{S.imp=null;render()};
    go.onclick=async()=>{busy(go,"Importing…");const imp=S.imp,next=list.map(s=>({...s,missed:{...(s.missed||{})}})),taken=new Set(next.map(s=>s.code)),resets=[];
      for(const r of imp.rows){
        if(r.match){const s=next.find(x=>x.id===r.match);const before=JSON.stringify(s.missed[TESTID]??null);s.missed[TESTID]=r.missed;if(r.code&&!taken.has(r.code)){taken.delete(s.code);s.code=r.code;taken.add(r.code)}if(before!==JSON.stringify(r.missed))resets.push(s)}
        else{const code=r.code&&!taken.has(r.code)?r.code:newCode(taken);taken.add(code);next.push({name:r.name,code,missed:{[TESTID]:r.missed}})}
      }
      try{for(const s of resets){const old=s.prog?.[TESTID];await api("progSet",{classId:CUR.cls.id,studentId:s.id,testId:TESTID,prog:old?{stars:old.stars||0,badges:old.badges||{}}:null});s.prog={...(s.prog||{}),[TESTID]:old?{stars:old.stars||0,badges:old.badges||{}}:undefined}}
        await saveRoster(next);S.imp=null;S.tab="class";render()}
      catch(er){document.getElementById("sc-err").textContent=er.message;go.disabled=false;go.textContent="Try again"}}}
  const pr=document.getElementById("print");if(pr)pr.onclick=printCards;
  const og=document.getElementById("old-go");
  if(og)og.onclick=async()=>{const old=ls.get(OLDKEY),taken=new Set(list.map(s=>s.code)),next=[...list],progs={};let skipped=0;
    old.students.filter(s=>!isSample(s)).forEach(s=>{if(taken.has(s.code)){skipped++;return}taken.add(s.code);
      const id="s"+Math.random().toString(36).slice(2,10);next.push({id,name:s.name,code:s.code,missed:{a1:s.missed??null}});progs[id]={a1:s.prog||null}});
    busy(og,"Bringing them in…");
    try{await saveRoster(next,{progs});ls.set(OLDKEY,null);S.tab="class";if(skipped)alert(`${skipped} student(s) were skipped because their code is already used in this class.`);render()}
    catch(er){document.getElementById("old-err").textContent=er.message;og.disabled=false;og.textContent="Bring them in"}};
}
function printCards(){
  const w=window.open("","_blank");if(!w){alert("Allow pop-ups to print login cards.");return}
  w.document.write(`<!doctype html><meta charset="utf-8"><title>Login cards · ${esc(CUR.cls.name)}</title><style>body{font-family:system-ui,sans-serif;margin:20px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.c{border:2px dashed #999;border-radius:12px;padding:14px;break-inside:avoid}.c b{font-size:1.3rem}.k{font-size:1.6rem;letter-spacing:.2em;font-weight:800}small{color:#555}</style>
   <h2>${esc(CUR.cls.name)} · ${esc(tName(CUR.cls.teacherId))}</h2><div class="g">${CUR.raw.filter(s=>!isSample(s)).map(s=>`<div class="c"><b>${esc(s.name)}</b><br><small>Class code</small><div class="k">${esc(CUR.cls.join)}</div><small>My secret code</small><div class="k">${esc(s.code)}</div><small>${esc(location.host)}</small></div>`).join("")}</div><script>print()<\/script>`);
  w.document.close();
}
function download(name,text){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:"text/csv"}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}

/* ---------- CSV ---------- */
function parseCSV(text){
  text=text.replace(/^﻿/,"");const rows=[];let row=[],f="",q=false;
  const delim=(text.split("\n")[0].match(/\t/g)||[]).length>(text.split("\n")[0].match(/,/g)||[]).length?"\t":",";
  for(let i=0;i<text.length;i++){const c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
    else if(c==='"')q=true;else if(c===delim){row.push(f);f=""}else if(c==="\n"||c==="\r"){if(c==="\r"&&text[i+1]==="\n")i++;row.push(f);f="";if(row.some(x=>x.trim()))rows.push(row);row=[]}else f+=c}
  row.push(f);if(row.some(x=>x.trim()))rows.push(row);
  return rows.map(r=>r.map(x=>x.trim()));
}
function parseScores(text){
  const rows=parseCSV(text);if(rows.length<2)throw new Error("The file needs a header row and at least one student.");
  const h=rows[0].map(x=>x.toLowerCase().replace(/[^a-z0-9#]/g,""));
  const ni=h.findIndex(x=>/^(name|student|studentname|firstname|first)$/.test(x));
  if(ni<0)throw new Error("I couldn’t find a Name column. Name the first column “Name”.");
  const ci=h.findIndex(x=>/^(code|secretcode|pin)$/.test(x)),mi=h.findIndex(x=>/^(missed|wrong|questionsmissed)$/.test(x));
  const qcols=h.map((x,i)=>{const m=x.match(/^(?:q|question|#)?(\d{1,3})$/);return m?{i,n:+m[1]}:null}).filter(Boolean).filter(c=>c.i!==ci);
  if(mi<0&&!qcols.length)throw new Error("Add a “Missed” column, or one column per question named 1, 2, 3…");
  const warn=[],out=[];
  for(const r of rows.slice(1)){const name=(r[ni]||"").trim();if(!name)continue;
    let code=ci>=0?(r[ci]||"").replace(/\D/g,""):"";if(code&&code.length!==4){warn.push(`${name}: code “${r[ci]}” is not 4 digits, so a new one will be made.`);code=""}
    let missed;
    if(mi>=0&&(r[mi]||"").trim()!=="")missed=parseMissed(r[mi]);
    else if(qcols.length){missed=[];let any=false;
      for(const c of qcols){const v=(r[c.i]||"").trim(),q=Object.values(QSA).find(x=>x.n===c.n);if(v==="")continue;any=true;
        let right;
        if(/^(1|y|yes|true|correct|right|✓|x)$/i.test(v))right=true;
        else if(/^(0|n|no|false|incorrect|wrong|✗)$/i.test(v))right=false;
        else if(q&&q.type==="mc")right=v.toUpperCase()===q.ans;
        else if(q&&q.type==="multi")right=[...v.toUpperCase().replace(/[^A-E]/g,"")].sort().join("")===[...q.ans].sort().join("");
        else if(q&&q.type==="input")right=Number(v.replace(/,/g,""))===Number(q.ans);
        else {warn.push(`${name}, question ${c.n}: couldn’t read “${v}”.`);continue}
        if(!right)missed.push(c.n)}
      if(!any)missed=null}
    else missed=null;
    const match=CUR.raw.find(s=>s.name.trim().toLowerCase()===name.toLowerCase());
    out.push({name,code,missed,match:match&&match.id});
  }
  if(!out.length)throw new Error("No students were found in the file.");
  return {rows:out,warn};
}

/* ---------- class settings ---------- */
function tSettings(){
  const c=CUR.cls,dev=ls.get(CKEY);
  return `<div class="card"><h2>Class settings</h2>
   <form class="grid" id="cs">
    <label class="f">Class name<input id="c-name" value="${esc(c.name)}" required maxlength="60"></label>
    ${isAdmin()?`<label class="f">Teacher<select id="c-t">${TB.teachers.map(t=>`<option value="${t.id}" ${t.id===c.teacherId?"selected":""}>${esc(t.name)}</option>`).join("")}</select></label>`:""}
    <label class="f">Test students practice<select id="c-test">${testOpts(TB.tests,c.testId)}</select></label>
    <label class="f">Class goal (% of students)<input id="c-goal" type="number" min="1" max="100" value="${c.goal}" required></label>
    <label class="f">Step 1 before each question (key words, Find the proof, Rule it out, or Plan it)<select id="c-kw">${[["auto",`Automatic (${(()=>{const g=gradeOf(),l=isELA(g)?g-20:isSci(g)&&g<19?g-10:g;return g===9||isHS(g)||g===19||l>=6})()?"optional for this course":"required for this course"}; short number-only problems skip it)`],["on","Required: students do step 1 first"],["optional","Optional: students may skip it"],["off","Off: students go straight to the question"]].map(([v,l])=>`<option value="${v}" ${(c.kw||"auto")===v?"selected":""}>${l}</option>`).join("")}</select></label>
    <label class="f">Stars to master a standard (3 to 20; a miss costs 2)<input id="c-mast" type="number" min="3" max="20" value="${c.mastery}" required></label>
    <label class="f chk"><span><input type="checkbox" id="c-tutor" ${c.tutor?"checked":""}> Let students ask Scout, the AI tutor</span></label>
    <label class="f chk"><span><input type="checkbox" id="c-chirp" ${c.chirp!==false?"checked":""}> Chirp the bird cheers students on</span></label>
    <label class="f chk"><span><input type="checkbox" id="c-music" ${c.music!==false?"checked":""}> Students can turn on calm background music (off until a student picks a track)</span></label>
    <label class="f chk"><span><input type="checkbox" id="c-dokmix" ${c.dokmix!==false?"checked":""}> Match the state test mix: MAAP is about 75% DOK 2 and 25% DOK 1 and 3, so about 1 in 8 practice questions (and 1 question on 5-question exit tickets) is a “Think deeper” (DOK 3) question. When off, DOK 3 shows up only in check-ups.</span></label>
     <label class="f chk"><span><input type="checkbox" id="c-buddy" ${c.buddy!==false?"checked":""}> 🦝 Find Buddy’s Mistake: about 1 in 12 practice questions shows Buddy’s wrong answer (a real common mistake), and students find the right one</span></label>
    <label class="f">✋ Hand cooldown (3 Before Me)<select id="c-hcool"><option value="0" ${!+c.handCool?"selected":""}>Off: students can ask again right away</option><option value="3" ${+c.handCool===3?"selected":""}>3 minutes between asks</option><option value="5" ${+c.handCool===5?"selected":""}>5 minutes between asks</option><option value="10" ${+c.handCool===10?"selected":""}>10 minutes between asks</option></select></label>
    <label class="f chk"><span><input type="checkbox" id="c-chal" ${c.chal!==false?"checked":""}> Challenge zone: once a standard is verified, students can try next-grade questions that build on it</span></label>
    ${isHS(+(c.testId||"").slice(3)||0)?`<label class="f chk"><span><input type="checkbox" id="c-choose" ${c.choose!==false?"checked":""}> Choose your focus: students can pick an area (like Algebra or Geometry) to work on first. Standards you assign still come first.</span></label>`:""}
    <label class="f chk"><span><input type="checkbox" id="c-gofur" ${c.gofur!==false?"checked":""}> Go Further: after the summit, students can start the next grade’s standards</span></label>
    <label class="f chk"><span><input type="checkbox" id="c-flu" ${c.flu?.on!==false?"checked":""}> Fluency mode on</span></label>
    <label class="f">Fluency: questions per sheet<input id="c-fn" type="number" min="10" max="60" value="${c.flu?.n||30}"></label>
    <label class="f">Fluency: right to pass<input id="c-fp" type="number" min="1" max="60" value="${c.flu?.pass||28}"></label>
    <label class="f">Fluency: time (minutes)<input id="c-fs" type="number" min="0.5" max="15" step="0.5" value="${(c.flu?.secs||180)/60}"></label>
    <label class="f chk"><span><input type="checkbox" id="c-games" ${c.games?.on!==false?"checked":""}> Game Arcade on (students earn tokens)</span></label>
    <label class="f chk"><span><input type="checkbox" id="c-ip" ${c.ip?.on!==false?"checked":""}> Automatic individual plans for low scores</span></label>
    <label class="f">Individual plan cut score (%)<input id="c-ipc" type="number" min="1" max="100" value="${c.ip?.cut||60}"></label>
    <label class="f">Arcade: minutes per game<input id="c-gm" type="number" min="1" max="10" value="${c.games?.mins||3}"></label>
    <button type="submit">Save settings</button></form>
   <div class="row"><button type="button" class="ghost small" id="gm-bonus">Give everyone 1 bonus token</button><span class="muted" id="gm-msg" role="status"></span></div>
   <p class="muted" style="font-size:.85rem">Switching the test keeps each student’s progress on the old test. Enter missed questions for the new test under Students.${TB.ai?"":" The AI tutor needs an AI key on the server before students can use it."}</p>
   <p class="muted" id="cs-msg" role="status"></p></div>
  <div class="card"><h2>Your videos</h2><p class="muted">Paste a link to your own lesson video for each standard. Students see a “Watch the lesson” button on their path and a link after a wrong answer.</p>
   <form class="grid" id="vids">${SKILLS.map(k=>`<label class="f">${esc(k.std)} ${esc(k.name)}<input id="v-${esc(k.id)}" data-k="${esc(k.id)}" type="url" placeholder="https://" value="${esc(db.videos[k.id]||"")}"></label>`).join("")}<button type="submit">Save links</button></form><p class="muted" id="v-msg" role="status"></p></div>
  <div class="card"><h2>This device</h2><p class="muted">${dev&&dev.join===c.join?`This device is set up for ${esc(c.name)}. Students only need their 4-digit code here.`:`Set up this device so students in ${esc(c.name)} only need their 4-digit code.`}</p>
   <div class="row">${dev&&dev.join===c.join?`<button class="ghost" id="dev-off">Forget this class on this device</button>`:`<button class="ghost" id="dev-on">Use this device for ${esc(c.name)}</button>`}</div></div>
  <div class="card"><h2>Delete class</h2><p class="muted">This removes the class, its students, and all of their progress.</p><div class="row" id="del-box"><button class="ghost" id="del">Delete ${esc(c.name)}</button></div><p class="err" id="del-err" role="alert"></p></div>`;
}
async function saveClass(patch){const c=CUR.cls;const d=await api("classSave",{id:c.id,name:c.name,teacherId:c.teacherId,testId:c.testId,goal:c.goal,mastery:c.mastery,tutor:c.tutor,chirp:c.chirp,kw:c.kw||"auto",flu:c.flu,games:c.games,ip:c.ip,videos:c.videos,...patch});Object.assign(TB,d);return d.cls}
function wireSettings(){
  const c=CUR.cls;
  document.getElementById("cs").onsubmit=async e=>{e.preventDefault();busy(e.submitter,"Saving…");
    const patch={name:document.getElementById("c-name").value,testId:document.getElementById("c-test").value,goal:+document.getElementById("c-goal").value,mastery:+document.getElementById("c-mast").value,tutor:document.getElementById("c-tutor").checked,chirp:document.getElementById("c-chirp").checked,music:document.getElementById("c-music").checked,chal:document.getElementById("c-chal").checked,...(document.getElementById("c-choose")?{choose:document.getElementById("c-choose").checked}:{}),dokmix:document.getElementById("c-dokmix").checked,buddy:document.getElementById("c-buddy").checked,handCool:+document.getElementById("c-hcool").value,gofur:document.getElementById("c-gofur").checked,kw:document.getElementById("c-kw").value,
      flu:{on:document.getElementById("c-flu").checked,n:+document.getElementById("c-fn").value,pass:+document.getElementById("c-fp").value,secs:Math.round(+document.getElementById("c-fs").value*60)},games:{on:document.getElementById("c-games").checked,mins:+document.getElementById("c-gm").value},ip:{on:document.getElementById("c-ip").checked,cut:+document.getElementById("c-ipc").value}};
    const ct=document.getElementById("c-t");if(ct)patch.teacherId=ct.value;
    try{const testChanged=patch.testId!==c.testId;await saveClass(patch);await openClass(c.id,"settings");flash("cs-msg",testChanged?`Saved. Students now practice ${testName(patch.testId)}.`:"Saved.");render()}
    catch(er){document.getElementById("cs-msg").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Save settings"}};
  document.getElementById("vids").onsubmit=async e=>{e.preventDefault();const videos={...(c.videos||{})};
    app.querySelectorAll("#vids input[data-k]").forEach(i=>{const v=i.value.trim();if(v)videos[i.dataset.k]=v;else delete videos[i.dataset.k]});
    busy(e.submitter,"Saving…");
    try{CUR.cls=await saveClass({videos});db.videos=CUR.cls.videos;flash("v-msg","Links saved.");render()}catch(er){document.getElementById("v-msg").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Save links"}};
  const gb=document.getElementById("gm-bonus");if(gb)gb.onclick=()=>giveBonus(gb);
  const on=document.getElementById("dev-on");if(on)on.onclick=()=>{ls.set(CKEY,{join:c.join,name:c.name,teacher:tName(c.teacherId)});render()};
  const off=document.getElementById("dev-off");if(off)off.onclick=()=>{ls.set(CKEY,null);render()};
  document.getElementById("del").onclick=()=>{document.getElementById("del-box").innerHTML=`<span>Delete ${esc(c.name)} and all progress? This can’t be undone.</span><button id="del-yes" style="background:var(--oops)">Delete</button><button class="ghost" id="del-no">Keep</button>`;
    document.getElementById("del-no").onclick=render;
    document.getElementById("del-yes").onclick=async()=>{try{Object.assign(TB,await api("classDelete",{id:c.id}));CUR=null;S.tt="classes";useTest(null);render()}catch(er){document.getElementById("del-err").textContent=er.message}}};
}

/* ---------- compare classes ---------- */
function classStats(entry){
  const studs=entry.students.map(viewStudent).filter(s=>!isSample(s)),N=studs.length;
  const finished=studs.filter(s=>!curSkill(s)).length;
  const withData=studs.filter(s=>Array.isArray(s.missed)),scored=studs.map(scorePct).filter(v=>v!=null);
  const testAvg=scored.length?Math.round(scored.reduce((a,v)=>a+v,0)/scored.length):null;
  let t=0,r=0,tut=0,active=0;const wk=Date.now()-7*864e5;
  studs.forEach(s=>{Object.values(s.prog.log).forEach(l=>{t+=l.tries;r+=l.right});t+=s.prog.prior?.tries||0;r+=s.prog.prior?.right||0;tut+=s.prog.tutor?.total||0;if((s.prog.last||0)>wk)active++});
  const std=SKILLS.map(k=>N?Math.round(studs.filter(s=>s.prog.skills[k.id].status!=="todo").length/N*100):null);
  const stdTest=SKILLS.map(k=>{if(!k.qs.length||!withData.length)return null;const qs=new Set(k.qs.map(Number));return Math.max(0,Math.min(100,Math.round(withData.reduce((a,s)=>a+(1-new Set(s.missed.map(Number).filter(n=>qs.has(n))).size/qs.size),0)/withData.length*100)))});
  return {cls:entry.cls,N,finished,fin:N?Math.round(finished/N*100):null,testAvg,acc:t?Math.round(r/t*100):null,answered:t,tut,active,std,stdTest,goal:entry.cls.goal};
}
function tCompare(){
  const tests=TB.tests.filter(t=>TB.classes.some(c=>c.testId===t.id));
  if(!TB.classes.length)return `<div class="card"><h2>Compare classes</h2><p class="muted">Make a class first.</p></div>`;
  if(!S.cmpTest||!tests.some(t=>t.id===S.cmpTest))S.cmpTest=(tests[0]||{id:"a1"}).id;
  const pick=`<div class="card"><h2>Compare classes</h2><p class="muted">${isAdmin()?"Every class in the school":"Your classes"} using the same test, side by side. Sample students are not counted.</p>
   <form class="grid" id="cmp-f"><label class="f">Test<select id="cmp-test">${testOpts(tests,S.cmpTest,t=>`${esc(t.name)} (${TB.classes.filter(c=>c.testId===t.id).length} classes)`)}</select></label>
   <label class="f">Group by<select id="cmp-g"><option value="t" ${S.cmpG!=="c"?"selected":""}>Teacher</option><option value="c" ${S.cmpG==="c"?"selected":""}>Class only</option></select></label></form></div>`;
  const D=S.cmp;
  if(!D||D.loading||D.test!==S.cmpTest)return pick+`<div class="card"><p class="muted">Loading classes…</p></div>`;
  if(D.err)return pick+`<div class="fb oops"><p>${esc(D.err)}</p></div>`;
  useTest(D.def);
  const st=D.data.map(classStats);
  const sum=list=>{const N=list.reduce((a,x)=>a+x.N,0),w=(f)=>{const xs=list.filter(x=>x[f]!=null&&x.N);const n=xs.reduce((a,x)=>a+x.N,0);return n?Math.round(xs.reduce((a,x)=>a+x[f]*x.N,0)/n):null};
    return {N,finished:list.reduce((a,x)=>a+x.finished,0),fin:N?Math.round(list.reduce((a,x)=>a+x.finished,0)/N*100):null,testAvg:w("testAvg"),acc:w("acc"),answered:list.reduce((a,x)=>a+x.answered,0),tut:list.reduce((a,x)=>a+x.tut,0),active:list.reduce((a,x)=>a+x.active,0),
      std:SKILLS.map((_,i)=>{const xs=list.filter(x=>x.std[i]!=null);const n=xs.reduce((a,x)=>a+x.N,0);return n?Math.round(xs.reduce((a,x)=>a+x.std[i]*x.N,0)/n):null}),
      stdTest:SKILLS.map((_,i)=>{const xs=list.filter(x=>x.stdTest[i]!=null);return xs.length?Math.round(xs.reduce((a,x)=>a+x.stdTest[i],0)/xs.length):null})}};
  const cell=v=>v==null?'<td class="muted">—</td>':`<td><span class="hc" style="--c:${heat(v)}">${v}%</span></td>`;
  const row=(x,label,sub,cls)=>`<tr class="${cls||""}"><td><b>${label}</b>${sub?`<br><span class="muted">${sub}</span>`:""}</td><td>${x.N}</td>${cell(x.testAvg)}${cell(x.fin)}${cell(x.acc)}<td>${x.answered}</td><td>${x.active}</td><td>${x.tut}</td></tr>`;
  let rows="";
  if(S.cmpG==="c")rows=st.map(x=>row(x,esc(x.cls.name),esc(tName(x.cls.teacherId)))).join("");
  else{const byT={};st.forEach(x=>(byT[x.cls.teacherId]=byT[x.cls.teacherId]||[]).push(x));
    rows=Object.entries(byT).map(([tid,list])=>row(sum(list),esc(tName(tid)),`${list.length} class${list.length===1?"":"es"}`,"tgrp")+list.map(x=>row(x,"&nbsp;&nbsp;"+esc(x.cls.name),"")).join("")).join("")}
  if(st.length>1)rows+=row(sum(st),"All classes","","tot");
  const bars=st.map(x=>`<div class="hb"><span class="hl2">${esc(x.cls.name)} <span class="muted">· ${esc(tName(x.cls.teacherId))}</span></span><span class="track"><span style="width:${x.fin||0}%"></span><i style="left:${x.goal}%" title="Goal ${x.goal}%"></i></span><b>${x.fin==null?"—":x.fin+"%"}</b></div>`).join("");
  const stdTable=`<div class="tablewrap"><table class="roster cmp"><thead><tr><th>Standard</th>${st.map(x=>`<th>${esc(x.cls.name)}<br><span style="text-transform:none">${esc(tName(x.cls.teacherId))}</span></th>`).join("")}${st.length>1?"<th>All</th>":""}</tr></thead><tbody>
    ${SKILLS.map((k,i)=>`<tr><td><b>${esc(k.std)}</b><br><span class="muted">${esc(k.name)}</span></td>${st.map(x=>cell(S.cmpM==="test"?x.stdTest[i]:x.std[i])).join("")}${st.length>1?cell(S.cmpM==="test"?sum(st).stdTest[i]:sum(st).std[i]):""}</tr>`).join("")}</tbody></table></div>`;
  return pick+`<div class="card"><h2>Class summary</h2>
   <div class="tablewrap"><table class="roster cmp"><thead><tr><th>${S.cmpG==="c"?"Class":"Teacher / class"}</th><th>Students</th><th>Test score</th><th>Finished path</th><th>Practice accuracy</th><th>Answered</th><th>Active this week</th><th>Asked Scout</th></tr></thead><tbody>${rows}</tbody></table></div>
   <p class="muted" style="font-size:.85rem">Test score is the average % right on ${esc(TEST_NAME)} for students whose scores you entered. Finished path means mastery on every standard they missed.</p></div>
   <div class="card"><h2>Finished their path</h2><p class="muted">The line on each bar is that class’s goal.</p><div class="hbars">${bars}</div></div>
   <div class="card"><div class="top"><h2>By standard</h2><div class="tabs" role="group" aria-label="Measure"><button class="small" data-m="prac" aria-pressed="${S.cmpM!=="test"}">Proficient now</button><button class="small" data-m="test" aria-pressed="${S.cmpM==="test"}">Right on the test</button></div></div>
    <p class="muted">${S.cmpM==="test"?"Average % right on each standard’s test questions.":"% of students who mastered the standard in practice or got it all right on the test."}</p>${stdTable}</div>`;
}
async function loadCompare(){
  const test=S.cmpTest,ids=TB.classes.filter(c=>c.testId===test).map(c=>c.id);
  S.cmp={test,loading:true};
  try{const def=await getTest(test),data=(await api("classData",{ids})).classes;S.cmp={test,def,data}}
  catch(e){S.cmp={test,err:e.message}}
  if(S.tt==="compare")render();
}
function wireCompare(){
  const f=document.getElementById("cmp-test");if(!f)return;
  f.onchange=e=>{S.cmpTest=e.target.value;S.cmp=null;render()};
  document.getElementById("cmp-g").onchange=e=>{S.cmpG=e.target.value;render()};
  app.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{S.cmpM=b.dataset.m;render()});
  if(!S.cmp||(S.cmp.test!==S.cmpTest&&!S.cmp.loading))loadCompare();
  else if(S.cmp.loading&&S.cmp.test!==S.cmpTest){S.cmp=null;loadCompare()}
}

/* ---------- teachers ---------- */
function tTeachers(){
  const me=TB.me;
  const account=`<div class="card"><h2>My account</h2><form class="grid" id="me-f"><label class="f">My name (what students see)<input id="me-name" value="${esc(me.name)}" required maxlength="60"></label>
    <label class="f">New teacher code (leave blank to keep)<input id="me-code" inputmode="numeric" pattern="[0-9]{4,6}"></label><button type="submit">Save</button></form><p class="muted" id="me-msg" role="status"></p>
    <h3 style="margin:.8rem 0 .2rem">Sign in with Google</h3>${me.googleEmail?`<p>Connected: <b>${esc(me.googleEmail)}</b>. You can sign in with Google instead of your code.</p><div class="row"><button class="ghost small" id="g-unlink">Disconnect Google</button></div>`
      :`<p class="muted small">Connect your school Google account once, and you can sign in with Google instead of typing your code.</p>${googleBox("g-link","Connect Google")}`}<p class="muted small" id="g-msg" role="status"></p></div>`;
  if(!isAdmin())return account;
  const count=id=>TB.classes.filter(c=>c.teacherId===id).length;
  return `${licenseCard()}<div class="card"><div class="top"><h2>Teachers</h2><span class="pill">${TB.teachers.length}</span></div>
   <div class="tablewrap"><table class="roster"><thead><tr><th>Teacher</th><th>Classes</th><th>Role</th><th></th></tr></thead><tbody>
   ${TB.teachers.map(t=>`<tr><td><b>${esc(t.name)}</b>${t.id===me.id?' <span class="muted">(you)</span>':""}</td><td>${count(t.id)}</td><td>${t.admin?'<span class="pill purple">Admin</span>':"Teacher"}</td><td>${t.id===me.id?"":`<button class="ghost small" data-et="${t.id}">Edit</button>`}</td></tr>`).join("")}</tbody></table></div>
   <p class="muted" style="font-size:.85rem">Admins can see and compare every class and add teachers. Teachers see only their own classes.</p></div>
  ${S.et?(()=>{const t=TB.teachers.find(x=>x.id===S.et);return `<div class="card"><h2>Edit ${esc(t.name)}</h2><form class="grid" id="et-f"><label class="f">Name<input id="et-name" value="${esc(t.name)}" required maxlength="60"></label>
    <label class="f">New code (leave blank to keep)<input id="et-code" inputmode="numeric" pattern="[0-9]{4,6}"></label><label class="f chk"><span><input type="checkbox" id="et-admin" ${t.admin?"checked":""}> School admin</span></label><button type="submit">Save</button></form>
    <div class="row" id="et-rm"><button class="ghost" id="et-del">Remove ${esc(t.name)}</button><button class="ghost" id="et-x">Close</button></div><p class="err" id="et-err" role="alert"></p></div>`})():""}
  <div class="card"><h2>Add a teacher</h2><p class="muted">Give each teacher their own code. They sign in with it and see only their classes.</p>
   <form class="grid" id="nt"><label class="f">Name (what students see)<input id="nt-name" required maxlength="60" placeholder="Ms. Rivera"></label><label class="f">Teacher code (4 to 6 digits)<input id="nt-code" inputmode="numeric" pattern="[0-9]{4,6}" required></label>
    <label class="f chk"><span><input type="checkbox" id="nt-admin"> School admin</span></label><button type="submit">Add teacher</button></form><p class="err" id="nt-err" role="alert"></p></div>
  <div class="card"><h2>Assign classes</h2><p class="muted">Pick the teacher for each class.</p>
   ${TB.classes.length?`<div class="tablewrap"><table class="roster"><thead><tr><th>Class</th><th>Test</th><th>Teacher</th></tr></thead><tbody>${TB.classes.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${esc(testName(c.testId))}</td><td><select data-asg="${c.id}" aria-label="Teacher for ${esc(c.name)}">${TB.teachers.map(t=>`<option value="${t.id}" ${t.id===c.teacherId?"selected":""}>${esc(t.name)}</option>`).join("")}</select></td></tr>`).join("")}</tbody></table></div><p class="muted" id="asg-msg" role="status"></p>`:`<p class="muted">No classes yet.</p>`}</div>
  ${backupCard()}${account}`;
}
function wireTeachers(){
  wireGoogle("g-link",async cred=>{try{TB={...TB,...(await api("googleLink",{credential:cred}))};flash("g-msg","Google connected. Next time, tap Sign in with Google.");render()}catch(e){const m=document.getElementById("g-msg");if(m)m.textContent=e.message}},"continue_with");
  const gu=document.getElementById("g-unlink");if(gu)gu.onclick=async()=>{if(!confirm("Disconnect Google? You'll sign in with your teacher code."))return;try{TB={...TB,...(await api("googleUnlink",{}))};render()}catch(e){document.getElementById("g-msg").textContent=e.message}};
  wireBackups();
  document.getElementById("me-f").onsubmit=async e=>{e.preventDefault();busy(e.submitter,"Saving…");
    try{Object.assign(TB,await api("teacherSave",{id:TB.me.id,name:document.getElementById("me-name").value,code:document.getElementById("me-code").value.trim()}));TEACHER=TB.me.name;flash("me-msg","Saved.");render()}
    catch(er){document.getElementById("me-msg").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Save"}};
  if(!isAdmin())return;
  app.querySelectorAll("[data-et]").forEach(b=>b.onclick=()=>{S.et=b.dataset.et;render()});
  const etf=document.getElementById("et-f");
  if(etf){etf.onsubmit=async e=>{e.preventDefault();busy(e.submitter,"Saving…");
      try{Object.assign(TB,await api("teacherSave",{id:S.et,name:document.getElementById("et-name").value,code:document.getElementById("et-code").value.trim(),admin:document.getElementById("et-admin").checked}));S.et=null;render()}
      catch(er){document.getElementById("et-err").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Save"}};
    document.getElementById("et-x").onclick=()=>{S.et=null;render()};
    document.getElementById("et-del").onclick=async()=>{try{Object.assign(TB,await api("teacherDelete",{id:S.et}));S.et=null;render()}catch(er){document.getElementById("et-err").textContent=er.message}}}
  document.getElementById("nt").onsubmit=async e=>{e.preventDefault();busy(e.submitter,"Adding…");
    try{Object.assign(TB,await api("teacherSave",{name:document.getElementById("nt-name").value,code:document.getElementById("nt-code").value.trim(),admin:document.getElementById("nt-admin").checked}));render()}
    catch(er){document.getElementById("nt-err").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Add teacher"}};
  app.querySelectorAll("[data-asg]").forEach(s=>s.onchange=async()=>{const c=TB.classes.find(x=>x.id===s.dataset.asg),msg=document.getElementById("asg-msg");
    try{Object.assign(TB,await api("classSave",{id:c.id,name:c.name,teacherId:s.value,testId:c.testId}));S.cmp=null;msg.textContent=`${c.name} now belongs to ${tName(s.value)}.`}catch(er){msg.textContent=er.message;s.value=c.teacherId}});
}

/* ---------- tests: list and import ---------- */
function tTests(){
  if(S.draft)return tDraft();
  const used=id=>TB.classes.filter(c=>c.testId===id);
  const mineT=(m=>m.length?m:isAdmin()?TB.classes:[])(TB.classes.filter(c=>c.teacherId===TB.me.id));
  const build=mineT.length?`<div class="card"><div class="top"><h2>Build a test</h2><span class="muted small">Your own test from any grade standard</span></div>
   <p class="muted">Pick standards and how many questions each gets, preview and swap questions, then assign it to a class or group. Pick the class:</p>
   <div class="row">${mineT.map(c=>`<button class="ghost" data-tbopen="${esc(c.id)}">＋ ${esc(c.name)}</button>`).join("")}</div></div>`:"";
  return build+`<div class="card"><h2>Tests</h2><p class="muted">Each class practices one test. Import a new test, then pick it in a class’s settings.</p>
   ${(()=>{const gr=t=>+t.id.slice(3),std=TB.tests.filter(t=>isStdT(t.id));return [["Math",std.filter(t=>!isSci(gr(t))&&!isELA(gr(t)))],["Science",std.filter(t=>isSci(gr(t)))],["Reading & language",std.filter(t=>isELA(gr(t)))],["Benchmark tests (enter missed question numbers)",TB.tests.filter(t=>!isStdT(t.id))]].filter(g=>g[1].length)})().map(([g,ts])=>{const nUse=ts.filter(t=>TB.classes.some(c=>c.testId===t.id)).length;return `<details class="tgrp" ${nUse?"open":""}><summary><b>${esc(g)}</b> <span class="muted">${ts.length} test${ts.length===1?"":"s"}${nUse?` · ${nUse} in use`:""}</span></summary><div class="tablewrap"><table class="roster"><thead><tr><th>Test</th><th>Questions</th><th>Standards</th><th>Used by</th><th></th></tr></thead><tbody>
   ${ts.map(t=>`<tr><td><b>${esc(t.name)}</b>${t.ownerId?`<br><span class="muted">by ${esc(tName(t.ownerId))}</span>`:""}</td><td>${t.nq}</td><td>${t.skills}</td><td>${used(t.id).map(c=>esc(c.name)).join(", ")||'<span class="muted">—</span>'}</td>
     <td>${t.builtIn?"":`<div class="row">${TB.ai?`<button class="ghost small" data-more="${t.id}">More practice</button>`:""}${(isAdmin()||t.ownerId===TB.me.id)?`<button class="ghost small" data-edt="${t.id}">Edit</button><button class="ghost small" data-delt="${t.id}">Delete</button>`:""}</div>`}</td></tr>`).join("")}</tbody></table></div></details>`}).join("")}
   <p class="err" id="t-err" role="alert">${esc(S.terr||"")}</p></div>
  <div class="card"><h2>Import a test from a PDF</h2>
   ${TB.ai?`<p class="muted">Upload the test as a PDF. The AI reads each page, writes down every question, finds the standard, and solves it if there is no answer key. You check everything before it’s saved. Then the AI writes the key words, step-by-step breakdowns, and practice questions.</p>
   <form class="grid" id="pdf-f"><label class="f">Test name<input id="pdf-name" required maxlength="80" placeholder="Assessment 2"></label><label class="f">Grade<select id="pdf-grade">${["K","1","2","3","4","5","6","7","8"].map(g=>`<option ${g==="3"?"selected":""}>${g}</option>`).join("")}<option value="9">Algebra I</option></select></label>
    <label class="f">PDF file<input type="file" id="pdf-file" accept="application/pdf,.pdf" required></label><p class="muted" style="margin:0;font-size:.85rem">🔒 Upload a <b>blank</b> test with no student names or answers. The pages are read by AI.</p><button type="submit">Read the test</button></form>
   <p class="muted" style="font-size:.85rem">Works best with a clear PDF (not a phone photo). Pictures in the test become written descriptions or simple drawings. Up to 40 pages.</p>`
   :`<p class="fb info">PDF import needs the AI. Ask the person who set up the site to add an Anthropic API key in Netlify (see the setup notes). CSV import below works without it.</p>`}
   <div id="pdf-prog"></div></div>
  <div class="card"><h2>Import a test from a spreadsheet</h2>
   <p class="muted">Save it as CSV with these columns: <b>Number, Standard, Skill, Question, A, B, C, D, Answer</b>. Answer is a letter (B), two letters for pick-two (A, D), or a number when there are no choices. ${TB.ai?"The AI then writes the breakdowns and practice.":""}</p>
   <form class="grid" id="csv-f"><label class="f">Test name<input id="csv-name" required maxlength="80" placeholder="Unit 3 quiz"></label><label class="f">Grade<select id="csv-grade">${["K","1","2","3","4","5","6","7","8"].map(g=>`<option ${g==="3"?"selected":""}>${g}</option>`).join("")}<option value="9">Algebra I</option></select></label>
    <label class="f">CSV file<input type="file" id="csv-file" accept=".csv,text/csv" required></label><button type="submit">Read the spreadsheet</button></form>
   <div class="row"><button class="link" id="csv-tpl">Download a sample CSV</button></div></div>`;
}
const progressHTML=(done,total,label)=>`<div class="fb info"><p><b>${esc(label)}</b> ${done} of ${total}</p><div class="meter"><span style="width:${total?Math.round(done/total*100):0}%"></span></div></div>`;
function wireTests(){
  app.querySelectorAll("[data-tbopen]").forEach(b=>b.onclick=async()=>{busy(b,"Opening…");await openClass(b.dataset.tbopen,"plan");if(CUR){S.tbld={n:{},ea:{}};S.tbSaved=false;render();const el=document.getElementById("tb");if(el)el.scrollIntoView({block:"start"})}});
  if(S.draft)return wireDraft();
  app.querySelectorAll("[data-delt]").forEach(b=>b.onclick=async()=>{const t=TB.tests.find(x=>x.id===b.dataset.delt);if(!confirm(`Delete ${t.name}? This can’t be undone.`))return;
    try{Object.assign(TB,await api("testDelete",{id:t.id}));delete TESTS[t.id];S.terr="";render()}catch(e){S.terr=e.message;render()}});
  app.querySelectorAll("[data-edt]").forEach(b=>b.onclick=async()=>{busy(b,"Opening…");try{const t=await getTest(b.dataset.edt);S.draft=draftFromTest(t);render()}catch(e){S.terr=e.message;render()}});
  app.querySelectorAll("[data-more]").forEach(b=>b.onclick=async()=>{busy(b,"Writing…");
    try{const t=JSON.parse(JSON.stringify(await getTest(b.dataset.more)));await addPractice(t,2,(d,n)=>{b.textContent=`Writing ${d}/${n}…`});
      const r=await api("testSave",{test:t});TESTS[t.id]=r.test;Object.assign(TB,r);S.terr="";render();alert("Added new practice questions to "+t.name+".")}
    catch(e){S.terr=e.message;render()}});
  const tpl=document.getElementById("csv-tpl");
  tpl.onclick=()=>download("test-sample.csv",`Number,Standard,Skill,Question,A,B,C,D,Answer\n1,3.OA.3,Multiplication and division word problems,"Sam has 3 bags with 4 apples in each bag. How many apples does Sam have?",7,12,1,34,B\n2,3.NBT.2,Adding and subtracting within 1000,What is 250 + 130?,,,,,380\n3,3.OA.1,What multiplication means,Which TWO show 3 groups of 4?,3 × 4,3 + 4,4 + 4 + 4,3 × 3,"A, C"\n`);
  document.getElementById("csv-f").onsubmit=async e=>{e.preventDefault();const f=document.getElementById("csv-file").files[0];if(!f)return;
    try{const qs=testFromCSV(await f.text());S.draft={name:document.getElementById("csv-name").value.trim(),grade:document.getElementById("csv-grade").value,qs,src:"csv"};render()}
    catch(er){S.terr=er.message;render()}};
  const pf=document.getElementById("pdf-f");
  if(pf)pf.onsubmit=async e=>{e.preventDefault();const f=document.getElementById("pdf-file").files[0];if(!f)return;
    const name=document.getElementById("pdf-name").value.trim(),grade=document.getElementById("pdf-grade").value,box=document.getElementById("pdf-prog");
    busy(e.submitter,"Reading…");
    try{S.draft={name,grade,qs:await readPDF(f,grade,(d,n)=>{box.innerHTML=progressHTML(d,n,"Reading pages…")}),src:"pdf"};render()}
    catch(er){box.innerHTML=`<p class="err">${esc(er.message)}</p>`;e.submitter.disabled=false;e.submitter.textContent="Read the test"}};
}
let PDFLIB=null;
function loadPdfLib(){return PDFLIB||(PDFLIB=new Promise((ok,no)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";s.onload=()=>ok(window.PDFLib);s.onerror=()=>{PDFLIB=null;no(new Error("Couldn’t load the PDF reader. Check the internet and try again."))};document.head.appendChild(s)}))}
const b64=bytes=>{let s="";for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));return btoa(s)};
async function pool(items,n,fn){const out=new Array(items.length);let i=0;await Promise.all(Array.from({length:Math.min(n,items.length)},async()=>{while(i<items.length){const j=i++;out[j]=await fn(items[j],j)}}));return out}
async function readPDF(file,grade,onProg){
  const {PDFDocument}=await loadPdfLib();
  let src;try{src=await PDFDocument.load(await file.arrayBuffer(),{ignoreEncryption:true})}catch(e){throw new Error("That file couldn’t be opened as a PDF.")}
  const n=src.getPageCount();if(n>40)throw new Error("That PDF has "+n+" pages. Split it into parts of 40 pages or fewer.");
  const pages=[];for(let i=0;i<n;i++){const d=await PDFDocument.create();const [p]=await d.copyPages(src,[i]);d.addPage(p);pages.push(await d.save())}
  if(pages.some(p=>p.length>4.2e6))throw new Error("One page of the PDF is too big. Try saving it again at a smaller size.");
  let done=0;onProg(0,n);const errs=[];
  const res=await pool(pages,3,async(bytes,i)=>{let r=null;for(let t=0;t<2&&!r;t++){try{r=await api("aiParse",{pdf:b64(bytes),page:i+1,of:n,grade})}catch(e){if(t)errs.push(`Page ${i+1}: ${e.message}`)}}done++;onProg(done,n);return r});
  const byN=new Map(),key={};
  res.forEach(r=>{if(!r)return;Object.assign(key,r.answerKey||{});(r.questions||[]).forEach(q=>{const n=+q.n;if(!n)return;const prev=byN.get(n);if(!prev||JSON.stringify(q).length>JSON.stringify(prev).length)byN.set(n,q)})});
  const qs=[...byN.values()].map(cleanQ).filter(Boolean).sort((a,b)=>a.n-b.n);
  qs.forEach(q=>{const k=key[q.n]||key[String(q.n)];if(k!=null&&k!==""){const v=keyAns(q,k);if(v!=null){q.ans=v;q.ansFrom="key"}}});
  if(!qs.length)throw new Error("No questions were found."+(errs.length?" "+errs[0]:""));
  if(errs.length)qs.warn=errs;
  return qs;
}
function keyAns(q,k){k=String(k).trim();if(q.type==="input"){const v=Number(k.replace(/,/g,""));return isNaN(v)?null:v}
  const l=[...k.toUpperCase().replace(/[^A-E]/g,"")];if(q.type==="multi")return l.length===2?l.sort():null;return l.length===1?l[0]:null}
/* make an AI or CSV question safe and complete enough to show */
function cleanQ(q){
  if(!q||typeof q!=="object")return null;
  const n=Math.round(+q.n);if(!(n>=1&&n<=200))return null;
  const s=(v,m=600)=>String(v??"").slice(0,m);
  let parts=(Array.isArray(q.parts)?q.parts:[q.parts||q.text||""]).map(p=>{
    if(typeof p==="string")return p.trim()?s(p,1200):null;
    if(!p||typeof p!=="object")return null;
    if(p.eq)return {eq:s(p.eq,200)};
    if(Array.isArray(p.table))return {table:p.table.slice(0,20).map(r=>(Array.isArray(r)?r:[r]).slice(0,10).map(c=>s(c,80))),...(Array.isArray(p.cols)?{cols:p.cols.slice(0,10).map(c=>s(c,80))}:{})};
    if(Array.isArray(p.arr))return {arr:[Math.min(12,Math.max(1,+p.arr[0]||1)),Math.min(12,Math.max(1,+p.arr[1]||1))]};
    if(Array.isArray(p.groups))return {groups:[Math.min(12,Math.max(1,+p.groups[0]||1)),Math.min(12,Math.max(1,+p.groups[1]||1))]};
    if(p.fig)return {fig:s(p.fig,400)};
    return null}).filter(Boolean);
  if(!parts.length)parts=["(Question text missing)"];
  let type=["mc","multi","input"].includes(q.type)?q.type:(Array.isArray(q.choices)&&q.choices.length?"mc":"input");
  let choices=Array.isArray(q.choices)?q.choices.slice(0,5).map(c=>typeof c==="string"||typeof c==="number"?s(c,300):c&&Array.isArray(c.groups)?{groups:[Math.min(12,+c.groups[0]||1),Math.min(12,+c.groups[1]||1)],...(c.eq?{eq:s(c.eq,60)}:{})}:c&&Array.isArray(c.table)?{table:c.table.slice(0,10).map(r=>(Array.isArray(r)?r:[r]).slice(0,6).map(x=>s(x,60))),head:""}:s(c&&(c.eq||c.text)||"",300)):[];
  if(type!=="input"&&choices.length<2)type="input";
  let ans=q.ans;
  if(type==="mc"){ans=String(ans??"").toUpperCase().replace(/[^A-E]/g,"")[0]||"";if(L.indexOf(ans)>=choices.length)ans=""}
  else if(type==="multi"){ans=[...new Set((Array.isArray(ans)?ans.join(""):String(ans??"")).toUpperCase().replace(/[^A-E]/g,""))].filter(l=>L.indexOf(l)<choices.length).sort();if(ans.length!==2)ans=ans.slice(0,2)}
  else {ans=Number(String(ans??"").replace(/,/g,""));if(isNaN(ans))ans="";choices=undefined}
  const txt=parts.map(p=>typeof p==="string"?p:p.eq||"").join(" ").split(/\s+/).map(w=>norm(w)).filter(Boolean);
  let keys=(Array.isArray(q.keys)?q.keys:[]).flatMap(k=>String(k).split(/\s+/)).map(norm).filter(k=>k&&txt.includes(k));
  if(keys.length<2)keys=autoKeys(txt);
  keys=[...new Set(keys)].slice(0,10);
  let steps=(Array.isArray(q.steps)?q.steps:[]).map(st=>st&&st.say?{say:s(st.say,500),...(st.show&&typeof st.show==="object"?{show:cleanShow(st.show)}:{})}:null).filter(Boolean).slice(0,8);
  const why={};if(q.why&&typeof q.why==="object")Object.entries(q.why).forEach(([k,v])=>{if(/^[A-E]$/.test(k))why[k]=s(v,400)});
  const out={n,std:s(q.std,20).trim()||"Other",skillName:s(q.skill||q.skillName,80).trim(),type,parts,keys,steps,why,ans,ansFrom:q.ansFrom||""};
  if(choices)out.choices=choices;
  if(type==="input"){out.whyElse=s(q.whyElse,400);out.whyIn={};if(q.whyIn&&typeof q.whyIn==="object")Object.entries(q.whyIn).slice(0,6).forEach(([k,v])=>out.whyIn[String(Number(k))]=s(v,300))}
  return out;
}
function cleanShow(sh){
  const nums=a=>Array.isArray(a)&&a.every(x=>x==null||typeof x==="number"||Array.isArray(x));
  if(sh.work&&typeof sh.work==="object"){const w=sh.work,t=v=>String(v??"").slice(0,12);return {work:{carry:t(w.carry),top:t(w.top),op:t(w.op).slice(0,2),bot:t(w.bot),res:t(w.res)}}}
  if(nums(sh.nl)&&sh.nl.length>=3&&+sh.nl[1]>+sh.nl[0]&&+sh.nl[2]>0&&(sh.nl[1]-sh.nl[0])/sh.nl[2]<=40)return {nl:[+sh.nl[0],+sh.nl[1],+sh.nl[2],(sh.nl[3]||[]).slice(0,6),sh.nl[4]??null,+sh.nl[5]||null]};
  for(const k of ["groups","arr","skip"])if(Array.isArray(sh[k]))return {[k]:[Math.min(12,Math.max(1,+sh[k][0]||1)),Math.min(12,Math.max(1,+sh[k][1]||1))]};
  if(Array.isArray(sh.chain))return {chain:sh.chain.slice(0,12).map(x=>String(x).slice(0,12))};
  if(Array.isArray(sh.table))return {table:sh.table.slice(0,10).map(r=>(Array.isArray(r)?r:[r]).slice(0,8).map(x=>String(x).slice(0,60)))};
  return undefined;
}
const KEYWORDS=new Set(["sum","difference","total","each","equal","equally","left","more","fewer","less","how","many","much","altogether","product","quotient","groups","rows","round","nearest","estimate","true","two","not","in","all","per"]);
function autoKeys(words){return [...new Set(words.filter(w=>/\d/.test(w)||KEYWORDS.has(w)||w==="∎"))].slice(0,8)}

function testFromCSV(text){
  const rows=parseCSV(text);if(rows.length<2)throw new Error("The file needs a header row and at least one question.");
  const h=rows[0].map(x=>x.toLowerCase().replace(/[^a-z0-9]/g,""));
  const col=re=>h.findIndex(x=>re.test(x));
  const ni=col(/^(number|num|no|n|questionnumber|q|item)$/),si=col(/^(standard|std|ccss)$/),ki=col(/^(skill|skillname|topic)$/),qi=col(/^(question|text|prompt|questiontext|stem)$/),ai=col(/^(answer|correct|key|correctanswer|ans)$/);
  const ci=["a","b","c","d","e"].map(l=>col(new RegExp(`^(${l}|choice${l}|option${l})$`)));
  if(qi<0||ai<0)throw new Error("The CSV needs at least a Question column and an Answer column.");
  const qs=[];rows.slice(1).forEach((r,i)=>{const text=(r[qi]||"").trim();if(!text)return;
    const choices=ci.map(c=>c>=0?(r[c]||"").trim():"").filter(c=>c!=="");
    const a=(r[ai]||"").trim(),letters=a.toUpperCase().replace(/[^A-E]/g,"");
    const type=!choices.length?"input":letters.length===2?"multi":"mc";
    const q=cleanQ({n:ni>=0?+r[ni]||i+1:i+1,std:si>=0?r[si]:"",skill:ki>=0?r[ki]:"",type,parts:text.split(/\n\s*\n/),choices,ans:type==="multi"?[...letters]:type==="mc"?letters[0]:a,ansFrom:"key"});
    if(q)qs.push(q)});
  if(!qs.length)throw new Error("No questions were found in the file.");
  return qs;
}

/* review screen before saving a test */
const partText=p=>typeof p==="string"?p:p.eq?"= "+p.eq:"";
function tDraft(){
  const D=S.draft,qs=D.qs,needAns=q=>q.type==="input"?q.ans===""||q.ans==null:q.type==="multi"?q.ans.length!==2:!q.ans;
  const solved=qs.filter(q=>q.ansFrom==="solved").length,missing=qs.filter(needAns).length;
  return `<div class="card"><div class="top"><h2>Check the test: ${esc(D.name)}</h2><button class="ghost small" id="dr-x">Cancel</button></div>
   <p class="muted">${qs.length} question${qs.length===1?"":"s"} found. Fix anything that looks wrong, then save. ${solved?`<b>${solved} answer${solved===1?" was":"s were"} solved by the AI</b> because no answer key was found: check those (marked in purple).`:""} ${missing?`<b style="color:var(--oops)">${missing} need${missing===1?"s":""} an answer.</b>`:""}</p>
   ${(qs.warn||[]).map(w=>`<p class="err">${esc(w)}</p>`).join("")}
   <form class="grid" id="dr-meta"><label class="f">Test name<input id="dr-name" value="${esc(D.name)}" maxlength="80"></label><label class="f">Grade<input id="dr-grade" value="${esc(D.grade||"")}" maxlength="4"></label></form></div>
  ${qs.map((q,i)=>`<div class="card dq${q.ansFrom==="solved"?" solved":""}${needAns(q)?" need":""}" data-i="${i}">
    <div class="grid dqg">
     <label class="f">Number<input data-f="n" type="number" min="1" max="200" value="${q.n}"></label>
     <label class="f">Standard<input data-f="std" value="${esc(q.std)}" maxlength="20"></label>
     <label class="f" style="grid-column:span 2">Skill name (same name = same checkpoint)<input data-f="skillName" value="${esc(q.skillName)}" maxlength="80"></label>
     <label class="f">Type<select data-f="type"><option value="mc" ${q.type==="mc"?"selected":""}>Pick one</option><option value="multi" ${q.type==="multi"?"selected":""}>Pick two</option><option value="input" ${q.type==="input"?"selected":""}>Type a number</option></select></label>
    </div>
    <label class="f">Question (blank line = new paragraph; start a line with “= ” for an equation line)<textarea data-f="text" rows="${Math.min(8,2+q.parts.length)}">${esc(q.parts.map(partText).filter(Boolean).join("\n\n"))}</textarea></label>
    ${q.parts.some(p=>typeof p!=="string"&&!p.eq)?`<div class="muted" style="font-size:.85rem">Pictures kept with this question: ${q.parts.filter(p=>typeof p!=="string"&&!p.eq).map(p=>p.fig?`“${esc(p.fig)}”`:p.table?"a table":p.arr?`an array (${p.arr.join(" × ")})`:p.groups?`equal groups (${p.groups.join(" of ")})`:"a picture").join(", ")}</div>`:""}
    ${q.type!=="input"?`<label class="f">Choices (one per line, in order A, B, C…)<textarea data-f="choices" rows="${Math.max(3,(q.choices||[]).length)}">${esc((q.choices||[]).map(c=>typeof c==="string"?c:c.eq||(c.groups?`${c.groups[0]} groups of ${c.groups[1]}`:"[table]")).join("\n"))}</textarea></label>`:""}
    <div class="row"><label class="f">Answer ${q.ansFrom==="solved"?'<span class="pill purple">AI solved: check</span>':""}<input data-f="ans" value="${esc(Array.isArray(q.ans)?q.ans.join(", "):q.ans)}" placeholder="${q.type==="input"?"380":q.type==="multi"?"A, D":"B"}" style="width:120px"></label>
     <button class="ghost small" type="button" data-rmq="${i}" style="align-self:flex-end">Remove question</button></div>
  </div>`).join("")}
  <div class="card"><h2>Save the test</h2>
   <p class="muted">${TB.ai?"The AI will now write key words, step-by-step breakdowns, why-wrong notes, and 3 practice questions for each standard. This takes about a minute.":"Without the AI, students get the test questions with short hints. You can add the AI later."}</p>
   <div class="row"><button id="dr-save">Save test</button>${TB.ai?`<label class="chk muted"><input type="checkbox" id="dr-prac" checked> Make practice questions</label>`:""}</div><div id="dr-prog"></div><p class="err" id="dr-err" role="alert"></p></div>`;
}
function readDraftForm(){
  const D=S.draft;D.name=document.getElementById("dr-name").value.trim()||D.name;D.grade=document.getElementById("dr-grade").value.trim();
  app.querySelectorAll(".dq").forEach(card=>{const q=D.qs[+card.dataset.i],v=f=>card.querySelector(`[data-f="${f}"]`)?.value;
    const oldText=q.parts.map(partText).filter(Boolean).join("\n\n"),text=v("text")||"";
    q.n=Math.round(+v("n"))||q.n;q.std=(v("std")||"").trim()||"Other";q.skillName=(v("skillName")||"").trim();
    const type=v("type");
    if(text.trim()!==oldText.trim()){const pics=q.parts.filter(p=>typeof p!=="string"&&!p.eq);q.parts=[...text.split(/\n\s*\n/).map(t=>t.trim()).filter(Boolean).map(t=>t.startsWith("= ")?{eq:t.slice(2)}:t),...pics];q.keys=[];q.steps=[];q.why={}}
    if(type!=="input"){const lines=(v("choices")??"").split("\n").map(x=>x.trim()).filter(Boolean);
      const old=(q.choices||[]).map(c=>typeof c==="string"?c:c.eq||(c.groups?`${c.groups[0]} groups of ${c.groups[1]}`:"[table]"));
      if(JSON.stringify(lines)!==JSON.stringify(old)){q.choices=lines.map((l,j)=>l==="[table]"&&q.choices?.[j]?.table?q.choices[j]:l);q.steps=[];q.why={}}
      if(q.type==="input"&&!lines.length)q.choices=["",""]}
    const a=(v("ans")||"").trim(),before=JSON.stringify(q.ans);
    if(type!==q.type){q.type=type;q.steps=[];q.why={};if(type==="input")delete q.choices;else if(!q.choices||q.choices.length<2)q.choices=["",""]}
    q.ans=keyAns(q,a)??(type==="input"?"":type==="multi"?[]:"");
    if(JSON.stringify(q.ans)!==before){q.ansFrom="teacher";q.steps=[];q.why={}}
  });
}
function wireDraft(){
  document.getElementById("dr-x").onclick=()=>{if(confirm("Throw away this test?")){S.draft=null;render()}};
  app.querySelectorAll("[data-rmq]").forEach(b=>b.onclick=()=>{readDraftForm();S.draft.qs.splice(+b.dataset.rmq,1);render()});
  app.querySelectorAll('.dq select[data-f="type"]').forEach(s=>s.onchange=()=>{readDraftForm();render()});
  document.getElementById("dr-save").onclick=async()=>{
    readDraftForm();const D=S.draft,err=document.getElementById("dr-err"),prog=document.getElementById("dr-prog"),btn=document.getElementById("dr-save");
    const nums=D.qs.map(q=>q.n);if(new Set(nums).size!==nums.length){err.textContent="Two questions have the same number. Give each question its own number.";return}
    const bad=D.qs.find(q=>q.type==="input"?q.ans===""||isNaN(q.ans):q.type==="multi"?q.ans.length!==2:!q.ans||L.indexOf(q.ans)>=q.choices.length);
    if(bad){err.textContent=`Question ${bad.n} needs a correct answer${bad.type==="multi"?" (two letters, like A, D)":""}.`;return}
    if(D.qs.some(q=>q.type!=="input"&&q.choices.filter(c=>c!=="").length<2)){err.textContent="Every pick-one or pick-two question needs at least 2 choices.";return}
    err.textContent="";busy(btn,"Saving…");
    try{const t=await buildTest(D,(label,d,n)=>{prog.innerHTML=progressHTML(d,n,label)},document.getElementById("dr-prac")?.checked);
      const r=await api("testSave",{test:t});TESTS[r.test.id]=r.test;Object.assign(TB,r);S.draft=null;S.terr="";render();
      alert(`Saved “${r.test.name}”. To use it, open a class and pick it in Class settings.`)}
    catch(e){err.textContent=e.message;btn.disabled=false;btn.textContent="Try again"}};
}
function draftFromTest(t){
  const qs=Object.values(t.qs).filter(q=>q.n).sort((a,b)=>a.n-b.n).map(q=>{const k=t.skills.find(x=>x.id===q.skill)||{};return {...JSON.parse(JSON.stringify(q)),std:k.std||"",skillName:k.name||"",ansFrom:"key"}});
  return {id:t.id,name:t.name,grade:t.grade,qs,practice:t.practice,src:"edit"};
}
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,30)||"skill";
async function buildTest(D,onProg,withPractice){
  /* checkpoints: one per standard + skill name */
  const skills=[],idOf={};
  D.qs.slice().sort((a,b)=>a.n-b.n).forEach(q=>{const key=q.std+"|"+(q.skillName||q.std);
    if(!idOf[key]){let id=slug(q.std+"-"+(q.skillName||""));while(skills.some(k=>k.id===id))id+="x";idOf[key]=id;skills.push({id,std:q.std,name:q.skillName||("Standard "+q.std),qs:[]})}
    skills.find(k=>k.id===idOf[key]).qs.push(q.n)});
  /* breakdowns */
  const need=D.qs.filter(q=>!q.steps||!q.steps.length);
  if(TB.ai&&need.length){
    const batches=[];for(let i=0;i<need.length;i+=3)batches.push(need.slice(i,i+3));let done=0;onProg("Writing breakdowns…",0,need.length);
    await pool(batches,3,async b=>{const send=b.map(q=>({n:q.n,std:q.std,skill:q.skillName,type:q.type,parts:q.parts,choices:q.choices,ans:q.ans}));
      for(let t=0;t<2;t++){try{const r=await api("aiEnrich",{questions:send,grade:D.grade});
        r.questions.forEach(x=>{const q=b.find(y=>y.n===+x.n);if(!q)return;const c=cleanQ({...x,parts:q.parts,choices:q.choices,ans:q.ans,type:q.type});if(c){q.keys=c.keys;q.steps=c.steps;q.why=c.why;if(q.type==="input"){q.whyElse=c.whyElse;q.whyIn=c.whyIn}}});break}catch(e){if(t)console.warn(e)}}
      done+=b.length;onProg("Writing breakdowns…",done,need.length)});
  }
  const qs={};
  D.qs.forEach(q=>{const sk=skills.find(k=>k.qs.includes(q.n));
    const x={n:q.n,skill:sk.id,type:q.type,parts:q.parts,keys:q.keys&&q.keys.length?q.keys:autoKeys(q.parts.map(p=>typeof p==="string"?p:p.eq||"").join(" ").split(/\s+/).map(norm).filter(Boolean)),
      steps:q.steps&&q.steps.length?q.steps:[{say:"Read the question slowly. Find the numbers and the words that tell you what to do."},{say:`The answer is ${Array.isArray(q.ans)?q.ans.join(" and "):q.ans}. Ask Scout or your teacher to show you why.`}],
      why:q.why||{},ans:q.ans};
    if(q.type!=="input")x.choices=q.choices;else{x.whyElse=q.whyElse||"";x.whyIn=q.whyIn||{}}
    if(x.keys.length<1)x.keys=[norm(String(x.parts.find(p=>typeof p==="string")||"").split(/\s+/)[0]||"")].filter(Boolean);
    qs["q"+q.n]=x});
  const t={id:D.id,name:D.name,grade:D.grade,skills,qs,practice:{}};
  /* keep practice that still matches a checkpoint */
  if(D.practice)Object.entries(D.practice).forEach(([k,v])=>{if(skills.some(s=>s.id===k))t.practice[k]=v});
  if(TB.ai&&withPractice)await addPractice(t,3,(d,n)=>onProg("Writing practice questions…",d,n),true);
  return t;
}
async function addPractice(t,n,onProg,onlyEmpty){
  const todo=t.skills.filter(k=>!onlyEmpty||!(t.practice?.[k.id]||[]).length);t.practice=t.practice||{};let done=0;onProg(0,todo.length);
  await pool(todo,3,async k=>{const ex=k.qs.slice(0,3).map(n=>{const q=t.qs["q"+n];return {std:k.std,skill:k.name,type:q.type,parts:q.parts,choices:q.choices,ans:q.ans}});
    for(let a=0;a<2;a++){try{const r=await api("aiPractice",{std:k.std,skill:k.name,examples:ex,n,grade:t.grade});
      const list=r.questions.map((x,i)=>cleanQ({...x,n:i+1})).filter(q=>q&&q.steps.length&&(q.type==="input"?q.ans!=="":q.type==="multi"?q.ans.length===2:q.ans))
        .map(q=>{const o={skill:k.id,type:q.type,parts:q.parts.filter(p=>!p.fig),keys:q.keys,steps:q.steps,why:q.why,ans:q.ans};if(q.type!=="input")o.choices=q.choices;else{o.whyElse=q.whyElse;o.whyIn=q.whyIn}return o});
      t.practice[k.id]=[...(t.practice[k.id]||[]),...list].slice(-30);break}catch(e){if(a)console.warn(e)}}
    done++;onProg(done,todo.length)});
}




/* ---------- Pacing guide: the weeks left before the state test, with standards grouped the way teachers teach them ---------- */
const PACE3=[
 {id:"mult",name:"What multiplication and division mean",stds:["3.OA.1","3.OA.2","3.OA.3","3.OA.4"],how:"together",wt:"major",wk:3,why:"These four are one idea: equal groups. Teach groups, arrays and sharing side by side so kids see division as the other half of multiplication."},
 {id:"facts",name:"Properties and fact strategies",stds:["3.OA.5","3.OA.6","3.OA.7","3.NBT.3"],how:"together",wt:"major",wk:3,why:"Turn-around and break-apart strategies are how kids learn their facts. Multiplying by 10s fits here because it uses the same facts."},
 {id:"area",name:"Area and its link to multiplication",stds:["3.MD.5a","3.MD.5b","3.MD.6","3.MD.7a","3.MD.7b","3.MD.7c","3.MD.7d"],how:"together",wt:"major",wk:3,why:"Area is multiplication you can see. Teach it right after facts: rows times columns, then breaking a rectangle apart (the break-apart property again)."},
 {id:"frac",name:"Fractions",stds:["3.G.2","3.NF.1","3.NF.2a","3.NF.2b","3.NF.3a","3.NF.3b","3.NF.3c","3.NF.3d"],how:"together",wt:"major",wk:4,why:"Start with equal parts of shapes (3.G.2), then unit fractions, the number line, equivalence and comparing. Denominators stay 2, 3, 4, 6 and 8."},
 {id:"two",name:"Two-step problems and patterns",stds:["3.OA.8","3.OA.9"],how:"together",wt:"major",wk:2,why:"Best after multiplication and addition are solid, because two-step problems use all four operations. Patterns in the times table fit here."},
 {id:"pv",name:"Rounding, adding and subtracting",stds:["3.NBT.1","3.NBT.2"],how:"together",wt:"support",wk:2,why:"Rounding helps kids check if a sum or difference makes sense. Keep 3.NBT.2 going as daily fluency all year."},
 {id:"perim",name:"Perimeter",stds:["3.MD.8"],how:"alone",wt:"support",wk:1,why:"Teach on its own after area, so kids can compare the two: area covers the inside, perimeter goes around."},
 {id:"data",name:"Graphs and line plots",stds:["3.MD.3","3.MD.4"],how:"embed",wt:"support",wk:1.5,why:"Easy to fold into other units: scaled graphs practice multiplication, and line plots with halves and fourths practice fractions."},
 {id:"meas",name:"Time, liquid volume and mass",stds:["3.MD.1","3.MD.2"],how:"alone",wt:"extra",wk:1.5,why:"Short, hands-on lessons that stand on their own. Good for the week before a break."},
 {id:"shape",name:"Shapes and quadrilaterals",stds:["3.G.1"],how:"alone",wt:"extra",wk:1,why:"A quick unit on its own. Sorting shapes by their sides and angles."}];
const PACE_G={3:PACE3,4:[{id:"pv",name:"Place value, rounding, adding and subtracting",stds:["4.NBT.1","4.NBT.2","4.NBT.3","4.NBT.4"],how:"together",wt:"major",wk:3,why:"Reading, comparing and rounding big numbers sets up the standard algorithm for adding and subtracting. Keep 4.NBT.4 going as daily fluency."},{id:"mult",name:"Multiplying multi-digit numbers",stds:["4.OA.1","4.OA.2","4.NBT.5"],how:"together",wt:"major",wk:3,why:"Comparison problems (“3 times as many”) give multiplication a reason. Use area models before the algorithm."},{id:"div",name:"Dividing with remainders",stds:["4.NBT.6","4.OA.3"],how:"together",wt:"major",wk:3,why:"Teach division with area models and place value, then multi-step word problems where kids decide what the remainder means."},{id:"fact",name:"Factors, multiples and patterns",stds:["4.OA.4","4.OA.5"],how:"together",wt:"support",wk:1.5,why:"Factors and multiples help with equivalent fractions, so teach them right before fractions."},{id:"equiv",name:"Equivalent fractions and comparing",stds:["4.NF.1","4.NF.2"],how:"together",wt:"major",wk:2,why:"Equivalence first: it is the key to comparing and to adding fractions later."},{id:"fops",name:"Adding, subtracting and multiplying fractions",stds:["4.NF.3a","4.NF.3b","4.NF.3c","4.NF.3d","4.NF.4a","4.NF.4b","4.NF.4c"],how:"together",wt:"major",wk:4,why:"Build fractions from unit fractions, add and subtract like denominators and mixed numbers, then multiply a fraction by a whole number."},{id:"dec",name:"Decimals and fractions",stds:["4.NF.5","4.NF.6","4.NF.7"],how:"together",wt:"major",wk:2,why:"Tenths and hundredths are just fractions with denominators 10 and 100. Teach right after fractions."},{id:"meas",name:"Measurement, area and perimeter",stds:["4.MD.1","4.MD.2","4.MD.3"],how:"together",wt:"support",wk:2,why:"Unit conversions and the area and perimeter formulas use the multiplication and fraction work already taught."},{id:"plot",name:"Line plots with fractions",stds:["4.MD.4"],how:"embed",wt:"support",wk:1,why:"Fold into the fractions unit: line plots in eighths are great fraction practice."},{id:"geo",name:"Angles, lines and shapes",stds:["4.MD.5a","4.MD.5b","4.MD.6","4.MD.7","4.G.1","4.G.2","4.G.3"],how:"together",wt:"extra",wk:3,why:"Angles, measuring with a protractor and classifying shapes by lines and angles belong together."}],5:[{id:"pv",name:"Place value, powers of 10 and decimals",stds:["5.NBT.1","5.NBT.2","5.NBT.3a","5.NBT.3b","5.NBT.4"],how:"together",wt:"major",wk:3,why:"Powers of 10 explain how decimals work. Read, compare and round decimals before computing with them."},{id:"mult",name:"Multiplying and dividing whole numbers",stds:["5.NBT.5","5.NBT.6"],how:"together",wt:"major",wk:3,why:"The standard multiplication algorithm (a 5th grade fluency) and division with 2-digit divisors."},{id:"decop",name:"Operations with decimals",stds:["5.NBT.7"],how:"alone",wt:"major",wk:3,why:"Add, subtract, multiply and divide decimals to hundredths, using models and place value, not just rules."},{id:"expr",name:"Expressions and patterns",stds:["5.OA.1","5.OA.2","5.OA.3"],how:"together",wt:"extra",wk:2,why:"Parentheses, writing expressions and number patterns. Patterns lead into graphing on the coordinate plane."},{id:"addf",name:"Adding and subtracting fractions",stds:["5.NF.1","5.NF.2"],how:"together",wt:"major",wk:3,why:"Unlike denominators: find equivalent fractions with a common denominator, then estimate to check."},{id:"mulf",name:"Multiplying fractions",stds:["5.NF.3","5.NF.4a","5.NF.4b","5.NF.5a","5.NF.5b","5.NF.6"],how:"together",wt:"major",wk:3,why:"Fractions as division, then fraction times fraction with area models, and how multiplying can make a number smaller."},{id:"divf",name:"Dividing with unit fractions",stds:["5.NF.7a","5.NF.7b","5.NF.7c"],how:"together",wt:"major",wk:2,why:"Right after multiplying fractions: unit fraction ÷ whole number and whole number ÷ unit fraction."},{id:"vol",name:"Volume",stds:["5.MD.3a","5.MD.3b","5.MD.4","5.MD.5a","5.MD.5b","5.MD.5c"],how:"together",wt:"major",wk:2.5,why:"Count unit cubes, then connect to length × width × height and adding volumes."},{id:"conv",name:"Converting measurements",stds:["5.MD.1"],how:"alone",wt:"support",wk:1,why:"A short unit that uses multiplying and dividing by powers of 10."},{id:"plot",name:"Line plots with fractions",stds:["5.MD.2"],how:"embed",wt:"support",wk:1,why:"Fold into the fraction units: line plots make great fraction practice."},{id:"coord",name:"Coordinate plane and classifying shapes",stds:["5.G.1","5.G.2","5.G.3","5.G.4"],how:"together",wt:"extra",wk:2,why:"Graph points in the first quadrant (patterns from 5.OA.3 fit here), then sort 2D shapes by their properties."}],6:[{id:"ratio",name:"Ratios and rates",stds:["6.RP.1","6.RP.2","6.RP.3","6.RP.3a","6.RP.3b","6.RP.3c","6.RP.3d"],how:"together",wt:"major",wk:4,why:"Ratio language, tables, unit rates, percents and unit conversions are one connected idea."},{id:"divf",name:"Dividing fractions",stds:["6.NS.1"],how:"alone",wt:"major",wk:1.5,why:"Fraction division word problems, with models first."},{id:"comp",name:"Multi-digit and decimal computation",stds:["6.NS.2","6.NS.3"],how:"together",wt:"support",wk:1.5,why:"The two 6th grade fluencies: long division and all four operations with decimals. Keep them going all year."},{id:"gcf",name:"Factors and multiples",stds:["6.NS.4"],how:"alone",wt:"support",wk:1,why:"GCF and LCM, plus the distributive property. Useful right before expressions."},{id:"rat",name:"Negative numbers and the coordinate plane",stds:["6.NS.5","6.NS.6","6.NS.6a","6.NS.6b","6.NS.6c","6.NS.7","6.NS.7a","6.NS.7b","6.NS.7c","6.NS.7d","6.NS.8"],how:"together",wt:"major",wk:3,why:"Opposites, absolute value, ordering and the four-quadrant coordinate plane."},{id:"int",name:"Adding and subtracting integers",stds:["6.NS.9a","6.NS.9b","6.NS.9c","6.NS.9d"],how:"together",wt:"major",wk:2,why:"Right after the number line: opposites make zero, then adding and subtracting integers."},{id:"expr",name:"Expressions and exponents",stds:["6.EE.1","6.EE.2","6.EE.2a","6.EE.2b","6.EE.2c","6.EE.3","6.EE.4"],how:"together",wt:"major",wk:3,why:"Write, read and evaluate expressions, then equivalent expressions with the distributive property."},{id:"eq",name:"Equations and inequalities",stds:["6.EE.5","6.EE.6","6.EE.7","6.EE.8","6.EE.9"],how:"together",wt:"major",wk:3,why:"Variables, one-step equations, inequalities, and tables and graphs of two related quantities."},{id:"geo",name:"Area, surface area and volume",stds:["6.G.1","6.G.2","6.G.3","6.G.4"],how:"together",wt:"support",wk:2,why:"Area of triangles and polygons, volume with fractional edges, and nets for surface area."},{id:"stats",name:"Statistics",stds:["6.SP.1","6.SP.2","6.SP.3","6.SP.4","6.SP.5a","6.SP.5b","6.SP.5c","6.SP.5d"],how:"together",wt:"support",wk:2.5,why:"Statistical questions, center and spread, and displays like dot plots, histograms and box plots."}],7:[{id:"prop",name:"Proportional relationships",stds:["7.RP.1","7.RP.2a","7.RP.2b","7.RP.2c","7.RP.2d"],how:"together",wt:"major",wk:3,why:"Unit rates with fractions, and recognizing proportional relationships in tables, graphs and equations."},{id:"addr",name:"Adding and subtracting rational numbers",stds:["7.NS.1a","7.NS.1b","7.NS.1c","7.NS.1d"],how:"together",wt:"major",wk:2,why:"Use the number line for adding and subtracting positive and negative numbers."},{id:"mulr",name:"Multiplying and dividing rational numbers",stds:["7.NS.2a","7.NS.2b","7.NS.2c","7.NS.2d","7.NS.3"],how:"together",wt:"major",wk:2.5,why:"Sign rules, converting fractions to decimals, and word problems with all four operations."},{id:"expr",name:"Expressions",stds:["7.EE.1","7.EE.2"],how:"together",wt:"major",wk:2,why:"Combine like terms, factor and expand, and rewrite expressions to see a problem in a new way."},{id:"pct",name:"Percents and multi-step problems",stds:["7.RP.3","7.EE.3"],how:"together",wt:"major",wk:2,why:"Tax, tip, discount and percent change, solved with proportions and estimation."},{id:"eq",name:"Equations and inequalities",stds:["7.EE.4a","7.EE.4b"],how:"together",wt:"major",wk:2.5,why:"Two-step equations and inequalities from word problems."},{id:"scale",name:"Scale drawings and constructions",stds:["7.G.1","7.G.2","7.G.3"],how:"together",wt:"support",wk:1.5,why:"Scale drawings use proportional reasoning; then drawing shapes and cross sections."},{id:"circ",name:"Circles, angles, area and volume",stds:["7.G.4","7.G.5","7.G.6"],how:"together",wt:"support",wk:2,why:"Circle formulas, angle relationships, and area, surface area and volume problems."},{id:"samp",name:"Sampling and comparing groups",stds:["7.SP.1","7.SP.2","7.SP.3","7.SP.4"],how:"together",wt:"support",wk:1.5,why:"Random samples and comparing two groups with center and spread."},{id:"prob",name:"Probability",stds:["7.SP.5","7.SP.6","7.SP.7a","7.SP.7b","7.SP.8a","7.SP.8b","7.SP.8c"],how:"together",wt:"support",wk:2,why:"Probability models, experiments and compound events."}],8:[{id:"exp",name:"Exponents and scientific notation",stds:["8.EE.1","8.EE.3","8.EE.4"],how:"together",wt:"major",wk:2,why:"Exponent rules lead straight into scientific notation."},{id:"roots",name:"Roots and irrational numbers",stds:["8.NS.1","8.NS.2","8.EE.2"],how:"together",wt:"support",wk:1.5,why:"Square and cube roots, and placing irrational numbers on the number line. Sets up the Pythagorean theorem."},{id:"lin",name:"Slope and proportional relationships",stds:["8.EE.5","8.EE.6"],how:"together",wt:"major",wk:2,why:"Graph proportional relationships, then use similar triangles to explain slope."},{id:"eq",name:"Solving linear equations",stds:["8.EE.7a","8.EE.7b"],how:"together",wt:"major",wk:2,why:"Multi-step equations, including one, none or infinitely many solutions."},{id:"sys",name:"Systems of equations",stds:["8.EE.8a","8.EE.8b","8.EE.8c"],how:"together",wt:"major",wk:2.5,why:"Solve by graphing, substitution and inspection, right after solving single equations."},{id:"func",name:"Functions",stds:["8.F.1","8.F.2","8.F.3","8.F.4","8.F.5"],how:"together",wt:"major",wk:3,why:"Define, compare and build linear functions, and describe graphs in words."},{id:"trans",name:"Transformations, congruence and similarity",stds:["8.G.1a","8.G.1b","8.G.1c","8.G.2","8.G.3","8.G.4"],how:"together",wt:"major",wk:3,why:"Rotations, reflections, translations and dilations explain congruence and similarity."},{id:"ang",name:"Angle relationships",stds:["8.G.5"],how:"alone",wt:"major",wk:1,why:"Angles in triangles and with parallel lines. Builds on transformations."},{id:"pyth",name:"Pythagorean theorem",stds:["8.G.6","8.G.7","8.G.8"],how:"together",wt:"major",wk:2,why:"Explain it, use it, and find distance on the coordinate plane."},{id:"vol",name:"Volume of cylinders, cones and spheres",stds:["8.G.9"],how:"alone",wt:"support",wk:1,why:"A short unit after the Pythagorean theorem."},{id:"scat",name:"Scatter plots and two-way tables",stds:["8.SP.1","8.SP.2","8.SP.3","8.SP.4"],how:"together",wt:"support",wk:2,why:"Patterns in data, lines of fit, and two-way tables. Connects to linear functions."}],9:[{id:"quant",name:"Units, quantities and real numbers",stds:["N-Q.1","N-Q.2","N-Q.3","N-RN.3"],how:"together",wt:"support",wk:1.5,why:"Units, precision, and rational and irrational numbers. Quick, and woven into later word problems."},{id:"expr",name:"Expressions and polynomials",stds:["A-SSE.1a","A-SSE.1b","A-SSE.2","A-APR.1"],how:"together",wt:"major",wk:2.5,why:"Read the parts of an expression, rewrite expressions, and add, subtract and multiply polynomials."},{id:"lineq",name:"Linear equations and inequalities",stds:["A-CED.1","A-CED.3","A-CED.4","A-REI.1","A-REI.3"],how:"together",wt:"major",wk:3,why:"Write and solve equations and inequalities from situations, and rearrange formulas."},{id:"func",name:"Functions",stds:["F-IF.1","F-IF.2","F-IF.3","F-IF.4","F-IF.5","F-IF.6","F-IF.9"],how:"together",wt:"major",wk:3,why:"Function notation, domain and range, key features, rate of change, and comparing functions."},{id:"lgraph",name:"Graphing lines and linear models",stds:["A-CED.2","A-REI.10","F-IF.7a","F-IF.7b","F-BF.1a","F-BF.3"],how:"together",wt:"major",wk:3,why:"Graph linear and piecewise functions, write them from context, and see how transformations move a graph."},{id:"sys",name:"Systems and inequalities",stds:["A-REI.5","A-REI.6","A-REI.11","A-REI.12"],how:"together",wt:"major",wk:2.5,why:"Solve systems by graphing, substitution and elimination, and graph linear inequalities."},{id:"expo",name:"Exponential vs. linear models",stds:["A-SSE.3c","F-LE.1a","F-LE.1b","F-LE.1c","F-LE.2","F-LE.5"],how:"together",wt:"major",wk:2,why:"Constant differences vs. constant ratios: when a situation grows by adding vs. by multiplying."},{id:"quad",name:"Quadratics: factoring and solving",stds:["A-SSE.3a","A-SSE.3b","A-APR.3","A-REI.4a","A-REI.4b","F-IF.8a"],how:"together",wt:"major",wk:4,why:"Factor, complete the square, use the quadratic formula, and connect zeros to the graph."},{id:"stats",name:"Statistics and data",stds:["S-ID.1","S-ID.2","S-ID.3","S-ID.5","S-ID.6a","S-ID.6b","S-ID.6c","S-ID.7","S-ID.8","S-ID.9"],how:"together",wt:"support",wk:2.5,why:"Compare data sets, two-way tables, lines of fit, correlation, and correlation vs. causation."}]};
const PACE_FL={3: "5 minutes of fact fluency (3.OA.7, multiply and divide within 100) and adding and subtracting within 1,000 (3.NBT.2). These are the two grade 3 fluency standards.", 4: "5 minutes of adding and subtracting multi-digit numbers with the standard algorithm (4.NBT.4), the grade 4 fluency standard, plus quick fact review.", 5: "5 minutes of multi-digit multiplication with the standard algorithm (5.NBT.5), the grade 5 fluency standard.", 6: "5 minutes of long division and decimal operations (6.NS.2 and 6.NS.3), the grade 6 fluencies.", 7: "5 minutes of operations with positive and negative numbers (7.NS) and solving two-step equations (7.EE.4).", 8: "5 minutes of solving linear equations (8.EE.7) and quick work with exponents.", 9: "5 minutes of warm-ups that keep core skills sharp: solving linear equations, factoring and reading graphs."};
const PACE_HOW={together:"Teach together",alone:"Teach on its own",embed:"Fold into other units"},PACE_WT={major:"Major work",support:"Supporting",extra:"Additional"};
const paceKey=()=>"ptp-pace-"+CUR.cls.id;
function paceCfg(){let c=CUR.cls.pace||{};if(!c.test){try{c=JSON.parse(localStorage.getItem(paceKey())||"{}")}catch(e){}}const y=new Date().getMonth()>=6?new Date().getFullYear()+1:new Date().getFullYear();
  const dw=new Date().getDay(),nx=weekOf(dayKey(Date.now()+(dw===0?1:dw===6?2:0)*864e5));return {test:c.test||`${y}-04-26`,off:c.off??3,start:c.start||nx}}
function paceStdMastery(code){const ks=SKILLS.filter(k=>k.std===code||(k.std.startsWith(code)&&/^[a-z]$/.test(k.std.slice(code.length))));if(!ks.length)return null;const st=CUR.students;if(!st.length)return null;
  let d=0,n=0;st.forEach(s=>ks.forEach(k=>{n++;if(s.prog.skills[k.id]?.status==="done")d++}));return d/n}
function pacePlan(){const cfg=paceCfg(),wkMs=7*864e5,start=new Date(cfg.start+"T12:00:00"),test=new Date(cfg.test+"T12:00:00");
  const weeks=Math.max(0,Math.floor((test-start)/wkMs)),avail=Math.max(0,weeks-(+cfg.off||0));
  const b=(PACE_G[gradeOf()]||PACE3).map((x,i)=>{const ms=x.stds.map(paceStdMastery).filter(v=>v!=null),m=ms.length?ms.reduce((a,v)=>a+v,0)/ms.length:null;
    const done=m!=null&&m>=.8;return {...x,i,m,done,need:done?1:x.wk}});
  /* order: major work not yet mastered first (in teaching order), then supporting, then additional, then quick reviews of mastered units */
  const rank=x=>(x.done?3:0)+(x.wt==="major"?0:x.wt==="support"?1:2)*0.1+x.i*0.001;
  const order=b.filter(x=>x.how!=="embed").sort((a,c)=>rank(a)-rank(c)),embed=b.filter(x=>x.how==="embed");
  const need=order.reduce((a,x)=>a+x.need,0),scale=need>avail&&avail>0?avail/need:1;
  const lens=order.map(x=>Math.max(1,Math.round(x.need)));let tot=lens.reduce((a,v)=>a+v,0);
  /* too many weeks: shorten the least essential units first (additional, then supporting, then the longest major units), never below 1 week */
  const pri=x=>x.done?0:x.wt==="extra"?1:x.wt==="support"?2:3;
  while(avail>0&&tot>avail){let bi=-1;order.forEach((x,i)=>{if(lens[i]>1&&(bi<0||pri(x)<pri(order[bi])||(pri(x)===pri(order[bi])&&lens[i]>=lens[bi])))bi=i});if(bi<0)break;lens[bi]--;tot--}
  let w=0;const rows=order.map((x,i)=>{const len=lens[i],r={...x,len,from:w,to:w+len};w+=len;return r});
  return {cfg,weeks,avail,need,scale,rows,embed,start}}
function tPace(){const g=gradeOf();
  if(!PACE_G[g])return `<div class="card"><h2>📅 Pacing guide</h2><p class="muted">Pacing guides are ready for math grades 3–8 and Algebra I. This class practices ${esc(gLabel(g))}.</p></div>`;
  const P=pacePlan(),{cfg}=P,wd=(n,end)=>{const d=new Date(P.start.getTime()+n*7*864e5-(end?3*864e5:0));return `${d.getMonth()+1}/${d.getDate()}`},pct=m=>m==null?"—":Math.round(m*100)+"%";
  const bar=m=>m==null?"":`<span class="pbar" aria-hidden="true"><i style="width:${Math.round(m*100)}%"></i></span>`;
  return `<div class="card"><h2>📅 Pacing guide · ${esc(gLabel(g))}${g<9?" math":""}</h2>
   <p class="muted">The weeks left before the state test, with standards grouped the way they are best taught. It moves standards your class has already mastered to a quick review at the end, using your class’s real practice data. “Major work” marks the big ideas of the course in the Mississippi College- and Career-Readiness Standards. Check your district’s pacing calendar and MDE’s MAAP blueprint for exact point weights.</p>
   <div class="row"><label class="f">Start week<input type="date" id="pc-start" value="${cfg.start}"></label><label class="f">State test date<input type="date" id="pc-test" value="${cfg.test}"></label><label class="f">Weeks off (breaks, testing)<input type="number" id="pc-off" min="0" max="20" value="${cfg.off}" style="width:90px"></label><button class="ghost small" id="pc-print">🖨 Print</button></div>
   <p style="margin:.4rem 0 0"><b>${P.avail} teaching weeks</b> left (${P.weeks} weeks minus ${cfg.off} off). The plan needs about <b>${Math.round(P.need*2)/2} weeks</b>.${P.scale<1?` <span class="pill gold">Tight: each unit is shortened to fit. Consider folding graphs into other units and keeping measurement lessons short.</span>`:P.avail-P.need>=2?` <span class="pill go">You have about ${Math.round((P.avail-P.need)*2)/2} extra weeks for review and test practice.</span>`:""}</p></div>
   <div class="card"><div class="tablewrap"><table class="roster"><thead><tr><th>Weeks</th><th>Unit</th><th>Standards</th><th>How</th><th>Class mastery</th></tr></thead><tbody>
   ${P.rows.map(r=>`<tr><td style="white-space:nowrap"><b>${wd(r.from)}–${wd(r.to,1)}</b><br><span class="muted small">${r.len} wk</span></td>
     <td><b>${esc(r.name)}</b> <span class="pill ${r.wt==="major"?"purple":""}">${PACE_WT[r.wt]}</span>${r.done?` <span class="pill go">Mostly mastered: quick review</span>`:""}<br><span class="muted small">${esc(r.why)}</span></td>
     <td>${r.stds.join(", ")}</td><td>${PACE_HOW[r.how]}</td><td>${pct(r.m)} ${bar(r.m)}</td></tr>`).join("")}
   </tbody></table></div>
   ${P.embed.map(e=>`<p><b>Fold in all year:</b> ${esc(e.name)} (${e.stds.join(", ")}). ${esc(e.why)} Class mastery: ${pct(e.m)}.</p>`).join("")}
   <p><b>Every day, all year:</b> ${PACE_FL[g]}</p>
   <p class="muted small">Dates run week after week and do not skip holidays, so slide a unit past each break. Teaching order is a recommendation: change it to match your district calendar and your students.</p></div>`}
function wirePace(){const g=id=>document.getElementById(id);if(!g("pc-test"))return;
  const save=()=>{const c={start:g("pc-start").value||paceCfg().start,test:g("pc-test").value||paceCfg().test,off:Math.max(0,Math.min(20,+g("pc-off").value||0))};CUR.cls.pace=c;const y=scrollY;render();scrollTo(0,y);if(!(S.demo||DEMO_T))saveClass({pace:c}).catch(e=>{try{localStorage.setItem(paceKey(),JSON.stringify(c))}catch(x){}})};
  ["pc-start","pc-test","pc-off"].forEach(id=>g(id).onchange=save);
  g("pc-print").onclick=()=>{const card=[...app.querySelectorAll(".card")].slice(-2).map(c=>c.outerHTML).join("");printDoc(`Pacing guide · ${CUR.cls.name}`,`<h1>Pacing guide · ${esc(CUR.cls.name)}</h1>`+card.replace(/<input[^>]*>/g,"").replace(/<button[^>]*>.*?<\/button>/g,""))}}


/* ---------- Celebrate these kids: this week's wins, with printable certificates ---------- */
function celebWins(s){const p=s.prog,wk=Date.now()-7*864e5,wk2=Date.now()-14*864e5,out=[];
  SKILLS.forEach(k=>{const x=p.skills[k.id];if(x&&x.status==="done"&&(x.doneAt||0)>=wk)out.push({ico:"🏆",t:`mastering ${/^[A-Z][a-z]/.test(k.name)?k.name[0].toLowerCase()+k.name.slice(1):k.name}`,w:5})});
  let a={n:0,ok:0},b={n:0,ok:0};const dset=new Set();Object.entries(p.days||{}).forEach(([d,x])=>{const t=new Date(d+"T12:00:00").getTime();Object.values(x).forEach(v=>{if(t>=wk){a.n+=v.n;a.ok+=v.ok;if(v.n)dset.add(d)}else if(t>=wk2){b.n+=v.n;b.ok+=v.ok}})});
  if(a.n>=10&&b.n>=10){const up=Math.round(a.ok/a.n*100-b.ok/b.n*100);if(up>=10)out.push({ico:"📈",t:`raising their accuracy ${up} points this week`,w:4})}
  Object.entries(p.badges||{}).forEach(([id,t])=>{if(t>=wk){const bi=badgeInfo(id);if(bi)out.push({ico:bi.m||"🎖",t:`earning the ${bi.name} badge`,w:3})}});
  let self=0;Object.entries(p.help3||{}).forEach(([d,x])=>{if(new Date(d+"T12:00:00").getTime()>=wk)self+=x.self||0});if(self>=2)out.push({ico:"💪",t:`getting unstuck on their own ${self} times`,w:3});
  const m=minsOf(p,null,wk);if(m>=60)out.push({ico:"⏱",t:`practicing ${m} minutes this week`,w:2});
  if(dset.size>=4)out.push({ico:"📅",t:`practicing ${dset.size} days this week`,w:2});
  if(s.raw?.prog?._home?.done?.[famWk()])out.push({ico:"🏠",t:"doing a home mission with their family",w:2});
  return out.sort((x,y)=>y.w-x.w)}
function tCelebrate(){const C=S.cel||(S.cel={pick:{},off:{}}),list=CUR.students.filter(s=>!isSample(s.raw||s)||S.demo||DEMO_T).map(s=>({s,w:celebWins(s)})),yes=list.filter(x=>x.w.length).sort((a,b)=>b.w.reduce((t,x)=>t+x.w,0)-a.w.reduce((t,x)=>t+x.w,0)),no=list.filter(x=>!x.w.length);
  return `<div class="card"><h2>🎉 Celebrate these kids</h2><p class="muted">This week’s wins, from each student’s practice: skills mastered, growth, badges, effort, getting unstuck on their own, and home missions. Pick the win for each certificate, then print. Celebrate in front of the class!</p>
   ${yes.length?`<div class="row"><button id="cel-print">🖨 Print ${yes.filter(x=>!C.off[x.s.id]).length} certificate${yes.filter(x=>!C.off[x.s.id]).length===1?"":"s"}</button><button class="ghost small" id="cel-all">Select all</button><button class="ghost small" id="cel-none">Select none</button></div>`:""}</div>
   ${yes.length?`<div class="card"><ul class="cel">${yes.map(({s,w})=>{const i=Math.min(C.pick[s.id]||0,w.length-1);return `<li><label class="chk" style="display:flex;gap:10px;align-items:flex-start"><input type="checkbox" data-cel="${s.id}" ${C.off[s.id]?"":"checked"}><span><b>${esc(s.name)}</b> ${w[i].ico}<br>
      <select data-celw="${s.id}" aria-label="Win for ${esc(s.name)}’s certificate">${w.map((x,j)=>`<option value="${j}" ${j===i?"selected":""}>${x.ico} ${esc(cap1(x.t))}</option>`).join("")}</select></span></label></li>`}).join("")}</ul></div>`
     :`<div class="card"><p class="muted">No wins logged yet this week. Wins show up as students practice.</p></div>`}
   ${no.length&&yes.length?`<div class="card"><p class="small" style="margin:0"><b>Not on the list this week:</b> ${no.map(x=>esc(x.s.name)).join(", ")}. <span class="muted">Look for a small win to celebrate with them too.</span></p></div>`:""}`}
const cap1=t=>t.charAt(0).toUpperCase()+t.slice(1);
function wireCelebrate(){const C=S.cel||(S.cel={pick:{},off:{}}),re=()=>{const y=scrollY;render();scrollTo(0,y)};
  app.querySelectorAll("[data-cel]").forEach(x=>x.onchange=()=>{x.checked?delete C.off[x.dataset.cel]:C.off[x.dataset.cel]=1;re()});
  app.querySelectorAll("[data-celw]").forEach(x=>x.onchange=()=>{C.pick[x.dataset.celw]=+x.value;re()});
  const all=document.getElementById("cel-all");if(all)all.onclick=()=>{C.off={};re()};
  const none=document.getElementById("cel-none");if(none)none.onclick=()=>{CUR.students.forEach(s=>C.off[s.id]=1);re()};
  const pr=document.getElementById("cel-print");if(pr)pr.onclick=()=>{const day=new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
    const certs=CUR.students.map(s=>({s,w:celebWins(s)})).filter(x=>x.w.length&&!C.off[x.s.id]).map(({s,w})=>{const x=w[Math.min(C.pick[s.id]||0,w.length-1)];
      return `<div class="cert"><div class="cert-in"><div class="cert-stars">⭐ ⭐ ⭐</div><div class="cert-t">Certificate of Achievement</div><div class="cert-s">proudly presented to</div><div class="cert-n">${esc(s.name.replace(" (sample)",""))}</div><div class="cert-s">for</div><div class="cert-r">${x.ico} ${esc(cap1(x.t))}</div>
       <div class="cert-f"><span>${esc(day)}</span><span>${esc(TB.me.name)}<br><small>${esc(CUR.cls.name)} · ${esc(TB.school.name)}</small></span></div><div class="cert-p">Path to Proficiency</div></div></div>`}).join("");
    printDoc("Certificates · "+CUR.cls.name,`<style>@page{size:landscape;margin:.4in}.cert{break-after:page;page-break-after:always;height:7.2in;display:flex}.cert:last-child{break-after:auto}
      .cert-in{flex:1;border:10px double #1f6f4a;border-radius:18px;padding:.45in .6in;text-align:center;display:flex;flex-direction:column;justify-content:center;gap:.12in;font-family:Lexend,system-ui,sans-serif;color:#1d2433;background:#fffdf5}
      .cert-stars{font-size:28px;letter-spacing:8px}.cert-t{font-family:Fredoka,Lexend,sans-serif;font-size:44px;font-weight:700;color:#1f6f4a}.cert-s{font-size:18px;color:#555;font-style:italic}.cert-n{font-family:Fredoka,Lexend,sans-serif;font-size:52px;font-weight:700;border-bottom:3px solid #f6c453;display:inline-block;margin:0 auto;padding:0 .3in}
      .cert-r{font-size:26px;font-weight:700}.cert-f{display:flex;justify-content:space-between;margin-top:.25in;font-size:16px;text-align:left}.cert-f span:last-child{text-align:right;border-top:2px solid #333;padding-top:4px;min-width:2.6in}.cert-p{font-size:12px;color:#888;margin-top:.1in}</style>${certs}`)}}

/* ---------- PTP Bridge: family updates with a five-minute home activity ---------- */
const HACT=()=>window.PTP_HOME||{};
const famWk=()=>weekOf(dayKey());
const famFirst=s=>s.name.replace(" (sample)","").split(/\s+/)[0];
const kStd=kid=>{const k=SKILLS.find(x=>x.id===kid);return k&&k.std};
function famPick(s){const H=HACT(),p=s.prog,since=Date.now()-14*864e5,agg={};
  Object.entries(p.days||{}).forEach(([d,x])=>{if(new Date(d+"T12:00:00").getTime()<since)return;Object.entries(x).forEach(([k,v])=>{const a=agg[k]||(agg[k]={n:0,ok:0});a.n+=v.n;a.ok+=v.ok})});
  const hard=Object.entries(agg).filter(([k,a])=>a.n>=3&&a.ok/a.n<.8&&p.skills[k]?.status!=="done"&&H[kStd(k)]).sort((a,b)=>a[1].ok/a[1].n-b[1].ok/b[1].n);
  if(hard.length)return {std:kStd(hard[0][0]),why:"practice"};
  const cur=curSkill(s);if(cur&&H[cur.std])return {std:cur.std,why:"next"};
  const nx=trailFor(s).find(k=>p.skills[k.id]?.status==="todo"&&H[k.std]);return nx?{std:nx.std,why:"next"}:null}
function famData(s){const p=s.prog,wkAgo=Date.now()-7*864e5,H=HACT();
  return {mins:minsOf(p,null,wkAgo),mast:SKILLS.filter(k=>(p.skills[k.id]?.doneAt||0)>=wkAgo&&p.skills[k.id].status==="done").map(k=>k.std)}}
function famMsg(s,std,lang){const H=HACT(),d=famData(s),f=famFirst(s),me=TB.me.name,A=std&&H[std]?H[std][lang]:null,url=std?`${location.origin}/home/${std.toLowerCase().replace(/\./g,"")}${lang==="es"?"?l=es":""}`:"";
  const nm=c=>H[c]?H[c][lang].n:(SKILLS.find(k=>k.std===c)||{}).name||c,mast=d.mast.slice(0,2).map(nm);
  const join=l=>l.length>1?l.slice(0,-1).join(", ")+(lang==="es"?" y ":" and ")+l[l.length-1]:l[0];
  if(lang==="es")return [`¡Hola! Le saluda ${me}.`,
    d.mins?`${f} practicó ${d.mins} minutos de matemáticas esta semana${mast.length?` y dominó ${join(mast)} 🎉`:""}.`:`${f} practicó poco esta semana. ¡Su apoyo en casa ayuda mucho!`,
    A?`Ahora estamos trabajando en ${A.n}. Idea de 5 minutos: ${A.a[0].s}`:"",A?`Más ideas: ${url}`:"","¡Gracias!"].filter(Boolean).join(" ");
  return [`Hi! This is ${me}.`,
    d.mins?`${f} practiced math for ${d.mins} minutes this week${mast.length?` and mastered ${join(mast)} 🎉`:""}.`:`${f} didn't practice much this week, so a little encouragement at home would help a lot!`,
    A?`Next we're working on ${A.n}. 5-minute idea: ${A.a[0].s}`:"",A?`More ideas: ${url}`:"","Thank you!"].filter(Boolean).join(" ")}
function tFamily(){const F=S.fam||(S.fam={lang:{},std:{},txt:{}}),wk=famWk(),H=HACT(),hm=CUR.cls.home&&CUR.cls.home.wk===wk?CUR.cls.home.picks||{}:{};
  if(!Object.keys(H).length)return `<div class="card"><p class="muted">Loading family activities…</p></div>`;
  const list=CUR.students.filter(s=>!isSample(s.raw||s));
  const sent=list.filter(s=>hm[s.id]).length,did=list.filter(s=>s.raw?.prog?._home?.done?.[wk]).length;
  const codes=Object.keys(H);
  return `<div class="card"><h2>🏠 Family updates · PTP Bridge</h2>
   <p class="muted">Each message is written from that student’s practice this week, with a five-minute activity for home on the skill they need most. Edit anything. Tap <b>Text</b> to open your phone’s Messages app, or <b>Copy</b> to paste into Remind, ClassDojo or your district app. Parent phone numbers are never stored in Path to Proficiency.</p>
   <div class="row" style="gap:8px"><span class="pill">Week of ${shortDate(wk)}</span><span class="pill go">${sent} of ${list.length} sent</span><span class="pill gold">🏠 ${did} home mission${did===1?"":"s"} done</span><a class="link" href="/home/" target="_blank" rel="noopener">See the family activity pages ↗</a></div>
   <p class="muted" id="fam-msg" role="status"></p></div>
   ${list.length?list.map(s=>{const pk=famPick(s),std=F.std[s.id]||(hm[s.id]&&hm[s.id].std)||pk?.std||"",lang=F.lang[s.id]||(hm[s.id]&&hm[s.id].lang)||(s.acc&&s.acc.es?"es":"en"),txt=F.txt[s.id+"|"+std+"|"+lang]??famMsg(s,std,lang),done=s.raw?.prog?._home?.done?.[wk];
     return `<div class="card fam" data-sid="${s.id}"><div class="top"><h3 style="margin:0">${esc(s.name)}</h3><div class="row" style="gap:6px">${hm[s.id]?`<span class="pill go">Sent ✓</span>`:""}${done?`<span class="pill gold">🏠 Did the home mission!</span>`:""}</div></div>
      <div class="row"><label class="f" style="flex:2;min-width:200px">Home activity skill<select data-fstd="${s.id}"><option value="">No activity (progress only)</option>${codes.map(c=>`<option value="${c}" ${c===std?"selected":""}>${esc(c)} · ${esc(H[c].en.n)}${pk&&pk.std===c?(pk.why==="practice"?" (needs practice)":" (up next)"):""}</option>`).join("")}</select></label>
       <label class="f" style="flex:1;min-width:120px">Language<select data-flang="${s.id}"><option value="en" ${lang==="en"?"selected":""}>English</option><option value="es" ${lang==="es"?"selected":""}>Español</option></select></label></div>
      <textarea data-ftxt="${s.id}|${std}|${lang}" rows="5" style="width:100%;font:inherit;padding:10px;border-radius:12px;border:2px solid var(--rule)">${esc(txt)}</textarea>
      <div class="row"><a class="btn small" data-fsend="${s.id}" data-how="text" href="sms:?&body=${encodeURIComponent(txt)}">📱 Text</a><button class="ghost small" data-fsend="${s.id}" data-how="copy">📋 Copy</button><span class="muted" style="font-size:.85rem">${txt.length} characters</span></div></div>`}).join(""):`<div class="card"><p class="muted">Add students first.</p></div>`}`}
function wireFamily(){const F=S.fam||(S.fam={lang:{},std:{},txt:{}}),keep=fn=>()=>{const y=scrollY;fn();render();scrollTo(0,y)};
  if(!Object.keys(HACT()).length){setTimeout(()=>{if(S.tab==="home")render()},400);return}
  app.querySelectorAll("[data-fstd]").forEach(x=>x.onchange=keep(()=>{F.std[x.dataset.fstd]=x.value}));
  app.querySelectorAll("[data-flang]").forEach(x=>x.onchange=keep(()=>{F.lang[x.dataset.flang]=x.value}));
  app.querySelectorAll("[data-ftxt]").forEach(x=>x.oninput=()=>{F.txt[x.dataset.ftxt]=x.value;const a=x.closest(".fam").querySelector('[data-how="text"]');if(a)a.href="sms:?&body="+encodeURIComponent(x.value)});
  app.querySelectorAll("[data-fsend]").forEach(b=>b.onclick=async e=>{const sid=b.dataset.fsend,card=b.closest(".fam"),ta=card.querySelector("textarea"),[,std,lang]=ta.dataset.ftxt.split("|");
    if(b.dataset.how==="copy"){e.preventDefault();try{await navigator.clipboard.writeText(ta.value);b.textContent="✓ Copied"}catch(er){ta.select();document.execCommand&&document.execCommand("copy");b.textContent="✓ Copied"}}
    if(S.demo||DEMO_T){return}
    try{const r=await api("homeMark",{classId:CUR.cls.id,wk:famWk(),sid,std,lang});CUR.cls.home=r.home;setTimeout(()=>{if(S.tab==="home"){const y=scrollY;render();scrollTo(0,y)}},b.dataset.how==="copy"?900:300)}catch(er){const m=document.getElementById("fam-msg");if(m)m.textContent=er.message}})}
/* student side: this week's home mission */
function homeMissionCard(){const h=S.home,H=HACT();if(!h||h.wk!==famWk()||!H[h.std])return"";const L=S.lang==="es"?"es":"en",A=H[h.std][L],done=S.student.raw?.prog?._home?.done?.[h.wk];
  return `<div class="card" style="border:2px solid var(--go)"><h2>🏠 ${L==="es"?"Misión en casa":"Home mission"}</h2>
   <p>${L==="es"?`Tu maestro/a mandó una actividad a tu familia: <b>${esc(A.a[0].t)}</b> (${esc(A.n)}). ¡Háganla juntos!`:`Your teacher sent your family an activity: <b>${esc(A.a[0].t)}</b> (${esc(A.n)}). Try it together!`}</p>
   <p class="muted" style="margin:0">${esc(A.a[0].s)}</p>
   <div class="row">${done?`<span class="pill gold">✅ ${L==="es"?"¡Hecho! +1 ficha de juego":"Done! +1 game token"}</span>`:`<button id="hm-done">${L==="es"?"¡La hicimos con mi familia! ✅":"We did it with my family! ✅"}</button>`}</div></div>`}
function wireHomeMission(){const b=document.getElementById("hm-done");if(!b)return;b.onclick=async()=>{busy(b,"…");
  try{if(!S.demo){await api("homeDone",{wk:S.home.wk})}const s=S.student;if(!s.raw)s.raw={prog:{}};const all=s.raw.prog||(s.raw.prog={});all._home=all._home||{done:{}};all._home.done=all._home.done||{};
    if(!all._home.done[S.home.wk]){all._home.done[S.home.wk]=Date.now();gameProg().bonus=(gameProg().bonus||0)+1}render()}catch(e){b.disabled=false;b.textContent=e.message}}}

/* ---------- every standard: preview and library ---------- */
const libOptions=sel=>GRADES.flatMap(g=>Object.entries(DOMS).map(([d,dn])=>[g,d,dn])).filter(([g,d])=>LIB.some(x=>x.grade===g&&x.dom===d)).map(([g,d,dn])=>`<optgroup label="${gLabel(g)} · ${esc(dn)}">${LIB.filter(x=>x.dom===d&&x.grade===g).map(x=>`<option value="${x.code}" ${x.code===sel?"selected":""}>${x.code} ${esc(x.name)}</option>`).join("")}</optgroup>`).join("");
function libSample(code,seed){const x=LIBC[code];try{return GG.make(x.gen,seed)}catch(e){console.error(e);return null}}
function libPreviewCard(){
  if(!LIBC[S.genSk])S.genSk=(LIB.find(x=>x.grade===gradeOf())||LIB[0]).code; if(!S.genSeed)S.genSeed=Math.floor(Math.random()*1e9);
  const q=libSample(S.genSk,S.genSeed);
  return `<div class="card"><h2>Practice for any standard</h2><p class="muted">Every Mississippi math standard for grades 3 to 5 has a question maker, so practice never runs out. Pick a standard to see an example.</p>
    <div class="row"><label class="f" style="flex:1;min-width:220px">Standard<select id="g-sk">${libOptions(S.genSk)}</select></label>
    <button class="ghost" id="g-new" style="align-self:flex-end">Show another</button></div></div>${q?reviewHTML(q,"Practice example"):""}`;
}
function wireLibPreview(){
  const g=document.getElementById("g-sk");if(g)g.onchange=e=>{S.genSk=e.target.value;S.genSeed=Math.floor(Math.random()*1e9);render()};
  const n=document.getElementById("g-new");if(n)n.onclick=()=>{S.genSeed=Math.floor(Math.random()*1e9);render()};
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-lq]");if(!b)return;const r=document.getElementById("lqs");if(r)r.scrollBy({left:+b.dataset.lq*Math.max(200,r.clientWidth*.8),behavior:"smooth"})});
function kidAv(sk,hr,st,bg,sh){
  const hair={puffs:`<circle cx="26" cy="26" r="13" fill="${hr}"/><circle cx="70" cy="26" r="13" fill="${hr}"/><path d="M26 42a22 22 0 0 1 44 0c-6-8-14-11-22-11s-16 3-22 11z" fill="${hr}"/>`,
    short:`<path d="M26 44a22 22 0 0 1 44 0c-4-7-12-12-22-12s-18 5-22 12z" fill="${hr}"/>`,
    curly:[[30,30],[40,23],[52,22],[63,27],[68,37],[28,40]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="${hr}"/>`).join(""),
    braids:`<path d="M26 44a22 22 0 0 1 44 0c-5-7-13-12-22-12s-17 5-22 12z" fill="${hr}"/><rect x="21" y="40" width="7" height="30" rx="3.5" fill="${hr}"/><rect x="68" y="40" width="7" height="30" rx="3.5" fill="${hr}"/>`,
    pony:`<path d="M26 44a22 22 0 0 1 44 0c-5-7-13-12-22-12s-17 5-22 12z" fill="${hr}"/><ellipse cx="74" cy="36" rx="7" ry="14" fill="${hr}" transform="rotate(25 74 36)"/><circle cx="68" cy="28" r="3.5" fill="${sh}"/>`}[st]||"";
  return `<svg viewBox="0 0 96 96" role="img"><circle cx="48" cy="48" r="48" fill="${bg}"/><path d="M18 96c2-16 14-24 30-24s28 8 30 24z" fill="${sh}"/><rect x="42" y="60" width="12" height="12" rx="4" fill="${sk}"/>${st==="braids"||st==="pony"?hair:""}<circle cx="48" cy="46" r="22" fill="${sk}"/>${st==="braids"||st==="pony"?hair.replace(/<rect[^>]*>|<ellipse[^>]*>|<circle cx="68"[^>]*>/g,""):hair}<circle cx="40" cy="47" r="2.6" fill="#1f2937"/><circle cx="56" cy="47" r="2.6" fill="#1f2937"/><circle cx="35" cy="54" r="3" fill="#f87171" opacity=".35"/><circle cx="61" cy="54" r="3" fill="#f87171" opacity=".35"/><path d="M41 55q7 6 14 0" stroke="#1f2937" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`;
}
function tStandards(){
  const open=S.stdOpen,q=open?libSample(open,S.stdSeed||1):null,G=S.stdG||(S.stdG=3),L0=LIB.filter(x=>x.grade===G);
  return `<div class="card"><h2>Standards and skills</h2>
   <p class="muted">${isELA(G)?`${gLabel(G)}: ${LIB.filter(x=>x.grade===G).length} reading and language standards from the Mississippi CCRS for English Language Arts (Reading Literature, Reading Informational Text, and Language). Every passage and question is original to Path to Proficiency. Writing, speaking and listening, and foundational skills are not included.`:isSci(G)?`${gLabel(G)}: every performance objective from the 2026 Mississippi CCRS for Science (${LIB.filter(x=>x.grade===G).length} in all), each with original practice questions, data tables, and step-by-step explanations. Objective text is from the MDE standards document.`:isHS(G)?(G===10?"ACT® Math prep: 36 skills across the six ACT Math reporting categories, each with original practice questions (4 answer choices, like the ACT).":"WorkKeys® Applied Math: 28 workplace math skills from Level 3 to Level 7, each with original practice questions (5 answer choices, like WorkKeys).")+" "+TM_NOTE:`Every Mississippi CCRS math standard for grades 3 through 8 and Algebra I (${LIB.filter(x=>x.grade<=9).length} in all), with what students should know, understand, and be able to do from the MDE scaffolding documents. ACT® Math prep and WorkKeys® Applied Math skills are here too.`} ${subjOf(G)==="math"?"Every skill has its own question maker, so practice never runs out. ":""}To give a standard to students, open a class and use <b>Students → Assign standards</b>.</p>
   <div class="row"><label class="f" style="flex:1;min-width:200px">Grade or course<select id="s-grade">${[["Math",g=>subjOf(g)===subjOf(3)],["Science",g=>isSci(g)],["Reading & language",g=>isELA(g)]].map(([lab,f])=>{const gs=GRADES.filter(f);return gs.length?`<optgroup label="${lab}">${gs.map(g=>`<option value="${g}" ${g===G?"selected":""}>${gLabel(g)} (${LIB.filter(x=>x.grade===g).length} standards)</option>`).join("")}</optgroup>`:""}).join("")}</select></label>
   <label class="f" style="flex:1;min-width:200px">Jump to<select id="s-dom"><option value="">All domains</option>${Object.entries(DOMS).filter(([d])=>L0.some(x=>x.dom===d)).map(([d,dn])=>`<option value="${d}">${d} · ${esc(dn)}</option>`).join("")}</select></label></div></div>
  ${Object.entries(DOMS).filter(([d])=>L0.some(x=>x.dom===d)).map(([d,dn])=>`<div class="card" id="dom-${d}"><h2>${gLabel(G)} · ${esc(dn)}</h2><div class="stdlist">${L0.filter(x=>x.dom===d).map(x=>`<div class="stdi${open===x.code?" open":""}">
     <div class="top"><div><b>${x.code}</b> · ${esc(x.name)}<br><span class="muted" style="font-size:.9rem">${esc(x.desc)}</span></div>
      <div class="row"><button class="ghost small" data-sprev="${x.code}">${open===x.code?"Hide":"Details and sample"}</button></div></div>
     ${open===x.code?`<div class="kud">${[["Know",x.know],["Understand",x.und],["Be able to do",x.do]].map(([h,l])=>`<div><h3>${h}</h3><ul>${l.map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>`).join("")}</div>
      <div class="row"><b>Sample practice question</b><button class="ghost small" id="s-again">Show another</button></div>${q?reviewHTML(q,"Practice example"):""}`:""}</div>`).join("")}</div></div>`).join("")}`;
}
function wireStandards(){
  const sg=document.getElementById("s-grade");if(sg)sg.onchange=()=>{S.stdG=+sg.value;S.stdOpen=null;render()};
  const sd=document.getElementById("s-dom");if(sd)sd.onchange=()=>{const el=document.getElementById("dom-"+sd.value);if(el)el.scrollIntoView({behavior:"smooth"});else window.scrollTo(0,0)};
  app.querySelectorAll("[data-sprev]").forEach(b=>b.onclick=()=>{const c=b.dataset.sprev;S.stdOpen=S.stdOpen===c?null:c;S.stdSeed=Math.floor(Math.random()*1e9);const y=window.scrollY;render();window.scrollTo(0,y)});
  const a=document.getElementById("s-again");if(a)a.onclick=()=>{S.stdSeed=Math.floor(Math.random()*1e9);const y=window.scrollY;render();window.scrollTo(0,y)};
}

/* ---------- assigning standards ---------- */
function assignCard(){
  const list=CUR.raw.filter(s=>!isSample(s)),A=S.asg||(S.asg={s:new Set(),c:new Set()}),AG=S.asgG||gradeOf();
  return `<div class="card"><h2>Assign standards</h2>
   <p class="muted">Pick students and standards, then tap Assign. Assigned standards move to the front of each student’s trail, even ones they got right on the test. Practice is ready for every standard.</p>
   ${list.length?`<div class="asg">
    <div><h3>Students</h3><label class="chk"><input type="checkbox" id="as-all" ${A.s.size===list.length?"checked":""}> Whole class</label>
     <div class="asl">${list.map(s=>`<label class="chk"><input type="checkbox" data-as-s="${s.id}" ${A.s.has(s.id)?"checked":""}> ${esc(s.name)}</label>`).join("")}</div></div>
    <div><h3>Standards</h3><div class="tabs" role="group" aria-label="Grade" style="margin-bottom:8px">${GRADES.filter(g=>subjOf(g)===subjOf(gradeOf())).map(g=>`<button class="small" data-asg-g="${g}" aria-pressed="${g===AG}">${gLabel(g)}${g<gradeOf()&&(g<=9||isELA(g))?" (fill gaps)":""}</button>`).join("")}</div>${Object.entries(DOMS).map(([d,dn])=>{const L0=LIB.filter(x=>x.dom===d&&x.grade===AG),n=L0.filter(x=>A.c.has(x.code)).length;if(!L0.length)return"";
      return `<details ${n||S.asgOpen===d?"open":""} data-dom="${d}"><summary><b>${d}</b> ${esc(dn)}${n?` <span class="pill purple">${n} picked</span>`:""}</summary><div class="asl">${L0.map(x=>`<label class="chk"><input type="checkbox" data-as-c="${x.code}" ${A.c.has(x.code)?"checked":""}> <span><b>${x.code}</b> ${esc(x.name)}</span></label>`).join("")}</div></details>`}).join("")}</div>
   </div>
   <div class="row"><button id="as-go" ${A.s.size&&A.c.size?"":"disabled"}>Assign ${A.c.size||""} standard${A.c.size===1?"":"s"} to ${A.s.size||""} student${A.s.size===1?"":"s"}</button><button class="ghost" id="as-rm" ${A.s.size&&A.c.size?"":"disabled"}>Remove from them</button></div>
   <p class="muted" id="as-msg" role="status"></p>
   ${list.some(s=>(s.assigned||[]).length)?`<h3>Assigned now</h3><div class="tablewrap"><table class="roster"><tbody>${list.filter(s=>(s.assigned||[]).length).map(s=>`<tr><td><b>${esc(s.name)}</b></td><td><div class="row" style="gap:6px">${s.assigned.map(c=>`<span class="pill purple">${esc(c)} <button class="link small" data-unasg="${s.id}|${esc(c)}" aria-label="Remove ${esc(c)} from ${esc(s.name)}">×</button></span>`).join("")}</div></td></tr>`).join("")}</tbody></table></div>`:""}`
   :`<p class="muted">Add students first.</p>`}</div>`;
}
function wireAssign(){
  const A=S.asg;if(!A||!document.getElementById("as-go")&&!app.querySelector("[data-unasg]"))return;
  const list=CUR.raw.filter(s=>!isSample(s)),keep=fn=>()=>{const y=window.scrollY;fn();render();window.scrollTo(0,y)};
  app.querySelectorAll("[data-asg-g]").forEach(b=>b.onclick=keep(()=>{S.asgG=+b.dataset.asgG}));
  const all=document.getElementById("as-all");if(all)all.onchange=keep(()=>{if(all.checked)list.forEach(s=>A.s.add(s.id));else A.s.clear()});
  app.querySelectorAll("[data-as-s]").forEach(b=>b.onchange=keep(()=>{b.checked?A.s.add(b.dataset.asS):A.s.delete(b.dataset.asS)}));
  app.querySelectorAll("[data-as-c]").forEach(b=>b.onchange=keep(()=>{b.checked?A.c.add(b.dataset.asC):A.c.delete(b.dataset.asC);S.asgOpen=b.closest("details").dataset.dom}));
  const save=async(fn,msg,btn)=>{busy(btn,"Saving…");const next=CUR.raw.map(s=>({...s,assigned:fn(s)}));
    try{await saveRoster(next);flash("as-msg",msg);S.tab="setup";render()}catch(e){document.getElementById("as-msg").textContent=e.message;if(btn){btn.disabled=false;btn.textContent="Try again"}}};
  const go=document.getElementById("as-go");if(go)go.onclick=()=>{const c=[...A.c];save(s=>A.s.has(s.id)?[...new Set([...(s.assigned||[]),...c])]:s.assigned||[],`Assigned ${c.join(", ")} to ${A.s.size} student${A.s.size===1?"":"s"}.`,go).then(()=>{A.c.clear()})};
  const rm=document.getElementById("as-rm");if(rm)rm.onclick=()=>{const c=new Set(A.c);save(s=>A.s.has(s.id)?(s.assigned||[]).filter(x=>!c.has(x)):s.assigned||[],"Removed.",rm)};
  app.querySelectorAll("[data-unasg]").forEach(b=>b.onclick=()=>{const [id,c]=b.dataset.unasg.split("|");save(s=>s.id===id?(s.assigned||[]).filter(x=>x!==c):s.assigned||[],`Removed ${c}.`,null)});
}

/* ---------- why they missed it ---------- */
const MNAMES=["Mia","Jayden","Aaliyah","Carlos","Kenji","Zoe","Malik","Sofia","Imani","Diego","Ava","Elijah","Priya","Marcus","Layla","Noah","Amara","Luis","Hana","Jamal","Sam","Maria"];
const MWORDS="cookies|pencils|apples|crayons|marbles|stickers|books|eggs|flowers|muffins|balls|shells|cards|chairs|plants|beads|bag|bags|cup|cups|basket|baskets|box|boxes|jar|jars|page|pages|shelf|shelves|carton|cartons|vase|vases|tray|trays|bin|bins|bucket|buckets|pile|piles|row|rows|pot|pots|string|strings|friends|students|tables|teams|groups|classes|pizza|pie|cake|pancake|sandwich|brownie|crayon|pencil|eraser|ribbon|key|rectangle|circle|centimeters|inches|meters|feet|kilograms|grams|liters";
const MRE=new RegExp(`\\b(${MNAMES.join("|")}|${MWORDS})\\b`,"gi");
const mnorm=t=>String(t||"").replace(/\[\d+\/\d+\]/g,"#").replace(/\d+(:\d+)?/g,"#").replace(MRE,"_").replace(/\b[A-E]\b/g,"L").toLowerCase().replace(/\s+/g," ").trim();
function missWhy(m){const q=getQ(m.q);if(!q)return"";
  if(q.type==="mc")return q.why?.[m.p]||"";
  if(q.type==="multi")return q.why?.[String(m.p)[0]]||"";
  if(q.type==="input")return (q.whyIn&&q.whyIn[m.p])||q.whyElse||"";
  if(q.type==="matrix"){const r=q.rows[+String(m.p).slice(1)];return r?r.why:""}return""}
function missGroups(students,kid){const g=new Map();
  students.forEach(s=>(s.prog.miss||[]).forEach(m=>{if(kid&&m.k!==kid)return;const w=missWhy(m);if(!w||/is right, but you missed one/.test(w))return;const key=m.k+"|"+mnorm(w);
    const x=g.get(key)||{k:m.k,ex:w,n:0,who:new Set(),last:0};x.n++;x.who.add(s.name);if(m.t>x.last){x.last=m.t;x.ex=w}g.set(key,x)}));
  return [...g.values()].sort((a,b)=>b.who.size-a.who.size||b.n-a.n)}
function tWhy(){
  const real=realStudents(),groups=missGroups(real),byK={};groups.forEach(x=>(byK[x.k]=byK[x.k]||[]).push(x));
  const total=groups.reduce((a,x)=>a+x.n,0);
  const order=SKILLS.filter(k=>byK[k.id]);Object.keys(byK).forEach(id=>{if(!order.some(k=>k.id===id)){const L0=LIBG[id];order.push({id,std:L0?L0.code:"",name:L0?L0.name:"Other"})}});
  return `<div class="card"><div class="top"><h2>Why they missed it</h2><span class="pill">${total} mistake${total===1?"":"s"} so far</span></div>
   <p class="muted">Every wrong answer in practice is matched to the mistake behind it. Mistakes of the same kind are grouped, even across different questions, so you can see what students are thinking and reteach the right thing. Most common first.</p>
   ${total?"":`<p class="fb info">Nothing yet. This fills in as students practice.</p>`}</div>
   ${order.map(k=>{const list=byK[k.id],stud=new Set(list.flatMap(x=>[...x.who])).size;
     return `<div class="card"><div class="top"><div><span class="label">${esc(k.std)}</span><h3>${esc(k.name)}</h3></div><span class="pill oops">${stud} student${stud===1?"":"s"}</span></div>
      <ol class="miss">${list.slice(0,5).map((x,xi)=>`<li><div class="mhead"><b>${x.who.size} student${x.who.size===1?"":"s"}</b><span class="muted">${x.n} time${x.n===1?"":"s"}</span></div><p class="mex">“${fmt(x.ex)}”</p><p class="muted" style="font-size:.85rem">${esc([...x.who].join(", "))}</p>${genOf(k)?`<button class="ghost small" data-misc="${esc(k.id)}|${xi}" title="3 questions on this standard; each wrong answer is matched to this mistake">Send a 3-question check on this mistake</button>`:""}</li>`).join("")}</ol>
      ${list.length>5?`<p class="muted" style="font-size:.85rem">${list.length-5} smaller mistake types not shown.</p>`:""}</div>`}).join("")}`;
}
const topMiss=(s,kid)=>{const g=missGroups([s],kid);return g[0]&&g[0].n>=2?g[0]:null};


/* ================= Fluency mode: timed fact practice (like a Multiplication Madness sheet) ================= */
const FLU_G3=[
 {name:"× 0, 1, 2, 5, 10",ops:["x"],f:[0,1,2,5,10]},
 {name:"× 3 and 4 (plus earlier facts)",ops:["x"],f:[0,1,2,3,4,5,10],focus:[3,4]},
 {name:"× 6, 7, 8, 9",ops:["x"],f:[2,3,4,5,6,7,8,9],focus:[6,7,8,9]},
 {name:"All × facts 0 to 10",ops:["x"],f:[0,1,2,3,4,5,6,7,8,9,10]},
 {name:"÷ facts",ops:["d"],f:[1,2,3,4,5,6,7,8,9,10]},
 {name:"× and ÷ mixed",ops:["x","d"],f:[2,3,4,5,6,7,8,9,10]},
 {name:"Mixed review (facts + spiral)",ops:["x","d","r"],f:[2,3,4,5,6,7,8,9]},
];

