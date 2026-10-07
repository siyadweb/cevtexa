// Markup ported verbatim from the original static site (see PROJECT_AUDIT.md).
// Kept as a raw HTML string + dangerouslySetInnerHTML for this migration step
// to guarantee pixel-identical output while re-platforming into Next.js.
// A follow-up pass can convert this into idiomatic JSX/components if desired.

export const siteMarkup = `
<div class="cursor-dot" id="cursorDot"></div>
<div class="cursor-ring" id="cursorRing"></div>

<div class="preloader" id="preloader">
  <img src="/logo.webp" alt="">
  <div class="bar"><span></span></div>
</div>

<!-- NAV -->
<header class="nav" id="nav">
  <a class="nav-brand" href="#top">
    <img src="/logo.webp" alt="Cevtexa">
    <span class="wordmark">CEVTEXA</span>
  </a>
  <nav class="nav-right">
    <ul class="nav-links">
      <li><a href="#services">Services</a></li>
      <li><a href="#work">Work</a></li>
      <li><a href="#process">Process</a></li>
      <li><a href="#vision">Vision</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
    <a class="btn btn-primary" href="#contact">Start a project</a>
    <button class="nav-toggle" id="navToggle" aria-label="Open menu">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M4 8h18M4 13h18M4 18h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>
  </nav>
</header>

<div class="nav-overlay" id="navOverlay">
  <div class="nav-overlay-head">
    <div class="mini-brand"><img src="/logo.webp" alt=""><span>CEVTEXA</span></div>
    <button class="nav-close" id="navClose" aria-label="Close menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>
  </div>
  <div class="nav-overlay-links">
    <a href="#services">Services</a>
    <a href="#work">Work</a>
    <a href="#process">Process</a>
    <a href="#vision">Vision</a>
    <a href="#contact">Contact</a>
  </div>
  <div class="nav-overlay-foot">hello@cevtexa.studio — Remote-first, worldwide</div>
</div>

<div id="top"></div>

<!-- HERO -->
<section class="hero" id="hero">
  <div class="hero-glow"><span class="g1"></span><span class="g2"></span></div>
  <canvas id="heroCanvas"></canvas>
  <div class="hero-content">
    <h1>Digital work that thinks ahead of the brief.</h1>
    <p class="lede">Cevtexa designs, builds, and automates the systems modern companies run on — websites, apps, AI, marketing, and the strategy that connects them. One studio, one team, nothing lost in translation.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="#contact">Start a project</a>
      <a class="btn btn-ghost" href="#work">See the work</a>
    </div>
  </div>
  <div class="scroll-cue"><span>SCROLL</span><span class="line"></span></div>
</section>

<!-- MARQUEE 1 -->
<div class="marquee">
  <div class="marquee-track" id="marqueeTrack1"></div>
</div>

<!-- ABOUT -->
<section class="wrap about" id="about">
  <div class="copy reveal">
    <h2>Most agencies hand you a deliverable. We hand you a system.</h2>
    <p>Cevtexa was built on a simple frustration: the web team doesn't talk to the app team, the app team doesn't talk to marketing, and nothing gets automated. We closed that gap — one studio that ships the product, wires in the intelligence behind it, and drives the growth that follows.</p>
  </div>
  <div class="stats reveal">
    <div class="stat"><span class="num" data-target="120" data-suffix="+">0</span><span class="label">Projects shipped</span></div>
    <div class="stat"><span class="num" data-target="40" data-suffix="+">0</span><span class="label">Clients worldwide</span></div>
    <div class="stat"><span class="num" data-target="6" data-suffix="">0</span><span class="label">Disciplines under one roof</span></div>
    <div class="stat"><span class="num" data-target="98" data-suffix="%">0</span><span class="label">Client retention</span></div>
  </div>
</section>

<!-- PILLARS / SERVICES -->
<section class="wrap pillars" id="services">
  <div class="head reveal">
    <h2>Three ways we move the needle</h2>
    <p>Six disciplines, organized around what they actually accomplish — not how they're built.</p>
  </div>
  <div class="pillars-grid">
    <div class="pillar build reveal" style="--i:0">
      <h3>Build</h3>
      <p class="desc">Product engineering for the web and for the pocket. We design and ship software fast, and we keep it running.</p>
      <ul class="pillar-list">
        <li><span class="svc-name">Web Development</span><span class="svc-desc">Marketing sites, e-commerce, dashboards, custom web apps.</span></li>
        <li><span class="svc-name">App Development</span><span class="svc-desc">iOS, Android, and cross-platform apps that feel native.</span></li>
      </ul>
    </div>
    <div class="pillar automate reveal" style="--i:1">
      <h3>Automate</h3>
      <p class="desc">We wire AI into the parts of your business that shouldn't need a human every time.</p>
      <ul class="pillar-list">
        <li><span class="svc-name">AI Automation</span><span class="svc-desc">Custom agents, internal tools, chat &amp; voice interfaces, workflow automation.</span></li>
      </ul>
    </div>
    <div class="pillar grow reveal" style="--i:2">
      <h3>Grow</h3>
      <p class="desc">Traffic and attention only matter if they turn into revenue. We build the funnel and run the numbers.</p>
      <ul class="pillar-list">
        <li><span class="svc-name">Digital Marketing</span><span class="svc-desc">SEO, paid acquisition, content, email.</span></li>
        <li><span class="svc-name">Business Development</span><span class="svc-desc">Positioning, partnerships, sales enablement.</span></li>
      </ul>
    </div>
  </div>
</section>

<!-- PROCESS -->
<section class="wrap process" id="process">
  <div class="head reveal">
    <h2>How a project actually moves</h2>
    <p>The same five stages, every time — so you always know what's happening and what's next.</p>
  </div>
  <div class="process-list">
    <div class="process-step reveal" style="--i:0"><div class="n">01</div><h4>Discover</h4><p>We map the problem, the users, and the numbers that matter before a single pixel exists.</p></div>
    <div class="process-step reveal" style="--i:1"><div class="n">02</div><h4>Design</h4><p>Interfaces and system architecture, decided together — nothing built twice.</p></div>
    <div class="process-step reveal" style="--i:2"><div class="n">03</div><h4>Build</h4><p>Engineering and AI development in parallel, in short cycles, with something to see every week.</p></div>
    <div class="process-step reveal" style="--i:3"><div class="n">04</div><h4>Launch</h4><p>Deployed, monitored, and handed off with documentation a real person can read.</p></div>
    <div class="process-step reveal" style="--i:4"><div class="n">05</div><h4>Grow</h4><p>Marketing and automation keep compounding after launch — we don't disappear at go-live.</p></div>
  </div>
</section>

<!-- WORK -->
<section class="wrap work" id="work">
  <div class="work-head">
    <div class="head reveal">
      <h2>Selected work</h2>
      <p>A mix of shipped client work and in-house concepts. Case studies available on request.</p>
    </div>
  </div>
  <div class="work-grid">

    <a class="work-card reveal" href="#contact" style="--i:0">
      <div class="mock phone">
        <div class="mock-notch"></div>
        <div class="mock-screen" style="background:#fff3ec;">
          <div class="mrow" style="justify-content:space-between;margin-bottom:.9rem;">
            <div class="mrow" style="gap:.35rem;"><div class="mchip" style="width:20px;height:20px;background:#ff5a36;"></div><div class="mline" style="width:38px;height:8px;background:#2b2118;"></div></div>
            <div class="mline" style="width:26px;height:8px;background:#c9beb4;"></div>
          </div>
          <div class="mpill" style="height:26px;background:#ffffff;border:1px solid #f0ded4;margin-bottom:1rem;"></div>
          <div class="mrow" style="justify-content:space-between;margin-bottom:1rem;">
            <div style="text-align:center;"><div class="mchip" style="width:32px;height:32px;background:#ff5a36;margin:0 auto .3rem;"></div><div class="mline" style="width:22px;height:5px;background:#d8c8bd;margin:0 auto;"></div></div>
            <div style="text-align:center;"><div class="mchip" style="width:32px;height:32px;background:#ffb84d;margin:0 auto .3rem;"></div><div class="mline" style="width:22px;height:5px;background:#d8c8bd;margin:0 auto;"></div></div>
            <div style="text-align:center;"><div class="mchip" style="width:32px;height:32px;background:#3fae6b;margin:0 auto .3rem;"></div><div class="mline" style="width:22px;height:5px;background:#d8c8bd;margin:0 auto;"></div></div>
            <div style="text-align:center;"><div class="mchip" style="width:32px;height:32px;background:#5a9bd4;margin:0 auto .3rem;"></div><div class="mline" style="width:22px;height:5px;background:#d8c8bd;margin:0 auto;"></div></div>
          </div>
          <div class="mblock" style="height:56px;background:#ffe4d6;margin-bottom:.5rem;position:relative;">
            <div class="mpill" style="position:absolute;top:6px;right:6px;width:34px;height:14px;background:#ff5a36;"></div>
          </div>
          <div class="mline" style="width:70%;height:7px;background:#2b2118;margin-bottom:.3rem;"></div>
          <div class="mline" style="width:40%;height:6px;background:#c9beb4;margin-bottom:.8rem;"></div>
          <div class="mblock" style="height:56px;background:#ffe4d6;"></div>
        </div>
      </div>
      <p class="cat">Food Delivery App</p><h4>Zitoo</h4><p class="result">Ordering flow rebuilt end-to-end — browse, cart, and live tracking in one clean app.</p>
    </a>

    <a class="work-card reveal" href="https://seras.in" target="_blank" rel="noopener" style="--i:1">
      <div class="mock browser">
        <div class="mock-bar"><span class="bdot r"></span><span class="bdot y"></span><span class="bdot g"></span><span class="mock-url">seras.in</span></div>
        <div class="mock-screen" style="background:#fbf3ef;">
          <div class="mrow" style="justify-content:space-between;margin-bottom:1rem;">
            <div class="mrow" style="gap:.4rem;"><div class="mchip" style="width:18px;height:18px;background:#d98e8a;"></div><div class="mline" style="width:44px;height:7px;background:#4a3b36;"></div></div>
            <div class="mrow" style="gap:.5rem;"><div class="mline" style="width:26px;height:6px;background:#cbb6ae;"></div><div class="mline" style="width:26px;height:6px;background:#cbb6ae;"></div><div class="mline" style="width:26px;height:6px;background:#cbb6ae;"></div><div class="mchip" style="width:14px;height:14px;background:#d98e8a;"></div></div>
          </div>
          <div class="mline" style="width:60%;height:12px;background:#4a3b36;margin-bottom:.5rem;"></div>
          <div class="mline" style="width:40%;height:7px;background:#a98d84;margin-bottom:1rem;"></div>
          <div class="mpill" style="width:96px;height:24px;background:#d98e8a;margin-bottom:1.2rem;"></div>
          <div class="mrow" style="gap:.7rem;">
            <div style="flex:1;"><div class="mblock" style="height:44px;background:#f0d9d3;margin-bottom:.4rem;"></div><div class="mline" style="width:70%;height:6px;background:#8a7269;margin-bottom:.25rem;"></div><div class="mline" style="width:40%;height:6px;background:#cfa06a;"></div></div>
            <div style="flex:1;"><div class="mblock" style="height:44px;background:#f0d9d3;margin-bottom:.4rem;"></div><div class="mline" style="width:70%;height:6px;background:#8a7269;margin-bottom:.25rem;"></div><div class="mline" style="width:40%;height:6px;background:#cfa06a;"></div></div>
            <div style="flex:1;"><div class="mblock" style="height:44px;background:#f0d9d3;margin-bottom:.4rem;"></div><div class="mline" style="width:70%;height:6px;background:#8a7269;margin-bottom:.25rem;"></div><div class="mline" style="width:40%;height:6px;background:#cfa06a;"></div></div>
          </div>
        </div>
      </div>
      <p class="cat">Beauty &amp; Wellness · seras.in</p><h4>Seras</h4><p class="result">Full storefront build for a natural beauty and wellness brand — catalog, cart, and checkout.</p>
    </a>

    <a class="work-card reveal" href="#contact" style="--i:2">
      <div class="mock phone">
        <div class="mock-notch"></div>
        <div class="mock-screen" style="background:#0e2233;">
          <div class="mrow" style="justify-content:space-between;margin-bottom:1rem;">
            <div class="mline" style="width:50px;height:9px;background:#e8f2f0;"></div>
            <div class="mchip" style="width:18px;height:18px;background:#e8c07d;"></div>
          </div>
          <div class="mblock" style="height:64px;background:#123f4a;border:1px solid #1c5560;margin-bottom:.7rem;position:relative;">
            <div class="mline" style="width:50%;height:6px;background:#9fd2cf;position:absolute;left:10px;top:10px;"></div>
            <div class="mline" style="width:30%;height:6px;background:#9fd2cf;position:absolute;left:10px;top:24px;"></div>
            <div class="mpill" style="width:44px;height:16px;background:#e8c07d;position:absolute;right:10px;bottom:10px;"></div>
          </div>
          <div class="mrow" style="gap:.6rem;">
            <div class="mblock" style="width:70px;height:78px;background:#123f4a;"></div>
            <div class="mblock" style="width:70px;height:78px;background:#0f3038;"></div>
          </div>
        </div>
      </div>
      <p class="cat">Travel App · Concept</p><h4>Voyage</h4><p class="result">Destination discovery and itinerary booking, designed as one continuous flow.</p>
    </a>

    <a class="work-card reveal" href="#contact" style="--i:3">
      <div class="mock browser">
        <div class="mock-bar"><span class="bdot r"></span><span class="bdot y"></span><span class="bdot g"></span><span class="mock-url">app.ledger.io</span></div>
        <div class="mock-screen" style="background:#0b1220;display:flex;gap:.8rem;">
          <div style="width:22px;display:flex;flex-direction:column;gap:.5rem;padding-top:.2rem;">
            <div class="mchip" style="width:13px;height:13px;background:#22d3a6;"></div>
            <div class="mchip" style="width:13px;height:13px;background:#2a3550;"></div>
            <div class="mchip" style="width:13px;height:13px;background:#2a3550;"></div>
          </div>
          <div style="flex:1;">
            <div class="mrow" style="gap:.5rem;margin-bottom:.7rem;">
              <div class="mblock" style="flex:1;height:36px;background:#141c2e;"></div>
              <div class="mblock" style="flex:1;height:36px;background:#141c2e;"></div>
              <div class="mblock" style="flex:1;height:36px;background:#141c2e;"></div>
            </div>
            <div class="mrow" style="align-items:flex-end;gap:.3rem;height:60px;">
              <div class="mblock" style="width:10%;height:40%;background:#22d3a6;"></div>
              <div class="mblock" style="width:10%;height:65%;background:#22d3a6;"></div>
              <div class="mblock" style="width:10%;height:30%;background:#1c6f5c;"></div>
              <div class="mblock" style="width:10%;height:80%;background:#22d3a6;"></div>
              <div class="mblock" style="width:10%;height:50%;background:#1c6f5c;"></div>
              <div class="mblock" style="width:10%;height:70%;background:#22d3a6;"></div>
              <div class="mblock" style="width:10%;height:45%;background:#1c6f5c;"></div>
            </div>
          </div>
        </div>
      </div>
      <p class="cat">Analytics Dashboard · Concept</p><h4>Ledger</h4><p class="result">Real-time financial reporting, built for teams who live in their dashboard.</p>
    </a>

  </div>
</section>

<!-- VISION -->
<section class="wrap vision" id="vision">
  <div class="head reveal">
    <h2>What we're building next</h2>
    <p>Cevtexa isn't just an agency — we build our own products too. Here's what's in the lab.</p>
  </div>
  <div class="timeline">
    <div class="timeline-item reveal" style="--i:0"><div class="when">Q4 2026</div><div><h4>Cevtexa OS</h4><p>A unified client dashboard where every project, automation, and metric lives in one place.</p></div></div>
    <div class="timeline-item reveal" style="--i:1"><div class="when">Q1 2027</div><div><h4>Autopilot Storefronts</h4><p>Fully autonomous AI-run e-commerce operations — pricing, restocking, and support without a team.</p></div></div>
    <div class="timeline-item reveal" style="--i:2"><div class="when">Q2 2027</div><div><h4>NeuroBrand</h4><p>A generative identity engine that designs and tests full brand systems in hours, not weeks.</p></div></div>
  </div>
</section>

<!-- TECH MARQUEE -->
<div class="marquee alt">
  <div class="marquee-track" id="marqueeTrack2"></div>
</div>

<!-- CONTACT -->
<section class="wrap contact" id="contact">
  <div class="contact-panel reveal">
    <div class="contact-info">
      <h2>Let's build something that thinks ahead.</h2>
      <p>Tell us what you're working on. We reply within one business day.</p>
      <div class="contact-meta">
        <a href="mailto:hello@cevtexa.studio">hello@cevtexa.studio</a>
        <span class="muted">Remote-first, worldwide</span>
      </div>
      <div class="social-row">
        <a href="#" aria-label="LinkedIn">in</a>
        <a href="#" aria-label="X">X</a>
        <a href="#" aria-label="Instagram">ig</a>
        <a href="#" aria-label="GitHub">gh</a>
      </div>
    </div>
    <form class="contact-form" id="contactForm">
      <div class="field"><label for="cf-name">Name</label><input id="cf-name" name="name" type="text" required></div>
      <div class="field"><label for="cf-email">Email</label><input id="cf-email" name="email" type="email" required></div>
      <div class="field"><label for="cf-type">Project type</label>
        <select id="cf-type" name="type">
          <option>Web Development</option>
          <option>App Development</option>
          <option>AI Automation</option>
          <option>Digital Marketing</option>
          <option>Business Development</option>
          <option>Not sure yet</option>
        </select>
      </div>
      <div class="field"><label for="cf-msg">Message</label><textarea id="cf-msg" name="message" required></textarea></div>
      <button class="btn btn-primary" type="submit" style="justify-content:center;">Send the brief</button>
      <p class="form-note">This opens your email app — nothing is stored or sent automatically.</p>
    </form>
  </div>
</section>

<!-- FOOTER -->
<footer class="wrap footer">
  <div class="footer-top">
    <div class="footer-brand">
      <div class="mark"><img src="/logo.webp" alt=""><span class="wordmark">CEVTEXA</span></div>
      <p>Beyond Intelligence. A single studio for web, app, AI, and growth.</p>
    </div>
    <div class="footer-cols">
      <div class="footer-col">
        <h5>Studio</h5>
        <a href="#services">Services</a>
        <a href="#work">Work</a>
        <a href="#process">Process</a>
        <a href="#vision">Vision</a>
      </div>
      <div class="footer-col">
        <h5>Contact</h5>
        <a href="mailto:hello@cevtexa.studio">hello@cevtexa.studio</a>
        <span style="display:block;color:var(--mist);font-size:.9rem;">Remote-first, worldwide</span>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Cevtexa. All rights reserved.</span>
    <span>Beyond Intelligence.</span>
  </div>
</footer>
`;
