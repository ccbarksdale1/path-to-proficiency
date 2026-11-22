/* Path to Proficiency · Active test, server calls, app state.
   Loaded in order by index.html as plain scripts that share one global scope. */
/* ---------- page styles for print windows: the stylesheet's text, inlined so a new window prints styled right away ---------- */
let APP_CSS="";fetch("/css/app.css").then(r=>r.ok?r.text():"").then(t=>{APP_CSS=t}).catch(()=>{});
const pageCSS=()=>(APP_CSS?`<style>${APP_CSS}</style>`:`<link rel="stylesheet" href="${location.origin}/css/app.css">`)+[...document.querySelectorAll("style")].map(x=>x.outerHTML).join("");

/* ---------- active test ---------- */
const SKILLS_A1=SKILLS;
Object.assign(ICONS,{props:"⇄",divfact:"÷",fluency:"⚡",twostep:"2",patterns:"…",tens:"10",nf1:"½",nf2a:"↔",nf2b:"↔",nf3a:"=",nf3b:"=",nf3c:"1",nf3d:"<",time:"🕒",volmass:"⚖",graphs:"📊",lineplot:"📏",md5a:"□",md5b:"▦",md6:"▦",md7a:"▦",md7b:"▭",md7c:"▭",md7d:"⌐",perim:"▢"});
/* every question maker, old and new */
/* answer check on every generated question: no wrong choice may equal the right answer in value, and no
   choice may be a malformed mixed number (like “0 [1/4]” or “6 [3/2]”). If one is found, the maker tries again
   with a related seed, so the same id always gives the same question. Questions about forms (NOT, mixed number,
   improper, precision) are allowed to show equal values on purpose. */
const choiceVal=c=>{if(typeof c!=="string")return null;const s=c.replace(/−/g,"-").replace(/,/g,"").trim();
  let m=s.match(/^(-?)(?:(\d+)\s+)?\[(\d+)\/(\d+)\]\s*([a-zA-Z ]*)$/);if(m){const w=m[2]!=null?+m[2]:null,n=+m[3],d=+m[4];return {v:(m[1]?-1:1)*((w||0)+n/d),u:m[5].trim(),bad:w!==null&&(w===0||n>=d)}}
  m=s.match(/^(-?\d+(?:\.\d+)?)\s*([a-zA-Z ]*)$/);if(m)return {v:+m[1],u:m[2].trim(),bad:false};return null};
function choicesOK(q){if(!q||q.type!=="mc")return true;const T=(q.parts||[]).map(x=>typeof x==="string"?x:x.eq||"").join(" ");
  const vals=q.choices.map(choiceVal);if(vals.some(v=>v&&v.bad))return false;if(/\bNOT\b|mixed number|improper|appropriate way|precision|significant|equivalent|same value/i.test(T))return true;
  const R=vals["ABCDE".indexOf(q.ans)];if(!R)return true;return !vals.some((v,i)=>"ABCDE"[i]!==q.ans&&v&&v.u===R.u&&Math.abs(v.v-R.v)<1e-9)}
