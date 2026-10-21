const fs = require("fs");
const path = require("path");

const dir = path.join(process.cwd(), "public", "samples");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Minimal valid MP3 silent frame sync pattern (MPEG-1 Layer 3, 128kbps, 44.1kHz, stereo)
// Header: 0xFF, 0xFB, 0x90, 0x04
const frame = Buffer.alloc(417, 0);
frame[0] = 0xff;
frame[1] = 0xfb;
frame[2] = 0x90;
frame[3] = 0x04;

const buffer = Buffer.concat(Array(100).fill(frame));
fs.writeFileSync(path.join(dir, "sample.mp3"), buffer);
console.log("Created public/samples/sample.mp3 successfully, bytes:", buffer.length);
