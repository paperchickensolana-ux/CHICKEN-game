// ===== SOUND SYSTEM =====

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return audioCtx;
}

function playSound(type) {
  if (localStorage.getItem("soundEnabled") === "false") return;

  const audio = getAudioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.connect(gain);
  gain.connect(audio.destination);

  const now = audio.currentTime;

  if (type === "coin") {
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(700, now);
    oscillator.frequency.exponentialRampToValueAtTime(1100, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  else if (type === "hit") {
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(180, now);
    oscillator.frequency.exponentialRampToValueAtTime(55, now + 0.3);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }

  else if (type === "start") {
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(350, now);
    oscillator.frequency.setValueAtTime(500, now + 0.08);
    oscillator.frequency.setValueAtTime(750, now + 0.16);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    oscillator.start(now);
    oscillator.stop(now + 0.25);
  }

  else if (type === "button") {
    oscillator.type = "sine";
    oscillator.frequency.value = 420;

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    oscillator.start(now);
    oscillator.stop(now + 0.08);
  }
}
const home = document.getElementById("home");
const gameScreen = document.getElementById("gameScreen");
const howScreen = document.getElementById("howScreen");
const gameOverBox = document.getElementById("gameOver");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const coinsEl = document.getElementById("coins");
const highScoreEl = document.getElementById("highScore");
const menuHighScoreEl = document.getElementById("menuHighScore");
const finalScoreEl = document.getElementById("finalScore");
const finalCoinsEl = document.getElementById("finalCoins");

let highScore = Number(localStorage.getItem("chickenHighScore") || 0);
menuHighScoreEl.textContent = highScore;
highScoreEl.textContent = highScore;

const keys = {};
let running = false;
let animationId = null;
let lastTime = 0;
let asteroidTimer = 0;
let coinTimer = 0;
let score = 0;
let coins = 0;
let speed = 300;

const player = {
  x: 150, y: 270, w: 90, h: 58, vy: 0,
  accel: 820, maxSpeed: 390
};

let asteroids = [];
let coinItems = [];
let stars = [];

function rand(min, max) { return Math.random() * (max - min) + min; }

function resetStars() {
  stars = Array.from({ length: 90 }, () => ({
    x: rand(0, canvas.width),
    y: rand(0, canvas.height),
    r: rand(1, 2.8),
    s: rand(20, 95)
  }));
}
function resetGame() {
  running = true;
  lastTime = performance.now();
  asteroidTimer = 0;
  coinTimer = 0;
  score = 0;
  coins = 0;
  speed = 300;

  asteroids = [];
  coinItems = [];

  player.y = 270;
  player.vy = 0;

  scoreEl.textContent = "0";
  coinsEl.textContent = "0";

  gameOverBox.classList.add("hidden");

  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(loop);
}

function startGame() {
  showScreen(gameScreen);
  resetGame();

  try {
    playSound("start");
  } catch (e) {
    console.log("Sound error:", e);
  }
}
  speed = 300;
  asteroids = [];
function startGame() {
  showScreen(gameScreen);
  resetGame();

  try {
    playSound("start");
  } catch (e) {
    console.log("Sound error:", e);
  }
}

function endGame() {running = false;
cancelAnimationFrame(animationId);

  const s = Math.floor(score);

  if (s > highScore) {
    highScore = s;
    localStorage.setItem("chickenHighScore", String(highScore));
  }

  highScoreEl.textContent = highScore;
  menuHighScoreEl.textContent = highScore;
  finalScoreEl.textContent = s;
  finalCoinsEl.textContent = coins;
  gameOverBox.classList.remove("hidden");
}


function circleRectCollision(cx, cy, cr, r) {
  const closestX = Math.max(r.x, Math.min(cx, r.x + r.w));
  const closestY = Math.max(r.y, Math.min(cy, r.y + r.h));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < cr * cr;
}

function update(dt) {
  const up = keys["ArrowUp"] || keys["w"] || keys["W"] || keys[" "] || keys["touchUp"];
  const down = keys["ArrowDown"] || keys["s"] || keys["S"] || keys["touchDown"];

  if (up) player.vy -= player.accel * dt;
  if (down) player.vy += player.accel * dt;

  player.vy *= Math.pow(0.1, dt);
  player.vy = Math.max(-player.maxSpeed, Math.min(player.maxSpeed, player.vy));
  player.y += player.vy * dt;
  player.y = Math.max(28, Math.min(canvas.height - player.h - 28, player.y));

  score += dt * 10;
  speed = Math.min(620, 300 + score * 0.28);

  asteroidTimer -= dt;
  if (asteroidTimer <= 0) {
    const r = rand(22, 42);
    asteroids.push({
      x: canvas.width + r,
      y: rand(r, canvas.height - r),
      r,
      rot: rand(0, Math.PI * 2),
      spin: rand(-2.2, 2.2)
    });
    asteroidTimer = rand(0.85, 1.45);
  }

  coinTimer -= dt;
  if (coinTimer <= 0) {
    coinItems.push({
      x: canvas.width + 30,
      y: rand(45, canvas.height - 45),
      r: 19,
      bob: rand(0, Math.PI * 2)
    });
    coinTimer = rand(0.55, 1.1);
  }

  stars.forEach(st => {
    st.x -= st.s * dt;
    if (st.x < -5) {
      st.x = canvas.width + 5;
      st.y = rand(0, canvas.height);
    }
  });

  asteroids.forEach(a => {
    a.x -= speed * dt;
    a.rot += a.spin * dt;
  });
  coinItems.forEach(c => {
    c.x -= speed * 0.92 * dt;
    c.bob += dt * 5;
  });

  asteroids = asteroids.filter(a => a.x > -80);
  coinItems = coinItems.filter(c => c.x > -60);

  const hitbox = { x: player.x + 8, y: player.y + 7, w: player.w - 16, h: player.h - 14 };

  for (const a of asteroids) {
  if (circleRectCollision(a.x, a.y, a.r * 0.72, hitbox)) {
    playSound("hit");
    endGame();
    return;
  }
}

  coinItems = coinItems.filter(c => {
    const hit = circleRectCollision(c.x, c.y + Math.sin(c.bob) * 5, c.r, hitbox);
    if (hit) {
     if (hit) {
  coins += 1;
  score += 50;
  playSound("coin");
  return false;
}
    }
    return true;
  });

  scoreEl.textContent = Math.floor(score);
  coinsEl.textContent = coins;
  highScoreEl.textContent = Math.max(highScore, Math.floor(score));
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  g.addColorStop(0, "#061a63");
  g.addColorStop(1, "#020827");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,.85)";
  for (const st of stars) {
    ctx.beginPath();
    ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // moon
  ctx.fillStyle = "#fff3a8";
  ctx.beginPath();
  ctx.arc(790, 100, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(80,90,140,.18)";
  ctx.beginPath(); ctx.arc(765, 83, 13, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(812, 115, 18, 0, Math.PI*2); ctx.fill();

  // green "pump" candles
  for (let i = 0; i < 7; i++) {
    const x = 565 + i * 42;
    const h = 55 + i * 20;
    ctx.strokeStyle = "#00ff6a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 10, 390 - h - 20);
    ctx.lineTo(x + 10, 420);
    ctx.stroke();
    ctx.fillStyle = "#00ff6a";
    ctx.fillRect(x, 390 - h, 20, h);
  }
}

function drawRocketChicken() {
  ctx.save();
  ctx.translate(player.x, player.y);

  // flame
  ctx.fillStyle = "#ffd21a";
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.lineTo(-42 - Math.random() * 15, 29);
  ctx.lineTo(0, 40);
  ctx.fill();
  ctx.fillStyle = "#ff6500";
  ctx.beginPath();
  ctx.moveTo(3, 25);
  ctx.lineTo(-27 - Math.random() * 10, 30);
  ctx.lineTo(3, 36);
  ctx.fill();

  // rocket
  ctx.fillStyle = "#f5f6ff";
  ctx.strokeStyle = "#0b163f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(42, 29, 48, 25, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = "#ef2020";
  ctx.beginPath();
  ctx.moveTo(72, 6); ctx.lineTo(100, 29); ctx.lineTo(72, 52); ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(27, 46); ctx.lineTo(10, 67); ctx.lineTo(57, 50); ctx.closePath();
  ctx.fill();

  // chicken cockpit
  ctx.fillStyle = "#ffb31a";
  ctx.beginPath();
  ctx.arc(42, 26, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ef2222";
  ctx.beginPath();
  ctx.arc(39, 5, 7, 0, Math.PI * 2);
  ctx.arc(48, 7, 7, 0, Math.PI * 2);
  ctx.fill();

  // sunglasses
  ctx.fillStyle = "#111";
  ctx.fillRect(28, 18, 13, 8);
  ctx.fillRect(44, 18, 13, 8);
  ctx.fillRect(40, 20, 5, 3);

  ctx.restore();
}

function drawAsteroid(a) {
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.rot);
  ctx.fillStyle = "#807aa6";
  ctx.strokeStyle = "#c6c3ff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  const pts = 9;
  for (let i = 0; i < pts; i++) {
    const angle = (i / pts) * Math.PI * 2;
    const rr = a.r * rand(0.78, 1.05);
    const x = Math.cos(angle) * rr;
    const y = Math.sin(angle) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.fillStyle = "rgba(30,30,55,.35)";
  ctx.beginPath(); ctx.arc(-a.r*.2, -a.r*.1, a.r*.18, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(a.r*.25, a.r*.2, a.r*.12, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawCoin(c) {
  const y = c.y + Math.sin(c.bob) * 5;
  ctx.save();
  ctx.translate(c.x, y);
  ctx.fillStyle = "#ffca1b";
  ctx.strokeStyle = "#fff09a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, c.r, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = "#8a5200";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("S", 0, 1);
  ctx.restore();
}

function draw() {
  drawBackground();
  coinItems.forEach(drawCoin);
  asteroids.forEach(drawAsteroid);
  drawRocketChicken();

  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "left";
  ctx.fillText("CHICKEN TO THE MOON", 22, 30);
}

function loop(now) {
  if (!running) return;
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  dt = Math.min(dt, 0.032);
  update(dt);
  draw();
  if (running) animationId = requestAnimationFrame(loop);
}

window.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (["ArrowUp","ArrowDown"," "].includes(e.key)) e.preventDefault();
});
window.addEventListener("keyup", e => keys[e.key] = false);

function bindHold(id, keyName) {
  const btn = document.getElementById(id);
  const on = e => { e.preventDefault(); keys[keyName] = true; };
  const off = e => { e.preventDefault(); keys[keyName] = false; };
  btn.addEventListener("pointerdown", on);
  btn.addEventListener("pointerup", off);
  btn.addEventListener("pointercancel", off);
  btn.addEventListener("pointerleave", off);
}
bindHold("upBtn", "touchUp");
bindHold("downBtn", "touchDown");

document.getElementById("playBtn").addEventListener("click", startGame);
document.getElementById("restartBtn").addEventListener("click", resetGame);
document.getElementById("howBtn").addEventListener("click", () => showScreen(howScreen));
document.getElementById("howBackBtn").addEventListener("click", () => showScreen(home));
document.getElementById("backBtn").addEventListener("click", () => {
  running = false;
  cancelAnimationFrame(animationId);
  gameOverBox.classList.add("hidden");
  showScreen(home);
});
document.getElementById("menuBtn").addEventListener("click", () => {
  gameOverBox.classList.add("hidden");
  showScreen(home);
});

draw();// ===== NEW GAME BUTTONS =====

// LEADERBOARD
const leaderboardBtn = document.getElementById("leaderboardBtn");

if (leaderboardBtn) {
  leaderboardBtn.addEventListener("click", () => {
    running = false;

    const bestScore = localStorage.getItem("highScore") || 0;

    alert(
      "🏆 LEADERBOARD\n\n" +
      "1. CHICKEN — " + bestScore + "\n" +
      "2. MOON PLAYER — 850\n" +
      "3. PUMP KING — 600"
    );
  });
}


// CONNECT WALLET
const walletBtn = document.getElementById("walletBtn");

if (walletBtn) {
  walletBtn.addEventListener("click", async () => {

    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        const address = response.publicKey.toString();

        walletBtn.textContent =
          "✅ " + address.slice(0, 4) + "..." + address.slice(-4);

      } catch (error) {
        alert("Connexion annulée.");
      }

    } else {
      alert("Installe Phantom Wallet pour connecter ton wallet Solana.");
    }
  });
}


// SETTINGS
const settingsBtn = document.getElementById("settingsBtn");

if (settingsBtn) {
  settingsBtn.addEventListener("click", () => {

    const soundEnabled =
      localStorage.getItem("soundEnabled") !== "false";

    const answer = confirm(
      "⚙️ SETTINGS\n\n" +
      "Son actuellement : " +
      (soundEnabled ? "ON 🔊" : "OFF 🔇") +
      "\n\nClique OK pour changer."
    );

    if (answer) {
      localStorage.setItem(
        "soundEnabled",
        soundEnabled ? "false" : "true"
      );

      alert(
        "Son : " +
        (soundEnabled ? "OFF 🔇" : "ON 🔊")
      );
    }
  });
}


// HOW TO PLAY
const gameHowBtn = document.getElementById("gameHowBtn");

if (gameHowBtn) {
  gameHowBtn.addEventListener("click", () => {
   
    showScreen(howScreen);
  });
}
