'use strict';
/* ============================================================
   SCENE
   Three.js scene/camera/renderer setup, the starfield, nebula
   and Milky Way backdrop, the Andromeda Galaxy, planet/orbit
   construction and per-frame updates, shooting stars & meteor
   showers, camera fly-to, selection/hover, cinematic mode, and
   the main animate() loop + init() bootstrap.
============================================================ */
let scene, camera, renderer, controls, clock;
let raycaster, mouseNDC=new THREE.Vector2(9999,9999);
let interactiveMeshes=[], planetObjects={};
let starSpriteTex, glowSpriteTex, highlightMesh, selectHighlightMesh;
let starPointsMaterial, shootingStarTimer = 3+Math.random()*4;
let meteorShowerTimer = 20+Math.random()*25;
let asteroidBelt=null, kuiperBelt=null;
let sunClickTimes=[];
const state = { playing:true, timeScale:1, selectedId:null, followId:null, isFlying:false, hoveredId:null, cinematic:false };

function createStarfield(){
  const isMobile = window.innerWidth<700;
  const fieldCount = isMobile ? 2600 : 5200;
  const bandCount = isMobile ? 1400 : 3200;
  const total = fieldCount+bandCount;
  const positions = new Float32Array(total*3);
  const colors = new Float32Array(total*3);
  const sizes = new Float32Array(total);
  const phases = new Float32Array(total);
  const speeds = new Float32Array(total);
  const palette = [[1,1,1],[0.8,0.85,1],[1,0.92,0.8],[0.75,0.9,1],[1,0.8,0.85]];
  let idx = 0;
  function addStar(pos, sizeMul){
    positions[idx*3]=pos.x; positions[idx*3+1]=pos.y; positions[idx*3+2]=pos.z;
    const c=palette[Math.floor(Math.random()*palette.length)], b=0.55+Math.random()*0.45;
    colors[idx*3]=c[0]*b; colors[idx*3+1]=c[1]*b; colors[idx*3+2]=c[2]*b;
    sizes[idx]=(0.7+Math.random()*2.1)*sizeMul;
    phases[idx]=Math.random()*Math.PI*2;
    speeds[idx]=0.3+Math.random()*1.4;
    idx++;
  }
  for(let i=0;i<fieldCount;i++){
    const r=320+Math.random()*680, theta=Math.random()*Math.PI*2, phi=Math.acos(2*Math.random()-1);
    addStar(new THREE.Vector3(r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta)), 1);
  }
  const tiltAxis = new THREE.Vector3(0.4,1,0.15).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), tiltAxis);
  for(let i=0;i<bandCount;i++){
    const r=340+Math.random()*640;
    const theta=Math.random()*Math.PI*2;
    const spread=(Math.random()+Math.random()+Math.random()-1.5)*0.28;
    const p = new THREE.Vector3(r*Math.cos(theta), r*spread, r*Math.sin(theta));
    p.applyQuaternion(quat);
    addStar(p, 1.3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors,3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes,1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases,1));
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds,1));
  const mat = new THREE.ShaderMaterial({
    uniforms:{ uTime:{value:0} },
    vertexShader:STAR_VERT, fragmentShader:STAR_FRAG,
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending
  });
  starPointsMaterial = mat;
  return new THREE.Points(geo, mat);
}

function genNebulaTexture(seed){
  const w=1024,h=512;
  const canvas=createCanvas(w,h);
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,w,h);
  const palettes = [
    ['rgba(80,40,120,0.35)','rgba(40,20,80,0)'],
    ['rgba(30,60,140,0.30)','rgba(20,30,90,0)'],
    ['rgba(140,50,90,0.28)','rgba(80,20,60,0)'],
    ['rgba(40,90,110,0.26)','rgba(20,50,70,0)']
  ];
  const rand = seededRandom(seed);
  for(let i=0;i<10;i++){
    const cx = rand()*w, cy = rand()*h*0.7+h*0.15;
    const r = 120+rand()*220;
    const pal = palettes[Math.floor(rand()*palettes.length)];
    const g = ctx.createRadialGradient(cx,cy,0,cx,cy,r);
    g.addColorStop(0, pal[0]);
    g.addColorStop(1, pal[1]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r*0.55, rand()*Math.PI, 0, Math.PI*2);
    ctx.fill();
  }
  return textureFromCanvas(canvas);
}
function createNebula(){
  const geo = new THREE.SphereGeometry(900, 32, 32);
  const tex = genNebulaTexture(31337);
  const mat = new THREE.MeshBasicMaterial({ map:tex, side:THREE.BackSide, transparent:true, opacity:0.55, depthWrite:false });
  return new THREE.Mesh(geo, mat);
}

