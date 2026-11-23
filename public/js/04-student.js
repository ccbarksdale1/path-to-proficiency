/* Path to Proficiency · Student practice, Scout, 3 Before Me.
   Loaded in order by index.html as plain scripts that share one global scope. */
/* ---------- student ---------- */
function startStudent(d){
  TOKEN=d.token;ls.set(SKEY,{token:d.token,role:"student"},sessionStorage);SB=d;S.role="student";S.demo=false;
  if(d.test)TESTS[d.test.id]=d.test;useTest(d.test||(isStdT(d.cls.testId)?{id:d.cls.testId}:null));addExtras([...(d.student.assigned||[]),...ipCodes(d.student),...goList(d.prog&&d.prog[TESTID]),...xtCodes(d.student)]);
  db={mastery:d.cls.mastery,videos:d.cls.videos||{},goal:d.cls.goal,choose:d.cls.choose};TEACHER=d.teacher||"Your teacher";
  const restored=offRestore(d);try{const {token,...keep}=d;ls.set(BOOTKEY,keep,sessionStorage)}catch(e){}S.student=viewStudent({...d.student,prog:d.prog});cbStart(d.comeback);S.home=d.home||null;if(restored)setTimeout(save,500);accApply(d);S.lang=(d.prog&&d.prog._pref&&d.prog._pref.lang)||(d.student&&d.student.acc&&d.student.acc.es?"es":"en");S.screen="home";S.err="";render();
}
function home(){
  const s=S.student,p=s.prog,cur=curSkill(s),first=s.name.replace(" (sample)","");
  const TR=trailFor(s),asg=new Set(s.assigned||[]),done=TR.filter(k=>p.skills[k.id].status!=="todo").length;
  const sk=cur&&p.skills[cur.id];
  const MASTERY=MAST();
  const msg=!cur?`You made it to the summit, ${esc(first)}! You are proficient on ${esc(TEST_NAME)}.`
    :sk.streak>0?`${CHEERS[0]} ${MASTERY-sk.streak} more ★ reach the checkpoint.`
    :done>0?`${done} checkpoint${done===1?"":"s"} done! Read slow, highlight your key words, then solve.`
    :`Hi, ${esc(first)}! Read slow, highlight your key words, then solve.`;
  const mission=cur?`<div class="card mission">
     <div class="top"><h2>${t(isELA(gradeOf())?"Today’s Reading Mission":isSci(gradeOf())?"Today’s Science Mission":"Today’s Math Mission")}</h2><span class="stars" aria-label="${p.stars} stars">★ ${p.stars}</span></div>
     <div class="skill">${ico(cur.id)}<div><b style="font-size:1.15rem">${esc(cur.name)}</b><br><span class="muted">${esc(cur.std)}</span></div></div>
     <div class="row"><span class="flags" aria-label="${sk.streak} of ${MASTERY} stars">${Array.from({length:MASTERY},(_,i)=>`<i class="${i<sk.streak?'on':''}">${i<sk.streak?'★':i+1}</i>`).join("")}</span><span class="muted">Earn ${MASTERY} ★ to reach the checkpoint</span></div>
     ${carriedNote(p)}${focusCard(s)}${scout(msg)}
     <div class="row"><button id="go">${t(sk.streak||Object.keys(p.log).length?"Keep climbing":"Start my mission")}</button>${db.videos[cur.id]?`<a class="btnlink" href="${esc(db.videos[cur.id])}" target="_blank" rel="noopener">▶ Watch the lesson</a>`:""}</div>
   </div>`:`<div class="card mission" style="align-items:flex-start">${HERO_ART}${scout(msg)}</div>`;
  app.innerHTML=header(`${langToggle()}<button class="ghost" id="out">${t("Sign out")}</button>`)+tbadgeNotice()+creditNotice(p)+cbCard(s)+mission+xtHomeCard(s)+evHomeCard(s)+chalCard(s)+psetCard(s)+hsHomeCard(s)+goFurtherCard(s)+(hsOn()||subjOf(gradeOf())!=="math"?"":fluCard())+gameCard()+`
  <div class="card">
   <div class="top"><h2>${t("My trail")}</h2><span class="pill gold">${done} of ${TR.length} checkpoints</span></div>
   ${ipActive(s)?`<p class="fb info">📘 ${t("Your teacher made you a personal math plan. Your trail starts with the building blocks you need.")}</p>`:""}
   ${s.missed&&s.missed.length?`<p class="muted">On the test you missed ${missedText(s.missed)}. Your trail starts with those.</p>`:""}
   <ol class="trail">${TR.map((k,i)=>{const st=p.skills[k.id].status,cls=st==="todo"?(k===cur?"now":"later"):"done";
     const pill=st==="skip"?`<span class="pill go">${t("Got it on the test")}</span>`:st==="done"?(lv=>lv==="retained"?`<span class="pill purple">${t("Locked in")}</span>`:lv==="verified"?`<span class="pill go">${t("Verified")}</span>`:`<span class="pill go">${t("Mastered")}</span>`)(evLevel(s,k)):k===cur?`<span class="pill now">${t("You are here")}</span>`:p.skills[k.id].reopen?'<span class="pill gold">Refresh</span>':p.skills[k.id].go?`<span class="pill gold">🚀 ${t("Going further")}</span>`:asg.has(k.std)?`<span class="pill purple">${t("From your teacher")}</span>`:`<span class="pill">${t("Coming up")}</span>`;
     return `<li class="stop ${cls}"><span class="num">${cls==="done"?"✓":i+1}</span><span style="display:flex;gap:10px;align-items:center;min-width:0">${ico(k.id)}<span><span class="name">${esc(k.name)}</span><br><span class="muted" style="font-size:.85rem">${esc(k.std)}</span></span></span>${pill}</li>`}).join("")}
     <li class="stop summit${cur?'':' reached'}"><span class="num">★</span><span><span class="name">Summit of Mastery</span><br><span class="muted" style="font-size:.85rem">Finish every checkpoint</span></span>${cur?'':'<span class="pill gold">You made it!</span>'}</li></ol>
  </div>
  ${homeMissionCard()}${pfButton()}<div class="card"><h2>${t("My badges")}</h2>${badgesHTML(p)}</div>`;
  document.getElementById("out").onclick=signOut;wireLang();wireHsHome();wirePsetCard();wireHomeMission();
  app.querySelectorAll("[data-focus]").forEach(b=>b.onclick=()=>{const p=S.student.prog,f=b.dataset.focus;if(f)p.focus=f;else delete p.focus;useMark("focus");save();render()});
  const g=document.getElementById("go"); if(g) g.onclick=()=>{S.chkMode=false;if(newQ()!==false)S.screen="practice";render()};wireEvHome();wireXtHome();wireChal();wirePfButton();
  const fg=document.getElementById("flu-go"); if(fg) fg.onclick=fluStart;
  const ag=document.getElementById("arcade-go"); if(ag) ag.onclick=()=>{S.screen="arcade";render()};
  const gf=document.getElementById("go-further"); if(gf) gf.onclick=startGoFurther;
}
SCREENS.home=home;

/* key words count only in the question; passage highlights are the student's own notes */
const qHl=()=>[...S.hl].filter(i=>i<100000).length;
/* ---------- no early repeats: science and ELA questions come from written banks, so each student works
   through every item of a skill (in random order) before any item comes back. The item number rides in the
   question id: seed = item × DECK_K + random. ---------- */
const deckN=g=>SCI_CODE&&SCI_CODE[g]?GENSCI.count(g):ELA_CODE&&ELA_CODE[g]?GENELA.count(g):0;
const deckOf=id=>{if(typeof id!=="string"||id[0]!=="~")return null;const[,g,seed]=id.split("~"),n=deckN(g);return n?{g,i:Math.floor(+seed/DECK_K)%n}:null};
function deckId(sk,g){const n=deckN(g);if(!n)return genId(g);
  let seen=Array.isArray(sk.seen)?sk.seen.filter(i=>Number.isInteger(i)&&i>=0&&i<n):[];
  const queued=new Set((sk.queue||[]).map(deckOf).filter(d=>d&&d.g===g).map(d=>d.i));
  let open=[];for(let i=0;i<n;i++)if(!seen.includes(i)&&!queued.has(i))open.push(i);
  /* every item has been shown: start a new round, but hold back the ones shown most recently so they can't come right back */
  if(!open.length){seen=seen.slice(-Math.floor(n*.6));for(let i=0;i<n;i++)if(!seen.includes(i)&&!queued.has(i))open.push(i);if(!open.length)open=[...Array(n).keys()].filter(i=>!queued.has(i));if(!open.length)open=[...Array(n).keys()]}
  sk.seen=seen;const i=open[Math.floor(Math.random()*open.length)];
  return `~${g}~${i*DECK_K+Math.floor(Math.random()*(DECK_K-1))}`}
