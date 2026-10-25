/* Physical Clearance & Airflow Diagnostics Engine */

export function runDiagnostics(build, fanConfig) {
  const issues = [];
  const clearances = {};
  const fieldNotes = [];

  const { chassis, mobo, cpu, cooler, gpu, ram, psu } = build;

  // 1. Motherboard Form Factor in Chassis
  if (chassis && mobo) {
    const isMoboFit = chassis.formFactors.includes(mobo.formFactor);
    if (!isMoboFit) {
      issues.push({
        type: "error",
        title: "Motherboard Form Factor Conflict",
        desc: `Chassis "${chassis.name}" does not support ${mobo.formFactor} motherboards.`
      });
    }
  }

  // 2. CPU Socket vs Motherboard Socket
  if (cpu && mobo) {
    if (cpu.socket !== mobo.socket) {
      issues.push({
        type: "error",
        title: "Socket Incompatibility",
        desc: `CPU (${cpu.name}, socket ${cpu.socket}) physically cannot fit Motherboard socket ${mobo.socket}.`
      });
    }
  }

  // 3. CPU Cooler Clearance & Radiator Mounts
  let frontRadInstalled = false;
  let radThicknessTotal = 0;

  if (chassis && cooler) {
    if (cooler.type.includes("Liquid")) {
      // Check radiator support
      const canFitTop = chassis.topRadSupport >= cooler.radiatorSize;
      const canFitFront = chassis.frontRadSupport >= cooler.radiatorSize;

      if (!canFitTop && !canFitFront) {
        issues.push({
          type: "error",
          title: "Radiator Size Exceeded",
          desc: `Chassis cannot mount a ${cooler.radiatorSize}mm liquid radiator.`
        });
      } else if (!canFitTop && canFitFront) {
        // Must be front mounted
        frontRadInstalled = true;
        radThicknessTotal = (cooler.radiatorThickness || 27) + (cooler.fanThickness || 25);
        issues.push({
          type: "info",
          title: "Front Radiator Mount Forced",
          desc: `Top mount does not support ${cooler.radiatorSize}mm. Radiator must be mounted in Front, reducing GPU clearance.`
        });
      }
    } else {
      // Air cooler height
      const heightDelta = chassis.maxCoolerHeight - cooler.height;
      clearances.coolerHeight = {
        max: chassis.maxCoolerHeight,
        actual: cooler.height,
        remaining: heightDelta,
        status: heightDelta >= 0 ? "ok" : "clash"
      };

      if (heightDelta < 0) {
        issues.push({
          type: "error",
          title: "Air Cooler Height Collision",
          desc: `Cooler height (${cooler.height}mm) exceeds Chassis glass clearance (${chassis.maxCoolerHeight}mm) by ${Math.abs(heightDelta)}mm!`
        });
      }
    }
  }

  // 4. GPU Clearance (accounting for front radiator)
  if (chassis && gpu) {
    const availableGpuClearance = frontRadInstalled 
      ? chassis.maxGpuLength - radThicknessTotal 
      : chassis.maxGpuLength;

    const gpuDelta = availableGpuClearance - gpu.length;
    clearances.gpuLength = {
      max: availableGpuClearance,
      actual: gpu.length,
      remaining: gpuDelta,
      status: gpuDelta >= 0 ? "ok" : "clash"
    };

    if (gpuDelta < 0) {
      issues.push({
        type: "error",
        title: "GPU Physical Clearance Clash",
        desc: `GPU length (${gpu.length}mm) exceeds available clearance (${availableGpuClearance}mm${frontRadInstalled ? ' with front rad' : ''}) by ${Math.abs(gpuDelta)}mm!`
      });
    } else if (gpuDelta <= 15) {
      issues.push({
        type: "warning",
        title: "Extremely Tight GPU Fit",
        desc: `Only ${gpuDelta}mm clearance remaining between GPU and front frame. Cable insertion and radiator airflow will be cramped.`
      });
    }

    if (gpu.length > 320) {
      issues.push({
        type: "tip",
        title: "GPU Sag Warning",
        desc: `This ${gpu.length}mm graphics card weighs ~1.8kg. An anti-sag support pillar is mandatory to avoid cracking PCIe solder joints.`
      });
    }
  }

  // 5. RAM vs Air Cooler Clearance
  if (cooler && ram && cooler.type.includes("Air")) {
    if (cooler.ramClearance && ram.height > cooler.ramClearance) {
      const overhangDelta = ram.height - cooler.ramClearance;
      issues.push({
        type: "warning",
        title: "RAM Heatspreader Overhang",
        desc: `RAM height (${ram.height}mm) exceeds cooler lower fin clearance (${cooler.ramClearance}mm). The front fan must be clipped ${overhangDelta}mm higher on the fin stack.`
      });
    }
  }

  // 6. Power Budget & PSU Sizing
  if (cpu && gpu && psu) {
    const baseSystemWatts = 75; // Mobo, SSD, Fans, RGB
    const estimatedTotalDraw = cpu.tdp + gpu.powerWatts + baseSystemWatts;
    const recommendedMinPsu = Math.round(estimatedTotalDraw * 1.30); // 30% headroom for transient micro-spikes

    clearances.power = {
      draw: estimatedTotalDraw,
      recommended: recommendedMinPsu,
      psuWattage: psu.wattage,
      status: psu.wattage >= recommendedMinPsu ? "ok" : (psu.wattage >= estimatedTotalDraw ? "warning" : "clash")
    };

    if (psu.wattage < estimatedTotalDraw) {
      issues.push({
        type: "error",
        title: "Critical Under-Wattage",
        desc: `Estimated power draw (${estimatedTotalDraw}W) exceeds PSU rating (${psu.wattage}W). System will trip Over-Current Protection (OCP) under load.`
      });
    } else if (psu.wattage < recommendedMinPsu) {
      issues.push({
        type: "warning",
        title: "Limited Power Headroom",
        desc: `PSU (${psu.wattage}W) handles steady load (${estimatedTotalDraw}W), but high-end GPUs can trip transient spikes up to 1.5x TDP. Recommend ${recommendedMinPsu}W.`
      });
    }
  }

  // Aggregate Field Notes from all selected components
  Object.values(build).forEach(comp => {
    if (comp && comp.engineerNote) {
      fieldNotes.push({
        component: comp.name,
        note: comp.engineerNote
      });
    }
  });

  // 7. Airflow Pressure Calculation
  const airflow = evaluateAirflow(chassis, fanConfig);

  return {
    issues,
    clearances,
    fieldNotes,
    airflow
  };
}

