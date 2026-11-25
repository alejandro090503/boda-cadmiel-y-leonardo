import asyncio, sys, os
from playwright.async_api import async_playwright
OUT = sys.argv[1] if len(sys.argv) > 1 else 'C:/Users/aleja/AppData/Local/Temp/claude/47942d041bcb38e0/340ea758-8f07-441c-afa3-9c4a9c8c7a27/scratchpad/shots'
URL = sys.argv[2] if len(sys.argv) > 2 else 'http://localhost:5627/?noauto'
SECS = sys.argv[3].split(',') if len(sys.argv) > 3 else ['hero','fecha','countdown','location','calendar','hospedaje','itinerary','dresscode','adultos','gifts','album','gallery','family','rsvp','footer']
os.makedirs(OUT, exist_ok=True)
SIL = "HTMLMediaElement.prototype.play=function(){this.muted=true;this.pause();return Promise.resolve();};"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=user-gesture-required'])
        pg = await b.new_page(viewport={'width': 375, 'height': 812}, device_scale_factor=1)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        await pg.add_init_script(SIL)
        await pg.goto(URL, wait_until='load')
        await pg.wait_for_timeout(2200); await pg.screenshot(path=OUT + '/00-sobre.png')
        await pg.click('#sobreBtn')
        await pg.wait_for_timeout(400)
        await pg.evaluate("""()=>{const v=document.getElementById('sobreVideo');Object.defineProperty(v,'currentTime',{get(){return 8},configurable:true});v.dispatchEvent(new Event('timeupdate'));}""")
        await pg.wait_for_timeout(2500)
        await pg.evaluate("document.documentElement.style.scrollBehavior='auto'")
        h = await pg.evaluate('document.documentElement.scrollHeight')
        for y in range(0, h, 350):
            await pg.evaluate(f'scrollTo(0,{y})'); await pg.wait_for_timeout(90)
        for i, sid in enumerate(SECS):
            ok = await pg.evaluate(f"""()=>{{const t=document.getElementById('{sid}');if(!t)return false;scrollTo(0,t.getBoundingClientRect().top+pageYOffset);return true}}""")
            if not ok: continue
            await pg.wait_for_timeout(1300)
            await pg.screenshot(path=f'{OUT}/{i+1:02d}-{sid}.png')
        info = await pg.evaluate("""async()=>{
          const cv=[...document.querySelectorAll('canvas')].filter(c=>c.width>0);
          const snap=()=>cv.map(c=>{try{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0;for(let i=0;i<d.length;i+=211)h=(h*31+d[i])|0;return h}catch(e){return 'x'}});
          return {sw:document.documentElement.scrollWidth, iw:innerWidth, canv:cv.length, loader:!!document.getElementById('loader')};
        }""")
        print(info); print('ERRORES:', errs[:12])
        await b.close()
asyncio.run(main())
