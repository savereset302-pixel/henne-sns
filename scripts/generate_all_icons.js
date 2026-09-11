const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const workspaceDir = path.resolve(__dirname, "..");
const publicIconsDir = path.join(workspaceDir, "public/icons");
const srcAppDir = path.join(workspaceDir, "src/app");
const publicDir = path.join(workspaceDir, "public");

if (!fs.existsSync(publicIconsDir)) {
    fs.mkdirSync(publicIconsDir, { recursive: true });
}

function createShizunariSvg(size = 512) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient: Deep silent indigo/navy -->
    <radialGradient id="bg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#0c2340"/>
      <stop offset="50%" stop-color="#061325"/>
      <stop offset="100%" stop-color="#020611"/>
    </radialGradient>

    <!-- Water Drop Gradient: Luminous cyan to ocean blue -->
    <linearGradient id="dropGrad" x1="256" y1="90" x2="256" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#a5f3fc"/>
      <stop offset="30%" stop-color="#38bdf8"/>
      <stop offset="75%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <!-- Ripple Wave Gradient -->
    <linearGradient id="waveGrad" x1="60" y1="256" x2="452" y2="256" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>

    <!-- Subtle Drop Glow -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#38bdf8" flood-opacity="0.5"/>
    </filter>

    <!-- Outer Border Glow -->
    <linearGradient id="borderGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="rgba(56, 189, 248, 0.45)"/>
      <stop offset="50%" stop-color="rgba(14, 165, 233, 0.15)"/>
      <stop offset="100%" stop-color="rgba(6, 182, 212, 0.35)"/>
    </linearGradient>
  </defs>

  <!-- Squircle App Background -->
  <rect width="512" height="512" rx="116" fill="url(#bg)"/>
  <rect width="510" height="510" x="1" y="1" rx="115" fill="none" stroke="url(#borderGrad)" stroke-width="2.5"/>

  <!-- Background Ambient Glow behind drop -->
  <circle cx="256" cy="270" r="140" fill="#0ea5e9" opacity="0.15" filter="url(#glow)"/>

  <!-- Concentric Acoustic Wave / Ripple Arcs -->
  <!-- Outer arcs -->
  <path d="M 80 200 C 60 236 50 274 50 300 C 50 336 64 372 90 400"
        fill="none" stroke="url(#waveGrad)" stroke-width="22" stroke-linecap="round" opacity="0.45"/>
  <path d="M 432 200 C 452 236 462 274 462 300 C 462 336 448 372 422 400"
        fill="none" stroke="url(#waveGrad)" stroke-width="22" stroke-linecap="round" opacity="0.45"/>

  <!-- Middle arcs -->
  <path d="M 120 230 C 105 255 98 280 98 300 C 98 326 108 352 128 372"
        fill="none" stroke="url(#waveGrad)" stroke-width="24" stroke-linecap="round" opacity="0.8"/>
  <path d="M 392 230 C 407 255 414 280 414 300 C 414 326 404 352 384 372"
        fill="none" stroke="url(#waveGrad)" stroke-width="24" stroke-linecap="round" opacity="0.8"/>

  <!-- Water Surface Ripple Base (水琴窟の波紋) -->
  <ellipse cx="256" cy="410" rx="116" ry="34"
           fill="none" stroke="#38bdf8" stroke-width="20" stroke-opacity="0.45" stroke-dasharray="36 24"/>

  <!-- Main Water Drop Symbol -->
  <g filter="url(#glow)">
    <path d="M 256 96 C 256 96 146 226 146 312 C 146 374 195 422 256 422 C 317 422 366 374 366 312 C 366 226 256 96 256 96 Z"
          fill="url(#dropGrad)"/>

    <!-- Specular Highlight (水滴の反射光) -->
    <ellipse cx="214" cy="265" rx="30" ry="48" transform="rotate(-25 214 265)"
             fill="#ffffff" fill-opacity="0.85"/>
    <circle cx="270" cy="360" r="14" fill="#ffffff" fill-opacity="0.4"/>
  </g>
