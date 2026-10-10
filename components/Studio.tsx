"use client";
import { useState } from "react";
import {
  Undo2,
  Redo2,
  Download,
  Save,
  Upload,
  Share2,
  Bookmark,
  Check,
  ImageIcon,
  Type,
  Palette,
  LayoutTemplate,
} from "lucide-react";
import Artwork from "./Artwork";
import {
  type Design,
  newDesign,
  photos,
  designBlob,
  download,
  dimensions,
} from "@/lib/canvas";
import { verses } from "@/lib/scripture";
export default function Studio({
  initial,
  onSave,
  onDraft,
  onTemplate,
  templates,
  notify,
}: {
  initial: Design;
  onSave: (d: Design) => Promise<boolean>;
  onDraft: (d: Design) => void;
  onTemplate: (i: number) => void;
  templates: number[];
  notify: (m: string) => void;
}) {
  const [history, setHistory] = useState<Design[]>([initial]);
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState("Templates");
  const [busy, setBusy] = useState(false);
  const d = history[index];
  function change(p: Partial<Design>) {
    const next = { ...d, ...p, updatedAt: new Date().toISOString() };
    onDraft(next);
    setHistory((h) => [...h.slice(0, index + 1), next].slice(-80));
    setIndex(Math.min(index + 1, 79));
  }
  async function save() {
    if (await onSave(d)) notify("Design saved to My Collection.");
  }
  async function exportImage(share = false) {
    setBusy(true);
    try {
      const blob = await designBlob(d);
      const file = new File([blob], "scripture-studio.png", {
        type: "image/png",
      });
      if (share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: d.title });
        } catch (error) {
          if ((error as Error).name === "AbortError") return;
          // Some browsers advertise file sharing but reject it after image rendering.
          download(blob, "scripture-studio.png");
        }
      } else download(blob, "scripture-studio.png");
      const exported = { ...d, exportedAt: new Date().toISOString() };
      change({ exportedAt: exported.exportedAt });
      if (await onSave(exported))
        notify(
          share
            ? "Graphic shared or downloaded."
            : "High-resolution PNG downloaded and saved.",
        );
    } catch (e) {
      if ((e as Error).name !== "AbortError") notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      notify("Choose a JPG, PNG, or WebP image under 10 MB.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
      const c = document.createElement("canvas");
      c.width = bitmap.width * scale;
      c.height = bitmap.height * scale;
      c.getContext("2d")!.drawImage(bitmap, 0, 0, c.width, c.height);
      bitmap.close();
      change({ background: c.toDataURL("image/jpeg", 0.9) });
    } catch {
      notify("This image could not be opened. Try a different file.");
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR WORDS. BEAUTIFULLY SHARED.</span>
          <h1>Create something meaningful.</h1>
        </div>
        <div className="actions">
          <button
            className="icon-button"
            aria-label="Undo"
            disabled={index === 0}
            onClick={() => {
              setIndex(index - 1);
              onDraft(history[index - 1]);
            }}
          >
            <Undo2 size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Redo"
            disabled={index === history.length - 1}
            onClick={() => {
              setIndex(index + 1);
              onDraft(history[index + 1]);
            }}
          >
            <Redo2 size={18} />
          </button>
          <button className="button secondary" onClick={save}>
            <Save size={16} />
            Save
          </button>
          <button
            className="button"
            disabled={busy}
            onClick={() => exportImage()}
          >
            <Download size={16} />
            {busy ? "Preparing…" : "Download PNG"}
          </button>
        </div>
      </div>
      <div className="editor">
        <aside className="editor-tools">
          <div className="tool-tabs">
            {[
              ["Templates", LayoutTemplate],
              ["Background", ImageIcon],
              ["Text", Type],
              ["Style", Palette],
            ].map(([name, Icon]) => {
              const I = Icon as typeof Type;
              return (
                <button
                  key={String(name)}
                  className={tab === name ? "active" : ""}
                  onClick={() => setTab(String(name))}
                >
                  <I size={17} />
                  {String(name)}
                </button>
              );
            })}
          </div>
          {tab === "Templates" && (
            <>
              <h3>A beautiful beginning</h3>
              <p className="muted small">
                Choose a template, make it your own.
              </p>
              <div className="template-grid">
                {[
                  "Still waters",
                  "Mountain faith",
                  "Forest peace",
                  "Golden hope",
                  "Quiet grace",
                  "Morning light",
                ].map((title, i) => (
                  <div key={title}>
                    <button
                      className="template"
                      onClick={() =>
                        change({
                          ...newDesign(verses[i], i),
                          id: d.id,
                          ratio: d.ratio,
                        })
                      }
                    >
                      <Artwork
                        design={{ ...newDesign(verses[i], i), id: String(i) }}
                      />
                      <span>{title}</span>
                    </button>
                    <button
                      className="template-save"
                      aria-label={`Save ${title} template`}
                      onClick={() => onTemplate(i)}
                    >
                      {templates.includes(i) ? (
                        <Check size={13} />
                      ) : (
                        <Bookmark size={13} />
                      )}{" "}
                      {templates.includes(i) ? "Saved" : "Save template"}
                    </button>
                  </div>
                ))}
              </div>
              <label>
                Scripture library
                <select
                  value=""
                  onChange={(e) => {
                    const v = verses[Number(e.target.value)];
                    change({
                      text: v.text,
                      reference: `${v.reference} · WEB`,
                      title: v.reference,
                    });
                  }}
                >
                  <option value="" disabled>
                    Choose a verse
                  </option>
                  {verses.map((v, i) => (
                    <option value={i} key={v.reference}>
                      {v.reference} · {v.category}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          {tab === "Background" && (
            <>
              <h3>Set the atmosphere</h3>
              <div className="photo-grid">
                {photos.map((p) => (
                  <button
                    key={p}
                    aria-label={`${p} background`}
                    onClick={() => change({ background: `/images/${p}.jpg` })}
                  >
                    <img src={`/images/${p}.jpg`} alt={p} />
                  </button>
                ))}
              </div>
              <label className="button secondary upload">
                <Upload size={16} />
                Upload your photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => upload(e.target.files?.[0])}
                />
              </label>
              <p className="small muted">Your photo stays on this device.</p>
              <label>
                Solid background
                <input
                  type="color"
                  value={
                    d.background.startsWith("#") ? d.background : "#eee6d7"
                  }
                  onChange={(e) => change({ background: e.target.value })}
                />
              </label>
              <button
                className="button secondary full"
                onClick={() => change({ background: "gradient" })}
              >
                Warm landscape gradient
              </button>
              <label>
                Ivory overlay · {Math.round(d.overlay * 100)}%
                <input
                  type="range"
                  min="0"
                  max="1"
                  step=".01"
                  value={d.overlay}
                  onChange={(e) => change({ overlay: Number(e.target.value) })}
                />
              </label>
            </>
          )}
          {tab === "Text" && (
            <>
              <h3>Words that stay with you</h3>
              <label>
                Design name
                <input
                  value={d.title}
                  maxLength={100}
                  onChange={(e) => change({ title: e.target.value })}
                />
              </label>
              <label>
                Scripture or your own words
                <textarea
                  rows={7}
                  value={d.text}
                  maxLength={1500}
                  onChange={(e) => change({ text: e.target.value })}
                />
              </label>
              <label>
                Reference & translation
                <input
                  value={d.reference}
                  maxLength={150}
                  onChange={(e) => change({ reference: e.target.value })}
                />
              </label>
              <p className="small muted">
                Library verses are World English Bible (WEB). When changing
                text, check its reference and translation.
              </p>
              <label>
                Font family
                <select
                  value={d.font}
                  onChange={(e) =>
                    change({ font: e.target.value as Design["font"] })
                  }
                >
                  <option value="Editorial">Cormorant Garamond</option>
                  <option>Georgia</option>
                  <option>Arial</option>
                </select>
              </label>
              <label>
                Font size · {d.size}px
                <input
                  type="range"
                  min="18"
                  max="120"
                  value={d.size}
                  onChange={(e) => change({ size: Number(e.target.value) })}
                />
              </label>
            </>
          )}
          {tab === "Style" && (
            <>
              <h3>The finishing touches</h3>
              <label>
                Text color
                <input
                  type="color"
                  value={d.color}
                  onChange={(e) => change({ color: e.target.value })}
                />
              </label>
              <label>
                Alignment
                <select
                  value={d.align}
                  onChange={(e) =>
                    change({ align: e.target.value as Design["align"] })
                  }
                >
                  <option>left</option>
                  <option>center</option>
                  <option>right</option>
                </select>
              </label>
              <label>
                Horizontal position
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={d.x}
                  onChange={(e) => change({ x: Number(e.target.value) })}
                />
              </label>
              <label>
                Vertical position
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={d.y}
                  onChange={(e) => change({ y: Number(e.target.value) })}
                />
              </label>
              <label>
                Letter spacing · {d.spacing}px
                <input
                  type="range"
                  min="0"
                  max="8"
                  step=".5"
                  value={d.spacing}
                  onChange={(e) => change({ spacing: Number(e.target.value) })}
                />
              </label>
              <label>
                Line height · {d.lineHeight}
                <input
                  type="range"
                  min=".8"
                  max="2"
                  step=".05"
                  value={d.lineHeight}
                  onChange={(e) =>
                    change({ lineHeight: Number(e.target.value) })
                  }
                />
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={d.decoration}
                  onChange={(e) => change({ decoration: e.target.checked })}
                />
                Decorative gold-style line
              </label>
            </>
          )}
        </aside>
        <div className="editor-stage">
          <div className="canvas-toolbar">
            <span className="small muted">LIVE PREVIEW</span>
            <select
              aria-label="Aspect ratio"
              value={d.ratio}
              onChange={(e) =>
                change({ ratio: e.target.value as Design["ratio"] })
              }
            >
              {Object.entries(dimensions).map(([r, [w, h]]) => (
                <option key={r} value={r}>
                  {r} · {w} × {h}
                </option>
              ))}
            </select>
          </div>
          <div className="canvas-wrap">
            <Artwork design={d} onPosition={(x, y) => change({ x, y })} />
          </div>
          <div className="canvas-footer">
            <span className="small muted">
              Tap to position. Long passages auto-fit.
            </span>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => exportImage(true)}
            >
              <Share2 size={16} />
              Share graphic
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
