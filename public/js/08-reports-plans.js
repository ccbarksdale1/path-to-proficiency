/* Path to Proficiency · Progress reports, IMPs, calculator, practice tests, Plan it, badges.
   Loaded in order by index.html as plain scripts that share one global scope. */
/* ---------- progress reports for every student (English / Spanish) ---------- */
function progressCard(){const real=CUR.students.filter(s=>!isSample(s));
  return `<div class="card" id="pr-card"><h2>Progress reports</h2><p class="muted">A one-page report for families, conferences, or report cards: standards mastered, skills still developing, benchmark growth, a practice chart, and next steps.</p>
   <div class="row"><label class="f" style="min-width:200px">Student<select id="pr-s"><option value="all">Whole class (${real.length})</option>${real.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join("")}</select></label>
    <label class="f" style="min-width:140px">Language<select id="pr-l"><option value="en">English</option><option value="es">Español</option></select></label>
    <button id="pr-go" style="align-self:flex-end">🖨 Print reports</button></div></div>`}
function wireProgress(){const b=document.getElementById("pr-go");if(b)b.onclick=()=>{const v=document.getElementById("pr-s").value,l=document.getElementById("pr-l").value;
  printProgress(v==="all"?CUR.students.filter(s=>!isSample(s)):[CUR.students.find(s=>s.id===v)],l)}}
function reportHTML(s,es){const T=(a,b)=>es?b:a,p=s.prog,TR=trailFor(s),first=s.name.split(" ")[0];
  const tried=new Set();Object.values(p.days||{}).forEach(x=>Object.keys(x).forEach(k=>tried.add(k)));
  const mast=TR.filter(k=>["done","skip"].includes(p.skills[k.id].status)),dev=TR.filter(k=>p.skills[k.id].status==="todo"&&tried.has(k.id)),notyet=TR.filter(k=>p.skills[k.id].status==="todo"&&!tried.has(k.id));
  const since=Date.now()-28*864e5,W=weekly([p]),recent=W.filter(x=>new Date(x.w+"T12:00:00").getTime()>=since),n=recent.reduce((a,x)=>a+x.n,0),ok=recent.reduce((a,x)=>a+x.ok,0);
  const b=bmOf(s),cur=curSkill(s),L0=cur&&LIBC[cur.std];
  const li=list=>list.length?`<ul class="pr-list">${list.slice(0,14).map(k=>`<li><b>${esc(k.std)}</b> ${esc(k.name)}</li>`).join("")}${list.length>14?`<li class="muted">${T(`and ${list.length-14} more`,`y ${list.length-14} más`)}</li>`:""}</ul>`:`<p class="muted">${T("None yet.","Ninguno todavía.")}</p>`;
  return `<section class="lesson pr"><div class="lp-head"><div><span class="lp-tag grade">${T("Math progress report","Reporte de progreso en matemáticas")}</span><h2>${esc(s.name)}</h2>
     <p class="lp-sub">${esc(TEACHER)} · ${esc(CUR.cls.name)} · ${new Date().toLocaleDateString(es?"es-US":"en-US",{month:"long",day:"numeric",year:"numeric"})}</p></div>${LOGO}</div>
    <div class="pr-kpis"><div><b>${mast.length}</b><span>${T("standards mastered","estándares dominados")}</span></div><div><b>${dev.length}</b><span>${T("skills developing","destrezas en desarrollo")}</span></div>
     <div><b>${n?Math.round(ok/n*100)+"%":"—"}</b><span>${T("right in the last 4 weeks","correctas en las últimas 4 semanas")}</span></div><div><b>${minsOf(p,null,since)}</b><span>${T("minutes practiced (4 weeks)","minutos de práctica (4 semanas)")}</span></div></div>
    ${WINS.some(w=>b[w]!=null)?`<h3>${T("Benchmark scores this year","Resultados de evaluaciones este año")}</h3><table class="lp-plan"><tr>${WINS.map(w=>`<th>${es?WINS_ES[w]:w}</th>`).join("")}<th>${T("Growth","Crecimiento")}</th></tr><tr>${WINS.map(w=>`<td>${b[w]!=null?b[w]+"%":"—"}</td>`).join("")}<td>${bmGrowth(b)==null?"—":(bmGrowth(b)>0?"+":"")+bmGrowth(b)+" "+T("points","puntos")}</td></tr></table>`:""}
    <div class="pr-cols"><div><h3>✅ ${T("Mastered","Dominado")}</h3>${li(mast)}</div><div><h3>🌱 ${T("Developing","En desarrollo")}</h3>${li(dev)}</div></div>
    ${W.length>1?`<h3>${T("Practice accuracy by week","Respuestas correctas por semana")}</h3>${lineChart(W.slice(-10).map(x=>({label:shortDate(x.w),y:x.acc})),{max:100,unit:"%",goal:70,goalLabel:"70%"})}`:""}
    <h3>${T("Next steps","Próximos pasos")}</h3><ul>${cur?`<li>${T(`Next up: <b>${esc(cur.std)} ${esc(cur.name)}</b>.`,`Lo próximo: <b>${esc(cur.std)} ${esc(cur.name)}</b>.`)}${L0&&L0.desc&&!es?` ${esc(L0.desc)}`:""}</li>`:`<li>${T(`${esc(first)} has mastered every standard on the trail. Great work!`,`${esc(first)} dominó todos los estándares de su camino. ¡Excelente trabajo!`)}</li>`}
     ${ipActive(s)?`<li>${T(`${esc(first)} is on an Individualized Math Plan, ${s.ip.sessions||3} times a week.`,`${esc(first)} tiene un plan individual de matemáticas, ${s.ip.sessions||3} veces por semana.`)}</li>`:""}
     <li>${T(`At home: ask ${esc(first)} to explain one problem from today, step by step.`,`En casa: pídale a ${esc(first)} que le explique un problema de hoy, paso a paso.`)}</li>
     ${notyet.length?`<li>${T(`Still ahead on the trail: ${notyet.length} standard${notyet.length===1?"":"s"}.`,`Todavía en el camino: ${notyet.length} estándar${notyet.length===1?"":"es"}.`)}</li>`:""}</ul>
    <p class="muted" style="font-size:.8rem;margin-top:14px">${T("Mastered means the student got it right on the benchmark or answered several in a row correctly in practice. Practice results are an estimate, not a state test score.","Dominado significa que el estudiante lo contestó bien en la evaluación o contestó varias seguidas correctamente en la práctica. Los resultados de práctica son un estimado, no una calificación del examen estatal.")}</p></section>`}
function printProgress(list,lang){list=list.filter(Boolean);if(!list.length)return;const w=window.open("","_blank");if(!w){alert("Allow pop-ups to print.");return}
  const css=pageCSS();
  w.document.write(`<!doctype html><html lang="${lang==="es"?"es":"en"}"><meta charset="utf-8"><title>${lang==="es"?"Reportes de progreso":"Progress reports"} · ${esc(CUR.cls.name)}</title>${css}<style>body{background:#fff;color:#111}</style><div class="lp-wrap">${list.map(s=>reportHTML(s,lang==="es")).join("")}</div><script>setTimeout(()=>print(),500)<\/script>`);w.document.close()}

/* ================= Sub Day: one click prints a sub cover sheet (online and paper directions), a packet for each
   student with problems from their own next skills, and an answer key for the teacher ================= */
const SD_PER=5;
function sdQs(s){const todo=trailFor(s).filter(k=>s.prog.skills[k.id]&&s.prog.skills[k.id].status==="todo");
  const ks=(todo.length?todo:trailFor(s).slice().sort(()=>Math.random()-.5)).slice(0,2),out=[];
  ks.forEach(k=>{const g=genOf(k),pool=[...k.twins,...k.qs.map(n=>"q"+n)];let n=0,tries=0;
    while(n<SD_PER&&tries++<30){const id=g?`~${g}~${Math.floor(Math.random()*1e9)}`:pool[tries-1];if(!id)break;let q=null;try{q=getQ(id)}catch(e){}
      if(!q||!q.parts||q._ea||q._bd||!["mc","multi","input","matrix"].includes(q.type))continue;out.push({k,q});n++}});return out}
function sdItem(q,i){let a="";
  if((q.type==="mc"||q.type==="multi")&&q.choices)a=`<div class="sd-ch">${q.choices.map((c,j)=>`<div>${q.type==="multi"?"☐":"○"} <b>${L[j]}.</b> ${choiceInner(c)}</div>`).join("")}</div>${q.type==="multi"?'<p class="muted">Pick all that are right.</p>':""}`;
  else if(q.type==="input")a=`<p>Answer: ______________</p>`;
  else if(q.type==="matrix")a=`<table class="sd-mx"><tr><th></th>${q.cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr>${q.rows.map(r=>`<tr><td>${esc(r.n)}</td>${q.cols.map(()=>"<td>○</td>").join("")}</tr>`).join("")}</table>`;
  return `<div class="sd-q"><b class="sd-n">${i}.</b><div>${bodyHTML(q,null,"print")}${a}</div></div>`}
