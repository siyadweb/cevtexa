import * as THREE from 'three';

// Ported (not rewritten) from the original static site's Three.js hero.
// Same geometry, materials, lighting, and intro animation — the only functional
// change is using the real npm package instead of a CDN <script> global, and
// returning a cleanup function so the WebGL context is properly released.

export function initHeroScene(canvas) {
  if (!canvas) return function () {};

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animId = null;
  var resizeHandler = null;
  var mouseHandler = null;
  var visHandler = null;
  var renderer = null;
  var disposables = [];

  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.physicallyCorrectLights = true;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6.6);

    var isMobile = window.innerWidth < 760;
    var useTransmission = !isMobile;
    var rig = new THREE.Group();
    scene.add(rig);

    /* procedural studio environment (no external images) so the glass/metal
       has real reflections and highlights to catch, instead of flat unlit color */
    try {
      var pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      var envCanvas = document.createElement('canvas');
      envCanvas.width = 512; envCanvas.height = 256;
      var ectx = envCanvas.getContext('2d');
      var skyGrad = ectx.createLinearGradient(0, 0, 0, 256);
      skyGrad.addColorStop(0, '#20304d');
      skyGrad.addColorStop(0.5, '#0a0f1c');
      skyGrad.addColorStop(1, '#140f09');
      ectx.fillStyle = skyGrad;
      ectx.fillRect(0, 0, 512, 256);
      (function () {
        function envBlob(x, y, r, color, alpha) {
          var g = ectx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, color);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ectx.globalAlpha = alpha;
          ectx.fillStyle = g;
          ectx.beginPath(); ectx.arc(x, y, r, 0, Math.PI * 2); ectx.fill();
          ectx.globalAlpha = 1;
        }
        envBlob(130, 64, 130, '#bfe0ff', 0.95);
        envBlob(390, 180, 150, '#ffd9a0', 0.85);
        envBlob(256, 30, 90, '#ffffff', 0.55);
        envBlob(60, 210, 100, '#ffb15c', 0.4);
      })();
      var envTex = new THREE.CanvasTexture(envCanvas);
      envTex.mapping = THREE.EquirectangularReflectionMapping;
      var envRT = pmrem.fromEquirectangular(envTex);
      scene.environment = envRT.texture;
      envTex.dispose();
      pmrem.dispose();
    } catch (envErr) { /* no env map — materials still render, just without reflections */ }

    /* lighting rig — cool key from one side, warm rim from the other, matching the brand */
    scene.add(new THREE.HemisphereLight(0x8fc6ff, 0x1a0f08, 0.5));
    var keyLight = new THREE.PointLight(0x8fc6ff, 3.2, 14, 2);
    keyLight.position.set(-3, 2.2, 3.2);
    scene.add(keyLight);
    var rimLight = new THREE.PointLight(0xb6f4ff, 2.8, 14, 2);
    rimLight.position.set(3, -1.6, -2.2);
    scene.add(rimLight);
    var fillLight = new THREE.PointLight(0xffffff, 0.9, 12, 2);
    fillLight.position.set(0, 0.5, 5);
    scene.add(fillLight);

    function makeGlassMaterial(color, opts) {
      var params = {
        color: color,
        metalness: opts.metalness,
        roughness: opts.roughness,
        clearcoat: 1,
        clearcoatRoughness: opts.clearcoatRoughness,
        envMapIntensity: opts.envMapIntensity,
        side: THREE.DoubleSide
      };
      if (useTransmission) {
        params.transmission = opts.transmission;
        params.thickness = opts.thickness;
        params.ior = opts.ior;
      } else {
        params.transparent = true;
        params.opacity = 0.82;
      }
      return new THREE.MeshPhysicalMaterial(params);
    }

    function colorGradientY(geo, colorTop, colorBottom) {
      var pos = geo.attributes.position;
      var minY = Infinity, maxY = -Infinity;
      for (var i = 0; i < pos.count; i++) { var y = pos.getY(i); if (y < minY) minY = y; if (y > maxY) maxY = y; }
      var ct = new THREE.Color(colorTop), cb = new THREE.Color(colorBottom);
      var colors = new Float32Array(pos.count * 3);
      for (var j = 0; j < pos.count; j++) {
        var t = (pos.getY(j) - minY) / (maxY - minY || 1);
        var c = new THREE.Color().lerpColors(cb, ct, t);
        colors[j * 3] = c.r; colors[j * 3 + 1] = c.g; colors[j * 3 + 2] = c.b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    var beamGeo = new THREE.CylinderGeometry(0.012, 0.012, 4.3, 8, 1, true);
    colorGradientY(beamGeo, 0x8fc6ff, 0xb6f4ff);
    var beamMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
    var beam = new THREE.Mesh(beamGeo, beamMat);
    rig.add(beam);
    disposables.push(beamGeo, beamMat);

    var coreGeo = new THREE.IcosahedronGeometry(0.42, 2);
    var coreMat = makeGlassMaterial(0x3d6fb5, { metalness: 0.1, roughness: 0.06, clearcoatRoughness: 0.08, envMapIntensity: 1.4, transmission: 0.92, thickness: 0.6, ior: 1.45 });
    var core = new THREE.Mesh(coreGeo, coreMat);
    rig.add(core);
    disposables.push(coreGeo, coreMat);

    var ring1Geo = new THREE.TorusGeometry(1.15, 0.045, 24, 140);
    var ring1Mat = makeGlassMaterial(0x2f7fff, { metalness: 0.15, roughness: 0.05, clearcoatRoughness: 0.1, envMapIntensity: 1.3, transmission: 0.9, thickness: 0.4, ior: 1.4 });
    var ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.scale.y = 0.34;
    ring1.rotation.x = Math.PI / 2.4;
    ring1.rotation.z = 0.5;
    rig.add(ring1);
    disposables.push(ring1Geo, ring1Mat);

    var ring2Geo = new THREE.TorusGeometry(1.34, 0.045, 24, 140);
    var ring2Mat = makeGlassMaterial(0x29e0ff, { metalness: 0.25, roughness: 0.08, clearcoatRoughness: 0.12, envMapIntensity: 1.3, transmission: 0.85, thickness: 0.4, ior: 1.4 });
    var ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.scale.y = 0.3;
    ring2.rotation.x = Math.PI / 1.9;
    ring2.rotation.z = -0.6;
    rig.add(ring2);
    disposables.push(ring2Geo, ring2Mat);

    rig.scale.setScalar(0.001);
    var introStart = null;

    var mouseX = 0, mouseY = 0, curRotX = 0, curRotY = 0;
    mouseHandler = function (e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', mouseHandler);

    function resize() {
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resizeHandler = resize;
    window.addEventListener('resize', resizeHandler);
    resize();

    var clock = new THREE.Clock();
    var visible = true;
    visHandler = function () { visible = !document.hidden; };
    document.addEventListener('visibilitychange', visHandler);

    function animate() {
      animId = requestAnimationFrame(animate);
      if (!visible) return;
      var t = clock.getElapsedTime();
      var tt = reduceMotion ? t * 0.35 : t;
      var mx2 = reduceMotion ? 0 : mouseX;
      var my2 = reduceMotion ? 0 : mouseY;

      if (introStart === null) {
        var pl = document.getElementById('preloader');
        if (!pl || pl.classList.contains('done')) introStart = t;
      } else {
        var ip = Math.min((t - introStart) / (reduceMotion ? 0.4 : 1.3), 1);
        var eased = 1 - Math.pow(1 - ip, 3);
        rig.scale.setScalar(0.001 + eased * 0.999);
      }

      curRotX += (my2 * 0.18 - curRotX) * 0.04;
      curRotY += (mx2 * 0.28 - curRotY) * 0.04;
      rig.rotation.x = curRotX * 0.5;
      rig.rotation.y = tt * 0.08 + curRotY * 0.5;

      core.rotation.y = tt * 0.5;
      core.rotation.x = tt * 0.2;
      ring1.rotation.z = tt * 0.3 + 0.5;
      ring2.rotation.z = -tt * 0.22 - 0.6;

      renderer.render(scene, camera);
    }
    animate();
  } catch (err) {
    if (canvas) canvas.style.display = 'none';
  }

  return function cleanup() {
    if (animId) cancelAnimationFrame(animId);
    if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    if (mouseHandler) window.removeEventListener('mousemove', mouseHandler);
    if (visHandler) document.removeEventListener('visibilitychange', visHandler);
    disposables.forEach(function (d) { if (d && d.dispose) d.dispose(); });
    if (renderer) renderer.dispose();
  };
}