const SING={parts:"part",inches:"inch",feet:"foot",wholes:"whole",cups:"cup",groups:"group",miles:"mile",pounds:"pound",hours:"hour",minutes:"minute",students:"student",apples:"apple",days:"day",weeks:"week",meters:"meter",units:"unit",rows:"row",columns:"column",squares:"square",boxes:"box",bags:"bag",dollars:"dollar",cents:"cent",pieces:"piece",slices:"slice",pizzas:"pizza",cookies:"cookie",marbles:"marble",yards:"yard",gallons:"gallon",quarts:"quart",pints:"pint",liters:"liter",grams:"gram",kilograms:"kilogram",ounces:"ounce",centimeters:"centimeter",millimeters:"millimeter",kilometers:"kilometer",books:"book",pencils:"pencil",seconds:"second",laps:"lap",trays:"tray",teams:"team",shelves:"shelf",tables:"table",cars:"car",buses:"bus",packs:"pack",stickers:"sticker",cards:"card"};
const singFix=t=>typeof t!=="string"?t:t.replace(/(?<![\d.\/,\-−+×÷\]])(?<!by )(?<![\d] )\b1 (equal )?([a-z]+)\b/g,(m,eq,w)=>SING[w]?"1 "+(eq||"")+SING[w]:m);
function singQ(q){if(!q)return q;if(q.parts)q.parts=q.parts.map(singFix);if(q.choices)q.choices=q.choices.map(c=>typeof c==="string"?singFix(c):c);return q}
const GG={has:k=>GEN.skills.includes(k)||GEN2.skills.includes(k)||GEN45.skills.includes(k)||GEN68.skills.includes(k)||GENHS.skills.includes(k)||!!(SCI_CODE&&SCI_CODE[k])||!!(ELA_CODE&&ELA_CODE[k]),make:(k,s)=>{const once=s2=>(ELA_CODE&&ELA_CODE[k]?GENELA:SCI_CODE&&SCI_CODE[k]?GENSCI:GEN.skills.includes(k)?GEN:GEN2.skills.includes(k)?GEN2:GEN45.skills.includes(k)?GEN45:GEN68.skills.includes(k)?GEN68:GENHS).make(k,s2);let q=once(s);for(let i=1;i<12&&!choicesOK(q);i++)q=once(s+i*7907);return (ELA_CODE&&ELA_CODE[k])||(SCI_CODE&&SCI_CODE[k])?q:singQ(q)}};
/* 3–8 = grades, 9 = Algebra I, 10 = ACT Math prep, 11 = WorkKeys Applied Math */
const GRADES=[3,4,5,6,7,8,9,10,11],gLabel=g=>+g===9?"Algebra I":+g===10?"ACT Math":+g===11?"WorkKeys Applied Math":+g>=23?`ELA Grade ${g-20}`:+g===19?"Biology":+g>=14?`Science Grade ${g-10}`:`Grade ${g}`,stdGrade=c=>(LIBC[c]||{}).grade||+String(c)[0]||9;
const isStdT=id=>/^std\d+$/.test(id||""),isHS=g=>+g===10||+g===11,isSci=g=>+g>=14&&+g<=19,isELA=g=>+g>=23&&+g<=28,subjOf=g=>isELA(g)?"ela":isSci(g)?"sci":"math";
const subj=()=>isELA(gradeOf())?"Reading":isSci(gradeOf())?"Science":"Math";
/* step 1 (key words, or Find the proof): the class setting, or by course (required for grades 3–5; optional with a skip button for grades 6 and up) */
const qStr=q=>(q&&q.parts||[]).filter(x=>typeof x==="string").join(" ");
const CLUE_W=["NOT","EXCEPT","LEAST","BEST","MOST","MAINLY","MAIN","ALWAYS","NEVER","ONLY","FIRST","LAST"];
const cluesIn=q=>{const T=qStr(q);return CLUE_W.filter(w=>new RegExp("\\b"+w+"\\b").test(T)).filter((w,i,a)=>!(w==="MAIN"&&a.includes("MAINLY")))};
function clueTip(q){const f=cluesIn(q),es=S.lang==="es";if(f.length){const L=f.join(", ");return es?`Paso 1: Toca tus palabras clave. Esta pregunta tiene ${L}. Toca también lo que pregunta.`:`Step 1: Tap your clue words. This question has ${L}. Also tap what the question asks about.`}
  return es?"Paso 1: Toca tus palabras clave: las palabras que dicen de qué trata la pregunta.":"Step 1: Tap your clue words: the words that tell you what the question asks about."}
function bareQ(q){if(!q||subjOf(gradeOf())!=="math")return false;const raw=(!S.demo&&SB&&SB.cls&&SB.cls.kw)||"auto";if(raw==="on")return false;
  const T=qStr(q);if(/\b(NOT|EXCEPT|LEAST|NEVER)\b/.test(T))return false;const w=T.match(/[A-Za-z]{2,}/g)||[];const hasEq=(q.parts||[]).some(x=>x&&typeof x!=="string"&&x.eq!=null);
  if(/\b(each|per|total|left|more than|fewer|less than|times as|in all|altogether|share|buys?|sells?|has|have)\b/i.test(T))return false;
  return w.length<=7||(hasEq&&w.length<=12)}
