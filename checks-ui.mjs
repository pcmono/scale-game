import {runChecks} from './checks.mjs';
import {DATA, NOTE_COUNTS} from './game-core.mjs';
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
    for(const count of NOTE_COUNTS) for(const id of Object.keys(DATA)) {
      const home=page.getElementById('home');
      home.click();
      page.querySelector(`[data-count="${count}"]`).click();
      page.querySelector(`[data-id="${id}"]`).click();
      page.getElementById('start').click();
      for(let question=0;question<count*2;question++) {
        const choices=page.querySelectorAll('.choice');
        const expectedChoices=count===3?3:4;
        if(choices.length!==expectedChoices) throw new Error(`${id}, ${count} notes: question ${question+1} has ${choices.length} choices`);
        if(!page.querySelector('.eyebrow').textContent.includes(`of ${count}`)) throw new Error(`${id}: incorrect note total`);
        if(page.querySelector('.meter').getAttribute('aria-valuemax')!==String(count*2)) throw new Error(`${id}: incorrect progress total`);
        choices[0].click();
        if(!page.getElementById('next') || page.getElementById('next').hidden) throw new Error(`${id}, ${count} notes: answer did not advance`);
        page.getElementById('next').click();
      }
      if(page.querySelector('.score')?.textContent.trim().split('/')[1]?.trim()!==String(count*2)) throw new Error(`${id}: incorrect results score`);
      if(page.querySelectorAll('.review > div').length!==count) throw new Error(`${id}: incorrect review length`);
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
    return {name:'All 24 student rounds and halfway restart',pass:true};
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