function genMilkyWayTexture(seed){
  const w=2048, h=1024;
  const canvas = createCanvas(w,h);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,w,h);
  const rand = seededRandom(seed);
  const bandY = h*0.5;

  const grad = ctx.createLinearGradient(0,bandY-150,0,bandY+150);
  grad.addColorStop(0,'rgba(190,200,235,0)');
  grad.addColorStop(0.5,'rgba(215,220,240,0.30)');
  grad.addColorStop(1,'rgba(190,200,235,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0,bandY-150,w,300);

  for(let i=0;i<520;i++){
    const x = rand()*w;
    const spread = 100*(0.35+rand()*rand());
    const y = bandY+(rand()-0.5)*spread;
    const r = rand()*1.7+0.3;
    const b = 0.12+rand()*0.5;
    ctx.fillStyle = 'rgba(235,238,255,'+b+')';
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  for(let i=0;i<70;i++){
    const x = rand()*w;
    const y = bandY+(rand()-0.5)*80;
    ctx.fillStyle = 'rgba(8,6,16,'+(0.08+rand()*0.13)+')';
    ctx.beginPath();
    ctx.ellipse(x,y,45+rand()*95,7+rand()*13,rand()*Math.PI,0,Math.PI*2);
    ctx.fill();
  }
  for(let i=0;i<90;i++){
    const x = rand()*w;
    const y = bandY+(rand()-0.5)*40;
    const r = rand()*1.2+0.4;
    ctx.fillStyle = 'rgba(255,246,225,'+(0.18+rand()*0.3)+')';
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  return textureFromCanvas(canvas);
}
function createMilkyWay(){
  const geo = new THREE.SphereGeometry(860, 48, 48);
  const tex = genMilkyWayTexture(70071);
  const mat = new THREE.MeshBasicMaterial({ map:tex, side:THREE.BackSide, transparent:true, opacity:0.8, depthWrite:false, blending:THREE.AdditiveBlending });
  const mesh = new THREE.Mesh(geo, mat);
  const tiltAxis = new THREE.Vector3(0.4,1,0.15).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), tiltAxis);
  mesh.setRotationFromQuaternion(quat);
  return mesh;
}

function spawnShootingStar(theta1, phi1, sharedDir){
  const R = 550;
  if(theta1===undefined) theta1 = Math.random()*Math.PI*2;
  if(phi1===undefined) phi1 = Math.acos(2*Math.random()-1);
  const start = new THREE.Vector3(R*Math.sin(phi1)*Math.cos(theta1), R*Math.cos(phi1)*0.4, R*Math.sin(phi1)*Math.sin(theta1));
  const dir = sharedDir || new THREE.Vector3((Math.random()-0.5),(Math.random()-0.5)*0.3,(Math.random()-0.5)).normalize();
  const travel = 140+Math.random()*100;
  const end = start.clone().add(dir.clone().multiplyScalar(travel));

  const segCount = 8;
  const positions = new Float32Array(segCount*3);
  const colors = new Float32Array(segCount*3);
  for(let i=0;i<segCount;i++){ positions[i*3]=start.x; positions[i*3+1]=start.y; positions[i*3+2]=start.z; colors[i*3]=1; colors[i*3+1]=1; colors[i*3+2]=1; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors,3));
  const mat = new THREE.PointsMaterial({ size:2.2, vertexColors:true, transparent:true, opacity:0.9, blending:THREE.AdditiveBlending, depthWrite:false, map:starSpriteTex, sizeAttenuation:false });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);

  const proxy = { t:0 };
  gsap.to(proxy, { t:1, duration:0.5+Math.random()*0.4, ease:'power1.in',
    onUpdate:function(){
      const arr = geo.attributes.position.array;
      for(let i=0;i<segCount;i++){
        const trailT = Math.max(0, proxy.t - i*0.025);
        const p = start.clone().lerp(end, trailT);
        arr[i*3]=p.x; arr[i*3+1]=p.y; arr[i*3+2]=p.z;
      }
      geo.attributes.position.needsUpdate = true;
      mat.opacity = 0.9*(1-proxy.t*0.3);
    },
    onComplete:function(){ scene.remove(pts); geo.dispose(); mat.dispose(); }
  });
}
function maybeSpawnShootingStar(dt){
  shootingStarTimer -= dt;
  if(shootingStarTimer<=0){
    spawnShootingStar();
    shootingStarTimer = 4+Math.random()*6;
  }
}

