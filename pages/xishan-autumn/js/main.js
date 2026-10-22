(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const NS='http://www.w3.org/2000/svg';
const svgUse=(id,color)=>{const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox',id==='bfly'?'0 0 60 44':'0 0 40 40');s.style.color=color;const u=document.createElementNS(NS,'use');u.setAttribute('href','#'+id);s.appendChild(u);return s;};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 徽章进度 ---------- */
const tasks=$$('.task[data-badge]'); const done=new Set();
$('#badgeTotal').textContent=tasks.length;
function award(key){
  if(done.has(key))return; done.add(key);
  const t=$(`.task[data-badge="${key}"]`); if(t)t.classList.add('done');
  $('#badgeCount').textContent=done.size;
  $('#pfill').style.transform=`scaleX(${done.size/tasks.length})`;
  confetti(t);
  if(done.size===tasks.length)setTimeout(()=>{$('#cert').hidden=false;$('#kidName').focus();},900);
}
function confetti(el){
  if(reduce||!el)return; const r=el.getBoundingClientRect();
  const colors=['#e9823a','#f4c552','#5f8f4e','#d65a3a'];
  for(let i=0;i<14;i++){const p=document.createElement('div');p.className='pop';p.textContent='★';p.style.color=colors[i%4];
    p.style.position='fixed';p.style.left=(r.left+r.width*Math.random())+'px';p.style.top=(r.top+20+Math.random()*40)+'px';
    p.style.animationDelay=(Math.random()*.3)+'s';document.body.appendChild(p);setTimeout(()=>p.remove(),1300);}
}

/* ---------- 卡片进场 ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
$$('.card').forEach(c=>io.observe(c));

/* ---------- 飘落的叶子 ---------- */
const sky=$('#leafSky'); let caught=0, paused=false;
const leafColors=['#e9823a','#f4c552','#d65a3a','#c98a4b','#9bb35a'];
function dropLeaf(){
  if(paused||document.hidden)return;
  const b=document.createElement('button');b.className='fall';b.setAttribute('aria-label','接住秋叶');b.tabIndex=-1;
  b.appendChild(svgUse(Math.random()<.5?'maple':'leaf',leafColors[Math.floor(Math.random()*5)]));
  b.style.left=Math.random()*100+'vw';const dur=7+Math.random()*6;
  b.style.animationDuration=dur+'s';b.style.setProperty('--dx',(Math.random()*200-100)+'px');b.style.setProperty('--rot',(Math.random()*720-360)+'deg');
  b.addEventListener('click',e=>{caught++;$('#leafCount').textContent=caught;const p=document.createElement('div');p.className='pop';p.textContent='+1';p.style.position='fixed';p.style.left=e.clientX+'px';p.style.top=e.clientY+'px';document.body.appendChild(p);setTimeout(()=>p.remove(),900);b.remove();});
  b.addEventListener('animationend',()=>b.remove());sky.appendChild(b);
}
if(!reduce)setInterval(dropLeaf,1400);

/* ---------- 偶尔飞过的蝴蝶 ---------- */
function flyer(){
  if(paused||reduce||document.hidden)return;
  const f=svgUse('bfly',['#2f9d7f','#7b5cc4','#e9823a'][Math.floor(Math.random()*3)]);f.classList.add('flyer');
  const y=100+Math.random()*(innerHeight-200);f.style.left='-60px';f.style.top=y+'px';document.body.appendChild(f);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transform=`translate(${innerWidth+120}px,${Math.random()*200-100}px) rotate(10deg)`;}));
  setTimeout(()=>f.remove(),6500);
}
setInterval(flyer,9000);setTimeout(flyer,1500);

$('#motionBtn').addEventListener('click',e=>{paused=!paused;document.body.classList.toggle('still',paused);e.currentTarget.textContent=paused?'播放动画':'暂停动画';e.currentTarget.setAttribute('aria-pressed',paused);});

/* ---------- 任务1 放大镜 ---------- */
const stage=$('#lensStage'),lens=$('#lens');let lensMoves=0;
function moveLens(x,y){const r=stage.getBoundingClientRect();const px=x-r.left,py=y-r.top;lens.style.left=px+'px';lens.style.top=py+'px';
  lens.style.backgroundPosition=`${(px/r.width)*100}% ${(py/r.height)*100}%`;$('#lensHint').style.display='none';
  if(++lensMoves===40){$('#lensMsg').textContent='哇！原来“粉末”是一片片像瓦片一样叠在一起的彩色鳞片。蝴蝶的学名“鳞翅目”，意思就是长着鳞片的翅膀。';award('lens');}}