function markSeen(sk,id){const d=deckOf(id);if(!d||!sk)return;sk.seen=Array.isArray(sk.seen)?sk.seen:[];if(!sk.seen.includes(d.i))sk.seen.push(d.i)}
function topUp(sk,id,n=4){
  const k=SKILLS.find(x=>x.id===id),g=k&&genOf(k);
  if(g&&(TESTID==="a1"||k.extra)){while(sk.queue.length<n)sk.queue.push(deckId(sk,g));return}
  const pool=[...k.twins,...k.qs.map(n=>"q"+n)].filter(getQ);
  if(g){let guard=0;while(sk.queue.length<n&&guard++<50){const c=pool.filter(x=>!sk.queue.includes(x));sk.queue.push(c.length&&Math.random()<.5?c[Math.floor(Math.random()*c.length)]:deckId(sk,g))}return}
  if(!pool.length)return;
  let guard=0;while(sk.queue.length<n&&guard++<50){const c=pool.filter(x=>!sk.queue.includes(x)),from=c.length?c:pool;sk.queue.push(from[Math.floor(Math.random()*from.length)])}
}
function newQ(){S.assisted=false;if(S.hand&&!S.demo)api("handLower",{}).catch(()=>{});S.help=null;S.helpClosed=null;S.wt=null;S.hand=false;S.lb=null;S.pf=null;S.ro=null;S.pit=null;S.evRes=null;S.rvKind=null;S.cnt=null;const cur=S.chkMode?null:curSkill(S.student),rv=(!S.demo||S.chkMode)&&pickReview(S.student),k=rv||cur;
  if(!k){S.chkMode=false;S.rvKind=null;S.screen="home";return false} // nothing left: check-ups finished, or the summit with nothing due
  const sk=S.student.prog.skills[k.id];S.rev=!!rv;S.rep=null;S.reopened=false;S.kwFade=false;confPick();
  if(rv){S.k=k.id;S.qid=(S.rvKind==="v"&&(evOf(sk).vn||0)>=1&&eaIdFor(k))||reviewQid(k); /* the second verify check-up is a Think deeper (DOK 3) question */S.q=viewQ(getQ(S.qid));S.step=step0(S.q);S.kwSkip=S.step===2;S.bare=S.step===2&&kwMode()!=="off";S.shownAt=Date.now();S.hl=new Set();S.sel=[];S.result=null;S.r=0;S.full=false;S.mastered=false;S.chat=null;stopPlay();return}
  while(sk.queue.length&&(!getQ(sk.queue[0])||isHidden(sk.queue[0])))sk.queue.shift(); topUp(sk,k.id);
  S.k=k.id;S.qid=sk.queue[0];markSeen(sk,S.qid);
  if(dokMixOn()&&(S.dokN=(S.dokN||0)+1)%DOK_MIX_EVERY===0){const ea=eaIdFor(k);if(ea)S.qid=ea} /* match the state test mix: some DOK 3 */
  if(buddyOn()&&S.qid[0]!=="!"&&(S.bdN=(S.bdN||0)+1)%BD_EVERY===0){const bd=bdIdFor(S.qid);if(bd)S.qid=bd} /* Find Buddy's Mistake */
  S.q=viewQ(getQ(S.qid));S.step=step0(S.q);if(S.step===1&&kwMode()==="on"&&(sk.streak||0)>=4&&!(S.q&&S.q._ea)&&!planOn(S.q)&&(S.kwN=(S.kwN||0)+1)%3){S.step=2;S.kwFade=true}S.kwSkip=S.step===2;S.bare=S.step===2&&kwMode()!=="off";S.shownAt=Date.now();S.hl=new Set();S.sel=[];S.result=null;S.r=0;S.full=false;S.mastered=false;S.chat=null;stopPlay()}

function answerArea(q){const h=answerArea0(q);return S.confPending&&!S.result?h.replace('<button id="check"','<button id="check" hidden')+confHTML():h}
function answerArea0(q){
  const done=!!S.result;
  if(q.type==="mc"||q.type==="multi"){
    const one=q.choices.some(c=>typeof c==="string"&&c.length>40)||q.choices.some(c=>c.table);
    const need=q.type==="multi"?2:1;
    return `<p class="note">${q.type==="multi"?t('Pick TWO answers, then tap Check.'):t('Pick your answer, then tap Check.')}</p>
     <div class="choices${one?' one':''}">${q.choices.map((c,i)=>{const l=L[i];let cl="",tag="";
      const isAns=q.type==="mc"?q.ans===l:q.ans.includes(l);
      if(done){if(isAns){cl=" right";tag=`<span class="tag ok">✓ Right answer</span>`}else if(S.sel.includes(l)){cl=" wrong";tag=`<span class="tag no">✗ Your answer</span>`}}
      else if(S.sel.includes(l))cl=" sel";
      return `<button class="choice${cl}" data-l="${l}" ${done?'disabled':''} aria-pressed="${S.sel.includes(l)}"><b class="l">${l}</b><div>${choiceInner(c)}${tag}</div></button>`}).join("")}</div>
     ${!done?`<button id="check" ${S.sel.length!==need?'disabled':''}>${need===2?t("Check my answers"):t("Check my answer")}</button>`:''}`;
  }
  if(q.type==="input") return `<div class="row"><label class="f" style="font-size:1rem;color:var(--ink)">${t("Your answer")}<input class="num" id="num" inputmode="decimal" ${done?'disabled':''} value="${esc(S.sel[0]||"")}"></label>${done?"":`<button id="check">${t("Check my answer")}</button>`}</div>`;
  if(q.type==="matrix") return `<table class="matrix"><thead><tr><th></th>${q.cols.map(c=>`<th>Rounds to ${c}</th>`).join("")}</tr></thead><tbody>
    ${q.rows.map((r,i)=>`<tr><td>${r.n}</td>${q.cols.map(c=>{let cl="",mk="";if(done&&S.sel[i]===c){cl=c===r.a?"right":"wrong";mk=c===r.a?" ✓":" ✗"}else if(done&&c===r.a){cl="right";mk=" ✓"}
      return `<td class="${cl}"><input type="radio" name="m${i}" id="m${i}-${c}" value="${c}" ${S.sel[i]===c?'checked':''} ${done?'disabled':''} aria-label="${r.n} rounds to ${c}"><b class="mk">${mk}</b></td>`}).join("")}</tr>`).join("")}</tbody></table>
    ${done?"":`<button id="check" ${q.rows.every((_,i)=>S.sel[i])?'':'disabled'}>Check my answers</button>`}`;
}

/* ---------- Scout, the AI tutor ---------- */
const tutorOn=()=>S.demo||(S.role==="student"&&SB&&SB.ai&&SB.cls.tutor!==false);
function chatHTML(){
  if(!tutorOn())return"";
  const c=S.chat;
  if(S.rev&&S.rvKind&&!S.result)return `<p class="muted small">${t("Check-up: show you can do this one on your own. Scout is off for check-ups.")}</p>`;
  if(!c||!c.open)return `<div class="row"><button class="ghost" id="ask">${t("💬 Ask Scout for help")}</button></div>`;
  const chips=S.result==="wrong"?["Why was my answer wrong?","Can you show me another way?","I still don’t get it."]
    :S.result==="right"?["Why does this work?","Give me a harder one to think about."]
    :["What is this question asking?","Give me a hint.","What should I do first?"];
  return `<div class="card chat pop" aria-label="Chat with Scout">
   <div class="top"><h3>Ask Scout</h3><button class="ghost small" id="chat-x">Close</button></div>
   ${S.demo?`<p class="muted" style="font-size:.82rem;margin:0">${t("Demo: Scout answers from this question’s built-in steps. In a real class, Scout is a full AI tutor.")}</p>`:""}
   <div class="msgs" id="msgs" aria-live="polite">
    ${scout(t("Hi! I’m Scout. I can give you hints. Ask me anything about this question!"))}
    ${c.msgs.map((m,i)=>m.role==="user"?`<div class="me"><span>${esc(m.content)}</span></div>`:`${scout(esc(m.content)+(TTS?` <button class="link small sayc" data-i="${i}" aria-label="Read this to me">🔊</button>`:""))}`).join("")}
    ${c.busy?scout('<span class="dotty" aria-label="Scout is thinking"><i></i><i></i><i></i></span>'):""}
   </div>
   ${c.err?`<p class="err" role="alert">${esc(c.err)}</p>`:""}
   <div class="row">${chips.map(x=>`<button class="ghost small chip" ${c.busy?"disabled":""}>${esc(t(x))}</button>`).join("")}</div>
   <form id="chat-f" class="row"><input id="chat-in" maxlength="300" placeholder="Type your question" autocomplete="off" style="flex:1;min-width:160px;font:inherit;color:var(--ink);background:var(--paper);border:2px solid var(--rule);border-radius:10px;padding:10px 12px" aria-label="Your question for Scout"><button type="submit" ${c.busy?"disabled":""}>Send</button></form>
  </div>`;
}
function wireChat(){
  const ask=document.getElementById("ask");if(ask)ask.onclick=()=>{S.chat={open:true,msgs:[],busy:false};render();document.getElementById("chat-in")?.focus()};
  if(!S.chat||!S.chat.open)return;
  document.getElementById("chat-x").onclick=()=>{S.chat.open=false;render()};
  app.querySelectorAll(".chip").forEach(b=>b.onclick=()=>sendChat(b.textContent));
  app.querySelectorAll(".sayc").forEach(b=>b.onclick=()=>{stopPlay();speak(S.chat.msgs[+b.dataset.i].content)});
  document.getElementById("chat-f").onsubmit=e=>{e.preventDefault();const v=document.getElementById("chat-in").value.trim();if(v)sendChat(v)};
  const m=document.getElementById("msgs");if(m)m.scrollTop=m.scrollHeight;
}
async function sendChat(text){
  const c=S.chat;if(c.busy)return;c.msgs.push({role:"user",content:text});c.busy=true;c.err="";render();
  if(S.demo){await new Promise(r=>setTimeout(r,700));c.msgs.push({role:"assistant",content:demoScoutReply(text)});c.busy=false;if(S.screen==="practice"&&S.chat===c){render();document.getElementById("chat-in")?.focus()}return}
  const q=S.q,k=SKILLS.find(x=>x.id===S.k);
  const qd={parts:q.parts.map(p=>p.img?{img:1,alt:ALT[p.img]||"a picture from the test"}:p.viz?{fig:vizText(p.viz)}:p),choices:(q.choices||[]).map(ch=>ch&&ch.img?{alt:(ALT[ch.img]||"a picture").replace(/^Choice [A-E]: /,""),eq:ch.eq}:ch),
    ans:q.type==="matrix"?q.rows.map(r=>`${r.n} → ${r.a}`).join(", "):q.ans,type:q.type,steps:q.steps,std:k&&k.std,skillName:k&&k.name};
  if(q.type==="matrix")qd.parts=[...q.parts,"Rows: "+q.rows.map(r=>r.n).join(", ")+". Columns: "+q.cols.join(", ")];
  try{const d=await api("tutor",{q:qd,testId:TESTID,picked:S.sel.join(" and "),result:S.result,messages:c.msgs,grade:ACT?.grade||"3",lang:S.lang});
    c.msgs.push({role:"assistant",content:d.reply})}
  catch(e){c.err=e.message;c.msgs.pop()}
  c.busy=false;if(S.screen==="practice"&&S.chat===c){render();document.getElementById("chat-in")?.focus()}
}

