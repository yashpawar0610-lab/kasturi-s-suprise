// script.js - Core interactivity for Kasturi's Birthday Surprise

/* ===================== Utility ===================== */
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

/* ===================== State ===================== */
let currentPage = 1;
let pageHistory = [];
let callTimerInterval = null;
let callSeconds = 0;
let isPanic = false;
let music = new Audio('hbd.mp3');
music.loop = true;

/* ===================== Navigation ===================== */
function goToPage(page) {
  if (page < 1 || page > 5) return;
  // hide current
  $(`#page${currentPage}`).classList.remove('active');
  $(`#page${currentPage}`).classList.add('hidden');
  // show new
  $(`#page${page}`).classList.remove('hidden');
  $(`#page${page}`).classList.add('active');
  // update dots
  $(`#page-dots .page-dot.active`).classList.remove('active');
  $(`#page-dots .page-dot:nth-child(${page})`).classList.add('active');
  pageHistory.push(currentPage);
  currentPage = page;
}
function goBack() {
  if (pageHistory.length === 0) return;
  const prev = pageHistory.pop();
  goToPage(prev);
}

/* ===================== Custom Cursor ===================== */
const cursor = $('#cursor');
const cursorTrail = $('#cursor-trail');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  cursorTrail.style.left = e.clientX + 'px';
  cursorTrail.style.top = e.clientY + 'px';
});

/* ===================== Particle Canvas ===================== */
const particleCanvas = $('#particle-canvas');
const ctx = particleCanvas.getContext('2d');
function resizeCanvas() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
const particles = [];
function createParticle(x, y) {
  particles.push({x, y, size: Math.random()*3+1, speedX: (Math.random()-0.5)*0.5, speedY: (Math.random()-0.5)*0.5, alpha: 1});
}
function animateParticles() {
  ctx.clearRect(0,0,particleCanvas.width,particleCanvas.height);
  particles.forEach(p => {
    p.x += p.speedX; p.y += p.speedY; p.alpha -= 0.005;
    ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size,0,Math.PI*2); ctx.fill();
  });
  // remove faded
  for(let i=particles.length-1;i>=0;i--) if(particles[i].alpha<=0) particles.splice(i,1);
  requestAnimationFrame(animateParticles);
}
particleCanvas.addEventListener('click', e => createParticle(e.clientX, e.clientY));
animateParticles();

/* ===================== Music Widget ===================== */
function toggleMusic() {
  if (music.paused) {
    music.play();
    $('#music-status-txt').textContent = 'Playing';
  } else {
    music.pause();
    $('#music-status-txt').textContent = 'Paused';
  }
}

/* ===================== Call Simulator ===================== */
function acceptCall() {
  $('#screen-incoming').classList.remove('active');
  $('#screen-active').classList.add('active');
  startCallTimer();
}
function declineCall() { /* optional behavior */ }
function startCallTimer() {
  callSeconds = 0;
  $('#call-timer').textContent = '00:00';
  callTimerInterval = setInterval(() => {
    callSeconds++;
    const mins = String(Math.floor(callSeconds/60)).padStart(2,'0');
    const secs = String(callSeconds%60).padStart(2,'0');
    $('#call-timer').textContent = `${mins}:${secs}`;
  }, 1000);
}
function endCall() {
  clearInterval(callTimerInterval);
  $('#screen-active').classList.remove('active');
  $('#screen-incoming').classList.add('active');
}
function triggerCallPanic() {
  if (isPanic) return;
  isPanic = true;
  $('#screen-active').classList.remove('active');
  $('#screen-panic').classList.add('active');
  clearInterval(callTimerInterval);
}
function restoreCallFromPanic() {
  if (!isPanic) return;
  isPanic = false;
  $('#screen-panic').classList.remove('active');
  $('#screen-active').classList.add('active');
  startCallTimer();
}
/* ===================== Gossip Meter ===================== */
function updateGossipMeter(val) {
  const status = $('#meter-status-text');
  const dot = $('#status-dot');
  let level = '';
  if (val < 30) level = 'Mild Tea ☕';
  else if (val < 70) level = 'Spicy 🌶️';
  else level = 'FBI Alert 🚨';
  status.textContent = `Gossip level: ${level}`;
  dot.style.background = val < 30 ? '#4caf50' : val < 70 ? '#ff9800' : '#f44336';
}
/* ===================== Envelope / Letter ===================== */
let typingInterval = null;
function openEnvelope() {
  const envelope = $('#envelope-wrapper');
  envelope.classList.add('open');
  // typewriter effect after short delay
  setTimeout(startTypingLetter, 800);
}
function startTypingLetter() {
  const textEl = $('#letter-body');
  const fullText = textEl.dataset.fulltext; // we will store full text in data attribute
  let idx = 0;
  textEl.textContent = '';
  typingInterval = setInterval(() => {
    if (idx >= fullText.length) { clearInterval(typingInterval); return; }
    textEl.textContent += fullText[idx++];
  }, 30);
}
/* ===================== Flip Cards ===================== */
function flipCard(card) {
  card.classList.toggle('flipped');
}
/* ===================== Certificate ===================== */
function triggerCertificate() {
  const certBox = $('#certificate-box');
  certBox.classList.add('show');
}
/* ===================== Wish Jar ===================== */
function openWishJar(elem, idx) {
  const reveal = elem.querySelector('.wish-reveal');
  reveal.classList.toggle('visible');
}
/* ===================== Fireworks ===================== */
const fireworkCanvas = $('#firework-canvas');
const fctx = fireworkCanvas.getContext('2d');
function resizeFirework() {
  fireworkCanvas.width = window.innerWidth;
  fireworkCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeFirework);
