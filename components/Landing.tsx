"use client";
import {
  ArrowRight,
  ArrowUpRight,
  Sun,
  ImageIcon,
  BookOpen,
  Share2,
  Palette,
  Leaf,
} from "lucide-react";
import { verses, type Verse } from "@/lib/scripture";
import type { Page } from "@/lib/types";
export default function Landing({
  go,
  create,
  setInstallHelp,
}: {
  go: (p: Page) => void;
  create: (v?: Verse, i?: number) => void;
  setInstallHelp: (open: boolean) => void;
}) {
  return (
    <div className="landing">
      <header className="landing-header">
        <a className="brand" href="#home">
          <span className="brand-icon">
            <Leaf />
          </span>
          <span>
            Scripture<span className="brand-light">Studio</span>
          </span>
        </a>
        <nav aria-label="Landing navigation">
          <a href="#features">The experience</a>
          <a href="#inspiration">Made to inspire</a>
          <button onClick={() => setInstallHelp(true)}>Get the app</button>
        </nav>
        <button className="button small-button" onClick={() => go("today")}>
          Open studio
          <ArrowUpRight size={16} />
        </button>
      </header>
      <main>
        <section className="hero">
          <div className="hero-image" />
          <div className="hero-content">
            <span className="eyebrow">
              <span className="tiny-line" /> A LITTLE STILLNESS. A DEEPER FAITH.
            </span>
            <h1>
              Make room
              <br />
              for the <em>sacred.</em>
            </h1>
            <p>
              Create beautiful scripture art. Capture your prayers.
              <br className="desktop-only" /> Find a moment with God, every day.
            </p>
            <button className="button hero-button" onClick={() => go("today")}>
              Start creating
              <ArrowRight size={19} />
            </button>
            <span className="hero-note">No account needed. Free, always.</span>
            <div className="hero-features">
              {[
                [Sun, "Daily scripture"],
                [ImageIcon, "Beautiful designs"],
                [BookOpen, "Private journal"],
                [Share2, "Save & share"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Sun;
                return (
                  <div key={String(label)}>
                    <I size={24} />
                    <span>{String(label)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="hero-script">
            Faith, in the
            <br />
            everyday.
          </div>
          <div className="hero-caption">
            <span className="tiny-line" /> YOUR DAILY INVITATION TO SLOW DOWN
          </div>
        </section>
        <section className="landing-intro" id="features">
          <span className="eyebrow">A SPACE TO CREATE. A SPACE TO GROW.</span>
          <h2>
            Let the Word become
            <br />
            <em>part of your everyday.</em>
          </h2>
          <p>
            Small, meaningful rhythms. Beautiful things to share.
            <br />A quiet place that is entirely yours.
          </p>
          <div className="feature-cards">
            <button onClick={() => go("today")}>
              <Sun />
              <h3>A moment with God</h3>
              <p>
                Scripture, a thoughtful reflection, and a prayer to begin your
                day.
              </p>
              <span>
                Discover your daily rhythm
                <ArrowRight size={16} />
              </span>
            </button>
            <button onClick={() => create()}>
              <Palette />
              <h3>Words made beautiful</h3>
              <p>
                Turn the verses you love into something worth keeping and
                sharing.
              </p>
              <span>
                Find your creative space
                <ArrowRight size={16} />
              </span>
            </button>
            <button onClick={() => go("journal")}>
              <BookOpen />
              <h3>A heart, on paper</h3>
              <p>
                Reflect, pray, and notice the good. Your private journal stays
                with you.
              </p>
              <span>
                Begin your journal
                <ArrowRight size={16} />
              </span>
            </button>
          </div>
        </section>
        <section className="inspiration" id="inspiration">
          <div>
            <span className="eyebrow">CREATED WITH PURPOSE</span>
            <h2>
              A little beauty.
              <br />
              <em>A lasting reminder.</em>
            </h2>
            <p>
              Begin with a thoughtfully designed template.
              <br />
              Make it yours, and let it encourage someone.
            </p>
            <button className="button secondary" onClick={() => create()}>
              Explore the studio
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="inspiration-art">
            {[0, 1, 4].map((i) => (
              <button
                aria-label={`Customize ${verses[i].reference}`}
                key={i}
                onClick={() => create(verses[i], i)}
              >
                <div className={`static-art art-${i}`}>
                  <span>
                    “
                    {i === 0
                      ? "Be still, and know that I am God."
                      : verses[i].text}
                    ”
                  </span>
                  <small>
                    {verses[i].reference} · WEB{i === 0 ? " · EXCERPT" : ""}
                  </small>
                </div>
              </button>
            ))}
          </div>
        </section>
        <section className="privacy-banner">
          <Leaf />
          <div>
            <h3>Faith is personal. Your space should be, too.</h3>
            <p>
              No accounts. No fees. No private words sent to a server. Just you,
              and a little room to grow.
            </p>
          </div>
          <button className="text-button" onClick={() => go("settings")}>
            About your local data
            <ArrowRight size={16} />
          </button>
        </section>
      </main>
      <footer>
        <a className="brand" href="#home">
          <Leaf size={20} />
          Daily Scripture Studio
        </a>
        <span>Made for a little more faith in the everyday.</span>
        <button className="text-button" onClick={() => go("settings")}>
          Privacy & scripture credits
        </button>
      </footer>
    </div>
  );
}
