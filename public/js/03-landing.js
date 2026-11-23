/* Path to Proficiency · Home page, sign in, join a class, setup.
   Loaded in order by index.html as plain scripts that share one global scope. */
/* ---------- home page ---------- */
const DEMOQ=(()=>{for(let s=11;s<400;s++){try{const q=GG.make("unknown",s);if(q.type==="mc"&&q.steps.length>1)return q}catch(e){}}})();
const LD={step:0,dq:{hl:new Set(),sel:null,done:false,r:0},dtab:"class",jour:0,faq:-1};
const L_STEPS=[
 {t:"Find the gaps",k:"Starting point",d:"The teacher enters which questions each student missed on the test, by hand or from a spreadsheet. Every student gets their own trail, built from the standards they missed.",
  art:()=>`<div class="mock"><div class="mock-h">Questions missed</div>${[["Ava","#2, #5, #11"],["Ben","#7"],["Cara","none"]].map(([n,m])=>`<div class="mrow"><b>${n}</b><span>${m}</span></div>`).join("")}<div class="mrow muted" style="font-size:.85rem"><span>Trail starts with the standards they missed</span></div></div>`},
 {t:"Read and highlight",k:"Read slow",d:"Before solving, students tap the key words: the numbers and the words that say what to do. The app shows which ones they found and which they missed.",
  art:()=>`<div class="mock"><p class="qtext" style="line-height:2"><span class="tok hit">Sam</span> has <span class="tok hit">3</span> bags with <span class="tok hit">4</span> apples in <span class="tok hit">each</span> bag. <span class="tok miss">How</span> <span class="tok miss">many</span> apples?</p><div class="pill go" style="align-self:flex-start">Found 4 of 6 key words</div></div>`},
 {t:"Learn from mistakes",k:"Breakdown",d:"A wrong answer is never just “wrong.” Students see why their exact choice was wrong, then watch a read-aloud, step-by-step breakdown of the right way.",
  art:()=>`<div class="mock"><div class="fb oops" style="padding:10px 12px"><p><b>The answer is C.</b> 4 × 7 = 28. That is too small.</p></div><div class="stage" style="min-height:0;padding:10px">${skipHTML([4,8])}</div><p class="say" style="font-size:.95rem">Skip count by 4s until you reach 32. That is 8 jumps.</p></div>`},
 {t:"Ask Scout",k:"AI tutor",d:"Stuck? Scout, a friendly AI tutor, gives hints and asks guiding questions. Scout won’t give away the answer until the student tries, and the teacher can turn it off.",
  art:()=>`<div class="mock">${scout("What does the box stand for? 4 groups of how many make 32?")}<div class="me-b">I think 8!</div>${scout("Great thinking! Check it: 4 × 8 = ? ⭐")}</div>`},
 {t:"Reach the summit",k:"Mastery",d:"Ten stars on a standard reach the checkpoint: each right answer adds a star and a miss costs 2 (the teacher can change the number). Then the trail climbs to the next standard, and practice never runs out.",
  art:()=>`<div class="mock" style="align-items:center;text-align:center"><span class="flags">${Array.from({length:10},(_,i)=>`<i class="${i<10?'on':''}">★</i>`).join("")}</span><div class="newbadge" style="justify-content:center">⚑ Checkpoint reached! +5 stars</div></div>`},
];
const L_JOUR=[
 {std:"3.NBT.2",n:"Adding and subtracting",s:"skip"},{std:"3.OA.4",n:"Finding the missing number",s:"todo"},{std:"3.OA.2",n:"What division means",s:"todo"},
 {std:"3.G.2",n:"Equal parts and fractions",s:"todo"},{std:"3.NBT.1",n:"Rounding",s:"todo"}];
const L_HARD=[["⏰","Not enough time","Benchmark results become missed standards, practice, small groups, and lesson packets automatically. No sorting through papers and spreadsheets."],
 ["🪜","Students at different levels","Every student gets their own trail from what they actually know: stepping back to earlier grades when needed, and going further into the next grade when they’re ready."],
 ["📊","Making sense of the data","For every student: what they missed, which standard it was, the misconception behind it, and what to practice next."],
 ["🎮","Engagement and motivation","An adventure trail, stars, badges, fluency levels, a cheering bird, and games earned by mastering skills. It won’t fix behavior, but it makes the math work something students want to do."],
 ["🧩","Differentiating instruction","Twenty-five students, twenty-five different assignments, and zero extra prep. The station planner and printable lessons do the sorting."],
 ["💬","Communicating progress","One-click progress reports for every student in English or Spanish, parent letters for every intervention plan, and dashboards for school leaders."],
 ["🔋","Burnout","Less time between the assessment, the intervention, and the progress check, so more of the work happens during the school day."],
 ["📈","Proving growth","A record for every student: where they started each fall, the interventions they received, and how their scores changed by winter and spring."]];
const L_STORY=[["Upload assessment results","A teacher uploads benchmark results, or types the questions each student missed. That’s the only setup.","upload","The Students page with benchmark results"],
 ["Identify learning gaps","Each student gets a trail of the exact standards they missed. Teachers see who is stuck and who needs help now.","gaps","Class progress with each student’s gaps"],
 ["Discover misconceptions","Wrong answers are matched to the thinking behind them, and students with the same misunderstanding are grouped.","why","Why they missed it, grouped by mistake"],
 ["Create instructional groups","Recommended small groups and a station rotation, with the neediest group at the teacher table first.","groups","Station planner groups"],
 ["Measure improvement","Leaders see proficiency against the target, interventions, and remaining gaps across every class.","overview","School overview dashboard"]];
