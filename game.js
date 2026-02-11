const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let gameOver = false;
let level = 1;
let avoided = 0;

const hitSound = document.getElementById("hitSound");
const moveSound = document.getElementById("moveSound");
const finalText = document.getElementById("final");
const restartBtn = document.getElementById("restartBtn");
const levelLabel = document.getElementById("levelLabel");
const maxLevelLabel = document.getElementById("maxLevelLabel");

let maxLevel = 0; // global max

// Player
let player = {
    x: canvas.width/2 - 15,
    y: canvas.height - 60,
    width: 30,
    height: 30,
    speed: 12,
};

let fireballs = [];
let animationId;
//background 
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

let flashTimer = 0;

// Keyboard controls
document.addEventListener("keydown", (e)=>{
    if(gameOver) return;
    if(e.key === "ArrowLeft"){ player.x -= player.speed; flashTimer=5; moveSound.play();}
    if(e.key === "ArrowRight"){ player.x += player.speed; flashTimer=5; moveSound.play();}
    if(player.x<0) player.x=0;
    if(player.x+player.width>canvas.width) player.x = canvas.width - player.width;
});

// Mobile arrow buttons
document.getElementById("leftBtn").addEventListener("touchstart", ()=>{
    if(gameOver) return;
    player.x -= player.speed; if(player.x<0) player.x=0; flashTimer=5; moveSound.play();
});
document.getElementById("rightBtn").addEventListener("touchstart", ()=>{
    if(gameOver) return;
    player.x += player.speed; if(player.x+player.width>canvas.width) player.x=canvas.width - player.width; flashTimer=5; moveSound.play();
});

// Spawn fireball
function spawnFireball(){
    fireballs.push({
        x: Math.random()*(canvas.width-20),
        y: -20,
        width: 20,
        height: 20,
        pulse: 0
    });
}

// Update fireballs
function updateFireballs(){
    let fireSpeed = level<4?3+level*0.006:level===4?7:5+level*0.1;
    let playerSpeed = level<4?6+level*0.006:level===4?10:8+level*0.1;
    let spawnRate = level<4?0.03+level*0.003:level===4?0.12:0.03+level*0.003;
    player.speed = playerSpeed+5;

    for(let i=0;i<fireballs.length;i++){
        fireballs[i].y += fireSpeed;
        fireballs[i].pulse += 0.1;

        if(fireballs[i].x < player.x + player.width &&
           fireballs[i].x + fireballs[i].width > player.x &&
           fireballs[i].y < player.y + player.height &&
           fireballs[i].y + fireballs[i].height > player.y){
               hitSound.play();
               endGame(level);
        }

        if(fireballs[i].y > canvas.height){
            avoided++;
            fireballs.splice(i,1);
            i--;
            if(avoided%10===0){ level++; levelLabel.textContent="Level: "+level; }
        }
    }
    if(Math.random()<spawnRate) spawnFireball();
}

// Background
let hueShift=200;
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
        ctx.fillStyle=p.color;
        ctx.fill();
        p.y += p.speed;
        if(p.y>canvas.height)p.y=0;
    });
}

// Draw player
function drawPlayer(){
    if(flashTimer>0){ ctx.fillStyle="blue"; ctx.shadowBlur=20; ctx.shadowColor="yellow"; flashTimer--; }
    else{ ctx.fillStyle="white"; ctx.shadowBlur=0; }
    ctx.fillRect(player.x,player.y,player.width,player.height);
    ctx.shadowBlur=0;
}

// Draw fireballs
function drawFireballs(){
    fireballs.forEach(f=>{
        const size = f.width + Math.sin(f.pulse)*5;
        ctx.fillStyle = `rgb(255,${Math.floor(Math.random()*150)},0)`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgb(255,${Math.floor(Math.random()*150)},0)`;
        ctx.fillRect(f.x,f.y,size,size);
        ctx.shadowBlur=0;
    });
}

// End game
function endGame(reachedLevel){
    gameOver = true;
    cancelAnimationFrame(animationId);
    finalText.textContent = "You reached level "+reachedLevel;
    if(reachedLevel>maxLevel){
        maxLevel = reachedLevel;
        maxLevelLabel.textContent = "Max Level: "+maxLevel;
        // TODO: update global storage
    }
    restartBtn.style.display="inline-block";
}

// Restart
function restartGame(){
    fireballs=[]; avoided=0; level=1;
    player.x=canvas.width/2 - 15;
    player.speed=6;
    levelLabel.textContent="Level: "+level;
    finalText.textContent="";
    restartBtn.style.display="none";
    gameOver=false;
    gameLoop();
}
restartBtn.addEventListener("click",restartGame);

// Game loop
function gameLoop(){
    if(gameOver) return;
    drawBackground();
    drawPlayer();
    drawFireballs();
    updateFireballs();
    animationId=requestAnimationFrame(gameLoop);
}

gameLoop();
