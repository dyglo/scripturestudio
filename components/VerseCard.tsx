"use client";
import { Heart, ArrowRight } from "lucide-react";
import type { Verse } from "@/lib/scripture";

export default function VerseCard({
  verse,
  favorite,
  onFavorite,
  onCreate,
}: {
  verse: Verse;
  favorite: boolean;
  onFavorite: () => void;
  onCreate: () => void;
}) {
  return (
    <article className="verse-card">
      <div className="verse-card-top">
        <span className="eyebrow">{verse.category}</span>
        <button
          className="icon-button"
          aria-label={`Favorite ${verse.reference}`}
          aria-pressed={favorite}
          onClick={onFavorite}
        >
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <h2>“{verse.text}”</h2>
      <span className="verse-reference">{verse.reference} · WEB</span>
      <button className="text-button" onClick={onCreate}>
        Create with this verse
        <ArrowRight size={16} />
      </button>
    </article>
  );
}