function showMeteorToast(label){
  let toast = document.getElementById('meteor-toast');
  if(!toast){
    toast = document.createElement('div');
    toast.id = 'meteor-toast';
    toast.className = 'glass rounded-full px-4 py-2 text-xs font-display text-slate-100 tracking-wide';
    toast.style.cssText = 'position:fixed;left:50%;top:76px;z-index:35;transform:translate(-50%,-8px);opacity:0;transition:opacity .6s ease, transform .6s ease;pointer-events:none;white-space:nowrap;';
    document.body.appendChild(toast);
  }
  toast.textContent = label;
  requestAnimationFrame(function(){
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%,0)';
  });
  clearTimeout(showMeteorToast._t);
  showMeteorToast._t = setTimeout(function(){
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%,-8px)';
  }, 4200);
}

function spawnMeteorShower(){
  const radiantTheta = Math.random()*Math.PI*2;
  const radiantPhi = Math.acos(Math.random()*0.7+0.15);
  const count = 10+Math.floor(Math.random()*9);
  for(let i=0;i<count;i++){
    setTimeout(function(){
      const jt = radiantTheta+(Math.random()-0.5)*0.55;
      const jp = radiantPhi+(Math.random()-0.5)*0.35;
      spawnShootingStar(jt, jp);
    }, i*(110+Math.random()*160));
  }
  showMeteorToast('\u2604 Meteor shower in progress');
}
function maybeSpawnMeteorShower(dt){
  meteorShowerTimer -= dt;
  if(meteorShowerTimer<=0){
    spawnMeteorShower();
    meteorShowerTimer = 50+Math.random()*70;
  }
}

