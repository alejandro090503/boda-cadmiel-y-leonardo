import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':375,'height':812})
        await pg.add_init_script("HTMLMediaElement.prototype.play=function(){this.muted=true;this.pause();return Promise.resolve();};")
        await pg.goto('http://localhost:5627/?noauto',wait_until='load');await pg.click('#sobreBtn');await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{const v=document.getElementById('sobreVideo');Object.defineProperty(v,'currentTime',{get(){return 8},configurable:true});v.dispatchEvent(new Event('timeupdate'));}")
        await pg.wait_for_timeout(3000);await pg.evaluate("document.documentElement.style.scrollBehavior='auto'")
        y=await pg.evaluate("document.getElementById('itxWrap').getBoundingClientRect().top+scrollY")
        await pg.evaluate(f"scrollTo(0,{y}-300)");await pg.wait_for_timeout(1500)
        await pg.screenshot(path='C:/Users/aleja/AppData/Local/Temp/claude/47942d041bcb38e0/340ea758-8f07-441c-afa3-9c4a9c8c7a27/scratchpad/itx.png')
        await b.close()
asyncio.run(main())
