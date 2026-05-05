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
  'Loads the Discord token from an environment variable.',
  'Sends back a simple embed for the online or offline result.',
  'Leaves the code small enough to change without much refactoring.',
];

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

function App() {
  const route = useHashRoute();

  return (
    <main>
      <ShaderBackground />
      <SiteNav route={route} />
      {route === '/projects' ? <ProjectsPage /> : <HomePage />}
    </main>
  );
}

function ShaderBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
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

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        float time = uTime * 0.4;
        vec2 pixelSize = max(uResolution / 4.0, vec2(1.0));
        vec2 uvPixel = floor(uv * pixelSize) / pixelSize;

        vec4 col1 = vec4(0.510, 0.776, 0.486, 1.0);
        vec4 col2 = vec4(0.200, 0.604, 0.318, 1.0);
        vec4 col3 = vec4(0.145, 0.490, 0.278, 1.0);
        vec4 col4 = vec4(0.059, 0.255, 0.251, 1.0);

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
        vec4 dark = mix(col1, col2, uv.y);
        vec4 bright = mix(col3, col4, uv.y);
        color = mix(dark, bright, noise);

        float invUv = 1.0 - uvPixel.y;
        color.rgb -= 0.45 * pow(uvPixel.y, 8.0);
        color.a -= 0.2 * pow(uvPixel.y, 8.0);
        color += pow(invUv, 8.0);
        color.a -= 0.2;

        gl_FragColor = vec4(color.rgb, clamp(color.a, 0.0, 0.72));
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
  }, []);

  return <canvas className="background-shader" ref={canvasRef} aria-hidden="true"></canvas>;
}

function SiteNav({ route }) {
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
      </nav>
    </header>
  );
}

function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Computer engineering student</p>
          <h1>Harrison Ford-Schultz</h1>
          <p className="lede">
            I'm a computer engineering student at Algonquin College, interested in how software,
            hardware, and networks come together to build useful things.
          </p>
          <p className="lede secondary-lede">
            I tend to enjoy projects that turn ideas into something tangible, whether that's code
            interacting with an API, hardware reacting to signals, or small tools that remove
            unnecessary steps from a task. This site is where I keep track of that work as it
            evolves.
          </p>
          <p className="lede secondary-lede">
            The background shader is part of that same idea. I didn't want the site to just be static
            boxes and text. I wanted it to feel like something I built, not just something I wrote
            about.
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

      <section className="intro-band" aria-label="Areas of interest">
        <article>
          <span>01</span>
          <h2>Systems</h2>
          <p>Learning how software behaves close to hardware, networks, and real constraints.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Tools</h2>
          <p>Making small utilities when I notice something could be easier.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Community</h2>
          <p>Making software that fits naturally into places people already use, like Discord.</p>
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
        <h1>Things I have built.</h1>
        <p>
          A small collection of school work, side projects, and experiments. Right now, it starts
          with a Discord bot I made to check a Minecraft server from chat.
        </p>
      </section>

      <section className="project-feature">
        <article className="project-card large">
          <div className="project-kicker">Discord bot</div>
          <h2>MC Server Tracking Discord Bot</h2>
          <p>
            I made this bot so people in a Discord server could quickly check whether a Minecraft
            server was online. A user runs <code>/smpstatus</code>, the bot asks the mcsrvstat.us
            API for the current server state, and then it posts the result back into chat.
          </p>
          <p>
            The first version is deliberately simple: one command, one server address, and a clear
            online or offline response. It also gave me a chance to work with Discord commands,
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
        <h2>This portfolio site</h2>
        <p>
          I built this site using React, Vite, CSS, and GitHub Pages. The goal was to keep it simple
          and focused, without it feeling like a generic template.
        </p>
        <p>
          The background uses a WebGL shader adapted from another project, integrated into the
          layout and adjusted to fit the design.
        </p>
        <p>
          AI tools were used during parts of the website development process, mainly for assistance
          and iteration, but the structure and implementation were handled by me.
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