const step0=q=>kwMode()==="off"||(bareQ(q)&&!planOn(q))?2:1;
const kwMode=()=>{const m=(!S.demo&&SB&&SB.cls&&SB.cls.kw)||"auto";if(m==="on"||m==="optional"||m==="off")return m;const g=gradeOf(),lvl=isELA(g)?g-20:isSci(g)&&g<19?g-10:g;return g===9||isHS(g)||g===19||lvl>=6?"optional":"on"};
const stdTestName=g=>+g>=23?`ELA Grade ${g-20}: reading and language standards (no test)`:+g===19?"Biology: all objectives (no test)":+g>=14?`Science Grade ${g-10}: all objectives (no test)`:+g===10?"ACT® Math prep: all skills (no test)":+g===11?"WorkKeys® Applied Math: Levels 3–7 (no test)":+g===9?"Algebra I: all standards (no test)":`Grade ${g}: all standards (no test)`;
/* the grade a class works on: from its test */
const gradeOf=()=>TESTID==="a1"?3:isStdT(TESTID)?+TESTID.slice(3):+(ACT&&ACT.grade)||3;
const genOf=k=>k.gen||(GG.has(k.id)?k.id:(LIBC[k.std]||{}).gen)||null;
/* standards a teacher assigned that the test does not cover become extra checkpoints */
function addExtras(codes){
  const base=SKILLS.filter(k=>!k.extra),extra=[];
  [...new Set(codes||[])].forEach(c=>{const L0=LIBC[c];if(!L0||base.some(k=>k.std===c)||extra.some(k=>k.std===c))return;extra.push({id:L0.gen,std:c,name:L0.name,qs:[],twins:[],extra:true,gen:L0.gen})});
  SKILLS=[...base,...extra];
}
/* standards on a class's exit tickets and built tests count too, so any grade standard can be tested */
const genCode=g=>{const gr=gradeOf(),L=LIB.find(x=>x.gen===g&&x.grade===gr)||LIB.find(x=>x.gen===g);return L?L.code:null};
const xtCodes=s=>xtOf(s).flatMap(x=>[x.std,...(x.qs||[]).map(id=>{const m=String(id).match(/~([A-Za-z0-9_]+)~/);return m?genCode(m[1]):null})]).filter(Boolean);
/* every standard a teacher can pick for a ticket or test: the class's own, then the rest of the grade */
function pickSkills(){const base=SKILLS.filter(k=>genOf(k)),g=gradeOf(),ord=c=>{const i=LIB.findIndex(x=>x.code===c);return i<0?1e6:i};
  const more=LIB.filter(x=>x.grade===g&&x.gen&&!base.some(k=>k.std===x.code)).map(x=>({id:x.gen,std:x.code,name:x.name,qs:[],twins:[],extra:true,gen:x.gen}));
  return [...base,...more].sort((a,b)=>ord(a.std)-ord(b.std))}
const allAssigned=list=>list.flatMap(s=>[...(s.assigned||[]),...ipCodes(s),...goListRaw(s),...xtCodes(s)]);
/* a student's trail: assigned standards first, then the rest; "off" = not on this student's trail */
const trailBase=s=>{const on=SKILLS.filter(k=>s.prog.skills[k.id]&&s.prog.skills[k.id].status!=="off"),ipc=ipCodes(s),a=new Set(s.assigned||[]);
  /* an individual plan goes first, in its building-block order; then assigned standards; then the rest */
  const first=ipc.map(c=>on.find(k=>k.std===c)).filter(Boolean),rest=on.filter(k=>!first.includes(k));return [...first,...rest.filter(k=>a.has(k.std)),...rest.filter(k=>!a.has(k.std))]};
/* ================= Comeback: a short catch-up for students who missed class practice days =================
   The server spots it (the class practiced 3+ days after this student's last practice) and sends the skills
   the class worked on that this student still needs. Those go first on the trail until the student answers
   CB_Q questions in each, or CB_DAYS days pass. Saved in prog.cb so the teacher sees it too. */
