# Windows-like: notched mouse wheel (100px steps), common laptop sizes and display scaling, CPU slowed down
from playwright.sync_api import sync_playwright
import statistics
CASES=[(1366,768,1),(1536,864,1.25),(1920,1080,1.5),(1280,720,1.5),(2560,1440,1)]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome')
    for w,h,d in CASES:
        c=b.new_context(viewport={'width':w,'height':h},device_scale_factor=d); pg=c.new_page()
        cdp=c.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
        pg.goto('http://localhost:4321/'); pg.wait_for_timeout(1500); pg.mouse.move(w/2,h/2)
        pg.evaluate("""()=>{window.__f=[];let l=performance.now();const t=n=>{window.__f.push(n-l);l=n;requestAnimationFrame(t)};requestAnimationFrame(t);
          window.__lt=0;new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt+=e.duration)).observe({entryTypes:['longtask']})}""")
        for i in range(70): pg.mouse.wheel(0,100); pg.wait_for_timeout(45)
        pg.wait_for_timeout(1500)
        f=sorted(pg.evaluate("window.__f.slice(5)")); lt=pg.evaluate("window.__lt")
        print(f'{w}x{h}@{d} 4xCPU frames={len(f)} p50={statistics.median(f):.1f} p95={f[int(len(f)*.95)]:.1f} worst={f[-1]:.1f} over33={sum(x>33 for x in f)} longtasks={lt:.0f}ms')
        c.close()
    b.close()
