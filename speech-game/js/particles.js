let canvas, ctx, width, height;
let particles = [];
let animId = null;
let isPaused = false;

const NUM_PARTICLES = 50;

export function initParticles() {
    canvas = document.getElementById('particles-canvas');
    ctx = canvas.getContext('2d');
    
    resize();
    createParticles();
    draw();
    
    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function createParticles() {
    particles = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5 + 0.5,
            speedX: (Math.random() - 0.5) * 0.15,
            speedY: (Math.random() - 0.5) * 0.15,
            opacity: Math.random() * 0.4 + 0.15
        });
    }
}

function draw() {
    const theme = document.documentElement.getAttribute('data-theme') || 'game';
    if (theme === 'official' || theme === 'elderly') {
        if (animId) cancelAnimationFrame(animId);
        return;
    }
    
    ctx.clearRect(0, 0, width, height);
    
    for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
        
        p.x += p.speedX;
        p.y += p.speedY;
        
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
    }
    
    // Связи между частицами (оптимизировано)
    for (let i = 0; i < particles.length; i += 2) {
        for (let j = i + 1; j < particles.length; j += 2) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 120) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(124, 58, 237, ${0.04 * (1 - dist / 120)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
    
    animId = requestAnimationFrame(draw);
}

export function pauseParticles() {
    isPaused = true;
    if (animId) cancelAnimationFrame(animId);
}

export function resumeParticles() {
    isPaused = false;
    draw();
}