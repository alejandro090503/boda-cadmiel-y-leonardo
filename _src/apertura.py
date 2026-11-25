import asyncio
from playwright.async_api import async_playwright
from PIL import Image
OUT = 'C:/Users/aleja/AppData/Local/Temp/claude/47942d041bcb38e0/340ea758-8f07-441c-afa3-9c4a9c8c7a27/scratchpad/apertura'
import os; os.makedirs(OUT, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 375, 'height': 812})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.add_init_script("HTMLMediaElement.prototype.play=function(){this.muted=true;this.pause();return Promise.resolve();};")
        await pg.goto('http://localhost:5627/?noauto', wait_until='load'); await pg.wait_for_timeout(1500)
        await pg.click('#sobreBtn'); await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{const v=document.getElementById('sobreVideo');v.style.opacity=1;Object.defineProperty(v,'currentTime',{get(){return 8},configurable:true});v.dispatchEvent(new Event('timeupdate'));}")
        fr = []
        for k in range(12):
            f = f'{OUT}/f{k:02d}.png'; await pg.screenshot(path=f); fr.append(f); await pg.wait_for_timeout(380)
        print('errores', errs)
        await b.close()
    ims = [Image.open(f).convert('RGB').resize((150, 325)) for f in fr]
    S = Image.new('RGB', (150 * 6, 325 * 2), 'white')
    for k, im in enumerate(ims): S.paste(im, ((k % 6) * 150, (k // 6) * 325))
    S.save(OUT + '/../apertura.jpg', quality=85)
asyncio.run(main())
