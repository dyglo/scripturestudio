"use client";
import { useRef, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  BookOpen,
  ChevronLeft,
  Check,
} from "lucide-react";
import type { Entry } from "@/lib/storage";
export function makeEntry(
  kind: Entry["kind"] = "Reflection",
  body = "",
): Entry {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "",
    body,
    kind,
    createdAt: now,
    updatedAt: now,
  };
}
export default function Journal({
  entries,
  initial,
  onSave,
  onDelete,
}: {
  entries: Entry[];
  initial?: Entry;
  onSave: (e: Entry) => Promise<boolean>;
  onDelete: (id: string) => void;
}) {
  const [selected, setSelected] = useState<Entry | undefined>(initial);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const revision = useRef(0);
  function edit(p: Partial<Entry>) {
    if (!selected) return;
    const next = { ...selected, ...p, updatedAt: new Date().toISOString() };
    setSelected(next);
    setStatus("Saving…");
    const current = ++revision.current;
    void onSave(next).then((ok) => {
      if (current === revision.current)
        setStatus(
          ok ? "Saved on this device" : "Save failed — keep this tab open",
        );
    });
  }
  const visible = entries
    .filter(
      (e) =>
        (filter === "All" || e.kind === filter) &&
        `${e.title} ${e.body}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">A PRIVATE SPACE FOR YOUR HEART</span>
          <h1>My faith journal.</h1>
          <p className="muted">
            Let your thoughts become a conversation with God.
          </p>
        </div>
        <button
          className="button"
          onClick={() => {
            setSelected(makeEntry());
            setStatus("");
          }}
        >
          <Plus size={16} />
          New entry
        </button>
      </div>
      <div className="journal-layout">
        <div className="journal-list">
          <div className="search-field">
            <Search size={17} />
            <input
              aria-label="Search journal"
              placeholder="Search your reflections…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            {[
              "All",
              "Reflection",
              "Prayer",
              "Gratitude",
              "Saved scripture",
            ].map((f) => (
              <button
                className={filter === f ? "active" : ""}
                key={f}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          {visible.length ? (
            visible.map((e) => (
              <button
                key={e.id}
                className={`journal-item ${selected?.id === e.id ? "selected" : ""}`}
                onClick={() => {
                  setSelected(e);
                  setStatus("Saved on this device");
                }}
              >
                <span className="eyebrow">
                  {e.kind} ·{" "}
                  {new Date(e.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <h3>{e.title || "Untitled reflection"}</h3>
                <p>{e.body.slice(0, 150) || "A new beginning…"}</p>
              </button>
            ))
          ) : (
            <div className="empty">
              <BookOpen size={32} />
              <h2>
                {search ? "No entries found." : "Your story begins here."}
              </h2>
              <p>
                {search
                  ? "Try a different search."
                  : "A prayer, a little gratitude, a thought worth keeping."}
              </p>
              <button
                className="button secondary"
                onClick={() => setSelected(makeEntry())}
              >
                Write your first entry
              </button>
            </div>
          )}
        </div>
        <div className="journal-paper">
          {selected ? (
            <>
              <div className="paper-top">
                <button
                  className="text-button"
                  onClick={() => {
                    setSelected(undefined);
                  }}
                >
                  <ChevronLeft size={16} />
                  Close
                </button>
                <span className="small muted" role="status">
                  <Check size={13} />
                  {status || "Private · stored locally"}
                </span>
                <button
                  className="icon-button danger"
                  aria-label="Delete entry"
                  onClick={() => {
                    if (
                      confirm(
                        "Delete this journal entry? This cannot be undone.",
                      )
                    ) {
                      revision.current++;
                      onDelete(selected.id);
                      setSelected(undefined);
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <label>
                Entry type
                <select
                  value={selected.kind}
                  onChange={(e) =>
                    edit({ kind: e.target.value as Entry["kind"] })
                  }
                >
                  {["Reflection", "Prayer", "Gratitude", "Saved scripture"].map(
                    (k) => (
                      <option key={k}>{k}</option>
                    ),
                  )}
                </select>
              </label>
              <input
                className="journal-title"
                aria-label="Entry title"
                placeholder="Give this moment a title…"
                value={selected.title}
                maxLength={200}
                onChange={(e) => edit({ title: e.target.value })}
              />
              <textarea
                className="journal-body"
                aria-label="Journal entry"
                placeholder="What is on your heart today?"
                value={selected.body}
                onChange={(e) => edit({ body: e.target.value })}
              />
              <p className="small muted">
                Autosaved on this device. Your words are never sent to a server.
              </p>
            </>
          ) : (
            <div className="paper-empty">
              <span className="serif-symbol">❧</span>
              <h2>
                A little space.
                <br />A little stillness.
              </h2>
              <p>Choose an entry or start a new page.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
