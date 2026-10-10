import { verses, type Verse } from "./scripture";
export type Design = {
  id: string;
  title: string;
  text: string;
  reference: string;
  ratio: "1:1" | "4:5" | "9:16" | "16:9";
  background: string;
  color: string;
  font: "Editorial" | "Georgia" | "Arial";
  size: number;
  align: "left" | "center" | "right";
  x: number;
  y: number;
  spacing: number;
  lineHeight: number;
  overlay: number;
  decoration: boolean;
  updatedAt: string;
  exportedAt?: string;
};
export const dimensions = {
  "1:1": [1080, 1080],
  "4:5": [1080, 1350],
  "9:16": [1080, 1920],
  "16:9": [1920, 1080],
} as const;
export const photos = ["lake", "mountain", "forest", "sunrise"];
export function newDesign(verse: Verse = verses[0], template = 0): Design {
  return {
    id: crypto.randomUUID(),
    title: verse.reference,
    text: verse.text,
    reference: `${verse.reference} · WEB`,
    ratio: "1:1",
    background:
      template === 4
        ? "#eee6d7"
        : template === 5
          ? "gradient"
          : `/images/${photos[template % 4]}.jpg`,
    color: template === 2 ? "#ffffff" : "#292c25",
    font: "Editorial",
    size: 64,
    align: "center",
    x: 50,
    y: 27,
    spacing: 0,
    lineHeight: 1.05,
    overlay: template === 2 ? 0.2 : 0.65,
    decoration: true,
    updatedAt: new Date().toISOString(),
  };
}
const imageCache = new Map<string, Promise<HTMLImageElement>>();
function loadImage(src: string) {
  if (imageCache.size > 12) imageCache.delete(imageCache.keys().next().value!);
  if (!imageCache.has(src))
    imageCache.set(
      src,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
          imageCache.delete(src);
          reject(
            new Error("Unable to load this background. Choose another image."),
          );
        };
        img.src = src;
      }),
    );
  return imageCache.get(src)!;
}
export async function renderDesign(canvas: HTMLCanvasElement, d: Design) {
  await document.fonts.load(`${d.size}px Editorial`);
  await document.fonts.ready;
  const img =
    d.background.startsWith("/") || d.background.startsWith("data:")
      ? await loadImage(d.background)
      : null;
  const [w, h] = dimensions[d.ratio];
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");
  if (img) {
    const scale = Math.max(w / img.width, h / img.height);
    ctx.drawImage(
      img,
      (w - img.width * scale) / 2,
      (h - img.height * scale) / 2,
      img.width * scale,
      img.height * scale,
    );
    ctx.fillStyle = `rgba(249,244,231,${d.overlay})`;
    ctx.fillRect(0, 0, w, h);
  } else if (d.background === "gradient") {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#f4e7d1");
    g.addColorStop(0.5, "#e5bd85");
    g.addColorStop(1, "#6d7965");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = d.background;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.fillStyle = d.color;
  ctx.textBaseline = "top";
  ctx.textAlign = d.align;
  const maxWidth = w * 0.76;
  const margin = 35;
  // Fit unusually long passages without clipping. The same layout is used for exports.
  let effectiveSize = d.size;
  let lines: string[] = [];
  let lh = effectiveSize * d.lineHeight;
  do {
    ctx.font = `${effectiveSize}px ${d.font}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${d.spacing}px`;
    lines = [];
    for (const paragraph of d.text.split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else line = candidate;
        // Long unbroken words must also fit inside the artwork.
        while (ctx.measureText(line).width > maxWidth) {
          let count = line.length - 1;
          while (
            count > 1 &&
            ctx.measureText(line.slice(0, count)).width > maxWidth
          )
            count--;
          lines.push(line.slice(0, count));
          line = line.slice(count);
        }
      }
      lines.push(line);
    }
    lh = effectiveSize * d.lineHeight;
    if (lines.length * lh + 95 <= h - margin * 2 || effectiveSize <= 12) break;
    effectiveSize--;
  } while (effectiveSize > 11);
  const textWidth = Math.max(
    ...lines.map((line) => ctx.measureText(line).width),
    65,
  );
  ctx.font = "20px Arial";
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
  const blockWidth = Math.min(
    maxWidth,
    Math.max(textWidth, ctx.measureText(d.reference.toUpperCase()).width),
  );
  const center = Math.max(
    margin + blockWidth / 2,
    Math.min((w * d.x) / 100, w - margin - blockWidth / 2),
  );
  const x =
    d.align === "left"
      ? center - blockWidth / 2
      : d.align === "right"
        ? center + blockWidth / 2
        : center;
  const totalHeight = lines.length * lh + 95;
  const y = Math.max(
    margin,
    Math.min((h * d.y) / 100, h - totalHeight - margin),
  );
  ctx.font = `${effectiveSize}px ${d.font}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${d.spacing}px`;
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * lh, maxWidth));
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
  ctx.font = "20px Arial";
  ctx.fillText(
    d.reference.toUpperCase(),
    x,
    y + lines.length * lh + 28,
    maxWidth,
  );
  if (d.decoration) {
    ctx.strokeStyle = d.color;
    ctx.lineWidth = 2;
    const dx = d.align === "left" ? x : d.align === "right" ? x - 65 : x - 32;
    ctx.beginPath();
    ctx.moveTo(dx, y + lines.length * lh + 75);
    ctx.lineTo(dx + 65, y + lines.length * lh + 75);
    ctx.stroke();
  }
}
export async function designBlob(d: Design) {
  const canvas = document.createElement("canvas");
  await renderDesign(canvas, d);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("PNG export failed.")),
      "image/png",
    ),
  );
}
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
