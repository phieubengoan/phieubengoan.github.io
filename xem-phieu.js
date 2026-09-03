/* ============================================
   1. ĐỌC THAM SỐ TỪ URL
   ------------------------------------------------
   Ví dụ liên kết đến trang này:
   xem-phieu.html?src=pbn%20(1).png&title=Phi%E1%BA%BFu%20b%C3%A9%20ngoan%201&meta=Th%C3%A1ng%201
   ============================================ */
const params = new URLSearchParams(window.location.search);
const imgSrc = params.get('src');
const title = params.get('title') || 'Phiếu bé ngoan';
const meta = params.get('meta') || '';
const isSpecial = params.get('special') === '1';

document.getElementById('cert-title').textContent = title;
document.getElementById('cert-meta').textContent = meta;
document.title = title + ' — Xem 3D';

if (isSpecial) {
  const badge = document.createElement('p');
  badge.className = 'special-tag';
  badge.textContent = '✦ Phiếu đặc biệt';
  document.getElementById('cert-title').insertAdjacentElement('afterend', badge);
}

const loadingMsg = document.getElementById('loading-msg');
const wrap = document.getElementById('canvas-wrap');

if (!imgSrc) {
  loadingMsg.textContent = 'Không tìm thấy ảnh phiếu (thiếu tham số ?src=... trong đường dẫn).';
  loadingMsg.classList.add('is-error');
} else {
  initScene(imgSrc);
}

/* ============================================
   2. DỰNG CẢNH 3D
   ============================================ */
function initScene(src) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    40, window.innerWidth / window.innerHeight, 0.1, 100
  );
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  wrap.appendChild(renderer.domElement);

  // Ánh sáng
  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xfff2d9, 0.5);
  key.position.set(3, 4, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x9fc9ff, 0.5);
  rim.position.set(-4, -2, -3);
  scene.add(rim);

  // Điều khiển xoay bằng chuột / cảm ứng
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 2.2;
  controls.maxDistance = 7;
  controls.rotateSpeed = 0.7;

  // Placeholder khối trong lúc chờ ảnh tải xong
  let holder = new THREE.Group();
  scene.add(holder);
  let hasPlane = false;
  let autoRotate = true;
  let idleTimer = null;
  const clock = new THREE.Clock();
  let holoMat = null;

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');

  loader.load(
    src,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace || texture.colorSpace;

      const img = texture.image;
      const aspect = img.width / img.height;

      const height = 2.6;
      const width = height * aspect;
      const depth = 0.025;

      const edgeMat = new THREE.MeshStandardMaterial({ color: 0xd9cfaf, roughness: 0.95 });
      const backMat = new THREE.MeshStandardMaterial({ color: 0xf3eee2, roughness: 0.95 });
      const frontMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.55,
        metalness: 0.02,
      });

      const geometry = new THREE.BoxGeometry(width, height, depth);
      const materials = [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat];

      const plane = new THREE.Mesh(geometry, materials);
      holder.add(plane);
      holder.rotation.y = -0.35; // hơi nghiêng lúc mới hiện ra
      hasPlane = true;

      // Lớp phủ holo cầu vồng (chỉ dành cho phiếu có cờ special)
      if (isSpecial) {
        holoMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.FrontSide,
          uniforms: { uTime: { value: 0 } },
          vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormalV;
            varying vec3 vViewPosition;
            void main() {
              vUv = uv;
              vNormalV = normalize(normalMatrix * normal);
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              vViewPosition = -mvPosition.xyz;
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            uniform float uTime;
            varying vec2 vUv;
            varying vec3 vNormalV;
            varying vec3 vViewPosition;

            vec3 hsv2rgb(vec3 c) {
              vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
              vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
              return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            void main() {
              vec3 viewDir = normalize(vViewPosition);
              float fresnel = pow(1.0 - max(dot(normalize(vNormalV), viewDir), 0.0), 1.8);
              float band = vUv.x * 2.4 + vUv.y * 1.6 + uTime * 0.12;
              float hue = fract(band);
              vec3 rainbow = hsv2rgb(vec3(hue, 0.8, 1.0));
              float sparkle = clamp(fresnel * 1.4, 0.0, 1.0);
              gl_FragColor = vec4(rainbow, sparkle * 0.85);
            }
          `,
        });

        const overlayGeo = new THREE.PlaneGeometry(width, height);
        const overlay = new THREE.Mesh(overlayGeo, holoMat);
        overlay.position.z = depth / 2 + 0.002;
        holder.add(overlay);
      }

      // Bóng đổ mờ bên dưới cho có chiều sâu
      const shadowGeo = new THREE.CircleGeometry(Math.max(width, height) * 0.6, 48);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.28,
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -height / 2 - 0.35;
      scene.add(shadow);

      loadingMsg.classList.add('is-hidden');
    },
    undefined,
    () => {
      loadingMsg.textContent = 'Không tải được ảnh: ' + src;
      loadingMsg.classList.add('is-error');
    }
  );

  // Tạm dừng tự xoay khi người dùng đang thao tác, xoay lại sau vài giây nghỉ tay
  controls.addEventListener('start', () => {
    autoRotate = false;
    clearTimeout(idleTimer);
  });
  controls.addEventListener('end', () => {
    idleTimer = setTimeout(() => { autoRotate = true; }, 2200);
  });

  function animate() {
    requestAnimationFrame(animate);
    if (hasPlane && autoRotate) {
      holder.rotation.y += 0.0035;
    }
    if (holoMat) {
      holoMat.uniforms.uTime.value = clock.getElapsedTime();
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}