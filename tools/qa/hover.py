"""Hover: display type may widen a little; it must not wrap, jump or run into its neighbours."""
import asyncio
from playwright.async_api import async_playwright
import sys
VIEWS=[tuple(map(int,a.split("x"))) for a in sys.argv[1:]] or [(1024,768),(1280,720),(1440,900),(1920,1080),(2560,1440)]
B='http://localhost:4321/IGORLOPES'
CASES=[('/en/','.row a','.row__name','.row__what'),('/fr/','.row a','.row__name','.row__what'),('/nl/','.row a','.row__name','.row__what'),
       ('/en/','.foot__big','.foot__big',None),('/fr/','.foot__big','.foot__big',None),('/nl/','.foot__big','.foot__big',None),
       ('/en/work/star/','.next','.next__name',None),('/en/work/ehb-arcade/','.next','.next__name',None),('/en/work/sparx/','.next','.next__name',None),
       ('/en/contact/','.form__send','.form__send',None),('/fr/contact/','.form__send','.form__send',None),('/nl/contact/','.form__send','.form__send',None)]
M="""([sel,inner,nb,i])=>{const a=document.querySelectorAll(sel)[i]; const el=a.matches(inner)?a:a.querySelector(inner); const r=el.getBoundingClientRect();
 const lns=[...el.querySelectorAll('.ln')]; let rr, lines;
 if(lns.length){ const rs=lns.map(l=>{const g=document.createRange(); g.selectNodeContents(l); return g.getBoundingClientRect()}); rr={width:Math.max(...rs.map(x=>x.width)), right:Math.max(...rs.map(x=>x.right))}; lines=lns.length; }
 else { const range=document.createRange(); range.selectNodeContents(el); rr=range.getBoundingClientRect(); lines=new Set([...range.getClientRects()].map(x=>Math.round(x.top))).size; }
 const n=nb?a.querySelector(nb).getBoundingClientRect().left:document.documentElement.clientWidth; return {w:rr.width,h:r.height,right:rr.right,lines,limit:n,text:el.textContent.trim(),to:el.style.getPropertyValue('--wide-to')}}"""
async def main():
    bad=0
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        for (w,h) in VIEWS:
            pg=await (await b.new_context(viewport={'width':w,'height':h})).new_page()
            for (u,sel,inner,nb) in CASES:
                await pg.goto(B+u); await pg.wait_for_timeout(500)
                n=await pg.evaluate("(s)=>document.querySelectorAll(s).length",sel)
                for i in range(n):
                    await pg.evaluate("([s,i])=>{const e=document.querySelectorAll(s)[i]; const y=e.getBoundingClientRect().top+scrollY-innerHeight/2+60; window.scrollTo(0,Math.max(0,y))}",[sel,i]); await pg.wait_for_timeout(350)
                    await pg.mouse.move(5,5); await pg.wait_for_timeout(150)
                    a=await pg.evaluate(M,[sel,inner,nb,i])
                    box=await pg.evaluate("([s,i])=>{const r=document.querySelectorAll(s)[i].getBoundingClientRect();return [r.left+Math.min(40,r.width/2),r.top+r.height/2]}",[sel,i])
                    await pg.mouse.move(box[0],box[1]); await pg.wait_for_timeout(750)
                    c=await pg.evaluate(M,[sel,inner,nb,i])
                    grow=c['w']/a['w']-1; issues=[]
                    if c['lines']!=a['lines']: issues.append(f"wraps {a['lines']}->{c['lines']} lines")
                    if abs(c['h']-a['h'])>1: issues.append('height changes')
                    if c['right']>c['limit']-8: issues.append(f"runs into neighbour/edge ({c['right']:.0f} > {c['limit']:.0f})")
                    if grow>0.2: issues.append(f'widens {grow*100:.0f}%')
                    if grow<0.03: issues.append(f'no hover effect ({grow*100:.1f}%)')
                    if issues: bad+=1; print(f"{w}x{h} {u} {a['text'][:22]!r}: +{grow*100:.0f}% to={a['to']} lines={a['lines']}", '; '.join(issues))
            await pg.context.close()
        await b.close()
    print('hover problems:',bad)
asyncio.run(main())
