/* Photorealistic 3D Hardware Studio Engine with Airflow & Micro-Detailed Parts */
import { 
  createHoneycombTexture,
  createWhiteMoboTexture, 
  createCpuTexture, 
  createWhiteGpuBackplateTexture, 
  createAioLcdTexture,
  createLianLiTrayTexture,
  createRubberGrommetTexture,
  createRamTexture,
  createFanHubBadgeTexture,
  createPsuSpecTexture
} from "./textures.js";
import { createStudioEnvironment, createMetallicStudioBackground } from "./environment.js";
import { 
  buildMotherboard3D, 
  buildGpu3D, 
  buildCooler3D 
} from "./hardware_geometry.js";

export class PCStudioScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.bloomPass = null;
    this.controls = null;
    this.componentsGroup = null;
    this.airflowGroup = null;

    this.fanBlades = [];
    this.rgbLights = [];
    this.rgbMaterials = [];
    this.airflowParticles = [];

    // State
    this.showAirflow = false; // Airflow particles disabled
    this.currentHue = 195;
    this.isRainbowWave = true;
    this.isBreathe = false;
    this.rgbAnimTime = 0;

    this.cameraMode = "showcase";
    this.parts = {};
    this.currentBuild = null;
    this.currentFanConfig = null;

    // Camera Transitions & Showcase Rig Tracking
    this.cameraTransition = null;
    this.showcasePositions = {};

    // Clock & Showcase Animation / CPU Focus State
    this.clock = window.THREE ? new THREE.Clock() : null;
    this.showcaseMixer = null;
    this.showcaseCpu = null;
    this.showcaseCpuWorldPos = null;
    this.isCpuFocused = false;
    this.onCpuFocusChange = null;
    this.raycaster = window.THREE ? new THREE.Raycaster() : null;
    this.pointerDownPos = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene with Satin Metallic Studio Background
    this.scene = new THREE.Scene();
    this.scene.background = createMetallicStudioBackground(false);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    this.camera.position.set(4.2, 2.2, 4.6);

    // 3. Renderer with ACES Tone Mapping
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    const isMobileDevice = (width < 768) || ('ontouchstart' in window && width < 1024);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice ? 1.5 : 2.0));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    // 4. Studio Environment Map (Photorealistic Specular Highlights)
    const envMap = createStudioEnvironment(this.renderer);
    this.scene.environment = envMap;

    // 5. Post-Processing: Optical Bloom for ARGB Radiance
    this.setupPostProcessing(width, height);

    // 6. OrbitControls with Butter-Smooth Damping and Responsive Drag
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.02;
    this.controls.minDistance = 0.9;
    this.controls.maxDistance = 7.0;
    this.controls.target.set(0, 0.48, 0);
    this.controls.autoRotate = false; // Hero sweep replaces continuous 360 spin

    // Hero Sweep & Showcase Tracking (Cinematic pendulum arc prioritizing front-three-quarter view)
    this.heroSweepTime = 0.78;     // Start at front-three-quarter azimuth (~45 deg)
    this.heroAzimuthCenter = 0.75; // Sweet spot: ~43 degrees looking into front and side glass
    this.heroAzimuthAmp = 0.38;    // ~22 degrees swing (sweeps smoothly between 21° and 65°)
    this.heroRadius = 6.25;        // Stage orbital distance
    this.heroHeightCenter = 2.15;  // Camera Y elevation
    this.heroHeightAmp = 0.10;     // Gentle vertical breathing
    this.userInteractedShowcase = false;
    this.lastUserInteractTime = 0;
    this.showcaseRgbMaterials = [];

    // Interaction tracking (eliminates drag conflicts with clicks)
    this.isUserDragging = false;
    this.pointerDownTime = 0;
    this.pointerDownPos = { x: 0, y: 0 };

    this.controls.addEventListener("start", () => {
      this.isUserDragging = true;
      this.userInteractedShowcase = true;
      this.lastUserInteractTime = performance.now();
      this.cameraTransition = null; // Instantly give 100% control to user's drag!
      this.targetCamPos = null;
      this.renderer.domElement.style.cursor = "grabbing";
    });

    this.controls.addEventListener("end", () => {
      this.isUserDragging = false;
      this.lastUserInteractTime = performance.now();
      this.renderer.domElement.style.cursor = "grab";
    });

    this.renderer.domElement.addEventListener("wheel", () => {
      if (this.cameraMode === "showcase") {
        this.userInteractedShowcase = true;
        this.lastUserInteractTime = performance.now();
      }
    }, { passive: true });

    this.renderer.domElement.style.cursor = "grab";

    // 7. Lighting
    this.setupLighting();

    // 8. Ground Pedestal
    this.setupPedestal();

    // 9. Component & Airflow Groups
    this.componentsGroup = new THREE.Group();
    this.scene.add(this.componentsGroup);

    this.showcaseRigGroup = new THREE.Group();
    this.scene.add(this.showcaseRigGroup);

    this.airflowGroup = new THREE.Group();
    this.airflowGroup.visible = false;
    this.scene.add(this.airflowGroup);

    this.tryLoadShowcaseRig();

    // Track click vs drag cleanly
    this.renderer.domElement.addEventListener("pointerdown", (e) => {
      this.pointerDownTime = performance.now();
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
      if (this.cameraMode === "showcase") {
        this.userInteractedShowcase = true;
        this.lastUserInteractTime = performance.now();
      }
    });

    this.renderer.domElement.addEventListener("pointerup", (e) => {
      const elapsed = performance.now() - this.pointerDownTime;
      const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);

      // Clean click detection: not a heavy drag (dist < 14px) and quick action (elapsed < 380ms)
      if (dist < 14 && elapsed < 380) {
        this.handleStageClick(e);
      }
    });

    // Hover cursor feedback (pointer on CPU, grab on chassis)
    this.renderer.domElement.addEventListener("pointermove", (e) => {
      if (this.isUserDragging) return;
      this.updateHoverCursor(e);
    });

    window.addEventListener("resize", () => this.onResize());

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  handleStageClick(e) {
    if (!this.raycaster || !this.camera || !this.renderer) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(mouse, this.camera);

    const isLandingShowcase = (this.cameraMode === "showcase");
    if (isLandingShowcase && this.showcaseRigGroup) {
      const hits = this.raycaster.intersectObjects(this.showcaseRigGroup.children, true);
      if (hits.length > 0) {
        let hitCpu = false;
        for (const hit of hits) {
          let cur = hit.object;
          while (cur && cur !== this.showcaseRigGroup) {
            const name = (cur.name || "").toLowerCase();
            if (
              name.includes("cpu") ||
              name.includes("waterblock") ||
              name.includes("wcblock") ||
              name.includes("cooler") ||
              name.includes("pump") ||
              name.includes("latch") ||
              name.includes("bracket")
            ) {
              hitCpu = true;
              break;
            }
            cur = cur.parent;
          }
          if (hitCpu) break;

          // Proximity to CPU 3D position
          if (this.showcaseCpuWorldPos && hit.point) {
            if (hit.point.distanceTo(this.showcaseCpuWorldPos) < 0.48) {
              hitCpu = true;
              break;
            }
          }
        }

        if (hitCpu) {
          if (this.isCpuFocused) {
            this.setMacroPreset("rig");
          } else {
            this.setMacroPreset("cpu");
          }
        } else if (this.isCpuFocused) {
          // Clicked outside CPU on another part of rig -> return to full rig view
          this.setMacroPreset("rig");
        }
      } else if (this.isCpuFocused) {
        // Clicked on empty space/pedestal -> return to full rig view
        this.setMacroPreset("rig");
      }
    }
  }

  updateHoverCursor(e) {
    if (!this.raycaster || !this.camera || !this.renderer) return;
    const isLandingShowcase = (this.cameraMode === "showcase");
    if (!isLandingShowcase || !this.showcaseRigGroup) {
      this.renderer.domElement.style.cursor = "grab";
      return;
    }

    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(mouse, this.camera);

    const hits = this.raycaster.intersectObjects(this.showcaseRigGroup.children, true);
    if (hits.length > 0) {
      let isOverCpu = false;
      for (const hit of hits) {
        let cur = hit.object;
        while (cur && cur !== this.showcaseRigGroup) {
          const name = (cur.name || "").toLowerCase();
          if (
            name.includes("cpu") ||
            name.includes("waterblock") ||
            name.includes("wcblock") ||
            name.includes("cooler") ||
            name.includes("pump") ||
            name.includes("latch") ||
            name.includes("bracket")
          ) {
            isOverCpu = true;
            break;
          }
          cur = cur.parent;
        }
        if (isOverCpu) break;

        if (this.showcaseCpuWorldPos && hit.point) {
          if (hit.point.distanceTo(this.showcaseCpuWorldPos) < 0.48) {
            isOverCpu = true;
            break;
          }
        }
      }
      this.renderer.domElement.style.cursor = isOverCpu ? "pointer" : "grab";
    } else {
      this.renderer.domElement.style.cursor = "grab";
    }
  }

  setupPostProcessing(width, height) {
    if (window.THREE && window.THREE.EffectComposer && window.THREE.UnrealBloomPass) {
      const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
      });
      const renderPass = new THREE.RenderPass(this.scene, this.camera);
      // Refined bloom: smooth, silky diffusion without spiky glare or roughness
      this.bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.42, // Refined strength for subtle, authentic radiance
        0.48, // Gentle Gaussian dispersion radius
        0.65  // Clean threshold capturing glowing diffusers without noisy speckles
      );
      this.composer = new THREE.EffectComposer(this.renderer, renderTarget);
      this.composer.addPass(renderPass);
      this.composer.addPass(this.bloomPass);
    }
  }

  setupLighting() {
    // 1. Studio Ambient Light (prevents washed-out grey tones, provides deep PBR contrast)
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.68);
    this.scene.add(ambientLight);

    // 2. High-precision Key Light (calibrated shadow bias and normalBias to eliminate roughness/shadow acne)
    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.25);
    keyLight.position.set(5, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.00015;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // 3. Crisp Studio Rim Light (Subtle cool highlights on chassis bevels)
    const rimLight = new THREE.DirectionalLight(0xD0E2F5, 0.75);
    rimLight.position.set(-5, 6, -5);
    this.scene.add(rimLight);

    // 4. Soft Front Fill
    const fillLight = new THREE.DirectionalLight(0xEFF4FA, 0.45);
    fillLight.position.set(2, 2, 5);
    this.scene.add(fillLight);

    // 5. Dedicated ARGB Internal Accent Lights (Authentic PC enthusiast illumination)
    // Top Radiator & Fan Glow
    const topRgb = new THREE.PointLight(0x00F0FF, 3.2, 3.2, 2);
    topRgb.position.set(-0.05, 1.25, 0.05);
    topRgb.userData = { baseIntensity: 3.2 };
    this.scene.add(topRgb);
    this.rgbLights.push(topRgb);

    // CPU Waterblock & Trident-Z RAM Glow
    const midRgb = new THREE.PointLight(0x00F0FF, 2.8, 2.5, 2);
    midRgb.position.set(-0.15, 0.75, 0.05);
    midRgb.userData = { baseIntensity: 2.8 };
    this.scene.add(midRgb);
    this.rgbLights.push(midRgb);

    // Bottom Chamber / Radiator Soft Underglow
    const bottomRgb = new THREE.PointLight(0x00F0FF, 2.2, 2.2, 2);
    bottomRgb.position.set(0.12, 0.22, 0.15);
    bottomRgb.userData = { baseIntensity: 2.2 };
    this.scene.add(bottomRgb);
    this.rgbLights.push(bottomRgb);
  }

  setupPedestal() {
    const floorGeo = new THREE.CylinderGeometry(2.9, 2.95, 0.04, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xE8ECF2,
      roughness: 0.18,
      metalness: 0.72,
      envMapIntensity: 1.6
    });
    this.floorMesh = new THREE.Mesh(floorGeo, floorMat);
    this.floorMesh.position.y = -0.52;
    this.floorMesh.receiveShadow = true;
    this.scene.add(this.floorMesh);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.88, 2.91, 64),
      new THREE.MeshBasicMaterial({ color: 0x94A3B8, side: THREE.DoubleSide })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.499;
    this.scene.add(ring);
  }

  setTheme(theme) {
    const isDark = theme === "dark";
    this.scene.background = createMetallicStudioBackground(isDark);
    if (this.scene.fog) {
      this.scene.fog.color = new THREE.Color(isDark ? 0x08090C : 0xF5F7FA);
    }
    if (this.floorMesh) {
      this.floorMesh.material.color = new THREE.Color(isDark ? 0x141822 : 0xE8ECF2);
      this.floorMesh.material.roughness = isDark ? 0.22 : 0.18;
      this.floorMesh.material.metalness = isDark ? 0.78 : 0.72;
    }
    if (this.bloomPass) {
      this.bloomPass.strength = isDark ? 0.65 : 0.42;
    }
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.composer) this.composer.setSize(width, height);
  }

  /* ----------------------------------------------------
     DYNAMIC COMPONENT RE-BUILD
  ---------------------------------------------------- */
  updateBuild(build, fanConfig) {
    this.currentBuild = build;
    this.currentFanConfig = fanConfig;
    this.updateRigVisibility();

    while (this.componentsGroup.children.length > 0) {
      this.componentsGroup.remove(this.componentsGroup.children[0]);
    }
    this.fanBlades = [];
    this.rgbMaterials = [];
    this.parts = {};

    const activeColor = new THREE.Color(`hsl(${this.currentHue}, 100%, 55%)`).getHex();

    // 1. Build Distinct Chassis Geometry (Lian Li, Fractal North, Corsair, NZXT)
    this.parts.chassis = this.createDistinctChassisMesh(build.chassis);
    this.componentsGroup.add(this.parts.chassis);

    // 2. Build Micro-Detailed Motherboard (Capacitors, Chokes, VRM Fins)
    if (build.mobo) {
      this.parts.mobo = buildMotherboard3D(build.mobo);
      this.parts.mobo.position.set(-0.26, 0.38, -0.06);
      this.componentsGroup.add(this.parts.mobo);
      this.tryLoadExternalMobo();
    }

    // 3. Build CPU
    if (build.cpu) {
      this.parts.cpu = this.createCpuMesh(build.cpu);
      this.componentsGroup.add(this.parts.cpu);
    }

    // 4. Build RAM with Tall / Low-Profile Heatspreaders
    if (build.ram) {
      this.parts.ram = this.createRamMesh(build.ram, activeColor);
      this.componentsGroup.add(this.parts.ram);
    }

    // 5. Build Cooler (Liquid AIO with braided tubes or Dual-Tower Fin Stacks)
    if (build.cooler) {
      const coolerData = buildCooler3D(build.cooler, activeColor);
      this.parts.cooler = coolerData.mesh;
      this.componentsGroup.add(this.parts.cooler);
      this.fanBlades.push(...coolerData.fanBlades);
      this.rgbMaterials.push(...coolerData.argbMaterials);
      this.tryLoadExternalCooler();
    }

    // 6. Build GPU (Clean Procedural Showcase Mount Block)
    if (build.gpu) {
      const gpuData = buildGpu3D(build.gpu, activeColor);
      this.parts.gpu = gpuData.mesh;
      this.parts.gpu.position.set(-0.06, -0.12, -0.62);
      this.componentsGroup.add(this.parts.gpu);
      this.fanBlades.push(...gpuData.fanBlades);
      if (gpuData.argbMaterial) this.rgbMaterials.push(gpuData.argbMaterial);
      // Reverted to clean procedural GPU block as requested
    }

    // 7. Build PSU
    if (build.psu) {
      this.parts.psu = this.createPsuMesh(build.psu);
      this.componentsGroup.add(this.parts.psu);
    }

    // 8. Build Chassis Fans
    this.parts.fans = this.createFansGroup(fanConfig, activeColor);
    this.componentsGroup.add(this.parts.fans);

    // 9. Rebuild Airflow Streamline Particles
    this.rebuildAirflowStreamlines();

    this.applyHue(this.currentHue);
  }

  /* --- DYNAMIC GLTF 3D MODEL LOADERS --- */
  tryLoadExternalGpu() {
    if (this.externalGpuLoading || !window.THREE || !window.THREE.GLTFLoader) return;
    if (this.cachedGpuModel) {
      if (this.parts.gpu) this.componentsGroup.remove(this.parts.gpu);
      this.parts.gpu = this.cachedGpuModel.clone();
      this.componentsGroup.add(this.parts.gpu);
      return;
    }

    this.externalGpuLoading = true;
    const loader = new THREE.GLTFLoader();
    loader.load(
      "assets/models/gpu.glb",
      (gltf) => {
        const model = gltf.scene;

        // Traverse meshes: enable shadows, PBR specular reflection, and connect fan spinners
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.envMapIntensity = 1.35;
              // Preserve the authentic GLTF PBR textures (baseColor, metallicRoughness).
              // Enable radiant LED glow on the authentic "GEFORCE RTX" logo mask.
              if (child.material.emissiveMap) {
                child.material.emissive = new THREE.Color(0xFFFFFF);
                child.material.emissiveIntensity = 2.2;
              }
              child.material.needsUpdate = true;
            }
          }
          if (child.isMesh && child.name && (child.name.includes("Fan_Front") || child.name.includes("Fan_Back"))) {
            child.userData.spinAxis = "z";
            this.fanBlades.push(child);
          }
        });

        // 1. Calculate raw bounding box
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // 2. Center geometry at local origin
        model.position.sub(center);

        // 3. Create inner pivot for proper case orientation
        const innerPivot = new THREE.Group();
        innerPivot.add(model);
        // Rotate -90 deg around Y:
        // - Length lies along Z (rear IO bracket at -Z, front tip at +Z)
        // - Height lies along Y (top edge with 'GEFORCE RTX' illuminated logo at +Y, PCIe pins pointing down into riser at -Y)
        // - Backplate with authentic 'RTX 4090' faces the side glass (+X) in direct showcase view!
        innerPivot.rotation.y = -Math.PI / 2;

        const wrapper = new THREE.Group();
        wrapper.name = "external_gpu";
        wrapper.add(innerPivot);

        // 4. Calculate exact physical scale (RTX 4090 raw length ~319mm -> 1.38 units in scene)
        const rawLength = Math.max(size.x, size.y, size.z);
        const targetLength = 1.38;
        const scale = targetLength / rawLength;
        wrapper.scale.set(scale, scale, scale);

        // 5. Position in vertical GPU showcase mount (seated in bottom riser)
        wrapper.position.set(0.04, 0.08, -0.06);

        this.cachedGpuModel = wrapper;
        if (this.parts.gpu) this.componentsGroup.remove(this.parts.gpu);
        this.parts.gpu = wrapper;
        this.componentsGroup.add(wrapper);
        this.externalGpuLoading = false;
        console.log("[RIG STUDIO] Successfully loaded photorealistic RTX 4090 Founders Edition GPU!");
      },
      undefined,
      (err) => {
        console.warn("[RIG STUDIO] Procedural GPU fallback:", err);
        this.externalGpuLoading = false;
      }
    );
  }

  tryLoadExternalCooler() {
    if (this.externalCoolerLoading || !window.THREE || !window.THREE.GLTFLoader) return;
    if (this.cachedCoolerModel) {
      if (this.parts.cooler) this.componentsGroup.remove(this.parts.cooler);
      this.parts.cooler = this.cachedCoolerModel.clone();
      this.componentsGroup.add(this.parts.cooler);
      return;
    }

    this.externalCoolerLoading = true;
    const loader = new THREE.GLTFLoader();
    loader.load(
      "assets/models/cooler.glb",
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        const wrapper = new THREE.Group();
        wrapper.name = "external_cooler";
        wrapper.add(model);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 0.85 / maxDim;
        wrapper.scale.set(scale, scale, scale);
        wrapper.position.set(-0.06, 0.44, -0.18);

        this.cachedCoolerModel = wrapper;
        if (this.parts.cooler) this.componentsGroup.remove(this.parts.cooler);
        this.parts.cooler = wrapper;
        this.componentsGroup.add(wrapper);
        this.externalCoolerLoading = false;
        console.log("[RIG STUDIO] Successfully loaded photorealistic Cooler: assets/models/cooler.glb");
      },
      undefined,
      () => {
        this.externalCoolerLoading = false;
      }
    );
  }

  tryLoadExternalMobo() {
    if (this.externalMoboLoading || !window.THREE || !window.THREE.GLTFLoader) return;
    if (this.cachedMoboModel) {
      if (this.parts.mobo) this.componentsGroup.remove(this.parts.mobo);
      this.parts.mobo = this.cachedMoboModel.clone();
      this.componentsGroup.add(this.parts.mobo);
      return;
    }

    this.externalMoboLoading = true;
    const loader = new THREE.GLTFLoader();
    loader.load(
      "assets/models/mobo.glb",
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        const wrapper = new THREE.Group();
        wrapper.name = "external_mobo";
        wrapper.add(model);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.35 / maxDim;
        wrapper.scale.set(scale, scale, scale);
        wrapper.position.set(-0.26, 0.38, -0.06);

        this.cachedMoboModel = wrapper;
        if (this.parts.mobo) this.componentsGroup.remove(this.parts.mobo);
        this.parts.mobo = wrapper;
        this.componentsGroup.add(wrapper);
        this.externalMoboLoading = false;
        console.log("[RIG STUDIO] Successfully loaded photorealistic Motherboard: assets/models/mobo.glb");
      },
      undefined,
      () => {
        this.externalMoboLoading = false;
      }
    );
  }

  /* --- FULL PRE-ASSEMBLED SHOWCASE COMPUTER LOADER (LANDING HERO) --- */
  tryLoadShowcaseRig() {
    if (!window.THREE || !window.THREE.GLTFLoader) return;
    const loader = new THREE.GLTFLoader();
    const candidatePaths = [
      "assets/models/test1.glb",
      "assets/models/darth_vader_lian_li_o11d_evo.glb",
      "assets/models/showcase_pc.glb",
      "assets/models/complete_pc.glb"
    ];

    const tryNext = (idx) => {
      if (idx >= candidatePaths.length) return;
      const modelPath = candidatePaths[idx];
      loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;

          this.showcaseRgbMaterials = [];

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.envMapIntensity = 1.35;
                const matName = (child.material.name || "").toLowerCase();
                const meshName = (child.name || "").toLowerCase();

                // 1. Crystal-Clear Tempered Glass (Lian Li Seamless Glass)
                // Fixes roughness bug: metalness on transparent dielectric glass causes noise/dark artifacts
                if (matName.includes("glass") || meshName.includes("glass") || matName.includes("material.001")) {
                  child.material.transparent = true;
                  child.material.opacity = 0.18; // Clean, crystal clear glass
                  child.material.roughness = 0.02; // Super smooth finish, zero haze
                  child.material.metalness = 0.0;  // Dielectric glass MUST have metalness = 0!
                  child.material.depthWrite = false;
                  child.material.needsUpdate = true;
                }
                // 2. Dynamic RGB Diffusers & Halos (Corsair LL/QL Fans, RAM Diffusers, Motherboard Lightpath)
                else if (matName.includes("rgb") || meshName.includes("rgb")) {
                  child.material.roughness = 0.30;
                  child.material.metalness = 0.05;
                  child.material.emissive = new THREE.Color(`hsl(${this.currentHue}, 100%, 55%)`);
                  child.material.emissiveIntensity = 1.4; // Radiant, tasteful glow
                  child.material.userData = { baseEmissiveIntensity: 1.4 };
                  child.material.needsUpdate = true;
                  if (!this.showcaseRgbMaterials.includes(child.material)) {
                    this.showcaseRgbMaterials.push(child.material);
                  }
                }
                // 3. CPU Water Block Glowing Accent
                else if (matName.includes("wcblock") || meshName.includes("wcblock") || meshName.includes("waterblock")) {
                  child.material.roughness = 0.25;
                  child.material.metalness = 0.10;
                  child.material.emissive = new THREE.Color(`hsl(${this.currentHue}, 100%, 55%)`);
                  child.material.emissiveIntensity = 1.2;
                  child.material.userData = { baseEmissiveIntensity: 1.2 };
                  child.material.needsUpdate = true;
                  if (!this.showcaseRgbMaterials.includes(child.material)) {
                    this.showcaseRgbMaterials.push(child.material);
                  }
                }
                // 4. Liquid Coolant Tubing
                else if (matName.includes("tubing") || meshName.includes("tubing")) {
                  child.material.transparent = true;
                  child.material.opacity = 0.65;
                  child.material.roughness = 0.06;
                  child.material.metalness = 0.05;
                  child.material.emissive = new THREE.Color(`hsl(${this.currentHue}, 100%, 55%)`);
                  child.material.emissiveIntensity = 0.32;
                  child.material.userData = { baseEmissiveIntensity: 0.32 };
                  child.material.needsUpdate = true;
                  if (!this.showcaseRgbMaterials.includes(child.material)) {
                    this.showcaseRgbMaterials.push(child.material);
                  }
                }
                // 5. Translucent Fan Blades (Softly catching RGB halo light)
                else if (matName.includes("fan1") || matName.includes("fan3")) {
                  child.material.roughness = 0.35;
                  child.material.metalness = 0.05;
                  child.material.emissive = new THREE.Color(`hsl(${this.currentHue}, 100%, 55%)`);
                  child.material.emissiveIntensity = 0.45;
                  child.material.userData = { baseEmissiveIntensity: 0.45 };
                  child.material.needsUpdate = true;
                  if (!this.showcaseRgbMaterials.includes(child.material)) {
                    this.showcaseRgbMaterials.push(child.material);
                  }
                }
                // 6. RAM Brushed Aluminum Heatspreaders
                else if (matName.includes("ram2") || matName.includes("ram4")) {
                  child.material.roughness = 0.26;
                  child.material.metalness = 0.75;
                  child.material.envMapIntensity = 1.4;
                  child.material.needsUpdate = true;
                }
                // 7. General Fans & Housings
                else if (matName.includes("fan") || meshName.includes("fan")) {
                  child.material.roughness = 0.38;
                  child.material.metalness = 0.15;
                  child.material.needsUpdate = true;
                }
                // 8. Matte Chassis Panels & Motherboard PCB (Smooth out surface noise)
                else {
                  child.material.roughness = Math.max(0.45, child.material.roughness || 0.45);
                  child.material.metalness = Math.min(0.25, child.material.metalness || 0.20);
                  child.material.needsUpdate = true;
                }
              }
            }
          });

          this.applyHue(this.currentHue);

          // Play fan spinning animations embedded in the model
          if (gltf.animations && gltf.animations.length > 0) {
            this.showcaseMixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
              this.showcaseMixer.clipAction(clip).play();
            });
            console.log("[RIG STUDIO] Playing fan animations for showcase PC:", gltf.animations.length);
          }

          // Locate CPU object within showcase model
          let cpuMesh = model.getObjectByName("CPU") || model.getObjectByName("pCube841") || model.getObjectByName("pCube840");
          if (!cpuMesh) {
            model.traverse((c) => {
              if (!cpuMesh && c.name && c.name.toLowerCase().includes("cpu")) {
                cpuMesh = c;
              }
            });
          }
          if (cpuMesh) {
            this.showcaseCpu = cpuMesh;
          }

          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          model.position.sub(center);

          const wrapper = new THREE.Group();
          wrapper.name = "showcase_rig";
          wrapper.add(model);

          // Normalize scale to fit the stage pedestal
          const maxDim = Math.max(size.x, size.y, size.z);
          const targetSize = 2.15;
          const scale = targetSize / maxDim;
          wrapper.scale.set(scale, scale, scale);

          // Sits flush on top of the pedestal floor at y = -0.50
          const bottomOffset = -0.50 + (size.y * scale) / 2;
          wrapper.position.set(0, bottomOffset, 0);

          this.showcaseRig = wrapper;
          this.showcaseRigGroup.add(wrapper);

          // Compute world positions of components for smooth camera macro framing
          wrapper.updateMatrixWorld(true);

          const getObjectWorldCenter = (obj) => {
            if (!obj) return null;
            const b = new THREE.Box3().setFromObject(obj);
            if (b.isEmpty()) return null;
            return b.getCenter(new THREE.Vector3());
          };

          const findMeshByName = (substr) => {
            let found = null;
            model.traverse((c) => {
              if (!found && c.name && c.name.toLowerCase().includes(substr.toLowerCase())) {
                found = c;
              }
            });
            return found;
          };

          if (this.showcaseCpu) {
            const cpuWorld = new THREE.Vector3();
            this.showcaseCpu.getWorldPosition(cpuWorld);
            this.showcaseCpuWorldPos = cpuWorld;
            console.log("[RIG STUDIO] Located showcase CPU at world coords:", cpuWorld);
          }

          const gpuObj = model.getObjectByName("RTX2080ti") || findMeshByName("rtx") || findMeshByName("gpu");
          const coolerObj = model.getObjectByName("WaterBlock") || findMeshByName("waterblock") || findMeshByName("wcblock");
          const ramObj = model.getObjectByName("RAM") || model.getObjectByName("RAM1") || findMeshByName("ram");
          const moboObj = model.getObjectByName("MotherBoard") || findMeshByName("motherboard") || findMeshByName("baseboard");
          const fanObj = model.getObjectByName("Corsair_Fan") || findMeshByName("fan");

          this.showcasePositions = {
            cpu: this.showcaseCpuWorldPos ? this.showcaseCpuWorldPos.clone() : (this.showcaseCpu ? getObjectWorldCenter(this.showcaseCpu) : null),
            gpu: getObjectWorldCenter(gpuObj),
            cooler: getObjectWorldCenter(coolerObj),
            ram: getObjectWorldCenter(ramObj),
            mobo: getObjectWorldCenter(moboObj),
            fans: getObjectWorldCenter(fanObj)
          };

          // Synchronize visibility across both Showcase (Landing) and Studio (Configurator)
          this.updateRigVisibility();

          console.log("[RIG STUDIO] Successfully loaded showcase rig:", modelPath);
        },
        undefined,
        () => {
          tryNext(idx + 1);
        }
      );
    };

    tryNext(0);
  }

  /* --- DISTINCT CHASSIS MESH BUILDER (FRACTAL, CORSAIR, LIAN LI) --- */
  createDistinctChassisMesh(chassis) {
    const group = new THREE.Group();
    group.name = "chassis";

    const caseId = chassis ? chassis.id : "lian-li-o11d-evo";
    const width = 1.15;
    const height = 2.15;
    const length = 2.25;

    if (caseId === "fractal-north") {
      // Charcoal/Black Frame with Real Vertical Walnut Wood Slats & Brass Accent
      const darkSteel = new THREE.MeshStandardMaterial({ color: 0x181A1F, metalness: 0.5, roughness: 0.4 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x6E4423, roughness: 0.65, metalness: 0.05 });

      // Tray & Shroud
      const tray = new THREE.Mesh(new THREE.BoxGeometry(0.04, height * 0.74, length * 0.72), darkSteel);
      tray.position.set(-width * 0.3, 0.3, -0.06);
      group.add(tray);

      const shroud = new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, 0.38, length * 0.9), darkSteel);
      shroud.position.set(0, -0.32, 0);
      group.add(shroud);

      // 10 Distinct 3D Walnut Wood Slats on Front
      const slatCount = 10;
      const slatSpan = (width * 0.8) / slatCount;
      for (let s = 0; s < slatCount; s++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.045, height * 0.86, 0.035), woodMat);
        slat.position.set((-width * 0.4) + (s * slatSpan) + 0.04, 0.22, length * 0.46);
        slat.castShadow = true;
        group.add(slat);
      }

      // Brass Power Button
      const brass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.03, 16),
        new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.95, roughness: 0.15 })
      );
      brass.position.set(width * 0.35, height * 0.64, length * 0.44);
      group.add(brass);

      // Mesh Side Panel
      const meshGlassMat = new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, transmission: 0.92, transparent: true, roughness: 0.1 });
      const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.018, height * 0.86, length * 0.92), meshGlassMat);
      sideGlass.position.set(width * 0.46, 0.22, 0);
      group.add(sideGlass);

      return group;
    }

    if (caseId === "corsair-4000d-airflow") {
      // High-Airflow Perforated Steel Front with Yellow Accent Tabs
      const darkSteel = new THREE.MeshStandardMaterial({ color: 0x1A1C22, metalness: 0.6, roughness: 0.35 });
      const tray = new THREE.Mesh(new THREE.BoxGeometry(0.04, height * 0.74, length * 0.72), darkSteel);
      tray.position.set(-width * 0.3, 0.3, -0.06);
      group.add(tray);

      const frontMesh = new THREE.Mesh(new THREE.BoxGeometry(width * 0.92, height * 0.88, 0.03), darkSteel);
      frontMesh.position.set(0, 0.22, length * 0.46);
      group.add(frontMesh);

      // Corsair Yellow Accent Pip
      const yellowPip = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.08, 0.01),
        new THREE.MeshBasicMaterial({ color: 0xFFD700 })
      );
      yellowPip.position.set(width * 0.42, -0.2, length * 0.48);
      group.add(yellowPip);

      const sideGlass = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, height * 0.86, length * 0.92),
        new THREE.MeshPhysicalMaterial({ color: 0xFFFFFF, transmission: 0.96, transparent: true, roughness: 0.05 })
      );
      sideGlass.position.set(width * 0.46, 0.22, 0);
      group.add(sideGlass);

      return group;
    }

    // Default: LIAN LI O11 VISION WHITE (Authentic 3-Sided Seamless Glass Dual Chamber)
    const whiteSteelMat = new THREE.MeshStandardMaterial({ 
      color: 0xFAFCFF, 
      roughness: 0.22, 
      metalness: 0.18 
    });

    const trayTexture = createLianLiTrayTexture();
    const trayMat = new THREE.MeshStandardMaterial({
      map: trayTexture,
      color: 0xFAFCFF,
      roughness: 0.28,
      metalness: 0.15
    });

    const grommetTexture = createRubberGrommetTexture();
    const grommetMat = new THREE.MeshStandardMaterial({ 
      map: grommetTexture,
      roughness: 0.85 
    });

    // 1. Main Motherboard Tray with Standoffs & Stamped Steel Rigidity Indents
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.035, height * 0.74, length * 0.72), trayMat);
    tray.position.set(-width * 0.3, 0.3, -0.06);
    group.add(tray);

    // 9x Brass ATX Motherboard Standoffs
    const standoffMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.95, roughness: 0.1 });
    const standoffs = [
      [0.32, -0.38], [0.32, -0.06], [0.32, 0.26],
      [-0.05, -0.38], [-0.05, -0.06], [-0.05, 0.26],
      [-0.42, -0.38], [-0.42, -0.06], [-0.42, 0.26]
    ];
    standoffs.forEach(([yOff, zOff]) => {
      const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.025, 12), standoffMat);
      peg.rotation.z = Math.PI / 2;
      peg.position.set(-width * 0.275, 0.3 + yOff, zOff);
      group.add(peg);
    });

    // 2. CPU Backplate Honeycomb Perforation Cutout
    const cpuCutout = new THREE.Mesh(
      new THREE.BoxGeometry(0.042, 0.54, 0.54),
      new THREE.MeshStandardMaterial({ map: createHoneycombTexture(), roughness: 0.45 })
    );
    cpuCutout.position.set(-width * 0.3, 0.55, -0.15);
    group.add(cpuCutout);

    // 3. Right Dual-Chamber Partition with 2x Vertical Cable Grommets
    const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.035, height * 0.82, 0.38), whiteSteelMat);
    sideWall.position.set(-width * 0.3, 0.3, 0.48);
    group.add(sideWall);

    // 2 Vertical Grommets (Upper & Lower)
    [0.15, 0.55].forEach(yPos => {
      const grommet = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.28, 0.12), grommetMat);
      grommet.position.set(-width * 0.3, yPos, 0.48);
      group.add(grommet);
    });

    // 2 Horizontal Top Grommets (Above Motherboard)
    [-0.32, 0.05].forEach(zPos => {
      const topGrommet = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.10, 0.22), grommetMat);
      topGrommet.position.set(-width * 0.3, height * 0.65, zPos);
      group.add(topGrommet);
    });

    // 4. Side Recessed 360mm Fan / Radiator Mounting Bracket (From Reference Photo)
    const sideRadFrame = new THREE.Mesh(new THREE.BoxGeometry(0.025, height * 0.78, 0.44), whiteSteelMat);
    sideRadFrame.position.set(-width * 0.25, 0.3, 0.65);
    group.add(sideRadFrame);

    // 3x Elongated Vertical Mounting Slots on Side Bracket
    const slotCutoutMat = new THREE.MeshBasicMaterial({ color: 0x0A0D12 });
    for (let s = -1; s <= 1; s++) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.38, 0.08), slotCutoutMat);
      slot.position.set(-width * 0.245, 0.3 + (s * 0.44), 0.65);
      group.add(slot);
    }

    // 5. Rear Panel with Honeycomb Exhaust & 7x White PCIe Slots
    const rearWall = new THREE.Mesh(new THREE.BoxGeometry(width * 0.94, height * 0.86, 0.04), whiteSteelMat);
    rearWall.position.set(0, 0.24, -length * 0.46);
    group.add(rearWall);

    // Dual 120mm Rear Honeycomb Fan Mesh
    const rearMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.72, 0.045),
      new THREE.MeshStandardMaterial({ map: createHoneycombTexture(), roughness: 0.45 })
    );
    rearMesh.position.set(-0.1, 0.46, -length * 0.46);
    group.add(rearMesh);

    // 7x White Modular PCIe Expansion Slot Covers with Thumbscrews
    const thumbscrewMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.95 });
    for (let p = 0; p < 7; p++) {
      const pcie = new THREE.Mesh(
        new THREE.BoxGeometry(0.028, 0.045, 0.34),
        new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.25, metalness: 0.3 })
      );
      pcie.position.set(-width * 0.12, 0.08 + (p * 0.055), -length * 0.44);
      group.add(pcie);

      // Chrome Thumbscrew
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.015, 12), thumbscrewMat);
      screw.rotation.x = Math.PI / 2;
      screw.position.set(-width * 0.22, 0.08 + (p * 0.055), -length * 0.44 + 0.01);
      group.add(screw);
    }

    // 6. Base Floor & Sculpted Angled Pedestal Feet
    const baseFloor = new THREE.Mesh(new THREE.BoxGeometry(width * 0.96, 0.14, length * 0.94), whiteSteelMat);
    baseFloor.position.set(0, -0.4, 0);
    group.add(baseFloor);

    // 4 Distinct Lian Li Angled Pedestal Feet with Chamfered Corners
    [
      [-width * 0.42, -0.48, -length * 0.42],
      [width * 0.42, -0.48, -length * 0.42],
      [-width * 0.42, -0.48, length * 0.42],
      [width * 0.42, -0.48, length * 0.42]
    ].forEach(([fx, fy, fz]) => {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.16), whiteSteelMat);
      foot.position.set(fx, fy, fz);
      group.add(foot);

      // Rubber anti-vibration bottom pad
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.01, 0.14),
        new THREE.MeshStandardMaterial({ color: 0x1E2024, roughness: 0.9 })
      );
      pad.position.set(fx, fy - 0.04, fz);
      group.add(pad);
    });

    // Front-Right Beveled I/O Module (Type-C, Dual USB 3.0, 3.5mm Audio)
    const ioClusterMat = new THREE.MeshBasicMaterial({ color: 0x0F172A });
    // 3.5mm Audio Port
    const audioJack = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.02, 16), ioClusterMat);
    audioJack.rotation.x = Math.PI / 2;
    audioJack.position.set(width * 0.32, -0.44, length * 0.47);
    group.add(audioJack);

    // USB Type-C Port
    const usbC = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.009, 0.02), ioClusterMat);
    usbC.position.set(width * 0.355, -0.44, length * 0.47);
    group.add(usbC);

    // Dual USB 3.0 Type-A Ports (Blue/Black)
    for (let u = 0; u < 2; u++) {
      const usbA = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, 0.014, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x0284C7 })
      );
      usbA.position.set(width * (0.39 + (u * 0.035)), -0.44, length * 0.47);
      group.add(usbA);
    }

    // 7. Authentic 3-Sided Panoramic Seamless Glass (Top, Front, Side - NO PILLARS!)
    const visionGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      transmission: 0.985,
      transparent: true,
      roughness: 0.01,
      ior: 1.52,
      thickness: 0.022,
      reflectivity: 0.92
    });

    // Top Panoramic Glass
    const topGlass = new THREE.Mesh(new THREE.BoxGeometry(width * 0.94, 0.018, length * 0.92), visionGlassMat);
    topGlass.position.set(0, height * 0.64, 0);
    group.add(topGlass);

    // Front Panoramic Glass
    const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(width * 0.94, height * 0.86, 0.018), visionGlassMat);
    frontGlass.position.set(0, 0.22, length * 0.46);
    group.add(frontGlass);

    // Side Panoramic Glass
    const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.018, height * 0.86, length * 0.92), visionGlassMat);
    sideGlass.position.set(width * 0.46, 0.22, 0);
    group.add(sideGlass);

    return group;
  }

  /* --- CPU IHS --- */
  createCpuMesh(cpu) {
    const group = new THREE.Group();
    group.name = "cpu";
    group.position.set(-0.23, 0.58, -0.1);

    const socketFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.38, 0.38),
      new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.85, roughness: 0.18 })
    );
    group.add(socketFrame);

    const ihsTexture = createCpuTexture(cpu ? cpu.name : "AMD RYZEN 7 7800X3D");
    const ihs = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.28, 0.28),
      new THREE.MeshStandardMaterial({ map: ihsTexture, metalness: 0.95, roughness: 0.15 })
    );
    ihs.position.x = 0.015;
    group.add(ihs);

    return group;
  }

  /* --- RAM MODULES (NON-INTERSECTING DUAL DIMM CHANNELS & CRISP BADGE) --- */
  createRamMesh(ram, activeColor) {
    const group = new THREE.Group();
    group.name = "ram";
    // Placed adjacent to CPU socket on motherboard
    group.position.set(-0.2, 0.6, 0.225);

    const isLowProfile = ram && ram.height <= 35;
    const isRgb = ram && ram.rgb !== false;
    const isWhite = !ram || !ram.name || ram.name.toLowerCase().includes("white") || ram.name.toLowerCase().includes("trident");
    const heightScale = isLowProfile ? 0.18 : 0.26;

    // High-Resolution Crisp Laser-Etched RAM Name Texture (Dynamic to selected RAM!)
    const ramBadgeTex = createRamTexture(ram, isWhite);
    const badgeMat = new THREE.MeshBasicMaterial({
      map: ramBadgeTex,
      transparent: true,
      toneMapped: false
    });

    const heatspreaderMat = new THREE.MeshStandardMaterial({
      color: isWhite ? 0xF8FAFC : 0x1A1D24,
      metalness: 0.88,
      roughness: 0.22
    });

    const chromeTrimMat = new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      metalness: 0.96,
      roughness: 0.1
    });

    const goldPinMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      metalness: 0.95,
      roughness: 0.1
    });

    const rgbMat = new THREE.MeshStandardMaterial({
      color: activeColor,
      emissive: activeColor,
      emissiveIntensity: isRgb ? 1.3 : 0.0
    });
    if (isRgb) this.rgbMaterials.push(rgbMat);

    // Two Parallel DIMM Slots separated in depth (X) so they NEVER intersect or Z-fight!
    [-0.016, 0.016].forEach((offsetX, stickIdx) => {
      const stickGroup = new THREE.Group();
      stickGroup.position.set(offsetX, 0, 0);

      // Solid Brushed Aluminum Heatspreader Body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.013, heightScale, 0.52),
        heatspreaderMat
      );
      body.castShadow = true;
      stickGroup.add(body);

      // Dedicated Outer Laser-Etched Branding Badge (Single Plane = ZERO Z-fighting & ZERO edge distortion!)
      const badge = new THREE.Mesh(
        new THREE.PlaneGeometry(0.46, heightScale * 0.72),
        badgeMat
      );
      badge.rotation.y = Math.PI / 2;
      badge.position.set(0.0072, 0, 0);
      stickGroup.add(badge);

      // Top ARGB Light Diffuser Blade
      if (isRgb) {
        const lightbar = new THREE.Mesh(
          new THREE.BoxGeometry(0.016, 0.034, 0.52),
          rgbMat
        );
        lightbar.position.set(0, (heightScale / 2) + 0.016, 0);
        stickGroup.add(lightbar);

        // Polished Chrome Center Fin Ridge
        const ridge = new THREE.Mesh(
          new THREE.BoxGeometry(0.018, 0.014, 0.12),
          chromeTrimMat
        );
        ridge.position.set(0, (heightScale / 2) + 0.024, 0);
        stickGroup.add(ridge);
      }

      // Bottom Gold Pin Connector Fingers (Pins into Motherboard Slot)
      const goldPins = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 0.035, 0.49),
        goldPinMat
      );
      goldPins.position.set(0, -(heightScale / 2) - 0.012, 0);
      stickGroup.add(goldPins);

      group.add(stickGroup);
    });

    return group;
  }

  /* --- POWER SUPPLY (SEASONIC 80+ GOLD WITH DETAILED SPEC PLATE) --- */
  createPsuMesh(psu) {
    const group = new THREE.Group();
    group.name = "psu";
    // Placed behind motherboard tray (X < -0.35) in dedicated lower PSU chamber
    group.position.set(-0.46, -0.15, -0.42);

    const wattage = psu && psu.wattage ? psu.wattage : 1000;
    const isWhite = psu && psu.name && psu.name.toLowerCase().includes("white");

    const boxMat = new THREE.MeshStandardMaterial({
      color: isWhite ? 0xF8FAFC : 0x14171E,
      metalness: 0.6,
      roughness: 0.35
    });

    // PSU Body
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.52), boxMat);
    box.castShadow = true;
    group.add(box);

    // Realistic Seasonic 80-Plus Gold Spec Plate on Left Side
    const specTex = createPsuSpecTexture(wattage);
    const specPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.24),
      new THREE.MeshStandardMaterial({ map: specTex, roughness: 0.4 })
    );
    specPlate.rotation.y = -Math.PI / 2;
    specPlate.position.set(-0.111, 0, 0);
    group.add(specPlate);

    // Rear AC Power Socket (C14 Inlet)
    const socket = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.05, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x0B0D12, roughness: 0.9 })
    );
    socket.position.set(0.04, -0.04, -0.265);
    group.add(socket);

    // Rear Rocker Power Switch (Red/Black)
    const switchMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.04, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.4 })
    );
    switchMesh.position.set(-0.04, -0.04, -0.265);
    group.add(switchMesh);

    // Front Modular DC Cable Ports Grid
    const modularMat = new THREE.MeshStandardMaterial({ color: 0x090B10, roughness: 0.7 });
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        const port = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.028, 0.015), modularMat);
        port.position.set(-0.055 + (r * 0.07), -0.06 + (c * 0.045), 0.262);
        group.add(port);
      }
    }

    return group;
  }

  /* --- FANS GROUP --- */
  createFansGroup(fanConfig, activeColor) {
    const group = new THREE.Group();
    group.name = "fans";

    for (let r = 0; r < 2; r++) {
      const fan = this.createCaseFanUnit(activeColor);
      fan.mesh.position.set(-0.1, 0.28 + (r * 0.42), -0.92);
      group.add(fan.mesh);
      this.fanBlades.push(fan.blades);
      this.rgbMaterials.push(fan.rgbMat);
    }

    for (let b = -1; b <= 1; b++) {
      const fan = this.createCaseFanUnit(activeColor);
      fan.mesh.rotation.x = Math.PI / 2;
      fan.mesh.position.set(0.08, -0.32, b * 0.48);
      group.add(fan.mesh);
      this.fanBlades.push(fan.blades);
      this.rgbMaterials.push(fan.rgbMat);
    }

    return group;
  }

  createCaseFanUnit(activeColor) {
    const unit = new THREE.Group();

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xFAFCFF,
      roughness: 0.32,
      metalness: 0.12
    });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.06), frameMat);
    unit.add(frame);

    // 4x Charcoal Silicone Anti-Vibration Damping Pads
    const padMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.88 });
    [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].forEach(([px, py]) => {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 0.062), padMat);
      pad.position.set(px, py, 0);
      unit.add(pad);
    });

    // Side Brushed Aluminum Trim Plates (Lian Li UNI Fan Style)
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.92, roughness: 0.18 });
    [-0.188, 0.188].forEach(xPos => {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.36, 0.05), trimMat);
      trim.position.set(xPos, 0, 0);
      unit.add(trim);
    });

    // Glowing ARGB Ring
    const rgbMat = new THREE.MeshStandardMaterial({
      color: activeColor,
      emissive: activeColor,
      emissiveIntensity: 1.25
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.162, 24), rgbMat);
    ring.position.z = 0.031;
    unit.add(ring);

    // Spinning Blades Group
    const bladeGroup = new THREE.Group();

    // Center Metal Hub with Holographic Brand Badge
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.03, 16),
      new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.7 })
    );
    hub.rotation.x = Math.PI / 2;
    bladeGroup.add(hub);

    const badgeTex = createFanHubBadgeTexture("LIAN LI");
    const badge = new THREE.Mesh(
      new THREE.CircleGeometry(0.052, 16),
      new THREE.MeshBasicMaterial({ map: badgeTex })
    );
    badge.position.z = 0.016;
    bladeGroup.add(badge);

    // 7x Frosted White Blades
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xF1F5F9,
      roughness: 0.25,
      metalness: 0.05,
      transparent: true,
      opacity: 0.92
    });
    for (let b = 0; b < 7; b++) {
      const angle = (b / 7) * Math.PI * 2;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.012), bladeMat);
      blade.position.set(Math.cos(angle) * 0.09, Math.sin(angle) * 0.09, 0);
      blade.rotation.z = angle + 0.45;
      bladeGroup.add(blade);
    }

    bladeGroup.position.z = 0.01;
    unit.add(bladeGroup);

    return { mesh: unit, blades: bladeGroup, rgbMat };
  }

  /* ----------------------------------------------------
     DYNAMIC AIRFLOW STREAMLINE PARTICLES (DISABLED)
  ---------------------------------------------------- */
  rebuildAirflowStreamlines() {
    if (this.airflowGroup) {
      while (this.airflowGroup.children.length > 0) {
        this.airflowGroup.remove(this.airflowGroup.children[0]);
      }
      this.airflowGroup.visible = false;
    }
    this.airflowParticles = [];
  }

  resetAirflowParticle(p) {}

  updateAirflowParticles() {}

  toggleAirflow(enabled) {
    this.showAirflow = false;
    if (this.airflowGroup) this.airflowGroup.visible = false;
  }

  /* ----------------------------------------------------
     RGB CONTROLLER
  ---------------------------------------------------- */
  setHue(hue) {
    this.currentHue = hue;
    this.isRainbowWave = false;
    this.applyHue(hue);
  }

  setRainbowWave(enabled) {
    this.isRainbowWave = enabled;
  }

  setBreathe(enabled) {
    this.isBreathe = enabled;
  }

  applyHue(hue, intensityMultiplier = 1.0) {
    const color = new THREE.Color(`hsl(${hue}, 100%, 55%)`);

    this.rgbLights.forEach(light => {
      light.color.copy(color);
      const base = light.userData && light.userData.baseIntensity ? light.userData.baseIntensity : 3.0;
      light.intensity = base * intensityMultiplier;
    });

    this.rgbMaterials.forEach(mat => {
      mat.color.copy(color);
      mat.emissive.copy(color);
      mat.emissiveIntensity = 2.4 * intensityMultiplier;
    });

    if (this.showcaseRgbMaterials && this.showcaseRgbMaterials.length > 0) {
      this.showcaseRgbMaterials.forEach(mat => {
        mat.emissive.copy(color);
        const base = mat.userData && mat.userData.baseEmissiveIntensity ? mat.userData.baseEmissiveIntensity : 1.35;
        mat.emissiveIntensity = base * intensityMultiplier;
      });
    }
  }

  /* ----------------------------------------------------
     RIG CONTINUITY & MODEL VISIBILITY
  ---------------------------------------------------- */
  isLianLiChassis() {
    return !this.currentBuild || !this.currentBuild.chassis || this.currentBuild.chassis.id === "lian-li-o11d-evo";
  }

  updateRigVisibility() {
    const useShowcase = Boolean(this.showcaseRig && this.isLianLiChassis());
    if (this.showcaseRigGroup) this.showcaseRigGroup.visible = useShowcase;
    if (this.componentsGroup) this.componentsGroup.visible = !useShowcase;
    if (this.airflowGroup && !this.showAirflow) this.airflowGroup.visible = false;
  }

  /* ----------------------------------------------------
     ORBITAL SPHERICAL CAMERA GLIDE (BUTTER-SMOOTH)
  ---------------------------------------------------- */
  transitionCameraTo(targetPos, targetLookAt, duration = 750) {
    this.targetCamPos = null;

    const startPos = this.camera.position.clone();
    const startLook = this.controls.target.clone();
    const endPos = targetPos.clone();
    const endLook = targetLookAt.clone();

    if (startPos.distanceTo(endPos) < 0.01 && startLook.distanceTo(endLook) < 0.01) {
      this.cameraTransition = null;
      this.camera.position.copy(endPos);
      this.controls.target.copy(endLook);
      this.controls.update();
      return;
    }

    const relStart = startPos.clone().sub(startLook);
    const relEnd = endPos.clone().sub(endLook);

    const sStart = new THREE.Spherical().setFromVector3(relStart);
    const sEnd = new THREE.Spherical().setFromVector3(relEnd);

    // Shortest angular path around azimuth
    let dTheta = (sEnd.theta - sStart.theta) % (Math.PI * 2);
    if (dTheta > Math.PI) dTheta -= Math.PI * 2;
    if (dTheta < -Math.PI) dTheta += Math.PI * 2;

    this.cameraTransition = {
      startLook,
      endLook,
      sStart,
      dRadius: sEnd.radius - sStart.radius,
      dPhi: sEnd.phi - sStart.phi,
      dTheta,
      startTime: performance.now(),
      duration: Math.max(250, duration)
    };
  }

  /* ----------------------------------------------------
     MACRO CAMERAS & COMPONENT FRAMING
  ---------------------------------------------------- */
  setCameraMode(mode) {
    this.cameraMode = mode;
    if (this.isCpuFocused) {
      this.isCpuFocused = false;
      if (this.onCpuFocusChange) this.onCpuFocusChange(false);
    }

    // Retain exact same model across Landing and Studio!
    this.updateRigVisibility();

    if (mode === "studio") {
      this.controls.autoRotate = false;
      // Framed to left-center of viewport to leave breathing room for floating acrylic slate on the right
      const studioCamPos = new THREE.Vector3(2.55, 1.48, 2.65);
      const studioLookAt = new THREE.Vector3(0.18, 0.38, -0.05);
      this.transitionCameraTo(studioCamPos, studioLookAt, 750);
    } else {
      this.cameraMode = "showcase";
      this.userInteractedShowcase = false;
      this.heroSweepTime = 0.78;
      const theta = this.heroAzimuthCenter;
      const heroCamPos = new THREE.Vector3(
        Math.sin(theta) * this.heroRadius,
        this.heroHeightCenter,
        Math.cos(theta) * this.heroRadius
      );
      const heroLookAt = new THREE.Vector3(0, 0.48, 0);
      this.transitionCameraTo(heroCamPos, heroLookAt, 750);
    }
  }

  focusOn(category) {
    if (category === "cpu") {
      this.setMacroPreset("cpu");
      return;
    }

    if (this.isCpuFocused) {
      this.isCpuFocused = false;
      if (this.onCpuFocusChange) this.onCpuFocusChange(false);
    }

    this.cameraMode = "macro";
    this.controls.autoRotate = false;
    this.updateRigVisibility();

    const isShowcase = Boolean(this.showcaseRig && this.isLianLiChassis());

    if (isShowcase && this.showcasePositions && this.showcasePositions[category]) {
      const pos = this.showcasePositions[category];
      let offset = new THREE.Vector3(0.65, 0.30, 0.65);
      if (category === "gpu") offset.set(0.60, 0.18, 0.50);
      else if (category === "cooler") offset.set(0.50, 0.22, 0.60);
      else if (category === "ram" || category === "mobo") offset.set(0.55, 0.25, 0.55);
      else if (category === "fans") offset.set(0.85, 0.35, 0.75);

      this.transitionCameraTo(pos.clone().add(offset), pos.clone(), 650);
      return;
    }

    if (category === "gpu") {
      this.transitionCameraTo(new THREE.Vector3(1.15, 0.48, 0.25), new THREE.Vector3(0.0, 0.30, 0.05), 650);
    } else if (category === "cooler") {
      this.transitionCameraTo(new THREE.Vector3(0.42, 0.65, 0.32), new THREE.Vector3(-0.15, 0.58, -0.1), 650);
    } else if (category === "mobo" || category === "ram") {
      this.transitionCameraTo(new THREE.Vector3(0.65, 0.75, 0.55), new THREE.Vector3(-0.2, 0.55, 0.05), 650);
    } else if (category === "fans") {
      this.transitionCameraTo(new THREE.Vector3(1.8, 0.9, -0.8), new THREE.Vector3(0, 0.2, -0.4), 650);
    } else {
      this.transitionCameraTo(new THREE.Vector3(2.55, 1.48, 2.65), new THREE.Vector3(0.18, 0.38, -0.05), 650);
    }
  }

  setMacroPreset(preset) {
    this.controls.autoRotate = false;
    const isLanding = (this.cameraMode === "showcase");
    const isShowcase = Boolean(this.showcaseRig && this.isLianLiChassis());

    if (preset === "cpu") {
      this.isCpuFocused = true;
      if (this.onCpuFocusChange) this.onCpuFocusChange(true);
      this.cameraMode = "macro";
      this.updateRigVisibility();

      if (isShowcase && this.showcaseCpuWorldPos) {
        const targetLookAt = this.showcaseCpuWorldPos.clone();
        const targetCamPos = this.showcaseCpuWorldPos.clone().add(new THREE.Vector3(0.52, 0.22, 0.72));
        this.transitionCameraTo(targetCamPos, targetLookAt, 650);
      } else {
        this.transitionCameraTo(new THREE.Vector3(0.65, 0.75, 0.55), new THREE.Vector3(-0.2, 0.55, 0.05), 650);
      }
      return;
    }

    if (this.isCpuFocused) {
      this.isCpuFocused = false;
      if (this.onCpuFocusChange) this.onCpuFocusChange(false);
    }

    if (preset === "rig") {
      if (isLanding) {
        this.setCameraMode("showcase");
      } else {
        this.setCameraMode("studio");
      }
      return;
    }

    this.focusOn(preset);
  }

  resetCamera() {
    if (this.cameraMode === "showcase") {
      this.setCameraMode("showcase");
    } else {
      this.setCameraMode("studio");
    }
  }

  /* ----------------------------------------------------
     ANIMATION LOOP
  ---------------------------------------------------- */
  animate() {
    requestAnimationFrame(this.animate);
    this.rgbAnimTime += 0.02;

    // Update showcase model animations (fan spinning)
    if (this.showcaseMixer) {
      const delta = this.clock ? this.clock.getDelta() : 0.016;
      this.showcaseMixer.update(delta);
    }

    this.fanBlades.forEach(bladeGroup => {
      const axis = bladeGroup.userData.spinAxis || "z";
      bladeGroup.rotation[axis] += 0.08;
    });

    this.updateAirflowParticles();

    if (this.isRainbowWave) {
      this.currentHue = (this.currentHue + 0.65) % 360;
    }

    let intensity = 1.0;
    if (this.isBreathe) {
      intensity = 0.5 + Math.sin(this.rgbAnimTime * 2.5) * 0.5;
    }

    if (this.isRainbowWave || this.isBreathe) {
      this.applyHue(this.currentHue, intensity);
    }

    // 1. Pristine timed camera glide with spherical orbital path and quintic ease-out curve
    if (this.cameraTransition) {
      const elapsed = performance.now() - this.cameraTransition.startTime;
      const progress = Math.min(1.0, elapsed / this.cameraTransition.duration);
      // Quintic ease-out matching CSS cubic-bezier(0.16, 1, 0.3, 1)
      const ease = 1 - Math.pow(1 - progress, 4);

      const trans = this.cameraTransition;
      const curLook = new THREE.Vector3().lerpVectors(trans.startLook, trans.endLook, ease);

      const curRadius = trans.sStart.radius + trans.dRadius * ease;
      const curPhi = trans.sStart.phi + trans.dPhi * ease;
      const curTheta = trans.sStart.theta + trans.dTheta * ease;

      const offset = new THREE.Vector3().setFromSphericalCoords(curRadius, curPhi, curTheta);
      this.camera.position.copy(curLook).add(offset);
      this.controls.target.copy(curLook);
      this.controls.update();

      if (progress >= 1.0) {
        this.cameraTransition = null;
      }
    } else if (this.targetCamPos) {
      this.camera.position.lerp(this.targetCamPos, 0.075);
      this.controls.target.lerp(this.targetLookAt, 0.075);
      this.controls.update();
      if (this.camera.position.distanceTo(this.targetCamPos) < 0.02) {
        this.targetCamPos = null;
      }
    }

    // Smooth proximity detection if user zooms close to CPU on showcase rig
    if ((this.cameraMode === "showcase" || this.isCpuFocused) && this.showcaseCpuWorldPos) {
      const dist = this.camera.position.distanceTo(this.showcaseCpuWorldPos);
      if (!this.isCpuFocused && dist < 1.45 && !this.cameraTransition) {
        this.isCpuFocused = true;
        if (this.onCpuFocusChange) this.onCpuFocusChange(true);
      } else if (this.isCpuFocused && dist > 2.3 && !this.cameraTransition && !this.targetCamPos) {
        this.isCpuFocused = false;
        if (this.onCpuFocusChange) this.onCpuFocusChange(false);
      }
    }

    // --- HERO SWEEP MOTION & INTERACTION ---
    const isShowcase = (this.cameraMode === "showcase");

    if (isShowcase && !this.isCpuFocused) {
      this.controls.autoRotate = false; // Disables 360 spin in showcase mode

      if (!this.cameraTransition && !this.targetCamPos) {
        if (this.isUserDragging) {
          // User is actively dragging; let OrbitControls handle user rotation
          this.userInteractedShowcase = true;
          this.lastUserInteractTime = performance.now();
        } else if (this.userInteractedShowcase) {
          // User dragged previously. Idle check: after 3 seconds, glide back to hero sweep arc!
          const idleElapsed = (performance.now() - this.lastUserInteractTime) / 1000;
          if (idleElapsed > 3.0) {
            const theta = this.heroAzimuthCenter + this.heroAzimuthAmp * Math.sin(this.heroSweepTime);
            const targetX = Math.sin(theta) * this.heroRadius;
            const targetZ = Math.cos(theta) * this.heroRadius;
            const targetY = this.heroHeightCenter + this.heroHeightAmp * Math.cos(this.heroSweepTime * 0.5);
            const targetPos = new THREE.Vector3(targetX, targetY, targetZ);
            const targetLook = new THREE.Vector3(0, 0.48, 0);

            this.camera.position.lerp(targetPos, 0.035);
            this.controls.target.lerp(targetLook, 0.035);

            if (this.camera.position.distanceTo(targetPos) < 0.12) {
              this.userInteractedShowcase = false;
            }
          }
        } else {
          // ACTIVE HERO SWEEP:
          // Smooth pendulum sweep prioritizing the front-three-quarter view (21° to 65°)
          this.heroSweepTime += 0.007;
          const theta = this.heroAzimuthCenter + this.heroAzimuthAmp * Math.sin(this.heroSweepTime);
          const targetX = Math.sin(theta) * this.heroRadius;
          const targetZ = Math.cos(theta) * this.heroRadius;
          const targetY = this.heroHeightCenter + this.heroHeightAmp * Math.cos(this.heroSweepTime * 0.5);

          this.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.045);
          this.controls.target.lerp(new THREE.Vector3(0, 0.48, 0), 0.045);
        }
      }
      this.controls.update();
    } else if (!isShowcase && !this.cameraTransition) {
      // In studio builder mode, standard OrbitControls behavior
      const shouldAuto = this.controls.autoRotate && !this.isUserDragging && !this.targetCamPos;
      const origAuto = this.controls.autoRotate;
      this.controls.autoRotate = shouldAuto;
      this.controls.update();
      this.controls.autoRotate = origAuto;
    } else if (this.isCpuFocused && !this.cameraTransition) {
      // CPU focused in showcase
      this.controls.update();
    }

    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

function radiusBlade(r) {
  return [0.1, 0.05, 0.012];
}
