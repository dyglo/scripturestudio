"use client";
import { useEffect, useRef, useState } from "react";
import { renderDesign, type Design } from "@/lib/canvas";
export default function Artwork({
  design,
  onPosition,
}: {
  design: Design;
  onPosition?: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const canvas = document.createElement("canvas");
    renderDesign(canvas, design)
      .then(() => {
        if (active && ref.current) {
          ref.current.width = canvas.width;
          ref.current.height = canvas.height;
          ref.current.getContext("2d")?.drawImage(canvas, 0, 0);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [design]);
  return (
    <div
      className="artwork"
      style={{ aspectRatio: design.ratio.replace(":", "/") }}
    >
      {error ? (
        <p role="alert">{error}</p>
      ) : (
        <canvas
          ref={ref}
          aria-label={`${design.text} — ${design.reference}`}
          onPointerDown={
            onPosition
              ? (e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  onPosition(
                    ((e.clientX - r.left) / r.width) * 100,
                    ((e.clientY - r.top) / r.height) * 100,
                  );
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
