"use client";
import { ArrowUpRight, Search } from "lucide-react";
import type { State } from "@/lib/storage";
import type { Verse } from "@/lib/scripture";
import VerseCard from "./VerseCard";
import { verses } from "@/lib/scripture";
export default function Explore({
  data,
  category,
  setCategory,
  search,
  setSearch,
  favorite,
  create,
}: {
  data: State;
  category: string;
  setCategory: (c: string) => void;
  search: string;
  setSearch: (s: string) => void;
  favorite: (v: Verse) => void;
  create: (v?: Verse, i?: number) => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORDS FOR EVERY SEASON</span>
          <h1>Find a little light.</h1>
          <p className="muted">Scripture for wherever your heart is today.</p>
        </div>
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Search scripture"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search verses or references"
          />
        </div>
      </div>
      <div className="filter-tabs explore-tabs">
        {[
          "All",
          "Hope",
          "Faith",
          "Peace",
          "Strength",
          "Gratitude",
          "Encouragement",
        ].map((c) => (
          <button
            key={c}
            className={category === c ? "active" : ""}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="verse-grid">
        {verses
          .filter(
            (v) =>
              (category === "All" || v.category === category) &&
              `${v.text} ${v.reference}`
                .toLowerCase()
                .includes(search.toLowerCase()),
          )
          .map((v) => (
            <VerseCard
              key={v.reference}
              verse={v}
              favorite={data.favorites.includes(v.reference)}
              onFavorite={() => favorite(v)}
              onCreate={() => create(v)}
            />
          ))}
      </div>
      {!verses.some(
        (v) =>
          (category === "All" || v.category === category) &&
          `${v.text} ${v.reference}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ) && (
        <div className="empty">
          <Search />
          <h2>No matching verses.</h2>
          <p>Try a reference or another word.</p>
        </div>
      )}
      <p className="scripture-credit">
        All library scripture: World English Bible (WEB), public domain.{" "}
        <a href="https://ebible.org/web/" target="_blank" rel="noreferrer">
          Read the source
          <ArrowUpRight size={12} />
        </a>
      </p>
    </>
  );
}
