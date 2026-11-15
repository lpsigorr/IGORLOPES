"""Smoothness: scroll through a page with the processor slowed 4x and time every frame."""
import asyncio, sys, statistics
from playwright.async_api import async_playwright
B='http://localhost:4321/IGORLOPES'
async def run(pg, cdp, url, w, h, rate):
    await cdp.send('Emulation.setCPUThrottlingRate',{'rate':1})
    await pg.goto(B+url); await pg.wait_for_timeout(1500)
    await cdp.send('Emulation.setCPUThrottlingRate',{'rate':rate})
    await pg.evaluate("""()=>{window.__f=[];let l=performance.now();const t=(n)=>{window.__f.push(n-l);l=n;requestAnimationFrame(t)};requestAnimationFrame(t);
      window.__lt=0; try{new PerformanceObserver((li)=>{for(const e of li.getEntries()) window.__lt+=e.duration}).observe({entryTypes:['longtask']})}catch(e){}}""")
    H=await pg.evaluate('document.documentElement.scrollHeight - innerHeight')
    await pg.mouse.move(w/2,h/2)
    steps=int(min(H,7000)/100)
    for i in range(steps):
        await pg.mouse.wheel(0,100); await pg.mouse.move(w/2+ (i%20)*8, h/2 + (i%7)*10); await pg.wait_for_timeout(16)
    await pg.wait_for_timeout(800)
    f=await pg.evaluate('window.__f'); lt=await pg.evaluate('window.__lt')
    f=sorted(f[5:]); n=len(f)
    return dict(frames=n, p50=round(f[n//2],1), p95=round(f[int(n*.95)],1), p99=round(f[int(n*.99)],1), worst=round(f[-1],1), over33=sum(1 for x in f if x>33.4), longtask_ms=round(lt))
async def main():
    rate=int(sys.argv[1]) if len(sys.argv)>1 else 4
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
        for (w,h) in [(1440,900)]:
            pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
            cdp=await pg.context.new_cdp_session(pg)
            for u in (sys.argv[2:] or ['/en/','/en/work/star/','/en/work/number-one/','/en/lab/']):
                print(f'{w}x{h} x{rate} {u}:', await run(pg,cdp,u,w,h,rate))
        await b.close()
asyncio.run(main())