function createOrbitLine(a, e, color, dashed){
  const points=[]; const segs=160;
  for(let i=0;i<=segs;i++){
    const E=(i/segs)*Math.PI*2;
    points.push(new THREE.Vector3(a*(Math.cos(E)-e), 0, a*Math.sqrt(1-e*e)*Math.sin(E)));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  if(dashed){
    const mat = new THREE.LineDashedMaterial({ color:color, transparent:true, opacity:0.32, dashSize:1.4, gapSize:0.9 });
    const line = new THREE.LineLoop(geo, mat);
    line.computeLineDistances();
    return line;
  }
  const mat = new THREE.LineBasicMaterial({ color:color, transparent:true, opacity:0.18 });
  return new THREE.LineLoop(geo, mat);
}

function createOrbitLabel(data){
  const canvas = createCanvas(256,64);
  const ctx = canvas.getContext('2d');
  ctx.font = '26px Orbitron, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.name, 4, 34);
  const tex = textureFromCanvas(canvas);
  const mat = new THREE.SpriteMaterial({ map:tex, transparent:true, depthWrite:false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(6,1.5,1);
  sprite.position.set(data.orbitRadius*(1-(data.eccentricity||0)), 0.6, 0);
  return sprite;
}

function createHabitableZone(){
  const inner=25.9, outer=31.6;
  const geo = new THREE.RingGeometry(inner, outer, 96);
  const mat = new THREE.MeshBasicMaterial({ color:0x6fdc8c, transparent:true, opacity:0.055, side:THREE.DoubleSide, depthWrite:false });
  const ring = new THREE.Mesh(geo, mat);
  ring.rotation.x = Math.PI/2;
  return ring;
}

function createBeltBatch(innerR, outerR, count, color, sizeRange, thickness, seed){
  const geo = new THREE.IcosahedronGeometry(1, 0);
  const mat = new THREE.MeshStandardMaterial({ color:color, roughness:1, metalness:0.05, transparent:true, opacity:1 });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  const rand = seededRandom(seed);
  for(let i=0;i<count;i++){
    const r = innerR + rand()*(outerR-innerR);
    const theta = rand()*Math.PI*2;
    const y = (rand()-0.5)*thickness;
    dummy.position.set(Math.cos(theta)*r, y, Math.sin(theta)*r);
    const s = sizeRange[0] + rand()*(sizeRange[1]-sizeRange[0]);
    dummy.scale.set(s,s,s);
    dummy.rotation.set(rand()*Math.PI*2, rand()*Math.PI*2, rand()*Math.PI*2);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}
function createBelt(innerR, outerR, totalCount, colors, sizeRange, thickness, seed){
  const group = new THREE.Group();
  const perBatch = Math.ceil(totalCount/colors.length);
  colors.forEach(function(c,i){
    group.add(createBeltBatch(innerR, outerR, perBatch, c, sizeRange, thickness, seed+i*97));
  });
  return group;
}

function genGalaxyTexture(seed){
  const w=512, h=512, cx=w/2, cy=h/2;
  const canvas = createCanvas(w,h);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,w,h);
  const rand = seededRandom(seed);

  const discGrad = ctx.createRadialGradient(cx,cy,0,cx,cy,w*0.5);
  discGrad.addColorStop(0,'rgba(255,244,214,0.5)');
  discGrad.addColorStop(0.25,'rgba(195,210,255,0.30)');
  discGrad.addColorStop(0.6,'rgba(120,140,210,0.13)');
  discGrad.addColorStop(1,'rgba(80,90,150,0)');
  ctx.fillStyle = discGrad;
  ctx.beginPath(); ctx.arc(cx,cy,w*0.5,0,Math.PI*2); ctx.fill();

  const armPoints = 950;
  for(let a=0;a<2;a++){
    const armOffset = a*Math.PI;
    for(let i=0;i<armPoints;i++){
      const t = i/armPoints;
      const theta = t*Math.PI*4.2+armOffset;
      const r = t*w*0.46;
      const wobble = (rand()-0.5)*16*(0.3+t);
      const x = cx+Math.cos(theta)*r+wobble;
      const y = cy+Math.sin(theta)*r+wobble;
      const size = (1-t)*2.3*rand()+0.4;
      const brightness = 0.32+rand()*0.5*(1-t*0.5);
      const hueMix = rand();
      const color = hueMix<0.15 ? '255,190,220' : (hueMix<0.4 ? '190,210,255' : '255,244,214');
      ctx.fillStyle = 'rgba('+color+','+brightness.toFixed(2)+')';
      ctx.beginPath(); ctx.arc(x,y,size,0,Math.PI*2); ctx.fill();
    }
  }

  const coreGrad = ctx.createRadialGradient(cx,cy,0,cx,cy,w*0.14);
  coreGrad.addColorStop(0,'rgba(255,250,235,0.95)');
  coreGrad.addColorStop(1,'rgba(255,240,200,0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath(); ctx.arc(cx,cy,w*0.14,0,Math.PI*2); ctx.fill();

  for(let i=0;i<260;i++){
    const rr = rand()*w*0.5, th = rand()*Math.PI*2;
    const x = cx+Math.cos(th)*rr, y = cy+Math.sin(th)*rr;
    const s = rand()*1.1+0.2;
    ctx.fillStyle = 'rgba(255,255,255,'+(0.15+rand()*0.3).toFixed(2)+')';
    ctx.beginPath(); ctx.arc(x,y,s,0,Math.PI*2); ctx.fill();
  }
  return textureFromCanvas(canvas);
}

function buildGalaxy(data, pivot, container, orbitAngle){
  const tex = genGalaxyTexture(hashSeed(data.id));
  data.thumb = tex.image.toDataURL('image/png');
  const geo = new THREE.CircleGeometry(data.visualRadius, 64);
  const mat = new THREE.MeshBasicMaterial({ map:tex, transparent:true, opacity:0.92, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.id = data.id;
  mesh.rotation.x = 1.05;
  mesh.rotation.z = 0.35;
  container.add(mesh);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowSpriteTex, color:0x9fb8ff, transparent:true, opacity:0.45, blending:THREE.AdditiveBlending, depthWrite:false }));
  glow.scale.set(data.visualRadius*3.4, data.visualRadius*3.4, 1);
  container.add(glow);

  container.position.set(data.orbitRadius, 0, 0);
  pivot.add(container);
  scene.add(pivot);

  const label = createOrbitLabel(data);
  label.position.set(data.orbitRadius, data.visualRadius*1.3, 0);
  scene.add(label);

  return { data:data, pivot:pivot, container:container, mesh:mesh, moon:null, angle:orbitAngle, isGalaxy:true, orbitLabel:label };
}

function buildPlanet(data){
  const pivot = new THREE.Group();
  const orbitAngle = Math.random()*Math.PI*2;
  const container = new THREE.Group();
  if(data.isGalaxy){
    return buildGalaxy(data, pivot, container, orbitAngle);
  }
  const geo = new THREE.SphereGeometry(data.visualRadius, 48, 48);
  const texture = generateTextureFor(data);
  data.thumb = texture.image.toDataURL('image/png');
  let material;
  if(data.id==='sun'){ material = new THREE.MeshBasicMaterial({ map:texture, transparent:true, opacity:1 }); }
  else { material = new THREE.MeshStandardMaterial({ map:texture, roughness:0.95, metalness:0.02, transparent:true, opacity:1 }); }
  const mesh = new THREE.Mesh(geo, material);
  mesh.userData.id = data.id;
  mesh.rotation.z = THREE.MathUtils.degToRad(data.axialTilt);
  if(data.squash){ mesh.scale.set(data.squash[0], data.squash[1], data.squash[2]); }
  container.add(mesh);

  if(data.rings){
    const inner = data.visualRadius*1.4, outer = data.visualRadius*2.3;
    const ringGeo = new THREE.RingGeometry(inner, outer, 96, 1);
    fixRingUVs(ringGeo, inner, outer);
    const ringTex = genRingTexture(data.ringColors, hashSeed(data.id+'ring'));
    const ringMat = new THREE.MeshBasicMaterial({ map:ringTex, side:THREE.DoubleSide, transparent:true, opacity:0.9 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI/2;
    ring.rotation.z = THREE.MathUtils.degToRad(data.axialTilt);
    container.add(ring);
  }

  if(data.id==='earth' || data.id==='venus'){
    const atmGeo = new THREE.SphereGeometry(data.visualRadius*1.12, 32, 32);
    const atmMat = createGlowMaterial(data.id==='earth' ? '#5fb3ff' : '#e8c98a', 3.2, 0.9, THREE.BackSide);
    container.add(new THREE.Mesh(atmGeo, atmMat));
  }

  container.position.set(data.orbitRadius, 0, 0);
  pivot.add(container);
  scene.add(pivot);

  let moon=null;
  if(data.id==='earth'){
    const moonGeo = new THREE.SphereGeometry(0.26, 24, 24);
    const moonTex = genRockyTexture('#b9b6ae', 555, {craters:22, maxCrater:8});
    moon = new THREE.Mesh(moonGeo, new THREE.MeshStandardMaterial({ map:moonTex, roughness:1, transparent:true, opacity:1 }));
    moon.position.set(data.visualRadius*2.6, 0, 0);
    container.add(moon);
  }

  const obj = { data:data, pivot:pivot, container:container, mesh:mesh, moon:moon, angle:orbitAngle };

  if(data.orbitRadius>0){
    const line = createOrbitLine(data.orbitRadius, data.eccentricity||0, data.color, data.isComet);
    scene.add(line);
    const label = createOrbitLabel(data);
    scene.add(label);
    obj.orbitLine = line;
    obj.orbitLabel = label;
  }

  if(data.isComet){
    const n = 34;
    const positions = new Float32Array(n*3);
    const colors = new Float32Array(n*3);
    const jr = seededRandom(909);
    const jitter = [];
    for(let i=0;i<n;i++){ jitter.push({ px:(jr()-0.5)*1.1, py:(jr()-0.5)*0.5, pz:(jr()-0.5)*1.1 }); }
    const tailGeo = new THREE.BufferGeometry();
    tailGeo.setAttribute('position', new THREE.BufferAttribute(positions,3));
    tailGeo.setAttribute('color', new THREE.BufferAttribute(colors,3));
    const tailMat = new THREE.PointsMaterial({ size:1.4, map:starSpriteTex, vertexColors:true, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true });
    const tailPoints = new THREE.Points(tailGeo, tailMat);
    scene.add(tailPoints);
    obj.tailGeo = tailGeo; obj.tailJitter = jitter; obj.tailPoints = tailPoints;

    const coma = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowSpriteTex, color:0xbfe9ee, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false }));
    coma.scale.set(1.4,1.4,1);
    container.add(coma);
    obj.comaSprite = coma;
  }

  if(data.id==='sun'){
    const coronaGeo = new THREE.SphereGeometry(data.visualRadius*1.35, 32, 32);
    container.add(new THREE.Mesh(coronaGeo, createGlowMaterial('#ffcf7a', 2.2, 1.4, THREE.BackSide)));
    const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowSpriteTex, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false }));
    glowSprite.scale.set(data.visualRadius*7, data.visualRadius*7, 1);
    container.add(glowSprite);
    obj.glowSprite = glowSprite;
  }

  return obj;
}

