// initJinxiNight.ts - 增强版今汐3D背景（ShaderMaterial，无纹理错误）
import * as THREE from "three";

type CleanupFn = () => void;

export default (container: HTMLElement) => {
  if (!container) {
    console.warn("container is null");
    return { cleanup: () => {} };
  }

  let width = container.clientWidth;
  let height = container.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x021016);
  scene.fog = new THREE.FogExp2(0x021016, 0.006);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 150);
  camera.position.set(0, 3, 22);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // 辅助函数：创建粒子纹理（增加稳定性设置）
  function createParticleTexture(colorStops: Array<[number, string]>) {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 64, 64);
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    for (const [pos, col] of colorStops) {
      grad.addColorStop(pos, col);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    ctx.beginPath();
    ctx.arc(48, 24, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,240,0.7)";
    ctx.fill();
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter; // 避免 mipmap 生成
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
  }

  const mainTexture = createParticleTexture([
    [0, "rgba(215, 255, 246, 1)"],
    [0.3, "rgba(127, 231, 214, 0.9)"],
    [0.6, "rgba(127, 231, 214, 0.4)"],
    [1, "rgba(127, 231, 214, 0)"],
  ]);

  const glowTexture = createParticleTexture([
    [0, "rgba(230, 199, 124, 1)"],
    [0.4, "rgba(230, 199, 124, 0.6)"],
    [0.8, "rgba(215, 255, 246, 0.2)"],
    [1, "rgba(127, 231, 214, 0)"],
  ]);

  // 粒子数量：移动端减半
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const PARTICLE_COUNT_MAIN = isMobile ? 2000 : 4000;
  const PARTICLE_COUNT_GLOW = isMobile ? 1000 : 3000;
  const PARTICLE_COUNT_RING = isMobile ? 1000 : 3000;
  const PARTICLE_COUNT_CLOUD = isMobile ? 1000 : 3000;

  // ---------- 1. 主粒子系统（螺旋星云）使用 ShaderMaterial ----------
  const mainPositions = new Float32Array(PARTICLE_COUNT_MAIN * 3);
  const mainSizes = new Float32Array(PARTICLE_COUNT_MAIN);
  const mainShifts = new Float32Array(PARTICLE_COUNT_MAIN * 4);

  for (let i = 0; i < PARTICLE_COUNT_MAIN; i++) {
    const t = Math.random();
    const angle = t * Math.PI * 12;
    const radius = 5 + t * 10;
    const height = Math.sin(angle * 2) * 3;
    const x = radius * Math.cos(angle);
    const y = height + (Math.random() - 0.5) * 1.5;
    const z = radius * Math.sin(angle);

    mainPositions[i * 3] = x;
    mainPositions[i * 3 + 1] = y;
    mainPositions[i * 3 + 2] = z;
    mainSizes[i] = 0.4 + Math.random() * 0.8;
    mainShifts[i * 4] = angle;
    mainShifts[i * 4 + 1] = Math.random() * Math.PI * 2;
    mainShifts[i * 4 + 2] = 0.5 + Math.random() * 0.8;
    mainShifts[i * 4 + 3] = 0.3 + Math.random() * 0.6;
  }

  const mainGeometry = new THREE.BufferGeometry();
  mainGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(mainPositions, 3)
  );
  mainGeometry.setAttribute("aSize", new THREE.BufferAttribute(mainSizes, 1));
  mainGeometry.setAttribute("shift", new THREE.BufferAttribute(mainShifts, 4));

  // 自定义着色器材质
  const mainUniforms = {
    time: { value: 0 },
    pointTexture: { value: mainTexture },
  };

  const mainVertexShader = `
    uniform float time;
    attribute float aSize;
    attribute vec4 shift;
    varying vec3 vColor;
    const float PI2 = 6.28318530718;

    void main() {
      vec3 pos = position;
      float t = time * shift.z;
      float angle = shift.x + t;
      float driftX = -sin(angle) * shift.w * 0.3;
      float driftZ = cos(angle) * shift.w * 0.3;
      float driftY = sin(angle * 2.0 + t) * shift.w * 0.2;
      pos.x += driftX;
      pos.z += driftZ;
      pos.y += driftY;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = aSize * (0.7 + 0.5 * sin(shift.x * 1.5 + time * 2.0)) * ( 300.0 / ( - mvPosition.z ) );
      gl_PointSize = clamp(gl_PointSize, 2.0, 25.0);
      gl_Position = projectionMatrix * mvPosition;

      // 颜色计算
      float r = length(position) / 18.0;
      r = clamp(r, 0.2, 1.0);
      vec3 colorA = vec3(0.85, 0.98, 0.96);
      vec3 colorB = vec3(0.5, 0.9, 0.85);
      vec3 colorC = vec3(0.9, 0.78, 0.5);
      float goldMix = sin(position.y * 2.0 + time) * 0.3 + 0.3;
      vColor = mix(mix(colorA, colorB, r), colorC, goldMix * (1.0 - r));
    }
  `;

  const mainFragmentShader = `
    uniform sampler2D pointTexture;
    varying vec3 vColor;
    void main() {
      vec4 texColor = texture2D(pointTexture, gl_PointCoord);
      float alpha = texColor.a;
      if (alpha < 0.05) discard;
      gl_FragColor = vec4(vColor, alpha * 0.9);
    }
  `;

  const mainMaterial = new THREE.ShaderMaterial({
    uniforms: mainUniforms,
    vertexShader: mainVertexShader,
    fragmentShader: mainFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const mainPoints = new THREE.Points(mainGeometry, mainMaterial);
  scene.add(mainPoints);

  // ---------- 2. 光晕粒子层 ----------
  const glowPositions = new Float32Array(PARTICLE_COUNT_GLOW * 3);
  for (let i = 0; i < PARTICLE_COUNT_GLOW; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 12 + Math.random() * 4;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi) * 0.8;
    const z = radius * Math.sin(phi) * Math.sin(theta);
    glowPositions[i * 3] = x;
    glowPositions[i * 3 + 1] = y;
    glowPositions[i * 3 + 2] = z;
  }
  const glowGeometry = new THREE.BufferGeometry();
  glowGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(glowPositions, 3)
  );
  const glowMaterial = new THREE.PointsMaterial({
    map: glowTexture,
    size: 0.18,
    transparent: true,
    blending: THREE.AdditiveBlending,
    color: 0x7fe7d6,
    opacity: 0.5,
  });
  const glowPoints = new THREE.Points(glowGeometry, glowMaterial);
  scene.add(glowPoints);

  // ---------- 3. 光环粒子环 ----------
  const ringCount = PARTICLE_COUNT_RING;
  const ringPositions = new Float32Array(ringCount * 3);
  const ringColors = new Float32Array(ringCount * 3);
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    const radius = 9 + Math.sin(angle * 3) * 1.2;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    const y = Math.sin(angle * 2) * 0.8;
    ringPositions[i * 3] = x;
    ringPositions[i * 3 + 1] = y;
    ringPositions[i * 3 + 2] = z;
    const mixVal = (angle / (Math.PI * 2)) % 1;
    const color = new THREE.Color().setHSL(0.45 + mixVal * 0.15, 1, 0.6);
    ringColors[i * 3] = color.r;
    ringColors[i * 3 + 1] = color.g;
    ringColors[i * 3 + 2] = color.b;
  }
  const ringGeometry = new THREE.BufferGeometry();
  ringGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(ringPositions, 3)
  );
  ringGeometry.setAttribute("color", new THREE.BufferAttribute(ringColors, 3));
  const ringMaterial = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.6,
  });
  const ringPoints = new THREE.Points(ringGeometry, ringMaterial);
  scene.add(ringPoints);

  const ring2Count = PARTICLE_COUNT_RING / 2;
  const ring2Positions = new Float32Array(ring2Count * 3);
  for (let i = 0; i < ring2Count; i++) {
    const angle = (i / ring2Count) * Math.PI * 2;
    const radius = 11;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle) * 0.8;
    const y = Math.cos(angle * 1.5) * 1.2;
    ring2Positions[i * 3] = x;
    ring2Positions[i * 3 + 1] = y;
    ring2Positions[i * 3 + 2] = z;
  }
  const ring2Geometry = new THREE.BufferGeometry();
  ring2Geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(ring2Positions, 3)
  );
  const ring2Material = new THREE.PointsMaterial({
    color: 0xd7fff6,
    size: 0.12,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.5,
  });
  const ring2Points = new THREE.Points(ring2Geometry, ring2Material);
  scene.add(ring2Points);

  // 中心光晕
  const coreGlowGeometry = new THREE.SphereGeometry(2.2, 32, 32);
  const coreGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0x7fe7d6,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide,
  });
  const coreGlow = new THREE.Mesh(coreGlowGeometry, coreGlowMaterial);
  scene.add(coreGlow);

  const innerGlowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
  const innerGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xd7fff6,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
  });
  const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
  scene.add(innerGlow);

  // 螺旋光带
  const lineCount = 3;
  const lines: THREE.Line[] = [];
  for (let j = 0; j < lineCount; j++) {
    const points: THREE.Vector3[] = [];
    const offsetAngle = (j / lineCount) * Math.PI * 2;
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const angle = t * Math.PI * 6 + offsetAngle;
      const radius = 4 + t * 8;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const y = Math.sin(angle * 2) * 1.5;
      points.push(new THREE.Vector3(x, y, z));
    }
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: j === 0 ? 0x7fe7d6 : j === 1 ? 0xd7fff6 : 0xe6c77c,
      transparent: true,
      opacity: 0.25,
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
    lines.push(line);
  }

  // 飘浮粒子云
  const cloudCount = PARTICLE_COUNT_CLOUD;
  const cloudPositions = new Float32Array(cloudCount * 3);
  for (let i = 0; i < cloudCount; i++) {
    const radius = 6 + Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    cloudPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    cloudPositions[i * 3 + 1] = radius * Math.cos(phi) * 0.6;
    cloudPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  const cloudGeometry = new THREE.BufferGeometry();
  cloudGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(cloudPositions, 3)
  );
  const cloudMaterial = new THREE.PointsMaterial({
    color: 0x7fe7d6,
    size: 0.08,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
  });
  const cloudPoints = new THREE.Points(cloudGeometry, cloudMaterial);
  scene.add(cloudPoints);

  // ---------- 鼠标互动 ----------
  let mouseX = 0,
    mouseY = 0;
  const handleMouseMove = (e: MouseEvent) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("mousemove", handleMouseMove);

  // 动画
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.006;
    mainUniforms.time.value = time;

    // 相机跟随鼠标轻微偏移（视差效果）
    const targetX = mouseX * 0.8;
    const targetY = mouseY * 0.5;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    // 粒子系统整体旋转速度受鼠标影响
    const rotSpeed = 0.08 + mouseX * 0.03;
    mainPoints.rotation.y = time * rotSpeed;
    glowPoints.rotation.y = time * (0.04 + mouseY * 0.02);
    ringPoints.rotation.y = time * (0.12 + mouseX * 0.05);
    ring2Points.rotation.y = time * (-0.1 + mouseY * 0.03);
    cloudPoints.rotation.y = time * 0.02;

    // 螺旋光带受鼠标影响轻微旋转
    lines.forEach((line, idx) => {
      line.rotation.y = time * (0.02 + idx * 0.01 + mouseX * 0.1);
      line.rotation.x = time * (0.01 + mouseY * 0.05);
    });

    const scale = 1 + Math.sin(time * 1.5) * 0.05;
    coreGlow.scale.set(scale, scale, scale);
    innerGlow.scale.set(scale, scale, scale);

    renderer.render(scene, camera);
  }
  animate();

  const handleResize = () => {
    width = container.clientWidth;
    height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener("resize", handleResize);

  const cleanup = () => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("mousemove", handleMouseMove);
    renderer.dispose();
    mainGeometry.dispose();
    mainMaterial.dispose();
    glowGeometry.dispose();
    glowMaterial.dispose();
    ringGeometry.dispose();
    ringMaterial.dispose();
    ring2Geometry.dispose();
    ring2Material.dispose();
    cloudGeometry.dispose();
    cloudMaterial.dispose();
    mainTexture.dispose();
    glowTexture.dispose();
    if (renderer.domElement && renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  };

  return { cleanup };
};
