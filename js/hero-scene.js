/* ============================================================
   ALG — Three.js Hero Scene
   Night-time container freight yard with cinematic camera
   ============================================================ */

(function () {
  'use strict';

  // Skip heavy 3D on very small screens (< 480px) — use CSS fallback
  if (window.innerWidth < 480) return;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ── Renderer ──────────────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });

  const isMobile = window.innerWidth < 768;
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type   = THREE.PCFSoftShadowMap;
  renderer.toneMapping      = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.outputEncoding   = THREE.sRGBEncoding;

  /* ── Scene & Fog ───────────────────────────────────────────── */
  const scene = new THREE.Scene();
  scene.fog   = new THREE.FogExp2(0x060810, isMobile ? 0.025 : 0.018);
  scene.background = new THREE.Color(0x060810);

  /* ── Camera ────────────────────────────────────────────────── */
  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 7, 22);

  // A look-at target that GSAP can tween independently
  const cameraTarget = { x: 0, y: 1, z: 0 };

  /* ── Expose for GSAP scroll animations ─────────────────────── */
  window.ALGScene = { camera, cameraTarget, scene, renderer };

  /* ─────────────────────────────────────────────────────────────
     Helpers
  ───────────────────────────────────────────────────────────── */
  function makeMaterial(color, rough, metal, emissive, emissiveInt) {
    return new THREE.MeshStandardMaterial({
      color:           new THREE.Color(color),
      roughness:       rough  !== undefined ? rough  : 0.85,
      metalness:       metal  !== undefined ? metal  : 0.1,
      emissive:        emissive ? new THREE.Color(emissive) : new THREE.Color(0x000000),
      emissiveIntensity: emissiveInt || 0,
    });
  }

  // Build a container (ISO shipping container proportions)
  function makeContainer(x, y, z, colorHex, emissive, emissiveInt) {
    const group = new THREE.Group();

    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.6, 6),
      makeMaterial(colorHex, 0.9, 0.15, emissive, emissiveInt)
    );
    body.castShadow    = !isMobile;
    body.receiveShadow = !isMobile;
    group.add(body);

    // Corrugation lines (thin boxes overlaid on the side)
    if (!isMobile) {
      const ribMat = makeMaterial(colorHex, 0.95, 0.05);
      ribMat.color.multiplyScalar(0.75);
      for (let i = -2.4; i <= 2.4; i += 0.6) {
        const rib = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 2.62, 6.05),
          ribMat
        );
        rib.position.set(i, 0, 0);
        group.add(rib);
      }
    }

    // ALG stripe (lime accent on side)
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(2.41, 0.25, 6.02),
      makeMaterial('#C8FF3C', 0.4, 0.3, '#C8FF3C', 0.3)
    );
    stripe.position.y = 0.9;
    group.add(stripe);

    group.position.set(x, y, z);
    return group;
  }

  /* ─────────────────────────────────────────────────────────────
     Ground Plane
  ───────────────────────────────────────────────────────────── */
  const groundMat = makeMaterial('#0d0f12', 0.95, 0.0);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    groundMat
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.3;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid lines
  const grid = new THREE.GridHelper(200, 80, 0x1a2a1a, 0x111811);
  grid.position.y = -1.28;
  grid.material.opacity   = 0.4;
  grid.material.transparent = true;
  scene.add(grid);

  /* ─────────────────────────────────────────────────────────────
     Container Yard Layout
     Two flanking rows creating an "alley" the camera flies through
  ───────────────────────────────────────────────────────────── */
  const containerColors = [
    '#4a0a0a', // dark red
    '#0a1a4a', // dark blue
    '#1a3a0a', // dark green
    '#2a1a0a', // dark brown
    '#1a1a2a', // near black blue
    '#3a0a3a', // dark purple
  ];

  // Left wall of containers (negative X side)
  const leftXBase = -6.5;
  const zPositions = [-2, -9, -16, -23, -30];

  zPositions.forEach((z, i) => {
    const color = containerColors[i % containerColors.length];
    // Ground-level container
    const c1 = makeContainer(leftXBase, 0, z, color);
    scene.add(c1);
    // Stacked container
    const c2 = makeContainer(leftXBase, 2.7, z, containerColors[(i + 2) % containerColors.length]);
    scene.add(c2);
    // Offset 2nd column
    if (i < 4) {
      const c3 = makeContainer(leftXBase - 3.0, 0, z - 1, containerColors[(i + 3) % containerColors.length]);
      scene.add(c3);
    }
  });

  // Right wall of containers (positive X side)
  const rightXBase = 6.5;
  zPositions.forEach((z, i) => {
    const color = containerColors[(i + 1) % containerColors.length];
    const c1 = makeContainer(rightXBase, 0, z, color);
    scene.add(c1);
    const c2 = makeContainer(rightXBase, 2.7, z, containerColors[(i + 4) % containerColors.length]);
    scene.add(c2);
    if (i < 4) {
      const c3 = makeContainer(rightXBase + 3.0, 0, z - 1, containerColors[(i + 2) % containerColors.length]);
      scene.add(c3);
    }
  });

  /* ─────────────────────────────────────────────────────────────
     Semi-Truck (end of alley — camera flies toward it)
  ───────────────────────────────────────────────────────────── */
  const truckGroup = new THREE.Group();
  truckGroup.position.set(0, -1.3, -36);

  // Trailer
  const trailer = new THREE.Mesh(
    new THREE.BoxGeometry(2.55, 3.0, 13),
    makeMaterial('#e8e8e8', 0.6, 0.2)
  );
  trailer.position.set(0, 1.5, -2.5);
  trailer.castShadow = !isMobile;
  truckGroup.add(trailer);

  // ALG text panel on trailer side
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(2.56, 1.2, 8),
    makeMaterial('#C8FF3C', 0.4, 0.3, '#C8FF3C', 0.5)
  );
  panel.position.set(0, 1.7, -2.5);
  truckGroup.add(panel);

  // Cab
  const cab = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 2.8, 3.5),
    makeMaterial('#1a1a2e', 0.5, 0.4)
  );
  cab.position.set(0, 1.4, 5.3);
  cab.castShadow = !isMobile;
  truckGroup.add(cab);

  // Cab roof fairing (sleek top)
  const fairing = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.8, 2.0),
    makeMaterial('#141425', 0.6, 0.3)
  );
  fairing.position.set(0, 2.9, 5.8);
  truckGroup.add(fairing);

  // Windshield
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 1.2, 0.1),
    makeMaterial('#3a6080', 0.1, 0.5)
  );
  windshield.position.set(0, 2.0, 7.09);
  truckGroup.add(windshield);

  // Headlights (lime glow)
  [-0.7, 0.7].forEach((xOff) => {
    const headlight = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.1),
      makeMaterial('#C8FF3C', 0.2, 0.5, '#C8FF3C', 2.5)
    );
    headlight.position.set(xOff, 1.1, 7.1);
    truckGroup.add(headlight);
  });

  // Wheels (simplified cylinders)
  if (!isMobile) {
    const wheelMat = makeMaterial('#1a1a1a', 0.95, 0.1);
    const wheelPositions = [
      [-1.4, 0, 4.5], [1.4, 0, 4.5],   // front axle
      [-1.4, 0, -0.5], [1.4, 0, -0.5], // mid axle
      [-1.4, 0, -4.5], [1.4, 0, -4.5], // rear axle
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.45, 16),
        wheelMat
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy + 0.55, wz);
      truckGroup.add(wheel);
    });
  }

  scene.add(truckGroup);

  /* ─────────────────────────────────────────────────────────────
     Yard Light Poles
  ───────────────────────────────────────────────────────────── */
  const polePositions = [
    [-11, -2],  // left close
    [ 11, -2],  // right close
    [-11, -18], // left far
    [ 11, -18], // right far
  ];

  polePositions.forEach(([px, pz]) => {
    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 12, 6),
      makeMaterial('#1a1a1a', 0.9, 0.5)
    );
    pole.position.set(px, 4.7, pz);
    scene.add(pole);

    // Arm
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 3, 6),
      makeMaterial('#1a1a1a', 0.9, 0.5)
    );
    arm.rotation.z = Math.PI / 2;
    arm.position.set(px > 0 ? px - 1.5 : px + 1.5, 10.5, pz);
    scene.add(arm);

    // Light head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.3, 0.5),
      makeMaterial('#ffe08a', 0.3, 0.5, '#ffe08a', 1.5)
    );
    head.position.set(px > 0 ? px - 1.5 : px + 1.5, 10.2, pz);
    scene.add(head);

    // Point light from this pole
    const yardLight = new THREE.SpotLight(0xffe8a0, isMobile ? 0 : 2.5, 30, Math.PI / 6, 0.4, 1.5);
    yardLight.position.set(px > 0 ? px - 1.5 : px + 1.5, 10, pz);
    yardLight.target.position.set(0, 0, pz);
    yardLight.castShadow  = false; // performance
    scene.add(yardLight);
    scene.add(yardLight.target);
  });

  /* ─────────────────────────────────────────────────────────────
     Particle System (atmospheric dust/fog)
  ───────────────────────────────────────────────────────────── */
  const particleCount = isMobile ? 200 : 600;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 40;  // x
    positions[i * 3 + 1] = (Math.random()) * 16 - 2;    // y
    positions[i * 3 + 2] = (Math.random() - 0.1) * 60;  // z
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color:       0xffffff,
    size:        0.06,
    transparent: true,
    opacity:     0.25,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ─────────────────────────────────────────────────────────────
     Lighting
  ───────────────────────────────────────────────────────────── */

  // Ambient — very dim, cold night sky
  const ambient = new THREE.AmbientLight(0x0a1020, 0.6);
  scene.add(ambient);

  // Main directional (moon-like, from upper-left)
  const moonLight = new THREE.DirectionalLight(0xe0eeff, 0.8);
  moonLight.position.set(-10, 20, 10);
  moonLight.castShadow = !isMobile;
  if (!isMobile) {
    moonLight.shadow.mapSize.width  = 1024;
    moonLight.shadow.mapSize.height = 1024;
    moonLight.shadow.camera.near   = 0.5;
    moonLight.shadow.camera.far    = 80;
    moonLight.shadow.camera.left   = -25;
    moonLight.shadow.camera.right  =  25;
    moonLight.shadow.camera.top    =  25;
    moonLight.shadow.camera.bottom = -25;
  }
  scene.add(moonLight);

  // ALG lime rim light — from front-left, hitting containers
  const rimLight = new THREE.PointLight(0xC8FF3C, 3.5, 20, 1.5);
  rimLight.position.set(-5, 4, 8);
  scene.add(rimLight);

  // Warm glow from truck headlights area
  const truckGlow = new THREE.PointLight(0xC8FF3C, 2.0, 15, 2);
  truckGlow.position.set(0, 1.5, -28);
  scene.add(truckGlow);

  // Blue-ish cool fill from right
  const fillLight = new THREE.PointLight(0x203070, 1.5, 40, 1);
  fillLight.position.set(12, 8, 0);
  scene.add(fillLight);

  /* ─────────────────────────────────────────────────────────────
     Background star-field plane
  ───────────────────────────────────────────────────────────── */
  const starCount = isMobile ? 0 : 300;
  if (starCount > 0) {
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3]     = (Math.random() - 0.5) * 200;
      starPos[i * 3 + 1] = 15 + Math.random() * 30;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.15, transparent: true, opacity: 0.5
    });
    scene.add(new THREE.Points(starGeo, starMat));
  }

  /* ─────────────────────────────────────────────────────────────
     Render Loop
  ───────────────────────────────────────────────────────────── */
  let frameId;
  const clock = new THREE.Clock();

  function animate() {
    frameId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Drift particles upward slowly
    const pos = particleGeo.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      pos.array[i * 3 + 1] += 0.004;
      if (pos.array[i * 3 + 1] > 14) {
        pos.array[i * 3 + 1] = -2;
      }
    }
    pos.needsUpdate = true;

    // Subtle rim light pulse
    rimLight.intensity = 3.5 + Math.sin(t * 1.2) * 0.4;

    // Camera always looks at the tween target
    camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z);

    renderer.render(scene, camera);
  }

  animate();

  /* ─────────────────────────────────────────────────────────────
     Resize Handler
  ───────────────────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ─────────────────────────────────────────────────────────────
     Cleanup on page hide
  ───────────────────────────────────────────────────────────── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frameId);
    } else {
      animate();
    }
  });
})();
