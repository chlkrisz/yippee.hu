const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const tip = document.getElementById('tip');
const tipTimer = setTimeout(() => {
    tip.style.display = 'block';
}, 2000);

const sidebar = document.querySelector('.sidebar');

const creatureImg = new Image();
creatureImg.src = 'static/creature_variants/default.png';

let creature = {
    x: canvas.width / 2 - creatureImg.naturalWidth / 2 / 5,
    y: canvas.height / 2 - creatureImg.naturalHeight / 2 / 5,
    width: creatureImg.naturalWidth / 5,
    height: creatureImg.naturalHeight / 5
};

const particles = [];
const colors = ['#ff0', '#f00', '#0f0', '#00f', '#ff00ff', '#00ffff'];
let variant = 'default';

document.getElementById('variants').addEventListener('change', e => {
    variant = e.target.value;
    switch (variant) {
        case 'default':
            creatureImg.src = 'static/creature_variants/default.png';
            break;
        case 'troll':
            creatureImg.src = 'static/creature_variants/troll.png';
            break;
        case 'mario':
            creatureImg.src = 'static/creature_variants/mario.png';
            break;
        case 'scream':
            creatureImg.src = 'static/creature_variants/augh.png';
            break;
        case 'louis':
            creatureImg.src = 'static/creature_variants/louis.png';
            break;
        default:
            creatureImg.src = 'static/creature_variants/default.png';
    }
    creatureImg.onload = () => {
        creature.width = creatureImg.naturalWidth / 5;
        creature.height = creatureImg.naturalHeight / 5;
        creature.x = canvas.width / 2 - creature.width / 2;
        creature.y = canvas.height / 2 - creature.height / 2;
    };
});

let firstClick = true;

canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
        x >= creature.x &&
        x <= creature.x + creature.width &&
        y >= creature.y &&
        y <= creature.y + creature.height
    ) {
        clearTimeout(tipTimer);
        tip.style.display = 'none';
        tip.style.animation = 'none';
        if (firstClick) {
            sidebar.style.display = 'flex';
            firstClick = !firstClick;
        }
        //confetti xd
        for (let i = 0; i < 500; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: Math.random() * -8 - 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: 1
            });
        }

        const creatureSound = new Audio();
        creatureSound.src = 'static/creature_sounds/' + variant + '.mp3';
        creatureSound.volume = 0.3;
        creatureSound.play().catch(err => {
            console.error('Error playing sound:', err);
        });
    }
});

document.getElementById('hide').addEventListener('click', () => {
    sidebar.style.animationName = "slideout";
    sidebar.style.animationDuration = "0.5s";
    sidebar.style.animationFillMode = "forwards";
    setTimeout(() => {
        sidebar.style.display = 'none';
        document.getElementById('show').style.display = 'block';
    }, 500);
});

document.getElementById('show').addEventListener('click', () => {
    sidebar.style.display = 'flex';
    sidebar.style.animationName = "slidein";
    sidebar.style.animationDuration = "0.5s";
    sidebar.style.animationFillMode = "forwards";
    document.getElementById('show').style.display = 'none';
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(creatureImg, creature.x, creature.y, creature.width, creature.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= 0.98;
        p.vy += 0.3;
        p.x += p.vx + Math.random() * 2 - 1;
        p.y += p.vy;
        p.opacity -= 0.005;

        if (p.opacity <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 5, 5);
        ctx.globalAlpha = 1;
    }

    requestAnimationFrame(draw);
}

draw();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    creature.x = canvas.width / 2 - 100;
    creature.y = canvas.height / 2 - 100;
});