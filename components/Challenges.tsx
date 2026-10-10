"use client";
import { ArrowRight, Check } from "lucide-react";
import type { State, Entry } from "@/lib/storage";
import { challenges } from "@/lib/scripture";
export default function Challenges({
  data,
  today,
  journal,
  persist,
}: {
  data: State;
  today: string;
  journal: (kind?: Entry["kind"], body?: string) => void;
  persist: (f: (s: State) => State) => Promise<boolean>;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">ONE DAY AT A TIME</span>
          <h1>Small steps. Deeper roots.</h1>
          <p className="muted">
            Seven gentle invitations to practice your faith.
          </p>
        </div>
      </div>
      <div className="challenge-grid">
        {challenges.map((c) => {
          const days = data.challenge[c.id] || [];
          const done = days.length;
          return (
            <article className="challenge-card" key={c.id}>
              <img src={`/images/${c.image}.jpg`} alt="" />
              <div>
                <span className="eyebrow">7-DAY FAITH CHALLENGE</span>
                <h2>{c.title}</h2>
                <p className="muted">{c.description}</p>
                <div className="challenge-progress">
                  {Array.from({ length: 7 }, (_, i) => (
                    <span className={i < done ? "done" : ""} key={i}>
                      {i < done ? <Check size={14} /> : i + 1}
                    </span>
                  ))}
                </div>
                <h3>
                  {done === 7
                    ? "A beautiful week. Well done."
                    : `Day ${done + 1}: ${c.prompts[done]}`}
                </h3>
                <p className="small muted">
                  {done === 7
                    ? "Carry what you discovered into the days ahead."
                    : "Practice today’s invitation, then mark it complete. One moment per local calendar day."}
                </p>
                <button
                  className="button full"
                  disabled={done === 7 || days.includes(today)}
                  onClick={() =>
                    void persist((s) => ({
                      ...s,
                      challenge: {
                        ...s.challenge,
                        [c.id]: [...(s.challenge[c.id] || []), today],
                      },
                    }))
                  }
                >
                  <Check size={16} />
                  {done === 7
                    ? "Challenge complete"
                    : days.includes(today)
                      ? "Today’s moment complete"
                      : "Complete today’s moment"}
                </button>
                <button
                  className="text-button"
                  onClick={() =>
                    journal(
                      c.id === "gratitude"
                        ? "Gratitude"
                        : c.id === "prayer"
                          ? "Prayer"
                          : "Reflection",
                      c.prompts[Math.min(done, 6)] + "\n\n",
                    )
                  }
                >
                  Reflect in your journal
                  <ArrowRight size={15} />
                </button>
                {done > 0 && (
                  <button
                    className="text-button small muted"
                    onClick={() => {
                      if (confirm("Reset this challenge’s progress?"))
                        void persist((s) => ({
                          ...s,
                          challenge: {
                            ...s.challenge,
                            [c.id]: [],
                          },
                        }));
                    }}
                  >
                    Start again
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
