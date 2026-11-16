import type { Task } from "../types";
import { isOverdue, rankFor, sanityOf, streakOf } from "../lib/haunting";

interface Props {
  tasks: Task[];
  now: number;
}

export function Hud({ tasks, now }: Props) {
  const banished = tasks.filter((t) => t.completedAt !== null).length;
  const active = tasks.filter((t) => t.completedAt === null).length;
  const wraiths = tasks.filter((t) => isOverdue(t, now)).length;
  const sanity = sanityOf(tasks, now);
  const rank = rankFor(banished);
  const streak = streakOf(tasks, now);
  const tone = sanity > 60 ? "ok" : sanity > 30 ? "warn" : "bad";

  return (
    <div className="hud" role="group" aria-label="Your standing">
      <div className="hud-item sanity">
        <div className="hud-top">
          <span>Sanity</span>
          <b>{sanity}</b>
        </div>
        <div
          className={`meter ${tone}`}
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={sanity}
          aria-label="Sanity"
        >
          <div style={{ width: `${sanity}%` }} />
        </div>
      </div>
      <div className="hud-item">
        <div className="hud-top">
          <span>Rank</span>
          <b>{rank.title}</b>
        </div>
        <div className="meter gold" aria-hidden="true">
          <div style={{ width: `${Math.round(rank.progress * 100)}%` }} />
        </div>
      </div>
      <div className="hud-stats">
        <div>
          <b>{active}</b>
          <span>haunting</span>
        </div>
        <div className={wraiths ? "bad-text" : ""}>
          <b>{wraiths}</b>
          <span>wraiths</span>
        </div>
        <div>
          <b>{banished}</b>
          <span>banished</span>
        </div>
        <div>
          <b>{streak}</b>
          <span>day streak</span>
        </div>
      </div>
    </div>
  );
}
