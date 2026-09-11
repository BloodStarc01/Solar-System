'use strict';
/* ============================================================
   UI
   Tooltip, the info drawer (with the glossary term highlighter
   and light-time formatter), the explorer list, the compare
   tool, the progress badge, and all DOM event bindings.
============================================================ */
const GLOSSARY = {
  "retrograde": "Rotating or orbiting in the opposite direction from most bodies in the Solar System.",
  "perihelion": "The point in an orbit closest to the Sun.",
  "aphelion": "The point in an orbit farthest from the Sun.",
  "eccentric": "Describes an orbit stretched into an oval rather than a perfect circle.",
  "greenhouse effect": "When a planet's atmosphere traps heat, warming the surface beyond what sunlight alone would do."
};
function glossify(text){
  let out = text;
  Object.keys(GLOSSARY).forEach(function(term){
    const re = new RegExp('\\b('+term+')\\b','i');
    if(re.test(out)){
      out = out.replace(re, '<span class="glossary" title="'+GLOSSARY[term].replace(/"/g,'&quot;')+'">$1</span>');
    }
  });
  return out;
}
function formatLightTime(min){
  if(!min) return '\u2014';
  if(min<60) return min.toFixed(1)+' minutes';
  const hrs = min/60;
  if(hrs<48) return hrs.toFixed(1)+' hours';
  const days = hrs/24;
  if(days<365) return days.toFixed(1)+' days';
  const years = days/365.25;
  if(years<1e6) return years.toFixed(1)+' years';
  return (years/1e6).toFixed(2)+' million years';
}

const tooltipEl = document.getElementById('tooltip');
function showTooltip(name){ tooltipEl.textContent = name; tooltipEl.classList.add('visible'); }
function hideTooltip(){ tooltipEl.classList.remove('visible'); }

function statRow(label, val){
  return '<div class="bg-white/5 rounded-lg px-3 py-2"><div class="text-[10px] text-slate-500">'+label+'</div><div class="text-slate-100 mt-0.5 text-sm">'+val+'</div></div>';
}
function structureSectionHTML(data){
  const s = data.structure;
  if(!s || !s.layers || !s.layers.length) return '';
  const R = 90, C = 100;
  let circles = '';
  for(let i=s.layers.length-1;i>=0;i--){
    const L = s.layers[i];
    circles += '<circle cx="'+C+'" cy="'+C+'" r="'+(L.outerFraction*R).toFixed(1)+'" fill="'+L.color+'"></circle>';
  }
  circles += '<circle cx="'+C+'" cy="'+C+'" r="'+R+'" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1"></circle>';
  const legend = s.layers.map(function(L){
    return '<li class="flex gap-2.5 items-start">'+
        '<span class="w-3 h-3 rounded-full mt-1 flex-shrink-0" style="background:'+L.color+'"></span>'+
        '<div><div class="text-slate-100">'+L.name+'</div><div class="text-xs text-slate-400 mt-0.5">'+L.desc+'</div></div>'+
      '</li>';
  }).join('');
  const note = s.note ? '<p class="text-xs text-slate-500 mt-3 italic">'+s.note+'</p>' : '';
  return '<section class="drawer-section blue">'+
      '<button id="structure-toggle" class="w-full flex items-center justify-between text-sm text-slate-300 hover:text-white transition-colors">'+
        '<span>Internal structure</span>'+
        '<svg id="structure-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" style="transition:transform .3s"><path d="m6 9 6 6 6-6"/></svg>'+
      '</button>'+
      '<div id="structure-panel" class="hidden mt-3">'+
        '<div class="flex flex-col sm:flex-row gap-4 items-center sm:items-start bg-white/5 rounded-lg px-3 py-3">'+
          '<svg viewBox="0 0 200 200" width="130" height="130" class="flex-shrink-0">'+circles+'</svg>'+
          '<ul class="space-y-2.5 text-sm flex-1 w-full">'+legend+'</ul>'+
        '</div>'+
        note+
      '</div>'+
    '</section>';
}
function openDrawer(data){
  document.getElementById('drawer-type').textContent = data.type;
  document.getElementById('drawer-name').textContent = data.name;
  const thumbEl = document.getElementById('drawer-thumb');
  thumbEl.style.backgroundImage = "url('"+data.thumb+"')";
  thumbEl.style.backgroundColor = data.color;
  const body = document.getElementById('drawer-body');
  const eccRow = (data.eccentricity!==undefined)
    ? statRow('Orbital shape', '<span class="glossary" title="0 = perfect circle; closer to 1 = a stretched oval">e = '+data.eccentricity.toFixed(3)+'</span>')
    : '';
  body.innerHTML =
    '<section class="drawer-section">'+
      '<h3 class="text-sm text-slate-300 mb-2">Key characteristics</h3>'+
      '<div class="grid grid-cols-2 gap-2">'+
        statRow('Diameter', data.real.diameter)+
        statRow('Mass', data.real.mass)+
        statRow('Distance from Sun', glossify(data.real.distance))+
        statRow('Orbital period', data.real.orbitalPeriod)+
        statRow('Day length', data.real.dayLength)+
        statRow('Moons', data.real.moons)+
        statRow('Temperature', data.real.temperature)+
        statRow('Light travel time from Sun', formatLightTime(data.numeric.lightMin))+
        eccRow+
      '</div>'+
    '</section>'+
    structureSectionHTML(data)+
    '<section class="drawer-section blue">'+
      '<h3 class="text-sm text-slate-300 mb-1.5">Put it in perspective</h3>'+
      '<p class="text-sm text-slate-300 bg-white/5 rounded-lg px-3 py-2.5">'+data.perspective+'</p>'+
    '</section>'+
    '<section class="drawer-section">'+
      '<h3 class="text-sm text-slate-300 mb-1.5">Discovery</h3>'+
      '<p class="text-sm text-slate-400">'+glossify(data.real.discovered)+'</p>'+
    '</section>'+
    '<section class="drawer-section">'+
      '<h3 class="text-sm text-slate-300 mb-2">Human relevance</h3>'+
      '<ul class="space-y-2 text-sm text-slate-400">'+
        data.relevance.map(function(r){ return '<li class="flex gap-2"><span class="text-amber-400 mt-0.5">&#9656;</span><span>'+glossify(r)+'</span></li>'; }).join('')+
      '</ul>'+
    '</section>'+
    '<section class="drawer-section blue">'+
      '<h3 class="text-sm text-slate-300 mb-2">Fun facts</h3>'+
      '<ul class="space-y-2 text-sm text-slate-400">'+
        data.facts.map(function(r){ return '<li class="flex gap-2"><span class="text-sky-300 mt-0.5">&#10022;</span><span>'+glossify(r)+'</span></li>'; }).join('')+
      '</ul>'+
    '</section>';
  body.classList.remove('fade-in');
  void body.offsetWidth;
  body.classList.add('fade-in');
  document.getElementById('drawer').classList.remove('translate-y-full','md:translate-x-full');
}
function closeDrawer(){
  document.getElementById('drawer').classList.add('translate-y-full','md:translate-x-full');
}

function setExplorerLabel(t){ document.getElementById('explorer-label').textContent = t; }
function buildExplorerList(){
  const list = document.getElementById('explorer-list');
  function render(filter){
    filter = (filter||'').toLowerCase();
    list.innerHTML = BODIES.filter(function(b){ return b.name.toLowerCase().indexOf(filter)!==-1; }).map(function(b){
      return '<li><button data-id="'+b.id+'" class="w-full text-left px-3 py-2.5 hover:bg-white/10 flex items-center gap-2.5 transition-colors">'+
        '<span class="thumb w-6 h-6 rounded-full flex-shrink-0" style="background-image:url(\''+b.thumb+'\');background-color:'+b.color+'"></span>'+
        '<span class="flex-1">'+b.name+'</span>'+
        '<span class="text-[10px] text-slate-500">'+b.type.split(' ')[0]+'</span>'+
        '</button></li>';
    }).join('');
  }
  render('');
  document.getElementById('explorer-search').addEventListener('input', function(e){ render(e.target.value); });
  list.addEventListener('click', function(e){
    const btn = e.target.closest('button[data-id]');
    if(btn){ selectBody(btn.dataset.id); document.getElementById('explorer-panel').classList.add('hidden'); }
  });
}

function populateCompareSelects(){
  const opts = BODIES.filter(function(b){ return !b.isComet; }).map(function(b){
    return '<option value="'+b.id+'">'+b.name+'</option>';
  }).join('');
  document.getElementById('compare-a').innerHTML = opts;
  document.getElementById('compare-b').innerHTML = opts;
  document.getElementById('compare-a').value = 'earth';
  document.getElementById('compare-b').value = 'jupiter';
}
function statBarRow(label, valA, valB, colorA, colorB, formatFn){
  const max = Math.max(valA, valB, 0.0001);
  const pa = Math.max(4, (valA/max)*100);
  const pb = Math.max(4, (valB/max)*100);
  const fa = formatFn(valA), fb = formatFn(valB);
  return '<div class="mb-3">'+
    '<div class="text-[11px] text-slate-500 mb-1">'+label+'</div>'+
    '<div class="flex items-center gap-2 mb-1"><div class="w-20 text-[11px] text-slate-400 text-right flex-shrink-0">'+fa+'</div><div class="flex-1 h-2 bg-white/5 rounded-full overflow-hidden"><div class="h-full rounded-full" style="width:'+pa+'%;background:'+colorA+'"></div></div></div>'+
    '<div class="flex items-center gap-2"><div class="w-20 text-[11px] text-slate-400 text-right flex-shrink-0">'+fb+'</div><div class="flex-1 h-2 bg-white/5 rounded-full overflow-hidden"><div class="h-full rounded-full" style="width:'+pb+'%;background:'+colorB+'"></div></div></div>'+
  '</div>';
}
function renderCompare(){
  const a = BODIES.find(function(x){ return x.id===document.getElementById('compare-a').value; });
  const b = BODIES.find(function(x){ return x.id===document.getElementById('compare-b').value; });
  const maxD = Math.max(a.numeric.diameterKm, b.numeric.diameterKm);
  const sizeA = Math.max(10, (a.numeric.diameterKm/maxD)*74);
  const sizeB = Math.max(10, (b.numeric.diameterKm/maxD)*74);
  const el = document.getElementById('compare-body');
  el.innerHTML =
    '<div class="flex items-end justify-center gap-10 py-4 mb-2">'+
      '<div class="flex flex-col items-center gap-2"><div class="rounded-full" style="width:'+sizeA+'px;height:'+sizeA+'px;background:'+a.color+'"></div><span class="text-xs text-slate-300">'+a.name+'</span></div>'+
      '<div class="flex flex-col items-center gap-2"><div class="rounded-full" style="width:'+sizeB+'px;height:'+sizeB+'px;background:'+b.color+'"></div><span class="text-xs text-slate-300">'+b.name+'</span></div>'+
    '</div>'+
    statBarRow('Diameter', a.numeric.diameterKm, b.numeric.diameterKm, a.color, b.color, function(v){ return v.toLocaleString()+' km'; })+
    statBarRow('Mass', a.numeric.massKg, b.numeric.massKg, a.color, b.color, function(v){ return v.toExponential(2)+' kg'; })+
    statBarRow('Distance from Sun', a.numeric.distanceAU, b.numeric.distanceAU, a.color, b.color, function(v){ return v.toFixed(2)+' AU'; })+
    statBarRow('Moons', a.numeric.moonsCount, b.numeric.moonsCount, a.color, b.color, function(v){ return String(v); })+
    statBarRow('Orbital period', a.numeric.periodDays, b.numeric.periodDays, a.color, b.color, function(v){ return v<365 ? Math.round(v)+' days' : (v/365.25).toFixed(1)+' years'; });
}

let visitedIds = new Set();
function updateProgressBadge(){
  document.getElementById('progress-badge').textContent = visitedIds.size+'/'+BODIES.length+' explored';
  if(visitedIds.size===BODIES.length){
    triggerSolarFlare();
  }
}

function bindEvents(){
  window.addEventListener('pointermove', function(e){
    const rect = renderer.domElement.getBoundingClientRect();
    mouseNDC.x = ((e.clientX-rect.left)/rect.width)*2-1;
    mouseNDC.y = -((e.clientY-rect.top)/rect.height)*2+1;
    tooltipEl.style.transform = 'translate('+(e.clientX+14)+'px,'+(e.clientY-38)+'px)';
  });
  controls.onTap = function(){
    raycaster.setFromCamera(mouseNDC, camera);
    const hits = raycaster.intersectObjects(interactiveMeshes, false);
    if(hits[0]){
      const hid = hits[0].object.userData.id;
      if(hid==='sun'){
        const now = performance.now();
        sunClickTimes = sunClickTimes.filter(function(t){ return now-t<2500; });
        sunClickTimes.push(now);
        if(sunClickTimes.length>=5){ triggerSolarFlare(); sunClickTimes=[]; }
      }
      selectBody(hid);
    } else if(state.cinematic){
      setCinematic(false);
    }
  };
  document.getElementById('explorer-btn').addEventListener('click', function(){
    document.getElementById('explorer-panel').classList.toggle('hidden');
    document.getElementById('more-panel').classList.add('hidden');
  });
  document.getElementById('more-btn').addEventListener('click', function(){
    document.getElementById('more-panel').classList.toggle('hidden');
    document.getElementById('explorer-panel').classList.add('hidden');
  });
  document.getElementById('more-panel').addEventListener('click', function(e){
    const btn = e.target.closest('button[data-pov]');
    if(!btn) return;
    setPOV(btn.dataset.pov);
    document.getElementById('more-panel').classList.add('hidden');
  });
  document.addEventListener('click', function(e){
    const wrap = document.getElementById('explorer-dropdown');
    if(!wrap.contains(e.target)) document.getElementById('explorer-panel').classList.add('hidden');
    const moreWrap = document.getElementById('more-dropdown');
    if(!moreWrap.contains(e.target)) document.getElementById('more-panel').classList.add('hidden');
  });
  document.getElementById('play-pause-btn').addEventListener('click', function(){
    state.playing = !state.playing;
    document.getElementById('icon-play').classList.toggle('hidden', state.playing);
    document.getElementById('icon-pause').classList.toggle('hidden', !state.playing);
  });
  document.getElementById('speed-slider').addEventListener('input', function(e){
    state.timeScale = parseFloat(e.target.value);
    document.getElementById('speed-label').textContent = state.timeScale.toFixed(1)+'x';
  });
  document.getElementById('reset-view-header-btn').addEventListener('click', resetView);
  document.getElementById('cinematic-btn').addEventListener('click', function(){ toggleCinematic(); });
  document.getElementById('compare-btn').addEventListener('click', function(){
    document.getElementById('more-panel').classList.add('hidden');
    document.getElementById('compare-modal').classList.add('modal-open');
    renderCompare();
  });
  document.getElementById('compare-close').addEventListener('click', function(){ document.getElementById('compare-modal').classList.remove('modal-open'); });
  document.getElementById('compare-backdrop').addEventListener('click', function(){ document.getElementById('compare-modal').classList.remove('modal-open'); });
  document.getElementById('compare-a').addEventListener('change', renderCompare);
  document.getElementById('compare-b').addEventListener('change', renderCompare);
  document.getElementById('audio-toggle-btn').addEventListener('click', toggleHarmony);
  document.getElementById('meteor-shower-btn').addEventListener('click', function(){
    document.getElementById('more-panel').classList.add('hidden');
    spawnMeteorShower();
    meteorShowerTimer = 50+Math.random()*70;
  });
  document.getElementById('screenshot-btn').addEventListener('click', function(){
    document.getElementById('more-panel').classList.add('hidden');
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'solar-system-view.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
  document.getElementById('drawer-reset-btn').addEventListener('click', resetView);
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  document.getElementById('drawer-body').addEventListener('click', function(e){
    const btn = e.target.closest('#structure-toggle');
    if(!btn) return;
    const panel = document.getElementById('structure-panel');
    const chevron = document.getElementById('structure-chevron');
    const willShow = panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
    if(chevron) chevron.style.transform = willShow ? 'rotate(180deg)' : '';
  });
  window.addEventListener('keydown', function(e){
    if(e.key==='Escape'){
      if(state.cinematic) setCinematic(false);
      else resetView();
    }
  });
  window.addEventListener('resize', onResize);
  setTimeout(function(){ document.getElementById('hint').style.opacity = '0'; }, 7000);
}

