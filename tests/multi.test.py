"""Multi-district walk-through in a real browser: owner creates a district, school and district admin; the school's admin
sets up with the one-time key; the teacher signs in again with the remembered school code; the district admin sees the school;
single-school mode is unchanged. Starts its own dev servers. Run: python3 tests/multi.test.py"""
import os, subprocess, sys, time
HERE=os.path.dirname(os.path.abspath(__file__))
procs=[subprocess.Popen(["node",os.path.join(HERE,"devserver.mjs"),port]+extra,stdout=subprocess.DEVNULL,env={**os.environ,"OWNER_CODE":"owner-dev"}) for port,extra in (("8794",["--multi"]),("8795",[]))]
time.sleep(1.5)
results=[]
def check(name,ok):
    results.append(ok);print(("  ok   " if ok else "  FAIL ")+name)
try:
    from playwright.sync_api import sync_playwright
    M="http://localhost:8794/";S1="http://localhost:8795/"
    with sync_playwright() as p:
        b=p.chromium.launch();errs=[]
        def page(w=1150):
            pg=b.new_page(viewport={"width":w,"height":950});pg.on("pageerror",lambda e:errs.append(str(e)[:150]));pg.on("dialog",lambda d:d.accept("DELETE ghost-es"));return pg
        # 1) owner sets up a district, a school and a district admin
        pg=page();pg.goto(M+"#owner");pg.wait_for_timeout(1500)
        pg.fill("#o-code","owner-dev");pg.click("#o-in button");pg.wait_for_timeout(800)
        check("owner signs in to the districts dashboard",pg.evaluate("S.own.multi")==True)
        pg.fill("#nd-name","Cleveland School District");pg.fill("#nd-id","cleveland-sd");pg.click("#o-nd button");pg.wait_for_timeout(600)
        pg.fill("#ns-name","RH Bearden Elementary");pg.fill("#ns-id","rh-bearden");pg.click("#o-ns button");pg.wait_for_timeout(600)
        key=pg.evaluate("[...document.querySelectorAll('b')].map(x=>x.innerText).find(t=>/^[A-Za-z0-9]{12}$/.test(t))");check("adding a school shows its one-time setup key",bool(key))
        pg.fill("#da-name","Dr. Johnson");pg.fill("#da-code","135791");pg.click("#o-da button");pg.wait_for_timeout(600)
        check("district admin saved",pg.inner_text("#app").count("Dr. Johnson")>=1)
        pg.fill("#ns-name","Ghost School");pg.fill("#ns-id","ghost-es");pg.click("#o-ns button");pg.wait_for_timeout(600)
        pg.click('[data-odel="ghost-es"]');pg.wait_for_timeout(800);check("deleting a school removes it","ghost-es" not in pg.inner_text("#app").split("School deleted")[-1])
        pg.close()
        # 2) the school's first admin sets it up with the school code and the setup key
        pg=page();pg.goto(M);pg.wait_for_timeout(1500);pg.click('[data-go="tch"]');pg.wait_for_timeout(800)
        check("teacher login asks for the school code first",pg.evaluate("S.screen")=="schoolcode")
        pg.fill("#scc","rh-bearden");pg.click("#scf button");pg.wait_for_timeout(800);check("a new school asks for the setup key",pg.evaluate("S.screen")=="setup" and bool(pg.query_selector("#s-key")))
        pg.fill("#s-key",key);pg.fill("#s-name","Mr. Barksdale");pg.fill("#s-code","2580");pg.fill("#s-code2","2580");pg.click("#sf button");pg.wait_for_timeout(1500)
        check("first admin sets up the school",pg.evaluate("!!(TB&&TB.me)") and pg.evaluate("TB.school.name")=="RH Bearden Elementary")
        pg.close()
        # 3) the same teacher signs in again later: the device remembers the school
        pg=page();pg.goto(M);pg.wait_for_timeout(1200);pg.evaluate("localStorage.setItem('ptp-school',JSON.stringify('rh-bearden'))");pg.click('[data-go="tch"]');pg.wait_for_timeout(800)
        check("the device remembers the school",pg.evaluate("S.screen")=="signin" and "RH Bearden" in pg.inner_text("#app"))
        for d in "2580": pg.click(f'.pad button[data-n="{d}"]')
        pg.click('.pad button[data-n="go"]');pg.wait_for_timeout(1500);check("teacher signs in again",pg.evaluate("!!(TB&&TB.me)"))
        pg.close()
        # 4) district admin
        pg=page();pg.goto(M);pg.wait_for_timeout(1200);pg.evaluate("S.screen='districtSignin';render()")
        pg.fill("#ds-d","cleveland-sd");pg.fill("#ds-c","000000");pg.click("#dsf button");pg.wait_for_timeout(600);check("wrong district admin code is refused","did not match" in pg.inner_text(".err"))
        pg.fill("#ds-d","cleveland-sd");pg.fill("#ds-c","135791");pg.click("#dsf button");pg.wait_for_timeout(1500)
        check("district admin sees their schools",pg.evaluate("S.screen")=="districtHome" and "RH Bearden" in pg.inner_text("#app"))
        pg.close()
        # 5) single-school mode is unchanged: no school code step
        pg=page();pg.goto(S1);pg.wait_for_timeout(1200);pg.click('[data-go="tch"]');pg.wait_for_timeout(800)
        check("single-school mode is unchanged",pg.evaluate("S.screen")=="setup" and not pg.query_selector("#s-key"))
        pg.close()
        check("no page errors",not errs);b.close()

finally:
    for pr in procs: pr.terminate()
print(f"\n{sum(results)} of {len(results)} multi-district checks passed")
sys.exit(0 if results and all(results) else 1)