function practice(){
  const s=S.student,p=s.prog,k=SKILLS.find(x=>x.id===S.k),sk=p.skills[k.id],q=S.q,MASTERY=MAST();
  const nKeys=q.keys.length,found=foundKeys(q,S.hl).size;
  let below="";
  if(S.step===1&&pfOn(q)) below=pfCard(q);
  else if(S.step===1&&roOn(q)) below=roCard(q);
  else if(S.step===1&&planOn(q)) below=planCard(q);
  else if(S.step===1) below=`<div class="card pop"><p class="note">${subjOf(gradeOf())!=="math"?clueTip(q):t("Step 1: Tap your key words. Highlight the numbers and the words that tell you what to do.")}</p>
     <div class="row"><button id="done1" ${qHl()<2?'disabled':''}>${t("I found my key words")}</button><span class="muted">${qHl()} ${S.lang==="es"?"marcadas":"highlighted"}${S.hl.size>qHl()?(S.lang==="es"?` en la pregunta · ${S.hl.size-qHl()} en el pasaje`:` in the question · ${S.hl.size-qHl()} in the passage`):""}</span>${kwMode()==="optional"?`<button class="ghost small" id="kw-skip">${t("Skip to answering")}</button>`:""}</div></div>`;
  else below=`<div class="card pop">
     ${S.step===2&&!S.result?`${S.kwSkip?"":`<div class="fb info"><p><b>You found ${found} of ${nKeys} key words.</b> ${found<nKeys?'The wavy lines show the ones you missed. Read them again.':'Great reading!'}</p></div>`}
     ${S.bare&&S.step===2&&!S.result?`<p class="muted small">${S.lang==="es"?"Problema corto: no hace falta marcar palabras clave.":(S.kwFade?"You know this skill well: no key words needed this time.":"Quick problem: no key words needed this time.")}</p>`:""}<p class="note">${t(isELA(gradeOf())?"Step 2: Answer it. Go back to the passage or the sentence, then choose.":isSci(gradeOf())?"Step 2: Answer it. Think about what you know, then choose.":"Step 2: Solve it. Work it out with your pencil, then answer.")}</p>`:''}
     ${planNote()}${answerArea(q)}${S.result?feedback(q):helpCard(q)}</div>`;
  app.innerHTML=header(`${langToggle()}${lbBtn()}<button class="ghost" id="back">${t("My trail")}</button>`)+`
   <div class="row" style="justify-content:space-between"><span class="label">${S.rev?`<span class="pill purple">${t(S.rvKind?"Check-up":"Review")}</span> `:""}${esc(k.std)} · ${esc(k.name)}</span>
    ${S.rev?"":`<span class="flags" aria-label="Checkpoint progress: ${sk.streak} of ${MASTERY} stars"><span class="muted" style="font-size:.85rem;margin-right:4px">${t("Checkpoint")}</span>${Array.from({length:MASTERY},(_,i)=>`<i class="${i<sk.streak?'on':''}">${i<sk.streak?'★':i+1}</i>`).join("")}</span>`}</div>
   <div class="steps-bar"><span class="on"></span><span class="${S.step>1?'on':''}"></span><span class="${S.result?'on':''}"></span></div>
   ${S.lang==="es"&&subjOf(gradeOf())!=="math"?`<p class="muted small" lang="es">Las preguntas y los textos de ${isELA(gradeOf())?"lectura":"ciencias"} están en inglés, como en el examen estatal. Las instrucciones, Chirp y la ayuda de Scout están en español.</p>`:""}
   <div class="notebook ${S.step>1?'ro':''}"><div class="row" style="justify-content:space-between"><span class="label">${S.q&&S.q._ea?`<span class="pill purple">${t("Think deeper")}</span> `:""}${S.rev?t(S.rvKind?"Check-up: on your own":"Review question"):t(qLabel(S.qid).replace(/ #\d+$/,""))+(qLabel(S.qid).match(/ #\d+$/)||[""])[0]}</span><div class="row">${sayBtn("say-q",t("🔊 Read to me"))}<button class="ghost small" id="rep-btn" title="Report a problem" aria-label="Report a problem with this question">🚩</button></div></div>${bodyHTML(q,S.hl,S.step===1?"tap":S.kwSkip?"plain":"check")}</div>${hsToolsBar()}${reportBox()}${below}${chatHTML()}${lbHTML()}`;
  document.getElementById("back").onclick=()=>{stopPlay();S.screen="home";render()};
  wireChat();wireReport();wireLang();wireHsTools();roMark();wireLook();wireHelp(q);
  const sq=document.getElementById("say-q"); if(sq) sq.onclick=()=>{stopPlay();speak(S.step===1?q.parts.map(p=>typeof p==="string"?p:p.eq||p.fig||"").join(". "):qSpeech(q))};
  if(sq&&accOn("read")&&S.accReadQ!==S.qid){S.accReadQ=S.qid;setTimeout(()=>sq.click(),300)} /* accommodation: read every question aloud */
  if(S.step===1&&pfOn(q)){wirePf(q);return}
  if(S.step===1&&roOn(q)){wireRo(q);return}
  if(S.step===1&&planOn(q)){wirePlan(q);return}
  if(S.step===1){
    app.querySelectorAll(".tok").forEach(el=>{const f=()=>{const i=+el.dataset.t;S.hl.has(i)?S.hl.delete(i):S.hl.add(i);
      /* keep the passage box and the page where they were */
      const ps=app.querySelector(".passage"),pst=ps?ps.scrollTop:0,wy=window.scrollY;render();const ps2=app.querySelector(".passage");if(ps2)ps2.scrollTop=pst;window.scrollTo(0,wy);
      if(+el.dataset.t>=100000){const again=app.querySelector(`.tok[data-t="${el.dataset.t}"]`);if(again)again.focus({preventScroll:true})}};el.onclick=f;el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f()}}});
    document.getElementById("done1").onclick=()=>{if(q.keys.length&&foundKeys(q,S.hl).size===q.keys.length)p.kwAll=(p.kwAll||0)+1;S.step=2;S.kwSkip=false;S.shownAt=Date.now();render()};
    const ks=document.getElementById("kw-skip");if(ks)ks.onclick=()=>{S.step=2;S.kwSkip=true;S.shownAt=Date.now();render()};return;
  }
  if(!S.result){
    if(q.type==="mc"){app.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{S.sel=[b.dataset.l];render()});
      document.getElementById("check").onclick=()=>grade(q)}
    if(q.type==="multi"){app.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{const l=b.dataset.l;S.sel=S.sel.includes(l)?S.sel.filter(x=>x!==l):[...S.sel,l].slice(-2);render()});
      document.getElementById("check").onclick=()=>grade(q)}
    if(q.type==="input"){const n=document.getElementById("num");n.oninput=()=>S.sel=[n.value.trim()];n.onkeydown=e=>{if(e.key==="Enter"&&n.value.trim())grade(q)};
      document.getElementById("check").onclick=()=>{if(n.value.trim())grade(q)}}
    if(q.type==="matrix"){app.querySelectorAll(".matrix input").forEach(r=>r.onchange=()=>{const i=+r.name.slice(1);S.sel[i]=r.value;render()});
      document.getElementById("check").onclick=()=>grade(q)}
  } else wireFeedback(q);
}
SCREENS.practice=practice;


/* ---------- 3 Before Me: a help ladder before the teacher (watch it solved → hint → Scout → teacher) ---------- */
const LE=(en,es)=>S.lang==="es"?es:en;
/* high school: pick an area to work on first (the teacher's assigned standards still come first) */
function focusCard(s){if(!focusOK())return"";const p=s.prog,doms=[];for(const k of SKILLS){const d=focusDom(k.std);if(d&&!doms.includes(d)&&p.skills[k.id]&&p.skills[k.id].status!=="off")doms.push(d)}if(doms.length<2)return"";
  const nm=d=>FOCUS_NAME[d]?LE(FOCUS_NAME[d][0],FOCUS_NAME[d][1]):/^L\d$/.test(d)?LE("Level ","Nivel ")+d.slice(1):d,left=d=>SKILLS.filter(k=>focusDom(k.std)===d&&p.skills[k.id]&&p.skills[k.id].status==="todo").length,cur=p.focus||"";
  return `<details class="focus" ${cur?"":"open"} style="margin:.5rem 0"><summary><b>🎯 ${LE("Choose your focus","Escoge tu enfoque")}</b> <span class="muted small">${cur?LE("Working on: ","Trabajando en: ")+esc(nm(cur)):LE("Pick what you want to practice first, or keep the full trail.","Escoge qué quieres practicar primero o sigue el camino completo.")}</span></summary>
   <div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px">${doms.map(d=>`<button class="${d===cur?"":"ghost"} small" data-focus="${esc(d)}" ${left(d)?"":"disabled"}>${esc(nm(d))} <span class="muted small">(${left(d)} ${LE("left","faltan")})</span></button>`).join("")}<button class="${cur?"ghost":""} small" data-focus="">${LE("Full trail","Camino completo")}</button></div></details>`}
/* when a class moves to a new trail, show students that their earlier mastered skills still count */
function carriedNote(p){if(!p||!p.carried)return"";const n=Object.values(p.skills||{}).filter(x=>x&&x.carried&&(x.status==="done"||x.status==="skip")).length;if(!n)return"";
  return `<p class="small" style="margin:.4rem 0;background:var(--hl);color:var(--hl-ink);border-radius:10px;padding:6px 10px">⭐ ${LE(`${n} ${n===1?"skill already counts":"skills already count"} from your earlier trail. Nice work!`,`${n} ${n===1?"destreza ya cuenta":"destrezas ya cuentan"} de tu camino anterior. ¡Buen trabajo!`)}</p>`}
function wtSibling(){const sk=S.student.prog.skills[S.k];if(!sk)return null;topUp(sk,S.k);
  const id=(sk.queue||[]).find(x=>x!==S.qid&&x[0]!=="!"&&getQ(x)&&getQ(x).steps&&getQ(x).steps.length>1);return id?wtFrame(viewQ(getQ(id))):null}

/* ---------- Watch it solved: think-aloud bookends ----------
   Every walkthrough starts with "What is it asking? What's my plan?" and ends with "Check it" and "Your turn",
   so kids hear the same problem-solving routine every time. The question's own steps stay in the middle. */
