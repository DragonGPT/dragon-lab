'use strict';
const $=s=>document.querySelector(s);let duration=30,remaining=30,running=false,endAt=0,elapsedBefore=0,sound=false,audio=null,reminderAt=null,reminderMinutes=25;
const phrases=['“已经很努力了。现在，轮到休息。”','“把肩膀放松一点。不必急着出发。”','“这一小会儿，不需要做出什么成绩。”','“谢谢你，把一点时间留给自己。”'];
function format(n){n=Math.max(0,Math.ceil(n));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}
function chime(){if(!sound||!audio)return;try{audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=660;g.gain.setValueAtTime(0,audio.currentTime);g.gain.linearRampToValueAtTime(.08,audio.currentTime+.04);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.8);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.8)}catch{}}
function render(){document.dispatchEvent(new CustomEvent('dragon:rest',{detail:{running,remaining}})); $('#time').textContent=format(remaining);$('#start').innerHTML=running?'暂停一下 <span>Ⅱ</span>':remaining===0?'再休息一次 <span>↗</span>':remaining<duration?'继续休息 <span>↗</span>':'开始休息 <span>↗</span>';if(running){const elapsed=duration-remaining;const cycle=elapsed%10;$('#phase').textContent=cycle<4?'轻轻吸气':'慢慢呼气';$('#hint').textContent='不必勉强跟上，舒适最重要';$('#orb').style.transform='scale('+(cycle<4?1+cycle*.025:1.1-(cycle-4)/6*.1)+')'}else{$('#phase').textContent=remaining===0?'这一刻，属于你':remaining<duration?'慢慢来，没关系':'准备好了吗';$('#hint').textContent=remaining===0?'带着一点松弛，继续今天吧':'跟随自己的舒适节奏就好';$('#orb').style.transform='scale(1)'}}
function reset(){running=false;remaining=duration;elapsedBefore=0;render()}
$('#start').addEventListener('click',()=>{if(running){remaining=Math.max(0,(endAt-Date.now())/1000);running=false}else{if(remaining===0)remaining=duration;endAt=Date.now()+remaining*1000;running=true;$('#message').textContent=phrases[1];$('#toast').hidden=true}render()});$('#reset').addEventListener('click',reset);
document.querySelectorAll('[data-seconds]').forEach(b=>b.addEventListener('click',()=>{duration=Number(b.dataset.seconds);document.querySelectorAll('[data-seconds]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b))});reset()}));
$('#sound').addEventListener('click',()=>{sound=!sound;if(sound&&!audio){try{audio=new(window.AudioContext||window.webkitAudioContext)()}catch{sound=false}}$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').setAttribute('aria-label',sound?'关闭提示音':'开启提示音');$('#sound span').textContent=sound?'声音开启':'声音关闭';if(sound)chime()});
$('#reminder-form').addEventListener('submit',e=>{e.preventDefault();if(reminderAt!==null){reminderAt=null;$('#toast').hidden=true;$('#interval').disabled=false;$('#reminder-button').textContent='开启提醒';$('#reminder-status').textContent='已暂停提醒 · 想起时再回来也可以';return}const n=Number($('#interval').value);if(!Number.isInteger(n)||n<1||n>180)return;reminderMinutes=n;reminderAt=Date.now()+n*60000;$('#interval').disabled=true;$('#reminder-button').textContent='暂停提醒';updateReminder()});
function showReminder(){ $('#toast').hidden=false;$('#message').textContent='“忙了这么久，伸个懒腰嘛！”';chime()}
$('#preview-reminder').addEventListener('click',showReminder);
function updateReminder(){if(reminderAt===null||document.hidden)return;if(Date.now()>=reminderAt){showReminder();reminderAt=Date.now()+reminderMinutes*60000}$('#reminder-status').textContent='提醒已开启 · 下次休息还有 '+format((reminderAt-Date.now())/1000)}
$('#dismiss').addEventListener('click',()=>{$('#toast').hidden=true});$('#take-break').addEventListener('click',()=>{$('#toast').hidden=true;reset();$('#start').click();$('.break-card').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'})});
function tick(){if(running){remaining=Math.max(0,(endAt-Date.now())/1000);if(remaining===0){running=false;$('#message').textContent=phrases[3];chime()}render()}updateReminder()}setInterval(tick,200);let hiddenAt=null;
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    hiddenAt=Date.now();
    if(running){remaining=Math.max(0,(endAt-Date.now())/1000);running=false;render();$('#hint').textContent='离开页面已暂停，回来后可继续';}
  }else{
    if(hiddenAt!==null&&reminderAt!==null)reminderAt+=Date.now()-hiddenAt;
    hiddenAt=null;tick();
  }
});render();
