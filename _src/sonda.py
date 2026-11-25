import asyncio,sys
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':375,'height':812})
    await pg.add_init_script("HTMLMediaElement.prototype.play=function(){this.muted=true;this.pause();return Promise.resolve();};")
    await pg.goto('http://localhost:5627/?noauto',wait_until='load'); await pg.click('#sobreBtn'); await pg.wait_for_timeout(400)
    await pg.evaluate("()=>{const v=document.getElementById('sobreVideo');Object.defineProperty(v,'currentTime',{get(){return 8},configurable:true});v.dispatchEvent(new Event('timeupdate'));}")
    await pg.wait_for_timeout(2500)
    await pg.evaluate("document.getElementById('family').scrollIntoView()"); await pg.wait_for_timeout(1500)
    print(await pg.evaluate(sys.argv[1]))
    await b.close()
asyncio.run(main())
