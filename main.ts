// news-image-20261122 — "The World in One Day"
// Draws a newspaper front page summing up Sunday 22 November 2026.
// Node 22, stdlib only. Writes entry.png (1024x1024) to $MAKEFUN_OUTPUT_DIR
// and (best effort, guarded) a copy next to this file for the entry dir.
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const W = 1024;
const H = 1024;

// ---------- palette ----------
type RGB = [number, number, number];
const PAPER: RGB = [245, 240, 230];
const INK: RGB = [26, 26, 26];
const RED: RGB = [179, 39, 30];
const BLUE: RGB = [31, 78, 121];
const SEA: RGB = [46, 110, 150];
const GREEN: RGB = [46, 107, 52];
const ORANGE: RGB = [198, 93, 33];
const GOLD: RGB = [201, 162, 39];
const GREY: RGB = [120, 120, 115];
const LIGHT: RGB = [232, 226, 214];

// ---------- 5x7 bitmap font ("#" = on, "." = off) ----------
const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
  '"': ["01010", "01010", "00000", "00000", "00000", "00000", "00000"],
  ":": ["00000", "01100", "00000", "01100", "00000", "01100", "00000"],
  ";": ["00000", "01100", "00000", "01100", "00100", "01000", "00000"],
  "\u2022": ["00000", "00000", "01100", "01100", "01100", "00000", "00000"],
  "\u00d7": ["00000", "10001", "01010", "00100", "01010", "10001", "00000"],
};

function glyph(ch: string): string[] {
  return FONT[ch] ?? FONT["?"];
}

// ---------- canvas ----------
class Canvas {
  w: number;
  h: number;
  buf: Uint8Array;
  constructor(w: number, h: number, bg: RGB) {
    this.w = w;
    this.h = h;
    this.buf = new Uint8Array(w * h * 3);
    this.fillRect(0, 0, w, h, bg);
  }
  px(x: number, y: number, c: RGB): void {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= this.w || yi >= this.h) return;
    const i = (yi * this.w + xi) * 3;
    this.buf[i] = c[0];
    this.buf[i + 1] = c[1];
    this.buf[i + 2] = c[2];
  }
  fillRect(x: number, y: number, w: number, h: number, c: RGB): void {
    for (let yy = Math.round(y); yy < Math.round(y + h); yy++) {
      for (let xx = Math.round(x); xx < Math.round(x + w); xx++) this.px(xx, yy, c);
    }
  }
  rect(x: number, y: number, w: number, h: number, c: RGB, t = 2): void {
    this.fillRect(x, y, w, t, c);
    this.fillRect(x, y + h - t, w, t, c);
    this.fillRect(x, y, t, h, c);
    this.fillRect(x + w - t, y, t, h, c);
  }
  hline(x: number, y: number, w: number, c: RGB, t = 2): void {
    this.fillRect(x, y, w, t, c);
  }
  line(x0: number, y0: number, x1: number, y1: number, c: RGB, t = 1): void {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(x0 + (dx * i) / steps);
      const y = Math.round(y0 + (dy * i) / steps);
      if (t <= 1) this.px(x, y, c);
      else this.fillRect(x - Math.floor(t / 2), y - Math.floor(t / 2), t, t, c);
    }
  }
  disc(cx: number, cy: number, r: number, c: RGB): void {
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y <= r * r) this.px(cx + x, cy + y, c);
      }
    }
  }
  circle(cx: number, cy: number, r: number, c: RGB, t = 2): void {
    for (let a = 0; a < 360; a += 1) {
      const rad = (a * Math.PI) / 180;
      for (let k = 0; k < t; k++) {
        this.px(cx + Math.round((r - k) * Math.cos(rad)), cy + Math.round((r - k) * Math.sin(rad)), c);
      }
    }
  }
  // filled triangle
  tri(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, c: RGB): void {
    const minX = Math.floor(Math.min(x0, x1, x2));
    const maxX = Math.ceil(Math.max(x0, x1, x2));
    const minY = Math.floor(Math.min(y0, y1, y2));
    const maxY = Math.ceil(Math.max(y0, y1, y2));
    const d = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const a = ((x1 - x) * (y2 - y) - (y1 - y) * (x2 - x)) / d;
        const b = ((x2 - x) * (y0 - y) - (y2 - y) * (x0 - x)) / d;
        const g = 1 - a - b;
        if (a >= 0 && b >= 0 && g >= 0) this.px(x, y, c);
      }
    }
  }
  textWidth(s: string, scale: number): number {
    let w = 0;
    for (const ch of s) w += 5 * scale + scale;
    return w - scale;
  }
  text(s: string, x: number, y: number, scale: number, c: RGB): void {
    let cx = x;
    for (const ch of s.toUpperCase()) {
      const g = glyph(ch);
      for (let r = 0; r < 7; r++) {
        for (let col = 0; col < 5; col++) {
          if (g[r][col] === "1") this.fillRect(cx + col * scale, y + r * scale, scale, scale, c);
        }
      }
      cx += 6 * scale;
    }
  }
  centerText(s: string, cx: number, y: number, scale: number, c: RGB): void {
    this.text(s, cx - this.textWidth(s, scale) / 2, y, scale, c);
  }
  wrap(s: string, maxW: number, scale: number): string[] {
    const words = s.split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const trial = cur ? cur + " " + w : w;
      if (this.textWidth(trial, scale) <= maxW || !cur) cur = trial;
      else {
        lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }
  para(s: string, x: number, y: number, maxW: number, scale: number, c: RGB, lh: number): number {
    const lines = this.wrap(s, maxW, scale);
    let yy = y;
    for (const ln of lines) {
      this.text(ln, x, yy, scale, c);
      yy += lh;
    }
    return yy;
  }
}

