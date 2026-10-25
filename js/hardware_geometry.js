/* High-Fidelity 3D Hardware Geometry Builder (Micro-Detailed Components) */
import { 
  createWhiteMoboTexture, 
  createRearIoShieldTexture,
  createAioLcdTexture,
  createWhiteGpuBackplateTexture,
  createFanHubBadgeTexture
} from "./textures.js";

export function buildMotherboard3D(mobo) {
  const group = new THREE.Group();
  group.name = "mobo";

  const isItx = mobo && mobo.formFactor === "Mini-ITX";
  const pcbWidth = isItx ? 0.9 : 1.35;
  const pcbHeight = isItx ? 0.9 : 1.35;

  // 1. Multi-Layer High-Density Matte PCB with Procedural Circuit Silkscreen
  const moboTexture = createWhiteMoboTexture();
  const pcbMat = new THREE.MeshStandardMaterial({
    map: moboTexture,
    roughness: 0.45,
    metalness: 0.35
  });
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.025, pcbHeight, pcbWidth), pcbMat);
  pcb.castShadow = true;
  pcb.receiveShadow = true;
  group.add(pcb);

  // 2. Heavy Anodized Aluminum VRM Heatsink Array (Stepped Fin Slits & ROG Armor)
  const vrmColor = 0xF1F5F9;
  const vrmMat = new THREE.MeshStandardMaterial({ color: vrmColor, metalness: 0.92, roughness: 0.15 });

  // Top VRM Fin Stack with Individual Slits
  const topVrm = new THREE.Group();
  topVrm.position.set(0.04, pcbHeight * 0.38, -0.15);
  for (let f = 0; f < 8; f++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.04), vrmMat);
    fin.position.z = (f * 0.08) - 0.28;
    fin.castShadow = true;
    topVrm.add(fin);
  }
  group.add(topVrm);

  // Left Rear I/O Armor & Heatsink Tower
  const ioArmor = new THREE.Mesh(new THREE.BoxGeometry(0.08, pcbHeight * 0.52, 0.18), vrmMat);
  ioArmor.position.set(0.04, pcbHeight * 0.15, -pcbWidth * 0.38);
  ioArmor.castShadow = true;
  group.add(ioArmor);

  // Rear I/O Shield Block with Realistic Texture (Type-C, 2.5G LAN, WiFi 6E, Gold Jacks)
  const ioTexture = createRearIoShieldTexture();
  const ioPortMat = new THREE.MeshStandardMaterial({ map: ioTexture, metalness: 0.95, roughness: 0.1 });
  const ioShield = new THREE.Mesh(new THREE.BoxGeometry(0.06, pcbHeight * 0.45, 0.04), ioPortMat);
  ioShield.position.set(-0.02, pcbHeight * 0.15, -pcbWidth * 0.47);
  group.add(ioShield);

  // 3. AM5 / LGA1700 CPU Socket Frame & Chrome Load Arm
  const socketMat = new THREE.MeshStandardMaterial({ color: 0x22252C, roughness: 0.5 });
  const socketBase = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.38, 0.38), socketMat);
  socketBase.position.set(0.02, 0.20, -0.05);
  group.add(socketBase);

  // Chrome Lever Latch Arm
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xEEEEEE, metalness: 0.98, roughness: 0.05 });
  const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.42, 8), chromeMat);
  lever.position.set(0.038, 0.20, -0.25);
  group.add(lever);

  // 4. 16x Cylindrical Solid Aluminum Capacitors (Silver Cylinders with Black Tops)
  const capMat = new THREE.MeshStandardMaterial({ color: 0xDCDCDC, metalness: 0.95, roughness: 0.1 });
  const capTopMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

  for (let c = 0; c < 12; c++) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.035, 12), capMat);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(0.03, 0.08 + (c * 0.038), -0.05 + ((c % 2) * 0.04));
    group.add(cap);

    const capTop = new THREE.Mesh(new THREE.CircleGeometry(0.013, 12), capTopMat);
    capTop.rotation.y = Math.PI / 2;
    capTop.position.set(0.048, 0.08 + (c * 0.038), -0.05 + ((c % 2) * 0.04));
    group.add(capTop);
  }

  // 5. 8x Square Ferrite Power Chokes (Cubic Inductors)
  const chokeMat = new THREE.MeshStandardMaterial({ color: 0x1E2024, roughness: 0.6 });
  for (let k = 0; k < 8; k++) {
    const choke = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, 0.035), chokeMat);
    choke.position.set(0.025, 0.12 + (k * 0.052), -0.22);
    group.add(choke);
  }

  // 6. ATX 24-Pin Power Socket Block (Right Edge)
  const atxSocket = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, 0.32, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x181A1F, roughness: 0.5 })
  );
  atxSocket.position.set(0.03, 0.25, pcbWidth * 0.44);
  group.add(atxSocket);

  // Dual EPS 8-Pin CPU Power Sockets (Top Left)
  for (let e = 0; e < 2; e++) {
    const eps = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.07, 0.09),
      new THREE.MeshStandardMaterial({ color: 0x181A1F, roughness: 0.5 })
    );
    eps.position.set(0.03, pcbHeight * 0.45, -pcbWidth * 0.35 + (e * 0.11));
    group.add(eps);
  }

  // 7. CR2032 CMOS Battery (Silver Coin Cell in Black Holder)
  const coinMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.98, roughness: 0.1 });
  const cmosBattery = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.015, 24), coinMat);
  cmosBattery.rotation.z = Math.PI / 2;
  cmosBattery.position.set(0.03, -0.32, 0.24);
  group.add(cmosBattery);

  // 8. M.2 Heat Armor Shield Plate with Chamfers
  const m2Shield = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.1, 0.55),
    vrmMat
  );
  m2Shield.position.set(0.03, -0.2, 0.1);
  m2Shield.castShadow = true;
  group.add(m2Shield);

  // 9. Reinforced PCIe Gen 5 x16 Slot with Silver Steel Armor & Retention Latch
  const pcieSlot = new THREE.Mesh(
    new THREE.BoxGeometry(0.045, 0.045, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xEEEEEE, metalness: 0.95, roughness: 0.1 })
  );
  pcieSlot.position.set(0.03, -0.05, 0.06);
  group.add(pcieSlot);

  // PCIe Retention Clip
  const pcieClip = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.03, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x334155 })
  );
  pcieClip.position.set(0.03, -0.05, 0.48);
  group.add(pcieClip);

  // 10. DDR5 Dual-Channel DIMM Slots with End Retention Latches
  const dimmMat = new THREE.MeshStandardMaterial({ color: 0x1E2026, roughness: 0.6 });
  const latchMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.9, roughness: 0.15 });
  [-0.016, 0.016].forEach(offsetX => {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.025, 0.54), dimmMat);
    slot.position.set(0.05 + offsetX, 0.22, 0.285);
    group.add(slot);

    // Chrome End Retention Latches
    [-0.265, 0.265].forEach(endZ => {
      const latch = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.035, 0.02), latchMat);
      latch.position.set(0.05 + offsetX, 0.225, 0.285 + endZ);
      group.add(latch);
    });
  });

  // 12. 4x Nichicon Fine Gold Audio Capacitors (Dedicated Audio Zone)
  const audioCapMat = new THREE.MeshStandardMaterial({ color: 0xEAB308, metalness: 0.92, roughness: 0.15 });
  const audioCapTopMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  for (let a = 0; a < 4; a++) {
    const aCap = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.04, 12), audioCapMat);
    aCap.rotation.z = Math.PI / 2;
    aCap.position.set(0.032, -0.40 + (a * 0.045), -0.38);
    group.add(aCap);

    const aCapTop = new THREE.Mesh(new THREE.CircleGeometry(0.015, 12), audioCapTopMat);
    aCapTop.rotation.y = Math.PI / 2;
    aCapTop.position.set(0.053, -0.40 + (a * 0.045), -0.38);
    group.add(aCapTop);
  }

  // 13. Red & Black Stacked SATA Ports
  const sataMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.4 });
  for (let s = 0; s < 2; s++) {
    const sata = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.045, 0.075), sataMat);
    sata.position.set(0.03, -0.12 + (s * 0.065), pcbWidth * 0.45);
    group.add(sata);
  }

  // 14. Onboard Diagnostic Q-LED Array (Green, White, Yellow, Red)
  const qLedColors = [0x22C55E, 0xF8FAFC, 0xEAB308, 0xEF4444];
  qLedColors.forEach((col, idx) => {
    const qLed = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: col }));
    qLed.position.set(0.032, 0.42 + (idx * 0.02), pcbWidth * 0.43);
    group.add(qLed);
  });

  return group;
}

