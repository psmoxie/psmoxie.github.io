const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const splashScreen = document.getElementById('splashScreen');
const ticketScreen = document.getElementById('ticketScreen');
const yesButton = document.getElementById('yesButton');
const noButton = document.getElementById('noButton');

// Canvas setup
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle system
const particles = [];
const mouse = { x: null, y: null };

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 15 + 10; // 10-25px
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
        ctx.fillStyle = `hsla(350, 100%, 60%, ${this.life})`; // Solid red
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(5, -5, 10, -10, 0, -15);
        ctx.bezierCurveTo(-10, -10, -5, -5, 0, 0);
        ctx.fill();
        ctx.restore();
    }
}

class CelebrationParticle extends Particle {
    constructor(x, y, vx, vy) {
        super(x, y);
        this.vx = vx;
        this.vy = vy;
        this.size = Math.random() * 20 + 20; // 20-40px
        this.weight = Math.random() * 0.5 + 1.0;
        this.decay = 0.004;
        this.spin = (Math.random() - 0.5) * 0.05;
        this.rotation = 0;
    }

    update() {
        this.rotation += this.spin;
        this.vy += this.weight * 0.1;
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.fillStyle = `hsla(350, 100%, 60%, ${this.life})`; // Solid red
        ctx.moveTo(70, 40);
        ctx.bezierCurveTo(45, 0, 0, 60, 70, 95);
        ctx.bezierCurveTo(140, 60, 95, 0, 70, 40);
        ctx.fill();
        ctx.restore();
    }
}

function createCelebration() {
    const screenBottom = canvas.height;
    for (let i = 0; i < 30; i++) { // Reduced to 20 hearts
        particles.push(new CelebrationParticle(
            Math.random() * canvas.width, // Random X at bottom
            screenBottom + 50, // Start below screen
            (Math.random() - 0.5) * 4, // Horizontal spread
            (Math.random() * - 10) - 10 // Upward motion
        ));
    }
}

function createParticles(amount) {
    for (let i = 0; i < amount; i++) {
        particles.push(new Particle(
            mouse.x + Math.random() * 20 - 10,
            mouse.y + Math.random() * 20 - 10
        ));
    }
}

// Event listeners
canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    //createParticles(3);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    //createParticles(3);
}, { passive: false });

noButton.addEventListener('mouseover', function() {
    const container = splashScreen.getBoundingClientRect();
    const btnRect = this.getBoundingClientRect();
    const maxX = container.width - btnRect.width - 20;
    const maxY = container.height - btnRect.height - 20;
    const newX = Math.random() * maxX + 10;
    const newY = Math.random() * maxY + 10;
    this.style.transform = `translate(${newX - (container.width/2 - btnRect.width/2)}px, 
                                     ${newY - (container.height/2 - btnRect.height/2)}px)`;
});

yesButton.addEventListener('click', () => {
    splashScreen.style.opacity = '0';
    setTimeout(() => {
        splashScreen.style.display = 'none';
        canvas.style.display = 'block';
        ticketScreen.style.display = 'block';
        createCelebration();
    }, 500);
});

// Animation loop
function animate() {
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

function hideTicket(){
    ticketScreen.style.display = 'none';
}
animate();