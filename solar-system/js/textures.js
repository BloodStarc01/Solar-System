'use strict';
/* ============================================================
   PRNG / NOISE / TEXTURE HELPERS
   Procedural canvas textures for planets, rings, stars, and
   glow sprites, plus the seeded-random/noise utilities they
   share, and the custom glow/star point shaders.
============================================================ */
/* ============================================================
   PRNG / NOISE / TEXTURE HELPERS
============================================================ */
function hashSeed(str){ let h=0; for(let i=0;i<str.length;i++){ h=(h*31+str.charCodeAt(i))|0; } return Math.abs(h)||1; }

function seededRandom(seed){
  let s = seed>>>0 || 1;
  return function(){ s^=s<<13; s^=s>>>17; s^=s<<5; s>>>=0; return (s%1000000)/1000000; };
}
function hash2(x,y,seed){ const n=Math.sin(x*127.1+y*311.7+seed*74.7)*43758.5453123; return n-Math.floor(n); }
function valueNoise(x,y,seed){
  const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi;
  const u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
  const a=hash2(xi,yi,seed), b=hash2(xi+1,yi,seed), c=hash2(xi,yi+1,seed), d=hash2(xi+1,yi+1,seed);
  return a*(1-u)*(1-v)+b*u*(1-v)+c*(1-u)*v+d*u*v;
}
function fbm(x,y,seed,octaves){
  octaves = octaves||5;
  let total=0, amp=0.5, freq=1, max=0;
  for(let i=0;i<octaves;i++){ total+=valueNoise(x*freq,y*freq,seed+i*17)*amp; max+=amp; amp*=0.5; freq*=2.15; }
  return total/max;
}
function createCanvas(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
function textureFromCanvas(canvas){
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.encoding = THREE.sRGBEncoding;
  tex.needsUpdate = true;
  return tex;
}

function genRockyTexture(baseColor, seed, opts){
  opts = opts||{};
  const w=512,h=256;
  const canvas=createCanvas(w,h);
  const ctx=canvas.getContext('2d');
  const base = new THREE.Color(baseColor);
  const img = ctx.createImageData(w,h);
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const nx=x/w, ny=y/h;
      const n = fbm(nx*6,ny*6,seed,5);
      const n2 = fbm(nx*14+50,ny*14+50,seed+9,4);
      let shade = 0.72 + n*0.55 - n2*0.2;
      shade = Math.max(0.35, Math.min(1.3, shade));
      const idx=(y*w+x)*4;
      img.data[idx]=Math.min(255,base.r*255*shade);
      img.data[idx+1]=Math.min(255,base.g*255*shade);
      img.data[idx+2]=Math.min(255,base.b*255*shade);
      img.data[idx+3]=255;
    }
  }
  ctx.putImageData(img,0,0);
  const craterCount = opts.craters||30;
  const cr = seededRandom(seed*13+7);
  for(let i=0;i<craterCount;i++){
    const cx=cr()*w, cy=cr()*h, r=3+cr()*(opts.maxCrater||18);
    const grad = ctx.createRadialGradient(cx,cy,0,cx,cy,r);
    grad.addColorStop(0,'rgba(0,0,0,0.35)');
    grad.addColorStop(0.7,'rgba(0,0,0,0.12)');
    grad.addColorStop(0.85,'rgba(255,255,255,0.10)');
    grad.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grad;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
  }
  return textureFromCanvas(canvas);
}

function genEarthTexture(seed){
  const w=512,h=256;
  const canvas=createCanvas(w,h);
  const ctx=canvas.getContext('2d');
  const img=ctx.createImageData(w,h);
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const nx=x/w, ny=y/h;
      const land = fbm(nx*5,ny*5,seed,5);
      const idx=(y*w+x)*4;
      let r,g,b;
      if(land>0.53){ const t=(land-0.53)/0.47; r=34+t*70; g=92+t*60; b=42+t*30; }
      else { const t=land/0.53; r=10+t*20; g=60+t*60; b=120+t*80; }
      const clouds = fbm(nx*9+300,ny*9+300,seed+40,4);
      if(clouds>0.6){ const ct=(clouds-0.6)/0.4*0.7; r=r*(1-ct)+255*ct; g=g*(1-ct)+255*ct; b=b*(1-ct)+255*ct; }
      img.data[idx]=r; img.data[idx+1]=g; img.data[idx+2]=b; img.data[idx+3]=255;
    }
  }
  ctx.putImageData(img,0,0);
  return textureFromCanvas(canvas);
}

