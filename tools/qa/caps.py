# every caption in the sequence fits its piece (nothing cut), at many screen sizes
from playwright.sync_api import sync_playwright
import sys
V=[(320,568),(375,667),(390,844),(430,932),(844,390),(768,1024),(1024,768),(1280,720),(1366,768),(1440,900),(1536,864),(1920,1080),(2560,1440)]
bad=0
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome')
    for w,h in V:
        c=b.new_context(viewport={'width':w,'height':h},is_mobile=w<760,has_touch=w<760); pg=c.new_page()
        pg.goto('http://localhost:4321/'); pg.wait_for_timeout(700)
        r=pg.evaluate("""()=>[...document.querySelectorAll('.fly figcaption')].filter(f=>f.offsetWidth).map(f=>{
          const sp=[...f.querySelectorAll('span')]; sp.forEach(s=>s.style.transform='none');
          const out=sp.filter(s=>s.offsetLeft<-1.5||s.offsetLeft+s.offsetWidth>f.clientWidth+1.5||s.scrollWidth>s.clientWidth+1);
          const tall=f.scrollHeight>f.clientHeight+1; sp.forEach(s=>s.style.transform='');
          return out.length||tall ? f.textContent.trim().replace(/\\s+/g,' '):null}).filter(Boolean)""")
        if r: bad+=1; print(f'{w}x{h}', r)
        c.close()
    b.close()
print('caption problems:', bad)
