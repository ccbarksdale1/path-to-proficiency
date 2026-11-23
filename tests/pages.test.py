"""Page tests: a robot browser clicks through the sample school and the student demo.
Run:  python3 tests/pages.test.py      (needs: pip install playwright && playwright install chromium)
It starts its own small web server for the public/ folder, so nothing else needs to be running."""
import http.server, os, socketserver, sys, threading
from functools import partial
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public")
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(("127.0.0.1", 0), partial(Quiet, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{srv.server_address[1]}/"

results = []
def check(name, ok, detail=""):
    results.append(ok); print(("  ok   " if ok else "  FAIL ") + name + ("" if ok else f"\n       {detail}"))

def page(b, errs, w=1200):
    pg = b.new_page(viewport={"width": w, "height": 900})
    pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
    pg.on("response", lambda r: errs.append(f"{r.status} {r.url}") if r.status >= 400 else None)
    return pg

def sample_school(b, errs):
    pg = page(b, errs); pg.goto(BASE); pg.wait_for_timeout(1500)
    pg.click('[data-go="tour"]'); pg.wait_for_timeout(2500)
    pg.evaluate("document.querySelectorAll('#tour').forEach(e=>e.remove())")
    return pg

with sync_playwright() as p:
    b = p.chromium.launch()

    errs = []; pg = page(b, errs); pg.goto(BASE); pg.wait_for_timeout(2000)
    check("home page loads, styled, no errors", "Close them" in pg.inner_text("h1") and "Lexend" in pg.evaluate("getComputedStyle(document.body).fontFamily") and not errs, errs[:3])
    check("print windows get the page styles", pg.evaluate("pageCSS().length>20000"))
    check("no outside requests (fonts are self-hosted)", pg.evaluate("performance.getEntriesByType('resource').every(r=>new URL(r.name).origin===location.origin)"))
    pg.close()

    errs = []; pg = sample_school(b, errs)
    for t in pg.evaluate("[...document.querySelectorAll('[data-tt]')].map(b=>b.dataset.tt)"):
        pg.evaluate(f"document.querySelector('[data-tt=\"{t}\"]').click()"); pg.wait_for_timeout(400)
    pg.evaluate("openClass(TB.classes[0].id,'class')"); pg.wait_for_timeout(1800)
    tabs = pg.evaluate("[...document.querySelectorAll('[data-tab]')].map(b=>b.dataset.tab)")
    empty = []
    for t in tabs:
        pg.evaluate(f"S.tab='{t}';render()"); pg.wait_for_timeout(300)
        if pg.evaluate("document.getElementById('app').innerText.length") < 600: empty.append(t)
    check(f"every teacher page draws ({len(tabs)} class pages)", not errs and not empty, (errs[:3], empty))

    pg.evaluate("S.tab='class';render()"); pg.wait_for_timeout(300)
    story = pg.inner_text(".mis-story") if pg.query_selector(".mis-story") else ""
    check("sample story shows one mistake fixed start to finish", "3.OA.1" in story and "4 of 6 fixed it" in story, story[:120])
    check("Start here shows who, what to reteach, who is ready", all(x in pg.inner_text(".start-here") for x in ("Who needs me today", "What to reteach", "Ready to move on")))
    pg.click(".mis-story [data-std]"); pg.wait_for_timeout(400)
    check("tapping a standard opens who and why", "Why they’re missing it" in pg.inner_text("#app") and "Every student on 3.OA.1" in pg.inner_text("#app"))
    pg.click("#app tbody [data-stu]"); pg.wait_for_timeout(400)
    check("tapping a name opens the student's portfolio", "Recent mistakes" in pg.inner_text("#app") and "based on" in pg.inner_text(".sv-ready"))
    pg.click("#sv-back"); pg.wait_for_timeout(300)
    pg.fill("#ef-q", "Jaylen"); pg.wait_for_timeout(300)
    check("Every student search filters by name", pg.evaluate("document.querySelectorAll('#every tbody tr').length") == 1)
    pg.evaluate("S.tab='items';render()"); pg.wait_for_timeout(300)
    check("Item analysis is never empty (practice view)", pg.evaluate("document.querySelectorAll('#app table.roster tbody tr').length") > 3)
    pg.evaluate("S.tab='class';render()"); pg.wait_for_timeout(300)
    check("Hands up card shows sample hands", "Hands up" in pg.inner_text("#hands") and pg.evaluate("S.hands.list.length") == 2)
    pg.click("#navfab"); pg.wait_for_timeout(200); pg.fill("#nh-q", "pacing"); pg.wait_for_timeout(150)
    pg.click(".nh-i:not([hidden])"); pg.wait_for_timeout(1200)
    check("Find a page takes you to the pacing guide", pg.evaluate("S.tab") == "pace" and "Pacing guide" in pg.inner_text("#app"))
    check("pacing guide covers every standard once, grades 3-8 and Algebra I", pg.evaluate("""[3,4,5,6,7,8,9].every(g=>{const c=LIB.filter(x=>x.grade===g).map(x=>x.code),U=PACE_G[g].flatMap(u=>u.stds);return c.every(x=>U.includes(x))&&U.every(x=>c.includes(x))&&new Set(U).size===U.length})"""))
    pg.evaluate("S.tab='home';render()"); pg.wait_for_timeout(600)
    check("Family updates drafts a message per student", pg.evaluate("document.querySelectorAll('.fam textarea').length") > 3)
    pg.evaluate("S.tab='celebrate';render()"); pg.wait_for_timeout(400)
    check("Celebrate lists wins", "Celebrate these kids" in pg.inner_text("#app"))
    pg.close()

    errs = []; pg = page(b, errs, 900); pg.goto(BASE); pg.wait_for_timeout(1500); pg.click('[data-go="demo"]'); pg.wait_for_timeout(2500)
    pg.evaluate("document.querySelectorAll('#tour').forEach(e=>e.remove())")
    for i in range(20):
        pg.evaluate("newQ();S.screen='practice';S.step=2;render()"); pg.wait_for_timeout(60)
    check("20 practice questions draw without errors", not errs, errs[:3])
    pg.evaluate("newQ();S.screen='practice';S.step=2;S.student.prog.recent=[];render()"); pg.wait_for_timeout(200)
    hidden = not pg.query_selector("#hl-open")
    pg.evaluate("S.student.prog.recent.push({k:S.k,q:'x',ok:false});render()"); pg.wait_for_timeout(200)
    check("I'm stuck appears only after an attempt", hidden and bool(pg.query_selector("#hl-open")))
    pg.click("#hl-open"); pg.click("#wt-go"); pg.wait_for_timeout(500)
    check("Watch it solved plays a different problem", pg.evaluate("!!S.wt.q&&qSpeech(S.wt.q)!==qSpeech(S.q)"))
    pg.close()

    errs = []; pg = page(b, errs, 900); pg.goto(BASE + "arcade/clue-detective/index.html"); pg.wait_for_timeout(800)
    check("Clue Detective opens", bool(pg.query_selector("[data-s]")) and not errs, errs[:3])
    pg.goto(BASE + "home/?s=3oa7"); pg.wait_for_timeout(600)
    check("Family activity page opens", "Multiplication facts" in pg.inner_text("h1"))
    pg.close(); b.close()

srv.shutdown()
print(f"\n{sum(results)} of {len(results)} page tests passed")
sys.exit(0 if all(results) else 1)