const WT_PLAN={
 "3.OA.1":["I see equal groups, so I think: how many groups, and how many in each group?","Veo grupos iguales. Pienso: ¿cuántos grupos hay y cuántos hay en cada grupo?"],
 "3.OA.2":["Something is being shared or split equally, so this is division.","Algo se reparte en partes iguales, así que es división."],
 "3.OA.3":["I find what I know and what I need. Then I decide: equal groups means multiply or divide.","Busco lo que sé y lo que necesito. Grupos iguales: multiplico o divido."],
 "3.OA.4":["There is a missing number. I think: what number makes the equation true?","Falta un número. Pienso: ¿qué número hace que la igualdad sea verdadera?"],
 "3.OA.5":["I look for a property that makes this easier, like switching the order or breaking a number apart.","Busco una propiedad que lo haga más fácil, como cambiar el orden o separar un número."],
 "3.OA.6":["Division is a multiplication fact with a missing factor. I think of the times fact.","La división es una multiplicación con un factor que falta. Pienso en la tabla."],
 "3.OA.7":["I use a fact I know, skip count, or use the opposite operation.","Uso una tabla que sé, cuento de tanto en tanto o uso la operación opuesta."],
 "3.OA.8":["This takes two steps. I solve the first part, then use that answer for the second part.","Esto tiene dos pasos. Resuelvo la primera parte y uso esa respuesta para la segunda."],
 "3.OA.9":["I look at how the numbers change each time to find the rule.","Miro cómo cambian los números cada vez para encontrar la regla."],
 "3.NBT.1":["I find the two tens or hundreds the number is between, then see which one is closer.","Busco las dos decenas o centenas entre las que está el número y veo cuál está más cerca."],
 "3.NBT.2":["I line up the places: ones under ones, tens under tens, hundreds under hundreds.","Alineo los valores: unidades con unidades, decenas con decenas, centenas con centenas."],
 "3.NBT.3":["I think of the multiple of 10 as tens, like 40 is 4 tens.","Pienso en el múltiplo de 10 como decenas: 40 son 4 decenas."],
 "3.NF.1":["The bottom number is how many equal parts. The top number is how many parts I'm counting.","El número de abajo dice cuántas partes iguales hay. El de arriba, cuántas cuento."],
 "3.NF.2a":["I count the equal spaces from 0 to 1. That tells me the size of each jump.","Cuento los espacios iguales de 0 a 1. Eso me dice el tamaño de cada salto."],
 "3.NF.2b":["I count the equal spaces from 0 to 1, then count the jumps to the point.","Cuento los espacios iguales de 0 a 1 y luego cuento los saltos hasta el punto."],
 "3.NF.3a":["Equivalent fractions cover the same amount of the same whole. I compare the shaded parts.","Las fracciones equivalentes cubren la misma cantidad del mismo entero. Comparo las partes sombreadas."],
 "3.NF.3b":["I can cut each part into smaller equal pieces. The amount stays the same.","Puedo cortar cada parte en pedazos iguales más pequeños. La cantidad no cambia."],
 "3.NF.3c":["A whole number can be written as a fraction. I think: how many parts make the wholes?","Un número entero se puede escribir como fracción. Pienso: ¿cuántas partes forman los enteros?"],
 "3.NF.3d":["I check: are the wholes the same? Then I compare the tops or the bottoms.","Reviso: ¿los enteros son iguales? Luego comparo los números de arriba o de abajo."],
 "3.MD.1":["I read the hour hand first, then count the minutes by 5s and 1s.","Leo primero la manecilla de la hora y luego cuento los minutos de 5 en 5 y de 1 en 1."],
 "3.MD.2":["I think about how heavy it is or how much it holds, and read any scale carefully.","Pienso en cuánto pesa o cuánto le cabe, y leo con cuidado cualquier escala."],
 "3.MD.3":["I find what each line or picture on the graph is worth before I read it.","Busco cuánto vale cada línea o dibujo de la gráfica antes de leerla."],
 "3.MD.4":["I line the object up at 0 and count the marks carefully.","Alineo el objeto con el 0 y cuento las marcas con cuidado."],
 "3.MD.5a":["Area is how many unit squares cover a shape.","El área es cuántos cuadrados de unidad cubren una figura."],
 "3.MD.5b":["I count the unit squares that cover the shape, with no gaps or overlaps.","Cuento los cuadrados de unidad que cubren la figura, sin huecos ni encimados."],
 "3.MD.6":["I count each square unit one time.","Cuento cada unidad cuadrada una sola vez."],
 "3.MD.7a":["Tiles in rows and columns make an array, so I can multiply instead of counting each one.","Las fichas en filas y columnas forman un arreglo, así que puedo multiplicar en vez de contar."],
 "3.MD.7b":["Area of a rectangle is length times width.","El área de un rectángulo es largo por ancho."],
 "3.MD.7c":["I can break the rectangle into two smaller rectangles and add their areas.","Puedo partir el rectángulo en dos más pequeños y sumar sus áreas."],
 "3.MD.7d":["I split the shape into rectangles, find each area, then add.","Divido la figura en rectángulos, busco cada área y luego sumo."],
 "3.MD.8":["Perimeter is the distance all the way around, so I add every side.","El perímetro es la distancia alrededor, así que sumo todos los lados."],
 "3.G.1":["I look at the sides and corners. How many? Are any equal or square?","Miro los lados y las esquinas. ¿Cuántos hay? ¿Hay iguales o rectos?"],
 "3.G.2":["The parts must be equal. I count the equal parts to name each one.","Las partes deben ser iguales. Cuento las partes iguales para nombrar cada una."]};
const WT_CHECK={
 "3.OA.1":["I count the groups again and how many are in one group.","Cuento otra vez los grupos y cuántos hay en un grupo."],
 "3.OA.2":["I multiply back. My answer times the number of groups should make the total.","Multiplico para comprobar. Mi respuesta por el número de grupos debe dar el total."],
 "3.OA.3":["I reread the question. Does my answer make sense with the story?","Leo otra vez la pregunta. ¿Mi respuesta tiene sentido con la historia?"],
 "3.OA.4":["I put my number in the box and read the equation. Is it true?","Pongo mi número en el cuadro y leo la igualdad. ¿Es verdadera?"],
 "3.OA.5":["Both ways should give the same answer.","Las dos formas deben dar la misma respuesta."],
 "3.OA.6":["I multiply my answer by the divisor. I should get the number I started with.","Multiplico mi respuesta por el divisor. Debo obtener el número del principio."],
 "3.OA.7":["I check with the opposite operation.","Compruebo con la operación opuesta."],
 "3.OA.8":["I estimate. Is my answer close to what I expected?","Estimo. ¿Mi respuesta está cerca de lo que esperaba?"],
 "3.OA.9":["I test the rule on the numbers I already have.","Pruebo la regla con los números que ya tengo."],
 "3.NBT.1":["The halfway number goes up. Is my number past halfway?","El número de la mitad sube. ¿Mi número pasó la mitad?"],
 "3.NBT.2":["I estimate by rounding. Is my answer close?","Estimo redondeando. ¿Mi respuesta está cerca?"],
 "3.NBT.3":["Counting tens, my answer should end in 0.","Si cuento decenas, mi respuesta debe terminar en 0."],
 "3.NF.1":["The bottom number matches all the equal parts.","El número de abajo es igual a todas las partes iguales."],
 "3.NF.2a":["Each jump is the same size.","Cada salto es del mismo tamaño."],
 "3.NF.2b":["I count the jumps one more time.","Cuento los saltos una vez más."],
 "3.NF.3a":["Same whole and same amount shaded means equivalent.","Mismo entero y misma cantidad sombreada: son equivalentes."],
 "3.NF.3b":["More pieces, but the same amount.","Más pedazos, pero la misma cantidad."],
 "3.NF.3c":["The top divided by the bottom gives the whole number.","Arriba entre abajo da el número entero."],
 "3.NF.3d":["Bigger pieces or more pieces means a bigger fraction.","Pedazos más grandes o más pedazos: la fracción es mayor."],
 "3.MD.1":["The hour hand should be just past the hour I said.","La manecilla de la hora debe estar un poco después de la hora que dije."],
 "3.MD.2":["Does my answer make sense for the real object?","¿Mi respuesta tiene sentido para el objeto real?"],
 "3.MD.3":["I check the scale and read the bar again.","Reviso la escala y leo la barra otra vez."],
 "3.MD.4":["It started at 0, so I read the end again.","Empezó en 0, así que leo el final otra vez."],
 "3.MD.5a":["Area is always in square units.","El área siempre es en unidades cuadradas."],
 "3.MD.5b":["I count again and touch each square once.","Cuento otra vez y toco cada cuadrado una vez."],
 "3.MD.6":["I count again in a different order.","Cuento otra vez en otro orden."],
 "3.MD.7a":["Rows times columns should equal counting every tile.","Filas por columnas debe ser igual a contar cada ficha."],
 "3.MD.7b":["Area is in square units, like square inches.","El área es en unidades cuadradas, como pulgadas cuadradas."],
 "3.MD.7c":["The two parts together make the whole rectangle.","Las dos partes juntas forman todo el rectángulo."],
 "3.MD.7d":["I made sure no part was counted twice.","Me aseguré de no contar ninguna parte dos veces."],
 "3.MD.8":["I counted every side once, all the way around.","Conté cada lado una vez, todo alrededor."],
 "3.G.1":["I count the sides again with my finger.","Cuento otra vez los lados con el dedo."],
 "3.G.2":["Are all the parts the same size?","¿Todas las partes son del mismo tamaño?"]};
/* grades 4 and up: one plan and one check per math area (standard-by-standard lines can come later) */
const WT_DOM={OA:["I figure out what I know and what I need, then choose the operation.","Veo lo que sé y lo que necesito, y escojo la operación."],
 NBT:["I think about place value. Each place is 10 times the place to its right.","Pienso en el valor posicional. Cada lugar vale 10 veces el de su derecha."],
 NF:["I think about the whole and the equal parts. Do the fractions need the same denominator?","Pienso en el entero y en las partes iguales. ¿Necesitan las fracciones el mismo denominador?"],
 MD:["I find what is being measured and the units, then pick the formula or strategy.","Busco qué se mide y en qué unidades, y escojo la fórmula o estrategia."],
 G:["I look closely at the shape: sides, angles and any measurements. I can sketch it.","Miro bien la figura: lados, ángulos y medidas. Puedo dibujarla."],
 RP:["I look for the two quantities being compared. A ratio table or unit rate can help.","Busco las dos cantidades que se comparan. Una tabla de razones o la tasa unitaria puede ayudar."],
 NS:["I think about the signs and the number line, and which operation to use.","Pienso en los signos, la recta numérica y qué operación usar."],
 EE:["I find the unknown, write it as a variable, and keep the equation balanced.","Busco la incógnita, la escribo como variable y mantengo la ecuación en equilibrio."],
 F:["I look at how the output changes when the input changes.","Miro cómo cambia la salida cuando cambia la entrada."],
 SP:["I read the data carefully and think about what the question asks: center, spread or chance?","Leo los datos con cuidado y pienso qué me pide: centro, dispersión o probabilidad."]};
