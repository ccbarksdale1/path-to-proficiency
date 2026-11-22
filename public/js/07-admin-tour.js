/* Path to Proficiency · Admin pages, lesson packets, parent letters, guided tour, leads, benchmark windows.
   Loaded in order by index.html as plain scripts that share one global scope. */
/* ---------- admin: review applications ---------- */
function tTutors(){
  if(!isAdmin())return `<div class="card"><p class="muted">Only the site admin can see tutor applications.</p></div>`;
  const D=S.tutors;if(!D){api("tutorList").then(d=>{S.tutors=d;if(S.tt==="tutors")render()}).catch(e=>{S.err=e.message;render()});return `<div class="card"><p class="muted">Loading applications…</p></div>`}
  const F=S.tf||(S.tf={status:"open",county:"",grade:""});
  const list=D.tutors.filter(r=>(F.status==="all"||(F.status==="open"?!["declined","active"].includes(r.status):r.status===F.status))&&(!F.county||r.county===F.county||r.travel==="state"||r.travel==="virtual")&&(!F.grade||r.grades.includes(F.grade)));
  const counts=Object.keys(T_STAT).map(k=>[k,D.tutors.filter(r=>r.status===k).length]).filter(x=>x[1]);
  const counties=[...new Set(D.tutors.map(r=>r.county))].sort();
  return `<div class="card"><div class="top"><h2>Tutors &amp; consultants</h2><div class="row"><button class="ghost small" id="tu-link">Copy application link</button><button class="ghost small" id="tu-csv">Download CSV</button></div></div>
   <p class="muted">People apply from the “Become a tutor” button on the home page. Only you (the admin) can see this page.</p>
   <p style="font-size:.9rem">${counts.length?counts.map(([k,n])=>`<span class="pill${k==="new"?" gold":k==="active"||k==="signed"?" go":""}">${T_STAT[k]}: ${n}</span>`).join(" "):"No applications yet."}</p>
   <div class="row">
    <label class="f" style="min-width:150px">Show<select id="tu-st"><option value="open">Open (not active/declined)</option><option value="all">All</option>${Object.entries(T_STAT).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select></label>
    <label class="f" style="min-width:150px">Near county<select id="tu-co"><option value="">Any county</option>${counties.map(c=>`<option>${esc(c)}</option>`).join("")}</select></label>
    <label class="f" style="min-width:110px">Grade<select id="tu-gr"><option value="">Any</option>${["3","4","5","6","7","8","9"].map(g=>`<option value="${g}">${g==="9"?"Algebra I":g}</option>`).join("")}</select></label></div></div>
  <div class="card"><h3>Contract</h3><p class="muted" style="font-size:.9rem">When you approve someone, send them the contractor agreement from Jotform Sign, then mark them “Contract sent.” Paste the link to your agreement in Jotform here so it’s one click away.</p>
   <form class="row" id="tu-cf"><input id="tu-cu" type="url" placeholder="https://www.jotform.com/sign/…" value="${esc(D.contractUrl||"")}" style="flex:1;min-width:220px"><button class="small" type="submit">Save link</button>${D.contractUrl?`<a class="btnlink" href="${esc(D.contractUrl)}" target="_blank" rel="noopener">Open in Jotform Sign ↗</a>`:""}</form><p class="muted" id="tu-cm" role="status"></p></div>
  ${list.length?list.map(r=>{const open=S.tuOpen===r.id;return `<div class="card tu${open?" open":""}"><button class="tu-head" data-tu="${r.id}" aria-expanded="${open}">
     <span><b>${esc(r.name)}</b> <span class="muted">· ${esc(T_ROLE[r.role].split(" (")[0])} · ${esc(r.county)}${r.city?`, ${esc(r.city)}`:""} · ${esc(T_TRAVEL[r.travel])}</span><br>
     <span class="muted" style="font-size:.85rem">Grades ${r.grades.map(g=>g==="9"?"Alg I":g).join(", ")} · ${esc(T_LIC[r.license])} · ${r.years} yr${r.years===1?"":"s"}${r.rate?` · $${r.rate}/hr`:""} · applied ${new Date(r.t).toLocaleDateString()}</span></span>
     <span class="pill${r.status==="new"?" gold":["signed","active"].includes(r.status)?" go":r.status==="declined"?"":" purple"}">${T_STAT[r.status]}</span></button>
    ${open?`<div class="tu-body"><div class="grid">
      <div><span class="label">Contact</span><p><a href="mailto:${esc(r.email)}">${esc(r.email)}</a>${r.phone?`<br>${esc(r.phone)}`:""}</p></div>
      <div><span class="label">Strongest areas</span><p>${r.areas.length?r.areas.map(a=>esc(T_AREAS[a])).join(", "):"—"}</p></div>
      <div><span class="label">License</span><p>${esc(T_LIC[r.license])}${r.licenseNote?` (${esc(r.licenseNote)})`:""}</p></div>
      <div><span class="label">Availability</span><p>${r.days.length?r.days.join(", "):"—"}${r.times?`<br>${esc(r.times)}`:""}</p></div></div>
      ${r.about?`<div><span class="label">About</span><p style="white-space:pre-wrap">${esc(r.about)}</p></div>`:""}
      <p style="font-size:.9rem">✅ Agreed to a background check${r.file?` · <button class="link" data-tfile="${r.id}">Download résumé (${esc(r.file.name)})</button>`:" · No résumé uploaded"}</p>
      <div class="row"><label class="f" style="min-width:180px">Status<select data-tst="${r.id}">${Object.entries(T_STAT).map(([k,v])=>`<option value="${k}" ${r.status===k?"selected":""}>${v}</option>`).join("")}</select></label>
       ${D.contractUrl&&["approved","interview"].includes(r.status)?`<a class="btnlink" href="${esc(D.contractUrl)}" target="_blank" rel="noopener">Send contract in Jotform ↗</a>`:""}</div>
      <label class="f">Your private notes<textarea data-tnote="${r.id}" rows="3" maxlength="2000">${esc(r.note||"")}</textarea></label>
      <div class="row"><button class="small" data-tsave="${r.id}">Save notes</button><button class="ghost small" data-tdel="${r.id}">Delete application</button><span class="muted" id="tm-${r.id}" role="status"></span></div>
      ${(r.log||[]).length?`<p class="muted" style="font-size:.8rem">History: ${r.log.map(x=>`${T_STAT[x.s]} ${new Date(x.t).toLocaleDateString()}`).join(" → ")}</p>`:""}
     </div>`:""}</div>`}).join(""):`<div class="card"><p class="muted">No applications match these filters.</p></div>`}`;
}
function wireTutors(){
  if(!isAdmin()||!S.tutors)return;const D=S.tutors,F=S.tf;
  const st=document.getElementById("tu-st");st.value=F.status;st.onchange=()=>{F.status=st.value;render()};
  const co=document.getElementById("tu-co");co.value=F.county;co.onchange=()=>{F.county=co.value;render()};
  const gr=document.getElementById("tu-gr");gr.value=F.grade;gr.onchange=()=>{F.grade=gr.value;render()};
  document.getElementById("tu-link").onclick=async e=>{const u=location.origin+"/#tutor";try{await navigator.clipboard.writeText(u);e.target.textContent="Link copied!"}catch(er){e.target.textContent=u}};
  document.getElementById("tu-csv").onclick=()=>{const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;
    const rows=[["Applied","Status","Name","Email","Phone","Role","County","City","Travel","Grades","Areas","License","License note","Years","Rate","Days","Times","Résumé","Notes"],...D.tutors.map(r=>[new Date(r.t).toLocaleDateString(),T_STAT[r.status],r.name,r.email,r.phone,r.role,r.county,r.city,T_TRAVEL[r.travel],r.grades.join(" "),r.areas.join(" "),T_LIC[r.license],r.licenseNote,r.years,r.rate,r.days.join(" "),r.times,r.file?"yes":"no",r.note])];
    saveFile(`tutor-applications-${new Date().toISOString().slice(0,10)}.csv`,rows.map(r=>r.map(q).join(",")).join("\n"))};
  document.getElementById("tu-cf").onsubmit=async e=>{e.preventDefault();const u=document.getElementById("tu-cu").value.trim();busy(e.submitter,"Saving…");
    try{await api("contractSave",{url:u});D.contractUrl=u;flash("tu-cm","Saved.");render()}catch(er){document.getElementById("tu-cm").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Save link"}};
  app.querySelectorAll("[data-tu]").forEach(b=>b.onclick=()=>{S.tuOpen=S.tuOpen===b.dataset.tu?null:b.dataset.tu;render()});
  const upd=async(id,patch)=>{const d=await api("tutorUpdate",{id,...patch});Object.assign(D.tutors.find(x=>x.id===id),d.tutor);return d};
  app.querySelectorAll("[data-tst]").forEach(s=>s.onchange=async()=>{try{await upd(s.dataset.tst,{status:s.value});render()}catch(e){S.err=e.message;render()}});
  app.querySelectorAll("[data-tsave]").forEach(b=>b.onclick=async()=>{const id=b.dataset.tsave,m=document.getElementById("tm-"+id);busy(b,"Saving…");
    try{await upd(id,{note:app.querySelector(`[data-tnote="${id}"]`).value});m.textContent="Saved."}catch(e){m.textContent=e.message}b.disabled=false;b.textContent="Save notes"});
  app.querySelectorAll("[data-tdel]").forEach(b=>b.onclick=async()=>{const r=D.tutors.find(x=>x.id===b.dataset.tdel);if(!confirm(`Delete ${r.name}’s application and résumé? This can’t be undone.`))return;
    try{await api("tutorDelete",{id:r.id});D.tutors=D.tutors.filter(x=>x.id!==r.id);S.tuOpen=null;render()}catch(e){S.err=e.message;render()}});
  app.querySelectorAll("[data-tfile]").forEach(b=>b.onclick=async()=>{try{const {file}=await api("tutorFile",{id:b.dataset.tfile});const bin=atob(file.data),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([u],{type:file.type}));a.download=file.name||"resume";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800)}catch(e){S.err=e.message;render()}});
}

/* ================= Individualized math programs =================
   A student who scores below the class cut score gets a 6-week plan, built automatically:
   for each standard they missed most, we step back through its prerequisite standards
   (skipping ones they already showed they know) so lessons build up to grade level. */
const PREQ={
 "3.OA.2":["3.OA.1"],"3.OA.3":["3.OA.1","3.OA.2"],"3.OA.4":["3.OA.6"],"3.OA.5":["3.OA.1"],"3.OA.6":["3.OA.2"],"3.OA.7":["3.OA.5","3.OA.6"],"3.OA.8":["3.OA.3","3.NBT.2"],"3.OA.9":["3.OA.7"],
 "3.NBT.3":["3.OA.7"],"3.NF.1":["3.G.2"],"3.NF.2a":["3.NF.1"],"3.NF.2b":["3.NF.2a"],"3.NF.3a":["3.NF.2b"],"3.NF.3b":["3.NF.3a"],"3.NF.3c":["3.NF.1"],"3.NF.3d":["3.NF.1","3.NF.2b"],
 "3.MD.2":["3.NBT.2"],"3.MD.3":["3.OA.3"],"3.MD.4":["3.NF.2b"],"3.MD.5b":["3.MD.5a"],"3.MD.6":["3.MD.5b"],"3.MD.7a":["3.MD.6","3.OA.1"],"3.MD.7b":["3.MD.7a","3.OA.7"],"3.MD.7c":["3.MD.7b","3.OA.5"],"3.MD.7d":["3.MD.7b"],"3.MD.8":["3.MD.7b","3.NBT.2"],"3.G.2":["3.G.1"],
 "4.OA.1":["3.OA.1"],"4.OA.2":["4.OA.1","3.OA.3"],"4.OA.3":["3.OA.8","4.NBT.5"],"4.OA.4":["3.OA.7"],"4.OA.5":["3.OA.9"],
 "4.NBT.1":["3.NBT.3"],"4.NBT.2":["4.NBT.1"],"4.NBT.3":["3.NBT.1","4.NBT.2"],"4.NBT.4":["3.NBT.2","4.NBT.2"],"4.NBT.5":["3.NBT.3","3.MD.7c"],"4.NBT.6":["3.OA.6","3.OA.7"],
 "4.NF.1":["3.NF.3b"],"4.NF.2":["3.NF.3d","4.NF.1"],"4.NF.3a":["3.NF.1"],"4.NF.3b":["4.NF.3a"],"4.NF.3c":["4.NF.3b","3.NF.3c"],"4.NF.3d":["4.NF.3a"],"4.NF.4a":["3.NF.1","3.OA.1"],"4.NF.4b":["4.NF.4a"],"4.NF.4c":["4.NF.4b"],"4.NF.5":["4.NF.1"],"4.NF.6":["4.NF.5"],"4.NF.7":["4.NF.6"],
 "4.MD.1":["3.MD.2","3.OA.7"],"4.MD.2":["4.MD.1","3.MD.1"],"4.MD.3":["3.MD.7b","3.MD.8"],"4.MD.4":["3.MD.4","4.NF.3a"],"4.MD.5a":["4.G.1"],"4.MD.5b":["4.MD.5a"],"4.MD.6":["4.MD.5b"],"4.MD.7":["4.MD.6"],
 "4.G.1":["3.G.1"],"4.G.2":["4.G.1"],"4.G.3":["3.G.1"],
 "5.OA.1":["4.OA.3"],"5.OA.2":["5.OA.1"],"5.OA.3":["4.OA.5"],"5.NBT.1":["4.NBT.1","4.NF.6"],"5.NBT.2":["5.NBT.1"],"5.NBT.3a":["4.NF.6"],"5.NBT.3b":["5.NBT.3a","4.NF.7"],"5.NBT.4":["5.NBT.3a","4.NBT.3"],"5.NBT.5":["4.NBT.5"],"5.NBT.6":["4.NBT.6"],"5.NBT.7":["5.NBT.3a","4.NBT.4"],
 "5.NF.1":["4.NF.1","4.NF.3a"],"5.NF.2":["5.NF.1"],"5.NF.3":["4.NBT.6","3.NF.1"],"5.NF.4a":["4.NF.4b"],"5.NF.4b":["5.NF.4a","4.MD.3"],"5.NF.5a":["5.NF.4a"],"5.NF.5b":["5.NF.5a"],"5.NF.6":["5.NF.4a"],"5.NF.7a":["5.NF.3"],"5.NF.7b":["5.NF.3"],"5.NF.7c":["5.NF.7a","5.NF.7b"],
 "5.MD.1":["4.MD.1","5.NBT.2"],"5.MD.2":["4.MD.4","5.NF.1"],"5.MD.3a":["3.MD.5a"],"5.MD.3b":["5.MD.3a"],"5.MD.4":["5.MD.3b"],"5.MD.5a":["5.MD.4","3.MD.7b"],"5.MD.5b":["5.MD.5a"],"5.MD.5c":["5.MD.5b"],
 "5.G.1":["4.G.1"],"5.G.2":["5.G.1"],"5.G.3":["4.G.2"],"5.G.4":["5.G.3"]};

/* grades 6–8 and Algebra I: what each standard builds on */
Object.assign(PREQ,{
 "6.RP.1":["4.OA.1","5.NF.5a"],"6.RP.2":["6.RP.1","5.NF.3"],"6.RP.3":["6.RP.2"],"6.RP.3a":["6.RP.1","5.OA.3"],"6.RP.3b":["6.RP.2"],"6.RP.3c":["6.RP.2","5.NBT.7"],"6.RP.3d":["6.RP.2","5.MD.1"],
 "6.NS.1":["5.NF.7c","5.NF.4a"],"6.NS.2":["5.NBT.6"],"6.NS.3":["5.NBT.7"],"6.NS.4":["4.OA.4"],"6.NS.6":["6.NS.5"],"6.NS.6a":["6.NS.5"],"6.NS.6b":["5.G.1","6.NS.6a"],"6.NS.6c":["6.NS.6a"],"6.NS.7a":["6.NS.6c"],"6.NS.7b":["6.NS.7a"],"6.NS.7c":["6.NS.6a"],"6.NS.7d":["6.NS.7c"],"6.NS.8":["6.NS.6c","6.NS.7c"],
 "6.NS.9a":["6.NS.5"],"6.NS.9b":["6.NS.9a","6.NS.6c"],"6.NS.9c":["6.NS.9b"],"6.NS.9d":["6.NS.9c"],
 "6.EE.1":["5.NBT.2","5.OA.1"],"6.EE.2a":["5.OA.2"],"6.EE.2b":["6.EE.2a"],"6.EE.2c":["6.EE.2a","6.EE.1"],"6.EE.3":["6.NS.4","6.EE.2b"],"6.EE.4":["6.EE.3"],"6.EE.5":["6.EE.2c"],"6.EE.6":["6.EE.2a"],"6.EE.7":["6.EE.5","6.EE.6"],"6.EE.8":["6.EE.5","6.NS.7a"],"6.EE.9":["6.EE.6","6.RP.3a"],
 "6.G.1":["4.MD.3","5.NF.4b"],"6.G.2":["5.MD.5b","5.NF.4a"],"6.G.3":["6.NS.8"],"6.G.4":["6.G.1"],"6.SP.2":["6.SP.1"],"6.SP.3":["6.SP.2"],"6.SP.4":["5.MD.2"],"6.SP.5c":["6.SP.3","6.NS.3"],"6.SP.5d":["6.SP.5c"],
 "7.RP.1":["6.RP.2","6.NS.1"],"7.RP.2a":["6.RP.3a"],"7.RP.2b":["7.RP.1","7.RP.2a"],"7.RP.2c":["7.RP.2b","6.EE.9"],"7.RP.2d":["7.RP.2b"],"7.RP.3":["6.RP.3c"],
 "7.NS.1a":["6.NS.9a"],"7.NS.1b":["6.NS.9b"],"7.NS.1c":["6.NS.9c"],"7.NS.1d":["7.NS.1c"],"7.NS.2a":["7.NS.1d"],"7.NS.2b":["7.NS.2a"],"7.NS.2c":["7.NS.2b"],"7.NS.2d":["6.NS.2","5.NF.3"],"7.NS.3":["7.NS.2c"],
 "7.EE.1":["6.EE.3","7.NS.1d"],"7.EE.2":["7.EE.1","7.RP.3"],"7.EE.3":["7.NS.3"],"7.EE.4a":["6.EE.7","7.NS.3"],"7.EE.4b":["6.EE.8","7.EE.4a"],
 "7.G.1":["7.RP.2b"],"7.G.4":["6.G.1"],"7.G.5":["4.MD.7"],"7.G.6":["6.G.1","6.G.2","6.G.4"],"7.SP.2":["7.SP.1"],"7.SP.3":["6.SP.5c"],"7.SP.4":["7.SP.3"],"7.SP.6":["7.SP.5"],"7.SP.7a":["7.SP.5"],"7.SP.7b":["7.SP.6"],"7.SP.8a":["7.SP.7a"],"7.SP.8b":["7.SP.8a"],"7.SP.8c":["7.SP.8b"],
 "8.NS.1":["7.NS.2d"],"8.NS.2":["8.NS.1","8.EE.2"],"8.EE.1":["6.EE.1","7.NS.2c"],"8.EE.2":["6.EE.1"],"8.EE.3":["8.EE.1"],"8.EE.4":["8.EE.3"],"8.EE.5":["7.RP.2d"],"8.EE.6":["8.EE.5","7.G.1"],"8.EE.7a":["7.EE.4a"],"8.EE.7b":["8.EE.7a","7.EE.1"],
 "8.EE.8a":["8.EE.6"],"8.EE.8b":["8.EE.8a","8.EE.7b"],"8.EE.8c":["8.EE.8b"],"8.F.1":["6.EE.9"],"8.F.2":["8.F.1","8.EE.5"],"8.F.3":["8.EE.6"],"8.F.4":["8.F.3"],"8.F.5":["8.F.3"],
 "8.G.1a":["4.G.1"],"8.G.2":["8.G.1a","8.G.1b"],"8.G.3":["6.NS.6b","8.G.2"],"8.G.4":["8.G.3","7.G.1"],"8.G.5":["7.G.5"],"8.G.6":["8.EE.2"],"8.G.7":["8.G.6"],"8.G.8":["8.G.7","6.NS.8"],"8.G.9":["7.G.4","8.EE.2"],
 "8.SP.1":["6.SP.4"],"8.SP.2":["8.SP.1"],"8.SP.3":["8.SP.2","8.F.4"],"8.SP.4":["7.SP.8b"],
 "N-RN.3":["8.NS.1"],"A-SSE.1a":["6.EE.2b","7.EE.1"],"A-SSE.1b":["A-SSE.1a"],"A-SSE.2":["A-SSE.1a"],"A-SSE.3a":["A-SSE.2"],"A-SSE.3b":["A-SSE.3a"],"A-SSE.3c":["8.EE.1"],"A-APR.1":["7.EE.1"],"A-APR.3":["A-SSE.3a"],
 "A-CED.1":["7.EE.4a"],"A-CED.2":["8.F.4"],"A-CED.3":["A-CED.2","7.EE.4b"],"A-CED.4":["A-REI.3"],"A-REI.1":["7.EE.4a"],"A-REI.3":["8.EE.7b","7.EE.4b"],"A-REI.4a":["A-SSE.3b"],"A-REI.4b":["A-SSE.3a","8.EE.2"],"A-REI.5":["8.EE.8b"],"A-REI.6":["8.EE.8b"],
 "A-REI.10":["8.F.1"],"A-REI.11":["A-REI.10","8.EE.8a"],"A-REI.12":["A-REI.10","A-REI.3"],"F-IF.1":["8.F.1"],"F-IF.2":["F-IF.1","6.EE.2c"],"F-IF.3":["F-IF.2"],"F-IF.4":["8.F.5"],"F-IF.5":["F-IF.1"],"F-IF.6":["8.F.4"],
 "F-IF.7a":["8.F.3","A-SSE.3a"],"F-IF.7b":["F-IF.7a"],"F-IF.8a":["A-SSE.3a","A-SSE.3b"],"F-IF.9":["8.F.2"],"F-BF.1a":["8.F.4","F-IF.3"],"F-BF.3":["F-IF.7a"],"F-LE.1a":["8.F.3"],"F-LE.1b":["F-LE.1a"],"F-LE.1c":["F-LE.1a","7.RP.3"],"F-LE.2":["F-LE.1a","8.F.4"],"F-LE.5":["F-LE.2"],
 "S-ID.1":["6.SP.4"],"S-ID.2":["6.SP.5c"],"S-ID.3":["S-ID.2"],"S-ID.5":["8.SP.4"],"S-ID.6a":["8.SP.3"],"S-ID.6b":["S-ID.6a"],"S-ID.6c":["8.SP.2"],"S-ID.7":["8.SP.3"],"S-ID.8":["S-ID.6c"],"S-ID.9":["S-ID.8"]});
