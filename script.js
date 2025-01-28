const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Canvas sizing
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle class
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 15 + 5;
        this.weight = Math.random() * 1 + 0.5;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = Math.random() * -3 - 2;
        this.life = 1;
        this.decay = 0.015;
    }

    update() {
        this.x += this.vx;
        this.vy += this.weight * 0.1;
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.fillStyle = `hsla(${Math.random() * 360}, 70%, 60%, ${this.life})`;
        
        // Heart shape
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(5, -5, 10, -10, 0, -15);
        ctx.bezierCurveTo(-10, -10, -5, -5, 0, 0);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}

// Particle management
const particles = [];
const mouse = { x: null, y: null };

// Input handlers
canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    createParticles(3);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    createParticles(3);
}, { passive: false });

function createParticles(amount) {
    for (let i = 0; i < amount; i++) {
        particles.push(new Particle(mouse.x + Math.random() * 20 - 10, mouse.y + Math.random() * 20 - 10));
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();

        if (particle.life <= 0 || particle.y > canvas.height + 100) {
            particles.splice(index, 1);
        }
    });

    requestAnimationFrame(animate);
}

animate();