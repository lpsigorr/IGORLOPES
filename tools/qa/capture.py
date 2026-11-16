"""Capture the two real sites (served from their own source) at twice the pixel density."""
import asyncio, sys
from playwright.async_api import async_playwright
S='http://localhost:8100'; F='http://localhost:8103'
CSS = "@font-face{font-family:'Inter';src:url(%s/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2) format('woff2');font-weight:100 900;}" % F
for wgt in (300,400,500,600,700): CSS += "@font-face{font-family:'IBM Plex Sans';src:url(%s/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-%d-normal.woff2) format('woff2');font-weight:%d;}" % (F,wgt,wgt)
for wgt in (400,500,600): CSS += "@font-face{font-family:'IBM Plex Mono';src:url(%s/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-%d-normal.woff2) format('woff2');font-weight:%d;}" % (F,wgt,wgt)
INIT = "try{localStorage.setItem('lang','%s');localStorage.setItem('welcome_shown','1');localStorage.setItem('prolux-consent','denied');}catch(e){}"
async def route(r):
    u=r.request.url
    if 'fonts.googleapis.com' in u: await r.fulfill(status=200, content_type='text/css', body=CSS)
    elif u.startswith('http://localhost'): await r.continue_()
    else: await r.abort()
async def page(b, w, h, dpr, lang, mobile=False):
    ctx = await b.new_context(viewport={'width':w,'height':h}, device_scale_factor=dpr, is_mobile=mobile, has_touch=mobile)
    await ctx.add_init_script(INIT % lang); await ctx.route('**/*', route)
    return await ctx.new_page()
async def settle(pg, sel=None, off=0, js=None):
    # walk down the page once so everything that reveals on scroll has revealed, then go to the target
    H = await pg.evaluate('document.documentElement.scrollHeight'); y=0
    while y < H: await pg.evaluate('(y)=>window.scrollTo({top:y,behavior:"instant"})', y); await pg.wait_for_timeout(120); y += 500
    if js: await pg.evaluate(js); await pg.wait_for_timeout(500)
    if sel: await pg.evaluate('([s,o])=>{const e=document.querySelector(s); window.scrollTo({top:e.getBoundingClientRect().top+scrollY-o,behavior:"instant"})}', [sel, off])
    else: await pg.evaluate('window.scrollTo({top:0,behavior:"instant"})')
    await pg.wait_for_timeout(900)
async def main():
    out='/home/claude/cap/'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        jobs = sys.argv[1:] or ['no','calc','nom','pl','plm']
        if 'no' in jobs:
            pg = await page(b,1440,900,2,'en'); await pg.goto(S+'/numberone_final/desktop.html'); await pg.wait_for_timeout(1200)
            for name, sel, off in [('site-home',None,0),('site-services','#services',70),('site-process','#process',70),('site-fleet','#fleet',70)]:
                await settle(pg, sel, off); await pg.screenshot(path=out+'no-'+name+'.png')
            await pg.context.close()
        if 'calc' in jobs:
            pg = await page(b,1440,900,2,'en'); await pg.goto(S+'/numberone_final/calc.html'); await pg.wait_for_timeout(1200)
            for n in range(1,6):
                await pg.evaluate(f'goToStep({n})'); await pg.wait_for_timeout(600); await pg.evaluate('window.scrollTo(0,0)'); await pg.screenshot(path=out+f'no-calc-{n}.png')
            await pg.evaluate('goToSummary()'); await pg.wait_for_timeout(700); await pg.evaluate('window.scrollTo(0,0)'); await pg.screenshot(path=out+'no-calc-summary.png')
            await pg.context.close()
        if 'nom' in jobs:
            pg = await page(b,390,844,3,'en',True); await pg.goto(S+'/numberone_final/mobile.html'); await pg.wait_for_timeout(1200)
            await settle(pg); await pg.screenshot(path=out+'no-mobile-home.png'); await pg.context.close()
        if 'pl' in jobs:
            pg = await page(b,1440,900,2,'fr'); await pg.goto('http://localhost:8101/index.html'); await pg.wait_for_timeout(1500)
            for name, sel, off in [('site-home-fr',None,0),('site-services','#services',70),('site-work','#travaux',70),('site-work-2','#travaux',-760),('site-contact','#contact',70)]:
                await settle(pg, sel, off); await pg.screenshot(path=out+'pl-'+name+'.png')
            await pg.goto('http://localhost:8101/nl/index.html'); await pg.wait_for_timeout(1500); await settle(pg); await pg.screenshot(path=out+'pl-site-home-nl.png')
            await pg.context.close()
        if 'plm' in jobs:
            pg = await page(b,390,844,3,'fr',True); await pg.goto('http://localhost:8101/index.html'); await pg.wait_for_timeout(1500)
            await settle(pg,'#services',60); await pg.screenshot(path=out+'pl-mobile-services.png'); await pg.context.close()
        await b.close()
if __name__ == "__main__": asyncio.run(main())
