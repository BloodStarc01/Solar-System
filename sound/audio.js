'use strict';
/* ============================================================
   SOUND — "Harmony of the Spheres"
   This app has no audio FILES — the ambient tone for each body
   is synthesized live with the Web Audio API (an oscillator +
   gain envelope per body, mixed together). That makes this the
   one file to edit for anything sound-related:
     - Change a body's note: edit the `scaleNotes` array or the
       `freq = ...` line in initAudio() below.
     - Change the tone/timbre: edit the oscillator "type"
       ('sine', 'triangle', 'sawtooth', 'square') in initAudio().
     - Change volume/fade: edit the gain values.
     - Want real audio files instead? Swap the oscillator setup
       in initAudio() for an <audio>/AudioBufferSourceNode that
       loads a file from this same sound/ folder.
============================================================ */
let audioCtx=null, masterGain=null, harmonyOn=false, harmonyNodes=[];

function initAudio(){
  if(audioCtx) return;
  const Ctx = window.AudioContext||window.webkitAudioContext;
  if(!Ctx) return;
  audioCtx = new Ctx();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(audioCtx.destination);
  const scaleNotes = [261.63,293.66,329.63,392.00,440.00,523.25,587.33,659.25,783.99];
  const orbitBodies = BODIES.filter(function(b){ return b.id!=='sun' && !b.isComet && !b.isAsteroid && !b.isGalaxy; });
  orbitBodies.forEach(function(b,i){
    const freq = (scaleNotes[scaleNotes.length-1-i] || scaleNotes[0]) / 2;
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const g = audioCtx.createGain();
    g.gain.value = 0.05;
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.08 + i*0.015;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 3 + i*0.4;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.detune);
    osc.connect(g); g.connect(masterGain);
    osc.start(); lfo.start();
    harmonyNodes.push({ osc:osc, lfo:lfo, gain:g });
  });
}
function toggleHarmony(){
  initAudio();
  if(!audioCtx) return;
  if(audioCtx.state==='suspended') audioCtx.resume();
  harmonyOn = !harmonyOn;
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(harmonyOn?0.6:0, audioCtx.currentTime+1.4);
  document.getElementById('icon-audio-on').classList.toggle('hidden', !harmonyOn);
  document.getElementById('icon-audio-off').classList.toggle('hidden', harmonyOn);
}