const ipWk=(i,n)=>{const a=Math.floor(i*IP_WEEKS/n)+1,b=Math.max(a,Math.floor((i+1)*IP_WEEKS/n));return a===b?`${a}`:`${a}–${b}`};
const IP_WEEKS=6,IP_LVL={back:"Step back",build:"Building block",grade:"On grade level"};
const ipCfg=()=>(CUR&&CUR.cls.ip)||{on:true,cut:60};
const ipActive=s=>!!(s&&s.ip&&s.ip.status==="active"&&s.ip.steps&&s.ip.steps.length);
const ipCodes=s=>ipActive(s)?s.ip.steps.map(x=>x.std):[];
const isoDay=d=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`};
const niceDay=v=>v?new Date(v+"T12:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}):"—";
/* a test score: from missed questions when the test has numbered questions, otherwise one the teacher typed in */
function testScore(s){return scorePct(s)}
const skOf=(s,code)=>{const k=SKILLS.find(x=>x.std===code);return k&&s.prog.skills[k.id]?{k,sk:s.prog.skills[k.id]}:null};
const ipKnown=(s,code)=>{const o=skOf(s,code);return !!o&&(o.sk.status==="done"||o.sk.status==="skip")};
const ipDone=(s,code)=>{const o=skOf(s,code);return !!o&&o.sk.status==="done"};
function buildProgram(s,score,cut){
  let targets=[];
  if(NQ>0&&Array.isArray(s.missed)&&s.missed.length){
    targets=SKILLS.filter(k=>k.qs&&k.qs.length).map(k=>({c:k.std,n:k.qs.filter(n=>s.missed.includes(n)).length,w:STD_W(k.std)})).filter(x=>x.n).sort((a,b)=>b.n-a.n||b.w-a.w).map(x=>x.c);
  }
  if(!targets.length){const tr=trailFor(s).filter(k=>!ipKnown(s,k.std)&&!k.extra);
    targets=tr.map((k,i)=>({c:k.std,sc:stdScore(s,k)??.25,w:STD_W(k.std),i})).sort((x,y)=>x.sc-y.sc||y.w-x.w||x.i-y.i).map(x=>x.c)}
  targets=[...new Set(targets)].filter(c=>LIBC[c]).slice(0,3);
  const g=gradeOf(),steps=[],tset=new Set(targets);
  const chain=(code,depth,target,out)=>{if(steps.some(x=>x.std===code)||out.some(x=>x.std===code))return;
    if(depth<2)(PREQ[code]||[]).forEach(p=>{if(LIBC[p]&&!ipKnown(s,p)&&stdGrade(p)<=stdGrade(code))chain(p,depth+1,target,out)});
    out.push({std:code,lvl:tset.has(code)?"grade":(stdGrade(code)<g?"back":"build"),for:target})};
  /* add whole chains while they fit in 6 weeks (about 8 lessons); the first target always goes in */
  targets.forEach((t,i)=>{const out=[];chain(t,0,t,out);if(i===0||steps.length+out.length<=8)steps.push(...out)});
  while(steps.length>8){const i=steps.findIndex(x=>x.lvl!=="grade");if(i<0)break;steps.splice(i,1)}
  const now=Date.now();
  return {start:isoDay(now),end:isoDay(now+IP_WEEKS*7*864e5),testId:TESTID,score,cut,status:"active",round:1,note:"",steps,hist:[],sessions:3,minutes:20,exit:""};
}
/* runs whenever a class opens or scores are saved: new low scores get a plan right away */
async function autoPrograms(){
  const c=ipCfg();if(!CUR||c.on===false||S.ipRunning)return;
  const made=[];
  CUR.raw.forEach((raw,i)=>{const s=CUR.students[i];if(raw.sample||raw.ip)return;const sc=testScore(s);if(sc==null||sc>=c.cut)return;
    const p=buildProgram(s,sc,c.cut);if(!p.steps.length)return;raw.ip=p;made.push(raw.name)});
  if(!made.length)return;
  S.ipRunning=true;
  try{await saveRoster(CUR.raw);S.ipNew=made;const keep=[...app.querySelectorAll('[role=status][id]')].map(e=>[e.id,e.textContent]);render();keep.forEach(([id,tx])=>{const e=document.getElementById(id);if(e&&!e.textContent)e.textContent=tx})}catch(e){S.err="Could not save the new individual plans: "+e.message;render()}
  S.ipRunning=false;
}
function ipWeek(ip){const d=Math.floor((Date.now()-new Date(ip.start+"T00:00:00"))/864e5);return Math.max(1,Math.min(IP_WEEKS,Math.floor(d/7)+1))}
const ipDue=ip=>Date.now()>=new Date(ip.end+"T00:00:00").getTime();
const ipExit=ip=>ip.exit||`Master every lesson in the plan (${db.mastery||10} right in a row on each) and score at least ${ip.cut}% on the next benchmark or screener.`;
/* exit evidence: a benchmark/screener score from a window AFTER the plan started (Fall = Jul–Nov, Winter = Dec–Feb, Spring = Mar–Jun) */
const ipWinOf=t=>{const m=new Date(t).getMonth();return m>=6&&m<=10?0:(m===11||m<=1)?1:2};
function ipEvidence(s,ip){const t0=new Date(ip.start+"T00:00:00").getTime(),yr=schoolYear(t0),w0=ipWinOf(t0),b=((s.bm||{})[yr])||{};
  for(let w=WINS.length-1;w>w0;w--){const v=b[WINS[w]];if(v!=null&&v!=="")return {win:WINS[w],score:+v}}return null}
/* plan state: lesson work and the reassessment are separate; a plan is only "ready to exit" when both are met */
function ipState(s){const ip=s.ip,got=ip.steps.filter(x=>ipDone(s,x.std)).length,n=ip.steps.length,ev=ipEvidence(s,ip),lessons=got===n,timeUp=ipDue(ip);
  const k=lessons&&ev&&ev.score>=ip.cut?"eligible":lessons&&ev?"below":lessons?"awaiting":timeUp?"due":"active";return {k,got,n,ev,lessons,timeUp}}
/* weekly progress check: accuracy on the plan’s standards each week since the plan started */
function ipWeeks(s){const ip=s.ip,ids=new Set(ip.steps.map(x=>(SKILLS.find(k=>k.std===x.std)||{}).id).filter(Boolean)),t0=new Date(ip.start+"T00:00:00").getTime(),W={};
  Object.entries(s.prog.days||{}).forEach(([d,x])=>{const t=new Date(d+"T12:00:00").getTime();if(t<t0)return;const w=Math.floor((t-t0)/(7*864e5));if(w>=IP_WEEKS*2)return;const o=W[w]||(W[w]={n:0,ok:0,ms:0});
    Object.entries(x).forEach(([k,v])=>{if(ids.has(k)){o.n+=v.n;o.ok+=v.ok;o.ms+=v.ms}})});
  return Object.keys(W).map(Number).sort((a,b)=>a-b).filter(w=>W[w].n).map(w=>({w,acc:Math.round(W[w].ok/W[w].n*100),n:W[w].n,min:Math.round(W[w].ms/60000)}))}
const ipStdLabel=c=>`${esc(c)} · ${esc((LIBC[c]||{}).name||"")}`;

/* ---------- teacher tab ---------- */
function tIP(){
  const c=ipCfg(),real=CUR.students.filter(s=>!s.sample),withIP=real.filter(s=>s.ip),needScore=NQ>0?[]:real;
  const notice=S.ipNew&&S.ipNew.length?`<div class="fb go" role="status"><p>📘 New Individualized Math Plans started for ${S.ipNew.map(esc).join(", ")}. Their trails now start with the building blocks they need, and their lesson packets are ready to print.</p></div>`:"";
  return `${notice}<div class="card"><div class="top"><h2>Individualized Math Plans (IMPs)</h2>${withIP.some(ipActive)?`<button class="ghost small" id="ip-all">🖨 Print all lesson packets</button>`:""}</div>
   <p class="muted">${c.on===false?"Automatic plans are off for this class. Turn them on in Class settings.":`Any student who scores below <b>${c.cut}%</b> on ${esc(TEST_NAME)} gets a ${IP_WEEKS}-week Individualized Math Plan automatically: the interventions (prerequisite lessons first), how often, weekly progress checks, exit criteria, and a parent letter. The plan steps back to the prerequisite standards they still need, so each lesson builds on the last one up to grade level. Their online trail follows the same order, and you get a printable, scaffolded lesson packet for each student.`}</p>
   <p class="muted" style="font-size:.85rem">Change the cut score in Class settings.</p></div>
  ${needScore.length?`<div class="card"><h3>Benchmark scores</h3><p class="muted">${esc(TEST_NAME)} has no numbered test questions, so type each student’s score (%) from your benchmark or screener. Students below ${c.cut}% get a plan when you save.</p>
   <form id="ip-sc" class="grid">${needScore.map(s=>`<label class="f">${esc(s.name)}<input type="number" min="0" max="100" data-sc="${s.id}" value="${s.scores&&s.scores[TESTID]!=null?s.scores[TESTID]:""}" placeholder="%"></label>`).join("")}
   <div style="grid-column:1/-1"><button type="submit">Save scores</button> <span class="muted" id="ip-scm" role="status"></span></div></form></div>`:""}
  ${withIP.length?withIP.map(ipCard).join(""):`<div class="card"><p class="muted">${real.length?"No students are below the cut score right now.":"Add students and their scores to get started."}</p></div>`}`;
}
function ipCard(s){
  const ip=s.ip,act=ipActive(s),st=ipState(s),{got,n,ev}=st,due=act&&st.k!=="active";
  const cur=act?ip.steps.find(x=>!ipDone(s,x.std)):null;
  return `<div class="card ipc"><div class="top"><div><h3 style="margin:0">${esc(s.name)}</h3><span class="muted" style="font-size:.85rem">Scored ${ip.score}% (cut ${ip.cut}%) · ${niceDay(ip.start)} – ${niceDay(ip.end)}${ip.round>1?` · round ${ip.round}`:""}</span></div>
    <span class="pill ${act?(st.k==="eligible"?"go":due?"gold":"purple"):ip.status==="met"?"go":""}">${act?({eligible:"Ready to exit",below:"Below cut on re-check",awaiting:"Lessons done · awaiting screener",due:"Re-check due",active:`Week ${ipWeek(ip)} of ${IP_WEEKS}`})[st.k]:ip.status==="met"?"Goal met":ip.status==="exited"?"Exited":"Stopped"}</span></div>
   <div class="ipmeta"><span><b>Frequency</b> ${ip.sessions||3}× a week, ${ip.minutes||20} min</span><span><b>Progress checks</b> weekly accuracy on plan standards (goal 70%)</span><span><b>Exit</b> ${esc(ipExit(ip))}</span></div>
   ${fidelityHTML(CUR.raw.find(x=>x.id===s.id)||s,s)}<div class="ipmeta ipdose">${dosageLine(CUR.raw.find(x=>x.id===s.id)||s,s,new Date(ip.start+"T00:00:00").getTime(),(ip.sessions||3)*(ip.minutes||20)).html}</div>
   <div class="ipbar" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${got}" aria-label="${got} of ${n} lessons mastered"><span style="width:${n?got/n*100:0}%"></span></div>
   ${(()=>{const W=ipWeeks(s);if(!W.length)return `<p class="muted" style="font-size:.85rem">Weekly progress checks appear here once ${esc(s.name.split(" ")[0])} practices plan lessons.</p>`;
     const planned=(ip.sessions||3)*(ip.minutes||20),last=W[W.length-1];
     return `<div class="ipmon"><div>${lineChart(W.map(x=>({label:"Wk "+(x.w+1),y:x.acc,tip:`Week ${x.w+1}: ${x.acc}% right on plan standards (${x.n} questions, ${x.min} min)`})),{max:100,unit:"%",goal:70,goalLabel:"goal 70%"})}</div>
      <p class="muted" style="font-size:.85rem">Latest week: <b>${last.acc}%</b> on plan standards · ${last.min} of ${planned} planned minutes. ${last.acc>=70?"Above the goal line.":W.length>=3&&W.slice(-3).every(x=>x.acc<70)?((F=>F&&F.lvl&&F.lvl!=="full"?`Below the goal line 3 weeks in a row, but only ${F.pct}% of the planned teacher minutes happened. Carry out the plan fully before changing it.`:"Below the goal line 3 weeks in a row: consider adjusting the plan.")(fidelity(CUR.raw.find(x=>x.id===s.id)||s,s))):"Keep going."}</p></div>`})()}
   <ol class="ipsteps">${ip.steps.map((x,i)=>{const d=ipDone(s,x.std);return `<li class="${d?"done":cur===x?"now":""}"><span class="ipn">${d?"✓":i+1}</span><span>${ipStdLabel(x.std)}<br><span class="muted" style="font-size:.8rem">${IP_LVL[x.lvl]}${x.lvl!=="grade"?` → builds toward ${esc(x.for)}`:""}</span></span>${d?`<span class="pill go">Mastered</span>`:cur===x?`<span class="pill now">Working on</span>`:""}</li>`}).join("")}</ol>
   ${due?`<div class="fb ${st.k==="eligible"?"ok":"info"}"><p><b>${st.k==="due"?`${IP_WEEKS}-week re-check:`:"Where things stand:"}</b> ${got} of ${n} lessons mastered. ${ev?`${ev.win} score: <b>${ev.score}%</b> (cut ${ip.cut}%).`:"No benchmark or screener score yet from after the plan started."} ${
      st.k==="eligible"?"Both exit criteria are met.":st.k==="below"?"The lessons are done, but the re-check score is below the cut. Consider another round or a different approach.":st.k==="awaiting"?`The lessons are done. Enter the next benchmark or screener score on the Benchmarks tab; the plan is ready to exit only if it is at least ${ip.cut}%.`:"Not every lesson is mastered yet. What next?"}</p></div>`:""}
   ${(ip.hist||[]).length?`<p class="muted" style="font-size:.8rem">Past rounds: ${ip.hist.map(h=>`${h.got}/${h.of} mastered, ended ${niceDay(h.end)} (${h.status})`).join(" · ")}</p>`:""}
   ${act?`<details class="ipedit"><summary>Edit frequency and exit criteria</summary><form class="grid" data-ipform="${s.id}">
     <label class="f">Sessions per week<input type="number" name="sessions" min="1" max="7" value="${ip.sessions||3}"></label><label class="f">Minutes per session<input type="number" name="minutes" min="5" max="90" value="${ip.minutes||20}"></label>
     <label class="f" style="grid-column:1/-1">Exit criteria<textarea name="exit" rows="2" maxlength="400">${esc(ipExit(ip))}</textarea></label><div><button class="small" type="submit">Save plan details</button></div></form></details>`:""}
   <div class="row">${act?`<button class="small" data-ipprint="${s.id}">🖨 Print lesson packet</button><button class="small" data-ipe3="${s.id}">📄 IMP form (Appendix E.3)</button><button class="ghost small" data-ipletter="${s.id}" data-lang="en">✉ Parent letter</button><button class="ghost small" data-ipletter="${s.id}" data-lang="es">✉ Carta (español)</button>`:""}
    ${act&&st.k==="eligible"?`<button class="small" data-ipact="met" data-id="${s.id}">Criteria met: exit plan</button>`:""}${act&&due&&st.k!=="awaiting"?`<button class="${st.k==="eligible"?"ghost ":""}small" data-ipact="again" data-id="${s.id}">Run ${IP_WEEKS} more weeks</button>`:""}
    ${act&&st.k!=="eligible"?`<button class="ghost small" data-ipact="stop" data-id="${s.id}">Stop plan</button>`:""}
    <button class="ghost small" data-ipact="rebuild" data-id="${s.id}">${act?"Rebuild plan":"Start a new plan"}</button></div></div>`;
}
function wireIP(){
  const raw=id=>CUR.raw.find(x=>x.id===id),view=id=>CUR.students.find(x=>x.id===id);
  const f=document.getElementById("ip-sc");if(f)f.onsubmit=async e=>{e.preventDefault();busy(e.submitter,"Saving…");
    f.querySelectorAll("[data-sc]").forEach(i=>{const r=raw(i.dataset.sc);r.scores={...(r.scores||{})};if(i.value==="")delete r.scores[TESTID];else r.scores[TESTID]=Math.max(0,Math.min(100,+i.value))});
    try{await saveRoster(CUR.raw);await autoPrograms();flash("ip-scm","Saved.");render()}catch(er){document.getElementById("ip-scm").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Save scores"}};
  app.querySelectorAll("[data-ipprint]").forEach(b=>b.onclick=()=>printLessons([view(b.dataset.ipprint)]));
  app.querySelectorAll("[data-ipletter]").forEach(b=>b.onclick=()=>printLetter(view(b.dataset.ipletter),b.dataset.lang));
  app.querySelectorAll("[data-ipe3]").forEach(b=>b.onclick=()=>printImpE3(view(b.dataset.ipe3)));
  app.querySelectorAll("[data-ipform]").forEach(f=>f.onsubmit=async e=>{e.preventDefault();const r=raw(f.dataset.ipform),fd=new FormData(f);
    r.ip={...r.ip,sessions:Math.max(1,Math.min(7,+fd.get("sessions")||3)),minutes:Math.max(5,Math.min(90,+fd.get("minutes")||20)),exit:String(fd.get("exit")||"").trim().slice(0,400)};
    busy(e.submitter,"Saving…");try{await saveRoster(CUR.raw);render()}catch(er){S.err=er.message;render()}});
  const all=document.getElementById("ip-all");if(all)all.onclick=()=>printLessons(CUR.students.filter(ipActive));
  app.querySelectorAll("[data-ipact]").forEach(b=>b.onclick=async()=>{const r=raw(b.dataset.id),s=view(b.dataset.id),a=b.dataset.ipact,ip={...r.ip};
    const got=ip.steps.filter(x=>ipDone(s,x.std)).length,hist=[...(ip.hist||[]),{end:isoDay(Date.now()),status:a==="met"?"met":a==="again"?"continued":a==="stop"?"stopped":"rebuilt",got,of:ip.steps.length}];
    if(a==="met"){const st=ipState(s);if(st.k!=="eligible"){alert("This plan does not meet both exit criteria yet.");return}hist[hist.length-1].ev=st.ev;r.ip={...ip,status:"met",hist}}
    else if(a==="stop"){if(!confirm(`Stop ${r.name}’s plan? Their trail goes back to the normal order.`))return;r.ip={...ip,status:"stopped",hist}}
    else if(a==="again"){const now=Date.now();r.ip={...ip,start:isoDay(now),end:isoDay(now+IP_WEEKS*7*864e5),round:(ip.round||1)+1,hist,steps:ip.steps}}
    else{const sc=testScore(s)??ip.score;const p=buildProgram(s,sc,ipCfg().cut);if(!p.steps.length){alert(`${r.name} has no standards left to build a plan from.`);return}r.ip={...p,round:(ip.round||1)+1,hist}}
    busy(b,"Saving…");try{await saveRoster(CUR.raw);S.ipNew=null;render()}catch(e){S.err=e.message;render()}});
}

/* ---------- printable, scaffolded lesson packets ---------- */
function ipHash(str){let h=2166136261;for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function ipQs(code,seed,n){const L0=LIBC[code],g=L0&&L0.gen,out=[],seen=new Set();if(!g)return out;
  for(let i=0;out.length<n&&i<n*6;i++){try{const q=GG.make(g,seed+i*7919);const key=JSON.stringify(q.parts);if(seen.has(key))continue;seen.add(key);if(q.type==="matrix")continue;out.push(q)}catch(e){}}return out}
function ipQHTML(q,num){const body=bodyHTML(q,null,"plain");
  const ch=q.type==="mc"||q.type==="multi"?`<div class="lp-ch">${q.choices.map((c,i)=>`<div><b>${L[i]}</b> ${choiceInner(c)}</div>`).join("")}</div>${q.type==="multi"?`<p class="lp-note">Choose two.</p>`:""}`:`<p class="lp-ans">Answer: ______________</p>`;
  return `<div class="lp-q"><span class="lp-num">${num}</span><div>${body}${ch}</div></div>`}
const ICAN=t=>"I can "+t.replace(/\.$/,"").replace(/^./,c=>c.toLowerCase())+".";
function lessonHTML(s,step,i,n,key){
  const L0=LIBC[step.std]||{},seed=ipHash(s.id+step.std+(s.ip.round||1));
  const qs=ipQs(step.std,seed,9),ex=qs[0],guided=qs.slice(1,3),own=qs.slice(3,7),exit=qs.slice(7,9);
  let k=0;const keyRows=[];const num=q=>{k++;keyRows.push(`${k}. ${esc(ansText(q))}`);return k};
  const html=`<section class="lesson"><div class="lp-head"><div><span class="lp-tag ${step.lvl}">${IP_LVL[step.lvl]}</span><h2>Lesson ${i+1} of ${n}: ${esc(L0.name||step.std)}</h2>
     <p class="lp-sub">${esc(step.std)} · ${esc(s.name)} · Week ${ipWk(i,n)}</p></div>${LOGO}</div>
    <p class="lp-why">${step.lvl==="grade"?`This is a grade-level standard. It’s one of your goals for this plan.`:`This lesson builds the skill you need for <b>${esc(step.for)} ${esc((LIBC[step.for]||{}).name||"")}</b>.`}</p>
    <div class="lp-box"><h3>Today I will learn</h3><ul>${(L0.do||[L0.desc||""]).slice(0,2).map(t=>`<li>${esc(ICAN(t))}</li>`).join("")}</ul></div>
    ${(L0.und||[]).length?`<div class="lp-box soft"><h3>Remember</h3><ul>${L0.und.slice(0,3).map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>`:""}
    ${ex?`<h3>1. Watch me (worked example)</h3><div class="lp-q"><span class="lp-num">★</span><div>${bodyHTML(ex,null,"plain")}${ex.type==="mc"||ex.type==="multi"?`<div class="lp-ch">${ex.choices.map((c,j)=>`<div><b>${L[j]}</b> ${choiceInner(c)}</div>`).join("")}</div>`:""}
      <ol class="lp-steps">${(ex.steps||[]).map(st=>`<li>${fmt(st.say)}${st.show?`<div>${showHTML(st.show)}</div>`:""}</li>`).join("")}</ol><p><b>Answer:</b> ${fmt(ansText(ex))}</p></div></div>`:""}
    ${guided.length?`<h3>2. Try it with help</h3>${guided.map(q=>`${ipQHTML(q,num(q))}${q.steps&&q.steps[0]?`<p class="lp-hint">💡 Hint: ${fmt(q.steps[0].say)}</p>`:""}`).join("")}`:""}
    ${own.length?`<h3>3. On your own</h3>${own.map(q=>ipQHTML(q,num(q))).join("")}`:""}
    ${exit.length?`<div class="lp-exit"><h3>Exit ticket</h3>${exit.map(q=>ipQHTML(q,num(q))).join("")}<p>How did it go? &nbsp; 😀 I’ve got it &nbsp;&nbsp; 🙂 Almost &nbsp;&nbsp; 😕 I need help</p></div>`:""}
  </section>`;
  key.push(`<div class="lp-keyl"><b>Lesson ${i+1}: ${esc(step.std)}</b><br>${keyRows.join(" &nbsp; ")}</div>`);
  return html}
function packetHTML(s){
  const ip=s.ip,n=ip.steps.length,key=[];
  const cover=`<section class="lesson"><div class="lp-head"><div><span class="lp-tag grade">Individual math plan</span><h2>${esc(s.name)}’s ${IP_WEEKS}-week math plan</h2>
     <p class="lp-sub">${esc(TEACHER)} · ${esc(CUR.cls.name)} · ${niceDay(ip.start)} – ${niceDay(ip.end)}</p></div>${LOGO}</div>
    <p>Starting score on ${esc(TEST_NAME)}: <b>${ip.score}%</b>. Goal: master every lesson below and score at least <b>${ip.cut}%</b> at the re-check.</p>
    <p class="muted">Each lesson builds on the one before it. Lessons marked “Step back” or “Building block” are the skills this student needs first.</p>
    <table class="lp-plan"><thead><tr><th>Week</th><th>Lesson</th><th>Standard</th><th>Level</th><th>Done</th></tr></thead><tbody>${ip.steps.map((x,i)=>`<tr><td>${ipWk(i,n)}</td><td>${i+1}. ${esc((LIBC[x.std]||{}).name||"")}</td><td>${esc(x.std)}</td><td>${IP_LVL[x.lvl]}</td><td>☐</td></tr>`).join("")}</tbody></table>
    <p class="muted" style="font-size:.85rem">Each lesson: worked example → practice with hints → on your own → exit ticket. Online, the student’s trail follows the same order and marks each lesson mastered after ${db.mastery||10} right in a row.</p></section>`;
  const lessons=ip.steps.map((x,i)=>lessonHTML(s,x,i,n,key)).join("");
  return cover+lessons+`<section class="lesson lp-key"><h2>Answer key: ${esc(s.name)}</h2><p class="muted">For the teacher. Numbers match each lesson’s practice problems.</p>${key.join("")}</section>`}
function printLessons(list){list=list.filter(ipActive);if(!list.length)return;const w=window.open("","_blank");if(!w){alert("Allow pop-ups to print.");return}
  const css=pageCSS();
  w.document.write(`<!doctype html><meta charset="utf-8"><title>Lesson packets · ${esc(CUR.cls.name)}</title>${css}<style>body{background:#fff;color:#111;padding:0}</style><div class="lp-wrap">${list.map(packetHTML).join("")}</div><script>setTimeout(()=>print(),500)<\/script>`);w.document.close()}

Object.assign(ES,{"Your teacher made you a personal math plan. Your trail starts with the building blocks you need.":"Tu maestro te hizo un plan de matemáticas personal. Tu camino empieza con las bases que necesitas."});

/* ---------- parent letter (English / Spanish) ---------- */
function printLetter(s,lang){const ip=s.ip,es=lang==="es",T=(en,sp)=>es?sp:en,first=s.name.split(" ")[0];
  const list=ip.steps.map(x=>`<li><b>${esc(x.std)}</b> · ${esc((LIBC[x.std]||{}).name||"")}</li>`).join("");
  const body=`<section class="lesson letter"><div class="lp-head"><div><span class="lp-tag grade">${T("Individualized Math Plan","Plan individual de matemáticas")}</span><h2>${T(`A math plan for ${esc(first)}`,`Un plan de matemáticas para ${esc(first)}`)}</h2>
     <p class="lp-sub">${esc(TEACHER)} · ${esc(CUR.cls.name)} · ${new Date().toLocaleDateString(es?"es-US":"en-US",{month:"long",day:"numeric",year:"numeric"})}</p></div>${LOGO}</div>
    <p>${T("Dear family,","Estimada familia:")}</p>
    <p>${T(`On our recent math benchmark, ${esc(first)} scored ${ip.score}%. To help ${esc(first)} reach grade level, we have started an Individualized Math Plan. It focuses on the skills ${esc(first)} needs most, starting with the building blocks that come first.`,
      `En nuestra evaluación reciente de matemáticas, ${esc(first)} obtuvo ${ip.score}%. Para ayudar a ${esc(first)} a llegar al nivel de grado, empezamos un plan individual de matemáticas. Se enfoca en las destrezas que ${esc(first)} más necesita, empezando por las bases.`)}</p>
    <h3>${T("What we will work on","En qué vamos a trabajar")}</h3><ol>${list}</ol>
    <h3>${T("How often","Con qué frecuencia")}</h3><p>${T(`${ip.sessions||3} times a week for about ${ip.minutes||20} minutes, from ${niceDay(ip.start)} to ${niceDay(ip.end)}.`,`${ip.sessions||3} veces por semana, unos ${ip.minutes||20} minutos, del ${niceDay(ip.start)} al ${niceDay(ip.end)}.`)}</p>
    <h3>${T("How we will check progress","Cómo vamos a revisar el progreso")}</h3><p>${T("Every week I check how many questions on these skills are answered correctly. The goal is 70% or better.","Cada semana reviso cuántas preguntas de estas destrezas contesta correctamente. La meta es 70% o más.")}</p>
    <h3>${T("When the plan ends","Cuándo termina el plan")}</h3><p>${es?"Cuando "+esc(first)+" domine cada lección del plan y obtenga al menos "+ip.cut+"% en la próxima evaluación.":esc(ipExit(ip))}</p>
    <h3>${T("How you can help at home","Cómo puede ayudar en casa")}</h3><ul><li>${T(`Ask ${esc(first)} to show you one problem from today and explain the steps.`,`Pídale a ${esc(first)} que le muestre un problema de hoy y le explique los pasos.`)}</li>
     <li>${T("Practice math facts for 5 minutes a day, in the car or at dinner.","Practiquen operaciones básicas 5 minutos al día, en el carro o en la cena.")}</li><li>${T("Celebrate effort and mistakes. Mistakes are how we learn.","Celebre el esfuerzo y los errores. Los errores nos ayudan a aprender.")}</li></ul>
    <p>${T("Please reach out with any questions. Thank you for being part of this!","Comuníquese conmigo si tiene preguntas. ¡Gracias por su apoyo!")}</p>
    <p>${esc(TEACHER)}</p><p class="muted" style="margin-top:30px">${T("Family signature","Firma de la familia")}: ______________________ &nbsp; ${T("Date","Fecha")}: __________</p></section>`;
  const w=window.open("","_blank");if(!w){alert("Allow pop-ups to print.");return}const css=pageCSS();
  w.document.write(`<!doctype html><meta charset="utf-8"><title>${T("Parent letter","Carta")} · ${esc(s.name)}</title>${css}<style>body{background:#fff;color:#111}</style><div class="lp-wrap">${body}</div><script>setTimeout(()=>print(),400)<\/script>`);w.document.close()}
/* ================= School license (seat caps) ================= */
function licenseCard(){
  const L=S.lic;if(L===undefined){S.lic=null;api("licenseInfo").then(d=>{S.lic=d.license||false;const box=document.getElementById("lic-box");if(box&&S.lic)box.outerHTML=licenseCard()}).catch(()=>{S.lic=false});return `<div id="lic-box"></div>`}
  if(!L)return "";
  const bar=(u,n)=>{const p=Math.min(100,Math.round(u/n*100));return `<span class="bar"><span style="width:${p}%;background:${p>=100?"var(--oops)":p>=85?"var(--gold)":"var(--go)"}"></span></span>`};
  return `<div class="card"><div class="top"><h2>Your license</h2><span class="pill purple">${esc(L.plan)}</span></div>
   <div class="grid"><div><span class="label">Teachers</span><p>${bar(L.usedT,L.teachers)} <b>${L.usedT}</b> of ${L.teachers}</p></div>
   <div><span class="label">Students</span><p>${bar(L.usedS,L.students)} <b>${L.usedS}</b> of ${L.students}</p></div>
   ${L.expires?`<div><span class="label">Renews</span><p>${niceDay(L.expires)}</p></div>`:""}</div>
   <p class="muted" style="font-size:.85rem">Sample students don’t count. ${L.usedS>=L.students||L.usedT>=L.teachers?"You’ve reached your limit. ":""}Need more seats? Contact Path to Proficiency to upgrade.</p></div>`}

/* site owner page: open pathtoproficiency.com/#owner */
function owner(){
  const O=S.own||(S.own={});
  app.innerHTML=`<div class="top"><div class="brand">${LOGO}<div><h1>Path to Proficiency</h1><small>Site owner</small></div></div><button class="ghost" id="o-home">← Home</button></div>
  ${O.multi&&!O.school?ownerMulti(O):O.multi&&O.school&&!O.d?`<div class="card"><p class="muted">Loading…</p></div>`:O.d?`${O.multi?`<div class="row"><button class="ghost small" id="o-back">← All districts</button></div>`:""}<div class="card"><div class="top"><h2>${esc(O.d.school)}</h2><span class="pill purple">${esc(O.d.license.plan)}</span></div>
     <p>Teachers: <b>${O.d.usedT}</b> of ${O.d.license.teachers} · Students: <b>${O.d.usedS}</b> of ${O.d.license.students}</p>
     <div class="tablewrap"><table class="roster"><thead><tr><th>Class</th><th>Teacher</th><th>Students</th></tr></thead><tbody>${O.d.classes.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.teacher)}</td><td>${c.n}${c.n>40?' <span class="pill gold">large</span>':""}</td></tr>`).join("")}</tbody></table></div></div>
   ${ownerInsightsCard(O)}
   <form class="card" id="o-set"><h2>Set this school’s license</h2><div class="grid">
     <label class="f">Plan name<input id="o-plan" maxlength="40" value="${esc(O.d.license.plan)}" placeholder="School, Small school, Pilot…"></label>
     <label class="f">Teacher seats<input id="o-t" type="number" min="1" max="500" value="${O.d.license.teachers}"></label>
     <label class="f">Student seats<input id="o-s" type="number" min="1" max="20000" value="${O.d.license.students}"></label>
     <label class="f">Renews on (optional)<input id="o-e" type="date" value="${esc(O.d.license.expires||"")}"></label>
     <label class="f" style="grid-column:1/-1">Note (invoice #, contact)<input id="o-n" maxlength="300" value="${esc(O.d.license.note||"")}"></label></div>
     <div class="row"><button type="submit">Save license</button><span class="muted" id="o-msg" role="status"></span></div></form>
   <div class="card" style="max-width:720px"><h2>🔒 Research export (names removed)</h2><p class="muted">A file for improving Path to Proficiency. Students and classes get random IDs that change with every export, so they can’t be matched back to people or to earlier files. Removed: names, sign-in codes, teacher and class names, accommodations, family updates, and everything students typed (Scout chats). Dates are rounded to the week. Classes under 5 students are grouped together.</p>
    <div class="row"><button class="ghost" id="o-res">⬇ Download research export</button><span class="muted" id="o-rmsg" role="status"></span></div></div>
   ${O.multi?"":ownerMoveCard(O)}`
  :`<form class="card" id="o-in" style="max-width:460px"><h2>Owner sign-in</h2><p class="muted">Enter the OWNER_CODE you set in Netlify. Only the site owner can change license limits.</p>
     <label class="f">Owner code<input id="o-code" type="password" autocomplete="off" required></label><button type="submit">Sign in</button><p class="err" id="o-err" role="alert">${esc(O.err||"")}</p></form>`}`;
  document.getElementById("o-home").onclick=()=>{S.own=null;history.replaceState(null,"","/");S.screen="landing";render()};
  if(O.multi)wireOwnerMulti(O);
  const ob=document.getElementById("o-back");if(ob)ob.onclick=async()=>{O.school=null;O.d=null;O.ins=null;O.dist=await api("ownerDistricts",{code:O.code});render()};
  const fi=document.getElementById("o-in");if(fi)fi.onsubmit=async e=>{e.preventDefault();busy(e.submitter,"Checking…");const code=document.getElementById("o-code").value;
    try{O.dist=await api("ownerDistricts",{code});O.multi=true;O.code=code;O.err="";render()}
    catch(er){if(/Unknown action/.test(er.message)){try{O.d=await api("ownerGet",{code});O.code=code;O.err="";render()}catch(e2){O.err=e2.message;render()}}else{O.err=er.message;render()}}};
  const orx=document.getElementById("o-res");if(orx)orx.onclick=async()=>{busy(orx,"Building…");try{const d=await api("ownerResearch",{code:O.code,...(O.school?{school:O.school}:{})});const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:"application/json"}));a.download=`ptp-research-${d.made}.json`;document.body.append(a);a.click();a.remove();document.getElementById("o-rmsg").textContent=`Downloaded: ${d.classes.reduce((t,c)=>t+c.students.length,0)} students, no names.`}catch(er){document.getElementById("o-rmsg").textContent=er.message}orx.disabled=false;orx.textContent="⬇ Download research export"};
  wireOwnerMove(O);wireOwnerInsights(O);
  const fs=document.getElementById("o-set");if(fs)fs.onsubmit=async e=>{e.preventDefault();busy(e.submitter,"Saving…");
    try{await api("ownerSet",{code:O.code,...(O.school?{school:O.school}:{}),license:{plan:document.getElementById("o-plan").value,teachers:+document.getElementById("o-t").value,students:+document.getElementById("o-s").value,expires:document.getElementById("o-e").value,note:document.getElementById("o-n").value}});
      O.d=await api("ownerGet",{code:O.code,...(O.school?{school:O.school}:{})});render();document.getElementById("o-msg").textContent="Saved."}catch(er){document.getElementById("o-msg").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Save license"}};
}
SCREENS.owner=owner;

/* ---------- owner insights: how schools use PTP, for renewals and selling. Counts only, no student names. ---------- */
const nfmt=n=>n==null?"—":Number(n).toLocaleString();
const pct=(a,b)=>b?Math.round(a/b*100):0;
function insightKpis(t,g,seats){return `<div class="kpis small">
  <div class="kpi go"><b>${nfmt(t.active7)}</b><span>Active this week</span><small>of ${nfmt(t.students)} students (${pct(t.active7,t.students)}%)</small></div>
  <div class="kpi"><b>${nfmt(t.active30)}</b><span>Active, last 30 days</span><small>${pct(t.active30,t.students)}% of students</small></div>
  <div class="kpi"><b>${nfmt(t.answers30)}</b><span>Questions, last 30 days</span><small>${nfmt(t.answers)} all time</small></div>
  <div class="kpi ${t.accuracy30>=70?"go":"gold"}"><b>${t.accuracy30==null?"—":t.accuracy30+"%"}</b><span>Accuracy, last 30 days</span></div>
  <div class="kpi"><b>${nfmt(Math.round(t.minutes/60))}</b><span>Hours practiced</span><small>${nfmt(Math.round(t.minutes30/60))} in the last 30 days</small></div>
  <div class="kpi go"><b>${nfmt(t.mastered)}</b><span>Skills mastered</span>${t.mastered30!=null?`<small>${nfmt(t.mastered30)} in the last 30 days</small>`:""}</div>
  ${g?`<div class="kpi go"><b>${g.first}% → ${g.recent}%</b><span>Growth in accuracy</span><small>first 40 vs latest 40 answers, ${g.students} students</small></div>`:""}
  ${t.stuck!=null?`<div class="kpi"><b>${pct(t.selfSolved,t.stuck)}%</b><span>Solved it on their own</span><small>3 Before Me: ${nfmt(t.selfSolved)} of ${nfmt(t.stuck)} times stuck</small></div>`:""}
  <div class="kpi"><b>${nfmt(t.scout)}</b><span>Questions asked to Scout</span></div>
  ${seats?`<div class="kpi ${seats.used/seats.max>=.9?"oops":""}"><b>${pct(seats.used,seats.max)}%</b><span>Student seats used</span><small>${nfmt(seats.used)} of ${nfmt(seats.max)}</small></div>`:""}</div>`}
function weekBars(W){if(!W||!W.length)return"";const mx=Math.max(1,...W.map(w=>w.active));
  return `<h3 style="margin:.8rem 0 .3rem">Active students each week</h3><div style="display:flex;align-items:flex-end;gap:6px;height:120px;padding:4px 0;border-bottom:1px solid var(--rule)">${W.map(w=>`<div title="Week of ${w.week}: ${w.active} students, ${w.answers} questions" style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%"><small style="font-size:.7rem">${w.active}</small><div style="width:100%;background:var(--blue);border-radius:6px 6px 0 0;height:${Math.max(3,Math.round(w.active/mx*90))}px"></div></div>`).join("")}</div>
  <div style="display:flex;gap:6px">${W.map(w=>`<small class="muted" style="flex:1;text-align:center;font-size:.65rem">${w.week.slice(5).replace("-","/")}</small>`).join("")}</div>`}
const daysTo=d=>d?Math.ceil((Date.parse(d+"T12:00:00")-Date.now())/864e5):null;
function renewPill(lic){const n=daysTo(lic&&lic.expires);if(n==null)return"";return n<0?`<span class="pill oops">License ended ${-n} days ago</span>`:n<=60?`<span class="pill gold">Renews in ${n} days</span>`:`<span class="pill">Renews ${esc(lic.expires)}</span>`}
function ownerInsightsCard(O){const I=O.ins;
  if(!I)return `<div class="card"><h2>📈 How this school uses PTP</h2><p class="muted">${O.insErr?esc(O.insErr):"Loading…"}</p></div>`;
  return `<div class="card" id="o-ins"><div class="top"><h2>📈 How ${esc(I.school)} uses PTP</h2>${renewPill(I.license)}</div>
   ${insightKpis(I.totals,I.growth,I.license?{used:I.seats.students,max:I.license.students}:null)}
   ${weekBars(I.weeks)}
   <h3 style="margin:.8rem 0 .3rem">By class</h3><div class="tablewrap"><table class="roster"><thead><tr><th>Class</th><th>Teacher</th><th>Students</th><th>Active this week</th><th>Questions (30 days)</th><th>Accuracy</th><th>Skills mastered</th><th>Last active</th></tr></thead><tbody>${I.classes.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.teacher)}</td><td>${c.students}</td><td>${c.active7}${c.students&&!c.active7?' <span class="pill gold">quiet</span>':""}</td><td>${nfmt(c.answers30)}</td><td>${c.accuracy30==null?"—":c.accuracy30+"%"}</td><td>${c.mastered}</td><td>${esc(c.lastActive||"—")}</td></tr>`).join("")}</tbody></table></div>
   <div class="row" style="margin-top:.6rem"><button class="ghost" id="o-impact">🖨 Impact report</button><label class="small"><input type="checkbox" id="o-anon"> Hide the school's name (to show other districts)</label><button class="ghost" id="o-csv">⬇ Spreadsheet</button></div>
   <p class="muted small">Counts only. Students are never named here. "Quiet" means students on the roster but no practice this week, a good reason to check in with that teacher.</p></div>`}