const WT_DCHECK={OA:["I check with the opposite operation.","Compruebo con la operación opuesta."],NBT:["I estimate. Is my answer close?","Estimo. ¿Mi respuesta está cerca?"],NF:["I estimate with benchmarks like 0, one half and 1. Does my answer make sense?","Estimo con 0, un medio y 1. ¿Tiene sentido mi respuesta?"],
 MD:["I check the units and estimate. Is the size reasonable?","Reviso las unidades y estimo. ¿Es razonable el tamaño?"],G:["I check my answer against the picture. Does it fit?","Comparo mi respuesta con el dibujo. ¿Encaja?"],RP:["I check that both quantities were multiplied or divided by the same number.","Reviso que las dos cantidades se multiplicaron o dividieron por el mismo número."],
 NS:["I check the sign. Should the answer be positive or negative?","Reviso el signo. ¿La respuesta debe ser positiva o negativa?"],EE:["I put my answer back into the equation. Is it true?","Pongo mi respuesta en la ecuación. ¿Es verdadera?"],F:["I test my answer with one input from the problem.","Pruebo mi respuesta con una entrada del problema."],SP:["I reread the question. Does my answer use the right data?","Leo otra vez la pregunta. ¿Mi respuesta usa los datos correctos?"]};
function wtStd(q){let c=(SKILLS.find(k=>k.id===S.k)||{}).std||"";if(!/\./.test(c)){const L=LIB.find(x=>x.gen===(c||q.skill));c=L?L.code:c}return c}
function wtPic(q){const p=(q.parts||[]).find(x=>x&&typeof x==="object"&&(x.viz||x.img||x.svg||x.shape||x.poly||x.work||x.nl||x.groups||x.arr||x.table));if(!p)return null;const {alt,...rest}=p;return rest}
function wtFrame(q){if(!q||!q.steps)return q;const c=wtStd(q),T=a=>a?LE(a[0],a[1]):"",dom=(c.match(/^\d\.([A-Z]+)/)||[])[1];
  const plan=T(WT_PLAN[c]||WT_DOM[dom]),chk=T(WT_CHECK[c]||WT_DCHECK[dom]),core=q.steps.map(x=>({...x})),hasPic=core.some(x=>x.show),pic=wtPic(q),out=[];
  if(!/^(what do|read|key words|first)/i.test(core[0].say||""))out.push({say:LE("First I ask: what is it asking me to find? ","Primero me pregunto: ¿qué me pide encontrar? ")+plan,...(pic&&!core[0].show?{show:pic}:{})});
  else if(!hasPic&&pic)core[0].show=pic;
  out.push(...core);
  if(chk&&!/check|comprueb/i.test(core[core.length-1].say||""))out.push({say:LE("Check it: ","Lo compruebo: ")+chk});
  out.push({say:LE("Your turn! Use the same steps on your problem.","¡Te toca! Usa los mismos pasos en tu problema.")});
  return {...q,steps:out}}
function helpTried(){const p=S.student.prog,sk=p.skills[S.k];if(sk&&sk.redo===S.qid)return true;return (p.recent||[]).slice(-12).some(r=>r.k===S.k&&!r.ok)}
function helpOK(){return S.role==="student"&&!S.result&&S.step>=1&&!(S.rev&&S.rvKind)&&(helpTried()||!!S.help)}
function hlUnlock(lvl,ms){const qid=S.qid;setTimeout(()=>{if(S.help&&S.qid===qid&&S.help.lvl<lvl){S.help.lvl=lvl;if(S.screen==="practice"){const y=scrollY;render();scrollTo(0,y)}}},ms)}
function helpHint(q){const st=q.steps||[];return st.length>=2?LE("Start here: ","Empieza así: ")+st[0].say:LE("Read the question again. What is it asking you to find?","Lee la pregunta otra vez. ¿Qué te pide encontrar?")}
function helpCard(q){if(!helpOK())return"";const H=S.help;
  if(!H)return `<div class="row"><button class="ghost" id="hl-open">✋ ${LE("I’m stuck","Estoy atorado/a")}</button></div>`;
  const W=S.wt,done=H.used,scoutOK=tutorOn(),sentScout=!!(S.chat&&S.chat.msgs&&S.chat.msgs.some(m=>m.role==="user"));
  if(scoutOK&&sentScout&&H.lvl<4)H.lvl=4;
  const step=(n,ico,title,body,on)=>`<li class="hl-step ${H.lvl>=n?"open":"locked"} ${done[n]?"used":""}"><div class="hl-h"><span class="hl-n" aria-hidden="true">${done[n]?"✓":n}</span><b>${ico} ${title}</b>${H.lvl<n?`<span class="muted small">🔒 ${LE("unlocks soon","se abre pronto")}</span>`:""}</div>${H.lvl>=n&&on?`<div class="hl-b">${body}</div>`:""}</li>`;
  let w="";
  if(W&&W.q){const st=W.q.steps;let show="";W.picAt=-1;for(let i=W.r;i>=0;i--){if(st[i].show){show=showHTML(st[i].show);W.picAt=i;break}}
    w=`<p class="muted small" style="margin:0">${LE("A problem like yours:","Un problema como el tuyo:")}</p><p class="wt-q">${esc(qSpeech(W.q).replace(/([?!.])\.+/g,"$1"))}</p>${show?`<div class="stage ${W.picAt===W.r?"wt-new":""}">${show}</div>`:""}<p class="say wt-say">${fmt(st[W.r].say)}</p>
     <div class="row"><span class="wt-dots" aria-label="${LE("Step","Paso")} ${W.r+1} / ${st.length}">${st.map((_,i)=>`<i class="${i<W.r?"done":i===W.r?"on":""}"></i>`).join("")}</span><span class="muted small">${LE("Step","Paso")} ${W.r+1} / ${st.length}</span><button class="ghost small" id="wt-play">${W.playing?LE("Pause","Pausa"):W.r>=st.length-1?LE("↺ Watch again","↺ Ver otra vez"):LE("▶ Play","▶ Reproducir")}</button></div>`}
  else if(!W)w=`<button class="small" id="wt-go">🎬 ${LE("Watch it solved","Míralo resuelto")}</button>`;
  else w=`<p class="muted">${LE("No walkthrough for this one. Try the hint!","No hay video para esta. ¡Prueba la pista!")}</p>`;
  const hint=done[2]?`<p class="say">${fmt(helpHint(q))}</p>${sayBtn("hl-say","🔊 "+LE("Read it to me","Léemelo"))}`:`<button class="small" id="hl-hint">💡 ${LE("Show me a hint","Muéstrame una pista")}</button>`;
  const scoutB=scoutOK?(done[3]?`<p class="muted small" style="margin:0">${LE("Scout is open below. Ask a question!","Scout está abierto abajo. ¡Hazle una pregunta!")}</p>`:`<button class="small" id="hl-scout">🐦 ${LE("Ask Scout","Pregúntale a Scout")}</button>`):`<p class="muted small" style="margin:0">${LE("Scout is off right now. Reread the hint and try your best.","Scout está apagado. Lee la pista otra vez y haz tu mejor esfuerzo.")}</p>`;
  const teach=S.hand?`<div class="fb info"><p><b>✋ ${LE("Your teacher knows you need help.","Tu maestro/a sabe que necesitas ayuda.")}</b> ${LE("Keep trying while you wait!","¡Sigue intentando mientras esperas!")}</p></div>`:`<button class="small" id="hl-hand">✋ ${LE("Ask my teacher","Pedirle ayuda a mi maestro/a")}</button>`;
  return `<div class="card hl pop" aria-label="${LE("Help ladder","Escalera de ayuda")}"><div class="top"><h3 style="margin:0">✋ ${LE("3 Before Me","3 antes de mí")}</h3><button class="ghost small" id="hl-x">${LE("Close","Cerrar")}</button></div>
   <p class="muted small" style="margin:.2rem 0 .4rem">${LE("Try these in order. Each one helps you solve it yourself.","Prueba en orden. Cada una te ayuda a resolverlo tú solo/a.")}</p>
   <ol class="hl-list">${step(1,"🎬",LE("Watch it solved","Míralo resuelto"),w,1)}${step(2,"💡",LE("Get a hint","Una pista"),hint,1)}${step(3,"🐦",LE("Ask Scout","Pregúntale a Scout"),scoutB,1)}${step(4,"✋",LE("Ask my teacher","Pregúntale a tu maestro/a"),teach,1)}</ol></div>`}
function wtPlay(){const W=S.wt;if(!W||!W.playing)return;const y=scrollY;render();scrollTo(0,y);const qid=S.qid,next=()=>{if(!S.wt||!S.wt.playing||S.qid!==qid)return;if(W.r<W.q.steps.length-1){W.r++;wtPlay()}else{W.playing=false;S.help.used[1]=1;if(S.help.lvl<2)S.help.lvl=2;const y2=scrollY;render();scrollTo(0,y2)}};
  if(TTS)speak(W.q.steps[W.r].say,()=>{if(W.playing)timer=setTimeout(next,700)});else timer=setTimeout(next,5000)}