function updateOrbits(dt){
  const playing = state.playing;
  const ts = state.timeScale;
  Object.keys(planetObjects).forEach(function(id){
    const obj = planetObjects[id], d = obj.data;
    if(id==='sun'){
      if(playing) obj.mesh.rotation.y += dt*ts*0.03;
      if(obj.glowSprite){
        const t = performance.now()*0.001;
        const s = d.visualRadius*7*(1+Math.sin(t*0.6)*0.04);
        obj.glowSprite.scale.set(s,s,1);
      }
      obj.mesh.material.map.offset.x += dt*0.0025*ts;
      return;
    }
    const dir = d.dayLengthHours<0 ? -1:1;
    const rotSpeed = ROT_BASE/Math.pow(Math.abs(d.dayLengthHours)/24, ROT_EXP);
    if(playing) obj.mesh.rotation.y += dir*rotSpeed*dt*ts;

    const speedMul = (state.selectedId===id) ? 0.04 : 1;
    const orbitSpeed = (ORBIT_BASE/Math.pow(d.orbitalPeriodYears, ORBIT_EXP))*speedMul;
    if(playing) obj.angle += orbitSpeed*dt*ts;

    const ecc = d.eccentricity||0;
    const E = keplerE(obj.angle, ecc);
    const ex = d.orbitRadius*(Math.cos(E)-ecc);
    const ez = d.orbitRadius*Math.sqrt(1-ecc*ecc)*Math.sin(E);
    obj.container.position.set(ex, 0, ez);
    if(d.isComet) updateCometTail(obj, ex, ez);

    if(obj.moon){
      obj.moon.userData.angle = (obj.moon.userData.angle||0) + (playing? dt*ts*0.8 : 0);
      const ma = obj.moon.userData.angle;
      obj.moon.position.set(Math.cos(ma)*d.visualRadius*2.6, Math.sin(ma*0.6)*0.3, Math.sin(ma)*d.visualRadius*2.6);
    }
  });
  if(asteroidBelt) asteroidBelt.rotation.y += (playing? dt*ts*0.018 : 0);
  if(kuiperBelt) kuiperBelt.rotation.y += (playing? dt*ts*0.007 : 0);
}