</svg>`;
}

function buildIcoBuffer(png16Buf, png32Buf, png48Buf) {
    const images = [
        { width: 16, height: 16, buf: png16Buf },
        { width: 32, height: 32, buf: png32Buf },
        { width: 48, height: 48, buf: png48Buf },
    ];
    const headerLen = 6;
    const dirEntryLen = 16;
    const totalHeaderLen = headerLen + dirEntryLen * images.length;

    let offset = totalHeaderLen;
    const entries = [];

    for (const img of images) {
        entries.push({
            width: img.width >= 256 ? 0 : img.width,
            height: img.height >= 256 ? 0 : img.height,
            colorCount: 0,
            reserved: 0,
            planes: 1,
            bitCount: 32,
            size: img.buf.length,
            offset: offset,
            buf: img.buf,
        });
        offset += img.buf.length;
    }

    const outBuf = Buffer.alloc(offset);
    // Header
    outBuf.writeUInt16LE(0, 0); // reserved
    outBuf.writeUInt16LE(1, 2); // icon type
    outBuf.writeUInt16LE(images.length, 4); // image count

    // Directory entries
    let currentDirOffset = 6;
    for (const entry of entries) {
        outBuf.writeUInt8(entry.width, currentDirOffset + 0);
        outBuf.writeUInt8(entry.height, currentDirOffset + 1);
        outBuf.writeUInt8(entry.colorCount, currentDirOffset + 2);
        outBuf.writeUInt8(entry.reserved, currentDirOffset + 3);
        outBuf.writeUInt16LE(entry.planes, currentDirOffset + 4);
        outBuf.writeUInt16LE(entry.bitCount, currentDirOffset + 6);
        outBuf.writeUInt32LE(entry.size, currentDirOffset + 8);
        outBuf.writeUInt32LE(entry.offset, currentDirOffset + 12);
        entry.buf.copy(outBuf, entry.offset);
        currentDirOffset += 16;
    }

    return outBuf;
}

async function main() {
    const svgContent = createShizunariSvg(512);
    const svgBuf = Buffer.from(svgContent);

    // 1. Write SVGs
    fs.writeFileSync(path.join(publicIconsDir, "icon.svg"), svgContent);
    fs.writeFileSync(path.join(srcAppDir, "icon.svg"), svgContent);
    console.log("✓ Saved SVG icons (public/icons/icon.svg, src/app/icon.svg)");

    // 2. High-res PWA PNGs
    await sharp(svgBuf).resize(512, 512).png().toFile(path.join(publicIconsDir, "icon-512.png"));
    await sharp(svgBuf).resize(192, 192).png().toFile(path.join(publicIconsDir, "icon-192.png"));
    console.log("✓ Generated PWA PNG icons (icon-512.png, icon-192.png)");

    // 3. Apple Touch Icon (180x180)
    const appleIconBuf = await sharp(svgBuf).resize(180, 180).png().toBuffer();
    fs.writeFileSync(path.join(publicIconsDir, "apple-touch-icon.png"), appleIconBuf);
    fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), appleIconBuf);
    fs.writeFileSync(path.join(srcAppDir, "apple-icon.png"), appleIconBuf);
    console.log("✓ Generated Apple Touch Icons (180x180)");

    // 4. Multi-resolution ICO (16x16, 32x32, 48x48)
    const png16Buf = await sharp(svgBuf).resize(16, 16).png().toBuffer();
    const png32Buf = await sharp(svgBuf).resize(32, 32).png().toBuffer();
    const png48Buf = await sharp(svgBuf).resize(48, 48).png().toBuffer();
    const icoBuf = buildIcoBuffer(png16Buf, png32Buf, png48Buf);

    fs.writeFileSync(path.join(srcAppDir, "favicon.ico"), icoBuf);
    fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuf);
    console.log("✓ Generated multi-res favicon.ico (src/app/favicon.ico, public/favicon.ico)");

    console.log("\nAll Shizunari icons successfully created!");
}

main().catch(err => {
    console.error("Error generating icons:", err);
    process.exit(1);
});
