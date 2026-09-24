import {runChecks} from './checks.mjs';
import {DATA} from './game-core.mjs';
import {initTheme} from './theme.mjs';

initTheme();

const button=document.getElementById('run');
const summary=document.getElementById('summary');
const list=document.getElementById('results');
function show(result) {
  const item=document.createElement('li');
  item.className=result.pass?'pass':'fail';
  item.textContent=`${result.pass?'✓':'✕'} ${result.name}`;
  if(result.detail){const detail=document.createElement('small');detail.textContent=result.detail;item.append(detail)}
  list.append(item);
}
async function studentFlow() {
  const frame=document.createElement('iframe');
  frame.title='Automated student practice';
  frame.style.cssText='position:absolute;width:1px;height:1px;left:-10000px;';
  frame.src='./';document.body.append(frame);
  try {
    await new Promise((resolve,reject)=>{frame.onload=resolve;frame.onerror=()=>reject(new Error('Game could not load'));});
    const page=frame.contentDocument;
    for(const id of Object.keys(DATA)) {
      const home=page.getElementById('home');
      home.click();
      page.querySelector(`[data-id="${id}"]`).click();
      page.getElementById('start').click();
      for(let question=0;question<16;question++) {
        const choices=page.querySelectorAll('.choice');
        if(choices.length!==4) throw new Error(`${id}: question ${question+1} has ${choices.length} choices`);
        choices[0].click();
        if(!page.getElementById('next') || page.getElementById('next').hidden) throw new Error(`${id}: answer did not advance`);
        page.getElementById('next').click();
      }
      if(!page.querySelector('.score')) throw new Error(`${id}: no results screen`);
    }
    page.getElementById('home').click();
    page.querySelector('[data-id="flute"]').click();
    page.getElementById('start').click();
    page.querySelector('.choice').click();
    page.getElementById('home').click();
    page.querySelector('[data-id="flute"]').click();
    page.getElementById('start').click();
    page.querySelector('.choice').click();
    if(page.getElementById('next').hidden) throw new Error('Restarting halfway through did not reset answers');
    return {name:'All eight student rounds and halfway restart',pass:true};
  } finally {frame.remove()}
}
button.addEventListener('click',async()=>{
  button.disabled=true;list.replaceChildren();summary.textContent='Running checks…';
  const results=await runChecks();
  for(const result of results) show(result);
  try{show(await studentFlow());results.push({pass:true})}
  catch(error){const failed={name:'Student practice walkthrough',pass:false,detail:error.message};show(failed);results.push(failed)}
  summary.textContent=`${results.filter(x=>x.pass).length} of ${results.length} checks passed.`;
  button.disabled=false;
});
