"""Keyboard pass: tab through a page; every stop must be visible on screen and show a focus ring."""
import asyncio, sys
from playwright.async_api import async_playwright
B='http://localhost:4321/IGORLOPES'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg=await (await b.new_context(viewport={'width':1440,'height':900})).new_page()
        for u,n in [('/en/',16),('/en/work/star/',14),('/en/contact/',16)]:
            await pg.goto(B+u); await pg.wait_for_timeout(700); bad=[]; seen=[]
            for i in range(n):
                await pg.keyboard.press('Tab'); await pg.wait_for_timeout(350)
                r=await pg.evaluate("""()=>{const e=document.activeElement; if(!e||e===document.body) return null; const s=getComputedStyle(e); const r=e.getBoundingClientRect();
                  return {t:(e.className&&typeof e.className==='string'?e.className.split(' ')[0]:e.tagName)+':'+(e.textContent||e.name||'').trim().slice(0,18), ow:parseFloat(s.outlineWidth), os:s.outlineStyle, oc:s.outlineColor, bs:s.boxShadow!=='none', bb:s.borderBottomColor,
                    on:r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth, op:s.opacity}}""")
                if not r: bad.append(f'{i}: focus lost'); continue
                seen.append(r['t'])
                ring = (r['os']!='none' and r['ow']>=1.5) or r['bs']
                if not ring: bad.append(f"{r['t']}: no focus ring")
                if not r['on']: bad.append(f"{r['t']}: off screen")
                if i in (2,9) and u=='/en/': await pg.screenshot(path=f'/home/claude/shots3/focus-{i}.png')
            print(u, 'stops:', ' > '.join(seen)); print('   problems:', bad or 'none')
        await b.close()
asyncio.run(main())