export function buildGpu3D(gpu, rgbColor = 0x00F0FF) {
  const group = new THREE.Group();
  group.name = "gpu";

  const fanBladesList = [];

  const mm = gpu && gpu.length ? gpu.length : 304;
  const lengthWorld = (mm / 300) * 1.18;
  const heightWorld = 0.44;
  const thickWorld = (gpu && gpu.slotThickness ? gpu.slotThickness : 2.8) * 0.045;

  const isWhite = gpu && gpu.name && gpu.name.toLowerCase().includes("white");
  const isFounders = gpu && gpu.name && gpu.name.includes("Founders");

  const shroudMat = new THREE.MeshStandardMaterial({
    color: isWhite ? 0xFAFCFF : (isFounders ? 0x2A2E36 : 0x16181D),
    metalness: isFounders ? 0.88 : 0.65,
    roughness: 0.22
  });

  const backplateMat = new THREE.MeshStandardMaterial({
    map: isWhite ? createWhiteGpuBackplateTexture() : null,
    color: isWhite ? 0xFFFFFF : (isFounders ? 0x20242C : 0x1E222A),
    metalness: 0.88,
    roughness: 0.2
  });

  const finMat = new THREE.MeshStandardMaterial({
    color: 0xDCE2EB,
    metalness: 0.95,
    roughness: 0.12
  });

  // 1. Sculpted Outer Shroud (Vertical Showcase Mount - Facing Side Glass!)
  const shroud = new THREE.Mesh(
    new THREE.BoxGeometry(thickWorld, heightWorld, lengthWorld),
    shroudMat
  );
  shroud.position.set(0, heightWorld * 0.5, lengthWorld * 0.5);
  shroud.castShadow = true;
  group.add(shroud);

  // Brushed Titanium Accent Plate on Top Shroud Edge
  const topAccent = new THREE.Mesh(
    new THREE.BoxGeometry(thickWorld * 1.01, 0.018, lengthWorld * 0.92),
    new THREE.MeshStandardMaterial({ color: isWhite ? 0xE2E8F0 : 0x334155, metalness: 0.92, roughness: 0.15 })
  );
  topAccent.position.set(0, heightWorld * 0.99, lengthWorld * 0.5);
  group.add(topAccent);

  // 2. High-Density Aluminum Heatsink Fins (28 fins along length)
  const finCount = 28;
  const finSpan = (lengthWorld * 0.85) / finCount;
  for (let f = 0; f < finCount; f++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(thickWorld * 0.85, heightWorld * 0.82, 0.008), finMat);
    fin.position.set(0, heightWorld * 0.5, (lengthWorld * 0.08) + (f * finSpan));
    group.add(fin);
  }

  // 3. Thick Sintered Copper Heatpipes
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xB87333, metalness: 0.9, roughness: 0.2 });
  for (let p = 0; p < 3; p++) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, lengthWorld * 0.82, 12), copperMat);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(0, heightWorld * (0.28 + (p * 0.22)), lengthWorld * 0.5);
    group.add(pipe);
  }

  // 4. Brushed Metal Inner Backplate (Facing Motherboard)
  const backplate = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, heightWorld * 0.96, lengthWorld * 0.96),
    backplateMat
  );
  backplate.position.set(-thickWorld * 0.5 - 0.004, heightWorld * 0.5, lengthWorld * 0.5);
  backplate.castShadow = true;
  group.add(backplate);

  // Flow-through cutout on the backplate
  const cutout = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, heightWorld * 0.65, lengthWorld * 0.24),
    new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.7 })
  );
  cutout.position.set(-thickWorld * 0.5 - 0.005, heightWorld * 0.5, lengthWorld * 0.75);
  group.add(cutout);

  // Gold PCIe Edge Connector Pins (Interface edge)
  const goldPinMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.95, roughness: 0.1 });
  const pciePins = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 0.032, lengthWorld * 0.42),
    goldPinMat
  );
  pciePins.position.set(0, -0.015, lengthWorld * 0.26);
  group.add(pciePins);

  // 5. Triple Axial Fans (Facing Outwards toward the glass pane, parallel to GPU!)
  const fanCount = mm > 260 ? 3 : 2;
  const fanSpanDist = (lengthWorld * 0.80) / fanCount;

  for (let i = 0; i < fanCount; i++) {
    const fanZ = (lengthWorld * 0.12) + (i * fanSpanDist) + (fanSpanDist / 2);
    const fanY = heightWorld * 0.5;
    const fanX = thickWorld * 0.5 + 0.008;

    // Glowing ARGB Halo Ring around each fan bay
    const argbMat = new THREE.MeshStandardMaterial({
      color: rgbColor,
      emissive: rgbColor,
      emissiveIntensity: 1.25
    });
    const fanRing = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.145, 24), argbMat);
    fanRing.rotation.y = Math.PI / 2;
    fanRing.position.set(fanX, fanY, fanZ);
    group.add(fanRing);

    // Rotating Fan Blades Unit (Spins around face normal X)
    const fanGroup = new THREE.Group();
    fanGroup.userData.spinAxis = 'x';
    fanGroup.position.set(fanX + 0.005, fanY, fanZ);

    // Metal Center Hub
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16),
      new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.9 })
    );
    hub.rotation.z = Math.PI / 2;
    fanGroup.add(hub);

    // Holographic Brand Hub Badge
    const hubBadgeTex = createFanHubBadgeTexture("RTX 4090");
    const hubBadge = new THREE.Mesh(
      new THREE.CircleGeometry(0.048, 16),
      new THREE.MeshBasicMaterial({ map: hubBadgeTex })
    );
    hubBadge.rotation.y = Math.PI / 2;
    hubBadge.position.x = 0.011;
    fanGroup.add(hubBadge);

    // 9 Curved Blades parallel to GPU card in Y-Z plane
    const bladeMat = new THREE.MeshStandardMaterial({ color: isWhite ? 0xFFFFFF : 0x181A1F, roughness: 0.3 });
    for (let b = 0; b < 9; b++) {
      const angle = (b / 9) * Math.PI * 2;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.095, 0.038), bladeMat);
      blade.position.set(0, Math.cos(angle) * 0.075, Math.sin(angle) * 0.075);
      blade.rotation.x = angle + 0.35;
      fanGroup.add(blade);
    }

    group.add(fanGroup);
    fanBladesList.push(fanGroup);
  }

  // 6. Glowing ARGB Brand Top Strip ("GEFORCE RTX")
  const argbMat = new THREE.MeshStandardMaterial({
    color: rgbColor,
    emissive: rgbColor,
    emissiveIntensity: 1.3
  });
  const argbStrip = new THREE.Mesh(
    new THREE.BoxGeometry(thickWorld * 0.75, 0.015, lengthWorld * 0.55),
    argbMat
  );
  argbStrip.position.set(0, heightWorld + 0.006, lengthWorld * 0.5);
  group.add(argbStrip);

  // 7. 12VHPWR Power Socket on Top Edge
  const pwrSocket = new THREE.Mesh(
    new THREE.BoxGeometry(thickWorld * 0.6, 0.025, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  pwrSocket.position.set(0, heightWorld + 0.012, lengthWorld * 0.76);
  group.add(pwrSocket);

  // 8. Braided Sleeved Power Cables with Combs (Curves down into chassis grommet)
  const cableMat = new THREE.MeshStandardMaterial({ color: isWhite ? 0xF8FAFC : 0x222222, roughness: 0.8 });
  const combMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

  for (let c = -2; c <= 2; c++) {
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, heightWorld + 0.02, (lengthWorld * 0.76) + (c * 0.016)),
      new THREE.Vector3(-0.06, heightWorld + 0.08, (lengthWorld * 0.76) + (c * 0.016)),
      new THREE.Vector3(-0.16, 0.15, (lengthWorld * 0.76) + (c * 0.016)),
      new THREE.Vector3(-0.25, 0.05, 0.55)
    );
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.008, 8, false), cableMat));
  }

  const comb = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.015, 0.08), combMat);
  comb.position.set(-0.08, heightWorld + 0.06, lengthWorld * 0.76);
  group.add(comb);

  // 9. Rear PCIe Metal Bracket (Mounts to chassis expansion slot covers at Z=0)
  const bracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.025, heightWorld * 1.15, 0.035),
    new THREE.MeshStandardMaterial({ color: 0xD8DEE9, metalness: 0.95, roughness: 0.1 })
  );
  bracket.position.set(0, heightWorld * 0.5, 0);
  group.add(bracket);

  // 10. Vertical PCIe Riser Bracket Base & Ribbon Cable
  const riserMat = new THREE.MeshStandardMaterial({ color: 0x181A1F, metalness: 0.7, roughness: 0.3 });
  const riserBase = new THREE.Mesh(new THREE.BoxGeometry(thickWorld * 1.2, 0.045, lengthWorld * 0.9), riserMat);
  riserBase.position.set(0, -0.02, lengthWorld * 0.5);
  group.add(riserBase);

  // PCIe Ribbon Cable running to motherboard PCIe slot
  const ribbonCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-0.04, -0.02, 0.25),
    new THREE.Vector3(-0.12, -0.02, 0.25),
    new THREE.Vector3(-0.18, 0.20, 0.15),
    new THREE.Vector3(-0.23, 0.33, 0.06)
  );
  const ribbonMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
  group.add(new THREE.Mesh(new THREE.TubeGeometry(ribbonCurve, 16, 0.016, 8, false), ribbonMat));

  return { mesh: group, fanBlades: fanBladesList, argbMaterial: argbMat };
}