const CB_Q=5,CB_DAYS=7;
const cbAge=c=>(Date.now()-new Date(c.at+"T00:00:00").getTime())/864e5;
function cbLeft(s,ignoreAge){const c=s.prog&&s.prog.cb;if(!c||!c.at||!Array.isArray(c.ids))return [];if(!ignoreAge&&cbAge(c)>CB_DAYS)return [];
  return c.ids.filter(id=>{const sk=s.prog.skills[id];if(!sk||sk.status!=="todo")return false;let n=0;for(const [d,x] of Object.entries(s.prog.days||{}))if(d>=c.at&&x[id])n+=x[id].n||0;return n<CB_Q})}
const trailFor=s=>{const b=trailBase(s),L=cbLeft(s);if(!L.length)return b;const f=L.map(id=>b.find(k=>k.id===id)).filter(Boolean);return [...f,...b.filter(k=>!f.includes(k))]};
function cbStart(c){const st=S.student,p=st&&st.prog;if(!p||!c||!Array.isArray(c.ids)||!c.ids.length)return;
  if(p.cb&&(p.cb.since===c.since||cbLeft(st).length))return; /* already started for this absence, or one is still going */
  p.cb={n:c.n,since:c.since,ids:c.ids.filter(id=>p.skills[id]),at:dayKey()}}
function cbCard(s){const c=s.prog.cb,L=cbLeft(s);if(!c||!L.length)return "";const es=S.lang==="es",tot=c.ids.length,done=tot-L.length;
  const li=c.ids.map(id=>{const k=SKILLS.find(x=>x.id===id);return k?`<li>${L.includes(id)?"○":"✅"} <b>${esc(k.name)}</b> <span class="muted">${esc(k.std)}</span></li>`:""}).join("");
  return `<div class="card"><h2>👋 ${es?"¡Bienvenido de vuelta!":"Welcome back!"}</h2>
   <p>${es?`Tu clase practicó ${c.n} días mientras no estabas. Aquí tienes ${tot} repaso${tot===1?"":"s"} rápido${tot===1?"":"s"}:`:`Your class practiced ${c.n} days while you were away. Here ${tot===1?"is":"are"} ${tot} quick catch-up${tot===1?"":"s"}:`}</p>
   <ul style="list-style:none;padding-left:0;margin:.4rem 0">${li}</ul>
   <p class="muted">${es?`${done} de ${tot} listos. Tu misión de hoy empieza con ellos.`:`${done} of ${tot} done. Today’s mission starts with them.`}</p></div>`}
function cbTag(s){const c=s.prog&&s.prog.cb;if(!c||!c.at||!Array.isArray(c.ids))return "";const age=cbAge(c);if(age>14)return "";
  const tot=c.ids.length,L=cbLeft(s,true),names=c.ids.map(id=>(SKILLS.find(x=>x.id===id)||{}).std).filter(Boolean).join(", "),tip=`Missed ${c.n} class practice days. Catch-up: ${names}`;
  return !L.length?` <span class="pill go" title="${esc(tip)}">↺ Caught up</span>`:age>CB_DAYS?` <span class="pill" title="${esc(tip)}">↺ Catch-up not finished (${tot-L.length}/${tot})</span>`:` <span class="pill purple" title="${esc(tip)}">↺ Catching up ${tot-L.length}/${tot}</span>`}
let TESTID="a1",NQ=30,ACT=null;
/* switch the whole app to one test: the built-in Assessment 1, or a test a teacher imported */
function useTest(t){
  if(!t||t.id==="a1"){TESTID="a1";ACT=null;SKILLS=SKILLS_A1;QSA=QS;TEST_NAME="Grade 3 benchmark";NQ=30;return}
  if(isStdT(t.id)){if(TESTID===t.id)return;const g=+t.id.slice(3),nm=isHS(g)?`${gLabel(g)} skills`:isSci(g)?`${gLabel(g)} objectives`:`${gLabel(g)} standards`;TESTID=t.id;ACT={id:t.id,grade:String(g),name:nm};QSA={};TEST_NAME=nm;NQ=0;
    SKILLS=LIB.filter(x=>x.grade===g).map(x=>({id:x.gen,std:x.code,name:x.name,qs:[],twins:[],gen:x.gen}));return}
  if(TESTID===t.id&&ACT===t)return;
  TESTID=t.id;ACT=t;TEST_NAME=t.name;QSA={};
  Object.entries(t.qs).forEach(([id,q])=>QSA[id]=q);
  Object.entries(t.practice||{}).forEach(([sk,list])=>(list||[]).forEach((q,i)=>QSA[`p:${sk}:${i}`]={...q,skill:sk,n:undefined}));
  SKILLS=t.skills.map(k=>({...k,twins:(t.practice?.[k.id]||[]).map((_,i)=>`p:${k.id}:${i}`)}));
  NQ=Math.max(0,...Object.values(t.qs).map(q=>q.n||0));
}
const qNums=()=>Object.values(QSA).filter(q=>q.n).map(q=>q.n).sort((a,b)=>a-b).filter((n,i,a)=>a.indexOf(n)===i);
/* one scoring rule for every report: % right on the current test.
   Question tests: count only real, distinct question numbers as missed. Standards tests: use the entered % score.
   No data = unknown (null), never 0. Always 0–100. */