// ---------- PNG encoder (stdlib zlib + hand-rolled CRC32) ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])), 8 + data.length);
  return out;
}
function encodePNG(cv: Canvas): Buffer {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(cv.w, 0);
  ihdr.writeUInt32BE(cv.h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc((cv.w * 3 + 1) * cv.h);
  for (let y = 0; y < cv.h; y++) {
    raw[y * (cv.w * 3 + 1)] = 0; // filter: none
    Buffer.from(cv.buf.buffer, cv.buf.byteOffset + y * cv.w * 3, cv.w * 3).copy(
      raw,
      y * (cv.w * 3 + 1) + 1,
    );
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------- scene ----------
function drawGlobe(cv: Canvas, cx: number, cy: number, r: number): void {
  // ocean
  cv.disc(cx, cy, r, [168, 205, 225]);
  // land masses (stylised continents, clipped by re-drawing ocean circle edge)
  cv.disc(cx - r * 0.35, cy - r * 0.25, r * 0.32, GREEN);
  cv.disc(cx + r * 0.3, cy + r * 0.3, r * 0.28, GREEN);
  cv.disc(cx + r * 0.45, cy - r * 0.35, r * 0.18, GREEN);
  // latitude / longitude lines
  cv.circle(cx, cy, r, INK, 3);
  for (const f of [-0.55, 0, 0.55]) {
    const yy = cy + f * r;
    const half = Math.sqrt(Math.max(0, r * r - (f * r) * (f * r)));
    cv.hline(cx - half, yy, half * 2, INK, 1);
  }
  cv.line(cx, cy - r, cx, cy + r, INK, 1);
  // jagged crack down the middle (the deadlock)
  const crack: [number, number][] = [
    [cx - 6, cy - r + 8],
    [cx + 10, cy - r * 0.55],
    [cx - 8, cy - r * 0.2],
    [cx + 12, cy + r * 0.15],
    [cx - 6, cy + r * 0.5],
    [cx + 8, cy + r - 10],
  ];
  for (let i = 0; i < crack.length - 1; i++) {
    cv.line(crack[i][0], crack[i][1], crack[i + 1][0], crack[i + 1][1], RED, 3);
  }
  // smoke plume, right side
  cv.disc(cx + r * 0.72, cy - r * 0.5, 10, GREY);
  cv.disc(cx + r * 0.8, cy - r * 0.68, 13, GREY);
  cv.disc(cx + r * 0.86, cy - r * 0.88, 9, GREY);
  // small factory on the globe edge
  cv.fillRect(cx + r * 0.45, cy + r * 0.55, 26, 18, INK);
  cv.fillRect(cx + r * 0.45 + 6, cy + r * 0.55 - 14, 5, 14, INK);
  cv.fillRect(cx + r * 0.45 + 16, cy + r * 0.55 - 10, 5, 10, INK);
}

function drawTanker(cv: Canvas, x: number, y: number, s: number, c: RGB): void {
  // hull
  cv.fillRect(x, y, 150 * s, 22 * s, c);
  cv.tri(x, y, x - 18 * s, y + 22 * s, x, y + 22 * s, c);
  // deck + bridge + funnel
  cv.fillRect(x + 18 * s, y - 16 * s, 34 * s, 16 * s, c);
  cv.fillRect(x + 96 * s, y - 26 * s, 12 * s, 26 * s, c);
  cv.fillRect(x + 112 * s, y - 20 * s, 20 * s, 20 * s, RED);
  // smoke
  cv.disc(x + 122 * s, y - 34 * s, 7 * s, GREY);
  cv.disc(x + 130 * s, y - 46 * s, 9 * s, GREY);
}

function drawDrone(cv: Canvas, x: number, y: number, s: number): void {
  cv.fillRect(x - 8 * s, y - 2 * s, 16 * s, 4 * s, INK);
  cv.fillRect(x - 2 * s, y - 8 * s, 4 * s, 16 * s, INK);
  cv.disc(x - 10 * s, y - 8 * s, 3 * s, INK);
  cv.disc(x + 10 * s, y - 8 * s, 3 * s, INK);
  cv.disc(x - 10 * s, y + 8 * s, 3 * s, INK);
  cv.disc(x + 10 * s, y + 8 * s, 3 * s, INK);
}

function drawShip(cv: Canvas, x: number, y: number, s: number): void {
  cv.fillRect(x, y, 170 * s, 20 * s, INK);
  cv.tri(x + 170 * s, y, x + 190 * s, y + 20 * s, x + 170 * s, y + 20 * s, INK);
  cv.fillRect(x + 30 * s, y - 30 * s, 90 * s, 30 * s, [90, 90, 88]);
  cv.fillRect(x + 40 * s, y - 42 * s, 60 * s, 12 * s, [90, 90, 88]);
  cv.fillRect(x + 140 * s, y - 24 * s, 10 * s, 24 * s, RED);
}

function drawScene(): Canvas {
  const cv = new Canvas(W, H, PAPER);
  const M = 40; // margin
  const CW = W - 2 * M; // 944

  // ---- masthead ----
  cv.centerText("THE WORLD IN ONE DAY", W / 2, 26, 6, INK);
  cv.hline(M, 82, CW, INK, 3);
  cv.centerText("SUNDAY, 22 NOVEMBER 2026", W / 2, 92, 3, RED);
  cv.hline(M, 122, CW, INK, 2);

  // ---- lead panel: COP31 ----
  const leadY = 136;
  const leadH = 372;
  cv.rect(M, leadY, CW, leadH, INK, 2);
  cv.centerText("CLIMATE TALKS DEADLOCK", W / 2, leadY + 16, 6, INK);
  cv.centerText("OVER FOSSIL FUELS", W / 2, leadY + 64, 6, RED);
  cv.hline(M + 24, leadY + 118, CW - 48, INK, 1);
  // globe, left
  drawGlobe(cv, M + 190, leadY + 245, 105);
  cv.centerText("COP31 - ANTALYA", M + 190, leadY + 330, 2, INK);
  // subhead, right
  const tx = M + 400;
  const tw = W - M - 24 - tx;
  let yy = cv.para(
    "COP31 IN ANTALYA ENDS IN DEADLOCK AS NATIONS SPLIT OVER FOSSIL FUELS.",
    tx,
    leadY + 140,
    tw,
    2,
    INK,
    22,
  );
  yy += 8;
  yy = cv.para(
    "NEGOTIATORS LEAVE THE SUMMIT WITH NO AGREEMENT ON PHASING OUT OIL AND GAS.",
    tx,
    yy,
    tw,
    2,
    INK,
    22,
  );
  yy += 8;
  cv.para("THE FIGHT OVER FOSSIL FUELS STALLS THE CLIMATE TALKS.", tx, yy, tw, 2, RED, 22);

  // ---- row 2: Gulf + Baltic ----
  const row2Y = 528;
  const row2H = 232;
  const pw = (CW - 20) / 2; // 462
  // Gulf panel
  cv.rect(M, row2Y, pw, row2H, INK, 2);
  cv.centerText("TANKERS HIT OFF OMAN", M + pw / 2, row2Y + 14, 3, INK);
  // sea + tankers
  cv.fillRect(M + 14, row2Y + 56, pw - 28, 84, SEA);
  cv.fillRect(M + 14, row2Y + 56, pw - 28, 10, [120, 175, 205]);
  drawTanker(cv, M + 40, row2Y + 96, 0.9, INK);
  drawTanker(cv, M + 250, row2Y + 108, 0.7, [60, 60, 60]);
  cv.disc(M + 200, row2Y + 66, 5, GOLD);
  cv.para(
    "TWO TANKERS HIT OFF THE COAST OF OMAN AS GULF TENSIONS RISE.",
    M + 16,
    row2Y + 152,
    pw - 32,
    2,
    INK,
    20,
  );
  cv.text("STRAIT OF HORMUZ", M + 16, row2Y + 196, 2, RED);
  // Baltic panel
  const bx = M + pw + 20;
  cv.rect(bx, row2Y, pw, row2H, INK, 2);
  cv.centerText("DRONES HIT SHIP", bx + pw / 2, row2Y + 14, 3, INK);
  cv.centerText("IN THE BALTIC", bx + pw / 2, row2Y + 38, 3, INK);
  cv.fillRect(bx + 14, row2Y + 76, pw - 28, 64, [110, 140, 165]);
  cv.fillRect(bx + 14, row2Y + 76, pw - 28, 8, [160, 190, 210]);
  drawShip(cv, bx + 60, row2Y + 104, 0.9);
  drawDrone(cv, bx + 330, row2Y + 92, 1);
  drawDrone(cv, bx + 380, row2Y + 112, 0.8);
  cv.para(
    "FINLAND TIGHTENS SECURITY AFTER A RUSSIAN CARGO SHIP IS HIT IN THE GULF OF FINLAND.",
    bx + 16,
    row2Y + 152,
    pw - 32,
    2,
    INK,
    20,
  );

  // ---- row 3: sport + quake ----
  const row3Y = 780;
  const row3H = 150;
  // Cricket panel
  cv.rect(M, row3Y, pw, row3H, INK, 2);
  cv.centerText("INDIA V NEW ZEALAND", M + pw / 2, row3Y + 12, 3, INK);
  cv.fillRect(M + 14, row3Y + 48, 120, 60, GREEN);
  cv.fillRect(M + 14, row3Y + 48, 120, 60, GREEN);
  cv.fillRect(M + 20, row3Y + 74, 108, 8, [210, 190, 140]); // pitch
  cv.fillRect(M + 24, row3Y + 58, 3, 14, [240, 240, 230]); // stumps
  cv.fillRect(M + 29, row3Y + 58, 3, 14, [240, 240, 230]);
  cv.fillRect(M + 34, row3Y + 58, 3, 14, [240, 240, 230]);
  cv.disc(M + 116, row3Y + 62, 6, RED); // ball
  cv.para(
    "RAHUL LEADS INDIA'S REPLY IN THE WELLINGTON TEST.",
    M + 150,
    row3Y + 52,
    pw - 166,
    2,
    INK,
    20,
  );
  cv.text("1ST TEST, WELLINGTON", M + 150, row3Y + 112, 2, RED);
  // Quake panel
  const qx = M + pw + 20;
  cv.rect(qx, row3Y, pw, row3H, INK, 2);
  cv.centerText("QUAKE SHAKES PERU", qx + pw / 2, row3Y + 12, 3, INK);
  cv.tri(qx + 20, row3Y + 108, qx + 70, row3Y + 52, qx + 120, row3Y + 108, [110, 95, 80]);
  cv.tri(qx + 90, row3Y + 108, qx + 150, row3Y + 60, qx + 210, row3Y + 108, [140, 125, 105]);
  cv.line(qx + 70, row3Y + 52, qx + 78, row3Y + 70, RED, 2);
  cv.line(qx + 78, row3Y + 70, qx + 66, row3Y + 86, RED, 2);
  cv.line(qx + 150, row3Y + 60, qx + 158, row3Y + 78, RED, 2);
  cv.para(
    "STRONG TREMOR IN THE ANDES - NO CASUALTIES REPORTED.",
    qx + 230,
    row3Y + 52,
    pw - 246,
    2,
    INK,
    20,
  );
  cv.text("ANDES, PERU", qx + 20, row3Y + 122, 2, RED);

  // ---- ticker ----
  const tickY = 950;
  cv.fillRect(0, tickY, W, 52, INK);
  cv.text(
    "EU AND INDONESIA SIGN TRADE DEAL  \u2022  ESTONIA TO CLOSE RUSSIA BORDER",
    M,
    tickY + 8,
    2,
    PAPER,
  );
  cv.text(
    "ANTHROPIC SHARES SLIDE AFTER IPO  \u2022  FRED NILE DIES AT 92",
    M,
    tickY + 30,
    2,
    PAPER,
  );

  return cv;
}

// ---------- main ----------
function main(): void {
  const cv = drawScene();
  const png = encodePNG(cv);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.png"), png);
  // Best-effort local copy into the entry dir (the grader sandbox repo root
  // is read-only, so this must never fail the run).
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    copyFileSync(join(outDir, "entry.png"), join(here, "entry.png"));
  } catch {
    // ignore: the /output write above already succeeded
  }
}

main();
