import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':375,'height':812})
        await pg.add_init_script("HTMLMediaElement.prototype.play=function(){this.muted=true;this.pause();return Promise.resolve();};")
        await pg.goto('http://localhost:5627/?noauto',wait_until='load'); await pg.wait_for_timeout(1500)
        await pg.click('#sobreBtn'); await pg.wait_for_timeout(300)
        r=await pg.evaluate("""async()=>{const v=document.getElementById('sobreVideo');Object.defineProperty(v,'currentTime',{get(){return 8},configurable:true});
          const t0=performance.now();v.dispatchEvent(new Event('timeupdate'));const out=[];
          const op=s=>{const e=document.querySelector(s);return e?(+getComputedStyle(e).opacity).toFixed(2):'x'};
          for(let k=0;k<14;k++){await new Promise(r=>setTimeout(r,300));out.push(Math.round(performance.now()-t0)+'ms loader:'+op('#loader')+' foto:'+op('#heroBg')+' nombres:'+op('#hNames')+' meta:'+op('#hMeta')+' menu:'+op('#elyMenuBtn')+' vinilo:'+op('#vinyl-btn'))}
          return out}""")
        print('\n'.join(r)); await b.close()
asyncio.run(main())