function updateCometTail(obj, x, z){
  const r = Math.sqrt(x*x+z*z);
  const dirX = r>0.001 ? x/r : 1, dirZ = r>0.001 ? z/r : 0;
  const periDist = 8.8, farDist = 60;
  const closeness = THREE.MathUtils.clamp(1-(r-periDist)/(farDist-periDist), 0, 1);
  const tailLen = 3 + closeness*24;
  const arr = obj.tailGeo.attributes.position.array;
  const col = obj.tailGeo.attributes.color.array;
  const n = obj.tailJitter.length;
  for(let i=0;i<n;i++){
    const t = i/n;
    const dist = t*tailLen;
    const j = obj.tailJitter[i];
    arr[i*3]   = x + dirX*dist + j.px*(1-t*0.6);
    arr[i*3+1] = j.py*(1-t*0.6);
    arr[i*3+2] = z + dirZ*dist + j.pz*(1-t*0.6);
    const fade = (1-t)*closeness;
    col[i*3]=0.75*fade+0.05; col[i*3+1]=0.92*fade+0.05; col[i*3+2]=1.0*fade+0.08;
  }
  obj.tailGeo.attributes.position.needsUpdate = true;
  obj.tailGeo.attributes.color.needsUpdate = true;
  if(obj.comaSprite){
    const s = 1.4+closeness*2.2;
    obj.comaSprite.scale.set(s,s,1);
  }
}

function updateHover(){
  raycaster.setFromCamera(mouseNDC, camera);
  const hits = raycaster.intersectObjects(interactiveMeshes, false);
  const hit = hits[0];
  const id = hit ? hit.object.userData.id : null;
  if(id !== state.hoveredId){
    state.hoveredId = id;
    if(id){
      renderer.domElement.style.cursor='pointer';
      showTooltip(BODIES.find(function(b){return b.id===id;}).name);
    } else {
      renderer.domElement.style.cursor = controls.dragging ? 'grabbing' : 'grab';
      hideTooltip();
    }
  }
  if(id){
    const obj = planetObjects[id];
    const worldPos = new THREE.Vector3();
    obj.mesh.getWorldPosition(worldPos);
    const s = obj.data.visualRadius*1.28;
    highlightMesh.position.copy(worldPos);
    highlightMesh.scale.set(s,s,s);
    highlightMesh.visible = true;
  } else {
    highlightMesh.visible = false;
  }
}