function ownerAllCard(O){const A=O.all;
  if(!A)return `<div class="card"><h2>📈 All schools</h2><p class="muted">${O.insErr?esc(O.insErr):"Loading…"}</p></div>`;
  const dn=id=>(A.districts.find(d=>d.id===id)||{}).name||id,R=A.schools.filter(s=>s.ready);
  return `<div class="card" id="o-ins"><h2>📈 All schools</h2><p class="muted">${A.totals.schools} ${A.totals.schools===1?"school":"schools"} using PTP</p>
   ${insightKpis(A.totals,null,null)}
   ${R.length?`<div class="tablewrap"><table class="roster"><thead><tr><th>District</th><th>School</th><th>Students</th><th>Active this week</th><th>Active (30 days)</th><th>Questions (30 days)</th><th>Accuracy</th><th>Growth</th><th>Seats used</th><th>License</th></tr></thead><tbody>${R.map(s=>`<tr><td>${esc(dn(s.district))}</td><td><b>${esc(s.school)}</b></td><td>${s.totals.students}</td><td>${s.totals.active7} (${pct(s.totals.active7,s.totals.students)}%)</td><td>${s.totals.active30}</td><td>${nfmt(s.totals.answers30)}</td><td>${s.totals.accuracy30==null?"—":s.totals.accuracy30+"%"}</td><td>${s.growth?s.growth.first+"% → "+s.growth.recent+"%":"—"}</td><td>${s.license?pct(s.seats.students,s.license.students)+"%":"—"}</td><td>${s.license?esc(s.license.plan):""} ${renewPill(s.license)}</td></tr>`).join("")}</tbody></table></div>`:""}
   <div class="row" style="margin-top:.6rem"><button class="ghost" id="o-impact">🖨 Impact report</button><button class="ghost" id="o-csv">⬇ Spreadsheet</button></div></div>`}
