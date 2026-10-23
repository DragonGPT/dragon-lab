(function () {
  'use strict';
  const q = s => document.querySelector(s), room = q('#room'), timer = new FocusTimer();
  const key = 'dragon-relax:focus-minutes:v1';
  let last = performance.now(), seated = false, restStarted = false;
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null && timer.setMinutes(Number(saved))) { q('#focus-minutes').value = saved; q('#save-preference').checked = true; q('#storage-status').textContent = '已在此浏览器保存分钟数。取消勾选即可删除。'; }
  } catch { q('#storage-status').textContent = '浏览器暂不允许本地保存；计时仍可正常使用。'; }
  function say(text) { q('#room-speech').textContent = text; }
  function status(text) { if (q('#focus-status').textContent !== text) q('#focus-status').textContent = text; }
  function display() {
    q('#focus-time').textContent = Math.floor(timer.seconds / 60).toString().padStart(2, '0') + ':' + Math.floor(timer.seconds % 60).toString().padStart(2, '0');
    q('#energy-status').textContent = timer.tired ? '累瘫啦 · 休息一下就好' : timer.mode === 'rest' ? '正在充电' : '精神满满';
    room.classList.toggle('tired', timer.tired); room.classList.toggle('seated', seated || timer.mode === 'rest');
    const portrait = q('.room-dragon > img'), source = timer.tired || seated || timer.mode === 'rest' ? 'dragon-tired.png' : 'dragon.png';
    if (portrait.getAttribute('src') !== source) portrait.setAttribute('src', source);
    q('#focus-start').textContent = timer.mode === 'focus' ? '暂停专注' : timer.seconds > 0 ? '继续专注' : '开始专注';
    status(({ idle: '尚未开始 · 本页不会猜测你在做什么', focus: '专注中 · 仅当前可见页面累计', paused: '已暂停 · 点击继续才会累计', rest: '休息中 · 完成休息计时后恢复精神' })[timer.mode]);
    q('#focus-minutes').disabled = timer.mode === 'focus';
  }
  q('#room-toggle').onclick = () => { const hidden = !q('#guest-content').hidden; q('#guest-content').hidden = hidden; q('#room-toggle').setAttribute('aria-expanded', String(!hidden)); q('#room-toggle').textContent = hidden ? '打开小房间 ↗' : '收起小房间 ↙'; };
  q('#lamp-toggle').onclick = () => { const on = room.classList.toggle('lamp-on'); q('#lamp-toggle').setAttribute('aria-pressed', String(on)); q('#lamp-toggle').textContent = '台灯 · 暖光' + (on ? '开' : '关'); say(on ? '暖暖的一盏，不催你赶路。' : '灯关好啦，安静坐一会儿也可以。'); };
  q('#laptop-toggle').onclick = () => { const closed = room.classList.toggle('laptop-closed'); q('#laptop-toggle').setAttribute('aria-pressed', String(!closed)); q('#laptop-toggle').textContent = '笔记本 · ' + (closed ? '已合上' : '已打开'); say(closed ? '啪嗒。今天的摸鱼窗口先收起来。' : '小龙摸鱼 OS：今日任务，给自己留一点空白。'); };
  q('#mirror-toggle').onclick = () => { const wink = room.classList.toggle('mirror-wink'); q('#mirror-toggle').setAttribute('aria-pressed', String(wink)); say(wink ? '镜子里的小龙：✧ 眨眼成功！' : '镜子里也是小龙。今天的你，也辛苦啦。'); };
  q('#chair-toggle').onclick = () => { seated = !seated; q('#chair-toggle').setAttribute('aria-pressed', String(seated)); q('#chair-toggle').textContent = '龙体工学椅 · ' + (seated ? '站起来' : '坐下'); say(seated ? '坐好啦，尾巴有自己的软垫。' : '伸个懒腰，椅子还在这里等你。'); display(); };
  document.querySelectorAll('[data-umbrella]').forEach(button => button.onclick = () => { const style = button.dataset.umbrella; q('.room-umbrella').className = 'room-umbrella ' + style; document.querySelectorAll('[data-umbrella]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); say(style === 'paper' ? '油纸伞上印了小龙，晴天也想带出门。' : style === 'cyan' ? '青色的半透明伞，留一点天光给你。' : '伞收好啦，等下一场小雨。'); });
  q('#focus-start').onclick = () => {
    if (timer.mode === 'focus') timer.pause();
    else { if (!timer.setMinutes(Number(q('#focus-minutes').value))) { q('#focus-minutes').reportValidity(); return; } if (typeof running !== 'undefined' && running) q('#start').click(); timer.start(); last = performance.now(); }
    display();
  };
  q('#focus-rest').onclick = () => { q('[data-seconds="30"]').click(); q('#start').click(); say('先把肩膀放下来。小龙陪你充一会儿电。'); };
  q('#focus-reset').onclick = () => { if (typeof running !== 'undefined' && running) q('#reset').click(); restStarted = false; timer.recover(); display(); say('本次计时清空啦。不记成绩，只留一点空白。'); };
  function savePreference() {
    const valid = timer.setMinutes(Number(q('#focus-minutes').value));
    if (q('#save-preference').checked && !valid) { q('#focus-minutes').reportValidity(); return; }
    try { if (q('#save-preference').checked) localStorage.setItem(key, String(timer.limit / 60)); else localStorage.removeItem(key); q('#storage-status').textContent = q('#save-preference').checked ? '已在此浏览器保存分钟数。没有保存计时或历史。' : '已删除本地分钟数设置。刷新后恢复默认 45 分钟。'; } catch { q('#storage-status').textContent = '本地保存不可用。当前设置只在本页有效。'; }
    display();
  }
  q('#focus-minutes').onchange = savePreference; q('#save-preference').onchange = savePreference;
  document.addEventListener('dragon:rest', e => {
    if (e.detail.running) { timer.rest(); restStarted = true; }
    else if (restStarted && e.detail.remaining === 0) { timer.recover(); restStarted = false; say('电充好啦。休息也是今天的一部分。'); }
    else if (timer.mode === 'rest') timer.pause();
    display();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { timer.pause(); display(); } last = performance.now(); });
  window.addEventListener('pagehide', () => { timer.pause(); display(); });
  setInterval(() => { const now = performance.now(), wasTired = timer.tired; timer.advance((now - last) / 1000, !document.hidden); last = now; if (!wasTired && timer.tired) say('呜，小龙有点累瘫啦。要不要一起休息半分钟？'); display(); }, 250);
  display();
})();
