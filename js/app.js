/* AERO Application Controller (VIBGYOR Spectrum & Lian Li O11 Vision) */
import { HARDWARE_DB } from "../data/hardware.js";
import { runDiagnostics } from "./clearance.js";
import { PCStudioScene } from "./scene.js?v=4.3";
import { ParticleHeadline } from "./particle_text.js?v=4.3";

class AeroApp {
  constructor() {
    this.scene = null;
    this.particleHeadline = null;
    this.activeCategory = "chassis";

    // Enthusiast White-Themed Rig Setup
    this.build = {
      chassis: HARDWARE_DB.chassis[0],   // Lian Li O11 Vision / EVO
      mobo: HARDWARE_DB.motherboards[0], // ASUS ROG B650E-F White
      cpu: HARDWARE_DB.cpus[0],          // Ryzen 7 7800X3D
      cooler: HARDWARE_DB.coolers[2],    // Arctic Liquid Freezer III 360
      gpu: HARDWARE_DB.gpus[0],          // RTX 4090 White Edition
      ram: HARDWARE_DB.ram[0],           // G.Skill Trident Z5 RGB
      psu: HARDWARE_DB.psu[0]            // Seasonic 1000W
    };

    this.theme = "light";

    this.fanConfig = {
      front: { count: 3, dir: "intake" },
      top: { count: 0, dir: "exhaust" }, // O11 Vision has top glass! Radiator mounts on side/bottom
      rear: { count: 2, dir: "exhaust" },
      bottom: { count: 3, dir: "intake" }
    };

    this.init();
  }

  init() {
    const container = document.getElementById("canvas-container");
    this.scene = new PCStudioScene(container);

    // Initialize Living Dot-Particle Headline
    const wrapEl = document.getElementById("hero-headline-wrap");
    const headlineEl = document.getElementById("hero-headline");
    if (wrapEl && headlineEl) {
      this.particleHeadline = new ParticleHeadline(wrapEl, headlineEl);
    }

    // Connect CPU focus trigger to particle text zoom/fade
    this.scene.onCpuFocusChange = (focused) => {
      if (this.particleHeadline) {
        this.particleHeadline.setFocused(focused);
      }
    };

    this.runIntroPreloader();
    this.bindLandingTransitions();
    this.bindVibgyorSpectrum();
    this.bindThemeToggle();
    this.renderCategoryNav();
    this.renderComponentSelector();
    this.bindModalControls();
    this.bindViewportControls();
    this.bindCheckoutControls();
    this.bindAboutModal();
    this.bindOrientationControl();
    this.bindFullscreenControls();

    this.refreshAll();
  }

  /* ----------------------------------------------------
     INTRO SPLASH CURTAIN (2-SECOND DELAY, LIFTS UP TO REVEAL STAGE)
  ---------------------------------------------------- */
  runIntroPreloader() {
    const preloader = document.getElementById("intro-preloader");
    if (!preloader) return;

    // 2.0-second delay as requested: cleanly lifts up to unveil the 3D showcase
    setTimeout(() => {
      preloader.classList.add("lift-up");
      setTimeout(() => {
        preloader.style.display = "none";
      }, 900);
    }, 2000);
  }

