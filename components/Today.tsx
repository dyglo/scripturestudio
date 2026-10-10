"use client";
import {
  ArrowRight,
  ArrowUpRight,
  Sun,
  BookOpen,
  Heart,
  PenLine,
  Share2,
  Palette,
  Check,
} from "lucide-react";
import type { State, Entry } from "@/lib/storage";
import type { Verse } from "@/lib/scripture";
import type { Page } from "@/lib/types";
import { reflections } from "@/lib/scripture";
export default function Today({
  data,
  verse,
  today,
  create,
  shareVerse,
  favorite,
  journal,
  setReading,
  activity,
  setCategory,
  go,
  completed,
  activityCount,
}: {
  data: State;
  verse: Verse;
  today: string;
  create: (v?: Verse, i?: number) => void;
  shareVerse: () => Promise<void>;
  favorite: (v: Verse) => void;
  journal: (kind?: Entry["kind"], body?: string) => void;
  setReading: (v: "reflection" | "prayer" | null) => void;
  activity: (kind: string) => Promise<boolean>;
  setCategory: (c: string) => void;
  go: (p: Page) => void;
  completed: string[];
  activityCount: number;
}) {
  return (
    <>
      <div className="page-heading today-heading">
        <div>
          <span className="eyebrow">
            <Sun size={13} />
            {new Date(`${today}T12:00:00`)
              .toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })
              .toUpperCase()}
          </span>
          <h1>A moment with God.</h1>
          <p className="muted">
            {data.preferences.name ? `${data.preferences.name}, take` : "Take"}{" "}
            a breath. Let your heart settle here.
          </p>
        </div>
        <div className="heading-verse">
          “Let all that you do be done in love.”
          <span>1 CORINTHIANS 16:14 · WEB</span>
        </div>
      </div>
      <div className="today-grid">
        <section className="daily-card">
          <div className="daily-card-content">
            <span className="eyebrow">TODAY’S SCRIPTURE</span>
            <h2>“{verse.text}”</h2>
            <span className="verse-reference">
              {verse.reference.toUpperCase()} · WORLD ENGLISH BIBLE
            </span>
            <div className="actions">
              <button className="button" onClick={() => create()}>
                <Palette size={16} />
                Create this design
              </button>
              <button className="button white" onClick={shareVerse}>
                <Share2 size={16} />
                Share verse
              </button>
              <button
                className={`round-button ${data.favorites.includes(verse.reference) ? "saved" : ""}`}
                aria-label="Favorite today's verse"
                onClick={() => favorite(verse)}
              >
                <Heart
                  size={17}
                  fill={
                    data.favorites.includes(verse.reference)
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </div>
          </div>
          <span className="daily-card-footer">
            <span />A little truth to carry with you today.
          </span>
        </section>
        <div className="daily-companions">
          <button
            className="companion"
            onClick={() => {
              setReading("reflection");
              void activity("reflect");
            }}
          >
            <span className="companion-icon">
              <BookOpen />
            </span>
            <span>
              <small>PAUSE & PONDER</small>
              <h3>A quiet reflection</h3>
              <p>{reflections[verse.category].split(".")[0]}.</p>
            </span>
            <ArrowUpRight size={18} />
          </button>
          <button
            className="companion"
            onClick={() => {
              setReading("prayer");
              void activity("reflect");
            }}
          >
            <span className="companion-icon peach">
              <Heart />
            </span>
            <span>
              <small>TALK TO GOD</small>
              <h3>Today’s prayer</h3>
              <p>A few words to bring your heart back home.</p>
            </span>
            <ArrowUpRight size={18} />
          </button>
          <button className="companion" onClick={() => journal("Gratitude")}>
            <span className="companion-icon sage">
              <PenLine />
            </span>
            <span>
              <small>NOTICE THE GOOD</small>
              <h3>A little gratitude</h3>
              <p>What simple gift are you thankful for today?</p>
            </span>
            <ArrowUpRight size={18} />
          </button>
        </div>
      </div>
      <section className="journey-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SMALL STEPS, DEEPER ROOTS</span>
            <h2>Continue your journey</h2>
          </div>
          <button className="text-button" onClick={() => go("explore")}>
            Explore more
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="journey-grid">
          {[
            {
              image: "forest",
              label: "7-DAY CHALLENGE",
              title: "A grateful heart",
              description: `${(data.challenge.gratitude || []).length} of 7 moments completed`,
              action: () => go("challenges"),
            },
            {
              image: "sunrise",
              label: "YOUR PRIVATE JOURNAL",
              title: "Make room for prayer",
              description: "Put what’s on your heart into words.",
              action: () => journal("Prayer"),
            },
            {
              image: "mountain",
              label: "SCRIPTURE FOR THE SOUL",
              title: "Hope for the journey",
              description: "Find encouragement for today.",
              action: () => {
                setCategory("Hope");
                go("explore");
              },
            },
            {
              image: "lake",
              label: "A MOMENT TO CREATE",
              title: "Share a little light",
              description: "A verse. A design. A kind reminder.",
              action: () => create(),
            },
          ].map((c) => (
            <button
              className="journey-card"
              key={c.title}
              onClick={() => c.action()}
            >
              <img src={`/images/${c.image}.jpg`} alt="" />
              <div>
                <span className="eyebrow">{c.label}</span>
                <h3>{c.title}</h3>
                <p>{c.description}</p>
                <ArrowRight size={18} />
              </div>
            </button>
          ))}
        </div>
      </section>
      <section className="daily-rhythm">
        <div>
          <Sun size={25} />
          <span>
            <h3>Your daily rhythm</h3>
            <p>A few small moments can make a meaningful day.</p>
          </span>
        </div>
        <div className="rhythm-steps">
          {["reflect", "journal", "create"].map((id, i) => (
            <button
              key={id}
              className={completed.includes(id) ? "complete" : ""}
              onClick={() => {
                if (id === "reflect") {
                  setReading("reflection");
                  void activity("reflect");
                } else if (id === "journal") journal();
                else create();
              }}
            >
              <span>
                {completed.includes(id) ? <Check size={14} /> : i + 1}
              </span>
              {id[0].toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>
        <span className="rhythm-count">
          {activityCount}/3<small>MOMENTS</small>
        </span>
      </section>
      <div className="closing-note">
        <span className="tiny-line" />
        <p>You don’t have to do it all. Just begin where you are.</p>
        <span className="tiny-line" />
      </div>
    </>
  );
}