function impactReport(O){const I=O.all||O.ins,anon=!!document.getElementById("o-anon")?.checked,t=I.totals,g=I.growth,w=window.open("","_blank");if(!w){alert("Allow pop-ups to print.");return}
  const who=O.all?`${t.schools} ${t.schools===1?"school":"schools"}`:anon?"A Mississippi elementary school":esc(I.school),when=new Date(I.made).toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"});
  const line=(b,s)=>`<div class="kpi"><b>${b}</b><span>${s}</span></div>`;
  w.document.write(`<!doctype html><meta charset="utf-8"><title>Path to Proficiency impact report</title>${pageCSS()}<style>html,body{background:#fff}body{padding:24px}.card{box-shadow:none;border:1px solid #ccc}.kpis{grid-template-columns:repeat(3,1fr)}</style>
   <div class="wrap" style="max-width:820px"><div class="top"><div class="brand">${LOGO}<div><h1>Path to Proficiency</h1><small>Impact report · ${when}</small></div></div></div>
   <div class="card"><h2>${who}</h2><div class="kpis">
    ${line(nfmt(t.students),"students using PTP")}${line(pct(t.active30,t.students)+"%","practiced in the last 30 days")}${line(nfmt(t.answers),"math questions answered")}
    ${line(nfmt(Math.round(t.minutes/60)),"hours of practice")}${line(nfmt(t.mastered),"skills mastered")}${g?line(g.first+"% → "+g.recent+"%","accuracy growth ("+g.students+" students)"):line(t.accuracy30==null?"—":t.accuracy30+"%","accuracy, last 30 days")}
    ${t.stuck?line(pct(t.selfSolved,t.stuck)+"%","of the time, stuck students solved it on their own"):""}${line(nfmt(t.scout),"questions answered by Scout, the AI tutor")}</div>
   ${O.ins&&!O.all?weekBars(I.weeks):""}</div>
   <p class="muted small">Counts only, with no student names. Growth compares each student's first 40 answers with their latest 40, for students with at least 80 answers.</p></div><script>setTimeout(()=>print(),400)<\/script>`);w.document.close()}