const L_FAQ=[
 ["Who is it for?","Math students in grades 3 through 8 and Algebra I in Mississippi, their teachers, and school leaders, plus high school students getting ready for the ACT® and WorkKeys® Applied Math. Every Mississippi CCRS math standard for those courses is built in, and teachers can import their own tests."],
 ["Does step 1 change as students get older?","Yes. Younger students highlight key words before every question. In reading, students tap the sentence in the passage that proves the answer (Find the proof). In Science 7, Science 8, and Biology, they cross out two answers they can prove wrong before choosing (Rule it out). In Algebra I and ACT Math, they pick the best first move before solving (Plan it). Step 1 is required in grades 3 through 5 and has a skip button from grade 6 up; teachers can change this for each class."],
 ["Does it cover reading and English Language Arts?","Yes, for grades 3 through 8. ELA practice follows the Mississippi CCRS for English Language Arts in three areas: Reading Literature, Reading Informational Text, and Language (grammar, punctuation, vocabulary, and figurative language). Students read original stories, poems, and articles written for Path to Proficiency and answer questions that send them back to the text. Writing, speaking and listening, and foundational skills are not included."],
 ["Does it cover science?","Yes. Science practice follows the 2026 Mississippi CCRS for Science for grades 4, 5, 7, 8 and Biology: 190 performance objectives, each with its own original questions, data tables, and step-by-step explanations. Science classes get the same trails, Scout tutor, Individual plans, benchmarks, and reports as math."],
 ["Does it help with the ACT and WorkKeys?","Yes. ACT® Math prep covers 36 skills across every ACT Math category, with 4-choice questions and timed practice tests. WorkKeys® Applied Math covers 28 workplace math skills from Level 3 to Level 7, with 5-choice questions, a built-in calculator and formula sheet, and a level estimate for every student. All questions are original, and estimates are practice guides, not official scores."],
 ["How much does it cost?","Schools are priced per school, based on enrollment. Request a quote and we’ll send one within two school days. Founding Schools receive special pilot pricing."],
 ["Does it replace our current math program?","No need to replace anything. Path to Proficiency works alongside the curriculum and programs you already use: bring in the benchmark results you already have, and it turns them into groups, Individualized Math Plans, and the next lesson for each student."],
 ["Can parents or homeschool families use it?","Families can try a practice question as a student right now, free. Teachers can print a parent letter for every student on a plan, in English or Spanish. A family and homeschool version is coming: join the waitlist and we’ll let you know first."],
 ["How long does setup take?","About 15 minutes per class. Add students (or import a roster spreadsheet), enter or upload benchmark results, and students can start the same day. Founding Schools get guided onboarding."],
 ["How is student data protected?","We store only what the app needs: student first names, a 4-digit code, and their practice. No student emails and no ads. We never sell data, and we share it only with the providers that run the app: Netlify (hosting and storage) and, when Scout or the AI tools are on, Anthropic (which does not train on it). Each school’s data is backed up nightly and admins can export it. We’re glad to review your district’s data privacy agreement."],
 ["Will teachers need training?","Most teachers are comfortable after one short session. Every screen explains itself, and we provide quick-start guides and a live training for Founding Schools."],
 ["What devices does it work on?","Any device with a web browser: Chromebooks, iPads, laptops, and phones. Progress is saved online, so students can switch devices."],
 ["How do students log in?","With a 6-letter class code and their own 4-digit code. No email or password. A classroom device remembers the class, so students only type 4 digits."],
 ["Is the AI tutor safe for kids?","Scout only talks about the math question on screen, uses short and kind sentences, and never asks for personal information. Teachers can turn Scout off for a class, and each student has a daily limit."],
];
const lPreview={
 class:()=>`<div class="dp-grid"><div class="mock"><div class="mock-h">Path to 60%</div><div class="goal" style="gap:18px"><div><span class="big">55%</span><span class="muted">11 of 20 finished</span></div><div><span class="big">60%</span><span class="muted">goal: 12</span></div></div><div class="meter"><span style="width:55%"></span><i style="left:60%"></i></div><p style="font-size:.9rem"><b>1 more student</b> reaches the goal.</p></div>
   <div class="mock"><div class="mock-h">Needs attention</div><ul class="attn"><li><b>Jaylen</b><span class="pill purple">3.OA.4</span><p>Missed 4 of last 5. Pull into a small group and review breakdown #9.</p></li><li><b>Mia</b><span class="pill purple">3.G.2</span><p>Missed 3 of last 5 on equal parts.</p></li></ul></div></div>`,
 items:()=>`<div class="mock"><div class="mock-h">Item analysis: lowest first, so you know what to reteach</div>${[[29,"3.NBT.1",38],[12,"3.OA.4",45],[24,"3.G.2",52],[16,"3.OA.2",64],[3,"3.OA.1",81]].map(([n,s,p])=>`<div class="hb"><span class="hl2"><b>#${n}</b> <span class="muted">${s}</span></span><span class="track"><span style="width:${p}%;background:${heat(p)}"></span></span><b>${p}%</b></div>`).join("")}</div>`,
 why:()=>`<div class="mock"><div class="mock-h">Why they missed it · 3.NF.2b Fractions on a number line</div><ol class="miss"><li><div class="mhead"><b>5 students</b><span class="muted">9 times</span></div><p class="mex">“Count the spaces between 0 and 1, not the tick marks.”</p></li><li><div class="mhead"><b>2 students</b><span class="muted">3 times</span></div><p class="mex">“Start counting after 0. The 0 mark is not a jump.”</p></li></ol></div>`,
 compare:()=>`<div class="mock"><div class="mock-h">Compare classes by standard</div><div class="tablewrap"><table class="roster cmp"><thead><tr><th>Standard</th><th>Homeroom</th><th>Room 12</th><th>Room 14</th></tr></thead><tbody>
   ${[["3.NBT.1",[48,72,66]],["3.NBT.2",[85,90,78]],["3.OA.4",[42,58,71]],["3.G.2",[67,54,80]]].map(([s,v])=>`<tr><td><b>${s}</b></td>${v.map(x=>`<td><span class="hc" style="--c:${heat(x)}">${x}%</span></td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`,
 student:()=>`<div class="mock"><div class="mock-h">Every student</div><div class="tablewrap"><table class="roster"><thead><tr><th>Student</th><th>Path</th><th>Working on</th><th>Accuracy</th></tr></thead><tbody>
   ${[["Ava",6,"3.OA.4","82%"],["Ben",8,"Proficient","91%"],["Cara",3,"3.G.2","64%"]].map(([n,d,w,a])=>`<tr><td><b>${n}</b></td><td><span class="bar"><span style="width:${d/8*100}%;background:var(--go)"></span></span> ${d}/8</td><td>${w==="Proficient"?`<span style="color:var(--go);font-weight:700">${w}</span>`:w}</td><td>${a}</td></tr>`).join("")}</tbody></table></div></div>`,
};
function landing(){
  const dev=ls.get(CKEY),st=L_STEPS[LD.step],q=DEMOQ,D=LD.dq;
  const found=foundKeys(q,D.hl).size;
  const demoQ=`<div class="notebook ${D.done?'ro':''}" id="try">
     <div class="row" style="justify-content:space-between"><span class="label">Try a real question · 3.OA.4</span>${D.done?`<button class="ghost small" id="d-again">Try again</button>`:""}</div>
     ${bodyHTML(q,D.hl,D.done?"check":"tap")}
     <p class="note" style="font-size:1.15rem">${D.done?(D.sel===q.ans?"Yes! That’s right.":"Mistakes help us climb."):D.hl.size<2?"Step 1: tap the key words.":"Step 2: pick your answer."}</p>
     <div class="choices">${q.choices.map((c,i)=>{const l=L[i];let cl="";if(D.done){if(l===q.ans)cl=" right";else if(l===D.sel)cl=" wrong"}else if(l===D.sel)cl=" sel";
       return `<button class="choice${cl}" data-dl="${l}" ${D.done||D.hl.size<2?"disabled":""}><b class="l">${l}</b><div>${choiceInner(c)}</div></button>`}).join("")}</div>
     ${D.done?`<div class="fb ${D.sel===q.ans?"go":"oops"}"><p><b>${D.sel===q.ans?`You found ${found} of ${q.keys.length} key words.`:`The answer is ${q.ans}.`}</b> ${D.sel===q.ans?"":fmt(q.why[D.sel]||"")}</p></div>
       <div class="stage" style="min-height:0">${(()=>{for(let i=D.r;i>=0;i--)if(q.steps[i].show)return showHTML(q.steps[i].show);return""})()}</div>
       <p class="say">${fmt(q.steps[D.r].say)}</p>
       <div class="row"><button class="ghost small" id="d-prev" ${D.r===0?"disabled":""}>Back</button><span class="muted">Step ${D.r+1} of ${q.steps.length}</span><button class="ghost small" id="d-next" ${D.r===q.steps.length-1?"disabled":""}>Next step</button></div>`:""}
   </div>`;
  const J=LD.jour,jour=L_JOUR.map((x,i)=>({...x,state:x.s==="skip"?"done":i<J?"done":i===J?"now":"later"}));
  app.innerHTML=`
  <nav class="lnav"><div class="brand">${LOGO}<div><b>Path to Proficiency</b><small>Math, Science &amp; ELA · ACT &amp; WorkKeys</small></div></div>
   <div class="lnav-links"><a href="#who">Who it’s for</a><a href="#hard">Why teachers love it</a><a href="#story">How it works</a><a href="#leaders">For leaders</a><button class="linklike" data-go="ms">Mississippi</button><button class="linklike" data-go="found">Founding Schools</button><a href="#faq">FAQ</a></div>
   <div class="row"><button class="ghost small" data-go="tch">Teacher login</button><button class="ghost small" data-go="stu">Student login</button><button class="small" data-go="lead">Schedule a demo</button></div></nav>

  <section class="lhero">
   <div class="lhero-copy">
    <span class="eyebrow">For Mississippi schools · Math 3–8, Algebra I, ACT® &amp; WorkKeys® · Science 4, 5, 7, 8 &amp; Biology · ELA 3–8</span>
    <h1 class="hero">Don’t just find the gaps. Close them.</h1>
    <p class="lead">Every student deserves a clear path to math proficiency. Path to Proficiency turns assessment results into individualized learning, identifies the thinking behind wrong answers, and gives teachers the next instructional move.</p>
    <div class="pillars"><span>🎯 Personalized learning</span><span>🔍 Misconception analysis</span><span>🧑‍🏫 Teacher-led intervention</span></div>
    <div class="row"><button data-go="tour" id="demo-load">▶ See it in action</button><button class="ghost" data-go="lead">Schedule a school demonstration</button></div>
    <p class="muted" style="font-size:.9rem">The guided tour opens a sample school with made-up students. No sign-up needed.</p>
    ${dev?`<p class="muted" style="font-size:.9rem">This device is set up for <b>${esc(dev.name)}</b>${dev.teacher?` · ${esc(dev.teacher)}`:""}. <button class="linklike" data-go="stu">Student login</button></p>`:""}
   </div><div class="hero-visual">${HERO_ART}${SHOTS.overview?`<div class="browser" aria-hidden="true"><div class="browser-bar"><i></i><i></i><i></i><span>pathtoproficiency.com</span></div><img src="${SHOTS.overview}" alt=""></div>`:""}
    <div class="float-sym" aria-hidden="true"><span>÷</span><span>×</span><span>½</span><span>π</span><span>x²</span><span>+</span></div></div>
  </section>
  <div class="statstrip reveal"><div><b>273</b><span>Mississippi CCRS standards</span></div><div><b>3–8 + Alg I</b><span>grades and courses</span></div><div><b>2</b><span>languages: English &amp; Spanish</span></div><div><b>Any device</b><span>Chromebooks, iPads, phones</span></div></div>

  <section class="lsec reveal" id="example"><div class="lsec-h"><span class="eyebrow">What “close them” looks like</span><h2>One mistake, start to finish</h2><p class="muted">An example from the sample school, with made-up students.</p></div>
   <div class="ex-loop">
    <div class="ex-step"><b>1 · Practice finds it</b><p>On 3.OA.1, six students keep choosing the same wrong answer. The app names the reason: <i>“Joining more groups is addition, not multiplication.”</i></p></div>
    <div class="ex-step"><b>2 · You see who</b><p>Their names are listed under that mistake. No grading, no spreadsheet.</p></div>
    <div class="ex-step"><b>3 · One small group</b><p>Fifteen minutes on that one idea, then a 3-question check aimed only at that mistake.</p></div>
    <div class="ex-step"><b>4 · Proof it worked</b><p><span class="pill go">Fixed</span> for four students. <span class="pill oops">Same mistake</span> for one, who gets another round.</p></div>
   </div><div class="row" style="justify-content:center"><button data-go="tour">▶ Walk through it in the sample school</button></div></section>
  <section class="lsec reveal" id="voices"><div class="lsec-h"><span class="eyebrow">In their words</span><h2>What 3rd graders said after using it</h2><p class="muted">Anonymous feedback from a Mississippi 3rd grade class.</p></div><div class="lqwrap"><button class="lqnav" data-lq="-1" aria-label="Previous quotes">‹</button><div class="lqs" id="lqs" tabindex="0" aria-label="Student quotes, scroll sideways">${[["I learned from my mistakes and now I know what to click.","#8B5A3C","#1d1d1d","puffs","#FFD8A8","#3B82F6"],["Shows you the stuff you don’t know.","#F1C27D","#6B3E1F","short","#C7F0D8","#16A34A"],["Explains the correct answers.","#5C3A21","#111","curly","#E9D5FF","#9333EA"],["Gives you enough time to answer a question.","#C68642","#2B1B0E","braids","#FDE68A","#EA580C"],["Music is calming.","#FFDBAC","#B5651D","pony","#BFDBFE","#DB2777"]].map(([q,sk,hr,st,bg,sh])=>`<figure class="lq"><div class="lqa" aria-hidden="true">${kidAv(sk,hr,st,bg,sh)}</div><blockquote>“${q}”</blockquote><figcaption>— 3rd grader, Mississippi</figcaption></figure>`).join("")}</div><button class="lqnav" data-lq="1" aria-label="More quotes">›</button></div><p class="muted" style="font-size:.8rem;margin-top:.4rem">Real quotes, shared anonymously. Pictures are drawings, not the students.</p></div></section>
  <section class="lsec reveal" id="who"><div class="lsec-h"><span class="eyebrow">Who it’s for</span><h2>One platform, everyone on the same page</h2></div>
   <div class="who4">
    <div class="wcard who t"><span class="wico">🧑‍🏫</span><h3>Teachers</h3><p>Know exactly who needs what, and why. Groups, lessons, and intervention plans are built for you.</p><button class="small" data-go="tour">See the teacher view</button></div>
    <div class="wcard who p"><span class="wico">🏫</span><h3>Principals</h3><p>See proficiency against your target, who is in intervention, and whether it is working, across every class.</p><button class="small" data-go="lead">Schedule a demonstration</button></div>
    <div class="wcard who d"><span class="wico">🗺️</span><h3>Districts</h3><p>Mississippi-aligned intervention plans and progress monitoring, with a Founding Schools pilot to start small.</p><button class="small" data-go="found">Founding Schools</button></div>
    <div class="wcard who f"><span class="wico">🏡</span><h3>Families &amp; homeschool</h3><p>Step-by-step help with the why behind every answer, read-aloud, Spanish, and a friendly AI tutor.</p><button class="small" data-go="demo">Try it as a student</button><button class="ghost small" data-go="family">Join the family waitlist</button></div>
   </div></section>

  <section class="lsec reveal" id="hard"><div class="lsec-h"><span class="eyebrow">Built for real classrooms</span><h2>Built for the hardest parts of teaching</h2><p class="muted">Made by a teacher who lives these every day.</p></div>
   <div class="statcall"><div><b>84%</b><span>of teachers say they don’t have enough time in their regular work hours for grading, lesson planning, paperwork, and email.</span><a href="https://www.pewresearch.org/social-trends/2024/04/04/how-teachers-manage-their-workload/" target="_blank" rel="noopener">Pew Research Center, 2024</a></div>
    <div><b>52%</b><span>of teachers named managing student behavior as a source of job-related stress, the most cited source.</span><a href="https://www.rand.org/news/press/2026/06/teachers-stress-burnout-continue-to-outpace-those-of.html" target="_blank" rel="noopener">RAND, State of the American Teacher, 2026</a></div></div>
   <div class="hard8">${L_HARD.map(([i,h,d])=>`<div class="hcard"><span class="wico">${i}</span><div><h3>${h}</h3><p>${d}</p></div></div>`).join("")}</div></section>

  <section class="lsec reveal" id="story"><div class="lsec-h"><span class="eyebrow">The complete story</span><h2>Assessment → Diagnosis → Instruction → Intervention → Progress</h2><p class="muted">Real screens from the sample school, with made-up students.</p></div>
   <ol class="story">${L_STORY.map((x,i)=>`<li><span class="sn">${i+1}</span><div><b>${x[0]}</b><p class="muted">${x[1]}</p></div>${SHOTS[x[2]]?`<img src="${SHOTS[x[2]]}" alt="${esc(x[3])}" loading="lazy">`:""}</li>`).join("")}</ol>
   <div class="row" style="justify-content:center"><button data-go="tour">▶ Take the 2-minute guided tour</button><button class="ghost" data-go="lead">Schedule a demonstration</button></div></section>

  <section class="lsec reveal" id="leaders"><div class="lsec-h"><span class="eyebrow">For principals and district leaders</span><h2>A command center for instructional decisions</h2><p class="muted">Not another website for teachers. A way for school leaders to see what is working.</p></div>
   <div class="diffwrap"><div class="mock"><div class="mock-h">School overview <span class="muted" style="font-weight:500">· illustrative numbers, not real results</span></div>
     <div class="kpis small"><div class="kpi gold"><b>48%</b><span>Estimated proficiency</span><small>Target 60%</small></div><div class="kpi"><b>124</b><span>Students in intervention</span></div><div class="kpi oops"><b>8</b><span>Standards needing attention</span></div><div class="kpi go"><b>76%</b><span>Students showing growth</span></div></div></div>
    <div class="difflist"><div><b>📊 Which classes and grades are improving</b><p class="muted">Proficiency against your target, by grade and class, updated as students practice.</p></div>
     <div><b>🧩 Which standards cause the most difficulty</b><p class="muted">The standards below 50% proficient, with the most common mistake behind them.</p></div>
     <div><b>🩺 Who is receiving intervention, and is it working</b><p class="muted">Every Individualized Math Plan, whether it’s on pace, and how many students met their exit criteria.</p></div>
     <div class="row"><button class="small" data-go="tour">Open the sample school’s overview</button></div></div></div></section>

  <section class="lsec reveal"><div class="ms-band"><div><span class="eyebrow">Built in Mississippi, for Mississippi</span><h2>We connect the exact mistakes students make to the next move their teachers need to make.</h2>
    <p>Mississippi CCRS standards for grades 3–8 and Algebra I, prerequisite connections across grades, question-level misconception analysis, teacher-ready intervention groups, printable lessons, and progress monitoring, organized around the Individualized Math Plans described in Mississippi’s 2026 SB 2294.</p></div>
    <button data-go="ms">Mississippi mathematics intervention →</button></div></section>

  <section class="lsec reveal"><div class="lsec-h"><span class="eyebrow">Why it matters</span><h2>Math builds on itself. So do the gaps.</h2></div>
   <div class="why3">
    <div class="wcard"><span class="wico">🧱</span><h3>Small gaps grow</h3><p>A skill missed in grade 3, like what division means, shows up again in fractions, word problems, and every grade after. Catching it now is easier than catching it later.</p></div>
    <div class="wcard"><span class="wico">🎯</span><h3>Practice the right thing</h3><p>Worksheets give every student the same problems. Here, each student only practices the standards they actually missed, and skips what they already know.</p></div>
    <div class="wcard"><span class="wico">💡</span><h3>Understand the mistake</h3><p>Getting it right next time starts with knowing why it was wrong. Every wrong answer comes with a plain-language reason and a step-by-step fix.</p></div>
   </div></section>

  <section class="lsec reveal" id="diff"><div class="lsec-h"><span class="eyebrow">What makes it different</span><h2>Most practice programs show <i>what</i> students missed. This one shows <i>why</i>.</h2></div>
   <div class="diffwrap">
    <div class="mock diffmock"><div class="mock-h">Why they missed it · 3.OA.3</div>
     <ol class="miss"><li><div class="mhead"><b>6 students</b><span class="muted">14 times</span></div><p class="mex">“That adds the numbers. Equal groups means multiply.”</p><p class="muted" style="font-size:.85rem">Ava, Ben, Cara, Jaylen, Mia, Noah</p></li>
      <li><div class="mhead"><b>3 students</b><span class="muted">5 times</span></div><p class="mex">“That is how many in one group. Multiply by the number of groups.”</p><p class="muted" style="font-size:.85rem">Diego, Imani, Zoe</p></li></ol></div>
    <div class="difflist">
     <div><b>🔍 The mistake behind every wrong answer</b><p class="muted">Each wrong choice is linked to the thinking that leads to it. The app groups the same mistake across different questions and shows you which students make it, so your teacher station reteaches the real problem.</p></div>
     <div><b>📋 Built from your own test, aligned to Mississippi</b><p class="muted">Trails start from the benchmark questions each student actually missed. Every Mississippi CCRS math standard for grades 3 through 8 and Algebra I is built in (273 in all), with what students should know, understand, and do from the MDE scaffolding documents. High schools also get ACT® Math prep and WorkKeys® Applied Math, and science classes get every 2026 MS CCRS for Science objective for grades 4, 5, 7, 8 and Biology. ELA classes in grades 3 through 8 get reading and language standards with original passages.</p></div>
     <div><b>🎯 You decide what each student practices</b><p class="muted">Assign any standard to one student, a small group, or the whole class. Assigned standards jump to the front of their trail.</p></div>
     <div><b>📖 Reading and math together</b><p class="muted">Students highlight the key words before solving, the same close reading that state tests reward.</p></div>
    </div></div></section>

  <section class="lsec reveal" id="tools"><div class="lsec-h"><span class="eyebrow">Built for how teachers teach</span><h2>Stations, fluency, and a little cheering section</h2></div>
   <div class="why3">
    <div class="wcard"><span class="wico">🧩</span><h3>Station planner</h3><p>Pick how many groups or how many students per group. The planner groups students by the standard and the mistake they share, puts the group that needs you most at the teacher table first, and prints the rotation.</p></div>
    <div class="wcard"><span class="wico">⚡</span><h3>Fluency sprints</h3><p>Timed fact sheets with a pass bar, like a paper Multiplication Madness sheet. Seven levels from × 0, 1, 2 up to mixed review. Students level up when they pass, and teachers see the class’s trouble facts.</p></div>
    <div class="wcard"><span class="wico">🐦</span><h3>Meet Chirp</h3><p>Every few questions, Chirp, a mockingbird (Mississippi’s state bird), flies in with a cheer that fits the moment: a hot streak, a tough patch, or a checkpoint around the corner. No ads, no prizes to buy, just encouragement.</p></div>
    <div class="wcard"><span class="wico">🎮</span><h3>Game Arcade</h3><p>Students earn game tokens by mastering checkpoints, leveling up in fluency, and collecting stars. Each token unlocks a short math game: Balloon Pop, Match It, Make the Number, and a Summit Race built from their own standards.</p></div>
   </div></section>

  <section class="lsec" id="how"><div class="lsec-h"><span class="eyebrow">How it works</span><h2>Five steps from test results to mastery</h2><p class="muted">Tap a step to see it.</p></div>
   <div class="steps5">
    <div class="steplist" role="tablist" aria-label="Steps">${L_STEPS.map((s,i)=>`<button role="tab" aria-selected="${i===LD.step}" data-step="${i}" class="stepb${i===LD.step?" on":""}"><span class="sn">${i+1}</span><span><small>${s.k}</small><b>${s.t}</b></span></button>`).join("")}</div>
    <div class="steppanel pop" role="tabpanel"><h3>${LD.step+1}. ${st.t}</h3><p>${st.d}</p>${st.art()}
     <div class="row"><button class="ghost small" id="s-prev" ${LD.step===0?"disabled":""}>← Back</button><button class="small" id="s-next" ${LD.step===L_STEPS.length-1?"disabled":""}>Next step →</button></div></div>
   </div></section>

  <section class="lsec"><div class="lsec-h"><span class="eyebrow">See it for yourself</span><h2>Try a question the way students do</h2><p class="muted">A practice question for 3.OA.4, made by the app.</p></div>
   ${demoQ}</section>

  <section class="lsec" id="journey"><div class="lsec-h"><span class="eyebrow">The learning journey</span><h2>One trail per student, from base camp to the summit</h2><p class="muted">Here is Ava’s trail. She got adding and subtracting right on the test, so that checkpoint is already done.</p></div>
   <div class="jwrap"><ol class="trail">${jour.map((x,i)=>`<li class="stop ${x.state}"><span class="num">${x.state==="done"?"✓":i+1}</span><span><span class="name">${x.n}</span><br><span class="muted" style="font-size:.85rem">${x.std}</span></span>${x.s==="skip"?'<span class="pill go">Got it on the test</span>':x.state==="done"?'<span class="pill go">Mastered</span>':x.state==="now"?'<span class="pill now">Ava is here</span>':'<span class="pill">Coming up</span>'}</li>`).join("")}
     <li class="stop summit${J>=L_JOUR.length?" reached":""}"><span class="num">★</span><span><span class="name">Summit of Mastery</span><br><span class="muted" style="font-size:.85rem">Every standard mastered</span></span>${J>=L_JOUR.length?'<span class="pill gold">Proficient!</span>':""}</li></ol>
    <div class="jside">${scout(J>=L_JOUR.length?"Ava reached the summit! She is proficient on every standard she missed.":J<=1?"Ava starts where she needs help most. Collecting enough stars (the teacher sets how many) reaches each checkpoint.":`Checkpoint! Ava mastered ${esc(L_JOUR[J-1].n.toLowerCase())}. Next up: ${esc(L_JOUR[Math.min(J,L_JOUR.length-1)].n.toLowerCase())}.`)}
     <div class="row"><button id="j-next">${J>=L_JOUR.length?"Start over":"Climb to the next checkpoint"}</button></div>
     <ul class="jlist"><li><b>Badges</b> for checkpoints, streaks, comebacks, skills like finding the proof, mastering each domain, and badges teachers give</li><li><b>Stars</b> for every right answer</li><li><b>Videos</b> from the teacher on each standard, if they add them</li></ul></div>
   </div></section>

  <section class="lsec" id="data"><div class="lsec-h"><span class="eyebrow">For teachers and schools</span><h2>The data you get, updated as students practice</h2><p class="muted">Sample data shown.</p></div>
   <div class="tabs" role="tablist" aria-label="Teacher views">${[["class","Class progress"],["why","Why they missed it"],["student","Every student"],["items","Item analysis"],["compare","Compare classes"]].map(([id,l])=>`<button class="small" role="tab" aria-selected="${LD.dtab===id}" data-dt="${id}">${l}</button>`).join("")}</div>
   <div class="dprev pop">${lPreview[LD.dtab]()}</div>
   <div class="feat">${[["Path to your goal","See how many students finished their trail, and how many more you need to reach your class goal."],["Who needs help now","Students who miss 3 of their last 5 on a standard are flagged, with the question to review together."],["Ready-made small groups","Students working on the same standard are grouped for you."],["Why they missed it","The mistakes behind wrong answers, grouped and ranked, with the students who make each one."],["What to reteach","Every test question ranked from hardest to easiest, with a step-by-step breakdown for the board."],["Assign standards","Give any of the 273 standards from grade 3 to Algebra I to one student, a group, or the whole class, including lower-grade standards to fill gaps."],["Station planner","Groups built from data, a rotation schedule, and printable group cards."],["Fluency tracking","Levels, best scores, passes, and the facts your class misses most."],["Automatic individual plans","Students who score below your cut score get a 6-week plan that steps back to the prerequisite standards they need, with printable, scaffolded lesson packets."],["MTSS intervention reports","One-click, printable Tier 2 and 3 records: minutes, standards, accuracy growth, and mistakes."],["Benchmark readiness","An on-track, close, or needs-support estimate for every student, weighted toward the major work of each grade."],["Growth over time","Weekly accuracy and practice charts for the class and each student."],["Spanish support","Students can switch directions, Chirp, and Scout’s help to Spanish."],["Compare classes","Side-by-side by teacher and standard, for grade-level teams and school leaders."],["Import tests and scores","Bring in a test from a PDF or spreadsheet, and scores from a CSV."]].map(([t,d])=>`<div><b>${t}</b><p class="muted">${d}</p></div>`).join("")}</div>
  </section>

  <section class="lsec"><div class="tutor-band"><div><span class="eyebrow">Founding Schools Program</span><h2>Be one of the first Mississippi schools</h2>
    <p>Guided onboarding, teacher training, a defined pilot period, progress reports, and direct access to the team building it. In return: your honest feedback.</p></div>
    <button data-go="found">Learn about Founding Schools</button></div></section>

  ${quotesSection()}
  <section class="lsec reveal" id="founder"><div class="lsec-h"><span class="eyebrow">Meet the founder</span><h2>Built by a Mississippi Delta teacher</h2></div>
   <div class="fdr"><img src="/img/founder.jpg" alt="Christian Barksdale, founder of Path to Proficiency" width="520" height="777" loading="lazy">
    <div class="fdr-t"><h3>Christian Barksdale</h3><p class="muted fdr-r">Founder of Path to Proficiency · 3rd Grade Math &amp; Science Teacher · Author</p>
     <p>Christian Barksdale teaches third-grade math and science in the Mississippi Delta, in his hometown of Cleveland, Mississippi. Every day he sees students who are ready to learn but are stuck with one-size-fits-all resources that don’t meet them where they are.</p>
     <p>So he built Path to Proficiency in his own classroom, for his own students. It turns test results into a personal practice path for every child. It explains every wrong answer, and it gives teachers the intervention plans and reports they would otherwise spend hours making by hand.</p>
     <p>Barksdale holds a B.S. in Biology from Mississippi Valley State University and is earning his MBA at Delta State University. He is also the author of <i>Hearts in White Coats</i>, a collection of physicians’ stories from around the world.</p>
     <p class="fdr-q">His vision is simple: Every student deserves more than the opportunity to learn. Every student deserves a pathway to succeed.</p></div></div></section>
  <section class="lsec reveal" id="faq"><div class="lsec-h"><span class="eyebrow">Questions</span><h2>Questions schools ask</h2></div>
   <div class="faq">${L_FAQ.map(([qq,a],i)=>`<div class="fq${LD.faq===i?" open":""}"><button data-faq="${i}" aria-expanded="${LD.faq===i}"><span>${qq}</span><span aria-hidden="true">${LD.faq===i?"−":"+"}</span></button>${LD.faq===i?`<p>${a}</p>`:""}</div>`).join("")}</div></section>

  <section class="lsec" id="tutors"><div class="tutor-band"><div><span class="eyebrow">Tutors &amp; consultants</span><h2>Help schools near you</h2>
    <p>Are you a certified teacher, retired educator, or math coach in Mississippi? Join our network. We match tutors and consultants with nearby schools that use Path to Proficiency, so you can help students who need it most.</p>
    <ul class="tutor-steps"><li><b>1</b> Apply online</li><li><b>2</b> Short interview</li><li><b>3</b> Background check</li><li><b>4</b> Sign the agreement online</li><li><b>5</b> Get matched with a school</li></ul></div>
    <button data-go="tutor">Become a tutor or consultant</button></div></section>

  <section class="lcta"><h2>See what Path to Proficiency can do for your school</h2><p>A demonstration takes about 30 minutes, online or in person.</p>
   <div class="row" style="justify-content:center"><button data-go="lead">Schedule a demonstration</button><button class="ghost" data-go="tour">See it in action</button><button class="ghost" data-go="demo">Try it as a student</button></div>
   <p class="muted" style="font-size:.9rem">Already using it? <button class="linklike" data-go="stu">Student login</button> · <button class="linklike" data-go="tch">Teacher login</button></p></section>
  ${siteFooter()}`;
  const go={stu:()=>{S.mode="student";S.code="";S.err="";S.screen=ls.get(CKEY)?"signin":"joinclass";render()},
    tch:()=>teacherEntry(),
    tutor:()=>{S.tDone=false;S.screen="tutorApply";render()},
    tour:()=>startDemoSchool(true),lead:()=>{S.screen="lead";S.leadType="demo";S.leadDone=false;render()},
    ms:()=>{S.screen="mississippi";render()},found:()=>{S.screen="founding";render()},family:()=>{S.screen="lead";S.leadType="family";S.leadDone=false;render()},
    demo:()=>{useTest(null);S.demo=true;S.role="student";db={mastery:MASTERY_DEFAULT,videos:{},goal:60};TEACHER="Demo";
      S.student=initStudent({...JSON.parse(JSON.stringify(SAMPLE[0])),name:"Amari (sample)"});S.screen="home";render()}};
  app.querySelectorAll("[data-go]").forEach(b=>b.onclick=go[b.dataset.go]);wireFooter(go);revealOn();
  const keep=fn=>()=>{const y=window.scrollY;fn();render();window.scrollTo(0,y)};
  app.querySelectorAll("[data-step]").forEach(b=>b.onclick=keep(()=>LD.step=+b.dataset.step));
  document.getElementById("s-prev").onclick=keep(()=>LD.step--);document.getElementById("s-next").onclick=keep(()=>LD.step++);
  app.querySelectorAll("#try .tok").forEach(el=>{if(D.done)return;el.tabIndex=0;el.setAttribute("role","button");const f=keep(()=>{const i=+el.dataset.t;D.hl.has(i)?D.hl.delete(i):D.hl.add(i)});el.onclick=f;el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f()}}});
  app.querySelectorAll("[data-dl]").forEach(b=>b.onclick=keep(()=>{D.sel=b.dataset.dl;D.done=true;D.r=0}));
  const da=document.getElementById("d-again");if(da)da.onclick=keep(()=>{LD.dq={hl:new Set(),sel:null,done:false,r:0}});
  const dp=document.getElementById("d-prev");if(dp)dp.onclick=keep(()=>D.r--);
  const dn=document.getElementById("d-next");if(dn)dn.onclick=keep(()=>D.r++);
  document.getElementById("j-next").onclick=keep(()=>{LD.jour=LD.jour>=L_JOUR.length?0:LD.jour<1?2:LD.jour+1});
  app.querySelectorAll("[data-dt]").forEach(b=>b.onclick=keep(()=>LD.dtab=b.dataset.dt));
  app.querySelectorAll("[data-faq]").forEach(b=>b.onclick=keep(()=>LD.faq=LD.faq===+b.dataset.faq?-1:+b.dataset.faq));
  app.querySelectorAll(".lnav-links a").forEach(a=>a.onclick=e=>{e.preventDefault();document.querySelector(a.getAttribute("href"))?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})});
}

