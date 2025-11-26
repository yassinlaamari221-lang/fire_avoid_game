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

let maxLevel = localStorage.getItem('maxLevel') || 0;
maxLevelText.textContent = "Max Level: " + maxLevel;

let player = {
    x: 280,
    y: 350,
    width: 25,
    height: 25,
    speed: 6
};

let fireballs = [];
let animationId;

// PARTICLES FOR BACKGROUND
let particles = [];
for(let i=0;i<120;i++){
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.2,
        color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*100+100)},255,0.8)`
    });
}

// FLASH EFFECT
let flashTimer = 0;

// KEYBOARD MOVEMENT
document.addEventListener("keydown", (e)=>{
    if(gameOver) return;
    if(e.key === "ArrowLeft" && player.x > 0){
        player.x -= player.speed;
        flashTimer = 5;
        moveSound.play();
    }
    if(e.key === "ArrowRight" && player.x + player.width < canvas.width){
        player.x += player.speed;
        flashTimer = 5;
        moveSound.play();
    }
});

// TOUCH MOVEMENT
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);

function handleTouch(e){
    if(gameOver) return;
    const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    if(touchX < canvas.width/2){
        player.x -= player.speed;
    } else {
        player.x += player.speed;
    }
    // Keep inside canvas
    if(player.x < 0) player.x = 0;
    if(player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    flashTimer = 5;
    moveSound.play();
    e.preventDefault();
}

// SPAWN FIREBALLS
function spawnFireball(){
    fireballs.push({
        x: Math.random()*(canvas.width-20),
        y: -20,
        width: 20,
        height: 20,
        pulse: 0
    });
}

// UPDATE FIREBALLS
function updateFireballs(){
    let fireSpeed, playerSpeed, spawnRate;
    if(level < 4){
        fireSpeed = 3 + level*0.05;
        playerSpeed = 6 + level*0.05;
        spawnRate = 0.03 + level*0.003;
    } else if(level === 4){
        fireSpeed = 7;
        playerSpeed = 10;
        spawnRate = 0.12;
    } else {
        fireSpeed = 5 + level*0.1;
        playerSpeed = 8 + level*0.1;
        spawnRate = 0.03 + level*0.003;
    }
    player.speed = playerSpeed;

    for(let i=0;i<fireballs.length;i++){
        fireballs[i].y += fireSpeed;
        fireballs[i].pulse += 0.1;

        // Collision
        if(fireballs[i].x < player.x + player.width &&
           fireballs[i].x + fireballs[i].width > player.x &&
           fireballs[i].y < player.y + player.height &&
           fireballs[i].y + fireballs[i].height > player.y){
               hitSound.play();
               endGame(level);
        }

        // Passed fire
        if(fireballs[i].y > canvas.height){
            avoided++;
            fireballs.splice(i,1);
            i--;
            if(avoided % 10 === 0){
                level++;
                document.getElementById("level").textContent = "Level: "+level;
            }
        }
    }

    if(Math.random() < spawnRate) spawnFireball();
}

// DRAW BACKGROUND
let hueShift = 200;
function drawBackground(){
    const gradient = ctx.createLinearGradient(0,0,0,canvas.height);
    gradient.addColorStop(0, `hsl(${hueShift},60%,10%)`);
    gradient.addColorStop(1, `hsl(${(hueShift+60)%360},70%,20%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    hueShift += 0.1;

    particles.forEach(p=>{
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.y += p.speed;
        if(p.y>canvas.height)p.y=0;
    });
}

// DRAW PLAYER WITH FLASH
function drawPlayer(){
    if(flashTimer>0){
        ctx.fillStyle = "yellow";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "yellow";
        flashTimer--;
    } else {
        ctx.fillStyle = "cyan";
        ctx.shadowBlur = 0;
    }
    ctx.fillRect(player.x,player.y,player.width,player.height);
    ctx.shadowBlur = 0;
}

// DRAW FIREBALLS WITH PULSE
function drawFireballs(){
    fireballs.forEach(f=>{
        const size = f.width + Math.sin(f.pulse)*5;
        ctx.fillStyle = `rgb(255,${Math.floor(Math.random()*150)},0)`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgb(255,${Math.floor(Math.random()*150)},0)`;
        ctx.fillRect(f.x,f.y,size,size);
        ctx.shadowBlur = 0;
    });
}

// END GAME
function endGame(reachedLevel){
    gameOver = true;
    cancelAnimationFrame(animationId);
    finalText.textContent = "You reached level "+reachedLevel;

    if(reachedLevel>maxLevel){
        maxLevel = reachedLevel;
        localStorage.setItem('maxLevel',maxLevel);
        maxLevelText.textContent = "Max Level: "+maxLevel;
    }

    restartBtn.style.display = "inline-block";
}

// RESTART
function restartGame(){
    fireballs = [];
    avoided = 0;
    level = 1;
    player.x = 280;
    player.speed = 6;
    document.getElementById("level").textContent = "Level: "+level;
    finalText.textContent = "";
    restartBtn.style.display = "none";
    gameOver = false;
    gameLoop();
}
restartBtn.addEventListener("click",restartGame);

// GAME LOOP
function gameLoop(){
    if(gameOver) return;
    drawBackground();
    drawPlayer();
    drawFireballs();
    updateFireballs();
    animationId = requestAnimationFrame(gameLoop);
}

gameLoop();
