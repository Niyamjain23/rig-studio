/* ===================================================================
   PARTICLE HEADLINE CONTROLLER ("BUILD IN 3D.")
   - Enlarged, spaced-out luminous particle constellation
   - Particles gently hover around their own anchor positions (zero-g float)
   - On CPU focus: zooms smoothly in Z towards the user and fades
   - Returns smoothly to exact resting position when unfocused
   =================================================================== */

export class ParticleHeadline {
  constructor(containerEl, headlineEl) {
    this.container = containerEl;
    this.headline = headlineEl;

    // High-resolution particle canvas overlay
    this.canvas = document.createElement("canvas");
    this.canvas.id = "hero-particle-canvas";
    this.canvas.className = "hero-particle-canvas";
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.container.appendChild(this.canvas);

    this.particles = [];
    this.isFocused = false;
    this.isDark = document.body.classList.contains("theme-dark");
    this.mouse = { x: -9999, y: -9999, radius: 65 };
    this.animId = null;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Bigger canvas footprint
    this.width = 680;
    this.height = 260;

    this.init();
  }

  init() {
    this.resize();

    // Mouse proximity magnetic interaction via window (canvas stays pointer-events: none)
    this.canvas.style.pointerEvents = "none";
    const onMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (
        e.clientX >= rect.left - 60 &&
        e.clientX <= rect.right + 60 &&
        e.clientY >= rect.top - 60 &&
        e.clientY <= rect.bottom + 60
      ) {
        this.mouse.x = mx;
        this.mouse.y = my;
      } else {
        this.mouse.x = -9999;
        this.mouse.y = -9999;
      }
    };

    window.addEventListener("pointermove", onMove);

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.resize(), 120);
    });

    // Hide fallback DOM text visually while preserving accessibility
    if (this.headline) {
      this.headline.style.opacity = "0";
      this.headline.style.position = "absolute";
      this.headline.style.pointerEvents = "none";
    }

    this.animate = this.animate.bind(this);
    this.animId = requestAnimationFrame(this.animate);
  }

  setTheme(theme) {
    this.isDark = theme === "dark";
    this.updateParticleColors();
  }

  setFocused(focused) {
    if (this.isFocused === focused) return;
    this.isFocused = focused;
    if (focused) {
      this.container.classList.add("cpu-focused");
    } else {
      this.container.classList.remove("cpu-focused");
    }
  }

  resize() {
    const isMobile = window.innerWidth < 768;
    this.width = isMobile ? 380 : 680;
    this.height = isMobile ? 160 : 260;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.sampleText();
  }

  sampleText() {
    const offCanvas = document.createElement("canvas");
    const offCtx = offCanvas.getContext("2d");
    offCanvas.width = this.width;
    offCanvas.height = this.height;

    const isMobile = window.innerWidth < 768;
    // Noticeably bigger, commanding typography
    const fontSize = isMobile ? 64 : 106;
    const lineHeight = fontSize * 0.92;

    offCtx.fillStyle = "#FFFFFF";
    offCtx.font = `800 ${fontSize}px 'Space Grotesk', system-ui, -apple-system, sans-serif`;
    offCtx.textBaseline = "top";

    // Draw the two headline lines
    offCtx.fillText("BUILD", 0, 8);
    offCtx.fillText("IN 3D.", 0, 8 + lineHeight);

    const imgData = offCtx.getImageData(0, 0, this.width, this.height);
    const data = imgData.data;

    this.particles = [];
    // Spaced-out particle grid so dots are distinct and clearly separated
    const step = isMobile ? 5.5 : 6.5;

    for (let y = 0; y < this.height; y += step) {
      for (let x = 0; x < this.width; x += step) {
        const px = Math.floor(x);
        const py = Math.floor(y);
        const index = (py * this.width + px) * 4;
        const alpha = data[index + 3];

        if (alpha > 128) {
          const normX = px / this.width;
          const normY = py / this.height;

          // Stationary particle at its exact anchor
          this.particles.push({
            ox: px,
            oy: py,
            x: px,
            y: py,
            size: 2.1 + (Math.random() * 0.4),
            normX,
            normY,
            color: this.getColorForPoint(normX, normY)
          });
        }
      }
    }
  }

  updateParticleColors() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.color = this.getColorForPoint(p.normX, p.normY);
    }
  }

  getColorForPoint(normX, normY) {
    if (this.isDark) {
      // Dark Mode: Metallic titanium luster with soft papaya-orange glimmer
      const shimmer = Math.sin(normX * 3.14 + normY * 1.6);
      if (shimmer > 0.80) {
        return "rgba(255, 115, 20, 0.94)"; // Luminous orange accent
      } else if (shimmer > 0.42) {
        return "rgba(255, 255, 255, 0.98)"; // Titanium bright white
      } else {
        return "rgba(203, 213, 225, 0.86)"; // Sleek silver slate
      }
    } else {
      // Light Mode: Carbon obsidian finish with warm amber pulses
      const shimmer = Math.sin(normX * 3.14 + normY * 1.6);
      if (shimmer > 0.80) {
        return "rgba(234, 88, 12, 0.94)"; // Amber pulse
      } else if (shimmer > 0.42) {
        return "rgba(15, 23, 42, 0.96)"; // Carbon obsidian
      } else {
        return "rgba(51, 65, 85, 0.90)"; // Slate graphite
      }
    }
  }

  animate(timestamp) {
    this.ctx.save();
    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.clearRect(0, 0, this.width, this.height);

    const isFocused = this.isFocused;
    const mouseRadius = this.mouse.radius;
    const mx = this.mouse.x;
    const my = this.mouse.y;
    const cx = this.width * 0.45;
    const cy = this.height * 0.5;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (!isFocused) {
        // Stationary at exact anchor (crisp, solid, no hovering)
        const targetX = p.ox;
        const targetY = p.oy;

        // Subtle mouse magnetic repulsion
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouseRadius && dist > 0) {
          const force = (1 - dist / mouseRadius) * 8;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
        }

        // Smooth spring return to exact anchor
        p.x += (targetX - p.x) * 0.15;
        p.y += (targetY - p.y) * 0.15;
      } else {
        // Gentle, non-exaggerated outward dispersal as container zooms forward in Z & fades
        p.x += (p.ox - cx) * 0.016;
        p.y += (p.oy - cy) * 0.016;
      }

      // Draw crisp circular particle dot
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
    }

    this.ctx.restore();
    this.animId = requestAnimationFrame(this.animate);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    if (this.headline) {
      this.headline.style.opacity = "";
      this.headline.style.position = "";
      this.headline.style.pointerEvents = "";
    }
  }
}