function scorePct(s){if(!s)return null;
  if(NQ>0&&Array.isArray(s.missed)){const valid=new Set(qNums().length?qNums():Array.from({length:NQ},(_,i)=>i+1)),tot=valid.size||NQ;
    const m=new Set(s.missed.map(x=>+x).filter(n=>valid.has(n))).size;return Math.round((tot-m)/tot*100)}
  const v=s.scores&&s.scores[TESTID];if(v==null||v===""||isNaN(+v))return null;return Math.max(0,Math.min(100,Math.round(+v)))}

/* ---------- server ---------- */
const SKEY="p2p-session",CKEY="p2p-class",OLDKEY="p2p-a1-v1";
const ls={get(k,st=localStorage){try{return JSON.parse(st.getItem(k))}catch(e){return null}},set(k,v,st=localStorage){try{v==null?st.removeItem(k):st.setItem(k,JSON.stringify(v))}catch(e){}}};
let TOKEN=null;
/* multi-district sites: the school code a teacher typed is remembered on this device and sent with every request */
const SITEKEY="ptp-school";
async function api(action,body={}){
  if(DEMO_T&&TOKEN==="demo")return demoApi(action,body);
  const site=ls.get(SITEKEY);
  let r;
  try{r=await fetch("/api/"+action,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token:TOKEN,...(site?{school:site}:{}),...body})})}
  catch(e){throw new Error("Can’t reach the school server. Check the internet and try again.")}
  let d={};try{d=await r.json()}catch(e){}
  if(r.status===401&&TOKEN&&action!=="login"&&action!=="studentLogin"){const m=d.error||"Please sign in again.";signOut();S.err=m;render();throw new Error(m)}
  if(!r.ok){const er=new Error(d.error||("The server had a problem ("+r.status+")."));er.data=d;throw er}
  return d;
}

/* ---------- state ---------- */
let db={mastery:MASTERY_DEFAULT,videos:{},goal:60};   /* the open class's settings */
let TB=null;          /* teacher: boot data (me, teachers, classes, tests) */
let SB=null;          /* student: boot data */
let CUR=null;         /* teacher: the open class {cls, students} */
const TESTS={};       /* test definitions loaded so far */
let TEACHER="Your teacher";
const SAMPLE=[
 {name:"Amari (sample)",code:"1111",sample:true,missed:[2,4,5,11,13,19,22,24,28,29]},
 {name:"Kennedy (sample)",code:"2222",sample:true,missed:[6,16,21,26]}];
const isSample=s=>s.sample||/\(sample\)/.test(s.name);
const realStudents=()=>(CUR?CUR.students:[]).filter(s=>!isSample(s));

function initStudent(s){
  if(!s.prog||!s.prog.skills){const keep=s.prog||{};s.prog={stars:0,skills:{},log:{},...keep,skills:{},log:keep.log||{}}}
  SKILLS.forEach(k=>{if(s.prog.skills[k.id])return;const missed=s.missed?k.qs.filter(n=>s.missed.includes(n)):k.qs;
    const rest=k.qs.filter(n=>!missed.includes(n));
    s.prog.skills[k.id]={status:k.extra?"off":(s.missed&&!missed.length)?"skip":"todo",streak:0,
      queue:[...missed.map(n=>"q"+n),...k.twins,...rest.map(n=>"q"+n)]};});
  /* practice added later (new questions): add to each list */
  SKILLS.forEach(k=>{const sk=s.prog.skills[k.id];[...k.twins,...k.qs.map(n=>"q"+n)].forEach(id=>{if(!sk.queue.includes(id))sk.queue.push(id)})});
  return s;
}
/* a student as one test sees them */
/* ================= Carry-over: when a class moves to a grade-level standards test, a student who has never practiced
   under it starts with what they already did on the class's earlier test: skills mastered (or tested out of) on the same
   standards count, and the earlier benchmark score shows. The earlier test's data is never changed. ================= */