SCREENS.landing=landing;

/* ---------- Sign in with Google (teachers). Google's script loads only after a teacher taps the button. ---------- */
const GOOGLE_CLIENT_ID="230276755248-ols80n51ngf3hmqu8g9ccik9blgt1ehr.apps.googleusercontent.com";
const GICON=`<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" style="vertical-align:-3px;margin-right:6px"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z"/></svg>`;
let gisP=null;
function loadGIS(){return gisP||(gisP=new Promise((ok,no)=>{const s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";s.async=true;s.onload=()=>ok();s.onerror=()=>{gisP=null;no(new Error("Couldn’t reach Google. Check the internet and try again."))};document.head.append(s)}))}
function googleBox(id,label="Sign in with Google"){return `<div id="${id}" class="gbox" style="display:flex;flex-direction:column;align-items:center;gap:6px;margin:.4rem 0"><button class="ghost" id="${id}-go" type="button">${GICON}${esc(label)}</button></div>`}
function wireGoogle(id,onCred,text="signin_with"){const go=document.getElementById(id+"-go");if(!go)return;const label=go.textContent;
  go.onclick=async()=>{go.disabled=true;go.textContent="Opening Google…";
    try{await loadGIS();google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:r=>onCred(r.credential),ux_mode:"popup",auto_select:false});
      const box=document.getElementById(id);if(!box)return;box.innerHTML=`<p class="muted small" style="margin:0">Choose your school Google account:</p><div id="${id}-btn"></div>`;
      google.accounts.id.renderButton(document.getElementById(id+"-btn"),{theme:"outline",size:"large",text,shape:"pill"})}
    catch(e){go.disabled=false;go.innerHTML=GICON+esc(label);const m=document.createElement("p");m.className="err small";m.textContent=e.message;go.after(m)}}}
const googleSignin=async cred=>{try{const d=await api("googleLogin",{credential:cred});S.mode="teacher";startTeacher(d)}catch(e){S.err=e.message;render()}};

/* teacher sign-in: on a multi-district site the teacher first types their school code (remembered on this device) */
async function teacherEntry(){S.mode="teacher";S.code="";S.err="";
  try{const st=await api("status");S.multi=!!st.multi;S.siteInfo=st.multi?st:null;S.screen=st.ready?"signin":"setup"}
  catch(e){if(e.data&&e.data.needSchool){S.multi=true;S.screen="schoolcode";S.err=ls.get(SITEKEY)?e.message:""}else{S.screen="signin";S.err=e.message}}
  render()}
function schoolcode(){
  app.innerHTML=header(`<button class="ghost" id="back">Back</button>`)+`<div class="card" style="text-align:center;align-items:center">
   <h2>Type your school code</h2><p class="muted">Your school admin or Path to Proficiency gave it to you, like <b>rh-bearden</b>. This device will remember it.</p>
   <form id="scf" class="row" style="justify-content:center"><input id="scc" style="width:240px;text-align:center" maxlength="24" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="School code" value="${esc(ls.get(SITEKEY)||"")}"><button>Next</button></form>
   <p class="err" role="alert">${esc(S.err)}</p>
   <p class="muted small" style="margin:.2rem 0">or, if you connected Google before:</p>${googleBox("g-sc")}
   <p class="muted" style="font-size:.85rem">District leader? <button class="link" id="to-da">Sign in to your district</button></p></div>`;
  wireGoogle("g-sc",googleSignin);
  document.getElementById("back").onclick=()=>{S.screen="landing";S.err="";render()};
  document.getElementById("to-da").onclick=()=>{S.screen="districtSignin";S.err="";render()};
  const i=document.getElementById("scc");i.focus();
  document.getElementById("scf").onsubmit=async e=>{e.preventDefault();const v=i.value.trim().toLowerCase();if(!v)return;ls.set(SITEKEY,v);await teacherEntry()};
}
SCREENS.schoolcode=schoolcode;
function joinclass(){
  app.innerHTML=header(`<button class="ghost" id="back">Back</button>`)+`<div class="card" style="text-align:center;align-items:center">
   <p class="kicker">Your next adventure starts here!</p><h2>Type your class code</h2>
   <p class="muted">Your teacher has it. It has 6 letters and numbers.</p>
   <form id="jf" class="row" style="justify-content:center"><input id="jc" class="num" style="width:200px;text-transform:uppercase;letter-spacing:.2em;text-align:center" maxlength="6" autocomplete="off" autocapitalize="characters" aria-label="Class code" value="${esc(S.join||"")}"><button type="submit">Next</button></form>
   <p class="err" role="alert">${esc(S.err)}</p></div>`;
  document.getElementById("back").onclick=()=>{S.screen="landing";S.err="";render()};
  const jc=document.getElementById("jc");jc.focus();
  document.getElementById("jf").onsubmit=async e=>{e.preventDefault();S.join=jc.value.trim().toUpperCase();if(!S.join)return;
    try{const d=await api("join",{join:S.join});ls.set(CKEY,d);S.err="";S.screen="signin";S.code=""}catch(er){S.err=er.message}render()};
}
SCREENS.joinclass=joinclass;

function signin(){
  const teacherMode=S.mode==="teacher",max=teacherMode?6:4,dev=ls.get(CKEY);
  app.innerHTML=header(`<button class="ghost" id="back">Back</button>`)+`<div class="card" style="text-align:center">
   ${teacherMode?"":`<p class="kicker">${dev?esc(dev.name)+(dev.teacher?" · "+esc(dev.teacher):""):"Your next adventure starts here!"}</p>`}
   <h2>${teacherMode?"Type your teacher code":"Type your secret code"}</h2>
   <div class="code-dots" aria-label="${S.code.length} digits typed">${Array.from({length:teacherMode?Math.max(4,S.code.length):4},(_,i)=>`<span class="${i<S.code.length?'on':''}"></span>`).join("")}</div>
   <div class="pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-n="${n}">${n}</button>`).join("")}<button data-n="back" aria-label="Delete">⌫</button><button data-n="0">0</button><button data-n="go">Go</button></div>
   <p class="err" role="alert">${esc(S.err)}</p>
   ${teacherMode&&S.siteInfo?`<p class="muted" style="font-size:.85rem">${esc(S.siteInfo.school.name)}${S.siteInfo.district?" · "+esc(S.siteInfo.district):""} · <button class="link" id="chg-school">Change school</button></p>`:""}
   ${teacherMode?`<p class="muted small" style="margin:.2rem 0">or</p>${googleBox("g-si")}<p class="muted" style="font-size:.85rem">Forgot your code? <button class="link" id="forgot">Reset it</button></p>`:`<p class="muted" style="font-size:.85rem">Not your class? <button class="link" id="chg">Change class</button></p>`}</div>`;
  document.getElementById("back").onclick=()=>{S.screen="landing";S.err="";render()};
  const chg=document.getElementById("chg");if(chg)chg.onclick=()=>{S.screen="joinclass";S.join="";S.err="";render()};
  const fg=document.getElementById("forgot");if(fg)fg.onclick=()=>{S.screen="recover";S.err="";render()};
  const cs=document.getElementById("chg-school");if(cs)cs.onclick=()=>{S.screen="schoolcode";S.err="";render()};
  if(teacherMode)wireGoogle("g-si",googleSignin);
  app.querySelectorAll(".pad button").forEach(b=>b.onclick=async()=>{const n=b.dataset.n;S.err="";
    if(n==="back")S.code=S.code.slice(0,-1);
    else if(n==="go"){const code=S.code;S.code="";
      if(code.length<4){S.err=teacherMode?"Teacher codes have 4 to 6 digits.":"Your code has 4 digits.";render();return}
      app.querySelectorAll(".pad button").forEach(x=>x.disabled=true);
      try{
        if(teacherMode){const d=await api("login",{code});startTeacher(d)}
        else{const d=await api("studentLogin",{join:dev.join,code});startStudent(d)}
        return;
      }catch(e){S.err=e.message}}
    else if(S.code.length<max)S.code+=n; render();});
}
SCREENS.signin=signin;

/* first visit: create the school and the first teacher (who is the admin) */
function setup(){
  app.innerHTML=header(`<button class="ghost" id="back">Back</button>`,"Set up your school")+`<div class="card"><h2>Set up your school</h2>
   <p class="muted">This only happens once. You will be the school admin: you can add other teachers, give classes to them, and compare every class.</p>
   <form class="grid" id="sf">
    ${S.siteInfo&&S.siteInfo.needsKey?`<label class="f" style="grid-column:1/-1">Setup key from Path to Proficiency<input id="s-key" required autocomplete="off" spellcheck="false"></label>`:""}
    <label class="f" style="grid-column:1/-1">School name<input id="s-school" required maxlength="80" placeholder="Lincoln Elementary" value="${esc(S.siteInfo?S.siteInfo.school.name:"")}"></label>
    <label class="f">Your name (what students see)<input id="s-name" required maxlength="60" placeholder="Mr. Barksdale"></label>
    <label class="f">Your teacher code (4 to 6 digits)<input id="s-code" inputmode="numeric" pattern="[0-9]{4,6}" required></label>
    <label class="f">Type the code again<input id="s-code2" inputmode="numeric" pattern="[0-9]{4,6}" required></label>
    <button type="submit">Create my school</button></form>
   <p class="err" id="s-err" role="alert">${esc(S.err)}</p></div>`;
  document.getElementById("back").onclick=()=>{S.screen="landing";S.err="";render()};
  document.getElementById("sf").onsubmit=async e=>{e.preventDefault();const v=id=>document.getElementById(id).value.trim();
    if(v("s-code")!==v("s-code2")){document.getElementById("s-err").textContent="The two codes are different.";return}
    busy(e.submitter,"Creating…");
    try{startTeacher(await api("setup",{schoolName:v("s-school"),name:v("s-name"),code:v("s-code"),...(document.getElementById("s-key")?{setupKey:v("s-key")}:{})}))}catch(er){S.err=er.message;render()}};
}
SCREENS.setup=setup;

/* forgot the admin's teacher code: uses RESET_CODE from Netlify */
function recover(){
  if(S.multi){app.innerHTML=header(`<button class="ghost" id="back">Back</button>`,"Reset teacher code")+`<div class="card"><h2>Forgot your teacher code?</h2>
    <p>Ask your school admin to set a new one for you under <b>Teachers</b>.</p><p class="muted">School admins who forgot their own code: contact Path to Proficiency and we will reset it after checking with your school.</p></div>`;
    document.getElementById("back").onclick=()=>{S.screen="signin";S.mode="teacher";S.err="";render()};return}
  app.innerHTML=header(`<button class="ghost" id="back">Back</button>`,"Reset teacher code")+`<div class="card"><h2>Forgot your teacher code?</h2>
   <ol class="how"><li>In Netlify, open your project, then <b>Project configuration → Environment variables → Add a variable</b>.</li>
    <li>Name it <b>RESET_CODE</b> and give it a secret phrase you’ll remember (at least 6 characters). Tick “Contains secret values”.</li>
    <li>Go to <b>Deploys → Trigger deploy → Deploy project</b> and wait for “Published”.</li>
    <li>Type that phrase below and pick a new teacher code. This resets the school admin’s code.</li></ol>
   <form class="grid" id="rf">
    <label class="f" style="grid-column:1/-1">Reset code from Netlify<input id="r-reset" type="password" required autocomplete="off"></label>
    <label class="f">New teacher code (4 to 6 digits)<input id="r-code" inputmode="numeric" pattern="[0-9]{4,6}" required></label>
    <label class="f">Type it again<input id="r-code2" inputmode="numeric" pattern="[0-9]{4,6}" required></label>
    <button type="submit">Reset my code</button></form>
   <p class="err" id="r-err" role="alert">${esc(S.err)}</p>
   <p class="muted" style="font-size:.85rem">Other teachers who forget their code can have the admin set a new one under Teachers.</p></div>`;
  document.getElementById("back").onclick=()=>{S.screen="signin";S.mode="teacher";S.err="";render()};
  document.getElementById("rf").onsubmit=async e=>{e.preventDefault();const v=id=>document.getElementById(id).value.trim();
    if(v("r-code")!==v("r-code2")){document.getElementById("r-err").textContent="The two codes are different.";return}
    busy(e.submitter,"Resetting…");
    try{startTeacher(await api("recover",{reset:document.getElementById("r-reset").value,code:v("r-code")}));alert("Your teacher code is reset. You can now remove RESET_CODE in Netlify.")}
    catch(er){S.err=er.message;render()}};
}
SCREENS.recover=recover;

