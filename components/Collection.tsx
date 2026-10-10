"use client";
import {
  ArrowRight,
  ImageIcon,
  Plus,
  Copy,
  Trash2,
  Bookmark,
} from "lucide-react";
import type { State } from "@/lib/storage";
import type { Design } from "@/lib/canvas";
import type { Verse } from "@/lib/scripture";
import type { Page } from "@/lib/types";
import Artwork from "./Artwork";
import VerseCard from "./VerseCard";
import { newDesign } from "@/lib/canvas";
import { verses } from "@/lib/scripture";
export default function Collection({
  data,
  collectionFilter,
  setCollectionFilter,
  create,
  setDesign,
  go,
  saveDesign,
  notify,
  persist,
  templateToggle,
  favorite,
}: {
  data: State;
  collectionFilter: string;
  setCollectionFilter: (s: string) => void;
  create: (v?: Verse, i?: number) => void;
  setDesign: (d: Design) => void;
  go: (p: Page) => void;
  saveDesign: (d: Design) => Promise<boolean>;
  notify: (m: string) => void;
  persist: (f: (s: State) => State) => Promise<boolean>;
  templateToggle: (i: number) => void;
  favorite: (v: Verse) => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">LITTLE REMINDERS, WORTH KEEPING</span>
          <h1>My collection.</h1>
          <p className="muted">
            Your creativity, your favorite words, your little corner of
            inspiration.
          </p>
        </div>
        <button className="button" onClick={() => create()}>
          <Plus size={16} />
          Create a design
        </button>
      </div>
      <div className="collection-bar">
        <div className="filter-tabs">
          {["Created", "Saved templates", "Favorite verses", "Exported"].map(
            (f) => (
              <button
                className={collectionFilter === f ? "active" : ""}
                key={f}
                onClick={() => setCollectionFilter(f)}
              >
                {f}
              </button>
            ),
          )}
        </div>
        <span className="small muted">Stored on this device</span>
      </div>
      {(collectionFilter === "Created" || collectionFilter === "Exported") && (
        <div className="collection-grid">
          {data.designs
            .filter((d) => collectionFilter !== "Exported" || d.exportedAt)
            .map((d) => (
              <article className="collection-card" key={d.id}>
                <button
                  aria-label={`Edit ${d.title}`}
                  className="art-button"
                  onClick={() => {
                    setDesign(d);
                    go("studio");
                  }}
                >
                  <Artwork design={d} />
                </button>
                <div className="collection-detail">
                  <div>
                    <h3>{d.title}</h3>
                    <span className="small muted">
                      {new Date(d.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    aria-label={`Duplicate ${d.title}`}
                    className="icon-button"
                    onClick={() => {
                      const copy = {
                        ...d,
                        id: crypto.randomUUID(),
                        title: `${d.title} (copy)`,
                        updatedAt: new Date().toISOString(),
                        exportedAt: undefined,
                      };
                      void saveDesign(copy).then(
                        (ok) => ok && notify("Design duplicated."),
                      );
                    }}
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    aria-label={`Delete ${d.title}`}
                    className="icon-button danger"
                    onClick={() => {
                      if (confirm("Delete this saved design?"))
                        void persist((s) => ({
                          ...s,
                          designs: s.designs.filter((x) => x.id !== d.id),
                        }));
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
        </div>
      )}
      {collectionFilter === "Saved templates" && (
        <div className="collection-grid">
          {data.templates.map((i) => (
            <article key={i} className="collection-card">
              <button
                className="art-button"
                onClick={() => create(verses[i], i)}
              >
                <Artwork design={newDesign(verses[i], i)} />
              </button>
              <div className="collection-detail">
                <h3>{verses[i].reference}</h3>
                <button
                  className="icon-button"
                  aria-label="Remove saved template"
                  onClick={() => templateToggle(i)}
                >
                  <Bookmark size={16} fill="currentColor" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {collectionFilter === "Favorite verses" && (
        <div className="verse-grid">
          {verses
            .filter((v) => data.favorites.includes(v.reference))
            .map((v) => (
              <VerseCard
                key={v.reference}
                verse={v}
                favorite={true}
                onFavorite={() => favorite(v)}
                onCreate={() => create(v)}
              />
            ))}
        </div>
      )}
      {((collectionFilter === "Created" && !data.designs.length) ||
        (collectionFilter === "Exported" &&
          !data.designs.some((d) => d.exportedAt)) ||
        (collectionFilter === "Saved templates" && !data.templates.length) ||
        (collectionFilter === "Favorite verses" && !data.favorites.length)) && (
        <div className="empty large">
          <ImageIcon size={36} />
          <h2>A little inspiration belongs here.</h2>
          <p>
            {collectionFilter === "Favorite verses"
              ? "Tap a heart in Explore to keep a verse."
              : collectionFilter === "Saved templates"
                ? "Save your favorite templates in the Studio."
                : "Create and save a design to begin your collection."}
          </p>
          <button
            className="button"
            onClick={() =>
              collectionFilter === "Favorite verses" ? go("explore") : create()
            }
          >
            Find your inspiration
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </>
  );
}