function insightsCSV(O){const rows=O.all?[["District","School","Students","Active this week","Active 30 days","Questions 30 days","Accuracy 30 days","Growth first %","Growth recent %","Skills mastered","Hours","Scout questions","Seats","Plan","Renews"],...O.all.schools.filter(s=>s.ready).map(s=>[(O.all.districts.find(d=>d.id===s.district)||{}).name||s.district,s.school,s.totals.students,s.totals.active7,s.totals.active30,s.totals.answers30,s.totals.accuracy30??"",s.growth?.first??"",s.growth?.recent??"",s.totals.mastered,Math.round(s.totals.minutes/60),s.totals.scout,s.license?.students??"",s.license?.plan??"",s.license?.expires??""])]
    :[["Class","Teacher","Students","Active this week","Active 30 days","Questions 30 days","Accuracy 30 days","Minutes 30 days","Skills mastered","Last active"],...O.ins.classes.map(c=>[c.name,c.teacher,c.students,c.active7,c.active30,c.answers30,c.accuracy30??"",c.minutes30,c.mastered,c.lastActive])];
  const csv=rows.map(r=>r.map(x=>{x=String(x??"");return /[",\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x}).join(",")).join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`ptp-insights-${new Date().toISOString().slice(0,10)}.csv`;document.body.append(a);a.click();a.remove()}
function wireOwnerInsights(O){
  const need=O.multi&&!O.school?!O.all&&!O.insBusy:O.d&&!O.ins&&!O.insBusy;
  if(need){O.insBusy=true;O.insErr="";const school=O.school;
    api(O.multi&&!O.school?"ownerInsightsAll":"ownerInsights",{code:O.code,...(school?{school}:{})}).then(d=>{if(O.multi&&!O.school)O.all=d;else if(O.school===school)O.ins=d}).catch(er=>{O.insErr=er.message}).finally(()=>{O.insBusy=false;if(S.screen==="owner")render()})}
  const ip=document.getElementById("o-impact");if(ip)ip.onclick=()=>impactReport(O.multi&&!O.school?{all:O.all}:{ins:O.ins});
  const cv=document.getElementById("o-csv");if(cv)cv.onclick=()=>insightsCSV(O.multi&&!O.school?{all:O.all}:{ins:O.ins})}

/* ---------- stage 4: copy this one-school site into its own school store, ready for the multi-district switch ----------
   The old data is only read, never changed. "Check" writes nothing. "Copy now" can be run again any time before the switch. */
function ownerMoveCard(O){const M=O.move||(O.move={d:"Cleveland School District",did:"cleveland-sd",s:O.d.school||"",sid:"rh-bearden"}),r=M.r;
  const facts=f=>`${f.teachers} teachers · ${f.classes} classes · ${f.students} students · ${f.keys} saved items`;
  return `<div class="card" style="max-width:720px"><h2>🏫 Get ready for districts</h2><p class="muted">Copies this school into its own walled-off space for the multi-district switch. Your current data is only read, never changed, and the live site keeps running as it is. <b>Check</b> writes nothing. <b>Copy now</b> can be run again any time before the switch to bring the copy up to date.</p>
   <div class="grid"><label class="f">District name<input id="mv-d" maxlength="100" value="${esc(M.d)}"></label><label class="f">District code<input id="mv-did" maxlength="24" value="${esc(M.did)}"></label>
   <label class="f">School name<input id="mv-s" maxlength="100" value="${esc(M.s)}"></label><label class="f">School code (teachers type this)<input id="mv-sid" maxlength="24" value="${esc(M.sid)}"></label></div>
   <div class="row"><button class="ghost" id="mv-check">Check (dry run)</button><button id="mv-go">Copy now</button><span class="muted" id="mv-msg" role="status">${esc(M.msg||"")}</span></div>
   ${r?`<div class="card" style="margin-top:.6rem;border:2px solid ${r.same?"var(--go)":"var(--gold, #e0a800)"}"><p><b>${r.same?"✅ The copy matches exactly.":r.dryRun?"Not copied yet, or out of date.":"⚠ The copy does not match yet."}</b>${r.dryRun?"":` Copied ${r.copied}, removed ${r.removed}.`}</p>
     <p class="small">Now: ${facts(r.from)}<br>Copy: ${facts(r.to)}</p>
     ${r.joinConflicts.length?`<p class="err">Class codes already used by another school: ${r.joinConflicts.map(esc).join(", ")}</p>`:""}
     ${!r.same&&r.differences.length?`<details><summary class="small">What differs (first ${r.differences.length})</summary><p class="small muted">${r.differences.map(esc).join("<br>")}</p></details>`:""}</div>`:""}</div>`}
function wireOwnerMove(O){const g=id=>document.getElementById(id);if(!g("mv-go"))return;
  const go=async(btn,dryRun)=>{const M=O.move;M.d=g("mv-d").value.trim();M.did=g("mv-did").value.trim().toLowerCase();M.s=g("mv-s").value.trim();M.sid=g("mv-sid").value.trim().toLowerCase();
    if(!dryRun&&!confirm(`Copy this school into ${M.sid} (district ${M.did})? Your current data is not changed.`))return;
    busy(btn,dryRun?"Checking…":"Copying…");
    try{M.r=await api("ownerMove",{code:O.code,districtId:M.did,districtName:M.d,schoolId:M.sid,schoolName:M.s,dryRun});M.msg=""}catch(er){M.msg=er.message}render()};
  g("mv-check").onclick=()=>go(g("mv-check"),true);g("mv-go").onclick=()=>go(g("mv-go"),false)}

/* ---------- owner dashboard on a multi-district site: districts, schools, setup keys, district admins ---------- */
function ownerMulti(O){const D=O.dist.districts||[];
  return `${O.flash?`<div class="card" style="border:2px solid var(--go)">${O.flash}</div>`:""}
   ${ownerAllCard(O)}
   <div class="card"><h2>Districts and schools</h2>${D.length?D.map(d=>`<div class="card" style="margin:.6rem 0"><div class="top"><h3 style="margin:0">${esc(d.name)} <span class="muted small">· code ${esc(d.id)}</span></h3><span class="muted small">District admins: ${d.admins.length?d.admins.map(esc).join(", "):"none yet"}</span></div>
     ${d.schools.length?`<div class="tablewrap"><table class="roster"><thead><tr><th>School</th><th>Code</th><th>Status</th><th>Teachers</th><th>Classes</th><th>License</th><th></th></tr></thead><tbody>${d.schools.map(s=>`<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.id)}</td><td>${s.ready?`<span class="pill go">Set up</span>`:`<span class="pill gold">Waiting for setup</span>`}</td><td>${s.teachers}</td><td>${s.classes}</td><td>${s.license?esc(s.license.plan||"")+" · "+(s.license.students||"")+" seats":"—"}</td><td>${s.ready?`<button class="ghost small" data-oschool="${esc(s.id)}">Manage</button>`:""}<button class="ghost small" data-odel="${esc(s.id)}">Delete</button></td></tr>`).join("")}</tbody></table></div>`:`<p class="muted">No schools yet.</p>`}</div>`).join(""):`<p class="muted">No districts yet. Add the first one below.</p>`}</div>
   <div class="grid" style="align-items:start">
    <form class="card" id="o-nd"><h3>New district</h3><label class="f">District name<input id="nd-name" required maxlength="100" placeholder="Cleveland School District"></label><label class="f">District code<input id="nd-id" required maxlength="24" placeholder="cleveland-sd" pattern="[a-z0-9][a-z0-9-]{1,23}"></label><button>Add district</button></form>
    <form class="card" id="o-ns"><h3>New school</h3><label class="f">District<select id="ns-d" required>${D.map(d=>`<option value="${esc(d.id)}">${esc(d.name)}</option>`).join("")}</select></label><label class="f">School name<input id="ns-name" required maxlength="100" placeholder="RH Bearden Elementary"></label><label class="f">School code (teachers type this)<input id="ns-id" required maxlength="24" placeholder="rh-bearden" pattern="[a-z0-9][a-z0-9-]{1,23}"></label><button ${D.length?"":"disabled"}>Add school</button></form>
    <form class="card" id="o-da"><h3>District admin</h3><p class="muted small">Adds an admin, or sets a new code for one with the same name.</p><label class="f">District<select id="da-d" required>${D.map(d=>`<option value="${esc(d.id)}">${esc(d.name)}</option>`).join("")}</select></label><label class="f">Name<input id="da-name" required maxlength="60" placeholder="Dr. Johnson"></label><label class="f">Admin code (6 to 12 digits)<input id="da-code" required inputmode="numeric" pattern="[0-9]{6,12}"></label><button ${D.length?"":"disabled"}>Save district admin</button></form>
   </div>
   <div class="card" style="max-width:720px"><h2>🔒 Research export, all schools (names removed)</h2><p class="muted">Random IDs for every district, school, class and student, new in each file. No names, codes or typed text.</p><div class="row"><button class="ghost" id="o-resall">⬇ Download research export</button><span class="muted" id="o-ramsg" role="status"></span></div></div>
   <p class="err" role="alert">${esc(O.err||"")}</p>`}
function wireOwnerMulti(O){const g=id=>document.getElementById(id),v=id=>g(id).value.trim(),reload=async(flash)=>{O.dist=await api("ownerDistricts",{code:O.code});O.flash=flash||"";O.err="";render()},
  run=async(e,label,fn)=>{e.preventDefault();busy(e.submitter,label);try{await fn()}catch(er){O.err=er.message;render()}};
  const nd=g("o-nd");if(nd)nd.onsubmit=e=>run(e,"Adding…",async()=>{await api("ownerDistrictCreate",{code:O.code,id:v("nd-id").toLowerCase(),name:v("nd-name")});await reload("District added.")});
  const ns=g("o-ns");if(ns)ns.onsubmit=e=>run(e,"Adding…",async()=>{const r=await api("ownerSchoolCreate",{code:O.code,district:v("ns-d"),id:v("ns-id").toLowerCase(),name:v("ns-name")});
    await reload(`<b>School added.</b> Give its first admin these, privately:<br>School code: <b>${esc(r.id)}</b><br>Setup key: <b style="font-family:monospace;font-size:1.1rem">${esc(r.setupKey)}</b><br><span class="muted">The setup key works once and is not shown again. Lost it? Delete the school and add it again.</span>`)});
  const da=g("o-da");if(da)da.onsubmit=e=>run(e,"Saving…",async()=>{await api("ownerDistrictAdmin",{code:O.code,district:v("da-d"),name:v("da-name"),adminCode:v("da-code")});await reload("District admin saved. They sign in from Teacher login → Sign in to your district.")});
  app.querySelectorAll("[data-oschool]").forEach(b=>b.onclick=async()=>{O.school=b.dataset.oschool;O.d=null;O.ins=null;render();try{O.d=await api("ownerGet",{code:O.code,school:O.school});render()}catch(er){O.school=null;O.err=er.message;render()}});
  app.querySelectorAll("[data-odel]").forEach(b=>b.onclick=async()=>{const id=b.dataset.odel,c=prompt(`This deletes every class, student and score in ${id}. It cannot be undone. Type DELETE ${id} to confirm.`);if(!c)return;
    try{await api("ownerSchoolDelete",{code:O.code,id,confirm:c});await reload("School deleted.")}catch(er){O.err=er.message;render()}});
  const ra=g("o-resall");if(ra)ra.onclick=async()=>{busy(ra,"Building…");try{const d=await api("ownerResearchAll",{code:O.code});const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:"application/json"}));a.download=`ptp-research-all-${d.made||"empty"}.json`;document.body.append(a);a.click();a.remove();g("o-ramsg").textContent=`Downloaded: ${d.schools.length} schools, no names.`}catch(er){g("o-ramsg").textContent=er.message}ra.disabled=false;ra.textContent="⬇ Download research export"}}

/* ---------- district admins: every school in their district (multi-district sites) ---------- */
function districtSignin(){
  app.innerHTML=header(`<button class="ghost" id="back">Back</button>`,"District sign-in")+`<form class="card" id="dsf" style="max-width:480px"><h2>Sign in to your district</h2>
   <p class="muted">For district leaders. Path to Proficiency gives you your district code and admin code.</p>
   <label class="f">District code<input id="ds-d" required maxlength="24" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="cleveland-sd"></label>
   <label class="f">Admin code<input id="ds-c" required type="password" inputmode="numeric" autocomplete="off"></label><button>Sign in</button>
   <p class="err" role="alert">${esc(S.err)}</p></form>`;
  document.getElementById("back").onclick=()=>{S.screen="schoolcode";S.err="";render()};
  document.getElementById("dsf").onsubmit=async e=>{e.preventDefault();busy(e.submitter,"Checking…");
    try{const r=await api("districtLogin",{districtCode:document.getElementById("ds-d").value.trim().toLowerCase(),code:document.getElementById("ds-c").value.trim()});
      S.da={token:r.token,name:r.name,district:r.district,data:null};S.err="";S.screen="districtHome";render();
      S.da.data=await api("districtOverview",{token:r.token});render()}catch(er){S.err=er.message;render()}};
}
SCREENS.districtSignin=districtSignin;
function districtHome(){const D=S.da;if(!D){S.screen="districtSignin";return render()}const d=D.data;
  const sum=d?d.schools.reduce((t,s)=>{s.classes.forEach(c=>{t.st+=c.students;t.act+=c.active;t.n+=c.answers;t.ok+=c.accuracy==null?0:c.accuracy*c.answers/100;t.min+=c.minutes});return t},{st:0,act:0,n:0,ok:0,min:0}):null;
  app.innerHTML=header(`<button class="ghost" id="ds-out">Sign out</button>`,`${esc(D.district.name)} · ${esc(D.name)}`)+(!d?`<div class="card"><p class="muted">Loading your schools…</p></div>`:`
   <div class="card"><h2>${esc(D.district.name)}</h2><p class="muted">The last 7 days, since ${shortDate(d.since)}. Each school's teachers and students sign in to their own school.</p>
    <div class="row" style="gap:8px"><span class="pill">${d.schools.length} school${d.schools.length===1?"":"s"}</span><span class="pill">${sum.st} students</span><span class="pill go">${sum.act} practiced this week</span><span class="pill">${sum.n} answers</span><span class="pill">${sum.n?Math.round(sum.ok/sum.n*100)+"% accuracy":"no answers yet"}</span><span class="pill">${sum.min} minutes</span></div></div>
   ${d.schools.map(s=>`<div class="card"><div class="top"><h3 style="margin:0">${esc(s.name)}</h3>${s.ready?`<span class="muted small">${s.teachers} teacher${s.teachers===1?"":"s"} · ${s.classes.length} class${s.classes.length===1?"":"es"}</span>`:`<span class="pill gold">Not set up yet</span>`}</div>
     ${s.classes.length?`<div class="tablewrap"><table class="roster"><thead><tr><th>Class</th><th>Teacher</th><th>Students</th><th>Practiced this week</th><th>Answers</th><th>Accuracy</th><th>Minutes</th></tr></thead><tbody>${s.classes.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.teacher)}</td><td>${c.students}</td><td>${c.active} of ${c.students}</td><td>${c.answers}</td><td>${c.accuracy==null?"—":c.accuracy+"%"}</td><td>${c.minutes}</td></tr>`).join("")}</tbody></table></div>`:s.ready?`<p class="muted">No classes yet.</p>`:""}</div>`).join("")}`);
  document.getElementById("ds-out").onclick=()=>{S.da=null;S.screen="landing";render()};
}
SCREENS.districtHome=districtHome;

/* ================= Sample school + guided tour (no login, nothing saved) =================
   A pretend school with made-up students. Their practice is simulated with the real question
   makers and the real trail rules, so every teacher page shows what it would look like mid-year. */
let DEMO_T=null;
const DEMO_FIRST=["Ava","Jaylen","Mia","Noah","Imani","Diego","Zoe","Malik","Sofia","Elijah","Aaliyah","Carlos","Layla","Marcus","Amara","Luis","Hana","Jamal","Keisha","Andre","Tasha","Darius","Priya","Kenji","Brielle","Josiah","Nia","Cameron","Destiny","Xavier","Kayla","Jordan","Trinity","Isaiah","Gabriel","Zariah","Micah","Aniyah","Caleb","Jada"];
const DEMO_LAST=["Williams","Johnson","Brown","Jones","Davis","Jackson","Harris","Smith","Thomas","Robinson","Lewis","Walker","Young","Allen","Wright","Scott","Green","Baker","Hill","Adams","Carter","Mitchell","Turner","Parker","Evans","Collins","Edwards","Stewart","Morris","Reed"];
function demoRng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const DEMO_CLASSES=[
 {id:"dc1",name:"3rd Grade · Room 4",teacherId:"dt1",testId:"a1",n:22,base:.58},
 {id:"dc2",name:"3rd Grade · Room 6",teacherId:"dt2",testId:"a1",n:20,base:.64},
 {id:"dc3",name:"5th Grade Math",teacherId:"dt3",testId:"std5",n:21,base:.6},
 {id:"dc4",name:"7th Grade Math",teacherId:"dt4",testId:"std7",n:23,base:.57},
 {id:"dc5",name:"Algebra I",teacherId:"dt4",testId:"std9",n:18,base:.62},
 {id:"dc10",name:"4th Grade ELA",teacherId:"dt7",testId:"std24",n:21,base:.6},
 {id:"dc11",name:"7th Grade ELA",teacherId:"dt7",testId:"std27",n:19,base:.57},
 {id:"dc8",name:"5th Grade Science",teacherId:"dt3",testId:"std15",n:20,base:.6},
 {id:"dc9",name:"Biology",teacherId:"dt6",testId:"std19",n:22,base:.58},
 {id:"dc6",name:"ACT Prep · 11th Grade",teacherId:"dt5",testId:"std10",n:18,base:.56},
 {id:"dc7",name:"Career Ready · WorkKeys",teacherId:"dt5",testId:"std11",n:16,base:.62}];
function demoBuild(){
  const r=demoRng(20261113),ri=(a,b)=>a+Math.floor(r()*(b-a+1)),DAY=864e5,now=Date.now(),start=now-42*DAY;
  const teachers=[{id:"dp",name:"Dr. Williams (Principal)",admin:true},{id:"dt1",name:"Ms. Johnson",admin:false},{id:"dt2",name:"Mr. Davis",admin:false},{id:"dt3",name:"Ms. Carter",admin:false},{id:"dt4",name:"Mr. Brooks",admin:false},{id:"dt5",name:"Coach Hill",admin:false},{id:"dt6",name:"Ms. Reed",admin:false},{id:"dt7",name:"Ms. Nguyen",admin:false}];
  const used=new Set(),nm=()=>{let n;do{n=DEMO_FIRST[ri(0,DEMO_FIRST.length-1)]+" "+DEMO_LAST[ri(0,DEMO_LAST.length-1)][0]+"."}while(used.has(n));used.add(n);return n};
  const store={classes:{},plans:{}};const keep={db,TESTID};
  DEMO_CLASSES.forEach((dc,ci)=>{
    const cls={id:dc.id,name:dc.name,teacherId:dc.teacherId,join:"DEMO"+(ci+1),testId:dc.testId,goal:60,mastery:7,videos:{},tutor:true,chirp:true,flu:{on:true,secs:180,pass:28,n:30},games:{on:true,mins:3},ip:{on:true,cut:60}};
    useTest(isStdT(dc.testId)?{id:dc.testId}:null);db={mastery:cls.mastery,videos:{},goal:cls.goal};addExtras([]);
    const raws=[];
    for(let i=0;i<dc.n;i++){
      const b=Math.max(.25,Math.min(.92,dc.base+(r()-.5)*.5)),skillA={};SKILLS.forEach(k=>{const m=/^WK\.L(\d)/.exec(k.std),adj=m?.3-(+m[1]-3)*.14:0;skillA[k.id]=Math.max(.15,Math.min(.97,b+adj+(r()-.5)*.35))});
      const raw={id:"ds"+ci+"_"+i,name:nm(),code:String(1000+ci*100+i),missed:{},assigned:[],sample:false,prog:{},_b:b,_a:skillA};
      if(dc.testId==="a1"){const miss=[];SKILLS.forEach(k=>(k.qs||[]).forEach(n=>{if(r()>skillA[k.id])miss.push(n)}));raw.missed.a1=miss.sort((x,y)=>x-y)}
      else raw.scores={[dc.testId]:Math.round(Math.max(18,Math.min(96,b*100+(r()-.5)*16)))};
      raws.push(raw)}
    /* the benchmark: students who scored low get an Individualized Math Plan, started 5 weeks ago */
    raws.forEach(raw=>{let s=viewStudent(raw);if(dc.testId!=="a1")SKILLS.forEach(k=>{if(raw._a[k.id]>.6&&r()<.85)s.prog.skills[k.id].status="skip"});raw.prog[dc.testId]=s.prog;
      s=viewStudent(raw);const sc=testScore(s);
      if(sc!=null&&sc<cls.ip.cut){const p=buildProgram(s,sc,cls.ip.cut);if(p.steps.length){p.start=isoDay(now-35*DAY);p.end=isoDay(now+7*DAY);p.sessions=3;p.minutes=20;raw.ip=p}}
      if(sc!=null&&sc<45)raw.mtss={tier:sc<35?"3":"2",goal:"Master the standards in the IMP and reach 70% accuracy on weekly checks.",notes:"",start:isoDay(now-35*DAY)}});
    addExtras(allAssigned(raws));
    /* teacher-led sessions for the plan students: about twice a week for five weeks, with a few absences */
    {const ipS=raws.filter(x=>x.ip);if(ipS.length)for(let w=5;w>=1;w--)for(const dd of [1,3]){const t=now-(w*7-dd)*DAY,d=isoDay(t),id="d"+dc.id+w+dd;
      ipS.forEach((x,i)=>{const st=x.ip.steps[Math.min(x.ip.steps.length-1,Math.floor((5-w)/2))];(x.ses=x.ses||[]).push({id,d,std:st?st.std:"",m:20,a:r()<.88?1:0,n:w===5&&dd===1?"Modeled with a picture, then whiteboard practice.":"",nx:"",by:teachers.find(t=>t.id===dc.teacherId)?.name||""})})}}
    /* six weeks of practice, simulated with real questions */
    raws.forEach((raw,si)=>{const s=viewStudent(raw),p=s.prog,A=raw._a;SKILLS.forEach(k=>{if(A[k.id]==null)A[k.id]=Math.max(.2,raw._b-.1+(r()-.5)*.2)});
      const fav=ri(0,2);let seed=si*7919+ci*104729;
      for(let d=0;d<42;d++){const t0=start+d*DAY,wd=new Date(t0).getDay();if(wd===0||wd===6||r()>.55)continue;
        const n=ri(4,11);for(let j=0;j<n;j++){const k=curSkill(s);if(!k)break;const gen=genOf(k);if(!gen)break;const qid=`~${gen}~${seed++}`,q=getQ(qid);if(!q)continue;
          const t=t0+9*3600e3+j*95e3,sk=p.skills[k.id],ok=r()<A[k.id];A[k.id]=Math.min(.95,A[k.id]+.014);
          const lg=p.log[qid]||(p.log[qid]={tries:0,right:0,first:null});lg.tries++;if(ok)lg.right++;if(lg.first===null)lg.first=ok;
          (p.recent=p.recent||[]).push({k:k.id,q:qid,ok});if(p.recent.length>30)p.recent.shift();
          const dk=dayKey(t),D=p.days||(p.days={}),x=D[dk]||(D[dk]={}),y=x[k.id]||(x[k.id]={n:0,ok:0,ms:0});y.n++;if(ok)y.ok++;y.ms+=ri(35,110)*1000;p.first=p.first||t;p.last=t;
          if(!ok){let pk;if(q.type==="mc"){const ws=Object.keys(q.why||{}).sort();pk=ws[(fav+(j%5===0?1:0))%Math.max(1,ws.length)]}else if(q.type==="multi"){pk=Object.keys(q.why||{}).sort()[0]}else if(q.type==="input"){const ks=Object.keys(q.whyIn||{});pk=ks.length?ks[fav%ks.length]:String(+q.ans+1)}
            (p.miss=p.miss||[]).push({q:qid,k:k.id,p:pk,t});if(p.miss.length>80)p.miss.splice(0,p.miss.length-80);sk.streak=0}
          else{sk.streak++;p.stars++;if(sk.streak>=cls.mastery){sk.status="done";sk.doneAt=t;p.stars+=5}}}}
      /* check-ups after mastery: verified a few days later, retained two weeks after that (when enough time has passed) */
      SKILLS.forEach(k=>{const sk=p.skills[k.id];if(!sk||sk.status!=="done"||!sk.doneAt)return;const v=sk.doneAt+ri(1,4)*DAY;if(v>now-DAY/2||r()>A[k.id]+.1)return;
        sk.ev={v};const rt=v+ri(RETAIN_DAYS,RETAIN_DAYS+4)*DAY;if(rt<now-DAY/2&&r()<A[k.id])sk.ev.r=rt});
      /* strategy steps and passage sets, so the teacher reports have something to show */
      {const G=+dc.testId.slice(3)||3,acc=raw._b,st=n=>{const o={n};o.ok=Math.max(0,Math.min(n,Math.round(n*Math.min(.95,acc+(r()-.4)*.3))));return o};
       if(isELA(G)){p.pf=st(ri(15,40));const P=ELA_PASS.filter(x=>x.g===G-20);if(P.length)p.psets=Array.from({length:ri(1,4)},(_,i)=>({t:now-(9-i*2)*DAY,title:P[(si+i)%P.length].title,n:6,ok:Math.max(0,Math.min(6,Math.round(6*acc+(r()-.5)*2))),c:[]}))}
       else if(isSci(G)&&G!==14&&G!==15)p.ro=st(ri(10,30));else if(G===9)p.plan=st(ri(10,30))
       /* confidence checks: about one in six practice answers */
       const ks=SKILLS.filter(k=>p.skills[k.id]&&p.skills[k.id].status!=="off");if(ks.length){p.confR=Array.from({length:ri(4,12)},(_,i)=>{const k=ks[ri(0,ks.length-1)],ok=r()<acc,c=ok?(r()<.7?"sure":r()<.5?"kind":"guess"):(r()<.3?"sure":r()<.5?"kind":"guess");return {k:k.id,c,ok:ok?1:0,t:now-ri(1,30)*DAY}});
         p.conf={};p.confR.forEach(x=>{const y=p.conf[x.c]||(p.conf[x.c]={n:0,ok:0});y.n++;if(x.ok)y.ok++})}
       if(G>=3&&G<=8&&acc>.6&&r()<.5){const L0=LIB.filter(x=>x.grade===G+1&&x.gen);if(L0.length)p.chal=Array.from({length:ri(1,2)},(_,i)=>({t:now-ri(1,10)*DAY,std:L0[ri(0,L0.length-1)].code,from:"",ok:ri(1,4),n:4}))}}
      const lvl=Math.max(0,Math.min(6,Math.round(raw._b*7-1.5+r())));
      raw.prog[dc.testId]=p;raw.prog._flu={level:lvl,att:Array.from({length:ri(2,6)},(_,i)=>({d:start+i*7*DAY,lvl:Math.max(0,lvl-1+(i>2?1:0)),r:ri(14,30),n:30,s:180,p:i>2})),facts:{}};
      p.tutor={total:ri(0,9)};
      if(isHS(+dc.testId.slice(3)||0)){const wk=dc.testId==="std11",P=PT_PLAN[wk?"wk":"act"].full;p.pt=[0,1].slice(0,ri(1,2)).map(i=>{const by={};let right=0;Object.entries(P.mix).forEach(([dom,n],j)=>{const pr=Math.max(.1,Math.min(.95,raw._b+(wk?.3-j*.13:(r()-.5)*.2)+i*.05));let ok=0;for(let q=0;q<n;q++)if(r()<pr)ok++;by[dom]=[ok,n];right+=ok});let lvl=0;if(wk)for(const L of WK_LVLS){const o=by["WK-L"+L];if(o[0]/o[1]>=.65)lvl=L;else break}return {at:now-(i?6:20)*DAY,kind:wk?"wk":"act",size:"full",n:P.n,right,mins:ri(38,P.mins),by,...(wk?{lvl}:{})}}).sort((a,b)=>a.at-b.at)}
      {const sc=dc.testId==="a1"?Math.round((30-raw.missed.a1.length)/30*100):raw.scores[dc.testId],gain=Math.round(-3+raw._b*16+(r()-.5)*12);raw.bm={[schoolYear()]:{Fall:sc,Winter:Math.max(0,Math.min(100,sc+gain))}}}
      delete raw._a;delete raw._b});
    /* yesterday's exit ticket on the standard most students are working on */
    {const c={};raws.forEach(raw=>{const s=viewStudent(raw),k=curSkill(s);if(k&&genOf(k))c[k.id]=(c[k.id]||0)+1});const kid=Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0],k=SKILLS.find(x=>x.id===kid);
     if(k){const d=now-DAY,rec={id:"tdemo"+dc.id,d:isoDay(d),k:k.id,std:k.std,n:3};raws.forEach(raw=>{if(raw.sample)return;raw.xt=[rec];if(r()<.85){const p=raw.prog[dc.testId];(p.xtr=p.xtr||{})[rec.id]={t:d+14*3600e3,ok:ri(0,3),n:3,k:k.id}}})}}
    /* one "my answer should count" request in the first class, from a student's real missed question */
    if(ci===0){const raw=raws.find(x=>!x.sample&&(x.prog[dc.testId]?.miss||[]).length),p=raw&&raw.prog[dc.testId],m=p&&p.miss[p.miss.length-1],q=m&&getQ(m.q);
      if(q){const vq=viewQ(q),k=SKILLS.find(x=>x.id===m.k);store.reports=[{id:"rdemo1",t:now-5*3600e3,qid:m.q,std:k?k.std:"",testId:dc.testId,reason:"count",note:"I think my answer works too. I checked it two ways.",who:raw.name,classId:cls.id,q:vq,status:"open",sid:raw.id,pick:vq.type==="input"?String(Number(vq.ans)+1):vq.choices?pickText(vq,[[...L].slice(0,vq.choices.length).find(l=>!(Array.isArray(vq.ans)?vq.ans:[vq.ans]).includes(l))]):"",kind:"practice",k:m.k}]}}
    store.classes[cls.id]={cls,rev:"demo",students:raws}});
  db=keep.db;useTest(null);addExtras([]);
  const tests=[{id:"a1",name:"Grade 3 benchmark (older 30-question test: enter missed question numbers)",builtIn:true,grade:"3",nq:30,skills:8},...GRADES.map(g=>({id:"std"+g,name:stdTestName(g),builtIn:true,grade:g===9?"Algebra I":g===10?"ACT Math":g===11?"WorkKeys":g>=23?"ELA "+(g-20):g===19?"Biology":g>=14?"Science "+(g-10):String(g),nq:0,skills:(useTest({id:"std"+g}),SKILLS.length)}))];useTest(null);
  const tb={me:teachers[0],school:{name:"Magnolia Public Schools (sample school)"},teachers,classes:DEMO_CLASSES.map(c=>store.classes[c.id].cls),allClassCount:DEMO_CLASSES.length,tests,hidden:[],ai:false,license:null};
  return {tb,store};
}
const demoNo=()=>{throw new Error("This is the sample school, so changes aren’t saved. Sign in to your own school to do this.")};
async function demoApi(action,b){
  const D=DEMO_T,C=id=>D.store.classes[id]||demoNo();
  switch(action){
    case "boot":return JSON.parse(JSON.stringify(D.tb));
    case "classData":return {classes:(b.ids||[b.id]).map(id=>C(id))};
    case "rosterSave":{const c=C(b.classId),prog=Object.fromEntries(c.students.map(s=>[s.id,s.prog]));c.students=b.students.map(s=>({...s,id:s.id||"dn"+Math.random().toString(36).slice(2,8),prog:prog[s.id]||{}}));return {students:c.students.map(s=>{const {prog,...x}=s;return x}),rev:"demo"}}
    case "classSave":{const c=C(b.id);Object.assign(c.cls,Object.fromEntries(Object.entries(b).filter(([k])=>!["id","token"].includes(k))));return {cls:c.cls,...JSON.parse(JSON.stringify(D.tb))}}
    case "badgeGive":{const c=C(b.classId),now=Date.now();let n=0;(b.studentIds||[]).forEach((sid,i)=>{const s=c.students.find(x=>x.id===sid);if(!s)return;n++;s.prog=s.prog||{};s.prog._tb=[...(s.prog._tb||[]),{id:b.badge,note:b.note||"",by:D.tb.me.name,at:now+i}].slice(-50)});return {ok:true,count:n}}
    case "badgeTake":{const c=C(b.classId),s=c.students.find(x=>x.id===b.studentId);if(s&&s.prog)s.prog._tb=(s.prog._tb||[]).filter(x=>x.at!==b.at);return {ok:true}}
    case "progSet":{const c=C(b.classId),s=c.students.find(x=>x.id===b.studentId);if(s){s.prog={...s.prog,[b.testId]:b.prog}}return {ok:true}}
    case "planGet":return {plan:D.store.plans[b.classId]||null};
    case "planSave":D.store.plans[b.classId]={...b.plan,saved:Date.now()};return {ok:true};
    case "licenseInfo":return {license:null};
    case "reportList":return {reports:JSON.parse(JSON.stringify(D.store.reports||[]))};
    case "reportAdd":(D.store.reports=D.store.reports||[]).unshift({id:"r"+Date.now().toString(36),t:Date.now(),qid:b.qid,std:b.std||"",testId:b.testId,reason:b.reason,note:b.note||"",who:D.tb.me.name+" (teacher)",classId:b.classId||"",q:b.q,status:"open"});return {ok:true};
    case "reportUpdate":{const r=(D.store.reports||[]).find(x=>x.id===b.id);if(!r)throw new Error("That report was not found.");r.status=b.status;
      if(b.status==="credited"&&r.sid){const c=C(r.classId),s=c.students.find(x=>x.id===r.sid),tp=s&&s.prog&&s.prog[r.testId];if(tp)applyCreditLocal(tp,{id:r.id,q:r.qid,k:r.k||"",kind:r.kind||"practice",xid:r.xid||""})}return {ok:true}}
    case "backupList":return {backups:[]};
    case "tutorList":return {tutors:[],contractUrl:""};
    case "leadList":return {leads:[]};
    case "gameBonus":return {ok:true,count:0};
    case "aiReteach":case "aiPractice":case "aiParse":case "aiEnrich":case "tutor":throw new Error("AI features are turned off in the sample school. They work in your own school.");
    default:demoNo();
  }
}
function startDemoSchool(tour){
  const btn=document.getElementById("demo-load");if(btn){btn.disabled=true;btn.textContent="Building the sample school…"}
  setTimeout(()=>{DEMO_T=demoBuild();TOKEN="demo";TB=JSON.parse(JSON.stringify(DEMO_T.tb));TEACHER=TB.me.name;S={screen:"teacher",tt:"overview",err:"",code:""};S.role="teacher";S.demo=false;
    S.tour=tour?0:null;render();if(tour)tourGo(0)},30)}
function endDemoSchool(){DEMO_T=null;S.tour=null;document.getElementById("tour")?.remove();signOut()}

/* ---------- guided tour ---------- */
const TOUR=[
 {t:"Welcome to a sample school",d:"This is <b>Magnolia Public Schools</b>, a pretend district with made-up students in math (grades 3–8, Algebra I, ACT® Math prep, WorkKeys® Applied Math) science (grade 5 and Biology), and reading (grades 4 and 7), with six weeks of simulated practice. Everything you see works the same way in a real school, just with sample data.",go:async()=>{S.tt="overview";render()},sel:".kpis"},
 {t:"1 · Upload assessment results",d:"A teacher brings in benchmark results: type the questions each student missed, or upload a spreadsheet. That’s the only setup.",go:async()=>{await openClass("dc1","setup")},sel:"#csv-card"},
 {t:"2 · Identify learning gaps",d:"Every student gets a trail of the exact standards they missed. Teachers see who is stuck, on what, and who needs help right now.",go:async()=>{await openClass("dc1","class")},sel:".roster"},
 {t:"3 · Discover misconceptions",d:"Every wrong answer is linked to the thinking behind it. The same mistake is grouped across different questions, with the students who make it, so teachers reteach the right thing.",go:async()=>{await openClass("dc1","why")},sel:".miss, .card:nth-of-type(3)"},
 {t:"4 · Create instructional groups",d:"Pick how many groups. The planner groups students by the standard and mistake they share, puts the group that needs the teacher most first, and prints the rotation.",go:async()=>{await openClass("dc1","plan");const f=document.getElementById("pl-f");if(f){f.requestSubmit();await new Promise(r=>setTimeout(r,50))}},sel:".rot, #pl-f"},
 {t:"5 · Intervene with Individualized Math Plans",d:"Students who score below the cut get a plan automatically: prerequisite lessons first, how often, weekly progress checks, exit criteria, printable lesson packets, and a parent letter.",go:async()=>{await openClass("dc1","ip")},sel:".ipc"},
 {t:"6 · Measure improvement",d:"School leaders see proficiency against the target, who is in intervention and whether it is working, and which standards need attention, across every class and grade.",go:async()=>{S.tt="overview";render()},sel:".kpis"},
 {t:"That’s the whole story",d:"Assessment → diagnosis → instruction → intervention → progress. Click around the sample school as long as you like, or schedule a demonstration for your school.",go:async()=>{S.tt="overview";render()},end:true}];
async function tourGo(i){S.tour=Math.max(0,Math.min(TOUR.length-1,i));const st=TOUR[S.tour];try{await st.go()}catch(e){console.warn(e)}tourDraw();
  const el=st.sel&&document.querySelector(st.sel);document.querySelectorAll(".tour-hl").forEach(x=>x.classList.remove("tour-hl"));
  if(el){el.classList.add("tour-hl");el.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"})}else window.scrollTo(0,0)}
function tourDraw(){let box=document.getElementById("tour");if(S.tour==null||!DEMO_T){box?.remove();return}
  if(!box){box=document.createElement("div");box.id="tour";box.setAttribute("role","dialog");box.setAttribute("aria-label","Guided tour");document.body.appendChild(box)}
  const i=S.tour,st=TOUR[i];
  box.innerHTML=`<div class="tour-top"><span class="label">Guided tour · ${i+1} of ${TOUR.length}</span><button class="ghost small" id="tour-x" aria-label="Close the tour">✕</button></div>
   <div class="tour-dots">${TOUR.map((_,j)=>`<i class="${j<=i?"on":""}"></i>`).join("")}</div>
   <h3>${st.t}</h3><p>${st.d}</p>
   <div class="row">${i?`<button class="ghost small" id="tour-b">← Back</button>`:""}${st.end?`<button class="small" id="tour-demo">Schedule a demonstration</button><button class="ghost small" id="tour-done">Keep exploring</button>`:`<button class="small" id="tour-n">Next →</button>`}</div>`;
  const on=(id,f)=>{const e=document.getElementById(id);if(e)e.onclick=f};
  on("tour-x",()=>{S.tour=null;tourDraw()});on("tour-done",()=>{S.tour=null;tourDraw()});on("tour-b",()=>tourGo(i-1));on("tour-n",()=>tourGo(i+1));
  on("tour-demo",()=>{const t=DEMO_T;DEMO_T=null;S={screen:"lead",leadType:"demo",err:"",code:""};document.getElementById("tour")?.remove();TB=CUR=null;TOKEN=null;render()});
}
function demoBanner(){return DEMO_T?`<div class="demo-banner"><span>🧪 <b>Sample school.</b> Made-up students and simulated data. Nothing you do here is saved.</span><span class="row">${S.tour==null?`<button class="ghost small" id="tour-again">Start the guided tour</button>`:""}<button class="ghost small" id="demo-exit">Leave the sample school</button></span></div>`:""}
function wireDemoBanner(){const a=document.getElementById("tour-again");if(a)a.onclick=()=>tourGo(0);const x=document.getElementById("demo-exit");if(x)x.onclick=endDemoSchool}

/* ================= School overview: the principal's command center ================= */
function ovCompute(data){
  const now=Date.now(),wk=now-7*864e5,BM={Fall:{n:0,sum:0,at:0},Winter:{n:0,sum:0,at:0},Spring:{n:0,sum:0,at:0},moved:0,grew:0,two:0},classes=[],stds={},plans={active:0,onPace:0,met:0,lessons:0,done:0,t2:0,t3:0},allProgs=[];let N=0,onT=0,close=0,need=0,interv=0,grew=0,grN=0,mins=0;
  data.forEach(entry=>{const c=entry.cls,t=isStdT(c.testId)?{id:c.testId}:c.testId==="a1"?null:(TESTS[c.testId]||null);
    useTest(t);addExtras(allAssigned(entry.students));db={mastery:c.mastery,videos:c.videos||{},goal:c.goal};
    const studs=entry.students.filter(s=>!s.sample).map(viewStudent);let cOn=0,cIn=0,cGr=0,cGrN=0,cMin=0;const g=gradeOf();
    const mg=missGroups(studs);
    const cutC=(c.ip&&c.ip.cut)||60;
    studs.forEach(s=>{const bb=bmOf(s);WINS.forEach(w=>{if(bb[w]!=null){BM[w].n++;BM[w].sum+=bb[w];if(bb[w]>=cutC)BM[w].at++}});const vv=WINS.map(w=>bb[w]).filter(x=>x!=null);if(vv.length>=2){BM.two++;if(vv[vv.length-1]>vv[0])BM.grew++;if(vv[0]<cutC&&vv[vv.length-1]>=cutC)BM.moved++}
      const rd=readiness(s),b=band(rd).c;if(b==="go"){onT++;cOn++}else if(b==="gold")close++;else if(b==="oops")need++;
      const inI=ipActive(s)||["2","3"].includes(s.mtss?.tier);if(inI){interv++;cIn++}if(s.mtss?.tier==="2")plans.t2++;if(s.mtss?.tier==="3")plans.t3++;
      const w=weekly([s.prog]);if(w.length>=4){const a=(w[0].acc+w[1].acc)/2,z=(w[w.length-1].acc+w[w.length-2].acc)/2;cGrN++;grN++;if(z>=a+3){cGr++;grew++}}
      const m=minsOf(s.prog,null,wk);cMin+=m;mins+=m;allProgs.push(s.prog);
      const tried=new Set();Object.values(s.prog.days||{}).forEach(x=>Object.keys(x).forEach(k=>tried.add(k)));
      SKILLS.forEach(k=>{const sk=s.prog.skills[k.id];if(!sk||sk.status==="off"||(sk.status==="todo"&&!tried.has(k.id)))return;const o=stds[k.std]||(stds[k.std]={std:k.std,name:k.name,g,n:0,prof:0,mis:null,mn:0});o.n++;if(sk.status==="done"||sk.status==="skip")o.prof++});
      if(s.ip){const ip=s.ip,tot=ip.steps.length,dn=ip.steps.filter(x=>ipDone(s,x.std)).length;if(ip.status==="met")plans.met++;
        if(ipActive(s)){plans.active++;plans.lessons+=tot;plans.done+=dn;const exp=tot*Math.min(1,(now-new Date(ip.start+"T00:00:00"))/(IP_WEEKS*7*864e5));if(dn>=exp*.8)plans.onPace++}}});
    mg.forEach(x=>{const k=SKILLS.find(y=>y.id===x.k);if(!k)return;const o=stds[k.std];if(o&&x.who.size>o.mn){o.mn=x.who.size;o.mis=x.ex}});
    const n=studs.length;N+=n;
    classes.push({c,n,g,on:n?Math.round(cOn/n*100):null,inI:cIn,gr:cGrN?Math.round(cGr/cGrN*100):null,min:n?Math.round(cMin/n):0,goal:c.goal})});
  useTest(null);addExtras([]);
  const attn=Object.values(stds).filter(o=>o.n>=5).map(o=>({...o,pct:Math.round(o.prof/o.n*100)})).filter(o=>o.pct<50).sort((a,b)=>a.pct-b.pct||b.n-a.n);
  const goal=classes.length?Math.round(classes.reduce((a,x)=>a+x.goal*x.n,0)/Math.max(1,N)):60;
  return {BM,N,onT,close,need,interv,grew,grN,mins,goal,prof:N?Math.round(onT/N*100):null,classes,attn,plans,trend:weekly(allProgs)}}
function tOverview(){
  if(!TB.classes.length)return `<div class="card"><h2>School overview</h2><p class="muted">Make a class first. This page fills in as students practice.</p></div>`;
  const O=S.ov;if(!O||O.loading){if(!O)ovLoad();return `<div class="card"><h2>School overview</h2><p class="muted">Gathering every class…</p></div>`}
  if(O.err)return `<div class="fb oops"><p>${esc(O.err)}</p></div>`;
  const X=O.x,gap=X.prof==null?null:X.goal-X.prof,P=X.plans;
  const tile=(v,l,sub,c)=>`<div class="kpi ${c||""}"><b>${v}</b><span>${l}</span>${sub?`<small>${sub}</small>`:""}</div>`;
  const byG={};X.classes.forEach(x=>(byG[x.g]=byG[x.g]||[]).push(x));
  return `<div class="card ov-hero"><div class="top"><div><span class="label">${esc(TB.school.name)}</span><h2>School overview</h2></div><span class="muted" style="font-size:.85rem">${X.N} students · ${X.classes.length} classes · updated just now</span></div>
    <div class="kpis">
     ${tile(X.prof==null?"—":X.prof+"%","Estimated proficiency",`Target ${X.goal}%${gap>0?` · ${gap} points to go`:" · target met"}`,X.prof>=X.goal?"go":"gold")}
     ${tile(X.interv,"Students in intervention",`${P.active} on an IMP · ${P.t2} Tier 2 · ${P.t3} Tier 3`,"")}
     ${tile(X.attn.length,"Standards needing attention","fewer than half of students practicing them are proficient","oops")}
     ${tile(X.grN?Math.round(X.grew/X.grN*100)+"%":"—","Students showing growth","practice accuracy up since week 1","go")}
     ${tile(P.active?Math.round(P.onPace/P.active*100)+"%":"—","IMPs on pace",`${P.done} of ${P.lessons} plan lessons mastered${P.met?` · ${P.met} met goal`:""}`,"")}
    </div>
    <div class="pbar" role="img" aria-label="Estimated proficiency ${X.prof}% against a target of ${X.goal}%"><span class="pb-on" style="width:${X.onT/Math.max(1,X.N)*100}%"></span><span class="pb-cl" style="width:${X.close/Math.max(1,X.N)*100}%"></span><i style="left:${X.goal}%"><em>Target ${X.goal}%</em></i></div>
    <div class="row" style="gap:16px;font-size:.9rem"><span><span class="dot go"></span> On track ${X.onT}</span><span><span class="dot gold"></span> Close ${X.close}</span><span><span class="dot oops"></span> Needs support ${X.need}</span></div>
    <p class="muted" style="font-size:.8rem">Estimated proficiency is the share of students on track on the standards on their trail (mastered, or right on the benchmark). It is an estimate from practice, not a state test score.</p></div>
  ${tsCard((S.ov.raw||[]).flatMap(c=>c.students||[]),"whole school")}${ovReportsCard()}
  ${(()=>{const B=X.BM;if(!WINS.some(w=>B[w].n))return "";return `<div class="card"><div class="top"><h2>Benchmark growth · ${esc(schoolYear())}</h2><span class="muted" style="font-size:.85rem">fall, winter, and spring benchmark scores</span></div>
    <div class="kpis small">${WINS.map(w=>B[w].n?`<div class="kpi ${B[w].at/B[w].n>=.6?"go":"gold"}"><b>${Math.round(B[w].sum/B[w].n)}%</b><span>${w} average</span><small>${Math.round(B[w].at/B[w].n*100)}% at or above the cut</small></div>`:`<div class="kpi"><b>—</b><span>${w}</span><small>not entered yet</small></div>`).join("")}
     <div class="kpi go"><b>${B.moved}</b><span>Students moved to at or above the cut</span><small>${B.two?`${B.grew} of ${B.two} improved`:"needs two windows"}</small></div></div></div>`})()}
  <div class="card"><h2>By grade and class</h2><div class="tablewrap"><table class="roster"><thead><tr><th>Class</th><th>Teacher</th><th>Students</th><th>On track</th><th>In intervention</th><th>Showing growth</th><th>Minutes / student (7 days)</th></tr></thead><tbody>
    ${Object.keys(byG).sort((a,b)=>a-b).map(g=>`<tr class="tgrp"><td colspan="7"><b>${esc(gLabel(g))}</b></td></tr>`+byG[g].map(x=>`<tr><td><button class="link" data-ovc="${x.c.id}">${esc(x.c.name)}</button></td><td>${esc(tName(x.c.teacherId))}</td><td>${x.n}</td>
      <td>${x.on==null?"—":`<span class="bar"><span style="width:${x.on}%;background:${x.on>=x.goal?"var(--go)":"var(--gold)"}"></span></span> ${x.on}%`}</td><td>${x.inI}</td><td>${x.gr==null?"—":x.gr+"%"}</td><td>${x.min}</td></tr>`).join("")).join("")}</tbody></table></div></div>
  <div class="card"><h2>Standards needing attention</h2><p class="muted">Standards students are practicing where fewer than half are proficient yet, with the most common mistake behind wrong answers.</p>
   ${X.attn.length?`<ol class="attn">${X.attn.slice(0,8).map(o=>`<li><div class="top"><span><b>${esc(o.std)}</b> · ${esc(o.name)} <span class="muted">(${esc(gLabel(o.g))})</span></span><span class="pill oops">${o.pct}% proficient · ${o.n} students</span></div>${o.mis?`<p class="mex">“${fmt(o.mis)}”</p><p class="muted" style="font-size:.8rem">${o.mn} students make this mistake</p>`:""}</li>`).join("")}</ol>`:`<p class="fb go">No standards below 50% right now.</p>`}</div>
  <div class="grid2"><div class="card"><h2>Is intervention working?</h2>
    <div class="kpis small">${tile(P.active,"Active IMPs","","")}${tile(P.lessons?Math.round(P.done/P.lessons*100)+"%":"—","Plan lessons mastered","","go")}${tile(P.active?Math.round(P.onPace/P.active*100)+"%":"—","On pace","mastered ≥ 80% of expected by now","")}${tile(P.met,"Met goal and exited","","go")}</div>
    <p class="muted" style="font-size:.85rem">Each Individualized Math Plan runs ${IP_WEEKS} weeks with weekly progress checks. Open a class’s Individual plans tab for each student’s chart.</p></div>
   <div class="card"><h2>School-wide practice accuracy</h2>${lineChart(X.trend.map(x=>({label:shortDate(x.w),y:x.acc,tip:`Week of ${shortDate(x.w)}: ${x.acc}% right (${x.ok} of ${x.n})`})),{max:100,unit:"%",goal:70,goalLabel:"70%"})}</div></div>`;
}
async function ovLoad(){S.ov={loading:true};try{const d=await api("classData",{ids:TB.classes.map(c=>c.id)});
  for(const e of d.classes){const id=e.cls.testId;if(id&&id!=="a1"&&!isStdT(id)&&!TESTS[id]){try{TESTS[id]=(await api("testGet",{id})).test}catch(er){}}}
  S.ov={x:ovCompute(d.classes),raw:d.classes}}catch(e){S.ov={err:e.message}}if(S.screen==="teacher"&&S.tt==="overview"){render();if(S.tour!=null)tourGo(S.tour)}}
function wireOverview(){app.querySelectorAll("[data-ovc]").forEach(b=>b.onclick=()=>openClass(b.dataset.ovc,"class"));[["rp-week",rpWeek],["rp-dm",rpDM],["rp-year",rpYear]].forEach(([id,f])=>{const b=document.getElementById(id);if(b)b.onclick=f})}

/* ================= Pages for schools: demo requests, Founding Schools, Mississippi intervention ================= */
const ROLES={parent:"Parent",homeschool:"Homeschool parent",teacher:"Teacher",principal:"Principal",assistant:"Assistant principal",coach:"Math coach / interventionist",district:"District leader",other:"Other"};
const pageTop=sub=>`<nav class="lnav"><button class="brand linkish" id="pg-home" aria-label="Path to Proficiency home">${LOGO}<div><b>Path to Proficiency</b><small>${sub}</small></div></button>
  <div class="row"><button class="ghost small" id="pg-tour">See it in action</button><button class="small" id="pg-demo">Schedule a demo</button></div></nav>`;
function wirePageTop(){const h=document.getElementById("pg-home");if(h)h.onclick=()=>{history.replaceState(null,"","/");S.screen="landing";render()};
  const t=document.getElementById("pg-tour");if(t)t.onclick=()=>startDemoSchool(true);
  const d=document.getElementById("pg-demo");if(d)d.onclick=()=>{S.screen="lead";S.leadType="demo";S.leadDone=false;render()}}
function lead(){
  if(S.leadType==="family")return leadFamily();
  const T=S.leadType==="founding",G=S.leadG||(S.leadG=[]);
  if(S.leadDone){app.innerHTML=pageTop("For schools")+`<div class="card pop" style="text-align:center;align-items:center;margin-top:30px"><h2>Thank you! 🎉</h2>
    <p>${T?"Your Founding Schools application was sent.":"Your demonstration request was sent."} We’ll email you within two school days to set up a time.</p>
    <div class="row"><button id="ld-tour">Explore the sample school</button><button class="ghost" id="ld-home">Back to the home page</button></div></div>`;wirePageTop();
    document.getElementById("ld-tour").onclick=()=>startDemoSchool(true);document.getElementById("ld-home").onclick=()=>{S.screen="landing";render()};return}
  app.innerHTML=pageTop("For schools")+`<div class="card"><span class="eyebrow">${T?"Founding Schools Program":"For school leaders"}</span><h2>${T?"Apply to be a Founding School":"Schedule a school demonstration"}</h2>
   <p>${T?"A small group of Mississippi schools will pilot Path to Proficiency with guided onboarding, teacher training, and direct access to the team building it.":"See how Path to Proficiency turns your benchmark results into groups, interventions, and progress reports. A demonstration takes about 30 minutes, online or in person."}</p></div>
  <form class="card" id="ldf" novalidate>
   <div class="grid"><label class="f">Your name<input name="name" required maxlength="80" autocomplete="name"></label>
    <label class="f">Your role<select name="role">${Object.entries(ROLES).filter(([k])=>!["parent","homeschool"].includes(k)).map(([k,v])=>`<option value="${k}" ${k==="principal"?"selected":""}>${v}</option>`).join("")}</select></label>
    <label class="f">Email<input name="email" type="email" required maxlength="120" autocomplete="email"></label>
    <label class="f">Phone (optional)<input name="phone" type="tel" maxlength="30" autocomplete="tel"></label>
    <label class="f">School or district<input name="org" required maxlength="120" autocomplete="organization"></label>
    <label class="f">County<select name="county"><option value="">Choose a county</option>${MS_COUNTIES.map(c=>`<option>${c}</option>`).join("")}<option>Outside Mississippi</option></select></label>
    <label class="f">About how many students?<input name="students" type="number" min="0" max="100000" placeholder="e.g. 350"></label>
    <label class="f">Best days and times (optional)<input name="times" maxlength="160" placeholder="e.g. Tuesday afternoons"></label></div>
   <fieldset class="tset"><legend>Grades you’re interested in</legend>${["3","4","5","6","7","8","9"].map(g=>chk("grades",g,g==="9"?"Algebra I":`Grade ${g}`)).join("")}</fieldset>
   <label class="f">${T?"What would you most like to improve in math this year? (optional)":"Anything we should know? (optional)"}<textarea name="message" rows="3" maxlength="1500"></textarea></label>
   <input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
   <p class="muted" style="font-size:.85rem">We only use this to contact you about Path to Proficiency. We never sell or share it.</p>
   <p class="err" id="ld-err" role="alert"></p><div class="row"><button type="submit">${T?"Send my application":"Request a demonstration"}</button></div></form>`+siteFooter();
  wirePageTop();wireFooter();
  document.getElementById("ldf").onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target),b={type:T?"founding":"demo"};
    ["name","role","email","phone","org","county","students","times","message","website"].forEach(k=>b[k]=fd.get(k)||"");b.grades=fd.getAll("grades");
    busy(e.submitter,"Sending…");try{await api("leadAdd",b);netlifyNotify(b);S.leadDone=true;render()}catch(er){document.getElementById("ld-err").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent=T?"Send my application":"Request a demonstration"}};
}
SCREENS.lead=lead;

function mississippi(){
  const rows=[["Screen students and identify who is below benchmark","Import benchmark or screener results by question or by score. Students below your cut score are flagged right away, and each one’s trail starts with the standards they missed."],
   ["Write an Individualized Math Plan for each student below benchmark","A plan is drafted automatically: the standards to work on, with the prerequisite skills that come first, for every grade from 3 through Algebra I."],
   ["Name the interventions","Each plan lists its lessons, and prints a scaffolded lesson packet for each one: a worked example, practice with hints, independent practice, and an exit ticket."],
   ["Set how often interventions happen","Teachers set sessions per week and minutes per session for each plan, and see minutes actually practiced."],
   ["Monitor progress","Weekly progress checks chart each student’s accuracy on plan standards against a goal line, and flag plans that are off track three weeks in a row."],
   ["Define exit criteria","Every plan states when the student exits. The app shows a plan as ready to exit only when the lessons are mastered and a later benchmark or screener score reaches the cut; otherwise the teacher continues or adjusts."],
   ["Communicate with families","One click prints a parent letter in English or Spanish explaining the plan, how often it meets, and how to help at home."],
   ["Tiered support (MTSS)","Tier 2 and Tier 3 records with minutes, standards, accuracy growth, and the mistakes students make, ready to print for intervention meetings."]];
  app.innerHTML=pageTop("Mississippi mathematics intervention")+`
  <section class="lhero ms-hero"><div class="lhero-copy"><span class="eyebrow">Built in Mississippi, for Mississippi</span><h1 class="hero">Mississippi mathematics intervention, organized.</h1>
   <p class="lead">Mississippi’s 2026 education law (Senate Bill 2294) asks schools to screen K–5 students in math and give students below benchmark an Individualized Math Plan with specific interventions, how often they happen, progress monitoring, and exit criteria. Path to Proficiency gives teachers the tools to do that work, and connects each student’s mistakes to the next lesson they need.</p>
   <div class="row"><button id="ms-tour">See it in action</button><button class="ghost" id="ms-demo">Schedule a demonstration</button></div></div>
   <div class="mock ms-card"><div class="mock-h">What SB 2294 describes for math</div><ul class="jlist">
    <li>A K–5 math screener given <b>at least three times a year</b></li><li>An <b>Individualized Math Plan</b> for each student below benchmark</li><li>Plans that list <b>interventions, frequency, progress monitoring, and exit criteria</b>, shared with parents</li>
    <li>A <b>grade 5 algebra-readiness</b> indicator beginning in 2026–27</li></ul><p class="muted" style="font-size:.8rem">Summary based on public summaries of SB 2294. Always follow MDE guidance and your district’s procedures.</p></div></section>
  <section class="lsec"><div class="lsec-h"><span class="eyebrow">How Path to Proficiency helps</span><h2>From benchmark to plan to progress</h2></div>
   <div class="tablewrap"><table class="roster mstab"><thead><tr><th>What schools need to do</th><th>How Path to Proficiency supports it</th></tr></thead><tbody>${rows.map(([a,b])=>`<tr><td><b>${a}</b></td><td>${b}</td></tr>`).join("")}</tbody></table></div></section>
  <section class="lsec"><div class="lsec-h"><span class="eyebrow">Mississippi, all the way down</span><h2>Aligned to the standards your teachers already use</h2></div>
   <div class="why3"><div class="wcard"><span class="wico">📘</span><h3>273 Mississippi CCRS standards</h3><p>Every math standard for grades 3 through 8 and Algebra I, with what students should know, understand, and do from the MDE scaffolding documents.</p></div>
    <div class="wcard"><span class="wico">🧱</span><h3>Prerequisite connections</h3><p>Plans step back across grades: a struggling Algebra I student starts with the 7th and 8th grade equation skills underneath, then builds up.</p></div>
    <div class="wcard"><span class="wico">🔍</span><h3>The thinking behind wrong answers</h3><p>Each wrong answer is matched to the mistake behind it, grouped across questions, so teachers reteach the misconception instead of re-assigning the standard.</p></div></div></section>
  <section class="lsec"><div class="fb info"><p><b>Please note:</b> Path to Proficiency is not a state-approved screener and has not been reviewed or approved by the Mississippi Department of Education. It is a practice and planning tool that helps teachers carry out the intervention plans their school writes. Schools should use the screener and procedures their district and MDE require.</p></div>
   <p class="muted" style="font-size:.85rem">Sources: <a href="https://www.mississippifirst.org/legislative_tracker/senate-bill-2294/sb2294_confreport_summary/" target="_blank" rel="noopener">Mississippi First, SB 2294 conference report summary</a> · <a href="https://www.mississippifreepress.org/new-mississippi-law-aims-to-improve-reading-math-financial-literacy-computer-science-and-civics/" target="_blank" rel="noopener">Mississippi Free Press</a></p></section>
  <section class="lcta"><h2>See how it would work in your school</h2><div class="row" style="justify-content:center"><button id="ms-demo2">Schedule a demonstration</button><button class="ghost" id="ms-found">Become a Founding School</button></div></section>`+siteFooter();
  wirePageTop();wireFooter();const on=(id,f)=>{const e=document.getElementById(id);if(e)e.onclick=f};
  on("ms-tour",()=>startDemoSchool(true));on("ms-demo",()=>{S.screen="lead";S.leadType="demo";S.leadDone=false;render()});on("ms-demo2",()=>{S.screen="lead";S.leadType="demo";S.leadDone=false;render()});on("ms-found",()=>{S.screen="founding";render()});
}
SCREENS.mississippi=mississippi;

function founding(){
  app.innerHTML=pageTop("Founding Schools Program")+`
  <section class="lhero"><div class="lhero-copy"><span class="eyebrow">Founding Schools Program · 2026–27</span><h1 class="hero">Help build the math tool Mississippi teachers deserve.</h1>
   <p class="lead">We’re inviting a small number of Mississippi schools to be the first to use Path to Proficiency, with hands-on support from the team building it.</p>
   <div class="row"><button id="fd-apply">Apply to be a Founding School</button><button class="ghost" id="fd-tour">See it in action</button></div></div>
   <div class="mock"><div class="mock-h">Founding schools get</div><ul class="jlist"><li><b>Guided onboarding</b>: we set up your classes and import your benchmark results with you</li><li><b>Teacher training</b>: a short session plus quick-start guides</li>
    <li><b>A defined pilot period</b> with clear start and end dates</li><li><b>Progress reports</b> for your leadership team</li><li><b>Direct access</b> to the development team</li><li><b>A voice in what we build next</b></li></ul></div></section>
  <section class="lsec"><div class="lsec-h"><span class="eyebrow">What we ask in return</span><h2>A real partnership</h2></div>
   <div class="why3"><div class="wcard"><span class="wico">💬</span><h3>Honest feedback</h3><p>Short check-ins with teachers and leaders about what works and what doesn’t.</p></div>
    <div class="wcard"><span class="wico">📈</span><h3>Usage and results</h3><p>Permission to look at how the tool is used and how students grow during the pilot.</p></div>
    <div class="wcard"><span class="wico">✍️</span><h3>Your story, only if you agree</h3><p>With your school’s consent, we may share de-identified results as a case study. Nothing is shared without permission.</p></div></div></section>
  <section class="lsec" id="results"><div class="lsec-h"><span class="eyebrow">Results</span><h2>How we’ll measure success</h2><p class="muted">We don’t publish made-up numbers. Real results from pilot classrooms will be posted here as they come in.</p></div>
   <div class="feat">${[["Benchmark growth","Pre- and post-assessment performance on targeted standards."],["Standards mastered","Standards mastered over time, by class and grade."],["Moving to proficiency","Share of students who move from below benchmark to on track."],["Intervention outcomes","How many Individualized Math Plans meet their exit criteria."],["Teacher time saved","Time saved building groups and intervention records."],["Engagement","Practice minutes and completion each week."]].map(([t,d])=>`<div><b>${t}</b><p class="muted">${d}</p></div>`).join("")}</div>
   <div class="mock case"><div class="mock-h">Future case study</div><p><b>How Path to Proficiency helped a third-grade classroom address multiplication misconceptions</b></p><div class="row" style="gap:28px"><div class="kpi"><b>--%</b><span>Improvement in targeted standards</span></div><div class="kpi"><b>--</b><span>Students reaching mastery</span></div></div><p class="muted" style="font-size:.8rem">Placeholder until real pilot results are available.</p></div></section>
  <section class="lcta"><h2>Spots are limited</h2><p>Founding schools are chosen to cover a mix of grades and regions across Mississippi.</p><div class="row" style="justify-content:center"><button id="fd-apply2">Apply now</button><button class="ghost" id="fd-ms">Mississippi intervention</button></div></section>`+siteFooter();
  wirePageTop();wireFooter();const on=(id,f)=>{const e=document.getElementById(id);if(e)e.onclick=f},ap=()=>{S.screen="lead";S.leadType="founding";S.leadDone=false;render()};
  on("fd-apply",ap);on("fd-apply2",ap);on("fd-tour",()=>startDemoSchool(true));on("fd-ms",()=>{S.screen="mississippi";render()});
}
SCREENS.founding=founding;

/* ---------- admin: leads ---------- */
const LD_TYPE={demo:"Demo request",founding:"Founding Schools application",family:"Family / homeschool waitlist"};
const LD_STAT={new:"New",contacted:"Contacted",demo:"Demo scheduled",pilot:"Pilot",customer:"Customer",closed:"Closed"};
function tLeads(){
  if(!isAdmin())return `<div class="card"><p class="muted">Only the site admin can see school requests.</p></div>`;
  const D=S.leads;if(!D){api("leadList").then(d=>{S.leads=d.leads;if(S.tt==="leads")render()}).catch(e=>{S.err=e.message;render()});return `<div class="card"><p class="muted">Loading requests…</p></div>`}
  return `<div class="card"><div class="top"><h2>School requests</h2><button class="ghost small" id="ld-csv">Download CSV</button></div>
   <p class="muted">Demonstration requests and Founding Schools applications from the website. Only you can see this page.</p>
   <p>${Object.entries(LD_STAT).map(([k,v])=>{const n=D.filter(x=>x.status===k).length;return n?`<span class="pill${k==="new"?" gold":""}">${v}: ${n}</span>`:""}).join(" ")||"No requests yet."}</p></div>
  ${D.map(r=>{const open=S.ldOpen===r.id;return `<div class="card tu"><button class="tu-head" data-ld="${r.id}" aria-expanded="${open}"><span><b>${esc(r.org)}</b> <span class="muted">· ${esc(r.name)}, ${esc(ROLES[r.role]||r.role)}${r.county?` · ${esc(r.county)}`:""}</span><br>
     <span class="muted" style="font-size:.85rem">${LD_TYPE[r.type]||r.type} · ${new Date(r.t).toLocaleDateString()}${r.students?` · ~${r.students} students`:""}${r.grades.length?` · grades ${r.grades.map(g=>g==="9"?"Alg I":g).join(", ")}`:""}</span></span><span class="pill${r.status==="new"?" gold":""}">${LD_STAT[r.status]}</span></button>
    ${open?`<div class="tu-body"><p><a href="mailto:${esc(r.email)}">${esc(r.email)}</a>${r.phone?` · ${esc(r.phone)}`:""}${r.times?`<br>Best times: ${esc(r.times)}`:""}</p>${r.message?`<p style="white-space:pre-wrap">${esc(r.message)}</p>`:""}
     <div class="row"><label class="f" style="min-width:180px">Status<select data-ldst="${r.id}">${Object.entries(LD_STAT).map(([k,v])=>`<option value="${k}" ${r.status===k?"selected":""}>${v}</option>`).join("")}</select></label></div>
     <label class="f">Private notes<textarea data-ldnote="${r.id}" rows="3" maxlength="2000">${esc(r.note||"")}</textarea></label>
     <div class="row"><button class="small" data-ldsave="${r.id}">Save notes</button><button class="ghost small" data-lddel="${r.id}">Delete</button><span class="muted" id="ldm-${r.id}" role="status"></span></div></div>`:""}</div>`}).join("")}`;
}
function wireLeads(){if(!isAdmin()||!S.leads)return;const D=S.leads;
  const c=document.getElementById("ld-csv");if(c)c.onclick=()=>{const q=v=>`"${String(v??"").replace(/"/g,'""')}"`;saveFile(`school-requests-${new Date().toISOString().slice(0,10)}.csv`,[["Date","Type","Status","School/district","Name","Role","Email","Phone","County","Students","Grades","Times","Message","Notes"],...D.map(r=>[new Date(r.t).toLocaleDateString(),r.type,LD_STAT[r.status],r.org,r.name,ROLES[r.role],r.email,r.phone,r.county,r.students,r.grades.join(" "),r.times,r.message,r.note])].map(r=>r.map(q).join(",")).join("\n"))};
  app.querySelectorAll("[data-ld]").forEach(b=>b.onclick=()=>{S.ldOpen=S.ldOpen===b.dataset.ld?null:b.dataset.ld;render()});
  app.querySelectorAll("[data-ldst]").forEach(s=>s.onchange=async()=>{try{const d=await api("leadUpdate",{id:s.dataset.ldst,status:s.value});Object.assign(D.find(x=>x.id===s.dataset.ldst),d.lead);render()}catch(e){S.err=e.message;render()}});
  app.querySelectorAll("[data-ldsave]").forEach(b=>b.onclick=async()=>{const id=b.dataset.ldsave,m=document.getElementById("ldm-"+id);try{const d=await api("leadUpdate",{id,note:app.querySelector(`[data-ldnote="${id}"]`).value});Object.assign(D.find(x=>x.id===id),d.lead);m.textContent="Saved."}catch(e){m.textContent=e.message}});
  app.querySelectorAll("[data-lddel]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete this request? This can’t be undone."))return;try{await api("leadDelete",{id:b.dataset.lddel});S.leads=D.filter(x=>x.id!==b.dataset.lddel);render()}catch(e){S.err=e.message;render()}});
}