resizeFirework();
let fireworks = [];
function createFirework(x, y) {
  const particles = [];
  for(let i=0;i<30;i++) {
    const angle = Math.random()*Math.PI*2;
    const speed = Math.random()*3+2;
    particles.push({x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life: 60});
  }
  fireworks.push(particles);
}
function animateFireworks() {
  fctx.clearRect(0,0,fireworkCanvas.width,fireworkCanvas.height);
  fireworks.forEach((particles, idx) => {
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life--;
      fctx.fillStyle = `rgba(255,255,255,${p.life/60})`;
      fctx.beginPath(); fctx.arc(p.x, p.y, 2,0,Math.PI*2); fctx.fill();
    });
    fireworks[idx] = particles.filter(p=>p.life>0);
  });
  fireworks = fireworks.filter(arr=>arr.length>0);
  requestAnimationFrame(animateFireworks);
}
function triggerGrandFinale() {
  // launch a burst of fireworks at random positions
  for(let i=0;i<20;i++) createFirework(Math.random()*fireworkCanvas.width, Math.random()*fireworkCanvas.height);
  // optional: play a sound or display a message
  const msg = $('#finale-message');
  msg.classList.add('show');
}
animateFireworks();

/* ===================== Draggable Polaroids ===================== */
function makeDraggable(card) {
  let isDown = false, offsetX, offsetY;
  card.addEventListener('mousedown', e => {
    isDown = true;
    offsetX = e.clientX - card.offsetLeft;
    offsetY = e.clientY - card.offsetTop;
    card.style.zIndex = 1000;
  });
  document.addEventListener('mousemove', e => {
    if (!isDown) return;
    card.style.left = (e.clientX - offsetX) + 'px';
    card.style.top = (e.clientY - offsetY) + 'px';
  });
  document.addEventListener('mouseup', () => { isDown = false; card.style.zIndex = ''});
  card.addEventListener('dblclick', () => {
    // open in lightbox
    const imgSrc = card.querySelector('img').src;
    $('#lightbox-img').src = imgSrc;
    $('#lightbox').classList.add('visible');
  });
}
$$('.polaroid-card').forEach(makeDraggable);
function closeLightbox() { $('#lightbox').classList.remove('visible'); }

/* ===================== Loading Screen ===================== */
function initLoadingScreen() {
  const loadingScreen = $('#loading-screen');
  const loadingBarFill = document.querySelector('.loading-bar-fill');
  if (!loadingScreen) return;

  // Animate bar to 100% over 2.5 seconds
  let progress = 0;
  const interval = setInterval(() => {
    progress += 2;
    if (loadingBarFill) loadingBarFill.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(interval);
      // Fade out loading screen after bar completes
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.8s ease';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 800);
      }, 300);
    }
  }, 50);
}

/* ===================== Init ===================== */
document.addEventListener('DOMContentLoaded', () => {
  // hide all pages except first
  for(let i=2;i<=5;i++) $(`#page${i}`).classList.add('hidden');
  // store full letter text for typing effect
  const letterBody = $('#letter-body');
  if (letterBody) {
    letterBody.dataset.fulltext = letterBody.textContent.trim();
    letterBody.textContent = '';
  }
  // Start loading screen dismissal
  initLoadingScreen();
});

// Export functions for HTML onclick attributes
window.goToPage = goToPage;
window.goBack = goBack;
window.toggleMusic = toggleMusic;
window.acceptCall = acceptCall;
window.declineCall = declineCall;
window.triggerCallPanic = triggerCallPanic;
window.restoreCallFromPanic = restoreCallFromPanic;
window.endCall = endCall;
window.updateGossipMeter = updateGossipMeter;
window.openEnvelope = openEnvelope;
window.flipCard = flipCard;
window.triggerCertificate = triggerCertificate;
window.openWishJar = openWishJar;
window.triggerGrandFinale = triggerGrandFinale;
window.closeLightbox = closeLightbox;