function subDay(){const list=realStudents();if(!list.length){alert("Add students first.");return}
  const w=window.open("","_blank");if(!w){alert("Allow pop-ups to print.");return}
  const css=pageCSS(),c=CUR.cls,day=new Date().toLocaleDateString(),url=location.origin+location.pathname;
  const packs=list.map(s=>({s,qs:sdQs(s)}));
  const cover=`<section class="sd-page"><h1>Sub plan: ${esc(c.name)}</h1><p>${esc(tName(c.teacherId))} · ${esc(TEST_NAME)} · ${day}</p>
   <h2>Math practice, about 30 minutes</h2><p>Every student has their own work. It is matched to what each student needs, so it is okay that packets look different.</p>
   <h3>Option 1: Paper (no computers needed)</h3><ol><li>Hand each student the packet with their name on it.</li><li>Students work quietly for about 30 minutes. They can skip a problem and come back.</li><li>Collect every packet and leave them for the teacher.</li></ol>
   <h3>Option 2: Computers</h3><ol><li>Students go to <b>${esc(url)}</b> and choose <b>I’m a student</b>.</li><li>Class code: <b style="letter-spacing:.1em">${esc(c.join)}</b>. Then each student types their own code from the list below.</li><li>They tap <b>Start my mission</b> and practice for about 30 minutes. Their work saves on its own.</li></ol>
   <p class="muted">If the internet stops working, switch to the paper packets.</p>
   <table class="sd-codes"><tr><th>Student</th><th>Code</th></tr>${list.map(s=>`<tr><td>${esc(s.name)}</td><td>${esc(s.code)}</td></tr>`).join("")}</table></section>`;
  const pk=packs.map(({s,qs})=>`<section class="sd-page"><div class="sd-head"><b>${esc(s.name)}</b><span>${esc(c.name)} · ${day}</span></div>
   <p class="muted">Practice: ${[...new Set(qs.map(x=>x.k.name))].map(esc).join(" and ")||"Review"}. Show your work.</p>${qs.map((x,i)=>sdItem(x.q,i+1)).join("")}</section>`).join("");
  const key=`<section class="sd-page"><h1>Answer key (for the teacher)</h1>${packs.map(({s,qs})=>`<p><b>${esc(s.name)}</b>: ${qs.map((x,i)=>`${i+1}. ${esc(ansText(x.q))}`).join(" · ")||"no problems"}</p>`).join("")}</section>`;
  w.document.write(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Sub Day · ${esc(c.name)}</title>${css}<style>body{background:#fff;color:#111;padding:0}.sd-page{padding:24px;break-after:page;page-break-after:always}.sd-page:last-child{break-after:auto}.sd-head{display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:6px;margin-bottom:8px;font-size:1.1rem}.sd-q{display:flex;gap:10px;break-inside:avoid;page-break-inside:avoid;margin:14px 0;padding-bottom:10px;border-bottom:1px dashed #bbb}.sd-n{font-size:1.1rem}.sd-ch div{margin:4px 0}.sd-codes,.sd-mx{border-collapse:collapse;margin-top:10px}.sd-codes td,.sd-codes th,.sd-mx td,.sd-mx th{border:1px solid #999;padding:4px 10px;text-align:left}@media print{button{display:none}}</style><div class="sd-wrap">${cover}${pk}${key}</div><script>setTimeout(()=>print(),700)<\/script>`);w.document.close()}

/* ================= Help Buddy warm-up: a projector slideshow of Buddy problems on the skill most of the class is on ================= */
function helpBuddy(pick){const list=realStudents();const tally={};list.forEach(s=>{const k=curSkill(s);if(k)tally[k.id]=(tally[k.id]||0)+1});
  const ids=Object.keys(tally).sort((a,b)=>tally[b]-tally[a]),k=(pick&&SKILLS.find(x=>x.id===pick))||SKILLS.find(x=>x.id===ids[0])||trailBase(list[0]||{prog:{skills:{}}})[0]||SKILLS[0];
  const g=genOf(k),pool=[...k.twins,...k.qs.map(n=>"q"+n)],slides=[];let tries=0;
  while(slides.length<4&&tries++<60){const base=g?`~${g}~${Math.floor(Math.random()*1e9)}`:pool[tries-1];if(!base)break;const bd=bdIdFor(base);if(!bd)continue;const q=getQ(bd);if(!q)continue;
    const l=bd.slice(bd.lastIndexOf("!")+1),mist=(q.steps[0]&&q.steps[0].say||"").replace(/^🦝 /,"");
    if(q.type==="input"){slides.push({body:bodyHTML(q,null,"print"),ch:`<div class="hb-c">Buddy’s answer: <b>${esc(q._bdSaid)}</b> <span class="hb-tag">← Buddy</span></div>`,ans:esc(String(q.ans)),mist});continue}
    slides.push({body:bodyHTML(q,null,"print"),ch:q.choices.map((c,j)=>`<div class="hb-c" data-l="${L[j]}"><b>${L[j]}.</b> ${choiceInner(c)}${L[j]===l?' <span class="hb-tag">← Buddy</span>':""}</div>`).join(""),ans:q.ans,mist})}
  if(!slides.length){alert("Buddy needs multiple-choice questions with common mistakes, and this standard doesn’t have enough. Pick another standard.");return}
  const w=window.open("","_blank");if(!w){alert("Allow pop-ups to show the warm-up.");return}
  const css=pageCSS();
  w.document.write(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Help Buddy · ${esc(k.std)}</title>${css}<style>body{background:#fff;color:#111;font-size:24px;max-width:1100px;margin:0 auto;padding:24px}.qtext{font-size:1.6rem!important}.hb-c{font-size:1.4rem;margin:10px 0;padding:8px 14px;border-radius:10px}.hb-c.ok{background:#dff3e6;font-weight:700}.hb-tag{color:#b03a2e;font-weight:700}.hb-m{font-size:1.3rem;background:#fff6e0;padding:12px 16px;border-radius:10px}.hb-nav{display:flex;gap:12px;margin-top:20px}.hb-nav button{font-size:1.1rem}</style>
   <h1>🦝 Help Buddy! <span class="muted" style="font-size:1rem">${esc(k.name)} · ${esc(k.std)}</span></h1><div id="hb"></div>
   <script>const S=${JSON.stringify(slides).replace(/</g,"\\u003c")};let i=0,open=false;
   function show(){const s=S[i];document.getElementById("hb").innerHTML='<p class="muted">Problem '+(i+1)+' of '+S.length+'. Talk with a partner: what did Buddy do wrong? What is the right answer?</p>'+s.body+'<div>'+s.ch+'</div>'+(open?'<p class="hb-m"><b>Right answer: '+s.ans+'.</b> '+s.mist+'</p>':'')+'<div class="hb-nav"><button class="ghost" id="p" '+(i?'':'disabled')+'>← Back</button><button id="r">'+(open?'Hide answer':'Show answer')+'</button><button class="ghost" id="n" '+(i<S.length-1?'':'disabled')+'>Next →</button></div>';
     if(open)document.querySelectorAll('.hb-c').forEach(e=>{if(e.dataset.l===s.ans)e.classList.add('ok')});
     document.getElementById('p').onclick=()=>{i--;open=false;show()};document.getElementById('n').onclick=()=>{i++;open=false;show()};document.getElementById('r').onclick=()=>{open=!open;show()}}
   show();<\/script>`);w.document.close()}

/* ================= Screener import: upload a screener/benchmark score file, fill one window for every student,
   start an Individualized Math Plan for each new student below the cut, and show which plans can now exit ================= */
const nmKey=x=>String(x||"").toLowerCase().replace(/[^a-z0-9 ,]/g,"").replace(/\s+/g," ").trim();
function nameKeys(n){const k=nmKey(n),out=new Set([k.replace(/,/g,"")]);if(k.includes(",")){const [l,f]=k.split(",").map(x=>x.trim());out.add(`${f} ${l}`);out.add(f.split(" ")[0]+" "+l)}
  else{const w=k.split(" ");if(w.length>=2){out.add(`${w[0]} ${w[w.length-1]}`);out.add(`${w[0]} ${w[w.length-1][0]}`)}}return out}
function parseScreener(text){const rows=parseCSV(text).map(r=>r.map(c=>String(c).trim()));if(rows.length<2)throw new Error("That file has no rows of scores.");
  const H=rows[0].map(h=>h.toLowerCase()),fi=(re,not)=>H.findIndex(h=>re.test(h)&&!(not&&not.test(h)));
  const iFirst=fi(/first/),iLast=fi(/last/),iName=fi(/name|student/,/first|last|teacher|school|class/),iCode=fi(/^code$|student code|login/),iScore=fi(/percent|%|pct|score|scale|total/,/date|level|rank|teacher/);
  if(iScore<0)throw new Error("Couldn’t find a score column. Name one column Score (as a percent, 0–100).");
  if(iName<0&&iFirst<0&&iCode<0)throw new Error("Couldn’t find student names. Use a Name column (or First and Last).");
  const real=CUR.students.filter(s=>!isSample(s)),idx=new Map();real.forEach(s=>nameKeys(s.name).forEach(k=>{if(!idx.has(k))idx.set(k,s.id)}));
  return rows.slice(1).map(r=>{const nm=iName>=0?r[iName]:[r[iFirst]||"",r[iLast]||""].join(" ").trim(),raw=String(r[iScore]||"").replace("%",""),sc=raw===""?null:Math.round(+raw);
    let id=null;if(iCode>=0&&r[iCode]){const s=real.find(x=>x.code===r[iCode]);if(s)id=s.id}
    if(!id)for(const k of nameKeys(nm)){if(idx.has(k)){id=idx.get(k);break}}
    return {nm,sc:sc!=null&&isFinite(sc)&&sc>=0&&sc<=100?sc:null,id}}).filter(r=>r.nm||r.sc!=null)}
function scrCard(){const cut=ipCfg().cut||60,imp=S.scr,cur=WINS[ipWinOf(Date.now())];
  return `<div class="card" id="scr-card"><h2>📥 Import screener scores</h2>
   <p class="muted">Upload the score file from your screener or benchmark (CSV, or a spreadsheet saved as CSV) with a Name column (or First and Last) and a Score column as a percent. Scores go into the window you pick. Every student below ${cut}% without a plan gets an Individualized Math Plan, and you’ll see which plans can exit.</p>
   <div class="row"><label class="f" style="min-width:140px">Window<select id="scr-w">${WINS.map(w=>`<option ${w===(imp&&imp.w||cur)?"selected":""}>${w}</option>`).join("")}</select></label>
    <label class="ghost filebtn" style="align-self:flex-end">Choose file<input type="file" id="scr-file" accept=".csv,.tsv,.txt,text/csv" hidden></label>
    <button class="link" id="scr-tpl" style="align-self:flex-end">Download a sample</button></div><p class="oops" id="scr-err" role="alert"></p>
   ${imp?`<p><b>${imp.rows.filter(r=>r.id&&r.sc!=null).length}</b> of ${imp.rows.length} rows matched a student.${imp.rows.some(r=>!r.id)?` Not matched (check spelling): ${imp.rows.filter(r=>!r.id).map(r=>esc(r.nm)).join(", ")}.`:""}</p>
    <div class="tablewrap"><table class="roster"><thead><tr><th>In file</th><th>Student</th><th>Score</th><th></th></tr></thead><tbody>${imp.rows.map(r=>{const s=r.id&&CUR.students.find(x=>x.id===r.id);
      return `<tr><td>${esc(r.nm)}</td><td>${s?esc(s.name):'<span class="muted">no match</span>'}</td><td>${r.sc??"—"}${r.sc!=null?"%":""}</td><td>${s&&r.sc!=null&&r.sc<cut?`<span class="pill oops">below ${cut}%</span>`:""}</td></tr>`}).join("")}</tbody></table></div>
    <div class="row"><button id="scr-go">Save ${esc(imp.w)} scores and update plans</button><button class="ghost" id="scr-no">Cancel</button></div>`:""}
   <p class="muted" id="scr-msg" role="status">${S.scrMsg?esc(S.scrMsg):""}</p></div>`}
function wireScr(){const f=document.getElementById("scr-file");if(!f)return;const err=document.getElementById("scr-err");
  document.getElementById("scr-tpl").onclick=()=>download("screener-sample.csv",`Name,Score\n${CUR.students.filter(s=>!isSample(s)).slice(0,3).map(s=>`"${s.name}",`).join("\n")||"Ava Jones,72\nBen Smith,48"}\n`);
  f.onchange=async e=>{const x=e.target.files[0];if(!x)return;try{S.scr={w:document.getElementById("scr-w").value,rows:parseScreener(await x.text())};S.scrMsg="";render()}catch(er){err.textContent=er.message}};
  const w=document.getElementById("scr-w");w.onchange=()=>{if(S.scr){S.scr.w=w.value;render()}};
  const no=document.getElementById("scr-no");if(no)no.onclick=()=>{S.scr=null;render()};
  const go=document.getElementById("scr-go");if(go)go.onclick=async()=>{busy(go,"Saving…");const imp=S.scr,yr=schoolYear(),cut=ipCfg().cut||60;let n=0;const made=[];
    imp.rows.forEach(r=>{if(!r.id||r.sc==null)return;const raw=CUR.raw.find(x=>x.id===r.id);if(!raw)return;raw.bm={...(raw.bm||{})};raw.bm[yr]={...(raw.bm[yr]||{}),[imp.w]:r.sc};n++;
      if(!raw.ip&&r.sc<cut&&ipCfg().on!==false){const s=CUR.students.find(x=>x.id===r.id);if(s){const p=buildProgram(s,r.sc,cut);if(p.steps.length){raw.ip=p;made.push(raw.name)}}}});
    try{await saveRoster(CUR.raw);S.scr=null;
      const ready=CUR.students.filter(s=>s.ip&&s.ip.status==="active"&&(()=>{try{return ipState(s).k==="eligible"}catch(e){return false}})()).map(s=>s.name);
      S.scrMsg=`Saved ${n} ${imp.w} score${n===1?"":"s"}.${made.length?` New Individualized Math Plans: ${made.join(", ").replace(/\.$/,"")}.`:" No new plans needed."}${ready.length?` Ready to exit their plan: ${ready.join(", ").replace(/\.$/,"")}.`:""}`;render()}
    catch(er){go.disabled=false;go.textContent="Try again";err.textContent=er.message}}}

/* ================= Accommodations: per-student defaults a teacher sets once (read-aloud, bigger text, Spanish, fewer choices) ================= */
const ACC=[["read","🔊 Read every question aloud"],["big","A+ Bigger text"],["es","Español first"],["fewer","3 answer choices instead of 4"]];
const accOn=k=>S.role==="student"&&!S.demo&&!!(SB&&SB.student&&SB.student.acc&&SB.student.acc[k]);
function accApply(d){const a=d.student&&d.student.acc;if(a&&a.big&&!BIG){BIG=true;applyBig()}}
/* fewer choices: drop one wrong answer from 4+ choice questions (never Buddy's or a Think deeper question), letters re-made */
{const vq=viewQ;viewQ=function(q){if(accOn("fewer")&&q&&q.type==="mc"&&!q._ea&&!q._bd&&!q.fixed&&Array.isArray(q.choices)&&q.choices.length>=4){
  const wrong=q.choices.map((_,i)=>i).filter(i=>L[i]!==q.ans),drop=wrong[Math.floor(Math.random()*wrong.length)],keep=q.choices.map((_,i)=>i).filter(i=>i!==drop),map={};keep.forEach((o,j)=>map[L[o]]=L[j]);
  q={...q,choices:keep.map(i=>q.choices[i]),ans:map[q.ans],why:Object.fromEntries(Object.entries(q.why||{}).filter(([k])=>map[k]).map(([k,v])=>[map[k],remapText(v,map)])),steps:(q.steps||[]).map(st=>({...st,say:remapText(st.say,map)}))}}
  return vq(q)}}

/* ================= Time saved: an estimate of teacher work Path to Proficiency did, from real data
   (answers graded, plans written, weekly plan checks, catch-up plans). Shown on each class and the school overview. ================= */
const TS_RATE={ans:.1,imp:30,chk:10,cb:10}; // minutes: grade one answer, write one IMP, one weekly plan check, one catch-up plan
function tsCalc(raws,since){const sd=dayKey(since),o={ans:0,imp:0,chk:0,cb:0};
  (raws||[]).forEach(r=>{if(!r||r.sample)return;const P=r.prog||{};
    Object.values(P).forEach(p=>{if(!p||typeof p!=="object")return;Object.entries(p.days||{}).forEach(([d,x])=>{if(d>=sd&&!(p.carryAt&&d<p.carryAt))Object.values(x||{}).forEach(y=>o.ans+=+(y&&y.n)||0)});
      if(p.cb&&p.cb.at&&p.cb.at>=sd)o.cb++});
    const ips=[...(r.ip?[r.ip]:[]),...((r.ip&&r.ip.hist)||[]).map(h=>({start:h.end}))];if(r.ip&&r.ip.start&&r.ip.start>=sd)o.imp++;
    if(r.ip&&r.ip.start){const a=Math.max(new Date(r.ip.start+"T00:00:00").getTime(),since),b=Math.min(Date.now(),new Date((r.ip.end||r.ip.start)+"T00:00:00").getTime());if(b>a)o.chk+=Math.floor((b-a)/(7*864e5))}});
  o.mins=Math.round(o.ans*TS_RATE.ans+o.imp*TS_RATE.imp+o.chk*TS_RATE.chk+o.cb*TS_RATE.cb);return o}
const tsHours=m=>m<60?`${m} min`:`${(m/60).toFixed(m<600?1:0)} hours`;
function tsCard(raws,who){const m=tsCalc(raws,Date.now()-30*864e5),y=tsCalc(raws,new Date(schoolYear().slice(0,4)+"-07-01T00:00:00").getTime());
  if(!y.mins)return "";const line=(n,t)=>n?`<li><b>${n.toLocaleString()}</b> ${t}</li>`:"";
  return `<div class="card"><div class="top"><h2>⏱ Time saved${who?` · ${esc(who)}`:""}</h2><span class="pill go">${tsHours(m.mins)} this month</span></div>
   <p>About <b>${tsHours(y.mins)}</b> of teacher work done for you this school year.</p>
   <ul style="margin:.3rem 0">${line(m.ans,"answers graded and explained")}${line(m.imp,"Individualized Math Plans written")}${line(m.chk,"weekly plan progress checks")}${line(m.cb,"catch-up plans for returning students")}</ul>
   <p class="muted" style="font-size:.8rem">Last 30 days. Estimate: ${TS_RATE.ans*60} seconds to grade an answer, ${TS_RATE.imp} minutes to write a plan, ${TS_RATE.chk} minutes per weekly plan check, ${TS_RATE.cb} minutes per catch-up plan.</p></div>`}

/* ================= Leader reports from the school overview: weekly principal summary, data meeting packet (by grade),
   and an end-of-year results report. All built from the same data as the overview; printable. ================= */
function printDoc(title,html){const w=window.open("","_blank");if(!w){alert("Allow pop-ups to print.");return}
  const css=pageCSS();
  w.document.write(`<!doctype html><html lang="en"><meta charset="utf-8"><title>${esc(title)}</title>${css}<style>body{background:#fff;color:#111;padding:0}.rp{padding:24px;break-after:page;page-break-after:always}.rp:last-child{break-after:auto}.rp table{border-collapse:collapse;width:100%;margin:8px 0}.rp td,.rp th{border:1px solid #bbb;padding:5px 8px;text-align:left;font-size:.9rem}.rp h1{margin:0 0 4px}.rp .kpis{margin:10px 0}</style>${html}<script>setTimeout(()=>print(),600)<\/script>`);w.document.close()}
const rpDays=(r,since)=>{const sd=dayKey(since),o={act:false,ms:0,n:0,ok:0};Object.values(r.prog||{}).forEach(p=>{if(p&&p.days)Object.entries(p.days).forEach(([d,x])=>{if(d<sd)return;Object.values(x||{}).forEach(y=>{if(y&&y.n){o.act=true;o.n+=y.n;o.ok+=y.ok||0;o.ms+=y.ms||0}})})});return o};
const rpReal=e=>(e.students||[]).filter(r=>!r.sample);
const rpTile=(v,l,sub)=>`<div class="kpi"><b>${v}</b><span>${l}</span>${sub?`<small>${sub}</small>`:""}</div>`;
function ovReportsCard(){return `<div class="card"><h2>🖨 Reports for leaders</h2><p class="muted">One click, ready to print or save as PDF.</p>
  <div class="row"><button class="small" id="rp-week">Weekly principal summary</button><button class="small ghost" id="rp-dm">Data meeting packet (by grade)</button><button class="small ghost" id="rp-year">Results report (this school year)</button></div></div>`}
function rpWeek(){const X=S.ov.x,R=S.ov.raw||[],wk=Date.now()-7*864e5,P=X.plans;let act=0,N=0,n=0,ok=0,ms=0;
  const rows=R.map(e=>{const L0=rpReal(e);let a=0,m=0;L0.forEach(r=>{const d=rpDays(r,wk);if(d.act)a++;m+=d.ms;n+=d.n;ok+=d.ok});act+=a;N+=L0.length;ms+=m;const c=X.classes.find(x=>x.c.id===e.cls.id)||{};
    return `<tr><td>${esc(e.cls.name)}</td><td>${L0.length}</td><td>${L0.length?Math.round(a/L0.length*100):0}%</td><td>${L0.length?Math.round(m/60000/L0.length):0} min</td><td>${c.on==null?"—":c.on+"%"}</td><td>${c.inI||0}</td></tr>`}).join("");
  const ts=tsCalc(R.flatMap(e=>e.students||[]),wk);
  printDoc("Weekly summary",`<section class="rp"><h1>Weekly summary · ${esc(TB.school.name)}</h1><p class="muted">Week ending ${new Date().toLocaleDateString()}</p>
   <div class="kpis">${rpTile(N?Math.round(act/N*100)+"%":"—","Students who practiced",`${act} of ${N}`)}${rpTile(n?Math.round(ok/n*100)+"%":"—","Accuracy this week",`${n.toLocaleString()} answers`)}${rpTile(X.prof==null?"—":X.prof+"%","Estimated proficiency",`target ${X.goal}%`)}${rpTile(P.active,"Active IMPs",P.active?`${Math.round(P.onPace/P.active*100)}% on pace`:"")}${rpTile(tsHours(ts.mins),"Teacher time saved","this week (estimate)")}</div>
   <h2>By class</h2><table><tr><th>Class</th><th>Students</th><th>Practiced this week</th><th>Avg minutes</th><th>On track</th><th>In intervention</th></tr>${rows}</table>
   ${X.attn.length?`<h2>Standards needing attention</h2><table><tr><th>Standard</th><th>Skill</th><th>Proficient</th></tr>${X.attn.slice(0,6).map(o=>`<tr><td>${esc(o.std)}</td><td>${esc(o.name)}</td><td>${o.pct}% of ${o.n}</td></tr>`).join("")}</table>`:""}
   <p class="muted" style="font-size:.8rem">Proficiency is estimated from practice, not a state test score.</p></section>`)}
function rpDM(){const X=S.ov.x,R=S.ov.raw||[],wk=Date.now()-7*864e5,gs=[...new Set(X.classes.map(x=>x.g))];
  const page=g=>{const cs=X.classes.filter(x=>x.g===g),ids=new Set(cs.map(x=>x.c.id)),E=R.filter(e=>ids.has(e.cls.id));
    const imp=E.flatMap(e=>rpReal(e).filter(r=>r.ip&&r.ip.status==="active").map(r=>({r,c:e.cls.name}))),idle=E.flatMap(e=>rpReal(e).filter(r=>!rpDays(r,wk).act).map(r=>({r,c:e.cls.name})));
    const grp={};imp.forEach(x=>{const k=(x.r.ip.steps[0]||{}).std||"—";(grp[k]=grp[k]||[]).push(x)});const at=X.attn.filter(o=>o.g===g).slice(0,6);
    return `<section class="rp"><h1>Data meeting · ${esc(gLabel(g))}</h1><p class="muted">${esc(TB.school.name)} · ${new Date().toLocaleDateString()}</p>
     <table><tr><th>Class</th><th>Students</th><th>On track</th><th>In intervention</th><th>Showing growth</th></tr>${cs.map(x=>`<tr><td>${esc(x.c.name)}</td><td>${x.n}</td><td>${x.on==null?"—":x.on+"%"}</td><td>${x.inI}</td><td>${x.gr==null?"—":x.gr+"%"}</td></tr>`).join("")}</table>
     <h2>Standards needing attention</h2>${at.length?`<table><tr><th>Standard</th><th>Skill</th><th>Proficient</th></tr>${at.map(o=>`<tr><td>${esc(o.std)}</td><td>${esc(o.name)}</td><td>${o.pct}% of ${o.n}</td></tr>`).join("")}</table>`:'<p class="muted">None below 50% right now.</p>'}
     <h2>Suggested intervention groups (by plan starting point)</h2>${Object.keys(grp).length?`<table><tr><th>Start with</th><th>Students</th></tr>${Object.entries(grp).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${v.map(x=>`${esc(x.r.name)} <span class="muted">(${esc(x.c)})</span>`).join(", ")}</td></tr>`).join("")}</table>`:'<p class="muted">No active plans.</p>'}
     <h2>Didn’t practice this week</h2><p>${idle.length?idle.map(x=>`${esc(x.r.name)} <span class="muted">(${esc(x.c)})</span>`).join(", "):"Everyone practiced."}</p>
     <h2>Notes and next steps</h2><p style="border-bottom:1px solid #bbb;height:28px"></p><p style="border-bottom:1px solid #bbb;height:28px"></p><p style="border-bottom:1px solid #bbb;height:28px"></p></section>`};
  printDoc("Data meeting packet",gs.map(page).join(""))}
function rpYear(){const X=S.ov.x,R=S.ov.raw||[],yr=schoolYear(),B=X.BM,P=X.plans,start=new Date(yr.slice(0,4)+"-07-01T00:00:00").getTime(),ts=tsCalc(R.flatMap(e=>e.students||[]),start);
  const cls=R.map(e=>{const L0=rpReal(e),c=X.classes.find(x=>x.c.id===e.cls.id)||{},bw=WINS.map(w=>{const v=L0.map(r=>((r.bm||{})[yr]||{})[w]).filter(v=>v!=null);return v.length?Math.round(v.reduce((a,x)=>a+x,0)/v.length)+"%":"—"});
    const met=L0.filter(r=>r.ip&&(r.ip.status==="met"||r.ip.status==="exited")).length;return `<tr><td>${esc(e.cls.name)}</td><td>${L0.length}</td>${bw.map(v=>`<td>${v}</td>`).join("")}<td>${c.on==null?"—":c.on+"%"}</td><td>${met}</td></tr>`}).join("");
  printDoc("Results report",`<section class="rp"><h1>Results report · ${esc(TB.school.name)} · ${esc(yr)}</h1><p class="muted">Printed ${new Date().toLocaleDateString()}</p>
   <div class="kpis">${WINS.map(w=>rpTile(B[w].n?Math.round(B[w].sum/B[w].n)+"%":"—",`${w} benchmark average`,B[w].n?`${Math.round(B[w].at/B[w].n*100)}% at or above the cut`:"not entered")).join("")}
    ${rpTile(B.moved,"Moved to at or above the cut",B.two?`${B.grew} of ${B.two} students improved`:"")}${rpTile(P.met,"Plans met goal and exited",`${P.active} still active`)}${rpTile(tsHours(ts.mins),"Teacher time saved","this school year (estimate)")}${rpTile(X.mins?Math.round(X.mins/60).toLocaleString()+" hrs":"—","Student practice time","")}</div>
   <h2>By class</h2><table><tr><th>Class</th><th>Students</th>${WINS.map(w=>`<th>${w}</th>`).join("")}<th>On track now</th><th>Plans met</th></tr>${cls}</table>
   <p class="muted" style="font-size:.8rem">Benchmark scores are the ones teachers entered or imported. “On track” is estimated from practice, not a state test score.</p></section>`)}

/* ================= Learning games (Arcade 2.0): free to play, every answer is practice on its standard ================= */
const LGAMES=[{id:"aa",name:"Area Architect",ico:"🏗️",src:"arcade/area-architect/index.html",stds:["3.MD.5","3.MD.6","3.MD.7"],grades:[3,4],
  desc:"Build a city with area: lay tiles, count square units, and multiply to design buildings."},
 {id:"mg",name:"Multiplication Galaxy",ico:"🚀",src:"arcade/multiplication-galaxy/index.html",stds:["3.OA.1–7"],grades:[3,4],
  desc:"Build star fleets in equal groups, share cargo fairly, and jump through portals with multiplication facts."},
 {id:"fi",name:"Fraction Island",ico:"🏝️",src:"arcade/fraction-island/index.html",stds:["3.G.2","3.NF.1–3"],grades:[3,4],
  desc:"Cut banners into equal parts, color fractions, sail the number line, and match equal fractions."},
 {id:"dd",name:"Delta Delivery",ico:"🚚",src:"arcade/delta-delivery/index.html",stds:["3.NBT.1–3"],grades:[3,4],
  desc:"Round delivery labels, load cargo by place value, balance the ledger, and dispatch truck convoys across the Delta."},
 {id:"md",name:"Market Day",ico:"🛍️",src:"arcade/market-day/index.html",stds:["3.OA.8","3.OA.9"],grades:[3,4],
  desc:"Run a Delta market: solve two-step story problems at the stand and the register, and crack number patterns."},
 {id:"fd",name:"Field Day Data",ico:"🏃",src:"arcade/field-day-data/index.html",stds:["3.MD.1–4"],grades:[3,4],
  desc:"Set the stadium clock, time the races, weigh the gear, build score graphs, and measure ribbons for a line plot."},
 {id:"cd",name:"Clue Detective",ico:"🔍",src:"arcade/clue-detective/index.html",stds:["3.OA.3","3.OA.8","3.NBT.2"],grades:[3,4],
  desc:"Crack story-problem cases: find the question, pick the clues that matter, dodge word traps, and solve."},
 {id:"ss",name:"Shape Sorter",ico:"👑",src:"arcade/shape-sorter/index.html",stds:["3.G.1"],grades:[3,4],
  desc:"Sort quadrilaterals at the castle gate, find shared attributes, earn family seals, and forge your own shield."}];
const lgGrade=()=>TESTID==="a1"?3:ACT&&ACT.grade?+ACT.grade:0;
const lgFor=()=>LGAMES.filter(G=>G.grades.includes(lgGrade()));
function lgCards(){const L=lgFor();if(!L.length)return "";return `<div class="card"><h2>🧠 ${t("Learning games")}</h2><p class="muted">${t("Free to play. Every answer counts as practice.")}</p>
  <div class="arc-grid">${L.map(G=>`<div class="card arc-game"><div class="arc-ico" aria-hidden="true">${G.ico}</div><h3>${esc(G.name)}</h3><span class="pill">${G.stds.join(" · ")}</span><p class="muted">${t(G.desc)}</p><button data-lg="${G.id}">${t("Play")} · ${t("free")}</button></div>`).join("")}</div></div>`}
function lgKid(std){const k=SKILLS.find(x=>x.std===std)||SKILLS.find(x=>x.std&&(x.std.startsWith(std)||std.startsWith(x.std)));return k?k.id:"lg:"+std}
function lgScreen(){const G=LGAMES.find(x=>x.id===S.lg)||LGAMES[0];
  app.innerHTML=`<iframe id="lg-frame" src="${G.src}" title="${esc(G.name)}" style="position:fixed;inset:0;width:100%;height:100%;border:0;background:#fff;z-index:20"></iframe>`}
SCREENS.lg=lgScreen;
window.addEventListener("message",e=>{const f=document.getElementById("lg-frame"),d=e.data;if(!f||e.source!==f.contentWindow||!d||(d.src!=="ptp-aa"&&d.src!=="ptp-lg"))return;
  const gp=gameProg();
  if(d.type==="ready")f.contentWindow.postMessage({src:"ptp-host",type:"init",scores:(gp.lg&&gp.lg[S.lg])||null,lang:S.lang},location.origin);
  else if(d.type==="save"&&Array.isArray(d.scores)){gp.lg=gp.lg||{};gp.lg[S.lg]=d.scores.slice(0,30).map(n=>Math.max(0,Math.min(3,+n||0)));saveGame()}
  else if(d.type==="answer"&&typeof d.std==="string"&&S.student&&!S.demo){track(S.student.prog,lgKid(d.std.slice(0,12)),!!d.ok,+d.ms||0);save()}
  else if(d.type==="exit"){S.screen="arcade";render()}});

/* the older Grade 3 benchmark goes last, so new classes don’t pick it by accident */
const testsOrdered=()=>[...TB.tests.filter(t=>t.id!=="a1"),...TB.tests.filter(t=>t.id==="a1")];
const testGroups=list=>[["Grade-level standards",list.filter(t=>isStdT(t.id))],["Benchmark tests (enter missed question numbers)",[...list.filter(t=>!isStdT(t.id)&&t.id!=="a1"),...list.filter(t=>t.id==="a1")]]].filter(g=>g[1].length);
const testOpts=(list,sel,label)=>testGroups(list).map(([g,ts])=>`<optgroup label="${esc(g)}">${ts.map(t=>`<option value="${t.id}" ${t.id===sel?"selected":""}>${label?label(t):esc(t.name)}</option>`).join("")}</optgroup>`).join("");

/* ================= Official IMP form (MDE Appendix E.3): the same layout, filled in from the student's plan.
   Teacher-only parts (core program, additional services, signatures, checklist marks) stay blank to complete by hand. ================= */
function printImpE3(s){const ip=s.ip;if(!ip)return;const box=on=>on?"☑":"☐",line=`<span style="display:inline-block;min-width:220px;border-bottom:1px solid #555">&nbsp;</span>`,first=s.name.split(" ")[0];
  const targets=ip.steps.filter(x=>x.lvl==="grade"),blocks=ip.steps.filter(x=>x.lvl!=="grade"),nm=c=>esc((LIBC[c]||{}).name||"");
  const W=(()=>{try{return ipWeeks(s)}catch(e){return []}})();
  const p1=`<section class="rp"><table><tr><th style="width:120px">APPENDIX E.3</th><th>Individualized Math Plan (IMP)</th></tr></table>
   <table><tr><td><b>Student:</b> ${esc(s.name)}</td><td><b>Teacher:</b> ${esc(TEACHER)}</td><td><b>Grade:</b> ${esc(gLabel(gradeOf()))}</td><td><b>Date:</b> ${new Date().toLocaleDateString()}</td></tr></table>
   <table><tr><th colspan="2">MATH INSTRUCTION PROGRAM</th></tr><tr><td style="width:55%">What evidence-based program will be used to deliver core math instruction (Tier I)?<br><br>${line}</td>
    <td>Indicate the areas addressed by the core math program:<br>${["Number Sense","Numbers & Operations-Base Ten","Fractions/Decimals","Algebraic Thinking","Measurement/Data","Geometry","Problem Solving"].map(a=>`${box(false)} ${a}`).join("<br>")}</td></tr></table>
   <table><tr><th colspan="3">INTERVENTION PLAN and PROGRESS MONITORING</th></tr><tr>
    <td style="width:36%"><b>Target deficit area(s):</b><br>${targets.map(x=>`${esc(x.std)} ${nm(x.std)}`).join("<br>")}${blocks.length?`<br><i>Building blocks first:</i> ${blocks.map(x=>esc(x.std)).join(", ")}`:""}
     <br><small>Identified by: benchmark/screener score ${ip.score}% (cut ${ip.cut}%) and practice data.</small><br><br><b>Intervention Type:</b><br>${box(false)} Small Group<br>${box(false)} One-on-One<br>${box(true)} Other: individualized skill plan in Path to Proficiency, ${ip.sessions||3}× a week, ${ip.minutes||20} min</td>
    <td style="width:32%"><b>What evidence-based program will be used to deliver math intervention (Tier II/III)?</b><br>Path to Proficiency individualized plan: prerequisite lessons first, worked examples, practice with feedback, and checkpoints on each standard.<br><br><i>Additional supplemental materials (if applicable):</i><br>${line}</td>
    <td><b>Expected Growth Target:</b><br>${ip.cut}% or higher on the next benchmark/screener; 70% or better weekly accuracy on plan standards by ${niceDay(ip.end)}.<br><br><b>Frequency</b> (progress monitoring):<br>${box(true)} Weekly<br>${box(false)} Biweekly<br><br><b>Exit Criteria:</b><br>${esc(ipExit(ip))}</td></tr></table>
   <table><tr><th>ADDITIONAL SERVICES</th><th>PARENTAL SUPPORT (Parent Math-at-Home Plan)</th></tr><tr>
    <td style="width:40%">Indicate any additional services:<br>${["Math Coach Support","Interventionist Support","Tutoring","Summer Learning","Other"].map(a=>`${box(false)} ${a}`).join("<br>")}</td>
    <td>${box(true)} Math-at-Home Plan Provided<br><b>Recommended strategies for families:</b><ul style="margin:4px 0"><li>Ask ${esc(first)} to show one problem from practice and explain the steps.</li><li>Practice math facts for 5 minutes a day (car rides, dinner).</li>${targets.slice(0,2).map(x=>`<li>Talk about ${nm(x.std).toLowerCase()} in everyday life (${esc(x.std)}).</li>`).join("")}<li>Celebrate effort and mistakes that lead to learning.</li></ul></td></tr>
    <tr><td><b>Written Parental Notification Received</b> ${box(false)}<br><br><b>PARENT SIGNATURE:</b> ${line}<br><br><b>DATE:</b> ${line}</td><td><b>Parent Math-at-Home Plan Received</b> ${box(false)}<br><br><b>PARENT SIGNATURE:</b> ${line}<br><br><b>DATE:</b> ${line}</td></tr></table>
   ${W.length?`<p style="font-size:.85rem"><b>Progress monitoring so far</b> (weekly accuracy on plan standards): ${W.map(x=>`Week ${x.w+1}: ${x.acc}%`).join(" · ")}</p>`:""}</section>`;
  const items=[["(a)","The student’s specific, diagnosed mathematics skill deficiencies as determined (or identified) by diagnostic assessment data and other correlating data points","Tier III Section 3B","Target deficit area(s), page 1"],
   ["(b)","The goals and benchmarks for mathematics growth","Tier III Section 3B, 3D","Expected Growth Target, page 1"],
   ["(c)","How mathematics progress will be monitored and evaluated","Tier III Section 3B, 3C, 3D","Frequency + weekly accuracy, page 1"],
   ["(d)","The type of additional instructional services and interventions the student will receive","Tier III Section 3B","Intervention Type, page 1"],
   ["(e)","The evidence-based mathematics instructional programming and intervention strategies the teacher will use to address identified mathematics deficits","Appendix E.3","Tier II/III program, page 1"],
   ["(f)","The strategies the student’s family is encouraged to use in assisting the student to achieve mathematics competency","Appendix E.3","Math-at-Home Plan, page 1"],
   ["(g)","Any additional services the teacher deems available and appropriate to accelerate the student’s mathematics skill development","Appendix E.3","Additional Services, page 1 (teacher marks)"]];
  const p2=`<section class="rp"><table><tr><th style="width:170px">APPENDIX E.3 (continued)</th><th>Individual Math Plan/MTSS Alignment Checklist</th></tr></table>
   <table><tr><td><b>Student:</b> ${esc(s.name)}</td><td><b>Teacher:</b> ${esc(TEACHER)}</td><td><b>Grade:</b> ${esc(gLabel(gradeOf()))}</td><td><b>Date:</b> ${new Date().toLocaleDateString()}</td></tr></table>
   <p style="font-size:.85rem">Following the identification of a substantial mathematics deficiency, intensive mathematics instruction and intervention must be documented for each student in an Individualized Math Plan (IMP), which includes, at a minimum, the following documentation. Place a check mark in the box once you have completed documenting this piece in the MTSS documentation packet.</p>
   <table><tr><th style="width:30px"></th><th>Required documentation</th><th style="width:160px">MTSS Documentation Packet</th><th style="width:170px">Filled in by PTP on page 1</th></tr>
   ${items.map(([k,t,p,w])=>`<tr><td style="font-size:1.2rem">${box(false)}</td><td>${k} ${t}</td><td>${p}</td><td style="font-size:.8rem">${w}</td></tr>`).join("")}</table>
   <p style="font-size:.75rem;color:#555">Pre-filled from Path to Proficiency data. Review and complete the blank fields before the Teacher Support Team meeting.</p></section>`;
  printDoc(`IMP · ${s.name}`,p1+p2)}

/* ================= Bigger text: one tap, remembered on this device ================= */
const TKEY="p2p-bigtext";let BIG=(()=>{try{return localStorage.getItem(TKEY)==="1"}catch(e){return false}})();
document.head.insertAdjacentHTML("beforeend","<style>html.big-text{font-size:118%}html.big-text body{font-size:19px}</style>");
const applyBig=()=>document.documentElement.classList.toggle("big-text",BIG);applyBig();
function textBtn(){const es=S&&S.lang==="es",l=BIG?(es?"Letra normal":"Normal text"):(es?"Letra más grande":"Bigger text");return `<button class="ghost small" id="bigtext-btn" aria-pressed="${BIG}" aria-label="${l}" title="${l}">${BIG?"A−":"A+"}</button>`}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#bigtext-btn");if(!b)return;BIG=!BIG;try{localStorage.setItem(TKEY,BIG?"1":"0")}catch(x){}applyBig();b.outerHTML=textBtn()});

/* ================= Read-aloud voices: pick the most natural voice on the device, let students choose ================= */
const VKEY="p2p-voice",NOVELTY=/albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|grandma|grandpa|rocko|shelley|sandy|flo|eddy|reed/i;
let VOX=(()=>{try{return JSON.parse(localStorage.getItem(VKEY)||"null")||{}}catch(e){return {}}})();
const saveVS=()=>{try{localStorage.setItem(VKEY,JSON.stringify(VOX))}catch(e){}};
function voiceScore(v,lang){if(!v.lang.toLowerCase().startsWith(lang))return -999;let s=0;const n=v.name;
  if(NOVELTY.test(n))s-=200;if(/natural|neural|online/i.test(n))s+=60;if(/premium|enhanced/i.test(n))s+=45;if(/google/i.test(n))s+=35;
  if(/aria|jenny|ava|emma|andrew|brian|guy|michelle|samantha|allison|susan|zoe|evan|paulina|monica|dalia|jorge|elvira|alvaro/i.test(n))s+=20;
  if(/-US$/i.test(v.lang)||/_US$/i.test(v.lang))s+=6;if(/-MX|-US|-ES/i.test(v.lang)&&lang==="es")s+=4;if(!v.localService)s+=3;return s}
function voiceList(lang){if(!TTS)return [];return speechSynthesis.getVoices().map(v=>({v,s:voiceScore(v,lang)})).filter(x=>x.s>-500).sort((a,b)=>b.s-a.s).map(x=>x.v)}
const curLang=()=>S&&S.lang==="es"?"es":"en";
function chosenVoice(lang=curLang()){const list=voiceList(lang),want=VOX[lang];return list.find(v=>v.name===want)||list[0]||null}
/* replaces the original speak(): better voice, Spanish voice for Spanish, the student's chosen speed */
function speak(text,onend){if(!TTS){onend&&onend();return}speechSynthesis.cancel();const lang=curLang(),u=new SpeechSynthesisUtterance(spoken(text)),v=chosenVoice(lang);
  u.rate=VOX.rate||.95;u.pitch=1;if(v){u.voice=v;u.lang=v.lang}else u.lang=lang==="es"?"es-US":"en-US";
  let done=false;const fin=()=>{if(!done){done=true;onend&&onend()}};u.onend=fin;u.onerror=fin;speechSynthesis.speak(u)}
if(TTS){try{speechSynthesis.getVoices();speechSynthesis.addEventListener("voiceschanged",()=>{if(S&&S.voiceOpen)render()})}catch(e){}}
function voiceBtn(){return TTS&&(S.demo||S.role==="student")?`<button class="ghost small" id="voice-btn" aria-haspopup="dialog">🔊 ${t("Voice")}</button>`:""}
const vTier=v=>/natural|neural|online/i.test(v.name)?"Natural":/premium/i.test(v.name)?"Premium":/enhanced/i.test(v.name)?"Enhanced":/google/i.test(v.name)?"Google":"";
function voiceTip(hasNat){const ua=navigator.userAgent||"",es=S.lang==="es";const T=(a,b)=>t(es?b:a);
  if(/iPad|iPhone|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1))return T("iPad or iPhone: open Settings › Accessibility › Spoken Content › Voices, pick English, and download a voice marked Enhanced or Premium. Then come back and choose it here.","iPad o iPhone: abre Configuración › Accesibilidad › Contenido leído › Voces, elige Español y descarga una voz Mejorada o Premium. Luego vuelve y elígela aquí.");
  if(/Android/.test(ua))return T("Android: open Settings › Accessibility › Text-to-speech, choose Speech Services by Google, and install the high-quality voice data. Chrome also has Google voices built in.","Android: abre Ajustes › Accesibilidad › Texto a voz, elige Servicios de voz de Google e instala los datos de voz de alta calidad.");
  if(/Edg\//.test(ua))return T("Edge has the most natural voices. Look for names that end in Natural, like Ava, Andrew, Emma, or Brian.","Edge tiene las voces más naturales. Busca nombres que terminan en Natural, como Dalia o Jorge.");
  if(/Windows/.test(ua)&&!hasNat)return T("Tip: open this site in Microsoft Edge on this computer to get Microsoft’s Natural voices, which sound the most like a real person.","Consejo: abre este sitio en Microsoft Edge en esta computadora para usar las voces Natural de Microsoft, que suenan más reales.");
  if(/Macintosh/.test(ua))return T("Mac: open System Settings › Accessibility › Spoken Content › System Voice › Manage Voices, and download a Premium or Enhanced voice. Then choose it here.","Mac: abre Configuración del Sistema › Accesibilidad › Contenido leído › Voz del sistema › Administrar voces, y descarga una voz Premium o Mejorada.");
  if(/CrOS/.test(ua))return T("Chromebook: the Google voices are the most natural. Your school can add more in Settings › Accessibility › Text-to-Speech.","Chromebook: las voces de Google son las más naturales.");
  return T("Voices come from this device. Chrome and Edge usually have the most natural ones.","Las voces vienen de este dispositivo. Chrome y Edge suelen tener las más naturales.")}
function voicePanel(){if(!S.voiceOpen)return "";const lang=curLang(),all=voiceList(lang),cur=chosenVoice(lang),rate=VOX.rate||.95,es=S.lang==="es";
  const nice=v=>v.name.replace(/Microsoft |Google |\(.*?\)|Online|Natural|Premium|Enhanced|- English.*|- Spanish.*/gi,"").replace(/\s+/g," ").trim()||v.name;
  const seen=new Set(),uniq=all.filter(v=>{const k=nice(v)+"|"+v.lang+"|"+vTier(v);if(seen.has(k))return false;seen.add(k);return true});
  const fun=uniq.filter(v=>NOVELTY.test(v.name)),plain=uniq.filter(v=>!NOVELTY.test(v.name)),top=plain.filter(v=>vTier(v)),rest=plain.filter(v=>!vTier(v));const best=top.length?top:rest.slice(0,4),more=top.length?rest:rest.slice(4);
  const accent=l=>({"en-US":"US","en-GB":"UK","en-AU":"Australia","en-IN":"India","en-CA":"Canada","en-IE":"Ireland","en-ZA":"South Africa","en-NZ":"New Zealand","es-US":"EE. UU.","es-MX":"México","es-ES":"España"})[l.replace("_","-")]||l;
  const btn=(v,i)=>`<button class="vopt${cur&&cur.name===v.name?" on":""}" data-vn="${esc(v.name)}" aria-pressed="${!!(cur&&cur.name===v.name)}"><b>${esc(nice(v))}</b><span>${esc(accent(v.lang))}${vTier(v)?` · ${t(vTier(v))}`:""}${i===0&&v===all[0]?` · ${t("Best match")}`:""}</span></button>`;
  return `<div class="voice-pop card pop" role="dialog" aria-label="${t("Choose a voice")}"><div class="top"><h3>🔊 ${t("Choose a voice")}</h3><button class="ghost small" id="voice-x">${t("Close")}</button></div>
   ${uniq.length?`<p class="label">${top.length?t("Most natural on this device"):t("Voices on this device")}</p><div class="voice-list">${best.map(btn).join("")}</div>
   ${more.length?`<details class="vmore"${S.vmore?" open":""} data-vd="vmore"><summary>${t("Basic voices")} (${more.length})</summary><div class="voice-list">${more.map((v,i)=>btn(v,i+1)).join("")}</div></details>`:""}${fun.length?`<details class="vmore"${S.vfun?" open":""} data-vd="vfun"><summary>${t("Fun voices")} (${fun.length})</summary><div class="voice-list">${fun.map((v,i)=>btn(v,i+1)).join("")}</div></details>`:""}`:`<p class="muted">${t("This device has no voices for this language.")}</p>`}
   <div class="row"><span class="label">${t("Speed")}</span>${[[.8,"Slower"],[.95,"Normal"],[1.1,"Faster"]].map(([r,l])=>`<button class="small ${Math.abs(rate-r)<.01?"":"ghost"}" data-rate="${r}">${t(l)}</button>`).join("")}</div>
   <div class="row"><button class="small" id="voice-test">▶ ${t("Try it")}</button></div>
   <p class="muted vtip">💡 ${voiceTip(top.some(v=>vTier(v)==="Natural"))}</p></div>`}
function wireVoice(){const b=document.getElementById("voice-btn");if(b)b.onclick=()=>{S.voiceOpen=!S.voiceOpen;S.musicOpen=false;render()};
  if(!S.voiceOpen)return;const lang=curLang();
  app.querySelectorAll("details[data-vd]").forEach(d=>d.ontoggle=()=>{S[d.dataset.vd]=d.open});document.getElementById("voice-x").onclick=()=>{S.voiceOpen=false;render()};
  app.querySelectorAll("[data-vn]").forEach(x=>x.onclick=()=>{VOX[lang]=x.dataset.vn;saveVS();render();speak(lang==="es"?"¡Hola! Soy Scout. Así sueno.":"Hi! I’m Scout. This is how I sound.")});
  app.querySelectorAll("[data-rate]").forEach(x=>x.onclick=()=>{VOX.rate=+x.dataset.rate;saveVS();render();speak(lang==="es"?"Esta es mi velocidad.":"This is my speed.")});
  document.getElementById("voice-test").onclick=()=>speak(lang==="es"?"¡Hola! Soy Scout. Vamos a resolver este problema paso a paso.":"Hi! I’m Scout. Let’s solve this problem step by step.")}
Object.assign(ES,{"Demo: Scout answers from this question’s built-in steps. In a real class, Scout is a full AI tutor.":"Demostración: Scout responde con los pasos de esta pregunta. En una clase real, Scout es un tutor de IA completo.","Voice":"Voz","Choose a voice":"Elige una voz","Best match":"Recomendada","Speed":"Velocidad","Slower":"Más lenta","Normal":"Normal","Faster":"Más rápida","Try it":"Probar","This device has no voices for this language.":"Este dispositivo no tiene voces para este idioma.","Voices come from this device. Chrome and Edge usually have the most natural ones.":"Las voces vienen de este dispositivo. Chrome y Edge suelen tener las más naturales.","Close":"Cerrar","Most natural on this device":"Las más naturales en este dispositivo","Voices on this device":"Voces en este dispositivo","More voices":"Más voces","Basic voices":"Voces básicas","Fun voices":"Voces divertidas","Natural":"Natural","Premium":"Premium","Enhanced":"Mejorada","Google":"Google"});

/* ================= Scout in the demo: answers built from the question’s own steps (no AI call) ================= */
const plainQ=s=>String(s||"").replace(/\[(\d+)\/(\d+)\]/g,"$1/$2").replace(/∎/g,"the box").replace(/<[^>]+>/g,"");
function demoScoutReply(text){const q=S.q,st=(q.steps||[]).map(x=>plainQ(x.say)),es=S.lang==="es";const T=(a,b)=>es?b:a;const low=text.toLowerCase(),kw=!S.bare&&step0(q)===1;
  const why=()=>{const w=q.type==="mc"?q.why?.[q._from?.[S.sel[0]]||S.sel[0]]||q.why?.[S.sel[0]]:q.whyIn?.[String(Number(S.sel[0]))]||q.whyElse;return plainQ(w||"")};
  if(/wrong|incorrect|equivoc/.test(low))return (why()?T("Here’s the trap: ","Aquí está la trampa: ")+why()+" ":"")+T("Look at the first step: ","Mira el primer paso: ")+(st[0]||"");
  if(/another way|otra manera/.test(low))return T("Try it this way: ","Inténtalo así: ")+st.slice(0,3).join(" ");
  if(/don.t get|no entiendo|still/.test(low))return T("Let’s go slower. ","Vamos más despacio. ")+(st[0]||"")+" "+T("What do you get when you do that?","¿Qué obtienes cuando haces eso?");
  if(/why does|por qué funciona/.test(low))return st[st.length-1]||T("Every step follows from the one before it.","Cada paso sigue al anterior.");
  if(/harder|más difícil/.test(low))return T("Here’s a challenge: change one number in the problem and solve it again. Does your strategy still work?","Un reto: cambia un número del problema y resuélvelo otra vez. ¿Tu estrategia todavía funciona?");
  if(/asking|pregunta/.test(low))return (kw?T("Read it slowly and find the numbers and the action words. ","Léelo despacio y busca los números y las palabras de acción. "):T("Read it slowly. ","Léelo despacio. "))+(st[0]||"");
  if(/first|primero/.test(low))return (st[0]||"")+" "+T("Start there, then check your work.","Empieza ahí y luego revisa tu trabajo.");
  if(/hint|pista/.test(low))return T("Hint: ","Pista: ")+(st[0]||"")+(kw?" "+T("Don’t forget to highlight your key words!","¡No olvides marcar tus palabras clave!"):"");
  return T("In this demo I can answer the suggested questions. In a real class I’m a full AI tutor who answers anything about the question on screen.","En esta demostración respondo las preguntas sugeridas. En una clase real soy un tutor de IA completo.")}

/* ================= Background music: calm, original music made live in the browser (no recordings, nothing to license) =================
   Off by default. Each student picks a track and volume on their own device. Teachers can turn music off for a class. */
const MKEY="p2p-music";
let MUS=(()=>{try{return JSON.parse(localStorage.getItem(MKEY)||"null")||{}}catch(e){return {}}})();
const saveMus=()=>{try{localStorage.setItem(MKEY,JSON.stringify({track:MUS.track||"off",vol:MUS.vol??.5}))}catch(e){}};
const MTRACKS=[["off","Off","Sin música","",""],["keys","Calm keys","Teclas tranquilas","Soft piano chords","Acordes suaves"],["lofi","Lo-fi study","Lo-fi para estudiar","A gentle, steady beat","Un ritmo suave"],["rain","Rain and chimes","Lluvia y campanas","Rain sounds with soft bells","Lluvia con campanas"],["stars","Starry night","Noche estrellada","Slow and dreamy","Lenta y tranquila"],["ocean","Ocean waves","Olas del mar","Slow waves and a soft hum","Olas lentas y un tono suave"],["camp","Campfire guitar","Guitarra de fogata","Gentle plucked strings","Cuerdas suaves"],["bounce","Sunny bounce","Ritmo alegre","Light and upbeat","Ligera y alegre"]];
const musicAllowed=()=>(S.demo||S.role==="student")&&!(SB&&SB.cls&&SB.cls.music===false)&&!!(window.AudioContext||window.webkitAudioContext);
const MP={ctx:null,out:null,timer:null,track:"off",step:0,next:0};
function mCtx(){if(!MP.ctx){const AC=window.AudioContext||window.webkitAudioContext;MP.ctx=new AC();MP.out=MP.ctx.createGain();MP.out.gain.value=0;
    const comp=MP.ctx.createDynamicsCompressor();MP.out.connect(comp);comp.connect(MP.ctx.destination)}return MP.ctx}
const mf=n=>440*Math.pow(2,(n-69)/12);
function mNote(note,t,dur,{type="sine",gain=.12,attack=.02,release=.8,cut=2400}={}){const c=MP.ctx,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();
  o.type=type;o.frequency.value=mf(note);f.type="lowpass";f.frequency.value=cut;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+attack);g.gain.setTargetAtTime(0,t+dur,release/4);
  o.connect(f);f.connect(g);g.connect(MP.out);o.start(t);o.stop(t+dur+release+.1)}
function mNoise(t,dur,{gain=.05,cut=1200,q=.7,hp=0}={}){const c=MP.ctx,len=Math.ceil(c.sampleRate*Math.max(.05,dur)),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type=hp?"highpass":"lowpass";f.frequency.value=hp||cut;f.Q.value=q;const g=c.createGain();g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0005,t+dur);
  s.connect(f);f.connect(g);g.connect(MP.out);s.start(t);s.stop(t+dur+.05)}
/* chord progressions (MIDI notes) */
const PROG_A=[[57,60,64,67],[53,57,60,64],[48,52,55,60],[55,59,62,65]],PROG_B=[[50,53,57,60],[55,59,62,65],[48,52,55,59],[53,57,60,64]];
const PENTA=[60,62,64,67,69,72,74,76,79,81];
const MSTEP={
  keys:{beat:.5,run(t,s){const ch=PROG_A[Math.floor(s/16)%4];if(s%16===0)ch.forEach(n=>mNote(n-12,t,7.5,{type:"triangle",gain:.05,attack:1.2,release:3,cut:900}));
    if(s%2===0&&Math.random()<.8){const n=ch[(s/2)%4]+12;mNote(n,t,.9,{type:"sine",gain:.07,release:1.6,cut:1800})}}},
  lofi:{beat:.4,run(t,s){const ch=PROG_B[Math.floor(s/16)%4];if(s%16===0)ch.forEach(n=>mNote(n,t,6.2,{type:"sawtooth",gain:.018,attack:.3,release:2,cut:700}));
    if(s%8===0||s%8===5)mNote(36,t,.25,{type:"sine",gain:.22,attack:.005,release:.3,cut:200});
    if(s%8===4)mNoise(t,.18,{gain:.05,cut:1800});if(s%2===1)mNoise(t,.05,{gain:.018,hp:7000});
    if(s%4===2&&Math.random()<.5)mNote(ch[Math.floor(Math.random()*4)]+12,t,.5,{type:"triangle",gain:.04,release:.8,cut:1600})}},
  rain:{beat:.5,run(t,s){mNoise(t,.6,{gain:.03,cut:900});if(Math.random()<.35)mNote(PENTA[Math.floor(Math.random()*PENTA.length)]+12,t+Math.random()*.4,.2,{type:"sine",gain:.05,attack:.005,release:2.5,cut:4000})}},
  stars:{beat:.75,run(t,s){const ch=PROG_A[Math.floor(s/8)%4];if(s%8===0)ch.forEach(n=>mNote(n-12,t,6,{type:"sine",gain:.045,attack:2,release:3,cut:700}));
    if(Math.random()<.45)mNote(PENTA[Math.floor(Math.random()*6)+4],t,1.2,{type:"sine",gain:.04,attack:.05,release:3,cut:2600})}},
  ocean:{beat:.5,run(t,s){if(s%12===0){mNoise(t,5.5,{gain:.045,cut:500});PROG_A[Math.floor(s/48)%4].slice(0,3).forEach(n=>mNote(n-12,t,6,{type:"sine",gain:.035,attack:2.5,release:3,cut:600}))}
    if(s%12===6)mNoise(t,4,{gain:.03,cut:350})}},
  camp:{beat:.4,run(t,s){const ch=PROG_B[Math.floor(s/16)%4],pat=[0,2,1,3,2,1];mNote(ch[pat[s%6]]+(s%6===0?-12:0),t,1.4,{type:"triangle",gain:.06,attack:.005,release:1.2,cut:1500})}},
  bounce:{beat:.3,run(t,s){const ch=PROG_A[Math.floor(s/16)%4];if(s%4===0)mNote(ch[0]-24,t,.3,{type:"sine",gain:.16,attack:.005,release:.3,cut:300});
    if(s%4===2)mNoise(t,.08,{gain:.025,hp:5000});if(s%2===0)mNote(ch[(s/2)%4]+12,t,.25,{type:"triangle",gain:.045,attack:.005,release:.4,cut:2400})}},
};
function musicPlay(track){MUS.track=track;saveMus();if(track==="off"||!musicAllowed()){musicStop();return}
  const c=mCtx();if(c.state==="suspended")c.resume();MP.track=track;MP.step=0;MP.next=c.currentTime+.1;
  MP.out.gain.cancelScheduledValues(c.currentTime);MP.out.gain.setTargetAtTime((MUS.vol??.5)*.9,c.currentTime,.6);
  clearInterval(MP.timer);MP.timer=setInterval(()=>{if(!MP.ctx||MP.track==="off")return;const T=MSTEP[MP.track];while(MP.next<MP.ctx.currentTime+.6){T.run(MP.next,MP.step);MP.step++;MP.next+=T.beat}},120)}
function musicStop(){MP.track="off";clearInterval(MP.timer);MP.timer=null;if(MP.ctx&&MP.out)MP.out.gain.setTargetAtTime(0,MP.ctx.currentTime,.3)}
function musicVol(v){MUS.vol=v;saveMus();if(MP.ctx&&MP.track!=="off")MP.out.gain.setTargetAtTime(v*.9,MP.ctx.currentTime,.2)}
function musicBtn(){return musicAllowed()?`<button class="ghost small" id="music-btn" aria-haspopup="dialog" aria-pressed="${MP.track!=="off"}">♪ ${S.lang==="es"?"Música":"Music"}${MP.track!=="off"?" ·":""}</button>`:""}
function musicPanel(){if(!S.musicOpen||!musicAllowed())return "";const es=S.lang==="es",cur=MP.track!=="off"?MP.track:"off";
  return `<div class="voice-pop music-pop card pop" role="dialog" aria-label="${es?"Música de fondo":"Background music"}"><div class="top"><h3>♪ ${es?"Música de fondo":"Background music"}</h3><button class="ghost small" id="music-x">${t("Close")}</button></div>
   <div class="voice-list">${MTRACKS.map(([id,en,sp,de,ds])=>`<button class="vopt${cur===id?" on":""}" data-mt="${id}" aria-pressed="${cur===id}"><b>${es?sp:en}</b><span>${es?ds:de}</span></button>`).join("")}</div>
   <label class="row" style="gap:10px"><span class="label">${es?"Volumen":"Volume"}</span><input type="range" id="music-vol" min="0" max="1" step="0.05" value="${MUS.vol??.5}" style="flex:1"></label>
   <p class="muted vtip">${es?"La música es original y se crea en tu dispositivo. Usa audífonos en clase.":"This music is original and made right on your device. Use headphones in class."}</p></div>`}
function wireMusic(){const b=document.getElementById("music-btn");if(b)b.onclick=()=>{S.musicOpen=!S.musicOpen;S.voiceOpen=false;render()};
  if(!S.musicOpen)return;document.getElementById("music-x").onclick=()=>{S.musicOpen=false;render()};
  app.querySelectorAll("[data-mt]").forEach(x=>x.onclick=()=>{musicPlay(x.dataset.mt);render()});
  const v=document.getElementById("music-vol");if(v)v.oninput=()=>musicVol(+v.value)}

/* ================= ACT® Math and WorkKeys® Applied Math courses =================
   Course keys: 10 = ACT Math prep, 11 = WorkKeys Applied Math (Levels 3–7).
   All practice items are original. ACT and WorkKeys are registered trademarks of ACT Education Corp.,
   which is not affiliated with and does not endorse Path to Proficiency. */
const TM_NOTE="ACT® and WorkKeys® are registered trademarks of ACT Education Corp., which is not affiliated with and does not endorse Path to Proficiency. All practice questions are original.";
const isWK=()=>gradeOf()===11,isACTc=()=>gradeOf()===10,hsOn=()=>isHS(gradeOf());

/* ---------- right triangle picture ---------- */
const _vizHTML0=vizHTML;
vizHTML=function(v){if(!v||!v.rtri)return _vizHTML0(v);const o=v.rtri,W=260,H=180,X0=40,Y0=150,X1=220,Y1=30;
  let s=`<polygon points="${X0},${Y0} ${X1},${Y0} ${X0},${Y1}" fill="${VS}" fill-opacity=".35" stroke="${VK}" stroke-width="2.5"/><path d="M${X0+14},${Y0} L${X0+14},${Y0-14} L${X0},${Y0-14}" fill="none" stroke="${VK}" stroke-width="2"/>`;
  s+=tx(X0-12,(Y0+Y1)/2+5,o.a,{a:"end",s:16,w:800})+tx((X0+X1)/2,Y0+24,o.b,{s:16,w:800})+tx((X0+X1)/2+16,(Y0+Y1)/2-6,o.c,{a:"start",s:16,w:800});
  if(o.ang)s+=`<path d="M${X1-30},${Y0} A30,30 0 0 0 ${(X1-30*Math.cos(Math.atan2(Y0-Y1,X1-X0))).toFixed(1)},${(Y0-30*Math.sin(Math.atan2(Y0-Y1,X1-X0))).toFixed(1)}" fill="none" stroke="#C0392B" stroke-width="2.5"/>`+tx(X1-42,Y0-8,o.ang,{s:15,w:800,c:"#C0392B"});
  return svgw(W,H,s,v.alt||"a right triangle",280)};

/* ---------- building blocks for Individualized Math Plans ---------- */
Object.assign(PREQ,{
 "ACT.NQ.1":["8.EE.1","8.EE.2"],"ACT.NQ.2":["8.EE.4","8.EE.3","8.NS.2"],"ACT.NQ.3":["7.NS.2a","A-APR.1"],"ACT.NQ.4":["7.NS.1b","8.G.7"],
 "ACT.ALG.1":["A-REI.3","8.EE.7b"],"ACT.ALG.2":["A-CED.1","7.EE.3"],"ACT.ALG.3":["A-REI.6","8.EE.8b"],"ACT.ALG.4":["A-REI.3","7.EE.4b"],
 "ACT.ALG.5":["A-APR.1","A-SSE.2"],"ACT.ALG.6":["A-REI.4b","A-SSE.3a"],"ACT.ALG.7":["A-SSE.2","8.EE.2"],"ACT.ALG.8":["A-CED.4","A-REI.3"],
 "ACT.FUN.1":["F-IF.2","8.F.1"],"ACT.FUN.2":["8.EE.6","8.F.4"],"ACT.FUN.3":["F-IF.1","F-IF.4"],"ACT.FUN.4":["F-IF.8a","A-APR.3"],
 "ACT.FUN.5":["F-LE.2","F-LE.1c"],"ACT.FUN.6":["F-BF.3","8.G.3"],"ACT.FUN.7":["8.G.7","7.G.4"],"ACT.FUN.8":["F-IF.3","F-LE.2"],
 "ACT.GEO.1":["8.G.5","7.G.5"],"ACT.GEO.2":["8.G.7","8.EE.2"],"ACT.GEO.3":["8.G.7","8.G.4"],"ACT.GEO.4":["7.G.6","6.G.1"],
 "ACT.GEO.5":["7.G.4","8.G.8"],"ACT.GEO.6":["8.G.9","7.G.6"],"ACT.GEO.7":["8.G.8","8.EE.6"],"ACT.GEO.8":["8.G.4","7.G.1"],
 "ACT.SP.1":["6.SP.5c","S-ID.3"],"ACT.SP.2":["7.SP.8a","7.SP.5"],"ACT.SP.3":["7.SP.8b"],"ACT.SP.4":["8.SP.4","7.SP.7a"],
 "ACT.IES.1":["7.RP.3","6.RP.3c"],"ACT.IES.2":["7.RP.2b","6.RP.3b"],"ACT.IES.3":["6.RP.3d","N-Q.1"],"ACT.IES.4":["7.NS.3","7.EE.3"],
 "WK.L3.1":["7.NS.1b"],"WK.L3.2":["5.NBT.7"],"WK.L3.3":["7.NS.2d","6.RP.3c"],"WK.L3.4":["4.MD.1","4.MD.2"],
 "WK.L4.1":["7.EE.3","WK.L3.1"],"WK.L4.2":["6.SP.5c","WK.L3.1"],"WK.L4.3":["6.RP.3","6.RP.2"],"WK.L4.4":["5.NF.4a","4.NF.3c"],"WK.L4.5":["WK.L3.2"],
 "WK.L5.1":["WK.L4.1","7.EE.3"],"WK.L5.2":["5.NF.1","5.NF.2"],"WK.L5.3":["WK.L3.4","6.RP.3d"],"WK.L5.4":["6.RP.3b","WK.L4.3"],"WK.L5.5":["7.G.4","6.G.1"],"WK.L5.6":["7.RP.3","WK.L3.3"],"WK.L5.7":["WK.L4.1"],
 "WK.L6.1":["WK.L5.6","7.RP.3"],"WK.L6.2":["WK.L5.3","6.RP.3d"],"WK.L6.3":["WK.L5.4"],"WK.L6.4":["WK.L5.5","A-CED.4"],"WK.L6.5":["6.G.2","WK.L5.5"],"WK.L6.6":["WK.L4.3","7.RP.1"],"WK.L6.7":["WK.L5.7","A-CED.1"],
 "WK.L7.1":["WK.L6.6","7.RP.1"],"WK.L7.2":["WK.L6.5","8.G.9"],"WK.L7.3":["WK.L6.3"],"WK.L7.4":["WK.L4.2","S-ID.2"],"WK.L7.5":["WK.L6.6","WK.L5.1"]});


/* ---------- calculator: both tests allow one ---------- */
function calcEval(src){
  const s=String(src).replace(/\s+/g,"").replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-").replace(/π/g,"p").replace(/√/g,"r").replace(/,/g,"");
  if(!s)return null;if(!/^[0-9.+\-*/^()%pr]+$/.test(s))throw new Error("Use numbers and + − × ÷ ^ √ ( )");
  let i=0;const peek=()=>s[i],eat=c=>{if(s[i]===c){i++;return true}return false};
  const num=()=>{if(eat("p"))return Math.PI;if(eat("(")){const v=add();if(!eat(")"))throw new Error("Missing )");return v}
    if(eat("r")){return Math.sqrt(unary())}const m=s.slice(i).match(/^\d*\.?\d+(?:e[+-]?\d+)?|^\d+\./);if(!m)throw new Error("Check the expression");i+=m[0].length;return parseFloat(m[0])};
  const post=()=>{let v=num();while(eat("%"))v/=100;return v};
  const pow=()=>{const b=post();if(eat("^"))return Math.pow(b,unary());return b};
  const unary=()=>{if(eat("-"))return -unary();if(eat("+"))return unary();return pow()};
  const mul=()=>{let v=unary();for(;;){if(eat("*"))v*=unary();else if(eat("/"))v/=unary();else if(peek()==="("||peek()==="p"||peek()==="r")v*=unary();else return v}};
  const add=()=>{let v=mul();for(;;){if(eat("+"))v+=mul();else if(eat("-"))v-=mul();else return v}};
  const v=add();if(i<s.length)throw new Error("Check the expression");if(!Number.isFinite(v))throw new Error("That can’t be computed");return v}
const calcFmt=v=>{const r=Math.abs(v)>=1e12||(Math.abs(v)<1e-6&&v)?v.toExponential(6):String(+v.toPrecision(10));return r.replace("-","−")};
const FORMULAS=[["Distance and length",["1 foot = 12 inches","1 yard = 3 feet","1 mile = 5,280 feet","1 meter = 100 centimeters","1 kilometer = 1,000 meters","1 inch ≈ 2.54 centimeters","1 mile ≈ 1.61 kilometers"]],
 ["Weight",["1 pound = 16 ounces","1 ton = 2,000 pounds","1 kilogram ≈ 2.2 pounds"]],
 ["Liquid volume",["1 cup = 8 fluid ounces","1 pint = 2 cups","1 quart = 2 pints","1 gallon = 4 quarts","1 liter ≈ 1.06 quarts","1 cubic foot ≈ 7.48 gallons"]],
 ["Time and temperature",["1 minute = 60 seconds","1 hour = 60 minutes","°C = (°F − 32) ÷ 1.8","°F = 1.8 × °C + 32"]],
 ["Area and perimeter",["Rectangle: P = 2l + 2w, A = l × w","Triangle: A = ½ × base × height","Circle: C = π × d = 2 × π × r, A = π × r²","π ≈ 3.14","1 square yard = 9 square feet"]],
 ["Volume",["Box: V = l × w × h","Cylinder: V = π × r² × h","Cone: V = ⅓ × π × r² × h","Sphere: V = (4/3) × π × r³","1 cubic yard = 27 cubic feet"]]];
function hsToolsBar(){if(!hsOn())return "";
  return `<div class="row hs-tools"><button class="ghost small" id="calc-btn" aria-expanded="${!!S.calcOpen}">🧮 ${t("Calculator")}</button>${isWK()?`<button class="ghost small" id="fs-btn" aria-expanded="${!!S.fsOpen}">📄 ${t("Formula sheet")}</button>`:`<span class="muted" style="font-size:.82rem">${t("The ACT gives no formula sheet, so learn the key formulas.")}</span>`}</div>
   <div class="hs-panels">${S.calcOpen?`<div class="card calc pop" role="group" aria-label="${t("Calculator")}"><div class="calc-disp"><input id="calc-in" value="${esc(S.calcExpr||"")}" aria-label="${t("Type a calculation")}" autocomplete="off" inputmode="decimal"><output id="calc-out" aria-live="polite">${esc(S.calcOut||"")}</output></div>
     <div class="calc-keys">${["7","8","9","÷","√","4","5","6","×","^","1","2","3","−","(","0",".","π","+",")","C","⌫","%","="].map(k=>`<button class="ck${"÷×−+^=".includes(k)?" op":""}${k==="="?" eq":""}" data-ck="${k}" aria-label="${{"÷":"divide","×":"times","−":"minus","+":"plus","^":"to the power","√":"square root","⌫":"delete","C":"clear","=":"equals","π":"pi","%":"percent"}[k]||k}">${k}</button>`).join("")}</div></div>`:""}
   ${S.fsOpen&&isWK()?`<div class="card fsheet pop"><div class="top"><h3>📄 ${t("Formula sheet")}</h3><button class="ghost small" id="fs-x">${t("Close")}</button></div><div class="fs-grid">${FORMULAS.map(([h,l])=>`<div><b>${esc(h)}</b><ul>${l.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div></div>`:""}</div>`}
function wireHsTools(){const cb=document.getElementById("calc-btn");if(!cb)return;
  cb.onclick=()=>{S.calcOpen=!S.calcOpen;rerenderKeep()};
  const fb=document.getElementById("fs-btn");if(fb)fb.onclick=()=>{S.fsOpen=!S.fsOpen;rerenderKeep()};
  const fx=document.getElementById("fs-x");if(fx)fx.onclick=()=>{S.fsOpen=false;rerenderKeep()};
  const inp=document.getElementById("calc-in"),out=document.getElementById("calc-out");if(!inp)return;
  const run=()=>{try{const v=calcEval(inp.value);S.calcOut=v==null?"":"= "+calcFmt(v);out.textContent=S.calcOut;if(v!=null)S.calcLast=v}catch(e){out.textContent=e.message}};
  inp.oninput=()=>{S.calcExpr=inp.value};inp.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();run()}};
  app.querySelectorAll("[data-ck]").forEach(b=>b.onclick=()=>{const k=b.dataset.ck;
    if(k==="=")return run();if(k==="C"){inp.value="";out.textContent="";S.calcOut=""}else if(k==="⌫")inp.value=inp.value.slice(0,-1);else inp.value+=k;S.calcExpr=inp.value})}
/* re-render without losing what is typed in the practice answer box */
function rerenderKeep(){const n=document.getElementById("num"),v=n&&n.value,y=window.scrollY;render();const m=document.getElementById("num");if(m&&v!=null)m.value=v;window.scrollTo(0,y)}

/* ---------- where a student stands ---------- */
const ACT_CATS=["ACT-NQ","ACT-ALG","ACT-FUN","ACT-GEO","ACT-SP","ACT-IES"],WK_LVLS=[3,4,5,6,7];
const skillsOf=pre=>SKILLS.filter(k=>LIBC[k.std]&&LIBC[k.std].dom===pre);
function catPct(s,dom){const ks=skillsOf(dom),days=Object.values(s.prog.days||{}),rec=s.prog.recent||[];
  if(!ks.some(k=>{const sk=s.prog.skills[k.id];return sk&&(sk.status==="done"||sk.status==="skip"||rec.some(r=>r.k===k.id)||days.some(d=>d[k.id]))}))return null;let w=0,v=0;ks.forEach(k=>{const sc=stdScore(s,k);if(sc==null)return;w++;v+=sc});return w?Math.round(v/w*100):null}
/* WorkKeys level estimate from practice: the highest level where this level and every level below it is at least 75% mastered */
function wkLevel(s){const per={};WK_LVLS.forEach(L=>per[L]=catPct(s,"WK-L"+L));let lvl=0;for(const L of WK_LVLS){if(per[L]!=null&&per[L]>=75)lvl=L;else break}return {lvl,per}}
const dShort=t=>new Date(t).toLocaleDateString(undefined,{month:"short",day:"numeric"});
const lastPT=s=>{const a=(s.prog&&s.prog.pt)||[];return a.length?a[a.length-1]:null};
const lvlTxt=l=>l?`Level ${l}`:"Below Level 3";
function hsBars(rows){return `<div class="hsbars">${rows.map(([lab,p,sub])=>`<div class="hsb"><span class="hsl">${esc(lab)}</span><span class="bar" role="img" aria-label="${esc(lab)}: ${p==null?"not started":p+"%"}"><span style="width:${p||0}%;background:${p==null?"var(--rule)":p>=75?"var(--go)":p>=50?"var(--gold)":"var(--oops)"}"></span></span><b>${p==null?"—":p+"%"}</b>${sub?`<small class="muted">${esc(sub)}</small>`:""}</div>`).join("")}</div>`}
function hsHomeCard(s){if(!hsOn())return "";const pt=lastPT(s);
  if(isWK()){const w=wkLevel(s);
    return `<div class="card hs-card"><div class="top"><h2>🏅 ${t("My WorkKeys level")}</h2><span class="pill ${w.lvl>=5?"go":w.lvl>=4?"gold":""}">${t("Estimate")}: ${lvlTxt(w.lvl)}</span></div>
     ${hsBars(WK_LVLS.map(L=>[`Level ${L}`,w.per[L]]))}
     <p class="muted" style="font-size:.85rem">${t("A level counts when you have mastered most of its skills and every level below it.")}${pt?` ${t("Last practice test")}: <b>${lvlTxt(pt.lvl)}</b> (${pt.right}/${pt.n}).`:""}</p>
     <div class="row"><button id="pt-go">📝 ${t("Take a practice test")}</button></div></div>`}
  return `<div class="card hs-card"><div class="top"><h2>🎯 ${t("My ACT Math skills")}</h2>${pt?`<span class="pill">${t("Last practice test")}: ${Math.round(pt.right/pt.n*100)}%</span>`:""}</div>
   ${hsBars(ACT_CATS.map(d=>[DOMS[d],catPct(s,d)]))}
   <div class="row"><button id="pt-go">📝 ${t("Take a practice test")}</button></div></div>`}
function wireHsHome(){const b=document.getElementById("pt-go");if(b)b.onclick=()=>{S.screen="ptest";S.PT=null;render()}}

/* ---------- timed practice test ---------- */
const PT_PLAN={act:{full:{n:45,mins:50,mix:{"ACT-NQ":4,"ACT-ALG":9,"ACT-FUN":9,"ACT-GEO":9,"ACT-SP":5,"ACT-IES":9}},half:{n:23,mins:25,mix:{"ACT-NQ":2,"ACT-ALG":5,"ACT-FUN":4,"ACT-GEO":5,"ACT-SP":2,"ACT-IES":5}}},
 wk:{full:{n:34,mins:55,mix:{"WK-L3":5,"WK-L4":7,"WK-L5":8,"WK-L6":8,"WK-L7":6}},half:{n:17,mins:28,mix:{"WK-L3":3,"WK-L4":3,"WK-L5":4,"WK-L6":4,"WK-L7":3}}}};
let ptTimer=null;
function ptBuild(size){const kind=isWK()?"wk":"act",P=PT_PLAN[kind][size],qs=[];
  Object.entries(P.mix).forEach(([dom,n])=>{const ks=shuffle(LIB.filter(x=>x.dom===dom));for(let j=0;j<n;j++){const L0=ks[j%ks.length];let q=null;
    for(let t2=0;t2<12;t2++){try{const c=GG.make(L0.gen,(Math.random()*1e9)|0);if(c.type==="mc"){q=c;break}q=q||c}catch(e){}}if(q)qs.push({std:L0.code,dom,q})}});
  const order=kind==="wk"?qs:shuffle(qs);
  S.calcOpen=false;S.fsOpen=false;S.PT={kind,size,qs:order,ans:order.map(()=>null),flag:order.map(()=>false),i:0,start:Date.now(),secs:P.mins*60,done:false};
  clearInterval(ptTimer);ptTimer=setInterval(ptTick,1000)}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const ptLeft=()=>Math.max(0,S.PT.secs-Math.floor((Date.now()-S.PT.start)/1000));
const mmss=x=>`${Math.floor(x/60)}:${String(x%60).padStart(2,"0")}`;
function ptTick(){if(!S.PT||S.PT.done||S.screen!=="ptest"){clearInterval(ptTimer);ptTimer=null;return}const l=ptLeft(),el=document.getElementById("pt-clock");if(el){el.textContent=mmss(l);el.classList.toggle("low",l<=300)}if(l<=0)ptFinish(true)}
function ptRight(x,a){return a!=null&&(x.q.type==="mc"?a===x.q.ans:Number(String(a).replace(/,/g,""))===Number(x.q.ans))}
function ptFinish(timeUp){const P=S.PT;if(P.done)return;P.done=true;P.timeUp=!!timeUp;clearInterval(ptTimer);ptTimer=null;
  const by={};P.qs.forEach((x,i)=>{const o=by[x.dom]||(by[x.dom]=[0,0]);o[1]++;if(ptRight(x,P.ans[i]))o[0]++});
  const right=P.qs.filter((x,i)=>ptRight(x,P.ans[i])).length;let lvl=0;
  if(P.kind==="wk")for(const L of WK_LVLS){const o=by["WK-L"+L];if(o&&o[0]/o[1]>=.65)lvl=L;else break}
  P.res={at:Date.now(),kind:P.kind,size:P.size,n:P.qs.length,right,mins:Math.round((Date.now()-P.start)/60000),by,...(P.kind==="wk"?{lvl}:{})};
  if(S.student&&!S.demo){const p=S.student.prog;p.pt=[...(p.pt||[]),P.res].slice(-12);S.student.raw.prog={...(S.student.raw.prog||{}),[TESTID]:p};save()}
  else if(S.student){const p=S.student.prog;p.pt=[...(p.pt||[]),P.res].slice(-12)}
  chirp&&chirp("mastered");render()}
function ptestScreen(){const P=S.PT,kind=isWK()?"wk":"act",nm=kind==="wk"?"WorkKeys® Applied Math":"ACT® Math";
  if(!P){const pl=PT_PLAN[kind];
    app.innerHTML=header(`<button class="ghost" id="pt-back">${t("My trail")}</button>`)+`<div class="card"><h2>📝 ${esc(nm)} ${t("practice test")}</h2>
     <p>${kind==="wk"?t("Workplace math problems from Level 3 to Level 7, with 5 answer choices. A calculator and the formula sheet are allowed."):t("Questions from every ACT Math category, with 4 answer choices. A calculator is allowed. There is no formula sheet.")}</p>
     <div class="pt-pick">${["full","half"].map(sz=>`<button class="pt-opt" data-sz="${sz}"><b>${sz==="full"?t("Full-length"):t("Half-length")}</b><span>${pl[sz].n} ${t("questions")} · ${pl[sz].mins} ${t("minutes")}</span></button>`).join("")}</div>
     <p class="muted" style="font-size:.85rem">${t("Your score is a practice estimate, not an official score.")} ${esc(TM_NOTE)}</p></div>`;
    document.getElementById("pt-back").onclick=()=>{S.screen="home";render()};
    app.querySelectorAll("[data-sz]").forEach(b=>b.onclick=()=>{ptBuild(b.dataset.sz);render()});return}
  if(P.done)return ptResults();
  const x=P.qs[P.i],q=x.q,a=P.ans[P.i],answered=P.ans.filter(v=>v!=null).length;
  app.innerHTML=header(`<span class="pt-clock" id="pt-clock" role="timer" aria-label="${t("Time left")}">${mmss(ptLeft())}</span>`,`${nm} ${t("practice test")}`)+`
   <div class="row" style="justify-content:space-between"><span class="label">${t("Question")} ${P.i+1} ${t("of")} ${P.qs.length}</span><span class="muted">${answered} ${t("answered")}</span></div>
   <div class="pt-nav" role="group" aria-label="${t("Jump to a question")}">${P.qs.map((_,i)=>`<button class="pn${i===P.i?" on":""}${P.ans[i]!=null?" done":""}${P.flag[i]?" flag":""}" data-pi="${i}" aria-label="${t("Question")} ${i+1}${P.ans[i]!=null?", "+t("answered"):""}${P.flag[i]?", "+t("flagged"):""}">${i+1}</button>`).join("")}</div>
   <div class="notebook">${bodyHTML(q,null,"plain")}</div>
   ${q.type==="mc"?`<div class="choices${q.choices.some(c=>typeof c==="string"&&c.length>40)?" one":""}">${q.choices.map((c,i)=>{const l=L[i];return `<button class="choice${a===l?" sel":""}" data-pl="${l}" aria-pressed="${a===l}"><b class="l">${l}</b><div>${choiceInner(c)}</div></button>`}).join("")}</div>`
     :`<label class="f">${t("Your answer")}<input class="num" id="pt-num" inputmode="decimal" value="${esc(a||"")}"></label>`}
   ${hsToolsBar()}
   <div class="row" style="justify-content:space-between;margin-top:10px"><div class="row"><button class="ghost" id="pt-prev" ${P.i?"":"disabled"}>← ${t("Back")}</button><button class="ghost" id="pt-flag" aria-pressed="${P.flag[P.i]}">🚩 ${P.flag[P.i]?t("Unflag"):t("Flag for review")}</button></div>
    <div class="row">${P.i<P.qs.length-1?`<button id="pt-next">${t("Next")} →</button>`:""}<button class="${P.i<P.qs.length-1?"ghost":""}" id="pt-done">${t("Finish test")}</button></div></div><p class="fb info" id="pt-warn" role="status" hidden></p>`;
  const go=i=>{P.i=i;P.sure=false;render();window.scrollTo(0,0)};
  app.querySelectorAll("[data-pl]").forEach(b=>b.onclick=()=>{P.ans[P.i]=b.dataset.pl;render()});
  const pn=document.getElementById("pt-num");if(pn)pn.oninput=()=>{P.ans[P.i]=pn.value.trim()||null};
  app.querySelectorAll("[data-pi]").forEach(b=>b.onclick=()=>go(+b.dataset.pi));
  document.getElementById("pt-prev").onclick=()=>go(P.i-1);
  const nx=document.getElementById("pt-next");if(nx)nx.onclick=()=>go(P.i+1);
  document.getElementById("pt-flag").onclick=()=>{P.flag[P.i]=!P.flag[P.i];render()};
  document.getElementById("pt-done").onclick=()=>{const left=P.qs.length-P.ans.filter(v=>v!=null).length;if(left&&!P.sure){P.sure=true;const m=document.getElementById("pt-warn");m.textContent=`${left} ${t("questions are still blank. Tap Finish test again to turn it in anyway.")}`;m.hidden=false;return}ptFinish(false)};
  wireHsTools()}
SCREENS.ptest=ptestScreen;
function ptResults(){const P=S.PT,R=P.res,pct=Math.round(R.right/R.n*100),wk=P.kind==="wk";
  const rows=wk?WK_LVLS.map(L=>{const o=R.by["WK-L"+L]||[0,0];return [`Level ${L}`,o[1]?Math.round(o[0]/o[1]*100):null,`${o[0]} of ${o[1]}`]}):ACT_CATS.map(d=>{const o=R.by[d]||[0,0];return [DOMS[d],o[1]?Math.round(o[0]/o[1]*100):null,`${o[0]} of ${o[1]}`]});
  app.innerHTML=header(`<button class="ghost" id="pt-back">${t("My trail")}</button>`)+`<div class="card pt-res"><div class="top"><h2>📝 ${t("Practice test results")}</h2>${P.timeUp?`<span class="pill gold">${t("Time ran out")}</span>`:""}</div>
    <div class="kpis small"><div class="kpi ${pct>=70?"go":pct>=50?"gold":"oops"}"><b>${R.right}/${R.n}</b><span>${t("correct")} (${pct}%)</span></div>
     ${wk?`<div class="kpi ${R.lvl>=5?"go":R.lvl>=4?"gold":R.lvl?"":"oops"}"><b>${lvlTxt(R.lvl)}</b><span>${t("estimated level")}</span><small>${t("practice estimate, not an official score")}</small></div>`:""}
     <div class="kpi"><b>${R.mins||"<1"}</b><span>${t("minutes used")}</span></div></div>
    ${hsBars(rows)}
    <p class="muted" style="font-size:.85rem">${wk?t("A level counts when you get at least 65% of its questions right, and every level below it too. Practice the lowest level that isn’t green next."):t("Practice the categories that aren’t green yet. Your trail already has every ACT Math skill on it.")}</p></div>
   <div class="card"><h2>${t("Review your answers")}</h2>${P.qs.map((x,i)=>{const ok=ptRight(x,P.ans[i]),q=x.q,your=P.ans[i];
     return `<details class="pt-rev"><summary><span class="pill ${ok?"go":"oops"}">${ok?"✓":"✗"}</span> ${t("Question")} ${i+1} · <span class="muted">${esc(LIBC[x.std].name)}</span></summary>
      <div class="notebook">${bodyHTML(q,null,"plain")}</div>
      ${q.type==="mc"?`<ul class="why-list">${q.choices.map((c,j)=>{const l=L[j];return `<li class="${l===q.ans?"ok":l===your?"no":""}"><b>${l}</b>. ${typeof c==="string"?fmt(c):""}${l===q.ans?` <b>✓ ${t("Right answer")}</b>`:l===your?` <b>✗ ${t("Your answer")}</b>: ${fmt(q.why[l]||"")}`:""}</li>`}).join("")}</ul>`:`<p>${t("Your answer")}: <b>${esc(your||"—")}</b> · ${t("Right answer")}: <b>${esc(q.ans)}</b></p>`}
      <h3>${t("Step by step")}</h3><ol class="bd">${q.steps.map(st=>`<li><p>${fmt(st.say)}</p></li>`).join("")}</ol></details>`}).join("")}</div>`;
  document.getElementById("pt-back").onclick=()=>{S.PT=null;S.screen="home";render()}}

/* ---------- teacher: where the class stands ---------- */
function hsClassCard(){if(!hsOn())return "";const real=realStudents();if(!real.length)return "";
  if(isWK()){const ls=real.map(s=>({s,w:wkLevel(s),pt:lastPT(s)})),cnt=[0,3,4,5,6,7].map(L=>ls.filter(x=>x.w.lvl===L).length);
    return `<div class="card"><div class="top"><h2>🏅 WorkKeys level estimates</h2><span class="muted" style="font-size:.85rem">from practice · not official scores</span></div>
     <div class="kpis small">${[0,3,4,5,6,7].map((L,i)=>`<div class="kpi ${L>=5?"go":L===4?"gold":L?"":"oops"}"><b>${cnt[i]}</b><span>${lvlTxt(L)}</span></div>`).join("")}</div>
     <div class="tablewrap"><table class="roster"><thead><tr><th>Student</th><th>Estimate</th>${WK_LVLS.map(L=>`<th>L${L}</th>`).join("")}<th>Last practice test</th></tr></thead><tbody>
      ${ls.sort((a,b)=>b.w.lvl-a.w.lvl).map(x=>`<tr><td>${esc(x.s.name)}</td><td><b>${lvlTxt(x.w.lvl)}</b></td>${WK_LVLS.map(L=>`<td>${x.w.per[L]==null?"—":x.w.per[L]+"%"}</td>`).join("")}<td>${x.pt?`${lvlTxt(x.pt.lvl)} · ${x.pt.right}/${x.pt.n} · ${dShort(x.pt.at)}`:'<span class="muted">none yet</span>'}</td></tr>`).join("")}</tbody></table></div>
     <p class="muted" style="font-size:.85rem">A level counts when a student has mastered at least 75% of its skills and every level below it. The National Career Readiness Certificate uses scores from three WorkKeys tests (Applied Math, Workplace Documents, and Graphic Literacy): Silver needs Level 4 or higher on each, and Gold needs Level 5 or higher on each.</p></div>`}
  const avg=d=>{const v=real.map(s=>catPct(s,d)).filter(x=>x!=null);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):null};
  return `<div class="card"><div class="top"><h2>🎯 ACT Math skills by category</h2><span class="muted" style="font-size:.85rem">class average mastery</span></div>${hsBars(ACT_CATS.map(d=>[DOMS[d],avg(d)]))}
   <div class="tablewrap"><table class="roster"><thead><tr><th>Student</th>${ACT_CATS.map(d=>`<th>${esc(DOMS[d].split(" ")[0])}</th>`).join("")}<th>Last practice test</th></tr></thead><tbody>
    ${real.map(s=>{const pt=lastPT(s);return `<tr><td>${esc(s.name)}</td>${ACT_CATS.map(d=>{const p=catPct(s,d);return `<td>${p==null?"—":p+"%"}</td>`}).join("")}<td>${pt?`${pt.right}/${pt.n} (${Math.round(pt.right/pt.n*100)}%) · ${dShort(pt.at)}`:'<span class="muted">none yet</span>'}</td></tr>`}).join("")}</tbody></table></div>
   <p class="muted" style="font-size:.85rem">Mastery comes from practice on each skill. Practice test results show percent correct only; they are not ACT scores.</p></div>`}

Object.assign(ES,{"Calculator":"Calculadora","Formula sheet":"Hoja de fórmulas","The ACT gives no formula sheet, so learn the key formulas.":"El ACT no da hoja de fórmulas; aprende las fórmulas clave.","Type a calculation":"Escribe un cálculo",
 "My WorkKeys level":"Mi nivel de WorkKeys","Estimate":"Estimado","A level counts when you have mastered most of its skills and every level below it.":"Un nivel cuenta cuando dominas la mayoría de sus destrezas y todos los niveles anteriores.","Last practice test":"Última prueba de práctica",
 "Take a practice test":"Hacer una prueba de práctica","My ACT Math skills":"Mis destrezas de matemáticas del ACT","practice test":"prueba de práctica","Full-length":"Completa","Half-length":"Media prueba","questions":"preguntas","minutes":"minutos",
 "Your score is a practice estimate, not an official score.":"Tu resultado es un estimado de práctica, no un puntaje oficial.","Time left":"Tiempo restante","Question":"Pregunta","of":"de","answered":"contestadas","flagged":"marcada","Jump to a question":"Ir a una pregunta",
 "Back":"Atrás","Unflag":"Quitar marca","Flag for review":"Marcar para revisar","Next":"Siguiente","Finish test":"Terminar la prueba","questions are still blank. Tap Finish test again to turn it in anyway.":"preguntas están en blanco. Toca Terminar la prueba otra vez para entregarla de todos modos.",
 "Practice test results":"Resultados de la prueba de práctica","Time ran out":"Se acabó el tiempo","correct":"correctas","estimated level":"nivel estimado","practice estimate, not an official score":"estimado de práctica, no un puntaje oficial","minutes used":"minutos usados",
 "Review your answers":"Revisa tus respuestas","Right answer":"Respuesta correcta","Your answer":"Tu respuesta","Step by step":"Paso a paso",
 "Workplace math problems from Level 3 to Level 7, with 5 answer choices. A calculator and the formula sheet are allowed.":"Problemas de matemáticas del trabajo del Nivel 3 al 7, con 5 opciones. Se permite calculadora y hoja de fórmulas.",
 "Questions from every ACT Math category, with 4 answer choices. A calculator is allowed. There is no formula sheet.":"Preguntas de todas las categorías de matemáticas del ACT, con 4 opciones. Se permite calculadora. No hay hoja de fórmulas.",
 "A level counts when you get at least 65% of its questions right, and every level below it too. Practice the lowest level that isn’t green next.":"Un nivel cuenta cuando aciertas al menos el 65% de sus preguntas y de todos los niveles anteriores. Practica primero el nivel más bajo que no esté en verde.",
 "Practice the categories that aren’t green yet. Your trail already has every ACT Math skill on it.":"Practica las categorías que aún no están en verde. Tu camino ya tiene todas las destrezas de matemáticas del ACT."});
/* ---------- "Plan it": step 1 for Algebra I and ACT Math ----------
   Before solving, students choose the best first move for the problem. The right plan is the one for the
   skill the question practices; the other choices are plans for different kinds of problems, so the step
   trains students to recognize what a problem is asking (a big part of ACT success). Plans are original. */
const PLAN_IT={
 /* ACT Math */
 "ACT.NQ.1":"Rewrite with exponent rules: match the bases, then add, subtract, or multiply the exponents.",
 "ACT.NQ.2":"Write the numbers in scientific notation, then work with the powers of 10.",
 "ACT.NQ.3":"Treat i like a variable, then replace i² with −1.",
 "ACT.NQ.4":"Line up the entries in matching positions and combine them one by one.",
 "ACT.ALG.1":"Undo the operations to get x alone, clearing any fractions first.",
 "ACT.ALG.2":"Name the unknown, then translate the words into math one phrase at a time.",
 "ACT.ALG.3":"Eliminate one variable, or substitute one equation into the other.",
 "ACT.ALG.4":"Solve it like an equation, flipping the sign for a negative; for absolute value, split into two cases.",
 "ACT.ALG.5":"Distribute and combine like terms, or factor out what the terms share.",
 "ACT.ALG.6":"Set the equation equal to zero, then factor or use the quadratic formula.",
 "ACT.ALG.7":"Clear the fractions or square both sides, solve, then check for answers that don’t work.",
 "ACT.ALG.8":"Treat the other letters like numbers and undo operations to get the target letter alone.",
 "ACT.FUN.1":"Substitute the input; for f(g(x)), work from the inside out.",
 "ACT.FUN.2":"Use two points to find the slope (rise over run), then find the y-intercept.",
 "ACT.FUN.3":"Read the graph: which x-values it covers, which y-values it reaches, and where it rises or falls.",
 "ACT.FUN.4":"Find the vertex with x = −b ÷ 2a, or factor to find the zeros.",
 "ACT.FUN.5":"Multiply the starting amount by the growth or decay factor raised to the number of periods.",
 "ACT.FUN.6":"Compare to the parent graph: changes inside move it left or right; changes outside move it up, down, or flip it.",
 "ACT.FUN.7":"Place the angle on the unit circle, then use its reference angle and the sign for that quadrant.",
 "ACT.FUN.8":"Find the common difference or ratio, then use it to jump to the term you need.",
 "ACT.GEO.1":"Mark the angles that are equal or that add to 180°, then write an equation.",
 "ACT.GEO.2":"Find the hypotenuse and use a² + b² = c², or spot a special right triangle.",
 "ACT.GEO.3":"Label opposite, adjacent, and hypotenuse from the angle, then pick sine, cosine, or tangent.",
 "ACT.GEO.4":"Break the figure into rectangles and triangles, find each area, then add or subtract.",
 "ACT.GEO.5":"Find the radius first, then use the circle formula or the fraction of the circle.",
 "ACT.GEO.6":"Pick the formula for that solid, find each measurement, then substitute.",
 "ACT.GEO.7":"Use the distance, midpoint, or slope formula with the two points.",
 "ACT.GEO.8":"Match the corresponding sides of the similar figures and set up a proportion.",
 "ACT.SP.1":"Put the data in order, then find the middle, the average, or the most common value.",
 "ACT.SP.2":"Count the favorable outcomes over the total outcomes; multiply for “and” events.",
 "ACT.SP.3":"Decide whether order matters, then multiply the choices or use permutations or combinations.",
 "ACT.SP.4":"Read the values you need from the display; for expected value, multiply each outcome by its probability and add.",
 "ACT.IES.1":"Change the percent to a decimal and multiply; for percent change, use (new − old) ÷ old.",
 "ACT.IES.2":"Set up a proportion with matching units in the same places, then cross-multiply.",
 "ACT.IES.3":"Multiply by conversion fractions so the units you don’t want cancel out.",
 "ACT.IES.4":"List what you know and what you need, then solve one step at a time.",
 /* Algebra I (procedural standards only; the others keep the key-word step) */
 "N-Q.1":"Write the units with every number and make sure they cancel to the unit the question asks for.",
 "A-SSE.1a":"Find the terms (split at + and −), then the coefficient and factors in each one.",
 "A-SSE.1b":"Treat a chunk like P(1 + r) as one quantity and ask what each part means.",
 "A-SSE.2":"Look for a pattern you know, like a difference of squares, and rewrite to match it.",
 "A-SSE.3a":"Factor the quadratic, then set each factor equal to zero.",
 "A-SSE.3b":"Complete the square to get a(x − h)² + k, then read the maximum or minimum.",
 "A-SSE.3c":"Use exponent rules to rewrite the base or the exponent into the form the question wants.",
 "A-APR.1":"Combine like terms; to multiply, distribute each term of one polynomial to each term of the other.",
 "A-APR.3":"Set each factor equal to zero to find the zeros, then use them to sketch the graph.",
 "A-CED.1":"Name the unknown, then turn the words into one equation or inequality.",
 "A-CED.2":"Name both variables, find the starting value and the rate, then write y = … .",
 "A-CED.3":"Write each limit as an equation or inequality, then check whether a solution fits all of them.",
 "A-CED.4":"Treat the other letters like numbers and undo operations to get the target letter alone.",
 "A-REI.1":"Compare one line to the next and name the property that allows the change.",
 "A-REI.3":"Undo operations to get the variable alone; flip the sign if you multiply or divide by a negative.",
 "A-REI.4a":"Move the constant over, add (b ÷ 2)² to both sides, then write the left side as a square.",
 "A-REI.4b":"Choose a method: square roots if there is no x term, factoring if it factors, otherwise the quadratic formula.",
 "A-REI.6":"Eliminate one variable, or substitute one equation into the other.",
 "A-REI.10":"Substitute the point into the equation; if the statement is true, the point is on the graph.",
 "A-REI.11":"Set f(x) equal to g(x), or find where the two graphs cross, and read the x-value.",
 "A-REI.12":"Graph the boundary line, then shade the side whose points make the inequality true.",
 "F-IF.1":"Check that each input has exactly one output.",
 "F-IF.2":"Replace x with the given input and evaluate.",
 "F-IF.3":"Find the rule that gets you from one term to the next, then use the term number as the input.",
 "F-IF.4":"Read the graph: where it crosses the axes, where it rises or falls, and its highest or lowest point.",
 "F-IF.5":"Ask which input values make sense in the real situation.",
 "F-IF.6":"Divide the change in output by the change in input over the interval.",
 "F-IF.7a":"Find the intercepts and the vertex (or the slope), plot them, then connect.",
 "F-IF.7b":"Find the key point (the start, the corner, or the step), then plot a few points on each side.",
 "F-IF.8a":"Rewrite the quadratic in factored or vertex form to show its zeros or its vertex.",
 "F-IF.9":"Find the same feature (slope, intercept, or maximum) for both functions, then compare.",
 "F-BF.1a":"Find the starting value and how it changes each step, then write the function.",
 "F-BF.3":"Compare to the parent function: changes inside move it left or right; changes outside move it up, down, or stretch it.",
 "F-LE.1a":"Check the pattern: equal differences mean linear; equal ratios mean exponential.",
 "F-LE.1b":"Look for the same amount added or subtracted each step.",
 "F-LE.1c":"Look for the same percent or factor each step.",
 "F-LE.2":"Use two points: find the rate (a difference or a ratio), then the starting value.",
 "F-LE.5":"Match each number in the function to its meaning: the starting value, the rate, or the growth factor.",
 "S-ID.1":"Order the data, find the five-number summary or the bins, then draw the display.",
 "S-ID.2":"Find the center and the spread of each group, then compare them.",
 "S-ID.3":"Look for values far from the rest and think about how they pull the mean.",
 "S-ID.5":"Find the right row and column, then divide by the correct total.",
 "S-ID.6a":"Use the function that fits the data: substitute the value and read the prediction.",
 "S-ID.6b":"Find each residual (actual minus predicted) and look for a pattern.",
 "S-ID.6c":"Draw or use the line of best fit, then substitute the value to predict.",
 "S-ID.7":"Say what one more unit of x does to y (the slope) and what y is when x is 0 (the intercept).",
 "S-ID.8":"Check the sign and size of r: close to 1 or −1 is strong, close to 0 is weak.",
 "S-ID.9":"Ask whether the data show one thing causing another, or just two things moving together."};
/* plans too close to each other to be fair wrong choices */
const PLAN_NEAR=[["ACT.ALG.1","ACT.ALG.8","ACT.ALG.2","ACT.ALG.4"],["ACT.ALG.5","ACT.ALG.6","ACT.FUN.4"],["ACT.FUN.2","ACT.GEO.7"],["ACT.GEO.2","ACT.GEO.3","ACT.GEO.8","ACT.FUN.7"],
 ["ACT.IES.2","ACT.GEO.8","ACT.IES.3","ACT.IES.4"],["ACT.SP.2","ACT.SP.3","ACT.SP.4"],["ACT.SP.1","ACT.SP.4"],["ACT.NQ.1","ACT.ALG.7","ACT.NQ.2"],["ACT.FUN.5","ACT.IES.1"],["ACT.FUN.3","ACT.FUN.6"],["ACT.ALG.3","ACT.ALG.1"],
 ["A-SSE.3a","A-SSE.3b","A-APR.3","A-REI.4a","A-REI.4b","F-IF.8a","F-IF.7a","A-SSE.2","A-APR.1"],["A-CED.1","A-CED.4","A-REI.3","A-REI.1","A-CED.3"],
 ["F-LE.1a","F-LE.1b","F-LE.1c","F-LE.2","F-BF.1a","A-CED.2","F-IF.3","F-LE.5","S-ID.7","A-SSE.1b","A-SSE.3c"],["S-ID.6a","S-ID.6c","S-ID.7","S-ID.8","S-ID.6b"],
 ["F-IF.4","F-IF.7a","F-IF.7b","A-REI.10","A-REI.11","A-REI.12","F-IF.5","F-IF.1","F-BF.3","F-IF.9"],["A-REI.6","A-REI.11"],["F-IF.2","F-IF.6","F-IF.9"],["S-ID.1","S-ID.2","S-ID.3"]];
const planNear=(a,b)=>a===b||PLAN_NEAR.some(g=>g.includes(a)&&g.includes(b));
function planSkill(){const k=SKILLS.find(x=>x.id===S.k);return k&&k.std}
function planOn(q){const g=+gradeOf(),c=planSkill();return (g===9||g===10)&&!!c&&!!PLAN_IT[c]&&!!q}
function planItOpts(){const c=planSkill(),sh=(S.qid||"").split("").reduce((h,ch)=>(h*31+ch.charCodeAt(0))>>>0,7);let r=sh||1;const rnd=()=>{r=(r*1103515245+12345)>>>0;return r/4294967296};
  const pool=Object.keys(PLAN_IT).filter(x=>(c.startsWith("ACT.")===x.startsWith("ACT."))&&!planNear(x,c)&&PLAN_IT[x]!==PLAN_IT[c]);
  const wrong=[];while(wrong.length<3&&pool.length){const i=Math.floor(rnd()*pool.length),x=pool.splice(i,1)[0];if(!wrong.some(w=>planNear(w,x)))wrong.push(x)}
  const all=[c,...wrong];for(let i=all.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[all[i],all[j]]=[all[j],all[i]]}return all}
function planCard(q){const P=S.pit||{},c=planSkill(),opts=planItOpts(),res=P.res;
  const list=opts.map((x,i)=>{const sel=P.pick===x;let cl="choice plan"+(sel?" sel":"");if(res){if(x===c)cl+=" right";else if(sel)cl+=" wrong"}
    return `<button class="${cl}" data-plan="${x}" ${res?"disabled":""} aria-pressed="${sel}"><b class="l">${L[i]}</b><div><span>${esc(PLAN_IT[x])}</span>${res&&x===c?`<span class="tag ok">${t("Best plan")}</span>`:""}</div></button>`}).join("");
  const k=LIBC[c]||{};
  return `<div class="card pop"><p class="note">${t("Step 1: Plan it. What is the best first move for this problem?")}</p><div class="choices one">${list}</div>
   ${res?`<div class="fb ${P.ok?"go":"oops"}" role="status"><p><b>${P.ok?t("Good plan!"):t("Not the best plan.")}</b> ${P.ok?"":(S.lang==="es"?`Ese plan sirve para otro tipo de problema (${esc((LIBC[P.pick]||{}).name||"")}). Este problema es de: ${esc(k.name||"")}.`:`That plan fits a different kind of problem (${esc((LIBC[P.pick]||{}).name||"")}). This one is about ${esc((k.name||"").toLowerCase())}.`)}</p></div>
     <div class="row"><button id="plan-next">${t("Now solve it")}</button></div>`
   :`<div class="row"><button id="plan-check" ${P.pick?"":"disabled"}>${t("Check my plan")}</button>${kwMode()==="optional"?`<button class="ghost small" id="plan-skip">${t("Skip to solving")}</button>`:""}</div>`}</div>`}
function wirePlan(q){const c=planSkill(),keep=f=>{const wy=window.scrollY;f();render();window.scrollTo(0,wy)};
  app.querySelectorAll("[data-plan]").forEach(b=>b.onclick=()=>keep(()=>{S.pit={...(S.pit||{}),pick:b.dataset.plan}}));
  const ch=document.getElementById("plan-check");if(ch)ch.onclick=()=>keep(()=>{S.pit.res=true;S.pit.ok=S.pit.pick===c;const pr=S.student.prog;pr.plan=pr.plan||{n:0,ok:0};pr.plan.n++;if(S.pit.ok)pr.plan.ok++});
  const sk=document.getElementById("plan-skip");if(sk)sk.onclick=()=>{S.step=2;S.kwSkip=true;S.shownAt=Date.now();render()};
  const nx=document.getElementById("plan-next");if(nx)nx.onclick=()=>{S.step=2;S.kwSkip=true;S.shownAt=Date.now();render()}}
/* in step 2, the chosen plan stays on screen as a reminder */
function planNote(){if(S.step!==2||!S.pit||!S.pit.res||S.result)return"";const c=planSkill();return c&&PLAN_IT[c]?`<p class="plan-rem"><b>${t("Your plan:")}</b> ${esc(PLAN_IT[c])}</p>`:""}
Object.assign(ES,{"Step 1: Plan it. What is the best first move for this problem?":"Paso 1: Planea. ¿Cuál es el mejor primer paso para este problema?","Best plan":"Mejor plan","Good plan!":"¡Buen plan!","Not the best plan.":"No es el mejor plan.",
 "Now solve it":"Ahora resuélvelo","Check my plan":"Revisar mi plan","Skip to solving":"Saltar a resolver","Your plan:":"Tu plan:"});
/* ================= Badges =================
   Earned automatically: trail badges (first steps, persistence, checkpoints, summit), streaks (right in a row,
   days in a row), comeback, stars, step-1 skills (key words, Find the proof, Rule it out, Plan it), and a mastery
   badge for every domain on the student's trail. Teachers can also give badges with a short note.
   Teacher badges are stored apart from the student's own progress (prog._tb) so nothing a student saves can erase them. */
const BADGE_MORE=[
 {id:"run5",name:"Hot Streak",how:"Get 5 right in a row",m:"5",grp:"streak",need:p=>[p.bestRun||0,5]},
 {id:"run10",name:"On Fire",how:"Get 10 right in a row",m:"10",grp:"streak",need:p=>[p.bestRun||0,10]},
 {id:"run25",name:"Unstoppable",how:"Get 25 right in a row",m:"25",grp:"streak",need:p=>[p.bestRun||0,25]},
 {id:"day3",name:"Three-Day Climber",how:"Practice 3 days in a row",m:"3d",grp:"streak",need:p=>[dayRun(p),3]},
 {id:"day7",name:"Weeklong Climber",how:"Practice 7 days in a row",m:"7d",grp:"streak",need:p=>[dayRun(p),7]},
 {id:"comeback",name:"Comeback Kid",how:"Master a standard you missed 3 or more times",m:"↺",grp:"trail"},
 {id:"stars50",name:"Star Collector",how:"Earn 50 stars",m:"50",grp:"trail",need:p=>[p.stars||0,50]},
 {id:"stars200",name:"Constellation",how:"Earn 200 stars",m:"200",grp:"trail",need:p=>[p.stars||0,200]},
 {id:"kw10",name:"Key Word Hunter",how:"Find every key word in 10 questions",m:"🔑",grp:"skill",step:"kw",need:p=>[p.kwAll||0,10]},
 {id:"pf10",name:"Proof Finder",how:"Find the proof 10 times",m:"🔍",grp:"skill",step:"pf",need:p=>[(p.pf||{}).ok||0,10]},
 {id:"pf40",name:"Proof Detective",how:"Find the proof 40 times",m:"🕵",grp:"skill",step:"pf",need:p=>[(p.pf||{}).ok||0,40]},
 {id:"ro10",name:"Sharp Eliminator",how:"Rule out two wrong answers 10 times",m:"✂",grp:"skill",step:"ro",need:p=>[(p.ro||{}).ok||0,10]},
 {id:"plan10",name:"Master Planner",how:"Pick the best plan 10 times",m:"🧭",grp:"skill",step:"plan",need:p=>[(p.plan||{}).ok||0,10]}];
BADGES.forEach(b=>b.grp=b.grp||"trail");BADGES.push(...BADGE_MORE);
const TBADGES=[["work","Hard Worker","💪"],["kind","Kind Classmate","🤝"],["question","Great Question","❓"],["leader","Class Leader","🧭"],["grit","Never Gave Up","🔥"],["improve","Most Improved","📈"],["careful","Careful Thinker","🔍"],["star","Class Star","🌟"]];
const domShort=d=>{const s=String(d).replace(/^ELA-|^ACT-|^WK-|^S\d-|^BIO-/,"");return s.length<=3?s:s.slice(0,3)};
const domName=d=>(typeof DOMS!=="undefined"&&DOMS[d])||d;
/* look up any badge id: built-in, a domain badge ("dom:<domain>"), or a teacher badge ("t:<id>") */
function badgeInfo(id){const b=BADGES.find(x=>x.id===id);if(b)return b;
  if(String(id).startsWith("dom:")){const d=id.slice(4);return {id,name:`${domName(d)} Master`,how:`Master every ${domName(d)} standard on your trail`,m:domShort(d),grp:"dom"}}
  if(String(id).startsWith("t:")){const t=TBADGES.find(x=>x[0]===id.slice(2))||[id,"Teacher badge","★"];return {id,name:t[1],how:"Given by your teacher",m:t[2],grp:"teacher"}}
  return {id,name:"Badge",how:"",m:"★",grp:"trail"}}
/* which step-1 badges fit this course */
function stepBadgeOn(step){const g=+gradeOf();if(step==="pf")return isELA(g);if(step==="ro")return g===17||g===18||g===19;if(step==="plan")return g===9||g===10;if(step==="kw")return !(g===17||g===18||g===19||g===10);return true}
/* practice days come from the daily log the app already keeps (p.days, keyed by dayKey) */
function dayRun(p){const days=new Set(Object.keys(p.days||{}));if(!days.size)return 0;let n=0;const d=new Date();if(!days.has(dayKey(d.getTime())))d.setDate(d.getDate()-1);
  for(let i=0;i<400;i++){if(!days.has(dayKey(d.getTime())))break;n++;d.setDate(d.getDate()-1)}return n}
/* called by grade() after every answer */
function badgeTrack(p,k,sk,ok,mastered){
  p.run=ok?(p.run||0)+1:0;p.bestRun=Math.max(p.bestRun||0,p.run);
  if(!ok)sk.misses=(sk.misses||0)+1;
  BADGE_MORE.forEach(b=>{if(b.need&&(!b.step||stepBadgeOn(b.step))){const [have,goal]=b.need(p);if(have>=goal)award(p,b.id)}});
  if(mastered){if((sk.misses||0)>=3)award(p,"comeback");
    const dom=(LIBC[k.std]||{}).dom;if(dom){const TR=trailFor(S.student).filter(x=>(LIBC[x.std]||{}).dom===dom);
      if(TR.length>=2&&TR.every(x=>{const st=S.student.prog.skills[x.id];return st&&(st.status==="done"||st.status==="skip")}))award(p,"dom:"+dom)}}}
/* teacher badges for the signed-in student */
const myTBadges=()=>((S.student&&S.student.raw&&S.student.raw.prog&&S.student.raw.prog._tb)||[]).filter(x=>x&&x.id);
function newTBadges(){const p=S.student&&S.student.prog;if(!p)return [];const seen=new Set(p.tbSeen||[]);return myTBadges().filter(x=>!seen.has(x.at))}
function seeTBadges(){const p=S.student.prog;p.tbSeen=[...new Set([...(p.tbSeen||[]),...myTBadges().map(x=>x.at)])].slice(-80);save()}
function tbadgeNotice(){const nb=newTBadges();if(!nb.length)return "";
  return `<div class="card pop tb-new" role="status"><h2>${t("Your teacher gave you a badge!")}</h2>${nb.map(x=>{const b=badgeInfo("t:"+x.id);return `<div class="newbadge"><span class="medal" aria-hidden="true">${b.m}</span><div><b>${esc(b.name)}</b>${x.note?`<span class="tb-note">“${esc(x.note)}”</span>`:""}${x.by?`<span class="tb-by">${esc(x.by)}</span>`:""}</div></div>`}).join("")}
   <div class="row"><button id="tb-ok">${t("Thanks!")}</button></div></div>`}
/* the "My badges" card */
badgesHTML=function(p){const got=p.badges||{},one=b=>{const g=!!got[b.id],n=b.need&&!g?b.need(p):null;
    return `<div class="badge${g?' got':''}"><span class="medal" aria-hidden="true">${b.m}</span><div><b>${esc(b.name)}</b><span>${g?t("Earned!"):esc(b.how)}${n?` <span class="bprog">${Math.min(n[0],n[1])} / ${n[1]}</span>`:""}</span></div></div>`};
  const sec=(title,list)=>list.length?`<h3 class="bgrp">${t(title)}</h3><div class="badges">${list.join("")}</div>`:"";
  const trail=BADGES.filter(b=>b.grp==="trail").map(one),streak=BADGES.filter(b=>b.grp==="streak").map(one),skill=BADGES.filter(b=>b.grp==="skill"&&stepBadgeOn(b.step)).map(one);
  let dom=[];if(S.student){const TR=trailFor(S.student),ds=[...new Set(TR.map(k=>(LIBC[k.std]||{}).dom).filter(Boolean))].filter(d=>TR.filter(k=>(LIBC[k.std]||{}).dom===d).length>=2);dom=ds.map(d=>one(badgeInfo("dom:"+d)))}
  const tb=S.student===undefined?[]:myTBadges().slice().reverse().map(x=>{const b=badgeInfo("t:"+x.id);return `<div class="badge got teacher"><span class="medal" aria-hidden="true">${b.m}</span><div><b>${esc(b.name)}</b><span>${x.note?"“"+esc(x.note)+"”":t("From your teacher")}</span></div></div>`});
  const total=Object.keys(got).length+tb.length;
  return `<p class="muted">${S.lang==="es"?`Has ganado ${total} insignias.`:`You have earned ${total} badge${total===1?"":"s"}.`}</p>${sec("From my teacher",tb)}${sec("Trail",trail)}${sec("Streaks",streak)}${sec("Skills",skill)}${sec("Mastery",dom)}`};
/* ---------- teacher: Badges tab ---------- */
function tBadges(){const list=CUR.students.filter(s=>!isSample(s)).length?CUR.students:CUR.students;S.bg=S.bg||{pick:"work",sel:new Set(),note:""};
  const rows=list.map(s=>{const p=s.prog,tb=(s.raw&&s.raw.prog&&s.raw.prog._tb)||[],auto=Object.keys(p.badges||{}).length;
    return `<tr><td><label class="chk"><input type="checkbox" data-bgs="${s.id}" ${S.bg.sel.has(s.id)?"checked":""}> <b>${esc(s.name)}</b></label></td><td>${auto}</td><td>${p.bestRun||0}</td><td>${tb.length?tb.slice(-4).map(x=>{const b=badgeInfo("t:"+x.id);return `<span class="pill gold" title="${esc(x.note||"")}">${b.m} ${esc(b.name)} <button class="link small" data-bgx="${s.id}|${x.at}" aria-label="Remove ${esc(b.name)} from ${esc(s.name)}">✕</button></span>`}).join(" "):'<span class="muted">none yet</span>'}</td></tr>`}).join("");
  return `<div class="card" id="bg-card"><h2>Give a badge</h2><p class="muted">Recognize effort, kindness, and growth that the app can’t see. Students see the badge and your note the next time they sign in.</p>
   <div class="badges tb-pick" role="radiogroup" aria-label="Badge to give">${TBADGES.map(([id,n,m])=>`<button type="button" class="badge tbp${S.bg.pick===id?" got":""}" role="radio" aria-checked="${S.bg.pick===id}" data-bgp="${id}"><span class="medal" aria-hidden="true">${m}</span><div><b>${n}</b></div></button>`).join("")}</div>
   <label class="f">Note to the student (optional)<input id="bg-note" maxlength="80" value="${esc(S.bg.note)}" placeholder="You kept going on fractions all week!"></label>
   <div class="row"><button id="bg-give" ${S.bg.sel.size?"":"disabled"}>Give to ${S.bg.sel.size} student${S.bg.sel.size===1?"":"s"}</button><button class="ghost small" id="bg-all">${S.bg.sel.size===list.length?"Clear all":"Select all"}</button></div><p class="err" id="bg-err" role="alert"></p></div>
  <div class="card"><h2>Badges earned</h2><p class="muted">Badges students earned on their own (trail, streaks, skills, and mastery), their best streak of right answers, and badges you gave.</p>
   <div class="tablewrap"><table class="roster"><thead><tr><th>Student</th><th>Earned badges</th><th>Best streak</th><th>From you</th></tr></thead><tbody>${rows||`<tr><td colspan="4" class="muted">No students yet.</td></tr>`}</tbody></table></div></div>`}
function wireBadges(){const B=S.bg;
  app.querySelectorAll("[data-bgp]").forEach(b=>b.onclick=()=>{B.pick=b.dataset.bgp;B.note=document.getElementById("bg-note").value;render()});
  app.querySelectorAll("[data-bgs]").forEach(c=>c.onchange=()=>{c.checked?B.sel.add(c.dataset.bgs):B.sel.delete(c.dataset.bgs);B.note=document.getElementById("bg-note").value;render()});
  const all=document.getElementById("bg-all");if(all)all.onclick=()=>{const ids=CUR.students.map(s=>s.id);B.sel=B.sel.size===ids.length?new Set():new Set(ids);B.note=document.getElementById("bg-note").value;render()};
  const g=document.getElementById("bg-give");if(g)g.onclick=async()=>{busy(g,"Giving…");B.note=document.getElementById("bg-note").value.trim();
    try{await api("badgeGive",{classId:CUR.cls.id,studentIds:[...B.sel],badge:B.pick,note:B.note});const n=B.sel.size;B.sel=new Set();B.note="";await openClass(CUR.cls.id,"badges");S.bgMsg=`Badge given to ${n} student${n===1?"":"s"}.`;render()}
    catch(e){document.getElementById("bg-err").textContent=e.message;g.disabled=false;g.textContent="Try again"}};
  app.querySelectorAll("[data-bgx]").forEach(b=>b.onclick=async()=>{const [sid,at]=b.dataset.bgx.split("|");try{await api("badgeTake",{classId:CUR.cls.id,studentId:sid,at:+at});await openClass(CUR.cls.id,"badges")}catch(e){S.err=e.message;render()}});
  if(S.bgMsg){const c=document.getElementById("bg-card");if(c)c.querySelector("h2").insertAdjacentHTML("afterend",`<div class="fb go" role="status"><p>${esc(S.bgMsg)}</p></div>`);S.bgMsg=""}}
Object.assign(ES,{"Your teacher gave you a badge!":"¡Tu maestro te dio una insignia!","Thanks!":"¡Gracias!","Earned!":"¡Ganada!","From my teacher":"De mi maestro","From your teacher":"De tu maestro","Trail":"Camino","Streaks":"Rachas","Skills":"Habilidades","Mastery":"Dominio"});
document.addEventListener("click",e=>{if(e.target.id==="tb-ok"){seeTBadges();render()}});
/* ================= Look back: review questions already answered this session (read-only) ================= */
function lbPush(q,ok,k){const h=S.lbHist||(S.lbHist=[]);if(h.length&&h[h.length-1].q===q)return;
  h.push({q,sel:[...(S.sel||[])],ok,name:k?k.name:"",std:k?k.std:"",at:Date.now()});if(h.length>30)h.shift()}
const lbTxt=q=>plainQ((q.parts||[]).map(x=>typeof x==="string"?x:x&&x.eq!=null?x.eq:"").filter(Boolean).join(" "));
const lbN=()=>(S.lbHist||[]).length;
function lbBtn(){return lbN()?`<button class="ghost" id="lb-btn" aria-haspopup="dialog">↺ ${S.lang==="es"?"Repasar":"Look back"} (${lbN()})</button>`:""}
function lbAns(q,sel){if(q.type==="mc"||q.type==="multi")return sel.map(l=>`<b>${l}.</b> ${choiceInner(q.choices[L.indexOf(l)])}`).join("<br>")||"—";
  if(q.type==="input")return esc(sel[0]||"—");return q.rows.map((r,i)=>`${esc(String(r.n))} → ${esc(String(sel[i]||"—"))}`).join("<br>")}
function lbHTML(){if(S.lb==null)return "";const es=S.lang==="es",T=(a,b)=>es?b:a,h=S.lbHist||[];
  if(S.lb==="list")return `<div class="lb-back" id="lb-back"></div><div class="lb-pop card pop" role="dialog" aria-modal="true" aria-label="${T("Look back","Repasar")}">
    <div class="top"><h3>↺ ${T("Look back at this session","Repasa esta sesión")}</h3><button class="ghost small" id="lb-x">${T("Close","Cerrar")}</button></div>
    <p class="muted">${T("Tap a question to see it again with the right answer and the steps. You can look, but answers can’t be changed.","Toca una pregunta para verla otra vez con la respuesta correcta y los pasos. Puedes mirar, pero no cambiar las respuestas.")}</p>
    <ol class="lb-list">${h.map((x,i)=>({x,i})).reverse().map(({x,i})=>`<li><button class="lb-item" data-lb="${i}"><span class="lb-mk ${x.ok?"ok":"no"}" aria-label="${x.ok?T("right","correcta"):T("missed","fallada")}">${x.ok?"✓":"✗"}</span><span class="lb-t"><b>${esc(lbTxt(x.q).slice(0,110))}${lbTxt(x.q).length>110?"…":""}</b><span class="muted">${esc(x.std)} · ${esc(x.name)}</span></span></button></li>`).join("")}</ol></div>`;
  const x=h[S.lb];if(!x){S.lb="list";return lbHTML()}const q=x.q,keep=S.sel;S.sel=x.sel;const why=x.ok?"":whyText(q);S.sel=keep;
  return `<div class="lb-back" id="lb-back"></div><div class="lb-pop card pop" role="dialog" aria-modal="true" aria-label="${T("Question review","Repaso de la pregunta")}">
    <div class="top"><button class="ghost small" id="lb-list">← ${T("All questions","Todas")}</button><button class="ghost small" id="lb-x">${T("Close","Cerrar")}</button></div>
    <span class="label">${esc(x.std)} · ${esc(x.name)}</span>
    <div class="notebook ro lb-q">${bodyHTML(q,new Set(),"plain")}</div>
    <div class="fb ${x.ok?"go":"oops"}"><p><b>${x.ok?T("You got this one right.","Esta la tuviste bien."):T("You missed this one.","Esta la fallaste.")}</b></p>
      <p><span class="label">${T("Your answer","Tu respuesta")}</span><br>${lbAns(q,x.sel)}</p>
      ${x.ok?"":`<p><span class="label">${T("Right answer","Respuesta correcta")}</span><br>${esc(ansText(q))}</p><p>${why}</p>`}</div>
    ${(q.steps||[]).length?`<h3>${T("The steps","Los pasos")}</h3><ol class="lb-steps">${q.steps.map(s=>`<li>${fmt(s.say)}</li>`).join("")}</ol>`:""}
    <div class="row"><button class="ghost small" id="lb-prev" ${S.lb<=0?"disabled":""}>${T("Older","Anterior")}</button><button class="ghost small" id="lb-next" ${S.lb>=h.length-1?"disabled":""}>${T("Newer","Siguiente")}</button></div></div>`}
function wireLook(){const b=document.getElementById("lb-btn");if(b)b.onclick=()=>{stopPlay();S.lb="list";render();document.getElementById("lb-x")?.focus()};
  if(S.lb==null)return;const close=()=>{S.lb=null;render();document.getElementById("lb-btn")?.focus()};
  document.getElementById("lb-x").onclick=close;document.getElementById("lb-back").onclick=close;
  document.onkeydown=e=>{if(e.key==="Escape"&&S.lb!=null&&S.screen==="practice")close()};
  app.querySelectorAll("[data-lb]").forEach(x=>x.onclick=()=>{S.lb=+x.dataset.lb;render();app.querySelector(".lb-pop")?.scrollTo(0,0);document.getElementById("lb-x")?.focus()});
  const go=d=>{S.lb+=d;render();document.getElementById("lb-x")?.focus()};
  const l=document.getElementById("lb-list");if(l)l.onclick=()=>{S.lb="list";render()};
  const p=document.getElementById("lb-prev");if(p)p.onclick=()=>go(-1);const n=document.getElementById("lb-next");if(n)n.onclick=()=>go(1)}

/* ================= Passage sets: one passage, several questions, like the state reading test =================
   The student reads one passage, answers 5–6 questions on it in any order (they can go back and change answers
   until they finish), then sees a review. Each answer also counts toward that standard's daily practice record. */
const PSET_N=6;
function psetCodeMap(){const m={};Object.entries(ELA_CODE||{}).forEach(([gen,code])=>m[code]=gen);return m}
function psetChoices(G){const done=new Set(((S.student.prog.psets)||[]).slice(-12).map(x=>x.title));
  const list=ELA_PASS.filter(p=>p.g===G);const fresh=list.filter(p=>!done.has(p.title));return fresh.length?fresh:list}
function psetBuild(P,G,seed){const map=psetCodeMap(),r=(()=>{let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})();
  const items=P.qs.map(q=>{const [a,n]=q.s.split("."),code=`${a}.${G}.${n}`,gen=map[code];if(!gen)return null;
    const pr=q.orig?(typeof ELA_PROOF!=="undefined"&&ELA_PROOF[P.title+"|"+q.s]):q.pr;return {q,code,gen,pr:pr||null}}).filter(Boolean);
  const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  /* at most two questions per standard, so one set touches several skills */
  const per={},pick=[];shuf(items).forEach(x=>{per[x.code]=(per[x.code]||0)+1;if(per[x.code]<=2&&pick.length<PSET_N)pick.push(x)});
  /* like the real test: questions about one part of the text come first, in passage order; whole-passage questions last */
  pick.sort((a,b)=>(a.pr?Math.min(...a.pr):99)-(b.pr?Math.min(...b.pr):99));
  return pick.map(x=>{const it=GENSCI.fromItem({stem:x.q.stem,right:x.q.right,w:x.q.w,steps:x.q.steps,x:{}},r);
    return {code:x.code,gen:x.gen,pr:x.pr,stem:x.q.stem,choices:it.choices,ans:it.ans,why:it.why,steps:it.steps}})}
function psetStart(){const G=gradeOf()-20,ch=psetChoices(G);if(!ch.length)return;const seed=Date.now()%2147483647,P=ch[seed%ch.length];
  S.ps={title:P.title,by:P.by,paras:P.p,poem:P.t==="poem",qs:psetBuild(P,G,seed),i:0,sel:{},t0:Date.now(),done:false};
  S.screen="pset";stopPlay&&stopPlay();render();window.scrollTo(0,0)}
function psetCard(s){if(!isELA(gradeOf()))return "";const G=gradeOf()-20;if(!ELA_PASS.some(p=>p.g===G))return "";
  const L=s.prog.psets||[],last=L[L.length-1],es=S.lang==="es";
  return `<div class="card pset-card"><div class="top"><h2>📖 ${es?"Práctica de examen: un texto, varias preguntas":"Test practice: passage sets"}</h2>${L.length?`<span class="pill gold">${L.length} ${es?"hechos":"done"}</span>`:""}</div>
   <p>${es?"Lee un texto y contesta seis preguntas sobre él, como en el examen estatal. Puedes volver y cambiar respuestas antes de terminar.":"Read one passage and answer six questions about it, just like the state test. You can go back and change answers before you finish."}</p>
   ${last?`<p class="muted">${es?"Último":"Last one"}: <b>${esc(last.title)}</b> · ${last.ok} ${es?"de":"of"} ${last.n}</p>`:""}
   <div class="row"><button id="ps-go">${L.length?(es?"Hacer otro":"Try another passage"):(es?"Empezar":"Start a passage set")}</button></div></div>`}
function wirePsetCard(){const b=document.getElementById("ps-go");if(b)b.onclick=psetStart}

function pset(){const X=S.ps,es=S.lang==="es",T=(a,b)=>es?b:a;if(!X){S.screen="home";render();return}
  const P={title:X.title,by:X.by,paras:X.paras,poem:X.poem};
  if(X.done)return psetResults();
  const q=X.qs[X.i],n=X.qs.length,answered=Object.keys(X.sel).length;
  app.innerHTML=header(`${langToggle()}<button class="ghost" id="ps-back">${T("Leave","Salir")}</button>`)+`
  <div class="ps-wrap">
   <div class="ps-pass">${vizHTML({passage:P})}</div>
   <div class="ps-q card">
    <div class="row" style="justify-content:space-between"><span class="label">${T("Question","Pregunta")} ${X.i+1} ${T("of","de")} ${n}</span>${sayBtn("ps-say",t("🔊 Read to me"))}</div>
    <nav class="ps-nav" aria-label="${T("Questions","Preguntas")}">${X.qs.map((_,j)=>`<button class="ps-dot${j===X.i?" now":""}${X.sel[j]?" done":""}" data-j="${j}" aria-current="${j===X.i}" aria-label="${T("Question","Pregunta")} ${j+1}${X.sel[j]?T(", answered",", contestada"):""}">${j+1}</button>`).join("")}</nav>
    <p class="qtext">${esc(q.stem).replace(/\n/g,"<br>")}</p>
    <div class="choices one">${q.choices.map((c,j)=>{const l=L[j],on=X.sel[X.i]===l;return `<button class="choice${on?" sel":""}" data-l="${l}" aria-pressed="${on}"><b class="l">${l}</b><div>${choiceInner(c)}</div></button>`}).join("")}</div>
    <div class="row ps-move"><button class="ghost" id="ps-prev" ${X.i===0?"disabled":""}>← ${T("Back","Atrás")}</button>
     ${X.i<n-1?`<button id="ps-next">${T("Next","Siguiente")} →</button>`:""}
     <button id="ps-finish" class="${X.i<n-1?"ghost":""}" ${answered<n?"disabled":""}>${T("Finish and see my score","Terminar y ver mi puntaje")}</button></div>
    ${answered<n?`<p class="muted small">${answered} ${T("of","de")} ${n} ${T("answered. Answer them all to finish.","contestadas. Contéstalas todas para terminar.")}</p>`:""}
   </div></div>`;
  wireLang();
  document.getElementById("ps-back").onclick=()=>{if(!Object.keys(X.sel).length||confirm(T("Leave this passage set? Your answers will not be saved.","¿Salir? Tus respuestas no se guardarán."))){S.ps=null;S.screen="home";render()}};
  const go=j=>{X.i=j;render();document.querySelector(".ps-q")?.scrollIntoView({block:"nearest"})};
  app.querySelectorAll(".ps-dot").forEach(b=>b.onclick=()=>go(+b.dataset.j));
  app.querySelectorAll(".ps-q .choice").forEach(b=>b.onclick=()=>{X.sel[X.i]=b.dataset.l;render()});
  const pv=document.getElementById("ps-prev");if(pv)pv.onclick=()=>go(X.i-1);
  const nx=document.getElementById("ps-next");if(nx)nx.onclick=()=>go(X.i+1);
  document.getElementById("ps-finish").onclick=psetFinish;
  const sy=document.getElementById("ps-say");if(sy)sy.onclick=()=>{stopPlay();speak(q.stem+". "+q.choices.map((c,j)=>L[j]+". "+(typeof c==="string"?c:"")).join(". "))};
}
function psetFinish(){const X=S.ps,p=S.student.prog,n=X.qs.length,ms=(Date.now()-X.t0)/n;let ok=0;
  X.qs.forEach((q,j)=>{const r=X.sel[j]===q.ans;if(r)ok++;track(p,q.gen,r,ms)});
  p.stars=(p.stars||0)+ok;(p.psets=p.psets||[]).push({t:Date.now(),title:X.title,n,ok,c:X.qs.map((q,j)=>[q.code,X.sel[j]===q.ans?1:0])});
  if(p.psets.length>40)p.psets.splice(0,p.psets.length-40);p.last=Date.now();
  X.done=true;X.ok=ok;save();render();window.scrollTo(0,0)}
function psetResults(){const X=S.ps,es=S.lang==="es",T=(a,b)=>es?b:a,n=X.qs.length,pct=Math.round(100*X.ok/n);
  const unit=X.poem?T("stanza","estrofa"):T("paragraph","párrafo");
  app.innerHTML=header(`${langToggle()}`)+`
  <div class="card pop ps-score"><h2>${esc(X.title)}</h2>
   <p class="ps-big"><b>${X.ok}</b> ${T("of","de")} ${n} ${T("correct","correctas")}</p>
   <p>${pct>=80?T("Strong reading! You’re ready for passages like this on the test.","¡Muy buena lectura!"):pct>=50?T("Good effort. Look at the ones you missed to see where the answer was hiding.","Buen esfuerzo. Mira las que fallaste."):T("This was a tough one. Read the review below, then try another passage.","Este fue difícil. Lee el repaso y prueba otro texto.")} +${X.ok} ★</p>
   <div class="row"><button id="ps-again">${T("Try another passage","Probar otro texto")}</button><button class="ghost" id="ps-home">${T("Back to my trail","Volver a mi camino")}</button></div></div>
  <div class="card"><h2>${T("Review","Repaso")}</h2><ol class="ps-rev">${X.qs.map((q,j)=>{const mine=X.sel[j],r=mine===q.ans,txt=l=>{const c=q.choices[L.indexOf(l)];return typeof c==="string"?esc(c):choiceInner(c)};
    return `<li class="${r?"ok":"no"}"><p class="ps-st"><span class="lb-mk ${r?"ok":"no"}">${r?"✓":"✗"}</span> ${esc(q.stem)}</p>
     <p><span class="label">${T("Your answer","Tu respuesta")}</span> ${mine}. ${txt(mine)}</p>
     ${r?"":`<p><span class="label">${T("Right answer","Respuesta correcta")}</span> ${q.ans}. ${txt(q.ans)}</p><p class="muted">${fmt(q.why[mine]||"")}</p>`}
     ${q.pr&&q.pr.length?`<p class="muted small">${T("The proof is in","La prueba está en")} ${unit} ${q.pr.join(", ")}.</p>`:""}
     <p class="muted small">${esc(q.code)}</p></li>`}).join("")}</ol></div>
  <div class="card"><details><summary>${T("Read the passage again","Leer el texto otra vez")}</summary>${vizHTML({passage:{title:X.title,by:X.by,paras:X.paras,poem:X.poem}})}</details></div>`;
  wireLang();
  document.getElementById("ps-again").onclick=psetStart;
  document.getElementById("ps-home").onclick=()=>{S.ps=null;S.screen="home";render()};
}
SCREENS.pset=pset;

/* ================= Teacher session log: the intervention actually delivered =================
   A planned group is not proof that teaching happened. The teacher logs each small-group session:
   date, standard, minutes, who was there, and what was taught. Each student keeps their own copy
   (raw.ses), so absent students never get credit and every report reads the same record. */
const SES_MAX=80;
const sesOf=raw=>Array.isArray(raw&&raw.ses)?raw.ses:[];
function sesSum(raw,since=0,std=null){const L=sesOf(raw).filter(x=>new Date(x.d+"T12:00:00").getTime()>=since&&(!std||x.std===std));
  const here=L.filter(x=>x.a);return {n:here.length,mins:here.reduce((a,x)=>a+(+x.m||0),0),absent:L.length-here.length,last:here.length?here[here.length-1].d:null,list:L}}
/* every session in the class, rebuilt from the students' copies */
function classSessions(){const by={};(CUR.raw||[]).forEach(r=>sesOf(r).forEach(x=>{const o=by[x.id]||(by[x.id]={id:x.id,d:x.d,std:x.std,m:x.m,n:x.n||"",nx:x.nx||"",by:x.by||"",here:[],away:[]});(x.a?o.here:o.away).push(r.name)}));
  return Object.values(by).sort((a,b)=>b.d.localeCompare(a.d)||b.id.localeCompare(a.id))}
function sesForm(gi,ids,focus){const o=S.planO||PLAN_DEF,studs=ids.map(id=>CUR.students.find(s=>s.id===id)).filter(Boolean);
  return `<form class="ses-f card" data-sesf="${gi}" aria-label="Log a session"><h3 style="margin:0">Log this session</h3>
   <div class="grid"><label class="f">Date<input type="date" name="d" value="${isoDay(Date.now())}" max="${isoDay(Date.now())}" required></label>
    <label class="f">Standard taught<select name="std">${SKILLS.map(k=>`<option value="${esc(k.std)}" ${focus&&k.std===focus.std?"selected":""}>${esc(k.std)} · ${esc(k.name)}</option>`).join("")}</select></label>
    <label class="f">Minutes taught<input type="number" name="m" min="1" max="180" value="${o.mins||20}" required></label>
    <label class="f">Next check (optional)<input type="date" name="nx"></label></div>
   <fieldset class="ses-who"><legend>Who was there? Uncheck anyone absent.</legend>${studs.map(s=>`<label><input type="checkbox" name="a" value="${s.id}" checked> ${esc(s.name)}</label>`).join("")}</fieldset>
   <label class="f">What you taught (strategy, materials, how it went)<textarea name="n" rows="2" maxlength="200" placeholder="Modeled with arrays, then 3 problems on whiteboards. Most got it; Jay still adds."></textarea></label>
   <div class="row"><button type="submit">Save session</button><button type="button" class="ghost" data-sesx="1">Cancel</button><span class="muted" id="ses-msg" role="status"></span></div></form>`}
function sesLogCard(){const L=classSessions();if(!L.length)return `<div class="card"><h2>Sessions taught</h2><p class="muted">No sessions logged yet. After you teach a group, press <b>Log this session</b> on its card. Only students who were there get credit.</p></div>`;
  const wk=Date.now()-7*864e5,thisWk=L.filter(x=>new Date(x.d+"T12:00:00").getTime()>=wk);
  return `<div class="card"><div class="top"><h2>Sessions taught</h2><span class="pill">${thisWk.length} this week · ${thisWk.reduce((a,x)=>a+(+x.m||0),0)} min</span></div>
   <div class="tablewrap"><table class="roster"><thead><tr><th>Date</th><th>Standard</th><th>Minutes</th><th>There</th><th>Absent</th><th>Notes</th><th></th></tr></thead><tbody>
   ${L.slice(0,S.sesAll?200:8).map(x=>`<tr><td>${niceDay(x.d)}</td><td><b>${esc(x.std)}</b></td><td>${x.m}</td><td>${x.here.map(esc).join(", ")||"—"}</td><td>${x.away.length?x.away.map(esc).join(", "):'<span class="muted">none</span>'}</td><td>${esc(x.n)}${x.nx?`<br><span class="muted small">Next check ${niceDay(x.nx)}</span>`:""}</td><td><button class="ghost small" data-sesdel="${x.id}" aria-label="Delete the ${niceDay(x.d)} session">Delete</button></td></tr>`).join("")}</tbody></table></div>
   ${L.length>8&&!S.sesAll?`<button class="ghost small" id="ses-all">Show all ${L.length}</button>`:""}</div>`}
function wireSessions(){
  app.querySelectorAll("[data-seslog]").forEach(b=>b.onclick=()=>{const y=window.scrollY;S.sesG=S.sesG===+b.dataset.seslog?null:+b.dataset.seslog;render();window.scrollTo(0,y)});
  app.querySelectorAll("[data-sesx]").forEach(b=>b.onclick=()=>{S.sesG=null;render()});
  const all=document.getElementById("ses-all");if(all)all.onclick=()=>{S.sesAll=true;render()};
  app.querySelectorAll("[data-sesf]").forEach(f=>f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f),gi=+f.dataset.sesf,ids=S.plan.groups[gi].ids,here=new Set(fd.getAll("a")),msg=document.getElementById("ses-msg");
    const d=String(fd.get("d")||""),m=Math.max(1,Math.min(180,Math.round(+fd.get("m")||0)));if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!m){msg.textContent="Add the date and minutes.";return}
    if(!here.size&&!confirm("No one is checked as there. Save the session as everyone absent?"))return;
    const rec={id:"x"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),d,std:String(fd.get("std")),m,n:String(fd.get("n")||"").trim().slice(0,200),nx:String(fd.get("nx")||""),by:TB.me?.name||""};
    const idset=new Set(ids);busy(e.submitter,"Saving…");
    try{await saveRoster(CUR.raw.map(s=>idset.has(s.id)?{...s,ses:[...sesOf(s),{...rec,a:here.has(s.id)?1:0}].slice(-SES_MAX)}:s));S.sesG=null;S.sesSaved=gi;render()}catch(er){msg.textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Save session"}});
  app.querySelectorAll("[data-sesdel]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete this session for every student in it?"))return;const id=b.dataset.sesdel;busy(b,"…");
    try{await saveRoster(CUR.raw.map(s=>sesOf(s).some(x=>x.id===id)?{...s,ses:sesOf(s).filter(x=>x.id!==id)}:s));render()}catch(er){alert(er.message)}});
}
/* one line for plan cards and reports: planned vs taught vs app time */
function dosageLine(raw,s,since,plannedPerWk){const T=sesSum(raw,since),app=minsOf(s.prog,null,since),wks=Math.max(1,Math.round((Date.now()-since)/(7*864e5)));
  const planned=plannedPerWk?plannedPerWk*Math.min(wks,IP_WEEKS*2):null;
  return {T,app,planned,html:`<span><b>Taught by teacher</b> ${T.n} session${T.n===1?"":"s"}, ${T.mins} min${T.absent?` · absent ${T.absent}`:""}</span>${planned!=null?`<span><b>Planned so far</b> ${planned} min</span>`:""}<span><b>App practice</b> ${app} min (estimated)</span>`}}
/* ================= Evidence ladder: Practiced → Verified → Retained (S06 / F04) =================
   Reaching a checkpoint (a run of right answers in a row) proves PRACTICE, often with help nearby.
   Verified: on a LATER day, the student gets VERIFY_N check-up questions right on their own (no Scout).
   Retained: RETAIN_DAYS after it was verified, the student gets a check-up right on their own again.
   Right on the benchmark test counts as verified (independent, on a different day by definition).
   Two misses on check-ups put the standard back on the trail (the existing refresh rule) and the
   ladder starts over. Everything is stored on the skill as sk.ev = {v, vn, r, rt, miss}. */
const VERIFY_N=2,RETAIN_DAYS=14;
const evOf=sk=>(sk&&sk.ev)||{};
const EV_ORDER=["none","learning","refresh","practiced","verified","retained"];
const EV_LBL={none:"Not started",learning:"Learning",refresh:"Needs a refresh",practiced:"Practiced",verified:"Verified",retained:"Retained"};
const EV_TIP={none:"No practice yet.",learning:"Practicing, has not reached the checkpoint yet.",refresh:"Missed check-ups after mastering it, so it is back on the trail.",
  practiced:`Reached the checkpoint. Still needs ${VERIFY_N} right on their own on a later day.`,verified:`Right on their own on a later day (or right on the test). Retention check after ${RETAIN_DAYS} days.`,
  retained:`Still right on their own ${RETAIN_DAYS}+ days after it was verified.`};
const EV_CLS={none:"",learning:"",refresh:"oops",practiced:"gold",verified:"go",retained:"purple"};
function evLevel(s,k){const sk=s.prog&&s.prog.skills[k.id];if(!sk||sk.status==="off")return null;const e=evOf(sk);
  if(sk.status==="todo"){if(sk.reopen)return "refresh";return (s.prog.recent||[]).some(r=>r.k===k.id)||Object.values(s.prog.days||{}).some(d=>d&&d[k.id])?"learning":"none"}
  if(e.r)return "retained";if(e.v||sk.status==="skip")return "verified";return "practiced"}
/* when each rung was reached (ms) */
function evDates(s,k){const sk=s.prog.skills[k.id]||{},e=evOf(sk);
  return {p:sk.doneAt||null,v:e.v||(sk.status==="skip"?(s.prog.first||null):null),r:e.r||null}}
const evPill=lv=>lv?`<span class="pill ${EV_CLS[lv]}" title="${esc(EV_TIP[lv])}">${EV_LBL[lv]}</span>`:"—";
/* the check-up that is due now, if any: verify checks first (oldest first), then retention checks */
function evDue(s){const p=s.prog,now=Date.now(),today=dayKey();if(!p||!p.skills)return null;
  const can=k=>genOf(k)||k.qs.length||k.twins.length;
  const v=SKILLS.filter(k=>{const sk=p.skills[k.id];return sk&&sk.status==="done"&&!sk.reopen&&!evOf(sk).v&&sk.doneAt&&dayKey(sk.doneAt)!==today&&can(k)})
    .sort((a,b)=>p.skills[a.id].doneAt-p.skills[b.id].doneAt);
  if(v.length)return {k:v[0],kind:"v"};
  const r=SKILLS.filter(k=>{const sk=p.skills[k.id];if(!sk||sk.reopen||!(sk.status==="done"||sk.status==="skip")||evOf(sk).r||!can(k))return false;
    const from=evOf(sk).v||(sk.status==="skip"?p.first:null);return from&&now-from>=RETAIN_DAYS*864e5&&(!evOf(sk).rt||dayKey(evOf(sk).rt)!==today)})
    .sort((a,b)=>(evOf(p.skills[a.id]).v||0)-(evOf(p.skills[b.id]).v||0));
  return r.length?{k:r[0],kind:"r"}:null}
function evDueCount(s){let n=0;const p=s.prog,now=Date.now(),today=dayKey();if(!p||!p.skills)return 0;
  SKILLS.forEach(k=>{const sk=p.skills[k.id];if(!sk||sk.reopen)return;const e=evOf(sk);
    if(sk.status==="done"&&!e.v&&sk.doneAt&&dayKey(sk.doneAt)!==today)n++;
    else if((sk.status==="done"||sk.status==="skip")&&!e.r){const from=e.v||(sk.status==="skip"?p.first:null);if(from&&now-from>=RETAIN_DAYS*864e5&&(!e.rt||dayKey(e.rt)!==today))n++}});return n}
/* grade a check-up. help = the student opened Scout before answering, so it cannot count as on their own */
function evGrade(sk,kind,ok,help){const e=sk.ev=sk.ev||{};
  if(kind==="v"){if(ok&&!help){e.vn=(e.vn||0)+1;if(e.vn>=VERIFY_N){e.v=Date.now();delete e.vn;return "verified"}return "progress"}if(!ok)e.vn=0;return ok?"help":"miss"}
  if(kind==="r"){e.rt=Date.now();if(ok&&!help){e.r=Date.now();return "retained"}return ok?"help":"miss"}
  return null}
/* the ladder resets whenever the standard goes back on the trail */
function evReset(sk){delete sk.ev}
/* student home: check-ups waiting (also works after the summit, when there is no mission) */
function evHomeCard(s){if(curSkill(s))return ""; /* mid-trail, check-ups come up on their own during practice */ const n=evDueCount(s);if(!n)return "";
  return `<div class="card"><div class="top"><h2>${t("Check-ups")}</h2><span class="pill purple">${n} ${t(n===1?"waiting":"waiting")}</span></div>
   <p class="muted">${t("Show you can still do standards you mastered, all on your own. No Scout on check-ups.")}</p>
   <div class="row"><button id="ev-go">${t("Start my check-ups")}</button></div></div>`}
function wireEvHome(){const b=document.getElementById("ev-go");if(b)b.onclick=()=>{S.chkMode=true;if(newQ()!==false){S.screen="practice"}render()}}

/* ================= teacher: class evidence summary ================= */
function evClassCard(){const real=realStudents();if(!real.length)return "";
  const rows=SKILLS.map(k=>{const c={none:0,learning:0,refresh:0,practiced:0,verified:0,retained:0};let N=0;
    real.forEach(s=>{const lv=evLevel(s,k);if(lv){c[lv]++;N++}});return N?{k,c,N}:null}).filter(Boolean);
  if(!rows.length)return "";
  const tot=rows.reduce((a,x)=>{EV_ORDER.forEach(l=>a[l]=(a[l]||0)+x.c[l]);return a},{});
  return `<div class="card"><div class="top"><h2>Evidence ladder</h2><span class="muted small">Practiced → Verified → Retained</span></div>
   <p class="muted">A checkpoint shows practice. <b>Verified</b> means ${VERIFY_N} right on their own on a later day (or right on the test). <b>Retained</b> means right on their own again ${RETAIN_DAYS}+ days later. Check-ups come up on their own during practice.</p>
   <div class="row" style="gap:14px">${["practiced","verified","retained","refresh"].map(l=>`<span>${evPill(l)} <b>${tot[l]||0}</b></span>`).join("")}</div>
   <div class="tablewrap"><table class="roster"><thead><tr><th>Standard</th><th>Learning</th><th>Practiced</th><th>Verified</th><th>Retained</th><th>Needs a refresh</th></tr></thead><tbody>
   ${rows.map(x=>`<tr><td><b>${esc(x.k.std)}</b><br><span class="muted small">${esc(x.k.name)}</span></td><td>${x.c.learning+x.c.none}</td><td>${x.c.practiced}</td><td>${x.c.verified}</td><td>${x.c.retained}</td><td>${x.c.refresh||""}</td></tr>`).join("")}</tbody></table></div></div>`}

/* ================= Proficiency Receipt (F05): one printable page per student ================= */
function receiptHTML(r,s){const now=new Date(),rows=SKILLS.map(k=>{const lv=evLevel(s,k);if(!lv)return null;const d=evDates(s,k),st=stdRows(s).find(x=>x.k.id===k.id)||{};return {k,lv,d,st}}).filter(Boolean)
    .sort((a,b)=>EV_ORDER.indexOf(b.lv)-EV_ORDER.indexOf(a.lv)||a.k.std.localeCompare(b.k.std));
  const c={};rows.forEach(x=>c[x.lv]=(c[x.lv]||0)+1);const rd=readiness(s),b=band(rd),T=sesSum(r,0),f=(r.prog||{})._flu;
  const dd=t=>t?new Date(t).toLocaleDateString(undefined,{month:"short",day:"numeric"}):"";
  return `<div class="card rcpt" id="rcpt-${esc(r.id)}">
   <div class="top"><div><span class="label">Proficiency Receipt</span><h2 style="margin:2px 0">${esc(r.name)}</h2>
    <p class="muted" style="margin:0">${esc(CUR.cls.name)} · ${esc(tName(CUR.cls.teacherId))} · ${esc(TB.school.name)}<br>${esc(TEST_NAME)} · ${now.toLocaleDateString()}</p></div>
    <div style="text-align:right"><span class="pill ${b.c}">${b.t}${rd!=null?` · ${rd}%`:""}</span><br><span class="muted small">benchmark readiness (estimate)</span></div></div>
   <div class="mstats">${[["Retained",c.retained||0],["Verified",c.verified||0],["Practiced",c.practiced||0],["Learning",(c.learning||0)+(c.refresh||0)],["Not started",c.none||0],["Sessions with teacher",T.n],["App minutes",minsOf(s.prog)],["Fluency level",f?`${(f.level||0)+1} of ${FLU().length}`:"—"]].concat(stepsMstats(s)).map(([l,v])=>`<div><b>${esc(String(v))}</b><span>${l}</span></div>`).join("")}</div>
   <div class="tablewrap"><table class="roster rtab"><thead><tr><th>Standard</th><th>Evidence</th><th>Practiced</th><th>Verified</th><th>Retained</th><th>Accuracy</th></tr></thead><tbody>
   ${rows.map(x=>`<tr><td><b>${esc(x.k.std)}</b> <span class="muted">${esc(x.k.name)}</span></td><td>${evPill(x.lv)}</td><td>${dd(x.d.p)}</td><td>${x.k&&s.prog.skills[x.k.id].status==="skip"&&!evOf(s.prog.skills[x.k.id]).v?"Test":dd(x.d.v)}</td><td>${dd(x.d.r)}</td><td>${x.st.acc==null?"—":x.st.n<5?`<span class="muted">${x.st.acc}% (${x.st.n})</span>`:x.st.acc+"%"}</td></tr>`).join("")||`<tr><td colspan="6" class="muted">No standards on this trail yet.</td></tr>`}</tbody></table></div>
   <p class="muted small" style="margin:0"><b>Practiced:</b> reached the checkpoint in practice. <b>Verified:</b> ${VERIFY_N} right on their own on a later day, or right on the benchmark test. <b>Retained:</b> right on their own again ${RETAIN_DAYS} or more days after it was verified. Readiness is an estimate from practice and test data, not a MAAP score.</p>
  </div>`}
function receiptView(){const real=CUR.raw.filter(s=>!isSample(s)).map(r=>({r,s:CUR.students.find(x=>x.id===r.id)})).filter(x=>x.s);
  const list=S.rcpt==="all"?real:real.filter(x=>x.r.id===S.rcpt);
  return `<div class="row"><button class="ghost small" id="rc-back">← All students</button><button class="small" id="rc-print">Print ${list.length===1?"receipt":`${list.length} receipts`}</button></div>
   <div id="rcpts">${list.map(x=>receiptHTML(x.r,x.s)).join("")||`<p class="muted">No students yet.</p>`}</div>`}
function wireReceipts(){
  app.querySelectorAll("[data-rcpt]").forEach(b=>b.onclick=()=>{S.rcpt=b.dataset.rcpt;S.mtssId=null;render();window.scrollTo(0,0)});
  const bk=document.getElementById("rc-back");if(bk)bk.onclick=()=>{S.rcpt=null;render()};
  const pr=document.getElementById("rc-print");if(pr)pr.onclick=()=>printEl("rcpts",S.rcpt==="all"?"Proficiency Receipts":"Proficiency Receipt")}
/* ================= Exit tickets that update tomorrow's groups (S03) =================
   The teacher gives a short check on one standard (3 or 5 questions) to the class or one group.
   The ticket lives on each student's roster record (raw.xt, written by the teacher); the student's
   answers live in their progress (prog.xtr[id], written by the student). Make groups reads the newest
   result from the last XT_DAYS days: a student under 2/3 is grouped by the ticket's standard, and the
   ticket score carries more weight than older practice. */
const XT_MAX=20,XT_DAYS=3,XT_PASS=2/3;
const xtOf=raw=>Array.isArray(raw&&raw.xt)?raw.xt:[];
const xtRes=(s,id)=>(s.prog&&s.prog.xtr&&s.prog.xtr[id])||null;
/* newest ticket result for a student (view student s, with s.raw), within `days` */
function xtLatest(s,days=XT_DAYS){const since=Date.now()-days*864e5,raw=s.raw||s;
  /* exit tickets the student answered, plus paper practice the teacher scored (S11) */
  const L=[...xtOf(raw).map(x=>({x,r:xtRes(s,x.id)})),...ppOf(raw).map(x=>({x,r:{t:new Date(x.d+"T15:00:00").getTime(),ok:x.ok,n:x.n},paper:true}))].filter(e=>e.r&&e.r.n&&e.r.t>=since);
  if(!L.length)return null;const e=L.sort((a,b)=>b.r.t-a.r.t)[0];
  /* a custom test covers several standards: use the student's weakest one */
  if(e.x.qs&&e.r.by){const w=Object.entries(e.r.by).filter(([,v])=>v[1]).sort((a,b)=>a[1][0]/a[1][1]-b[1][0]/b[1][1])[0],k=w&&SKILLS.find(s=>s.id===w[0]);
    return k?{x:e.x,r:{...e.r,ok:w[1][0],n:w[1][1]},k,custom:true,pass:w[1][0]/w[1][1]>=XT_PASS-1e-9}:null}
  const k=SKILLS.find(k=>k.id===e.x.k)||SKILLS.find(k=>k.std===e.x.std);
  return k?{x:e.x,r:e.r,k,paper:!!e.paper,pass:e.r.ok/e.r.n>=XT_PASS-1e-9}:null}
/* every ticket in the class, rebuilt from the students' copies */
function classTickets(){const by={};CUR.students.filter(s=>!isSample(s)).forEach(s=>xtOf(s.raw||s).forEach(x=>{const o=by[x.id]||(by[x.id]={...x,who:[]});o.who.push({s,r:xtRes(s,x.id)})}));
  return Object.values(by).sort((a,b)=>b.d.localeCompare(a.d)||b.id.localeCompare(a.id))}
function xtCard(){if(!SKILLS.some(k=>genOf(k)))return "";const L=classTickets(),P=S.plan,focus=SKILLS.find(k=>k.id===S.xtFocus)||(()=>{const c={};realStudents().forEach(s=>{const k=curSkill(s);if(k)c[k.id]=(c[k.id]||0)+1});const id=Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0];return SKILLS.find(k=>k.id===id)})();
  return `<div class="card"><div class="top"><h2>Exit tickets</h2><span class="muted small">Results update tomorrow’s groups</span></div>
   <p class="muted">A short check at the end of a lesson: ${3} or ${5} questions on one standard, on their own, no hints. Students see it on their home page. When you press <b>Make groups</b>, anyone who got under two thirds right in the last ${XT_DAYS} days is grouped by that standard.</p>
   ${S.xtNew?`<form class="grid" id="xt-f"><label class="f">Standard<select name="k">${pickSkills().map(k=>`<option value="${esc(k.id)}" ${focus&&k.id===focus.id?"selected":""}>${esc(k.std)} · ${esc(k.name)}</option>`).join("")}</select></label>
     <label class="f">Questions<select name="n"><option value="3">3</option><option value="5">5</option></select></label>
     <label class="f">Who<select name="who"><option value="all">Whole class</option>${P&&P.groups?P.groups.map((g,i)=>`<option value="${i}">${esc(g.name)} (${g.ids.length})</option>`).join(""):""}</select></label>
     <div class="row" style="grid-column:1/-1"><button type="submit">Give exit ticket</button><button type="button" class="ghost" id="xt-x">Cancel</button><span class="muted" id="xt-msg" role="status"></span></div></form>`
    :`<div class="row"><button id="xt-new">＋ Give an exit ticket</button>${S.xtSaved?`<span class="fb ok" role="status" style="padding:6px 10px">Exit ticket sent. Students see it when they sign in.</span>`:""}</div>`}
   ${L.length?`<div class="tablewrap"><table class="roster"><thead><tr><th>Date</th><th>Standard</th><th>Taken</th><th>Average</th><th>Under ⅔ (regroup)</th><th>Not taken yet</th><th></th></tr></thead><tbody>
    ${L.slice(0,S.xtAll?40:5).map(x=>{const done=x.who.filter(w=>w.r),avg=done.length?Math.round(done.reduce((a,w)=>a+w.r.ok/w.r.n,0)/done.length*100):null,low=done.filter(w=>w.r.ok/w.r.n<XT_PASS-1e-9);
      return `<tr><td>${niceDay(x.d)}</td><td>${x.qs?`<b>📝 ${esc(x.name||"Test")}</b> · ${x.qs.length} q${tbResults(x)}`:`<b>${esc(x.std)}</b> · ${x.n} q`}${x.mis?`<br><span class="pill purple">Mistake check</span> <span class="muted small">“${esc(x.mx||"")}”</span>`:""}</td><td>${done.length} of ${x.who.length}</td><td>${avg==null?"—":avg+"%"}</td><td>${x.mis?done.map(w=>{const v=misVerdict(w.r);return `${esc(w.s.name)} <span class="pill ${v[0]}">${v[1]}</span>`}).join(" ")||"—":low.map(w=>`${esc(w.s.name)} <span class="muted">${w.r.ok}/${w.r.n}</span>`).join(", ")||(done.length?'<span class="muted">none</span>':"—")}</td><td>${x.who.filter(w=>!w.r).map(w=>esc(w.s.name)).join(", ")||'<span class="muted">none</span>'}</td><td><button class="ghost small" data-xtdel="${x.id}" aria-label="Delete the ${niceDay(x.d)} exit ticket">Delete</button></td></tr>`}).join("")}</tbody></table></div>
    ${L.length>5&&!S.xtAll?`<button class="ghost small" id="xt-all">Show all ${L.length}</button>`:""}`:""}</div>`}
function wireXt(){const nw=document.getElementById("xt-new");if(nw)nw.onclick=()=>{S.xtNew=true;S.xtSaved=false;render()};
  const x=document.getElementById("xt-x");if(x)x.onclick=()=>{S.xtNew=false;render()};
  const all=document.getElementById("xt-all");if(all)all.onclick=()=>{S.xtAll=true;render()};
  const f=document.getElementById("xt-f");if(f)f.onsubmit=async e=>{e.preventDefault();const fd=new FormData(f),k=pickSkills().find(k=>k.id===fd.get("k")),who=String(fd.get("who"));if(!k)return;
    const ids=new Set(who==="all"?realStudents().map(s=>s.id):(S.plan.groups[+who]||{ids:[]}).ids);
    const rec={id:"t"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),d:isoDay(Date.now()),k:k.id,std:k.std,n:+fd.get("n")===5?5:3};busy(e.submitter,"Sending…");
    try{await saveRoster(CUR.raw.map(s=>ids.has(s.id)?{...s,xt:[...xtOf(s),rec].slice(-XT_MAX)}:s));S.xtNew=false;S.xtSaved=true;render()}catch(er){document.getElementById("xt-msg").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Give exit ticket"}};
  app.querySelectorAll("[data-xtdel]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete this exit ticket for every student? Their answers stay in their practice record."))return;const id=b.dataset.xtdel;busy(b,"…");
    try{await saveRoster(CUR.raw.map(s=>xtOf(s).some(x=>x.id===id)?{...s,xt:xtOf(s).filter(x=>x.id!==id)}:s));render()}catch(er){alert(er.message)}})}

