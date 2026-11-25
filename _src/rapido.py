import asyncio,sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':375,'height':812})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.add_init_script("HTMLMediaElement.prototype.play=function(){this.muted=true;this.pause();return Promise.resolve();};")
        await pg.goto('http://localhost:5627/?noauto',wait_until='load');await pg.click('#sobreBtn');await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{const v=document.getElementById('sobreVideo');Object.defineProperty(v,'currentTime',{get(){return 8},configurable:true});v.dispatchEvent(new Event('timeupdate'));}")
        await pg.wait_for_timeout(3000);await pg.evaluate("document.documentElement.style.scrollBehavior='auto'")
        h=await pg.evaluate('document.documentElement.scrollHeight')
        for y in range(0,h,400): await pg.evaluate(f'scrollTo(0,{y})');await pg.wait_for_timeout(70)
        for k,sid in enumerate(sys.argv[2:]):
            await pg.evaluate(f"scrollTo(0,document.getElementById('{sid}').getBoundingClientRect().top+scrollY)");await pg.wait_for_timeout(1500)
            await pg.screenshot(path=f'{sys.argv[1]}{k}.png')
        print(errs,await pg.evaluate('document.documentElement.scrollWidth'));await b.close()
asyncio.run(main())
