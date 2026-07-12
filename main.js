
  // ---------- CONFIG ----------
  const PASSWORD = "0713";

  // ---------- Digit lock logic ----------
  const boxes = Array.from(document.querySelectorAll('.digit-box'));
  const digitRow = document.getElementById('digit-row');
  const lockMessage = document.getElementById('lock-message');
  const lockScreen = document.getElementById('lock-screen');
  const mainContent = document.getElementById('main-content');

  boxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/[^0-9]/g, '');
      if (box.value) {
        box.classList.add('filled');
        if (boxes[i + 1]) boxes[i + 1].focus();
      } else {
        box.classList.remove('filled');
      }
      checkComplete();
    });

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && boxes[i - 1]) {
        boxes[i - 1].focus();
      }
    });
  });

  function checkComplete(){
    const entered = boxes.map(b => b.value).join('');
    if (entered.length === 4) {
      if (entered === PASSWORD) {
        unlock();
      } else {
        lockMessage.textContent = "hmm, that's not quite it";
        digitRow.classList.add('shake');
        setTimeout(() => {
          digitRow.classList.remove('shake');
          boxes.forEach(b => { b.value = ''; b.classList.remove('filled'); });
          boxes[0].focus();
        }, 500);
      }
    } else {
      lockMessage.textContent = '';
    }
  }

  function unlock(){
    lockMessage.textContent = 'the sky opens for you...';
    burstHeart();
    setTimeout(() => {
      lockScreen.classList.add('hidden');
      mainContent.classList.add('show');
    }, 900);
  }

  boxes[0].focus();

  // ---------- Letter open/close ----------
  const envelope = document.getElementById('envelope');
  const letterPaper = document.getElementById('letter-paper');
  const closeLetter = document.getElementById('close-letter');

  envelope.addEventListener('click', () => {
    letterPaper.classList.add('open');
    letterPaper.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  closeLetter.addEventListener('click', (e) => {
    e.stopPropagation();
    letterPaper.classList.remove('open');
  });

  // ---------- Ambient starfield ----------
  const starCanvas = document.getElementById('star-canvas');
  const sctx = starCanvas.getContext('2d');
  const burstCanvas = document.getElementById('burst-canvas');
  const bctx = burstCanvas.getContext('2d');
  let stars = [];
  let shootingStars = [];
  let burstParticles = [];

  function resizeCanvases(){
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
    burstCanvas.width = window.innerWidth;
    burstCanvas.height = window.innerHeight;
  }

  function initStars(){
    stars = [];
    const count = Math.floor((window.innerWidth * window.innerHeight) / 9000);
    for (let i = 0; i < count; i++){
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  window.addEventListener('resize', () => { resizeCanvases(); initStars(); });

  function maybeSpawnShootingStar(){
    if (Math.random() < 0.006 && shootingStars.length < 2){
      const startX = Math.random() * window.innerWidth * 0.6;
      shootingStars.push({
        x: startX,
        y: -10,
        len: 120 + Math.random() * 80,
        speed: 9 + Math.random() * 5,
        angle: Math.PI / 4,
        life: 1
      });
    }
  }

  function drawStars(t){
    sctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    stars.forEach(s => {
      const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.phase) * 0.25;
      sctx.beginPath();
      sctx.fillStyle = `rgba(246,239,225,${Math.max(0, alpha)})`;
      sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      sctx.fill();
    });

    maybeSpawnShootingStar();
    shootingStars.forEach(s => {
      const dx = Math.cos(s.angle) * s.len;
      const dy = Math.sin(s.angle) * s.len;
      const grad = sctx.createLinearGradient(s.x, s.y, s.x - dx, s.y - dy);
      grad.addColorStop(0, `rgba(240,211,143,${s.life})`);
      grad.addColorStop(1, 'rgba(240,211,143,0)');
      sctx.strokeStyle = grad;
      sctx.lineWidth = 1.6;
      sctx.beginPath();
      sctx.moveTo(s.x, s.y);
      sctx.lineTo(s.x - dx, s.y - dy);
      sctx.stroke();
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.life -= 0.012;
    });
    shootingStars = shootingStars.filter(s => s.life > 0 && s.y < window.innerHeight + 50);

    requestAnimationFrame(drawStars);
  }

  resizeCanvases();
  initStars();
  requestAnimationFrame(drawStars);

  // ---------- Unlock burst: particles forming a heart ----------
  function heartPoint(t, scale, cx, cy){
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
    return { x: cx + x * scale, y: cy + y * scale };
  }

  function burstHeart(){
    burstParticles = [];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2.4;
    const scale = Math.min(window.innerWidth, window.innerHeight) / 34;
    const total = 90;
    for (let i = 0; i < total; i++){
      const t = (i / total) * Math.PI * 2;
      const target = heartPoint(t, scale, cx, cy);
      burstParticles.push({
        x: cx,
        y: cy,
        tx: target.x,
        ty: target.y,
        r: Math.random() * 2 + 1.5,
        life: 1,
        colorGold: Math.random() > 0.4
      });
    }
    animateBurst();
  }

  function animateBurst(){
    bctx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);
    let alive = false;
    burstParticles.forEach(p => {
      p.x += (p.tx - p.x) * 0.09;
      p.y += (p.ty - p.y) * 0.09;
      if (p.life > 0.15) alive = true;
      p.life -= 0.006;
      const color = p.colorGold ? '240,211,143' : '232,167,196';
      bctx.beginPath();
      bctx.fillStyle = `rgba(${color}, ${Math.max(0, p.life)})`;
      bctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      bctx.fill();
    });
    if (alive){
      requestAnimationFrame(animateBurst);
    } else {
      setTimeout(() => bctx.clearRect(0, 0, burstCanvas.width, burstCanvas.height), 400);
    }
  }
