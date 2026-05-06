import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import cloudTextureUrl from '../shader-assets/textures/uniformclouds-1.jpg';

const botRepoUrl = 'https://github.com/psmoxie/MC-Server-Tracking-Discord-Bot';
const githubUrl = 'https://github.com/psmoxie';
const siteRepoUrl = 'https://github.com/psmoxie/psmoxie.github.io';

const projectFacts = [
  { label: 'Language', value: 'Python' },
  { label: 'Library', value: 'discord.py' },
  { label: 'Command', value: '/smpstatus' },
  { label: 'API', value: 'mcsrvstat.us' },
];

const botDetails = [
  'Takes a Discord command and checks the server through the mcsrvstat.us API.',
  'Loads the Discord token from an environment variable instead of storing it in the code.',
  'Sends back a simple Discord embed showing whether the server is online or offline.',
  'Keeps the code small and easy to change as the project grows.',
];

// Tweak these palettes when the background needs a different mood.
const shaderPalettes = {
  light: {
    colors: [
      [1.0, 0.92, 0.98, 1.0],  // soft pink-white glow
      [1.0, 0.34, 0.76, 1.0],  // brighter neon pink
      [0.34, 0.62, 1.0, 1.0],  // clean electric blue
      [0.72, 0.88, 1.0, 1.0],  // soft sky blue
    ],
    altColors: [
      [0.98, 0.95, 1.0, 1.0],  // pale lavender-white
      [0.86, 0.42, 1.0, 1.0],  // soft neon purple
      [0.42, 0.82, 1.0, 1.0],  // bright sky cyan
      [0.94, 0.98, 1.0, 1.0],  // icy white-blue
    ],
    opacity: 0.85,
  },
  dark: {
    colors: [
      [0.03, 0.04, 0.10, 1.0], // deep midnight blue base
      [1.0, 0.18, 0.72, 1.0],  // neon pink
      [0.24, 0.56, 1.0, 1.0],  // electric blue
      [0.52, 0.78, 1.0, 1.0],  // glowing sky blue
    ],
    altColors: [
      [0.10, 0.06, 0.20, 1.0], // violet shadow
      [0.82, 0.22, 1.0, 1.0],  // bright magenta-purple
      [0.16, 0.78, 1.0, 1.0],  // neon cyan-blue
      [0.28, 0.18, 0.42, 1.0], // deep purple surface
    ],
    opacity: 0.85,
  },
};

function useHashRoute() {
  const getRoute = () => window.location.hash.replace('#', '') || '/';
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme() {
  const savedTheme = window.localStorage.getItem('theme');
  return savedTheme || getSystemTheme();
}

// Manual theme choices stick; otherwise the site follows the system preference.
function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemThemeChange = () => {
      if (!window.localStorage.getItem('theme')) {
        setTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', onSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', onSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem('theme', nextTheme);
      return nextTheme;
    });
  };

  return { theme, toggleTheme };
}

function App() {
  const route = useHashRoute();
  const { theme, toggleTheme } = useTheme();

  return (
    <main>
      <ShaderBackground theme={theme} />
      <SiteNav route={route} theme={theme} onToggleTheme={toggleTheme} />
      {route === '/projects' ? <ProjectsPage /> : <HomePage />}
    </main>
  );
}

