/* PC Studio 3D Hardware Database */
export const HARDWARE_DB = {
  chassis: [
    {
      id: "lian-li-o11d-evo",
      name: "Lian Li O11 Dynamic EVO",
      brand: "Lian Li",
      type: "Mid Tower (Dual Chamber)",
      formFactors: ["E-ATX", "ATX", "Micro-ATX", "Mini-ITX"],
      maxGpuLength: 422, // mm
      maxCoolerHeight: 167, // mm
      maxPsuLength: 220, // mm
      topRadSupport: 360,
      frontRadSupport: 360, // Side/front intake
      fanMounts: { front: 3, top: 3, rear: 1, bottom: 3 },
      price: 169,
      imageStyle: "dual-chamber-glass",
      dimensions: { w: 285, h: 459, d: 465 },
      engineerNote: "Exceptional dual-chamber thermal performance. Side-intake allows 360mm AIO without encroaching on 420mm+ GPU clearance."
    },
    {
      id: "fractal-north",
      name: "Fractal Design North",
      brand: "Fractal Design",
      type: "Mid Tower (Real Walnut/Oak)",
      formFactors: ["ATX", "Micro-ATX", "Mini-ITX"],
      maxGpuLength: 355, // mm (325mm with front 30mm fan+rad)
      maxCoolerHeight: 170, // mm
      maxPsuLength: 255, // mm
      topRadSupport: 240,
      frontRadSupport: 360,
      fanMounts: { front: 3, top: 2, rear: 1, bottom: 0 },
      price: 139,
      imageStyle: "wood-slat-minimal",
      dimensions: { w: 215, h: 469, d: 447 },
      engineerNote: "High aesthetic appeal with real wood front. Note: Mounting a front 360mm AIO reduces maximum GPU length from 355mm down to ~300mm."
    },
    {
      id: "corsair-4000d-airflow",
      name: "Corsair 4000D Airflow",
      brand: "Corsair",
      type: "Mid Tower (High Airflow)",
      formFactors: ["ATX", "Micro-ATX", "Mini-ITX"],
      maxGpuLength: 360,
      maxCoolerHeight: 170,
      maxPsuLength: 220,
      topRadSupport: 240,
      frontRadSupport: 360,
      fanMounts: { front: 3, top: 2, rear: 1, bottom: 0 },
      price: 104,
      imageStyle: "mesh-front",
      dimensions: { w: 230, h: 466, d: 453 },
      engineerNote: "A staple chassis. Standard top radiator clearance requires low-profile RAM to avoid EPS power cable / VRM heatshield pinches."
    },
    {
      id: "nzxt-h5-flow",
      name: "NZXT H5 Flow (2024)",
      brand: "NZXT",
      type: "Compact Mid Tower",
      formFactors: ["ATX", "Micro-ATX", "Mini-ITX"],
      maxGpuLength: 365,
      maxCoolerHeight: 165,
      maxPsuLength: 200,
      topRadSupport: 240,
      frontRadSupport: 280,
      fanMounts: { front: 2, top: 2, rear: 1, bottom: 1 },
      price: 89,
      imageStyle: "minimal-stealth",
      dimensions: { w: 227, h: 464, d: 446 },
      engineerNote: "Includes the dedicated bottom-angled GPU intake fan. Great for open-air cooler GPUs, but front 280mm AIO restricts 3-fan graphics cards."
    }
  ],

  motherboards: [
    {
      id: "asus-rog-b650e-f",
      name: "ASUS ROG Strix B650E-F Gaming WiFi",
      socket: "AM5",
      chipset: "B650E",
      formFactor: "ATX",
      memoryType: "DDR5",
      pcieGen: "PCIe 5.0 x16",
      m2Slots: 3,
      price: 269,
      vrmPhases: "12+2 (80A)",
      engineerNote: "PCIe 5.0 GPU & M.2 readiness. Excellent VRM heatsinks. BIOS flashback button on rear I/O is invaluable for out-of-the-box CPU support."
    },
    {
      id: "msi-mag-x670e-tomahawk",
      name: "MSI MAG X670E Tomahawk WiFi",
      socket: "AM5",
      chipset: "X670E",
      formFactor: "ATX",
      memoryType: "DDR5",
      pcieGen: "PCIe 5.0 x16",
      m2Slots: 4,
      price: 279,
      vrmPhases: "14+2+1 (80A)",
      engineerNote: "Robust power delivery for Ryzen 9 chips. Outstanding PCIe lane distribution without disabling SATA ports."
    },
    {
      id: "asus-tuf-z790-plus",
      name: "ASUS TUF Gaming Z790-Plus WiFi",
      socket: "LGA1700",
      chipset: "Z790",
      formFactor: "ATX",
      memoryType: "DDR5",
      pcieGen: "PCIe 5.0 x16",
      m2Slots: 4,
      price: 229,
      vrmPhases: "16+1 (60A)",
      engineerNote: "Solid military-grade capacitors. Requires latest Intel 0x129+ microcode BIOS update before running 13th/14th Gen unlocked CPUs."
    },
    {
      id: "gigabyte-b650i-aorus-ultra",
      name: "Gigabyte B650I AORUS Ultra",
      socket: "AM5",
      chipset: "B650",
      formFactor: "Mini-ITX",
      memoryType: "DDR5",
      pcieGen: "PCIe 5.0 x16",
      m2Slots: 3,
      price: 249,
      vrmPhases: "8+2+1 (105A)",
      engineerNote: "Compact ITX beast with triple M.2 stacks. Requires low profile CPU coolers or AIO pump blocks due to elevated M.2 heatsink."
    }
  ],

  cpus: [
    {
      id: "ryzen-7-7800x3d",
      name: "AMD Ryzen 7 7800X3D",
      socket: "AM5",
      cores: 8,
      threads: 16,
      baseClock: "4.2 GHz",
      boostClock: "5.0 GHz",
      tdp: 120,
      vCache: "96MB 3D V-Cache",
      price: 389,
      integratedGpu: true,
      engineerNote: "The undisputed gaming king. Highly efficient; rarely pulls over 85W in gaming loads despite 120W TDP rating. Air cooling is totally sufficient."
    },
    {
      id: "ryzen-9-7950x3d",
      name: "AMD Ryzen 9 7950X3D",
      socket: "AM5",
      cores: 16,
      threads: 32,
      baseClock: "4.2 GHz",
      boostClock: "5.7 GHz",
      tdp: 120,
      vCache: "128MB Cache",
      price: 589,
      integratedGpu: true,
      engineerNote: "Dual-CCD powerhouse. Core parking drivers via AMD Chipset software are strictly required to ensure games route to the 3D V-Cache CCD."
    },
    {
      id: "ryzen-5-7600x",
      name: "AMD Ryzen 5 7600X",
      socket: "AM5",
      cores: 6,
      threads: 12,
      baseClock: "4.7 GHz",
      boostClock: "5.3 GHz",
      tdp: 105,
      vCache: "32MB",
      price: 209,
      integratedGpu: true,
      engineerNote: "Great price-to-performance entry to AM5. Targets 95°C thermal junction by design under full AVX512 workload—this is normal behavior."
    },
    {
      id: "intel-i7-14700k",
      name: "Intel Core i7-14700K",
      socket: "LGA1700",
      cores: 20, // 8P + 12E
      threads: 28,
      baseClock: "3.4 GHz",
      boostClock: "5.6 GHz",
      tdp: 253, // Max Turbo PL2
      price: 399,
      integratedGpu: true,
      engineerNote: "Demands a 360mm AIO for unrestricted PL2 253W boost. Enforce Intel Baseline Default Profile in BIOS to prevent long-term silicon degradation."
    },
    {
      id: "intel-i9-14900k",
      name: "Intel Core i9-14900K",
      socket: "LGA1700",
      cores: 24, // 8P + 16E
      threads: 32,
      baseClock: "3.2 GHz",
      boostClock: "6.0 GHz",
      tdp: 253,
      price: 549,
      integratedGpu: true,
      engineerNote: "Thermal monster. Can spike beyond 320W if motherboard multi-core enhancement (MCE) is left unconstrained. Recommend contact frame for socket."
    }
  ],

  coolers: [
    {
      id: "noctua-nh-d15-chromax",
      name: "Noctua NH-D15 chromax.black",
      type: "Air (Dual Tower)",
      height: 165, // mm
      radiatorSize: 0,
      fanSize: 140,
      tdpRating: 250,
      ramClearance: 32, // mm (with front fan, 64mm without front fan)
      price: 119,
      engineerNote: "Legendary acoustic and thermal performance. Front 140mm fan overhangs the RAM: tall RGB RAM (>32mm) forces lifting the front fan 10-15mm up."
    },
    {
      id: "thermalright-peerless-assassin-120",
      name: "Thermalright Peerless Assassin 120 SE",
      type: "Air (Dual Tower)",
      height: 155, // mm
      radiatorSize: 0,
      fanSize: 120,
      tdpRating: 245,
      ramClearance: 44, // mm
      price: 35,
      engineerNote: "The budget benchmark. Punches way above its $35 price tag. Easy installation and fits comfortably in almost any mid-tower chassis."
    },
    {
      id: "arctic-liquid-freezer-iii-360",
      name: "Arctic Liquid Freezer III 360 AIO",
      type: "Liquid (AIO)",
      height: 65, // pump block
      radiatorSize: 360,
      radiatorThickness: 38, // mm (extra thick!)
      fanThickness: 25, // mm -> total 63mm!
      tdpRating: 350,
      ramClearance: 100, // AIO has unlimited RAM clearance
      price: 115,
      engineerNote: "CRITICAL: Arctic radiators are 38mm thick (standard is 27mm). Total stack with fans is 63mm! Check top VRM heatsink & EPS cable clearance."
    },
    {
      id: "nzxt-kraken-elite-360",
      name: "NZXT Kraken Elite 360 RGB",
      type: "Liquid (AIO)",
      height: 53,
      radiatorSize: 360,
      radiatorThickness: 27,
      fanThickness: 26, // total 53mm
      tdpRating: 320,
      ramClearance: 100,
      price: 279,
      engineerNote: "Sleek 2.36' 60Hz LCD pump display. Standard 27mm radiator fits top mounts of almost all mid towers without blocking RAM clips."
    }
  ],

  gpus: [
    {
      id: "nvidia-rtx-4090-fe",
      name: "NVIDIA GeForce RTX 4090 Founders Edition",
      brand: "NVIDIA",
      length: 304, // mm
      height: 137, // mm
      slotThickness: 3.5, // 61mm
      powerWatts: 450,
      powerConnector: "16-pin 12V-2x6 / 12VHPWR",
      price: 1599,
      engineerNote: "Monolithic flow-through vapor chamber. CRITICAL: 12VHPWR cable requires at least 35mm clearance from side glass panel without bending prematurely."
    },
    {
      id: "asus-rog-strix-rtx-4090",
      name: "ASUS ROG Strix GeForce RTX 4090 OC",
      brand: "ASUS",
      length: 357.6, // mm! Massive
      height: 149.3,
      slotThickness: 3.5, // 70.1mm
      powerWatts: 500,
      powerConnector: "16-pin 12VHPWR",
      price: 1999,
      engineerNote: "Massive 358mm card. Will collide with front-mounted 360mm radiators in cases with under 390mm GPU clearance. Requires bundled anti-sag pillar."
    },
    {
      id: "msi-rtx-4080-super-slim",
      name: "MSI GeForce RTX 4080 Super Gaming X Slim",
      brand: "MSI",
      length: 322,
      height: 136,
      slotThickness: 2.5, // 50mm
      powerWatts: 320,
      powerConnector: "16-pin 12VHPWR",
      price: 1029,
      engineerNote: "Slimmer 2.5-slot profile preserves access to lower motherboard PCIe slots. Outstanding 4K performance at ~300W real-world gaming draw."
    },
    {
      id: "nvidia-rtx-4070-super-fe",
      name: "NVIDIA GeForce RTX 4070 Super Founders Edition",
      brand: "NVIDIA",
      length: 242,
      height: 112,
      slotThickness: 2.0, // 40mm
      powerWatts: 220,
      powerConnector: "16-pin 12VHPWR",
      price: 599,
      engineerNote: "The 1440p sweet spot. Compact 242mm length fits almost any ITX / mATX case without clearance issues. Extremely cool and quiet."
    },
    {
      id: "amd-rx-7900-xtx",
      name: "AMD Radeon RX 7900 XTX (Reference)",
      brand: "AMD",
      length: 287,
      height: 123,
      slotThickness: 2.5,
      powerWatts: 355,
      powerConnector: "2x 8-pin PCIe (Standard)",
      price: 929,
      engineerNote: "No 12VHPWR adapter needed; uses standard 8-pin PCIe cables. 24GB VRAM handles heavy modded textures and high resolutions effortlessly."
    }
  ],

  ram: [
    {
      id: "gskill-trident-z5-rgb-32",
      name: "G.Skill Trident Z5 RGB 32GB (2x16GB)",
      brand: "G.Skill",
      speed: "DDR5-6000 CL30",
      height: 44, // mm
      rgb: true,
      price: 114,
      engineerNote: "6000MHz CL30 is the sweet spot for AMD AM5 memory controller (1:1 IF clock). 44mm height requires checking dual-tower air cooler front fan."
    },
    {
      id: "corsair-vengeance-ddr5-32",
      name: "Corsair Vengeance DDR5 32GB (2x16GB)",
      brand: "Corsair",
      speed: "DDR5-6000 CL30",
      height: 35, // mm Low profile
      rgb: false,
      price: 109,
      engineerNote: "Low profile 35mm height guarantees 100% compatibility with large dual-tower air coolers (e.g. Noctua NH-D15, Peerless Assassin)."
    },
    {
      id: "teamgroup-tforce-delta-rgb-32",
      name: "TeamGroup T-Force Delta RGB 32GB (2x16GB)",
      brand: "TeamGroup",
      speed: "DDR5-6400 CL32",
      height: 46.1, // mm Tall
      rgb: true,
      price: 102,
      engineerNote: "Tall aggressive fin design (46.1mm). Best paired with top-mounted AIO liquid coolers where air cooler fan interference isn't a factor."
    }
  ],

  psu: [
    {
      id: "seasonic-vertex-gx-1000",
      name: "Seasonic VERTEX GX-1000",
      brand: "Seasonic",
      wattage: 1000,
      efficiency: "80+ Gold",
      atxStandard: "ATX 3.0 / PCIe 5.0 Ready",
      length: 160,
      price: 199,
      engineerNote: "Tier A+ rated. Native 12VHPWR cable with embossed gold terminals. Japanese 105°C capacitors and 12-year warranty."
    },
    {
      id: "corsair-rm850x-shift",
      name: "Corsair RM850x (ATX 3.0)",
      brand: "Corsair",
      wattage: 850,
      efficiency: "80+ Gold",
      atxStandard: "ATX 3.0 Ready",
      length: 160,
      price: 129,
      engineerNote: "Proven industrial workhorse. Low ripple noise and silent zero-RPM fan mode up to 40% load. Enough wattage for RTX 4080 Super & 7800X3D."
    },
    {
      id: "bequiet-pure-power-12m-750",
      name: "be quiet! Pure Power 12 M 750W",
      brand: "be quiet!",
      wattage: 750,
      efficiency: "80+ Gold",
      atxStandard: "ATX 3.0",
      length: 160,
      price: 99,
      engineerNote: "High efficiency whisper-quiet PSU. Ample 750W headroom for RTX 4070 Super / RX 7800 XT systems with transient spike suppression."
    }
  ]
};
