"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Heart,
  PenLine,
  Leaf,
  Home,
  Compass,
  Trophy,
  Settings,
  LayoutGrid,
  Palette,
  Check,
  Download,
  MonitorSmartphone,
  WifiOff,
  X,
} from "lucide-react";
import Landing from "@/components/Landing";
import Today from "@/components/Today";
import Collection from "@/components/Collection";
import Explore from "@/components/Explore";
import Challenges from "@/components/Challenges";
import Preferences from "@/components/Preferences";
import type { Page } from "@/lib/types";
import Studio from "@/components/Studio";
import Journal, { makeEntry } from "@/components/Journal";
import { type Design, newDesign, download } from "@/lib/canvas";
import {
  type Entry,
  type State,
  emptyState,
  readState,
  writeState,
  validateBackup,
} from "@/lib/storage";
import {
  dailyVerse,
  localDate,
  reflections,
  type Verse,
} from "@/lib/scripture";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
const nav = [
  { id: "today", title: "Today", icon: Home },
  { id: "studio", title: "Studio", icon: Palette },
  { id: "journal", title: "Journal", icon: BookOpen },
  { id: "collection", title: "My Collection", icon: LayoutGrid },
  { id: "explore", title: "Explore", icon: Compass },
  { id: "challenges", title: "Challenges", icon: Trophy },
  { id: "settings", title: "Settings", icon: Settings },
] as const;
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [data, setData] = useState<State>(structuredClone(emptyState));
  const dataRef = useRef(data);
  const queue = useRef(Promise.resolve());
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [toast, setToast] = useState("");
  const [design, setDesign] = useState<Design>(() => newDesign(dailyVerse()));
  const [entry, setEntry] = useState<Entry>();
  const [journalKey, setJournalKey] = useState(0);
  const [today, setToday] = useState(localDate());
  const [online, setOnline] = useState(true);
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [installHelp, setInstallHelp] = useState(false);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("Created");
  const [reading, setReading] = useState<"reflection" | "prayer" | null>(null);
  const verse = dailyVerse(new Date(`${today}T12:00:00`));
  const notify = useCallback((message: string) => {
    setToast(message);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    readState()
      .then((s) => {
        dataRef.current = s;
        setData(s);
      })
      .catch((e) => setStorageError(e.message))
      .finally(() => setReady(true));
    const sync = () => {
      const p = location.hash.slice(1) as Page;
      if (
        [
          "home",
          "today",
          "studio",
          "journal",
          "collection",
          "explore",
          "challenges",
          "settings",
        ].includes(p)
      )
        setPage(p);
    };
    sync();
    window.addEventListener("hashchange", sync);
    const network = () => setOnline(navigator.onLine);
    network();
    window.addEventListener("online", network);
    window.addEventListener("offline", network);
    const prompt = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", prompt);
    const installed = () => {
      setInstall(null);
      setInstallHelp(false);
      notify("Scripture Studio is installed.");
    };
    window.addEventListener("appinstalled", installed);
    if ("serviceWorker" in navigator)
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() =>
          notify("Offline setup failed. Please reload while online."),
        );
    const clock = setInterval(() => setToday(localDate()), 30000);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("online", network);
      window.removeEventListener("offline", network);
      window.removeEventListener("beforeinstallprompt", prompt);
      window.removeEventListener("appinstalled", installed);
      clearInterval(clock);
    };
  }, [notify]);
  useEffect(() => {
    if (!reading && !installHelp) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    dialog?.querySelector<HTMLElement>("button")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setReading(null);
        setInstallHelp(false);
      }
      if (e.key === "Tab" && dialog) {
        const controls = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button,a,input,select,textarea,[tabindex="0"]',
          ),
        ).filter((el) => !el.hasAttribute("disabled"));
        const first = controls[0],
          last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [reading, installHelp]);
  function go(p: Page) {
    if (p === "journal") {
      setEntry(undefined);
      setJournalKey((k) => k + 1);
    }
    setPage(p);
    window.history.pushState(null, "", `#${p}`);
    setReading(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function persist(update: (s: State) => State) {
    const next = update(dataRef.current);
    dataRef.current = next;
    setData(next);
    let success = true;
    queue.current = queue.current
      .then(() => writeState(next))
      .then(() => setStorageError(""))
      .catch((e) => {
        success = false;
        setStorageError(e.message);
        notify(e.message);
      });
    await queue.current;
    return success;
  }
  const activity = (kind: string) =>
    persist((s) => ({
      ...s,
      activity: {
        ...s.activity,
        [today]: Array.from(new Set([...(s.activity[today] || []), kind])),
      },
    }));
  async function saveDesign(d: Design) {
    return persist((s) => ({
      ...s,
      designs: [d, ...s.designs.filter((x) => x.id !== d.id)],
      activity: {
        ...s.activity,
        [today]: Array.from(new Set([...(s.activity[today] || []), "create"])),
      },
    }));
  }
  async function saveEntry(e: Entry) {
    return persist((s) => ({
      ...s,
      entries: [e, ...s.entries.filter((x) => x.id !== e.id)],
      activity: {
        ...s.activity,
        [today]: Array.from(new Set([...(s.activity[today] || []), "journal"])),
      },
    }));
  }
  function create(v: Verse = verse, i = 0) {
    setDesign(newDesign(v, i));
    go("studio");
  }
  function journal(kind: Entry["kind"] = "Reflection", body = "") {
    go("journal");
    setEntry(makeEntry(kind, body));
  }
  function favorite(v: Verse) {
    void persist((s) => ({
      ...s,
      favorites: s.favorites.includes(v.reference)
        ? s.favorites.filter((x) => x !== v.reference)
        : [...s.favorites, v.reference],
    }));
  }
  async function shareVerse() {
    const text = `${verse.text}\n${verse.reference} — World English Bible`;
    try {
      if (navigator.share)
        await navigator.share({ text, title: "Today’s scripture" });
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        notify("Verse copied to your clipboard.");
      } else {
        download(new Blob([text], { type: "text/plain" }), "daily-verse.txt");
        notify("Verse downloaded.");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        notify("Sharing is unavailable. Create a graphic to download instead.");
    }
  }
  async function importBackup(file?: File) {
    if (!file) return;
    if (file.size > 80 * 1024 * 1024) {
      notify("Backup is too large. Maximum size is 80 MB.");
      return;
    }
    try {
      const s = validateBackup(JSON.parse(await file.text()));
      if (
        !confirm(
          "Replace local designs, journal, and progress with this backup? Export your current data first if you want to keep it.",
        )
      )
        return;
      if (await persist(() => s)) notify("Backup restored successfully.");
    } catch (e) {
      notify((e as Error).message);
    }
  }
  const completed = data.activity[today] || [];
  const activityCount = ["reflect", "journal", "create"].filter((k) =>
    completed.includes(k),
  ).length;
  const templateToggle = (i: number) =>
    void persist((s) => ({
      ...s,
      templates: s.templates.includes(i)
        ? s.templates.filter((x) => x !== i)
        : [...s.templates, i],
    }));
  return (
    <>
      {page === "home" ? (
        <Landing go={go} create={create} setInstallHelp={setInstallHelp} />
      ) : (
        <div className="app-shell">
          <aside className="sidebar">
            <a href="#home" className="brand">
              <span className="brand-icon">
                <Leaf />
              </span>
              <span>
                Scripture<span className="brand-light">Studio</span>
                <small>CREATE. REFLECT. GROW.</small>
              </span>
            </a>
            <nav aria-label="Main navigation">
              {nav.map((n, i) => (
                <button
                  key={n.id}
                  className={`${page === n.id ? "active" : ""} ${i === 4 ? "nav-break" : ""}`}
                  onClick={() => go(n.id)}
                >
                  <n.icon size={19} />
                  <span>{n.title}</span>
                  {n.id === page && <span className="nav-dot" />}
                </button>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <div className="sidebar-quote">
                <Leaf size={22} />
                <p>
                  A little faith.
                  <br />
                  Every single day.
                </p>
                <span>YOUR QUIET CORNER</span>
              </div>
              <button
                className="install-link"
                onClick={() => setInstallHelp(true)}
              >
                <MonitorSmartphone size={18} />
                <span>
                  Take your peace with you<small>Install the free app</small>
                </span>
                <ArrowUpRight size={15} />
              </button>
            </div>
          </aside>
          <div className="app-content">
            <header className="app-topbar">
              <a href="#home" className="mobile-brand">
                <Leaf size={22} />
                Scripture Studio
              </a>
              <span className="topbar-message">
                A space for your soul, and your creativity.
              </span>
              <div className="topbar-right">
                <span className="privacy-pill">
                  <span />
                  Private by design
                </span>
                <button
                  className="initial-avatar"
                  aria-label="Preferences"
                  onClick={() => go("settings")}
                >
                  {data.preferences.name.slice(0, 1).toUpperCase() || (
                    <Leaf size={18} />
                  )}
                </button>
              </div>
            </header>
            <main className={`workspace page-${page}`}>
              {!online && (
                <div className="offline-notice">
                  <WifiOff size={16} />
                  You’re offline. Your local journal and saved designs are still
                  here.
                </div>
              )}
              {storageError && (
                <div className="storage-error" role="alert">
                  {storageError} Changes remain in this tab. Export a backup in
                  Settings before closing.
                </div>
              )}
              {!ready ? (
                <div className="loading">
                  <Leaf />
                  Opening your quiet corner…
                </div>
              ) : (
                <>
                  {page === "today" && (
                    <Today
                      data={data}
                      verse={verse}
                      today={today}
                      create={create}
                      shareVerse={shareVerse}
                      favorite={favorite}
                      journal={journal}
                      setReading={setReading}
                      activity={activity}
                      setCategory={setCategory}
                      go={go}
                      completed={completed}
                      activityCount={activityCount}
                    />
                  )}
                  {page === "studio" && (
                    <Studio
                      key={design.id}
                      initial={design}
                      onSave={saveDesign}
                      onDraft={setDesign}
                      onTemplate={templateToggle}
                      templates={data.templates}
                      notify={notify}
                    />
                  )}
                  {page === "journal" && (
                    <Journal
                      key={journalKey}
                      entries={data.entries}
                      initial={entry}
                      onSave={saveEntry}
                      onDelete={(id) =>
                        void persist((s) => ({
                          ...s,
                          entries: s.entries.filter((e) => e.id !== id),
                        }))
                      }
                    />
                  )}
                  {page === "collection" && (
                    <Collection
                      data={data}
                      collectionFilter={collectionFilter}
                      setCollectionFilter={setCollectionFilter}
                      create={create}
                      setDesign={setDesign}
                      go={go}
                      saveDesign={saveDesign}
                      notify={notify}
                      persist={persist}
                      templateToggle={templateToggle}
                      favorite={favorite}
                    />
                  )}
                  {page === "explore" && (
                    <Explore
                      data={data}
                      category={category}
                      setCategory={setCategory}
                      search={search}
                      setSearch={setSearch}
                      favorite={favorite}
                      create={create}
                    />
                  )}
                  {page === "challenges" && (
                    <Challenges
                      data={data}
                      today={today}
                      journal={journal}
                      persist={persist}
                    />
                  )}
                  {page === "settings" && (
                    <Preferences
                      data={data}
                      persist={persist}
                      notify={notify}
                      today={today}
                      importBackup={importBackup}
                      setInstallHelp={setInstallHelp}
                    />
                  )}
                </>
              )}
            </main>
            <footer className="app-footer">
              <span>Made for a little more faith in the everyday.</span>
              <button className="text-button" onClick={() => go("settings")}>
                Free, always. Private, by design.
                <Leaf size={13} />
              </button>
            </footer>
          </div>
          <nav className="bottom-nav" aria-label="Mobile navigation">
            {nav.slice(0, 4).map((n) => (
              <button
                key={n.id}
                className={page === n.id ? "active" : ""}
                onClick={() => go(n.id)}
              >
                <n.icon size={20} />
                <span>{n.id === "collection" ? "Collection" : n.title}</span>
              </button>
            ))}
            <button
              className={
                ["explore", "challenges", "settings"].includes(page)
                  ? "active"
                  : ""
              }
              onClick={() => go("explore")}
            >
              <Compass size={20} />
              <span>Explore</span>
            </button>
          </nav>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button aria-label="Dismiss message" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
      {reading && (
        <div className="modal-backdrop" onClick={() => setReading(null)}>
          <section
            className="modal devotional"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reading-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Close reflection"
              onClick={() => setReading(null)}
            >
              <X />
            </button>
            <span className="brand-icon">
              {reading === "reflection" ? <BookOpen /> : <Heart />}
            </span>
            <span className="eyebrow">A MOMENT FOR YOUR SOUL</span>
            <h2 id="reading-title">
              {reading === "reflection"
                ? "A quiet reflection."
                : "Today’s prayer."}
            </h2>
            <p>
              {reading === "reflection"
                ? reflections[verse.category]
                : "Father, meet me in this ordinary day. Quiet my worries and open my eyes to your goodness. Help me to walk in faith, to receive your grace, and to share your love with those around me. Amen."}
            </p>
            <p className="small muted">
              Original devotional writing inspired by {verse.reference}.
            </p>
            <button
              className="button"
              onClick={() => {
                journal(reading === "reflection" ? "Reflection" : "Prayer");
                setReading(null);
              }}
            >
              Make it a conversation
              <PenLine size={16} />
            </button>
          </section>
        </div>
      )}
      {installHelp && (
        <div className="modal-backdrop" onClick={() => setInstallHelp(false)}>
          <section
            className="modal install-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Close install guide"
              onClick={() => setInstallHelp(false)}
            >
              <X />
            </button>
            <div className="brand-icon">
              <Leaf size={32} />
            </div>
            <span className="eyebrow">YOUR QUIET CORNER, EVERYWHERE</span>
            <h2 id="install-title">
              Take a little peace
              <br />
              with you.
            </h2>
            <p>
              Daily Scripture Studio works offline.
              <br />
              Free to install. No account needed.
            </p>
            {install ? (
              <button
                className="button full"
                onClick={async () => {
                  await install.prompt();
                  await install.userChoice;
                  setInstall(null);
                }}
              >
                Install Scripture Studio
                <Download size={17} />
              </button>
            ) : (
              <div className="install-instructions">
                <p>
                  <strong>iPhone & iPad</strong>
                  <br />
                  In Safari, tap Share, then “Add to Home Screen”.
                </p>
                <p>
                  <strong>Android & desktop</strong>
                  <br />
                  In Chrome or Edge, open the browser menu and choose “Install
                  app” or “Add to Home screen”.
                </p>
                <p className="small muted">
                  If already installed, open it from your device’s app list.
                  Some browsers do not support installation.
                </p>
              </div>
            )}
            <button
              className="text-button"
              onClick={() => setInstallHelp(false)}
            >
              Keep exploring
              <ArrowRight size={15} />
            </button>
          </section>
        </div>
      )}
    </>
  );
}