function ShaderBackground({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const palette = shaderPalettes[theme] || shaderPalettes.light;
    const canvas = canvasRef.current;
    const gl =
      canvas.getContext('webgl', { alpha: true, antialias: false }) ||
      canvas.getContext('experimental-webgl', { alpha: true, antialias: false });

    if (!gl) {
      return undefined;
    }

    const vertexSource = `
      attribute vec2 aPosition;

      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision highp float;

      uniform vec2 uResolution;
      uniform float uTime;
      uniform sampler2D tex;
      uniform vec4 uShaderColor1;
      uniform vec4 uShaderColor2;
      uniform vec4 uShaderColor3;
      uniform vec4 uShaderColor4;
      uniform vec4 uShaderAltColor1;
      uniform vec4 uShaderAltColor2;
      uniform vec4 uShaderAltColor3;
      uniform vec4 uShaderAltColor4;
      uniform float uShaderOpacity;

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        float time = uTime * 0.05;
        vec2 pixelSize = max(uResolution / .5, vec2(1.0));
        vec2 uvPixel = floor(uv * pixelSize) / pixelSize;

        vec3 displace = texture2D(tex, vec2(uvPixel.x, (uvPixel.y + time) * 0.05)).xyz;
        displace *= 0.5;
        displace.x -= 1.0;
        displace.y -= 1.0;
        displace.y *= 0.5;

        vec2 uvTmp = uvPixel;
        uvTmp.y *= 0.2;
        uvTmp.y += time;

        vec4 color = texture2D(tex, uvTmp + displace.xy);
        vec4 noise = floor(color * 10.0) / 5.0;
        // Slowly drift between the two palettes for the active theme.
        float colorShift = 0.5 + 0.5 * sin(uTime * 0.035);
        vec4 color1 = mix(uShaderColor1, uShaderAltColor1, colorShift);
        vec4 color2 = mix(uShaderColor2, uShaderAltColor2, colorShift);
        vec4 color3 = mix(uShaderColor3, uShaderAltColor3, colorShift);
        vec4 color4 = mix(uShaderColor4, uShaderAltColor4, colorShift);
        vec4 dark = mix(color1, color2, uv.y);
        vec4 bright = mix(color3, color4, uv.y);
        color = mix(dark, bright, noise);

        color.rgb -= 0.45 * pow(uvPixel.y, 8.0);
        color.a -= 0.2 * pow(uvPixel.y, 8.0);

        gl_FragColor = vec4(color.rgb, clamp(color.a, 0.0, uShaderOpacity));
      }
    `;

    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);

    if (!vertexShader || !fragmentShader) {
      return undefined;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return undefined;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, 'aPosition');
    const resolutionLocation = gl.getUniformLocation(program, 'uResolution');
    const timeLocation = gl.getUniformLocation(program, 'uTime');
    const textureLocation = gl.getUniformLocation(program, 'tex');
    const shaderColorLocations = [
      gl.getUniformLocation(program, 'uShaderColor1'),
      gl.getUniformLocation(program, 'uShaderColor2'),
      gl.getUniformLocation(program, 'uShaderColor3'),
      gl.getUniformLocation(program, 'uShaderColor4'),
    ];
    const shaderAltColorLocations = [
      gl.getUniformLocation(program, 'uShaderAltColor1'),
      gl.getUniformLocation(program, 'uShaderAltColor2'),
      gl.getUniformLocation(program, 'uShaderAltColor3'),
      gl.getUniformLocation(program, 'uShaderAltColor4'),
    ];
    const shaderOpacityLocation = gl.getUniformLocation(program, 'uShaderOpacity');
    const texture = gl.createTexture();

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([96, 150, 112, 255]),
    );
    gl.uniform1i(textureLocation, 0);
    palette.colors.forEach((color, index) => {
      gl.uniform4fv(shaderColorLocations[index], color);
    });
    palette.altColors.forEach((color, index) => {
      gl.uniform4fv(shaderAltColorLocations[index], color);
    });
    gl.uniform1f(shaderOpacityLocation, palette.opacity);

    let frameId = 0;
    let startTime = performance.now();
    let textureReady = false;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.floor(window.innerWidth * pixelRatio);
      const height = Math.floor(window.innerHeight * pixelRatio);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = (now) => {
      resize();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, (now - startTime) / 1000);

      if (textureReady) {
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      frameId = requestAnimationFrame(render);
    };

    const image = new Image();
    image.src = cloudTextureUrl;
    image.onload = () => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      textureReady = true;
      startTime = performance.now();
    };

    window.addEventListener('resize', resize);
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [theme]);

  return <canvas className="background-shader" ref={canvasRef} aria-hidden="true"></canvas>;
}

function SiteNav({ route, theme, onToggleTheme }) {
  return (
    <header className="site-header">
      <a className="brand" href="#/" aria-label="Harrison Ford-Schultz home">
        <span className="brand-mark">HF</span>
        <span>Harrison Ford-Schultz</span>
      </a>

      <nav className="nav-links" aria-label="Primary navigation">
        <a className={route !== '/projects' ? 'active' : ''} href="#/">
          Home
        </a>
        <a className={route === '/projects' ? 'active' : ''} href="#/projects">
          Projects
        </a>
        <a href={githubUrl} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </nav>
    </header>
  );
}