/* the family & homeschool waitlist */
function leadFamily(){
  if(S.leadDone){app.innerHTML=pageTop("Families")+`<div class="card pop" style="text-align:center;align-items:center;margin-top:30px"><h2>You’re on the list! 🎉</h2><p>We’ll email you as soon as the family and homeschool version is ready. In the meantime, try a practice question as a student.</p>
    <div class="row"><button id="lf-try">Try it as a student</button><button class="ghost" id="lf-home">Back to the home page</button></div></div>`+siteFooter();wirePageTop();wireFooter();
    document.getElementById("lf-try").onclick=()=>{S.screen="landing";render();setTimeout(()=>document.querySelector('[data-go="demo"]')?.click(),0)};document.getElementById("lf-home").onclick=()=>{S.screen="landing";render()};return}
  app.innerHTML=pageTop("Families")+`<div class="card"><span class="eyebrow">Families &amp; homeschool</span><h2>Join the family and homeschool waitlist</h2>
   <p>Path to Proficiency gives every student step-by-step help, the reason behind every wrong answer, read-aloud, Spanish, and Scout, a friendly AI tutor. We’re building a version families can use at home. Be the first to know.</p></div>
  <form class="card" id="lff" novalidate><div class="grid">
    <label class="f">Your name<input name="name" required maxlength="80" autocomplete="name"></label>
    <label class="f">Email<input name="email" type="email" required maxlength="120" autocomplete="email"></label>
    <label class="f">I am a<select name="role"><option value="parent">Parent or guardian</option><option value="homeschool">Homeschool parent</option><option value="other">Other</option></select></label>
    <label class="f">How many children?<input name="students" type="number" min="1" max="20" value="1"></label>
    <label class="f">County (optional)<select name="county"><option value="">Choose a county</option>${MS_COUNTIES.map(c=>`<option>${c}</option>`).join("")}<option>Outside Mississippi</option></select></label></div>
   <fieldset class="tset"><legend>Grades</legend>${["3","4","5","6","7","8","9"].map(g=>chk("grades",g,g==="9"?"Algebra I":`Grade ${g}`)).join("")}</fieldset>
   <label class="f">What would help your child most in math? (optional)<textarea name="message" rows="3" maxlength="1500"></textarea></label>
   <input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
   <p class="muted" style="font-size:.85rem">We only use this to tell you about the family version. We never sell or share it.</p>
   <p class="err" id="lf-err" role="alert"></p><div class="row"><button type="submit">Join the waitlist</button></div></form>`+siteFooter();
  wirePageTop();wireFooter();
  document.getElementById("lff").onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target),b={type:"family",org:"Family"};
    ["name","role","email","students","county","message","website"].forEach(k=>b[k]=fd.get(k)||"");b.grades=fd.getAll("grades");
    busy(e.submitter,"Sending…");try{await api("leadAdd",b);netlifyNotify(b);S.leadDone=true;render()}catch(er){document.getElementById("lf-err").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Join the waitlist"}};
}
/* email alert: also send the request to a Netlify form, which emails the site owner (turn on in Netlify → Forms → notifications) */
function netlifyNotify(b){if(b.website)return;try{const f={"form-name":"school-request",type:b.type,name:b.name,email:b.email,role:b.role||"",org:b.org||"",county:b.county||"",students:b.students||"",grades:(b.grades||[]).join(" "),times:b.times||"",message:b.message||""};
  fetch("/",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams(f).toString()}).catch(()=>{})}catch(e){}}
