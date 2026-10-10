"use client";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Leaf,
  Download,
  Upload,
  MonitorSmartphone,
} from "lucide-react";
import type { State } from "@/lib/storage";
import { download } from "@/lib/canvas";
export default function Preferences({
  data,
  persist,
  notify,
  today,
  importBackup,
  setInstallHelp,
}: {
  data: State;
  persist: (f: (s: State) => State) => Promise<boolean>;
  notify: (m: string) => void;
  today: string;
  importBackup: (file?: File) => Promise<void>;
  setInstallHelp: (b: boolean) => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE YOURSELF AT HOME</span>
          <h1>Your quiet corner.</h1>
          <p className="muted">
            A few simple preferences. You stay in control.
          </p>
        </div>
      </div>
      <div className="settings-grid">
        <section className="settings-card">
          <Leaf />
          <h2>A space that feels like you</h2>
          <label>
            What should we call you?
            <input
              value={data.preferences.name}
              maxLength={50}
              placeholder="Your first name (optional)"
              onChange={(e) =>
                void persist((s) => ({
                  ...s,
                  preferences: {
                    ...s.preferences,
                    name: e.target.value,
                  },
                }))
              }
            />
          </label>
          <p className="small muted">
            No account is created. This preference stays here.
          </p>
        </section>
        <section className="settings-card">
          <Download />
          <h2>Keep your memories safe</h2>
          <p>
            Your journal, designs, and progress are stored in IndexedDB on this
            browser. Clearing browser data, using private browsing, or switching
            devices can remove or hide them. Back up regularly.
          </p>
          <div className="actions">
            <button
              className="button"
              onClick={() => {
                download(
                  new Blob(
                    [
                      JSON.stringify({
                        version: 1,
                        exportedAt: new Date().toISOString(),
                        data,
                      }),
                    ],
                    { type: "application/json" },
                  ),
                  `scripture-studio-backup-${today}.json`,
                );
                notify("Backup downloaded. Store it somewhere private.");
              }}
            >
              <Download size={16} />
              Export backup
            </button>
            <label className="button secondary upload">
              <Upload size={16} />
              Import backup
              <input
                type="file"
                accept="application/json,.json"
                onChange={(e) => {
                  void importBackup(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <button
            className="text-button"
            onClick={async () => {
              if (navigator.storage?.persist) {
                const granted = await navigator.storage.persist();
                notify(
                  granted
                    ? "Browser storage protection enabled. Backups are still recommended."
                    : "This browser decides storage protection automatically. Keep a backup.",
                );
              } else
                notify(
                  "Storage protection is unavailable in this browser. Keep a backup.",
                );
            }}
          >
            Request browser storage protection
            <ArrowUpRight size={15} />
          </button>
        </section>
        <section className="settings-card">
          <MonitorSmartphone />
          <h2>Faith, wherever you are</h2>
          <p>
            Install Scripture Studio for a quieter, full-screen experience. Once
            visited online, its pages, bundled images, and scripture work
            offline alongside your local data.
          </p>
          <button
            className="button secondary"
            onClick={() => setInstallHelp(true)}
          >
            Install the free app
            <ArrowRight size={16} />
          </button>
        </section>
        <section className="settings-card">
          <BookOpen />
          <h2>Thoughtfully sourced</h2>
          <p>
            Scripture uses the public-domain World English Bible (WEB), sourced
            from{" "}
            <a href="https://ebible.org/web/" target="_blank" rel="noreferrer">
              eBible.org
            </a>
            . Reflections and prayers are original devotional writing, separate
            from Bible quotations.
          </p>
          <p>
            Landscape photography is licensed under the{" "}
            <a
              href="https://unsplash.com/license"
              target="_blank"
              rel="noreferrer"
            >
              Unsplash License
            </a>
            . Cormorant Garamond is bundled under the SIL Open Font License.{" "}
            <a href="/credits.txt" target="_blank">
              View asset credits
            </a>
            .
          </p>
          <p className="small muted">
            No analytics, paid APIs, subscriptions, or private-content uploads.
            Your exported artwork is yours to use.
          </p>
        </section>
      </div>
    </>
  );
}
