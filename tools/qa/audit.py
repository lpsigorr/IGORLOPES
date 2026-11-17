"""Audit every page at every screen size. Usage: audit.py [filter-substring]
Reports: console errors, failed requests, horizontal overflow, cropped / oversized / upscaled / broken media,
display text leaving the screen, tiny text, small tap targets."""
import sys, asyncio, json
from playwright.async_api import async_playwright
B = 'http://localhost:4321'
SLUGS = ['star','sparx','number-one','prolux','ehb-arcade','world-without-bees','eregum','silo','mordida','cigusic','tame-impala']
PAGES = ['/', '/work/', '/lab/', '/about/', '/contact/'] + [f'/work/{s}/' for s in SLUGS]
VIEWS = [(320,568),(360,740),(390,844),(430,932),(844,390),(768,1024),(1024,768),(1280,720),(1366,768),(1440,900),(1920,1080),(2560,1440)]
LANGS = ['en','fr','nl']
import os
RM = os.environ.get('RM')  # RM=1: test with reduced motion switched on
flt = sys.argv[1] if len(sys.argv) > 1 else ''
JS = r"""
() => {
  const vw = document.documentElement.clientWidth, vh = innerHeight, out = [];
  const vis = (el) => { const s = getComputedStyle(el); if (s.display==='none'||s.visibility==='hidden') return false; const r = el.getBoundingClientRect(); return r.width>1&&r.height>1; };
  const name = (el) => (el.className && typeof el.className==='string' ? '.'+el.className.split(' ')[0] : el.tagName.toLowerCase());
  const path = (el) => { const a=[]; for(let n=el;n&&n!==document.body&&a.length<3;n=n.parentElement) a.unshift(name(n)); return a.join(' > '); };
  const inSeq = (el) => !!el.closest('.field, .preview, .cur');
  // 1 horizontal overflow
  if (document.documentElement.scrollWidth > vw + 1 || innerWidth > vw + 1) out.push(['overflow-x', 'page is '+Math.max(document.documentElement.scrollWidth, innerWidth)+' wide on a '+vw+' screen']);
  document.querySelectorAll('body *').forEach((el) => {
    if (inSeq(el) || !vis(el)) return;
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1.5 || r.left < -1.5) {
      if (el.closest('.sr-only, .skip, .flood, .giant')) return;
      out.push(['off-screen-x', path(el)+' L'+Math.round(r.left)+' R'+Math.round(r.right)+' vw'+vw]);
    }
  });
  // 2 media
  document.querySelectorAll('img, video').forEach((el) => {
    if (inSeq(el) || !vis(el)) return;
    const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
    let nw = el.naturalWidth || el.videoWidth || +el.getAttribute('width') || 0, nh = el.naturalHeight || el.videoHeight || +el.getAttribute('height') || 0;
    // with srcset the browser reports a size already divided by the density; use the real pixels of the file it chose
    if (el.tagName==='IMG' && el.srcset) { const m=(el.currentSrc||'').match(/\.(\d+)\.webp$/); const fw = m ? +m[1] : +el.getAttribute('width'); if (fw && nw) { nh = nh*fw/nw; nw = fw; } }
    const src = (el.currentSrc || el.src || el.poster || '').split('/media/')[1] || 'media';
    if (el.tagName==='IMG' && el.complete && el.naturalWidth===0) out.push(['broken-image', src]);
    if (!nw || !nh) return;
    const ar = nw/nh, box = r.width/r.height;
    if (s.objectFit==='cover' && Math.abs(ar-box)/ar > 0.03) { const loss = Math.round((1 - Math.min(ar/box, box/ar))*100);
      // by design: a film behind a title fills the screen; an opening picture may fill it while it loses under a fifth
      const ok = el.matches('video.reel__media--film') || (el.matches('.reel__media') && loss <= 20);
      if (!ok) out.push(['cropped', src+' in '+path(el)+' loses '+loss+'%']); }
    if (s.objectFit!=='cover' && s.objectFit!=='contain' && Math.abs(ar-box)/ar > 0.02) out.push(['distorted', src+' '+ar.toFixed(2)+' shown '+box.toFixed(2)]);
    if (r.height > vh + 1) out.push(['taller-than-screen', src+' '+Math.round(r.height)+'px > '+vh+' in '+path(el)]);
    const shown = s.objectFit==='contain' ? Math.min(r.width, r.height*ar) : r.width;
    if (el.tagName==='IMG' && s.objectFit!=='cover' && shown > nw * 1.08) out.push(['upscaled', src+' x'+(shown/nw).toFixed(2)+' ('+Math.round(shown)+' of '+nw+')']);
  });
  // 3 text cut
  document.querySelectorAll('h1,h2,h3,p,a,span,dt,dd,li,label,button,figcaption,blockquote').forEach((el) => {
    if (inSeq(el) || !vis(el)) return;
    if (el.closest('.sr-only, .skip, .giant, .browser__bar')) return;
    const s = getComputedStyle(el);
    if ((s.overflowX==='hidden'||s.overflowX==='clip') && el.scrollWidth > el.clientWidth + 1) out.push(['text-cut', path(el)]);
    const fs = parseFloat(s.fontSize);
    if (el.childNodes.length && [...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()) && fs < 11.5) out.push(['tiny-text', path(el)+' '+fs.toFixed(1)+'px']);
  });
  // 3b a word of display type broken over two lines
  document.querySelectorAll('.reel__name,.case__lead,.case__end,.outro h2,.page-head h1,.row__name,.next__name,.foot__big,.lab__name,.credits__row dd,.case__points h3,.lab__head h1,.lab__head h2,.about__lead,.form__send,.case__num,.more__lab a,.top__mark').forEach((el) => {
    if (!vis(el) || inSeq(el)) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let node;
    while ((node = walker.nextNode())) { const re = /\S+/g; let m;
      while ((m = re.exec(node.textContent))) { const r = document.createRange(); r.setStart(node, m.index); r.setEnd(node, m.index + m[0].length);
        const tops = new Set([...r.getClientRects()].filter(x=>x.width>0).map(x => Math.round(x.top)));
        if (tops.size > 1) out.push(['word-broken', path(el)+' "'+m[0]+'"']); } }
  });
  // 4 tap targets on touch
  if (matchMedia('(hover: none)').matches || vw < 760) document.querySelectorAll('a, button').forEach((el) => {
    if (inSeq(el) || !vis(el) || el.closest('.skip, .more__lab ul')) return;
    const r = el.getBoundingClientRect();
    if (r.height < 30 && s_inline(el)) return;
    if (r.height < 40 || r.width < 28) out.push(['small-tap', path(el)+' '+Math.round(r.width)+'x'+Math.round(r.height)]);
  });
  function s_inline(el){ return !!el.closest('p') && !el.closest('.top, .foot'); }
  return out;
}
"""
async def main():
    res = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
        sem = asyncio.Semaphore(4)
        async def one(w,h):
          async with sem:
              touch = w < 760 or (w==844)
              ctx = await b.new_context(viewport={'width':w,'height':h}, has_touch=touch, is_mobile=touch, device_scale_factor=1, reduced_motion='reduce' if RM else 'no-preference')
              pg = await ctx.new_page()
              errs = []
              pg.on('console', lambda m: errs.append('console: '+m.text[:160]) if m.type=='error' else None)
              pg.on('pageerror', lambda e: errs.append('pageerror: '+str(e)[:160]))
              pg.on('requestfailed', lambda r: errs.append('failed: '+r.url.split('IGORLOPES')[-1]) if not (r.url.endswith('.mp4') or 'youtube' in r.url) else None)
              pg.on('response', lambda r: errs.append(f'http {r.status}: '+r.url.split('IGORLOPES')[-1]) if r.status>=400 else None)
              for lang in LANGS:
                  for pa in PAGES:
                      u = '/' if (lang == 'en' and pa == '/') else f'/{lang}{pa}'
                      if flt and flt not in u and flt not in f'{w}x{h}': continue
                      if lang != 'en' and (w,h) not in [(320,568),(390,844),(1024,768),(1440,900)]: continue
                      errs.clear()
                      await pg.goto(B+u, wait_until='load'); await pg.wait_for_timeout(350)
                      found = set()
                      H = await pg.evaluate('document.documentElement.scrollHeight')
                      y = 0
                      while y < H:
                          await pg.evaluate('(y)=>window.scrollTo(0,y)', y); await pg.wait_for_timeout(90)
                          for it in await pg.evaluate(JS): found.add(tuple(it))
                          y += int(h*0.8)
                      await pg.wait_for_timeout(150)
                      for it in await pg.evaluate(JS): found.add(tuple(it))
                      for e in set(errs): found.add(('error', e))
                      for kind, msg in found: res.setdefault((kind, msg), []).append(f'{u}@{w}')
              await ctx.close()
        await asyncio.gather(*[one(w,h) for (w,h) in VIEWS])
        await b.close()
    by = {}
    for (kind,msg), where in res.items(): by.setdefault(kind, []).append((msg, where))
    total = 0
    for kind in sorted(by):
        print(f'\n== {kind} ({len(by[kind])})')
        for msg, where in sorted(by[kind]):
            total += 1
            ws = sorted(set(where)); print('  -', msg, '|', ', '.join(ws[:4]) + (f' +{len(ws)-4}' if len(ws)>4 else ''))
    print('\nTOTAL distinct findings:', total)
asyncio.run(main())