function genGasGiantTexture(colorStops, seed, opts){
  opts = opts||{};
  const w=512,h=256;
  const canvas=createCanvas(w,h);
  const ctx=canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0,0,0,h);
  colorStops.forEach(function(c,i){ grad.addColorStop(i/(colorStops.length-1), c); });
  ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
  const img = ctx.getImageData(0,0,w,h);
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const nx=x/w, ny=y/h;
      const n = fbm(nx*3, ny*11, seed, 4);
      const shift = (n-0.5)*0.4;
      const idx=(y*w+x)*4;
      img.data[idx]=Math.min(255,Math.max(0,img.data[idx]*(1+shift)));
      img.data[idx+1]=Math.min(255,Math.max(0,img.data[idx+1]*(1+shift)));
      img.data[idx+2]=Math.min(255,Math.max(0,img.data[idx+2]*(1+shift)));
    }
  }
  ctx.putImageData(img,0,0);
  if(opts.spot){
    const sx=w*opts.spot.x, sy=h*opts.spot.y;
    const g2=ctx.createRadialGradient(sx,sy,4,sx,sy,opts.spot.r);
    g2.addColorStop(0,opts.spot.color);
    g2.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g2;
    ctx.beginPath(); ctx.ellipse(sx,sy,opts.spot.r,opts.spot.r*0.6,0,0,Math.PI*2); ctx.fill();
  }
  return textureFromCanvas(canvas);
}

function genSunTexture(seed){
  const w=512,h=256;
  const canvas=createCanvas(w,h);
  const ctx=canvas.getContext('2d');
  const img=ctx.createImageData(w,h);
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const nx=x/w, ny=y/h;
      const n=fbm(nx*8,ny*8,seed,5);
      const n2=fbm(nx*20+100,ny*20+100,seed+3,4);
      const t=Math.max(0,Math.min(1,0.55+n*0.6-n2*0.15));
      const idx=(y*w+x)*4;
      img.data[idx]=255; img.data[idx+1]=Math.min(255,140+t*110); img.data[idx+2]=Math.min(255,40+t*130); img.data[idx+3]=255;
    }
  }
  ctx.putImageData(img,0,0);
  return textureFromCanvas(canvas);
}

function genRingTexture(colorStops, seed){
  const w=512,h=64;
  const canvas=createCanvas(w,h);
  const ctx=canvas.getContext('2d');
  const grad=ctx.createLinearGradient(0,0,w,0);
  colorStops.forEach(function(c,i){ grad.addColorStop(i/(colorStops.length-1), c); });
  ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
  const r = seededRandom(seed);
  ctx.globalCompositeOperation='destination-out';
  for(let i=0;i<12;i++){
    const x=r()*w, bw=1+r()*6;
    ctx.fillStyle='rgba(0,0,0,'+(0.15+r()*0.5)+')';
    ctx.fillRect(x,0,bw,h);
  }
  ctx.globalCompositeOperation='source-over';
  return textureFromCanvas(canvas);
}