function wireHelp(q){const g=id=>document.getElementById(id),re=()=>{const y=scrollY;render();scrollTo(0,y)};
  const o=g("hl-open");if(o)o.onclick=()=>{stopPlay();S.help={lvl:1,used:{},at:Date.now()};S.wt=null;re()};
  if(!S.help)return;
  const x=g("hl-x");if(x)x.onclick=()=>{stopPlay();if(S.wt)S.wt.playing=false;S.helpClosed=S.help;S.help=null;re()};
  const go=g("wt-go");if(go)go.onclick=()=>{stopPlay();S.help.used[1]=1;const sq=wtSibling();S.wt={q:sq,r:0,playing:!!sq};if(!sq){S.help.used[1]=1;S.help.lvl=Math.max(S.help.lvl,2);re();return}hlUnlock(2,20000);S.playing=true;wtPlay()};
  const pl=g("wt-play");if(pl)pl.onclick=()=>{const W=S.wt;if(W.playing){W.playing=false;stopPlay();re();return}if(W.r>=W.q.steps.length-1)W.r=0;W.playing=true;S.playing=true;wtPlay()};
  const hb=g("hl-hint");if(hb)hb.onclick=()=>{stopPlay();if(S.wt)S.wt.playing=false;S.help.used[2]=1;if(tutorOn())hlUnlock(3,8000);else hlUnlock(4,8000);re();if(TTS)speak(helpHint(q))};
  const hs=g("hl-say");if(hs)hs.onclick=()=>{stopPlay();speak(helpHint(q))};
  const sc=g("hl-scout");if(sc)sc.onclick=()=>{stopPlay();S.help.used[3]=1;S.chat={open:true,msgs:[],busy:false};re();document.getElementById("chat-in")?.focus()};
  const hd=g("hl-hand");if(hd)hd.onclick=async()=>{const cd=(SB&&SB.cls&&+SB.cls.handCool||0)*60000,last=+(sessionStorage.getItem("ptp-hand-at")||0);if(cd&&Date.now()-last<cd){hd.textContent="⏳ "+LE(`You can ask again in ${Math.ceil((cd-(Date.now()-last))/60000)} min. Keep trying!`,`Puedes preguntar otra vez en ${Math.ceil((cd-(Date.now()-last))/60000)} min. ¡Sigue intentando!`);hd.disabled=true;return}busy(hd,"…");const k=SKILLS.find(z=>z.id===S.k)||{},U=S.help.used,tried=[U[1]&&"watched it solved",U[2]&&"used the hint",U[3]&&"asked Scout"].filter(Boolean);
    try{if(!S.demo)await api("handRaise",{std:k.std||"",kname:k.name||"",tried});S.help.used[4]=1;S.hand=true;try{sessionStorage.setItem("ptp-hand-at",Date.now())}catch(e){}re()}catch(e){hd.disabled=false;hd.textContent=e.message}};
}
function helpRecord(p){const H=S.help||S.helpClosed;if(!H||!Object.keys(H.used).length)return;const rl=p.recent&&p.recent[p.recent.length-1];if(rl)rl.h=1;const d=dayKey(),h=(p.help3=p.help3||{}),x=h[d]||(h[d]={stuck:0,self:0,teacher:0});x.stuck++;S.hand?x.teacher++:x.self++;
  const ks=Object.keys(h).sort();if(ks.length>60)ks.slice(0,ks.length-60).forEach(k=>delete h[k]);
  if(S.hand&&!S.demo)api("handLower",{}).catch(()=>{});S.hand=false}
/* teacher: live Hands up list (checks every 30 seconds, only while this page is open and on screen) */
let handT=null;
function handsCard(){if((S.demo||DEMO_T)&&(!S.hands||S.hands.cid!==CUR.cls.id)){const st=CUR.students;S.hands={cid:CUR.cls.id,list:st.length>2?[{sid:st[1].id,name:st[1].name,kname:"Rounding to the nearest 10 and 100",tried:["watched it solved","used the hint","asked Scout"],at:Date.now()-3*60000},{sid:st[2].id,name:st[2].name,kname:"Area by tiling and multiplying",tried:["watched it solved","used the hint"],at:Date.now()-60000}]:[]}}
  const L=(S.hands&&S.hands.cid===CUR.cls.id)?S.hands.list:[];const wk=Date.now()-7*864e5;let self=0,tch=0;
  CUR.students.forEach(s=>Object.entries(s.prog.help3||{}).forEach(([d,x])=>{if(new Date(d+"T12:00:00").getTime()>=wk){self+=x.self||0;tch+=x.teacher||0}}));
  if((S.demo||DEMO_T)&&!self&&!tch){self=37;tch=6} /* sample school numbers */
  return `<div class="card" id="hands"><div class="top"><h2 style="margin:0">✋ Hands up ${L.length?`<span class="pill gold">${L.length}</span>`:""}</h2><span class="muted small">${S.demo||DEMO_T?"Sample school":"Updates every 30 seconds"}</span></div>
   ${L.length?`<ul class="hands">${L.map(h=>`<li><b>${esc(h.name)}</b> · ${esc(h.kname||h.std)} <span class="muted small">· ${Math.max(1,Math.round((Date.now()-h.at)/60000))} min · ${h.tried&&h.tried.length?esc(h.tried.join(", ")):"went straight to you"}</span> <button class="ghost small" data-hdone="${esc(h.sid)}">Done</button></li>`).join("")}</ul>`:`<p class="muted" style="margin:.3rem 0">No hands up. Students try “3 Before Me” first: watch it solved, a hint, then Scout.</p>`}
   ${(()=>{const lean=CUR.students.map(s=>{const r=(s.prog.recent||[]).slice(-10);const h=r.filter(x=>x.h).length;let asks=0;Object.entries(s.prog.help3||{}).forEach(([d,x])=>{if(new Date(d+"T12:00:00").getTime()>=wk)asks+=x.teacher||0});return {s,h,n:r.length,asks}}).filter(x=>x.n>=6&&x.h>x.n/2);
     return lean.length?`<p class="small" style="margin:.4rem 0 0"><b>Leans on help:</b> ${lean.map(x=>`${esc(x.s.name)} (help on ${x.h} of last ${x.n}${x.asks?`, asked you ${x.asks}×`:""})`).join(", ")}. <span class="muted">They may need a quick small group with you.</span></p>`:""})()}
   <p class="small" style="margin:.4rem 0 0"><b>Hands saved this week:</b> ${self} time${self===1?"":"s"} students got unstuck on their own · ${tch} asked you</p></div>`}
async function pollHands(){if(S.tt!=="class"||!CUR||(S.tab||"class")!=="class"||document.visibilityState!=="visible"||!document.getElementById("hands")||S.demo||DEMO_T)return;
  try{const r=await api("handList",{classId:CUR.cls.id});const old=JSON.stringify(S.hands&&S.hands.list);S.hands={cid:CUR.cls.id,list:r.list};
    if(old!==JSON.stringify(r.list)){const el=document.getElementById("hands");if(el){el.outerHTML=handsCard();wireHandsBtns()}}}catch(e){}}
