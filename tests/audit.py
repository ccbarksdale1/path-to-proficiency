"""Question-quality audit: generates many questions per skill and flags repeats and weak wrong answers.
Run: python3 tests/audit.py [--grade 10] [--n 60]   (starts its own dev server on port 8796)"""
import json, subprocess, sys, time, os
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
N = int(args[args.index("--n")+1]) if "--n" in args else 60
ONLY = args[args.index("--grade")+1] if "--grade" in args else None
srv = subprocess.Popen(["node", "tests/devserver.mjs", "8796"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.2)
JS = r"""([N,only])=>{
const LL="ABCDE",num=t=>{if(typeof t!=="string")return null;let s=t.replace(/[,$%°]/g,"").replace(/−/g,"-").trim();
  let m=s.match(/^(-?)\[(\d+)\/(\d+)\]$/);if(m)return (m[1]?-1:1)*m[2]/m[3];
  m=s.match(/^(-?\d+) \[(\d+)\/(\d+)\]$/);if(m)return Math.sign(+m[1]||1)*(Math.abs(+m[1])+m[2]/m[3]);
  return /^-?\d+(\.\d+)?$/.test(s)?+s:null};
const out=[];const grades=only?[+only]:[2,3,4,5,6,7,8,9,10,11];
for(const g of grades){try{useTest({id:"std"+g})}catch(e){continue}
 for(const k of SKILLS){const gen=(LIB.find(x=>x.code===k.std)||{}).gen||k.id;let n=0,errs=0;const full={},right={},pos={};let far=0,farEx=null,dup=0,mcN=0,wrongN=0;
  for(let s=1;s<=N;s++){let q;try{q=viewQ(GG.make(gen,s*7919+13))}catch(e){errs++;continue}if(!q)continue;n++;full[JSON.stringify([q.parts,(q.choices||[]).map(String).sort(),q.ans])]=1;
   if(q.type==="mc"&&q.choices){mcN++;const i=LL.indexOf(String(q.ans));const ch=q.choices.map(c=>typeof c==="string"?c:JSON.stringify(c));
     pos[i]=(pos[i]||0)+1;right[ch[i]]=(right[ch[i]]||0)+1;if(new Set(ch).size<ch.length)dup++;
     const cp=MCFIX.parse(ch[i]);if(cp&&cp.v)ch.forEach((w,j)=>{if(j===i)return;const wp=MCFIX.parse(w);if(!wp||!wp.v)return;wrongN++;if(MCFIX.far(cp,wp)){far++;if(!farEx)farEx=ch[i]+" vs "+w}})}
   else if(q.ans!=null){const a=String(q.ans);right[a]=(right[a]||0)+1}}
  const top=Object.entries(right).sort((a,b)=>b[1]-a[1])[0]||["",0];
  out.push({g,std:k.std,gen,n,errs,uniqQ:+(Object.keys(full).length/Math.max(n,1)).toFixed(2),topAns:top[0].slice(0,30),topShare:+(top[1]/Math.max(n,1)).toFixed(2),
    farShare:wrongN?+(far/wrongN).toFixed(2):0,farEx,dup,mcN})}}
return out}"""
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.goto("http://localhost:8796/"); pg.wait_for_timeout(800)
        rows = pg.evaluate(JS, [N, ONLY]); b.close()
finally:
    srv.terminate()
flag = lambda r: [w for w, c in [("REPEATS", r["uniqQ"] < 0.5), ("SAME-ANSWER", r["topShare"] > 0.2), ("FAR-WRONG", r["farShare"] > 0.1), ("DUP-CHOICE", r["dup"] > 0), ("ERRORS", r["errs"] > 0 or r["n"] == 0)] if c]
bad = [(r, flag(r)) for r in rows if flag(r)]
json.dump(rows, open("/tmp/audit.json", "w"))
by = {}
for r, f in bad: by.setdefault(r["g"], []).append((r, f))
print(f"{len(rows)} skills checked, {len(bad)} flagged")
for g in sorted(by):
    print(f"\n== grade {g}: {len(by[g])} flagged")
    for r, f in by[g]:
        print(f"  {r['std']:<12} {','.join(f):<32} uniq {r['uniqQ']} top {r['topShare']} ({r['topAns']}) far {r['farShare']} {r['farEx'] or ''}")
sys.exit(0)