export function buildCooler3D(cooler, rgbColor = 0x00F0FF) {
  const group = new THREE.Group();
  group.name = "cooler";

  const fanBladesList = [];
  const argbMaterials = [];

  if (cooler.type.includes("Liquid")) {
    const isWhite = cooler.name.toLowerCase().includes("white") || cooler.id.includes("arctic");

    // 1. Cylindrical LCD Pump Block
    const pumpMat = new THREE.MeshStandardMaterial({
      color: isWhite ? 0xF8FAFC : 0x1A1D23,
      metalness: 0.6,
      roughness: 0.2
    });
    const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 32), pumpMat);
    pump.rotation.z = Math.PI / 2;
    pump.position.set(-0.17, 0.58, -0.1);
    group.add(pump);

    // Copper Cold Plate Base
    const copperPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.015, 32),
      new THREE.MeshStandardMaterial({ color: 0xB87333, metalness: 0.95 })
    );
    copperPlate.rotation.z = Math.PI / 2;
    copperPlate.position.set(-0.22, 0.58, -0.1);
    group.add(copperPlate);

    // Glowing Circular Digital LCD Display with Live Readout & Watermark
    const rgbHex = typeof rgbColor === 'number' ? `#${rgbColor.toString(16).padStart(6, '0')}` : (rgbColor || '#00F0FF');
    const lcdTex = createAioLcdTexture(48, cooler.name || "LIAN LI", rgbHex);
    const lcdMat = new THREE.MeshBasicMaterial({
      map: lcdTex,
      toneMapped: false
    });
    const lcdScreen = new THREE.Mesh(
      new THREE.CircleGeometry(0.118, 32),
      lcdMat
    );
    lcdScreen.rotation.y = Math.PI / 2;
    lcdScreen.position.set(-0.116, 0.58, -0.1);
    group.add(lcdScreen);

    // Sleek Outer Beveled Knurled Aluminum Bezel Ring
    const bezelMat = new THREE.MeshStandardMaterial({
      color: isWhite ? 0xE2E8F0 : 0x2A2E39,
      metalness: 0.92,
      roughness: 0.18
    });
    const outerBezel = new THREE.Mesh(new THREE.RingGeometry(0.117, 0.138, 32), bezelMat);
    outerBezel.rotation.y = Math.PI / 2;
    outerBezel.position.set(-0.117, 0.58, -0.1);
    group.add(outerBezel);

    // Chrome 90-Degree Swivel Compression Fittings
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xEEEEEE, metalness: 0.95, roughness: 0.08 });
    for (let f = 0; f < 2; f++) {
      const fitting = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.04, 16), chromeMat);
      fitting.position.set(-0.15, 0.52 + (f * 0.12), -0.05);
      group.add(fitting);
    }

    // Braided Liquid Hoses (Routed smoothly to side radiator inlet/outlet)
    const tubeMat = new THREE.MeshStandardMaterial({ color: isWhite ? 0xF8FAFC : 0x181A1F, roughness: 0.55 });
    const curve1 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.15, 0.64, -0.05),
      new THREE.Vector3(-0.06, 0.96, 0.15),
      new THREE.Vector3(-0.12, 0.98, 0.45),
      new THREE.Vector3(-0.23, 0.88, 0.58)
    );
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve1, 32, 0.024, 12, false), tubeMat));

    const curve2 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.15, 0.52, -0.05),
      new THREE.Vector3(-0.10, 0.86, 0.12),
      new THREE.Vector3(-0.14, 0.90, 0.42),
      new THREE.Vector3(-0.23, 0.80, 0.58)
    );
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve2, 32, 0.024, 12, false), tubeMat));

    // 360mm Radiator Mounted to Lian Li O11 Vision Side Recessed Bracket
    const radMat = new THREE.MeshStandardMaterial({ 
      color: isWhite ? 0xF8FAFC : 0x14161A, 
      roughness: 0.35,
      metalness: 0.2
    });
    // Mount flat against side bracket at X = -0.25, Z = 0.65
    const rad = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.45, 0.38), radMat);
    rad.position.set(-0.25, 0.32, 0.65);
    group.add(rad);

    // 3x 120mm Radiator Fans Facing Inward to Main Chamber (Rotation Y = 90 deg)
    for (let i = -1; i <= 1; i++) {
      const fanUnit = createDetailedFan(rgbColor, isWhite);
      fanUnit.mesh.rotation.y = Math.PI / 2;
      fanUnit.mesh.position.set(-0.21, 0.32 + (i * 0.44), 0.65);
      group.add(fanUnit.mesh);
      fanBladesList.push(fanUnit.blades);
      if (fanUnit.rgbMat) argbMaterials.push(fanUnit.rgbMat);
    }

  } else {
    // Air Dual Tower Cooler (e.g. Noctua NH-D15 / Thermalright)
    const isNoctua = cooler.id.includes("noctua");
    const towerMat = new THREE.MeshStandardMaterial({
      color: isNoctua ? 0x1E2024 : 0xDEE4EC,
      metalness: 0.85,
      roughness: 0.15
    });

    // 2 Distinct Fin Stacks built with Individual Aluminum Fin Plates
    [-0.14, 0.09].forEach(offsetZ => {
      const finTower = new THREE.Group();
      finTower.position.set(-0.06, 0.58, -0.1 + offsetZ);

      for (let f = 0; f < 22; f++) {
        const finPlate = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.012, 0.17), towerMat);
        finPlate.position.y = (f * 0.025) - 0.28;
        finPlate.castShadow = true;
        finTower.add(finPlate);
      }
      group.add(finTower);
    });

    // 6 Copper Heatpipes Protruding on Top
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xB87333, metalness: 0.95 });
    for (let p = -2; p <= 2; p++) {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.05, 12), pipeMat);
      cap.position.set(-0.06, 0.88, -0.1 + (p * 0.065));
      group.add(cap);
    }

    // Center 140mm Spinning Fan
    const centerFan = createDetailedFan(rgbColor, false);
    centerFan.mesh.rotation.y = Math.PI / 2;
    centerFan.mesh.position.set(-0.06, 0.58, -0.125);
    group.add(centerFan.mesh);
    fanBladesList.push(centerFan.blades);
  }

  return { mesh: group, fanBlades: fanBladesList, argbMaterials };
}