stage.addEventListener('pointermove',e=>moveLens(e.clientX,e.clientY));
stage.addEventListener('pointerdown',e=>{stage.classList.add('touch');moveLens(e.clientX,e.clientY);});
stage.addEventListener('pointerup',()=>stage.classList.remove('touch'));
stage.addEventListener('pointerleave',()=>stage.classList.remove('touch'));

/* ---------- 翻面卡 ---------- */
$$('.flip').forEach(f=>{const t=()=>f.classList.toggle('on');f.addEventListener('click',t);f.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t();}});});

/* ---------- 任务2 变色 ---------- */
const names=[[0,'华贵的深紫罗兰色'],[35,'带点蓝的紫色'],[60,'神秘的墨绿色'],[85,'低调的棕褐色']];
const visited=new Set();
$('#irisRange').addEventListener('input',e=>{const v=+e.target.value;
  $('#irisImg').style.filter=`hue-rotate(${-v*1.6}deg) saturate(${1-v/180}) brightness(${1-v/400})`;
  $('#irisShine').style.transform=`translateX(${v*2-100}%)`;
  let n=names[0][1];names.forEach(([k,s])=>{if(v>=k)n=s;});$('#irisName').textContent=n;visited.add(n);
  if(visited.size>=4)award('color');});

/* ---------- 任务3 枯叶蝶 ---------- */
const pile=$('#pile');let timer=null,left=15;
function buildPile(){pile.textContent='';pile.classList.remove('lock');
  const tIdx=Math.floor(Math.random()*36);
  for(let i=0;i<36;i++){const b=document.createElement('button');b.type='button';
    const isT=i===tIdx;b.setAttribute('aria-label',isT?'一片有点特别的叶子':'落叶');
    b.appendChild(svgUse('leaf',['#b07a3e','#c98a4b','#9c6a36','#a9773f'][i%4]));
    b.style.left=(Math.random()*88)+'%';b.style.top=(Math.random()*80)+'%';b.style.transform=`rotate(${Math.random()*360}deg)`;
    if(isT){b.classList.add('target');b.firstChild.innerHTML='';const u=document.createElementNS(NS,'use');u.setAttribute('href','#leaf');b.firstChild.appendChild(u);b.style.color='#a8733c';b.firstChild.style.color='#a8733c';const v=document.createElementNS(NS,'path');v.setAttribute('d','M8 28l24-20');v.setAttribute('stroke','#6b4422');v.setAttribute('stroke-width','1.4');b.firstChild.appendChild(v);}
    b.addEventListener('click',()=>{if(!timer)return;if(isT){clearInterval(timer);timer=null;b.classList.add('found');
      b.firstChild.replaceWith(svgUse('bfly','#a8733c'));pile.classList.add('lock');
      $('#pileMsg').textContent='找到啦！它一张开翅膀就飞走了。';$('#kallimaFig').classList.add('show');award('kallima');}
      else{b.animate([{transform:b.style.transform+' scale(1)'},{transform:b.style.transform+' scale(.6)'},{transform:b.style.transform+' scale(1)'}],{duration:300});}});
    pile.appendChild(b);} }
buildPile();pile.classList.add('lock');
$('#pileStart').addEventListener('click',()=>{buildPile();left=15;$('#pileMsg').textContent='剩余 15 秒';clearInterval(timer);
  timer=setInterval(()=>{left--;$('#pileMsg').textContent='剩余 '+left+' 秒';if(left<=0){clearInterval(timer);timer=null;pile.classList.add('lock');$('#pileMsg').textContent='时间到！它藏得太好了，提示：找一片带斜纹的“叶子”，再试一次吧。';}},1000);
  $('#pileStart').textContent='重新开始';});

/* ---------- 任务4 大眼睛 ---------- */
const bird=$('#bird'),owl=$('#owlImg');
$('#birdBtn').addEventListener('click',()=>{owl.classList.remove('open');bird.classList.remove('flee');void bird.offsetWidth;bird.classList.add('come');$('#eyeBtn').disabled=false;$('#owlMsg').textContent='小鸟越来越近了……';});
$('#eyeBtn').addEventListener('click',()=>{owl.classList.add('open');setTimeout(()=>{bird.classList.add('flee');},350);$('#eyeBtn').disabled=true;
  $('#owlMsg').textContent='小鸟以为遇到了猫头鹰，吓得飞走啦！翅膀上的眼斑就是蝴蝶的“护身符”。';award('owl');});

