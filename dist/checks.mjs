import {DATA, NOTE_COUNTS, makeOptions, shuffle, staff, diagram, noteName} from './game-core.mjs';

function check(condition, message) { if (!condition) throw new Error(message); }
export const checks = [
  ['Eight instruments and eight notes each', () => {
    check(Object.keys(DATA).length === 8, 'Expected eight instruments');
    for (const instrument of Object.values(DATA)) check(instrument.notes.length === 8 && instrument.patterns.length === 8, `${instrument.label}: incomplete scale`);
  }],
  ['Every question has four distinct choices and one right answer', () => {
    for (const d of Object.values(DATA)) for (let n=0;n<8;n++) for (let phase=0;phase<2;phase++) {
      const {arr,correct}=makeOptions(d,n,phase);
      check(arr.length===4 && new Set(arr).size===4 && arr.filter(x=>x===correct).length===1, `${d.label}, note ${n+1}, part ${phase+1}`);
    }
  }],
  ['Short rounds use their first 3 or 5 notes only', () => {
    check(NOTE_COUNTS.join(',') === '3,5,8', 'Unexpected scale lengths');
    for (const [count, expectedConcertNotes] of [[3, 'B♭4,C5,D5'], [5, 'B♭4,C5,D5,E♭5,F5']]) {
      check(DATA.flute.notes.slice(0, count).join(',') === expectedConcertNotes, `${count}-note concert sequence changed`);
      for (const d of Object.values(DATA)) for (let n = 0; n < count; n++) for (let phase = 0; phase < 2; phase++) {
        const {arr, correct} = makeOptions(d, n, phase, Math.random, count);
        const allowed = new Set(phase === 0 ? d.notes.slice(0, count).map(noteName) : d.patterns.slice(0, count));
        check(arr.length === Math.min(4, allowed.size), `${d.label}: wrong answer count for ${count} notes`);
        check(new Set(arr).size === arr.length && arr.filter(x => x === correct).length === 1, `${d.label}: duplicate or missing correct answer`);
        check(arr.every(answer => allowed.has(answer)), `${d.label}: answer from outside ${count}-note scale`);
      }
    }
  }],
  ['A fresh game can shuffle its notes', () => {
    const original=[0,1,2,3,4,5,6,7];
    const changed=shuffle(original,()=>0);
    check(original.join(',')==='0,1,2,3,4,5,6,7' && changed.join(',')!==original.join(','), 'Shuffle changed source or did not reorder');
    check(new Set(changed).size===8, 'Shuffle lost a note');
  }],
  ['Flute D and E-flat omit left index finger', () => {
    for (const i of [2,3]) check(!DATA.flute.patterns[i].split(' ').includes('L1'), `${DATA.flute.notes[i]} uses L1`);
    check(!DATA.flute.patterns.some(p=>p.includes('B♭ thumb')), 'Unexpected B-flat thumb');
  }],
  ['Clarinet stays below the break and uses the requested low B fingering', () => {
    check(DATA.clarinet.notes.join(',')==='C4,D4,E4,F4,G4,A4,B3,C4', 'Unexpected clarinet note sequence');
    check(DATA.clarinet.patterns[6]==='T L123 R2', 'Low B fingering changed');
    const picture=diagram(DATA.clarinet,DATA.clarinet.patterns[5]);
    check(picture.includes('A key') && !picture.includes('Register'), 'Clarinet A key placement or register key changed');
  }],
  ['Saxophone shows its octave key without a thumb or pinky key', () => {
    const picture=diagram(DATA.alto,DATA.alto.patterns[4]);
    check(picture.includes('Octave') && !picture.includes('Thumb') && !picture.includes('Pinky'), 'Saxophone key layout changed');
  }],
  ['Mallet choices show F through high C and mark middle C', () => {
    for (const note of ['B♭3','C4','B♭4']) {
      const picture=diagram(DATA.mallets,note);
      check(picture.includes('Middle C') && picture.includes('F3')===false, 'Keyboard label or start changed');
      check((picture.match(/<rect /g)||[]).length===32, 'Keyboard should have 19 white and 13 black bars');
      check((picture.match(/#ffca55/g)||[]).length===1, `${note} must highlight exactly one bar`);
    }
  }],
  ['Accidentals are drawn on the staff; no key signature is used', () => {
    const flat=staff('B♭4','treble');
    const natural=staff('C4','treble');
    check(flat.includes('matrix(0.085') && !natural.includes('matrix(0.085'), 'Wrong accidental display');
    check((flat.match(/M25 \d+H395/g)||[]).length===5, 'Staff should have five lines');
  }]
];

export async function runChecks() {
  const results=[];
  for (const [name,run] of checks) {
    try { await run(); results.push({name,pass:true}); }
    catch (error) { results.push({name,pass:false,detail:error.message}); }
  }
  return results;
}