function flyTo(targetVec3, desiredRadius, duration, onDone){
  state.isFlying = true;
  controls.autoRotate = false;
  gsap.to(controls.target, { x:targetVec3.x, y:targetVec3.y, z:targetVec3.z, duration:duration, ease:'power3.inOut' });
  const proxy = { r: controls.radius };
  gsap.to(proxy, { r:desiredRadius, duration:duration, ease:'power3.inOut',
    onUpdate:function(){ controls.radius=proxy.r; controls._targetRadius=proxy.r; },
    onComplete:function(){ state.isFlying=false; if(onDone) onDone(); }
  });
}

function setDimmed(exceptId){
  Object.keys(planetObjects).forEach(function(id){
    if(id==='sun') return;
    const obj = planetObjects[id];
    const target = (exceptId===null || id===exceptId) ? 1 : 0.15;
    gsap.to(obj.mesh.material, { opacity:target, duration:0.9, ease:'power2.out' });
    if(obj.moon) gsap.to(obj.moon.material, { opacity:target, duration:0.9, ease:'power2.out' });
    if(obj.orbitLine){
      const lineTarget = exceptId===null ? 0.18 : (id===exceptId ? 0.5 : 0.025);
      gsap.to(obj.orbitLine.material, { opacity:lineTarget, duration:0.9, ease:'power2.out' });
    }
    if(obj.orbitLabel) gsap.to(obj.orbitLabel.material, { opacity: (exceptId===null||id===exceptId)?1:0.08, duration:0.9 });
  });
  [asteroidBelt, kuiperBelt].forEach(function(belt){
    if(!belt) return;
    belt.children.forEach(function(batchMesh){
      gsap.to(batchMesh.material, { opacity: (exceptId===null?1:0.12), duration:0.9, ease:'power2.out' });
    });
  });
}

function selectBody(id){
  const obj = planetObjects[id];
  if(!obj) return;
  state.selectedId = id;
  state.followId = null;
  const worldPos = new THREE.Vector3();
  obj.mesh.getWorldPosition(worldPos);
  const desiredRadius = Math.max(obj.data.visualRadius*5.4, 6);
  setExplorerLabel(obj.data.name);
  document.getElementById('hint').style.opacity = '0';
  flyTo(worldPos, desiredRadius, 1.5, function(){
    state.followId = id;
    setDimmed(id);
    openDrawer(obj.data);
    if(!visitedIds.has(id)){ visitedIds.add(id); updateProgressBadge(); }
  });
}

function resetView(){
  state.selectedId = null;
  state.followId = null;
  setDimmed(null);
  flyTo(new THREE.Vector3(0,0,0), 120, 1.4, function(){ controls.autoRotate = true; });
  closeDrawer();
  setExplorerLabel('Explore bodies');
}

function showCinematicHint(){
  let el = document.getElementById('cinematic-hint');
  if(!el){
    el = document.createElement('div');
    el.id = 'cinematic-hint';
    el.className = 'glass rounded-full px-4 py-1.5 text-[11px] text-slate-300 tracking-wide';
    document.body.appendChild(el);
  }
  el.textContent = 'Cinematic view \u2014 press Esc or tap empty space to exit';
  el.style.opacity = '1';
  clearTimeout(showCinematicHint._t);
  showCinematicHint._t = setTimeout(function(){ el.style.opacity = '0'; }, 3800);
}
function hideCinematicHint(){
  const el = document.getElementById('cinematic-hint');
  if(el) el.style.opacity = '0';
}
function setCinematic(on){
  state.cinematic = on;
  document.body.classList.toggle('cinematic-mode', on);
  document.getElementById('explorer-panel').classList.add('hidden');
  document.getElementById('more-panel').classList.add('hidden');
  if(on) showCinematicHint(); else hideCinematicHint();
}
function toggleCinematic(){ setCinematic(!state.cinematic); }

function setPOV(mode){
  if(mode==='top'){
    controls.autoRotate = false;
    controls._targetPhi = 0.12;
  } else if(mode==='side'){
    controls.autoRotate = false;
    controls._targetPhi = Math.PI/2 - 0.02;
  } else {
    controls._targetPhi = 1.15;
    controls.autoRotate = true;
  }
}