/* ---------- 任务5 蝴蝶 or 蛾子 ---------- */
const qs=[
 {t:'停下来休息时，翅膀竖着合起来的，多半是？',a:'蝴蝶',tip:'对！蝴蝶休息时翅膀常常竖着合拢，蛾子大多平摊或者像屋顶一样盖着身体。'},
 {t:'触角像细线，顶端有个小“棒槌”的，是？',a:'蝴蝶',tip:'答对！蝴蝶触角末端膨大像棒槌；蛾子触角多是丝状或羽毛状。'},
 {t:'常常在晚上出来、绕着路灯飞的，大多是？',a:'蛾子',tip:'没错！大多数蛾子晚上活动，蝴蝶喜欢白天晒太阳。'}];
let qi=0;
function renderQ(){const box=$('#quiz');box.textContent='';
  if(qi>=qs.length){const p=document.createElement('p');p.className='msg';p.textContent='全部答对！你已经会分辨蝴蝶和蛾子了。';box.appendChild(p);award('quiz');return;}
  const q=qs[qi];const wrap=document.createElement('div');wrap.className='qcard';
  const ic=svgUse('bfly',qi===2?'#a39270':'#e9823a');ic.classList.add('bug');wrap.appendChild(ic);
  const r=document.createElement('div');const tx=document.createElement('p');tx.className='qtext';tx.textContent=`第 ${qi+1} 题：${q.t}`;r.appendChild(tx);
  const o=document.createElement('div');o.className='opts';const m=document.createElement('p');m.className='msg';m.setAttribute('aria-live','polite');
  ['蝴蝶','蛾子'].forEach(c=>{const b=document.createElement('button');b.className='btn small';b.textContent=c;
    b.addEventListener('click',()=>{if(c===q.a){m.textContent=q.tip;o.querySelectorAll('button').forEach(x=>x.disabled=true);setTimeout(()=>{qi++;renderQ();},1800);}else{m.textContent='再想想哦～';b.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'none'}],{duration:300});}});o.appendChild(b);});
  r.appendChild(o);r.appendChild(m);wrap.appendChild(r);box.appendChild(wrap);}
renderQ();

/* ---------- 蝴蝶的一生 ---------- */
const life=[
 ['卵','妈妈把小小的卵产在幼虫爱吃的叶子上，就像给宝宝准备好了饭碗。','<path d="M0 100q100-30 200 0v20H0z" fill="#9bc76c"/><g fill="#fff3c4" stroke="#d9b45a">'+[70,90,110,130].map(x=>`<circle cx="${x}" cy="82" r="7"/>`).join('')+'</g>'],
 ['幼虫','毛毛虫只有一件事：吃吃吃！长大的过程中要蜕好几次皮。','<path d="M0 100q100-30 200 0v20H0z" fill="#9bc76c"/><g fill="#7cbf4a">'+[50,72,94,116,138].map((x,i)=>`<circle cx="${x}" cy="${78-Math.sin(i)*6}" r="12"/>`).join('')+'</g><circle cx="150" cy="70" r="13" fill="#5a9a34"/><circle cx="155" cy="66" r="2.5" fill="#333"/>'],
 ['蛹','把自己挂起来变成蛹，看起来一动不动，里面却在“大变身”。','<path d="M100 10v20" stroke="#8a5a33" stroke-width="4"/><path d="M100 30c-22 10-22 60 0 80c22-20 22-70 0-80z" fill="#b8c96a" stroke="#7d8f3a" stroke-width="2"/><path d="M90 60h20M88 75h24M92 90h16" stroke="#7d8f3a"/>'],
 ['成虫','破蛹而出，晾干翅膀，一只漂亮的蝴蝶就飞起来啦！','<use href="#bfly" x="50" y="15" width="100" height="90" style="color:#2f9d7f"/>']];
const ls=$('#lifeSteps');
life.forEach((l,i)=>{const b=document.createElement('button');b.role='tab';b.textContent=(i+1)+' '+l[0];b.setAttribute('aria-selected',i===0);
  b.addEventListener('click',()=>showLife(i));ls.appendChild(b);});
function showLife(i){ls.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-selected',i===j));
  const s=$('#lifeSvg');s.innerHTML=life[i][2];s.animate([{opacity:0,transform:'scale(.8)'},{opacity:1,transform:'none'}],{duration:450,easing:'cubic-bezier(.34,1.56,.64,1)'});$('#lifeText').textContent=life[i][1];}
showLife(0);

