/* Studio Background Gradient & Environment Generator */

export function createMetallicStudioBackground(isDark = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  // Radial Metallic Satin Sheen Gradient
  const grad = ctx.createRadialGradient(512, 380, 40, 512, 512, 650);

  if (isDark) {
    // Deep Metallic Gunmetal / Carbon Studio
    grad.addColorStop(0, "#232834");
    grad.addColorStop(0.35, "#141720");
    grad.addColorStop(0.75, "#0A0B0F");
    grad.addColorStop(1, "#050608");
  } else {
    // Brushed Titanium / Satin Silver Studio
    grad.addColorStop(0, "#FFFFFF");
    grad.addColorStop(0.35, "#E9EEF5");
    grad.addColorStop(0.7, "#D1DCE8");
    grad.addColorStop(1, "#9AA9BC");
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle Metallic Grain Lines
  ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.015)" : "rgba(0, 0, 0, 0.015)";
  ctx.lineWidth = 1;
  for (let y = 0; y < 1024; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createStudioEnvironment(renderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, "#D9E2EC");
  bgGrad.addColorStop(0.5, "#F0F4F8");
  bgGrad.addColorStop(1, "#BCCCDC");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Softbox 1: Overhead Diffused Key
  const overhead = ctx.createRadialGradient(512, 100, 10, 512, 100, 220);
  overhead.addColorStop(0, "#FFFFFF");
  overhead.addColorStop(0.5, "rgba(255, 255, 255, 0.85)");
  overhead.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = overhead;
  ctx.beginPath();
  ctx.arc(512, 100, 220, 0, Math.PI * 2);
  ctx.fill();

  // Softbox 2: Left Rim
  const leftRim = ctx.createRadialGradient(150, 250, 10, 150, 250, 180);
  leftRim.addColorStop(0, "#FFFFFF");
  leftRim.addColorStop(0.7, "rgba(255, 255, 255, 0.7)");
  leftRim.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = leftRim;
  ctx.beginPath();
  ctx.arc(150, 250, 180, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;

  const envMap = pmremGenerator.fromEquirectangular(texture).texture;
  pmremGenerator.dispose();
  texture.dispose();

  return envMap;
}
