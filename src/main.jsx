import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const botRepoUrl = 'https://github.com/psmoxie/MC-Server-Tracking-Discord-Bot';
const githubUrl = 'https://github.com/psmoxie';

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
  'Leaves the code small enough to change without much ceremony.',
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
      <SiteNav route={route} />
      {route === '/projects' ? <ProjectsPage /> : <HomePage />}
    </main>
  );
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
        <div className="shader-stage" aria-label="Shader-ready visual stage">
          <canvas className="shader-canvas" id="home-shader-canvas" aria-hidden="true"></canvas>
          <div className="shader-grid"></div>
          <div className="shader-core">
            <span>shader stage</span>
          </div>
          <div className="shader-orbit orbit-one"></div>
          <div className="shader-orbit orbit-two"></div>
        </div>

        <div className="hero-copy">
          <p className="eyebrow">Computer engineering student</p>
          <h1>Harrison Ford-Schultz</h1>
          <p className="lede">
            I am a computer engineering student at Algonquin College, interested in the space where
            software, hardware, networks, and small useful tools meet.
          </p>
          <p className="lede secondary-lede">
            I am using this site as a place to keep track of what I am building. The visual area on
            this page is ready for a shader experiment later.
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
              <span>OK</span>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
