import * as THREE from "three";

export function initLivingHero(canvas) {
  if (!canvas) return () => {};
  let renderer;
  let frame;
  let resizeHandler;
  let mouseHandler;
  let visibilityHandler;
  const disposables = [];
  const mouse = new THREE.Vector2();
  let visible = true;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 7.4);

    scene.add(new THREE.AmbientLight(0x6fa8ff, 0.8));
    const key = new THREE.PointLight(0x39a9ff, 4.5, 12);
    key.position.set(-3, 2, 4);
    scene.add(key);
    const cyan = new THREE.PointLight(0x29e0ff, 3.2, 10);
    cyan.position.set(3, -1, 2);
    scene.add(cyan);

    const root = new THREE.Group();
    root.position.set(1.05, 0.05, 0);
    scene.add(root);

    // A living "neural bloom": organic core + animated filaments + pulsing cells.
    const coreGeo = new THREE.IcosahedronGeometry(1.08, 4);
    const basePositions = new Float32Array(coreGeo.attributes.position.array);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x1769d1,
      emissive: 0x0b3c91,
      emissiveIntensity: 1.15,
      metalness: 0.2,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0.93,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    root.add(core);
    disposables.push(coreGeo, coreMat);

    const shellGeo = new THREE.IcosahedronGeometry(1.28, 3);
    const shellMat = new THREE.MeshBasicMaterial({ color: 0x55cfff, wireframe: true, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    root.add(shell);
    disposables.push(shellGeo, shellMat);

    const haloGeo = new THREE.TorusGeometry(1.55, 0.012, 8, 180);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x8fc6ff, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = 1.05;
    halo.rotation.z = 0.35;
    root.add(halo);
    disposables.push(haloGeo, haloMat);

    const filaments = [];
    const filamentMat = new THREE.LineBasicMaterial({ color: 0x29e0ff, transparent: true, opacity: 0.58, blending: THREE.AdditiveBlending });
    disposables.push(filamentMat);
    for (let i = 0; i < 13; i++) {
      const points = [];
      const seed = i * 1.71;
      for (let j = 0; j < 34; j++) {
        const t = j / 33;
        const a = seed + t * (3.6 + (i % 3) * 0.65);
        const radius = 0.42 + t * (1.45 + (i % 4) * 0.12);
        const wave = Math.sin(t * 9 + seed) * 0.12 * (1 - t * 0.45);
        points.push(new THREE.Vector3(
          Math.cos(a) * (radius + wave),
          Math.sin(a * 1.17) * radius * 0.72 + Math.cos(a * 2.1) * 0.18,
          Math.sin(a) * (radius + wave)
        ));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, filamentMat);
      root.add(line);
      filaments.push({ line, points, seed });
      disposables.push(geo);
    }

    const cellGeo = new THREE.SphereGeometry(0.055, 12, 12);
    const cellMat = new THREE.MeshBasicMaterial({ color: 0xb6f4ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
    disposables.push(cellGeo, cellMat);
    const cells = [];
    for (let i = 0; i < 26; i++) {
      const cell = new THREE.Mesh(cellGeo, cellMat);
      const angle = (i / 26) * Math.PI * 2;
      const radius = 1.15 + (i % 5) * 0.12;
      cell.userData = { angle, radius, speed: 0.16 + (i % 4) * 0.035, y: (i % 7 - 3) * 0.13 };
      root.add(cell);
      cells.push(cell);
    }

    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 240;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 1.9 + Math.random() * 1.55;
      const a = Math.random() * Math.PI * 2;
      particlePositions[i * 3] = Math.cos(a) * r;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3.6;
      particlePositions[i * 3 + 2] = Math.sin(a) * r;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x8fc6ff, size: 0.018, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    disposables.push(particleGeo, particleMat);

    resizeHandler = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resizeHandler);
    resizeHandler();

    mouseHandler = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", mouseHandler, { passive: true });
    visibilityHandler = () => { visible = !document.hidden; };
    document.addEventListener("visibilitychange", visibilityHandler);

    const clock = new THREE.Clock();
    let rx = 0;
    let ry = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!visible) return;
      const t = clock.getElapsedTime();
      const speed = reduced ? 0.22 : 1;
      const tt = t * speed;
      const breathe = 1 + Math.sin(tt * 1.65) * 0.055;
      const pos = coreGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = basePositions[i * 3];
        const y = basePositions[i * 3 + 1];
        const z = basePositions[i * 3 + 2];
        const len = Math.sqrt(x * x + y * y + z * z) || 1;
        const n = Math.sin(x * 5.7 + tt * 2.1) * 0.025 + Math.cos(y * 7.2 - tt * 1.7) * 0.022;
        const s = (1 + n) * breathe;
        pos.setXYZ(i, (x / len) * len * s, (y / len) * len * s, (z / len) * len * s);
      }
      pos.needsUpdate = true;
      core.rotation.y = tt * 0.26;
      core.rotation.x = Math.sin(tt * 0.35) * 0.12;
      shell.rotation.y = -tt * 0.18;
      shell.rotation.z = tt * 0.12;
      halo.rotation.z = 0.35 + tt * 0.2;
      halo.rotation.x = 1.05 + Math.sin(tt * 0.45) * 0.1;
      root.scale.setScalar(0.94 + Math.sin(tt * 1.65) * 0.025);
      root.rotation.x += ((-mouse.y * 0.16) - root.rotation.x) * 0.025;
      root.rotation.y += ((mouse.x * 0.28) - root.rotation.y) * 0.025;
      particles.rotation.y = tt * 0.025;
      particles.rotation.x = Math.sin(tt * 0.15) * 0.08;
      filaments.forEach(({ line, points, seed }) => {
        for (let j = 0; j < points.length; j++) {
          const p = points[j];
          const q = j / (points.length - 1);
          const wobble = Math.sin(tt * 1.3 + seed + q * 8) * 0.07 * (0.4 + q);
          const a = seed + q * (3.6 + (Math.round(seed) % 3) * 0.65) + Math.sin(tt * 0.5 + seed) * 0.06;
          const r = 0.42 + q * 1.45;
          p.x = Math.cos(a) * (r + wobble);
          p.y = Math.sin(a * 1.17) * r * 0.72 + Math.cos(a * 2.1 + tt) * 0.18;
          p.z = Math.sin(a) * (r + wobble);
        }
        line.geometry.setFromPoints(points);
      });
      cells.forEach((cell, i) => {
        const d = cell.userData;
        const a = d.angle + tt * d.speed;
        const r = d.radius + Math.sin(tt * 1.4 + i) * 0.05;
        cell.position.set(Math.cos(a) * r, d.y + Math.sin(tt * 1.1 + i) * 0.12, Math.sin(a) * r);
        cell.scale.setScalar(0.7 + (Math.sin(tt * 3 + i) + 1) * 0.35);
      });
      renderer.render(scene, camera);
    };
    animate();
  } catch (error) {
    canvas.style.display = "none";
  }

  return () => {
    if (frame) cancelAnimationFrame(frame);
    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    if (mouseHandler) window.removeEventListener("mousemove", mouseHandler);
    if (visibilityHandler) document.removeEventListener("visibilitychange", visibilityHandler);
    disposables.forEach((item) => item?.dispose?.());
    renderer?.dispose?.();
  };
}