export function evaluateAirflow(chassis, fanConfig = {}) {
  // Standard 120mm fan pushes ~55 CFM at balanced 1200 RPM
  const CFM_PER_FAN = 55;

  let intakeFans = 0;
  let exhaustFans = 0;

  // fanConfig maps zone -> { count: number, dir: "intake" | "exhaust" }
  const zones = ["front", "top", "rear", "bottom"];

  zones.forEach(zone => {
    const cfg = fanConfig[zone];
    if (cfg && cfg.count > 0) {
      if (cfg.dir === "intake") {
        intakeFans += cfg.count;
      } else {
        exhaustFans += cfg.count;
      }
    }
  });

  const intakeCFM = intakeFans * CFM_PER_FAN;
  const exhaustCFM = exhaustFans * CFM_PER_FAN;
  const delta = intakeCFM - exhaustCFM;

  let pressureType = "Neutral";
  let statusColor = "#10B981"; // emerald
  let diagnosis = "";
  let advice = "";

  if (delta > 20) {
    pressureType = "Positive Pressure";
    statusColor = "#0051FF"; // Electric Cobalt
    diagnosis = `Intake (${intakeCFM} CFM) > Exhaust (${exhaustCFM} CFM).`;
    advice = "Superior dust resistance. Air exits outward through case cracks, keeping dust out of non-filtered openings. Ideal for longevity.";
  } else if (delta < -20) {
    pressureType = "Negative Pressure";
    statusColor = "#FF5500"; // Racing Papaya
    diagnosis = `Exhaust (${exhaustCFM} CFM) > Intake (${intakeCFM} CFM).`;
    advice = "Aggressive hot-air evacuation. GPU heat leaves rapidly, but unfiltered dust will be pulled in through rear expansion slot gaps.";
  } else {
    pressureType = "Balanced Pressure";
    statusColor = "#059669";
    diagnosis = `Intake (${intakeCFM} CFM) ≈ Exhaust (${exhaustCFM} CFM).`;
    advice = "Laminar acoustic and thermal balance. Maximum airflow velocity across CPU and GPU heat sinks.";
  }

  return {
    intakeFans,
    exhaustFans,
    intakeCFM,
    exhaustCFM,
    pressureType,
    statusColor,
    diagnosis,
    advice
  };
}