function carrySrc(raw){const P=raw.prog||{};if(P[TESTID]||!isStdT(TESTID))return null;
  const c=Object.keys(P).filter(k=>k!==TESTID&&k[0]!=="_"&&P[k]&&P[k].skills&&(k==="a1"||isStdT(k)));return c.includes("a1")?"a1":c[0]||null}
function stdOfSkill(tid,id){if(tid==="a1"){const k=SKILLS_A1.find(x=>x.id===id);return k&&k.std}const L=LIB.find(x=>x.gen===id);return L&&L.code}
function carryProg(raw,src){const o=raw.prog[src],got={};
  Object.entries(o.skills||{}).forEach(([id,sk])=>{const c=stdOfSkill(src,id);if(c&&(sk.status==="done"||sk.status==="skip"))got[c]=got[c]==="done"?"done":sk.status});
  const match=std=>got[std]||Object.entries(got).find(([c])=>std.startsWith(c)&&/^[a-z]$/.test(std.slice(c.length)))?.[1];
  const L=Object.values(o.log||{}),p={stars:o.stars||0,skills:{},log:{},days:JSON.parse(JSON.stringify(o.days||{})),carried:src,carryAt:dayKey(),
    prior:{tries:L.reduce((a,l)=>a+(+l.tries||0),0),right:L.reduce((a,l)=>a+(+l.right||0),0)},...(o.last?{last:o.last}:{}),...(o.tutor?{tutor:{total:o.tutor.total||0,...(o.tutor.off?{off:o.tutor.off}:{})}}:{})};
  SKILLS.forEach(k=>{const st=match(k.std);if(st)p.skills[k.id]={status:st,streak:0,queue:[...k.twins],carried:true}});return p}
function carryScore(raw){const m=raw.missed&&raw.missed.a1;if(!Array.isArray(m))return null;const n=new Set(m.map(Number).filter(x=>x>=1&&x<=30)).size;return Math.round((30-n)/30*100)}
function viewStudent(raw){const src=carrySrc(raw),s={...raw,missed:raw.missed?.[TESTID]??null,prog:raw.prog?.[TESTID]?JSON.parse(JSON.stringify(raw.prog[TESTID])):src?carryProg(raw,src):null,raw};
  if(isStdT(TESTID)&&(raw.scores?.[TESTID]==null||raw.scores[TESTID]==="")){const cs=carryScore(raw);if(cs!=null){s.scores={...(raw.scores||{}),[TESTID]:cs};s.scoreCarried=true}}
  initStudent(s);
  const a=new Set([...(s.assigned||[]),...ipCodes(s)]);
  SKILLS.forEach(k=>{const sk=s.prog.skills[k.id];if(!sk)return;
    if(a.has(k.std)){if(sk.status==="off"||sk.status==="skip"){sk.was=sk.status;sk.status="todo"}sk.asg=true}
    else if(sk.asg){if(sk.status==="todo")sk.status=sk.was||(k.extra?"off":"todo");delete sk.asg;delete sk.was}
    else if(k.extra&&sk.status==="todo")sk.status="off"});
  if(s.prog.go){const g=new Set(goList(s.prog));SKILLS.forEach(k=>{const sk=s.prog.skills[k.id];if(sk&&g.has(k.std)){if(sk.status==="off")sk.status="todo";sk.go=true}})}
  return s}
