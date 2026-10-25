# Rig Studio

🔗 **Live Demo:** [https://rig-studio-blush.vercel.app/](https://rig-studio-blush.vercel.app/)

A simple web app to help visualize and plan custom PC builds in 3D before spending money on parts.

Instead of just looking at text lists on PCPartPicker, this lets you see a 3D model of the rig, swap parts, check if they physically fit inside the case, and preview how the lighting looks.

---

## What It Actually Does

- **3D Preview:** Rotate, zoom in, and inspect the PC build from any angle.
- **Component Swapping:** Pick parts across 8 hardware categories:
  - Chassis / Cases (Lian Li O11 Dynamic EVO, Fractal North, Corsair 4000D, etc.)
  - Motherboards
  - Processors (CPUs)
  - Coolers (Air coolers and liquid AIOs)
  - Graphics Cards (GPUs)
  - Memory (RAM)
  - Power Supplies (PSUs)
  - Case Fans (with intake and exhaust flow direction controls)
- **Fit & Clearance Checks:** Flags conflicts automatically:
  - GPU length vs available case room.
  - Front-mounted liquid radiator blocking long GPUs.
  - CPU cooler height vs chassis glass panel clearance.
  - CPU socket vs motherboard socket mismatches.
- **Specs Inspector:** A dedicated specs button for each part to check dimensions, TDP, clock speeds, and ports without cluttering the cards.
- **Power & Price Tracking:** Estimates total build cost and power consumption against your power supply wattage in real time.
- **RGB Lighting Slider:** An interactive color spectrum bar to preview the setup with different lighting colors, plus a rainbow wave toggle.
- **Mobile Orientation Lock:** Prompts mobile users to turn their device to landscape so the 3D viewport and part selector fit naturally on screen.
- **Parts List Export:** Copies a clean Bill of Materials (BOM) summary to the clipboard.

---

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (ES modules)
- **3D Engine:** Three.js + OrbitControls + GLTFLoader + Post-processing Bloom
- **Styling:** Tailwind CSS + Custom frosted glass UI
- **Assets:** 3D GLB models

---

## Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Niyamjain23/rig-studio.git
   cd rig-studio
   ```

2. Start any local static server:
   ```bash
   python -m http.server 3000
   ```

3. Open `http://localhost:3000` in your browser.
