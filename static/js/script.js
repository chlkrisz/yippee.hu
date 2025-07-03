const assets = {
    images: [
        {
            "default": "static/creature_variants/default.png",
        },
        {
            "troll": "static/creature_variants/troll.png",
        },
        {
            "mario": "static/creature_variants/mario.png",
        },
        {
            "scream": "static/creature_variants/augh.png",
        },
        {
            "louis": "static/creature_variants/louis.png",
        }
    ],
    sounds: [
        {
            "default": "static/creature_sounds/default.mp3",
        },
        {
            "troll": "static/creature_sounds/troll.mp3",
        },
        {
            "mario": "static/creature_sounds/mario.mp3",
        },
        {
            "scream": "static/creature_sounds/scream.mp3",
        },
        {
            "louis": "static/creature_sounds/louis.mp3",
        }
    ]
};

const loadedImages = {};
const loadedSounds = {};

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const updateProgressBar = (progress) => {
    progressBar.style.width = `${progress}%`;
    progressBar.style.setProperty('--progress-text', `'${Math.round(progress)}%'`);
};

const loadAssets = (assets, type, startProgress, endProgress) => {
    return new Promise((resolve, reject) => {
        let loadedCount = 0;
        const totalCount = assets.length;
        const progressRange = endProgress - startProgress;
        
        assets.forEach(asset => {
            const key = Object.keys(asset)[0];
            const src = asset[key];
            if (type === 'image') {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    loadedImages[key] = img;
                    loadedCount++;
                    const currentProgress = startProgress + (loadedCount / totalCount) * progressRange;
                    updateProgressBar(currentProgress);
                    if (loadedCount === totalCount) {
                        resolve(loadedImages);
                    }
                };
                img.onerror = () => {
                    reject(new Error(`Failed to load image: ${src}`));
                };
            } else if (type === 'sound') {
                const audio = new Audio();
                
                const onAudioLoaded = () => {
                    loadedSounds[key] = audio;
                    loadedCount++;
                    const currentProgress = startProgress + (loadedCount / totalCount) * progressRange;
                    updateProgressBar(currentProgress);
                    if (loadedCount === totalCount) {
                        resolve(loadedSounds);
                    }
                };
                
                // proba cseresznye
                audio.addEventListener('canplaythrough', onAudioLoaded, { once: true });
                audio.addEventListener('loadeddata', onAudioLoaded, { once: true });
                audio.addEventListener('canplay', onAudioLoaded, { once: true });
                
                const timeoutId = setTimeout(() => {
                    console.warn(`Audio loading timeout for ${src}, proceeding anyway`);
                    onAudioLoaded();
                }, 3000);
                
                audio.addEventListener('error', () => {
                    clearTimeout(timeoutId);
                    console.warn(`Failed to load sound: ${src}, proceeding anyway`);
                    onAudioLoaded();
                });
                
                audio.preload = 'metadata';
                audio.src = src;
            }
        });
    });
};

const progressBar = document.querySelector('.progress-bar');
const loadingScreen = document.querySelector('.loading-screen');

updateProgressBar(0);

const imageEndProgress = isMobile ? 70 : 50;
const soundStartProgress = isMobile ? 70 : 50;

loadAssets(assets.images, 'image', 0, imageEndProgress)
    .then(() => {
        console.log('Images loaded successfully');
        if (isMobile) {
            return Promise.race([
                loadAssets(assets.sounds, 'sound', soundStartProgress, 100),
                new Promise(resolve => {
                    setTimeout(() => {
                        console.log('Sound loading timed out on mobile, proceeding anyway');
                        updateProgressBar(100);
                        resolve();
                    }, 2000);
                })
            ]);
        } else {
            return loadAssets(assets.sounds, 'sound', soundStartProgress, 100);
        }
    })
    .then(() => {
        console.log('All assets loaded successfully');
        initializeCreature();
        setTimeout(() => {
            loadingScreen.classList.add('fadeout');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }, 100);
    })
    .catch(error => {
        console.error('Error loading assets:', error);
        console.log('Proceeding despite loading errors');
        updateProgressBar(100);
        initializeCreature();
        setTimeout(() => {
            loadingScreen.classList.add('fadeout');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }, 100);
    });

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

let creature = {
    x: 0,
    y: 0,
    width: 200,
    height: 200
};

const initializeCreature = () => {
    if (loadedImages['default']) {
        creatureImg.src = loadedImages['default'].src;
        creatureImg.onload = () => {
            creature.width = creatureImg.naturalWidth / 5;
            creature.height = creatureImg.naturalHeight / 5;
            creature.x = canvas.width / 2 - creature.width / 2;
            creature.y = canvas.height / 2 - creature.height / 2;
        };
    }
};

const particles = [];
const colors = ['#ff0', '#f00', '#0f0', '#00f', '#ff00ff', '#00ffff'];
let variant = 'default';

document.getElementById('variants').addEventListener('change', e => {
    variant = e.target.value;
    
    if (loadedImages[variant]) {
        creatureImg.src = loadedImages[variant].src;
        creatureImg.onload = () => {
            creature.width = creatureImg.naturalWidth / 5;
            creature.height = creatureImg.naturalHeight / 5;
            creature.x = canvas.width / 2 - creature.width / 2;
            creature.y = canvas.height / 2 - creature.height / 2;
        };
    } else {
        creatureImg.src = loadedImages['default'].src;
        creatureImg.onload = () => {
            creature.width = creatureImg.naturalWidth / 5;
            creature.height = creatureImg.naturalHeight / 5;
            creature.x = canvas.width / 2 - creature.width / 2;
            creature.y = canvas.height / 2 - creature.height / 2;
        };
    }
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

        if (loadedSounds[variant]) {
            const creatureSound = loadedSounds[variant].cloneNode();
            creatureSound.volume = 0.3;
            creatureSound.play().catch(err => {
                console.error('Error playing sound:', err);
            });
        } else if (isMobile) {
            try {
                const creatureSound = new Audio();
                creatureSound.src = `static/creature_sounds/${variant}.mp3`;
                creatureSound.volume = 0.3;
                creatureSound.play().catch(err => {
                    console.error('Error playing dynamic sound:', err);
                });
            } catch (err) {
                console.error('Error creating dynamic sound:', err);
            }
        }
    }
});

document.getElementById('hide').addEventListener('click', () => {
    sidebar.style.animationName = "slideout";
    sidebar.style.animationDuration = "0.5s";
    sidebar.style.animationFillMode = "forwards";
    setTimeout(() => {
        sidebar.style.display = 'none';
        document.getElementById('show').style.display = 'flex';
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