  /* ----------------------------------------------------
     LANDING <-> STUDIO TRANSITIONS (CINEMATIC GLIDE)
  ---------------------------------------------------- */
  bindLandingTransitions() {
    const landingHero = document.getElementById("landing-hero");
    const studioWorkspace = document.getElementById("studio-workspace");
    const btnEnter = document.getElementById("btn-enter-studio");
    const btnBack = document.getElementById("btn-back-showcase");

    btnEnter.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      // Auto-enter fullscreen on mobile landscape for maximum vertical immersion
      if (window.innerHeight < 560 && !document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }

      // 1. Prepare studio workspace in layout
      studioWorkspace.style.display = "flex";
      void studioWorkspace.offsetWidth; // Force reflow to guarantee CSS transition triggers
      
      // 2. Animate landing hero out with depth blur & studio workspace in with float
      landingHero.classList.add("hidden-hero");
      studioWorkspace.classList.remove("hidden-studio");
      
      // 3. Trigger 3D camera cinematic arc
      this.scene.setCameraMode("studio");

      // 4. Clean up landing hero after transition finishes
      setTimeout(() => {
        if (landingHero.classList.contains("hidden-hero")) {
          landingHero.style.display = "none";
        }
      }, 750);
    });

    btnBack.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      // 1. Restore landing hero in layout
      landingHero.style.display = "flex";
      void landingHero.offsetWidth; // Force reflow
      
      // 2. Animate landing hero in & studio workspace out
      landingHero.classList.remove("hidden-hero");
      studioWorkspace.classList.add("hidden-studio");

      // 3. Trigger 3D camera return to hero sweep
      this.scene.setCameraMode("showcase");
      if (this.particleHeadline) this.particleHeadline.setFocused(false);

      // 4. Hide studio workspace after transition finishes
      setTimeout(() => {
        if (studioWorkspace.classList.contains("hidden-studio")) {
          studioWorkspace.style.display = "none";
        }
      }, 750);
    });
  }

  /* ----------------------------------------------------
     STUDIO RGB VIBGYOR SPECTRUM SLIDER
  ---------------------------------------------------- */
  bindVibgyorSpectrum() {
    const bar = document.getElementById("studio-vibgyor-bar");
    const thumb = document.getElementById("studio-vibgyor-thumb");
    if (!bar || !thumb) return;

    let isDragging = false;

    const updateFromPointer = (e) => {
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const hue = Math.round(pct * 360);

      thumb.style.left = `${pct * 100}%`;
      this.scene.setHue(hue);
      document.documentElement.style.setProperty('--active-hue', hue);
    };

    bar.addEventListener("mousedown", (e) => {
      isDragging = true;
      updateFromPointer(e);
    });

    window.addEventListener("mousemove", (e) => {
      if (isDragging) updateFromPointer(e);
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Rainbow Wave Toggle
    const btnStudioRainbow = document.getElementById("btn-studio-rainbow");
    if (btnStudioRainbow) {
      btnStudioRainbow.addEventListener("click", () => {
        this.scene.setRainbowWave(!this.scene.isRainbowWave);
        btnStudioRainbow.textContent = this.scene.isRainbowWave ? "🌈 Wave: ON" : "🌈 Wave: OFF";
      });
    }
  }

  /* ----------------------------------------------------
     THEME TOGGLE ENGINE (LIGHT / DARK STUDIO)
  ---------------------------------------------------- */
  bindThemeToggle() {
    const heroToggle = document.getElementById("hero-theme-toggle");
    const studioToggle = document.getElementById("studio-theme-toggle");

    const toggleTheme = () => {
      this.theme = this.theme === "light" ? "dark" : "light";
      const isDark = this.theme === "dark";

      document.body.classList.toggle("theme-dark", isDark);

      // Update switch thumbs
      const thumbs = document.querySelectorAll(".theme-switch-thumb");
      thumbs.forEach(t => {
        t.textContent = isDark ? "🌙" : "☀️";
      });

      // Update 3D scene backdrop and optical bloom
      this.scene.setTheme(this.theme);

      // Update particle headline colors
      if (this.particleHeadline) {
        this.particleHeadline.setTheme(this.theme);
      }

      // Re-render sidebar to apply theme changes immediately
      this.renderCategoryNav();
      this.renderComponentSelector();
    };

    if (heroToggle) heroToggle.addEventListener("click", toggleTheme);
    if (studioToggle) studioToggle.addEventListener("click", toggleTheme);
  }

  /* ----------------------------------------------------
     APP REFRESH
  ---------------------------------------------------- */
  refreshAll() {
    this.scene.updateBuild(this.build, this.fanConfig);
    const diagnostics = runDiagnostics(this.build, this.fanConfig);
    this.updateHeaderTelemetry(diagnostics);
    this.renderCategoryNav();
    this.renderComponentSelector();
  }

  updateHeaderTelemetry(diagnostics) {
    const totalPrice = Object.values(this.build).reduce((sum, item) => sum + (item ? item.price : 0), 0);
    document.getElementById("telemetry-price").textContent = `$${totalPrice.toLocaleString()}`;

    const drawerPriceEl = document.getElementById("drawer-total-price");
    if (drawerPriceEl) drawerPriceEl.textContent = `$${totalPrice.toLocaleString()}`;

    const baseWatts = 75;
    const cpuWatts = this.build.cpu ? this.build.cpu.tdp : 0;
    const gpuWatts = this.build.gpu ? this.build.gpu.powerWatts : 0;
    const totalWatts = cpuWatts + gpuWatts + baseWatts;
    const psuCapacity = this.build.psu ? this.build.psu.wattage : 0;

    const wattsEl = document.getElementById("telemetry-power");
    wattsEl.innerHTML = `<span class="font-mono text-[var(--text-primary)] font-bold">${totalWatts}W</span> <span class="text-xs text-[var(--text-secondary)]">/ ${psuCapacity}W</span>`;

    const statusBadge = document.getElementById("telemetry-status");
    const errors = diagnostics.issues.filter(i => i.type === "error");

    if (errors.length > 0) {
      statusBadge.className = "px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded flex items-center gap-1.5";
      statusBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> ${errors.length} Conflict${errors.length > 1 ? 's' : ''}`;
    } else {
      statusBadge.className = "px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded flex items-center gap-1.5";
      statusBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Fit`;
    }
  }

  /* ----------------------------------------------------
     LIQUID CATEGORY DROPDOWN SELECTOR
  ---------------------------------------------------- */
  renderCategoryNav() {
    const dropdownBtn = document.getElementById("btn-category-dropdown");
    const dropdownMenu = document.getElementById("category-dropdown-menu");
    const dropdownArrow = document.getElementById("category-dropdown-arrow");
    const activeIconEl = document.getElementById("active-category-icon");
    const activeTitleEl = document.getElementById("active-category-title");
    if (!dropdownBtn || !dropdownMenu) return;

    const categories = [
      { id: "chassis", label: "Chassis & Frame", icon: "🖥️" },
      { id: "mobo", label: "Motherboards", icon: "🔌" },
      { id: "cpu", label: "Processors (CPU)", icon: "🧠" },
      { id: "cooler", label: "Thermal Coolers", icon: "🧊" },
      { id: "gpu", label: "Graphics Cards (GPU)", icon: "🎮" },
      { id: "ram", label: "System Memory (RAM)", icon: "💾" },
      { id: "psu", label: "Power Supply Units", icon: "⚡" },
      { id: "fans", label: "Airflow & Fan Setup", icon: "🌀" }
    ];

    const currentCat = categories.find(c => c.id === this.activeCategory) || categories[0];
    if (activeIconEl) activeIconEl.textContent = currentCat.icon;
    if (activeTitleEl) activeTitleEl.textContent = currentCat.label;

    // Populate Floating Dropdown Menu
    dropdownMenu.innerHTML = categories.map(cat => {
      const isActive = this.activeCategory === cat.id;
      const selectedItem = this.build[cat.id];
      const isConfigured = cat.id === "fans" || !!selectedItem;

      return `
        <button data-cat="${cat.id}" class="category-dropdown-item ${isActive ? 'active-item' : ''}">
          <div class="flex items-center gap-2.5 truncate">
            <span class="text-sm shrink-0">${cat.icon}</span>
            <span class="truncate">${cat.label}</span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            ${selectedItem && selectedItem.price ? `<span class="text-[10px] font-mono opacity-60">$${selectedItem.price}</span>` : ''}
            <span class="w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-emerald-500 shadow-[0_0_6px_#10B981]' : 'bg-transparent'}"></span>
          </div>
        </button>
      `;
    }).join("");

    // Toggle Dropdown Menu
    dropdownBtn.onclick = (e) => {
      e.stopPropagation();
      const isOpen = !dropdownMenu.classList.contains("hidden");
      if (isOpen) {
        dropdownMenu.classList.add("hidden");
        if (dropdownArrow) dropdownArrow.style.transform = "rotate(0deg)";
      } else {
        dropdownMenu.classList.remove("hidden");
        if (dropdownArrow) dropdownArrow.style.transform = "rotate(180deg)";
      }
    };

    // Close on Click Outside
    if (!this._dropdownDocClickBound) {
      document.addEventListener("click", (e) => {
        if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
          dropdownMenu.classList.add("hidden");
          if (dropdownArrow) dropdownArrow.style.transform = "rotate(0deg)";
        }
      });
      this._dropdownDocClickBound = true;
    }

    // Handle Category Switching
    dropdownMenu.querySelectorAll(".category-dropdown-item").forEach(item => {
      item.addEventListener("click", () => {
        this.activeCategory = item.dataset.cat;
        dropdownMenu.classList.add("hidden");
        if (dropdownArrow) dropdownArrow.style.transform = "rotate(0deg)";
        this.renderCategoryNav();
        this.renderComponentSelector();
        this.scene.focusOn(this.activeCategory);
      });
    });
  }

  /* ----------------------------------------------------
     COMPONENT SELECTOR & DEDICATED SPECS BUTTON
  ---------------------------------------------------- */
  renderComponentSelector() {
    const container = document.getElementById("component-options-container");
    const inspectBtn = document.getElementById("btn-inspect-specs");
    if (!container) return;

    const categoryMap = {
      chassis: { title: "Chassis & Frame", key: "chassis" },
      mobo: { title: "Motherboards", key: "motherboards" },
      cpu: { title: "Processors (CPU)", key: "cpus" },
      cooler: { title: "Thermal Coolers", key: "coolers" },
      gpu: { title: "Graphics Cards (GPU)", key: "gpus" },
      ram: { title: "System Memory (RAM)", key: "ram" },
      psu: { title: "Power Supply Units", key: "psu" },
      fans: { title: "Chassis Fan Setup", key: "fans" }
    };

    const currentMeta = categoryMap[this.activeCategory] || { title: "Hardware Components", key: "chassis" };

    // Configure the SEPARATE Dedicated Inspect Specs Button
    if (inspectBtn) {
      if (this.activeCategory === "fans") {
        inspectBtn.style.display = "none";
      } else {
        inspectBtn.style.display = "inline-flex";
        const selectedItem = this.build[this.activeCategory];
        inspectBtn.onclick = (e) => {
          e.stopPropagation();
          if (selectedItem) {
            this.openDetailModal(selectedItem, this.activeCategory);
          }
        };
      }
    }

    if (this.activeCategory === "fans") {
      this.renderFanControls(container);
      return;
    }

    const items = HARDWARE_DB[currentMeta.key] || [];
    const selectedItem = this.build[this.activeCategory];

    container.innerHTML = items.map(item => {
      const isSelected = selectedItem && selectedItem.id === item.id;
      const conflict = this.checkItemConflict(this.activeCategory, item);

      let microStats = '';
      if (this.activeCategory === "gpu") {
        microStats = `${item.vram}GB GDDR6X • ${item.length}mm • ${item.powerWatts}W`;
      } else if (this.activeCategory === "cpu") {
        microStats = `${item.cores} Cores • ${item.boostClock}GHz • ${item.tdp}W`;
      } else if (this.activeCategory === "cooler") {
        microStats = `${item.radSize ? item.radSize + 'mm Rad' : item.height + 'mm Air'} • ${item.maxTdp}W`;
      } else if (this.activeCategory === "mobo") {
        microStats = `${item.socket} • ${item.formFactor}`;
      } else if (this.activeCategory === "ram") {
        microStats = `${item.capacity}GB ${item.type}-${item.speed}`;
      } else if (this.activeCategory === "psu") {
        microStats = `${item.wattage}W • ${item.rating}`;
      } else if (this.activeCategory === "chassis") {
        microStats = `${item.type} • Max GPU ${item.maxGpuLength}mm`;
      }

      return `
        <div data-id="${item.id}" class="part-card cursor-pointer p-3 rounded-2xl border transition-all ${
          isSelected ? "active-card" : ""
        }">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-[var(--text-primary)] truncate">${item.name}</span>
                ${isSelected ? `
                  <span class="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-orange-500/15 text-orange-500 border border-orange-500/30 rounded leading-none shrink-0">
                    INSTALLED
                  </span>
                ` : ''}
              </div>
              <div class="text-[11px] font-mono text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                <span class="font-bold text-[var(--text-primary)]">$${item.price}</span>
                ${microStats ? `<span class="opacity-40">•</span> <span class="opacity-80">${microStats}</span>` : ''}
              </div>
            </div>

            <!-- Clean radio selection indicator: zero in-card info buttons! -->
            <div class="w-5 h-5 rounded-full border ${
              isSelected 
                ? "border-orange-500 bg-orange-500 text-white" 
                : "border-[var(--border-color)] bg-[var(--bg-card)]"
            } shrink-0 flex items-center justify-center text-[10px] font-bold transition-all">
              ${isSelected ? '✓' : ''}
            </div>
          </div>

          ${conflict ? `
            <div class="mt-2 pt-2 border-t border-rose-500/20 text-[10px] font-mono font-semibold text-rose-500 flex items-center gap-1.5">
              <span>⚠️ Clash:</span> <span>${this.getConflictReason(this.activeCategory, item)}</span>
            </div>
          ` : ''}
        </div>
      `;
    }).join("");

    container.querySelectorAll(".part-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        const item = items.find(i => i.id === id);
        if (item) {
          this.build[this.activeCategory] = item;
          this.refreshAll();
        }
      });
    });
  }

  renderFanControls(container) {
    const zones = [
      { id: "front", name: "Front Intake Fans" },
      { id: "rear", name: "Rear Dual Exhaust" },
      { id: "bottom", name: "Bottom Intake Stage" }
    ];

    container.innerHTML = `
      <div class="space-y-2.5">
        ${zones.map(z => {
          const cfg = this.fanConfig[z.id];
          if (!cfg) return '';
          const isIntake = cfg.dir === "intake";
          return `
            <div class="p-3 border border-[var(--border-color)] bg-[var(--bg-card)] rounded-lg flex items-center justify-between gap-2">
              <div>
                <div class="text-xs font-bold text-[var(--text-primary)]">${z.name}</div>
                <div class="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5">${cfg.count}x 120mm Fans</div>
              </div>
              <button data-zone="${z.id}" class="fan-toggle-btn interactive-btn px-3 py-1.5 text-xs font-mono font-bold rounded border cursor-pointer ${
                isIntake 
                  ? "bg-blue-500/10 text-blue-500 border-blue-500/30 hover:bg-blue-500/20" 
                  : "bg-orange-500/10 text-orange-500 border-orange-500/30 hover:bg-orange-500/20"
              }">
                ${isIntake ? "Intake ↘" : "Exhaust ↗"}
              </button>
            </div>
          `;
        }).join("")}
      </div>
    `;

    container.querySelectorAll(".fan-toggle-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const zone = btn.dataset.zone;
        if (this.fanConfig[zone]) {
          this.fanConfig[zone].dir = this.fanConfig[zone].dir === "intake" ? "exhaust" : "intake";
          this.refreshAll();
        }
      });
    });
  }

  getConflictReason(category, item) {
    if (category === "gpu" && this.build.chassis && item.length > this.build.chassis.maxGpuLength) {
      return `Card length (${item.length}mm) exceeds case max (${this.build.chassis.maxGpuLength}mm)`;
    }
    if (category === "cpu" && this.build.mobo && item.socket !== this.build.mobo.socket) {
      return `Socket mismatch (${item.socket} vs ${this.build.mobo.socket})`;
    }
    if (category === "cooler" && this.build.chassis && item.type && item.type.includes("Air") && item.height > this.build.chassis.maxCoolerHeight) {
      return `Cooler height (${item.height}mm) exceeds case max (${this.build.chassis.maxCoolerHeight}mm)`;
    }
    return "Physical clearance conflict";
  }

  checkItemConflict(category, item) {
    if (category === "gpu" && this.build.chassis) {
      return item.length > this.build.chassis.maxGpuLength;
    }
    if (category === "cpu" && this.build.mobo) {
      return item.socket !== this.build.mobo.socket;
    }
    if (category === "cooler" && this.build.chassis && item.type && item.type.includes("Air")) {
      return item.height > this.build.chassis.maxCoolerHeight;
    }
    return false;
  }

  /* ----------------------------------------------------
     DETAIL INSPECTION MODAL
  ---------------------------------------------------- */
  openDetailModal(item, category) {
    if (!item) return;

    document.getElementById("modal-brand").textContent = item.brand || category.toUpperCase();
    document.getElementById("modal-title").textContent = item.name;

    const specsEl = document.getElementById("modal-specs");
    specsEl.innerHTML = this.renderModalSpecs(item, category);

    document.getElementById("modal-note").textContent = item.engineerNote || "Standard hardware tolerances apply.";

    const modal = document.getElementById("detail-modal");
    modal.classList.remove("modal-closed");
  }

  renderModalSpecs(item, category) {
    const rows = [];
    rows.push(`<div><span class="text-zinc-400">Price:</span> <span class="font-mono font-semibold">$${item.price}</span></div>`);

    if (category === "chassis") {
      rows.push(`<div><span class="text-zinc-400">Max GPU Clearance:</span> <span class="font-mono font-semibold">${item.maxGpuLength}mm</span></div>`);
      rows.push(`<div><span class="text-zinc-400">Max Cooler Height:</span> <span class="font-mono font-semibold">${item.maxCoolerHeight}mm</span></div>`);
    } else if (category === "gpu") {
      rows.push(`<div><span class="text-zinc-400">Length:</span> <span class="font-mono font-semibold">${item.length}mm</span></div>`);
      rows.push(`<div><span class="text-zinc-400">Slot Width:</span> <span class="font-mono font-semibold">${item.slotThickness} Slots</span></div>`);
      rows.push(`<div><span class="text-zinc-400">Power Draw:</span> <span class="font-mono font-semibold">${item.powerWatts}W TDP</span></div>`);
    } else if (category === "cpu") {
      rows.push(`<div><span class="text-zinc-400">Socket:</span> <span class="font-mono font-semibold">${item.socket}</span></div>`);
      rows.push(`<div><span class="text-zinc-400">Cores / Threads:</span> <span class="font-mono font-semibold">${item.cores}C / ${item.threads}T</span></div>`);
      rows.push(`<div><span class="text-zinc-400">TDP:</span> <span class="font-mono font-semibold">${item.tdp}W</span></div>`);
    }

    return rows.join("");
  }

  bindModalControls() {
    const modal = document.getElementById("detail-modal");
    const closeBtn = document.getElementById("btn-close-modal");
    const dismissBtn = document.getElementById("btn-modal-dismiss");

    const closeModal = () => modal.classList.add("modal-closed");

    closeBtn.addEventListener("click", closeModal);
    dismissBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  bindViewportControls() {
    const resetCamBtn = document.getElementById("btn-reset-cam");
    if (resetCamBtn) {
      resetCamBtn.addEventListener("click", () => {
        this.scene.resetCamera();
        if (this.particleHeadline) this.particleHeadline.setFocused(false);
        const macroBtns = document.querySelectorAll(".macro-cam-btn");
        macroBtns.forEach(b => b.classList.remove("cam-active"));
        const rigBtn = document.querySelector('[data-macro="rig"]');
        if (rigBtn) rigBtn.classList.add("cam-active");
      });
    }

    // Macro Camera Toolbar Buttons
    const macroBtns = document.querySelectorAll(".macro-cam-btn");
    macroBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        macroBtns.forEach(b => b.classList.remove("cam-active"));
        btn.classList.add("cam-active");
        this.scene.setMacroPreset(btn.dataset.macro);
      });
    });

    // Airflow Streamline Toggle Button
    const airflowBtn = document.getElementById("btn-toggle-airflow");
    if (airflowBtn) {
      airflowBtn.addEventListener("click", () => {
        const nextState = !this.scene.showAirflow;
        this.scene.toggleAirflow(nextState);
        airflowBtn.innerHTML = `<span>💨</span> <span>Airflow: ${nextState ? 'ON' : 'OFF'}</span>`;
        airflowBtn.className = nextState 
          ? "interactive-btn px-3 py-1.5 rounded-full bg-blue-600 text-white font-medium flex items-center gap-1.5 shadow-sm text-[11px] transition-colors"
          : "interactive-btn px-3 py-1.5 rounded-full bg-zinc-500/30 text-[var(--text-primary)] font-medium flex items-center gap-1.5 shadow-sm text-[11px] transition-colors";
      });
    }

    document.getElementById("btn-share-build").addEventListener("click", async () => {
      const summary = `RIG STUDIO SPEC SHEET:\n- Case: ${this.build.chassis?.name}\n- Mobo: ${this.build.mobo?.name}\n- CPU: ${this.build.cpu?.name}\n- Cooler: ${this.build.cooler?.name}\n- GPU: ${this.build.gpu?.name}\n- RAM: ${this.build.ram?.name}\n- PSU: ${this.build.psu?.name}\n\nEstimated Total: $${Object.values(this.build).reduce((s, c) => s + (c?.price || 0), 0)}`;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(summary);
          this.showToast("Build spec sheet copied to clipboard!");
        } else {
          prompt("Copy your build specification:", summary);
        }
      } catch (e) {
        prompt("Copy your build specification:", summary);
      }
    });
  }

  /* ----------------------------------------------------
     CHECKOUT & RETAILER OUTBOUND PORTAL
  ---------------------------------------------------- */
  bindCheckoutControls() {
    const btnOpenCheckout = document.getElementById("btn-open-checkout");
    const btnDrawerCheckout = document.getElementById("btn-drawer-checkout");
    const btnCloseCheckout = document.getElementById("btn-close-checkout");
    const checkoutModal = document.getElementById("checkout-modal");
    const btnBuyAllAmazon = document.getElementById("btn-buy-all-amazon");
    const btnOpenPcpp = document.getElementById("btn-open-pcpp");
    const btnCopyBom = document.getElementById("btn-copy-bom");

    if (btnOpenCheckout) {
      btnOpenCheckout.addEventListener("click", () => this.openCheckoutModal());
    }
    if (btnDrawerCheckout) {
      btnDrawerCheckout.addEventListener("click", () => this.openCheckoutModal());
    }
    if (btnCloseCheckout) {
      btnCloseCheckout.addEventListener("click", () => this.closeCheckoutModal());
    }

    if (checkoutModal) {
      checkoutModal.addEventListener("click", (e) => {
        if (e.target === checkoutModal) this.closeCheckoutModal();
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && checkoutModal && !checkoutModal.classList.contains("modal-closed")) {
        this.closeCheckoutModal();
      }
    });

    if (btnBuyAllAmazon) {
      btnBuyAllAmazon.addEventListener("click", () => {
        const queryParts = [
          this.build.chassis?.name,
          this.build.gpu?.name,
          this.build.cpu?.name,
          this.build.mobo?.name
        ].filter(Boolean).join(" ");
        const url = `https://www.amazon.com/s?k=${encodeURIComponent(queryParts)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      });
    }

    if (btnOpenPcpp) {
      btnOpenPcpp.addEventListener("click", () => {
        window.open("https://pcpartpicker.com/list/", "_blank", "noopener,noreferrer");
      });
    }

    if (btnCopyBom) {
      btnCopyBom.addEventListener("click", () => this.copyBillOfMaterials());
    }
  }

  openCheckoutModal() {
    this.renderCheckoutModal();
    const modal = document.getElementById("checkout-modal");
    if (modal) modal.classList.remove("modal-closed");
  }

  closeCheckoutModal() {
    const modal = document.getElementById("checkout-modal");
    if (modal) modal.classList.add("modal-closed");
  }

  renderCheckoutModal() {
    const listEl = document.getElementById("checkout-parts-list");
    if (!listEl) return;

    const categoryOrder = [
      { key: "chassis", label: "Chassis" },
      { key: "mobo", label: "Motherboard" },
      { key: "cpu", label: "Processor" },
      { key: "cooler", label: "CPU Cooler" },
      { key: "gpu", label: "Graphics Card" },
      { key: "ram", label: "System Memory" },
      { key: "psu", label: "Power Supply" }
    ];

    let subtotal = 0;
    const partsHtml = categoryOrder.map(cat => {
      const item = this.build[cat.key];
      if (!item) return '';
      subtotal += item.price;

      const searchTerm = `${item.brand || ''} ${item.name}`.trim();
      const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}`;
      const neweggUrl = `https://www.newegg.com/p/pl?d=${encodeURIComponent(searchTerm)}`;
      const pcppUrl = `https://pcpartpicker.com/search/?q=${encodeURIComponent(item.name)}`;

      let specSnippet = "";
      if (cat.key === "gpu") specSnippet = `${item.length}mm length • ${item.slotThickness} slots • ${item.powerWatts}W`;
      else if (cat.key === "cpu") specSnippet = `${item.socket} • ${item.cores}C/${item.threads}T • ${item.tdp}W`;
      else if (cat.key === "cooler") specSnippet = `${item.type} • ${item.radiatorSize ? item.radiatorSize + 'mm' : item.height + 'mm'}`;
      else if (cat.key === "psu") specSnippet = `${item.wattage}W • 80+ Gold • ATX 3.0`;
      else if (cat.key === "mobo") specSnippet = `${item.formFactor} • ${item.socket} • PCIe 5.0`;
      else if (cat.key === "ram") specSnippet = `DDR5 • 32GB (2x16GB) • 6000MHz`;
      else if (cat.key === "chassis") specSnippet = `Panoramic Glass • Dual Chamber`;

      return `
        <div class="p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--border-hover)] transition-all">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                ${cat.label}
              </span>
              <span class="text-xs font-bold text-[var(--text-primary)] truncate">${item.name}</span>
            </div>
            <div class="text-[11px] font-mono text-[var(--text-secondary)] truncate">
              ${specSnippet}
            </div>
          </div>

          <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <span class="font-mono font-bold text-sm text-[var(--text-primary)]">$${item.price}</span>
            <div class="flex items-center gap-1.5">
              <a href="${amazonUrl}" target="_blank" rel="noopener noreferrer" class="retailer-btn retailer-btn-amazon" title="Find on Amazon">
                <span>🛒</span> Amazon
              </a>
              <a href="${neweggUrl}" target="_blank" rel="noopener noreferrer" class="retailer-btn retailer-btn-newegg" title="Find on Newegg">
                <span>🥚</span> Newegg
              </a>
              <a href="${pcppUrl}" target="_blank" rel="noopener noreferrer" class="retailer-btn retailer-btn-pcpp" title="Check on PCPartPicker">
                <span>⚙️</span> PCPP
              </a>
            </div>
          </div>
        </div>
      `;
    }).join("");

    listEl.innerHTML = partsHtml;

    // Update Summary in modal
    const subtotalEl = document.getElementById("checkout-subtotal");
    const totalEl = document.getElementById("checkout-total-price");
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `$${subtotal.toLocaleString()}`;

    const cpuWatts = this.build.cpu ? this.build.cpu.tdp : 0;
    const gpuWatts = this.build.gpu ? this.build.gpu.powerWatts : 0;
    const totalWatts = cpuWatts + gpuWatts + 75;
    const psuCapacity = this.build.psu ? this.build.psu.wattage : 1000;
    const powerEl = document.getElementById("checkout-power");
    if (powerEl) powerEl.textContent = `${totalWatts}W / ${psuCapacity}W`;
  }

  async copyBillOfMaterials() {
    let md = `# RIG STUDIO SPECIFICATION & BILL OF MATERIALS (BOM)\n\n`;
    md += `| Component | Part Selection | Price | Retailer Link |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    const categoryOrder = [
      { key: "chassis", label: "Case" },
      { key: "mobo", label: "Motherboard" },
      { key: "cpu", label: "CPU" },
      { key: "cooler", label: "CPU Cooler" },
      { key: "gpu", label: "GPU" },
      { key: "ram", label: "RAM" },
      { key: "psu", label: "Power Supply" }
    ];

    let total = 0;
    categoryOrder.forEach(cat => {
      const item = this.build[cat.key];
      if (item) {
        total += item.price;
        const query = encodeURIComponent(`${item.brand || ''} ${item.name}`.trim());
        const link = `[Amazon Search](https://www.amazon.com/s?k=${query})`;
        md += `| ${cat.label} | ${item.name} | $${item.price} | ${link} |\n`;
      }
    });

    md += `| **TOTAL ESTIMATED** | | **$${total.toLocaleString()}** | |\n\n`;
    md += `*Generated via RIG STUDIO 3D Photorealistic PC Hardware Configurator*\n`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(md);
        this.showToast("BOM copied to clipboard as Markdown!");
      } else {
        prompt("Copy your Bill of Materials Markdown:", md);
      }
    } catch (e) {
      prompt("Copy your Bill of Materials Markdown:", md);
    }
  }

  showToast(message) {
    const toast = document.getElementById("toast-notify");
    const msgEl = document.getElementById("toast-msg");
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    toast.classList.add("show-toast");
    setTimeout(() => {
      toast.classList.remove("show-toast");
    }, 2800);
  }

  /* ----------------------------------------------------
     ABOUT RIG STUDIO MODAL
  ---------------------------------------------------- */
  bindAboutModal() {
    const openBtn = document.getElementById("btn-open-about");
    const closeBtn = document.getElementById("btn-close-about");
    const enterBtn = document.getElementById("btn-about-enter");
    const modal = document.getElementById("about-modal");

    const closeModal = () => {
      if (modal) modal.classList.add("modal-closed");
    };

    if (openBtn) {
      openBtn.addEventListener("click", () => {
        if (modal) modal.classList.remove("modal-closed");
      });
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    if (enterBtn) {
      enterBtn.addEventListener("click", () => {
        closeModal();
        const enterStudioBtn = document.getElementById("btn-enter-studio");
        if (enterStudioBtn) enterStudioBtn.click();
      });
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && !modal.classList.contains("modal-closed")) {
        closeModal();
      }
    });
  }

  /* ----------------------------------------------------
     MOBILE ORIENTATION LOCK CONTROLS
  ---------------------------------------------------- */
  bindOrientationControl() {
    const overlay = document.getElementById("orientation-overlay");
    const bypassBtn = document.getElementById("btn-bypass-orientation");
    if (!overlay) return;

    if (bypassBtn) {
      bypassBtn.addEventListener("click", () => {
        overlay.classList.add("bypassed");
      });
    }

    const checkOrientation = () => {
      const isPortrait = window.matchMedia("(max-width: 950px) and (orientation: portrait)").matches;
      if (!isPortrait) {
        overlay.classList.remove("bypassed");
      }
      if (this.scene) {
        this.scene.onResize();
      }
    };

    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", () => {
      setTimeout(checkOrientation, 150);
    });
  }

  /* ----------------------------------------------------
     FULLSCREEN TOGGLE CONTROLS
  ---------------------------------------------------- */
  bindFullscreenControls() {
    const toggleFullscreen = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    };

    const heroFs = document.getElementById("btn-hero-fullscreen");
    const studioFs = document.getElementById("btn-studio-fullscreen");
    if (heroFs) heroFs.addEventListener("click", toggleFullscreen);
    if (studioFs) studioFs.addEventListener("click", toggleFullscreen);

    const updateFsIcons = () => {
      const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      if (heroFs) {
        const iconSpan = heroFs.querySelector("span:first-child");
        if (iconSpan) iconSpan.textContent = isFs ? "✕" : "⛶";
      }
      if (studioFs) studioFs.textContent = isFs ? "✕" : "⛶";
    };

    document.addEventListener("fullscreenchange", updateFsIcons);
    document.addEventListener("webkitfullscreenchange", updateFsIcons);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new AeroApp();
});