function genStarSpriteTexture(){
  const size=64; const canvas=createCanvas(size,size); const ctx=canvas.getContext('2d');
  const g=ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.3,'rgba(255,255,255,0.85)'); g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,size,size);
  return textureFromCanvas(canvas);
}
function genGlowSpriteTexture(){
  const size=256; const canvas=createCanvas(size,size); const ctx=canvas.getContext('2d');
  const g=ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  g.addColorStop(0,'rgba(255,232,170,0.9)'); g.addColorStop(0.25,'rgba(255,200,120,0.55)');
  g.addColorStop(0.6,'rgba(255,160,80,0.18)'); g.addColorStop(1,'rgba(255,140,60,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,size,size);
  return textureFromCanvas(canvas);
}

function generateTextureFor(data){
  const seed = hashSeed(data.id);
  switch(data.textureType){
    case 'sun': return genSunTexture(seed);
    case 'rocky-mercury': return genRockyTexture('#9c9284', seed, {craters:55, maxCrater:14});
    case 'rocky-venus': return genRockyTexture('#e6c896', seed, {craters:5, maxCrater:26});
    case 'rocky-earth': return genEarthTexture(seed);
    case 'rocky-mars': return genRockyTexture('#b1502c', seed, {craters:30, maxCrater:18});
    case 'gas-jupiter': return genGasGiantTexture(['#c99a68','#e6c9a0','#d8ae7e','#b98454','#e0bd91','#c99a68'], seed, {spot:{x:0.68,y:0.6,r:34,color:'rgba(190,90,60,0.55)'}});
    case 'gas-saturn': return genGasGiantTexture(['#dcc797','#f0e2bd','#e8d9ae','#d3bd8f'], seed, {});
    case 'ice-uranus': return genGasGiantTexture(['#a3d6da','#c3edef','#b7e3e6'], seed, {});
    case 'ice-neptune': return genGasGiantTexture(['#3552ab','#4a6ed6','#3f5ec4'], seed, {});
    case 'dwarf-pluto': return genRockyTexture('#cbb6a3', seed, {craters:16, maxCrater:12});
    case 'comet': return genRockyTexture('#cfe8ea', seed, {craters:10, maxCrater:8});
    case 'asteroid-vesta': return genRockyTexture('#b3ac9e', seed, {craters:45, maxCrater:20});
    case 'asteroid-ceres': return genRockyTexture('#8a8378', seed, {craters:38, maxCrater:16});
    case 'asteroid-pallas': return genRockyTexture('#6b6459', seed, {craters:50, maxCrater:18});
    case 'asteroid-hygiea': return genRockyTexture('#4f4a44', seed, {craters:34, maxCrater:14});
    default: return genRockyTexture(data.color, seed, {});
  }
}

/* ============================================================
   GLOW SHADER (Fresnel rim, used for corona / atmosphere / highlight)
============================================================ */
const GLOW_VERT = "varying vec3 vNormal; varying vec3 vViewDir; void main(){ vNormal = normalize(normalMatrix*normal); vec4 mvPosition = modelViewMatrix*vec4(position,1.0); vViewDir = normalize(-mvPosition.xyz); gl_Position = projectionMatrix*mvPosition; }";
const GLOW_FRAG = "uniform vec3 glowColor; uniform float power; uniform float intensity; varying vec3 vNormal; varying vec3 vViewDir; void main(){ float rim = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), power); gl_FragColor = vec4(glowColor, rim*intensity); }";
function createGlowMaterial(color, power, intensity, side){
  return new THREE.ShaderMaterial({
    uniforms:{ glowColor:{value:new THREE.Color(color)}, power:{value:power}, intensity:{value:intensity} },
    vertexShader:GLOW_VERT, fragmentShader:GLOW_FRAG,
    transparent:true, blending:THREE.AdditiveBlending, side:side, depthWrite:false
  });
}

/* Twinkling star field shader: per-vertex size + a sinusoidal per-star phase/speed
   drive a soft circular point sprite whose brightness gently pulses over time. */
const STAR_VERT = "attribute vec3 color; attribute float aSize; attribute float aPhase; attribute float aSpeed; varying vec3 vColor; varying float vTwinkle; uniform float uTime; void main(){ vColor = color; float tw = 0.55 + 0.45*sin(uTime*aSpeed + aPhase); vTwinkle = tw; vec4 mvPosition = modelViewMatrix*vec4(position,1.0); gl_PointSize = aSize*tw*(300.0/max(1.0,-mvPosition.z)); gl_Position = projectionMatrix*mvPosition; }";
const STAR_FRAG = "varying vec3 vColor; varying float vTwinkle; void main(){ vec2 uv = gl_PointCoord - vec2(0.5); float d = length(uv); float alpha = smoothstep(0.5, 0.05, d); gl_FragColor = vec4(vColor, alpha*vTwinkle); }";

function fixRingUVs(geometry, innerRadius, outerRadius){
  const pos = geometry.attributes.position;
  const v3 = new THREE.Vector3();
  const uvs = [];
  for(let i=0;i<pos.count;i++){
    v3.fromBufferAttribute(pos,i);
    const u = (v3.length()-innerRadius)/(outerRadius-innerRadius);
    uvs.push(u,1);
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs,2));
}

