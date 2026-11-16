"""Home sequence: every piece that is visible must be whole on screen, and words must not overlap."""
import asyncio, sys
from playwright.async_api import async_playwright
VIEWS=[(1440,900),(1920,1080),(1280,720),(1024,768),(2560,1440),(390,844),(320,568),(844,390),(768,1024)]
JS=r"""()=>{const vw=document.documentElement.clientWidth,vh=innerHeight,out=[];let words=0,vis=0;
document.querySelectorAll('.fly').forEach((el,i)=>{const s=getComputedStyle(el);const o=parseFloat(s.opacity);if(s.visibility==='hidden'||s.display==='none'||o<0.25)return;
 const r=el.getBoundingClientRect(); if(el.classList.contains('word')){words+= o>0.5?1:0; if(r.left<-1||r.right>vw+1) out.push('word wider than screen: '+el.textContent+' '+Math.round(r.width)); return;}
 vis++; if(r.left<-1||r.top<-1||r.right>vw+1||r.bottom>vh+1) out.push('piece '+i+' leaves screen: '+[r.left,r.top,r.right,r.bottom].map(Math.round).join(',')+' o='+o.toFixed(2));});
 if(words>1) out.push('two words at once');
 const g=document.querySelector('.giant'); if(g){const r=g.getBoundingClientRect(); const o=parseFloat(getComputedStyle(g).opacity); if(o>0.2&&(r.left<-2||r.right>vw+2)) out.push('name wider than screen: '+Math.round(r.left)+'..'+Math.round(r.right));}
 return [out,vis];}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        for w,h in VIEWS:
            ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=w<760,is_mobile=w<760)
            pg=await ctx.new_page(); await pg.goto('http://localhost:4321/en/'); await pg.wait_for_timeout(900)
            bad=set(); mx=0
            for k in range(0,101):
                await pg.evaluate("(fr)=>{const s=document.querySelector('[data-seq]');const top=s.getBoundingClientRect().top+scrollY;window.scrollTo(0, top+(s.offsetHeight-innerHeight)*fr)}",k/100)
                await pg.wait_for_timeout(60)
                out,vis=await pg.evaluate(JS); mx=max(mx,vis)
                for o in out: bad.add(o.split(':')[0])
                if out and len(bad)<4: print(f'  {w}x{h} p={k/100}:',out[:3])
            print(f'{w}x{h}: max pieces at once {mx};', 'OK' if not bad else sorted(bad))
            await ctx.close()
        await b.close()
asyncio.run(main())