function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Computer Engineering Student</p>
          <h1>Harrison Ford-Schultz</h1>
          <p className="lede">
            I’m a computer engineering student at Algonquin College. I’m interested in the point
            where software, hardware, and networks meet, especially when those pieces come together
            to make something practical.
          </p>
          <p className="lede secondary-lede">
            I like building projects that make ideas feel real: code that talks to an API, hardware
            that responds to input, or small tools that make a task easier. This site is a place for
            me to keep track of those projects as I keep learning and improving.
          </p>
          <p className="lede secondary-lede">
            The animated background is part of the site too. I wanted the page to feel more like
            something I built, not just a plain portfolio with my name on it.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#/projects">
              View projects
            </a>
            <a className="button secondary" href={githubUrl} target="_blank" rel="noreferrer">
              GitHub profile
            </a>
          </div>
        </div>
      </section>

      <section className="intro-band" aria-label="Work categories">
        <div className="intro-heading">
          <p className="eyebrow">What I Work On</p>
          <h2>Areas I’m building experience in.</h2>
        </div>
        <article>
          <span>01</span>
          <h3>Computer Engineering</h3>
          <p>
            Coursework, labs, and projects involving programming, hardware, networking, and problem
            solving.
          </p>
        </article>
        <article>
          <span>02</span>
          <h3>Small Tools</h3>
          <p>Bots, scripts, and utilities made to solve specific problems or automate simple tasks.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Experiments</h3>
          <p>
            Interfaces, shaders, and technical ideas I wanted to try while learning how they work.
          </p>
        </article>
      </section>
    </>
  );
}

function ProjectsPage() {
  return (
    <>
      <section className="page-title">
        <p className="eyebrow">Projects</p>
        <h1>Things I’ve built and worked on.</h1>
        <p>
          This is a small collection of school work, side projects, and experiments. Right now, it
          starts with a Discord bot I made to check a Minecraft server directly from chat.
        </p>
      </section>

      <section className="project-feature">
        <article className="project-card large">
          <div className="project-kicker">Discord Bot</div>
          <h2>MC Server Tracking Discord Bot</h2>
          <p>
            I made this bot so people in a Discord server could quickly check whether a Minecraft
            server was online without having to leave chat.
          </p>
          <p>
            A user runs <code>/smpstatus</code>, the bot sends a request to the mcsrvstat.us API,
            then returns the server status in Discord. The first version is intentionally simple:
            one command, one server address, and a clear online or offline response.
          </p>
          <p>
            Even though it is a small project, it helped me practice working with Discord commands,
            environment variables, external API requests, and basic error handling in Python.
          </p>
          <div className="project-actions">
            <a className="button primary" href={botRepoUrl} target="_blank" rel="noreferrer">
              View repository
            </a>
          </div>
        </article>

        <aside className="status-preview" aria-label="Discord bot response preview">
          <div className="preview-topline">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="discord-message">
            <p className="command">/smpstatus</p>
            <div className="embed">
              <strong>Server Online</strong>
              <p>IP: 174.115.206.194</p>
              <small>mcsrvstat.us/server/174.115.206.194</small>
            </div>
          </div>
        </aside>
      </section>

      <section className="project-meta">
        {projectFacts.map((fact) => (
          <article key={fact.label}>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
          </article>
        ))}
      </section>

      <section className="detail-grid">
        <div>
          <p className="eyebrow">Notes</p>
          <h2>A small project with real moving parts.</h2>
        </div>
        <div className="detail-list">
          {botDetails.map((detail) => (
            <article key={detail}>
              <span>✓</span>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="project-card portfolio-project">
        <div className="project-kicker">Website</div>
        <h2>This Portfolio Site</h2>
        <p>
          I built this site using React, Vite, CSS, and GitHub Pages. The goal was to make a simple
          portfolio for my projects without making it feel like a generic template.
        </p>
        <p>
          The background uses a WebGL shader adapted from another project. I integrated it into the
          site, adjusted how it fits with the layout, and built the page content around it so it
          feels like part of the design instead of just a background effect.
        </p>
        <p>
          I used AI tools during parts of the website development process, mainly for
          troubleshooting, writing support, and iteration. The final structure, implementation
          choices, and project direction were handled by me.
        </p>
        <div className="project-actions">
          <a className="button primary" href={siteRepoUrl} target="_blank" rel="noreferrer">
            View repository
          </a>
        </div>
      </section>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
