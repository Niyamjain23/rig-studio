# RIG STUDIO // Interactive 3D PC Builder & Clearance Lab

High-performance visual PC builder with real-time 3D assembly, aerodynamic airflow simulator, physical millimeter clearance collision detection, and authentic hardware engineering field notes.

Inspired by clean motorsport aesthetics (Lando Norris / LN4 style) with soft silver-white gradients and electric volt accents.

## Features

- **3D Interactive Rig Viewport:**
  - Real-time PBR components: Motherboard, CPU, Dual-tower Air Cooler & AIO Liquid Cooler (tubes + radiator), GPU dynamically scaled to exact millimeters, RAM heatspreaders with lightbars, PSU basement, rotating fans, and chassis frame.
  - Interactive Glass Side Panel toggle (view internals vs full tempered glass reflection).
  - Dynamic Airflow Streamlines (blue cool intake particles vs orange hot exhaust particles).
  - Exploded View Slider (mechanically separates components along mounting axes).
  - Orbit, Pan, Zoom, and Auto-focus camera controls.

- **Physical Clearance & Conflict Engine:**
  - Millimeter-accurate checks for GPU length vs available chassis clearance.
  - Radiator deduction logic: mounting a front 360mm/280mm AIO automatically subtracts radiator and fan thickness from maximum GPU clearance.
  - Air cooler height vs chassis glass clearance.
  - RAM heatspreader height vs dual-tower cooler overhang alerts.
  - Motherboard form-factor vs chassis standoffs.
  - CPU socket vs Motherboard socket mismatch prevention.

- **Aerodynamic Airflow Lab:**
  - Real-time CFM balance (Intake CFM vs Exhaust CFM).
  - Dynamic Pressure Gauge: Positive Pressure (Dust defense), Negative Pressure (Thermal exhaust dump), and Balanced Pressure.
  - Interactive fan direction toggles (Intake ⇄ Exhaust for Front, Top, Rear, Bottom brackets).

- **Hardware Engineer's Field Notes:**
  - Real-world gotchas: 12VHPWR 35mm cable bend clearance, AM5 first-boot memory training duration, Intel 13/14th Gen 0x129+ microcode baseline requirements, Arctic Liquid Freezer III 38mm radiator thickness warning, and heavy GPU anti-sag recommendations.

- **Telemetry & BOM Sharing:**
  - Live price calculation and peak wattage power meter with transient spike headroom.
  - 1-click clipboard Bill of Materials export.

---

## Running Locally

### Option 1: Double-Click
Double-click `start.bat` and open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Command Line (Python)
```bash
python -m http.server 3000
```
Then visit [http://localhost:3000](http://localhost:3000).

---

## 100% Offline & Clean ZIP Bundling

- **No external dependencies required:** Core 3D engine libraries (`three.min.js`, `OrbitControls.js`) are bundled locally in `/vendor`.
- **Lightweight footprint:** The entire project folder is under **1.5MB**!
- To package: Select all files in this directory and zip them.

---

## Deploying to Vercel

1. Push this repository to GitHub or upload the folder directly via the [Vercel Dashboard](https://vercel.com/new).
2. Because this is a pure static web app with standard `index.html` and `vercel.json`, Vercel deploys it instantly in under 15 seconds with zero build steps or serverless cold starts.
