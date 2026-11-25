import asyncio
from playwright.async_api import async_playwright
from PIL import Image
OUT = 'C:/Users/aleja/AppData/Local/Temp/claude/47942d041bcb38e0/340ea758-8f07-441c-afa3-9c4a9c8c7a27/scratchpad/juntas'
import os; os.makedirs(OUT, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 375, 'height': 812})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        await pg.add_init_script("HTMLMediaElement.prototype.play=function(){this.muted=true;this.pause();return Promise.resolve();};")
        await pg.goto('http://localhost:5627/?noauto', wait_until='load'); await pg.click('#sobreBtn'); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{const v=document.getElementById('sobreVideo');Object.defineProperty(v,'currentTime',{get(){return 8},configurable:true});v.dispatchEvent(new Event('timeupdate'));}")
        await pg.wait_for_timeout(3500)
        await pg.evaluate("document.documentElement.style.scrollBehavior='auto'")
        h = await pg.evaluate('document.documentElement.scrollHeight')
        for y in range(0, h, 400):
            await pg.evaluate(f'scrollTo(0,{y})'); await pg.wait_for_timeout(80)
        ys = await pg.evaluate("[...document.querySelectorAll('body>section,body>footer')].slice(1).map(s=>[s.previousElementSibling.closest('section,footer')?.id||'?',s.id,Math.round(s.getBoundingClientRect().top+scrollY)])")
        fs = []
        for a, c, y in ys:
            for _ in range(2):
                y = await pg.evaluate(f"Math.round(document.getElementById('{c}').getBoundingClientRect().top+scrollY)")
                await pg.evaluate(f'scrollTo(0,{y - 406})'); await pg.wait_for_timeout(700)
            f = f'{OUT}/{a}--{c}.png'; await pg.screenshot(path=f, clip={'x': 0, 'y': 206, 'width': 375, 'height': 400}); fs.append((f, a + '>' + c))
        print('errores', errs, 'sw', await pg.evaluate('document.documentElement.scrollWidth'))
        await b.close()
    from PIL import ImageDraw
    ims = [Image.open(f).convert('RGB').resize((188, 200)) for f, _ in fs]
    S = Image.new('RGB', (188 * 7, 216 * ((len(ims) + 6) // 7)), 'white'); d = ImageDraw.Draw(S)
    for k, (im, (_, n)) in enumerate(zip(ims, fs)):
        x, y = (k % 7) * 188, (k // 7) * 216; S.paste(im, (x, y)); d.text((x + 2, y + 202), n, fill='red')
    S.save(OUT + '/../juntas.jpg', quality=85)
asyncio.run(main())
