'use strict';
/* ============================================================
   CUSTOM CAMERA CONTROLS (rotate / zoom / pan via pointer events)
============================================================ */
/* ============================================================
   CUSTOM CAMERA CONTROLS (rotate / zoom / pan via pointer events)
============================================================ */
function SimpleOrbitControls(camera, domElement){
  this.camera=camera; this.dom=domElement;
  this.target=new THREE.Vector3(0,0,0);
  this.radius=120; this.minRadius=3; this.maxRadius=280;
  this.theta=0.9; this.phi=1.15;
  this.minPhi=0.15; this.maxPhi=Math.PI-0.15;
  this.rotateSpeed=0.0055; this.zoomSpeed=1.0; this.damping=0.12;
  this._targetTheta=this.theta; this._targetPhi=this.phi; this._targetRadius=this.radius;
  this.enabled=true; this.autoRotate=true; this.autoRotateSpeed=0.025;
  this.dragging=false; this.onTap=null;
  this.pointers=new Map();
  this._pinchStartDist=null; this._pinchStartRadius=null;
  this._moved=false;
  this._bind();
  this._updateCamera();
}
SimpleOrbitControls.prototype._bind = function(){
  const self=this, dom=this.dom;
  dom.addEventListener('pointerdown', function(e){ self._onPointerDown(e); });
  window.addEventListener('pointermove', function(e){ self._onPointerMove(e); });
  window.addEventListener('pointerup', function(e){ self._onPointerUp(e); });
  window.addEventListener('pointercancel', function(e){ self._onPointerUp(e); });
  dom.addEventListener('wheel', function(e){ self._onWheel(e); }, {passive:false});
  dom.addEventListener('contextmenu', function(e){ e.preventDefault(); });
};
SimpleOrbitControls.prototype._onPointerDown = function(e){
  if(!this.enabled) return;
  try{ this.dom.setPointerCapture(e.pointerId); }catch(err){}
  this.pointers.set(e.pointerId, {x:e.clientX,y:e.clientY});
  if(this.pointers.size===1){
    this.dragging=true; this.lastX=e.clientX; this.lastY=e.clientY;
    this.dom.classList.add('dragging');
    this._downX=e.clientX; this._downY=e.clientY; this._moved=false;
  } else if(this.pointers.size===2){
    const pts=Array.from(this.pointers.values());
    this._pinchStartDist=Math.hypot(pts[0].x-pts[1].x, pts[0].y-pts[1].y);
    this._pinchStartRadius=this._targetRadius;
  }
};
SimpleOrbitControls.prototype._onPointerMove = function(e){
  if(!this.enabled || !this.pointers.has(e.pointerId)) return;
  this.pointers.set(e.pointerId, {x:e.clientX,y:e.clientY});
  if(this.pointers.size===1 && this.dragging){
    const dx=e.clientX-this.lastX, dy=e.clientY-this.lastY;
    if(Math.abs(e.clientX-this._downX)>3 || Math.abs(e.clientY-this._downY)>3) this._moved=true;
    this._targetTheta -= dx*this.rotateSpeed;
    this._targetPhi -= dy*this.rotateSpeed;
    this._targetPhi = Math.max(this.minPhi, Math.min(this.maxPhi, this._targetPhi));
    this.lastX=e.clientX; this.lastY=e.clientY;
  } else if(this.pointers.size===2 && this._pinchStartDist){
    const pts=Array.from(this.pointers.values());
    const dist=Math.hypot(pts[0].x-pts[1].x, pts[0].y-pts[1].y);
    const scale=this._pinchStartDist/Math.max(dist,1);
    this._targetRadius=Math.max(this.minRadius, Math.min(this.maxRadius, this._pinchStartRadius*scale));
  }
};
SimpleOrbitControls.prototype._onPointerUp = function(e){
  const wasSingle = this.pointers.size===1;
  this.pointers.delete(e.pointerId);
  if(this.pointers.size===0){
    this.dragging=false; this.dom.classList.remove('dragging');
    if(wasSingle && !this._moved && typeof this.onTap==='function') this.onTap(e);
  }
  if(this.pointers.size<2) this._pinchStartDist=null;
};
SimpleOrbitControls.prototype._onWheel = function(e){
  if(!this.enabled) return;
  e.preventDefault();
  const delta = e.deltaY*0.05*this.zoomSpeed;
  this._targetRadius = Math.max(this.minRadius, Math.min(this.maxRadius, this._targetRadius + delta*(this._targetRadius/40)));
};
SimpleOrbitControls.prototype.update = function(dt){
  if(this.autoRotate && !this.dragging) this._targetTheta += this.autoRotateSpeed*dt;
  const k = Math.min(1, this.damping*60*dt);
  this.theta += (this._targetTheta-this.theta)*k;
  this.phi += (this._targetPhi-this.phi)*k;
  this.radius += (this._targetRadius-this.radius)*k;
  this._updateCamera();
};
SimpleOrbitControls.prototype._updateCamera = function(){
  const sinPhiR = this.radius*Math.sin(this.phi);
  const x=this.target.x+sinPhiR*Math.sin(this.theta);
  const y=this.target.y+this.radius*Math.cos(this.phi);
  const z=this.target.z+sinPhiR*Math.cos(this.theta);
  this.camera.position.set(x,y,z);
  this.camera.lookAt(this.target);
};

