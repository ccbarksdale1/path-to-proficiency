/* Path to Proficiency · Startup: restore the session and draw the first screen.
   Loaded in order by index.html as plain scripts that share one global scope. */
/* ---------- start ---------- */
(async()=>{
  const sess=ls.get(SKEY,sessionStorage);
  if(sess&&sess.token){TOKEN=sess.token;
    try{if(sess.role==="teacher"){startTeacher({token:TOKEN,...await api("boot")});return}
      else{startStudent({...await api("studentBoot"),token:TOKEN});return}}catch(e){const c=ls.get(BOOTKEY,sessionStorage);if(sess.role!=="teacher"&&c&&/reach the school server/.test(e.message)){startStudent({...c,token:TOKEN});return}TOKEN=null;ls.set(SKEY,null,sessionStorage)}}
  if(location.hash==="#tutor"){S.screen="tutorApply"}
  if(location.hash==="#owner"){S.screen="owner"}
  if(location.hash==="#mississippi")S.screen="mississippi";if(location.hash==="#founding")S.screen="founding";if(location.hash==="#demo-request"){S.screen="lead";S.leadType="demo"}
  if(location.hash==="#tour"){render();startDemoSchool(true);return}
  render();
})();