function createDetailedFan(rgbColor, isWhite = false) {
  const unit = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({
    color: isWhite ? 0xFFFFFF : 0x181A1F,
    roughness: 0.35
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

  const rgbMat = new THREE.MeshStandardMaterial({
    color: rgbColor,
    emissive: rgbColor,
    emissiveIntensity: 1.15
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.16, 24), rgbMat);
  ring.position.z = 0.031;
  unit.add(ring);

  const bladeGroup = new THREE.Group();
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.03, 16),
    new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.65 })
  );
  hub.rotation.x = Math.PI / 2;
  bladeGroup.add(hub);

  const hubBadgeTex = createFanHubBadgeTexture(isWhite ? "LIAN LI" : "CORSAIR");
  const hubBadge = new THREE.Mesh(
    new THREE.CircleGeometry(0.052, 16),
    new THREE.MeshBasicMaterial({ map: hubBadgeTex })
  );
  hubBadge.position.z = 0.016;
  bladeGroup.add(hubBadge);

  const bladeMat = new THREE.MeshStandardMaterial({ color: isWhite ? 0xF8FAFC : 0x22262E, roughness: 0.3 });
  for (let b = 0; b < 9; b++) {
    const angle = (b / 9) * Math.PI * 2;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.012), bladeMat);
    blade.position.set(Math.cos(angle) * 0.09, Math.sin(angle) * 0.09, 0);
    blade.rotation.z = angle + 0.45;
    bladeGroup.add(blade);
  }

  bladeGroup.position.z = 0.01;
  unit.add(bladeGroup);

  return { mesh: unit, blades: bladeGroup, rgbMat };
}