/* ---------- 小暖灯 ---------- */
$('#lampBtn').addEventListener('click',e=>{const on=$('#dome').classList.toggle('lit');e.currentTarget.textContent=on?'关掉小暖灯':'打开小暖灯';e.currentTarget.setAttribute('aria-pressed',on);});

/* ---------- 任务6 果实盲盒 ---------- */
const fruits=[
 {n:'橡子',k:'坚果',d:'硬硬的壳包着一颗种子',c:'#c98a4b'},
 {n:'元宝枫的种子',k:'翅果',d:'自带一对小翅膀',c:'#e9a23a'},
 {n:'柿子',k:'浆果',d:'软软的果肉，水分很多',c:'#f07a2a'},
 {n:'柳树的果',k:'蒴果',d:'成熟后裂开，飘出白白的柳絮',c:'#9bb35a'},
 {n:'桑葚',k:'聚花果',d:'很多小花一起变成的果子',c:'#7b3b6e'},
 {n:'松果',k:'球果',d:'松树是裸子植物，种子光溜溜地躺在鳞片上，没有果皮包着，所以它不是真正的果实！',c:'#8a5a33',odd:true}].sort(()=>Math.random()-.5);
let opened=0;
fruits.forEach((f,i)=>{const b=document.createElement('button');b.className='box'+(f.odd?' odd':'');b.type='button';b.setAttribute('aria-label','果实盲盒 '+(i+1));
  const bi=document.createElement('div');bi.className='bi';const bf=document.createElement('div');bf.className='bf';bf.textContent='?';
  const bb=document.createElement('div');bb.className='bb';const ic=svgUse(f.odd?'maple':'leaf',f.c);
  if(f.odd){ic.innerHTML='<ellipse cx="20" cy="22" rx="11" ry="16" fill="#8a5a33"/><path d="M10 14h20M9 22h22M10 30h20M20 6v32" stroke="#5c3d20" stroke-width="1.6"/>';}
  const st=document.createElement('strong');st.textContent=f.n;const sp=document.createElement('span');sp.textContent=f.k+'：'+(f.odd?'它不是果实！':f.d);
  bb.append(ic,st,sp);bi.append(bf,bb);b.appendChild(bi);
  b.addEventListener('click',()=>{if(b.classList.contains('open'))return;b.classList.add('open');b.setAttribute('aria-label',f.n+'，'+f.k);opened++;
    if(f.odd)$('#boxMsg').textContent='发现“冒牌货”！'+f.d;
    if(opened===fruits.length){$('#fruitFig').classList.add('show');award('box');if(!$('#boxMsg').textContent)$('#boxMsg').textContent='全部拆开啦！';}});
  $('#boxes').appendChild(b);});

/* ---------- 任务7 松杉柏 ---------- */
const rid=[
 {a:'松',tip:'松树：针一样的叶子，2～3 根扎成一束。',svg:'<path d="M60 100V20" stroke="#8a5a33" stroke-width="4"/>'+[30,50,70].map(y=>`<g stroke="#3f7a3a" stroke-width="3"><path d="M60 ${y}l-30 -18M60 ${y}l-26 -8M60 ${y}l30 -18M60 ${y}l26 -8"/></g>`).join('')},
 {a:'杉',tip:'杉树：扁平的条形叶，整整齐齐排在枝条两边，像梳子。',svg:'<path d="M10 60h100" stroke="#8a5a33" stroke-width="4"/>'+Array.from({length:10},(_,i)=>`<rect x="${16+i*9}" y="34" width="4" height="22" rx="2" fill="#4f9a48"/><rect x="${16+i*9}" y="64" width="4" height="22" rx="2" fill="#4f9a48"/>`).join('')},
 {a:'柏',tip:'柏树：小鳞片一样的叶子，紧紧贴在枝条上。',svg:'<path d="M60 100V30" stroke="#6b8d3a" stroke-width="8"/>'+Array.from({length:8},(_,i)=>`<ellipse cx="60" cy="${32+i*9}" rx="7" ry="5" fill="#5d8f3a" stroke="#3f6a2a"/>`).join('')+'<path d="M60 60l-26-20M60 80l26-22" stroke="#6b8d3a" stroke-width="6"/>'}].sort(()=>Math.random()-.5);
