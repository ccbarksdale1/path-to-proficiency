"""Question integrity check for EVERY test (math 3-8, Algebra I, ACT, WorkKeys, science, ELA, the old Grade 3 benchmark):
generated questions AND the fixed question bank. Looks for broken text (undefined/NaN), answers that aren't among the
choices, two choices that mean the same value, missing explanations, and questions that fail to draw.
Run: python3 tests/integrity.py [--n 30]   (starts its own dev server on port 8797)"""
import json, subprocess, sys, time, os
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
N = int(args[args.index("--n")+1]) if "--n" in args else 30
srv = subprocess.Popen(["node", "tests/devserver.mjs", "8797"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.2)
JS = r"""(N)=>{
const LL="ABCDEFGH",bad=/\bundefined\b|\bNaN\b|\[object |\bnull\b|Infinity|\$\{/;
const txt=x=>typeof x==="string"?x:x==null?"":typeof x==="object"?(x.eq||x.fig||x.t||""):String(x);
const issues=[],count={};let arith=0;
const tests=["a1",...[...GRADES,...SCI_GRADES,...ELA_GRADES].map(g=>"std"+g)];
for(const tid of tests){try{useTest({id:tid})}catch(e){issues.push([tid,"-","useTest failed: "+e.message]);continue}
 count[tid]=0;
 for(const k of SKILLS){
  const ids=[];const gen=genOf(k);if(gen)for(let s=1;s<=N;s++)ids.push(`~${gen}~${s*7919+13}`);
  (k.twins||[]).forEach(t=>ids.push(t));(k.qs||[]).forEach(n=>ids.push("q"+n));
  if(!ids.length){issues.push([tid,k.std,"no questions at all"]);continue}
  let made=0;
  for(const id of ids){let q;
   try{q=getQ(id)}catch(e){issues.push([tid,k.std,"error making "+id+": "+String(e.message).slice(0,80)]);continue}
   if(!q){continue}made++;count[tid]++;
   const where=k.std+" "+id.slice(0,40);
   try{const v=viewQ(q);bodyHTML(v,null,"check");bodyHTML(v,null,"print")}catch(e){issues.push([tid,where,"won't draw: "+String(e.message).slice(0,80)]);continue}
   const parts=(q.parts||[]).map(txt).join(" ");
   if(!q.parts||!q.parts.length)issues.push([tid,where,"no question text"]);
   if(bad.test(parts))issues.push([tid,where,"broken text in question: "+parts.match(bad)[0]+" … "+parts.slice(0,90)]);
   if(q.type==="mc"){const ch=(q.choices||[]).map(c=>typeof c==="string"?c:JSON.stringify(c));
     if(ch.length<2)issues.push([tid,where,"fewer than 2 choices"]);
     const i=LL.indexOf(String(q.ans));if(i<0||i>=ch.length)issues.push([tid,where,"answer "+q.ans+" is not one of the "+ch.length+" choices"]);
     if(new Set(ch.map(c=>c.trim())).size<ch.length)issues.push([tid,where,"two choices are the same: "+ch.join(" | ").slice(0,120)]);
     ch.forEach(c=>{if(bad.test(c))issues.push([tid,where,"broken text in a choice: "+c.slice(0,80)])});
     const vals=ch.map(c=>{try{return MCFIX.parse(c)}catch(e){return null}});const cv=vals[i];
     if(cv&&cv.v!=null&&isFinite(cv.v))vals.forEach((w,j)=>{if(j!==i&&w&&w.v!=null&&Math.abs(w.v-cv.v)<1e-9&&ch[j]!==ch[i]&&!/[a-z]{3}/i.test(ch[j]+ch[i])&&!/mixed number|precision|decimal places|significant|way to report/i.test(parts))issues.push([tid,where,"a wrong choice equals the answer: "+ch[i]+" = "+ch[j]])});
   }else if(q.type==="input"){if(q.ans===undefined||q.ans===null||String(q.ans).trim()===""||bad.test(String(q.ans)))issues.push([tid,where,"input answer missing or broken: "+q.ans]);
     if(q.whyIn&&Object.prototype.hasOwnProperty.call(q.whyIn,String(q.ans)))issues.push([tid,where,"the right answer is listed as a mistake (whyIn)"]);
   }else if(q.type==="multi"){const a=Array.isArray(q.ans)?q.ans:String(q.ans).split("");if(!a.length||a.some(x=>LL.indexOf(x)<0||LL.indexOf(x)>=(q.choices||[]).length))issues.push([tid,where,"multi answer not in choices: "+q.ans]);
   }else if(q.type==="matrix"){if(!q.rows||!q.cols||q.rows.some(r=>{const a=r.a??r.ans;return a==null||(typeof a==="number"?a>=q.cols.length:!q.cols.includes(a))}))issues.push([tid,where,"matrix row answer not in columns"]);}
   /* arithmetic check: "a op b = ∎" questions must have the right answer */
   const m=parts.replace(/,/g,"").match(/^\s*(\d+(?:\.\d+)?) ([+−×÷-]) (\d+(?:\.\d+)?) = [∎?]\s*$/);
   if(m){arith++;const a=+m[1],b=+m[3],v={"+":a+b,"−":a-b,"-":a-b,"×":a*b,"÷":a/b}[m[2]];let got=null;
     if(q.type==="input")got=+String(q.ans).replace(/,/g,"");else if(q.type==="mc"){const c=q.choices[LL.indexOf(String(q.ans))];got=typeof c==="string"?+c.replace(/,/g,""):null}
     if(got!=null&&!isNaN(got)&&Math.abs(got-v)>1e-9)issues.push([tid,where,`WRONG ANSWER: ${parts.trim()} gives ${got}, should be ${v}`])}
   const st=(q.steps||[]).map(s=>txt(s.say)).join(" ");if(bad.test(st))issues.push([tid,where,"broken text in walkthrough: "+st.match(bad)[0]]);
   Object.values(q.why||{}).concat(Object.values(q.whyIn||{})).forEach(w=>{if(bad.test(String(w)))issues.push([tid,where,"broken text in an explanation: "+String(w).slice(0,80)])});
  }
  if(!made)issues.push([tid,k.std,"every question failed to make"]);
 }}
return {issues,count,arith}}"""
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        pg.goto("http://localhost:8797/"); pg.wait_for_timeout(1000)
        r = pg.evaluate(JS, N); b.close()
finally:
    srv.terminate()
iss = r["issues"]
print(f"Questions checked: {sum(r['count'].values())} across {len(r['count'])} tests; {r['arith']} arithmetic answers recomputed")
seen = {}
for t, w, m in iss:
    key = (t, w.split(' ')[0], m.split(':')[0])
    seen.setdefault(key, []).append((w, m))
print(f"{len(iss)} problems ({len(seen)} distinct)")
for (t, std, kind), L in sorted(seen.items()):
    print(f"  {t:6} {std:12} x{len(L):<3} {L[0][1][:150]}   [{L[0][0]}]")
if errs: print("page errors:", errs)
sys.exit(1 if iss else 0)