function wireHandsBtns(){app.querySelectorAll("[data-hdone]").forEach(b=>b.onclick=async()=>{if(S.demo||DEMO_T){S.hands.list=S.hands.list.filter(h=>h.sid!==b.dataset.hdone);const el=document.getElementById("hands");if(el){el.outerHTML=handsCard();wireHandsBtns()}return}busy(b,"…");try{const r=await api("handDone",{classId:CUR.cls.id,sid:b.dataset.hdone});S.hands={cid:CUR.cls.id,list:r.list};const el=document.getElementById("hands");if(el){el.outerHTML=handsCard();wireHandsBtns()}}catch(e){b.textContent=e.message}})}
function wireHands(){wireHandsBtns();if(!handT){handT=setInterval(pollHands,30000);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")pollHands()})}if(!S.hands||S.hands.cid!==CUR.cls.id)pollHands()}

function isRight(q){
  if(q.type==="mc")return S.sel[0]===q.ans;
  if(q.type==="multi")return S.sel.length===2&&q.ans.every(a=>S.sel.includes(a));
  if(q.type==="input")return Number(String(S.sel[0]).replace(/,/g,""))===Number(q.ans);
  return q.rows.every((r,i)=>S.sel[i]===r.a);
}
function grade(q){
  if(S.confAsk&&!S.conf&&!S.result){S.confPending=true;render();return} // ask how sure first
  const s=S.student,p=s.prog,k=SKILLS.find(x=>x.id===S.k),sk=p.skills[k.id],ok=isRight(q);confRecord(p,k,ok);dokRecord(p,q,ok);
  lbPush(q,ok,k);S.result=ok?"right":"wrong"; S.fast=(Date.now()-S.shownAt)<5000;
  const lg=p.log[S.qid]||(p.log[S.qid]={tries:0,right:0,first:null}); S.newBadges=[];
  if(ok&&lg.tries>lg.right) award(p,"persist"); // right on a question they missed before
  lg.tries++; if(ok)lg.right++; if(lg.first===null)lg.first=ok;
  if(ok) award(p,"first");
  (p.recent=p.recent||[]).push({k:k.id,q:S.qid,ok}); if(p.recent.length>30)p.recent.shift();
  p.last=Date.now();track(p,k.id,ok,Date.now()-(S.shownAt||Date.now()));helpRecord(p);if(S.wt)S.wt.playing=false;
  if(!ok){const from=q._from||{},pick=q.type==="mc"?from[S.sel[0]]||S.sel[0]:q.type==="multi"?S.sel.filter(l=>!q.ans.includes(l)).map(l=>from[l]||l).sort().join(""):q.type==="input"?String(Number(String(S.sel[0]).replace(/,/g,""))):"r"+q.rows.findIndex((r,j)=>S.sel[j]!==r.a);
    (p.miss=p.miss||[]).push({q:S.qid,k:k.id,p:pick,t:Date.now()});if(p.miss.length>80)p.miss.splice(0,p.miss.length-80)}
  if(S.rev){gradeReview(q,ok);if(ok)p.stars++;badgeTrack(p,k,sk,ok,false);chirpTick(ok);save();render();return}
  if(sk.queue[0]===S.qid)sk.queue.shift();
  S.fixed=false;const HU=(S.help||S.helpClosed||{}).used||{};S.assisted=ok&&!!(HU[1]||HU[2]);if(ok){if(!S.assisted)sk.streak++;p.stars++;if(sk.redo===S.qid){S.fixed=true;delete sk.redo}}
  else{sk.streak=Math.max(0,(sk.streak||0)-2);sk.redo=S.qid;topUp(sk,k.id,3);sk.queue.splice(3,0,S.qid)} /* a miss costs 2 stars, not all of them; the missed question comes back as a redemption */ // comes back after 3 other questions, with the choices in a new order
  S.mastered=ok&&sk.streak>=MAST();
  if(S.mastered){sk.status="done";sk.doneAt=Date.now();delete sk.reopen;p.stars+=5;award(p,"trail");if(!curSkill(s))award(p,"summit")} // counts right away, even if they leave this page
  badgeTrack(p,k,sk,ok,S.mastered);
  chirpTick(ok); save(); render();
}
function whyText(q){
  if(q.type==="mc")return fmt(q.why?.[S.sel[0]]||"Look at the breakdown below to see how to solve it.");
  if(q.type==="multi"){const wrong=S.sel.filter(l=>!q.ans.includes(l));const out=wrong.map(l=>`${l}: ${fmt(q.why?.[l]||"This one does not fit.")}`);
    if(S.sel.length<2)out.push("Remember to pick two answers.");if(!wrong.length)out.push("Check each choice again.");return out.join("<br>")}
  if(q.type==="input")return fmt((q.whyIn&&q.whyIn[String(Number(S.sel[0]))])||q.whyElse||"Look at the breakdown below to see how to solve it.");
  const i=q.rows.findIndex((r,j)=>S.sel[j]!==r.a);return fmt(q.rows[i].why);
}
function stepsPlayer(q){
  const steps=q.steps; let show="";for(let i=S.r;i>=0;i--){if(steps[i].show){show=showHTML(steps[i].show);break}}
  return `<div class="row" style="justify-content:space-between"><h3>${t("Watch the breakdown")}</h3><span class="muted">Step ${S.r+1} of ${steps.length}</span></div>
   ${show?`<div class="stage" aria-live="polite">${show}</div>`:''}<p class="say">${fmt(steps[S.r].say)}</p>
   <div class="row"><button class="ghost small" id="prev" ${S.r===0?'disabled':''}>Back</button><button class="ghost small" id="play">${S.playing?'Pause':TTS?'▶ Play and read':'▶ Play'}</button><button class="ghost small" id="fwd" ${S.r===steps.length-1?'disabled':''}>Next step</button>${sayBtn("say-step","🔊 Read this step")}</div>`;
}
function feedback(q){
  const sk=S.student.prog.skills[S.k],vid=db.videos[q.skill],MASTERY=MAST();
  const nb=(S.newBadges||[]).map(badgeInfo).map(b=>`<div class="newbadge pop"><span class="medal" aria-hidden="true">${b.m}</span>New badge: ${b.name}!</div>`).join("");
  if(S.rev&&S.result==="right") return `<div class="fb go"><p style="display:flex;align-items:center"><span class="burst" aria-hidden="true"></span><b>${t(S.evRes==="verified"?"Verified! You showed you can do this on your own.":S.evRes==="retained"?"You still know it weeks later. That’s locked in!":S.evRes==="progress"?"Right, on your own! One more check-up on this one to verify it.":"Yes! You still remember this one.")}</b>&nbsp;+1 ★</p>
     ${S.full?stepsPlayer(q):`<button class="ghost small" id="see" style="align-self:flex-start">${t("See the breakdown")}</button>`}<button id="next">${t("Next question")}</button></div>`;
  if(S.result==="right") return `<div class="fb go"><p style="display:flex;align-items:center"><span class="burst" aria-hidden="true"></span><b>${t("Yes! That’s right.")}</b>&nbsp;+1 ★</p>
     <p class="note" style="color:color-mix(in srgb,var(--go) 72%,var(--ink))">${S.assisted?`<b>${LE("Nice work using your help!","¡Buen trabajo usando tu ayuda!")}</b> ${LE("Now solve the next one on your own to move toward mastery.","Ahora resuelve la siguiente tú solo/a para avanzar al dominio.")}<br>`:""}${S.fixed?"<b>You fixed it! You won a star back.</b> ":""}${S.mastered?`That makes ${MASTERY} stars. You reached the checkpoint!`:`${CHEERS[(sk.streak+Object.keys(S.student.prog.log).length)%CHEERS.length]} ${MASTERY-sk.streak} more ★ to reach the checkpoint.`}</p>${S.mastered&&gameOn()?`<p class="note" style="color:color-mix(in srgb,var(--go) 72%,var(--ink))">🪙 ${t("You earned a game token! Spend it in the Game Arcade.")}</p>`:""}${nb}${confNote(true)}
     ${S.full?stepsPlayer(q):`<button class="ghost small" id="see" style="align-self:flex-start">${t("See the breakdown")}</button>`}
     <button id="next">${S.mastered?"See my badge":t("Next question")}</button></div>`;
  return `${scout(t(S.fast?"Whoa, that was fast! Did you work it out, or guess? Let’s slow down and learn from this one.":"Mistakes help us climb. Let’s learn from this one."))}
   ${S.rev?"":`<p class="note">This one cost 2 ★, but it will come back soon. Get it right to win a star back!</p>`}${confNote(false)}${S.reopened?`<div class="fb info"><p><b>Time for a refresh!</b> ${esc(SKILLS.find(x=>x.id===S.k)?.name||"")} is back on your trail for a little more practice.</p></div>`:""}
   <div class="fb oops"><p><b>${t("The answer is")} ${esc(ansText(q))}. ${t("Here’s what happened:")}</b></p><p>${whyText(q)}</p>${sayBtn("say-why","🔊 Read this to me")}</div>
   ${stepsPlayer(q)}
   ${vid?`<a href="${esc(vid)}" target="_blank" rel="noopener">Watch ${esc(TEACHER)}’s video on this skill</a>`:''}
   ${countBox("p")}
   <button id="next">${t("Try another one")}</button>`;
}
let timer=null; function stopPlay(){clearTimeout(timer);timer=null;S.playing=false;if(TTS)speechSynthesis.cancel()}
/* play the breakdown: each step is read aloud and the next one starts when the reading ends (6 seconds a step without a voice) */
function playFrom(q){if(!S.playing)return;render();const next=()=>{if(!S.playing)return;if(S.r<q.steps.length-1){S.r++;playFrom(q)}else{S.playing=false;render()}};
  if(TTS)speak(q.steps[S.r].say,()=>{if(S.playing)timer=setTimeout(next,600)});else timer=setTimeout(next,6000)}
function wireFeedback(q){wireCount(()=>({qid:S.qid,q:S.q,sel:S.sel,k:S.k,kind:S.rvKind?"check":"practice"}));
  document.getElementById("next").onclick=()=>{stopPlay();
    if(S.mastered){S.done=S.k;S.screen="mastered";render();return}
    newQ();render()};
  const sw=document.getElementById("say-why"); if(sw) sw.onclick=()=>{stopPlay();speak(`The answer is ${ansText(q)}. `+whyText(q).replace(/<br>/g,". "))};
  const ss=document.getElementById("say-step"); if(ss) ss.onclick=()=>{stopPlay();render();speak(q.steps[S.r].say)};
  const see=document.getElementById("see"); if(see) see.onclick=()=>{S.full=true;S.r=0;render()};
  const prev=document.getElementById("prev"); if(!prev) return;
  prev.onclick=()=>{stopPlay();S.r--;render()};
  document.getElementById("fwd").onclick=()=>{stopPlay();S.r++;render()};
  document.getElementById("play").onclick=()=>{if(S.playing){stopPlay();render();return}
    stopPlay();S.playing=true;if(S.r===q.steps.length-1)S.r=0;playFrom(q)};
}

function mastered(){
  const k=SKILLS.find(x=>x.id===S.done),next=curSkill(S.student);
  const nb=(S.newBadges||[]).map(badgeInfo).map(b=>`<div class="newbadge"><span class="medal" aria-hidden="true">${b.m}</span>New badge: ${b.name}!</div>`).join("");
  app.innerHTML=header()+`<div class="card pop" style="text-align:center;align-items:center">
   ${next?`<div style="width:110px;height:110px;border-radius:50%;background:var(--gold);color:var(--gold-ink);display:grid;place-items:center;font-size:2.8rem;box-shadow:0 0 0 6px var(--card),0 0 0 9px var(--star)" aria-hidden="true">⚑</div>`:`<div style="width:100%;max-width:420px">${HERO_ART}</div>`}
   <h2>${next?"Checkpoint reached!":"You reached the summit!"}</h2>
   <p><b>${esc(k.name)}</b> <span class="muted">· ${esc(k.std)} · ${MAST()} stars to master · +5 bonus stars</span></p>
   ${nb}
   ${scout(next?`You earned it. Next stop on the trail: ${esc(next.name.toLowerCase())}.`:`You mastered every standard on your trail!`)}
   <button id="go">Back to my trail</button></div>`;
  document.getElementById("go").onclick=()=>{S.screen="home";render()};
}
SCREENS.mastered=mastered;

/* ================= teacher ================= */
function startTeacher(d){
  TOKEN=d.token||TOKEN;ls.set(SKEY,{token:TOKEN,role:"teacher"},sessionStorage);S.role="teacher";S.demo=false;
  TB=d;TEACHER=d.me.name;S.screen="teacher";S.err="";
  S.tt=S.tt||"classes";
  render();
}
const isAdmin=()=>TB&&TB.me.admin;
const tName=id=>(TB.teachers.find(t=>t.id===id)||{}).name||"No teacher";
const testName=id=>(TB.tests.find(t=>t.id===id)||{}).name||"Assessment 1";
async function getTest(id){
  if(!id||id==="a1")return null;
  if(isStdT(id))return {id};
  if(!TESTS[id])TESTS[id]=(await api("testGet",{id})).test;
  return TESTS[id];
}
async function refreshBoot(){TB={...TB,...await api("boot")};}
async function openClass(id,tab){
  S.err="";S.loading=true;
  try{
    const d=(await api("classData",{ids:[id]})).classes[0];
    useTest(await getTest(d.cls.testId));
    addExtras(allAssigned(d.students));
    CUR={cls:d.cls,rev:d.rev,raw:d.students,students:d.students.map(viewStudent)};
    db={mastery:d.cls.mastery,videos:d.cls.videos||{},goal:d.cls.goal,choose:d.cls.choose};
    TEACHER=tName(d.cls.teacherId);
    S.cid=id;S.tt="class";S.tab=tab||S.tab||"class";S.edit=0;
  }catch(e){S.err=e.message}
  S.loading=false;render();
  if(CUR&&!S.err)autoPrograms();
}
const CLS_MENU=[["Progress",[["class","Class progress"],["why","Why they missed it"],["bd","Question breakdowns"],["items","Item analysis"],["fluency","Fluency"]]],["Plan & teach",[["pace","Pacing guide"],["plan","Station planner"],["mtss","MTSS"],["ip","Math plans (IMP)"]]],["Reports",[["bench","Benchmarks & reports"],["home","Family updates 🏠"],["celebrate","Celebrate 🎉"],["badges","Badges"]]],["Class",[["setup","Students"],["settings","Class settings"]]]];
const TOP_NAME={overview:"School overview",classes:"My classes",compare:"Compare classes",standards:"Standards",tests:"Tests",reports:"Reports",teachers:"Teachers / My account",tutors:"Tutors",leads:"School requests"};
const NAVH=[
 ["Your class",[["See how my class is doing","class"],["Find who needs help right now","class"],["Print a Sub Day plan or Help Buddy cards","class"],["See off-topic Scout chats","class"],["See why students missed questions","why"],["Break down each test question","bd"],["Find the hardest test questions","items"],["Check math fact fluency","fluency"]]],
 ["Plan & teach",[["Plan the rest of the year before the state test (pacing guide)","pace"],["Plan small-group stations","plan"],["See MTSS tiers (Tier 2 and Tier 3)","mtss"],["Make or print an IMP (Individualized Math Plan)","ip"]]],
 ["Scores & reports",[["Text parents a weekly update with a 5-minute home activity","home"],["Enter benchmark scores or import screener scores","bench"],["Print class or parent reports","bench"],["Celebrate students and print certificates","celebrate"],["See student badges","badges"]]],
 ["Students & settings",[["Add students or print login cards","setup"],["Assign standards to students","setup"],["Set accommodations (read aloud, Spanish, extra time)","setup"],["Change the class test or turn on Buddy","settings"]]],
 ["Whole school",[["See the whole school at a glance","@overview"],["Compare my classes","@compare"],["Browse every standard with sample questions","@standards"],["Import a new test","@tests"],["Reports for principals and leaders","@reports"],["Change my password or account","@teachers"]]]];
function navWhere(){const tt=S.tt||"classes";if(tt==="class"&&CUR){const t=S.tab||"class",g=CLS_MENU.find(g=>g[1].some(x=>x[0]===t));return `My classes › ${esc(CUR.cls.name)} › ${g[0]} › ${g[1].find(x=>x[0]===t)[1]}`}return TOP_NAME[tt]||"My classes"}
function navPath(to){if(to[0]==="@")return TOP_NAME[to.slice(1)];const g=CLS_MENU.find(g=>g[1].some(x=>x[0]===to));return `A class › ${g[0]} › ${g[1].find(x=>x[0]===to)[1]}`}
function navGo(to){document.querySelectorAll(".lb-back,.lb-pop.navh").forEach(e=>e.remove());
  if(to[0]==="@"){const b=document.querySelector(`[data-tt="${to.slice(1)}"]`);if(b)b.click();window.scrollTo(0,0);return}
  if(S.tt==="class"&&CUR){S.tab=to;render();window.scrollTo(0,0);return}
  const mine=TB.classes.filter(c=>c.teacherId===TB.me.id),c=CUR?.cls||mine[0]||TB.classes[0];
  if(!c){S.tt="classes";S.err="Make a class first, then that page will be inside it.";render();return}
  openClass(c.id,to);window.scrollTo(0,0)}
function navHelp(){
  const items=NAVH.map(([g,l])=>[g,l.filter(x=>x[1]!=="@overview"||isAdmin())]);
  const back=document.createElement("div");back.className="lb-back";const pop=document.createElement("div");pop.className="card lb-pop navh";pop.setAttribute("role","dialog");pop.setAttribute("aria-label","Find a page");
  pop.innerHTML=`<div class="top"><h2>🧭 Find a page</h2><button class="ghost small" id="nh-x">Close</button></div>
   <p class="muted" style="margin:0">You are here: <b>${navWhere()}</b></p>
   <input id="nh-q" type="search" placeholder="What do you want to do? Try “IMP” or “login cards”" aria-label="Search pages" style="width:100%">
   <div id="nh-list">${items.map(([g,l])=>`<div class="nh-g"><h3>${g}</h3>${l.map(([q,to])=>`<button class="nh-i" data-nh="${to}"><b>${esc(q)}</b><span class="muted">${esc(navPath(to))}</span></button>`).join("")}</div>`).join("")}</div>
   <p class="muted" id="nh-none" hidden>No match. Try another word, or open <b>My classes</b> and pick a class.</p>`;
  document.body.append(back,pop);const close=()=>{back.remove();pop.remove()};back.onclick=close;pop.querySelector("#nh-x").onclick=close;
  pop.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
  pop.querySelectorAll("[data-nh]").forEach(b=>b.onclick=()=>navGo(b.dataset.nh));
  const q=pop.querySelector("#nh-q");q.focus();q.oninput=()=>{const w=q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);let any=0;
    pop.querySelectorAll(".nh-g").forEach(g=>{let n=0;g.querySelectorAll(".nh-i").forEach(b=>{const ok=w.every(x=>b.textContent.toLowerCase().includes(x));b.hidden=!ok;n+=ok});g.hidden=!n;any+=n});pop.querySelector("#nh-none").hidden=!!any}}
function teacher(){
  const tt=S.tt||"classes";
  if(tt!=="class"){TEACHER=TB.me.name}
  const top=[["classes","My classes"],["compare","Compare classes"],["standards","Standards"],["tests","Tests"],["reports","Reports"],["teachers",isAdmin()?"Teachers":"My account"],...(isAdmin()&&!DEMO_T?[["tutors","Tutors"],["leads","School requests"]]:[])];
  if(isAdmin())top.unshift(["overview","School overview"]);
  const nav=`<div class="tabs" role="group" aria-label="Teacher pages">${top.map(([id,l])=>`<button data-tt="${id}" aria-pressed="${tt===id||(tt==="class"&&id==="classes")}">${l}</button>`).join("")}</div>`;
  let body="";
  if(tt==="class"&&CUR){
    const tab=S.tab||"class";
    const tabs=`<div class="card" style="gap:10px;padding:14px 16px"><div class="top"><div><span class="label">Class</span><h2>${esc(CUR.cls.name)}</h2><span class="muted" style="font-size:.85rem">${esc(tName(CUR.cls.teacherId))} · ${esc(TEST_NAME)} · class code <b style="letter-spacing:.1em">${esc(CUR.cls.join)}</b></span></div>
      <button class="ghost small" id="allc">← All classes</button></div>
      <div class="tabs ddnav" role="group" aria-label="Class pages">${CLS_MENU.map(([g,items])=>{const on=items.find(x=>x[0]===tab);return `<details class="dd"><summary class="${on?"on":""}">${g}${on?`: <b>${on[1]}</b>`:""} ▾</summary><div class="ddm">${items.map(([id,l])=>`<button class="small" data-tab="${id}" aria-pressed="${tab===id}">${l}</button>`).join("")}</div></details>`}).join("")}</div></div>`;
    const ipn=S.ipNew&&S.ipNew.length&&tab!=="ip"?`<div class="fb go" role="status"><p>📘 New individual plan${S.ipNew.length>1?"s":""} started for ${S.ipNew.map(esc).join(", ")} (scored below ${ipCfg().cut}%). <button class="link" data-tab="ip">See plans and print lessons</button></p></div>`:"";
    body=tabs+ipn+({class:tClass,why:tWhy,plan:tPlanner,fluency:tFluency,mtss:tMtss,ip:tIP,bench:tBench,home:tFamily,celebrate:tCelebrate,pace:tPace,badges:tBadges,bd:tBreak,items:()=>qualityCard()+tItems(),setup:tSetup,settings:tSettings})[tab]();
  } else body=({classes:tClasses,compare:tCompare,standards:tStandards,tests:tTests,reports:tReports,teachers:tTeachers,tutors:tTutors,leads:tLeads,overview:tOverview,class:tClasses})[tt]();
  app.innerHTML=demoBanner()+header(`<button class="ghost" id="out">${DEMO_T?"Leave sample school":"Sign out"}</button>`,`${TB.school.name} · ${TB.me.name}${isAdmin()?" (admin)":""}`)+nav+`<button class="navfab" id="navfab" aria-label="Find a page">🧭 Find a page</button>`+(S.err?`<div class="fb oops" role="alert"><p>${esc(S.err)}</p></div>`:"")+body;
  document.getElementById("out").onclick=signOut;document.getElementById("navfab").onclick=navHelp;
  app.querySelectorAll("[data-tt]").forEach(b=>b.onclick=()=>{S.tt=b.dataset.tt;S.err="";S.reports=null;S.backups=null;S.tutors=null;S.lic=undefined;S.ov=null;S.leads=null;if(S.tt!=="class")useTest(null);render()});
  const allc=document.getElementById("allc");if(allc)allc.onclick=()=>{S.tt="classes";useTest(null);render()};
  app.querySelectorAll("details.dd").forEach(d=>d.ontoggle=()=>{if(d.open)app.querySelectorAll("details.dd").forEach(o=>{if(o!==d)o.open=false})});
  if(!window._ddClose){window._ddClose=1;document.addEventListener("click",e=>{if(!e.target.closest("details.dd"))document.querySelectorAll("details.dd[open]").forEach(d=>d.open=false)})}
  app.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{S.tab=b.dataset.tab;S.err="";S.mtssId=null;S.rcpt=null;S.xtNew=false;render();window.scrollTo(0,0)});
  const sdb=document.getElementById("sub-day");if(sdb)sdb.onclick=subDay;const hbb=document.getElementById("help-buddy");if(hbb)hbb.onclick=()=>helpBuddy((document.getElementById("hb-std")||{}).value);
  const cd=document.getElementById("csv-dl");if(cd)cd.onclick=()=>saveFile(`${CUR.cls.name.replace(/[^\w]+/g,"-")}-${new Date().toISOString().slice(0,10)}.csv`,classCSV());
  if(tt==="class"&&CUR)({class:wireHands,why:wireMis,plan:wirePlanner,fluency:wireFluency,mtss:wireMtss,ip:wireIP,bench:wireBench,home:wireFamily,celebrate:wireCelebrate,pace:wirePace,badges:wireBadges,bd:wireBreak,items:wireQuality,setup:wireSetup,settings:wireSettings})[S.tab||"class"]();
  else ({classes:wireClasses,compare:wireCompare,standards:wireStandards,tests:wireTests,reports:wireReports,teachers:wireTeachers,tutors:wireTutors,leads:wireLeads,overview:wireOverview,class:wireClasses})[tt]();
  wireDemoBanner();if(DEMO_T){const o=document.getElementById("out");if(o)o.onclick=endDemoSchool}
}
SCREENS.teacher=teacher;