let ridOK=0;
rid.forEach((r,i)=>{const c=document.createElement('div');c.className='rd';
  const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox','0 0 120 110');s.innerHTML=r.svg;c.appendChild(s);
  const p=document.createElement('p');p.textContent='叶子 '+(i+1)+'：它是谁？';const o=document.createElement('div');o.className='opts';
  ['松','杉','柏'].forEach(k=>{const b=document.createElement('button');b.type='button';b.textContent=k;b.setAttribute('aria-label','猜它是'+k+'树');
    b.addEventListener('click',()=>{if(c.dataset.ok)return;if(k===r.a){b.classList.add('right');c.dataset.ok=1;p.textContent=r.tip;ridOK++;if(ridOK===3){$('#pineFig').classList.add('show');award('pine');}}
      else{b.classList.remove('wrong');void b.offsetWidth;b.classList.add('wrong');p.textContent='不对哦，再仔细看看叶子的形状～';}});o.appendChild(b);});
  c.append(p,o);$('#riddles').appendChild(c);});

/* ---------- 橡子帽子 ---------- */
const ac=$('#acorn');const tA=()=>{const off=ac.classList.toggle('off');$('#acornMsg').textContent=off?'帽子摘下来啦！这顶小帽子就是“壳斗”。':'帽子戴回去咯，再点一下试试';};
ac.addEventListener('click',tA);ac.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tA();}});

/* ---------- 任务8 翅果飞行 ---------- */
const arena=$('#arena');let best=0,flights=0;
for(let i=0;i<=5;i++){const s=document.createElement('span');s.textContent=(i*20)+'米';$('#ruler').appendChild(s);}
$('#flyBtn').addEventListener('click',()=>{
  const W=arena.clientWidth,H=arena.clientHeight;const wind=+$('#wind').value;
  const seed=document.createElement('div');seed.className='samara';
  seed.innerHTML='<svg viewBox="0 0 40 40"><path d="M20 20c-4-14 4-18 10-16 4 6-2 14-10 16z" fill="#e9a23a"/><path d="M20 20c4 14-4 18-10 16-4-6 2-14 10-16z" fill="#e9a23a"/><circle cx="20" cy="20" r="4" fill="#8a5a33"/></svg>';
  arena.appendChild(seed);
  const dist=Math.min(.98,(.18+wind*.07+Math.random()*.18));const endX=50+(W-90)*dist;const endY=H*.8-30;
  const anim=seed.animate([{transform:'translate(0,0)'},{transform:`translate(${(endX-50)*.4}px,${endY*.3}px)`},{transform:`translate(${(endX-50)*.75}px,${endY*.55}px)`},{transform:`translate(${endX-50}px,${endY-40}px)`}],{duration:reduce?10:2600,easing:'ease-in-out',fill:'forwards'});
  $('#flyBtn').disabled=true;
  anim.onfinish=()=>{seed.querySelector('svg').style.animation='none';const m=Math.round(dist*100);flights++;
    if(m>best)best=m;
    $('#flyMsg').textContent=`这颗飞了 ${m} 米！最远纪录：${best} 米。`+(wind<3?' 风太小了，试试把风调大？':'');
    $('#flyBtn').disabled=false;if(flights>=3||best>=70)award('seed');
    setTimeout(()=>seed.remove(),5000);};
});

/* ---------- 任务9 安全 ---------- */
$$('[data-safe]').forEach(b=>b.addEventListener('click',()=>{const a=$('#safeAns');const good=b.dataset.safe==='no';
  a.className='safe-ans show '+(good?'good':'bad');
  a.textContent=good?'太棒了，你是安全小卫士！这是七叶树的种子（俗称马栗），长得很像板栗，但含有让人呕吐、头晕的皂苷，严重时有生命危险。记住：野外的果子，不认识就绝对不吃！':'危险！这是七叶树的种子（俗称马栗），不是板栗！吃了会呕吐、头晕，严重时会有生命危险。快换另一个答案吧。';
  if(good)award('safe');}));

/* ---------- 倒计时 ---------- */
function cd(){const t=new Date('2026-10-24T13:30:00+08:00')-new Date();const el=$('#cd');
  if(t<=0){el.textContent='活动已开始或已结束';return;}
  const d=Math.floor(t/864e5),h=Math.floor(t%864e5/36e5),m=Math.floor(t%36e5/6e4);el.textContent=`${d} 天 ${h} 小时 ${m} 分`;}
cd();setInterval(cd,30000);

/* ---------- 证书 ---------- */
$('#kidName').addEventListener('input',e=>{$('#certName').textContent=e.target.value.trim()||'小探险家';});
$('#certClose').addEventListener('click',()=>{$('#cert').hidden=true;});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#cert').hidden=true;});
})();
