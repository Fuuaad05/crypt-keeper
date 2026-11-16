import type { Mood } from "../types";

interface Props {
  color: string;
  mood: Mood;
  size?: number;
}

const BODY = "M32 6C17 6 8 18 8 33v37l8-6 8 7 8-7 8 7 8-7 8 6V33C56 18 47 6 32 6z";

/** A small ghost drawn in SVG. The face changes with the mood. */
export function GhostSvg({ color, mood, size = 64 }: Props) {
  const fill = mood === "wraith" ? "#ff5d73" : color;
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 64 77"
      aria-hidden="true"
      className={`ghost-svg mood-${mood}`}
    >
      <path d={BODY} fill={fill} opacity={mood === "wraith" ? 0.92 : 0.88} />
      <path d={BODY} fill="url(#ghost-shade)" />
      {mood === "calm" && (
        <>
          <path d="M20 31q4-5 8 0" stroke="#0b0a14" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M36 31q4-5 8 0" stroke="#0b0a14" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M27 42q5 5 10 0" stroke="#0b0a14" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {mood === "uneasy" && (
        <>
          <circle cx="24" cy="31" r="4" fill="#0b0a14" />
          <circle cx="40" cy="31" r="4" fill="#0b0a14" />
          <path d="M26 45q6-3 12 0" stroke="#0b0a14" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {mood === "angry" && (
        <>
          <path d="M17 24l12 5" stroke="#0b0a14" strokeWidth="3" strokeLinecap="round" />
          <path d="M47 24l-12 5" stroke="#0b0a14" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="33" r="3.5" fill="#0b0a14" />
          <circle cx="40" cy="33" r="3.5" fill="#0b0a14" />
          <path d="M25 47q7-7 14 0" stroke="#0b0a14" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {mood === "wraith" && (
        <>
          <ellipse cx="23" cy="31" rx="5" ry="6" fill="#1b0509" />
          <ellipse cx="41" cy="31" rx="5" ry="6" fill="#1b0509" />
          <circle cx="23" cy="31" r="2" fill="#fff3a8" />
          <circle cx="41" cy="31" r="2" fill="#fff3a8" />
          <path d="M22 45q10 10 20 0q-10 3-20 0z" fill="#1b0509" />
        </>
      )}
    </svg>
  );
}

/** Shared gradient used by every ghost. Render once near the root. */
export function GhostDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ghost-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.25" />
        </linearGradient>
      </defs>
    </svg>
  );
}