/* sections fade up as they scroll into view */
function revealOn(){const els=app.querySelectorAll(".reveal");if(!("IntersectionObserver" in window)||matchMedia("(prefers-reduced-motion: reduce)").matches){els.forEach(e=>e.classList.add("in"));return}
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}}),{rootMargin:"0px 0px -8% 0px"});els.forEach(e=>io.observe(e))}

/* ================= Privacy policy, terms, footer, quotes ================= */
const CONTACT_EMAIL="christianbarksdalebusiness@gmail.com",LEGAL_DATE="November 11, 2026";
/* real quotes only: add {q:"...",who:"Name",role:"Role, School"} once someone agrees to be quoted */
const QUOTES=[];
function quotesSection(){if(!QUOTES.length)return "";
  return `<section class="lsec reveal"><div class="lsec-h"><span class="eyebrow">From Mississippi classrooms</span><h2>What educators are saying</h2></div>
   <div class="why3">${QUOTES.map(x=>`<figure class="wcard quote"><blockquote>“${esc(x.q)}”</blockquote><figcaption><b>${esc(x.who)}</b><br><span class="muted">${esc(x.role)}</span></figcaption></figure>`).join("")}</div></section>`}
function siteFooter(){return `<footer class="sfoot"><div class="sfoot-grid">
   <div><div class="brand">${LOGO}<div><b>Path to Proficiency</b><small>Mississippi math, science &amp; ELA</small></div></div><p class="muted" style="font-size:.9rem;margin-top:8px">Made in the Mississippi Delta by a classroom math teacher.</p></div>
   <div><h3>For schools</h3><button class="linklike" data-ft="tour">See it in action</button><button class="linklike" data-ft="lead">Schedule a demonstration</button><button class="linklike" data-ft="found">Founding Schools</button><button class="linklike" data-ft="ms">Mississippi intervention</button></div>
   <div><h3>For families</h3><button class="linklike" data-ft="demo">Try it as a student</button><button class="linklike" data-ft="family">Family &amp; homeschool waitlist</button><button class="linklike" data-ft="tutor">Become a tutor</button></div>
   <div><h3>Contact</h3><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a><button class="linklike" data-ft="privacy">Privacy policy</button><button class="linklike" data-ft="terms">Terms of use</button><button class="linklike" data-ft="stu">Student login</button><button class="linklike" data-ft="tch">Teacher login</button></div></div>
   <p class="muted" style="font-size:.8rem;text-align:center;margin:14px 0 0">© ${new Date().getFullYear()} Path to Proficiency · Not affiliated with or approved by the Mississippi Department of Education.<br>${esc(TM_NOTE)}</p></footer>`}
