import {DATA, NOTE_COUNTS, shuffle, staff, diagram, makeOptions, describe} from './game-core.mjs';
import {initTheme} from './theme.mjs';

let instrument = null;
let noteCount = 8;
let order = [], index = 0, phase = 0, score = 0, locked = false, results = [];
const app = document.getElementById('app');

function startScreen() {
  instrument = null;
  app.innerHTML = `<section class="panel start">
    <h1>Know your stuff? Prove it!!</h1>
    <div class="scale-length" role="group" aria-label="Scale length">
      ${NOTE_COUNTS.map(count => `<button class="length-option ${count === noteCount ? 'selected' : ''}" type="button" data-count="${count}" aria-pressed="${count === noteCount}">${count} note</button>`).join('')}
    </div>
    <p>Choose your instrument. Read the note on the staff, then pick the picture showing how to play it. Each correct answer earns one point.</p>
    <div class="instrument-grid">${Object.entries(DATA).map(([id, d]) => `<button class="instrument" data-id="${id}" aria-pressed="false">${d.label}</button>`).join('')}</div>
    <button class="primary" id="start" disabled>Start game</button>
  </section>`;

  document.querySelectorAll('.length-option').forEach(button => button.onclick = () => {
    noteCount = Number(button.dataset.count);
    document.querySelectorAll('.length-option').forEach(option => {
      option.classList.toggle('selected', option === button);
      option.setAttribute('aria-pressed', String(option === button));
    });
  });
  document.querySelectorAll('.instrument').forEach(button => button.onclick = () => {
    instrument = button.dataset.id;
    document.querySelectorAll('.instrument').forEach(option => {
      option.classList.toggle('selected', option === button);
      option.setAttribute('aria-pressed', String(option === button));
    });
    document.getElementById('start').disabled = false;
  });
  document.getElementById('start').onclick = () => {
    order = shuffle(Array.from({length: noteCount}, (_, i) => i));
    index = 0;
    phase = 0;
    score = 0;
    locked = false;
    results = Array.from({length: noteCount}, () => [false, false]);
    render();
  };
}

function render() {
  const d = DATA[instrument], n = order[index], maxScore = noteCount * 2;
  const o = makeOptions(d, n, phase, Math.random, noteCount), isName = phase === 0;
  app.innerHTML = `<section class="panel">
    <div class="topline"><div><div class="eyebrow">${d.label} · Note ${index + 1} of ${noteCount}</div><div class="small-note">${isName ? 'Part 1 · Name the note' : 'Part 2 · How do you play it?'}</div></div><strong>${score} / ${maxScore} points</strong></div>
    <div class="meter" role="progressbar" aria-valuenow="${index * 2 + phase}" aria-valuemin="0" aria-valuemax="${maxScore}" aria-label="Questions completed"><div style="width:${(index * 2 + phase) / maxScore * 100}%"></div></div>
    <div class="play-layout"><div><div class="staff-card">${staff(d.notes[n], d.clef)}</div><p class="small-note">${d.clef === 'bass' ? 'Bass' : 'Treble'} clef · ${instrument === 'clarinet' ? 'C major note names · below the break' : instrument === 'alto' ? 'G major written scale' : instrument === 'trumpet' ? 'C major written scale' : 'B♭ major written scale'}</p></div>
      <div class="question"><div class="eyebrow">${isName ? 'Read' : 'Play'}</div>
        <h2>${isName ? 'What is the letter name of this note?' : d.kind === 'mallet' ? 'Which bar plays this note?' : d.kind === 'slide' ? 'Which slide position plays this note?' : 'Which picture shows the correct fingering?'}</h2>
        <div class="choices ${!isName && d.kind === 'mallet' ? 'keyboard-choices' : ''}" id="choices">${o.arr.map((v, i) => `<button class="choice ${isName ? '' : `diagram-choice ${d === DATA.clarinet || d === DATA.alto ? 'vertical' : d.kind === 'mallet' ? 'keyboard' : ''}`}" data-answer="${i}" aria-label="${isName ? v : d.kind === 'mallet' ? `Keyboard choice ${i + 1}` : describe(d, v)}">${isName ? v : diagram(d, v)}${isName || d.kind === 'mallet' ? '' : `<div class="diagram-caption">${describe(d, v)}</div>`}</button>`).join('')}</div>
        <div id="feedback" class="feedback" role="status" aria-live="polite"></div>
        <button class="primary footer-action" id="next" hidden>${phase === 0 ? 'Next: fingering' : 'Next note'}</button>
      </div>
    </div>
  </section>`;

  document.querySelectorAll('.choice').forEach(button => button.onclick = () => {
    if (locked) return;
    locked = true;
    const selected = o.arr[Number(button.dataset.answer)], correct = selected === o.correct;
    results[index][phase] = correct;
    if (correct) score++;
    button.classList.add(correct ? 'correct' : 'wrong');
    document.querySelectorAll('.choice').forEach(option => {
      option.disabled = true;
      if (o.arr[Number(option.dataset.answer)] === o.correct) option.classList.add('correct');
    });
    const feedback = document.getElementById('feedback');
    feedback.className = 'feedback ' + (correct ? 'good' : 'bad');
    feedback.textContent = correct ? 'Correct! +1 point' : !isName && d.kind === 'mallet' ? 'The correct keyboard is highlighted.' : `The correct answer is ${isName ? o.correct : describe(d, o.correct)}.`;
    const next = document.getElementById('next');
    next.hidden = false;
    next.textContent = phase === 0 ? 'Next: fingering' : index === noteCount - 1 ? 'See results' : 'Next note';
    next.focus();
  });
  document.getElementById('next').onclick = () => {
    locked = false;
    if (phase === 0) phase = 1;
    else { phase = 0; index++; }
    if (index >= noteCount) finish();
    else render();
  };
}

function finish() {
  const d = DATA[instrument];
  app.innerHTML = `<section class="panel finish"><div class="eyebrow">Scale complete · ${d.label}</div><h1>Nice work!</h1>
    <div class="score">${score} / ${noteCount * 2}</div>
    <p>One point for each note name and one for each playing choice.</p>
    <div class="review">${order.map((v, i) => `<div>${d.notes[v]}<br><span aria-label="Note name ${results[i][0] ? 'correct' : 'incorrect'}, playing choice ${results[i][1] ? 'correct' : 'incorrect'}">Name ${results[i][0] ? '✓' : '✕'} · Play ${results[i][1] ? '✓' : '✕'}</span></div>`).join('')}</div>
    <button class="primary" id="again">Play again</button>
    <p class="reference">Fingerings use common standard choices; some instruments have alternate fingerings. Check your band method book for the version your class uses.</p>
  </section>`;
  document.getElementById('again').onclick = startScreen;
}

initTheme();
startScreen();
document.getElementById('home').addEventListener('click', startScreen);