let saveTimer=null,saving=false,saveAgain=false;
function save(){
  if(S.demo||!S.student||!TOKEN||S.role!=="student")return;
  clearTimeout(saveTimer);saveTimer=setTimeout(flushSave,300);
}
async function flushSave(){
  if(saving){saveAgain=true;return}saving=true;
  try{await api("progSave",{testId:TESTID,prog:S.student.prog});S.saveErr=false;ls.set(OFFKEY,null)}
  catch(e){S.saveErr=true;ls.set(OFFKEY,{sid:S.student.id,tid:TESTID,prog:S.student.prog,t:Date.now()});setTimeout(save,8000)}
  saving=false;markSaved();if(saveAgain){saveAgain=false;flushSave()}
}
function markSaved(){const el=document.getElementById("savestate");if(el)el.innerHTML=!S.saveErr?"":navigator.onLine===false?`<span class="pill gold">📴 ${t("Offline: keep practicing. Your work saves when the internet is back.")}</span>`:'<span class="pill oops">Not saved yet: check the internet</span>'}
/* ================= Offline: practice keeps going when Wi-Fi drops. Unsaved work is kept on this device and sent when the
   internet is back (right away, on the "online" event). A copy of the sign-in data lets a reloaded tab open offline. ================= */
const OFFKEY="p2p-unsaved",BOOTKEY="p2p-boot";
window.addEventListener("online",()=>{if(S.saveErr&&S.role==="student"){S.saveErr=false;flushSave()}});
window.addEventListener("offline",()=>{if(S.role==="student"&&!S.demo){S.saveErr=true;markSaved()}});
const offTries=p=>Object.values((p&&p.log)||{}).reduce((a,l)=>a+(+l.tries||0),0);
function offRestore(d){const u=ls.get(OFFKEY);if(!u||!d.student||u.sid!==d.student.id||u.tid!==TESTID)return false;d.prog=d.prog||{};
  if(offTries(u.prog)>offTries(d.prog[TESTID])){d.prog[TESTID]=u.prog;return true}ls.set(OFFKEY,null);return false}
if("serviceWorker" in navigator&&location.protocol==="https:")window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
const curSkill=s=>trailFor(s).find(k=>s.prog.skills[k.id].status==="todo");
/* blank = scores not entered yet (practice everything); "none" or 0 = missed nothing */
const parseMissed=t=>{t=String(t||"").trim();if(!t)return null;if(/^(none|0)$/i.test(t))return [];
  return [...new Set(t.split(/[^0-9]+/).map(Number).filter(n=>n>=1&&n<=Math.max(NQ,1)))].sort((a,b)=>a-b)};
const missedText=m=>m==null?"not entered":m.length?m.map(n=>"#"+n).join(", "):"none";

/* ---------- app ---------- */
const app=document.getElementById("app");
let S={screen:"landing",code:"",err:""};
function header(right="",sub=`${TEACHER} · ${TEST_NAME}`){return `<div class="top"><div class="brand">${LOGO}<div><h1>Path to Proficiency</h1><small>${esc(sub)}</small></div></div><div class="row"><span id="savestate"></span>${right}</div></div>`}
let lastView="";
const SCREENS={};
function render(){app.className="wrap"+(S.screen==="teacher"||S.screen==="setup"?" teach":"")+(S.screen==="landing"?" landing":"");SCREENS[S.screen]();
  const view=[S.screen,S.qid,S.tab,S.tt,S.bdq,S.cid].join("|"); if(view!==lastView){lastView=view;window.scrollTo?.(0,0)}
  if(S.flash){const el=document.getElementById(S.flash.id);if(el)el.textContent=S.flash.msg;S.flash=null}
  markSaved()}
function signOut(){DEMO_T=null;document.getElementById("tour")?.remove();stopPlay();if(typeof musicStop==="function")musicStop();S&&(S.musicOpen=false);try{clearInterval(gameTimer);if(S.G&&S.G.st)clearInterval(S.G.st.botT)}catch(e){}document.getElementById("chirp")?.remove();TOKEN=null;TB=SB=CUR=null;ls.set(SKEY,null,sessionStorage);useTest(null);TEACHER="Your teacher";S={screen:"landing",code:"",err:""};render()}
const flash=(id,msg)=>{S.flash={id,msg}};
function busy(btn,txt){if(btn){btn.disabled=true;btn.dataset.t=btn.textContent;btn.textContent=txt||"Working…"}}

