/* Procedural PBR Textures & Perforation Maps */

export function createHoneycombTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Pure White Steel
  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, 512, 512);

  // Hexagonal Honeycomb Perforations
  ctx.fillStyle = "#CBD5E1";
  const hexRadius = 14;
  const hexHeight = hexRadius * Math.sqrt(3);

  for (let y = 0; y < 512 + hexHeight; y += hexHeight) {
    const isOdd = Math.floor(y / hexHeight) % 2 === 1;
    const xOffset = isOdd ? hexRadius * 1.5 : 0;

    for (let x = xOffset; x < 512 + hexRadius * 3; x += hexRadius * 3) {
      drawHexagon(ctx, x, y, hexRadius - 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

function drawHexagon(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const hx = x + r * Math.cos(angle);
    const hy = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.fill();
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

export function createWhiteMoboTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  // Premium High-Density Matte Black & Snow-White PCB
  ctx.fillStyle = "#121418";
  ctx.fillRect(0, 0, 1024, 1024);

  // Brushed White / Titanium Armor Shielding Plating
  ctx.fillStyle = "#F8FAFC";
  // Upper VRM Area
  ctx.fillRect(40, 40, 360, 220);
  // Left I/O Heatsink
  ctx.fillRect(40, 260, 240, 480);
  // Lower M.2 & Chipset Heatsink Array
  ctx.fillRect(420, 560, 560, 420);

  // Surface Mount Test Pads (Gold Plated Circles)
  ctx.fillStyle = "#D4AF37";
  for (let i = 0; i < 60; i++) {
    const px = 300 + (Math.sin(i * 13) * 320 + 320);
    const py = 260 + (Math.cos(i * 7) * 220 + 220);
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Silver High-Frequency Memory & PCIe Trace Bundles
  ctx.strokeStyle = "rgba(203, 213, 225, 0.45)";
  ctx.lineWidth = 1.5;
  for (let t = 0; t < 24; t++) {
    ctx.beginPath();
    const startY = 320 + t * 8;
    ctx.moveTo(340, startY);
    ctx.lineTo(460, startY + 60);
    ctx.lineTo(600, startY + 60);
    ctx.stroke();
  }

  // Audio Circuit Isolation Trace (Glowing Orange/Silver Line)
  ctx.strokeStyle = "#F59E0B";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(60, 720);
  ctx.lineTo(180, 720);
  ctx.lineTo(180, 960);
  ctx.lineTo(400, 960);
  ctx.stroke();

  // Fine Silkscreen Typography & Graphics
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 26px 'Space Grotesk', sans-serif";
  ctx.fillText("ROG STRIX B650E-A GAMING", 450, 620);

  ctx.fillStyle = "#475569";
  ctx.font = "bold 15px monospace";
  ctx.fillText("PCIE GEN 5.0 x16 // 16+2+1 TEAMED POWER", 450, 655);
  ctx.fillText("OPTIMEM II // SUPREMEFX ALC4080", 450, 680);
  ctx.fillText("M.2 NVME DUAL HEATSINK ARRAY", 450, 705);

  // Chipset Hex Emblem & ROG Glitch Badge
  ctx.fillStyle = "#E2E8F0";
  ctx.fillRect(780, 740, 160, 160);
  ctx.strokeStyle = "#94A3B8";
  ctx.lineWidth = 4;
  ctx.strokeRect(780, 740, 160, 160);

  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 44px 'Space Grotesk', sans-serif";
  ctx.fillText("ROG", 815, 835);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

export function createRearIoShieldTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  // Brushed Stainless Steel Finish
  ctx.fillStyle = "#E2E8F0";
  ctx.fillRect(0, 0, 512, 1024);

  ctx.strokeStyle = "rgba(0, 0, 0, 0.04)";
  ctx.lineWidth = 1;
  for (let y = 0; y < 1024; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // BIOS Flashback Button
  ctx.fillStyle = "#1E293B";
  ctx.beginPath();
  ctx.arc(80, 120, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#F8FAFC";
  ctx.font = "bold 11px monospace";
  ctx.fillText("BIOS", 68, 124);

  // USB 2.0 Ports (4x Black)
  for (let u = 0; u < 4; u++) {
    const yPos = 180 + (u * 60);
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(60, yPos, 85, 45);
    ctx.fillStyle = "#334155";
    ctx.fillRect(68, yPos + 12, 70, 20);
  }

  // DisplayPort & HDMI
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(200, 180, 120, 55); // DP
  ctx.fillRect(200, 260, 110, 48); // HDMI

  // USB 3.2 Gen 2 (Red & Blue Ports)
  for (let b = 0; b < 4; b++) {
    const yPos = 440 + (b * 65);
    ctx.fillStyle = b < 2 ? "#0284C7" : "#E11D48";
    ctx.fillRect(60, yPos, 85, 45);
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(68, yPos + 12, 70, 20);
  }

  // 2.5G RJ45 Ethernet Port
  ctx.fillStyle = "#64748B";
  ctx.fillRect(200, 440, 110, 95);
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(212, 455, 86, 65);
  // Status LEDs
  ctx.fillStyle = "#22C55E";
  ctx.beginPath();
  ctx.arc(220, 448, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#F59E0B";
  ctx.beginPath();
  ctx.arc(290, 448, 4, 0, Math.PI * 2);
  ctx.fill();

  // USB Type-C 20Gbps Port
  ctx.fillStyle = "#0F172A";
  drawRoundedRect(ctx, 200, 560, 110, 40, 18);
  ctx.fill();
  ctx.fillStyle = "#CBD5E1";
  drawRoundedRect(ctx, 220, 574, 70, 12, 6);
  ctx.fill();

  // Dual WiFi 6E Gold Antenna Thread Ports
  [740, 820].forEach(yPos => {
    ctx.fillStyle = "#D4AF37";
    ctx.beginPath();
    ctx.arc(100, yPos, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#996515";
    ctx.beginPath();
    ctx.arc(100, yPos, 14, 0, Math.PI * 2);
    ctx.fill();
  });

  // 5x Gold-Plated 3.5mm Audio Jacks + Optical S/PDIF
  const audioColors = ["#E2E8F0", "#EF4444", "#3B82F6", "#22C55E", "#EAB308"];
  for (let a = 0; a < 5; a++) {
    const yPos = 700 + (a * 55);
    ctx.fillStyle = "#D4AF37";
    ctx.beginPath();
    ctx.arc(260, yPos, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = audioColors[a];
    ctx.beginPath();
    ctx.arc(260, yPos, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(260, yPos, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

export function createRubberGrommetTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Lian Li Signature Charcoal-Grey Silicone
  ctx.fillStyle = "#475569";
  ctx.fillRect(0, 0, 256, 512);

  // Outer Beveled Rubber Lip
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, 240, 496);

  // Center Slit (Flexible cable feed path)
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(124, 24, 8, 464);

  // 8 Horizontal Segmented Accordion Slits
  for (let s = 1; s <= 7; s++) {
    const y = s * 64;
    ctx.fillRect(24, y, 208, 6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createLianLiTrayTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  // Pure Matte Snow-White Powder-Coated Steel
  ctx.fillStyle = "#FAFCFF";
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle stamped structural indentation lines
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 3;
  ctx.strokeRect(80, 80, 864, 864);
  ctx.strokeRect(120, 120, 784, 784);

  // ATX Standoff Markers (Gold/Brass circles with "ATX" silkscreen)
  const standoffs = [
    [160, 160], [512, 160], [864, 160],
    [160, 512], [512, 512], [864, 512],
    [160, 864], [512, 864], [864, 864]
  ];

  standoffs.forEach(([x, y]) => {
    ctx.fillStyle = "#D4AF37";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 13px monospace";
    ctx.fillText("ATX", x - 12, y + 24);
  });

  // Lian Li Badge Stamp
  ctx.fillStyle = "#94A3B8";
  ctx.font = "bold 20px 'Space Grotesk', sans-serif";
  ctx.fillText("LIAN LI // O11 VISION", 160, 930);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createCpuTexture(cpuName = "AMD RYZEN 7 7800X3D") {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, "#E2E8F0");
  grad.addColorStop(0.5, "#F8FAFC");
  grad.addColorStop(1, "#CBD5E1");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = "#94A3B8";
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 498, 498);

  ctx.fillStyle = "#334155";
  ctx.textAlign = "center";
  ctx.font = "bold 30px 'Space Grotesk', sans-serif";
  ctx.fillText("AMD RYZEN™", 256, 190);

  ctx.font = "bold 22px monospace";
  ctx.fillText(cpuName.replace("AMD ", "").replace("Intel ", ""), 256, 240);

  ctx.font = "14px monospace";
  ctx.fillStyle = "#64748B";
  ctx.fillText("DIFFUSION IN USA // 96MB 3D V-CACHE", 256, 285);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createWhiteGpuBackplateTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Pure White Brushed Metal
  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, 1024, 512);

  ctx.strokeStyle = "rgba(0, 0, 0, 0.03)";
  ctx.lineWidth = 1;
  for (let y = 0; y < 512; y += 2) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Geometric Flow-Through Grill
  ctx.fillStyle = "#E2E8F0";
  for (let i = 0; i < 6; i++) {
    drawRoundedRect(ctx, 660 + (i * 52), 70, 32, 370, 8);
    ctx.fill();
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Minimal Typography
  ctx.fillStyle = "#1E293B";
  ctx.font = "bold 44px 'Space Grotesk', sans-serif";
  ctx.fillText("GEFORCE RTX", 80, 260);

  ctx.fillStyle = "#0051FF";
  ctx.font = "bold 18px monospace";
  ctx.fillText("WHITE EDITION // 24GB G6X", 80, 300);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createAioLcdTexture(temp = 48, brand = "LIAN LI", rgbHex = "#00F0FF") {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Deep Obsidian OLED Display Panel
  ctx.fillStyle = "#07080D";
  ctx.beginPath();
  ctx.arc(256, 256, 256, 0, Math.PI * 2);
  ctx.fill();

  // Subtle Outer Bezel Ring
  ctx.strokeStyle = "#1A1E29";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.stroke();

  // Circular Tachometer Background Track (135° to 405°)
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(256, 256, 205, startAngle, endAngle);
  ctx.stroke();

  // Active Dynamic Temperature Arc (Color-Coded)
  const pct = Math.max(0.2, Math.min(0.85, (temp - 25) / 60));
  const activeArc = startAngle + (endAngle - startAngle) * pct;
  const arcGrad = ctx.createLinearGradient(100, 400, 400, 100);
  arcGrad.addColorStop(0, "#00F0FF");
  arcGrad.addColorStop(0.5, "#3B82F6");
  arcGrad.addColorStop(1, "#FF6B00");
  ctx.strokeStyle = arcGrad;
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(256, 256, 205, startAngle, activeArc);
  ctx.stroke();

  // Radial Tick Marks
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2;
  for (let a = startAngle; a <= endAngle; a += (endAngle - startAngle) / 24) {
    const x1 = 256 + Math.cos(a) * 185;
    const y1 = 256 + Math.sin(a) * 185;
    const x2 = 256 + Math.cos(a) * 193;
    const y2 = 256 + Math.sin(a) * 193;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Top Telemetry Header
  ctx.fillStyle = "#38BDF8";
  ctx.font = "bold 18px monospace";
  ctx.textAlign = "center";
  ctx.fillText("CPU DIE // 4.85 GHz", 256, 140);

  // Large Bold Temperature Value
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 108px 'Space Grotesk', sans-serif";
  ctx.fillText(`${temp}°C`, 256, 250);

  // Sub-metrics (Pump RPM & Coolant Flow)
  ctx.fillStyle = "#94A3B8";
  ctx.font = "bold 16px monospace";
  ctx.fillText("PUMP: 2850 RPM   FLOW: 2.1 L/m", 256, 295);

  // Brand Watermark Bottom
  ctx.fillStyle = "#F8FAFC";
  ctx.font = "bold 20px 'Space Grotesk', sans-serif";
  const displayBrand = brand.toLowerCase().includes("arctic") ? "ARCTIC // FREEZER III" : "LIAN LI // GALAHAD II";
  ctx.fillText(displayBrand, 256, 365);

  // Status Indicator Dot (Pulsing Green / Blue)
  ctx.fillStyle = "#10B981";
  ctx.beginPath();
  ctx.arc(256, 395, 5, 0, Math.PI * 2);
  ctx.fill();

  // Curved Glass Lens Specular Reflection (Top Half)
  const lensGrad = ctx.createLinearGradient(0, 0, 0, 256);
  lensGrad.addColorStop(0, "rgba(255, 255, 255, 0.18)");
  lensGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.04)");
  lensGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = lensGrad;
  ctx.beginPath();
  ctx.arc(256, 256, 240, Math.PI, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createRamTexture(ram = null, isWhite = true) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const ramName = ram && ram.name ? ram.name : "G.Skill Trident Z5 RGB";
  let brandTitle = "TRIDENT Z5";
  let subTitle = "G.SKILL DDR5 // 6000MHz CL30";

  if (ramName.toLowerCase().includes("vengeance")) {
    brandTitle = "VENGEANCE";
    subTitle = "CORSAIR DDR5 // 6000MHz";
  } else if (ramName.toLowerCase().includes("delta") || ramName.toLowerCase().includes("t-force")) {
    brandTitle = "T-FORCE DELTA";
    subTitle = "RGB DDR5 // 6400MHz CL32";
  }

  // Dual-tone Brushed Metal Heatspreader Backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 0);
  if (isWhite) {
    bgGrad.addColorStop(0, "#E2E8F0");
    bgGrad.addColorStop(0.25, "#F8FAFC");
    bgGrad.addColorStop(0.75, "#F1F5F9");
    bgGrad.addColorStop(1, "#CBD5E1");
  } else {
    bgGrad.addColorStop(0, "#14171E");
    bgGrad.addColorStop(0.25, "#232832");
    bgGrad.addColorStop(0.75, "#1C2028");
    bgGrad.addColorStop(1, "#12141A");
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Brushed Horizontal Texture Lines
  ctx.strokeStyle = isWhite ? "rgba(0, 0, 0, 0.035)" : "rgba(255, 255, 255, 0.035)";
  ctx.lineWidth = 1.5;
  for (let y = 0; y < 512; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Recessed Black / Carbon Geometric Inset Badge
  ctx.fillStyle = isWhite ? "#0B0E14" : "#06080B";
  drawRoundedRect(ctx, 60, 90, 904, 300, 20);
  ctx.fill();

  // Polished Diamond-Cut Gold / Metallic Accent Rim
  ctx.strokeStyle = isWhite ? "#D4AF37" : "#38BDF8";
  ctx.lineWidth = 5;
  ctx.stroke();

  // Inner Accent Glow Line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 72, 102, 880, 276, 14);
  ctx.stroke();

  // Bold Laser-Etched RAM Name
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 64px 'Space Grotesk', system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(brandTitle, 512, 200);

  // Subtitle Specifications
  ctx.fillStyle = isWhite ? "#38BDF8" : "#94A3B8";
  ctx.font = "bold 26px monospace";
  ctx.fillText(subTitle, 512, 275);

  // Bottom Gold Edge Connector Contacts
  ctx.fillStyle = "#D4AF37";
  for (let p = 20; p < 1000; p += 16) {
    ctx.fillRect(p, 470, 10, 42);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

export function createFanHubBadgeTexture(brand = "LIAN LI") {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // Radial Brushed Gunmetal / Chrome Hub
  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, "#E2E8F0");
  grad.addColorStop(0.45, "#1E293B");
  grad.addColorStop(0.85, "#0F172A");
  grad.addColorStop(1, "#020617");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 128, 128, 0, Math.PI * 2);
  ctx.fill();

  // Concentric Holographic Reflection Rings
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(128, 128, 110, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#FF6B00";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(128, 128, 92, 0, Math.PI * 2);
  ctx.stroke();

  // Center Brand Mark
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.font = "bold 24px 'Space Grotesk', sans-serif";
  ctx.fillText(brand, 128, 125);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "bold 12px monospace";
  ctx.fillText("HIGH STATIC AIR", 128, 148);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createPsuSpecTexture(wattage = 1000) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#12151C";
  ctx.fillRect(0, 0, 512, 256);

  // Border & Gold 80-Plus Badge
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, 488, 232);

  ctx.fillStyle = "#D4AF37";
  ctx.fillRect(360, 30, 110, 110);
  ctx.fillStyle = "#0B0D12";
  ctx.textAlign = "center";
  ctx.font = "bold 22px 'Space Grotesk', sans-serif";
  ctx.fillText("80 PLUS", 415, 75);
  ctx.font = "bold 18px monospace";
  ctx.fillText("GOLD", 415, 105);

  // Brand and Wattage
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.font = "bold 36px 'Space Grotesk', sans-serif";
  ctx.fillText("SEASONIC", 40, 75);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "bold 18px monospace";
  ctx.fillText("FOCUS GX ATX 3.0", 40, 110);

  ctx.fillStyle = "#F8FAFC";
  ctx.font = "bold 52px monospace";
  ctx.fillText(`${wattage}W`, 40, 185);

  ctx.fillStyle = "#64748B";
  ctx.font = "12px monospace";
  ctx.fillText("ACTIVE PFC // FULL MODULAR // 12VHPWR NATIVE", 40, 218);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
