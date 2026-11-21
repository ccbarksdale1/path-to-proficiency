/*
 * Area Architect — Path to Proficiency Game Arcade lab, v2.
 * Self-contained browser gameplay. No telemetry, accounts, network calls, or student data.
 * Standards are labels for instructional practice; game completion is not a mastery claim.
 */
(() => {
  'use strict';
  const W=9,H=7, CW=900,CH=560,HW=38,HH=21,OX=449,OY=157;
  const KEY='ptp-area-architect-v2',OLD='ptp-area-architect-v1';
  const chapters=[{name:'Square City',subtitle:'Discover square units',code:'3.MD.5'},
    {name:'Survey School',subtitle:'Count to measure area',code:'3.MD.6'},
    {name:'Rectangle District',subtitle:'Multiply to build',code:'3.MD.7'}];
  /* v3 missions: every play makes new numbers and shapes. Chapter 3 needs real multiplying (no guess-and-check):
     3.MD.7a find the area of a tiled rectangle, 3.MD.7b a word problem too big to count, 3.MD.7d split an L-shape and add. */
  const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  const rectCells=(ox,oy,w,h)=>{const c=[];for(let y=oy;y<oy+h;y++)for(let x=ox;x<ox+w;x++)c.push([x,y]);return c};
  function lShape(){const Wd=R(5,8),Hd=R(4,6),cw=R(2,Wd-2),ch=R(1,Hd-2),ox=R(0,W-Wd),oy=R(0,H-Hd);
    const cells=rectCells(ox,oy,Wd,Hd).filter(([x,y])=>!(x>=ox+Wd-cw&&y<oy+ch));return {Wd,Hd,cw,ch,ox,oy,cells,area:Wd*Hd-cw*ch}}
  const missions=[
    {name:'A Fresh Start',chapter:1,std:'3.MD.5',mode:'paint',gen:()=>({area:R(5,8)}),skill:'What is a square unit?',short:'Build your first garden.',objective:a=>`Place exactly ${a.area} unit squares to plant a community garden.`,instructions:'Tap the green land to lay paving squares. Keep your tiles touching to form one garden.',learn:'A unit square is a square with sides one unit long. Area tells us how many unit squares cover a region.',coach:'Every tile represents one square unit. Start small and count each one!',structure:0},
    {name:'The Orchard',chapter:1,std:'3.MD.5',mode:'paint',gen:()=>({area:R(8,11)}),skill:'Make an area model',short:'Grow the town orchard.',objective:a=>`Cover ${a.area} square units with a connected orchard.`,instructions:'Build any shape with exactly that many touching square tiles.',learn:'The same area can have different shapes. Count the unit squares, not just the outside edge.',coach:'Try making a different shape than last time. Same area, new shape!',structure:1},
    {name:'Festival Plaza',chapter:1,std:'3.MD.5',mode:'paint',gen:()=>({area:R(10,15)}),skill:'Measure with unit squares',short:'Prepare a town festival.',objective:a=>`Design a plaza covering ${a.area} square units.`,instructions:'Choose any connected shape. No gaps, no overlaps.',learn:'Square units measure the space inside a shape. No gaps or overlaps!',coach:'A plaza needs room to walk! Your squares should connect edge-to-edge.',structure:2},
    {name:'Park Survey',chapter:2,std:'3.MD.6',mode:'count',gen:()=>{const w=R(2,4),h=R(2,4),c=rectCells(R(0,W-w),R(0,H-h),w,h);return {cells:c,area:c.length}},skill:'Count unit squares',short:'Measure the shaded park.',objective:()=>'How many square units does this park cover?',instructions:'Count the purple tiles. Tap each one to mark it as counted, then type the total.',learn:'You can measure area by counting the unit squares covering a shape.',coach:'Tap each purple square once as you count. The little numbers help you keep track!',structure:3},
    {name:'River Bend',chapter:2,std:'3.MD.6',mode:'count',gen:()=>{const L=lShape();return {cells:L.cells,area:L.area}},skill:'Measure shapes that bend',short:'Map the river walkway.',objective:()=>'Measure the purple walkway in square units.',instructions:'This path bends! Count every purple tile, even around the corner.',learn:'Area works for shapes that are not rectangles. Count each part and add.',coach:'Break the path into sections. Add the tiles in each section.',structure:4},
    {name:'Market Day',chapter:2,std:'3.MD.6',mode:'count',gen:()=>{const w=R(4,7),h=R(3,5),c=rectCells(R(0,W-w),R(0,H-h),w,h);return {cells:c,area:c.length,w,h}},skill:'Count in equal rows',short:'Plan the market floor.',objective:()=>'Find the total area of the purple market floor.',instructions:'The market has equal rows. Count by rows, or skip-count to go faster.',learn:'Equal rows can be added: 5 + 5 + 5 = 15. That is the same as 3 × 5.',coach:'Count one row, then skip-count by that number for each row.',structure:5},
    {name:'Playground Plans',chapter:3,std:'3.MD.7a',mode:'area',gen:()=>{const w=R(3,8),h=R(2,6),c=rectCells(R(0,W-w),R(0,H-h),w,h);return {cells:c,area:w*h,w,h}},skill:'Tiling is multiplying',short:'Price the playground tiles.',objective:a=>`The playground is ${a.w} units long and ${a.h} units wide. How many square tiles cover it?`,instructions:'Use multiplication: rows × tiles in each row. You can count to check!',learn:'Tiling a rectangle gives the same answer as multiplying its side lengths.',coach:'How many tiles in one row? How many rows? Multiply them.',structure:6},
    {name:'Library of Ideas',chapter:3,std:'3.MD.7b',mode:'word',gen:()=>{const w=R(6,12),h=R(5,9);return {area:w*h,w,h,unit:['feet','meters','yards'][R(0,2)]}},skill:'Multiply side lengths',short:'Order the library carpet.',objective:a=>`The library floor is ${a.w} ${a.unit} long and ${a.h} ${a.unit} wide. How many square ${a.unit} of carpet does it need?`,instructions:'This floor is too big to tile on the site. Multiply length × width.',learn:'To find the area of a rectangle, multiply its length by its width.',coach:'Write it as length × width. Then multiply.',structure:7},
    {name:'The Grand Finale',chapter:3,std:'3.MD.7d',mode:'split',gen:()=>lShape(),skill:'Split, multiply, add',short:'Construct the grand city hall.',objective:a=>`City hall is shaped like an L. Split it into two rectangles, find each area, then add.`,instructions:'Fill in each rectangle as length × width, then the total area.',learn:'A shape made of rectangles can be split into rectangles. Add their areas to find the whole area.',coach:'Draw an imaginary line where the L bends. Now you have two rectangles!',structure:8},
  ];
  const $=id=>document.getElementById(id);
  function getStorage(k){try{return JSON.parse(localStorage.getItem(k));}catch{return null}}
  function fresh(){return {scores:Array(9).fill(0),seenIntro:false}}
  let save=getStorage(KEY);
  if(!save){save=fresh(); const legacy=getStorage(OLD);if(legacy&&Array.isArray(legacy.done))for(const n of legacy.done){if(Number.isInteger(n)&&n>=0&&n<9)save.scores[n]=3}}
  if(!Array.isArray(save.scores)||save.scores.length!==9)save=fresh();
  save.scores=save.scores.map(n=>Number.isFinite(+n)?Math.max(0,Math.min(3,Math.floor(+n))):0);
  const EMB=window.parent!==window;const post=o=>{if(EMB)try{window.parent.postMessage({src:'ptp-aa',...o},location.origin)}catch{}};
  function persist(){if(EMB){post({type:'save',scores:save.scores});return}try{localStorage.setItem(KEY,JSON.stringify(save))}catch{}}
  if(EMB){save=fresh();save.seenIntro=false;window.addEventListener('message',e=>{if(e.source!==window.parent||!e.data||e.data.src!=='ptp-host'||e.data.type!=='init')return;
    const sc=e.data.scores;if(Array.isArray(sc)&&sc.length===9){save.scores=sc.map(n=>Math.max(0,Math.min(3,Math.floor(+n)||0)));if(doneCount())$('intro').classList.add('hidden')}
    index=0;for(let i=0;i<9;i++){if(!finished(i)){index=i;break}if(i===8)index=8}load(index)})}
  let A={},startT=Date.now(),index=0,painted=new Set(),counted=new Map(),history=[],tool='paint',width=2,height=3;
  let hints=0,misses=0,hover=null,keyboardTile={x:0,y:0},dragging=false,dragId=null;
  let soundOn=false,AC=null,justCompleted=-1,completionTime=0,lastFocus=null,effects=[];
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const game=$('gameCanvas'),g=game.getContext('2d'),city=$('cityCanvas').getContext('2d'),intro=$('introCanvas').getContext('2d');
  let cssCanvas=game.getBoundingClientRect(),time=0;
  const doneCount=()=>save.scores.filter(Boolean).length;
  const score=()=>save.scores.reduce((a,b)=>a+b,0);
  const m=()=>({...missions[index],...A});
  const finished=n=>save.scores[n]>0;
  const available=n=>n===0||finished(n-1)||finished(n);

  // Reusable, hand-drawn vector art: no external image or sprite dependencies.
  function rr(c,x,y,w,h,r,fill,stroke,lw=1){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
  function poly(c,points,fill,stroke,lw=1){c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
  function circle(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill()}
  function text(c,s,x,y,size=12,color='#284664',bold=true,align='center'){c.font=`${bold?'900':'600'} ${size}px Trebuchet MS, system-ui, sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;c.fillText(s,x,y)}
  function cloud(c,x,y,scale=1,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle='#ffffff';c.beginPath();c.ellipse(x,y,31*scale,11*scale,0,0,Math.PI*2);c.ellipse(x-19*scale,y-7*scale,18*scale,14*scale,0,0,Math.PI*2);c.ellipse(x+9*scale,y-12*scale,24*scale,18*scale,0,0,Math.PI*2);c.ellipse(x+30*scale,y-3*scale,17*scale,12*scale,0,0,Math.PI*2);c.fill();c.restore()}
  function drawTree(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#835b45';rr(c,-3,-1,6,19,2,'#92664a');circle(c,-7,-12,15,'#3aa987');circle(c,8,-13,14,'#42ba89');circle(c,-1,-25,15,'#5aca99');circle(c,-9,-23,4,'#9ee7af');c.restore()}
  function drawBush(c,x,y,s=1){circle(c,x-5*s,y,6*s,'#3ead80');circle(c,x+5*s,y,8*s,'#58cc93');circle(c,x,y-5*s,8*s,'#44b982');circle(c,x+1*s,y-7*s,2*s,'#a6ecac')}
  function drawBuilding(c,type,x,y,scale=1,ghost=false){
    c.save();c.translate(x,y);c.scale(scale,scale);if(ghost)c.globalAlpha=.22;
    c.fillStyle='#225d5f22';c.beginPath();c.ellipse(0,3,31,10,0,0,Math.PI*2);c.fill();
    if(type===0){ // cottage
      rr(c,-21,-34,42,34,4,'#fff3d0','#e5b881',1.5);poly(c,[[-27,-32],[0,-58],[27,-32]],'#dc6d64','#bb5958',1.3);rr(c,-7,-20,14,20,2,'#7dc6c3');rr(c,-17,-25,9,11,2,'#ffffff','#9cbec4');rr(c,9,-25,9,11,2,'#ffffff','#9cbec4');circle(c,3,-10,1.8,'#ffecb1');
    }else if(type===1){ // orchard
      for(const [dx,dy] of [[-19,-14],[5,-18],[21,-3],[-8,-4]]){rr(c,dx-2,dy,4,dy===-18?15:12,1,'#856745');circle(c,dx,dy-7,11,'#42b981');circle(c,dx+5,dy-10,6,'#6ed397');circle(c,dx-3,dy-5,2.8,'#f4be56')}
    }else if(type===2){ // fountain
      c.fillStyle='#76cada';c.beginPath();c.ellipse(0,-4,29,13,0,0,Math.PI*2);c.fill();c.strokeStyle='#e4d2a6';c.lineWidth=5;c.stroke();rr(c,-5,-25,10,16,3,'#94e1ed');circle(c,0,-29,6,'#80ccf2');circle(c,-15,-8,3,'#eefbff');circle(c,15,-8,3,'#eefbff');
    }else if(type===3){drawTree(c,-17,-5,.9);drawTree(c,10,-8,1.1);drawBush(c,6,4,.7)}
    else if(type===4){ // bridge
      rr(c,-34,-6,68,7,2,'#57afd9');c.strokeStyle='#f5dda6';c.lineWidth=6;c.beginPath();c.moveTo(-24,-18);c.lineTo(24,-18);c.stroke();for(const xx of [-24,-12,0,12,24]){c.beginPath();c.moveTo(xx,-18);c.lineTo(xx,-6);c.stroke()}
    }else if(type===5){ // shop
      rr(c,-26,-35,52,35,3,'#ffe5b2','#e8b672',1.3);poly(c,[[-31,-36],[-25,-50],[25,-50],[31,-36]],'#e9a564');for(let i=0;i<6;i++)rr(c,-29+i*10,-36,10,9,1,i%2?'#ffffff':'#ec746b');rr(c,-14,-21,27,21,2,'#89d4cd');rr(c,15,-23,8,10,1,'#fff8d5');
    }else if(type===6){ // playground
      rr(c,-25,-4,50,5,2,'#f2cf8d');c.strokeStyle='#f39460';c.lineWidth=4;c.beginPath();c.moveTo(-15,-6);c.lineTo(-15,-34);c.lineTo(0,-34);c.lineTo(0,-6);c.stroke();poly(c,[[0,-31],[30,-6],[22,-5],[-4,-25]],'#ef8a5d');rr(c,-29,-20,10,4,2,'#85bfe2');
    }else if(type===7){ // library
      rr(c,-30,-29,60,29,1,'#f8e6c6','#dfc5a5',2);poly(c,[[-36,-29],[0,-50],[36,-29]],'#6b83bb','#536fa6',1);for(const xx of [-22,-8,8,22]){rr(c,xx-4,-27,8,25,1,'#ffffff','#d0dae8')}rr(c,-8,-16,16,16,1,'#a1cbdc');
    }else{ // civic hall
      rr(c,-31,-33,62,33,2,'#f3e7ce','#d5bb8b',2);rr(c,-20,-51,40,18,2,'#f4f2e9');poly(c,[[-36,-51],[0,-72],[36,-51]],'#89a3d8');for(const xx of [-23,-11,11,23])rr(c,xx-3,-33,6,28,1,'#ffffff','#b9c3d0');rr(c,-9,-20,18,20,1,'#6f93bf');rr(c,-8,-69,16,11,5,'#e4c873');c.strokeStyle='#718caa';c.lineWidth=2;c.beginPath();c.moveTo(0,-72);c.lineTo(0,-84);c.stroke();poly(c,[[1,-84],[20,-79],[1,-75]],'#f2a15f')
    }
    c.restore();
  }
  function drawTown(c,Wd,Hd,completion,t=0,forIntro=false){
    c.clearRect(0,0,Wd,Hd);const sx=Wd/460,sy=Hd/190;c.save();c.scale(sx,sy);
    let gradient=c.createLinearGradient(0,0,0,190);gradient.addColorStop(0,'#a1e2fa');gradient.addColorStop(.78,'#edfdf9');gradient.addColorStop(1,'#bde4bd');c.fillStyle=gradient;c.fillRect(0,0,460,190);
    circle(c,378,40,25,'#fff1ac');circle(c,378,40,18,'#fff6ca');cloud(c,72+(reduced?0:Math.sin(t*.0002)*10),30,.62,.83);cloud(c,300-(reduced?0:Math.sin(t*.00017)*9),52,.47,.72);
    poly(c,[[0,110],[68,54],[125,106],[196,51],[263,118],[327,73],[460,118],[460,190],[0,190]],'#b6e2cf');poly(c,[[0,125],[102,90],[215,132],[323,99],[460,137],[460,190],[0,190]],'#7bc9aa');
    c.fillStyle='#76c99a';c.fillRect(0,126,460,64);c.strokeStyle='#e8d4aa';c.lineWidth=22;c.beginPath();c.moveTo(-10,166);c.bezierCurveTo(120,132,220,183,470,148);c.stroke();c.strokeStyle='#fdf1cb';c.lineWidth=4;c.beginPath();c.moveTo(-10,166);c.bezierCurveTo(120,132,220,183,470,148);c.stroke();
    const spots=[{x:47,y:118},{x:125,y:104},{x:213,y:112},{x:316,y:105},{x:398,y:123},{x:81,y:169},{x:174,y:170},{x:281,y:167},{x:389,y:165}];
    spots.forEach((p,i)=>{if(i>=completion){c.beginPath();c.ellipse(p.x,p.y-3,25,9,0,0,Math.PI*2);c.fillStyle='#e9f6d099';c.fill();c.strokeStyle='#ffffff99';c.setLineDash([3,4]);c.lineWidth=1.5;c.stroke();c.setLineDash([]);}else{let s=forIntro?1:0.81;if(!forIntro&&i===justCompleted&&t-completionTime<1100){const phase=(t-completionTime)/1100;s*=1+Math.sin(Math.PI*Math.max(0,phase))*.36;circle(c,p.x,p.y-27,36,'#fff3b255')}drawBuilding(c,i,p.x,p.y,s)}});
    drawBush(c,31,177,.55);drawBush(c,431,180,.55);circle(c,442,91,2,'#fff9ce');c.restore();
  }
  function drawWelcome(t){drawTown(intro,420,350,9,t,true);intro.save();intro.scale(420/460,350/190);intro.fillStyle='#ffffff13';intro.fillRect(0,0,460,190);intro.restore()}

  // Layered scenic construction map, with raised isometric tiles and interactive selection.
  function tilePoint(x,y){return [OX+(x-y)*HW,OY+(x+y)*HH]}
  function diamond(x,y){const [px,py]=tilePoint(x,y);return [[px,py],[px+HW,py+HH],[px,py+HH*2],[px-HW,py+HH]]}
  function offsetPoly(p,d){return p.map(([x,y])=>[x,y+d])}
  function drawCell(x,y,fillColor,accent,flag='base',select=false,t=0){
    const pts=diamond(x,y),[a,b,c,d]=pts;
    // Tile bevel and soft shadow.
    poly(g,[d,c,[c[0],c[1]+10],[d[0],d[1]+10]],fillColor?'#187a71':'#68a782');
    poly(g,[b,c,[c[0],c[1]+10],[b[0],b[1]+10]],fillColor?'#166d73':'#549c79');
    const fill=fillColor||((x+y)%2?'#9cdfb0':'#a9e9b8');
    poly(g,pts,fill,fillColor?'#e5fff7aa':'#d4f4d7',1.2);
    if(!fillColor){
      g.save();g.globalAlpha=.22;circle(g,a[0]-5,b[1]+2,2.2,'#359877');circle(g,a[0]+10,b[1]+5,1.8,'#359877');g.restore();
    }else{
      const gl=g.createLinearGradient(a[0],a[1],c[0],c[1]);gl.addColorStop(0,'#ffffff45');gl.addColorStop(1,'#ffffff00');poly(g,pts,gl);g.strokeStyle=accent||'#fff';g.lineWidth=1.5;g.beginPath();g.moveTo(d[0]+7,d[1]);g.lineTo(a[0],a[1]+7);g.stroke();
    }
    if(flag==='checked'){
      circle(g,a[0],a[1]+HH,13,'#ffffffec');text(g,String(counted.get(y*W+x)),a[0],a[1]+HH+.2,12,'#5c4abc');
    }
    if(select){g.save();g.globalAlpha=.3+.12*Math.sin(t*.004);poly(g,pts,'#fff0a4');g.restore();poly(g,pts,null,'#ffffff',3.5)}
  }
  function drawScene(t){
    g.clearRect(0,0,CW,CH);let sky=g.createLinearGradient(0,0,0,CH);sky.addColorStop(0,'#a8ddfb');sky.addColorStop(.55,'#e1f9f5');sky.addColorStop(.56,'#8fcdb5');sky.addColorStop(1,'#75ba94');g.fillStyle=sky;g.fillRect(0,0,CW,CH);
    circle(g,764,85,45,'#ffe7a0');circle(g,764,85,32,'#fff3c4');
    cloud(g,145+(reduced?0:Math.sin(t*.00026)*28),104,1,.85);cloud(g,633-(reduced?0:Math.sin(t*.00021)*28),59,.63,.75);
    poly(g,[[0,250],[132,154],[221,250],[305,183],[436,260],[571,156],[714,260],[835,171],[900,217],[900,400],[0,400]],'#b4dfd5');poly(g,[[0,315],[117,222],[282,298],[438,232],[610,312],[737,239],[900,295],[900,440],[0,440]],'#89cbb3');
    // Far-field dotted orchard and village skyline.
    for(let i=0;i<13;i++){const x=22+i*73,y=339+((i*7)%3)*13;drawBush(g,x,y,.9)}
    g.fillStyle='#71b88e';g.fillRect(0,406,CW,154);g.fillStyle='#6fac82';g.fillRect(0,519,CW,41);
    g.save();g.globalAlpha=.2;g.fillStyle='#2d735e';g.beginPath();g.ellipse(455,473,312,61,0,0,Math.PI*2);g.fill();g.restore();
    const A=tilePoint(0,0),B=tilePoint(W,0),C=tilePoint(W,H),D=tilePoint(0,H);
    poly(g,[A,B,C,D].map(([x,y])=>[x,y+18]),'#4b9878','#2d836c',2);
    poly(g,[D,C,[C[0],C[1]+18],[D[0],D[1]+18]],'#3d886e');poly(g,[B,C,[C[0],C[1]+18],[B[0],B[1]+18]],'#438d76');
    poly(g,[A,B,C,D],'#89d3a4','#d1f1bb',2.5);
    // Decorative barriers, trees, and props surrounding the board.
    drawTree(g,94,356,1.2);drawTree(g,139,398,.76);drawTree(g,798,383,1.12);drawTree(g,847,424,.72);
    for(const [x,y] of [[187,454],[722,490],[768,264]])drawBush(g,x,y,.8);
    g.save();g.translate(181,297);g.rotate(-.07);rr(g,-16,0,35,6,2,'#e2a95a');for(const x of [-12,12])rr(g,x,6,4,10,1,'#bd8550');g.restore();
    // All cells in painter's depth order, to keep tile edges layered naturally.
    for(let depth=0;depth<W+H-1;depth++)for(let y=0;y<H;y++){const x=depth-y;if(x<0||x>=W)continue;
      const id=y*W+x,lesson=m(),isTarget=!!lesson.cells&&lesson.cells.some(([cx,cy])=>cx===x&&cy===y);
      const active=lesson.mode==='paint'?painted.has(id):isTarget;
      let color=null,accent=null,flag='base';
      if(active){if(lesson.mode==='count'){color='#b59bf4';accent='#e8d9ff';flag=counted.has(id)?'checked':'target'}
        else if(lesson.mode==='split'){const p=splitPart(x,y);color=p===1?'#61bede':p===2?'#f4c376':'#b59bf4';accent='#ffedc9'}else if(lesson.mode==='area'){color='#65c8e1';accent='#d5fff1'}
        else{color=lesson.mode==='paint'?'#5ccfc1':'#65c8e1';accent='#d5fff1'}
      }
      const select=(hover&&hover.x===x&&hover.y===y)||(document.activeElement===game&&keyboardTile.x===x&&keyboardTile.y===y);
      drawCell(x,y,color,accent,flag,select,t);
    }
    // Tiny particles and +1 feedback on tile placement make construction tactile.
    effects=effects.filter(p=>t-p.t0<750);
    for(const p of effects){const phase=Math.max(0,(t-p.t0)/750),alpha=1-phase,[tx,ty]=tilePoint(p.x,p.y);g.save();g.globalAlpha=alpha;for(let k=0;k<6;k++){const a=k*Math.PI/3,rad=phase*34;circle(g,tx+Math.cos(a)*rad,ty+HH+Math.sin(a)*rad-phase*28,2.5*(1-phase*.5),p.color)}text(g,p.label,tx,ty-8-phase*38,17,p.color);g.restore()}
    // Construction-site signage with hand-drawn border.
    g.save();g.translate(739,433);g.rotate(-.045);rr(g,-22,-18,64,33,5,'#fff6d4','#dcb976',2);text(g,'AREA',10,-6,11,'#9a7c49');text(g,'ZONE',10,6,11,'#9a7c49');g.restore();
    // Tiny colorful flyers and flowers.
    for(const [x,y] of [[190,380],[838,449],[67,465],[732,347]]){circle(g,x,y,3,'#fff8be');circle(g,x-3,y,3,'#ffb0b1');circle(g,x+3,y,3,'#ffb0b1')}
  }
  function screenToCell(e){const r=game.getBoundingClientRect(),sx=(e.clientX-r.left)*CW/r.width,sy=(e.clientY-r.top)*CH/r.height;const a=(sx-OX)/HW,b=(sy-OY)/HH;const x=Math.floor((a+b)/2),y=Math.floor((b-a)/2);return x>=0&&x<W&&y>=0&&y<H?{x,y,id:y*W+x}:null}
  function connected(){if(painted.size===0)return false;const [first]=painted,seen=new Set([first]),todo=[first];while(todo.length){const i=todo.pop(),x=i%W,y=Math.floor(i/W);for(const [ax,ay] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+ax,ny=y+ay,id=ny*W+nx;if(nx>=0&&nx<W&&ny>=0&&ny<H&&painted.has(id)&&!seen.has(id)){seen.add(id);todo.push(id)}}}return seen.size===painted.size}
  function announce(s,type=''){const f=$('feedback');f.textContent=s;f.className='feedback'+(type?' '+type:'')}
  function toast(s){$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(toast._timer);toast._timer=setTimeout(()=>$('toast').classList.remove('show'),1700)}
  function playSound(good){if(!soundOn)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();const now=AC.currentTime,notes=good?[523,659,784]:[262,220];notes.forEach((freq,i)=>{const o=AC.createOscillator(),v=AC.createGain();o.type='triangle';o.frequency.value=freq;v.gain.setValueAtTime(.0001,now+i*.09);v.gain.exponentialRampToValueAtTime(.05,now+i*.09+.008);v.gain.exponentialRampToValueAtTime(.0001,now+i*.09+.19);o.connect(v);v.connect(AC.destination);o.start(now+i*.09);o.stop(now+i*.09+.2)})}catch{}}
  function changeTile(cell){if(!cell)return;const lesson=m();if(lesson.mode==='paint'){
      const exists=painted.has(cell.id),want=tool==='paint';if(exists===want)return;
      history.push(new Set(painted));if(history.length>70)history.shift();if(want)painted.add(cell.id);else painted.delete(cell.id);if(!reduced)effects.push({x:cell.x,y:cell.y,t0:performance.now(),label:want?'+1':'−1',color:want?'#ffffff':'#fff0be'});
    }else if(lesson.mode==='count'){
      if(!lesson.cells)return;const target=lesson.cells.some(([x,y])=>x===cell.x&&y===cell.y);if(!target)return;
      if(counted.has(cell.id))counted.delete(cell.id);else{counted.set(cell.id,counted.size+1);if(!reduced)effects.push({x:cell.x,y:cell.y,t0:performance.now(),label:'✓',color:'#ffffff'})}
      const newValues=[...counted.keys()];counted=new Map(newValues.map((k,i)=>[k,i+1]));
    }updateNumbers();
  }
  function updateNumbers(){const lesson=m();$('target').textContent=lesson.area;
    if(lesson.mode==='paint'){$('tiles').textContent=painted.size;$('tilesLabel').textContent='TILES PLACED';$('formula').textContent=painted.size;$('formulaLabel').textContent='SQUARE UNITS'}
    else if(lesson.mode==='area'||lesson.mode==='word'){$('target').textContent='?';$('tiles').textContent=lesson.w;$('tilesLabel').textContent='LENGTH';$('formula').textContent=lesson.h;$('formulaLabel').textContent='WIDTH'}
    else if(lesson.mode==='split'){$('target').textContent='?';$('tiles').textContent=lesson.Wd;$('tilesLabel').textContent='BOTTOM WALL';$('formula').textContent=lesson.Hd;$('formulaLabel').textContent='LEFT WALL'}
    else if(lesson.mode==='count'){$('tiles').textContent=counted.size;$('tilesLabel').textContent='MARKED TILES';$('formula').textContent='?';$('formulaLabel').textContent='YOUR ANSWER'}
    else{$('tiles').textContent=width*height;$('tilesLabel').textContent='BUILDING AREA';$('formula').textContent=index===8?(Math.ceil(width/2)*height)+' + '+(Math.floor(width/2)*height):width+' × '+height;$('formulaLabel').textContent=index===8?'TWO WINGS = TOTAL':'WIDTH × HEIGHT'}
    $('width').textContent=width;$('height').textContent=height;
    $('undo').disabled=history.length===0;renderTouchGrid();
  }
  function renderTouchGrid(){const wrap=$('touchGridWrap'),grid=$('touchGrid'),lesson=m();wrap.classList.toggle('hidden',lesson.mode==='word');grid.replaceChildren();if(lesson.mode==='word')return;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const id=y*W+x,target=!!lesson.cells&&lesson.cells.some(([a,b])=>a===x&&b===y),sp=lesson.mode==='split'&&target?splitPart(x,y):0;const cell=document.createElement('button');cell.type='button';cell.className='touch-cell'+((lesson.mode==='paint'&&painted.has(id))?' placed':'')+(target?' target':'')+(counted.has(id)?' counted':'')+(sp===1?' part1':sp===2?' part2':'');cell.setAttribute('aria-label',`Row ${y+1}, column ${x+1}${target?', shaded square':''}`);cell.setAttribute('aria-pressed',lesson.mode==='paint'?String(painted.has(id)):String(counted.has(id)));if(lesson.mode!=='paint'&&!(lesson.mode==='count'&&target))cell.disabled=true;cell.textContent=counted.get(id)||((lesson.mode==='paint'&&painted.has(id))?'✦':'');cell.addEventListener('click',()=>changeTile({x,y,id}));grid.append(cell)}}
  function renderProgress(){const count=doneCount(),pct=Math.round(count/9*100);$('starTop').textContent=score();$('doneTop').textContent=count;$('progressText').textContent=count+' of 9 missions complete';$('progressPercent').textContent=pct+'%';$('progress').style.width=pct+'%';$('overallPercent').textContent=pct+'%';$('rank').textContent=count===9?'Master Architect':count>=6?'City Designer':count>=3?'Junior Architect':'Rookie Builder';$('cityLabel').textContent='🏠 '+count+' of 9 landmarks built';$('cityCaption').textContent=count===9?'BUILDHAVEN IS COMPLETE! You did it!':count===0?'Your adventure is just beginning...':`${9-count} more landmark${9-count===1?'':'s'} until the grand city celebration.`;}
  function renderMap(){const nav=$('missionMap');nav.replaceChildren();for(let chapter=1;chapter<=3;chapter++){
      const div=document.createElement('div');div.className='map-section';div.textContent='CHAPTER '+String(chapter).padStart(2,'0')+' · '+chapters[chapter-1].name;nav.append(div);
      missions.forEach((lesson,i)=>{if(lesson.chapter!==chapter)return;const btn=document.createElement('button');btn.type='button';btn.className='level'+(index===i?' selected':'')+(finished(i)?' done':'');btn.disabled=!available(i);btn.setAttribute('aria-current',index===i?'step':'false');const n=document.createElement('span');n.className='level-num';n.textContent=finished(i)?'✓':String(i+1).padStart(2,'0');const desc=document.createElement('span');desc.style.minWidth='0';const title=document.createElement('div');title.className='level-title';title.textContent=lesson.name;const meta=document.createElement('div');meta.className='level-meta';meta.textContent=lesson.std+' • '+(available(i)?'Available':'Locked');desc.append(title,meta);const stars=document.createElement('span');stars.className='map-stars';stars.textContent=finished(i)?'★'.repeat(save.scores[i])+'☆'.repeat(3-save.scores[i]):available(i)?'›':'🔒';btn.append(n,desc,stars);btn.addEventListener('click',()=>load(i));nav.append(btn)});
    }}
  function load(i){if(!available(i))return;index=i;A=missions[i].gen();split=null;startT=Date.now();painted=new Set();counted=new Map();history=[];tool='paint';width=2;height=3;hints=0;misses=0;hover=null;keyboardTile={x:0,y:0};dragging=false;
    const l=m(),ch=chapters[l.chapter-1];$('chapter').textContent='CHAPTER '+String(l.chapter).padStart(2,'0')+' · '+ch.name.toUpperCase();$('missionNumber').textContent='MISSION '+String(i+1).padStart(2,'0')+' / 09';$('missionName').textContent=l.name;$('missionDesc').textContent=l.short;$('standard').textContent=l.std;$('skillName').textContent=l.skill;$('objective').textContent=typeof l.objective==='function'?l.objective(l):l.objective;$('instructions').textContent=l.instructions;$('learn').textContent=l.learn;$('coachMessage').textContent=l.coach;
    $('boardHeading').textContent=l.mode==='paint'?'The Construction Site':l.mode==='count'?'Survey the Blueprint':l.mode==='word'?'Big Plans':'Design Your Building';$('boardSub').textContent=l.mode==='paint'?'Each glowing tile equals one square unit.':l.mode==='count'?'Mark the purple squares as you count.':l.mode==='word'?'Too big to tile here. Multiply!':l.mode==='split'?sidesText(l):'Rows × tiles in each row = area.';
    $('siteTagName').textContent=ch.name.toUpperCase();$('modeLabel').textContent=l.mode==='paint'?'▦ BUILD MODE':l.mode==='count'?'⌕ SURVEY MODE':'⌗ DESIGN MODE';$('stageLegend').textContent=l.mode==='paint'?'Tap or drag to place tiles':l.mode==='count'?'Tap purple tiles to count':l.mode==='split'?'Split the L into two rectangles':'Multiply to find the area';
    $('paintControls').classList.toggle('hidden',l.mode!=='paint');$('countControls').classList.toggle('hidden',!['count','area','word'].includes(l.mode));$('rectControls').classList.add('hidden');$('splitControls').classList.toggle('hidden',l.mode!=='split');$('countInput').value='';document.querySelectorAll('#splitControls input').forEach(x=>x.value='');$('countLabel').textContent=l.mode==='count'?'MEASURE THE PURPLE SHAPE →':'AREA →';$('countUnit').textContent=l.mode==='word'?'square '+l.unit:'square units';$('paint').classList.add('active');$('erase').classList.remove('active');$('clear').textContent=l.mode==='count'?'↺   CLEAR MARKS':l.mode==='paint'?'↺   START OVER':'↺   CLEAR ANSWER';
    announce(l.mode==='paint'?'Your site is ready! Start placing tiles.':l.mode==='count'?'Count the purple squares. You can tap to number them as you go.':l.mode==='split'?'Type each rectangle as length × width, then the total.':'Multiply to find the area, then check your blueprint.');updateNumbers();renderProgress();renderMap();}
  function clearMission(){if(m().mode==='paint'){painted.clear();history=[]}else if(m().mode==='count'){counted.clear();$('countInput').value=''}else{$('countInput').value='';document.querySelectorAll('#splitControls input').forEach(x=>x.value='');split=null}updateNumbers();announce('Fresh blueprint! Give it another try.');}
  let split=null;
  function sidesText(l){return `Bottom wall ${l.Wd} · left wall ${l.Hd} · top wall ${l.Wd-l.cw} · right wall ${l.Hd-l.ch} · inside walls ${l.cw} and ${l.ch}`}
  function splitPart(x,y){const l=m();if(!split||!l.cells)return 0;const tx=x-l.ox,ty=y-l.oy;
    if(split==='h')return ty<l.ch?1:2; /* top part, then the full-width bottom */
    return tx<l.Wd-l.cw?1:2}           /* left full-height part, then the right */
  function check(){const l=m();let ok=false,msg='';if(l.mode==='paint'){
      ok=painted.size===l.area&&connected();if(painted.size!==l.area)msg=`You have ${painted.size} square units. This design needs ${l.area}. ${painted.size<l.area?'Add some more tiles!':'Try removing a few tiles.'}`;
      else if(!connected())msg='Great counting! Now connect the tiles edge-to-edge to make one usable space.';
      else msg=`Perfect! You placed exactly ${l.area} connected unit squares. Your new landmark can be built!`;
    }else if(l.mode==='count'||l.mode==='area'||l.mode==='word'){
      const raw=$('countInput').value.trim();if(!raw){announce('Type the area, then check your blueprint.','no');return}
      ok=Number(raw)===l.area;const u=l.mode==='word'?'square '+l.unit:'square units';
      if(l.mode==='count')msg=ok?(l.w?`Survey approved! ${l.h} rows of ${l.w} = ${l.area} square units.`:`Survey approved! The shape covers ${l.area} square units.`):`You entered ${raw}. Try checking one row or section at a time, then add them up.`;
      else msg=ok?`Yes! ${l.w} × ${l.h} = ${l.area} ${u}.`:(Number(raw)===l.w+l.h?`${raw} adds the sides. Area means multiply: length × width.`:Number(raw)===2*(l.w+l.h)?`${raw} is the distance around (the edge). Area is the space inside: length × width.`:`Not quite. Multiply ${l.w} × ${l.h}.`);
    }else if(l.mode==='split'){
      const v=[...document.querySelectorAll('#splitControls input')].map(x=>Number(x.value)),[a,b,c,d,t]=v;
      if(v.some(n=>!n)){announce('Fill in both rectangles and the total.','no');return}
      const same=(p,q)=>(p[0]===q[0]&&p[1]===q[1])||(p[0]===q[1]&&p[1]===q[0]),fits=(r1,r2)=>(same([a,b],r1)&&same([c,d],r2))||(same([a,b],r2)&&same([c,d],r1));
      const H1=[l.Wd-l.cw,l.ch],H2=[l.Wd,l.Hd-l.ch],V1=[l.Wd-l.cw,l.Hd],V2=[l.cw,l.Hd-l.ch],way=fits(H1,H2)?'h':fits(V1,V2)?'v':null;
      if(!way)msg='Those two rectangles don’t fit inside this L. Pick a line where the L bends, then read each rectangle’s length and width from the walls.';
      else if(a*b+c*d!==t)msg=`Your rectangles are right! Now ${a} × ${b} = ${a*b} and ${c} × ${d} = ${c*d}. Add them for the total.`;
      else{ok=t===l.area;split=way;msg=`City hall approved! ${a} × ${b} + ${c} × ${d} = ${a*b} + ${c*d} = ${t} square units.`}
      if(way)split=way;renderTouchGrid();
    }
    post({type:'answer',std:l.std,ok,ms:Date.now()-startT});startT=Date.now();
    announce(msg,ok?'ok':'no');playSound(ok);
    if(!ok){misses++;$('stage').classList.add('error-pulse');setTimeout(()=>$('stage').classList.remove('error-pulse'),400);return}
    const previous=save.scores[index],earned=Math.max(1,3-Math.min(2,hints+misses));if(earned>previous){save.scores[index]=earned;persist()}
    justCompleted=index;completionTime=performance.now();renderProgress();renderMap();$('completeTitle').textContent=index===8?'BUILDHAVEN IS BUILT!':'LANDMARK UNLOCKED!';$('completeMessage').textContent=msg+' '+(previous===0?`You earned ${earned} star${earned===1?'':'s'} and grew your city.`:earned>previous?'You improved your best star rating!':'You already completed this mission. Nice practice!');$('starRating').innerHTML=Array.from({length:3},(_,j)=>`<span class="${j<earned?'':'off'}">★</span>`).join('');$('next').textContent=index===8?'CELEBRATE YOUR CITY 🎉':'NEXT MISSION →';
    lastFocus=document.activeElement;$('completeOverlay').classList.add('show');$('next').focus();makeConfetti();
  }
  function makeConfetti(){const root=$('confetti');root.replaceChildren();if(reduced)return;for(let i=0;i<42;i++){const piece=document.createElement('i');piece.style.left=(Math.random()*100)+'%';piece.style.background=['#ffd262','#38cba6','#8066ec','#ff8d77','#76c6ee'][i%5];piece.style.animationDelay=(Math.random()*.6)+'s';piece.style.animationDuration=(1.6+Math.random()*1)+'s';piece.style.transform='rotate('+(Math.random()*360)+'deg)';root.append(piece)}setTimeout(()=>root.replaceChildren(),3200)}
  function closeModal(){if($('completeOverlay').classList.contains('show')){$('completeOverlay').classList.remove('show');completionTime=performance.now();if(lastFocus)lastFocus.focus()}}
  function adjust(k,v){if(k==='w')width=Math.max(1,Math.min(W,width+v));else height=Math.max(1,Math.min(H,height+v));updateNumbers();}
  const pointerDown=e=>{if(m().mode==='rectangle')return;const cell=screenToCell(e);if(!cell)return;dragging=true;dragId=e.pointerId;try{game.setPointerCapture(e.pointerId)}catch{};changeTile(cell);hover=cell};
  game.addEventListener('pointerdown',pointerDown);
  game.addEventListener('pointermove',e=>{const cell=screenToCell(e);hover=cell;if(dragging&&e.pointerId===dragId&&m().mode==='paint')changeTile(cell)});
  function stopDrag(){dragging=false;dragId=null}game.addEventListener('pointerup',stopDrag);game.addEventListener('pointercancel',stopDrag);game.addEventListener('pointerleave',()=>{hover=null;stopDrag()});
  game.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Enter'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')keyboardTile.x=Math.max(0,keyboardTile.x-1);else if(e.key==='ArrowRight')keyboardTile.x=Math.min(W-1,keyboardTile.x+1);else if(e.key==='ArrowUp')keyboardTile.y=Math.max(0,keyboardTile.y-1);else if(e.key==='ArrowDown')keyboardTile.y=Math.min(H-1,keyboardTile.y+1);else changeTile({...keyboardTile,id:keyboardTile.y*W+keyboardTile.x})});
  $('paint').onclick=()=>{tool='paint';$('paint').classList.add('active');$('erase').classList.remove('active')};$('erase').onclick=()=>{tool='erase';$('erase').classList.add('active');$('paint').classList.remove('active')};
  $('undo').onclick=()=>{if(history.length){painted=history.pop();updateNumbers();announce('Last building step undone.')}};
  $('clear').onclick=clearMission;$('check').onclick=check;$('checkBottom').onclick=check;$('countInput').addEventListener('keydown',e=>{if(e.key==='Enter')check()});
  $('wminus').onclick=()=>adjust('w',-1);$('wplus').onclick=()=>adjust('w',1);$('hminus').onclick=()=>adjust('h',-1);$('hplus').onclick=()=>adjust('h',1);
  $('hint').onclick=()=>{hints++;let hint=m().coach;if(m().mode==='paint')hint+=` You have ${painted.size} of ${m().area} tiles so far.`;else if(m().mode==='rectangle')hint+=' Remember: width × height = area.';announce('💡 CHIRP SAYS: '+hint)};
  $('sound').onclick=()=>{soundOn=!soundOn;$('sound').textContent=soundOn?'♫':'♪';$('sound').setAttribute('aria-label',soundOn?'Mute sounds':'Enable sounds');toast(soundOn?'Sound effects on':'Sound effects off');if(soundOn)playSound(true)};
  $('help').onclick=()=>{const help=m().mode==='paint'?'Tap or drag across the green squares to lay tiles. Choose Remove to erase. Tiles must touch at their edges.':'Use the instructions to finish your current blueprint. You can select a different unlocked mission on the right.';alert('HOW TO PLAY\n\n'+help+'\n\nKeyboard: Focus the game board, move with arrow keys, Space/Enter to select.\n\nStars reward successful missions. This demo saves on your own device.')};
  $('reset').onclick=()=>{if(confirm('Reset your saved Area Architect city on this device? This does not change your PTP account.')){save=fresh();save.seenIntro=true;persist();justCompleted=-1;load(0);toast('Your new city is ready to rebuild!')}};
  $('start').onclick=()=>{save.seenIntro=true;persist();$('intro').classList.add('hidden');$('check').focus()};
  $('next').onclick=()=>{const n=index;closeModal();if(n<8){load(n+1)}else{toast('You built Buildhaven! Replay any chapter for more practice.');announce('🏆 Buildhaven is complete! You can replay missions to improve your star rating.','ok')}};
  $('stay').onclick=closeModal;document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&m().mode==='paint'&&!$('intro').classList.contains('hidden'))return;else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&m().mode==='paint'){e.preventDefault();$('undo').click()}});
  if(save.seenIntro||doneCount()>0)$('intro').classList.add('hidden');
  if(EMB){const b=document.createElement('button');b.className='ptp-back';b.textContent='← Back to the arcade';b.onclick=()=>post({type:'exit'});document.body.append(b);
    document.querySelectorAll('.pill,.badge,span,div').forEach(el=>{if(el.children.length===0&&/LOCAL DEMO/i.test(el.textContent))el.style.display='none'});post({type:'ready'})}
  document.querySelectorAll('#splitControls input').forEach(x=>x.addEventListener('keydown',e=>{if(e.key==='Enter')check()}));
  index=0;for(let i=0;i<9;i++){if(!finished(i)){index=i;break}if(i===8)index=8}
  load(index);
  let lastFrame=0;function loop(t){time=t;const dt=t-lastFrame;if(dt>25||reduced){if(!$('intro').classList.contains('hidden'))drawWelcome(t);drawScene(t);drawTown(city,460,190,doneCount(),t);lastFrame=t}requestAnimationFrame(loop)}requestAnimationFrame(loop);
})();
