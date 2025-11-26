const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let gameOver = false;
let level = 1;
let avoided = 0;

const hitSound = document.getElementById("hitSound");
const moveSound = document.getElementById("moveSound");
const finalText = document.getElementById("final");
const restartBtn = document.getElementById("restartBtn");
const maxLevelText = document.getElementById("maxLevel");

let player = {
    x: 280,
    y: 350,
    width: 25,
    height: 25,
    speed: 6
};

let fireballs = [];
let animationId;

// Track maximum level
let maxLevel = localStorage.getItem('maxLevel') || 0;
maxLevelText.textContent = "Max Level: " + maxLevel;

// BACKGROUND PARTICLES
let particles = [];
for (let i = 0; i < 120; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.2,
        color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*100+100)},255,0.8)`
    });
}

// PLAYER MOVEMENT
document.addEventListener("keydown", (e) => {
    if (gameOver) return;
    if (e.key === "ArrowLeft" && player.x > 0) { player.x -= player.speed; moveSound.play(); }
    if (e.key === "ArrowRight" && player.x + player.width < canvas.width) { player.x += player.speed; moveSound.play(); }
});

// SPAWN FIRE
function spawnFireball() {
    fireballs.push({
        x: Math.random() * (canvas.width - 20),
        y: -20,
        width: 20,
        height: 20,
        pulse: 0
    });
}

// UPDATE FIRE
function updateFireballs() {
    // Adjust difficulty
    let fireSpeed, playerSpeed, spawnRate;
    if(level <= 4){
        fireSpeed = 3 + level*0.05;  
        playerSpeed = 6 + level*0.05;
        spawnRate = 0.03 + level*0.003; // normal
    } else if(level === 4){
        fireSpeed = 7;             // big jump in speed
        playerSpeed = 10;          // player moves faster
        spawnRate = 0.12;          // many fireballs at once
    } else {
        fireSpeed = 5 + level*0.1; // gradual increase after level 4
        playerSpeed = 8 + level*0.1;
        spawnRate = 0.03 + level*0.003;
    }
    player.speed = playerSpeed;

    for (let i = 0; i < fireballs.length; i++) {
        fireballs[i].y += fireSpeed;
        fireballs[i].pulse += 0.1;

        if (fireballs[i].y > canvas.height) {
            avoided++;
            fireballs.splice(i, 1);
            i--;

            if (avoided % 10 === 0) {
                level++;
                document.getElementById("level").textContent = "Level: " + level;
            }
            continue;
        }

        // COLLISION
        if (
            fireballs[i].x < player.x + player.width &&
            fireballs[i].x + fireballs[i].width > player.x &&
            fireballs[i].y < player.y + player.height &&
            fireballs[i].y + fireballs[i].height > player.y
        ) {
            hitSound.play();
            endGame(level);
        }
    }

    // Spawn fireballs
    if(Math.random() < spawnRate) spawnFireball();
}

// DRAW BACKGROUND
let hueShift = 200;
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `hsl(${hueShift}, 60%, 10%)`);
    gradient.addColorStop(1, `hsl(${(hueShift+60)%360}, 70%, 20%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hueShift += 0.1;

    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.y += p.speed;
        if (p.y > canvas.height) p.y = 0;
    });
}

// DRAW PLAYER
function drawPlayer() {
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// DRAW FIREBALLS
function drawFireballs() {
    fireballs.forEach(f => {
        const size = f.width + Math.sin(f.pulse) * 5;
        ctx.fillStyle = `rgb(255,${Math.floor(Math.random()*150)},0)`;
        ctx.fillRect(f.x, f.y, size, size);
    });
}

// END GAME
function endGame(reachedLevel) {
    gameOver = true;
    cancelAnimationFrame(animationId);
    finalText.textContent = "You reached level " + reachedLevel;

    // Save max level
    if(reachedLevel > maxLevel){
        maxLevel = reachedLevel;
        localStorage.setItem('maxLevel', maxLevel);
        maxLevelText.textContent = "Max Level: " + maxLevel;
    }

    restartBtn.style.display = "inline-block";
}

// RESTART GAME
function restartGame() {
    fireballs = [];
    avoided = 0;
    level = 1;
    player.x = 280;
    player.speed = 6;
    document.getElementById("level").textContent = "Level: " + level;
    finalText.textContent = "";
    restartBtn.style.display = "none";
    gameOver = false;
    gameLoop();
}

restartBtn.addEventListener("click", restartGame);

// GAME LOOP
function gameLoop() {
    if (gameOver) return;

    drawBackground();
    drawPlayer();
    drawFireballs();
    updateFireballs();

    animationId = requestAnimationFrame(gameLoop);
}

gameLoop();