function wireFooter(go){app.querySelectorAll("[data-ft]").forEach(b=>b.onclick=()=>{const k=b.dataset.ft;
  if(go&&go[k])return go[k]();
  ({tour:()=>startDemoSchool(true),lead:()=>{S.screen="lead";S.leadType="demo";S.leadDone=false;render()},family:()=>{S.screen="lead";S.leadType="family";S.leadDone=false;render()},
    found:()=>{S.screen="founding";render()},ms:()=>{S.screen="mississippi";render()},privacy:()=>{S.screen="privacy";render()},terms:()=>{S.screen="terms";render()},
    tutor:()=>{S.tDone=false;S.screen="tutorApply";render()},stu:()=>{S.screen="landing";render();setTimeout(()=>document.querySelector('[data-go="stu"]')?.click(),0)},tch:()=>{S.screen="landing";render();setTimeout(()=>document.querySelector('[data-go="tch"]')?.click(),0)},
    demo:()=>{S.screen="landing";render();setTimeout(()=>document.querySelector('[data-go="demo"]')?.click(),0)}})[k]?.()})}
function legalPage(title,sections){app.innerHTML=pageTop(title)+`<article class="card legal"><h1>${title}</h1><p class="muted">Last updated ${LEGAL_DATE}</p>
  ${sections.map(([h,ps])=>`<h2>${h}</h2>${ps.map(p=>Array.isArray(p)?`<ul>${p.map(x=>`<li>${x}</li>`).join("")}</ul>`:`<p>${p}</p>`).join("")}`).join("")}
  <h2>Contact</h2><p>Questions? Email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p></article>`+siteFooter();wirePageTop();wireFooter()}
SCREENS.privacy=()=>legalPage("Privacy policy",[
 ["The short version",["Path to Proficiency is a math practice and planning tool for schools. We collect only what the app needs to work, we never sell personal information, we never show ads, and schools stay in control of their students’ data."]],
 ["What we collect",[["<b>Teachers and school staff:</b> name, a teacher code (stored only as a scrambled hash, never as the code itself), and the classes and settings they create.","<b>Students:</b> the first name or nickname a teacher enters, a 4-digit code, the class they belong to, and their practice: answers, scores, time spent, badges, and any plan the teacher creates. We do not collect student email addresses, phone numbers, home addresses, or photos.","<b>Messages to Scout, the AI tutor:</b> questions students type to Scout, and daily usage counts.","<b>People who contact us:</b> the information typed into our demo request, Founding Schools, family waitlist, and tutor application forms, including any résumé uploaded.","<b>Basic technical information</b> our hosting provider records to run and protect the site, such as IP addresses used to block repeated failed sign-ins."]]],
 ["How we use it",["Only to run the app for the school: building each student’s practice, showing teachers and school leaders progress, creating plans and reports, keeping accounts secure, and answering people who contact us. We do not use student information for advertising or to build profiles for any other purpose."]],
 ["The AI tutor and AI features",["When a student asks Scout for help, the math question on screen, the student’s message, their grade, and the first name the teacher entered are sent to our AI provider, Anthropic, to write a reply. When a teacher imports a test or asks for a reteach idea, the test or standard text is sent the same way. Under our provider’s commercial terms, this data is not used to train its models. Teachers can turn Scout off for any class."]],
 ["Who we share it with",["We never sell or rent personal information. We share it only with the service providers that run the app for us, and only as needed:",["<b>Netlify</b> hosts the website and stores the school’s data.","<b>Anthropic</b> powers the AI tutor and AI features, as described above."],"We may also disclose information if the law requires it, or with a school’s permission."]],
 ["Schools are in control",["Student information belongs to the school. School admins can view, export, correct, and delete their data at any time, including deleting a student, a class, or all of a class’s progress. Families who want to see, correct, or delete a student’s information should contact the student’s school, and we will help the school respond. We are glad to review and sign a school or district’s data privacy agreement."]],
 ["Children’s privacy",["Students use Path to Proficiency through their school. We rely on the school to provide any notice and consent needed for educational use, as allowed under the Children’s Online Privacy Protection Act (COPPA) and the Family Educational Rights and Privacy Act (FERPA). We do not knowingly collect personal information directly from children outside of a school’s account."]],
 ["How long we keep it",["We keep a school’s data while the school uses Path to Proficiency. When a school deletes a student or class, it is removed from the live app; automatic nightly backups are kept for about three weeks and then deleted. When a school stops using the service, we delete its data on request."]],
 ["Security",["Data is sent over encrypted connections, teacher codes are stored as hashes, sign-in attempts are rate-limited, and each school’s data is backed up nightly. No system is perfectly secure, and if we learn of a breach affecting a school’s data, we will notify the school promptly."]],
 ["Changes",["If we change this policy, we will update the date at the top. For important changes, we will notify school admins."]]]);
SCREENS.terms=()=>legalPage("Terms of use",[
 ["Agreement",["By using Path to Proficiency, you agree to these terms. If you use it for a school, you confirm you have permission to do so on the school’s behalf. A school’s signed agreement with us, if there is one, takes priority over these terms."]],
 ["Accounts",["Schools are responsible for the teacher and student accounts they create and for keeping teacher codes private. Each teacher should have their own code. Let us know right away if you believe an account has been misused."]],
 ["Licenses and seats",["Paid school licenses cover the number of teachers and students listed in the school’s agreement or quote. Accounts may not be shared beyond those limits, and student codes should not be shared between students."]],
 ["Acceptable use",["Please don’t:",["Use the service for anything unlawful or harmful to students.","Try to access accounts, schools, or data that aren’t yours.","Upload content you don’t have the right to use, such as copyrighted tests you aren’t permitted to share.","Copy, resell, or reverse-engineer the service."]]],
 ["Content",["Path to Proficiency, its questions, lessons, and design belong to us. Schools keep ownership of the tests, student data, and content they upload, and give us permission to use it only to provide the service to that school."]],
 ["AI-generated help",["Scout and other AI features can make mistakes. They support teachers; they don’t replace them. Teachers should review AI-generated questions and imported tests before students use them."]],
 ["Not a state assessment",["Path to Proficiency is a practice and planning tool. Readiness estimates are based on practice, not state tests. It is not a state-approved screener and has not been reviewed or approved by the Mississippi Department of Education."]],
 ["No warranty",["We work hard to keep the service accurate and available, but it is provided “as is,” without warranties of any kind, to the extent the law allows."]],
 ["Limitation of liability",["To the extent the law allows, Path to Proficiency is not liable for indirect or consequential damages, and our total liability is limited to the amount the school paid us in the 12 months before the claim."]],
 ["Ending use",["A school can stop using the service at any time and ask us to delete its data. We may suspend accounts that violate these terms."]],
 ["Governing law",["These terms are governed by the laws of the State of Mississippi."]],
 ["Changes",["We may update these terms and will change the date at the top when we do. For important changes, we will notify school admins."]]]);

/* ================= Go Further, benchmark windows, progress reports ================= */
/* ---------- Go Further: after the summit, students keep climbing into next-grade standards ---------- */
const nextGrade=()=>gradeOf()+1;
const goList=p=>p&&p.go&&nextGrade()<=9?LIB.filter(x=>x.grade===nextGrade()).map(x=>x.code):[];
const goListRaw=raw=>goList(raw&&raw.prog&&raw.prog[TESTID]);
function goFurtherCard(s){const p=s.prog;if(p.go||nextGrade()>9||curSkill(s)||(!S.demo&&SB&&SB.cls&&SB.cls.gofur===false))return "";
  return `<div class="card go-card"><div class="top"><h2>🚀 ${t("Go Further")}</h2><span class="pill gold">${esc(gLabel(nextGrade()))}</span></div>
   <p>${t("You reached the summit of every standard on your trail! Want a new mountain? Start practicing the next grade’s standards.")}</p>
   <div class="row"><button id="go-further">${t("Start the next mountain")}</button></div></div>`}
function startGoFurther(){const s=S.student;s.prog.go=true;s.raw.prog={...(s.raw.prog||{}),[TESTID]:s.prog};
  addExtras([...(s.assigned||[]),...ipCodes(s),...goList(s.prog)]);S.student=viewStudent(s.raw);save();chirp("mastered");render()}
Object.assign(ES,{"Go Further":"Ve más lejos","You reached the summit of every standard on your trail! Want a new mountain? Start practicing the next grade’s standards.":"¡Llegaste a la cima de todos los estándares de tu camino! ¿Quieres una nueva montaña? Empieza a practicar los estándares del siguiente grado.","Start the next mountain":"Empezar la nueva montaña","Going further":"Más allá"});

/* ---------- benchmark windows: fall, winter, spring ---------- */
const WINS=["Fall","Winter","Spring"],WINS_ES={Fall:"Otoño",Winter:"Invierno",Spring:"Primavera"};
const schoolYear=(t=Date.now())=>{const d=new Date(t),y=d.getFullYear(),s=d.getMonth()>=6?y:y-1;return `${s}-${String(s+1).slice(2)}`};
/* a student’s benchmark results this year; Fall falls back to the score from the class benchmark */
function bmOf(s,yr=schoolYear()){const b={...((s.bm||{})[yr]||{})};if(b.Fall==null){const sc=testScore(s);if(sc!=null)b.Fall=sc,b._fallAuto=true}return b}
const bmGrowth=b=>{const v=WINS.map(w=>b[w]).filter(x=>x!=null);return v.length>=2?v[v.length-1]-v[0]:null};
function tBench(){
  const real=CUR.students.filter(s=>!isSample(s)),yr=schoolYear(),cut=ipCfg().cut||60;
  const B=real.map(s=>({s,b:bmOf(s,yr)}));
  const avg=w=>{const v=B.map(x=>x.b[w]).filter(x=>x!=null);return v.length?Math.round(v.reduce((a,x)=>a+x,0)/v.length):null};
  const atCut=w=>{const v=B.map(x=>x.b[w]).filter(x=>x!=null);return v.length?{n:v.filter(x=>x>=cut).length,of:v.length}:null};
  const moved=B.filter(x=>{const v=WINS.map(w=>x.b[w]).filter(y=>y!=null);return v.length>=2&&v[0]<cut&&v[v.length-1]>=cut}).length;
  const grew=B.filter(x=>(bmGrowth(x.b)||0)>0).length,withTwo=B.filter(x=>bmGrowth(x.b)!=null).length;
  const pts=WINS.map(w=>({label:w,y:avg(w)??0,tip:avg(w)==null?`${w}: no scores yet`:`${w}: class average ${avg(w)}%`}));
  return `<div class="card"><div class="top"><h2>Benchmarks · ${esc(yr)}</h2><span class="muted" style="font-size:.85rem">Cut score ${cut}%</span></div>
    <p class="muted">Enter each student’s benchmark or screener score (%) for fall, winter, and spring. You’ll see where every student started, where they are now, and who moved from below the cut score to at or above it. Fall fills in from ${esc(TEST_NAME)} when you leave it blank.</p>
    <div class="kpis small">${WINS.map(w=>{const a=atCut(w);return `<div class="kpi ${a&&a.n/a.of>=.6?"go":a?"gold":""}"><b>${avg(w)==null?"—":avg(w)+"%"}</b><span>${w} average</span><small>${a?`${a.n} of ${a.of} at or above ${cut}%`:"no scores yet"}</small></div>`}).join("")}
     <div class="kpi go"><b>${moved}</b><span>Moved to at or above the cut</span><small>${withTwo?`${grew} of ${withTwo} students improved`:"needs two windows"}</small></div></div>
    ${pts.some(p=>p.y)?barChart(pts):""}</div>
  <div class="card"><h2>Scores by window</h2><form id="bm-f"><div class="tablewrap"><table class="roster bm"><thead><tr><th>Student</th>${WINS.map(w=>`<th>${w}</th>`).join("")}<th>Growth</th></tr></thead><tbody>
    ${B.map(({s,b})=>{const g=bmGrowth(b);return `<tr><td><b>${esc(s.name)}</b></td>${WINS.map(w=>`<td><input class="bmi" type="number" min="0" max="100" inputmode="numeric" aria-label="${esc(s.name)} ${w} score" data-bm="${s.id}" data-w="${w}" value="${b[w]!=null&&!(w==="Fall"&&b._fallAuto)?b[w]:""}" placeholder="${w==="Fall"&&b._fallAuto?b.Fall:"%"}"></td>`).join("")}
      <td>${g==null?'<span class="muted">—</span>':`<span class="pill ${g>0?"go":g<0?"oops":""}">${g>0?"+":""}${g}</span>`}</td></tr>`}).join("")}</tbody></table></div>
    <div class="row"><button type="submit">Save scores</button><span class="muted" id="bm-msg" role="status"></span></div></form></div>
  ${scrCard()}${progressCard()}`;
}
function wireBench(){const f=document.getElementById("bm-f");if(f)f.onsubmit=async e=>{e.preventDefault();const yr=schoolYear();busy(e.submitter,"Saving…");
    f.querySelectorAll("[data-bm]").forEach(i=>{const r=CUR.raw.find(x=>x.id===i.dataset.bm);r.bm={...(r.bm||{})};const y={...(r.bm[yr]||{})};
      if(i.value==="")delete y[i.dataset.w];else y[i.dataset.w]=Math.max(0,Math.min(100,Math.round(+i.value)));r.bm[yr]=y});
    try{await saveRoster(CUR.raw);flash("bm-msg","Saved.");render()}catch(er){document.getElementById("bm-msg").textContent=er.message;e.submitter.disabled=false;e.submitter.textContent="Save scores"}};
  wireScr();wireProgress()}