function triggerSolarFlare(){
  const count = 140;
  const positions = new Float32Array(count*3);
  const dirs = [];
  for(let i=0;i<count;i++){
    dirs.push(new THREE.Vector3(Math.random()-0.5,(Math.random()-0.5)*0.6,Math.random()-0.5).normalize());
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  const mat = new THREE.PointsMaterial({ size:1.1, map:glowSpriteTex, color:0xffcc66, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true });
  const points = new THREE.Points(geo, mat);
  scene.add(points);
  const proxy = { t:0 };
  gsap.to(proxy, { t:1, duration:1.6, ease:'power2.out',
    onUpdate:function(){
      const arr = geo.attributes.position.array;
      const dist = proxy.t*14;
      for(let i=0;i<count;i++){
        arr[i*3]=dirs[i].x*dist; arr[i*3+1]=dirs[i].y*dist; arr[i*3+2]=dirs[i].z*dist;
      }
      geo.attributes.position.needsUpdate = true;
      mat.opacity = 1-proxy.t;
    },
    onComplete:function(){ scene.remove(points); geo.dispose(); mat.dispose(); }
  });
}


function onResize(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  updateOrbits(dt);
  scene.updateMatrixWorld(true);
  updateHover();
  if(state.selectedId){
    const sobj = planetObjects[state.selectedId];
    const sp = new THREE.Vector3();
    sobj.mesh.getWorldPosition(sp);
    const ss = sobj.data.visualRadius*1.35;
    selectHighlightMesh.position.copy(sp);
    selectHighlightMesh.scale.set(ss,ss,ss);
    selectHighlightMesh.visible = true;
  } else {
    selectHighlightMesh.visible = false;
  }
  if(starPointsMaterial) starPointsMaterial.uniforms.uTime.value = clock.getElapsedTime();
  maybeSpawnShootingStar(dt);
  maybeSpawnMeteorShower(dt);
  if(state.followId && !state.isFlying){
    const obj = planetObjects[state.followId];
    const p = new THREE.Vector3();
    obj.mesh.getWorldPosition(p);
    controls.target.copy(p);
  }
  controls.update(dt);
  renderer.render(scene, camera);
}

function init(){
  const container = document.getElementById('canvas-container');
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 2000);

  renderer = new THREE.WebGLRenderer({ antialias:true, preserveDrawingBuffer:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  starSpriteTex = genStarSpriteTexture();
  glowSpriteTex = genGlowSpriteTexture();

  scene.add(createNebula());
  scene.add(createMilkyWay());
  scene.add(createStarfield());
  scene.add(new THREE.AmbientLight(0x334466, 0.35));
  scene.add(new THREE.PointLight(0xffffff, 2.4, 0, 0));

  controls = new SimpleOrbitControls(camera, renderer.domElement);

  raycaster = new THREE.Raycaster();

  BODIES.forEach(function(data){
    const obj = buildPlanet(data);
    planetObjects[data.id] = obj;
    interactiveMeshes.push(obj.mesh);
  });

  const beltCount = window.innerWidth<700 ? 700 : 1600;
  const kuiperCount = window.innerWidth<700 ? 350 : 900;
  asteroidBelt = createBelt(36, 46, beltCount, ['#8a7f74','#6b6259','#5a5147'], [0.05,0.16], 1.4, 4001);
  scene.add(asteroidBelt);
  kuiperBelt = createBelt(140, 190, kuiperCount, ['#9fd3d8','#c9e8ea','#7fb8bd'], [0.06,0.15], 3, 5002);
  scene.add(kuiperBelt);
  scene.add(createHabitableZone());
  scene.add(createOrbitLabel({ name:'Habitable zone', orbitRadius:28.5, eccentricity:0 }));

  const hlGeo = new THREE.SphereGeometry(1, 32, 32);
  highlightMesh = new THREE.Mesh(hlGeo, createGlowMaterial('#7dd3fc', 2.6, 1.1, THREE.BackSide));
  highlightMesh.visible = false;
  scene.add(highlightMesh);

  const shGeo = new THREE.SphereGeometry(1, 32, 32);
  selectHighlightMesh = new THREE.Mesh(shGeo, createGlowMaterial('#ffcf7a', 2.4, 1.3, THREE.BackSide));
  selectHighlightMesh.visible = false;
  scene.add(selectHighlightMesh);

  clock = new THREE.Clock();

  bindEvents();
  buildExplorerList();
  populateCompareSelects();
  updateProgressBadge();
  animate();

  setTimeout(function(){
    const ls = document.getElementById('loading-screen');
    ls.style.opacity = '0';
    setTimeout(function(){ ls.remove(); }, 700);
  }, 350);
}

init();
